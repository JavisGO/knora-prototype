(function(){
'use strict';
document.addEventListener('click',function(event){
 var b=event.target.closest('[data-agent-evaluation]');if(!b)return;
 event.preventDefault();event.stopImmediatePropagation();
 var q=new URLSearchParams(location.search),id=b.dataset.agentId||q.get('agent')||'new';
 var names={'run-log':'运行日志权限助手','employee-faq':'员工服务 FAQ','quality-kb':'质量规范助手','purchase-data':'采购指标问数'};
 window.KnoraBatchTasks.open({kind:'agent',flow:'agent:'+id,project:q.get('project')||'personal',name:b.dataset.agentName||names[id]||'新建智能体'});
},true);
})();
