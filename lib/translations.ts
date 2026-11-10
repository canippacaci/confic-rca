export type Language = 'tr' | 'en';

export const TRANSLATIONS = {
  tr: {
    appTitle: 'ConfIC-RCA',
    appSubtitle: 'Tıbbi Görüntü Segmentasyonunda İstatistiksel Garantili Kalite Kontrolü',
    paperBadge: 'IEEE TMI 2025 / arXiv:2503.04522 Makale Uygulaması',
    tabs: {
      pipeline: 'İnteraktif Pipeline',
      benchmark: '10 Veri Seti Kalibratörü',
      sandbox: 'Hata & Güvenlik Testi',
      theory: 'Makale Teorisi & Matematik',
      presentation: 'Hoca Sunum Modu'
    },
    pipeline: {
      selectCase: 'Tıbbi Vaka & Modalite Seçimi',
      selectQuality: 'Segmentasyon Kalitesi (Yapay Zeka Çıktısı)',
      runPipeline: 'Pipeline\'ı Adım Adım Çalıştır',
      step1Title: 'Adım 1: Test Görüntüsü ve Tahmin (I, S_I)',
      step1Desc: 'Klinik ortamda yeni bir hasta taraması (X-Ray, MR, BT) gelir ve model bir segmentasyon maskesi üretir. Önemli nokta: Test anında yer doğrusu (Ground Truth) YOKTUR!',
      step2Title: 'Adım 2: Geri-Getirimle Zenginleştirme (RAD-DINO / DINOv2 Retrieval)',
      step2Desc: 'Görüntü DINOv2 latent uzayında gömülür (768-d). FAISS ile referans veritabanındaki en benzer k vaka kosinüs benzerliğine göre anında seçilir.',
      step3Title: 'Adım 3: In-Context Ters Sınıflandırma (UniverSeg / SAM 2)',
      step3Desc: 'Test görüntüsü ve tahmin (I, S_I) "In-Context Support" (destek kümesi) olarak verilir. Model hiç eğitilmeden referans görüntüleri segmentler.',
      step4Title: 'Adım 4: Referans Skor Dağılımı (Y Dağılımı)',
      step4Desc: 'Referans görüntülerin bilinen etiketleri (GT) ile ters segmenter çıktıları karşılaştırılarak Dice skor kümesi Y elde edilir.',
      step5Title: 'Adım 5: Split Conformal Quantile Hesaplama (CQR)',
      step5Desc: 'Y dağılımından asimetrik kantiller (p_l = 0.3, p_h = 0.9) ve kalibrasyon eşiği q_hat hesaplanır.',
      step6Title: 'Adım 6: İstatistiksel Güven Aralığı & Klinik Karar',
      step6Desc: 'True Dice skoru en az %90 olasılıkla bu aralıktadır garantisi verilir. Eşik altındaysa otomatik klinik alarm tetiklenir.',
      speedupCallout: 'Geleneksel Atlas RCA 60 saniye sürerken, In-Context RCA sadece 0.37 saniyede (162 kat hızlı) sonuç üretir!',
      coverageGuarantee: 'Matematiksel Garanti: P(True DSC ∈ C(S_I)) ≥ 1 - α (%90)'
    },
    benchmark: {
      title: '10 Farklı Tıbbi Veri Setinde Doğrulama & CQR Kalibrasyonu',
      subtitle: 'Makalenin gerçek kalibrasyon ve test verileri üzerinde canlı parametre optimizasyonu',
      selectDataset: 'Veri Seti Seçin',
      selectModel: 'Ters Segmenter Modeli',
      alphaSlider: 'Hedef Kapsama Oranı (1 - α):',
      plSlider: 'Alt Kantil (p_l):',
      phSlider: 'Üst Kantil (p_h):',
      refSlider: 'Referans Görüntü Sayısı (k):',
      thresholdSlider: 'Klinik Güvenlik Eşiği (DSC):',
      empiricalCoverage: 'Gerçekleşen Kapsama (Coverage)',
      avgWidth: 'Ortalama Aralık Genişliği',
      violations: 'Aralık Dışı Kalan (İhlal)',
      correlation: 'Yer Doğrusu Korelasyonu (r)',
      latency: 'Ortalama Çıkarım Süresi',
      scatterTitle: 'Test Seti: Tahmin Aralığı [Alt, Üst] vs Gerçek Dice',
      nonconformityTitle: 'Kalibrasyon Uyumsuzluk Skoru (s_j) Dağılımı & q_hat Eşiği'
    },
    common: {
      highQuality: 'Yüksek Kalite (Başarılı)',
      borderlineQuality: 'Sınırda Kalite (Şüpheli)',
      poorQuality: 'Kritik Hata (Başarısız)',
      approved: 'ONAYLANDI (Klinik Standart Sağlandı)',
      review: 'UZMAN İNCELEMESİ GEREKİYOR',
      rejected: 'REDDEDİLDİ (Güvensiz Segmentasyon)',
      reset: 'Sıfırla',
      next: 'Sonraki Adım',
      prev: 'Önceki Adım',
      autoPlay: 'Otomatik Oynat',
      stop: 'Durdur'
    }
  },
  en: {
    appTitle: 'ConfIC-RCA',
    appSubtitle: 'Statistically Grounded Efficient Estimation of Medical Image Segmentation Quality',
    paperBadge: 'IEEE TMI 2025 / arXiv:2503.04522 Reproduction & Demo',
    tabs: {
      pipeline: 'Interactive Pipeline',
      benchmark: '10-Dataset Calibrator',
      sandbox: 'Defect & Safety Sandbox',
      theory: 'Paper Theory & Math',
      presentation: 'Professor Defense Mode'
    },
    pipeline: {
      selectCase: 'Medical Case & Modality Selection',
      selectQuality: 'Candidate Segmentation Quality',
      runPipeline: 'Run Pipeline Step-by-Step',
      step1Title: 'Step 1: Input Image & Candidate Mask (I, S_I)',
      step1Desc: 'A new patient scan arrives and the model produces a segmentation mask. Crucial reality: At test time, NO Ground Truth is available!',
      step2Title: 'Step 2: Retrieval Augmentation (RAD-DINO / DINOv2 Retrieval)',
      step2Desc: 'Image is embedded into DINOv2 latent space (768-d). FAISS retrieves the top-k most similar reference cases based on cosine similarity.',
      step3Title: 'Step 3: In-Context Reverse Classification (UniverSeg / SAM 2)',
      step3Desc: 'Test pair (I, S_I) serves as the in-context support prompt. The model segments retrieved reference images without parameter retraining.',
      step4Title: 'Step 4: Reference Score Distribution (Y Distribution)',
      step4Desc: 'Comparing reverse segmenter outputs with known reference ground truths yields empirical score set Y.',
      step5Title: 'Step 5: Split Conformal Quantile Computation (CQR)',
      step5Desc: 'Asymmetric quantiles (p_l = 0.3, p_h = 0.9) and calibration threshold q_hat are computed.',
      step6Title: 'Step 6: Statistical Prediction Interval & Clinical Action',
      step6Desc: 'Rigorous guarantee: P(True DSC in C(S_I)) >= 1 - alpha. Automated clinical traffic light alert triggers if lower bound drops.',
      speedupCallout: 'Traditional Atlas RCA takes 60 seconds; In-Context RCA takes just 0.37s (162x faster)!',
      coverageGuarantee: 'Statistical Guarantee: P(True DSC ∈ C(S_I)) ≥ 1 - α (90%)'
    },
    benchmark: {
      title: '10 Medical Imaging Benchmarks & Live CQR Calibrator',
      subtitle: 'Live hyperparameter tuning running on official paper calibration and test splits',
      selectDataset: 'Select Dataset',
      selectModel: 'Reverse Segmenter Model',
      alphaSlider: 'Target Nominal Coverage (1 - α):',
      plSlider: 'Lower Quantile (p_l):',
      phSlider: 'Upper Quantile (p_h):',
      refSlider: 'Reference Database Size (k):',
      thresholdSlider: 'Clinical Acceptance Threshold (DSC):',
      empiricalCoverage: 'Empirical Coverage Rate',
      avgWidth: 'Average Interval Width',
      violations: 'Miscoverage Violations',
      correlation: 'Ground Truth Correlation (r)',
      latency: 'Average Inference Latency',
      scatterTitle: 'Test Set: Predicted Intervals [lb, ub] vs True Dice',
      nonconformityTitle: 'Calibration Nonconformity (s_j) Distribution & q_hat Cutoff'
    },
    common: {
      highQuality: 'High Quality (Pass)',
      borderlineQuality: 'Borderline Quality (Review)',
      poorQuality: 'Catastrophic Failure (Reject)',
      approved: 'APPROVED (Clinically Valid)',
      review: 'PHYSICIAN AUDIT REQUIRED',
      rejected: 'REJECTED (Unsafe AI Output)',
      reset: 'Reset',
      next: 'Next Step',
      prev: 'Previous Step',
      autoPlay: 'Auto Play',
      stop: 'Stop'
    }
  }
};

