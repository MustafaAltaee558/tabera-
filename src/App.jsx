import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search, CheckCircle2, XCircle, ChevronRight, ChevronLeft, X,
  Info, ShieldCheck, Flame, Bell, Wind, HardHat, Droplets,
  Award, Lock, Unlock, Plus, Pencil, Trash2, ImagePlus,
  Eye, EyeOff, Loader2, AlertTriangle, CheckCircle,
  SlidersHorizontal, Scale, Layers, Sparkles, Eye as ViewIcon, ArrowLeft, LogOut,
  KeyRound, DollarSign, Coins, TrendingUp
} from 'lucide-react';

/* ============================================================
   TABIRA — Corporate Fire & Life-Safety Digital Catalog
   IndexedDB Unlimited Storage & Multi-Tab Real-Time Sync.
   ============================================================ */

const BRAND_AR = "تابيرا";
const BRAND_EN = "TABIRA";
const BRAND_TAGLINE = "معدات وأجهزة السلامة والوقاية من الحريق";
const ITEMS_PER_PAGE = 15;
const DEFAULT_ADMIN_PASSWORD = "Tabira@2026";
const PRODUCTS_KEY = "tabira_catalog_products_v4";
const ADMIN_HASH_KEY = "tabira_admin_hash_v4";
const EXCHANGE_RATE_KEY = "tabira_exchange_rate_v4";
const DEFAULT_EXCHANGE_RATE = 1500;
const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 45;

const CATEGORIES = [
  { key: "extinguishers", name: "طفايات الحريق", icon: Flame, code: "EXT" },
  { key: "alarms", name: "أنظمة الإنذار والكشف", icon: Bell, code: "ALM" },
  { key: "hoses", name: "الخراطيم وصناديق الحريق", icon: Droplets, code: "HYD" },
  { key: "ppe", name: "معدات الوقاية الشخصية", icon: HardHat, code: "PPE" },
  { key: "sprinklers", name: "أنظمة الرش والغاز التلقائي", icon: Wind, code: "SPK" },
  { key: "pumps", name: "مضخات الحريق والصمامات", icon: Layers, code: "PMP" },
];

const BRANDS = ["فاير ماكس (FireMax)", "سيف جارد (SafeGuard)", "أمان برو (AmanPro)", "جلوبال شيلد (GlobalShield)", "بروتكت لاين (ProtectLine)", "فايكنج (Viking)", "هانكس (Hanx)"];
const ORIGINS = ["ألمانيا", "الصين", "تركيا", "الإمارات", "إيطاليا", "المملكة المتحدة", "الولايات المتحدة"];

const CATEGORY_ITEMS = {
  extinguishers: [
    { title: "طفاية بودرة جافة متعددة الأغراض 6 كجم", specs: [["السعة", "6 كجم"], ["نوع الوسيط", "ABC Powder 40%"], ["ضغط العمل", "14 Bar"], ["مدى الرش", "6-8 أمتار"]] },
    { title: "طفاية ثاني أكسيد الكربون 5 كجم", specs: [["السعة", "5 كجم"], ["نوع الوسيط", "CO2 Gas"], ["الضغط التجريبي", "250 Bar"], ["مادة الأسطوانة", "سبائك الصلب"]] },
    { title: "طفاية رغوة AFFF سعة 9 لتر", specs: [["السعة", "9 لتر"], ["الوسيط", "Foam 3%"], ["المعيار", "EN3-7 Approved"], ["الوزن الإجمالي", "14 كجم"]] },
    { title: "طفاية بودرة 12 كجم ذات عجلات", specs: [["السعة", "12 كجم"], ["نوع الحركة", "عجلات مطاطية مقواة"], ["ضغط الاختبار", "27 Bar"], ["طول الخرطوم", "3 أمتار"]] },
    { title: "طفاية أوتوماتيكية معلقة للسقف 9 كجم", specs: [["السعة", "9 كجم"], ["درجة انطلاق المنفذ", "68°C Bulb"], ["التغطية", "12 متر مربع"], ["ضغط العمل", "15 Bar"]] },
    { title: "طفاية بودرة مدمجة 1 كجم للمركبات", specs: [["السعة", "1 كجم"], ["حامل التثبيت", "حامل معدني مزدوج"], ["الشهادة", "CE / ISO 9001"], ["مؤشر الضغط", "نحاسي مقاوم للصدأ"]] }
  ],
  alarms: [
    { title: "كاشف دخان بصري ذكي مع عنوان", specs: [["التقنية", "Optical Scattering"], ["الجهد", "24V DC"], ["بروتوكول الاتصال", "Addressable Loop"], ["درجة الحماية", "IP42"]] },
    { title: "كاشف حرارة حراري ثابت وارتفاع سريع", specs: [["درجة التفعيل", "58°C Rate of Rise"], ["التغطية", "50 متر مربع"], ["حالة المؤشر", "LED أحمر مزدوج"], ["التيار", "35µA Standby"]] },
    { title: "لوحة إنذار حريق معتمدة 8 مناطق", specs: [["عدد المناطق", "8 Zones Conventional"], ["الشاشة", "LCD backlit"], ["البطارية الاحتياطية", "2x 12V 7Ah"], ["صوت التنبيه", "85dB Built-in"]] },
    { title: "جرس إنذار وميضي صوتي ضوئي Strobe", specs: [["مستوى الصوت", "105dB at 1m"], ["نوع الوميض", "Xenon High-intensity"], ["مصدر الطاقة", "24V DC"], ["اللون", "أحمر مقاوم لليوفيه"]] },
    { title: "زر إنذار يدوي كسر الزجاج Manual Call Point", specs: [["التركيب", "ظاهري / غاطس"], ["المادة", "ABS Flame Retardant"], ["إعادة الضبط", "مفتاح خاص مرفق"], ["درجة التشغيل", "-10°C to +55°C"]] },
    { title: "كاشف غاز أول أكسيد الكربون الرقمي", specs: [["الحساسية", "30-300 PPM"], ["نوع الحساس", "Electrochemical Sensor"], ["عمر الحساس", "5 سنوات"], ["عرض التركيز", "شاشة رقمية LED"]] }
  ],
  hoses: [
    { title: "خرطوم حريق قماشي 30 متر قياس 2.5 إنش", specs: [["الطول", "30 متر"], ["القطر", "2.5 إنش (65mm)"], ["ضغط الانفجار", "45 Bar"], ["التوصيلة", "NIST / Storze Brass"]] },
    { title: "صندوق حريق داخلي ستانلس ستيل 304", specs: [["السمك", "1.5mm SS 304"], ["الأبعاد", "800x800x300 mm"], ["نوع الباب", "زجاج معالج / صلب"], ["القفل", "مقبض نحاسي كروم"]] },
    { title: "بكرة خرطوم دوارة أوتوماتيكية Hose Reel", specs: [["طول الخرطوم", "30 متر"], ["قطر الخرطوم", "1 إنش (25mm)"], ["ضغط العمل", "12 Bar"], ["زاوية الدوران", "180 درجة"]] },
    { title: "وصلة هوز ريل نحاسية مقواة", specs: [["المادة", "نحاس أحمر أصلاب"], ["القياس", "1 إنش / 1.5 إنش"], ["مانع التسرب", "EPDM O-Ring"], ["الضغط", "PN16"]] },
    { title: "فوهة رش مزدوجة الوضع (Fog & Jet)", specs: [["التدفق", "475 L/min at 6 Bar"], ["النمط", "ضباب كثيف / تيار نفاث"], ["المقبض", "Pistol Grip Rubber"], ["المفصل", "دوار 360 درجة"]] },
    { title: "صندوق هيدرانت خارجي مزدوج", specs: [["المنافذ", "2x 2.5 إنش Outlet"], ["صمام التحكم", "صمام بوابة نحاسي"], ["الطلاء", "Polyester Red Powder"], ["المقاومة", "مقاوم للعوامل الجوية"]] }
  ],
  ppe: [
    { title: "بدلة إطفاء حراري متكاملة معتمدة NFPA", specs: [["طبقات القماش", "Nomex Outer / Kevlar Thermal Barrier"], ["معيار السلامة", "NFPA 1971 / EN 469"], ["شريط الانعكاس", "3M Scotchlite"], ["الوزن", "3.8 كجم"]] },
    { title: "خوذة إطفائي محترفة مع قناع واقي", specs: [["المادة", "High-temp Thermoplastic"], ["الواقي", "Gold-coated Heat Visor"], ["الرؤية الليلية", "حوامل كشاف جانبي"], ["المعيار", "EN 443:2008"]] },
    { title: "قفازات إطفاء مقاومة للحرارة والقطع", specs: [["النسيج", "Kevlar & Cowhide Leather"], ["مقاومة الحرارة", "حتى 500°C"], ["الحماية", "Crosstech Waterproof Membrane"], ["المرونة", "عالية الأصابع"]] },
    { title: "جهاز تنفس ذاتي عالي الضغط SCBA", specs: [["أسطوانة الهواء", "Composite Carbon Fiber 6.8L"], ["الضغط", "300 Bar"], ["مدة التنفس", "45-60 دقيقة"], ["القناع", "Posi-press Full Face"]] },
    { title: "حذاء سلامة عازل للكهرباء والحرارة", specs: [["المادة", "Vulcanized Rubber"], ["مقدمة الحذاء", "Steel Toe Cap 200J"], ["مقاومة الانزلاق", "SRC Rated Sole"], ["العزل", "عزل حراري وكهربائي 18kV"]] },
    { title: "قناع واقي كامل الوجه مرشح غازات", specs: [["الرؤية", "زاوية 180 درجة زجاج بانورامي"], ["المرشح", "A2B2E2K2P3 Multi-gas"], ["التثبيت", "5 نقاط مطاطية مقواة"], ["الشهادة", "EN 136 Class 3"]] }
  ],
  sprinklers: [
    { title: "رأس رش أوتوماتيكي سريع الاستجابة 68°C", specs: [["درجة حرارة الانطلاق", "68°C (Red Bulb)"], ["المقاس", "1/2 إنش NPT"], ["عامل كيو K-Factor", "K-5.6 (80 metric)"], ["الطلاء", "Chrome / Brass finish"]] },
    { title: "صمام إنذار التدفق Alarm Check Valve 6 إنش", specs: [["القطر", "6 إنش (DN150)"], ["الضغط الإسمي", "PN16 / 175 PSI"], ["التوصيل", "Flanged to ANSI B16.1"], ["المكونات", "حجرة إعاقة + جرس مائي"]] },
    { title: "نظام إطفاء بالغاز النظيف FM200 / Novec", specs: [["نوع الغاز", "HFC-227ea / FK-5-1-12"], ["سعة الأسطوانة", "120 لتر"], ["زمن التفريغ", "< 10 ثواني"], ["الأمان", "آمن على الأجهزة الإلكترونية"]] },
    { title: "صمام تحكم رئيسي مراقب OS&Y Gate Valve", specs: [["القياس", "4 إنش Flanged"], ["مستشعر الوضع", "Tamper Switch Ready"], ["ضغط العمل", "300 PSI"], ["المادة", "Ductile Iron Body"]] }
  ],
  pumps: [
    { title: "مجموعة مضخة حريق ديزل معتمدة UL/FM", specs: [["التدفق", "750 GPM at 10 Bar"], ["المحرك", "Diesel Engine Water-cooled"], ["لوحة التحكم", "Automatic Fire Controller"], ["المعيار", "NFPA 20 Compliant"]] },
    { title: "مضخة حريق كهربائية رئيسية 50HP", specs: [["القدرة", "50 حصان (37kW)"], ["التدفق", "500 GPM"], ["سرعة الدوران", "2900 RPM"], ["نوع المضخة", "Horizontal Split Case"]] },
    { title: "مضخة تعويض الضغط الجوكي Jockey Pump", specs: [["التدفق", "15 GPM at 12 Bar"], ["المحرك", "3kW 3-Phase Electric"], ["جسم المضخة", "Multistage Stainless Steel"], ["خزان الضغط", "100L Membrane Tank"]] }
  ]
};

// Price formatting helper for USD ($) and IQD (د.ع)
const formatPrice = (priceUSD, currency = "USD", rate = DEFAULT_EXCHANGE_RATE) => {
  const num = Number(priceUSD) || 0;
  if (currency === "IQD") {
    const iqd = Math.round(num * rate);
    return `${iqd.toLocaleString("ar-IQ")} د.ع`;
  }
  return `$${num.toLocaleString("en-US")}`;
};

// Seeded deterministic random generator
const seededRand = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Generate mock dataset
const generateMockData = (count = 1400) => {
  const products = [];
  for (let i = 1; i <= count; i++) {
    const cat = CATEGORIES[i % CATEGORIES.length];
    const itemTemplates = CATEGORY_ITEMS[cat.key] || CATEGORY_ITEMS.extinguishers;
    const template = itemTemplates[i % itemTemplates.length];
    const brand = BRANDS[Math.floor(seededRand(i * 3.1) * BRANDS.length)];
    const origin = ORIGINS[Math.floor(seededRand(i * 7.7) * ORIGINS.length)];
    const isAvailable = seededRand(i * 1.9) > 0.14;
    const price = Math.floor(seededRand(i * 5.3) * 650) + 35;
    const code = `${cat.code}-${String(i).padStart(5, "0")}`;

    products.push({
      id: `p${i}`,
      code,
      name: `${template.title} — ${brand.split(" ")[0]}`,
      category: cat.key,
      brand,
      origin,
      price,
      status: isAvailable ? "متوفر" : "غير متوفر",
      description: `${template.title} مصنّع وفق معايير الجمعية الوطنية للوقاية من الحريق (NFPA) ومواصفات ISO 9001. يخضع الصنف لفحص فني ودقيق ومرفق بشهادة فحص جودة.`,
      specifications: template.specs,
      image: "",
      certifiedYear: 2022 + (i % 4),
      featured: i % 7 === 0
    });
  }
  return products;
};

/* Crypto SHA-256 password hashing */
async function sha256Hex(text) {
  const enc = new TextEncoder().encode(String(text));
  const buf = await window.crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ============================================================
   INDEXEDDB UNLIMITED PERSISTENT STORAGE ENGINE
   Solves browser localStorage 5MB quota limit completely!
   Allows storing thousands of high-res photos and items.
   ============================================================ */
const DB_NAME = "TabiraCatalogDB";
const DB_VERSION = 1;
const STORE_NAME = "keyval";

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB-not-supported"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const safeStorage = {
  async get(key) {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => {
          if (req.result !== undefined) resolve({ key, value: req.result });
          else {
            // Fallback to localStorage
            try {
              const ls = localStorage.getItem(key);
              if (ls !== null) resolve({ key, value: ls });
              else reject(new Error("not-found"));
            } catch {
              reject(new Error("not-found"));
            }
          }
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Fallback to localStorage if IndexedDB fails
      if (typeof localStorage !== "undefined") {
        const val = localStorage.getItem(key);
        if (val !== null) return { key, value: val };
      }
      throw new Error("not-found");
    }
  },
  async set(key, value) {
    try {
      const db = await openDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      /* ignore */
    }
    // Also try saving smaller keys to localStorage for redundancy
    if (typeof localStorage !== "undefined") {
      try { localStorage.setItem(key, value); } catch { /* quota full ok */ }
    }
    // Broadcast change to other open browser tabs
    if (typeof BroadcastChannel !== "undefined") {
      try {
        const bc = new BroadcastChannel("tabira_channel");
        bc.postMessage({ key, value });
        bc.close();
      } catch { /* ignore */ }
    }
    return { key, value };
  }
};

/* Optimized High-Performance Image Compressor & Resizer (600px Max Dimension) */
function resizeImageFile(file, maxW = 600) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read-failed"));
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Compress efficiently using WebP/JPEG format
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => reject(new Error("decode-failed"));
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* Category Icon Component */
const CatIcon = ({ catKey, className, style }) => {
  const found = CATEGORIES.find((c) => c.key === catKey);
  const Icon = found ? found.icon : ShieldCheck;
  return <Icon className={className} style={style} />;
};

/* Official Tabira Logo Header Bar Component */
const TabiraLogo = ({ dark }) => (
  <div className="flex items-center gap-3 select-none shrink-0 py-1">
    <div className="relative group shrink-0">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full p-0.5 bg-gradient-to-tr from-[#D31424] via-[#111315] to-[#D31424] shadow-md flex items-center justify-center overflow-hidden">
        <img
          src="./tabira-logo.jpg"
          alt="TABIRA"
          className="w-full h-full object-cover rounded-full bg-white"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="hidden w-full h-full rounded-full bg-[#0F172A] items-center justify-center">
          <Flame className="w-6 h-6 text-[#D31424]" />
        </div>
      </div>
    </div>
    <div className="leading-normal flex flex-col justify-center">
      <div className="font-black text-xl sm:text-2xl tracking-tight flex items-center gap-1 pb-1" style={{ color: dark ? "#FFFFFF" : "var(--ink)", fontFamily: "var(--font-display)" }}>
        {BRAND_AR} <span style={{ color: "var(--brand-red)" }}>.</span>
      </div>
      <div className="text-[10px] sm:text-[11px] font-extrabold tracking-[0.25em] uppercase text-slate-400">
        {BRAND_EN}
      </div>
    </div>
  </div>
);

/* Interactive Currency Switcher Widget */
const CurrencySwitcher = ({ currency, onToggle, exchangeRate }) => {
  return (
    <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 shadow-inner">
      <button
        onClick={() => onToggle("USD")}
        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
          currency === "USD"
            ? "bg-[#0F172A] text-white shadow-sm"
            : "text-slate-600 hover:text-slate-900"
        }`}>
        <DollarSign className="w-3.5 h-3.5 text-amber-400" />
        <span>USD ($)</span>
      </button>

      <button
        onClick={() => onToggle("IQD")}
        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
          currency === "IQD"
            ? "bg-[#D31424] text-white shadow-sm"
            : "text-slate-600 hover:text-slate-900"
        }`}>
        <Coins className="w-3.5 h-3.5 text-amber-300" />
        <span>IQD (د.ع)</span>
      </button>
    </div>
  );
};

/* Opening Animated Splash Screen Component */
const SplashScreen = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setFading(true);
          setTimeout(onFinish, 600);
          return 100;
        }
        return prev + 4;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center splash-wave-bg transition-opacity duration-700 ${fading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} dir="rtl">
      
      <div className="absolute inset-0 blueprint-bg opacity-20 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center p-6 max-w-md w-full">
        
        <div className="relative mb-8 group">
          <div className="absolute -inset-4 bg-gradient-to-r from-[#D31424] to-amber-500 rounded-full blur-2xl opacity-60 animate-pulse"></div>
          
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1.5 bg-gradient-to-tr from-[#D31424] via-white to-[#0F172A] shadow-2xl logo-ripple flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-white p-1 shadow-inner overflow-hidden flex items-center justify-center">
              <img
                src="./tabira-logo.jpg"
                alt="TABIRA"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full h-full rounded-full bg-[#0F172A] items-center justify-center">
                <Flame className="w-16 h-16 text-[#D31424]" />
              </div>
            </div>
          </div>
        </div>

        <h1 className="font-black text-5xl sm:text-6xl shimmer-text tracking-tight mb-2 pb-3 leading-normal">
          {BRAND_AR}
        </h1>
        
        <p className="mono text-xs sm:text-sm font-extrabold text-slate-300 tracking-[0.3em] uppercase mb-6">
          {BRAND_EN}
        </p>

        <p className="text-xs sm:text-sm text-slate-200 font-bold mb-6">
          {BRAND_TAGLINE}
        </p>

        <div className="w-full max-w-xs bg-white/10 rounded-full h-2 overflow-hidden border border-white/20 p-0.5 shadow-inner mb-4">
          <div
            className="bg-gradient-to-r from-[#D31424] via-amber-400 to-[#D31424] h-full rounded-full transition-all duration-100 shadow-md"
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          onClick={() => { setFading(true); setTimeout(onFinish, 400); }}
          className="mt-2 text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
          <span>دخول الكتالوج المباشر</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
};

/* Status Stamp Badge */
const StatusStamp = ({ status, size = "md" }) => {
  const ok = status === "متوفر";
  const sizes = size === "sm" ? "text-[10.5px] px-2 py-0.5" : "text-xs px-3 py-1";
  return (
    <span className={`inline-flex items-center gap-1 font-black tracking-wide rounded-full ${sizes}`}
      style={{
        background: ok ? "var(--tag-green-bg)" : "#FEE2E2",
        color: ok ? "var(--tag-green)" : "var(--brand-red)",
        border: `1px solid ${ok ? "#A7F3D0" : "#FCA5A5"}`
      }}>
      {ok ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
      {ok ? "متوفر" : "غير متوفر"}
    </span>
  );
};

/* Toast Notification Floating Widget */
const Toast = ({ toast }) => {
  if (!toast) return null;
  const ok = toast.type !== "error";
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-xs sm:text-sm font-bold animate-bounce"
      style={{ background: ok ? "var(--ink)" : "var(--brand-red)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.2)" }}>
      {ok ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-300" />}
      {toast.msg}
    </div>
  );
};

/* Product Card Component */
const ProductCard = ({ product, currency, exchangeRate, onOpen, onToggleCompare, isCompared }) => {
  return (
    <div className="product-card group" role="region" aria-label={product.name}>
      
      <div className="img-contain-box cursor-pointer" onClick={() => onOpen(product)}>
        {product.image ? (
          <img src={product.image} alt={product.name} loading="lazy" />
        ) : (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <CatIcon catKey={product.category} className="w-8 h-8 sm:w-10 sm:h-10 text-[#D31424]" />
          </div>
        )}

        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          <StatusStamp status={product.status} size="sm" />
        </div>

        {product.featured && (
          <div className="absolute top-3 left-3 bg-amber-500 text-white text-[9.5px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> مميز
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="mono text-[10.5px] font-bold text-slate-400">{product.code}</span>
          <span className="text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            {CATEGORIES.find((c) => c.key === product.category)?.name}
          </span>
        </div>

        <h3 onClick={() => onOpen(product)} className="text-sm sm:text-base font-extrabold leading-snug mb-2 cursor-pointer hover:text-[#D31424] transition-colors line-clamp-2 text-slate-900">
          {product.name}
        </h3>

        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4 flex-grow">
          {product.description}
        </p>

        <div className="space-y-1 mb-4 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <div className="flex justify-between text-slate-600">
            <span>العلامة التجارية:</span> <span className="font-bold text-slate-800">{product.brand}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>بلد المنشأ:</span> <span className="font-bold text-slate-800">{product.origin}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-dashed border-slate-200 flex items-center justify-between gap-2">
          <div>
            <span className="text-[9.5px] text-slate-400 block font-bold">السعر التقديري</span>
            <span className="mono text-base sm:text-lg font-black text-slate-900">
              {formatPrice(product.price, currency, exchangeRate)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleCompare(product)}
              title={isCompared ? "إزالة من المقارنة" : "مقارنة المنتج"}
              className={`p-2 rounded-lg border text-xs font-bold transition-all ${isCompared ? 'bg-red-50 border-red-300 text-red-600' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}`}>
              <Scale className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpen(product)}
              className="px-3 py-2 rounded-lg text-xs font-extrabold bg-[#0F172A] text-white hover:bg-[#D31424] flex items-center gap-1.5 transition-all shadow-sm">
              <ViewIcon className="w-3.5 h-3.5 text-slate-300" />
              <span>التفاصيل</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Technical Datasheet Modal */
const ProductModal = ({ product, currency, exchangeRate, onClose }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm animate-fade-in" onClick={onClose} dir="rtl">
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200 relative" onClick={(e) => e.stopPropagation()}>
        
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-3.5 bg-[#0F172A] text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#D31424]" />
            <span className="mono text-[11px] sm:text-xs tracking-widest text-slate-300 font-extrabold">APPROVED SPECIFICATIONS · {product.code}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-8">
          <div className="grid md:grid-cols-12 gap-6 mb-6">
            
            <div className="md:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[220px]">
              {product.image ? (
                <img src={product.image} alt={product.name} className="max-h-56 object-contain rounded-lg" />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-slate-50 flex items-center justify-center">
                  <CatIcon catKey={product.category} className="w-14 h-14 text-[#D31424]" />
                </div>
              )}
            </div>

            <div className="md:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-black text-[#D31424] bg-red-50 px-3 py-1 rounded-full border border-red-100">
                    {CATEGORIES.find((c) => c.key === product.category)?.name}
                  </span>
                  <StatusStamp status={product.status} />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-3">
                  {product.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {product.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-500 font-bold block mb-0.5">السعر التقديري</span>
                  <span className="mono text-lg font-black text-slate-900">
                    {formatPrice(product.price, currency, exchangeRate)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-bold block mb-0.5">سنة الاعتماد والفحص</span>
                  <span className="mono text-base font-bold text-slate-800">{product.certifiedYear}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm sm:text-base font-black text-slate-900 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#D31424]" /> المواصفات والخصائص الفنية
            </h4>
            <div className="rounded-xl overflow-hidden border border-slate-200">
              <table className="w-full text-xs sm:text-sm text-right">
                <tbody>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <td className="p-3 font-bold text-slate-500 w-1/3">العلامة التجارية والمصنع</td>
                    <td className="p-3 font-extrabold text-slate-900">{product.brand}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-3 font-bold text-slate-500">بلد المنشأ</td>
                    <td className="p-3 font-extrabold text-slate-900">{product.origin}</td>
                  </tr>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <td className="p-3 font-bold text-slate-500">معايير السلامة والجودة</td>
                    <td className="p-3 font-extrabold text-slate-900">ISO 9001 · UL Listed · CE · NFPA Compliant</td>
                  </tr>
                  {product.specifications && product.specifications.map(([k, v], idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-slate-50 border-b border-slate-200" : "border-b border-slate-200"}>
                      <td className="p-3 font-bold text-slate-500">{k}</td>
                      <td className="p-3 font-extrabold text-slate-900">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-dashed border-slate-300">
            <span className="mono text-xs text-slate-400 font-bold">REF #{product.code}</span>
            <button onClick={onClose} className="px-6 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors">
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Comparison Drawer */
const ComparisonModal = ({ products, currency, exchangeRate, onClose, onRemoveCompare }) => {
  if (!products || !products.length) return null;

  const allSpecKeys = Array.from(
    new Set(
      products.flatMap((p) => (p.specifications || []).map((s) => s[0]))
    )
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm animate-fade-in" onClick={onClose} dir="rtl">
      <div className="w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200 relative" onClick={(e) => e.stopPropagation()}>
        
        <div className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 bg-[#0F172A] text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-[#D31424]" />
            <h3 className="font-extrabold text-base sm:text-lg">جدول مقارنة المواصفات الفنية المعتمدة ({products.length})</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-x-auto">
          <table className="w-full border-collapse text-xs sm:text-sm text-right">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="p-4 bg-slate-100 font-black text-slate-800 w-44 sticky right-0 z-10 shadow-sm text-sm">
                  خاصية الصنف
                </th>
                {products.map((p) => (
                  <th key={p.id} className="p-4 min-w-[240px] bg-slate-50 align-top border-l border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="mono text-[10.5px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">{p.code}</span>
                      <button onClick={() => onRemoveCompare(p.id)} title="إزالة من المقارنة" className="text-slate-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="h-28 bg-white rounded-xl border border-slate-200 p-3 flex items-center justify-center mb-3 shadow-inner">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <CatIcon catKey={p.category} className="w-10 h-10 text-[#D31424]" />
                      )}
                    </div>
                    
                    <h5 className="font-black text-slate-900 leading-snug line-clamp-2 text-sm">{p.name}</h5>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              <tr className="border-b border-slate-200 hover:bg-slate-50/70">
                <td className="p-3.5 font-extrabold text-slate-700 bg-slate-100 sticky right-0 z-10">القسم الرئيسي</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3.5 font-bold text-slate-800 border-l border-slate-100">
                    {CATEGORIES.find((c) => c.key === p.category)?.name}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-slate-200 hover:bg-slate-50/70">
                <td className="p-3.5 font-extrabold text-slate-700 bg-slate-100 sticky right-0 z-10">السعر التقديري</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3.5 mono font-black text-base text-slate-900 border-l border-slate-100">
                    {formatPrice(p.price, currency, exchangeRate)}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-slate-200 hover:bg-slate-50/70">
                <td className="p-3.5 font-extrabold text-slate-700 bg-slate-100 sticky right-0 z-10">الحالة والتوفر</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3.5 border-l border-slate-100">
                    <StatusStamp status={p.status} size="sm" />
                  </td>
                ))}
              </tr>

              <tr className="border-b border-slate-200 hover:bg-slate-50/70">
                <td className="p-3.5 font-extrabold text-slate-700 bg-slate-100 sticky right-0 z-10">العلامة التجارية</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3.5 font-extrabold text-slate-900 border-l border-slate-100">
                    {p.brand}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-slate-200 hover:bg-slate-50/70">
                <td className="p-3.5 font-extrabold text-slate-700 bg-slate-100 sticky right-0 z-10">بلد المنشأ</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3.5 font-bold text-slate-800 border-l border-slate-100">
                    {p.origin}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-slate-200 hover:bg-slate-50/70">
                <td className="p-3.5 font-extrabold text-slate-700 bg-slate-100 sticky right-0 z-10">سنة الفحص والاعتماد</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3.5 mono font-bold text-slate-800 border-l border-slate-100">
                    {p.certifiedYear}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-slate-200 hover:bg-slate-50/70">
                <td className="p-3.5 font-extrabold text-slate-700 bg-slate-100 sticky right-0 z-10">معايير السلامة والجودة</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3.5 text-xs font-bold text-slate-700 border-l border-slate-100">
                    ISO 9001 · UL Listed · CE · NFPA Compliant
                  </td>
                ))}
              </tr>

              {allSpecKeys.map((specKey) => (
                <tr key={specKey} className="border-b border-slate-200 hover:bg-slate-50/70">
                  <td className="p-3.5 font-extrabold text-[#D31424] bg-slate-100 sticky right-0 z-10">
                    {specKey}
                  </td>
                  {products.map((p) => {
                    const match = (p.specifications || []).find((s) => s[0] === specKey);
                    const val = match ? match[1] : "—";
                    return (
                      <td key={p.id} className="p-3.5 font-extrabold text-slate-900 border-l border-slate-100">
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}

              <tr className="hover:bg-slate-50/70">
                <td className="p-3.5 font-extrabold text-slate-700 bg-slate-100 sticky right-0 z-10">الوصف العام للمعدة</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3.5 text-xs text-slate-600 leading-relaxed border-l border-slate-100 align-top">
                    {p.description}
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* Secure Password Modal Gate */
const AdminLoginModal = ({ onSuccess, onClose, storedHash }) => {
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);

  const locked = Date.now() < lockedUntil;
  const secsLeft = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));

  const submit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (locked || busy) return;
    setBusy(true); setErr("");
    
    try {
      const hash = await sha256Hex(pwd.trim());
      setBusy(false);
      if (hash === storedHash) {
        onSuccess();
      } else {
        const next = attempts + 1;
        setAttempts(next);
        setPwd("");
        if (next >= MAX_ATTEMPTS) {
          setLockedUntil(Date.now() + LOCK_SECONDS * 1000);
          setAttempts(0);
          setErr(`تجاوزت عدد المحاولات المسموحة — حاول بعد ${LOCK_SECONDS} ثانية`);
        } else {
          setErr(`الرمز السري غير صحيح (محاولة ${next} من ${MAX_ATTEMPTS})`);
        }
      }
    } catch {
      setBusy(false);
      setErr("حدث خطأ تقني أثناء التحقق");
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in" onClick={onClose} dir="rtl">
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200">
        <div className="w-12 h-12 rounded-xl bg-red-50 text-[#D31424] flex items-center justify-center mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 mb-1">دخول لوحة الإدارة — {BRAND_AR}</h3>
        <p className="text-xs text-slate-500 mb-6">منطقة محمية بالرمز السري للمشرفين فقط.</p>
        
        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <input
              autoFocus
              type={show ? "text" : "password"}
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              disabled={locked}
              placeholder="أدخل الرمز السري للإدارة"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#D31424] bg-slate-50"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {err && (
            <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {locked ? `حساب مؤقت — انتظر ${secsLeft} ثانية` : err}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl text-xs sm:text-sm font-extrabold bg-slate-100 text-slate-700 hover:bg-slate-200">
              إلغاء
            </button>
            <button type="submit" disabled={locked || busy || !pwd} className="flex-1 py-3 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-[#0F172A] hover:bg-[#D31424] flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-50">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />} فتح الإدارة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* Change Password & Exchange Rate Settings Panel */
const ChangePasswordPanel = ({ storedHash, exchangeRate, onSavedPassword, onSavedRate, notify }) => {
  const [cur, setCur] = useState("");
  const [n1, setN1] = useState("");
  const [n2, setN2] = useState("");
  const [busyPwd, setBusyPwd] = useState(false);

  const [rateVal, setRateVal] = useState(String(exchangeRate));
  const [busyRate, setBusyRate] = useState(false);

  const submitPwd = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (busyPwd) return;
    setBusyPwd(true);
    try {
      const curHash = await sha256Hex(cur.trim());
      if (curHash !== storedHash) {
        setBusyPwd(false);
        notify("الرمز الحالي غير صحيح", "error");
        return;
      }
      if (n1.trim().length < 6) {
        setBusyPwd(false);
        notify("الرمز الجديد يجب أن يتكون من 6 خانات على الأقل", "error");
        return;
      }
      if (n1.trim() !== n2.trim()) {
        setBusyPwd(false);
        notify("تأكيد الرمز الجديد غير مطابق", "error");
        return;
      }
      const newHash = await sha256Hex(n1.trim());
      await onSavedPassword(newHash);
      setBusyPwd(false);
      setCur(""); setN1(""); setN2("");
      notify("تم تغيير الرمز السري للإدارة بنجاح وحفظه فورياً", "ok");
    } catch {
      setBusyPwd(false);
      notify("حدث خطأ أثناء تغيير الرمز", "error");
    }
  };

  const submitRate = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const newRate = Number(rateVal);
    if (!newRate || newRate <= 0) {
      notify("يرجى إدخال سعر صرف صحيح للبورصة", "error");
      return;
    }
    setBusyRate(true);
    await onSavedRate(newRate);
    setBusyRate(false);
    notify(`تم تعديل سعر صرف البورصة إلى (1$ = ${newRate.toLocaleString("ar-IQ")} د.ع) وحفظه فورياً`, "ok");
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      
      {/* Change Password Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4 text-[#D31424]">
          <KeyRound className="w-6 h-6" />
          <h4 className="font-extrabold text-lg text-slate-900">تغيير الرمز السري للإدارة</h4>
        </div>
        <p className="text-xs text-slate-500 mb-6">قم بتعديل رمز الدخول الخاص بلوحة الإدارة لضمان أمان الكتالوج.</p>
        
        <form onSubmit={submitPwd} className="space-y-4">
          <div>
            <label className="text-xs font-extrabold block mb-1 text-slate-700">الرمز السري الحالي</label>
            <input
              type="password"
              autoComplete="off"
              placeholder="الرمز الحالي"
              value={cur}
              onChange={(e) => setCur(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-slate-50 focus:outline-none focus:border-[#D31424]"
            />
          </div>
          <div>
            <label className="text-xs font-extrabold block mb-1 text-slate-700">الرمز السري الجديد (6 خانات على الأقل)</label>
            <input
              type="password"
              autoComplete="off"
              placeholder="الرمز الجديد"
              value={n1}
              onChange={(e) => setN1(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-slate-50 focus:outline-none focus:border-[#D31424]"
            />
          </div>
          <div>
            <label className="text-xs font-extrabold block mb-1 text-slate-700">تأكيد الرمز السري الجديد</label>
            <input
              type="password"
              autoComplete="off"
              placeholder="تأكيد الرمز الجديد"
              value={n2}
              onChange={(e) => setN2(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-slate-50 focus:outline-none focus:border-[#D31424]"
            />
          </div>

          <button
            type="submit"
            disabled={busyPwd || !cur || !n1 || !n2}
            className="mt-2 w-full py-3 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-[#0F172A] hover:bg-[#D31424] flex items-center justify-center gap-2 shadow-md disabled:opacity-50 transition-colors">
            {busyPwd ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />} حفظ الرمز الجديد
          </button>
        </form>
      </div>

      {/* Exchange Rate Adjustment Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4 text-[#D31424]">
          <TrendingUp className="w-6 h-6" />
          <h4 className="font-extrabold text-lg text-slate-900">سعر صرف البورصة والسوق (IQD)</h4>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          حدد سعر التحويل المعتمد للورقة (100 دولار) مقابل الدينار العراقي في السوق لتحديث أسعار الكتالوج بالدينار تلقائياً.
        </p>

        <form onSubmit={submitRate} className="space-y-4">
          <div>
            <label className="text-xs font-extrabold block mb-1 text-slate-700">سعر صرف 1 دولار أمريكي (بالدينار)</label>
            <div className="relative">
              <input
                type="number"
                min="500"
                max="5000"
                value={rateVal}
                onChange={(e) => setRateVal(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base font-black bg-slate-50 mono focus:outline-none focus:border-[#D31424]"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">د.ع / $</span>
            </div>
            <p className="text-[11px] text-slate-500 font-bold mt-2">
              مثال: <span className="mono font-bold text-slate-800">1500</span> يعني أن الـ 100$ = <span className="mono font-bold text-slate-800">150,000 د.ع</span>
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 font-bold">
            💡 يتم تطبيق هذا السعر فورياً لدى جميع الزوار عند اختيارهم تحويل العملة إلى الدينار العراقي.
          </div>

          <button
            type="submit"
            disabled={busyRate || !rateVal}
            className="mt-2 w-full py-3 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-[#D31424] hover:bg-[#990B17] flex items-center justify-center gap-2 shadow-md disabled:opacity-50 transition-colors">
            {busyRate ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />} تحديث سعر صرف البورصة
          </button>
        </form>
      </div>

    </div>
  );
};

/* Product Add / Edit Form */
const emptyDraft = { name: "", category: CATEGORIES[0].key, brand: BRANDS[0], origin: ORIGINS[0], price: "", status: "متوفر", description: "", image: "" };

const ProductForm = ({ draft, onChange, onCancel, onSave, saving, currency, exchangeRate }) => {
  const fileRef = useRef(null);
  const [imgErr, setImgErr] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setImgErr("يرجى اختيار ملف صورة صالحة"); return; }
    setImgErr("");
    setUploading(true);
    try {
      const dataUrl = await resizeImageFile(file);
      onChange({ ...draft, image: dataUrl });
      setUploading(false);
    } catch {
      setImgErr("تعذر معالجة الصورة");
      setUploading(false);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 mb-6">
      <h4 className="font-extrabold text-base text-slate-900 mb-4 flex items-center gap-2">
        <Pencil className="w-5 h-5 text-[#D31424]" /> بيانات المنتج الفنية
      </h4>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-extrabold block mb-1 text-slate-700">اسم الصنف أو الجهاز</label>
          <input value={draft.name} onChange={(e) => onChange({ ...draft, name: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 bg-white" />
        </div>
        <div>
          <label className="text-xs font-extrabold block mb-1 text-slate-700">القسم الرئيسي</label>
          <select value={draft.category} onChange={(e) => onChange({ ...draft, category: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 bg-white">
            {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-extrabold block mb-1 text-slate-700">العلامة التجارية</label>
          <input value={draft.brand} onChange={(e) => onChange({ ...draft, brand: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 bg-white" />
        </div>
        <div>
          <label className="text-xs font-extrabold block mb-1 text-slate-700">بلد المنشأ</label>
          <input value={draft.origin} onChange={(e) => onChange({ ...draft, origin: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 bg-white" />
        </div>
        <div>
          <label className="text-xs font-extrabold block mb-1 text-slate-700">
            السعر القياسي بالدولار ($ USD)
          </label>
          <input type="number" min="0" value={draft.price} onChange={(e) => onChange({ ...draft, price: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 bg-white mono" />
          {draft.price && (
            <span className="text-[11px] font-bold text-slate-500 mt-1 block">
              يساوي بالدينار: <b className="mono text-[#D31424]">{formatPrice(draft.price, "IQD", exchangeRate)}</b>
            </span>
          )}
        </div>
        <div>
          <label className="text-xs font-extrabold block mb-1 text-slate-700">الحالة والتوفر</label>
          <select value={draft.status} onChange={(e) => onChange({ ...draft, status: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 bg-white">
            <option value="متوفر">متوفر</option>
            <option value="غير متوفر">غير متوفر</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="text-xs font-extrabold block mb-1 text-slate-700">الوصف العام</label>
        <textarea rows={3} value={draft.description} onChange={(e) => onChange({ ...draft, description: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 bg-white" />
      </div>

      <div className="mb-6">
        <label className="text-xs font-extrabold block mb-1 text-slate-700">صورة المنتج (حفظ دائم بلا حدود)</label>
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white">
          <div className="w-24 h-24 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0 relative">
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#D31424]" />
            ) : draft.image ? (
              <img src={draft.image} alt="" className="w-full h-full object-contain" />
            ) : (
              <ImagePlus className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <div className="flex-1 space-y-2 w-full">
            <input
              value={draft.image?.startsWith("data:") ? "" : draft.image}
              onChange={(e) => onChange({ ...draft, image: e.target.value })}
              placeholder="ألصق رابط صورة مباشرة (URL)"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
            />
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-bold bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5">
                <ImagePlus className="w-4 h-4 text-[#D31424]" /> رفع صورة جديدة من الجهاز
              </button>
              {draft.image && (
                <button type="button" onClick={() => onChange({ ...draft, image: "" })} className="px-3 py-2 rounded-lg border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50">
                  إزالة الصورة
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </div>
            {imgErr && <p className="text-xs font-bold text-red-600">{imgErr}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-slate-200 text-slate-700 hover:bg-slate-300">
          إلغاء
        </button>
        <button type="button" disabled={saving || uploading || !draft.name || !draft.price} onClick={onSave} className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#D31424] hover:bg-[#990B17] flex items-center gap-2 disabled:opacity-50 shadow-md">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />} حفظ الصنف نهائياً
        </button>
      </div>
    </div>
  );
};

/* Admin Dashboard Component */
const AdminPanel = ({ products, setProducts, adminHash, setAdminHash, exchangeRate, setExchangeRate, currency, onExit, notify }) => {
  const [tab, setTab] = useState("products");
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");

  const persistProducts = async (next) => {
    setProducts(next);
    await safeStorage.set(PRODUCTS_KEY, JSON.stringify(next));
  };

  const startNew = () => { setDraft(emptyDraft); setEditing("new"); };
  const startEdit = (p) => { setDraft({ ...p, price: String(p.price) }); setEditing(p.id); };

  const save = async () => {
    setSaving(true);
    const clean = { ...draft, price: Number(draft.price) || 0 };
    let next;
    if (editing === "new") {
      const catCode = CATEGORIES.find((c) => c.key === clean.category)?.code || "GEN";
      const newId = `p${Date.now()}`;
      next = [{ ...clean, id: newId, code: `${catCode}-${String(products.length + 1).padStart(5, "0")}`, certifiedYear: new Date().getFullYear() }, ...products];
    } else {
      next = products.map((p) => (p.id === editing ? { ...p, ...clean } : p));
    }
    await persistProducts(next);
    setSaving(false); setEditing(null);
    notify(editing === "new" ? "تمت إضافة المنتج بالصورة وحفظه دائمياً بنجاح" : "تم تعديل الصنف والحد من الفقدان بنجاح", "ok");
  };

  const remove = async (id) => {
    if (!window.confirm("تأكيد حذف هذا المنتج وصورته نهائياً من الكتالوج؟")) return;
    await persistProducts(products.filter((p) => p.id !== id));
    notify("تم حذف الصنف واختفاؤه فورياً من الكتالوج لدى الجميع", "ok");
  };

  const filtered = q ? products.filter((p) => p.name.includes(q) || p.code.includes(q) || p.brand.includes(q)) : products;

  return (
    <div className="max-w-[100rem] mx-auto px-4 sm:px-8 py-8" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#0F172A] flex items-center justify-center text-[#D31424]">
            <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="font-black text-lg sm:text-2xl text-slate-900 leading-normal pb-1">
              لوحة إدارة الكتالوج والأسعار والبورصة — {BRAND_AR}
            </h1>
            <p className="text-xs font-bold text-slate-500">
              {products.length.toLocaleString("ar")} صنف مسجل · سعر البورصة: <b className="mono text-[#D31424]">1$ = {exchangeRate.toLocaleString("ar-IQ")} د.ع</b>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setTab("products")} className={`cat-pill ${tab === "products" ? "active" : ""}`}>
            قائمة المنتجات
          </button>
          <button onClick={() => setTab("security")} className={`cat-pill ${tab === "security" ? "active" : ""}`}>
            <TrendingUp className="w-4 h-4 text-amber-500" /> البورصة والرمز السري
          </button>
          <button onClick={onExit} className="cat-pill border-red-200 text-red-600 hover:bg-red-50">
            <LogOut className="w-4 h-4" /> خروج
          </button>
        </div>
      </div>

      {tab === "security" ? (
        <ChangePasswordPanel
          storedHash={adminHash}
          exchangeRate={exchangeRate}
          notify={notify}
          onSavedPassword={async (newHash) => {
            setAdminHash(newHash);
            await safeStorage.set(ADMIN_HASH_KEY, newHash);
          }}
          onSavedRate={async (newRate) => {
            setExchangeRate(newRate);
            await safeStorage.set(EXCHANGE_RATE_KEY, String(newRate));
          }}
        />
      ) : (
        <>
          {editing && (
            <ProductForm
              draft={draft}
              onChange={setDraft}
              onCancel={() => setEditing(null)}
              onSave={save}
              saving={saving}
              currency={currency}
              exchangeRate={exchangeRate}
            />
          )}

          <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
            <div className="relative max-w-md w-full">
              <Search className="absolute top-1/2 -translate-y-1/2 right-3.5 w-4 h-4 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="بحث..."
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
              />
            </div>
            <button onClick={startNew} className="px-6 py-2.5 rounded-xl text-sm font-extrabold text-white bg-[#D31424] hover:bg-[#990B17] flex items-center justify-center gap-2 shadow-md">
              <Plus className="w-4 h-4" /> إضافة صنف جديد
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-3 px-4 sm:px-6 py-3.5 text-xs font-black bg-[#0F172A] text-white">
              <span>الصورة</span>
              <span>الصنف</span>
              <span>السعر ($)</span>
              <span>السعر (د.ع)</span>
              <span>الحالة</span>
              <span>إجراءات</span>
            </div>
            <div className="max-h-[580px] overflow-y-auto">
              {filtered.slice(0, 200).map((p, idx) => (
                <div key={p.id} className={`grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-3 px-4 sm:px-6 py-3.5 items-center text-xs sm:text-sm border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                    {p.image ? (
                      <img src={p.image} alt="" className="w-full h-full object-contain p-0.5" />
                    ) : (
                      <CatIcon catKey={p.category} className="w-5 h-5 text-[#D31424]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-900 truncate">{p.name}</p>
                    <span className="mono text-[10.5px] text-slate-400 font-bold">{p.code}</span>
                  </div>
                  <span className="mono font-black text-slate-900">${p.price}</span>
                  <span className="mono font-bold text-slate-600 text-xs">
                    {formatPrice(p.price, "IQD", exchangeRate)}
                  </span>
                  <StatusStamp status={p.status} size="sm" />
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => startEdit(p)} className="p-2 rounded-lg border border-slate-300 text-slate-700">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => remove(p.id)} className="p-2 rounded-lg border border-red-200 text-red-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* MAIN APP COMPONENT */
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [products, setProducts] = useState([]);
  const [adminHash, setAdminHash] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_EXCHANGE_RATE);
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [view, setView] = useState("store");
  const [showLogin, setShowLogin] = useState(false);
  const [toast, setToast] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const notify = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const reloadData = async () => {
    let p = generateMockData(1400);
    try {
      const r = await safeStorage.get(PRODUCTS_KEY);
      const parsed = JSON.parse(r.value);
      if (Array.isArray(parsed) && parsed.length) p = parsed;
      else await safeStorage.set(PRODUCTS_KEY, JSON.stringify(p));
    } catch {
      await safeStorage.set(PRODUCTS_KEY, JSON.stringify(p));
    }
    setProducts(p);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const fallbackHash = await sha256Hex(DEFAULT_ADMIN_PASSWORD);
      if (!cancelled) setAdminHash(fallbackHash);

      await reloadData();

      try {
        const r = await safeStorage.get(ADMIN_HASH_KEY);
        if (r?.value && !cancelled) setAdminHash(r.value);
        else await safeStorage.set(ADMIN_HASH_KEY, fallbackHash);
      } catch {
        await safeStorage.set(ADMIN_HASH_KEY, fallbackHash);
      }

      try {
        const rateRes = await safeStorage.get(EXCHANGE_RATE_KEY);
        const parsedRate = Number(rateRes?.value);
        if (parsedRate && parsedRate > 0 && !cancelled) setExchangeRate(parsedRate);
        else await safeStorage.set(EXCHANGE_RATE_KEY, String(DEFAULT_EXCHANGE_RATE));
      } catch {
        await safeStorage.set(EXCHANGE_RATE_KEY, String(DEFAULT_EXCHANGE_RATE));
      }

      if (!cancelled) {
        setLoading(false);
      }
    })();

    // BroadcastChannel multi-tab real-time sync
    let bc;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        bc = new BroadcastChannel("tabira_channel");
        bc.onmessage = (e) => {
          if (e.data?.key === PRODUCTS_KEY && e.data?.value) {
            try {
              const updated = JSON.parse(e.data.value);
              if (Array.isArray(updated)) setProducts(updated);
            } catch { /* ignore */ }
          }
          if (e.data?.key === ADMIN_HASH_KEY && e.data?.value) {
            setAdminHash(e.data.value);
          }
          if (e.data?.key === EXCHANGE_RATE_KEY && e.data?.value) {
            const numRate = Number(e.data.value);
            if (numRate > 0) setExchangeRate(numRate);
          }
        };
      } catch { /* ignore */ }
    }

    const handleStorageChange = (e) => {
      if (e.key === PRODUCTS_KEY && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          if (Array.isArray(updated)) setProducts(updated);
        } catch { /* ignore */ }
      }
      if (e.key === ADMIN_HASH_KEY && e.newValue) {
        setAdminHash(e.newValue);
      }
      if (e.key === EXCHANGE_RATE_KEY && e.newValue) {
        const numRate = Number(e.newValue);
        if (numRate > 0) setExchangeRate(numRate);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      cancelled = true;
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const q = query.trim().toLowerCase();
      const matchesQ = !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || (p.brand || "").toLowerCase().includes(q) || (p.origin || "").toLowerCase().includes(q);
      const matchesCat = activeCat === "all" || p.category === activeCat;
      return matchesQ && matchesCat;
    });

    list.sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      return 0;
    });
    return list;
  }, [products, query, activeCat, sortBy]);

  useEffect(() => setPage(1), [query, activeCat, sortBy]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageItems = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const countByCat = useMemo(() => {
    const m = {};
    products.forEach((p) => (m[p.category] = (m[p.category] || 0) + 1));
    return m;
  }, [products]);

  const handleToggleCompare = (prod) => {
    if (compareList.some((p) => p.id === prod.id)) {
      setCompareList(compareList.filter((p) => p.id !== prod.id));
    } else {
      if (compareList.length >= 4) {
        notify("يمكنك مقارنة 4 أصناف كحد أقصى", "error");
        return;
      }
      setCompareList([...compareList, prod]);
      notify(`تمت إضافة ${prod.name} للمقارنة`, "ok");
    }
  };

  const handleCurrencyToggle = (newCurr) => {
    setCurrency(newCurr);
    notify(newCurr === "IQD" ? `تم تحويل أسعار الكتالوج إلى الدينار العراقي (1$ = ${exchangeRate.toLocaleString("ar-IQ")} د.ع)` : "تم تحويل أسعار الكتالوج إلى الدولار الأمريكي ($)", "ok");
  };

  if (view === "admin") {
    return (
      <div dir="rtl" className="min-h-screen bg-slate-100">
        <AdminPanel
          products={products}
          setProducts={setProducts}
          adminHash={adminHash}
          setAdminHash={setAdminHash}
          exchangeRate={exchangeRate}
          setExchangeRate={setExchangeRate}
          currency={currency}
          onExit={() => setView("store")}
          notify={notify}
        />
        <Toast toast={toast} />
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      
      {/* Animated Opening Splash Screen */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Top Announcement Bar */}
      <div className="bg-[#0F172A] text-slate-300 text-[11px] sm:text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-[100rem] mx-auto flex justify-between items-center gap-2">
          <div className="flex items-center gap-4 font-bold">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#D31424]" /> الكتالوج الرقمي الرسمي لمعدات السلامة</span>
            <span className="hidden md:flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-amber-400" /> معتمد دولياً ISO 9001</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden lg:inline text-slate-400 font-bold">
              البورصة: <b className="mono text-white">1$ = {exchangeRate.toLocaleString("ar-IQ")} د.ع</b>
            </span>
            <button onClick={() => setShowSplash(true)} className="text-slate-400 hover:text-white font-bold transition-colors">
              عرض الانترو ⚡
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-[100rem] mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          <TabiraLogo />

          <div className="flex items-center gap-3">
            
            <CurrencySwitcher
              currency={currency}
              onToggle={handleCurrencyToggle}
              exchangeRate={exchangeRate}
            />

            {compareList.length > 0 && (
              <button
                onClick={() => setIsCompareOpen(true)}
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center gap-1.5 border border-slate-300 transition-all">
                <Scale className="w-4 h-4 text-[#D31424]" />
                <span className="hidden sm:inline">المقارنة</span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#D31424] text-white mono text-[10px]">{compareList.length}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Executive Hero Section */}
      <section className="relative hero-glow-bg text-white overflow-hidden py-12 sm:py-20">
        <div className="absolute inset-0 blueprint-bg opacity-30 pointer-events-none" />
        
        <div className="max-w-[100rem] mx-auto px-4 sm:px-8 relative z-10 grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Right Column: Brand Title & Search */}
          <div className="lg:col-span-7 flex flex-col items-start justify-center">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-500/30 text-[#D31424] text-xs font-black mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="mono tracking-widest uppercase">{BRAND_EN} · OFFICIAL CATALOG</span>
            </div>

            <h1 className="font-black leading-normal pb-3 mb-2 text-white text-5xl sm:text-7xl lg:text-8xl tracking-tight">
              {BRAND_AR} <span className="text-[#D31424] font-black">.</span>
            </h1>

            <p className="text-slate-300 text-base sm:text-xl font-bold mb-6 text-slate-200">
              {BRAND_TAGLINE}
            </p>

            <div className="relative max-w-xl w-full">
              <Search className="absolute top-1/2 -translate-y-1/2 right-4 w-5 h-5 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث باسم الصنف، كود المعدة (مثل EXT-00042)..."
                className="w-full pr-12 pl-4 py-3.5 sm:py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-[#D31424] text-xs sm:text-sm shadow-2xl transition-all"
              />
            </div>
          </div>

          {/* Left Column: Official Logo Emblem Presentation */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#D31424] to-red-900 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition duration-700"></div>

              <div className="relative w-56 h-56 sm:w-72 sm:h-72 rounded-full p-2 bg-gradient-to-tr from-[#D31424] via-white/40 to-[#1E293B] shadow-2xl flex items-center justify-center backdrop-blur-md">
                <div className="w-full h-full rounded-full bg-white p-1 shadow-inner overflow-hidden flex items-center justify-center">
                  <img
                    src="./tabira-logo.jpg"
                    alt="TABIRA Logo"
                    className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full h-full rounded-full bg-[#0F172A] items-center justify-center">
                    <Flame className="w-24 h-24 text-[#D31424]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Main Catalog View Container */}
      <main className="max-w-[100rem] mx-auto px-4 sm:px-8 py-8 sm:py-10 flex-grow w-full">
        
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 hide-scrollbar -mx-1 px-1 mb-6">
          <button
            onClick={() => setActiveCat("all")}
            className={`cat-pill ${activeCat === "all" ? "active" : ""}`}>
            <ShieldCheck className="w-4 h-4" />
            <span>كافة الأقسام</span>
            <span className="mono text-xs opacity-75">({products.length})</span>
          </button>
          
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.key}
                onClick={() => setActiveCat(c.key)}
                className={`cat-pill ${activeCat === c.key ? "active" : ""}`}>
                <Icon className="w-4 h-4" />
                <span>{c.name}</span>
                <span className="mono text-xs opacity-75">({countByCat[c.key] || 0})</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500">
              عرض <b className="mono text-slate-900 text-sm">{filtered.length}</b> صنف
            </span>
            <span className="text-xs font-extrabold text-[#D31424] bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
              العملة: {currency === "IQD" ? `الدينار العراقي (1$ = ${exchangeRate.toLocaleString("ar-IQ")} د.ع)` : "الدولار الأمريكي ($)"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-extrabold rounded-xl px-3 py-2 border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none">
              <option value="newest">الأحدث تسجيلاً</option>
              <option value="price_asc">السعر: الأقل أولاً</option>
              <option value="price_desc">السعر: الأعلى أولاً</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-80 rounded-2xl skeleton-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-black text-base sm:text-lg text-slate-800 mb-1">لا توجد نتائج مطابقة للبحث</h3>
            <p className="text-xs text-slate-500 mb-4">جرّب البحث باسم آخر أو اختيار قسم مختلف.</p>
            <button onClick={() => { setQuery(""); setActiveCat("all"); }} className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#0F172A]">
              مسح الفلاتر
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
              {pageItems.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  currency={currency}
                  exchangeRate={exchangeRate}
                  onOpen={setSelectedProduct}
                  onToggleCompare={handleToggleCompare}
                  isCompared={compareList.some((c) => c.id === p.id)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 sm:p-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 disabled:opacity-30">
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                <span className="mono text-xs font-extrabold px-3.5 py-2 bg-white rounded-xl border border-slate-200">
                  صفحة {page} من {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 sm:p-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 disabled:opacity-30">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <ProductModal
        product={selectedProduct}
        currency={currency}
        exchangeRate={exchangeRate}
        onClose={() => setSelectedProduct(null)}
      />

      {isCompareOpen && (
        <ComparisonModal
          products={compareList}
          currency={currency}
          exchangeRate={exchangeRate}
          onClose={() => setIsCompareOpen(false)}
          onRemoveCompare={(id) => setCompareList(compareList.filter((p) => p.id !== id))}
        />
      )}

      {showLogin && (
        <AdminLoginModal
          storedHash={adminHash}
          onSuccess={() => { setView("admin"); setShowLogin(false); notify("تمت فتح لوحة الإدارة بنجاح", "ok"); }}
          onClose={() => setShowLogin(false)}
        />
      )}

      <Toast toast={toast} />

      <footer className="bg-[#0F172A] text-white border-t border-slate-800 pt-12 pb-8 mt-12">
        <div className="max-w-[100rem] mx-auto px-4 sm:px-8 grid sm:grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          <div>
            <TabiraLogo dark={true} />
            <p className="text-xs text-slate-400 leading-relaxed mt-4">
              {BRAND_AR} ({BRAND_EN}) — الكتالوج الموحد لمعدات أنظمة السلامة وإطفاء الحريق.
            </p>
          </div>

          <div>
            <h4 className="font-extrabold text-sm text-white mb-3">الأقسام التخصصية</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-bold">
              {CATEGORIES.map((c) => (
                <li key={c.key}>
                  <button onClick={() => { setActiveCat(c.key); window.scrollTo({ top: 300, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                    ▫️ {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-sm text-white mb-3">معايير الاعتماد</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• شهادات الفحص الهيدروستاتيكي</li>
              <li>• مطابقة مواصفات الدفاع المدني</li>
              <li>• اعتمادات ISO 9001 & NFPA</li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-sm text-white mb-3">الكتالوج الرقمي</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              تصفح فورياً لأكثر من 1,400 صنف مفحوص ومطابق لأعلى معايير السلامة الدولية.
            </p>
          </div>
        </div>

        <div className="max-w-[100rem] mx-auto px-4 sm:px-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-bold">
          <p>© {new Date().getFullYear()} {BRAND_AR} ({BRAND_EN}) — جميع الحقوق محفوظة.</p>
          
          <div className="flex items-center gap-3">
            <span className="mono text-[10.5px]">TABIRA SAFETY DIRECTORY</span>
            
            <button
              onClick={() => setShowLogin(true)}
              title="دخول الإدارة المحمية"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1">
              <Lock className="w-4 h-4 text-[#D31424]" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
