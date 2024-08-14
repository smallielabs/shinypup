const { createComparisonPlot, createStripPlot } = require('./plotModule');

function generatePlots(processedData, methods, methodShapes, cellBlock) {
    const plots = [];

    if (cellBlock.startsWith('T2') || cellBlock.startsWith('T3')) {
        plots.push(
            createComparisonPlot(processedData, methods, methodShapes, {
                xKey: 'cohensD',
                title: 'Power vs Cohen\'s d',
                xaxis: 'Cohen\'s d',
                yaxis: 'Power',
                yrange: [0, 1]
            }),
            createStripPlot(processedData, ['n1', 'n2'], {
                title: 'Sample Size Distribution',
                xaxis: 'Group',
                yaxis: 'Sample Size',
                colorscale: 'Viridis',
                showscale: true,
                showlegend: false
            }),
            createStripPlot(processedData, ['s1', 's2'], {
                title: 'Standard Deviation Distribution',
                xaxis: 'Group',
                yaxis: 'Standard Deviation',
                colorscale: 'Viridis',
                showscale: false,
                showlegend: false
            }),
            createStripPlot(processedData, ['sk1', 'sk2'], {
                title: 'Skewness Distribution',
                xaxis: 'Group',
                yaxis: 'Skewness',
                colorscale: 'Viridis',
                showscale: false,
                showlegend: false
            })
        );
    } else if (cellBlock.startsWith('T4') || cellBlock.startsWith('TS1')) {
        plots.push(
            createStripPlot(processedData, ['n1', 'n2'], {
                title: 'Sample Size Distribution',
                xaxis: 'Group',
                yaxis: 'Sample Size',
                colorscale: 'Viridis',
                showscale: true,
                showlegend: false
            })
        );
    } else if (cellBlock.startsWith('T5') || cellBlock.startsWith('T6')) {
        plots.push(
            createStripPlot(processedData, ['n'], {
                title: 'Sample Size Distribution',
                xaxis: 'Group',
                yaxis: 'Sample Size',
                colorscale: 'Viridis',
                showscale: true,
                showlegend: false
            })
        );
    } else if (cellBlock.startsWith('TS2') || cellBlock.startsWith('TS3')) {
        plots.push(
            createStripPlot(processedData, ['n1', 'n2', 'n3'], {
                title: 'Sample Size Distribution',
                xaxis: 'Group',
                yaxis: 'Sample Size',
                colorscale: 'Viridis',
                showscale: true,
                showlegend: false
            })
        );
    }

    return plots;
}

module.exports = { generatePlots };