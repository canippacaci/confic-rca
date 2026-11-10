'use client';

import React from 'react';
import { BookOpen, CheckCircle2, FileText, ArrowRight, Sparkles, Shield, Cpu } from 'lucide-react';
import { Language } from '../lib/translations';

interface TheoryTabProps {
  lang: Language;
}

export const TheoryTab: React.FC<TheoryTabProps> = ({ lang }) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>IEEE TMI 2025 / arXiv:2503.04522</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {lang === 'tr'
            ? 'ConfIC-RCA: Matematiksel Temeller ve Makale Teorisi'
            : 'ConfIC-RCA: Mathematical Foundations & Core Theory'}
        </h1>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          {lang === 'tr'
            ? 'Bu bölümde makalede önerilen iki temel yeniliğin (In-Context RCA ve Conformal RCA) matematiksel formülasyonu, teoremleri ve çalışma prensipleri detaylandırılmıştır.'
            : 'Detailed mathematical formulations, theorems, and proofs underlying In-Context RCA and Conformal RCA.'}
        </p>
      </div>

      {/* Section 1: The Core Problem & Classical RCA */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-bold">1</span>
          <span>{lang === 'tr' ? 'Tıbbi Yapay Zekada Kalite Kontrolü & Klasik RCA' : 'Medical Segmentation QC & Classical RCA'}</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {lang === 'tr'
            ? 'Klinik ortama yerleştirilen bir segmentasyon modelinin başarısını izlemek son derece zordur çünkü test anında yeni gelen hasta için uzman yer doğrusu (Ground Truth - GT) bulunmaz. Reverse Classification Accuracy (RCA), yeni görüntünün tahminini yalancı yer doğrusu (pseudo-GT) kabul ederek bir ters sınıflandırıcı eğitir ve bunu bilinen bir referans veritabanı D = {(J_i, S_GT_{J_i})}_{i=1}^m üzerinde test eder.'
            : 'In clinical deployment, monitoring segmentation quality is challenging due to the lack of ground-truth annotations for unseen patients. Reverse Classification Accuracy (RCA) trains a reverse segmenter using the predicted mask as pseudo-ground truth and evaluates it against annotated reference images.'}
        </p>

        {/* Equations 1 & 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
            <span className="text-slate-400 font-sans font-semibold block text-[11px]">Denklem (1): Referans Skor Kümesi Y</span>
            <div className="text-cyan-400 text-sm py-2">
              Y = &#123; y^(k)(S_I) = ρ(S_&#123;J_k&#125;, S_&#123;J_k&#125;^&#123;GT&#125;) &#125;_&#123;k=1&#125;^m
            </div>
            <p className="text-slate-400 font-sans text-[11px]">
              Ters segmenterin referans görüntüler üzerindeki Dice benzerlik skoru dağılımı.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
            <span className="text-slate-400 font-sans font-semibold block text-[11px]">Denklem (2): Geleneksel RCA Nokta Tahmini</span>
            <div className="text-amber-400 text-sm py-2">
              ρ̂(S_I) = max_k ρ(S_&#123;J_k&#125;, S_&#123;J_k&#125;^&#123;GT&#125;)
            </div>
            <p className="text-slate-400 font-sans text-[11px]">
              Klasik RCA bu dağılımın maksimumunu alarak tek bir sayı verir; hata payı veya güven aralığı içermez!
            </p>
          </div>
        </div>

        <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl text-xs text-rose-300">
          <strong>Klasik RCA\'nın İki Temel Çıkmazı:</strong> 1) Her test görüntüsü için Atlas hizalaması veya yeniden model eğitimi ~60 saniye sürer. 2) Tek bir skaler nokta tahmini üretir, istatistiksel belirsizliği modelleyemez.
        </div>
      </div>

      {/* Section 2: Split Conformal Prediction */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-bold">2</span>
          <span>{lang === 'tr' ? 'Split Conformal Prediction & İstatistiksel Teorem 1' : 'Split Conformal Prediction & Theorem 1'}</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {lang === 'tr'
            ? 'Conformal Prediction (CP), modelden ve veri dağılımından bağımsız (distribution-free) olarak, kullanıcı tarafından seçilen 1 - α (ör. %90) güven seviyesinde kesin istatistiksel geçerliliğe sahip tahmin aralıkları üretir.'
            : 'Conformal Prediction (CP) is a distribution-free framework that constructs prediction intervals with rigorous finite-sample coverage guarantees at user-specified significance level 1 - alpha.'}
        </p>

        {/* Theorem Card */}
        <div className="bg-slate-950 p-5 rounded-xl border border-cyan-500/40 space-y-3">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>{lang === 'tr' ? 'Teorem 1: Kapsama Garantisi (Coverage Guarantee)' : 'Theorem 1: Finite-Sample Marginal Coverage'}</span>
          </div>
          <div className="font-mono text-sm text-white bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-center">
            P( Y_&#123;n+1&#125; ∈ C_α(X_&#123;n+1&#125;) ) ≥ 1 - α
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {lang === 'tr'
              ? 'Kalibrasyon ve test örnekleri aynı dağılımdan (exchangeable / i.i.d.) geldiği sürece, modelin mimarisi ne olursa olsun, gerçek kalitenin tahmin edilen güven aralığı içinde kalma olasılığı matematiksel olarak en az %90\'dır.'
              : 'Under the exchangeability assumption, the true label Y lies within the conformal prediction region with probability at least 1 - alpha.'}
          </p>
        </div>
      </div>

      {/* Section 3: ConfIC-RCA Empirical CQR */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-bold">3</span>
          <span>{lang === 'tr' ? 'Önerilen Metot: Empirik CQR ile Aralık Oluşturma' : 'Proposed Method: Empirical CQR Interval Construction'}</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {lang === 'tr'
            ? 'Ayrı bir kantil regresyon ağı eğitmek yerine, makale kantilleri doğrudan RCA referans skor dağılımından Y hesaplar. Kalibrasyon setinde uyumsuzluk skorları (nonconformity) hesaplanır:'
            : 'Rather than training a separate quantile regression network, ConfIC-RCA estimates quantiles directly from the RCA distribution Y, ensuring both computational speed and natural uncertainty capture:'}
        </p>

        {/* Equations 4 & 5 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
            <span className="text-slate-400 font-sans font-semibold block text-[11px]">Denklem (4): Uyumsuzluk Skoru (Nonconformity Score)</span>
            <div className="text-indigo-400 text-sm py-2">
              s_j = max &#123; q_l(S_&#123;I_j&#125;^C) - y_j , y_j - q_h(S_&#123;I_j&#125;^C) &#125;
            </div>
            <p className="text-slate-400 font-sans text-[11px]">
              Gerçek skorun alt kantilden ne kadar aşağıda veya üst kantilden ne kadar yukarıda kaldığını ölçer.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
            <span className="text-slate-400 font-sans font-semibold block text-[11px]">Denklem (5): Kalibre Edilmiş Tahmin Aralığı</span>
            <div className="text-emerald-400 text-sm py-2">
              C(S_I) = [ q_l(S_I) - q̂ , q_h(S_I) + q̂ ]
            </div>
            <p className="text-slate-400 font-sans text-[11px]">
              q̂, kalibrasyon uyumsuzluk skorlarının ⌈(1-α)(1+1/n)⌉-inci kantilidir. Aralık [0, 1] arasına kırpılır.
            </p>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
          <div className="font-bold text-amber-300 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Neden Asimetrik Kantiller (p_l = 0.3, p_h = 0.9)?</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Makalenin Şekil 5\'teki Pareto analizi göstermektedir ki simetrik kantiller (ör. 0.1, 0.9) yerine p_l = 0.3 ve p_h = 0.9 seçmek aralık genişliğini daraltırken %90 hedef kapsama seviyesini korur. Çünkü RCA doğası gereği kaliteyi hafifçe düşük tahmin etme eğilimindedir.
          </p>
        </div>
      </div>

      {/* Section 4: In-Context Learning & DINOv2 Retrieval */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-bold">4</span>
          <span>{lang === 'tr' ? 'In-Context RCA ve DINOv2 / RAD-DINO Geri-Getirimi' : 'In-Context RCA & Retrieval Augmentation'}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="font-bold text-cyan-400 flex items-center space-x-1.5">
              <Cpu className="w-4 h-4" />
              <span>In-Context Ters Segmenter (UniverSeg / SAM 2)</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Test görüntüsü ve tahmin (I, S_I) model için örnek (prompt / support) olur. Model hiç ağırlık güncellemesi yapmadan referans görüntüleri segmentler. Bu sayede süre 60 saniyeden 0.37 saniyeye düşer!
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="font-bold text-emerald-400 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Retrieval-Augmentation (DINOv2 + FAISS)</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Rastgele referans görüntü seçmek yerine DINOv2 / RAD-DINO latent vektörleri üzerinden FAISS kosinüs araması yapılır. Sadece 8 referans görüntüyle bile yüksek korelasyon elde edilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

