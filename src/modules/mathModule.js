function generateRandomFromSeed(min, max, isInteger = true) {
    if (isInteger) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
        return Math.random() * (max - min) + min;
    }
}

function mean(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function median(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function standardDeviation(arr) {
    const avg = mean(arr);
    const squareDiffs = arr.map(value => Math.pow(value - avg, 2));
    return Math.sqrt(mean(squareDiffs));
}

function calculateSummaryStats(data, methods) {
    return methods.reduce((acc, method) => {
        const values = data.map(d => d[method]).filter(v => !isNaN(v));
        acc[method] = {
            mean: mean(values),
            median: median(values),
            sd: standardDeviation(values)
        };
        return acc;
    }, {});
}

module.exports = {
    generateRandomFromSeed,
    mean,
    median,
    standardDeviation,
    calculateSummaryStats
};