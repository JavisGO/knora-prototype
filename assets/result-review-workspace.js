'use strict';
if(new URLSearchParams(location.search).has('reviewTask')){
const reviewLayoutStyle=document.createElement('style');reviewLayoutStyle.textContent='#undoBtn,#historyBtn,[data-inspect=history]{display:none!important}html,body{height:auto;overflow:visible}body{background:transparent}.workspace{height:auto;max-width:none;margin:0;padding:0}.surface#workSurface[hidden]{display:none!important}.surface#workSurface{height:720px;margin:0;display:flex;flex-direction:column}.surface#workSurface>.work-head{flex:none}.surface#workSurface>.work-grid{flex:1;height:auto;min-height:0}.review-inspector-type{margin-left:auto;align-self:center}';document.head.appendChild(reviewLayoutStyle);
let reviewContext=null;
const originalPersist=persist,originalRender=render,originalRows=renderRows,originalCommit=commit;
function notifyReview(){if(reviewContext)parent.postMessage({type:'review-update',taskId:reviewContext.task.id,patch:{sources:state.reviewTableStates?Object.keys(state.reviewTableStates).map(id=>sourceTables.find(t=>t.id===id)?.name||id):state.sourceId?[sourceTables.find(t=>t.id===state.sourceId)?.name||'抽取结果']:[],status:state.reviewCompleted?'运行成功':'草稿'}},'*')}
function notifyToolbar(){if(!reviewContext)return;parent.postMessage({type:'review-toolbar',taskId:reviewContext.task.id,actions:[{id:'source',label:'添加数据表',disabled:false},{id:'save',label:'保存草稿',disabled:!state.sourceId||view==='raw'},{id:'mapping',label:'本体映射',disabled:!state.sourceId||view==='raw'},{id:'export',label:'输出结果',disabled:!state.sourceId||view==='raw',primary:true},{id:'save-modifications',label:'保存修改',disabled:!state.sourceId||view==='raw',primary:true}]},'*')}
persist=function(){const ok=originalPersist();if(ok)notifyReview();return ok};
commit=function(title,detail,fn){if(view==='raw'){toast('原始快照只读，请切换到处理结果。');return}state.reviewCompleted=false;fn();state.revision++;undoStack=[];persist();selected.clear();render();toast(title+'已完成')};undo=function(){};historyModal=function(){};
function prepare(entry){const defs=[],result=initial();result.rows=[];result.relations=[];result.events=[];const evidence=[];
 const sourceDoc=r=>{let i=evidence.findIndex(d=>d.name===(r.source||'抽取结果'));if(i<0){i=evidence.length;evidence.push({name:r.source||'抽取结果',page:entry.runLabel||entry.time,text:r.evidence||'该条结果未保存原文证据，请返回抽取任务核对。'})}return i};
 for(const [kind,list] of [['entity',entry.batch.entities||[]],['relation',entry.batch.relations||[]],['event',entry.batch.events||[]]]){
 list.forEach((r,i)=>{const type=r.type||r.name||'未分类',id=(kind==='entity'?'E':kind==='relation'?'R':'V')+String(i+1).padStart(2,'0');let sh=defs.find(s=>s.kind===kind&&s.type===type);if(!sh){sh={id:kind+'-'+defs.length,name:type,type,kind,element:type,recordIds:[]};defs.push(sh)}sh.recordIds.push(id);
 const props=Object.fromEntries(Object.entries(r.props||{}).map(([k,v])=>[k,v==null?'':String(v)])),keys=Object.keys(props),codeKey=keys.find(k=>/编号$|编码$|^id$/i.test(k)),nameKey=keys.find(k=>/名称$/.test(k)),addressKey=keys.find(k=>/地址|规格|内容|说明/.test(k)),levelKey=keys.find(k=>/等级|类型|部门|结果/.test(k)),unitKey=keys.find(k=>/单位/.test(k));
 const row={id,type,name:r.name||props[nameKey]||type,code:props[codeKey]||'',level:props[levelKey]||'',address:props[addressKey]||'',unit:props[unitKey]||'',doc:sourceDoc(r),status:'pending',masterId:'',rejected:[],origins:[id],changes:[],excludedReason:'',group:'',warning:'',sourceValues:props,sourceAliases:{name:nameKey,code:codeKey,level:levelKey,address:addressKey,unit:unitKey},fieldSources:{},original:r};
 if(kind==='entity')result.rows.push(row);else if(kind==='relation'){row.fromText=props[keys.find(k=>/^起点/.test(k))]||r.from||'';row.toText=props[keys.find(k=>/^终点/.test(k))]||r.to||'';result.relations.push(row)}else{row.date=props[keys.find(k=>/时间|日期/.test(k))]||'';result.events.push(row)} });
 }
 const resolve=value=>result.rows.find(r=>r.code===value||r.name===value)?.id||null;
 result.relations.forEach(r=>{r.from=resolve(r.fromText);r.to=resolve(r.toText)});result.events.forEach(r=>{r.subject=Object.values(r.sourceValues).map(resolve).find(Boolean)||null});
 result.reviewSheets=defs;result.reviewDocs=evidence.length?evidence:[{name:'抽取结果',page:entry.runLabel,text:'暂无原文证据'}];result.reviewRaw={rows:structuredClone(result.rows),relations:structuredClone(result.relations),events:structuredClone(result.events)};result.model='当前项目本体';return {defs,result};
}
function activateMetadata(){if(!state.reviewSheets)return;sheetDefs.splice(0,sheetDefs.length,...state.reviewSheets);docs.splice(0,docs.length,...state.reviewDocs);types.splice(0,types.length,...new Set(state.rows.map(r=>r.type)));if(state.reviewRaw)Object.assign(baseline,structuredClone(state.reviewRaw));}
const ontology={'采购供应链本体':{entity:['供应商','企业组织','物料','产品批次','采购订单','采购规则','人员','设备'],relation:['供应','采购','组成','属于批次','遵守'],event:['采购供应明细','采购到货','质量检验','质量复验','设备维护']},'质量追溯本体':{entity:['供应商','物料','产品批次','质量问题','检验报告','人员','设备'],relation:['供应','涉及物料','属于批次','发现于','负责处理'],event:['采购供应明细','质量检验','质量复验','异常处置']}};
function sourceValues(r){const vals={...r.sourceValues};Object.entries(r.sourceAliases||{}).forEach(([key,prop])=>{if(prop)vals[prop]=r[key]});return vals}
const previousIssues=issues;issues=function(r,d=data()){const list=previousIssues(r,d);if(!r?.sourceValues||!visibleEntity(r))return list;const out=list.filter(k=>k!=='empty');if(Object.entries(sourceValues(r)).some(([k,v])=>k!==r.sourceAliases.code&&!String(v??'').trim()))out.push('empty');return out};
const previousEdit=editModal;editModal=function(){const r=current();if(!r?.sourceValues)return previousEdit();modalData={id:r.id};openModal('source-edit','核对源表字段','',Object.entries(sourceValues(r)).map(([k,v])=>'<label class="form-label">'+E(k)+(k===r.sourceAliases?.code?reviewPrimaryKeyIcon():'')+'<input data-review-prop="'+E(k)+'" value="'+E(v)+'"></label>').join('')+sourceHtml(r),footer('save-review-fields','保存修改'),true)};
const originalInspector=renderInspector;renderInspector=function(){if(inspectTab==='history')inspectTab='source';originalInspector();document.querySelector('[data-inspect=history]')?.remove();document.querySelectorAll('#inspector .hint').forEach(el=>el.remove());const inspector=document.querySelector('#inspector'),head=inspector?.querySelector('.inspect-head'),type=head?.querySelector('.legend-type'),tabs=inspector?.querySelector('.inspect-tabs');if(type&&tabs){type.classList.add('review-inspector-type');tabs.append(type)}head?.remove()};
document.addEventListener('click',e=>{if(!e.target.closest('[data-action="save-review-fields"]'))return;const row=entity(modalData.id,state),values=Object.fromEntries($$('[data-review-prop]').map(x=>[x.dataset.reviewProp,x.value.trim()]));commit('修正源表字段',row.name,()=>{row.sourceValues=values;Object.entries(row.sourceAliases||{}).forEach(([k,prop])=>{if(prop)row[k]=values[prop]||''});row.masterId='';row.status='pending';recordChange(row,'字段修正','已核对并修改源表字段');invalidateRelations([row.id])});closeModal()});
render=function(){originalRender();$('#version').hidden=true;$('#confirmedCount').hidden=true;document.querySelector('[data-tab=graph]')?.remove();if(!reviewContext)return;document.querySelector('.breadcrumb').hidden=true;document.querySelector('.heading').hidden=true;const status=document.querySelector('.top-right .muted');if(status)status.hidden=true;const actions=document.querySelector('.heading-actions');if(actions)actions.hidden=true;renderInlineSetup();document.querySelector('#workSurface').hidden=false;document.querySelector('#setupEmpty').hidden=true;document.querySelector('#sidebar .side-note')?.remove();notifyToolbar();const source=sourceTables.find(t=>t.id===state.sourceId);parent.postMessage({type:'review-source-card',taskId:reviewContext.task.id,selected:!!source,name:source?.name||'',model:state.model||'',sheets:source?.sheets?.length||0},'*')};
function renderInlineSetup(){if(state.sourceId)setupDraft={sourceId:state.sourceId,model:state.model,mapping:{...state.elementMapping}};const box=$('#sourceSetup');box.hidden=false;box.style.display='block';box.innerHTML='<h3 style="margin:0 0 16px">选择数据表</h3><div id="reviewSetupFields"></div><p id="reviewSetupError" role="alert" style="color:#e5484d"></p>';renderSourceModal()}
sourceModal=function(){document.querySelector('#sourceSetup').scrollIntoView({behavior:'smooth',block:'start'})};
renderSourceModal=function(){const target=$('#reviewSetupFields');if(!target)return;const locked=!!state.sourceId;target.innerHTML='<div style="display:flex;align-items:flex-end;gap:16px"><label class="form-label" style="flex:1;margin:0"><select aria-label="选择数据表" id="reviewSource" '+(locked?'disabled':'')+'>'+sourceTables.map(t=>'<option value="'+E(t.id)+'" '+(t.id===setupDraft.sourceId?'selected':'')+'>'+E(t.name)+'</option>').join('')+'</select></label>'+(locked?'<span class="tag">已选择</span>':btn('确认选择','apply-source','primary'))+'</div>';requestAnimationFrame(()=>parent.postMessage({type:'review-height',height:document.getElementById('app').scrollHeight+24},'*'))};
applySetup=function(){if(state.sourceId)return;const entry=sourceTables.find(t=>t.id===setupDraft.sourceId);if(!entry)return;const mapping=Object.fromEntries(sheetDefs.filter(sh=>entry.sheets.includes(sh.id)).map(sh=>[sh.id,sh.element]));state=initial();if(entry.id==='suppliers'){state.rows=state.rows.filter(r=>r.type==='供应商');state.relations=[];state.events=[]}Object.assign(baseline,structuredClone(state));state.sourceId=entry.id;state.model=setupDraft.model;state.elementMapping=mapping;state.reviewCompleted=false;undoStack=[];activeSheet='all';activeTab='entity';issueFilter='all';typeFilter='all';focusId=state.rows[0]?.id;selected.clear();persist();render();toast('数据表已选择，可以在下方开始校验')};
renderRows=function(){originalRows();if(activeTab==='relation'||activeTab==='event'){
 const list=filtered(),all=activeTab==='event'?data().events:data().relations,columns=[['from','供应商 / 供应商编号（必填）'],['to','SY物料 / 物料编号（必填）'],['code','采购或供货记录编号'],['supplyType','供应类型'],['price','采购单价'],['quantity','采购数量'],['date','供货日期']];
 if(activeTab==='event')columns.push(['approval','审批状态']);
 const supply=activeTab==='event'||all.some(r=>r.sourceAliases?.supplyType)||['供应','采购','交付'].includes(state.reviewElement);
 const shown=supply?columns:[['from','起点编号'],['to','终点编号'],['code','关系编号'],...([...new Set(all.flatMap(r=>Object.keys(r.sourceAliases||{})))].filter(k=>!['code','from','to','name'].includes(k)).map(k=>[k,all.find(r=>r.sourceAliases?.[k]).sourceAliases[k]]))];
 $$('#thead .source-col').forEach(el=>el.remove());
 $('#thead .status-col').insertAdjacentHTML('beforebegin',shown.map(([key,label])=>'<th class="source-col">'+E(label)+(['from','to'].includes(key)?reviewPrimaryKeyIcon():'')+'</th>').join(''));
 $$('#rows tr[data-row]').forEach(tr=>{const r=list.find(x=>x.id===tr.dataset.row);if(!r)return;tr.querySelectorAll('.source-col').forEach(el=>el.remove());tr.querySelector('.status-col').insertAdjacentHTML('beforebegin',shown.map(([key])=>'<td class="source-col">'+E((r[key]??r.sourceValues?.[r.sourceAliases?.[key]])===''?'-':(r[key]??r.sourceValues?.[r.sourceAliases?.[key]]??'-'))+'</td>').join(''))});return;
 }if(!state.reviewSheets||activeTab==='graph')return;const list=filtered(),all=(activeTab==='entity'?data().rows:activeTab==='relation'?data().relations:data().events),keys=[...new Set(all.flatMap(r=>Object.keys(r.sourceValues||{})))];const cols=keys.length?keys:['名称'];const heads=$$('#thead .source-col');heads.forEach(x=>x.remove());$('#thead .status-col').insertAdjacentHTML('beforebegin',cols.map(k=>'<th class="source-col">'+E(k)+(all.some(r=>r.sourceAliases?.code===k)?reviewPrimaryKeyIcon():'')+'</th>').join(''));$$('#rows tr[data-row]').forEach(tr=>{const r=list.find(r=>r.id===tr.dataset.row);tr.querySelectorAll('.source-col').forEach(x=>x.remove());const vals={...r.sourceValues};Object.entries(r.sourceAliases||{}).forEach(([k,prop])=>{if(prop)vals[prop]=r[k]});tr.querySelector('.status-col').insertAdjacentHTML('beforebegin',cols.map(k=>'<td class="source-col">'+E(vals[k]||'-')+'</td>').join(''))});};
const baseExport=exportModal;exportModal=function(){baseExport();const inputs=$$('#modal input[readonly]');if(inputs[0])inputs[0].value=reviewContext.projectName;const path=$('.output-path');if(path)path.firstChild.textContent=reviewContext.projectName+' / 个人空间 / ';};
document.addEventListener('change',e=>{if(e.target.id==='reviewSource'){setupDraft.sourceId=e.target.value;setupDraft.mapping={};renderSourceModal()}if(e.target.id==='reviewModel'){setupDraft.model=e.target.value;setupDraft.mapping={};renderSourceModal()}});
window.addEventListener('message',e=>{if(e.source===parent&&e.data?.type==='review-init'&&!reviewContext){reviewContext=e.data;if(state.reviewSheets||!sourceTables.some(t=>t.id===state.sourceId)){state=initial();undoStack=[]}setupDraft={sourceId:state.sourceId||'purchase',model:state.model||'采购供应链本体',mapping:{...(state.elementMapping||{})}};render();document.body.classList.add('review-ready');return}if(e.source===parent&&e.data?.type==='review-action'){if(e.data.action==='source'){sourceModal();return}if(e.data.action==='save-modifications'){if(!state.sourceId||view==='raw')return;state.savedAt=new Date().toLocaleString('zh-CN');if(persist()){render();toast('修改已保存')}return}const targets={history:'#historyBtn',validate:'#validateBtn',save:'#saveBtn',export:'#exportBtn',complete:'[data-review-complete]'},button=document.querySelector(targets[e.data.action]);if(button&&!button.disabled)button.click()}});

'use strict';
(()=>{
const defs=structuredClone(sheetDefs),seed=initial();
const choices={entity:['供应商','物料','产品批次','企业组织','产品'],relation:['供应','属于批次','采购','交付'],event:['批次验收','采购供应明细','质量检验','采购到货']};
const tables=defs.map(d=>({id:'table-'+d.id,name:d.name+'_抽取结果',sheets:[d.id],kind:d.kind,element:d.element,def:d}));
sourceTables.push(...tables);
const keyOf=k=>k==='entity'?'rows':k==='relation'?'relations':'events';
const snapshots=()=>state.reviewTableStates||(state.reviewTableStates={});
function snapshot(){const copy=structuredClone(state);delete copy.reviewTableStates;delete copy.activeReviewTable;return {work:copy,raw:structuredClone(baseline)}}
function stash(){if(state.activeReviewTable)snapshots()[state.activeReviewTable]=snapshot()}
function relationAlignmentExamples(work,table){
 if(table.kind!=='relation'||!['供应','采购','交付'].includes(table.element))return [];
 const aliases={from:'供应商 / 供应商编号（必填）',to:'SY物料 / 物料编号（必填）',code:'采购或供货记录编号',supplyType:'供应类型',price:'采购单价',quantity:'采购数量',date:'供货日期'};
 const examples=[
 ['ALIGN-01','SUP-001','MAT-001','PO-20261001','','125.00','100','2026-10-12'],
 ['ALIGN-02','SUP-001','MAT-001','PO-20261001','常规采购','125.00','100','2026-10-12'],
 ['ALIGN-03','SUP-002','','PO-20261002','紧急采购','','50','2026-10-15'],
 ['ALIGN-04','SUP-002','MAT-002','PO-20261002','紧急采购','86.00','50','2026-10-15']
 ];
 const added=examples.filter(x=>!work.relations.some(r=>r.id===x[0])).map(([id,from,to,code,supplyType,price,quantity,date])=>({id,name:table.element,from,to,code,supplyType,price,quantity,date,status:'pending',changes:[],origins:[id],fieldSources:{},sourceAliases:{...aliases},sourceValues:Object.fromEntries(Object.entries(aliases).map(([k,label])=>[label,({from,to,code,supplyType,price,quantity,date})[k]]))}));
 work.relations.push(...added);return added;
}
function realisticDemo(work,table){
 const list=work[keyOf(table.kind)]||[],pad=n=>String(n).padStart(3,'0');
 const suppliers=['苏州华东精工有限公司','常州华南传动有限公司','天津北方机电有限公司','宁波恒锐轴承有限公司','无锡新源金属材料有限公司','杭州东海自动化有限公司','武汉中原装备有限公司','佛山南方传动有限公司'];
 const materials=['深沟球轴承 6205-2RS','传动轴 Φ30×450','联轴器 L090','不锈钢紧固件 M12×40','铝合金型材 40×40','伺服电机 750W','同步带 HTD-5M','密封圈 Φ35×3'];
 const prices=['18.50','86.00','125.00','2.80','32.50','680.00','45.00','1.20'];
 list.forEach(r=>{const m=String(r.id).match(/MOCK-.*-(\d+)$/);if(!m||r.realisticMockVersion===1)return;const i=Number(m[1])-1;
 if(Object.keys(r.fieldSources||{}).length||['excluded','merged','confirmed'].includes(r.status))return;
 if(table.kind==='relation'){
 const supply=['供应','采购','交付'].includes(table.element),j=(i===4?3:i);
 Object.assign(r,{name:table.element,from:supply?'SUP-'+pad(j%8+1):'MAT-'+pad(j+1),to:supply?'MAT-'+pad(j+1):'BAT-202610-'+pad(j+1),code:'PO-202610-'+pad(j+101),supplyType:i%4===0?'年度框架采购':'常规采购',price:prices[j%8],quantity:String([200,80,120,1000,60,20,150,500][j%8]),date:'2026-10-'+String(8+j%12).padStart(2,'0'),fromText:supply?suppliers[j%8]:materials[j%8],toText:supply?materials[j%8]:'生产批次 '+pad(j+1)});
 if(i===1)r.from='';if(i===2)r.to='';if(i===4){r.price='138.00';r.quantity='160'}if(i===5)r.supplyType=' 常规采购 ';if(i===6)r.quantity='';if(i===7)r.date='2026/10/15';
 if(supply)r.sourceAliases={from:'供应商 / 供应商编号（必填）',to:'SY物料 / 物料编号（必填）',code:'采购或供货记录编号',supplyType:'供应类型',price:'采购单价',quantity:'采购数量',date:'供货日期'};
 }else if(table.kind==='entity'){
 const j=i===4?3:i;Object.assign(r,{name:table.element==='供应商'?suppliers[j%8].replace('有限公司',j>=8?'零部件分公司':'有限公司'):table.element==='物料'?materials[j%8]:table.element==='产品批次'?'轴承装配批次 202610-'+pad(j+1):table.element+' · '+materials[j%8],code:(table.element==='供应商'?'SUP-':table.element==='物料'?'MAT-':'BAT-202610-')+pad(j+101),level:i%2?'B级':'A级',address:['苏州市工业园区兴浦路168号','常州市武进区长虹东路66号','天津市滨海新区海川路28号','宁波市镇海区骆驼街道机电路88号'][j%4],unit:table.element==='供应商'?'':'件'});
 if(i===1)r.code='';if(i===2)r.name='';if(i===4)r.address='宁波市北仑区新碶街道长江路518号';if(i===5)r.name=' '+r.name+' ';
 }else{const j=i===4?3:i;Object.assign(r,{name:table.element,subject:'BAT-202610-'+pad(j+18),code:'QC-202610-'+pad(j+101),date:'2026-10-'+String(9+j%12).padStart(2,'0')});if(i===1)r.date='';if(i===2)r.subject='';if(i===4)r.date='2026-10-14';if(i===5)r.date='2026/10/14';if(i===6)r.date='2026-02-30'}
 if(r.sourceAliases)r.sourceValues=Object.fromEntries(Object.entries(r.sourceAliases).filter(([,v])=>v).map(([k,v])=>[v,r[k]??'']));
 r.realisticMockVersion=1;delete r.dataProbe;
 });
}
function eventTableSchema(work){
 (work.events||[]).forEach((r,i)=>{if(r.eventSchemaVersion===1)return;
 const j=i===4?3:i,edited=Object.keys(r.fieldSources||{}).length>0;
 r.primaryKeys=['from','to'];
 if(!edited){Object.assign(r,{from:'SUP-'+String(j%8+1).padStart(3,'0'),to:'MAT-'+String(j+1).padStart(3,'0'),code:r.code||'PO-202610-'+String(j+201).padStart(3,'0'),supplyType:'常规采购',price:['18.50','86.00','125.00','2.80'][j%4],quantity:String([200,80,120,1000][j%4]),date:r.date||'',approval:i%3?'已审批':'待审批'});if(i===1)r.from='';if(i===2)r.to='';if(i===4)r.approval='审批退回';}
 r.sourceAliases={from:'供应商 / 供应商编号（必填）',to:'物料编号（必填）',code:'采购或供货记录编号',supplyType:'供应类型',price:'采购单价',quantity:'采购数量',date:'供货日期',approval:'审批状态'};
 r.sourceValues={...r.sourceValues,...Object.fromEntries(Object.entries(r.sourceAliases).map(([k,v])=>[v,r[k]??'']))};r.eventSchemaVersion=1;delete r.dataProbe;
 });
}
function addStandardPreviewExamples(work,table){
 if(work.standardPreviewExamplesVersion===1)return [];
 const key=keyOf(table.kind),template=work[key]?.[0];if(!template)return [];
 const examples=table.kind==='entity'?[
  {name:'  苏州明远精密制造有限公司',code:'STD-SUP-201',address:'苏州市工业园区星湖街201号'},
  {name:'无锡恒达机械有限公司  ',code:'STD-SUP-202',address:'无锡市新吴区长江路202号'},
  {name:' 宁波瑞丰传动有限公司 ',code:'STD-SUP-203',address:'宁波市镇海区机电路203号'},
  {name:'常州启明工业设备有限公司',code:' STD-SUP-204 ',address:'常州市武进区长虹路204号'},
  {name:'杭州新程自动化有限公司',code:'STD-SUP-205',address:' 杭州市钱塘区文海路205号 '}
 ]:[{code:'STD-PO-201',date:'2026/10/21'},{code:'STD-PO-202',date:'2026/10/22'},{code:' STD-PO-203 ',date:'2026/10/23'}];
 const added=examples.map((values,i)=>{
  const r=structuredClone(template),id='STD-'+table.def.id+'-'+(i+1);
  if(table.kind==='entity'&&table.element!=='供应商'){values.name=[' 深沟球轴承6205','传动轴Φ30 ',' 联轴器L090 ','不锈钢紧固件M12','同步带HTD-5M'][i];values.unit=i<3?'只':'个';}
  Object.assign(r,values,{id,status:'pending',masterId:'',rejected:[],origins:[id],changes:[],fieldSources:{},excludedReason:'',warning:'',group:''});delete r.dataProbe;delete r.existingInstanceId;
  if(r.sourceAliases)r.sourceValues={...r.sourceValues,...Object.fromEntries(Object.entries(r.sourceAliases).filter(([,v])=>v).map(([k,v])=>[v,r[k]??'']))};
  return r;
 });
 work[key].push(...added);work.standardPreviewExamplesVersion=1;return added;
}
function addUnitNullPreviewExamples(work,table){
 if(work.unitNullPreviewVersion===1)return [];
 const key=keyOf(table.kind),template=work[key]?.[0];if(!template)return [];
 const examples=table.kind==='entity'?[
  {name:'苏州嘉诚轴承有限公司',code:'STD-UNIT-301',unit:'只'},
  {name:'宁波恒信机电有限公司',code:'STD-UNIT-302',unit:'只'},
  {name:'杭州启航工业有限公司',code:'STD-NULL-303',address:'NULL'},
  {name:'常州瑞达精工有限公司',code:'STD-NULL-304',address:'N/A'},
  {name:'无锡远成设备有限公司',code:'STD-NULL-305',address:'   '}
 ]:[{code:'STD-NULL-303',approval:'NULL'},{code:'STD-NULL-304',supplyType:'N/A'},{code:'STD-NULL-305',supplyType:'   '}];
 const added=examples.map((values,i)=>{
  const r=structuredClone(template),id='STD-UNIT-NULL-'+table.def.id+'-'+i;
  if(table.kind==='entity'&&table.element!=='供应商')values.name=['轴承6205','密封圈35mm','传动轴30mm','联轴器L090','同步带5M'][i];
  Object.assign(r,values,{id,status:'pending',masterId:'',rejected:[],origins:[id],changes:[],fieldSources:{},excludedReason:'',warning:'',group:''});delete r.dataProbe;delete r.existingInstanceId;
  if(table.kind==='entity')r.sourceAliases={...r.sourceAliases,name:'名称',code:'业务编号',address:'地址 / 规格',unit:'供货计量单位'};
  if(r.sourceAliases)r.sourceValues={...r.sourceValues,...Object.fromEntries(Object.entries(r.sourceAliases).filter(([,v])=>v).map(([k,v])=>[v,r[k]??'']))};
  return r;
 });work[key].push(...added);work.unitNullPreviewVersion=1;return added;
}
function addFormatTypeExamples(work,table){
 if(work.formatTypePreviewVersion===1||table.kind!=='entity')return [];
 const template=work.rows?.[0];if(!template)return [];
 const added=[];
 [['苏州晨光精密有限公司','STD-TYPE-401','1,200','2026/10/21'],['宁波东源设备有限公司','STD-TYPE-402','250.50','2026/10/22']].forEach(([name,code,quantity,date],i)=>{
  const r=structuredClone(template);Object.assign(r,{id:'STD-FORMAT-'+table.def.id+'-'+i,name,code,quantity,date,unit:'个',status:'pending',masterId:'',changes:[],fieldSources:{},standardFieldTypes:{quantity:'number'}});r.origins=[r.id];delete r.dataProbe;r.sourceAliases={name:'名称',code:'业务编号',quantity:'交付数量',date:'交付日期',unit:'供货计量单位'};r.sourceValues=Object.fromEntries(Object.entries(r.sourceAliases).map(([k,v])=>[v,r[k]]));
  const ref=structuredClone(r);ref.id+='-REF';ref.quantity=Number(quantity.replaceAll(',',''));ref.date=date.replaceAll('/','-');ref.origins=[ref.id];ref.sourceValues={...ref.sourceValues,交付数量:ref.quantity,交付日期:ref.date};added.push(r,ref);
 });work.rows.push(...added);work.formatTypePreviewVersion=1;return added;
}
function extendDemo(work,table){
 if(table.id==='table-review'){if(work.reviewElement==='质量复验')work.reviewElement='采购供应明细';(work.events||[]).forEach(r=>{if(r.name==='质量复验')r.name='采购供应明细'});}
 if(table.id==='table-acceptance'){if(work.reviewElement==='采购供应明细')work.reviewElement='批次验收';(work.events||[]).forEach(r=>{if(r.name==='采购供应明细')r.name='批次验收'});}
 const relationAdded=[...relationAlignmentExamples(work,table),...addStandardPreviewExamples(work,table),...addUnitNullPreviewExamples(work,table),...addFormatTypeExamples(work,table)];
 if(work.reviewDemoVersion===3){realisticDemo(work,table);if(table.kind==='event')eventTableSchema(work);return relationAdded;}
 const key=keyOf(table.kind),template=work[key][0];if(!template)return [];
 const names=['江南精密制造','西部机电设备','新源工业材料','东海机械科技','中原装备制造','南方传动科技','远东精工','恒信工业'];
 const added=Array.from({length:16},(_,i)=>{
  const r=structuredClone(template),id=(table.kind==='entity'?'E':table.kind==='relation'?'R':'V')+'MOCK-'+table.def.id+'-'+(i+1);
  Object.assign(r,{id,status:'pending',masterId:'',rejected:[],origins:[id],changes:[],excludedReason:'',warning:'',group:'',fieldSources:{}});delete r.dataProbe;delete r.existingInstanceId;
  if(table.kind==='entity'){
   Object.assign(r,{name:table.element==='供应商'?names[i%names.length]+(i>=8?'分公司':'有限公司'):table.element+'示例'+(i+1),code:'DEMO-'+table.def.id+'-'+(i+1),level:i%2?'B级':'A级',address:'苏州市工业园区创新路'+(i+10)+'号',unit:table.element==='供应商'?'':'个'});
   if(i===1)r.code='';if(i===2)r.name='';
   if(i===3||i===4){r.code='DEMO-DUP-'+table.def.id;r.name=table.element+'重复样例';r.address=i===3?'上海市浦东新区':'苏州市工业园区'}
   if(i===5)r.name='  '+r.name+'  ';
   if(i===6||i===7){r.level=i===6?'合格':'通过';r.unit=i===6?'元':'万元'}
  }else if(table.kind==='relation'){
   Object.assign(r,{name:table.element,from:'演示供方'+(i+1),to:'演示物料'+(i+1),fromText:''});
   if(i===1)r.from='';if(i===2)r.to='';if(i===3||i===4){r.from='同一供方';r.to='同一物料'}if(i===5)r.name=' '+r.name+' ';
  }else{
   Object.assign(r,{name:table.element,subject:'演示批次-'+(i+1),date:'2026-10-'+String(i+1).padStart(2,'0')});
   if(i===1)r.date='';if(i===2)r.subject='';if(i===3||i===4){r.subject='重复批次';r.date='2026-10-05'}if(i===5)r.date='2026-13-40';if(i===6)r.date='2026-02-30';
  }
  return r;
 });
 work[key].push(...added);realisticDemo(work,table);if(table.kind==='event')eventTableSchema(work);work.reviewDemoVersion=3;return [...relationAdded,...added];
}
function fresh(table){const work=initial(),key=keyOf(table.kind);work.rows=[];work.relations=[];work.events=[];work[key]=structuredClone(table.kind==='entity'?seed.rows.filter(r=>r.type===table.def.type):seed[key].filter(r=>table.def.recordIds.includes(r.id)));work.sourceId=table.id;work.reviewKind=table.kind;work.reviewTargetCleared=true;work.reviewElement='';work.elementMapping={};work.reviewCompleted=false;extendDemo(work,table);return work}
function load(id){const saved=state.reviewTableStates?.[id];if(!saved)return;const all=state.reviewTableStates;state=structuredClone(saved.work);state.reviewTableStates=all;state.activeReviewTable=id;Object.assign(baseline,structuredClone(saved.raw));activeTab=state.reviewKind;activeSheet='all';typeFilter='all';issueFilter='all';query='';$('#search').value='';view='work';selected.clear();undoStack=[];focusId=state[keyOf(activeTab)][0]?.id}
const saveBase=persist;persist=function(){stash();return saveBase()};
function add(id){const table=tables.find(t=>t.id===id);if(!table)return;stash();const all=snapshots();if(!all[id]){const work=fresh(table);all[id]={work,raw:structuredClone(work)}}load(id);persist();render()}
renderInlineSetup=function(){const box=$('#sourceSetup');box.hidden=false;box.style.display='block';box.innerHTML='<h3 style="margin-bottom:14px">校验数据表</h3><nav class="review-table-tabs">'+Object.keys(state.reviewTableStates||{}).map(id=>'<button data-multi-tab="'+id+'" class="'+(state.activeReviewTable===id?'primary':'')+'">'+E(tables.find(t=>t.id===id)?.name||id)+'</button>').join('')+'</nav>';};
sourceModal=function(){openModal('project-tables','选择项目数据表','', '<p style="margin-bottom:16px">当前项目：'+E(reviewContext?.projectName||'当前项目')+'</p><table class="compare"><thead><tr><th>选择</th><th>名称</th><th>类型</th><th>数据量</th></tr></thead><tbody>'+tables.map(t=>{const added=!!state.reviewTableStates?.[t.id];return '<tr><td><input type="checkbox" data-project-table="'+t.id+'" '+(added?'checked disabled':'')+' aria-label="选择 '+E(t.name)+'"></td><td>'+E(t.name)+(added?' <span class="tag">已添加</span>':'')+'</td><td>数据表</td><td>'+fresh(t)[keyOf(t.kind)].length+'</td></tr>'}).join('')+'</tbody></table>',footer('multi-add-selected','确认添加'));};

function probeSignature(r){return JSON.stringify([state.reviewKind,state.reviewTargetCleared,state.reviewElement,r.name,r.code,r.level,r.address,r.unit,r.from,r.to,r.fromText,r.subject,r.date,r.approval,r.contract,r.batch,r.validFrom,r.validTo,r.sourceValues])}
function probeCurrent(r){return r.dataProbe?.version===6&&r.dataProbe.signature===probeSignature(r)}
const originalTags=tags;tags=function(r){if(!state.activeReviewTable)return originalTags(r);if(['excluded','merged'].includes(r.status))return originalTags(r);if(!probeCurrent(r))return '<span class="tag">'+(r.dataProbe?'待重新探查':'未探查')+'</span>';const p=r.dataProbe;if(!p.labels.some(x=>Object.values(probeNames).includes(x.text)))return '<span class="tag">-</span>';return p.labels.map(x=>'<span class="tag '+x.color+'" title="'+E(x.detail||x.text)+'">'+E(x.text)+'</span>').join('')};
const probeNames={missing:'主键缺失',empty:'属性值缺失',conflict:'属性值冲突',duplicate:'疑似重复',irregular:'数据不规范'};
Object.assign(issueNames,probeNames);
const filteredBeforeProbe=filtered;
filtered=function(){if(!state.activeReviewTable)return filteredBeforeProbe();const filter=issueFilter;issueFilter='all';let list;try{list=filteredBeforeProbe()}finally{issueFilter=filter}list=list.filter(r=>r.status!=='merged');if(probeNames[filter])list=list.filter(r=>probeCurrent(r)&&r.dataProbe.labels.some(x=>x.text===probeNames[filter]));const rank=r=>!probeCurrent(r)?1:r.dataProbe.labels.some(x=>Object.values(probeNames).includes(x.text))?0:2;return list.sort((a,b)=>rank(a)-rank(b))};
renderSidebar=function(){const rows=(data()[keyOf(state.reviewKind)]||[]).filter(r=>!['excluded','merged'].includes(r.status));$('#sidebar').innerHTML='<div class="side-group"><div class="side-title">问题类型</div>'+Object.entries({all:'全部结果',...probeNames}).map(([key,label])=>'<button class="side-item '+(issueFilter===key?'active':'')+'" data-probe-filter="'+key+'">'+I(key==='all'?'layers':'alert')+label+'<span>'+(key==='all'?rows.length:rows.filter(r=>probeCurrent(r)&&r.dataProbe.labels.some(x=>x.text===label)).length)+'</span></button>').join('')+'</div>'};
document.addEventListener('click',e=>{const button=e.target.closest('[data-probe-filter]');if(!button)return;e.stopImmediatePropagation();issueFilter=button.dataset.probeFilter;selected.clear();focusId=filtered()[0]?.id;render()},true);
function drawProbeControls(){let slot=$('#reviewTargetControls');if(!slot){slot=document.createElement('div');slot.id='reviewTargetControls';$('.work-head-left').after(slot)}slot.innerHTML='<div class="review-table-setup"><label>目标类型 <span class="review-kind-select"><select id="multiKind"><option value="" hidden disabled '+(state.reviewTargetCleared?'selected':'')+'>请选择目标类型</option>'+Object.entries(kindNames).map(([k,v])=>'<option value="'+k+'" '+(!state.reviewTargetCleared&&k===state.reviewKind?'selected':'')+'>'+v+'</option>').join('')+'</select>'+(!state.reviewTargetCleared&&view!=='raw'?btn('×','clear-target-kind','review-kind-clear','title="清除目标类型" aria-label="清除目标类型"'):'')+'</span></label><label>对应元素 <select id="multiElement">'+(state.reviewTargetCleared?'<option value="">请先选择目标类型</option>':choices[state.reviewKind].map(v=>'<option '+(v===state.reviewElement?'selected':'')+'>'+v+'</option>').join(''))+'</select></label></div>';slot.querySelectorAll('select').forEach(el=>el.disabled=view==='raw');$('#multiElement').disabled=view==='raw'||!!state.reviewTargetCleared;if(!$('#tableProbe'))$('#tabs').insertAdjacentHTML('beforeend',btn('数据探查','table-probe','','id="tableProbe"')+btn('深度探查','deep-probe','primary','id="deepProbe"'));$('#tableProbe').disabled=view==='raw'||(!state.reviewTargetCleared&&!!state.reviewKind&&!!state.reviewElement);$('#tableProbe').title=$('#tableProbe').disabled?'已配置目标元素，请使用深度探查':'';$('#deepProbe').disabled=view==='raw'||!!state.reviewTargetCleared||!state.reviewKind||!state.reviewElement;$('#deepProbe').title=state.reviewTargetCleared?'请先选择目标类型和对应元素':''}
function runProbe(deep){
 if(view==='raw'||!state.activeReviewTable)return;
 const configured=!state.reviewTargetCleared&&!!state.reviewKind&&!!state.reviewElement;
 if(deep!==configured){toast(configured?'已配置目标元素，请使用深度探查':'请先选择目标类型和对应元素');return}
 const kind=state.reviewKind,rows=state[keyOf(kind)].filter(r=>!['excluded','merged'].includes(r.status)),refs=deep?references():[];
 if(!rows.length){toast('当前数据表没有可探查的数据');return}
 const norm=x=>String(x??'').trim().toLowerCase(),keys=kind==='entity'?['name','code','level','address','unit']:kind==='relation'?['from','to','code','supplyType','price','quantity','date']:['from','to','code','supplyType','price','quantity','date','approval'];
 const value=(r,k)=>['from','to','subject'].includes(k)?(seed.rows.find(x=>x.id===r[k])?.name||r[k]||r[k+'Text']||''):r[k];
 const identity=r=>window.reviewBusinessIdentity(kind,r);
 const fieldNames={id:kind==='relation'?'关系记录编号':'事件编号',code:kind==='entity'?'业务编号':kind==='relation'?'关系记录编号':'事件编号',name:'名称',from:'起点编号',to:'终点编号',subject:'参与对象',date:kind==='event'?'发生时间':'供货日期',supplyType:'供应类型',price:'采购单价',quantity:'采购数量',level:'等级 / 分类',address:'地址 / 规格',unit:'单位',approval:'审批状态'};
 commit(deep?'深度探查':'数据探查',rows.length+' 条记录',()=>rows.forEach(r=>{
 const labels=[],push=(text,color,detail,source='表内')=>{const label=labels.find(x=>x.text===text),info=source+'：'+detail;if(label)label.detail+='；'+info;else labels.push({text,color,detail:info})};
 const primary=kind!=='event'||Object.hasOwn(r,'code')?'code':'id';
 const required=kind==='entity'?['name','code']:kind==='relation'?['name','from','to',...(r.sourceAliases?.supplyType?['supplyType','price','quantity','date']:[])]:['from','to','date','approval'];
 required.forEach(k=>{if(!norm(value(r,k)))push((kind!=='entity'?['from','to'].includes(k):k===primary)?'主键缺失':'属性值缺失','orange',(fieldNames[k]||k)+'缺失')});
 if(keys.some(k=>typeof value(r,k)==='string'&&value(r,k)!==value(r,k).trim()))push('数据不规范','orange','字段含首尾空格');
 if(r.unit&&['元','万元'].includes(r.unit)&&rows.some(x=>x.unit&&['元','万元'].includes(x.unit)&&x.unit!==r.unit))push('数据不规范','orange','金额单位不统一');if(r.level&&['合格','通过'].includes(r.level)&&rows.some(x=>['合格','通过'].includes(x.level)&&x.level!==r.level))push('数据不规范','orange','枚举值不统一');if(r.date){const d=new Date(r.date);if(!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||Number.isNaN(d.getTime())||d.toISOString().slice(0,10)!==r.date)push('数据不规范','orange','日期格式或日期值无效')}
 const peers=rows.filter(x=>x!==r&&identity(r)&&identity(x)===identity(r));
 if(peers.length)push('疑似重复','purple','相关记录 '+peers.map(x=>x.id).join('、'));
 const conflictKeys=keys.filter(k=>norm(value(r,k))&&peers.some(x=>norm(value(x,k))&&norm(value(x,k))!==norm(value(r,k))));
 if(conflictKeys.length)push('属性值冲突','red',conflictKeys.map(k=>fieldNames[k]||k).join('、')+'不一致');
 let candidates=[];
 if(deep){candidates=refs.filter(m=>kind==='entity'?(norm(r.code)&&norm(r.code)===norm(m.code)||norm(r.name)&&norm(m.name).includes(norm(r.name))):!!identity(r)&&identity(r)===identity(m));
 const exact=candidates.filter(m=>kind==='entity'?norm(r.code)&&norm(r.code)===norm(m.code):!!identity(r)&&identity(r)===identity(m));
 if(candidates.length>1)push('属性值冲突','red','已有实例匹配不明确，存在多个候选','已有实例');
 if(exact.length)push('疑似重复','purple',exact.map(x=>x.id).join('、'),'已有实例');
 const conflicts=keys.filter(k=>norm(value(r,k))&&exact.some(m=>norm(value(m,k))&&norm(value(m,k))!==norm(value(r,k))));
 if(conflicts.length)push('属性值冲突','red',conflicts.map(k=>fieldNames[k]||k).join('、')+'不一致','已有实例');}
 if(!labels.length)labels.push({text:'未发现问题',color:'green',detail:deep?'已完成表内检查和已有实例对比':'已完成表内检查'});
 r.dataProbe={version:6,mode:deep?'deep':'table',time:new Date().toLocaleString('zh-CN'),signature:probeSignature(r),labels,candidateIds:candidates.map(m=>m.id)};
 recordChange(r,deep?'深度探查':'数据探查',labels.map(x=>x.text).join('、'));
 }));
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;if(['table-probe','deep-probe'].includes(b.dataset.action)){e.stopImmediatePropagation();runProbe(b.dataset.action==='deep-probe')}},true);

if(state.activeReviewTable&&state.reviewTableStates?.[state.activeReviewTable]?.raw){Object.assign(baseline,structuredClone(state.reviewTableStates[state.activeReviewTable].raw));}
const renderBase=render;render=function(){if(!state.sourceId&&!state.activeReviewTable){state.rows=[];state.relations=[];state.events=[];state.reviewKind='entity';state.reviewTargetCleared=true;state.reviewElement='';Object.assign(baseline,{rows:[],relations:[],events:[]});activeTab='entity';focusId=null;selected.clear();}if(state.sourceId&&!state.activeReviewTable){const table=tables.find(t=>t.kind==='entity');const old=state;const work=fresh(table);work.rows=old.rows.filter(r=>r.type===table.element);state=work;state.reviewTableStates={[table.id]:{work:structuredClone(work),raw:structuredClone(work)}};load(table.id)}if(state.activeReviewTable){const table=tables.find(t=>t.id===state.activeReviewTable);if(table){const before=JSON.stringify([state[keyOf(state.reviewKind)],baseline]);extendDemo(state,{...table,kind:state.reviewKind});extendDemo(baseline,{...table,kind:state.reviewKind});if(before!==JSON.stringify([state[keyOf(state.reviewKind)],baseline]))persist();}activeTab=state.reviewKind}renderBase();renderInlineSetup();$('#workSurface').hidden=false;$('#setupEmpty')?.setAttribute('hidden','');$('#tabs').innerHTML='<strong style="padding:16px 0">'+(state.reviewTargetCleared?'当前表数据':kindNames[state.reviewKind]+' · '+E(state.reviewElement))+'</strong>';drawProbeControls();$('#standardBtn').disabled=view==='raw';$('#duplicatesBtn').hidden=true;if(!$('#instanceAlign'))$('#standardBtn').insertAdjacentHTML('afterend',btn('数据对齐','existing-align','','id="instanceAlign"')+btn('数据融合','existing-merge','','id="instanceMerge"'));$('#instanceAlign').disabled=$('#instanceMerge').disabled=view==='raw';$('#standardBtn').title='处理数据不规范：统一格式、数据类型和单位。';$('#instanceAlign').title='处理主键缺失、属性值缺失和属性值冲突：参考相关数据补齐或修正字段，保留记录数量。';$('#instanceMerge').title='处理疑似重复：将确认属于同一对象的多条记录合并为一条。';$('#rowCount').textContent='当前表 '+filtered().length+' 条记录';if(!state.activeReviewTable){const empty=$('#rows .empty');if(empty)empty.innerHTML=I('file')+'<p>暂无数据</p><small>添加数据表后，在此查看和校验数据</small>';['multiKind','multiElement','tableProbe','deepProbe','standardBtn','instanceAlign','instanceMerge'].forEach(id=>$('#'+id).disabled=true);}};
const exportBase=exportable;exportable=function(){stash();const activeState=state;const result={rows:[],relations:[],events:[]};try{for(const entry of Object.values(activeState.reviewTableStates||{})){state=entry.work;const out=exportBase();for(const k of ['rows','relations','events'])result[k].push(...out[k])}}finally{state=activeState}return result};

let operation=null;
function references(){const element=state.reviewElement,kind=state.reviewKind;if(kind==='entity'&&master.some(m=>m.type===element))return master.filter(m=>m.type===element);if(kind==='relation'&&['供应','采购','交付'].includes(element))return [{id:'REL-PO-01',name:element,code:'PO-20261001',from:'SUP-001',to:'MAT-001',supplyType:'常规采购',price:'125.00',quantity:'100',date:'2026-10-12'},{id:'REL-PO-02',name:element,code:'PO-20261002',from:'SUP-002',to:'MAT-002',supplyType:'紧急采购',price:'86.00',quantity:'50',date:'2026-10-15'}];if(kind==='relation')return [{id:'REL-001',name:element,from:'华东精工有限公司',to:'精密轴承',fromText:'华东精工有限公司',source:'项目已有关系实例'},{id:'REL-002',name:element,from:'华南制造有限公司',to:'传动轴',fromText:'华南制造有限公司',source:'项目已有关系实例'}];if(kind==='event')return [{id:'EVT-001',name:element,primaryKeys:['from','to'],from:'SUP-001',to:'MAT-001',code:'PO-202610-201',supplyType:'常规采购',price:'18.50',quantity:'200',approval:'已审批',subject:'产品批次 B-018',date:'2026-10-12',source:'项目已有事件实例'},{id:'EVT-002',name:element,primaryKeys:['from','to'],from:'SUP-004',to:'MAT-004',code:'PO-202610-204',supplyType:'常规采购',price:'2.80',quantity:'1000',approval:'已审批',subject:'产品批次 B-019',date:'2026-10-15',source:'项目已有事件实例'}];return [{id:'OBJ-001',type:element,name:element+'示例一',code:'OBJ-001',level:'A级',address:'示例规格',unit:'个',source:'项目已有实体实例'},{id:'OBJ-002',type:element,name:element+'示例二',code:'OBJ-002',level:'B级',address:'示例规格二',unit:'个',source:'项目已有实体实例'}]}
function openExisting(mode){if(state.reviewTargetCleared){toast('请先选择目标类型和对应元素');return}const row=current();if(!row){toast('请先点击一条待处理记录');return}operation={mode,id:row.id,ref:references()[0]?.id};openModal('existing',mode==='standard'?'参照已有实例标准化':mode==='align'?'对齐已有实例':'与已有实例对比融合','', '',footer('existing-apply','确认应用'));drawExisting()}
function drawExisting(){const row=state[keyOf(state.reviewKind)].find(r=>r.id===operation.id),refs=references(),ref=refs.find(r=>r.id===operation.ref),keys=state.reviewKind==='entity'?Object.keys(fields):state.reviewKind==='relation'?['name','from','to','fromText']:['name','subject','date'],labels={...fields,from:'起点实体',to:'终点实体',fromText:'原文起点',subject:'关联实体',date:'发生时间'};$('#modalBody').innerHTML='<div class="callout">当前表记录：'+E(row.name)+' · '+E(state.reviewElement)+'</div><label class="form-label">已有'+kindNames[state.reviewKind]+'实例<select id="existingRef">'+refs.map(r=>'<option value="'+r.id+'" '+(r.id===operation.ref?'selected':'')+'>'+E(r.name)+' · '+E(r.code||r.id)+' · '+E(r.source)+'</option>').join('')+'</select></label><div class="compare-scroll"><table class="compare"><thead><tr><th>字段</th><th>当前表</th><th>已有实例</th><th>最终采用</th></tr></thead><tbody>'+keys.map(k=>{const left=row[k]||'',right=ref[k]||'';return '<tr><td>'+E(labels[k])+'</td><td>'+E(left)+'</td><td>'+E(right)+'</td><td><select data-existing-field="'+k+'"><option value="current">保留当前：'+E(left||'空')+'</option><option value="reference">采用已有：'+E(right||'空')+'</option>'+(operation.mode==='standard'?'<option value="normalized">规范化当前：'+E(String(left).trim().replace(/只$/,'个'))+'</option>':'')+'</select></td></tr>'}).join('')+'</tbody></table></div><label class="toggle-line"><input id="existingConfirm" type="checkbox">已核对实例及字段取值</label><p class="muted">处理结果保存至当前表草稿，已有实例保留原值。</p>';}
const standardBase=standardModal;standardModal=function(){if(state.activeReviewTable)openExisting('standard');else standardBase()};
document.addEventListener('change',e=>{if(e.target.id==='existingRef'){operation.ref=e.target.value;drawExisting()}if(e.target.id==='multiElement'){commit('配置目标元素',e.target.value,()=>{state.reviewElement=e.target.value;state.elementMapping={[tables.find(t=>t.id===state.activeReviewTable).def.id]:e.target.value};state[keyOf(state.reviewKind)].forEach(r=>{r.type=e.target.value;r.masterId='';r.status='pending'})})}if(e.target.id==='multiKind'){const next=e.target.value,old=state.reviewKind;if(!next){commit('清空目标类型','保留当前表数据',()=>{state.reviewTargetCleared=true;state.reviewElement='';state.elementMapping={}});return}commit('配置目标类型',kindNames[next],()=>{const rows=state[keyOf(old)];state[keyOf(old)]=[];state[keyOf(next)]=rows;state.reviewTargetCleared=false;state.reviewKind=next;state.reviewElement=choices[next][0];rows.forEach(r=>{r.type=state.reviewElement;r.status='pending';r.masterId=''})});activeTab=next;render()}});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.multiTab){e.stopImmediatePropagation();stash();load(b.dataset.multiTab);persist();render();return}const a=b.dataset.action;if(a==='clear-target-kind'){e.preventDefault();e.stopImmediatePropagation();if(view==='raw')return;const input=$('#multiKind');input.value='';input.dispatchEvent(new Event('change',{bubbles:true}));return}if(a==='multi-add-selected'){e.stopImmediatePropagation();const ids=Array.from(document.querySelectorAll('[data-project-table]:checked:not(:disabled)')).map(el=>el.dataset.projectTable);if(!ids.length){toast('请选择需要添加的数据表');return}ids.forEach(add);closeModal();toast('已添加 '+ids.length+' 张数据表');return}if(a==='existing-align'||a==='existing-merge'){e.stopImmediatePropagation();openExisting(a==='existing-align'?'align':'merge');return}if(a==='existing-apply'){if(!$('#existingConfirm').checked){toast('请先核对实例及字段取值');return}const ref=references().find(r=>r.id===operation.ref),values=Array.from(document.querySelectorAll('[data-existing-field]')).map(el=>[el.dataset.existingField,el.value]);commit('已有实例'+({align:'对齐',merge:'融合',standard:'标准化'}[operation.mode]),operation.id+' → '+ref.id,()=>{const row=state[keyOf(state.reviewKind)].find(r=>r.id===operation.id);values.forEach(([k,choice])=>{if(choice==='reference')row[k]=ref[k]||'';if(choice==='normalized')row[k]=String(row[k]||'').trim().replace(/只$/,'个')});row.existingInstanceId=ref.id;if(operation.mode==='align')row.masterId=ref.id;row.status='pending';recordChange(row,'参照已有实例',ref.source+' / '+ref.id)});closeModal()}
},true);
function openOntologyMapping(){
 if(!state.activeReviewTable||view==='raw')return;
 const kind=state.reviewTargetCleared?'':state.reviewKind;
 openModal('ontology-mapping','本体映射','', '<p>当前数据表：'+E(tables.find(t=>t.id===state.activeReviewTable)?.name||'当前表')+'</p><label class="form-label">目标类型<select id="mappingKind"><option value="">请选择目标类型</option>'+Object.entries(kindNames).map(([k,v])=>'<option value="'+k+'" '+(k===kind?'selected':'')+'>'+E(v)+'</option>').join('')+'</select></label><label class="form-label">对应元素<select id="mappingElement"></select></label>',footer('apply-ontology-mapping','保存映射'));
 drawMappingElements(kind,state.reviewElement);
}
function drawMappingElements(kind,element){const select=$('#mappingElement');select.disabled=!kind;select.innerHTML=kind?(choices[kind]||[]).map(v=>'<option '+(v===element?'selected':'')+'>'+E(v)+'</option>').join(''):'<option value="">请先选择目标类型</option>';}
window.addEventListener('message',e=>{if(e.source===parent&&e.data?.type==='review-action'&&e.data.action==='mapping')openOntologyMapping()});
document.addEventListener('change',e=>{if(e.target.id==='mappingKind')drawMappingElements(e.target.value,'')});
document.addEventListener('click',e=>{if(!e.target.closest('[data-action="apply-ontology-mapping"]'))return;e.preventDefault();e.stopImmediatePropagation();const kind=$('#mappingKind').value,element=$('#mappingElement').value;if(!kind||!element){toast('请选择目标类型和对应元素');return;}if(!choices[kind]?.includes(element))return;
 commit('本体映射','',()=>{const rows=state[keyOf(state.reviewKind)];if(kind!==state.reviewKind){state[keyOf(state.reviewKind)]=[];state[keyOf(kind)]=rows;}state.reviewKind=kind;state.reviewElement=element;state.reviewTargetCleared=false;state.elementMapping={[tables.find(t=>t.id===state.activeReviewTable).def.id]:element};rows.forEach(r=>{r.type=element;r.status='pending';r.masterId=''});activeTab=kind;});closeModal();
},true);
const openTreatment=window.installReviewTreatment({
 escape:E,statusTags:r=>tags(r),problemTypes:r=>probeCurrent(r)?r.dataProbe.labels.filter(x=>Object.values(probeNames).includes(x.text)).map(x=>x.text):[r.dataProbe?'待重新探查':'未探查'],kind:()=>state.reviewKind,element:()=>state.reviewElement,configured:()=>!state.reviewTargetCleared&&!!state.reviewElement,readonly:()=>view==='raw',
 rows:()=>state[keyOf(state.reviewKind)],selected:()=>[...selected],filtered:()=>filtered(),tableName:()=>tables.find(t=>t.id===state.activeReviewTable)?.name||'当前表',references,
 otherTables:()=>Object.entries(state.reviewTableStates||{}).filter(([id,v])=>id!==state.activeReviewTable&&v.work.reviewKind===state.reviewKind).map(([id,v])=>({name:tables.find(t=>t.id===id)?.name||id,rows:v.work[keyOf(state.reviewKind)]})),
 toast,modal:openModal,body:()=>$('#modalBody'),close:closeModal,commit:(...args)=>commit(...args),record:recordChange,
 retarget:(oldId,newId)=>{state.relations.forEach(r=>{if(r.from===oldId)r.from=newId;if(r.to===oldId)r.to=newId});state.events.forEach(r=>{if(r.subject===oldId)r.subject=newId})},
 recheck:()=>{const saved=commit;try{commit=(title,detail,fn)=>fn();runProbe(!state.reviewTargetCleared&&!!state.reviewKind&&!!state.reviewElement)}finally{commit=saved}}
});
openExisting=mode=>openTreatment(mode);
standardModal=function(){if(state.activeReviewTable)openTreatment('standard');else standardBase()};
const mergeBeforeTreatment=mergeModal;mergeModal=function(ids){if(state.activeReviewTable)openTreatment('merge',ids);else mergeBeforeTreatment(ids)};
const style=document.createElement('style');style.textContent='.review-table-setup{display:flex;gap:14px;align-items:center;flex-wrap:wrap}.review-table-setup select{padding:10px;border:1px solid #dce4ef;border-radius:7px;background:white;color:var(--ink);min-width:160px}.review-table-setup>select{flex:1}.review-table-tabs{display:flex;gap:8px;overflow:auto;margin:16px 0}.review-table-tabs:empty{display:none}.review-table-setup label{display:flex;align-items:center;gap:10px}.work-head{flex-wrap:wrap;padding:12px 20px}#tabs{align-items:center;gap:8px;flex-wrap:wrap}#tabs>strong{margin-right:auto}#tabs>#tableProbe,#tabs>#deepProbe{border:1px solid var(--line);border-radius:7px;padding:8px 12px;margin:7px 0}#tabs>#deepProbe{background:var(--blue);color:white;border-color:var(--blue)}#reviewTargetControls{margin-left:auto}#reviewTargetControls select{min-width:125px;padding:7px}#reviewTargetControls .review-table-setup{gap:12px}.review-kind-select{position:relative;display:inline-flex}#reviewTargetControls .review-kind-select select{min-width:145px;padding-right:48px}.review-kind-clear{position:absolute;right:25px;top:50%;transform:translateY(-50%);border:0;background:transparent;color:#8b97aa;padding:0;width:20px;height:22px;font-size:17px;line-height:1}.review-kind-clear:hover{color:#2563eb;background:#edf4ff}';document.head.append(style);
})();

parent.postMessage({type:'review-ready'},'*');
}
