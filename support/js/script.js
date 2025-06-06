document.addEventListener('DOMContentLoaded', function () {
    const toggleBtn = document.querySelector('.n-toggle');
    const siteHeader = document.querySelector('.site-header');

    toggleBtn?.addEventListener('click', () => {
        console.log('Toggle clicked');
        siteHeader.classList.toggle('menu-open');
    });

    document.querySelectorAll('.n-manu-ul a').forEach(link => {
        link.addEventListener('click', () => {
            siteHeader.classList.remove('menu-open');
        });
    });

    // Scroll แล้วเปลี่ยน header
    const logo = document.getElementById("logo-header");

    window.addEventListener("scroll", function () {
        if (window.scrollY > 10) {
            siteHeader.classList.add("scrolled");
            logo.src = "/support/logo/pink.png";
        } else {
            siteHeader.classList.remove("scrolled");
            logo.src = "/support/logo/white.png";
        }
    });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // toggleView logic
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

