document.querySelectorAll(".switcher").forEach(e=>{let t=Array.from(e.querySelectorAll(".switcher__option")),i=t.map(e=>e.querySelector('input[type="radio"]')),l=e.querySelector(".switcher__indicator"),r=Math.max(0,i.findIndex(e=>e&&e.checked)),s=r,a=null;function n(i,r=!0){let a=t[i];if(!a)return;let n=a.getBoundingClientRect(),o=e.getBoundingClientRect();l.style.transition=r?"transform 420ms cubic-bezier(1, 0.0, 0.4, 1)":"none",l.style.width="78px",l.style.height="60px",l.style.transform=`translateX(${n.left-o.left-12}px)`,l.classList.remove("pulse-left","pulse-right"),r&&l.classList.add(i>s?"pulse-right":"pulse-left"),s=i}n(r,!1),t.forEach((e,t)=>{let l=i[t];e.addEventListener("click",t=>{t.preventDefault(),l&&!l.checked&&(l.checked=!0,l.dispatchEvent(new Event("change",{bubbles:!0})));let i=e.getAttribute("data-href");if(i&&i.startsWith("#")){let r=document.querySelector(i);r&&r.scrollIntoView({behavior:"smooth",block:"start"})}}),l&&l.addEventListener("change",()=>{l.checked&&n(r=t,!0)})}),window.addEventListener("resize",()=>{cancelAnimationFrame(a),a=requestAnimationFrame(()=>n(r,!1))})});const observer=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting&&e.target.classList.add("show")})},{threshold:.2});function openPopup(){document.getElementById("popup-overlay").style.display="flex"}function closePopup(){document.getElementById("popup-overlay").style.display="none"}function renderSocialLinks(e){let t=document.getElementById("social-links-container");if(!t)return;let i="";e.forEach(e=>{let t=toSlug(e.platform),l=` 
            <svg viewBox="0 0 512 512" class="svg-inline--fa fa-${t}" data-icon="${t}" data-prefix="fab" role="img" aria-hidden="true" data-fa-i2svg=""> 
                <use href="#${e.iconId}"></use> 
            </svg> 
        `,r=` 
            <svg class="icon arrow-svg ms-1" width="24" height="24" style="height:1em;width:1em"> 
                <use href="#icon-arrow-right"></use> 
            </svg> 
        `,s=` 
            <div class="col-md-6 col-lg-4 d-grid"> 
                <a href="${e.url}" class="slide-right social-box -${t}" target="_blank" title="${e.platform}">
                    ${l} 
                    <div> 
                        <div class="fw-bold social-margin h6"> 
                            ${e.platform}${r} 
                        </div> 
                        <div class="fw-bold social-margin h3">${e.username}</div> 
                    </div> 
                </a> 
            </div> 
        `;i+=s}),t.innerHTML=i}document.querySelectorAll(".slide-right, .fade-in").forEach(e=>observer.observe(e));
