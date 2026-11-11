/* 资源页界面优化（2026-11-11）：在现有渲染结果上做增强，不改动原有业务逻辑。 */
(function(){
'use strict';
var content=document.getElementById('content');
if(!content)return;
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
// 原型示例：文档被哪些项目引用（正式环境应由引用关系服务提供）
var P={a:['purchase-project','采购用户创建-采购项目'],b:['supplier-project','供应商协同管理项目'],c:['purchase-analysis','采购价格分析项目']};
var REFS={'doc-risk':[P.a,P.b],'doc-report':[P.a,P.b,P.c],'doc-playbook':[P.b]};
function docId(row){var a=row.querySelector('.pr2-doc-name a');if(!a)return '';var m=/[?&]doc=([^&]+)/.exec(a.getAttribute('href')||'');return m?decodeURIComponent(m[1]):''}
function refsOf(row){return REFS[docId(row)]||[]}
function refNames(refs){return refs.map(function(r){return r[1]}).join('、')}

function enhanceHeader(){
  var title=content.querySelector('.pr2-title>div');if(!title||title.querySelector('.opt-meta'))return;
  var active=content.querySelector('.pr2-enterprise-tree button.active')||content.querySelector('.pr2-root-nav button.active[data-pr2-space],.pr2-root-nav button.active[data-pr2-scope=enterprise]');
  if(!active)return;
  var role=(active.querySelector('em')||{}).textContent||'',depth=Number((active.style.getPropertyValue('--d')||'0'))||0,parent='';
  if(depth>0){var prev=active.previousElementSibling;while(prev){if((Number(prev.style.getPropertyValue('--d'))||0)<depth){parent=(prev.querySelector('b')||{}).textContent||'';break}prev=prev.previousElementSibling}if(!parent){var root=content.querySelector('.pr2-root-nav button[data-pr2-scope=enterprise] b');parent=root?root.textContent:''}}
  var meta=document.createElement('p');meta.className='opt-meta';
  meta.innerHTML=(parent?'<span>上级空间　<b>'+esc(parent)+'</b></span>':'')+(role?'<span>我的角色　<b>'+esc(role)+'</b></span>':'');
  if(meta.innerHTML)title.appendChild(meta);
}

function checked(){return content.querySelectorAll('.enterprise-table input[data-pr2-select]:checked:not([data-pr2-select$="-all"])').length}
function syncSelection(){
  var bar=content.querySelector('.pr2-command.enterprise');if(!bar)return;
  var n=checked(),on=n>0;bar.classList.toggle('opt-selecting',on);
  var info=bar.querySelector('.opt-selbar');
  if(on&&!info){info=document.createElement('span');info.className='opt-selbar';info.innerHTML='已选 <b></b> 项<button type="button" data-opt-clear>取消</button>';var first=bar.querySelector('[data-selection-action]');bar.insertBefore(info,first)}
  if(info){info.querySelector('b').textContent=n;info.hidden=!on}
}
function enhanceStats(){
  var cards=content.querySelectorAll('.pr2-stats.enterprise .pr2-stat');if(cards.length<4)return;
  [[1,'解析成功'],[3,'待审批']].forEach(function(pair){var card=cards[pair[0]];if(card.dataset.optFilter)return;card.dataset.optFilter=pair[1];card.classList.add('opt-clickable');card.title='点击筛选，再点一次取消'});
  var folders=content.querySelectorAll('.enterprise-table .pr2-folder-row').length;
  var first=cards[0];if(first&&!first.querySelector('.opt-folder-note')){var note=document.createElement('em');note.className='opt-folder-note';note.textContent='另有 '+folders+' 个目录';first.querySelector('span').appendChild(note)}
}
function applyFilter(){
  var active=content.querySelector('.pr2-stat.opt-on'),key=active?active.dataset.optFilter:'';
  content.querySelectorAll('.enterprise-table .pr2-tr').forEach(function(row){
    if(!key){row.hidden=false;return}
    var isFolder=row.classList.contains('pr2-folder-row');
    row.hidden=isFolder||row.textContent.indexOf(key)<0;
  });
}
function tidyActions(){
  content.querySelectorAll('.enterprise-table .pr2-tr:not(.pr2-folder-row) .pr2-row-actions').forEach(function(ops){
    var wrap=ops.querySelector('.pr2-row-menu-wrap'),menu=wrap&&wrap.querySelector('.pr2-row-menu');if(!menu)return;
    Array.prototype.slice.call(ops.children).filter(function(el){return el!==wrap&&el.tagName==='BUTTON'}).reverse().forEach(function(btn){menu.insertBefore(btn,menu.firstChild)});
  });
}
function enhanceRows(){
  content.querySelectorAll('.enterprise-table .pr2-tr').forEach(function(row){
    if(row.dataset.optRow)return;
    var isFolder=row.classList.contains('pr2-folder-row');
    row.dataset.optRow='1';
    // 解析状态：圆点 + 文字
    var parse=row.querySelector('.pr2-parse');if(parse&&/失败/.test(parse.textContent))parse.classList.add('opt-bad');
    // 被引用列
    var cell=document.createElement('span');cell.className='opt-ref-cell';
    if(isFolder)cell.textContent='—';
    else{var refs=refsOf(row);if(!refs.length){cell.textContent='未引用';cell.classList.add('none')}else{cell.innerHTML='<a href="portal-projects.html?project='+esc(refs[0][0])+'" title="'+esc(refNames(refs))+'">'+refs.length+' 个项目</a>'}}
    var ops=row.querySelector('.pr2-row-actions');if(ops)row.insertBefore(cell,ops);else row.appendChild(cell);
    if(!ops)return;
    var wrap=ops.querySelector('.pr2-row-menu-wrap'),menu=wrap&&wrap.querySelector('.pr2-row-menu');
    if(!menu)return;
    var more=wrap.querySelector('[data-enterprise-menu]');if(more){more.textContent='⋯';more.setAttribute('aria-label','更多操作');more.classList.add('opt-more')}
    if(isFolder){var edit=menu.querySelector('[data-enterprise-folder-edit]');if(edit)edit.textContent='重命名'}
    else{
      var secondary=Array.prototype.slice.call(ops.children).filter(function(el){return el!==wrap&&el.tagName==='BUTTON'});
      secondary.reverse().forEach(function(btn){menu.insertBefore(btn,menu.firstChild)});
      var link=row.querySelector('.pr2-doc-name a');
      if(link&&!ops.querySelector('.opt-preview')){var pv=document.createElement('a');pv.className='opt-preview';pv.href=link.getAttribute('href');pv.textContent='预览';ops.insertBefore(pv,wrap)}
    }
  });
  var head=content.querySelector('.enterprise-table .pr2-th'),ops=head&&head.lastElementChild;
  if(head&&!head.querySelector('.opt-ref-head')){var h=document.createElement('b');h.className='opt-ref-head';h.textContent='被引用';head.insertBefore(h,ops)}
}
function enhanceEmpty(){
  var table=content.querySelector('.enterprise-table');if(!table)return;
  var rows=table.querySelectorAll('.pr2-tr'),visible=Array.prototype.some.call(rows,function(r){return !r.hidden}),empty=table.querySelector('.opt-empty');
  if(!visible&&!empty){var filtered=!!content.querySelector('.pr2-stat.opt-on');empty=document.createElement('div');empty.className='opt-empty';empty.innerHTML=filtered?'<p>没有符合条件的文档</p><button type="button" data-opt-reset>清空筛选</button>':'<p>当前目录下还没有内容，可新建文件目录或上传文件。</p>';table.appendChild(empty)}
  if(visible&&empty)empty.remove();
}
var busy=false,timer=0;
function enhance(){
  if(busy)return;busy=true;
  try{enhanceHeader();enhanceStats();enhanceRows();tidyActions();syncSelection();applyFilter();enhanceEmpty()}finally{busy=false}
}
new MutationObserver(function(){clearTimeout(timer);timer=setTimeout(enhance,60)}).observe(content,{childList:true,subtree:true});
enhance();

content.addEventListener('change',function(e){if(e.target.matches('input[data-pr2-select]'))setTimeout(syncSelection,0)});
content.addEventListener('click',function(e){
  var card=e.target.closest('.pr2-stat.opt-clickable');
  if(card){var on=!card.classList.contains('opt-on');content.querySelectorAll('.pr2-stat.opt-on').forEach(function(c){c.classList.remove('opt-on')});if(on)card.classList.add('opt-on');applyFilter();var old=content.querySelector('.opt-empty');if(old)old.remove();enhanceEmpty();return}
  if(e.target.closest('[data-opt-clear]')){content.querySelectorAll('.enterprise-table input[data-pr2-select]:checked').forEach(function(i){i.checked=false;i.dispatchEvent(new Event('change',{bubbles:true}))});syncSelection();return}
  if(e.target.closest('[data-opt-reset]')){content.querySelectorAll('.pr2-stat.opt-on').forEach(function(c){c.classList.remove('opt-on')});applyFilter();var old2=content.querySelector('.opt-empty');if(old2)old2.remove();enhanceEmpty()}
});

// 删除、移动、归档前提示引用
var CONFIRMED=null;
// 挂在 window 捕获阶段，早于页面原有的删除/移动处理
window.addEventListener('click',function(e){
  var btn=e.target.closest('[data-enterprise-doc-delete],[data-enterprise-doc-move],[data-doc-archive]');
  if(!btn||btn===CONFIRMED)return;
  var row=btn.closest('.pr2-tr');if(!row)return;
  var refs=refsOf(row);if(!refs.length)return;
  e.preventDefault();e.stopImmediatePropagation();
  var action=btn.hasAttribute('data-enterprise-doc-delete')?'删除':btn.hasAttribute('data-enterprise-doc-move')?'移动':'归档';
  var name=((row.querySelector('.pr2-doc-name a')||{}).textContent)||'该文档';
  var mask=document.createElement('div');mask.className='opt-ref-mask';
  mask.innerHTML='<section class="opt-ref-modal" role="dialog" aria-modal="true"><h3>该文档正在被项目引用</h3><p>「'+esc(name)+'」被以下 '+refs.length+' 个项目使用，'+action+'后可能影响这些项目：</p><ul>'+refs.map(function(r){return '<li><a href="portal-projects.html?project='+esc(r[0])+'">'+esc(r[1])+'</a></li>'}).join('')+'</ul><footer><button type="button" data-cancel>取消</button><button type="button" class="danger" data-go>继续'+action+'</button></footer></section>';
  document.body.appendChild(mask);
  mask.addEventListener('click',function(ev){
    if(ev.target===mask||ev.target.closest('[data-cancel]'))mask.remove();
    else if(ev.target.closest('[data-go]')){mask.remove();CONFIRMED=btn;btn.click();CONFIRMED=null}
  });
},true);
})();
