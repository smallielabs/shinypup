const puppeteer = require('puppeteer');
const delay = ms => new Promise(res => setTimeout(res, ms));

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

async function npboottprm_replext(options = {}) {
    const {
        cellBlock = 'T2 Cell Block 1.1',
        n_simulations = 10,
        nboot = 1000,
        conf_level = 0.95,
        delayBetweenActions = 500,
        website = 'https://mightymetrika.shinyapps.io/npbreplext031/'
    } = options;

    const browser = await puppeteer.launch({ 
        headless: false,
        args: ['--start-maximized'] });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1366,
        height: 768,
      });

    try {
        await page.goto(website);
        await page.waitForSelector('#M1', { timeout: 20000 });

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

        async function fillRandomInput(selector, min, max, isInteger = true) {
            const value = isInteger ? getRandomNumber(min, max) : getRandomFloat(min, max);
            await page.$eval(selector, (element, val) => {
                element.value = val;
                const event = new Event('change', { bubbles: true });
                element.dispatchEvent(event);
            }, value.toString());
            console.log(`Set ${selector} to ${value}`);
            if (delayBetweenActions > 0) await delay(delayBetweenActions);
        }

        async function fillUserDefinedInput(selector, value) {
            await page.$eval(selector, (element, val) => {
                element.value = val;
                const event = new Event('change', { bubbles: true });
                element.dispatchEvent(event);
            }, value.toString());
            console.log(`Set ${selector} to ${value}`);
            if (delayBetweenActions > 0) await delay(delayBetweenActions);
        }

        if (cellBlock.startsWith('T2') || cellBlock.startsWith('T3')) {
            await fillRandomInput('#M1', 1, 10);
            await fillRandomInput('#S1', 0, 5, false);
            await fillRandomInput('#M2', 1, 10);
            await fillRandomInput('#S2', 0, 5, false);
            await fillRandomInput('#Sk1', -2, 2, false);
            await fillRandomInput('#Sk2', -2, 2, false);
            await fillRandomInput('#n1', 5, 50);
            await fillRandomInput('#n2', 5, 50);
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
            await page.$eval('#rdist', (element, val) => {
                element.value = val;
                const event = new Event('change', { bubbles: true });
                element.dispatchEvent(event);
            }, rdistValue);
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
        await fillUserDefinedInput('#n_simulations', n_simulations);
        await fillUserDefinedInput('#nboot', nboot);
        //await fillUserDefinedInput('#conf.level', conf_level);

        if (delayBetweenActions > 0) await delay(2000);

        await page.click('#runSim');
        console.log('Clicked Run Simulation button');

        await page.waitForSelector('#DataTables_Table_1', { timeout: 100000 });
        console.log('Simulation table loaded');

        await page.click('#submit');
        console.log('Clicked Submit button');
        
        // Scrolling to the top of the page
        await page.evaluate(() => {
            window.scrollTo(0, 0);
        });

        await delay(5000);

        console.log('Process completed successfully');
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await browser.close();
    }
}

// // Usage example
// npboottprm_replext({
//     cellBlock: 'T2 Cell Block 1.1',
//     n_simulations: 10,
//     nboot: 1000,
//     conf_level: 0.95,
//     delayBetweenActions: 500,
//     website: 'https://mightymetrika.shinyapps.io/npbreplext031/'
// });

async function repeatedNpboottprm(options = {}) {
    const {
        iterations = Infinity,  // Run indefinitely by default
        cellBlock = 'T2 Cell Block 1.1',
        n_simulations = 10,
        nboot = 1000,
        conf_level = 0.95,
        delayBetweenActions = 500,
        website = 'https://mightymetrika.shinyapps.io/npbreplext031/',
        delayBetweenIterations = 5000  // Delay between each iteration
    } = options;

    let currentIteration = 0;
    let stopRequested = false;

    console.log(`Starting repeated simulations. Press Ctrl+C to stop.`);

    while (currentIteration < iterations && !stopRequested) {
        console.log(`\nStarting iteration ${currentIteration + 1}`);
        
        try {
            await npboottprm_replext({
                cellBlock,
                n_simulations,
                nboot,
                conf_level,
                delayBetweenActions,
                website
            });
            
            currentIteration++;
            
            if (currentIteration < iterations) {
                console.log(`Waiting ${delayBetweenIterations}ms before next iteration...`);
                await delay(delayBetweenIterations);
            }
        } catch (error) {
            console.error(`Error in iteration ${currentIteration + 1}:`, error);
            // Optionally, we could break the loop here if we want to stop on errors
            // break;
        }
    }

    console.log(`Completed ${currentIteration} iterations.`);
}

// Handle Ctrl+C to stop the process gracefully
process.on('SIGINT', () => {
    console.log('\nStop requested. Finishing current iteration...');
    stopRequested = true;
});

// Usage example
repeatedNpboottprm({
    iterations: 5,  // Run 5 times, or omit for indefinite running
    cellBlock: 'T2 Cell Block 1.1',
    n_simulations: 10,
    nboot: 1000,
    conf_level: 0.95,
    delayBetweenActions: 500,
    website: 'https://mightymetrika.shinyapps.io/npbreplext031/',
    delayBetweenIterations: 5000  // 5 seconds between iterations
});