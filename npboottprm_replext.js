const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { plot } = require('nodeplotlib');

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
            await fillRandomInput('#M1', 5, 10);
            await fillRandomInput('#S1', 1, 5, false);
            await fillRandomInput('#M2', 5, 10);
            await fillRandomInput('#S2', 1, 5, false);
            await fillRandomInput('#Sk1', -2, 2, false);
            await fillRandomInput('#Sk2', -2, 2, false);
            await fillRandomInput('#n1', 3, 15);
            await fillRandomInput('#n2', 3, 15);
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

async function repeatedNpboottprm(options = {}) {
    const {
        iterations = Infinity,
        cellBlock = 'T2 Cell Block 1.1',
        n_simulations = 10,
        nboot = 1000,
        conf_level = 0.95,
        delayBetweenActions = 500,
        website = 'https://mightymetrika.shinyapps.io/npbreplext031/',
        delayBetweenIterations = 5000,
        downloadFrequency = 5,
        simulationsToAnalyze = 10
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
            
            // Check if it's time to download and analyze data
            if (currentIteration % downloadFrequency === 0) {
                console.log(`Downloading and analyzing data...`);
                const data = await downloadAndProcessCSV(website);
                await analyzeData(data.slice(-simulationsToAnalyze));
            }
            
            if (currentIteration < iterations) {
                console.log(`Waiting ${delayBetweenIterations}ms before next iteration...`);
                await delay(delayBetweenIterations);
            }
        } catch (error) {
            console.error(`Error in iteration ${currentIteration + 1}:`, error);
        }
    }

    console.log(`Completed ${currentIteration} iterations.`);
}

async function downloadAndProcessCSV(website) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.goto(website);
    
    // Wait for the download button to be available
    await page.waitForSelector('#downloadBtn');
    
    // Set up a listener for the download event
    const downloadPath = path.resolve('./downloads');
    // await page._client.send('Page.setDownloadBehavior', {
    //     behavior: 'allow',
    //     downloadPath: downloadPath,
    // });
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

// Helper functions for statistics (unchanged)
const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
const median = (arr) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};
const standardDeviation = (arr) => {
    const avg = mean(arr);
    const squareDiffs = arr.map(value => Math.pow(value - avg, 2));
    return Math.sqrt(mean(squareDiffs));
};

async function analyzeData(data) {
    // Convert string values to numbers and calculate additional metrics
    const processedData = data.map((row, index) => ({
        rowIndex: index,
        n1: parseInt(row.n1),
        n2: parseInt(row.n2),
        totalSampleSize: parseInt(row.n1) + parseInt(row.n2),
        m1: parseFloat(row.m1),
        m2: parseFloat(row.m2),
        s1: parseFloat(row.s1),
        s2: parseFloat(row.s2),
        sk1: parseFloat(row.sk1),
        sk2: parseFloat(row.sk2),
        cohensD: Math.abs(parseFloat(row.m1) - parseFloat(row.m2)) / 
                 Math.sqrt((Math.pow(parseFloat(row.s1), 2) + Math.pow(parseFloat(row.s2), 2)) / 2),
        st: parseFloat(row.st),
        wt: parseFloat(row.wt),
        npbtt: parseFloat(row.npbtt),
        wrst: parseFloat(row.wrst),
        ptt: parseFloat(row.ptt)
    }));

    const methods = ['st', 'wt', 'npbtt', 'wrst', 'ptt'];
    const methodShapes = {
        st: 'circle',
        wt: 'square',
        npbtt: 'diamond',
        wrst: 'triangle-up',
        ptt: 'star'
    };

    // 1. Power vs Cohen's d
    const powerVsCohensD = methods.map(method => ({
        x: processedData.map(d => d.cohensD),
        y: processedData.map(d => d[method]),
        mode: 'markers',
        type: 'scatter',
        name: method.toUpperCase(),
        marker: { 
            symbol: methodShapes[method],
            color: processedData.map(d => d.rowIndex),
            colorscale: 'Viridis',
            showscale: false  // Hide color scale
        }
    }));

    // 2. n1 vs n2
    const n1VsN2 = [{
        x: processedData.map(d => d.n1),
        y: processedData.map(d => d.n2),
        mode: 'markers',
        type: 'scatter',
        marker: { 
            color: processedData.map(d => d.rowIndex),
            colorscale: 'Viridis',
            showscale: true  // Show color scale
        }
    }];

    // 3. SD1 vs SD2
    const sd1VsSd2 = methods.map(method => ({
        x: processedData.map(d => d.s1),
        y: processedData.map(d => d.s2),
        mode: 'markers',
        type: 'scatter',
        name: method.toUpperCase(),
        showlegend: false,  // Hide legend
        marker: { 
            symbol: methodShapes[method],
            color: processedData.map(d => d.rowIndex),
            colorscale: 'Viridis',
            showscale: false  // Hide color scale
        }
    }));

    // 4. Skew1 vs Skew2
    const skew1VsSkew2 = methods.map(method => ({
        x: processedData.map(d => d.sk1),
        y: processedData.map(d => d.sk2),
        mode: 'markers',
        type: 'scatter',
        name: method.toUpperCase(),
        showlegend: false,  // Hide legend
        marker: { 
            symbol: methodShapes[method],
            color: processedData.map(d => d.rowIndex),
            colorscale: 'Viridis',
            showscale: false  // Hide color scale
        }
    }));

    // Generate plots
    plot(powerVsCohensD, {
        title: 'Power vs. Cohen\'s d',
        xaxis: { title: 'Cohen\'s d' },
        yaxis: { title: 'Power', range: [0, 1] },
        showlegend: true
    });

    plot(n1VsN2, {
        title: 'Sample Size: n1 vs n2',
        xaxis: { title: 'n1' },
        yaxis: { title: 'n2' },
        showlegend: false
    });

    plot(sd1VsSd2, {
        title: 'Standard Deviation: SD1 vs SD2',
        xaxis: { title: 'SD1' },
        yaxis: { title: 'SD2' },
        showlegend: false
    });

    plot(skew1VsSkew2, {
        title: 'Skewness: Skew1 vs Skew2',
        xaxis: { title: 'Skew1' },
        yaxis: { title: 'Skew2' },
        showlegend: false
    });

    console.log('Plots generated. Check your browser for the visualizations.');

    // Calculate summary statistics (unchanged)
    const summaryStats = methods.reduce((acc, method) => {
        const values = processedData.map(d => d[method]);
        acc[method] = {
            mean: mean(values),
            median: median(values),
            sd: standardDeviation(values)
        };
        return acc;
    }, {});

    console.log('Summary Statistics:', summaryStats);
}

// Usage example
repeatedNpboottprm({
    iterations: 20,
    cellBlock: 'T2 Cell Block 1.1',
    n_simulations: 10,
    nboot: 1000,
    conf_level: 0.95,
    delayBetweenActions: 500,
    website: 'https://mightymetrika.shinyapps.io/npbreplext031/',
    delayBetweenIterations: 5000,
    downloadFrequency: 2,
    simulationsToAnalyze: 5
});

