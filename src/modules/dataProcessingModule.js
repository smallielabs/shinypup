function processData(data, cellBlock) {
    const processedData = data.map((row, index) => {
        const baseData = { rowIndex: index };

        if (cellBlock.startsWith('T2') || cellBlock.startsWith('T3')) {
            return {
                ...baseData,
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
            };
        } else if (cellBlock.startsWith('T4') || cellBlock.startsWith('TS1')) {
            return {
                ...baseData,
                n1: parseInt(row.n1),
                n2: parseInt(row.n2),
                totalSampleSize: parseInt(row.n1) + parseInt(row.n2),
                st: parseFloat(row.ST),
                wt: parseFloat(row.WT),
                npbtt: parseFloat(row.NPBTT),
                wrst: parseFloat(row.WRST),
                ptta: parseFloat(row.PTTa),
                ptte: parseFloat(row.PTTe)
            };
        } else if (cellBlock.startsWith('T5') || cellBlock.startsWith('T6')) {
            return {
                ...baseData,
                n: parseInt(row.n),
                pt: parseFloat(row.PT),
                npbtt: parseFloat(row.NPBTT),
                wrst: parseFloat(row.WRST),
                ptt: parseFloat(row.PTT)
            };
        } else if (cellBlock.startsWith('TS2') || cellBlock.startsWith('TS3')) {
            return {
                ...baseData,
                n1: parseInt(row.n1),
                n2: parseInt(row.n2),
                n3: parseInt(row.n3),
                totalSampleSize: parseInt(row.n1) + parseInt(row.n2) + parseInt(row.n3),
                anov: parseFloat(row.ANOV),
                kw: parseFloat(row.KW),
                npbft: parseFloat(row.NPBFT),
                pft: parseFloat(row.PFT)
            };
        }
    });

    let methods, methodShapes;

    if (cellBlock.startsWith('T2') || cellBlock.startsWith('T3') || cellBlock.startsWith('T4') || cellBlock.startsWith('TS1')) {
        methods = ['st', 'wt', 'npbtt', 'wrst', 'ptt'];
        methodShapes = {
            st: 'circle',
            wt: 'square',
            npbtt: 'diamond',
            wrst: 'triangle-up',
            ptt: 'star'
        };
    } else if (cellBlock.startsWith('T5') || cellBlock.startsWith('T6')) {
        methods = ['pt', 'npbtt', 'wrst', 'ptt'];
        methodShapes = {
            pt: 'circle',
            npbtt: 'diamond',
            wrst: 'triangle-up',
            ptt: 'star'
        };
    } else if (cellBlock.startsWith('TS2') || cellBlock.startsWith('TS3')) {
        methods = ['anov', 'kw', 'npbft', 'pft'];
        methodShapes = {
            anov: 'circle',
            kw: 'square',
            npbft: 'diamond',
            pft: 'star'
        };
    }

    return { processedData, methods, methodShapes };
}

module.exports = { processData };