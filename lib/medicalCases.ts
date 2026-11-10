export interface MedicalCase {
  id: string;
  name: string;
  modality: string;
  organ: string;
  clinicalContext: string;
  defaultDataset: string;
  referenceImages: Array<{
    id: string;
    label: string;
    similarity: number; // Cosine similarity with DINOv2 / RAD-DINO
    gtDice: number;
  }>;
  presets: {
    good: {
      label: string;
      description: string;
      simulatedTrueDice: number;
      rcaDistribution: number[];
      maskPath: string;
    };
    borderline: {
      label: string;
      description: string;
      simulatedTrueDice: number;
      rcaDistribution: number[];
      maskPath: string;
    };
    poor: {
      label: string;
      description: string;
      simulatedTrueDice: number;
      rcaDistribution: number[];
      maskPath: string;
    };
  };
}

export const MEDICAL_CASES: Record<string, MedicalCase> = {
  jsrt_lung: {
    id: 'jsrt_lung',
    name: 'Chest X-Ray (JSRT) - Lung Lobes',
    modality: 'Radiography (X-Ray)',
    organ: 'Pulmonary Parenchyma (Bilateral Lungs)',
    clinicalContext: 'Pneumothorax, pneumonia, and nodule localization screening. Mask under-segmentation can cause lung volume underestimation.',
    defaultDataset: 'jsrt',
    referenceImages: [
      { id: 'ref_1', label: 'JSRT Case #014 (Normal PA)', similarity: 0.942, gtDice: 0.93 },
      { id: 'ref_2', label: 'JSRT Case #089 (Subtle Infiltrate)', similarity: 0.925, gtDice: 0.91 },
      { id: 'ref_3', label: 'JSRT Case #142 (Clear Field)', similarity: 0.908, gtDice: 0.89 },
      { id: 'ref_4', label: 'JSRT Case #201 (Apical Scarring)', similarity: 0.895, gtDice: 0.88 },
      { id: 'ref_5', label: 'JSRT Case #053 (Hyperinflation)', similarity: 0.881, gtDice: 0.86 },
      { id: 'ref_6', label: 'JSRT Case #112 (Scoliosis PA)', similarity: 0.864, gtDice: 0.85 },
      { id: 'ref_7', label: 'JSRT Case #177 (Elderly Male)', similarity: 0.849, gtDice: 0.84 },
      { id: 'ref_8', label: 'JSRT Case #220 (Elevated Diaphragm)', similarity: 0.835, gtDice: 0.82 },
    ],
    presets: {
      good: {
        label: 'High Quality (DSC ≈ 0.94)',
        description: 'Precise costophrenic angle and apical lung boundary alignment with minimal rib artifact.',
        simulatedTrueDice: 0.938,
        rcaDistribution: [0.93, 0.92, 0.94, 0.91, 0.89, 0.93, 0.88, 0.90],
        maskPath: 'M 120 40 C 90 60, 60 120, 55 180 C 50 220, 75 235, 110 230 C 130 215, 135 150, 130 90 Z M 160 40 C 190 60, 220 120, 225 180 C 230 220, 205 235, 170 230 C 150 215, 145 150, 150 90 Z'
      },
      borderline: {
        label: 'Borderline Quality (DSC ≈ 0.74)',
        description: 'Blunted left costophrenic angle and slight cardiac notch leakage.',
        simulatedTrueDice: 0.738,
        rcaDistribution: [0.77, 0.74, 0.72, 0.69, 0.76, 0.71, 0.68, 0.73],
        maskPath: 'M 120 45 C 95 65, 75 120, 70 175 C 68 200, 85 215, 110 210 C 125 195, 130 150, 128 90 Z M 160 40 C 195 60, 230 125, 235 190 C 240 235, 200 245, 165 240 C 145 220, 142 150, 148 90 Z'
      },
      poor: {
        label: 'Catastrophic Failure (DSC ≈ 0.38)',
        description: 'Severe boundary collapse due to low contrast and clavicle occlusion; AI failed.',
        simulatedTrueDice: 0.375,
        rcaDistribution: [0.42, 0.39, 0.35, 0.31, 0.44, 0.36, 0.30, 0.33],
        maskPath: 'M 110 90 C 85 110, 80 150, 75 180 C 70 200, 95 205, 115 190 C 120 170, 120 130, 118 100 Z'
      }
    }
  },
  irca_liver: {
    id: 'irca_liver',
    name: 'Abdominal CT (3D-IRCAdB) - Liver Tissue',
    modality: 'Computed Tomography (CT)',
    organ: 'Hepatic Parenchyma & Portal Vasculature',
    clinicalContext: 'Pre-operative resection planning for hepatocellular carcinoma. Margin safety requires high boundary certainty.',
    defaultDataset: 'irca',
    referenceImages: [
      { id: 'ref_1', label: '3D-IRCAdB Patient #01 (Arterial)', similarity: 0.951, gtDice: 0.94 },
      { id: 'ref_2', label: '3D-IRCAdB Patient #05 (Venous Phase)', similarity: 0.932, gtDice: 0.91 },
      { id: 'ref_3', label: '3D-IRCAdB Patient #08 (Segment IV)', similarity: 0.914, gtDice: 0.90 },
      { id: 'ref_4', label: '3D-IRCAdB Patient #12 (Caudate Lobe)', similarity: 0.898, gtDice: 0.87 },
      { id: 'ref_5', label: '3D-IRCAdB Patient #14 (Thin Slice)', similarity: 0.886, gtDice: 0.86 },
      { id: 'ref_6', label: '3D-IRCAdB Patient #17 (Fatty Infiltration)', similarity: 0.867, gtDice: 0.83 },
      { id: 'ref_7', label: '3D-IRCAdB Patient #03 (Contrast Enhanced)', similarity: 0.852, gtDice: 0.82 },
      { id: 'ref_8', label: '3D-IRCAdB Patient #19 (Gallbladder Adjacency)', similarity: 0.841, gtDice: 0.80 },
    ],
    presets: {
      good: {
        label: 'High Quality (DSC ≈ 0.95)',
        description: 'Complete encapsulation of right and left lobes without encroaching on hepatic vein or stomach.',
        simulatedTrueDice: 0.947,
        rcaDistribution: [0.95, 0.94, 0.93, 0.96, 0.92, 0.95, 0.91, 0.93],
        maskPath: 'M 70 120 C 80 70, 160 50, 210 80 C 235 100, 240 160, 220 200 C 190 230, 120 240, 80 210 C 60 180, 60 140, 70 120 Z'
      },
      borderline: {
        label: 'Borderline Quality (DSC ≈ 0.78)',
        description: 'Leakage into adjacent gallbladder fossa and diaphragm blur.',
        simulatedTrueDice: 0.781,
        rcaDistribution: [0.81, 0.79, 0.76, 0.74, 0.82, 0.77, 0.73, 0.75],
        maskPath: 'M 85 125 C 95 80, 155 60, 195 85 C 220 105, 230 150, 210 185 C 175 210, 125 220, 95 195 C 75 170, 75 145, 85 125 Z'
      },
      poor: {
        label: 'Catastrophic Failure (DSC ≈ 0.41)',
        description: 'Confusion with stomach gas and spleen tissue; incomplete liver volume.',
        simulatedTrueDice: 0.408,
        rcaDistribution: [0.46, 0.42, 0.38, 0.44, 0.37, 0.40, 0.34, 0.39],
        maskPath: 'M 110 130 C 120 100, 160 90, 185 110 C 195 130, 190 160, 175 180 C 150 190, 125 185, 115 170 Z'
      }
    }
  },
  isic_melanoma: {
    id: 'isic_melanoma',
    name: 'Dermoscopy (ISIC 2018) - Melanocytic Lesion',
    modality: 'Dermoscopic Imaging',
    organ: 'Cutaneous Lesion (Melanoma vs Nevus)',
    clinicalContext: 'Asymmetry, border irregularity, and diameter (ABCD rule). Quality control prevents miscalculation of asymmetry indices.',
    defaultDataset: 'isic 2018',
    referenceImages: [
      { id: 'ref_1', label: 'ISIC_0024306 (Superficial Spreading)', similarity: 0.963, gtDice: 0.92 },
      { id: 'ref_2', label: 'ISIC_0024312 (Pigmented Network)', similarity: 0.941, gtDice: 0.90 },
      { id: 'ref_3', label: 'ISIC_0024330 (Dysplastic Nevus)', similarity: 0.928, gtDice: 0.88 },
      { id: 'ref_4', label: 'ISIC_0024345 (Atypical Globules)', similarity: 0.904, gtDice: 0.86 },
      { id: 'ref_5', label: 'ISIC_0024361 (Erythematous Base)', similarity: 0.889, gtDice: 0.85 },
      { id: 'ref_6', label: 'ISIC_0024372 (Dark Brown Patch)', similarity: 0.871, gtDice: 0.83 },
      { id: 'ref_7', label: 'ISIC_0024388 (Hair Artifacts)', similarity: 0.855, gtDice: 0.81 },
      { id: 'ref_8', label: 'ISIC_0024403 (Gel Bubble Vignetting)', similarity: 0.839, gtDice: 0.79 },
    ],
    presets: {
      good: {
        label: 'High Quality (DSC ≈ 0.92)',
        description: 'Accurate tracing of irregular melanocytic borders excluding peripheral hair follicles.',
        simulatedTrueDice: 0.924,
        rcaDistribution: [0.93, 0.91, 0.94, 0.90, 0.89, 0.92, 0.88, 0.91],
        maskPath: 'M 120 70 C 160 65, 200 90, 210 130 C 220 170, 195 210, 150 220 C 110 230, 80 195, 75 155 C 70 115, 90 75, 120 70 Z'
      },
      borderline: {
        label: 'Borderline Quality (DSC ≈ 0.75)',
        description: 'Cuts off faint hypopigmented peripheral regression zones.',
        simulatedTrueDice: 0.752,
        rcaDistribution: [0.78, 0.76, 0.72, 0.70, 0.79, 0.74, 0.69, 0.73],
        maskPath: 'M 130 90 C 160 85, 185 105, 195 135 C 200 165, 180 195, 150 200 C 120 205, 100 185, 95 155 C 90 125, 105 95, 130 90 Z'
      },
      poor: {
        label: 'Catastrophic Failure (DSC ≈ 0.34)',
        description: 'Captured corner vignette reflection instead of true pigmented lesion.',
        simulatedTrueDice: 0.339,
        rcaDistribution: [0.38, 0.35, 0.32, 0.29, 0.40, 0.34, 0.28, 0.31],
        maskPath: 'M 50 50 C 70 40, 90 45, 95 65 C 100 85, 80 100, 60 105 C 40 110, 30 90, 35 70 Z'
      }
    }
  },
  hc18_ultrasound: {
    id: 'hc18_ultrasound',
    name: 'Fetal Ultrasound (HC18) - Head Circumference',
    modality: 'Obstetric Ultrasound (2D US)',
    organ: 'Fetal Cranial Vault (Biparietal Circumference)',
    clinicalContext: 'Gestational age and biometric growth monitoring. Errors in ellipse fitting lead to incorrect gestational age estimation.',
    defaultDataset: 'hc18',
    referenceImages: [
      { id: 'ref_1', label: 'HC18 Slice #042 (24th Week)', similarity: 0.948, gtDice: 0.95 },
      { id: 'ref_2', label: 'HC18 Slice #109 (Transventricular)', similarity: 0.930, gtDice: 0.93 },
      { id: 'ref_3', label: 'HC18 Slice #184 (Transthalamic)', similarity: 0.912, gtDice: 0.91 },
      { id: 'ref_4', label: 'HC18 Slice #261 (Acoustic Shadowing)', similarity: 0.899, gtDice: 0.89 },
      { id: 'ref_5', label: 'HC18 Slice #330 (Cerebellar Plane)', similarity: 0.884, gtDice: 0.87 },
      { id: 'ref_6', label: 'HC18 Slice #412 (Early 2nd Trimester)', similarity: 0.865, gtDice: 0.85 },
      { id: 'ref_7', label: 'HC18 Slice #503 (Late 3rd Trimester)', similarity: 0.850, gtDice: 0.83 },
      { id: 'ref_8', label: 'HC18 Slice #618 (Anterior Placenta)', similarity: 0.838, gtDice: 0.81 },
    ],
    presets: {
      good: {
        label: 'High Quality (DSC ≈ 0.96)',
        description: 'Smooth ellipsoidal skull perimeter aligning perfectly with hyperechoic parietal bones.',
        simulatedTrueDice: 0.958,
        rcaDistribution: [0.96, 0.95, 0.97, 0.94, 0.93, 0.96, 0.92, 0.95],
        maskPath: 'M 128 65 C 175 65, 215 95, 215 140 C 215 185, 175 215, 128 215 C 81 215, 41 185, 41 140 C 41 95, 81 65, 128 65 Z'
      },
      borderline: {
        label: 'Borderline Quality (DSC ≈ 0.77)',
        description: 'Distortion on posterior acoustic shadow region causing minor cranial truncation.',
        simulatedTrueDice: 0.769,
        rcaDistribution: [0.80, 0.78, 0.75, 0.72, 0.81, 0.77, 0.71, 0.74],
        maskPath: 'M 130 75 C 165 75, 200 100, 200 135 C 200 170, 165 195, 130 195 C 95 195, 65 170, 65 135 C 65 100, 95 75, 130 75 Z'
      },
      poor: {
        label: 'Catastrophic Failure (DSC ≈ 0.36)',
        description: 'AI model segmented amniotic fluid sac instead of fetal skull.',
        simulatedTrueDice: 0.358,
        rcaDistribution: [0.41, 0.37, 0.34, 0.31, 0.43, 0.36, 0.30, 0.33],
        maskPath: 'M 90 120 C 110 110, 140 120, 145 145 C 150 170, 130 185, 105 180 C 85 175, 75 155, 80 135 Z'
      }
    }
  }
};

