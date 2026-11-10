export interface SampleData {
  id: number;
  y: number; // Real ground-truth Dice
  rca: number[]; // RCA scores on reference images
}

export interface CalibrationResult {
  datasetKey: string;
  modelKey: string;
  nominalCoverage: number; // e.g. 0.90
  empiricalCoverage: number; // e.g. 91.2
  avgWidth: number; // e.g. 0.38
  qHat: number; // conformal threshold
  pl: number; // lower quantile (default 0.3)
  ph: number; // upper quantile (default 0.9)
  nRef: number; // number of reference images (default 8)
  nCal: number;
  nTest: number;
  violationsCount: number;
  mae: number;
  pearsonR: number;
  testPredictions: Array<{
    id: number;
    yTrue: number;
    yPredPoint: number;
    lb: number;
    ub: number;
    isCovered: boolean;
    intervalWidth: number;
    status: 'pass' | 'review' | 'reject';
  }>;
  nonconformityScores: {
    calScores: number[];
    testScores: number[];
    qHat: number;
  };
}

export function quantile(arr: number[], q: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

export function quantileBandAsymmetric(scores: number[], pl: number, ph: number): [number, number] {
  return [quantile(scores, pl), quantile(scores, ph)];
}

export function calculatePearson(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2) return 0;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  if (denX === 0 || denY === 0) return 0;
  return num / Math.sqrt(denX * denY);
}

export function runConformalCalibration(
  calSamples: SampleData[],
  testSamples: SampleData[],
  options: {
    pl?: number;
    ph?: number;
    alpha?: number;
    nRef?: number;
    clinicalThreshold?: number;
    datasetKey?: string;
    modelKey?: string;
  } = {}
): CalibrationResult {
  const pl = options.pl ?? 0.30;
  const ph = options.ph ?? 0.90;
  const alpha = options.alpha ?? 0.10;
  const nRef = options.nRef ?? 8;
  const clinicalThreshold = options.clinicalThreshold ?? 0.75;
  const datasetKey = options.datasetKey ?? 'dataset';
  const modelKey = options.modelKey ?? 'universeg';

  // 1. Calculate calibration nonconformity scores: s_j = max(lo - y, y - hi)
  const calScores: number[] = [];
  for (const sample of calSamples) {
    const scores = sample.rca.slice(0, nRef);
    if (scores.length === 0) continue;
    const [lo, hi] = quantileBandAsymmetric(scores, pl, ph);
    const score = Math.max(lo - sample.y, sample.y - hi);
    calScores.push(score);
  }

  // 2. Conformal quantile cutoff: ceil((N + 1) * (1 - alpha)) / N
  const N = calScores.length;
  if (N === 0) {
    throw new Error('Calibration set cannot be empty');
  }
  const sortedCalScores = [...calScores].sort((a, b) => a - b);
  const qRank = Math.min(N - 1, Math.max(0, Math.ceil((N + 1) * (1 - alpha)) - 1));
  const qHat = sortedCalScores[qRank];

  // 3. Evaluate on test set
  let coveredCount = 0;
  let totalWidth = 0;
  let totalAbsErr = 0;
  const yTrueArr: number[] = [];
  const yPredArr: number[] = [];
  const testScores: number[] = [];

  const testPredictions: CalibrationResult['testPredictions'] = [];

  for (const sample of testSamples) {
    const scores = sample.rca.slice(0, nRef);
    if (scores.length === 0) continue;
    const [lo, hi] = quantileBandAsymmetric(scores, pl, ph);
    const lb = Math.max(0, parseFloat((lo - qHat).toFixed(4)));
    const ub = Math.min(1, parseFloat((hi + qHat).toFixed(4)));
    const yPredPoint = parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(4));

    const isCovered = sample.y >= lb && sample.y <= ub;
    if (isCovered) coveredCount++;

    const intervalWidth = parseFloat((ub - lb).toFixed(4));
    totalWidth += intervalWidth;
    totalAbsErr += Math.abs(sample.y - yPredPoint);

    yTrueArr.push(sample.y);
    yPredArr.push(yPredPoint);

    const sTest = Math.max(lo - sample.y, sample.y - hi);
    testScores.push(sTest);

    // Clinical status determination
    let status: 'pass' | 'review' | 'reject' = 'pass';
    if (lb >= clinicalThreshold) {
      status = 'pass';
    } else if (ub >= clinicalThreshold) {
      status = 'review';
    } else {
      status = 'reject';
    }

    testPredictions.push({
      id: sample.id,
      yTrue: sample.y,
      yPredPoint,
      lb,
      ub,
      isCovered,
      intervalWidth,
      status
    });
  }

  const nTest = testPredictions.length;
  const empiricalCoverage = nTest > 0 ? parseFloat(((coveredCount / nTest) * 100).toFixed(2)) : 0;
  const avgWidth = nTest > 0 ? parseFloat((totalWidth / nTest).toFixed(4)) : 0;
  const mae = nTest > 0 ? parseFloat((totalAbsErr / nTest).toFixed(4)) : 0;
  const pearsonR = parseFloat(calculatePearson(yTrueArr, yPredArr).toFixed(4));

  return {
    datasetKey,
    modelKey,
    nominalCoverage: 1 - alpha,
    empiricalCoverage,
    avgWidth,
    qHat: parseFloat(qHat.toFixed(4)),
    pl,
    ph,
    nRef,
    nCal: N,
    nTest,
    violationsCount: nTest - coveredCount,
    mae,
    pearsonR,
    testPredictions,
    nonconformityScores: {
      calScores,
      testScores,
      qHat: parseFloat(qHat.toFixed(4))
    }
  };
}

