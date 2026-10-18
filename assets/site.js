(() => {
  const toc = document.querySelector('.toc');
  const topNav = document.querySelector('.site-nav');
  if (toc && topNav && 'ResizeObserver' in window) {
    const resize = new ResizeObserver(() => { toc.style.top = `${topNav.offsetHeight}px`; });
    resize.observe(topNav);
  }
  if (toc && 'IntersectionObserver' in window) {
    const anchors = [...toc.querySelectorAll('a[href^="#"]')];
    const observer = new IntersectionObserver(entries => {
      const active = entries.filter(x => x.isIntersecting).sort((a,b) => a.boundingClientRect.top-b.boundingClientRect.top)[0];
      if (!active) return;
      anchors.forEach(a => {
        const selected = a.getAttribute('href') === `#${active.target.id}`;
        a.classList.toggle('is-active', selected);
        if(selected) a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current');
      });
    }, {rootMargin:'-160px 0px -55% 0px', threshold:0});
    anchors.forEach(a => { const section = document.getElementById(a.hash.slice(1)); if(section) observer.observe(section); });
  }
  const figures = [...document.querySelectorAll('.project-page main figure')];
  if (!figures.length || !window.HTMLDialogElement) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'diagram-dialog';
  dialog.setAttribute('aria-label','아키텍처 확대 보기');
  dialog.innerHTML = '<div class="dialog-toolbar"><div><b>아키텍처 확대 보기</b><div class="dialog-caption">좌우·위아래로 스크롤하여 확인할 수 있습니다.</div></div><button type="button" aria-label="확대 보기 닫기">닫기 ×</button></div><div class="dialog-canvas"></div>';
  document.body.appendChild(dialog);
  let lastTrigger;
  dialog.querySelector('button').addEventListener('click',() => dialog.close());
  dialog.addEventListener('close',()=>{document.body.style.overflow='';dialog.querySelector('.dialog-canvas').replaceChildren();lastTrigger?.focus();});
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  figures.forEach((figure,index)=>{
    const graphic = figure.querySelector('img,svg');
    if(!graphic) return;
    const row=document.createElement('div');row.className='diagram-action';
    const button=document.createElement('button');button.type='button';button.className='zoom-button';button.textContent='구성도 확대 ↗';
    button.setAttribute('aria-label',`구성도 ${index+1} 확대 보기`);
    button.addEventListener('click',()=>{
      const clone=graphic.cloneNode(true);
      if(clone.tagName.toLowerCase()==='svg') {
        const ids=new Map();
        clone.querySelectorAll('[id]').forEach(el=>{const old=el.id;const next=`zoom-${index}-${old}`;ids.set(old,next);el.id=next;});
        clone.querySelectorAll('*').forEach(el=>{[...el.attributes].forEach(attr=>{let value=attr.value;ids.forEach((next,old)=>{value=value.replaceAll(`url(#${old})`,`url(#${next})`);if(value===`#${old}`)value=`#${next}`;});if(value!==attr.value)el.setAttribute(attr.name,value);});});
      }
      dialog.querySelector('.dialog-canvas').replaceChildren(clone);lastTrigger=button;dialog.showModal();document.body.style.overflow='hidden';
    });
    row.appendChild(button);figure.prepend(row);
  });
})();
