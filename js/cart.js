/* =========================================================
   STOREFRONT RENDERER, LIVE SETTINGS SYNC, CART & WHATSAPP
   ========================================================= */

let STORE_SETTINGS = getStoreSettings();
let PRODUCTS_LIST = getStoreProducts();
let cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART)) || [];
let selectedSizes = {};
let selectedColors = {};
let currentFilter = "all";
let activeDiscount = 0;
let appliedPromoCode = "";

// تطبيق إعدادات البانر والنصوص المحفوظة من لوحة التحكم
function applyStorefrontSettings() {
    STORE_SETTINGS = getStoreSettings();
    PRODUCTS_LIST = getStoreProducts();

    const brandName = STORE_SETTINGS.brandName || "EL ZOZ";
    document.title = `${brandName} | Engineered Streetwear`;
    const navBrand = document.getElementById("navBrandName");
    const navMark = document.getElementById("navBrandMark");
    if (navBrand) navBrand.textContent = brandName;
    if (navMark) navMark.textContent = brandName.trim().charAt(0).toUpperCase();

    const heroImg = document.getElementById("heroGarmentImg");
    if (heroImg && STORE_SETTINGS.heroImage) heroImg.src = STORE_SETTINGS.heroImage;

    const hudTitle = document.getElementById("hudTitle");
    const hudSub = document.getElementById("hudSubtitle");
    if (hudTitle) hudTitle.textContent = STORE_SETTINGS.hudTitle;
    if (hudSub) hudSub.textContent = STORE_SETTINGS.hudSubtitle;

    const st = STORE_SETTINGS.stages;
    const formatLines = (txt) => (txt || "").replace(/\n/g, "<br>");
    if (document.getElementById("stage1Title")) document.getElementById("stage1Title").innerHTML = formatLines(st.s1Title);
    if (document.getElementById("stage1Desc")) document.getElementById("stage1Desc").textContent = st.s1Desc;
    if (document.getElementById("stage2Title")) document.getElementById("stage2Title").innerHTML = formatLines(st.s2Title);
    if (document.getElementById("stage2Desc")) document.getElementById("stage2Desc").textContent = st.s2Desc;
    if (document.getElementById("stage3Title")) document.getElementById("stage3Title").innerHTML = formatLines(st.s3Title);
    if (document.getElementById("stage3Desc")) document.getElementById("stage3Desc").textContent = st.s3Desc;
    if (document.getElementById("stage4Title")) document.getElementById("stage4Title").innerHTML = formatLines(st.s4Title);
    if (document.getElementById("stage4Desc")) document.getElementById("stage4Desc").textContent = st.s4Desc;

    const catHead = document.getElementById("catalogHeading");
    if (catHead) catHead.innerHTML = STORE_SETTINGS.catalogHeading;

    const promoBanner = document.getElementById("promoBannerText");
    if (promoBanner) promoBanner.textContent = STORE_SETTINGS.promoBannerText;

    const footerBrand = document.getElementById("footerBrandText");
    const footerSub = document.getElementById("footerSubText");
    if (footerBrand) footerBrand.textContent = `${brandName} STREETWEAR © 2026`;
    if (footerSub) footerSub.textContent = STORE_SETTINGS.footerSubText;
}

// عرض المنتجات في الكاتالوج
function renderCatalog() {
    const grid = document.getElementById("productsGrid");
    if (!grid) return;

    const filtered = currentFilter === "all"
        ? PRODUCTS_LIST
        : PRODUCTS_LIST.filter(p => p.category === currentFilter);

    if (filtered.length === 0) {
        grid.innerHTML = `<p style="color:var(--text-muted); text-align:center; grid-column:1/-1; padding:40px 0;">لا توجد تيشرتات في هذا القسم حالياً.</p>`;
        return;
    }

    grid.innerHTML = filtered.map(product => {
        if (!selectedSizes[product.id]) selectedSizes[product.id] = product.sizes[0] || "L";
        if (selectedColors[product.id] === undefined) selectedColors[product.id] = 0;

        const colorIdx = selectedColors[product.id] < product.colors.length ? selectedColors[product.id] : 0;
        const activeColor = product.colors[colorIdx];

        const swatchesHTML = product.colors.map((c, index) => `
            <button type="button"
                    class="color-swatch ${colorIdx === index ? 'active' : ''}"
                    style="background-color: ${c.hex};"
                    title="${c.name}"
                    onclick="selectProductColor(${product.id}, ${index})"></button>
        `).join("");

        const sizesHTML = product.sizes.map(size => `
            <button type="button"
                    class="size-option en-font ${selectedSizes[product.id] === size ? 'active' : ''}"
                    onclick="selectProductSize(${product.id}, '${size}')">${size}</button>
        `).join("");

        const saleBadge = (product.oldPrice && product.oldPrice > product.price)
            ? `<span class="sale-tag">وفر ${product.oldPrice - product.price} ج</span>`
            : "";

        const oldPriceHTML = (product.oldPrice && product.oldPrice > product.price)
            ? `<span class="old-price">${product.oldPrice} جنيه</span>`
            : "";

        return `
            <article class="product-card">
                <div class="card-media" onclick="openProductDetails(${product.id})">
                    <span class="gsm-tag en-font">${product.gsm || '280 GSM'}</span>
                    ${saleBadge}
                    <img src="${activeColor.image}" alt="${product.name}">
                </div>
                <div class="card-content">
                    <h3 class="card-title">${product.name}</h3>
                    <p class="card-desc">${product.description || ''}</p>
                    <div class="price-row">
                        <span class="card-price">${product.price} جنيه</span>
                        ${oldPriceHTML}
                    </div>

                    <div class="color-picker-row">
                        <span style="font-size:0.85rem; color:var(--text-muted);">اللون (${activeColor.name}):</span>
                        ${swatchesHTML}
                    </div>

                    <div class="size-picker-row">${sizesHTML}</div>

                    <div class="card-actions-row">
                        <button type="button" class="add-to-cart-btn" onclick="addProductToCart(${product.id})">
                            + أضف إلى السلة
                        </button>
                        <button type="button" class="info-icon-btn" onclick="openProductDetails(${product.id})" title="تفاصيل التيشرت">
                            الوصف
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

function openProductDetails(productId) {
    const product = PRODUCTS_LIST.find(p => p.id === productId);
    if (!product) return;
    const colorIdx = selectedColors[product.id] || 0;
    const activeColor = product.colors[colorIdx] || product.colors[0];

    const body = document.getElementById("detailsModalBody");
    body.innerHTML = `
        <div class="modal-top">
            <h3>${product.name}</h3>
            <button class="close-icon" onclick="toggleDetailsModal(false)">✖</button>
        </div>
        <img src="${activeColor.image}" alt="${product.name}">
        <p style="color:var(--text-white); line-height:1.7; margin-bottom:14px;">${product.description || ''}</p>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <span style="color:var(--neon-lime); font-size:1.3rem; font-weight:900;">${product.price} جنيه</span>
            <span class="en-font" style="color:var(--text-muted); font-size:0.85rem;">${product.gsm || '280 GSM'}</span>
        </div>
        <button type="button" class="add-to-cart-btn" onclick="addProductToCart(${product.id}); toggleDetailsModal(false);">
            + أضف للسلة (لون ${activeColor.name} - مقاس ${selectedSizes[product.id]})
        </button>
    `;
    toggleDetailsModal(true);
}

function toggleDetailsModal(open) {
    document.getElementById("detailsModal").style.display = open ? "grid" : "none";
}

function selectProductColor(productId, colorIdx) {
    selectedColors[productId] = colorIdx;
    renderCatalog();
}

function selectProductSize(productId, size) {
    selectedSizes[productId] = size;
    renderCatalog();
}

document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.getAttribute("data-filter");
        renderCatalog();
    });
});

function addProductToCart(productId) {
    const product = PRODUCTS_LIST.find(p => p.id === productId);
    if (!product) return;

    const size = selectedSizes[productId] || product.sizes[0];
    const colorIdx = selectedColors[productId] || 0;
    const color = product.colors[colorIdx].name;

    const existing = cart.find(item => item.id === productId && item.size === size && item.color === color);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            size,
            color,
            qty: 1
        });
    }

    syncCartUI();
    toggleCart(true);
}

function changeItemQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    syncCartUI();
}

function removeCartItem(index) {
    cart.splice(index, 1);
    syncCartUI();
}

function applyPromoCode() {
    const code = document.getElementById("promoInput").value.trim().toUpperCase();
    const feedback = document.getElementById("promoFeedback");
    const promos = STORE_SETTINGS.promoCodes || {};

    if (promos[code]) {
        activeDiscount = promos[code];
        appliedPromoCode = code;
        feedback.style.color = "#c8ff00";
        feedback.textContent = `✅ تم تفعيل خصم ${Math.round(activeDiscount * 100)}% بنجاح!`;
    } else {
        activeDiscount = 0;
        appliedPromoCode = "";
        feedback.style.color = "#ff5c5c";
        feedback.textContent = "❌ كود الخصم غير صحيح.";
    }
    syncCartUI();
}

function syncCartUI() {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));

    const listEl = document.getElementById("cartItemsList");
    const countEl = document.getElementById("cartCount");
    const totalEl = document.getElementById("cartTotal");

    let totalQty = 0;
    let subtotal = 0;

    if (cart.length === 0) {
        listEl.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:30px 0;">السلة فاضية حالياً.. اختار تيشرتك المفضل!</p>`;
    } else {
        listEl.innerHTML = cart.map((item, idx) => {
            totalQty += item.qty;
            subtotal += item.price * item.qty;
            return `
                <div class="cart-item-card">
                    <div>
                        <strong>${item.name}</strong><br>
                        <small style="color:var(--text-muted);">اللون: ${item.color} | المقاس: ${item.size}</small><br>
                        <span style="color:var(--neon-lime); font-weight:800;">${item.price * item.qty} جنيه</span>
                        <div class="qty-controls">
                            <button type="button" class="qty-btn" onclick="changeItemQty(${idx}, -1)">-</button>
                            <span class="en-font">${item.qty}</span>
                            <button type="button" class="qty-btn" onclick="changeItemQty(${idx}, 1)">+</button>
                        </div>
                    </div>
                    <button type="button" class="remove-btn" onclick="removeCartItem(${idx})">حذف</button>
                </div>
            `;
        }).join("");
    }

    const finalTotal = Math.round(subtotal * (1 - activeDiscount));
    countEl.textContent = totalQty;
    totalEl.textContent = activeDiscount > 0
        ? `${finalTotal} جنيه (بدلاً من ${subtotal})`
        : `${subtotal} جنيه`;
}

function toggleCart(open) {
    document.getElementById("cartDrawer").classList.toggle("open", open);
    document.getElementById("cartOverlay").style.display = open ? "block" : "none";
}

function toggleSizeModal(open) {
    document.getElementById("sizeModal").style.display = open ? "grid" : "none";
}

function checkoutViaWhatsApp() {
    if (cart.length === 0) {
        alert("السلة فاضية! ضيف تيشرت واحد على الأقل الأول.");
        return;
    }

    const name = document.getElementById("custName").value.trim();
    const phone = document.getElementById("custPhone").value.trim();
    const address = document.getElementById("custAddress").value.trim();
    const payment = document.getElementById("paymentMethod").value;

    if (!name || !phone || !address) {
        alert("من فضلك املا بيانات الشحن (الاسم، الموبايل، العنوان) الأول!");
        return;
    }

    const brand = STORE_SETTINGS.brandName || "EL ZOZ";
    const waNumber = (STORE_SETTINGS.whatsappNumber || "201000000000").replace(/[^0-9]/g, "");

    let msg = `⚡ *طلب جديد - ${brand} STORE* ⚡\n\n`;
    msg += `👤 *الاسم:* ${name}\n`;
    msg += `📱 *الموبايل:* ${phone}\n`;
    msg += `📍 *العنوان:* ${address}\n`;
    msg += `💳 *طريقة الدفع:* ${payment}\n`;
    msg += `------------------------\n`;
    msg += `🛍️ *المنتجات المطلوبة:*\n`;

    let subtotal = 0;
    cart.forEach((item, i) => {
        const lineTotal = item.price * item.qty;
        subtotal += lineTotal;
        msg += `${i + 1}. ${item.name} (${item.color} - مقاس ${item.size}) × ${item.qty} = ${lineTotal} ج\n`;
    });

    const finalTotal = Math.round(subtotal * (1 - activeDiscount));
    msg += `------------------------\n`;
    if (activeDiscount > 0) {
        msg += `🎟️ *كود الخصم:* ${appliedPromoCode} (${Math.round(activeDiscount * 100)}%)\n`;
    }
    msg += `💰 *الإجمالي المطلوب:* ${finalTotal} جنيه (غير شامل الشحن)`;

    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank");
}

// استماع للتحديثات الفورية لو صاحب المتجر عدّل حاجة من admin.html في تاب تاني
window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEYS.PRODUCTS || e.key === STORAGE_KEYS.SETTINGS) {
        applyStorefrontSettings();
        renderCatalog();
    }
});

applyStorefrontSettings();
renderCatalog();
syncCartUI();
