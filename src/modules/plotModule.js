function createScatterPlot(data, layout, options = {}) {
    const plotData = data.map(series => ({
        x: series.x,
        y: series.y,
        mode: 'markers',
        type: 'scatter',
        name: series.name,
        marker: {
            symbol: series.symbol || 'circle',
            size: series.size || 8,
            color: series.color,
            colorscale: series.colorscale,
            showscale: series.showscale
        },
        showlegend: series.showlegend !== undefined ? series.showlegend : (data.length > 1)
    }));

    const plotLayout = {
        title: layout.title,
        xaxis: { title: layout.xaxis },
        yaxis: { title: layout.yaxis, range: layout.yrange },
        showlegend: options.showlegend !== undefined ? options.showlegend : (data.length > 1)
    };

    return { data: plotData, layout: plotLayout };
}

function createComparisonPlot(processedData, methods, methodShapes, options = {}) {
    const data = methods.map(method => ({
        x: processedData.map(d => d[options.xKey]),
        y: processedData.map(d => d[method]),
        name: method.toUpperCase(),
        symbol: methodShapes[method],
        color: processedData.map(d => d.rowIndex),
        colorscale: 'Viridis',
        showscale: false,
        showlegend: true
    }));

    const layout = {
        title: options.title,
        xaxis: { title: options.xaxis },
        yaxis: { title: options.yaxis, range: options.yrange }
    };

    return createScatterPlot(data, layout, { showlegend: true });
}

function createStripPlot(processedData, valueKeys, options = {}) {
    const data = valueKeys.map((key, index) => {
        const xJitter = processedData.map(() => (Math.random() - 0.5) * 0.4);
        return {
            y: processedData.map(d => d[key]),
            x: processedData.map((_, i) => index + 1 + xJitter[i]),
            name: `Group ${index + 1}`,
            mode: 'markers',
            type: 'scatter',
            marker: {
                color: processedData.map(d => d.rowIndex + 1),
                colorscale: options.colorscale || 'Viridis',
                showscale: options.showscale,
                colorbar: options.showscale ? {
                    title: 'Iteration'
                } : undefined
            },
            showlegend: false
        };
    });

    const layout = {
        title: options.title,
        xaxis: { 
            title: options.xaxis,
            tickmode: 'array',
            tickvals: valueKeys.map((_, i) => i + 1),
            ticktext: valueKeys.map((_, i) => `Group ${i + 1}`),
            range: [0.5, valueKeys.length + 0.5]
        },
        yaxis: { title: options.yaxis },
        showlegend: options.showlegend
    };

    return { data, layout };
}

module.exports = {
    createScatterPlot,
    createComparisonPlot,
    createStripPlot
};