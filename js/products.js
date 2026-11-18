/* =========================================================
   EL ZOZ STORE - SHARED DATA & SYNC ENGINE
   ========================================================= */

const STORAGE_KEYS = {
    PRODUCTS: "elzoz_pro_products_v1",
    SETTINGS: "elzoz_pro_settings_v1",
    CART: "elzoz_pro_cart_v1"
};

const DEFAULT_SETTINGS = {
    brandName: "EL ZOZ",
    whatsappNumber: "201000000000",
    heroImage: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=85",
    hudTitle: "TACTILE WEAVE",
    hudSubtitle: "280 GSM HEAVY COTTON",
    catalogHeading: "كولكشن EL ZOZ المتاح",
    promoBannerText: "🎁 كود خصم 10%: ZOZ10",
    footerSubText: "شحن لجميع محافظات مصر • الدفع عند الاستلام أو فودافون كاش / انستا باي",
    stages: {
        s1Title: "دقة في كل\nتفصيلة وغرزة.",
        s1Desc: "تيشرتات مصممة بقصة أوفر سايز هندسية وخامة قطن مصري 100% تقيلة تمنحك هيبة وثبات في كل حركة.",
        s2Title: "اكسر\nالمألوف.",
        s2Desc: "كل قطعة مبنية بطبقات طباعة بارزة وتفاصيل جرافيك حصرية تخليك مختلف في أي مكان.",
        s3Title: "مصمم من\nالداخل ليدوم.",
        s3Desc: "نسيج قطني معالج ضد الانكماش والوبرة مع ياقة مزدوجة محبوكة تحافظ على شكلها الأصلي مهما اتغسلت.",
        s4Title: "إحساس مختلف\nتماماً في اللبس.",
        s4Desc: "إصدار محدود بكميات قليلة جداً.. اختار لونك ومقاسك واطلب أوردرك مباشرة على واتساب."
    },
    promoCodes: {
        "ZOZ10": 0.10,
        "VIP20": 0.20
    }
};

const DEFAULT_PRODUCTS = [
    {
        id: 1,
        name: "تيشرت أوفر سايز - سايبر دراجون",
        description: "قطن مصري 100% وزن 280 جرام معالج ضد الانكماش، قصة أوفر سايز مريحة مع طباعة عالية الكثافة.",
        category: "oversized",
        price: 450,
        oldPrice: 550,
        gsm: "280 GSM",
        sizes: ["M", "L", "XL", "XXL"],
        colors: [
            {
                name: "أسود",
                hex: "#111111",
                image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=700&q=80"
            },
            {
                name: "أبيض",
                hex: "#f2f2f2",
                image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700&q=80"
            }
        ]
    },
    {
        id: 2,
        name: "تيشرت ستريت وير - بيسك هيفي",
        description: "تصميم بيسك سادة تقيل بياقة مزدوجة محبوكة، مثالي للبس اليومي مع ثبات تام للون.",
        category: "basic",
        price: 380,
        oldPrice: 0,
        gsm: "260 GSM",
        sizes: ["S", "M", "L", "XL"],
        colors: [
            {
                name: "أبيض",
                hex: "#f2f2f2",
                image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700&q=80"
            },
            {
                name: "أسود",
                hex: "#111111",
                image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=700&q=80"
            }
        ]
    },
    {
        id: 3,
        name: "تيشرت جرافيك - نيون ماتريكس",
        description: "جرافيك ستريت وير حصري بألوان نيون مقاومة للغسيل مع تقفيل مزدوج للأكتاف.",
        category: "graphic",
        price: 480,
        oldPrice: 580,
        gsm: "280 GSM",
        sizes: ["M", "L", "XL", "XXL"],
        colors: [
            {
                name: "رمادي غامق",
                hex: "#3b403b",
                image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=700&q=80"
            },
            {
                name: "أسود",
                hex: "#111111",
                image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=700&q=80"
            }
        ]
    }
];

function getStoreSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS));
        if (!saved) return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
        return {
            ...DEFAULT_SETTINGS,
            ...saved,
            stages: { ...DEFAULT_SETTINGS.stages, ...(saved.stages || {}) },
            promoCodes: saved.promoCodes || DEFAULT_SETTINGS.promoCodes
        };
    } catch (e) {
        return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    }
}

function getStoreProducts() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
        if (Array.isArray(saved) && saved.length > 0) return saved;
        return JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
    } catch (e) {
        return JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
    }
}
