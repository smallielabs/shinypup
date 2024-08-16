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
            // return {
            //     ...baseData,
            //     n1: parseInt(row.n1),
            //     n2: parseInt(row.n2),
            //     n3: parseInt(row.n3),
            //     totalSampleSize: parseInt(row.n1) + parseInt(row.n2) + parseInt(row.n3),
            //     m1: parseFloat(row.m1),
            //     m2: parseFloat(row.m2),
            //     m3: parseFloat(row.m3),
            //     s1: parseFloat(row.s1),
            //     s2: parseFloat(row.s2),
            //     s3: parseFloat(row.s3),
            //     sk1: parseFloat(row.sk1),
            //     sk2: parseFloat(row.sk2),
            //     sk3: parseFloat(row.sk3),
            //     anov: parseFloat(row.ANOV),
            //     kw: parseFloat(row.KW),
            //     npbft: parseFloat(row.NPBFT),
            //     pft: parseFloat(row.PFT)
            // };
            const n1 = parseInt(row.n1);
            const n2 = parseInt(row.n2);
            const n3 = parseInt(row.n3);
            const totalSampleSize = n1 + n2 + n3;
            const m1 = parseFloat(row.m1);
            const m2 = parseFloat(row.m2);
            const m3 = parseFloat(row.m3);
            const grandMean = (n1 * m1 + n2 * m2 + n3 * m3) / totalSampleSize;
            
            // Calculate eta squared
            const ssb = n1 * Math.pow(m1 - grandMean, 2) + 
                        n2 * Math.pow(m2 - grandMean, 2) + 
                        n3 * Math.pow(m3 - grandMean, 2);
            const sst = ssb + 
                        (n1 - 1) * Math.pow(parseFloat(row.s1), 2) + 
                        (n2 - 1) * Math.pow(parseFloat(row.s2), 2) + 
                        (n3 - 1) * Math.pow(parseFloat(row.s3), 2);
            const etaSquared = ssb / sst;
            console.log(`etaSquared: ${etaSquared}`);

            return {
                ...baseData,
                n1,
                n2,
                n3,
                totalSampleSize,
                m1,
                m2,
                m3,
                s1: parseFloat(row.s1),
                s2: parseFloat(row.s2),
                s3: parseFloat(row.s3),
                sk1: parseFloat(row.sk1),
                sk2: parseFloat(row.sk2),
                sk3: parseFloat(row.sk3),
                anov: parseFloat(row.anov),
                kw: parseFloat(row.kw),
                npbft: parseFloat(row.npbft),
                pft: parseFloat(row.pft),
                etaSquared
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