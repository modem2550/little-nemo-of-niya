// ==================== SWITCHER ====================
document.querySelectorAll(".switcher").forEach((switcher) => {
    const options = Array.from(switcher.querySelectorAll(".switcher__option"));
    const radios = options.map(opt => opt.querySelector('input[type="radio"]'));
    const indicator = switcher.querySelector(".switcher__indicator");
    let currentIndex = Math.max(0, radios.findIndex(r => r && r.checked));
    let previousIndex = currentIndex;
    let resizeFrame = null;

    // เลื่อน indicator
    function moveIndicator(index, animate = true) {
        const opt = options[index];
        if (!opt) return;
        const optRect = opt.getBoundingClientRect();
        const switcherRect = switcher.getBoundingClientRect();
        indicator.style.transition = animate ? "transform 420ms cubic-bezier(1, 0.0, 0.4, 1)" : "none";
        indicator.style.width = "78px";
        indicator.style.height = "60px";
        indicator.style.transform = `translateX(${optRect.left - switcherRect.left - 12}px)`;
        indicator.classList.remove("pulse-left", "pulse-right");
        if (animate) indicator.classList.add(index > previousIndex ? "pulse-right" : "pulse-left");
        previousIndex = index;
    }

    moveIndicator(currentIndex, false);

    // event click / change ของแต่ละ option
    options.forEach((opt, idx) => {
        const radio = radios[idx];

        opt.addEventListener("click", (e) => {
            e.preventDefault();
            if (radio && !radio.checked) {
                radio.checked = true;
                radio.dispatchEvent(new Event("change", { bubbles: true }));
            }

            const href = opt.getAttribute("data-href");
            if (href && href.startsWith("#")) {
                const target = document.querySelector(href);
                if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });

        if (radio) {
            radio.addEventListener("change", () => {
                if (radio.checked) {
                    currentIndex = idx;
                    moveIndicator(currentIndex, true);
                }
            });
        }
    });

    // ปรับตำแหน่ง indicator เวลาขยาย/ย่อหน้าต่าง
    window.addEventListener("resize", () => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => moveIndicator(currentIndex, false));
    });
});

// ==================== INTERSECTION OBSERVER ====================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("show");
    });
}, { threshold: 0.2 });

// สังเกต element ที่ต้องการ animation
document.querySelectorAll(".slide-right, .fade-in").forEach(el => observer.observe(el));

// ==================== POPUP ====================
function openPopup() {
    document.getElementById("popup-overlay").style.display = "flex";
}
function closePopup() {
    document.getElementById("popup-overlay").style.display = "none";
}

function toSlug(text) {
    if (typeof text !== 'string') {
        // จัดการกรณีที่ input ไม่ใช่ string (เผื่อข้อมูล JSON มีปัญหา)
        return '';
    }
    // แปลงเป็นตัวพิมพ์เล็ก และแทนที่ช่องว่างด้วยขีดกลาง
    return text.toLowerCase().replace(/\s+/g, '-');
}

function renderSocialLinks(socialLinks) {
    const container = document.getElementById('social-links-container');
    if (!container) return;

    let htmlContent = '';

    socialLinks.forEach(item => {
        // ใช้ toSlug เพื่อสร้างชื่อคลาสจาก platform
        const slug = toSlug(item.platform);

        // 🔸 โครงสร้าง SVG Icon ถูกปรับให้มีคลาสตามตัวอย่างของคุณ
        const socialIconSvg = ` 
            <svg viewBox="0 0 512 512" class="svg-inline--fa fa-${slug}" data-icon="${slug}" data-prefix="fab" role="img" aria-hidden="true" data-fa-i2svg=""> 
                <use href="#${item.iconId}"></use> 
            </svg> 
        `;

        // SVG Arrow (ใช้ icon-arrow-right เดิม) 
        const arrowSvg = ` 
            <svg class="icon arrow-svg ms-1" width="24" height="24" style="height:1em;width:1em"> 
                <use href="#icon-arrow-right"></use> 
            </svg> 
        `;

        // 🔸 โครงสร้าง HTML ที่ใช้คลาส CSS เดิมทั้งหมด และใช้ tag <a> โดยตรง
        const linkHtml = ` 
            <div class="d-grid"> 
                <a href="${item.url}" class="social-box -${slug}" target="_blank" title="${item.platform}">
                    ${socialIconSvg} 
                    <div> 
                        <div class="fw-bold social-margin h6"> 
                            ${item.platform}${arrowSvg} 
                        </div> 
                        <div class="fw-bold social-margin h4">${item.username}</div> 
                    </div> 
                </a> 
            </div> 
        `;
        htmlContent += linkHtml;
    });
    container.innerHTML = htmlContent;
}

const modal = document.getElementById("adModal");
const closeBtn = document.getElementById("closeBtn");

// 1. สั่งให้แสดงหลังจากโหลดเสร็จ 2 วินาที
window.addEventListener('load', () => {
    setTimeout(() => {
        modal.style.display = "flex";
    }, 200);
});

// 2. ปิดเมื่อคลิกที่กากบาท
closeBtn.onclick = function () {
    modal.style.display = "none";
}

// 3. ปิดเมื่อคลิกพื้นที่ข้างนอกกล่อง
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}