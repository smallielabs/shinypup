const { createComparisonPlot, createStripPlot } = require('./plotModule');

function generatePlots(processedData, methods, methodShapes, cellBlock) {
    const plots = [];

    if (cellBlock.startsWith('T2') || cellBlock.startsWith('T3')) {
        plots.push(
            createComparisonPlot(processedData, methods, methodShapes, {
                xKey: 'cohensD',
                title: 'Rejection Rate vs Cohen\'s d',
                xaxis: 'Cohen\'s d',
                yaxis: 'Rejection Rate',
                yrange: [-0.1, 1.1]
            }),
            createStripPlot(processedData, ['n1', 'n2'], {
                title: 'Sample Size Distribution',
                xaxis: '',
                yaxis: 'Sample Size',
                colorscale: 'Viridis',
                showscale: true,
                showlegend: false
            }),
            createStripPlot(processedData, ['s1', 's2'], {
                title: 'Standard Deviation Distribution',
                xaxis: '',
                yaxis: 'Standard Deviation',
                colorscale: 'Viridis',
                showscale: false,
                showlegend: false
            }),
            createStripPlot(processedData, ['sk1', 'sk2'], {
                title: 'Skewness Distribution',
                xaxis: '',
                yaxis: 'Skewness',
                colorscale: 'Viridis',
                showscale: false,
                showlegend: false
            })
        );
    } else if (cellBlock.startsWith('T4') || cellBlock.startsWith('TS1')) {

        if(cellBlock.includes('1.1') || cellBlock.includes('3.1') || cellBlock.includes('5.1')){
            plots.push(
                createComparisonPlot(processedData, methods, methodShapes, {
                    xKey: 'effectSize',
                    title: 'Rejection Rate vs Effect Size',
                    xaxis: 'Effect Size',
                    yaxis: 'Rejection Rate',
                    yrange: [-0.1, 1.1]
                }),
                createStripPlot(processedData, ['n1', 'n2'], {
                    title: 'Sample Size Distribution',
                    xaxis: '',
                    yaxis: 'Sample Size',
                    colorscale: 'Viridis',
                    showscale: true,
                    showlegend: false
                }),
                createStripPlot(processedData, ['par1_1', 'par1_2'], {
                    title: 'Parameter 1 Distribution',
                    xaxis: '',
                    yaxis: 'Parameter 1',
                    colorscale: 'Viridis',
                    showscale: false,
                    showlegend: false
                }),
                createStripPlot(processedData, ['par2_1', 'par2_2'], {
                    title: 'Parameter 2 Distribution',
                    xaxis: '',
                    yaxis: 'Parameter 2',
                    colorscale: 'Viridis',
                    showscale: false,
                    showlegend: false
                })
            );
        } else if (cellBlock.includes('2.1')){
            plots.push(
                createComparisonPlot(processedData, methods, methodShapes, {
                    xKey: 'effectSize',
                    title: 'Rejection Rate vs Effect Size',
                    xaxis: 'Effect Size',
                    yaxis: 'Rejection Rate',
                    yrange: [-0.1, 1.1]
                }),
                createStripPlot(processedData, ['n1', 'n2'], {
                    title: 'Sample Size Distribution',
                    xaxis: '',
                    yaxis: 'Sample Size',
                    colorscale: 'Viridis',
                    showscale: true,
                    showlegend: false
                }),
                createStripPlot(processedData, ['par1_1', 'par1_2'], {
                    title: 'Parameter 1 Distribution',
                    xaxis: '',
                    yaxis: 'Parameter 1',
                    colorscale: 'Viridis',
                    showscale: false,
                    showlegend: false
                })
            );
        }
    } else if (cellBlock.startsWith('T5') || cellBlock.startsWith('T6')) {
        plots.push(
            createStripPlot(processedData, ['n'], {
                title: 'Sample Size Distribution',
                xaxis: '',
                yaxis: 'Sample Size',
                colorscale: 'Viridis',
                showscale: true,
                showlegend: false
            })
        );
    } else if (cellBlock.startsWith('TS2') || cellBlock.startsWith('TS3')) {
        plots.push(
            createComparisonPlot(processedData, methods, methodShapes, {
                xKey: 'etaSquared',
                title: 'Rejection Rate vs eta Squared',
                xaxis: 'eta Squared',
                yaxis: 'Rejection Rate',
                yrange: [-0.1, 1.1]
            }),
            createStripPlot(processedData, ['n1', 'n2', 'n3'], {
                title: 'Sample Size Distribution',
                xaxis: '',
                yaxis: 'Sample Size',
                colorscale: 'Viridis',
                showscale: true,
                showlegend: false
            }),
            createStripPlot(processedData, ['s1', 's2', 's3'], {
                title: 'Standard Deviation Distribution',
                xaxis: '',
                yaxis: 'Standard Deviation',
                colorscale: 'Viridis',
                showscale: false,
                showlegend: false
            }),
            createStripPlot(processedData, ['sk1', 'sk2', 'sk3'], {
                title: 'Skewness Distribution',
                xaxis: '',
                yaxis: 'Skewness',
                colorscale: 'Viridis',
                showscale: false,
                showlegend: false
            })
        );
    }

    return plots;
}

module.exports = { generatePlots };