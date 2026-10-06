(function(){
  'use strict';
  const engine=window.DomRadioDemo,form=document.querySelector('#demo-form');
  const context=document.createElement('canvas').getContext('2d');
  const blobs=new Map();let lastDocuments={};
  const status=document.querySelector('#demo-status');
  function measure(text,size){context.font=`${size}px Arial`;return context.measureText(text).width;}
  function render(){
    const data=Object.fromEntries(new FormData(form));let errors=[];lastDocuments={};
    for(const format of Object.keys(engine.FORMATS)){
      const card=document.querySelector(`[data-demo="${format}"]`),img=card.querySelector('img'),link=card.querySelector('a');
      const old=blobs.get(format);if(old)URL.revokeObjectURL(old);
      try{
        const doc=engine.layout(data,format,measure),content=engine.svg(doc);
        const url=URL.createObjectURL(new Blob([content],{type:'image/svg+xml;charset=utf-8'}));blobs.set(format,url);
        img.src=url;img.hidden=false;img.alt=`${data.title}: ${format==='square'?'квадрат':'баннер'}`;
        link.href=url;link.download=`dom-radio-demo-${format}.svg`;link.removeAttribute('aria-disabled');
        card.querySelector('.demo-error').textContent='';lastDocuments[format]=doc;
      }catch(e){img.removeAttribute('src');img.hidden=true;link.removeAttribute('href');link.setAttribute('aria-disabled','true');card.querySelector('.demo-error').textContent=e.message;errors.push(e.message);}
    }
    status.textContent=errors.length?[...new Set(errors)].join(' '):'Два макета обновлены. SVG содержат текстовые объекты и векторный фон.';
    status.classList.toggle('has-error',errors.length>0);
    document.querySelector('#download-layout').disabled=errors.length>0;
  }
  form.addEventListener('input',render);
  form.addEventListener('submit',event=>event.preventDefault());
  document.querySelector('#demo-reset').addEventListener('click',()=>{form.reset();render();});
  document.querySelector('#download-layout').addEventListener('click',()=>{
    if(Object.keys(lastDocuments).length!==2)return;
    const url=URL.createObjectURL(new Blob([JSON.stringify(lastDocuments,null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='dom-radio-layout.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  const calc=document.querySelector('#economics-form'),output=document.querySelector('#economics-result');
  const number=new Intl.NumberFormat('ru-RU',{maximumFractionDigits:1});
  function calculate(){
    try{
      const result=engine.economics(Object.fromEntries(new FormData(calc)));
      if(!result){output.textContent='Заполните все поля своими данными. Расчёт появится здесь.';return;}
      output.replaceChildren();
      for(const [label,value] of [['Ручная работа',`${number.format(result.manualHours)} ч/мес.`],['С инструментом',`${number.format(result.assistedHours)} ч/мес.`],['Разница во времени',`${number.format(result.hoursSaved)} ч/мес.`],['Разница в стоимости труда с учётом поддержки',`${number.format(result.monthlyEffect)} ₽/мес.`]]){
        const row=document.createElement('div'),term=document.createElement('span'),amount=document.createElement('strong');term.textContent=label;amount.textContent=value;row.append(term,amount);output.append(row);
      }
      const note=document.createElement('p');note.className='small-note';note.textContent=result.monthlyEffect<0?'При этих исходных данных расчёт даёт дополнительные затраты.':'Это оценка высвобождаемого времени и стоимости труда, а не гарантированное снижение расходов.';output.append(note);
    }catch(e){output.textContent=e.message;}
  }
  calc.addEventListener('input',calculate);calc.addEventListener('submit',e=>e.preventDefault());
  render();calculate();
})();
