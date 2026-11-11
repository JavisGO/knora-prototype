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


/* ---------- 筛选数据：资源（类型与目录、标签）与项目 ---------- */
var PROJECTS=[
 {id:'purchase-project',name:'采购用户创建-采购项目',role:'我管理的'},
 {id:'supplier-project',name:'供应商协同管理项目',role:'我参与的'},
 {id:'purchase-analysis',name:'采购价格分析项目',role:'我管理的'},
 {id:'group-knowledge',name:'集团知识治理项目',role:'我参与的'}
];
var DOC_META={
 'doc-risk':{p:['purchase-project','supplier-project'],t:['客户风险','管理制度']},
 'doc-report':{p:['purchase-project','purchase-analysis'],t:['经营分析','重点客户']},
 'doc-playbook':{p:['supplier-project','purchase-analysis'],t:['重点客户','客户服务']},
 'doc-channel':{p:[],t:['经营分析','高频访问']},
 'doc-guide':{p:['group-knowledge'],t:['客户风险','供应链']},
 'doc-supplier':{p:['supplier-project'],t:['供应链','管理制度']}
};
var TABLE_META={'customer_risk_signal':{p:['purchase-project'],t:['客户风险']},'supplier_master':{p:['supplier-project'],t:['供应链']},'sales_order_detail':{p:['purchase-analysis'],t:['经营分析']}};
var TAGS=['客户风险','管理制度','经营分析','客户服务','供应链','重点客户','高频访问'];
var RES_TYPES=[['docs','文档'],['images','图片'],['tables','数据表']];
function projName(id){return (PROJECTS.filter(function(p){return p.id===id})[0]||{}).name||id}
function dMeta(d){var m=DOC_META[d.id]||{p:[],t:[]};return {p:m.p,t:m.t,path:d.path||''}}
function tMeta(t){var m=TABLE_META[t.english]||{p:[],t:[]};return {p:m.p,t:m.t,path:'赛豆企业 / 赛力斯集团董事委员会 / '+t.path}}
function iMeta(i){return dMeta(DOCS.filter(function(x){return x.id===i.id})[0]||{id:i.id})}
/* ---------- 渲染 ---------- */
var state={tab:'docs',dir:{},folded:{},fmt:'all',qaMsgs:[],types:{docs:true,images:true,tables:true},tags:[],projects:[],unassigned:false,projQ:'',pop:null};
function hl(text){var t=esc(text);if(kw)t=t.split(esc(kw)).join('<mark>'+esc(kw)+'</mark>');return t}
function fileIcon(ext){return '<span class="psr-ficon psr-'+ext+'">'+(ext==='pdf'?'P':ext==='md'?'M':ext==='xlsx'?'X':'W')+'</span>'}

/* 目录：勾选即范围；节点须自身勾选且所有祖先勾选才算纳入 */
function flatten(nodes,out){(nodes||[]).forEach(function(n){out[n.path]=n;(n.children?flatten(n.children,out):0)});return out}
var ALL_NODES=flatten(TREE,{});
function treeHtml(nodes){return nodes.map(function(n){
  var checked=state.dir[n.path]!==false,fold=!!state.folded[n.path];
  return '<div class="psr-node" style="--d:'+n.depth+'"><button class="psr-arrow" '+(n.children?'data-fold="'+esc(n.path)+'"':'disabled')+'>'+(n.children?(fold?'▸':'▾'):'')+'</button><label><input type="checkbox" data-dir="'+esc(n.path)+'" '+(checked?'checked':'')+'><b>'+esc(n.name)+'</b></label><em>'+n.count+'</em></div>'+(n.children&&!fold?treeHtml(n.children):'')
}).join('')}
function docMatches(d){
  function included(p){var n=ALL_NODES[p];while(n){if(state.dir[n.path]===false)return false;n=ALL_NODES[n.path.split(' / ').slice(0,-1).join(' / ')]}return true}
  var scope=Object.keys(ALL_NODES).filter(function(p){return included(p)&&!Object.keys(ALL_NODES).some(function(q){return q.indexOf(p+' / ')===0&&included(q)})});
  if(!scope.length)return true;
  return scope.some(function(p){return d.path.indexOf(p)===0});
}
/* 资源与项目两类条件同时生效；同类内：标签、项目为「任一命中」 */
function passProject(m){if(!state.projects.length&&!state.unassigned)return true;return m.p.some(function(id){return state.projects.indexOf(id)>-1})||(state.unassigned&&!m.p.length)}
function passTag(m){return !state.tags.length||m.t.some(function(t){return state.tags.indexOf(t)>-1})}
function pass(m){return docMatches(m)&&passProject(m)&&passTag(m)}
function docItems(){return DOCS.filter(function(d){return pass(dMeta(d))&&(state.fmt==='all'||d.ext===state.fmt)})}
function imageItems(){return IMAGES.filter(function(i){return pass(iMeta(i))})}
function tableItems(){return TABLES.filter(function(t){return pass(tMeta(t))})}
function tagsLine(m){return (m.t.map(function(t){return '<span class="psr-tag"># '+esc(t)+'</span>'}).join(''))+(m.p.length?m.p.map(function(id){return '<span class="psr-proj">◫ '+esc(projName(id))+'</span>'}).join(''):'<span class="psr-proj none">未归属项目</span>')}
function docHtml(items){return items.map(function(d){var m=dMeta(d),u='portal-document-detail.html?doc='+encodeURIComponent(d.id);return '<article class="psr-item"><div class="psr-item-top">'+fileIcon(d.ext)+'<div class="psr-item-main"><a class="psr-item-name" href="'+u+'">'+hl(d.name)+'</a><p>'+hl(d.snippet)+'</p><a class="psr-hit" href="'+u+'">查看命中上下文 <i>›</i></a></div><input type="checkbox" class="psr-pick" aria-label="选择"></div><div class="psr-item-tags">'+tagsLine(m)+'</div><div class="psr-item-meta"><span>更新时间：'+d.time+'</span><span>上传人：'+esc(d.owner)+'</span><span>文档编号：'+d.no+'</span><button class="psr-copy" data-copy="'+d.no+'" aria-label="复制文档编号">⧉</button></div><div class="psr-item-ops"><span class="psr-ops-l"><button data-op="like">👍</button><button data-op="dislike">👎</button><button data-op="fav">☆ 收藏</button></span><span class="psr-ops-r"><a href="'+u+'">👁 预览</a><a href="'+u+'" target="_blank" rel="noopener">↗ 新窗口打开</a></span></div></article>'}).join('')}
function imageHtml(items){return '<div class="psr-imgs">'+items.map(function(m){return '<a class="psr-img" href="portal-document-detail.html?doc='+encodeURIComponent(m.id)+'"><span class="psr-img-ph">'+esc(m.name.slice(0,1))+'</span><b>'+hl(m.name)+'</b><small>'+esc(m.source)+' · '+esc(m.page)+'</small></a>'}).join('')+'</div>'}
function tableHtml(items){return items.map(function(t){var m=tMeta(t);return '<article class="psr-item"><div class="psr-item-top"><span class="psr-ficon psr-tb">T</span><div class="psr-item-main"><a class="psr-item-name" href="portal-resources.html">'+hl(t.name)+' <small>'+esc(t.english)+'</small></a><p>'+esc(t.source)+' · '+esc(t.path)+'</p></div><input type="checkbox" class="psr-pick" aria-label="选择"></div><div class="psr-item-tags">'+tagsLine(m)+'</div></article>'}).join('')}

/* ---------- 筛选：状态摘要 ---------- */
function activeInfo(){
  var chips=[],res=0,proj=0,tsel=RES_TYPES.filter(function(r){return state.types[r[0]]});
  if(tsel.length<3){chips.push({k:'types',text:'资源类型：'+tsel.map(function(r){return r[1]}).join('、')});res++}
  var ex=Object.keys(state.dir).filter(function(k){return state.dir[k]===false}).length;
  if(ex){chips.push({k:'dir',text:'目录：已排除 '+ex+' 项'});res++}
  state.tags.forEach(function(t){chips.push({k:'tag',v:t,text:'标签：'+t});res++});
  state.projects.forEach(function(id){chips.push({k:'proj',v:id,text:'项目：'+projName(id)});proj++});
  if(state.unassigned){chips.push({k:'unassigned',text:'项目：未归属项目'});proj++}
  return {chips:chips,res:res,proj:proj,any:chips.length>0};
}
function projCount(id){var n=0;DOCS.forEach(function(d){if(dMeta(d).p.indexOf(id)>-1)n++});TABLES.forEach(function(t){if(tMeta(t).p.indexOf(id)>-1)n++});return n}
function unassignedCount(){var n=0;DOCS.forEach(function(d){if(!dMeta(d).p.length)n++});TABLES.forEach(function(t){if(!tMeta(t).p.length)n++});return n}
function resPopHtml(){return '<div class="psr-pop-cols"><section><h4>资源类型</h4>'+RES_TYPES.map(function(r){return '<label class="psr-check"><input type="checkbox" data-rtype="'+r[0]+'" '+(state.types[r[0]]?'checked':'')+'><span>'+r[1]+'</span></label>'}).join('')+'</section><section class="wide"><h4>目录 <small>与左侧知识目录同步</small></h4><div class="psr-tree psr-tree-pop" data-tree>'+treeHtml(TREE)+'</div></section></div><section class="psr-tagsec"><h4>标签 <small>可多选，命中任一即可</small></h4><div class="psr-tagchips">'+TAGS.map(function(t){return '<label class="psr-tagchip'+(state.tags.indexOf(t)>-1?' on':'')+'"><input type="checkbox" data-tag="'+esc(t)+'" '+(state.tags.indexOf(t)>-1?'checked':'')+'># '+esc(t)+'</label>'}).join('')+'</div></section><footer><button class="psr-linkbtn" data-res-clear>清空资源筛选</button><button class="psr-done" data-pop-done>完成</button></footer>'}
function projListHtml(){var q=state.projQ.trim().toLowerCase(),all=!state.projects.length&&!state.unassigned;
  var rows=PROJECTS.filter(function(p){return !q||p.name.toLowerCase().indexOf(q)>-1}).map(function(p){return '<label class="psr-prow"><input type="checkbox" data-proj="'+p.id+'" '+(state.projects.indexOf(p.id)>-1?'checked':'')+'><span class="psr-pname">'+esc(p.name)+'</span><em class="psr-role">'+p.role+'</em><small>'+projCount(p.id)+' 项资源</small></label>'}).join('');
  return '<label class="psr-prow psr-prow-all"><input type="checkbox" data-projall '+(all?'checked':'')+'><span class="psr-pname">全部项目</span><small>不限定项目</small></label>'+rows+(!q||'未归属项目'.indexOf(q)>-1?'<label class="psr-prow"><input type="checkbox" data-unassigned '+(state.unassigned?'checked':'')+'><span class="psr-pname">未归属项目</span><em class="psr-role grey">个人空间等</em><small>'+unassignedCount()+' 项资源</small></label>':'')+(rows||q&&'未归属项目'.indexOf(q)<0?'<div class="psr-empty small">没有匹配的项目</div>':'');
}

function render(){content.innerHTML=
 '<section class="psr">'+
 '<header class="psr-top"><button class="psr-back" data-back aria-label="返回首页">‹</button><div class="psr-bar">'+
  '<nav class="psr-tabs"><button class="on" data-ptab="search">🔍 知识检索</button><button data-ptab="ask">💡 智能问答</button></nav>'+
  '<span class="psr-scope" data-scope>在全部有权空间中检索</span>'+
  '<div class="psr-input"><input id="psrKw" value="'+esc(kw)+'" placeholder="检索全域知识"><span class="psr-hint">回车后同时检索文档、生成智能回答</span><button class="psr-go" data-go>🔍 搜索</button></div>'+
 '</div></header>'+
 '<div class="psr-filters2">'+
  '<div class="psr-fgroup"><button class="psr-fbtn" data-pop="res">▤ 资源 <i class="psr-fcount" data-fc="res" hidden></i><span class="psr-caret">⌄</span></button><div class="psr-pop psr-pop-res" data-pop-body="res" hidden></div></div>'+
  '<div class="psr-fgroup"><button class="psr-fbtn" data-pop="proj">◫ 项目 <i class="psr-fcount" data-fc="proj" hidden></i><span class="psr-caret">⌄</span></button><div class="psr-pop psr-pop-proj" data-pop-body="proj" hidden><div class="psr-psearch">⌕ <input data-proj-search placeholder="搜索项目名称" aria-label="搜索项目"></div><div class="psr-plist" data-proj-list></div><footer><button class="psr-linkbtn" data-proj-clear>清空项目筛选</button><button class="psr-done" data-pop-done>完成</button></footer></div></div>'+
  '<div class="psr-fchips" data-chips></div><button class="psr-linkbtn psr-freset" data-freset hidden>重置全部</button>'+
 '</div>'+
 '<div class="psr-hot"><span class="psr-hot-label">🔥 热门</span><div class="psr-hot-list">'+HOT.map(function(w){return '<button data-hot="'+esc(w)+'" class="'+(w===kw?'on':'')+'">'+hl(w)+'</button>'}).join('')+'</div><span class="psr-hot-r"><button class="psr-ghost" data-fold-hot>收起 ⌃</button><button class="psr-feedback">🙈 我要反馈</button></span></div>'+
 '<div class="psr-main">'+
  '<aside class="psr-dir"><header><b>知识目录</b><small>勾选即检索范围</small><i>≡</i></header><div class="psr-dir-search">⌕ <input placeholder="在已加载的目录中检索" aria-label="搜索目录"></div><div class="psr-tree" data-tree></div></aside>'+
  '<main class="psr-list"><nav class="psr-tabs2"><button class="on" data-tab="docs">文档 <em></em></button><button data-tab="images">图片 <em></em></button><button data-tab="tables">数据表 <em></em></button></nav>'+
  '<div class="psr-toolbar"><b>共检索到 <span data-count></span> 条</b><span class="psr-filters"><select data-type><option value="all">文件格式</option><option value="pdf">PDF</option><option value="docx">Word</option><option value="md">MD</option></select><select><option>更新时间</option></select><select><option>上传人</option></select><span class="psr-sort">↕ 相关度排序 ⌄</span></span></div>'+
  '<div class="psr-rows" data-rows></div>'+
  '<footer class="psr-pager">共 <b data-count2></b> 条 <button>‹</button><button class="on">1</button><button>2</button><button>3</button><button>4</button><button>›</button><select><option>5 条/页</option></select></footer></main>'+
  '<aside class="psr-qa"><header><span class="psr-qa-ico">🤖</span><div><b>智能问答</b><small>针对关键词「'+esc(kw)+'」 <i class="psr-done-t">● 已生成</i></small></div></header><div class="psr-qa-body" data-qa-body></div>'+
  '<div class="psr-related"><span>相关搜索 <em>'+RELATED.length+'</em></span><button data-rel-expand>展开 ⌄</button><div class="psr-rel-chips" hidden>'+RELATED.map(function(w){return '<button data-hot="'+esc(w)+'">'+esc(w)+'</button>'}).join('')+'</div></div>'+
  '<form class="psr-ask" data-ask><input placeholder="围绕检索结果提问…" aria-label="追问"><button type="submit" aria-label="发送">➤</button></form></aside>'+
 '</div></section>';

 function q(sel){return content.querySelector(sel)}
 function drawTrees(){content.querySelectorAll('[data-tree]').forEach(function(el){el.innerHTML=treeHtml(TREE)})}
 function drawResPop(){q('[data-pop-body=res]').innerHTML=resPopHtml()}
 function drawProjList(){q('[data-proj-list]').innerHTML=projListHtml()}
 function drawRows(){
   var d=docItems(),im=imageItems(),tb=tableItems(),cnt={docs:d.length,images:im.length,tables:tb.length};
   var vis=RES_TYPES.map(function(r){return r[0]}).filter(function(k){return state.types[k]});
   if(vis.indexOf(state.tab)<0)state.tab=vis[0];
   content.querySelectorAll('[data-tab]').forEach(function(b){var k=b.dataset.tab;b.hidden=!state.types[k];b.classList.toggle('on',k===state.tab);b.querySelector('em').textContent=cnt[k]});
   var n=cnt[state.tab],html=state.tab==='docs'?docHtml(d):state.tab==='images'?imageHtml(im):tableHtml(tb);
   q('[data-rows]').innerHTML=n?html:'<div class="psr-empty">没有符合条件的结果'+(activeInfo().any||state.fmt!=='all'?'<br><button class="psr-linkbtn" data-freset>清空筛选</button>':'')+'</div>';
   q('[data-count]').textContent=n;q('[data-count2]').textContent=n;
   q('[data-type]').hidden=state.tab!=='docs';
 }
 function drawFilters(){
   var a=activeInfo();
   [['res',a.res],['proj',a.proj]].forEach(function(x){var el=q('[data-fc='+x[0]+']');el.hidden=!x[1];el.textContent=x[1];q('[data-pop='+x[0]+']').classList.toggle('on',!!x[1]||state.pop===x[0])});
   q('[data-chips]').innerHTML=a.chips.map(function(c){return '<span class="psr-chip">'+esc(c.text)+'<button data-chip-x="'+c.k+'" data-v="'+esc(c.v||'')+'" aria-label="移除">×</button></span>'}).join('');
   q('[data-freset]').hidden=!a.any;
   q('[data-scope]').textContent=a.any?'已按筛选条件圈定范围':'在全部有权空间中检索';
 }
 function refresh(redrawPops){drawRows();drawFilters();drawTrees();if(redrawPops!==false){drawResPop();drawProjList()}}
 function setPop(name){state.pop=name;content.querySelectorAll('[data-pop-body]').forEach(function(el){el.hidden=el.dataset.popBody!==name});drawFilters()}
 function resetAll(){state.types={docs:true,images:true,tables:true};state.dir={};state.tags=[];state.projects=[];state.unassigned=false;state.fmt='all';q('[data-type]').value='all';refresh()}
 function drawQa(){var body=q('[data-qa-body]');
  body.innerHTML='<div class="psr-q"><span>'+esc(kw)+'</span><div class="psr-q-ops"><button data-q-again>⟳ 重新回答</button><button data-q-copy>⧉ 复制问题</button></div></div>'+
  state.qaMsgs.map(function(m){return '<div class="psr-a"><p>'+(m.q?'<b>问：</b>'+esc(m.q)+'<br>':'')+(m.a||qaAnswer(kw))+'</p></div>'}).join('')+
  '<div class="psr-steps"><div class="psr-step"><i>📚</i>知识检索 · doc-center<em class="ok">✔ 完成</em></div><div class="psr-step"><i>⚡</i>大模型 · deepseek-v4.1-flash<em class="ok">✔ 完成</em></div></div>'}
 refresh();drawQa();

 /* 事件 */
 q('[data-back]').onclick=home;
 q('[data-go]').onclick=function(){go(q('#psrKw').value.trim())};
 q('#psrKw').onkeydown=function(e){if(e.key==='Enter'&&!e.isComposing)go(this.value.trim())};
 content.querySelectorAll('[data-ptab]').forEach(function(b){b.onclick=function(){content.querySelectorAll('[data-ptab]').forEach(function(x){x.classList.toggle('on',x===b)})}});
 q('[data-type]').onchange=function(){state.fmt=this.value;drawRows();drawFilters()};
 q('[data-proj-search]').oninput=function(){state.projQ=this.value;drawProjList()};
 var hotFold=q('[data-fold-hot]');
 hotFold.onclick=function(){var list=q('.psr-hot-list'),hidden=list.classList.toggle('closed');hotFold.textContent=hidden?'展开 ⌄':'收起 ⌃'};
 q('[data-rel-expand]').onclick=function(){var ch=q('.psr-rel-chips');ch.hidden=!ch.hidden;this.textContent=ch.hidden?'展开 ⌄':'收起 ⌃'};
 q('[data-ask]').onsubmit=function(e){e.preventDefault();var i=this.querySelector('input'),t=i.value.trim();if(!t)return;state.qaMsgs.push({q:t,a:'已围绕检索结果生成回答（原型演示）：请参考上方引用的 [1][2] 来源。'});i.value='';drawQa()};

 content.addEventListener('change',function(e){var t=e.target;
   if(t.matches('[data-rtype]')){state.types[t.dataset.rtype]=t.checked;if(!RES_TYPES.some(function(r){return state.types[r[0]]}))state.types[t.dataset.rtype]=true;refresh();return}
   if(t.matches('[data-dir]')){state.dir[t.dataset.dir]=t.checked;refresh();return}
   if(t.matches('[data-tag]')){var v=t.dataset.tag,i=state.tags.indexOf(v);if(t.checked&&i<0)state.tags.push(v);if(!t.checked&&i>-1)state.tags.splice(i,1);refresh();return}
   if(t.matches('[data-proj]')){var id=t.dataset.proj,j=state.projects.indexOf(id);if(t.checked&&j<0)state.projects.push(id);if(!t.checked&&j>-1)state.projects.splice(j,1);refresh();return}
   if(t.matches('[data-unassigned]')){state.unassigned=t.checked;refresh();return}
   if(t.matches('[data-projall]')){if(t.checked){state.projects=[];state.unassigned=false}refresh();return}
 });
 content.addEventListener('click',function(e){var t=e.target;
   var pop=t.closest('[data-pop]');if(pop){e.stopPropagation();setPop(state.pop===pop.dataset.pop?null:pop.dataset.pop);return}
   if(t.closest('[data-pop-done]')){setPop(null);return}
   var fold=t.closest('[data-fold]');if(fold){state.folded[fold.dataset.fold]=!state.folded[fold.dataset.fold];drawTrees();return}
   if(t.closest('[data-res-clear]')){state.types={docs:true,images:true,tables:true};state.dir={};state.tags=[];refresh();return}
   if(t.closest('[data-proj-clear]')){state.projects=[];state.unassigned=false;refresh();return}
   if(t.closest('[data-freset]')){resetAll();return}
   var cx=t.closest('[data-chip-x]');if(cx){var k=cx.dataset.chipX,v=cx.dataset.v;
     if(k==='types')state.types={docs:true,images:true,tables:true};
     if(k==='dir')state.dir={};
     if(k==='tag')state.tags=state.tags.filter(function(x){return x!==v});
     if(k==='proj')state.projects=state.projects.filter(function(x){return x!==v});
     if(k==='unassigned')state.unassigned=false;
     refresh();return}
   var hot=t.closest('[data-hot]');if(hot){go(hot.dataset.hot);return}
   var op=t.closest('[data-op]');if(op){if(op.dataset.op==='fav'){op.classList.toggle('on');op.textContent=op.classList.contains('on')?'★ 已收藏':'☆ 收藏'}else{op.classList.toggle('on')}return}
   var cp=t.closest('[data-copy]');if(cp&&navigator.clipboard){navigator.clipboard.writeText(cp.dataset.copy).then(function(){cp.textContent='✓';setTimeout(function(){cp.textContent='⧉'},1200)});return}
   var tab=t.closest('[data-tab]');if(tab){state.tab=tab.dataset.tab;drawRows();return}
   if(t.closest('[data-q-again]')){state.qaMsgs=[];drawQa();return}
   if(t.closest('[data-q-copy]')&&navigator.clipboard){navigator.clipboard.writeText(kw)}
 });
 document.addEventListener('click',function(e){if(state.pop&&!e.target.closest('.psr-fgroup'))setPop(null)});
}
function qaAnswer(q){return '根据检索到的资料，「'+esc(q)+'」主要涉及：客户风险分级与处置管理办法统一了风险识别、分级与升级审批要求<sup>[1]</sup>；2026 年重点客户经营分析报告显示本月 3 家客户出现回款逾期，需按处置流程跟进<sup>[2]</sup>。建议先阅读管理办法第三章，再对照经营分析报告确认名单。'}
render();
})();
