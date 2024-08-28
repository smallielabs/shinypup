const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const delay = ms => new Promise(res => setTimeout(res, ms));

async function launchBrowser() {
    return await puppeteer.launch({ 
        headless: false,
        args: ['--start-maximized'] 
    });
}

async function createPage(browser) {
    const page = await browser.newPage();
    await page.setViewport({
        width: 1366,
        height: 768,
    });
    return page;
}

async function navigateToWebsite(page, website) {
    await page.goto(website);
    await page.waitForSelector('#M1', { timeout: 20000 });
}

async function selectCellBlock(page, cellBlock) {
    await page.click('.selectize-input');
    await page.waitForSelector('.selectize-dropdown-content .option', { visible: true });
    
    const options = await page.$$('.selectize-dropdown-content .option');
    for (let option of options) {
        const text = await page.evaluate(el => el.textContent, option);
        if (text.trim() === cellBlock) {
            await option.click();
            break;
        }
    }
    console.log(`Selected Cell Block: ${cellBlock}`);
    
    // Add a delay and log the page content after selection
    // await page.waitForTimeout(2000);
    await delay(2000);
    const pageContent = await page.content();
    console.log(`Page content after cell block selection:\n${pageContent}`);
}

async function fillUserDefinedInput(page, selector, value, delayBetweenActions) {
    console.log(`Attempting to fill ${selector} with value ${value}`);
    const element = await page.$(selector);
    if (!element) {
        console.error(`Element with selector ${selector} not found`);
        const pageContent = await page.content();
        console.log(`Current page content:\n${pageContent}`);
        throw new Error(`Element with selector ${selector} not found`);
    }
    await page.$eval(selector, (element, val) => {
        element.value = val;
        const event = new Event('change', { bubbles: true });
        element.dispatchEvent(event);
    }, value.toString());
    console.log(`Set ${selector} to ${value}`);
    if (delayBetweenActions > 0) await delay(delayBetweenActions);
}

// async function selectCellBlock(page, cellBlock) {
//     await page.click('.selectize-input');
//     await page.waitForSelector('.selectize-dropdown-content .option', { visible: true });
    
//     const options = await page.$$('.selectize-dropdown-content .option');
//     for (let option of options) {
//         const text = await page.evaluate(el => el.textContent, option);
//         if (text.trim() === cellBlock) {
//             await option.click();
//             break;
//         }
//     }
//     console.log(`Selected Cell Block: ${cellBlock}`);
// }

// async function fillUserDefinedInput(page, selector, value, delayBetweenActions) {
//     await page.$eval(selector, (element, val) => {
//         element.value = val;
//         const event = new Event('change', { bubbles: true });
//         element.dispatchEvent(event);
//     }, value.toString());
//     console.log(`Set ${selector} to ${value}`);
//     if (delayBetweenActions > 0) await delay(delayBetweenActions);
// }

async function fillInput(page, selector, value, delayBetweenActions) {
    await page.$eval(selector, (element, val) => {
        element.value = val;
        const event = new Event('change', { bubbles: true });
        element.dispatchEvent(event);
    }, value.toString());
    console.log(`Set ${selector} to ${value}`);
    if (delayBetweenActions > 0) await delay(delayBetweenActions);
    return value;
}

async function runSimulation(page) {
    await page.click('#runSim');
    console.log('Clicked Run Simulation button');
    await page.waitForSelector('#DataTables_Table_1', { timeout: 100000 });
    console.log('Simulation table loaded');
}

async function submitResults(page) {
    await page.click('#submit');
    console.log('Clicked Submit button');
    await page.evaluate(() => {
        window.scrollTo(0, 0);
    });
    await delay(5000);
}

async function downloadAndProcessCSV(website) {
    const browser = await launchBrowser();
    const page = await createPage(browser);
    
    await navigateToWebsite(page, website);
    
    // Wait for the download button to be available
    await page.waitForSelector('#downloadBtn');
    
    // Set up a listener for the download event
    const downloadPath = path.resolve('./downloads');

    const client = await page.createCDPSession()
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath
    })

    // Delay before clicking download button
    await delay(5000);
    
    // Click the download button
    await page.click('#downloadBtn');
    
    // Wait for the download to complete (you may need to adjust the delay)
    await delay(10000);
    
    await browser.close();
    
    // Find the most recently downloaded file
    const files = fs.readdirSync(downloadPath);
    const mostRecentFile = files.reduce((prev, current) => {
        return fs.statSync(path.join(downloadPath, prev)).mtime > fs.statSync(path.join(downloadPath, current)).mtime ? prev : current;
    });
    
    // Read and parse the CSV file
    const results = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(downloadPath, mostRecentFile))
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                resolve(results);
            })
            .on('error', reject);
    });
}

module.exports = {
    launchBrowser,
    createPage,
    navigateToWebsite,
    selectCellBlock,
    fillUserDefinedInput,
    fillInput,
    runSimulation,
    submitResults,
    downloadAndProcessCSV
};