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

function formatDate(startDateString, endDateString) {
    if (!startDateString) return '';

    const months = [
        "JAN", "FEB", "MAR", "APR", "MAY", "JUN", 
        "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
    ];

    const parseAndExtract = (dateString) => {
        // ใช้ .replace(/-/g, '/') เพื่อให้ Date object ตีความเป็น Local Time ที่ถูกต้อง
        const date = new Date(dateString.replace(/-/g, '/'));
        return {
            day: date.getDate().toString().padStart(2, '0'),
            month: months[date.getMonth()],
            year: date.getFullYear()
        };
    };

    const start = parseAndExtract(startDateString);

    if (!endDateString) {
        return `${start.day} ${start.month} ${start.year}`;
    }

    const end = parseAndExtract(endDateString);

    if (start.month === end.month && start.year === end.year) {
        return `${start.day}-${end.day} ${end.month} ${end.year}`;
    } 
    
    return `${start.day} ${start.month} ${start.year} - ${end.day} ${end.month} ${end.year}`;
}


// 2. ฟังก์ชันหลักสำหรับแสดงผล Event (แก้ไข Logic การกรอง)
function renderEvents(eventData, containerId, filterUpcoming) {
    const container = document.getElementById(containerId);
    if (!container) return; 

    container.innerHTML = ''; 

    // *** การกำหนด Today (แปลงเป็น Milliseconds ที่ 00:00:00) ***
    const now = new Date();
    const todayString = `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}`;
    const todayMidnight = new Date(todayString);
    todayMidnight.setHours(0, 0, 0, 0); 
    const todayMS = todayMidnight.getTime(); 

    eventData.forEach(event => {
        
        // 1. เตรียม Start Date (สำหรับ Event วันเดียว)
        const startDate = new Date(event.date.replace(/-/g, '/'));
        
        // 2. เตรียม End Date Object สำหรับการกรอง
        let filterDate = null;
        if (event.end_date) {
            filterDate = new Date(event.end_date.replace(/-/g, '/'));
            // *** สำคัญมาก: ตั้งค่าให้เป็น 23:59:59 ของวันสิ้นสุด
            filterDate.setHours(23, 59, 59, 999); 
        } else {
            // Event วันเดียว ก็ต้องตั้งค่าให้เป็น 23:59:59 ของวันนั้นๆ
            filterDate = new Date(event.date.replace(/-/g, '/'));
            filterDate.setHours(23, 59, 59, 999);
        }
        
        const filterDateMS = filterDate.getTime(); // Milliseconds ของวันสิ้นสุด ณ 23:59:59

        let isDisplayed = true;
        let specialClass = ''; 

        // *** LOGIC การกรอง (ใช้ Milliseconds ในการเปรียบเทียบ) ***
        if (filterUpcoming) {
            // Event ถูกซ่อนจาก Index เมื่อวันที่สิ้นสุด ณ สิ้นวัน (filterDateMS) น้อยกว่า วันนี้ ณ เที่ยงคืน (todayMS)
            if (filterDateMS < todayMS) {
                isDisplayed = false;
            }
        } else {
            // หน้า Schedule: Event ถูกไฮไลท์เป็น "ผ่านมาแล้ว" เมื่อวันที่สิ้นสุดน้อยกว่าวันนี้
            if (filterDateMS < todayMS) {
                specialClass = 'event-passed'; 
            }
        }

        if (filterUpcoming) {
            // Index.html: ซ่อน Event เมื่อวันที่สิ้นสุดน้อยกว่าวันนี้
            if (filterDateMS < todayMS) {
                isDisplayed = false;
            }
        } else {
            // Schedule.html: Event ถูกไฮไลท์เป็น "ผ่านมาแล้ว" เมื่อวันที่สิ้นสุดน้อยกว่าวันนี้
            if (filterDateMS < todayMS) {
                // เปลี่ยนเป็น 'evnet-past' เพื่อให้ตรงกับ CSS ที่คุณกำหนด
                specialClass = 'event-past'; 
            }
        }

        if (isDisplayed || specialClass === 'event-passed') {
            
            const formattedDate = formatDate(event.date, event.end_date); 
            
            const imageStyle = event.image_url 
                                ? `style="background-image: url('${event.image_url}');"` 
                                : ''; 
            
            const eventHtml = `
                <article class="slide-right show carded ${specialClass}">
                    <div class=card__img ${imageStyle}></div>
                    <a href="${event.link}" class=card_link> 
                        <div class=card__img--hover ${imageStyle}></div> 
                    </a>
                    <div class=card__info>
                        <a href="${event.link}" class=card_link>
                            <div class=da-sp>
                                <div class=h5>${event.title}</div>
                                <div class=ct-da>
                                    <svg class="icon" width="32" height="17.59"> <use href="#icon-pin"></use> </svg>
                                    <p>${event.location}</p>
                                </div>
                                <div class=ct-da>
                                    <svg class="icon" width="16" height="16"> <use href="#icon-calendar"></use> </svg>
                                    <p>${formattedDate}</p>
                                </div>
                            </div>
                        </a>
                    </div>
                </article>
            `;
            container.insertAdjacentHTML('beforeend', eventHtml);
        }
    });

    if (filterUpcoming && container.innerHTML === '') {
        container.innerHTML = '<div class="text-center w-100"><p class="text-muted">ยังไม่มีกิจกรรมใหม่ที่กำลังจะมาถึงในเร็ว ๆ นี้</p></div>';
    }
}

// 3. ฟังก์ชัน Fetch API (ใช้ Path ตามที่กำหนด)
// ... โค้ดส่วนอื่นๆ ...

// 3. ฟังก์ชัน Fetch API (ใช้ Absolute Path เพื่อแก้ไขปัญหา 404)
async function fetchAndRenderSplitEvents() {
    const upcomingContainerId = 'upcoming-events-container';
    const pastContainerId = 'past-events-container';
    
    // ตั้งค่าสถานะเริ่มต้น
    document.getElementById(upcomingContainerId).innerHTML = '<p class="text-center text-muted w-100">กำลังโหลด...</p>';
    document.getElementById(pastContainerId).innerHTML = '<p class="text-center text-muted w-100">กำลังโหลด...</p>';

    try {
        const response = await fetch('support/data/event.json'); 
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json(); 
        
        // 1. กำหนด Today (เที่ยงคืน)
        const now = new Date();
        const todayString = `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}`;
        const todayMidnight = new Date(todayString);
        todayMidnight.setHours(0, 0, 0, 0); 
        const todayMS = todayMidnight.getTime(); 

        const upcomingEvents = [];
        const pastEvents = [];

        // 2. แยกข้อมูล
        data.forEach(event => {
            let filterDate = null;
            
            if (event.end_date) {
                filterDate = new Date(event.end_date.replace(/-/g, '/'));
                // Event วันสุดท้าย ณ 23:59:59
                filterDate.setHours(23, 59, 59, 999); 
            } else {
                filterDate = new Date(event.date.replace(/-/g, '/'));
                // Event วันเดียว ณ 23:59:59
                filterDate.setHours(23, 59, 59, 999);
            }
            
            const filterDateMS = filterDate.getTime(); 

            // Logic: ถ้าวันที่สิ้นสุด (23:59:59) น้อยกว่า วันนี้ (00:00:00) แสดงว่าจบไปแล้ว
            if (filterDateMS < todayMS) {
                pastEvents.push(event);
            } else {
                upcomingEvents.push(event);
            }
        });

        // 3. แสดงผล Event ปกติ (แนวตั้ง)
        if (upcomingEvents.length > 0) {
            // ไม่ต้องใส่ filterUpcoming: true/false แต่ใช้การสร้าง HTML
            renderSplitEvents(upcomingEvents, upcomingContainerId, 'upcoming');
        } else {
            document.getElementById(upcomingContainerId).innerHTML = '<div class="text-center w-100"><p class="text-muted">ยังไม่มีกิจกรรมใหม่ที่กำลังจะมาถึงในเร็ว ๆ นี้</p></div>';
        }

        // 4. แสดงผล Past Event (แนวนอน)
        if (pastEvents.length > 0) {
            // ส่งไป Container ของ Past Events
            renderSplitEvents(pastEvents, pastContainerId, 'past');
        } else {
            document.getElementById(pastContainerId).innerHTML = '<div class="text-center w-100"><p class="text-muted">ยังไม่มีกิจกรรมที่ผ่านมา</p></div>';
        }

        
    } catch (error) {
        console.error("Error fetching event data:", error);
        document.getElementById(upcomingContainerId).innerHTML = '<p class="text-danger">ไม่สามารถโหลดข้อมูล Event ได้ กรุณาลองใหม่ในภายหลัง</p>';
        document.getElementById(pastContainerId).innerHTML = '<p class="text-danger">ไม่สามารถโหลดข้อมูล Event ได้ กรุณาลองใหม่ในภายหลัง</p>';
    }
}

function renderSplitEvents(eventData, containerId, type) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    const isBootstrapRow = container.classList.contains('row');
    let finalHtml = '';

    eventData.forEach(event => {
        const formattedDate = formatDate(event.date, event.end_date);

        const imageStyle = event.image_url
            ? `style="background-image: url('${event.image_url}');"`
            : '';

        // Location
        const locationHtml = event.location && event.location.trim()
            ? `
                <div class="ct-da">
                    <svg class="icon" width="32" height="17.59">
                        <use href="#icon-pin"></use>
                    </svg>
                    <p>${event.location}</p>
                </div>
            `
            : '';

        // Live
        const liveHtml = event.live && event.live.trim()
            ? `
                <div class="ct-da">
                    <svg class="icon" width="16" height="16">
                        <use href="#icon-live"></use>
                    </svg>
                    <p>LIVE: ${event.live.toUpperCase()}</p>
                </div>
            `
            : '';

        const articleHtml = `
            <article class="slide-right show carded ${type === 'past' ? 'event-past' : ''}">
                <div class="card__img" ${imageStyle}></div>
                <a href="${event.link}" class="card_link">
                    <div class="card__img--hover" ${imageStyle}></div>
                </a>
                <div class="card__info">
                    <a href="${event.link}" class="card_link">
                        <div class="da-sp">
                            <div class="h5">${event.title}</div>
                            ${locationHtml}
                            <div class="ct-da">
                                <svg class="icon" width="16" height="16">
                                    <use href="#icon-calendar"></use>
                                </svg>
                                <p>${formattedDate}</p>
                            </div>
                            ${liveHtml}
                        </div>
                    </a>
                </div>
            </article>
        `;

        // 🔥 ตัดสินใจตาม container
        finalHtml += isBootstrapRow
            ? `<div class="col d-flex justify-content-center">${articleHtml}</div>`
            : articleHtml;
    });

    container.insertAdjacentHTML('beforeend', finalHtml);
}
