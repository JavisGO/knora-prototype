(function(){
'use strict';
var topbar=document.querySelector('.topbar');if(!topbar)return;
/* 应用中心弹窗已由统一左侧导航取代：移除顶部九宫格按钮 */
var trigger=topbar.querySelector('.icon-btn');if(trigger&&trigger.querySelector('use[href="#grid"]'))trigger.remove();
/* 品牌、用户与通知已移入左侧导航，顶栏只保留项目切换 */
var brand=topbar.querySelector('.brand');if(brand)brand.remove();var actions=topbar.querySelector('.top-actions');if(actions)actions.remove();
var requestedProject=new URLSearchParams(location.search).get('project');if(requestedProject){var requestedRow=[].slice.call(document.querySelectorAll('#projectTree .project')).find(function(row){return row.textContent.indexOf(requestedProject)>-1});if(requestedRow)requestedRow.click()}
})();
