(function (root) {
  'use strict';
  const FORMATS = {square:{width:1080,height:1080},banner:{width:1440,height:480}};
  const FONT='Arial';
  function clean(value,max,name) {
    const s=String(value??'').trim().replace(/\s+/g,' ');
    if(!s) throw new Error(`Заполните поле «${name}».`);
    if(s.length>max) throw new Error(`Поле «${name}»: максимум ${max} знаков.`);
    if(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/u.test(s)) throw new Error('В тексте есть неподдерживаемый символ.');
    return s;
  }
  function wrap(text,width,size,measure) {
    const lines=[]; let line='';
    for(const word of text.split(' ')) {
      if(measure(word,size)>width) return null;
      const next=line?line+' '+word:word;
      if(measure(next,size)<=width) line=next;
      else {lines.push(line);line=word;}
    }
    if(line)lines.push(line);
    return lines;
  }
  function fit(text,box,range,measure) {
    for(let size=range.max;size>=range.min;size-=2) {
      const lines=wrap(text,box.width,size,measure);
      if(lines&&lines.length*size*1.16<=box.height&&lines.length<=range.lines) return {lines,fontSize:size,lineHeight:size*1.16};
    }
    throw new Error('Текст не помещается в допустимых пределах. Сократите его или передайте макет дизайнеру.');
  }
  function layout(input,format,measure) {
    if(!FORMATS[format])throw new Error('Неизвестный формат.');
    if(typeof measure!=='function')throw new Error('Нужна функция измерения текста.');
    const data={title:clean(input.title,180,'Название'),date:clean(input.date,36,'Дата и время')};
    const dimensions=FORMATS[format];const wide=format==='banner';
    const blocks=[];
    function add(id,text,box,min,max,lines,color='#e7c9ae') {
      const fitted=fit(text,box,{min,max,lines},measure);
      blocks.push({id,text,box,...fitted,color,fontFamily:FONT});
    }
    add('brand','ДОМ РАДИО',{x:56,y:40,width:360,height:55},24,30,1);
    add('date',data.date,{x:wide?880:560,y:40,width:wide?504:464,height:55},20,30,1);
    add('title',data.title,{x:56,y:wide?120:180,width:dimensions.width-112,height:wide?235:660},wide?28:34,wide?142:158,wide?5:9,'#171717');
    add('place','ДОМ РАДИО · САНКТ-ПЕТЕРБУРГ',{x:56,y:wide?390:966,width:820,height:50},20,24,1);
    add('age','18+',{x:dimensions.width-128,y:wide?390:966,width:72,height:50},22,28,1);
    return {version:'demo-2',format,...dimensions,data,fontFamily:FONT,background:'#a72524',blocks,notice:'Технический образец. Arial, условные логотип и футер. RGB, без вылетов; не для печати.'};
  }
  function xml(value) {return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));}
  function svg(doc) {
    const shapes=doc.blocks.map(b=>`<text id="${b.id}" font-family="Arial" font-size="${b.fontSize}" fill="${b.color}">${b.lines.map((line,i)=>`<tspan x="${b.box.x}" y="${(b.box.y+b.fontSize+i*b.lineHeight).toFixed(2)}">${xml(line)}</tspan>`).join('')}</text>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${doc.width}" height="${doc.height}" viewBox="0 0 ${doc.width} ${doc.height}"><title>${xml(doc.data.title)}</title><desc>${xml(doc.notice)}</desc><rect id="background" width="${doc.width}" height="${doc.height}" fill="${doc.background}"/>\n${shapes}\n</svg>`;
  }
  function economics(input) {
    const keys=['events','formats','manual','assisted','rate','support'];
    if(keys.some(k=>input[k]===''||input[k]===null||input[k]===undefined))return null;
    const n=Object.fromEntries(keys.map(k=>[k,Number(input[k])]));
    if(keys.some(k=>!Number.isFinite(n[k])||n[k]<0)||n.events<1||n.formats<1||!Number.isInteger(n.events)||!Number.isInteger(n.formats))throw new Error('Введите целые положительные объёмы и неотрицательные время и стоимость.');
    const manualHours=n.events*n.formats*n.manual/60;
    const assistedHours=n.events*n.assisted/60;
    const hoursSaved=manualHours-assistedHours;
    return {manualHours,assistedHours,hoursSaved,monthlyEffect:hoursSaved*n.rate-n.support};
  }
  const api={FORMATS,FONT,layout,svg,wrap,fit,economics};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DomRadioDemo=api;
})(typeof globalThis!=='undefined'?globalThis:this);
