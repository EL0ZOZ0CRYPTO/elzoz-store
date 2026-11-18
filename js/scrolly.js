/* =========================================================
   4-STAGE SCROLLYTELLING SHOWCASE ENGINE
   ========================================================= */
(function initScrollytelling() {
    const wrapper = document.getElementById("showcase");
    const centerObj = document.getElementById("centerObject");
    const garmentFrame = document.getElementById("garmentFrame");
    const ambientGlow = document.getElementById("ambientGlow");
    const stepCounter = document.getElementById("stepCounter");
    const progressBarFill = document.getElementById("progressBarFill");

    if (!wrapper || !centerObj) return;

    setTimeout(() => {
        centerObj.classList.remove("intro-zoom");
    }, 1400);

    function updateStageOnScroll() {
        const rect = wrapper.getBoundingClientRect();
        const maxScroll = rect.height - window.innerHeight;
        if (maxScroll <= 0) return;

        let progress = -rect.top / maxScroll;
        progress = Math.max(0, Math.min(1, progress));

        let step = 1;
        if (progress >= 0.75) step = 4;
        else if (progress >= 0.50) step = 3;
        else if (progress >= 0.25) step = 2;

        wrapper.setAttribute("data-step", step);
        stepCounter.textContent = `0${step}`;
        progressBarFill.style.width = `${step * 25}%`;

        for (let i = 1; i <= 4; i++) {
            const copyEl = document.getElementById(`copy-${i}`);
            if (copyEl) copyEl.classList.toggle("active", i === step);
        }

        const isMobile = window.innerWidth <= 960;

        if (step === 1) {
            centerObj.style.transform = isMobile
                ? "translateY(-14%) scale(0.95)"
                : "translateX(14%) rotateY(-12deg) rotateZ(-2deg) scale(1)";
            garmentFrame.style.transform = "rotateX(0deg)";
            ambientGlow.style.transform = "translateX(14%) scale(1)";
        } else if (step === 2) {
            centerObj.style.transform = isMobile
                ? "translateY(-14%) scale(1)"
                : "translateX(-12%) rotateY(10deg) rotateZ(3deg) scale(1.04)";
            garmentFrame.style.transform = "rotateX(4deg)";
            ambientGlow.style.transform = "translateX(-12%) scale(1.15)";
        } else if (step === 3) {
            centerObj.style.transform = isMobile
                ? "translateY(-14%) scale(0.95)"
                : "translateX(15%) scale(1.05)";
            ambientGlow.style.transform = "translateX(15%) scale(1.2)";
        } else if (step === 4) {
            centerObj.style.transform = isMobile
                ? "translateY(-14%) scale(0.95)"
                : "translateX(-14%) perspective(900px) rotateX(14deg) rotateY(16deg) scale(1.02)";
            garmentFrame.style.transform = "rotateX(6deg)";
            ambientGlow.style.transform = "translateX(-14%) scale(1.1)";
        }
    }

    window.addEventListener("scroll", updateStageOnScroll, { passive: true });
    window.addEventListener("resize", updateStageOnScroll);
    updateStageOnScroll();

    document.querySelectorAll("[data-jump]").forEach(link => {
        link.addEventListener("click", (e) => {
            const ratio = parseFloat(link.getAttribute("data-jump"));
            if (!isNaN(ratio)) {
                e.preventDefault();
                const targetY = wrapper.offsetTop + (wrapper.offsetHeight - window.innerHeight) * ratio;
                window.scrollTo({ top: targetY, behavior: "smooth" });
            }
        });
    });
})();
