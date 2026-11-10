'use client';

import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  ScatterChart,
  Scatter,
  CartesianGrid,
  Cell
} from 'recharts';
import { 
  BarChart2, 
  Sliders, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Target, 
  TrendingUp, 
  HelpCircle,
  Table as TableIcon
} from 'lucide-react';
import { getAvailableDatasets, calibrateDataset, MODEL_NAMES } from '../lib/datasetManager';
import { Language, TRANSLATIONS } from '../lib/translations';

interface BenchmarkTabProps {
  lang: Language;
}

export const BenchmarkTab: React.FC<BenchmarkTabProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const allDatasets = useMemo(() => getAvailableDatasets(), []);

  const [selectedDatasetKey, setSelectedDatasetKey] = useState<string>('jsrt');
  const [selectedModelKey, setSelectedModelKey] = useState<string>('universeg');
  const [targetCoverage, setTargetCoverage] = useState<number>(0.90); // 1 - alpha
  const [pl, setPl] = useState<number>(0.30);
  const [ph, setPh] = useState<number>(0.90);
  const [nRef, setNRef] = useState<number>(8);
  const [clinicalThreshold, setClinicalThreshold] = useState<number>(0.75);

  const currentDataset = allDatasets.find((d) => d.key === selectedDatasetKey) || allDatasets[0];

  // Run live conformal calibration
  const calibrationResult = useMemo(() => {
    try {
      return calibrateDataset(selectedDatasetKey, selectedModelKey, {
        alpha: parseFloat((1 - targetCoverage).toFixed(3)),
        pl,
        ph,
        nRef,
        clinicalThreshold
      });
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [selectedDatasetKey, selectedModelKey, targetCoverage, pl, ph, nRef, clinicalThreshold]);

  // Nonconformity histogram data
  const histData = useMemo(() => {
    if (!calibrationResult) return [];
    const scores = calibrationResult.nonconformityScores.calScores;
    const minVal = Math.min(...scores);
    const maxVal = Math.max(...scores);
    const bins = 15;
    const step = (maxVal - minVal) / bins || 0.05;

    const buckets = Array.from({ length: bins }, (_, i) => ({
      binStart: parseFloat((minVal + i * step).toFixed(2)),
      binEnd: parseFloat((minVal + (i + 1) * step).toFixed(2)),
      rangeLabel: `${(minVal + i * step).toFixed(2)}`,
      count: 0
    }));

    for (const s of scores) {
      const idx = Math.min(bins - 1, Math.max(0, Math.floor((s - minVal) / step)));
      buckets[idx].count++;
    }

    return buckets;
  }, [calibrationResult]);

  // Scatter chart data for test samples
  const scatterData = useMemo(() => {
    if (!calibrationResult) return [];
    return calibrationResult.testPredictions.slice(0, 50).map((p, index) => ({
      index: index + 1,
      yTrue: p.yTrue,
      yPredPoint: p.yPredPoint,
      lb: p.lb,
      ub: p.ub,
      isCovered: p.isCovered,
      width: p.intervalWidth,
      status: p.status
    }));
  }, [calibrationResult]);

  return (
    <div className="space-y-6">
      {/* Title & Context */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-1">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <span>{t.benchmark.title}</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {lang === 'tr' ? '10 Tıbbi Veri Seti & CQR Kalibrasyon Motoru' : '10 Medical Benchmarks & Live CQR Calibration Engine'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              {t.benchmark.subtitle}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Veri Seti:</span>
            <select
              value={selectedDatasetKey}
              onChange={(e) => setSelectedDatasetKey(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-cyan-300 focus:outline-none focus:border-cyan-500"
            >
              {allDatasets.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.name} ({d.modality} - {d.anatomy.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Control Sliders & Configuration Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/90 border border-slate-800 rounded-xl p-4">
        {/* Model Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            {t.benchmark.selectModel}
          </label>
          <select
            value={selectedModelKey}
            onChange={(e) => setSelectedModelKey(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            {Object.entries(MODEL_NAMES).map(([key, info]) => (
              <option key={key} value={key}>
                {info.label}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-emerald-400 block mt-1 font-mono">
            {MODEL_NAMES[selectedModelKey]?.speed}
          </span>
        </div>

        {/* Target Coverage (1 - alpha) Slider */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
            <span>{t.benchmark.alphaSlider}</span>
            <span className="text-cyan-400 font-mono">{(targetCoverage * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.75"
            max="0.99"
            step="0.01"
            value={targetCoverage}
            onChange={(e) => setTargetCoverage(parseFloat(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>75%</span>
            <span>α = {(1 - targetCoverage).toFixed(2)}</span>
            <span>99%</span>
          </div>
        </div>

        {/* Asymmetric Quantiles (pl, ph) */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
            <span>Kantiller [p_l, p_h]:</span>
            <span className="text-amber-400 font-mono">[{pl.toFixed(2)}, {ph.toFixed(2)}]</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400">p_l:</span>
              <input
                type="range"
                min="0.10"
                max="0.45"
                step="0.05"
                value={pl}
                onChange={(e) => setPl(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400">p_h:</span>
              <input
                type="range"
                min="0.70"
                max="0.99"
                step="0.05"
                value={ph}
                onChange={(e) => setPh(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Reference Set Size (k) & Clinical Threshold */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
            <span>{t.benchmark.refSlider}</span>
            <span className="text-indigo-400 font-mono">k = {nRef}</span>
          </div>
          <select
            value={nRef}
            onChange={(e) => setNRef(parseInt(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="2">k = 2 (En Hızlı / Fastest)</option>
            <option value="5">k = 5</option>
            <option value="8">k = 8 (Makale Önerisi / Paper Optimal)</option>
            <option value="10">k = 10</option>
            <option value="25">k = 25</option>
            <option value="32">k = 32 (Conformal Reference Set)</option>
          </select>
        </div>
      </div>

      {/* Real-time Metrics Dashboard */}
      {calibrationResult && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Empirical Coverage */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>{t.benchmark.empiricalCoverage}</span>
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
              {calibrationResult.empiricalCoverage.toFixed(1)}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Hedef: {(calibrationResult.nominalCoverage * 100).toFixed(0)}%
            </div>
          </div>

          {/* Average Width */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>{t.benchmark.avgWidth}</span>
            </div>
            <div className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">
              {calibrationResult.avgWidth.toFixed(3)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              DSC Aralığı [0 - 1]
            </div>
          </div>

          {/* Conformal Cutoff q_hat */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Eşik (q̂ Threshold)</span>
            </div>
            <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
              {calibrationResult.qHat.toFixed(3)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              N_cal = {calibrationResult.nCal}
            </div>
          </div>

          {/* Violations Count */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{t.benchmark.violations}</span>
            </div>
            <div className="text-2xl font-extrabold text-rose-400 font-mono mt-1">
              {calibrationResult.violationsCount} <span className="text-xs font-normal text-slate-400">/ {calibrationResult.nTest}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              İhlal Oranı: {((calibrationResult.violationsCount / calibrationResult.nTest) * 100).toFixed(1)}%
            </div>
          </div>

          {/* Latency */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm col-span-2 md:col-span-1">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>{t.benchmark.latency}</span>
            </div>
            <div className="text-2xl font-extrabold text-indigo-400 font-mono mt-1">
              {selectedModelKey === 'universeg' ? '0.37s' : selectedModelKey === 'atlas-ra' ? '14.2s' : '60.0s'}
            </div>
            <div className="text-[11px] text-emerald-400 mt-0.5">
              {selectedModelKey === 'universeg' ? '162x Hızlandırılmış' : 'Standart'}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Nonconformity Histogram */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>{t.benchmark.nonconformityTitle}</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                s_j = max&#123;q_l(S_j) - y_j, y_j - q_h(S_j)&#125;
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              q̂ = {calibrationResult?.qHat.toFixed(3)}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="rangeLabel" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Conformal Intervals vs True Dice Scatter */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">
                {t.benchmark.scatterTitle}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {lang === 'tr' ? 'Mavi çizgiler güven aralığını, yeşil/kırmızı noktalar gerçek Dice skorunu gösterir' : 'Bars represent conformal intervals; points represent ground truth Dice'}
              </p>
            </div>
            <span className="text-xs text-emerald-400 font-mono">
              r = {calibrationResult?.pearsonR.toFixed(3)}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="index" name="Sample #" stroke="#64748b" fontSize={10} />
                <YAxis dataKey="yTrue" domain={[0, 1]} name="Dice" stroke="#64748b" fontSize={10} />
                <Tooltip
                  content={({ payload }) => {
                    if (!payload || !payload.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-2 rounded shadow text-xs">
                        <div className="font-semibold text-white">Vaka #{data.index}</div>
                        <div className="text-emerald-400 font-mono">Gerçek Dice: {data.yTrue}</div>
                        <div className="text-cyan-400 font-mono">Aralık: [{data.lb}, {data.ub}]</div>
                        <div className={`mt-1 font-semibold ${data.isCovered ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {data.isCovered ? '✓ Kapsandı (Covered)' : '✗ İhlal (Violation)'}
                        </div>
                      </div>
                    );
                  }}
                />
                <Scatter name="Test Samples" data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isCovered ? '#10b981' : '#f43f5e'}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Paper Benchmark Reproduction Table (Table I & Table II) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg overflow-hidden">
        <div className="flex items-center space-x-2 mb-4">
          <TableIcon className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">
            {lang === 'tr' ? 'Makale Tablo 1: 10 Tıbbi Veri Setinde Model Kapsama Oranları Karşılaştırması' : 'Paper Table I: Coverage (%) & Benchmark Comparison Across 10 Datasets'}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase">
                <th className="py-2.5 px-3">Veri Seti (Dataset)</th>
                <th className="py-2.5 px-3">Modalite / Anatomi</th>
                <th className="py-2.5 px-3">N_test / N_cal</th>
                <th className="py-2.5 px-3 text-cyan-400">UniverSeg (ConfIC)</th>
                <th className="py-2.5 px-3 text-indigo-400">SAM 2 (ConfIC)</th>
                <th className="py-2.5 px-3 text-slate-300">Atlas-RA</th>
                <th className="py-2.5 px-3 text-amber-400">Çıkarım Süresi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {allDatasets.map((ds) => {
                const isSelected = ds.key === selectedDatasetKey;
                return (
                  <tr
                    key={ds.key}
                    onClick={() => setSelectedDatasetKey(ds.key)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-cyan-950/40 text-cyan-200' : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <td className="py-2 px-3 font-bold font-sans flex items-center space-x-1.5">
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                      <span>{ds.name}</span>
                    </td>
                    <td className="py-2 px-3 font-sans text-slate-400">{ds.modality} - {ds.anatomy}</td>
                    <td className="py-2 px-3 text-slate-400">{ds.models.universeg?.totalTestCount || 120} / {ds.models.universeg?.totalCalCount || 120}</td>
                    <td className="py-2 px-3 font-bold text-cyan-400">
                      {ds.key === 'hc18' ? '90.0%' : ds.key === 'irca' ? '94.4%' : ds.key === 'jsrt' ? '93.2%' : ds.key === 'nucls' ? '91.8%' : ds.key === 'isic 2018' ? '93.5%' : '90.5%'}
                    </td>
                    <td className="py-2 px-3 font-bold text-indigo-400">
                      {ds.key === 'hc18' ? '87.1%' : ds.key === 'irca' ? '90.5%' : ds.key === 'jsrt' ? '87.1%' : ds.key === 'nucls' ? '91.0%' : ds.key === 'isic 2018' ? '93.5%' : '90.7%'}
                    </td>
                    <td className="py-2 px-3 text-slate-400">
                      {ds.key === 'hc18' ? '89.3%' : ds.key === 'irca' ? '89.3%' : ds.key === 'jsrt' ? '91.3%' : ds.key === 'nucls' ? '90.8%' : ds.key === 'isic 2018' ? '91.0%' : '89.3%'}
                    </td>
                    <td className="py-2 px-3 font-sans text-emerald-400 font-semibold">
                      0.37s <span className="text-[10px] text-slate-500 font-normal">(vs 60s)</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

