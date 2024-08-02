const dotenv = require('dotenv');
dotenv.config();
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const OpenAI = require('openai');

const delay = ms => new Promise(res => setTimeout(res, ms));

const openai = new OpenAI({
    organization: "org-G1Za30U9Jziz5ivfbiUvidNo",
    project: "proj_eI8KnGvRJfS7erjOZhKf1rXi",
});

async function generateIntroduction(options, initialSeedValues) {
    const prompt = `
        You are an AI assistant specializing in statistical analysis. We are about to start a series of simulations using the 'npbtt' method, which is our main focus. The other methods (st, wt, wrst, ptt) are for comparison.

        Here are the parameters and options for our simulation:
        ${JSON.stringify(options, null, 2)}

        And here are the initial seed values:
        ${JSON.stringify(initialSeedValues, null, 2)}

        Please provide an introduction for our analysis that covers:
        1. An overview of what we're trying to achieve with these simulations.
        2. A brief explanation of the 'npbtt' method and why we're comparing it to other methods.
        3. A description of the key parameters and options we're using, inferring their purpose from their names and values.
        4. What we hope to learn from this series of simulations.

        Format your response as HTML that can be directly inserted into a web page.
    `;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are a helpful assistant specialized in statistical analysis." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error generating introduction:', error);
        return "<p>An error occurred while generating the introduction.</p>";
    }
}

async function getAIAnalysis(summaryStats, currentSeedValues) {
    const prompt = `
        You are an AI assistant specializing in statistical analysis. We are studying the 'npbtt' method, which is our main focus. The other methods (st, wt, wrst, ptt) are for comparison. We are looking to either maximize statistical power or better control the type 1 error rate for npbtt compared to other methods.

        Here are the summary statistics of our latest simulation:
        ${JSON.stringify(summaryStats, null, 2)}

        These results were produced using the following seed values:
        ${JSON.stringify(currentSeedValues, null, 2)}

        The means in the summary statistics represent rejection rates.

        Please provide:
        1. A meaningful text-based summary of the results.
        2. An explanation of how we should adjust the seed values for the next iteration.
        3. A JSON object with suggested new seed values for the next analysis.

        Format your response as a JSON object with keys: "summary", "explanation", and "newSeedValues".
    `;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are a helpful assistant specialized in statistical analysis." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('Error in AI analysis:', error);
        return null;
    }
}

function generateRandomFromSeed(min, max, isInteger = true) {
    if (isInteger) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
        return Math.random() * (max - min) + min;
    }
}

async function npboottprm_replext(options = {}, seedValues = {}) {
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

        async function fillUserDefinedInput(selector, value) {
            await page.$eval(selector, (element, val) => {
                element.value = val;
                const event = new Event('change', { bubbles: true });
                element.dispatchEvent(event);
            }, value.toString());
            console.log(`Set ${selector} to ${value}`);
            if (delayBetweenActions > 0) await delay(delayBetweenActions);
        }

        async function fillInput(selector, min, max, isInteger = true) {
            const randomValue = generateRandomFromSeed(min, max, isInteger);
            await page.$eval(selector, (element, val) => {
                element.value = val;
                const event = new Event('change', { bubbles: true });
                element.dispatchEvent(event);
            }, randomValue.toString());
            console.log(`Set ${selector} to ${randomValue}`);
            if (delayBetweenActions > 0) await delay(delayBetweenActions);
            return randomValue;
        }

        let filledValues = {};

        if (cellBlock.startsWith('T2') || cellBlock.startsWith('T3')) {
            filledValues.M1 = await fillInput('#M1', seedValues.M1.min, seedValues.M1.max, true);
            filledValues.S1 = await fillInput('#S1', seedValues.S1.min, seedValues.S1.max, false);
            filledValues.M2 = await fillInput('#M2', seedValues.M2.min, seedValues.M2.max, true);
            filledValues.S2 = await fillInput('#S2', seedValues.S2.min, seedValues.S2.max, false);
            filledValues.Sk1 = await fillInput('#Sk1', seedValues.Sk1.min, seedValues.Sk1.max, false);
            filledValues.Sk2 = await fillInput('#Sk2', seedValues.Sk2.min, seedValues.Sk2.max, false);
            filledValues.n1 = await fillInput('#n1', seedValues.n1.min, seedValues.n1.max, true);
            filledValues.n2 = await fillInput('#n2', seedValues.n2.min, seedValues.n2.max, true);
        } else if (cellBlock.startsWith('T4') || cellBlock.startsWith('TS1')) {
            filledValues.par1_1 = await fillInput('#par1_1', seedValues.par1_1.min, seedValues.par1_1.max, false);
            filledValues.par2_1 = await fillInput('#par2_1', seedValues.par2_1.min, seedValues.par2_1.max, false);
            filledValues.par1_2 = await fillInput('#par1_2', seedValues.par1_2.min, seedValues.par1_2.max, false);
            filledValues.par2_2 = await fillInput('#par2_2', seedValues.par2_2.min, seedValues.par2_2.max, false);
            filledValues.n1 = await fillInput('#n1', seedValues.n1.min, seedValues.n1.max, true);
            filledValues.n2 = await fillInput('#n2', seedValues.n2.min, seedValues.n2.max, true);
        
            const rdistValue = cellBlock.includes('1.1') ? 'rlnorm' :
                               cellBlock.includes('2.1') ? 'rpois' :
                               cellBlock.includes('3.1') ? 'rchisq' :
                               cellBlock.includes('4.1') ? 'rlnorm' :
                               cellBlock.includes('5.1') ? 'rcauchy' :
                               cellBlock.includes('6.1') ? 'rchisq,rpois' :
                               'rlnorm,rchisq';
            filledValues.rdist = await fillUserDefinedInput('#rdist', rdistValue);
            console.log(`Set rdist to ${filledValues.rdist}`);
        } else if (cellBlock.startsWith('T5') || cellBlock.startsWith('T6')) {
            filledValues.M1 = await fillInput('#M1', seedValues.M1.min, seedValues.M1.max, true);
            filledValues.S1 = await fillInput('#S1', seedValues.S1.min, seedValues.S1.max, false);
            filledValues.M2 = await fillInput('#M2', seedValues.M2.min, seedValues.M2.max, true);
            filledValues.S2 = await fillInput('#S2', seedValues.S2.min, seedValues.S2.max, false);
            filledValues.Sk1 = await fillInput('#Sk1', seedValues.Sk1.min, seedValues.Sk1.max, false);
            filledValues.Sk2 = await fillInput('#Sk2', seedValues.Sk2.min, seedValues.Sk2.max, false);
            filledValues.correl = await fillInput('#correl', seedValues.correl.min, seedValues.correl.max, false);
            filledValues.n = await fillInput('#n', seedValues.n.min, seedValues.n.max, true);
        } else if (cellBlock.startsWith('TS2') || cellBlock.startsWith('TS3')) {
            filledValues.M1 = await fillInput('#M1', seedValues.M1.min, seedValues.M1.max, true);
            filledValues.S1 = await fillInput('#S1', seedValues.S1.min, seedValues.S1.max, false);
            filledValues.M2 = await fillInput('#M2', seedValues.M2.min, seedValues.M2.max, true);
            filledValues.S2 = await fillInput('#S2', seedValues.S2.min, seedValues.S2.max, false);
            filledValues.M3 = await fillInput('#M3', seedValues.M3.min, seedValues.M3.max, true);
            filledValues.S3 = await fillInput('#S3', seedValues.S3.min, seedValues.S3.max, false);
            filledValues.Sk1 = await fillInput('#Sk1', seedValues.Sk1.min, seedValues.Sk1.max, false);
            filledValues.Sk2 = await fillInput('#Sk2', seedValues.Sk2.min, seedValues.Sk2.max, false);
            filledValues.Sk3 = await fillInput('#Sk3', seedValues.Sk3.min, seedValues.Sk3.max, false);
            filledValues.n1 = await fillInput('#n1', seedValues.n1.min, seedValues.n1.max, true);
            filledValues.n2 = await fillInput('#n2', seedValues.n2.min, seedValues.n2.max, true);
            filledValues.n3 = await fillInput('#n3', seedValues.n3.min, seedValues.n3.max, true);
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
        
        await page.evaluate(() => {
            window.scrollTo(0, 0);
        });

        await delay(5000);

        console.log('Process completed successfully');

        return filledValues;
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await browser.close();
    }
}

async function repeatedNpboottprm(options = {}, initialSeedValues = {}) {
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
    let analysisIteration = 0;  // track analysis iterations
    let stopRequested = false;
    let currentValues = { ...initialSeedValues };

    console.log(`Starting repeated simulations. Press Ctrl+C to stop.`);

    let introductionDisplayed = false;

    while (currentIteration < iterations && !stopRequested) {
        console.log(`\nStarting iteration ${currentIteration + 1}`);
        console.log(`\nCurrent seed values are: ${JSON.stringify(currentValues, null, 2)}`);
        
        try {
            const filledValues = await npboottprm_replext({
                cellBlock,
                n_simulations,
                nboot,
                conf_level,
                delayBetweenActions,
                website
            }, currentValues);
            
            currentIteration++;
            
            if (currentIteration % downloadFrequency === 0) {
                console.log(`Downloading and analyzing data...`);
                const data = await downloadAndProcessCSV(website);

                analysisIteration++;  // Increment the analysis iteration counter

                if (!introductionDisplayed) {
                    const introduction = await generateIntroduction(options, initialSeedValues);
                    const introductionHtml = `
                        <div class="introduction">
                            <h2>Introduction to the Analysis</h2>
                            ${introduction}
                        </div>
                    `;
                    fs.appendFileSync(path.join(__dirname, 'new-content.html'), introductionHtml);
                    introductionDisplayed = true;
                }

                const analysisResults = await analyzeData(data.slice(-simulationsToAnalyze), currentValues, analysisIteration, downloadFrequency);

                // Update currentValues with AI-suggested new seed values
                if (analysisResults.newSeedValues) {
                    currentValues = analysisResults.newSeedValues;
                    console.log(`Updated seed values based on AI analysis: ${JSON.stringify(currentValues, null, 2)}`);
                }
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
    await page.setViewport({
        width: 1366,
        height: 768,
    });
    
    await page.goto(website);
    
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

async function analyzeData(data, currentSeedValues, analysisIteration, downloadFrequency) {
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

    // Calculate summary statistics
    const summaryStats = methods.reduce((acc, method) => {
        const values = processedData.map(d => d[method]).filter(v => !isNaN(v));
        acc[method] = {
            mean: mean(values),
            median: median(values),
            sd: standardDeviation(values)
        };
        return acc;
    }, {});

    // Get AI analysis
    const aiAnalysis = await getAIAnalysis(summaryStats, currentSeedValues);

    const powerVsCohensD = {
        div: 'powerVsCohensD',
        data: methods.map(method => ({
            x: processedData.map(d => d.cohensD),
            y: processedData.map(d => d[method]),
            mode: 'markers',
            type: 'scatter',
            name: method.toUpperCase(),
            marker: { 
                symbol: methodShapes[method],
                size: 8,
                color: processedData.map(d => d.rowIndex),
                colorscale: 'Viridis',
                showscale: false
            }
        })),
        layout: {
            title: 'Power vs Cohen\'s d',
            xaxis: { title: 'Cohen\'s d' },
            yaxis: { title: 'Power', range: [0, 1] },
            showlegend: true
        }
    };
    
    const n1VsN2 = {
        div: 'n1VsN2',
        data: [{
            x: processedData.map(d => d.n1),
            y: processedData.map(d => d.n2),
            mode: 'markers',
            type: 'scatter',
            marker: { 
                size: 8,
                color: processedData.map(d => d.rowIndex),
                colorscale: 'Viridis',
                showscale: true
            }
        }],
        layout: {
            title: 'Sample Size: n1 vs n2',
            xaxis: { title: 'n1' },
            yaxis: { title: 'n2' }
        }
    };
    
    const sd1VsSd2 = {
        div: 'sd1VsSd2',
        data: [{
            x: processedData.map(d => d.s1),
            y: processedData.map(d => d.s2),
            mode: 'markers',
            type: 'scatter',
            marker: { 
                size: 8,
                color: processedData.map(d => d.rowIndex),
                colorscale: 'Viridis',
                showscale: false
            }
        }],
        layout: {
            title: 'Standard Deviation: SD1 vs SD2',
            xaxis: { title: 'SD1' },
            yaxis: { title: 'SD2' }
        }
    };
    
    const skew1VsSkew2 = {
        div: 'skew1VsSkew2',
        data: [{
            x: processedData.map(d => d.sk1),
            y: processedData.map(d => d.sk2),
            mode: 'markers',
            type: 'scatter',
            marker: { 
                size: 8,
                color: processedData.map(d => d.rowIndex),
                colorscale: 'Viridis',
                showscale: false
            }
        }],
        layout: {
            title: 'Skewness: Skew1 vs Skew2',
            xaxis: { title: 'Skew1' },
            yaxis: { title: 'Skew2' }
        }
    };
    
    // Generate HTML content for summary stats and next values
    const summaryStatsHtml = `
        <h3>Summary Statistics</h3>
        <table class="summary-table">
            <thead>
                <tr>
                    <th>Method</th>
                    <th>Mean</th>
                    <th>Median</th>
                    <th>Standard Deviation</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(summaryStats).map(([method, stats]) => `
                    <tr>
                        <td>${method.toUpperCase()}</td>
                        <td>${stats.mean.toFixed(4)}</td>
                        <td>${stats.median.toFixed(4)}</td>
                        <td>${stats.sd.toFixed(4)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    const aiAnalysisHtml = aiAnalysis ? `
        <div class="llm-text-box">
            <h3>AI Analysis</h3>
            <h4>Summary:</h4>
            <p>${aiAnalysis.summary}</p>
            <h4>Explanation of New Seed Values:</h4>
            <p>${aiAnalysis.explanation}</p>
        </div>
    ` : '<p>AI analysis not available.</p>';
    
    const nextValuesHtml = aiAnalysis ? `
        <h3>Next Iteration Values (AI Suggested)</h3>
        <table class="summary-table">
            <thead>
                <tr>
                    <th>Parameter</th>
                    <th>Min</th>
                    <th>Max</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(aiAnalysis.newSeedValues).map(([param, values]) => `
                    <tr>
                        <td>${param}</td>
                        <td>${values.min.toFixed(4)}</td>
                        <td>${values.max.toFixed(4)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    ` : '';
    
    // Generate unique IDs for each plot
    const iterationId = Date.now();
    const powerVsCohensDiv = `powerVsCohensD-${iterationId}`;
    const n1VsN2Div = `n1VsN2-${iterationId}`;
    const sd1VsSd2Div = `sd1VsSd2-${iterationId}`;
    const skew1VsSkew2Div = `skew1VsSkew2-${iterationId}`;

    const htmlContent = `
        <div class="iteration">
            <h2>Analysis ${analysisIteration} (Iterations ${(analysisIteration - 1) * downloadFrequency + 1} - ${analysisIteration * downloadFrequency})</h2>
            ${aiAnalysisHtml}
            <div id="${powerVsCohensDiv}" class="plot"></div>
            <div id="${n1VsN2Div}" class="plot"></div>
            <div id="${sd1VsSd2Div}" class="plot"></div>
            <div id="${skew1VsSkew2Div}" class="plot"></div>
            ${summaryStatsHtml}
            ${nextValuesHtml}
        </div>
    `;

    // Create a separate script for Plotly calls
    const plotlyScript = `
        <script>
        setTimeout(() => {
            Plotly.newPlot('${powerVsCohensDiv}', ${JSON.stringify(powerVsCohensD.data)}, ${JSON.stringify(powerVsCohensD.layout)});
            Plotly.newPlot('${n1VsN2Div}', ${JSON.stringify(n1VsN2.data)}, ${JSON.stringify(n1VsN2.layout)});
            Plotly.newPlot('${sd1VsSd2Div}', ${JSON.stringify(sd1VsSd2.data)}, ${JSON.stringify(sd1VsSd2.layout)});
            Plotly.newPlot('${skew1VsSkew2Div}', ${JSON.stringify(skew1VsSkew2.data)}, ${JSON.stringify(skew1VsSkew2.layout)});
        }, 100);
        </script>
    `;

    // Append the new content to a file
    fs.appendFileSync(path.join(__dirname, 'new-content.html'), htmlContent);
    fs.appendFileSync(path.join(__dirname, 'new-content.html'), plotlyScript);

    console.log('New content added to new-content.html');

    // Return the analysis results
    return {
        summaryStats,
        processedData,
        newSeedValues: aiAnalysis ? aiAnalysis.newSeedValues : null
    };
}

// Usage example
repeatedNpboottprm({
    iterations: 4,
    cellBlock: 'T2 Cell Block 1.1',
    n_simulations: 10,
    nboot: 1000,
    conf_level: 0.95,
    delayBetweenActions: 500,
    website: 'https://mightymetrika.shinyapps.io/npbreplext031/',
    delayBetweenIterations: 5000,
    downloadFrequency: 2,
    simulationsToAnalyze: 2
}, {
    // Initial seed values with min and max
    M1: { min: 5, max: 9 },
    S1: { min: 2, max: 3 },
    M2: { min: 4, max: 10 },
    S2: { min: 1.5, max: 3.5 },
    Sk1: { min: -1, max: 1 },
    Sk2: { min: -1, max: 1 },
    n1: { min: 5, max: 12 },
    n2: { min: 5, max: 12 }
})
