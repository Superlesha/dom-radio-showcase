(function(){
  'use strict';
  const pages=[...document.querySelectorAll('.deck-slide')];
  const navigation=document.querySelector('.deck-navigation');
  if(!pages.length||!navigation)return;
  const links=[...navigation.querySelectorAll('.deck-track a')];
  const previous=document.querySelector('#deck-prev'),next=document.querySelector('#deck-next');
  const status=document.querySelector('#deck-current');
  let current=0;
  function resolve(hash){
    let id;try{id=decodeURIComponent(hash.replace(/^#/,''));}catch{return {index:0};}
    const target=document.getElementById(id);
    const page=target?.closest('.deck-slide');
    const index=pages.indexOf(page);
    return {index:index<0?0:index,target:index<0?null:target};
  }
  function show(index,{hash,target,push=false,focus=false}={}){
    current=Math.max(0,Math.min(pages.length-1,index));
    pages.forEach((page,i)=>{page.hidden=i!==current;});
    const page=pages[current];
    page.scrollTop=0;
    if(target&&target!==page){page.scrollTop=Math.max(0,target.getBoundingClientRect().top-page.getBoundingClientRect().top-20);}
    links.forEach((link,i)=>{
      if(i===current)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
      link.classList.toggle('is-past',i<current);
    });
    previous.disabled=current===0;next.disabled=current===pages.length-1;
    next.textContent=current===pages.length-1?'Конец':'Далее →';
    status.textContent=String(current+1).padStart(2,'0')+' / '+String(pages.length).padStart(2,'0')+' · '+page.dataset.slideTitle;
    document.title=page.dataset.slideTitle+' — Дом Радио · '+(current+1)+'/'+pages.length;
    if(push)history.pushState(null,'',hash||'#'+page.id);
    if(focus){const heading=page.querySelector('h1,h2,h3');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}
  }
  function go(index){show(index,{push:true,focus:true});}
  previous.addEventListener('click',()=>go(current-1));
  next.addEventListener('click',()=>go(current+1));
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#"]');
    if(!link||event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    const hash=link.getAttribute('href'),result=resolve(hash);
    if(hash!=='#top'&&!result.target)return;
    event.preventDefault();show(result.index,{hash,target:result.target,push:true,focus:true});
  });
  document.addEventListener('keydown',event=>{
    if(event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||document.querySelector('dialog[open]'))return;
    if(event.target.closest('input,textarea,select,button,a,[contenteditable="true"]'))return;
    if(event.key==='ArrowRight'&&current<pages.length-1){event.preventDefault();go(current+1);}
    if(event.key==='ArrowLeft'&&current>0){event.preventDefault();go(current-1);}
  });
  function fromLocation(){const result=resolve(location.hash);show(result.index,{target:result.target});}
  window.addEventListener('popstate',fromLocation);
  window.addEventListener('hashchange',fromLocation);
  document.body.classList.add('deck-ready');navigation.hidden=false;fromLocation();
})();
