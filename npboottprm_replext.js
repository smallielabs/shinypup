const puppeteer = require('puppeteer');
const delay = ms => new Promise(res => setTimeout(res, ms));

// Function to get a random number between min and max (inclusive)
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to get a random float between min and max
function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

async function npboottprm_replext(cellBlock = 'T2 Cell Block 1.1', n_simulations = 10, nboot = 1000, conf_level = 0.95) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
        // Navigate to the page and ensure everything is loaded
        await page.goto('https://mightymetrika.shinyapps.io/npbreplext031/');
        await page.waitForSelector('#M1', { timeout: 20000 });

        // Select the cell block
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

        // Function to fill input with a random value
        async function fillRandomInput(selector, min, max, isInteger = true) {
            const value = isInteger ? getRandomNumber(min, max) : getRandomFloat(min, max).toFixed(2);
            await page.$eval(selector, (el, val) => el.value = val, value);
            console.log(`Set ${selector} to ${value}`);
        }

        // Fill in parameters based on the selected cell block
        if (cellBlock.startsWith('T2') || cellBlock.startsWith('T3')) {
            await fillRandomInput('#M1', 1, 10);
            await delay(200);
            await fillRandomInput('#S1', 0, 5, false);
            await delay(200);
            await fillRandomInput('#M2', 1, 10);
            await delay(200);
            await fillRandomInput('#S2', 0, 5, false);
            await delay(200);
            await fillRandomInput('#Sk1', -2, 2, false);
            await delay(200);
            await fillRandomInput('#Sk2', -2, 2, false);
            await delay(200);
            await fillRandomInput('#n1', 5, 50);
            await delay(200);
            await fillRandomInput('#n2', 5, 50);
            await delay(200);
        } else if (cellBlock.startsWith('T4') || cellBlock.startsWith('TS1')) {
            await fillRandomInput('#par1_1', 0, 10, false);
            await fillRandomInput('#par2_1', 0, 5, false);
            await fillRandomInput('#par1_2', 0, 10, false);
            await fillRandomInput('#par2_2', 0, 5, false);
            await fillRandomInput('#n1', 5, 50);
            await fillRandomInput('#n2', 5, 50);

            const rdistValue = cellBlock.includes('1.1') ? 'rlnorm' :
                               cellBlock.includes('2.1') ? 'rpois' :
                               cellBlock.includes('3.1') ? 'rchisq' :
                               cellBlock.includes('4.1') ? 'rlnorm' :
                               cellBlock.includes('5.1') ? 'rcauchy' :
                               cellBlock.includes('6.1') ? 'rchisq,rpois' :
                               'rlnorm,rchisq';
            await page.$eval('#rdist', (el, val) => el.value = val, rdistValue);
            console.log(`Set rdist to ${rdistValue}`);
        } else if (cellBlock.startsWith('T5') || cellBlock.startsWith('T6')) {
            await fillRandomInput('#M1', 1, 10);
            await fillRandomInput('#S1', 0, 5, false);
            await fillRandomInput('#M2', 1, 10);
            await fillRandomInput('#S2', 0, 5, false);
            await fillRandomInput('#Sk1', -2, 2, false);
            await fillRandomInput('#Sk2', -2, 2, false);
            await fillRandomInput('#correl', -1, 1, false);
            await fillRandomInput('#n', 5, 50);
        } else if (cellBlock.startsWith('TS2') || cellBlock.startsWith('TS3')) {
            await fillRandomInput('#M1', 1, 10);
            await fillRandomInput('#S1', 0, 5, false);
            await fillRandomInput('#M2', 1, 10);
            await fillRandomInput('#S2', 0, 5, false);
            await fillRandomInput('#M3', 1, 10);
            await fillRandomInput('#S3', 0, 5, false);
            await fillRandomInput('#Sk1', -2, 2, false);
            await fillRandomInput('#Sk2', -2, 2, false);
            await fillRandomInput('#Sk3', -2, 2, false);
            await fillRandomInput('#n1', 5, 50);
            await fillRandomInput('#n2', 5, 50);
            await fillRandomInput('#n3', 5, 50);
        }

        // Set user-defined parameters
        await page.$eval('#n_simulations', (el, val) => el.value = val, n_simulations);
        await delay(200);
        await page.$eval('#nboot', (el, val) => el.value = val, nboot);
        //await page.$eval('#conf.level', (el, val) => el.value = val, conf_level);

        // Click the Run Simulation button
        await delay(2000);
        await page.click('#runSim');
        console.log('Clicked Run Simulation button');

        // Wait for results to complete
        await page.waitForSelector('#DataTables_Table_1', { timeout: 100000 });
        console.log('Simulation table loaded');

        // Click the Submit button
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

// Usage: Pass the desired cell block and simulation parameters as arguments
npboottprm_replext('T2 Cell Block 1.1', 10, 1000, 0.95);