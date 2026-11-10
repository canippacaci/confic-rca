import datasetCache from './data/dataset_cache.json';
import { runConformalCalibration, CalibrationResult } from './conformalEngine';

export interface DatasetInfo {
  key: string;
  name: string;
  modality: string;
  anatomy: string;
  n_total: number;
  defaultMetric: string;
  models: {
    [modelKey: string]: {
      cal: Array<{ id: number; y: number; rca: number[] }>;
      test: Array<{ id: number; y: number; rca: number[] }>;
      totalCalCount: number;
      totalTestCount: number;
    };
  };
}

export const DATASETS = datasetCache as unknown as Record<string, DatasetInfo>;

export const MODEL_NAMES: Record<string, { label: string; speed: string; desc: string }> = {
  universeg: {
    label: 'UniverSeg (In-Context RCA)',
    speed: '0.37s / image (162x faster)',
    desc: 'UNet encoder-decoder with CrossBlocks conditioning on support image-mask pairs without retraining.'
  },
  'atlas-ra': {
    label: 'Atlas-RA (Retrieval-Augmented Atlas)',
    speed: '14.2s / image (4.2x faster)',
    desc: 'Non-rigid B-Spline registration constrained to DINOv2 retrieved top-k reference atlases.'
  },
  atlas: {
    label: 'Traditional Atlas RCA',
    speed: '60.0s / image (Baseline)',
    desc: 'Classical pairwise non-rigid registration (Valindria et al., IEEE TMI 2017).'
  }
};

export function getAvailableDatasets(): DatasetInfo[] {
  return Object.values(DATASETS);
}

export function getDataset(key: string): DatasetInfo | undefined {
  return DATASETS[key];
}

export function calibrateDataset(
  datasetKey: string,
  modelKey: string,
  options: {
    pl?: number;
    ph?: number;
    alpha?: number;
    nRef?: number;
    clinicalThreshold?: number;
  } = {}
): CalibrationResult {
  const ds = getDataset(datasetKey);
  if (!ds) {
    throw new Error(`Dataset not found: ${datasetKey}`);
  }
  const modelData = ds.models[modelKey] || ds.models['universeg'];
  if (!modelData) {
    throw new Error(`Model data not found for: ${modelKey}`);
  }

  return runConformalCalibration(modelData.cal, modelData.test, {
    ...options,
    datasetKey,
    modelKey
  });
}

