(function(){
  'use strict';
  function projectLabel(project){return{personal:'陈宇的个人项目',insight:'客户洞察项目',experience:'客户体验提升项目',channel:'渠道协同项目',ai:'智能营销试点项目'}[project]||'当前项目'}
  function patchDialog(doc,project){
    var layer=doc.getElementById('applyLayer');if(!layer||layer.dataset.projectPatched)return;layer.dataset.projectPatched='1';
    var section=layer.querySelector('.apply-section');if(section)section.style.display='none';
    var subtitle=layer.querySelector('.add-head p');if(subtitle)subtitle.textContent='模板将直接应用到当前项目，请选择应用方式';
    var explanation=layer.querySelector('.apply-explanation');if(explanation){explanation.insertAdjacentHTML('afterbegin','<p class="current-project-target"><strong>当前项目：</strong>'+projectLabel(project)+'</p>');explanation.innerHTML=explanation.innerHTML.replace(/目标项目/g,'当前项目')}
    var footer=layer.querySelector('.apply-footer small');if(footer)footer.textContent='当前为交互演示，应用范围固定为当前项目。';
    var personal=layer.querySelector('[name="applyScope"][value="personal"]'),other=layer.querySelector('[name="applyScope"][value="other"]'),select=layer.querySelector('#applyProject');
    if(project==='personal'){if(personal)personal.checked=true}else{if(other)other.checked=true;if(select){var option=Array.prototype.slice.call(select.options).find(function(item){return item.value===project});if(option)select.value=project}}
  }
  function attach(frame){var doc;try{doc=frame.contentDocument}catch(error){return}if(!doc)return;var project=new URLSearchParams(location.search).get('project')||'personal';new MutationObserver(function(){patchDialog(doc,project)}).observe(doc.documentElement,{childList:true,subtree:true});patchDialog(doc,project)}
  function boot(){var frame=document.getElementById('templateFrame');if(!frame)return;frame.addEventListener('load',function(){attach(frame)});if(frame.contentDocument&&frame.contentDocument.readyState!=='loading')attach(frame)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
