/* =========================================================
   EL ZOZ ADMIN PANEL CONTROLLER
   ========================================================= */

const ADMIN_CREDENTIALS = {
    username: "elzoz123",
    password: "elzoz123"
};
const SESSION_KEY = "elzoz_admin_logged_in_v1";

let adminProducts = getStoreProducts();
let adminSettings = getStoreSettings();

// ================= AUTHENTICATION =================
function checkAdminAuth() {
    const isLoggedIn = sessionStorage.getItem(SESSION_KEY) === "true";
    document.getElementById("loginScreen").classList.toggle("hidden", isLoggedIn);
    document.getElementById("dashboardApp").classList.toggle("hidden", !isLoggedIn);

    if (isLoggedIn) {
        initDashboardUI();
    }
}

function handleAdminLogin(e) {
    e.preventDefault();
    const user = document.getElementById("loginUser").value.trim();
    const pass = document.getElementById("loginPass").value.trim();
    const errEl = document.getElementById("loginError");

    if (user === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
        sessionStorage.setItem(SESSION_KEY, "true");
        errEl.style.display = "none";
        checkAdminAuth();
    } else {
        errEl.style.display = "block";
    }
}

function togglePasswordVisibility() {
    const passInput = document.getElementById("loginPass");
    passInput.type = passInput.type === "password" ? "text" : "password";
}

function logoutAdmin() {
    sessionStorage.removeItem(SESSION_KEY);
    checkAdminAuth();
}

// ================= TABS & STATS =================
function switchTab(tabId, btnEl) {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btnEl.classList.add("active");
    document.getElementById(tabId).classList.add("active");
}

function showToast(message) {
    const toast = document.getElementById("toastMsg");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2600);
}

function updateStats() {
    document.getElementById("statProductsCount").textContent = adminProducts.length;
    document.getElementById("statPromosCount").textContent = Object.keys(adminSettings.promoCodes || {}).length;
    document.getElementById("statWhatsapp").textContent = adminSettings.whatsappNumber || "-";
}

function initDashboardUI() {
    adminProducts = getStoreProducts();
    adminSettings = getStoreSettings();
    updateStats();
    renderAdminProductsList();
    resetProductForm();
    loadBannerForm();
    loadSettingsForm();
}

// ================= IMAGE COMPRESSION & UPLOAD HELPER =================
function compressImageFile(file, callback) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 750;
            let width = img.width;
            let height = img.height;

            if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
            callback(dataUrl);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function uploadImageToField(fileInput, targetInputId, previewImgId) {
    const file = fileInput.files[0];
    if (!file) return;
    compressImageFile(file, (dataUrl) => {
        document.getElementById(targetInputId).value = dataUrl;
        if (previewImgId) {
            const prev = document.getElementById(previewImgId);
            if (prev) prev.src = dataUrl;
        }
        showToast("تم تجهيز الصورة بنجاح ✅");
    });
}

// ================= PRODUCTS CRUD =================
function addColorVariantRow(colorObj = { name: "أسود", hex: "#111111", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=700&q=80" }) {
    const container = document.getElementById("colorVariantsContainer");
    const row = document.createElement("div");
    row.className = "variant-row";

    const uniqueId = "var_" + Date.now() + "_" + Math.floor(Math.random() * 1000);

    row.innerHTML = `
        <div class="variant-top">
            <input type="text" class="var-name" value="${colorObj.name}" placeholder="اسم اللون (أسود / أبيض)" required>
            <input type="color" class="var-hex" value="${colorObj.hex}" title="اختر درجة اللون">
            <button type="button" class="danger-btn" onclick="removeColorVariantRow(this)" title="حذف اللون">✖</button>
        </div>
        <div class="variant-img-row">
            <input type="text" id="${uniqueId}_url" class="var-image" value="${colorObj.image}" placeholder="رابط الصورة أو ارفع من جهازك" oninput="document.getElementById('${uniqueId}_img').src = this.value" required>
            <label class="file-upload-btn">
                📷 رفع صورة
                <input type="file" accept="image/*" onchange="uploadImageToField(this, '${uniqueId}_url', '${uniqueId}_img')">
            </label>
            <img id="${uniqueId}_img" class="mini-thumb" src="${colorObj.image}" alt="preview">
        </div>
    `;
    container.appendChild(row);
}

function removeColorVariantRow(btn) {
    const container = document.getElementById("colorVariantsContainer");
    if (container.children.length <= 1) {
        alert("لازم يكون فيه لون وصورة واحدة على الأقل للتيشرت!");
        return;
    }
    btn.closest(".variant-row").remove();
}

function resetProductForm() {
    document.getElementById("productForm").reset();
    document.getElementById("editProductId").value = "";
    document.getElementById("formModeTitle").textContent = "+ إضافة تيشرت جديد";
    document.getElementById("saveProdBtn").textContent = "حفظ ونشر التيشرت في الموقع ✅";
    document.getElementById("cancelEditBtn").classList.add("hidden");

    document.querySelectorAll("#prodSizesBoxes input").forEach(chk => {
        chk.checked = ["M", "L", "XL", "XXL"].includes(chk.value);
    });

    const container = document.getElementById("colorVariantsContainer");
    container.innerHTML = "";
    addColorVariantRow();
}

function saveProductFromAdmin(e) {
    e.preventDefault();

    const editId = document.getElementById("editProductId").value;
    const name = document.getElementById("prodName").value.trim();
    const description = document.getElementById("prodDesc").value.trim();
    const price = Number(document.getElementById("prodPrice").value);
    const oldPrice = Number(document.getElementById("prodOldPrice").value) || 0;
    const category = document.getElementById("prodCategory").value;
    const gsm = document.getElementById("prodGsm").value.trim() || "280 GSM";

    const sizes = Array.from(document.querySelectorAll("#prodSizesBoxes input:checked")).map(c => c.value);
    if (sizes.length === 0) {
        alert("اختار مقاس واحد على الأقل!");
        return;
    }

    const colors = Array.from(document.querySelectorAll("#colorVariantsContainer .variant-row")).map(row => ({
        name: row.querySelector(".var-name").value.trim() || "أسود",
        hex: row.querySelector(".var-hex").value,
        image: row.querySelector(".var-image").value.trim()
    }));

    if (editId) {
        const idx = adminProducts.findIndex(p => String(p.id) === String(editId));
        if (idx !== -1) {
            adminProducts[idx] = { ...adminProducts[idx], name, description, price, oldPrice, category, gsm, sizes, colors };
        }
        showToast("تم تعديل التيشرت بنجاح! ✅");
    } else {
        const newId = adminProducts.length > 0 ? Math.max(...adminProducts.map(p => p.id)) + 1 : 1;
        adminProducts.unshift({ id: newId, name, description, price, oldPrice, category, gsm, sizes, colors });
        showToast("تمت إضافة التيشرت الجديد للمتجر! 🔥");
    }

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(adminProducts));
    renderAdminProductsList();
    updateStats();
    resetProductForm();
}

function editAdminProduct(id) {
    const product = adminProducts.find(p => p.id === id);
    if (!product) return;

    document.getElementById("editProductId").value = product.id;
    document.getElementById("prodName").value = product.name;
    document.getElementById("prodDesc").value = product.description || "";
    document.getElementById("prodPrice").value = product.price;
    document.getElementById("prodOldPrice").value = product.oldPrice || "";
    document.getElementById("prodCategory").value = product.category || "oversized";
    document.getElementById("prodGsm").value = product.gsm || "280 GSM";

    document.querySelectorAll("#prodSizesBoxes input").forEach(chk => {
        chk.checked = product.sizes.includes(chk.value);
    });

    const container = document.getElementById("colorVariantsContainer");
    container.innerHTML = "";
    product.colors.forEach(c => addColorVariantRow(c));

    document.getElementById("formModeTitle").textContent = `✏️ تعديل: ${product.name}`;
    document.getElementById("saveProdBtn").textContent = "حفظ التعديلات 💾";
    document.getElementById("cancelEditBtn").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteAdminProduct(id) {
    if (!confirm("متأكد إنك عاوز تحذف التيشرت ده من الموقع؟")) return;
    adminProducts = adminProducts.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(adminProducts));
    renderAdminProductsList();
    updateStats();
    showToast("تم حذف التيشرت 🗑️");
}

function renderAdminProductsList() {
    const container = document.getElementById("adminProductsList");
    if (adminProducts.length === 0) {
        container.innerHTML = `<p class="hint-text">مفيش تيشرتات حالياً. ضيف أول تيشرت من الفورم!</p>`;
        return;
    }

    container.innerHTML = adminProducts.map(p => {
        const thumb = (p.colors && p.colors[0]) ? p.colors[0].image : "";
        return `
            <div class="admin-prod-item">
                <div class="admin-prod-info">
                    <img src="${thumb}" alt="${p.name}">
                    <div>
                        <strong>${p.name}</strong><br>
                        <small style="color:var(--neon-lime);">${p.price} جنيه • ${p.colors.length} ألوان</small><br>
                        <small class="hint-text">${(p.description || '').slice(0, 55)}...</small>
                    </div>
                </div>
                <div class="admin-prod-actions">
                    <button type="button" class="small-lime-btn" onclick="editAdminProduct(${p.id})">تعديل</button>
                    <button type="button" class="danger-btn" onclick="deleteAdminProduct(${p.id})">حذف</button>
                </div>
            </div>
        `;
    }).join("");
}

// ================= BANNER & 4-STAGE EDITOR =================
function loadBannerForm() {
    document.getElementById("heroImgUrlInput").value = adminSettings.heroImage || "";
    document.getElementById("heroImgPreview").src = adminSettings.heroImage || "";
    document.getElementById("hudTitleInput").value = adminSettings.hudTitle || "";
    document.getElementById("hudSubInput").value = adminSettings.hudSubtitle || "";
    document.getElementById("catalogHeadingInput").value = adminSettings.catalogHeading || "";
    document.getElementById("promoBannerInput").value = adminSettings.promoBannerText || "";

    const st = adminSettings.stages;
    document.getElementById("s1Title").value = st.s1Title || "";
    document.getElementById("s1Desc").value = st.s1Desc || "";
    document.getElementById("s2Title").value = st.s2Title || "";
    document.getElementById("s2Desc").value = st.s2Desc || "";
    document.getElementById("s3Title").value = st.s3Title || "";
    document.getElementById("s3Desc").value = st.s3Desc || "";
    document.getElementById("s4Title").value = st.s4Title || "";
    document.getElementById("s4Desc").value = st.s4Desc || "";
}

function previewHeroImage() {
    document.getElementById("heroImgPreview").src = document.getElementById("heroImgUrlInput").value;
}

function saveBannerSettings() {
    adminSettings.heroImage = document.getElementById("heroImgUrlInput").value.trim();
    adminSettings.hudTitle = document.getElementById("hudTitleInput").value.trim();
    adminSettings.hudSubtitle = document.getElementById("hudSubInput").value.trim();
    adminSettings.catalogHeading = document.getElementById("catalogHeadingInput").value.trim();
    adminSettings.promoBannerText = document.getElementById("promoBannerInput").value.trim();

    adminSettings.stages = {
        s1Title: document.getElementById("s1Title").value,
        s1Desc: document.getElementById("s1Desc").value,
        s2Title: document.getElementById("s2Title").value,
        s2Desc: document.getElementById("s2Desc").value,
        s3Title: document.getElementById("s3Title").value,
        s3Desc: document.getElementById("s3Desc").value,
        s4Title: document.getElementById("s4Title").value,
        s4Desc: document.getElementById("s4Desc").value
    };

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(adminSettings));
    showToast("تم تحديث البانر وصور العرض بنجاح! 🖼️");
}

// ================= GENERAL SETTINGS & PROMOS =================
function loadSettingsForm() {
    document.getElementById("brandNameInput").value = adminSettings.brandName || "EL ZOZ";
    document.getElementById("whatsappInput").value = adminSettings.whatsappNumber || "201000000000";
    document.getElementById("footerSubInput").value = adminSettings.footerSubText || "";
    renderAdminPromos();
}

function saveGeneralSettings() {
    adminSettings.brandName = document.getElementById("brandNameInput").value.trim() || "EL ZOZ";
    adminSettings.whatsappNumber = document.getElementById("whatsappInput").value.trim() || "201000000000";
    adminSettings.footerSubText = document.getElementById("footerSubInput").value.trim();

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(adminSettings));
    updateStats();
    showToast("تم حفظ الإعدادات ورقم الواتساب ✅");
}

function renderAdminPromos() {
    const list = document.getElementById("adminPromosList");
    const promos = adminSettings.promoCodes || {};
    const entries = Object.entries(promos);

    if (entries.length === 0) {
        list.innerHTML = `<p class="hint-text">لا توجد كوبونات خصم حالياً.</p>`;
        return;
    }

    list.innerHTML = entries.map(([code, val]) => `
        <div class="promo-item">
            <span><strong class="en-font" style="color:var(--neon-lime);">${code}</strong> — خصم ${Math.round(val * 100)}%</span>
            <button type="button" class="danger-btn" onclick="deletePromoCode('${code}')">حذف</button>
        </div>
    `).join("");
}

function addPromoCode() {
    const code = document.getElementById("newPromoCode").value.trim().toUpperCase();
    const pct = Number(document.getElementById("newPromoPercent").value);

    if (!code || !pct || pct <= 0 || pct > 90) {
        alert("اكتب اسم الكود ونسبة خصم صحيحة من 1 إلى 90!");
        return;
    }

    adminSettings.promoCodes[code] = pct / 100;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(adminSettings));
    document.getElementById("newPromoCode").value = "";
    document.getElementById("newPromoPercent").value = "";
    renderAdminPromos();
    updateStats();
    showToast(`تمت إضافة الكود ${code} 🎁`);
}

function deletePromoCode(code) {
    delete adminSettings.promoCodes[code];
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(adminSettings));
    renderAdminPromos();
    updateStats();
    showToast("تم حذف الكود");
}

// ================= EXPORT PRODUCTS.JS FOR DEPLOYMENT =================
function exportProductsJsFile() {
    const fileContent = `/* =========================================================
   EL ZOZ STORE - GENERATED DATA FILE
   ========================================================= */
const STORAGE_KEYS = {
    PRODUCTS: "elzoz_pro_products_v1",
    SETTINGS: "elzoz_pro_settings_v1",
    CART: "elzoz_pro_cart_v1"
};

const DEFAULT_SETTINGS = ${JSON.stringify(adminSettings, null, 4)};

const DEFAULT_PRODUCTS = ${JSON.stringify(adminProducts, null, 4)};

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
`;

    const blob = new Blob([fileContent], { type: "application/javascript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.js";
    a.click();
    URL.revokeObjectURL(url);
    showToast("تم تحميل ملف products.js المحدث! ⬇️");
}

function resetAllToDefault() {
    if (!confirm("تحذير: ده هيمسح كل التعديلات ويرجع التيشرتات والبانر للوضع الأصلي. متأكد؟")) return;
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    initDashboardUI();
    showToast("تمت استعادة الإعدادات الافتراضية 🔄");
}

checkAdminAuth();
