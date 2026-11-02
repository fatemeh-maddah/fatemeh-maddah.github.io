(function(){
  const $=id=>document.getElementById(id);
  const root=document.documentElement;
  const FA=root.lang==='fa';
  const T=FA?{copied:'ایمیل کپی شد',selected:'ایمیل انتخاب شد؛ Ctrl+C را بزنید',pdf:'فایل PDF رزومه روی سایت اصلی باز می‌شود.',view:'دیدن تصویر کامل: ',preview:'پیش‌نمایش تصویر',close:'بستن'}
             :{copied:'Email copied',selected:'Email selected, press Ctrl+C',pdf:'Opens the resume PDF on the live site.',view:'View full image: ',preview:'Image preview',close:'Close'};
  const toast=$('toast'); let tt;
  const say=m=>{toast.textContent=m;toast.hidden=false;clearTimeout(tt);tt=setTimeout(()=>toast.hidden=true,2400)};

  /* reading progress */
  const bar=$('progress');
  const onScroll=()=>{const max=root.scrollHeight-innerHeight;bar.style.transform='scaleX('+(max>0?Math.min(1,scrollY/max):0)+')'};
  addEventListener('scroll',onScroll,{passive:true}); onScroll();

  /* layers: highlight the section in view */
  const rows=[...document.querySelectorAll('[data-spy]')];
  const frames=rows.map(r=>$(r.dataset.spy)).filter(Boolean);
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){
    rows.forEach(r=>r.classList.toggle('active',r.dataset.spy===e.target.id));
    frames.forEach(f=>f.classList.toggle('is-current',f===e.target));}}),{rootMargin:'-40% 0px -55% 0px'});
  frames.forEach(f=>io.observe(f));

  /* drawer on tablet and phone */
  const open=$('openPanel');
  const setPanel=on=>{document.body.classList.toggle('panel-open',on);open.setAttribute('aria-expanded',on)};
  open.addEventListener('click',()=>setPanel(true));
  $('closePanel').addEventListener('click',()=>setPanel(false));
  $('scrim').addEventListener('click',()=>setPanel(false));
  $('panel').addEventListener('click',e=>{if(e.target.closest('a'))setPanel(false)});
  addEventListener('keydown',e=>{if(e.key==='Escape')setPanel(false)});

  /* design settings, shared with the homepage */
  const FONT_CSS=FA?{serif:'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@600;700&display=swap',syne:'https://fonts.googleapis.com/css2?family=Lalezar&display=swap'}
                   :{serif:'https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap',syne:'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap'};
  const store={get:k=>{try{return localStorage.getItem('fm-'+k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem('fm-'+k,v)}catch(e){}}};
  const press=(sel,attr,val)=>document.querySelectorAll(sel).forEach(b=>b.setAttribute('aria-pressed',b.dataset[attr]===val));
  function setSkin(v){root.dataset.skin=v;press('[data-skin]','skin',v);store.set('skin',v)}
  function setFont(v){
    press('.font-opt','font',v);store.set('font',v);
    if(FONT_CSS[v]&&!document.querySelector('link[data-f="'+v+'"]')){const l=document.createElement('link');l.rel='stylesheet';l.href=FONT_CSS[v];l.dataset.f=v;document.head.appendChild(l)}
    if(v==='inter')delete root.dataset.font;else root.dataset.font=v;
  }
  document.querySelectorAll('[data-skin]').forEach(b=>b.addEventListener('click',()=>setSkin(b.dataset.skin)));
  document.querySelectorAll('.font-opt').forEach(b=>b.addEventListener('click',()=>setFont(b.dataset.font)));
  if(store.get('skin')==='light')setSkin('light');
  if(store.get('font')&&store.get('font')!=='inter')setFont(store.get('font'));

  /* copy email */
  const cp=$('copyEmail');
  if(cp)cp.addEventListener('click',()=>{const v=$('email').textContent;
    (navigator.clipboard?navigator.clipboard.writeText(v):Promise.reject()).then(()=>say(T.copied),()=>{
      const r=document.createRange();r.selectNodeContents($('email'));const s=getSelection();s.removeAllRanges();s.addRange(r);say(T.selected)})});

  /* preview only: the sandbox cannot open the PDF */
  if(!/github\.io$/.test(location.hostname)){
    document.querySelectorAll('a[href$=".pdf"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();say(T.pdf)}));
  }

  /* figures: tap to see the full image, so wide diagrams never need sideways scrolling */
  const shots=[...document.querySelectorAll('.fig .shot img')];
  if(shots.length){
    const d=document.createElement('dialog');d.className='lb';d.setAttribute('aria-label',T.preview);
    d.innerHTML='<div class="lb-scroll"><img alt=""></div><div class="lb-bar"><span></span><button class="btn" type="button">'+T.close+'</button></div>';
    document.body.appendChild(d);
    const im=d.querySelector('img'),cap=d.querySelector('span');
    d.querySelector('button').onclick=()=>d.close();
    d.addEventListener('click',e=>{if(e.target===d)d.close()});
    shots.forEach(img=>{
      const box=img.parentElement;box.setAttribute('role','button');box.tabIndex=0;box.setAttribute('aria-label',T.view+img.alt);
      box.insertAdjacentHTML('beforeend','<span class="zoom" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="6" cy="6" r="4"/><path d="M9 9l3.5 3.5M6 4v4M4 6h4"/></svg></span>');
      const open=()=>{im.src=img.currentSrc||img.src;im.alt=img.alt;d.classList.toggle('is-wide',((img.naturalWidth||+img.getAttribute('width'))/(img.naturalHeight||+img.getAttribute('height')))>1.3);d.querySelector('.lb-scroll').scrollLeft=0;const fc=img.closest('figure').querySelector('figcaption');cap.textContent=fc?fc.textContent:'';d.showModal()};
      box.addEventListener('click',open);
      box.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});
    });
  }
})();
