(()=>{'use strict';
function syncEntryVisibility(nav){
  const group=nav.querySelector('.quality-entry-actions');
  if(!group)return;
  const semantic=[...nav.querySelectorAll(':scope > div:first-child > button')].find(button=>button.textContent.trim()==='语义图谱');
  group.hidden=!!semantic&&!semantic.classList.contains('active');
}
function mount(){
  document.querySelectorAll('.semantic-view-switch').forEach(nav=>{
    if(!nav.dataset.qualityMounted){
      nav.dataset.qualityMounted='true';
      const group=document.createElement('div');
      group.className='quality-entry-actions';
      group.innerHTML='<button type="button" data-quality-history>评估历史</button> <button type="button" data-quality-entry>◇ 质量评估</button>';
      group.style.cssText='margin-left:auto';
      nav.append(group);
    }
    syncEntryVisibility(nav);
  });
}
const style=document.createElement('style');
style.textContent='.quality-entry-actions[hidden]{display:none!important}.quality-entry-actions button{background:#0962ff!important;color:white!important;border:1px solid #0962ff!important;border-radius:7px!important;padding:8px 15px!important;cursor:pointer}.quality-entry-actions button[data-quality-history]{background:white!important;color:#526580!important;border-color:#dce5f3!important;margin-right:10px}';
document.head.append(style);
document.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(!button||!button.matches('[data-quality-entry],[data-quality-history]'))return;
  const nav=button.closest('.semantic-view-switch');
  if(!nav)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const current=new URL(location.href),target=new URL('ontology-quality.html',location.href);
  target.searchParams.set('project',current.searchParams.get('project')||'personal');
  current.searchParams.set('graphView','semantic');
  target.searchParams.set('return',current.pathname.split('/').pop()+current.search);
  target.searchParams.set('embed','1');
  if(button.matches('[data-quality-history]'))target.searchParams.set('mode','history');
  const frame=document.createElement('iframe');
  frame.id='knora-quality-modal';
  frame.title='本体质量评估';
  frame.src=target.href;
  frame.style.cssText='position:fixed;inset:0;width:100%;height:100%;border:0;background:transparent;z-index:10000';
  const previousOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  document.body.append(frame);
  function finish(message){
    if(message.source!==frame.contentWindow||message.data?.type!=='knora-quality-close')return;
    frame.remove();
    document.body.style.overflow=previousOverflow;
    window.removeEventListener('message',finish);
    button.focus();
  }
  window.addEventListener('message',finish);
},true);
new MutationObserver(mount).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
mount();
})();
