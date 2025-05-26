// เมนู toggle
const toggleBtn = document.querySelector('.n-toggle');
const siteHeader = document.querySelector('.site-header');

toggleBtn.addEventListener('click', () => {
    siteHeader.classList.toggle('menu-open');
});

// ปิดเมนูเมื่อคลิก link
document.querySelectorAll('.n-manu-ul a').forEach(link => {
    link.addEventListener('click', () => {
        siteHeader.classList.remove('menu-open');
    });
});

// Scroll แล้วเปลี่ยน header
window.addEventListener("scroll", function () {
    const header = document.querySelector(".site-header");
    if (window.scrollY > 10) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});

window.addEventListener("scroll", function () {
    const header = document.querySelector(".site-header");
    const logo = document.getElementById("logo-header");

    if (window.scrollY > 10) {
        header.classList.add("scrolled");
        logo.src = "https://img2.pic.in.th/pic/Nas-Phou.png"; // โลโก้ตอนสกอ
    } else {
        header.classList.remove("scrolled");
        logo.src = "https://img5.pic.in.th/file/secure-sv1/Nas-Phoue4bbf0bba2237bd1c.png"; // โลโก้ตอนปกติ
    }
});

// Smooth scroll ไป section
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.getElementById('toggleView');
    if (toggle) {
        toggle.addEventListener('change', function () {
            const allBotton = document.querySelector('.all-botton');
            const headEmbed = document.querySelector('.head-embed');

            if (this.checked) {
                allBotton.style.display = 'flex';
                headEmbed.style.display = 'none';
            } else {
                allBotton.style.display = 'none';
                headEmbed.style.display = 'flex';
            }
        });
    }
});

