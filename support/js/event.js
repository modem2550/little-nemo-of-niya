function formatDate(e,t){if(!e)return"";let a=["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"],r=e=>{let t=new Date(e.replace(/-/g,"/"));return{day:t.getDate().toString().padStart(2,"0"),month:a[t.getMonth()],year:t.getFullYear()}},n=r(e);if(!t)return`${n.day} ${n.month} ${n.year}`;let s=r(t);return n.month===s.month&&n.year===s.year?`${n.day}-${s.day} ${s.month} ${s.year}`:`${n.day} ${n.month} ${n.year} - ${s.day} ${s.month} ${s.year}`}function renderEvents(e,t,a){let r=document.getElementById(t);if(!r)return;r.innerHTML="";let n=new Date,s=`${n.getFullYear()}/${(n.getMonth()+1).toString().padStart(2,"0")}/${n.getDate().toString().padStart(2,"0")}`,d=new Date(s);d.setHours(0,0,0,0);let i=d.getTime();e.forEach(e=>{e.date.replace(/-/g,"/");let t=null;e.end_date?(t=new Date(e.end_date.replace(/-/g,"/"))).setHours(23,59,59,999):(t=new Date(e.date.replace(/-/g,"/"))).setHours(23,59,59,999);let n=t.getTime(),s=!0,d="";if(a?n<i&&(s=!1):n<i&&(d="event-passed"),s||"event-passed"===d){let l=formatDate(e.date,e.end_date),c=e.image_url?`style="background-image: url('${e.image_url}');"`:"",o=`
                <article class="slide-right show carded ${d}">
                    <div class=card__img ${c}></div>
                    <a href="${e.link}" class=card_link> 
                        <div class=card__img--hover ${c}></div> 
                    </a>
                    <div class=card__info>
                        <a href="${e.link}" class=card_link>
                            <div class=da-sp>
                                <div class=h5>${e.title}</div>
                                <div class=ct-da>
                                    <svg class="icon" width="32" height="17.59"> <use href="#icon-pin"></use> </svg>
                                    <p>${e.location}</p>
                                </div>
                                <div class=ct-da>
                                    <svg class="icon" width="16" height="16"> <use href="#icon-calendar"></use> </svg>
                                    <p>${l}</p>
                                </div>
                            </div>
                        </a>
                    </div>
                </article>
            `;r.insertAdjacentHTML("beforeend",o)}}),a&&""===r.innerHTML&&(r.innerHTML='<div class="text-center w-100"><p class="text-muted">ยังไม่มีกิจกรรมใหม่ที่กำลังจะมาถึงในเร็ว ๆ นี้</p></div>')}async function fetchAndRenderEvents(e,t){try{let a=await fetch("support/data/event.json");if(!a.ok)throw Error(`HTTP error! status: ${a.status}`);let r=await a.json();renderEvents(r,e,t)}catch(n){console.error("Error fetching event data:",n);let s=document.getElementById(e);s&&(s.innerHTML='<p class="text-danger">ไม่สามารถโหลดข้อมูล Event ได้ กรุณาลองใหม่ในภายหลัง</p>')}}
