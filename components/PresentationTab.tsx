'use client';

import React, { useState } from 'react';
import { 
  GraduationCap, 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Zap, 
  Sparkles, 
  Cpu, 
  Target,
  FileCheck
} from 'lucide-react';
import { Language } from '../lib/translations';

interface PresentationTabProps {
  lang: Language;
}

export const PresentationTab: React.FC<PresentationTabProps> = ({ lang }) => {
  const [currentSlide, setCurrentSlide] = useState<number>(1);

  const slides = [
    {
      num: 1,
      tag: 'Klinik Motivasyon & Problem',
      title: 'Tıbbi Yapay Zekada Yer Doğrusu (Ground Truth) Yokluğu',
      subtitle: 'Hastanelerde çalışan segmentasyon modellerinin ürettiği çıktılar ne kadar güvenilir?',
      bullets: [
        'Klinik uygulamada (radyoloji, onkoloji, kardiyoloji) yeni bir hasta taraması geldiğinde, o görüntünün uzman tarafından çizilmiş "Yer Doğrusu" (Ground Truth) etiketine sahip değiliz.',
        'Yapay zeka modelleri dağılım kayması (distribution shift), cihaz farklılıkları veya hasta anatomisi nedeniyle sessizce çökebilir ve tamamen yanlış segmentasyonlar üretebilir.',
        'Bu hatalar fark edilmezse radyoterapide sağlıklı dokunun ışınlanmasına veya cerrahide yanlış doku rezeksiyonuna yol açabilir.',
        'Temel Hedef: Test anında YER DOĞRUSU OLMADAN, modelin ürettiği kalitenin kesin sınırlarını belirleyebilmek.'
      ],
      speakerNote: 'Hocam, buradaki temel sorun şu: Modeli eğitirken test metriklerini hesaplayabiliyoruz çünkü etiket var; ama model hastanede canlıya alındığında hiçbir hastanın etiketi yok. Modelin o anki hastada doğru mu yanlış mı çalıştığını bilmeden karar vermek çok tehlikeli.',
      highlight: 'Test anında Yer Doğrusu YOK: Otomatik Kalite Kontrolü (QC) Zorunludur.'
    },
    {
      num: 2,
      tag: 'Mevcut Yaklaşımların Çıkmazı',
      title: 'Klasik RCA ve Belirsizlik Yöntemlerinin Sınırları',
      subtitle: 'Önceki yöntemler neden klinik gerçekliğe uyarlanamıyordu?',
      bullets: [
        'Klasik Reverse Classification Accuracy (RCA): Test maskesini kullanarak bir model eğitir veya karmaşık Atlas hizalaması (B-Spline) yapar.',
        'Hız Problemi: Tek bir görüntünün kalitesini tahmin etmek tam 60 saniye sürmektedir. Acil klinik akışlar için tamamen kullanışsızdır.',
        'İstatistiksel Belirsizlik Yok: Klasik RCA sadece tek bir skaler sayı (ortalama veya maksimum skor) verir. Bu tahmine ne kadar güvenebiliriz? Cevap yok!',
        'MC-Dropout / TTA Gibi Yöntemler: Sadece piksel seviyesinde varyans üretir; görüntü seviyesinde klinik kararı destekleyecek garantili bir aralık veremez.'
      ],
      speakerNote: 'Hocam, klasik RCA literatürde vardı ancak her görüntü için elastik kayıt (B-Spline registration) yaptığı için resim başına 60 saniye bekletiyordu. Ayrıca sadece "tahmini dice 0.80" diyordu ama bu 0.80\'in etrafındaki güven aralığı nedir sorusuna cevap veremiyordu.',
      highlight: 'Klasik RCA: 60 saniye işlem süresi + Sıfır güven aralığı garantisi.'
    },
    {
      num: 3,
      tag: 'Makalenin Çözümü (ConfIC-RCA)',
      title: 'İki Çığır Açıcı Yenilik: In-Context RCA & Conformal RCA',
      subtitle: 'Hem 162 kat daha hızlı hem de istatistiksel garantili tahmin aralıkları',
      bullets: [
        '1. Yenilik (In-Context RCA): Yeniden model eğitmek veya Atlas hizalamak yerine, UniverSeg ve SAM 2 gibi In-Context segmentasyon modelleri kullanılır. (I, S_I) çifti modele "prompt" olarak verilir. Süre 60 saniyeden 0.37 saniyeye düşer!',
        '2. Yenilik (Retrieval-Augmentation): DINOv2 / RAD-DINO latent vektörleri ve FAISS kosinüs benzerliği ile sadece en alakalı k=8 referans taranır. Veritabanı arama yükü %75 azalır.',
        '3. Yenilik (Conformal RCA): Split Conformal Prediction (CQR) ile empirik kantiller (0.3, 0.9) ve kalibrasyon eşiği q̂ hesaplanır. Böylece [lb, ub] şeklinde kesin bir güven aralığı elde edilir.',
        'Teorem 1 Garantisi: True DSC skoru en az %90 olasılıkla bu aralığın içindedir.'
      ],
      speakerNote: 'Hocam, makalenin yaptığı devrim tam olarak bu: Foundation modellerin (UniverSeg ve SAM 2) in-context öğrenme yeteneğini kullanarak modeli hiç eğitmeden 0.37 saniyede ters sınıflama yapıyor; ardından Conformal Prediction ile %90 matematiksel garantili güven aralığı veriyor.',
      highlight: '0.37s Latency (162x Hızlanma) + Dağılımdan Bağımsız %90 Güven Garantisi.'
    },
    {
      num: 4,
      tag: 'Klinik Güvenlik Protokolü',
      title: 'Hatalı Maskelerin Otomatik Olarak Engellenmesi',
      subtitle: 'Trafik Işığı Sistemi: Onay, İnceleme ve Acil Durum Reddi',
      bullets: [
        '🟢 ONAYLANDI (Approved): Alt sınır lb ≥ 0.75 ise, model çıktısı güvenlidir ve doğrudan hekime / radyoterapi planlamasına aktarılır.',
        '🟡 UYARI / İNCELEME (Audit Required): Üst sınır ub ≥ 0.75 fakat alt sınır lb < 0.75 ise, sistem risk tespit etmiştir; hekimin manuel onayı zorunlu kılınır.',
        '🔴 REDDEDİLDİ (Rejected): Üst sınır dahi ub < 0.75 ise, sistem kritik bir yapay zeka çöküşü (hallucination / leakage) yakalamıştır ve maskeyi otomatik bloke eder.',
        'Neden Nokta Tahmini Değil Güven Aralığı? Nokta tahmini 0.76 dese bile gerçek değer 0.50 olabilir. Ancak güven aralığının alt sınırı 0.50\'yi gösterdiği anda sistem hekimi uyarır!'
      ],
      speakerNote: 'Hocam, klasik yöntemler tek bir sayı verdiği için sistem yanılıp ameliyata yanlış maske gönderebilirdi. Fakat ConfIC-RCA ile aralığın alt sınırı 0.75\'in altına düştüğü an otomatik kırmızı alarm devreye girer.',
      highlight: 'Klinik Eşik İnterlok Mekanizması: Sessiz yapay zeka hatalarına sıfır tolerans.'
    },
    {
      num: 5,
      tag: 'Deneysel Doğrulama',
      title: '10 Tıbbi Veri Setinde Kapsamlı Başarım & Sonuçlar',
      subtitle: 'Akciğer, Karaciğer, Kalp, Fetal Baş, Cilt Lezyonları ve Hücre Mikroskopisi',
      bullets: [
        'Doğrulanan 10 Veri Seti: JSRT (X-Ray), 3D-IRCAdB (CT), ISIC 2018 & PH2 (Dermoskopi), HC18 & PSFHS (Ultrason), SCD (MR), NuCLS (Histopatoloji), WBC-CV & WBC-JTSC (Mikroskopi).',
        'Empirik Kapsama Oranı: %90 hedef seviyesinde tüm veri setlerinde ortalama %90.2 - %94.4 kapsama oranı elde edilmiştir.',
        'Aralık Sıkılığı (Efficiency): Atlas yöntemine göre benzer hatta daha sıkı aralıklar üretilirken, hesaplama yükü iki mertebe düşürülmüştür.',
        'Düzensiz Dokularda Üstünlük: Klasik Atlas yönteminin tamamen çöktüğü NuCLS histopatoloji veri setinde, SAM 2 tabanlı ConfIC-RCA 0.76 korelasyon yakalamıştır.'
      ],
      speakerNote: 'Hocam, çalışma sadece tek bir organda değil; BT, MR, Röntgen, Ultrason ve Mikroskopi olmak üzere tam 10 farklı modalitede ve binlerce hastada doğrulanmıştır. Her birinde %90 nominal kapsamayı tutturmuştur.',
      highlight: '10 Modalitede Tutarlı %90+ Kapsama ve 0.76+ Korelasyon.'
    },
    {
      num: 6,
      tag: 'Sonuç ve Katkılar',
      title: 'Özet, Klinik Katkı ve Vercel Üzerinde Canlı Dağıtım',
      subtitle: 'Akademik proje sunumu ve canlı demonstrasyon özeti',
      bullets: [
        'ConfIC-RCA, tıbbi görüntüleme kalite kontrolünde hem hız hem de istatistiksel güvenceyi ilk defa birleştiren model-agnostik bir çerçevedir.',
        'Web Platformu: Bu projeyi hocaya sunmak, interaktif parametreleri canlı değiştirmek ve tüm veri setlerini anlık incelemek için bu interaktif Next.js platformu geliştirilmiştir.',
        'Canlı Vercel Dağıtımı: Kod tabanı Git ve Vercel ile entegre edilerek tek bir URL üzerinden mobil veya masaüstünde kesintisiz çalışacak şekilde tasarlanmıştır.',
        'Açık Kaynak Kod & Doğrulanabilirlik: Makalenin resmi PyTorch ağırlıkları ve kalibrasyon sonuçları ile %100 uyumludur.'
      ],
      speakerNote: 'Hocam, bu web uygulamasını hazırlamamızın sebebi, makaledeki formüllerin ve sonuçların sadece kağıt üzerinde kalmadığını; canlı, parametrik ve tıklanabilir bir klinik kalite kontrol arayüzü olarak nasıl çalıştığını size birebir gösterebilmektir.',
      highlight: 'Teoriden Canlı Üretime: Vercel üzerinde tek tıkla çalışan klinik demonstratör.'
    }
  ];

  const current = slides[currentSlide - 1];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400 mb-1">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>{lang === 'tr' ? 'Akademik Sunum & Tez Savunma Modu' : 'Academic Defense & Presentation Mode'}</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {lang === 'tr' ? 'Hoca Sunum Rehberi: Adım Adım Savunma Slaytları' : 'Professor Presentation Walkthrough: Step-by-Step Defense'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'tr'
              ? 'Hocanıza sunum yaparken kullanabileceğiniz yapılandırılmış slaytlar ve doğrudan söyleyebileceğiniz vurgu notları.'
              : 'Structured presentation slides with live defense notes tailored for academic review.'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentSlide((p) => Math.max(1, p - 1))}
            disabled={currentSlide === 1}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-amber-400 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            Slayt {currentSlide} / {slides.length}
          </span>
          <button
            onClick={() => setCurrentSlide((p) => Math.min(slides.length, p + 1))}
            disabled={currentSlide === slides.length}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Slide Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Slide Header */}
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/40">
              {current.tag}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Bölüm {current.num}
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {current.title}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {current.subtitle}
          </p>
        </div>

        {/* Slide Bullets */}
        <div className="space-y-3.5">
          {current.bullets.map((b, i) => (
            <div key={i} className="flex items-start space-x-3 text-sm text-slate-200 leading-relaxed">
              <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
              <span>{b}</span>
            </div>
          ))}
        </div>

        {/* Highlight Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-950 to-indigo-950/40 border border-cyan-500/30 flex items-center space-x-3">
          <Zap className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <div className="text-xs sm:text-sm font-semibold text-cyan-300">
            {current.highlight}
          </div>
        </div>

        {/* Speaker Note Box (What to say to the professor) */}
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Hocaya Sunarken Söylenecek Kilit Cümle (Speaker Note)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
            &ldquo;{current.speakerNote}&rdquo;
          </p>
        </div>

        {/* Slide navigation footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
          <button
            onClick={() => setCurrentSlide((p) => Math.max(1, p - 1))}
            disabled={currentSlide === 1}
            className="flex items-center space-x-1 text-slate-400 hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Önceki Slayt</span>
          </button>

          <div className="flex space-x-1.5">
            {slides.map((s) => (
              <button
                key={s.num}
                onClick={() => setCurrentSlide(s.num)}
                className={`w-3 h-3 rounded-full transition-all ${
                  currentSlide === s.num
                    ? 'bg-amber-400 ring-4 ring-amber-500/20 w-6'
                    : 'bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide((p) => Math.min(slides.length, p + 1))}
            disabled={currentSlide === slides.length}
            className="flex items-center space-x-1 text-amber-400 hover:text-amber-300 disabled:opacity-30 font-semibold"
          >
            <span>Sonraki Slayt</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
