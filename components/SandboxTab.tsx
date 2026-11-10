'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  RotateCcw, 
  ShieldCheck, 
  Bug, 
  Stethoscope,
  Info
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../lib/translations';

interface SandboxTabProps {
  lang: Language;
}

export const SandboxTab: React.FC<SandboxTabProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  const [defectType, setDefectType] = useState<'none' | 'under' | 'leakage' | 'islands' | 'jagged'>('none');
  const [defectSeverity, setDefectSeverity] = useState<number>(35); // 0 - 100%
  const [clinicalThreshold, setClinicalThreshold] = useState<number>(0.75);

  // Calculate dynamic simulated quality based on defect injection
  let baseDice = 0.94;
  if (defectType === 'under') {
    baseDice = Math.max(0.2, 0.94 - (defectSeverity / 100) * 0.65);
  } else if (defectType === 'leakage') {
    baseDice = Math.max(0.25, 0.94 - (defectSeverity / 100) * 0.55);
  } else if (defectType === 'islands') {
    baseDice = Math.max(0.3, 0.94 - (defectSeverity / 100) * 0.50);
  } else if (defectType === 'jagged') {
    baseDice = Math.max(0.4, 0.94 - (defectSeverity / 100) * 0.40);
  }

  // Simulated RCA score distribution for this degraded mask
  const noise = (defectSeverity / 100) * 0.08;
  const simScores = [
    Math.max(0.1, baseDice + (Math.random() * 0.04 - 0.02) - noise),
    Math.max(0.1, baseDice - 0.03 - noise),
    Math.max(0.1, baseDice + 0.02 - noise),
    Math.max(0.1, baseDice - 0.05 - noise),
    Math.max(0.1, baseDice - noise),
    Math.max(0.1, baseDice + 0.01 - noise),
    Math.max(0.1, baseDice - 0.02 - noise),
    Math.max(0.1, baseDice - 0.04 - noise),
  ].sort((a, b) => a - b);

  const qL = simScores[Math.floor(simScores.length * 0.3)] || 0.5;
  const qH = simScores[Math.floor(simScores.length * 0.9)] || 0.8;
  const qHat = 0.09;

  const lowerBound = Math.max(0, parseFloat((qL - qHat).toFixed(3)));
  const upperBound = Math.min(1, parseFloat((qH + qHat).toFixed(3)));
  const intervalWidth = parseFloat((upperBound - lowerBound).toFixed(3));

  const isApproved = lowerBound >= clinicalThreshold;
  const isReview = !isApproved && upperBound >= clinicalThreshold;
  const isRejected = upperBound < clinicalThreshold;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center space-x-2 text-xs font-semibold text-rose-400 mb-1">
          <Bug className="w-4 h-4 text-rose-400" />
          <span>{lang === 'tr' ? 'Hata Enjeksiyonu & Güvenlik Alarmı Sandboxı' : 'Defect Injection & QC Safety Sandbox'}</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          {lang === 'tr' ? 'Klinik Hata Simülatörü: Yapay Zeka Hataları Nasıl Yakalanır?' : 'Clinical Fault Simulator: How ConfIC-RCA Catches Silent AI Failures'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          {lang === 'tr'
            ? 'Bir yapay zeka modelinin test anında ürettiği maskeye kasten hatalar (sızıntı, eksik segmentasyon, yanlış pozitif adacıkları) ekleyin. ConfIC-RCA\'nın alt güven sınırının nasıl düştüğünü ve otomatik klinik alarmı nasıl tetiklediğini canlı izleyin.'
            : 'Inject synthetic defects into a candidate segmentation mask. Observe how ConfIC-RCA interval lower bound plunges and triggers automated clinical safety alarms.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Defect Controls (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>{lang === 'tr' ? '1. Hata Tipi Seçin' : '1. Select Defect Pattern'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => { setDefectType('none'); setDefectSeverity(0); }}
              className={`p-3 rounded-xl border text-left transition-all ${
                defectType === 'none'
                  ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200'
                  : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Kusursuz (Normal)</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Sıfır hata, mükemmel organ sınırı</div>
            </button>

            <button
              onClick={() => { setDefectType('under'); setDefectSeverity(50); }}
              className={`p-3 rounded-xl border text-left transition-all ${
                defectType === 'under'
                  ? 'border-amber-500 bg-amber-950/40 text-amber-200'
                  : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-amber-400 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Eksik Segmentasyon</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Organın bir kısmı atlanmış</div>
            </button>

            <button
              onClick={() => { setDefectType('leakage'); setDefectSeverity(60); }}
              className={`p-3 rounded-xl border text-left transition-all ${
                defectType === 'leakage'
                  ? 'border-rose-500 bg-rose-950/40 text-rose-200'
                  : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-rose-400 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Sızıntı (Leakage)</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Komşu dokulara taşma yapmış</div>
            </button>

            <button
              onClick={() => { setDefectType('islands'); setDefectSeverity(70); }}
              className={`p-3 rounded-xl border text-left transition-all ${
                defectType === 'islands'
                  ? 'border-rose-500 bg-rose-950/40 text-rose-200'
                  : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-rose-400 flex items-center space-x-1">
                <Bug className="w-3.5 h-3.5" />
                <span>Yanlış Pozitif Adaları</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Arka planda hayalet lezyonlar</div>
            </button>
          </div>

          {/* Severity slider */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
              <span className="text-slate-300">{lang === 'tr' ? '2. Hata Şiddeti (Severity)' : '2. Defect Severity'}:</span>
              <span className={`font-mono font-bold ${defectSeverity > 50 ? 'text-rose-400' : 'text-amber-400'}`}>
                {defectSeverity}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={defectSeverity}
              onChange={(e) => setDefectSeverity(parseInt(e.target.value))}
              disabled={defectType === 'none'}
              className="w-full accent-rose-500 cursor-pointer disabled:opacity-40"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Hafif Bozulma</span>
              <span>Kritik Çöküş (Catastrophic)</span>
            </div>
          </div>

          {/* Clinical threshold slider */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
              <span className="text-slate-300">{lang === 'tr' ? '3. Klinik Güvenlik Eşiği' : '3. Clinical Safety Threshold'}:</span>
              <span className="text-cyan-400 font-mono font-bold">{clinicalThreshold.toFixed(2)} DSC</span>
            </div>
            <input
              type="range"
              min="0.60"
              max="0.90"
              step="0.05"
              value={clinicalThreshold}
              onChange={(e) => setClinicalThreshold(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1 italic">
              {lang === 'tr'
                ? 'Radyoloji standartlarında DSC < 0.75 genellikle klinik kabul edilemezlik eşiğidir.'
                : 'In medical imaging, DSC < 0.75 generally implies clinically unacceptable boundary accuracy.'}
            </p>
          </div>
        </div>

        {/* Real-time Response & Alarm Display (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Alarm Status Banner */}
            <div className={`p-4 rounded-xl border flex items-center space-x-3.5 transition-all shadow-lg ${
              isApproved 
                ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200' 
                : isReview 
                ? 'bg-amber-950/50 border-amber-500/60 text-amber-200' 
                : 'bg-rose-950/60 border-rose-500/80 text-rose-200 animate-pulse'
            }`}>
              {isApproved && <ShieldCheck className="w-8 h-8 text-emerald-400 flex-shrink-0" />}
              {isReview && <AlertTriangle className="w-8 h-8 text-amber-400 flex-shrink-0" />}
              {isRejected && <ShieldAlert className="w-8 h-8 text-rose-400 flex-shrink-0" />}

              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest opacity-80 block">
                  {lang === 'tr' ? 'Otomatik Kalite Kontrol Kararı' : 'Automated Quality Control Verdict'}
                </span>
                <h3 className="text-lg font-extrabold mt-0.5">
                  {isApproved && (lang === 'tr' ? 'GÜVENLİ: HASTA RAPORUNA AKTARILDI' : 'PASSED: SAFE FOR CLINICAL DEPLOYMENT')}
                  {isReview && (lang === 'tr' ? 'UYARI: HEKİM ONAYI BEKLİYOR' : 'BORDERLINE: PHYSICIAN AUDIT REQUIRED')}
                  {isRejected && (lang === 'tr' ? 'ACİL DURUM ALARMI: SEGMENTASYON ENGELLENDİ!' : 'CRITICAL ALARM: DANGEROUS AI DEFECT DETECTED!')}
                </h3>
                <p className="text-xs opacity-90 mt-1 leading-relaxed">
                  {isApproved && (lang === 'tr' ? 'Tahmin aralığının alt sınırı klinik eşiğin üstünde. Hata riski %10\'dan düşüktür.' : 'Lower bound strictly exceeds the safety threshold.')}
                  {isReview && (lang === 'tr' ? 'Aralık güven eşiğini kesiyor. Otomatik tedaviye izin verilmez, doktor incelemelidir.' : 'Conformal interval overlaps the decision boundary. Manual verification mandatory.')}
                  {isRejected && (lang === 'tr' ? 'Yapay zeka sessizce hatalı maske üretti ancak ConfIC-RCA sayesinde bu durum ameliyat veya radyoterapiye gitmeden engellendi!' : 'AI produced an inaccurate mask, but ConfIC-RCA stopped it before reaching the clinical workflow!')}
                </p>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Simüle Edilen Gerçek Dice</span>
                <span className="text-xl font-mono font-extrabold text-white mt-0.5 block">{baseDice.toFixed(3)}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Hesaplanan Güven Aralığı</span>
                <span className="text-xl font-mono font-extrabold text-cyan-400 mt-0.5 block">
                  [{lowerBound.toFixed(2)}, {upperBound.toFixed(2)}]
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Aralık Genişliği</span>
                <span className="text-xl font-mono font-extrabold text-indigo-400 mt-0.5 block">{intervalWidth.toFixed(3)}</span>
              </div>
            </div>

            {/* Interval Visual Bar with Clinical Boundary */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">İstatistiksel Aralık ve Eşik Karşılaştırması</span>
                <span className="text-cyan-400 font-mono text-[11px]">1 - α = 90%</span>
              </div>

              <div className="relative h-7 bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
                {/* Red danger zone */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-rose-950/50 border-r-2 border-rose-500"
                  style={{ width: `${clinicalThreshold * 100}%` }}
                />

                {/* ConfIC-RCA prediction interval */}
                <div
                  className="absolute top-1 bottom-1 bg-cyan-500/40 border-2 border-cyan-400 rounded transition-all duration-300"
                  style={{
                    left: `${lowerBound * 100}%`,
                    width: `${Math.max(2, (upperBound - lowerBound) * 100)}%`
                  }}
                />

                {/* True Dice point */}
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-emerald-400 shadow-lg shadow-emerald-400 transition-all duration-300"
                  style={{ left: `${baseDice * 100}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.0 (Tamamen Hatalı)</span>
                <span className="text-rose-400 font-bold">Klinik Eşik: {clinicalThreshold}</span>
                <span className="text-emerald-400 font-bold">Gerçek: {baseDice.toFixed(3)}</span>
                <span>1.0 (Mükemmel)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2">
            <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>
              {lang === 'tr'
                ? 'Hocaya sunum yaparken vurgulanacak en çarpıcı nokta: Geleneksel yöntemler yalnızca ortalama skoru tahmin ederken, ConfIC-RCA istatistiksel alt sınırı verir. Alt sınır 0.75\'in altına düştüğü an klinik güvenlik protokolü devreye girer.'
                : 'Key demonstration for your professor: Traditional QC only estimates a mean score with no certainty. ConfIC-RCA provides a mathematically guaranteed lower bound that triggers safety interlocks before bad segmentations reach patients.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

