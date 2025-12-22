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
