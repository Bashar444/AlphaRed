import { mean, median, std, variance, min, max, sum, round } from 'mathjs';

export interface DescriptiveResult {
    count: number;
    mean: number;
    median: number;
    mode: number[];
    stdDev: number;
    variance: number;
    min: number;
    max: number;
    sum: number;
    range: number;
    q1: number;
    q3: number;
    iqr: number;
    skewness: number;
}

export interface FrequencyItem {
    value: string;
    count: number;
    percentage: number;
}

export interface CrossTabResult {
    rows: string[];
    columns: string[];
    observed: number[][];
    rowTotals: number[];
    colTotals: number[];
    grandTotal: number;
}

export interface ChiSquareResult {
    statistic: number;
    degreesOfFreedom: number;
    pValue: number;
    significant: boolean;
    crossTab: CrossTabResult;
}

export interface CorrelationResult {
    r: number;
    rSquared: number;
    pValue: number;
    significant: boolean;
    n: number;
}

export interface TTestResult {
    tStatistic: number;
    degreesOfFreedom: number;
    pValue: number;
    significant: boolean;
    meanDiff: number;
    group1Mean: number;
    group2Mean: number;
    group1N: number;
    group2N: number;
}

/** Calculate mode(s) of a numeric array */
function calcMode(values: number[]): number[] {
    const freq = new Map<number, number>();
    for (const v of values) {
        freq.set(v, (freq.get(v) || 0) + 1);
    }
    const maxFreq = Math.max(...freq.values());
    if (maxFreq === 1) return []; // no mode
    const modes: number[] = [];
    for (const [val, count] of freq) {
        if (count === maxFreq) modes.push(val);
    }
    return modes;
}

/** Calculate percentile from sorted array */
function percentile(sorted: number[], p: number): number {
    const idx = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    if (lower === upper) return sorted[lower];
    return sorted[lower] + (idx - lower) * (sorted[upper] - sorted[lower]);
}

/** Calculate skewness (Fisher-Pearson) */
function calcSkewness(values: number[], m: number, s: number): number {
    if (s === 0 || values.length < 3) return 0;
    const n = values.length;
    const sumCubed = values.reduce((acc, v) => acc + Math.pow((v - m) / s, 3), 0);
    return (n / ((n - 1) * (n - 2))) * sumCubed;
}

// ═══════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════

/** Descriptive statistics for numeric data */
export function descriptiveStats(values: number[]): DescriptiveResult {
    if (values.length === 0) {
        return {
            count: 0, mean: 0, median: 0, mode: [], stdDev: 0,
            variance: 0, min: 0, max: 0, sum: 0, range: 0,
            q1: 0, q3: 0, iqr: 0, skewness: 0,
        };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const m = round(mean(values) as number, 4);
    const med = round(median(values) as number, 4);
    const s = round(std(values, 'uncorrected') as unknown as number, 4);
    const v = round(variance(values, 'uncorrected') as unknown as number, 4);
    const q1Val = round(percentile(sorted, 25), 4);
    const q3Val = round(percentile(sorted, 75), 4);

    return {
        count: values.length,
        mean: m,
        median: med,
        mode: calcMode(values),
        stdDev: s,
        variance: v,
        min: round(min(values) as number, 4),
        max: round(max(values) as number, 4),
        sum: round(sum(values) as number, 4),
        range: round((max(values) as number) - (min(values) as number), 4),
        q1: q1Val,
        q3: q3Val,
        iqr: round(q3Val - q1Val, 4),
        skewness: round(calcSkewness(values, m, s), 4),
    };
}

/** Frequency distribution for categorical data */
export function frequencyDistribution(values: string[]): FrequencyItem[] {
    const freq = new Map<string, number>();
    for (const v of values) {
        freq.set(v, (freq.get(v) || 0) + 1);
    }
    const total = values.length;
    return Array.from(freq.entries())
        .map(([value, count]) => ({
            value,
            count,
            percentage: round((count / total) * 100, 2),
        }))
        .sort((a, b) => b.count - a.count);
}

/** Cross-tabulation of two categorical variables */
export function crossTabulation(var1: string[], var2: string[]): CrossTabResult {
    const rows = [...new Set(var1)].sort();
    const columns = [...new Set(var2)].sort();

    const observed = rows.map((r) =>
        columns.map((c) => {
            let count = 0;
            for (let i = 0; i < var1.length; i++) {
                if (var1[i] === r && var2[i] === c) count++;
            }
            return count;
        }),
    );

    const rowTotals = observed.map((row) => row.reduce((a, b) => a + b, 0));
    const colTotals = columns.map((_, ci) => observed.reduce((a, row) => a + row[ci], 0));
    const grandTotal = rowTotals.reduce((a, b) => a + b, 0);

    return { rows, columns, observed, rowTotals, colTotals, grandTotal };
}

/** Chi-square test of independence */
export function chiSquareTest(var1: string[], var2: string[]): ChiSquareResult {
    const ct = crossTabulation(var1, var2);
    const { observed, rowTotals, colTotals, grandTotal, rows, columns } = ct;

    let chiSq = 0;
    for (let r = 0; r < rows.length; r++) {
        for (let c = 0; c < columns.length; c++) {
            const expected = (rowTotals[r] * colTotals[c]) / grandTotal;
            if (expected > 0) {
                chiSq += Math.pow(observed[r][c] - expected, 2) / expected;
            }
        }
    }

    const df = (rows.length - 1) * (columns.length - 1);
    // Approximate p-value using chi-square CDF (Wilson-Hilferty)
    const pValue = df > 0 ? approxChiSqPValue(chiSq, df) : 1;

    return {
        statistic: round(chiSq, 4),
        degreesOfFreedom: df,
        pValue: round(pValue, 4),
        significant: pValue < 0.05,
        crossTab: ct,
    };
}

/** Pearson correlation coefficient */
export function pearsonCorrelation(x: number[], y: number[]): CorrelationResult {
    const n = Math.min(x.length, y.length);
    if (n < 3) {
        return { r: 0, rSquared: 0, pValue: 1, significant: false, n };
    }

    const meanX = mean(x.slice(0, n)) as number;
    const meanY = mean(y.slice(0, n)) as number;

    let sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (let i = 0; i < n; i++) {
        const dx = x[i] - meanX;
        const dy = y[i] - meanY;
        sumXY += dx * dy;
        sumX2 += dx * dx;
        sumY2 += dy * dy;
    }

    const denom = Math.sqrt(sumX2 * sumY2);
    const r = denom === 0 ? 0 : sumXY / denom;
    const rSq = r * r;

    // t-test for significance
    const t = r * Math.sqrt((n - 2) / (1 - rSq + 1e-10));
    const df = n - 2;
    const pValue = approxTTestPValue(Math.abs(t), df);

    return {
        r: round(r, 4),
        rSquared: round(rSq, 4),
        pValue: round(pValue, 4),
        significant: pValue < 0.05,
        n,
    };
}

/** Independent samples t-test */
export function independentTTest(group1: number[], group2: number[]): TTestResult {
    const n1 = group1.length;
    const n2 = group2.length;

    if (n1 < 2 || n2 < 2) {
        return {
            tStatistic: 0, degreesOfFreedom: 0, pValue: 1,
            significant: false, meanDiff: 0,
            group1Mean: n1 > 0 ? (mean(group1) as number) : 0,
            group2Mean: n2 > 0 ? (mean(group2) as number) : 0,
            group1N: n1, group2N: n2,
        };
    }

    const m1 = mean(group1) as number;
    const m2 = mean(group2) as number;
    const v1 = variance(group1, 'unbiased') as unknown as number;
    const v2 = variance(group2, 'unbiased') as unknown as number;

    const se = Math.sqrt(v1 / n1 + v2 / n2);
    const t = se === 0 ? 0 : (m1 - m2) / se;

    // Welch's degrees of freedom
    const num = Math.pow(v1 / n1 + v2 / n2, 2);
    const den = Math.pow(v1 / n1, 2) / (n1 - 1) + Math.pow(v2 / n2, 2) / (n2 - 1);
    const df = den === 0 ? 0 : num / den;

    const pValue = df > 0 ? approxTTestPValue(Math.abs(t), df) : 1;

    return {
        tStatistic: round(t, 4),
        degreesOfFreedom: round(df, 2),
        pValue: round(pValue, 4),
        significant: pValue < 0.05,
        meanDiff: round(m1 - m2, 4),
        group1Mean: round(m1, 4),
        group2Mean: round(m2, 4),
        group1N: n1,
        group2N: n2,
    };
}

// ═══════════════════════════════════════════
// APPROXIMATE P-VALUE HELPERS
// ═══════════════════════════════════════════

/** Approximate chi-square p-value using regularized gamma */
function approxChiSqPValue(x: number, df: number): number {
    if (x <= 0 || df <= 0) return 1;
    // Wilson-Hilferty approximation
    const z = Math.pow(x / df, 1 / 3) - (1 - 2 / (9 * df));
    const se = Math.sqrt(2 / (9 * df));
    const zScore = z / se;
    return 1 - normalCDF(zScore);
}

/** Approximate two-tailed t-test p-value */
function approxTTestPValue(t: number, df: number): number {
    if (df <= 0) return 1;
    // Approximate using normal for large df, beta approx for small
    const x = df / (df + t * t);
    const a = df / 2;
    const b = 0.5;
    // Regularized incomplete beta approximation
    const p = incompleteBetaApprox(x, a, b);
    return Math.min(1, Math.max(0, p));
}

/** Standard normal CDF approximation (Abramowitz & Stegun) */
function normalCDF(z: number): number {
    if (z < -6) return 0;
    if (z > 6) return 1;
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = z < 0 ? -1 : 1;
    const x = Math.abs(z) / Math.sqrt(2);
    const t = 1 / (1 + p * x);
    const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return 0.5 * (1 + sign * y);
}

/** Simple incomplete beta approximation for t-test p-value */
function incompleteBetaApprox(x: number, a: number, b: number): number {
    // Use continued fraction expansion (simplified)
    if (x <= 0) return 0;
    if (x >= 1) return 1;

    // For t-test p-values: use normal approximation when df > 30
    if (a > 15) {
        const mu = a / (a + b);
        const sigma = Math.sqrt((a * b) / ((a + b) * (a + b) * (a + b + 1)));
        const z = (x - mu) / sigma;
        return normalCDF(z);
    }

    // Numerical integration (Simpson's rule, 100 steps)
    const n = 100;
    const h = x / n;
    let integral = 0;
    for (let i = 0; i <= n; i++) {
        const t = i * h;
        const ft = Math.pow(t, a - 1) * Math.pow(1 - t, b - 1);
        if (i === 0 || i === n) integral += ft;
        else if (i % 2 === 1) integral += 4 * ft;
        else integral += 2 * ft;
    }
    integral *= h / 3;

    // Normalize by beta function
    const betaFn = gamma(a) * gamma(b) / gamma(a + b);
    return Math.min(1, integral / betaFn);
}

/** Lanczos approximation for gamma function */
function gamma(z: number): number {
    if (z < 0.5) {
        return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
    }
    z -= 1;
    const g = 7;
    const c = [
        0.99999999999980993, 676.5203681218851, -1259.1392167224028,
        771.32342877765313, -176.61502916214059, 12.507343278686905,
        -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
    ];
    let x = c[0];
    for (let i = 1; i < g + 2; i++) {
        x += c[i] / (z + i);
    }
    const t = z + g + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}
