const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');
const path = require('path');
const { generateIntroduction, getAIAnalysis } = require('./src/modules/openaiModule');
const { generateRandomFromSeed, calculateSummaryStats } = require('./src/modules/mathModule');
const { createScatterPlot, createComparisonPlot } = require('./src/modules/plotModule');
const {
    launchBrowser,
    createPage,
    navigateToWebsite,
    selectCellBlock,
    fillUserDefinedInput,
    fillInput,
    runSimulation,
    submitResults,
    downloadAndProcessCSV
} = require('./src/modules/puppeteerModule');

const delay = ms => new Promise(res => setTimeout(res, ms));

async function npboottprm_replext(options = {}, seedValues = {}) {
    const {
        cellBlock = 'T2 Cell Block 1.1',
        n_simulations = 10,
        nboot = 1000,
        conf_level = 0.95,
        delayBetweenActions = 500,
        website = 'https://mightymetrika.shinyapps.io/npbreplext031/'
    } = options;

    const browser = await launchBrowser();
    const page = await createPage(browser);

    try {

        await navigateToWebsite(page, website);
        await selectCellBlock(page, cellBlock);

        let filledValues = {};

        if (cellBlock.startsWith('T2') || cellBlock.startsWith('T3')) {
            filledValues.M1 = await fillInput(page, '#M1', generateRandomFromSeed(seedValues.M1.min, seedValues.M1.max, true), delayBetweenActions);
            filledValues.S1 = await fillInput(page, '#S1', generateRandomFromSeed(seedValues.S1.min, seedValues.S1.max, false), delayBetweenActions);
            filledValues.M2 = await fillInput(page, '#M2', generateRandomFromSeed(seedValues.M2.min, seedValues.M2.max, true), delayBetweenActions);
            filledValues.S2 = await fillInput(page, '#S2', generateRandomFromSeed(seedValues.S2.min, seedValues.S2.max, false), delayBetweenActions);
            filledValues.Sk1 = await fillInput(page, '#Sk1', generateRandomFromSeed(seedValues.Sk1.min, seedValues.Sk1.max, false), delayBetweenActions);
            filledValues.Sk2 = await fillInput(page, '#Sk2', generateRandomFromSeed(seedValues.Sk2.min, seedValues.Sk2.max, false), delayBetweenActions);
            filledValues.n1 = await fillInput(page, '#n1', generateRandomFromSeed(seedValues.n1.min, seedValues.n1.max, true), delayBetweenActions);
            filledValues.n2 = await fillInput(page, '#n2', generateRandomFromSeed(seedValues.n2.min, seedValues.n2.max, true), delayBetweenActions);
        } else if (cellBlock.startsWith('T4') || cellBlock.startsWith('TS1')) {
            filledValues.par1_1 = await fillInput(page, '#par1_1', generateRandomFromSeed(seedValues.par1_1.min, seedValues.par1_1.max, false), delayBetweenActions);
            filledValues.par2_1 = await fillInput(page, '#par2_1', generateRandomFromSeed(seedValues.par2_1.min, seedValues.par2_1.max, false), delayBetweenActions);
            filledValues.par1_2 = await fillInput(page, '#par1_2', generateRandomFromSeed(seedValues.par1_2.min, seedValues.par1_2.max, false), delayBetweenActions);
            filledValues.par2_2 = await fillInput(page, '#par2_2', generateRandomFromSeed(seedValues.par2_2.min, seedValues.par2_2.max, false), delayBetweenActions);
            filledValues.n1 = await fillInput(page, '#n1', generateRandomFromSeed(seedValues.n1.min, seedValues.n1.max, true), delayBetweenActions);
            filledValues.n2 = await fillInput(page, '#n2', generateRandomFromSeed(seedValues.n2.min, seedValues.n2.max, true), delayBetweenActions);
            
            const rdistValue = cellBlock.includes('1.1') ? 'rlnorm' :
                               cellBlock.includes('2.1') ? 'rpois' :
                               cellBlock.includes('3.1') ? 'rchisq' :
                               cellBlock.includes('4.1') ? 'rlnorm' :
                               cellBlock.includes('5.1') ? 'rcauchy' :
                               cellBlock.includes('6.1') ? 'rchisq,rpois' :
                               'rlnorm,rchisq';
            await fillUserDefinedInput(page, '#rdist', rdistValue, delayBetweenActions);
            filledValues.rdist = rdistValue;
        } else if (cellBlock.startsWith('T5') || cellBlock.startsWith('T6')) {
            filledValues.M1 = await fillInput(page, '#M1', generateRandomFromSeed(seedValues.M1.min, seedValues.M1.max, true), delayBetweenActions);
            filledValues.S1 = await fillInput(page, '#S1', generateRandomFromSeed(seedValues.S1.min, seedValues.S1.max, false), delayBetweenActions);
            filledValues.M2 = await fillInput(page, '#M2', generateRandomFromSeed(seedValues.M2.min, seedValues.M2.max, true), delayBetweenActions);
            filledValues.S2 = await fillInput(page, '#S2', generateRandomFromSeed(seedValues.S2.min, seedValues.S2.max, false), delayBetweenActions);
            filledValues.Sk1 = await fillInput(page, '#Sk1', generateRandomFromSeed(seedValues.Sk1.min, seedValues.Sk1.max, false), delayBetweenActions);
            filledValues.Sk2 = await fillInput(page, '#Sk2', generateRandomFromSeed(seedValues.Sk2.min, seedValues.Sk2.max, false), delayBetweenActions);
            filledValues.correl = await fillInput(page, '#correl', generateRandomFromSeed(seedValues.correl.min, seedValues.correl.max, false), delayBetweenActions);
            filledValues.n = await fillInput(page, '#n', generateRandomFromSeed(seedValues.n.min, seedValues.n.max, true), delayBetweenActions);
        } else if (cellBlock.startsWith('TS2') || cellBlock.startsWith('TS3')) {
            filledValues.M1 = await fillInput(page, '#M1', generateRandomFromSeed(seedValues.M1.min, seedValues.M1.max, true), delayBetweenActions);
            filledValues.S1 = await fillInput(page, '#S1', generateRandomFromSeed(seedValues.S1.min, seedValues.S1.max, false), delayBetweenActions);
            filledValues.M2 = await fillInput(page, '#M2', generateRandomFromSeed(seedValues.M2.min, seedValues.M2.max, true), delayBetweenActions);
            filledValues.S2 = await fillInput(page, '#S2', generateRandomFromSeed(seedValues.S2.min, seedValues.S2.max, false), delayBetweenActions);
            filledValues.M3 = await fillInput(page, '#M3', generateRandomFromSeed(seedValues.M3.min, seedValues.M3.max, true), delayBetweenActions);
            filledValues.S3 = await fillInput(page, '#S3', generateRandomFromSeed(seedValues.S3.min, seedValues.S3.max, false), delayBetweenActions);
            filledValues.Sk1 = await fillInput(page, '#Sk1', generateRandomFromSeed(seedValues.Sk1.min, seedValues.Sk1.max, false), delayBetweenActions);
            filledValues.Sk2 = await fillInput(page, '#Sk2', generateRandomFromSeed(seedValues.Sk2.min, seedValues.Sk2.max, false), delayBetweenActions);
            filledValues.Sk3 = await fillInput(page, '#Sk3', generateRandomFromSeed(seedValues.Sk3.min, seedValues.Sk3.max, false), delayBetweenActions);
            filledValues.n1 = await fillInput(page, '#n1', generateRandomFromSeed(seedValues.n1.min, seedValues.n1.max, true), delayBetweenActions);
            filledValues.n2 = await fillInput(page, '#n2', generateRandomFromSeed(seedValues.n2.min, seedValues.n2.max, true), delayBetweenActions);
            filledValues.n3 = await fillInput(page, '#n3', generateRandomFromSeed(seedValues.n3.min, seedValues.n3.max, true), delayBetweenActions);
        }

        // Set user-defined parameters
        await fillUserDefinedInput(page, '#n_simulations', n_simulations, delayBetweenActions);
        await fillUserDefinedInput(page, '#nboot', nboot, delayBetweenActions);
        //await fillUserDefinedInput(page, '#conf.level', conf_level, delayBetweenActions);

        if (delayBetweenActions > 0) await delay(2000);

        // await delay(5000);
        await runSimulation(page);
        await submitResults(page);

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
            const filledValues = await npboottprm_replext(options, currentValues);
            
            currentIteration++;
            
            if (currentIteration % downloadFrequency === 0) {
                console.log(`Downloading and analyzing data...`);
                const data = await downloadAndProcessCSV(website);

                analysisIteration++;  // Increment the analysis iteration counter

                if (!introductionDisplayed) {

                    const introductionPrompt = `
                    You are an AI assistant specializing in statistical analysis. We are about to start a series of simulations using the 'npbtt' method, which is our main focus. This method is based on the study by Dwivedi et al. (2017) titled "Analysis of small sample size studies using nonparametric bootstrap test with pooled resampling method."
        
                    Here are the parameters and options for our simulation:
                    ${JSON.stringify(options, null, 2)}
        
                    And here are the initial seed values:
                    ${JSON.stringify(initialSeedValues, null, 2)}
        
                    Please provide an introduction for our analysis that covers:
                    1. An overview of what we're trying to achieve with these simulations, referencing the original study by Dwivedi et al.
                    2. A brief explanation of the 'npbtt' method, its advantages for small sample sizes, and why we're comparing it to other methods (st, wt, wrst, ptt).
                    3. A description of the key parameters and options we're using, inferring their purpose from their names and values, and how they relate to the original study.
                    4. What we hope to learn from this series of simulations and how it extends or validates the findings of Dwivedi et al.
                    5. The potential implications of this work for researchers dealing with small sample size studies.
        
                    Format your response as HTML that can be directly inserted into a web page.
                `;
                    const introduction = await generateIntroduction(options, initialSeedValues, introductionPrompt);
                    const introductionHtml = `
                    <div class="introduction">
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

    // Calculate summary statistics using the mathModule
    const summaryStats = calculateSummaryStats(processedData, methods);

    // Get AI analysis
    const aiAnalysisPrompt = `
    You are an AI assistant specializing in statistical analysis. We are studying the 'npbtt' method, which is our main focus, based on the work of Dwivedi et al. (2017). The other methods (st, wt, wrst, ptt) are for comparison. We are looking to either maximize statistical power or better control the type 1 error rate for npbtt compared to other methods.

    Here are the summary statistics of our latest simulation:
    ${JSON.stringify(summaryStats, null, 2)}

    These results were produced using the following seed values:
    ${JSON.stringify(currentSeedValues, null, 2)}

    The means in the summary statistics represent rejection rates.

    Please provide:
    1. A meaningful text-based summary of the results, comparing them to the findings of Dwivedi et al. (2017) where applicable.
    2. An interpretation of how these results align with or differ from the original study's conclusions about the npbtt method's performance.
    3. An explanation of how we should adjust the seed values for the next iteration, based on our current results and the goals of maximizing power or controlling type 1 error.
    4. A discussion of the implications of these results for researchers working with small sample sizes.
    5. Suggestions for further investigations or modifications to the simulation that could provide additional insights.
    6. A JSON object with suggested new seed values for the next analysis.

    Format your response as a JSON object with keys: "summary", "comparison", "explanation", "implications", "suggestions", and "newSeedValues".
    `;
    const aiAnalysis = await getAIAnalysis(summaryStats, currentSeedValues, aiAnalysisPrompt);
    
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

    const plots = [
        createComparisonPlot(processedData, methods, methodShapes, {
            xKey: 'cohensD',
            title: 'Power vs Cohen\'s d',
            xaxis: 'Cohen\'s d',
            yaxis: 'Power',
            yrange: [0, 1]
        }),
        createScatterPlot([{
            x: processedData.map(d => d.n1),
            y: processedData.map(d => d.n2),
            color: processedData.map(d => d.rowIndex),
            colorscale: 'Viridis',
            showscale: true,
            showlegend: false
        }], {
            title: 'Sample Size: n1 vs n2',
            xaxis: 'n1',
            yaxis: 'n2'
        }),
        createScatterPlot([{
            x: processedData.map(d => d.s1),
            y: processedData.map(d => d.s2),
            color: processedData.map(d => d.rowIndex),
            colorscale: 'Viridis',
            showscale: false,
            showlegend: false
        }], {
            title: 'Standard Deviation: SD1 vs SD2',
            xaxis: 'SD1',
            yaxis: 'SD2'
        }),
        createScatterPlot([{
            x: processedData.map(d => d.sk1),
            y: processedData.map(d => d.sk2),
            color: processedData.map(d => d.rowIndex),
            colorscale: 'Viridis',
            showscale: false,
            showlegend: false
        }], {
            title: 'Skewness: Skew1 vs Skew2',
            xaxis: 'Skew1',
            yaxis: 'Skew2'
        })
    ];

    // Generate HTML content
    const plotDivs = plots.map((plot, index) => `<div id="plot-${analysisIteration}-${index}" class="plot"></div>`).join('');

    const htmlContent = `
        <div class="iteration">
            <h2>Analysis ${analysisIteration} (Iterations ${(analysisIteration - 1) * downloadFrequency + 1} - ${analysisIteration * downloadFrequency})</h2>
            ${aiAnalysisHtml}
            ${plotDivs}
            ${summaryStatsHtml}
            ${nextValuesHtml}
        </div>
    `;

    // Create a separate script for Plotly calls
    const plotlyScript = `
        <script>
        setTimeout(() => {
            ${plots.map((plot, index) => `
                Plotly.newPlot('plot-${analysisIteration}-${index}', ${JSON.stringify(plot.data)}, ${JSON.stringify(plot.layout)});
            `).join('')}
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
