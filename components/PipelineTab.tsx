'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  Zap, 
  Database, 
  Cpu, 
  Sliders, 
  CheckCircle2, 
  Info,
  Eye,
  Layers
} from 'lucide-react';
import { MEDICAL_CASES, MedicalCase } from '../lib/medicalCases';
import { Language, TRANSLATIONS } from '../lib/translations';

interface PipelineTabProps {
  lang: Language;
}

export const PipelineTab: React.FC<PipelineTabProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const cases = Object.values(MEDICAL_CASES);

  const [selectedCaseId, setSelectedCaseId] = useState<string>('jsrt_lung');
  const [selectedQuality, setSelectedQuality] = useState<'good' | 'borderline' | 'poor'>('good');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showOverlay, setShowOverlay] = useState<boolean>(true);
  const [opacity, setOpacity] = useState<number>(0.65);

  const currentCase: MedicalCase = MEDICAL_CASES[selectedCaseId] || MEDICAL_CASES['jsrt_lung'];
  const currentPreset = currentCase.presets[selectedQuality];

  // Auto-play timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= 6) {
            setIsPlaying(false);
            return 6;
          }
          return prev + 1;
        });
      }, 2400);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Derived Conformal CQR calculations for selected case
  const rcaScores = [...currentPreset.rcaDistribution].sort((a, b) => a - b);
  const qL = rcaScores[Math.floor(rcaScores.length * 0.30)] || 0.7; // pl = 0.3
  const qH = rcaScores[Math.floor(rcaScores.length * 0.90)] || 0.9; // ph = 0.9
  const qHat = 0.085; // calibrated threshold at alpha = 0.1 (90% coverage)

  const lowerBound = Math.max(0, parseFloat((qL - qHat).toFixed(3)));
  const upperBound = Math.min(1, parseFloat((qH + qHat).toFixed(3)));
  const pointEst = parseFloat((rcaScores.reduce((a, b) => a + b, 0) / rcaScores.length).toFixed(3));
  const trueDice = currentPreset.simulatedTrueDice;

  // Clinical Decision Logic
  const clinicalThreshold = 0.75;
  const isApproved = lowerBound >= clinicalThreshold;
  const isReview = !isApproved && upperBound >= clinicalThreshold;
  const isRejected = upperBound < clinicalThreshold;

  const steps = [
    { num: 1, title: lang === 'tr' ? 'Girdi & Aday Maske' : 'Input & Candidate Mask', icon: Eye },
    { num: 2, title: lang === 'tr' ? 'RAD-DINO Retrieval' : 'RAD-DINO Retrieval', icon: Database },
    { num: 3, title: lang === 'tr' ? 'In-Context Ters Sınıflayıcı' : 'In-Context Reverse Classifier', icon: Cpu },
    { num: 4, title: lang === 'tr' ? 'RCA Skor Dağılımı (Y)' : 'RCA Score Distribution (Y)', icon: Sliders },
    { num: 5, title: lang === 'tr' ? 'CQR Kantil Hesaplama' : 'CQR Quantile Calculation', icon: Layers },
    { num: 6, title: lang === 'tr' ? 'İstatistiksel Aralık & Alarm' : 'Guaranteed Interval & Alarm', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Scientific Context */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-1">
              <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>{t.paperBadge}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {lang === 'tr' ? 'ConfIC-RCA İnteraktif Pipeline Simülasyonu' : 'ConfIC-RCA Interactive Pipeline Simulation'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              {lang === 'tr'
                ? 'Test anında Yer Doğrusu (Ground Truth) bulunmadığında, segmentasyon kalitesini In-Context öğrenme ve Split Conformal Prediction (CQR) ile %90 istatistiksel garantiyle tahmin edin.'
                : 'Estimate segmentation quality without ground truth using In-Context Learning and Split Conformal Prediction with 90% statistical guarantee.'}
            </p>
          </div>

          {/* Speedup Metric Highlight */}
          <div className="flex items-center space-x-3 bg-slate-950/80 border border-cyan-500/30 rounded-xl px-4 py-2.5">
            <div className="text-right">
              <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                {lang === 'tr' ? 'Hız Kazanımı' : 'Inference Speedup'}
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-cyan-400">
                162x <span className="text-xs font-normal text-slate-300">Daha Hızlı</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-xs text-slate-400 leading-tight">
              <span className="text-emerald-400 font-semibold">0.37s</span> UniverSeg<br />
              <span className="text-rose-400 line-through">60.0s</span> Klasik Atlas
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel: Case & Quality Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Case selector */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            {t.pipeline.selectCase}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {cases.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCaseId(c.id);
                  setCurrentStep(1);
                }}
                className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                  selectedCaseId === c.id
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200 shadow-sm shadow-cyan-500/10'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-slate-200 truncate">{c.name.split(' - ')[0]}</div>
                <div className="text-[11px] text-slate-400 truncate">{c.organ}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Quality preset selector */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            {t.pipeline.selectQuality}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedQuality('good')}
              className={`p-2.5 rounded-lg border text-xs text-left transition-all ${
                selectedQuality === 'good'
                  ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200'
                  : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-1 font-semibold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{lang === 'tr' ? 'Yüksek' : 'High'}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">DSC ≈ 0.94</div>
            </button>

            <button
              onClick={() => setSelectedQuality('borderline')}
              className={`p-2.5 rounded-lg border text-xs text-left transition-all ${
                selectedQuality === 'borderline'
                  ? 'border-amber-500 bg-amber-950/40 text-amber-200'
                  : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-1 font-semibold text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{lang === 'tr' ? 'Sınırda' : 'Borderline'}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">DSC ≈ 0.74</div>
            </button>

            <button
              onClick={() => setSelectedQuality('poor')}
              className={`p-2.5 rounded-lg border text-xs text-left transition-all ${
                selectedQuality === 'poor'
                  ? 'border-rose-500 bg-rose-950/40 text-rose-200'
                  : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-1 font-semibold text-rose-400">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>{lang === 'tr' ? 'Kritik Hata' : 'Failure'}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">DSC ≈ 0.36</div>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed italic">
            &ldquo;{currentPreset.description}&rdquo;
          </p>
        </div>
      </div>

      {/* Stepper Navigation */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Step indicators */}
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {steps.map((st) => {
              const Icon = st.icon;
              const isCurrent = currentStep === st.num;
              const isPast = currentStep > st.num;
              return (
                <button
                  key={st.num}
                  onClick={() => setCurrentStep(st.num)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isCurrent
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : isPast
                      ? 'bg-slate-800 text-cyan-400 hover:bg-slate-700'
                      : 'bg-slate-950 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{st.num}. {st.title}</span>
                </button>
              );
            })}
          </div>

          {/* Stepper Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentStep((p) => Math.max(1, p - 1))}
              disabled={currentStep === 1}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-cyan-400 hover:bg-slate-750 text-xs font-semibold"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? t.common.stop : t.common.autoPlay}</span>
            </button>
            <button
              onClick={() => {
                setCurrentStep(1);
                setIsPlaying(false);
              }}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentStep((p) => Math.min(6, p + 1))}
              disabled={currentStep === 6}
              className="p-1.5 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage for Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Stage: Medical Image & Segmentation Display (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {currentCase.modality}
              </span>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                256 x 256 px
              </span>
            </div>

            {/* Medical Canvas Display */}
            <div className="relative aspect-square w-full rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden medical-grid shadow-inner">
              {/* Scan simulation graphic */}
              <svg viewBox="0 0 256 256" className="w-full h-full">
                <defs>
                  <radialGradient id="organGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                    <stop offset="70%" stopColor="#1e293b" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#020617" stopOpacity="1" />
                  </radialGradient>
                  <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="4" y2="0" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  </pattern>
                </defs>

                {/* Scan Background & Organ Silhouette */}
                <rect width="256" height="256" fill="#090d16" />
                <rect width="256" height="256" fill="url(#scanlines)" />
                <ellipse cx="128" cy="128" rx="100" ry="90" fill="url(#organGrad)" />

                {/* Anatomy-specific base drawing */}
                {selectedCaseId === 'jsrt_lung' && (
                  <g opacity="0.4" stroke="#94a3b8" strokeWidth="1" fill="none">
                    {/* Rib cage lines */}
                    <path d="M 60 70 Q 128 90 196 70" />
                    <path d="M 50 110 Q 128 135 206 110" />
                    <path d="M 45 150 Q 128 175 211 150" />
                    <path d="M 55 190 Q 128 215 201 190" />
                    {/* Spine */}
                    <line x1="128" y1="30" x2="128" y2="230" strokeDasharray="3,3" />
                  </g>
                )}

                {/* Candidate Segmentation Mask Overlay */}
                {showOverlay && (
                  <path
                    d={currentPreset.maskPath}
                    fill={
                      selectedQuality === 'good'
                        ? '#10b981'
                        : selectedQuality === 'borderline'
                        ? '#f59e0b'
                        : '#f43f5e'
                    }
                    fillOpacity={opacity}
                    stroke={
                      selectedQuality === 'good'
                        ? '#34d399'
                        : selectedQuality === 'borderline'
                        ? '#fbbf24'
                        : '#fb7185'
                    }
                    strokeWidth="2.5"
                    strokeDasharray={selectedQuality === 'poor' ? '4,2' : undefined}
                    className="transition-all duration-500 ease-in-out"
                  />
                )}
              </svg>

              {/* Status Pill on Canvas */}
              <div className="absolute top-3 left-3 bg-slate-950/90 border border-slate-700/80 px-2.5 py-1 rounded-md text-[11px] text-slate-300 backdrop-blur-md">
                <span className="font-semibold text-white">{currentCase.organ}</span>
              </div>
            </div>

            {/* Canvas controls */}
            <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOverlay}
                  onChange={(e) => setShowOverlay(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>{lang === 'tr' ? 'Maskeyi Göster (Overlay)' : 'Show Mask Overlay'}</span>
              </label>

              <div className="flex items-center space-x-2">
                <span>{lang === 'tr' ? 'Opaklık' : 'Opacity'}:</span>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-20 accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Clinical context callout */}
          <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 leading-relaxed">
            <span className="text-cyan-400 font-semibold">{lang === 'tr' ? 'Klinik Önemi' : 'Clinical Context'}: </span>
            {currentCase.clinicalContext}
          </div>
        </div>

        {/* Right Stage: Step Execution Visualizer (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Step Header */}
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                  {lang === 'tr' ? `Aşama ${currentStep} / 6` : `Phase ${currentStep} of 6`}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {currentStep === 1 && t.pipeline.step1Title}
                  {currentStep === 2 && t.pipeline.step2Title}
                  {currentStep === 3 && t.pipeline.step3Title}
                  {currentStep === 4 && t.pipeline.step4Title}
                  {currentStep === 5 && t.pipeline.step5Title}
                  {currentStep === 6 && t.pipeline.step6Title}
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">
                {currentStep === 3 ? '0.37s Latency' : 'Online QC'}
              </span>
            </div>

            {/* Step Dynamic Content */}
            <div className="min-h-[280px]">
              {/* STEP 1 */}
              {currentStep === 1 && (
                <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <p>{t.pipeline.step1Desc}</p>
                  <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 flex items-start space-x-3">
                    <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-300">{lang === 'tr' ? 'Temel Problem' : 'The Fundamental Dilemma'}</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {lang === 'tr'
                          ? 'Geleneksel doğrulama yöntemleri Yer Doğrusu (GT) etiketine ihtiyaç duyar. Ancak hastanede taranan yeni hastanın yer doğrusu maskesi yoktur. Kaliteyi ölçmek için yeni bir paradigmaya ihtiyaç vardır!'
                          : 'Conventional evaluation metrics require Ground Truth annotations. In production clinics, no GT exists for newly arriving scans. Quality estimation requires a self-supervised reverse framework.'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-xs block">{lang === 'tr' ? 'Hedef Görüntü' : 'Target Scan'} (I)</span>
                      <span className="font-mono text-cyan-400 font-bold">{currentCase.name}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-xs block">{lang === 'tr' ? 'Aday Segmentasyon' : 'Candidate Mask'} (S_I)</span>
                      <span className="font-mono text-cyan-400 font-bold">{currentPreset.label}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {currentStep === 2 && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-300">{t.pipeline.step2Desc}</p>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-slate-300">{lang === 'tr' ? 'Seçilen En Benzer 8 Referans Vaka (k=8)' : 'Top-8 Retrieved Reference Cases (k=8)'}</span>
                      <span className="text-cyan-400 font-mono text-[11px]">FAISS Cosine Similarity</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {currentCase.referenceImages.map((ref) => (
                        <div key={ref.id} className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-slate-300 truncate max-w-[130px]">{ref.label}</span>
                          <span className="font-mono text-emerald-400 text-[11px]">{(ref.similarity * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 italic">
                    {lang === 'tr'
                      ? 'Makale bulgusu: Rastgele referans seçimi yerine DINOv2 / RAD-DINO benzerlik araması yapmak, gereken referans sayısını 32\'den 8\'e düşürür ve MAE\'yi azaltır.'
                      : 'Paper insight: DINOv2 retrieval augmentation reduces required references from 32 to 8 while improving correlation and reducing MAE.'}
                  </p>
                </div>
              )}

              {/* STEP 3 */}
              {currentStep === 3 && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-300">{t.pipeline.step3Desc}</p>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">{lang === 'tr' ? 'In-Context Prompt Formülasyonu' : 'In-Context Prompt Support Set'}</span>
                      <span className="text-xs font-mono text-cyan-400">S = &#123;(I, S_I)&#125;</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Ters Segmenter</span>
                        <span className="text-cyan-400 font-bold">UniverSeg</span>
                        <span className="text-[10px] text-emerald-400 block mt-0.5">0.37 saniye</span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Alternatif</span>
                        <span className="text-indigo-400 font-bold">SAM 2</span>
                        <span className="text-[10px] text-emerald-400 block mt-0.5">0.70 saniye</span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Klasik RCA</span>
                        <span className="text-rose-400 font-bold">Atlas SAC</span>
                        <span className="text-[10px] text-rose-500 block mt-0.5">60.0 saniye</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 leading-tight">
                      {lang === 'tr'
                        ? 'Model parametreleri dondurulmuştur (ağırlık güncellemesi yok). Model, verilen (I, S_I) çiftine "in-context" bakarak referans görüntüleri anında segmentler.'
                        : 'No gradient updates or retraining required. The foundation model conditions purely on (I, S_I) to segment reference scans instantaneously.'}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {currentStep === 4 && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-300">{t.pipeline.step4Desc}</p>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">{lang === 'tr' ? 'Referans Seti Üzerindeki Dice Dağılımı (Y)' : 'Reference Score Distribution Y'}</span>
                      <span className="font-mono text-cyan-400">k = 8 Skor</span>
                    </div>

                    {/* Visual Bar representation of Y */}
                    <div className="space-y-1.5">
                      {rcaScores.map((score, i) => (
                        <div key={i} className="flex items-center space-x-2 text-xs">
                          <span className="font-mono text-slate-500 w-12">Ref #{i + 1}</span>
                          <div className="flex-1 bg-slate-900 rounded-full h-3.5 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-500"
                              style={{ width: `${score * 100}%` }}
                            />
                          </div>
                          <span className="font-mono text-slate-300 w-10 text-right">{score.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                      <span>Nokta Tahmini (Mean): <strong className="text-white">{pointEst}</strong></span>
                      <span>En Yüksek Skor (Max): <strong className="text-cyan-400">{Math.max(...rcaScores).toFixed(2)}</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5 */}
              {currentStep === 5 && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-300">{t.pipeline.step5Desc}</p>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <span className="text-[11px] text-slate-400 block">Alt Kantil (p_l = 0.3)</span>
                        <span className="text-base font-bold text-amber-400 font-mono">q_l = {qL.toFixed(3)}</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <span className="text-[11px] text-slate-400 block">Üst Kantil (p_h = 0.9)</span>
                        <span className="text-base font-bold text-emerald-400 font-mono">q_h = {qH.toFixed(3)}</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <span className="text-[11px] text-slate-400 block">Kalibrasyon Eşiği</span>
                        <span className="text-base font-bold text-cyan-400 font-mono">q̂ = {qHat.toFixed(3)}</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                      <strong>{lang === 'tr' ? 'Neden Asimetrik Kantiller?' : 'Why Asymmetric Quantiles?'}</strong>{' '}
                      {lang === 'tr'
                        ? 'RCA segmentasyonu doğası gereği kaliteyi olduğundan biraz düşük tahmin etmeye meyillidir. Bu yüzden üst kantil 0.9 gibi yüksek seçilerek daha bilgilendirici hale getirilir (Bölüm IV-B).'
                        : 'RCA inherently tends to underestimate quality, making higher scores more informative. Asymmetric choice (0.3, 0.9) balances coverage and width.'}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6 */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-300">{t.pipeline.step6Desc}</p>
                  
                  {/* Conformal Prediction Interval Output Card */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {lang === 'tr' ? 'Hesaplanan Güven Aralığı C(S_I)' : 'Conformal Interval C(S_I)'}
                      </span>
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 font-semibold">
                        1 - α = 90% Statistical Guarantee
                      </span>
                    </div>

                    <div className="flex items-center justify-center space-x-3 py-2 bg-slate-900/80 rounded-xl border border-slate-800 font-mono text-xl sm:text-2xl font-extrabold">
                      <span className="text-cyan-400">[{lowerBound.toFixed(3)}</span>
                      <span className="text-slate-500">,</span>
                      <span className="text-cyan-400">{upperBound.toFixed(3)}]</span>
                    </div>

                    {/* Bar visualization of interval with Ground Truth marker */}
                    <div className="space-y-1">
                      <div className="relative h-6 bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
                        {/* Clinical rejection zone (< 0.75) */}
                        <div className="absolute left-0 top-0 bottom-0 bg-rose-950/40 border-r border-rose-500/40" style={{ width: '75%' }} />
                        {/* Conformal interval span */}
                        <div
                          className="absolute top-1 bottom-1 bg-cyan-500/30 border-2 border-cyan-400 rounded"
                          style={{
                            left: `${lowerBound * 100}%`,
                            width: `${Math.max(2, (upperBound - lowerBound) * 100)}%`
                          }}
                        />
                        {/* Ground truth real point */}
                        <div
                          className="absolute top-0 bottom-0 w-1.5 bg-emerald-400 shadow-md shadow-emerald-400"
                          style={{ left: `${trueDice * 100}%` }}
                          title={`Gerçek Yer Doğrusu Dice: ${trueDice}`}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>0.0</span>
                        <span className="text-rose-400">Klinik Eşik: 0.75</span>
                        <span className="text-emerald-400">Gerçek Dice: {trueDice}</span>
                        <span>1.0</span>
                      </div>
                    </div>

                    {/* Clinical Decision Banner */}
                    <div className={`p-3 rounded-xl border flex items-center space-x-3 ${
                      isApproved 
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                        : isReview
                        ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                        : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                    }`}>
                      {isApproved && <ShieldCheck className="w-6 h-6 flex-shrink-0 text-emerald-400" />}
                      {isReview && <AlertTriangle className="w-6 h-6 flex-shrink-0 text-amber-400" />}
                      {isRejected && <AlertOctagon className="w-6 h-6 flex-shrink-0 text-rose-400" />}
                      <div>
                        <div className="font-bold text-xs sm:text-sm">
                          {isApproved && t.common.approved}
                          {isReview && t.common.review}
                          {isRejected && t.common.rejected}
                        </div>
                        <p className="text-[11px] opacity-90 mt-0.5">
                          {isApproved && (lang === 'tr' ? 'Alt sınır klinik eşiğin (0.75) üzerinde. Model çıktısı güvenle klinik kullanıma ve raporlamaya aktarılabilir.' : 'Lower bound strictly exceeds 0.75. Safe for automatic clinical pipeline integration.')}
                          {isReview && (lang === 'tr' ? 'Aralık eşiği kesiyor. Radyolog / hekim manuel kontrolü zorunludur.' : 'Interval spans the clinical boundary. Flagged for mandatory physician audit.')}
                          {isRejected && (lang === 'tr' ? 'Kritik alarm! Üst sınır bile eşiğin altında. Hatalı AI segmentasyonu otomatik olarak engellendi.' : 'Critical alarm! Upper bound is below acceptable clinical threshold. Segmentation discarded.')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom stepper navigation button */}
          <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
            <button
              onClick={() => setCurrentStep((p) => Math.max(1, p - 1))}
              disabled={currentStep === 1}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
            >
              {t.common.prev}
            </button>
            <span className="text-slate-400 text-xs">
              {lang === 'tr' ? 'Adım' : 'Step'} {currentStep} / 6
            </span>
            <button
              onClick={() => setCurrentStep((p) => Math.min(6, p + 1))}
              disabled={currentStep === 6}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white font-semibold hover:bg-cyan-500 disabled:opacity-40"
            >
              {t.common.next}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

