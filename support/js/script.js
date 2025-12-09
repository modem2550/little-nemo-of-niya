document.querySelectorAll(".switcher").forEach(e=>{let t=Array.from(e.querySelectorAll(".switcher__option")),r=t.map(e=>e.querySelector('input[type="radio"]')),i=e.querySelector(".switcher__indicator"),l=Math.max(0,r.findIndex(e=>e&&e.checked)),s=l,a=null;function n(r,l=!0){let a=t[r];if(!a)return;let n=a.getBoundingClientRect(),o=e.getBoundingClientRect();i.style.transition=l?"transform 420ms cubic-bezier(1, 0.0, 0.4, 1)":"none",i.style.width="78px",i.style.height="60px",i.style.transform=`translateX(${n.left-o.left-12}px)`,i.classList.remove("pulse-left","pulse-right"),l&&i.classList.add(r>s?"pulse-right":"pulse-left"),s=r}n(l,!1),t.forEach((e,t)=>{let i=r[t];e.addEventListener("click",t=>{t.preventDefault(),i&&!i.checked&&(i.checked=!0,i.dispatchEvent(new Event("change",{bubbles:!0})));let r=e.getAttribute("data-href");if(r&&r.startsWith("#")){let l=document.querySelector(r);l&&l.scrollIntoView({behavior:"smooth",block:"start"})}}),i&&i.addEventListener("change",()=>{i.checked&&n(l=t,!0)})}),window.addEventListener("resize",()=>{cancelAnimationFrame(a),a=requestAnimationFrame(()=>n(l,!1))})});const observer=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting&&e.target.classList.add("show")})},{threshold:.2});function openPopup(){document.getElementById("popup-overlay").style.display="flex"}function closePopup(){document.getElementById("popup-overlay").style.display="none"}function toSlug(e){return"string"!=typeof e?"":e.toLowerCase().replace(/\s+/g,"-")}function renderSocialLinks(e){let t=document.getElementById("social-links-container");if(!t)return;let r="";e.forEach(e=>{let t=toSlug(e.platform),i=` 
            <svg viewBox="0 0 512 512" class="svg-inline--fa fa-${t}" data-icon="${t}" data-prefix="fab" role="img" aria-hidden="true" data-fa-i2svg=""> 
                <use href="#${e.iconId}"></use> 
            </svg> 
        `,l=` 
            <svg class="icon arrow-svg ms-1" width="24" height="24" style="height:1em;width:1em"> 
                <use href="#icon-arrow-right"></use> 
            </svg> 
        `,s=` 
            <div class="d-grid"> 
                <a href="${e.url}" class="social-box -${t}" target="_blank" title="${e.platform}">
                    ${i} 
                    <div> 
                        <div class="fw-bold social-margin h6"> 
                            ${e.platform}${l} 
                        </div> 
                        <div class="fw-bold social-margin h3">${e.username}</div> 
                    </div> 
                </a> 
            </div> 
        `;r+=s}),t.innerHTML=r}document.querySelectorAll(".slide-right, .fade-in").forEach(e=>observer.observe(e));
