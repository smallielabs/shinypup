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

module.exports = {
    createScatterPlot,
    createComparisonPlot
};