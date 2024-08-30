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
                const n1 = parseInt(row.n1);
                const n2 = parseInt(row.n2);
                const par1_1 = parseFloat(row.par1_1);
                const par1_2 = parseFloat(row.par1_2);
                const par2_1 = parseFloat(row.par2_1);
                const par2_2 = parseFloat(row.par2_2);
                
                let effectSize;

                // Determine the distribution type based on cellBlock
                const rdistValue = cellBlock.includes('1.1') ? 'rlnorm' :
                                   cellBlock.includes('2.1') ? 'rpois' :
                                   cellBlock.includes('3.1') ? 'rchisq' :
                                   cellBlock.includes('4.1') ? 'rlnorm' :
                                   cellBlock.includes('5.1') ? 'rcauchy' :
                                   cellBlock.includes('6.1') ? 'rchisq,rpois' :
                                   'rlnorm,rchisq';
    
                // Calculate effect size based on distribution type
                if (rdistValue === 'rlnorm') {
                    // Cohen's d for lognormal distribution
                    effectSize = Math.abs(Math.exp(par1_1 + par2_1**2/2) - Math.exp(par1_2 + par2_2**2/2)) /
                                 Math.sqrt((Math.exp(2*par1_1 + par2_1**2) * (Math.exp(par2_1**2) - 1) +
                                            Math.exp(2*par1_2 + par2_2**2) * (Math.exp(par2_2**2) - 1)) / 2);
                } else if (rdistValue === 'rpois') {
                    // Effect size for Poisson distribution (using difference in means divided by pooled standard deviation)
                    effectSize = Math.abs(par1_1 - par1_2) / Math.sqrt((par1_1 + par1_2) / 2);
                } else if (rdistValue === 'rchisq') {
                    // Effect size for Chi-squared distribution (using difference in means divided by pooled standard deviation)
                    const mean1 = par1_1 + par2_1;
                    const mean2 = par1_2 + par2_2;
                    const var1 = 2 * (par1_1 + 2 * par2_1);
                    const var2 = 2 * (par1_2 + 2 * par2_2);
                    effectSize = Math.abs(mean1 - mean2) / Math.sqrt((var1 + var2) / 2);
                } else if (rdistValue === 'rcauchy') {
                    // For Cauchy distribution, traditional effect size measures are not applicable
                    // We can use the difference in location parameters divided by the average scale
                    effectSize = Math.abs(par1_1 - par1_2) / ((par2_1 + par2_2) / 2);
                } else if (rdistValue === 'rchisq,rpois' || rdistValue === 'rlnorm,rchisq') {
                    // For mixed distributions, we can't calculate a meaningful effect size
                    // We set this to null
                    effectSize = null;
                }
    
                return {
                    ...baseData,
                    n1,
                    n2,
                    par1_1,
                    par1_2,
                    par2_1,
                    par2_2,
                    totalSampleSize: n1 + n2,
                    effectSize,
                    st: parseFloat(row.st),
                    wt: parseFloat(row.wt),
                    npbtt: parseFloat(row.npbtt),
                    wrst: parseFloat(row.wrst),
                    ptta: parseFloat(row.ptta),
                    ptte: parseFloat(row.ptte)
                };
        } else if (cellBlock.startsWith('T5') || cellBlock.startsWith('T6')) {
            return {
                ...baseData,
                n: parseInt(row.n),
                pt: parseFloat(row.pt),
                npbtt: parseFloat(row.npbtt),
                wrst: parseFloat(row.wrst),
                ptt: parseFloat(row.ptt)
            };
        } else if (cellBlock.startsWith('TS2') || cellBlock.startsWith('TS3')) {
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

    if (cellBlock.startsWith('T2') || cellBlock.startsWith('T3')) {
        methods = ['st', 'wt', 'npbtt', 'wrst', 'ptt'];
        methodShapes = {
            st: 'circle',
            wt: 'square',
            npbtt: 'diamond',
            wrst: 'triangle-up',
            ptt: 'star'
        };
    } else if (cellBlock.startsWith('T4') || cellBlock.startsWith('TS1')) {
        methods = ['st', 'wt', 'npbtt', 'wrst', 'ptta', 'ptte'];
        methodShapes = {
            st: 'circle',
            wt: 'square',
            npbtt: 'diamond',
            wrst: 'triangle-up',
            ptta: 'star',
            ptte: 'pentagon'
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