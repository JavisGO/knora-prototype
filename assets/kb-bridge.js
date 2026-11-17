(function(){
'use strict';
var topbar=document.querySelector('.topbar');if(!topbar)return;
/* 应用中心弹窗已由统一左侧导航取代：移除顶部九宫格按钮 */
var trigger=topbar.querySelector('.icon-btn');if(trigger&&trigger.querySelector('use[href="#grid"]'))trigger.remove();
var brand=topbar.querySelector('.brand strong');if(brand)brand.textContent='Knora';
var requestedProject=new URLSearchParams(location.search).get('project');if(requestedProject){var requestedRow=[].slice.call(document.querySelectorAll('#projectTree .project')).find(function(row){return row.textContent.indexOf(requestedProject)>-1});if(requestedRow)requestedRow.click()}
})();
