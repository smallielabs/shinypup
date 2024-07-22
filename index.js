const puppeteer = require('puppeteer');
const delay = ms => new Promise(res => setTimeout(res, ms));

async function npboottprm_replext() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
        // Navigate to the page and ensure everything is loaded
        await page.goto('https://mightymetrika.shinyapps.io/npbreplext031/');
        await page.waitForSelector('#M1', { timeout: 20000 });

        //Click the Run Simulation button
        //await page.waitForSelector('#runSim', { timeout: 20000 });
        await page.click('#runSim');
        console.log('Clicked Run Simulation button');

        //Wait for results to complete
        await page.waitForSelector('#DataTables_Table_1', { timeout: 100000 });
        console.log('Simulation table loaded');

        //Click the Submit button
        await page.click('#submit');
        console.log('Clicked Submit button');
        await delay(5000);

        console.log('Process completed successfully');
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await browser.close();
    }
}

npboottprm_replext();