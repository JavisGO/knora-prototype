/* 检索结果页：复刻平台「回车后同时检索文档、生成智能回答」的三栏布局（2026-11-11）。
 * 左：知识目录（勾选即检索范围）；中：文档/图片/数据表结果；右：智能问答（与检索同时生成）。
 * 在 portal-home.html 上以 ?mode=results&keyword=… 呈现；首页回车后跳转过来。 */
(function(){
'use strict';
if(document.body.dataset.app!=='portal'||document.body.dataset.page!=='home')return;
var content=document.getElementById('content');if(!content)return;
var params=new URLSearchParams(location.search);
var kw=params.get('keyword')||'客户风险';
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
function go(q){location.href='portal-home.html?mode=results&keyword='+encodeURIComponent(q||'')}
function home(){location.href='portal-home.html'}

/* ---------- 首页：回车 / 搜索 跳转到结果页 ---------- */
if(params.get('mode')!=='results'){
  var btn=document.getElementById('homeSearchBtn'),input=document.getElementById('homeSearch');
  if(btn&&input)document.addEventListener('click',function(e){
    if(!e.target.closest('#homeSearchBtn')&&!(e.target.closest&&e.target.closest('.hr-kw-item')&&e.target.closest('[data-kw]')))return;
    e.preventDefault();e.stopImmediatePropagation();go(input.value.trim());
  },true);
  if(input)document.addEventListener('keydown',function(e){
    if(e.target===input&&e.key==='Enter'&&!e.isComposing){e.preventDefault();e.stopImmediatePropagation();go(input.value.trim())}
  },true);
  return;
}

/* ---------- 结果页数据（原型示例） ---------- */
var DOCS=[
 {id:'doc-risk',ext:'docx',name:'客户风险分级与处置管理办法.docx',snippet:'统一重点客户经营风险识别、分级、处置与升级审批要求，客户风险由客户运营部按季度复核。',time:'2026-09-28 16:41',owner:'张敏',no:'ae67525a11d8d545f425feca39c5d831',path:'赛豆企业 / 赛力斯集团董事委员会 / 采购组 / 制度文档'},
 {id:'doc-report',ext:'pdf',name:'2026 年重点客户经营分析报告.pdf',snippet:'汇总重点客户经营趋势与风险信号：本月 3 家客户出现回款逾期，需按风险处置流程跟进。',time:'2026-09-28 09:42',owner:'陈宇',no:'7b3cbba7d0274a5cbf0d71a12d8f736d',path:'赛豆企业 / 赛力斯集团董事委员会 / 采购组 / 经营分析'},
 {id:'doc-playbook',ext:'docx',name:'重点客户联合运营手册.docx',snippet:'重点客户跨部门联合运营流程、角色分工：风险事件由一线确认后 24 小时内升级。',time:'2026-09-27 18:14',owner:'王晨',no:'5b3b71878d22ea49865a9f761c1d43be',path:'赛豆企业 / 赛力斯集团董事委员会 / 采购组 / 运营手册'},
 {id:'doc-channel',ext:'docx',name:'渠道策略复盘纪要.docx',snippet:'华东区域渠道复盘：渠道客户风险预警由系统自动推送至对应负责人。',time:'2026-09-27 16:35',owner:'王晨',no:'c29596070a7f494bb2ee3c253d943b44',path:'个人空间 / 复盘材料'},
 {id:'doc-guide',ext:'md',name:'质量追溯与供应风险分析_原始场景说明.md',snippet:'以客户风险为例说明追溯链路：从风险信号表到处置工单的完整数据链。',time:'2026-09-26 10:02',owner:'李静',no:'22f1c0aa4e9b4d0bafe51730f7c81e55',path:'个人空间 / 项目资料'},
 {id:'doc-supplier',ext:'pdf',name:'供应商风险准入与年审规范.pdf',snippet:'供应商准入环节须完成风险筛查，年审不通过即冻结合作并转入处置流程。',time:'2026-09-25 14:20',owner:'赵宁',no:'8e10d5cf6a2b4f7e9c0311aa25d84b07',path:'赛豆企业 / 赛力斯集团董事委员会 / 采购1组 / 采购制度'}
];
var IMAGES=[
 {id:'doc-risk',name:'客户风险分级矩阵.png',source:'客户风险分级与处置管理办法.docx',page:'第 3 页'},
 {id:'doc-report',name:'本月风险信号趋势图.png',source:'2026 年重点客户经营分析报告.pdf',page:'第 7 页'},
 {id:'doc-playbook',name:'风险升级流程图.png',source:'重点客户联合运营手册.docx',page:'第 5 页'}
];
var TABLES=[
 {name:'客户风险信号表',english:'customer_risk_signal',source:'MySQL',path:'采购组 / 客户经营主题数据'},
 {name:'供应商主数据表',english:'supplier_master',source:'Doris',path:'采购1组 / 供应链协同数据'},
 {name:'销售订单明细表',english:'sales_order_detail',source:'Oracle',path:'采购组 / 经营分析主题数据'}
];
var TREE=[
 {name:'个人空间',count:2,path:'个人空间',depth:0},
 {name:'赛豆企业',count:12,path:'赛豆企业',depth:0,children:[
  {name:'赛力斯集团董事委员会',count:8,path:'赛豆企业 / 赛力斯集团董事委员会',depth:1,children:[
   {name:'采购组',count:5,path:'赛豆企业 / 赛力斯集团董事委员会 / 采购组',depth:2},
   {name:'采购1组',count:2,path:'赛豆企业 / 赛力斯集团董事委员会 / 采购1组',depth:2}]},
  {name:'赛力斯集团自定义空间',count:1,path:'赛豆企业 / 赛力斯集团自定义空间',depth:1}]}
];
var HOT=['客户风险','采购管理办法','供应商准入','经营分析','重点客户'];
var RELATED=['客户风险分级','风险处置流程','重点客户清单','供应商风险','风险信号表','回款逾期'];
var EXT_LABEL={pdf:'PDF',docx:'Word',md:'MD'};

/* ---------- 渲染 ---------- */
var state={tab:'docs',dir:{},type:'all',qaMsgs:[]};
function hl(text){var t=esc(text);if(kw)t=t.split(esc(kw)).join('<mark>'+esc(kw)+'</mark>');return t}
function fileIcon(ext){return '<span class="psr-ficon psr-'+ext+'">'+(ext==='pdf'?'P':ext==='md'?'M':ext==='xlsx'?'X':'W')+'</span>'}
function treeHtml(nodes){return nodes.map(function(n){
  var checked=state.dir[n.path]!==false;
  return '<div class="psr-node" style="--d:'+n.depth+'">'+
   '<button class="psr-arrow" '+(n.children?'data-fold="'+esc(n.path)+'"':'disabled')+'>▾</button>'+
   '<label><input type="checkbox" data-dir="'+esc(n.path)+'" '+(checked?'checked':'')+'><b>'+esc(n.name)+'</b></label>'+
   '<em>'+n.count+'</em></div>'+(n.children?'<div class="psr-children" data-children="'+esc(n.path)+'">'+treeHtml(n.children)+'</div>':'')
}).join('')}
/* 勾选即范围：节点须自身勾选且所有祖先勾选才算纳入；无任何纳入节点时视为全部 */
function flatten(nodes,out){(nodes||[]).forEach(function(n){out[n.path]=n;(n.children?flatten(n.children,out):0)});return out}
var ALL_NODES=flatten(TREE,{});
function docMatches(d){
  function included(p){var n=ALL_NODES[p];while(n){if(state.dir[n.path]===false)return false;n=ALL_NODES[n.path.split(' / ').slice(0,-1).join(' ')]}return true}
  var scope=Object.keys(ALL_NODES).filter(function(p){return included(p)&&!Object.keys(ALL_NODES).some(function(q){return q.indexOf(p+' / ')===0&&included(q)})});
  if(!scope.length)return true;
  return scope.some(function(p){return d.path.indexOf(p)===0});
}
function docRows(){
  var items=DOCS.filter(docMatches).filter(function(d){return state.type==='all'||d.ext===state.type});
  return {count:items.length,html:items.map(function(d,i){return '<article class="psr-item"><div class="psr-item-top">'+fileIcon(d.ext)+'<div class="psr-item-main"><a class="psr-item-name" href="portal-document-detail.html?doc='+encodeURIComponent(d.id)+'">'+hl(d.name)+'</a><p>'+hl(d.snippet)+'</p><a class="psr-hit" href="portal-document-detail.html?doc='+encodeURIComponent(d.id)+'">查看命中上下文 <i>›</i></a></div><input type="checkbox" class="psr-pick" aria-label="选择"></div><div class="psr-item-meta"><span>更新时间：'+d.time+'</span><span>上传人：'+esc(d.owner)+'</span><span>文档编号：'+d.no+'</span><button class="psr-copy" data-copy="'+d.no+'" aria-label="复制文档编号">⧉</button></div><div class="psr-item-ops"><span class="psr-ops-l"><button data-op="like">👍</button><button data-op="dislike">👎</button><button data-op="fav">☆ 收藏</button></span><span class="psr-ops-r"><a href="portal-document-detail.html?doc='+encodeURIComponent(d.id)+'">👁 预览</a><a href="portal-document-detail.html?doc='+encodeURIComponent(d.id)+'" target="_blank" rel="noopener">↗ 新窗口打开</a></span></div></article>'}).join('')||'<div class="psr-empty">没有符合条件的结果</div>'}
}
function imageRows(){var items=IMAGES;return {count:items.length,html:'<div class="psr-imgs">'+items.map(function(m){return '<a class="psr-img" href="portal-document-detail.html?doc='+encodeURIComponent(m.id)+'"><span class="psr-img-ph">'+esc(m.name.slice(0,1))+'</span><b>'+hl(m.name)+'</b><small>'+esc(m.source)+' · '+esc(m.page)+'</small></a>'}).join('')+'</div>'}}
function tableRows(){var items=TABLES.filter(function(t){return docMatches({path:'赛豆企业 / 赛力斯集团董事委员会 / '+t.path})});return {count:items.length,html:items.map(function(t){return '<article class="psr-item"><div class="psr-item-top"><span class="psr-ficon psr-tb">T</span><div class="psr-item-main"><a class="psr-item-name" href="portal-resources.html">'+hl(t.name)+' <small>'+esc(t.english)+'</small></a><p>'+esc(t.source)+' · '+esc(t.path)+'</p></div><input type="checkbox" class="psr-pick" aria-label="选择"></div></article>'}).join('')||'<div class="psr-empty">没有符合条件的结果</div>'}}
function pane(){return state.tab==='docs'?docRows():state.tab==='images'?imageRows():tableRows()}

function qaAnswer(q){return '根据检索到的资料，「'+esc(q)+'」主要涉及：客户风险分级与处置管理办法统一了风险识别、分级与升级审批要求<sup>[1]</sup>；2026 年重点客户经营分析报告显示本月 3 家客户出现回款逾期，需按处置流程跟进<sup>[2]</sup>。建议先阅读管理办法第三章，再对照经营分析报告确认名单。'}
function render(){content.innerHTML=
 '<section class="psr">'+
 '<header class="psr-top"><button class="psr-back" data-back aria-label="返回首页">‹</button><div class="psr-bar">'+
  '<nav class="psr-tabs"><button class="on" data-ptab="search">🔍 知识检索</button><button data-ptab="ask">💡 智能问答</button></nav>'+
  '<span class="psr-scope">在全部有权空间中检索</span>'+
  '<div class="psr-input"><input id="psrKw" value="'+esc(kw)+'" placeholder="检索全域知识"><span class="psr-hint">回车后同时检索文档、生成智能回答</span><button class="psr-go" data-go>🔍 搜索</button></div>'+
 '</div></header>'+
 '<div class="psr-hot"><span class="psr-hot-label">🔥 热门</span><div class="psr-hot-list">'+HOT.map(function(w){return '<button data-hot="'+esc(w)+'" class="'+(w===kw?'on':'')+'">'+hl(w)+'</button>'}).join('')+'</div><span class="psr-hot-r"><button class="psr-ghost" data-fold-hot>收起 ⌃</button><button class="psr-feedback">🙈 我要反馈</button></span></div>'+
 '<div class="psr-main">'+
  '<aside class="psr-dir"><header><b>知识目录</b><small>勾选即检索范围</small><i>≡</i></header><div class="psr-dir-search">⌕ <input placeholder="在已加载的目录中检索" aria-label="搜索目录"></div><div class="psr-tree">'+treeHtml(TREE)+'</div></aside>'+
  '<main class="psr-list"><nav class="psr-tabs2"><button class="on" data-tab="docs">文档</button><button data-tab="images">图片</button><button data-tab="tables">数据表</button></nav>'+
  '<div class="psr-toolbar"><b>共检索到 <span data-count></span> 条</b><span class="psr-filters"><select data-type><option value="all">类型</option><option value="pdf">PDF</option><option value="docx">Word</option><option value="md">MD</option></select><select><option>更新时间</option></select><select><option>上传人</option></select><span class="psr-sort">↕ 相关度排序 ⌄</span></span></div>'+
  '<div class="psr-rows" data-rows></div>'+
  '<footer class="psr-pager">共 <b data-count2></b> 条 <button>‹</button><button class="on">1</button><button>2</button><button>3</button><button>4</button><button>›</button><select><option>5 条/页</option></select></footer></main>'+
  '<aside class="psr-qa"><header><span class="psr-qa-ico">🤖</span><div><b>智能问答</b><small>针对关键词「'+esc(kw)+'」 <i class="psr-done">● 已生成</i></small></div></header><div class="psr-qa-body" data-qa-body></div>'+
  '<div class="psr-related"><span>相关搜索 <em>'+RELATED.length+'</em></span><button data-rel-expand>展开 ⌄</button><div class="psr-rel-chips" hidden>'+RELATED.map(function(w){return '<button data-hot="'+esc(w)+'">'+esc(w)+'</button>'}).join('')+'</div></div>'+
  '<form class="psr-ask" data-ask><input placeholder="围绕检索结果提问…" aria-label="追问"><button type="submit" aria-label="发送">➤</button></form></aside>'+
 '</div></section>';

 function drawRows(){var p=pane();content.querySelector('[data-rows]').innerHTML=p.html;content.querySelector('[data-count]').textContent=p.count;content.querySelector('[data-count2]').textContent=p.count}
 function drawQa(){var body=content.querySelector('[data-qa-body]');
  body.innerHTML='<div class="psr-q"><span>'+esc(kw)+'</span><div class="psr-q-ops"><button data-q-again>⟳ 重新回答</button><button data-q-copy>⧉ 复制问题</button></div></div>'+
  state.qaMsgs.map(function(m){return '<div class="psr-a"><p>'+(m.q?'<b>问：</b>'+esc(m.q)+'<br>':'')+(m.a||qaAnswer(kw))+'</p></div>'}).join('')+
  '<div class="psr-steps"><div class="psr-step"><i>📚</i>知识检索 · doc-center<em class="ok">✔ 完成</em></div><div class="psr-step"><i>⚡</i>大模型 · deepseek-v4.1-flash<em class="ok">✔ 完成</em></div></div>'}
 drawRows();drawQa();

 /* 事件 */
 content.querySelector('[data-back]').onclick=home;
 content.querySelector('[data-go]').onclick=function(){go(content.querySelector('#psrKw').value.trim())};
 content.querySelector('#psrKw').onkeydown=function(e){if(e.key==='Enter'&&!e.isComposing)go(this.value.trim())};
 content.querySelectorAll('[data-hot]').forEach(function(b){b.onclick=function(){go(b.dataset.hot)}});
 content.querySelectorAll('[data-ptab]').forEach(function(b){b.onclick=function(){content.querySelectorAll('[data-ptab]').forEach(function(x){x.classList.toggle('on',x===b)})}});
 content.querySelectorAll('[data-tab]').forEach(function(b){b.onclick=function(){state.tab=b.dataset.tab;content.querySelectorAll('[data-tab]').forEach(function(x){x.classList.toggle('on',x===b)});drawRows()}});
 content.querySelector('[data-type]').onchange=function(){state.type=this.value;drawRows()};
 content.querySelector('.psr-tree').addEventListener('change',function(e){var i=e.target.closest('[data-dir]');if(!i)return;state.dir[i.dataset.dir]=i.checked;drawRows()});
 content.querySelector('.psr-tree').addEventListener('click',function(e){var f=e.target.closest('[data-fold]');if(!f)return;var ch=content.querySelector('[data-children="'+f.dataset.fold+'"]');if(ch){ch.hidden=!ch.hidden;f.textContent=ch.hidden?'▸':'▾'}});
 var hotFold=content.querySelector('[data-fold-hot]');
 hotFold.onclick=function(){var list=content.querySelector('.psr-hot-list'),hidden=list.classList.toggle('closed');hotFold.textContent=hidden?'展开 ⌄':'收起 ⌃'};
 content.querySelector('[data-rel-expand]').onclick=function(){var ch=content.querySelector('.psr-rel-chips');ch.hidden=!ch.hidden;this.textContent=ch.hidden?'展开 ⌄':'收起 ⌃'};
 content.addEventListener('click',function(e){
   var op=e.target.closest('[data-op]');if(op){if(op.dataset.op==='fav'){op.classList.toggle('on');op.textContent=op.classList.contains('on')?'★ 已收藏':'☆ 收藏'}else{op.classList.toggle('on');if(!op.querySelector('.ok'))op.classList.add('ok')}return}
   var cp=e.target.closest('[data-copy]');if(cp&&navigator.clipboard)navigator.clipboard.writeText(cp.dataset.copy).then(function(){cp.textContent='✓';setTimeout(function(){cp.textContent='⧉'},1200)});
   var qa=e.target.closest('[data-q-again]');if(qa){state.qaMsgs=[];drawQa()}
   var qc=e.target.closest('[data-q-copy]');if(qc&&navigator.clipboard)navigator.clipboard.writeText(kw);
 });
 content.querySelector('[data-ask]').onsubmit=function(e){e.preventDefault();var i=this.querySelector('input'),q=i.value.trim();if(!q)return;state.qaMsgs.push({q:q,a:'已围绕检索结果生成回答（原型演示）：请参考上方引用的 [1][2] 来源。'});i.value='';drawQa()};
}
render();
})();
