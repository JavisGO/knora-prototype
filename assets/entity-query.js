(function () {
  'use strict';
  // A bounded demo adapter, not a Cypher interpreter or an authorization boundary.
  const examples = [
    ['实体查询','MATCH (n) RETURN n LIMIT 20'],
    ['关系查询','MATCH ()-[r]->() RETURN r LIMIT 20'],
    ['实体关系查询','MATCH (a)-[r]->(b) RETURN a,r,b LIMIT 20'],
    ['路径查询','MATCH p=(a)-[*1..2]->(b) RETURN p LIMIT 10'],
    ['属性查询','MATCH (n) RETURN n.`名称` AS 名称 LIMIT 20'],
    ['聚合查询','MATCH (n) RETURN count(n) AS 实体数量'],
    ['分组统计','MATCH (n) RETURN n.`类型` AS 实体类型,count(n) AS 数量'],
    ['节点集合','MATCH (a)-[]->(b) RETURN a,b LIMIT 20'],
    ['无匹配结果','MATCH (n:`产线预警单`) WHERE n.`预警等级` = "不存在" RETURN n LIMIT 20'],
    ['复杂结构','MATCH (n) RETURN {名称: n.`名称`, 类型: n.`类型`} AS 结果 LIMIT 20']
  ];
  const queryTemplates = [
    ['基础查询', 'MATCH (n:`实体类型`)\nRETURN n\nLIMIT 20'],
    ['条件筛选', 'MATCH (n:`实体类型`)\nWHERE n.`属性名称` = "属性值"\nRETURN n\nLIMIT 20'],
    ['指定返回字段', 'MATCH (n:`实体类型`)\nRETURN n.`属性名称` AS 返回字段名称\nLIMIT 20'],
    ['关系查询', 'MATCH (a:`起点实体类型`)-[r:`关系类型`]->(b:`终点实体类型`)\nRETURN a, r, b\nLIMIT 20'],
    ['路径查询', 'MATCH p=(a:`起点实体类型`)-[*1..2]->(b:`终点实体类型`)\nRETURN p\nLIMIT 20'],
    ['分组统计', 'MATCH (n:`实体类型`)\nRETURN n.`分组属性` AS 分组, count(n) AS 数量\nORDER BY 数量 DESC\nLIMIT 20']
  ];
  const records = [
    {id:'AL-001', type:'产线预警单', name:'总装二线扭矩异常预警', level:'高风险', line:'总装二线', time:'2026-11-05 09:20', batch:'BAT-001'},
    {id:'AL-002', type:'产线预警单', name:'电池模组温度异常预警', level:'高风险', line:'电池一线', time:'2026-11-05 08:45', batch:'BAT-002'},
    {id:'AL-003', type:'产线预警单', name:'焊接尺寸偏差预警', level:'中风险', line:'焊装三线', time:'2026-11-04 16:30', batch:'BAT-001'},
    {id:'BAT-001', type:'生产批次', name:'新能源整车生产批次 A17', line:'总装二线', time:'2026-11-04 10:00'},
    {id:'BAT-002', type:'生产批次', name:'动力电池生产批次 B08', line:'电池一线', time:'2026-11-04 11:30'}
  ];
  const norm = s => s.replace(/\s+/g,' ').replace(/\s*,\s*/g,',').trim();
  const defaultView = kind => ['entity','relation','path'].includes(kind)?'graph':kind==='complex'?'json':'table';
  const nodeValue=r=>({$type:'Node',id:r.id,labels:[r.type],properties:{名称:r.name,类型:r.type,所属产线:r.line,时间:r.time,...(r.level?{预警等级:r.level}:{}),...(r.batch?{关联批次:r.batch}:{})}});
  function normalizeResult(columns,rows,kind){
    const nodes=new Map(),edges=new Map();
    function visit(value){
      if(!value||typeof value!=='object')return;
      if(value.$type==='Node'){nodes.set(value.id,value);return;}
      if(value.$type==='Relationship'){edges.set(value.id,value);return;}
      if(Array.isArray(value)){value.forEach(visit);return;}
      Object.values(value).forEach(visit);
    }
    rows.forEach(visit);
    const graphEdges=[...edges.values()].filter(e=>nodes.has(e.startNodeId)&&nodes.has(e.endNodeId));
    return {kind,columns,rows,nodeCount:nodes.size,relationshipCount:edges.size,graphAvailable:nodes.size>0,
      records:[...nodes.values()].map(n=>({id:n.id,name:n.properties.名称||n.id,type:n.labels.join('、'),...records.find(r=>r.id===n.id)})),
      edges:graphEdges.map(e=>({id:e.id,type:e.type,source:e.startNodeId,target:e.endNodeId})),
      normalized:{columns,rows}};
  }
  function query(mode,text){
    if(!text.trim())throw Error('请先输入查询语句。');
    const tokens=text.replace(/\/\*[\s\S]*?\*\//g,' ').replace(/\/\/[^\n]*/g,' ').replace(/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`[^`]*`/g,' ');
    if(/\b(CREATE|MERGE|SET|DELETE|DETACH|REMOVE|DROP|LOAD|CALL|FOREACH|INSERT)\b/i.test(tokens))throw Error('仅允许只读查询，不支持写入、删除或过程调用。');
    if(!/^\s*MATCH\b/i.test(tokens)||!/\bRETURN\b/i.test(tokens))throw Error('查询需要包含 MATCH 和 RETURN，请检查查询语句。');
    const index=examples.findIndex(e=>norm(e[1])===norm(text));
    if(index<0)throw Error('当前原型尚未接入查询引擎，请使用示例体验。自定义语句需接入服务端后执行。');
    const nodes=records.map(nodeValue),alerts=records.filter(r=>r.batch),edges=alerts.map(r=>({$type:'Relationship',id:'REL-'+r.id,type:'关联批次',startNodeId:r.id,endNodeId:r.batch,properties:{}}));
    const pairs=alerts.map((r,i)=>[nodes.find(n=>n.id===r.id),edges[i],nodes.find(n=>n.id===r.batch)]);
    if(index===0)return normalizeResult(['n'],nodes.map(n=>[n]),'entity');
    if(index===1)return normalizeResult(['r'],edges.map(r=>[r]),'relationship');
    if(index===2)return normalizeResult(['a','r','b'],pairs,'relation');
    if(index===3){const paths=pairs.map(([a,r,b])=>[{$type:'Path',nodes:[a,b],relationships:[r]}]);return normalizeResult(['p'],paths,'path');}
    if(index===4)return normalizeResult(['名称'],nodes.map(n=>[n.properties.名称]),'scalar');
    if(index===5)return normalizeResult(['实体数量'],[[nodes.length]],'scalar');
    if(index===6)return normalizeResult(['实体类型','数量'],[...new Set(records.map(r=>r.type))].map(type=>[type,records.filter(r=>r.type===type).length]),'scalar');
    if(index===7)return normalizeResult(['a','b'],pairs.map(([a,r,b])=>[a,b]),'entity');
    if(index===8)return normalizeResult(['n'],[],'entity');
    return normalizeResult(['结果'],nodes.map(n=>[{名称:n.properties.名称,类型:n.properties.类型}]),'complex');
  }
  function toGrid(result){
    const columns=[],rows=result.rows.map(row=>{const cells={};
      function put(key,value){if(!columns.includes(key))columns.push(key);cells[key]=value;}
      function flatten(value,key){
        if(value&&value.$type==='Node'){put(key+'.ID',value.id);put(key+'.标签',value.labels.join('、'));Object.entries(value.properties).forEach(([k,v])=>put(key+'.'+k,v));return;}
        if(value&&value.$type==='Relationship'){put(key+'.ID',value.id);put(key+'.关系类型',value.type);put(key+'.起点',value.startNodeId);put(key+'.终点',value.endNodeId);Object.entries(value.properties).forEach(([k,v])=>put(key+'.'+k,v));return;}
        put(key,value!==null&&typeof value==='object'?JSON.stringify(value):value);
      }
      result.columns.forEach((col,i)=>flatten(row[i],col));return cells;
    });return {columns:columns.length?columns:result.columns,rows};
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={query,examples,defaultView,toGrid,normalizeResult};
  if (typeof document === 'undefined') return;
  const root = document.getElementById('entityHomeV2');
  if (!root) return;
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const hero = root.querySelector('.entity-home-hero');
  const board = root.querySelector('.entity-home-board');
  const nav = root.querySelector('.entity-home-nav');
  // Preserve the original search element and its existing event handlers.
  const originalSearch = root.querySelector('.entity-home-search');
  const panel = document.createElement('section'); panel.className='eq-panel';
  panel.innerHTML=`<div class="eq-mode" role="tablist" aria-label="查询模式"><button role="tab" data-mode="natural" aria-selected="true" class="active">自然语言查询</button><button role="tab" data-mode="cypher" aria-selected="false">Cypher 查询</button><span class="eq-readonly">只读查询</span></div>
    <div id="eqNatural"></div>
    <div id="eqCypher" hidden><div class="eq-editor-tools"><span class="eq-code-language">〈/〉 <b>cypher</b></span><div class="eq-code-actions"><label class="eq-example-label">查询示例 <select id="eqExample" aria-label="查询示例">${examples.map((e,i)=>`<option value="${i}">${e[0]}</option>`).join('')}</select></label><label class="eq-example-label">常用查询 <select id="eqTemplate" aria-label="常用查询模板"><option value="">选择语句模板</option>${queryTemplates.map((t,i)=>`<option value="${i}">${esc(t[0])}</option>`).join('')}</select></label><span class="eq-code-readonly">只读</span><button id="eqCopy" title="复制代码" aria-label="复制代码"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="4" y="7" width="13" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2"/></svg></button></div></div><div id="eqEditorBody"><textarea id="eqCode" aria-label="Cypher 查询语句" spellcheck="false"></textarea></div><div class="eq-run-footer"><button id="eqStop" hidden>停止</button><button class="eq-code-run" data-run>▷ 运行</button></div></div>`;
  hero.appendChild(panel);
  const resultBox=document.createElement('section');resultBox.className='eq-results';resultBox.hidden=true;hero.after(resultBox);
  const divider=document.createElement('div');divider.className='eq-split-divider';divider.tabIndex=0;divider.setAttribute('role','separator');divider.setAttribute('aria-label','调整编辑区与结果区高度');divider.setAttribute('aria-orientation','horizontal');divider.setAttribute('aria-controls','eqEditorBody');divider.innerHTML='<span></span>';hero.after(divider);
  let splitRatio=.45;
  function resizeSplit(){
    if(!root.classList.contains('eq-has-results'))return;
    const height=Math.max(380,window.innerHeight-root.getBoundingClientRect().top-8);
    root.style.height=height+'px';
    const available=height-55,top=Math.max(170,Math.min(available-140,available*splitRatio));
    root.style.setProperty('--eq-editor-height',top+'px');divider.setAttribute('aria-valuenow',String(Math.round(top/available*100)));divider.setAttribute('aria-valuemin',String(Math.ceil(170/available*100)));divider.setAttribute('aria-valuemax',String(Math.floor((available-140)/available*100)));
  }
  divider.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();divider.setPointerCapture(e.pointerId);root.classList.add('eq-resizing');});
  divider.addEventListener('pointermove',e=>{if(!divider.hasPointerCapture(e.pointerId))return;const rect=root.getBoundingClientRect(),available=rect.height-55;splitRatio=Math.max(170/available,Math.min(1-140/available,(e.clientY-rect.top-45)/available));resizeSplit();});
  function stopResize(e){if(divider.hasPointerCapture(e.pointerId))divider.releasePointerCapture(e.pointerId);root.classList.remove('eq-resizing');}
  divider.addEventListener('pointerup',stopResize);divider.addEventListener('pointercancel',stopResize);divider.addEventListener('lostpointercapture',()=>root.classList.remove('eq-resizing'));
  divider.addEventListener('keydown',e=>{if(!['ArrowUp','ArrowDown','Home','End'].includes(e.key))return;e.preventDefault();splitRatio=e.key==='Home'?0:e.key==='End'?1:Math.max(0,Math.min(1,splitRatio+(e.key==='ArrowDown'?.05:-.05)));resizeSplit();});
  divider.addEventListener('dblclick',()=>{splitRatio=.45;resizeSplit();});window.addEventListener('resize',resizeSplit);
  const dialog=document.createElement('dialog');dialog.className='eq-detail';root.appendChild(dialog);
  const $=id=>document.getElementById(id);
  $('eqNatural').appendChild(originalSearch);
  panel.querySelector('.eq-readonly').hidden=true;
  let mode='natural', result=null, view='table', type='', timer=null, seq=0, hasRun=false, dirty=false, focusBefore=null;
  const values={level:'高风险'};
  $('eqCode').value=examples[0][1];
  let homeCode=$('eqCode').value,topicCode=homeCode;
  const projectName=document.getElementById('globalProjectName');
  if(projectName)new MutationObserver(closeTopic).observe(projectName,{childList:true,subtree:true,characterData:true});
  function busy(on){panel.querySelectorAll('[data-run]').forEach(b=>{b.disabled=on;});$('eqStop').hidden=!on;}
  function cancel(){seq++;if(timer)clearTimeout(timer);timer=null;busy(false);}
  function home(){
    if(root.classList.contains('eq-has-results'))topicCode=$('eqCode').value;
    if(timer){cancel();status('查询已停止，可重新运行。');}
    hasRun=false;root.classList.remove('eq-has-results');root.style.removeProperty('height');board.hidden=false;resultBox.hidden=true;root.querySelector('.entity-hello').hidden=false;
    $('eqCode').value=homeCode;$('eqTemplate').value='';$('eqExample').value=String(examples.findIndex(e=>norm(e[1])===norm(homeCode)));$('eqEditorBody').hidden=false;
    nav.querySelector('button').classList.add('active');nav.querySelector('.eq-topic')?.classList.remove('active');
  }
  function closeTopic(){cancel();home();result=null;resultBox.innerHTML='';nav.querySelector('.eq-topic')?.remove();}
  function showTopic(){
    if(!root.classList.contains('eq-has-results'))homeCode=$('eqCode').value;
    mode='cypher';$('eqCode').value=topicCode;$('eqTemplate').value='';$('eqExample').value=String(examples.findIndex(e=>norm(e[1])===norm(topicCode)));$('eqNatural').hidden=true;$('eqCypher').hidden=false;
    panel.querySelectorAll('[data-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.mode===mode);b.setAttribute('aria-selected',b.dataset.mode===mode);});
    panel.querySelector('.eq-readonly').hidden=false;
    hasRun=true;root.classList.add('eq-has-results');board.hidden=true;resultBox.hidden=false;root.querySelector('.entity-hello').hidden=true;
    nav.querySelector('button').classList.remove('active');nav.querySelector('.eq-topic')?.classList.add('active');resizeSplit();
  }
  nav.querySelector('button').addEventListener('click',home);
  function stale(){if(hasRun){dirty=true;cancel();const status=resultBox.querySelector('.eq-status');if(status)status.textContent='查询已修改，请重新运行';}}
  function switchMode(next){if(next===mode)return;mode=next;home();$('eqNatural').hidden=mode!=='natural';$('eqCypher').hidden=mode!=='cypher';panel.querySelector('.eq-readonly').hidden=mode!=='cypher';panel.querySelectorAll('[data-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.mode===mode);b.setAttribute('aria-selected',b.dataset.mode===mode);});}
  function topic(text){
    topicCode=text;
    if(!nav.querySelector('.eq-topic')){
      const tab=document.createElement('div');tab.className='eq-topic';
      const open=document.createElement('button');open.textContent='话题：Cypher 查询';open.onclick=showTopic;
      const close=document.createElement('button');close.textContent='×';close.title='关闭 Cypher 查询';close.setAttribute('aria-label','关闭 Cypher 查询');close.onclick=closeTopic;
      tab.append(open,close);nav.appendChild(tab);
    }
    showTopic();
  }
  function status(message,error){resultBox.innerHTML=`<div class="eq-status" role="status">${error?'执行失败':'执行状态'}</div><div class="eq-empty ${error?'eq-error':''}">${esc(message)}</div>`;}
  function run(){
    if(mode!=='cypher')return;
    cancel();const token=seq,text=$('eqCode').value;
    dirty=false;topic(text);busy(true);status('执行中…');const start=performance.now();
    timer=setTimeout(()=>{if(token!==seq)return;busy(false);timer=null;
      try{const executionStart=performance.now();result=query(mode,text,values);view=defaultView(result.kind);if(view==='graph'&&!result.graphAvailable)view='table';type='';render(Number((performance.now()-executionStart).toFixed(2)));
      }catch(e){result=null;status(e.message,true);}
    },380);
  }
  function entityLink(r){return `<button class="eq-link" data-detail="${esc(r.id)}">${esc(r.name)}</button>`;}
  function render(elapsed){
    if(elapsed!==undefined)result.elapsed=elapsed;
    const types=[...new Set(result.records.map(r=>r.type))];
    const views=[['table','表格'],...(result.graphAvailable?[['graph','图谱']]:[]),['json','JSON']];
    resultBox.innerHTML=`<header><div class="eq-result-tabs">${views.map(v=>`<button class="${view===v[0]?'active':''}" data-view="${v[0]}">${v[1]}${v[0]==='types'?' ('+types.length+')':''}</button>`).join('')}</div><span class="eq-status" role="status">执行成功 · ${result.rows.length} 条记录${result.nodeCount?' · '+result.nodeCount+' 个节点':''}${result.relationshipCount?' · '+result.relationshipCount+' 条关系':''} · ${result.elapsed} ms</span></header><div class="eq-result-body"></div><footer>仅展示当前查询命中的数据</footer>`;
    if(dirty)resultBox.querySelector('.eq-status').textContent='查询已修改，请重新运行';
    const body=resultBox.querySelector('.eq-result-body');
    if(!result.rows.length){body.innerHTML='<div class="eq-empty">未找到匹配的数据，请调整查询条件后重试。</div>';return;}
    if(view==='table'){
      const grid=toGrid(result);
      body.innerHTML='<div class="eq-table-scroll"><table class="eq-database-grid"><thead><tr><th class="eq-row-number">#</th>'+grid.columns.map(c=>'<th>'+esc(c)+'</th>').join('')+'</tr></thead><tbody>'+grid.rows.map((row,index)=>'<tr><td class="eq-row-number">'+(index+1)+'</td>'+grid.columns.map(c=>'<td>'+(row[c]==null?'<span class="eq-null">NULL</span>':esc(row[c]))+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
    }
    if(view==='json')body.innerHTML='<div class="eq-json-tools"><span>平台标准化结果</span><button id="eqCopyJson">复制 JSON</button></div>'+ '<pre class="eq-json" tabindex="0" aria-label="JSON 查询结果">'+esc(JSON.stringify(result.normalized,null,2))+'</pre>';
    if(view==='graph')renderGraph(body);
    if(view==='types')body.innerHTML=types.map(t=>`<button class="eq-type-card" data-type="${esc(t)}"><i>◈</i><span><b>${esc(t)}</b><small>生产质量本体</small></span><em>本次命中 ${result.records.filter(r=>r.type===t).length} 条记录 →</em></button>`).join('');
    if(view==='records')body.innerHTML=`<label class="eq-type-filter">实体类型 <select id="eqTypeFilter"><option value="">全部类型</option>${types.map(t=>`<option ${t===type?'selected':''}>${esc(t)}</option>`).join('')}</select></label>`+result.records.filter(r=>!type||r.type===type).map(r=>`<article class="eq-record"><div><span class="eq-tag">${esc(r.type)}</span>${entityLink(r)}</div><p>${esc(r.id)} · ${esc(r.line)} · ${esc(r.time)}</p>${r.level?'<span class="eq-risk">'+esc(r.level)+'</span>':''}<button class="eq-link" data-detail="${esc(r.id)}">查看详情与关系 →</button></article>`).join('');
    if(view==='relations')body.innerHTML=result.rows.map(row=>`<div class="eq-path">${entityLink(row[0])}<span>── ${esc(row[1])} →</span>${entityLink(row[2])}</div>`).join('');
  }
  function renderGraph(body){
    const positions={};
    const left=result.records.filter(r=>r.type==='产线预警单'),right=result.records.filter(r=>r.type!=='产线预警单');
    left.forEach((r,i)=>positions[r.id]={x:240,y:85+i*(300/Math.max(left.length-1,1))});
    right.forEach((r,i)=>positions[r.id]={x:760,y:150+i*(190/Math.max(right.length-1,1))});
    body.innerHTML=`<div class="eq-graph-legend"><span><i></i>产线预警单</span><span><i class="batch"></i>生产批次</span><small>${result.records.length} 个节点 · ${result.edges.length} 条关系 · 点击节点查看详情，点击关系查看连接信息</small></div><div class="eq-graph-scroll"><div class="eq-graph"><svg viewBox="0 0 1000 470" aria-label="查询结果关系图"><defs><marker id="eqArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#a3b4cf"/></marker></defs>${result.edges.map(edge=>{const a=positions[edge.source],b=positions[edge.target];return `<path d="M ${a.x+100} ${a.y} L ${b.x-106} ${b.y}" fill="none" stroke="#a3b4cf" stroke-width="2" marker-end="url(#eqArrow)"/>`;}).join('')}</svg>${result.records.map(r=>{const p=positions[r.id];return `<button class="eq-graph-node ${r.type==='生产批次'?'batch':''}" data-detail="${esc(r.id)}" style="left:${p.x/10}%;top:${p.y/4.7}%"><i>${r.type==='生产批次'?'批':'预'}</i><b>${esc(r.name)}</b><small>${esc(r.id)}</small></button>`;}).join('')}${result.edges.map(edge=>{const a=positions[edge.source],b=positions[edge.target];return `<button class="eq-graph-edge" data-edge="${esc(edge.id)}" style="left:50%;top:${(a.y+b.y)/9.4}%">${esc(edge.type)} →</button>`;}).join('')}</div></div>`;
  }
  function edgeDetail(id){
    const edge=result?.edges?.find(e=>e.id===id);if(!edge)return;
    focusBefore=document.activeElement;
    const source=records.find(r=>r.id===edge.source),target=records.find(r=>r.id===edge.target);
    dialog.innerHTML=`<header><div><small>关系详情</small><h2>${esc(edge.type)}</h2></div><button data-close aria-label="关闭详情">×</button></header><div class="eq-detail-body"><dl><dt>关系编号</dt><dd>${esc(edge.id)}</dd><dt>起点实体</dt><dd>${entityLink(source)}</dd><dt>终点实体</dt><dd>${entityLink(target)}</dd><dt>方向</dt><dd>产线预警单 → 生产批次</dd></dl></div>`;
    dialog.showModal();dialog.querySelector('[data-close]').focus();
  }
  function detail(id){const r=records.find(x=>x.id===id);if(!r)return;
    if(!dialog.open)focusBefore=document.activeElement;
    const related=r.batch?records.filter(x=>x.id===r.batch):records.filter(x=>x.batch===r.id);
    dialog.innerHTML=`<header><div><small>${esc(r.type)}</small><h2>${esc(r.name)}</h2></div><button data-close aria-label="关闭详情">×</button></header><div class="eq-detail-body"><h3>实体属性</h3><dl><dt>编号</dt><dd>${esc(r.id)}</dd><dt>所属产线</dt><dd>${esc(r.line)}</dd><dt>时间</dt><dd>${esc(r.time)}</dd>${r.level?'<dt>预警等级</dt><dd>'+esc(r.level)+'</dd>':''}</dl><h3>关联关系</h3><p class="eq-muted">以下为当前实体的关联数据，不改变原查询结果。</p>${related.map(x=>`<div class="eq-related"><span>${r.batch?'关联批次':'关联预警'}</span>${entityLink(x)}<small>${esc(x.type)} →</small></div>`).join('')||'<p>暂无可查看的关联实体</p>'}</div>`;
    if(!dialog.open)dialog.showModal();dialog.querySelector('[data-close]').focus();
  }
  panel.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.mode)switchMode(b.dataset.mode);if(b.hasAttribute('data-run'))run();if(b.id==='eqStop'){cancel();status('查询已停止，可修改条件后重新运行。');}});
  $('eqCopy').onclick=async()=>{
    const b=$('eqCopy'),icon=b.innerHTML;let copied=false;
    try{await navigator.clipboard.writeText($('eqCode').value);copied=true;}catch(e){
      const editor=$('eqCode'),collapsed=$('eqEditorBody').hidden;$('eqEditorBody').hidden=false;editor.focus();editor.select();try{copied=document.execCommand('copy');}catch(ignore){}$('eqEditorBody').hidden=collapsed;
    }
    b.textContent=copied?'已复制':'复制失败';setTimeout(()=>{b.innerHTML=icon;},1500);
  };
  $('eqExample').onchange=()=>{$('eqTemplate').value='';$('eqCode').value=examples[Number($('eqExample').value)][1];$('eqEditorBody').hidden=false;stale();};
  resultBox.addEventListener('click',async e=>{if(e.target.id!=='eqCopyJson')return;let ok=false;const text=JSON.stringify(result.normalized,null,2);try{await navigator.clipboard.writeText(text);ok=true;}catch(ignore){const field=document.createElement('textarea');field.value=text;document.body.appendChild(field);field.select();try{ok=document.execCommand('copy');}catch(ignoreAgain){}field.remove();}e.target.textContent=ok?'已复制':'复制失败';});
  $('eqTemplate').onchange=()=>{if($('eqTemplate').value==='')return;$('eqCode').value=queryTemplates[Number($('eqTemplate').value)][1];$('eqExample').selectedIndex=-1;$('eqEditorBody').hidden=false;stale();$('eqCode').focus();};
  panel.addEventListener('input',e=>{if(e.target.id==='eqCode'){$('eqTemplate').value='';$('eqExample').selectedIndex=-1;}stale();});
  panel.addEventListener('keydown',e=>{if(mode==='cypher'&&(e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();run();}});
  resultBox.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.view){view=b.dataset.view;render();}if(b.dataset.type){type=b.dataset.type;view='records';render();}if(b.dataset.detail)detail(b.dataset.detail);if(b.dataset.edge)edgeDetail(b.dataset.edge);});
  resultBox.addEventListener('change',e=>{if(e.target.id==='eqTypeFilter'){type=e.target.value;render();}});
  dialog.addEventListener('click',e=>{if(e.target===dialog||e.target.closest('[data-close]'))dialog.close();const b=e.target.closest('[data-detail]');if(b)detail(b.dataset.detail);});
  dialog.addEventListener('close',()=>focusBefore?.focus());
})();
