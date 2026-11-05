(function(){
'use strict';
function destination(card){var params=new URLSearchParams(location.search),project=params.get('project')||localStorage.getItem('knora:lastProject')||'personal',isNew=card.hasAttribute('data-flow-new'),flow=isNew?'new_business_flow_'+Date.now():card.dataset.flowOpen,name=isNew?'未命名流程':card.dataset.flowName;return 'business-flow-editor.html?flow='+encodeURIComponent(flow)+'&flowName='+encodeURIComponent(name)+'&project='+encodeURIComponent(project)+(isNew?'&new=1':'')}
document.addEventListener('click',function(event){if(event.target.closest('.om-batch-card-check'))return;var card=event.target.closest('[data-flow-open]');if(!card)return;var button=event.target.closest('button');if(button&&!card.hasAttribute('data-flow-new')&&button.textContent.trim()!=='编辑')return;event.preventDefault();event.stopImmediatePropagation();location.href=destination(card)},true);
document.addEventListener('keydown',function(event){var card=event.target.closest('[data-flow-open]');if(!card||event.target!==card||!['Enter',' '].includes(event.key))return;event.preventDefault();location.href=destination(card)});
})();


