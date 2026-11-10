# ConfIC-RCA: Conformal In-Context Reverse Classification Accuracy
### Statistically Grounded Efficient Estimation of Segmentation Quality

> **IEEE Transactions on Medical Imaging (TMI) / arXiv:2503.04522**  
> **Interactive Web Demonstration & Academic Defense Platform**

---

## 🌟 Proje Özeti (Executive Summary)

Tıbbi görüntüleme yapay zekasında (Röntgen, BT, MR, Ultrason, Mikroskopi) bir segmentasyon modeli klinik ortama kurulduğunda, **test anında yeni gelen hasta için uzman Yer Doğrusu (Ground Truth) etiketleri bulunmaz**. Bu durum, modelin beklenmeyen anatomik değişikliklerde veya cihaz farklılıklarında sessizce hata yapması durumunda tespit edilememesi riskini doğurur.

**ConfIC-RCA**, yer doğrusu olmadan bir yapay zeka modelinin ürettiği segmentasyon kalitesini **istatistiksel garantili güven aralıklarıyla** ve **gerçek zamanlı (0.37 saniye)** olarak tahmin eden yenilikçi bir çerçevedir.

Bu proje, makalede sunulan iki temel yeniliği birebir çalıştırmakta ve görselleştirmektedir:
1. **In-Context RCA (Ters Sınıflandırma):**
   - Yeniden model eğitmek veya 60 saniye süren Atlas hizalaması (B-Spline) yapmak yerine, **UniverSeg** ve **SAM 2** gibi In-Context segmentasyon modellerini kullanır.
   - **RAD-DINO / DINOv2** latent gömmeleri ve **FAISS** kosinüs benzerliği ile referans veri tabanından sadece en alakalı $k=8$ görüntü dinamik olarak getirilir.
   - **162 Kat Hızlanma:** Geleneksel Atlas RCA 60 saniye sürerken, UniverSeg **0.37 saniyede** sonucu hesaplar!
2. **Conformal RCA (Split Conformal Prediction):**
   - Tek bir kırılgan nokta tahmini (nokta skoru) yerine, **Conformalized Quantile Regression (CQR)** ile asimetrik kantiller ($p_l = 0.3, p_h = 0.9$) ve kalibrasyon eşiği $\hat{q}$ hesaplar.
   - **Matematiksel Garanti:** $\mathbb{P}(Y \in C(S_I)) \ge 1 - \alpha$ (%90 nominal güven seviyesi).
   - Alt sınır klinik güvenlik eşiğinin ($\text{DSC} < 0.75$) altına düştüğü an **otomatik klinik alarm** tetiklenir.

---

## 🚀 Canlı Web Uygulamasının Özellikleri

Web uygulaması **Next.js (App Router)**, **Tailwind CSS**, **Recharts** ve **Lucide Icons** ile geliştirilmiş olup Vercel üzerinde tek tıkla canlıya alınabilir:

1. **🔬 İnteraktif Pipeline (6 Aşamalı Görsel Akış):**
   - Akciğer Röntgeni (JSRT), Karaciğer BT (3D-IRCAdB), Cilt Kanseri Dermoskopi (ISIC 2018) ve Fetal Ultrason (HC18) vakaları.
   - Yüksek, sınırda ve kritik hata maske simülasyonları.
   - DINOv2 benzerlik araması, In-Context ters segmentasyon, skor dağılımı ve Conformal Güven Aralığı çıkışı.
2. **📊 10 Tıbbi Veri Seti & CQR Kalibratör:**
   - Makaledeki 10 veri setinin (HC18, 3D-IRCAdB, ISIC 2018, JSRT, NuCLS, PH2, PSFHS, SCD, WBC-CV, WBC-JTSC) gerçek kalibrasyon ve test sonuçları.
   - Canlı $\alpha$, $p_l$, $p_h$ ve $k$ parametre optimizasyonu.
   - Uyumsuzluk skoru ($s_j$) histogramı ve test güven aralığı dağılım grafikleri.
3. **🧪 Hata & Güvenlik Sandboxı (Clinical Interlock):**
   - Maskeye sızıntı, eksik segmentasyon veya yanlış pozitif adacıkları ekleyerek otomatik klinik alarmın nasıl çalıştığını canlı test edin.
4. **📐 Makale Teorisi & Matematiksel Formülasyon:**
   - Denklem (1) - (5), Teorem 1 Kapsama Garantisi ve asimetrik kantil Pareto analizi.
5. **🎓 Hoca Sunum Modu (Academic Defense Mode):**
   - Hocanıza slayt slayt sunum yapabileceğiniz, konuşmacı notları ve kilit cümleler içeren hazır sunum rehberi.
6. **🌐 Türkçe 🇹🇷 / İngilizce 🇬🇧 Çift Dil Desteği:**
   - Tek tıkla diller arası geçiş.

---

## 💻 Yerel Kurulum ve Çalıştırma (Local Setup)

### 1. Web Uygulamasını Başlatma
```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```
Tarayıcınızda `http://localhost:3000` adresini açarak uygulamayı kullanabilirsiniz.

### 2. Terminalden CLI Benchmark Çalıştırma (Node.js)
```bash
# JSRT veri setinde UniverSeg kalibrasyonu
node confic_rca_demo.js jsrt universeg 0.10

# Fetal Ultrason (HC18) veri setinde kalibrasyon
node confic_rca_demo.js hc18 universeg 0.10
```

### 3. Python ile Çalıştırma
```bash
python confic_rca_demo.py --dataset jsrt --model universeg --alpha 0.10
```

---

## ☁️ GitHub'a Push ve Vercel'e Dağıtım (Deploy to Vercel)

Proje Vercel için tamamen optimize edilmiştir (`npm run build` ile statik CDN çıktısı hazırlandı).

### Adım 1: GitHub'a Gönderme
```bash
# Git deposunu başlatın
git init
git add .
git commit -m "feat: ConfIC-RCA interactive web platform and paper reproduction"

# Kendi GitHub deponuzu ekleyin ve pushlayın:
git branch -M main
git remote add origin https://github.com/<KULLANICI_ADINIZ>/<REPO_ADINIZ>.git
git push -u origin main
```

### Adım 2: Vercel'e Dağıtma (1 Dakika)
1. [vercel.com](https://vercel.com) adresine gidin ve GitHub hesabınızla giriş yapın.
2. **"Add New Project"** butonuna tıklayın.
3. GitHub'a pushladığınız depoyu seçin (`confic-rca` veya verdiğiniz isim).
4. Vercel projeyi otomatik olarak **Next.js** olarak algılayacaktır.
5. **"Deploy"** butonuna basın!
6. Birkaç saniye içinde `https://projeniz.vercel.app` şeklinde canlı URL'niz hazır olacaktır. Bu bağlantıyı doğrudan hocanıza gönderebilirsiniz!

---

## 📖 Makale Künyesi (Citation)

```bibtex
@article{cosarinsky2025conformalincontextreverseclassification,
  title={Conformal In-Context Reverse Classification Accuracy: Efficient Estimation of Segmentation Quality with Statistical Guarantees}, 
  author={Matias Cosarinsky and Ramiro Billot and Lucas Mansilla and Gabriel Jimenez and Nicolas Gaggion and Guanghui Fu and Tom Tirer and Enzo Ferrante},
  journal={IEEE Transactions on Medical Imaging (TMI)},
  year={2025},
  eprint={2503.04522},
  archivePrefix={arXiv},
  primaryClass={cs.CV}
}
```
