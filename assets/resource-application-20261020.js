(function(){
'use strict';
if(document.body.dataset.page!=='resources')return;
function sync(){document.querySelectorAll('.ontology-auth-dialog').forEach(function(dialog){var title=(dialog.querySelector('h2')||{}).textContent||'',hint=dialog.querySelector('.data-auth-fixed small');if(title.indexOf('流程')>-1&&hint)hint.textContent='可在有权业务流程与智能体中引用该流程资源；授权后不在首页提供直接调用入口。'});}
new MutationObserver(function(){requestAnimationFrame(sync)}).observe(document.body,{childList:true,subtree:true});sync();
})();
