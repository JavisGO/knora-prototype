/* Project-scoped unstructured extraction prototype. All extraction and writes are simulated locally. */
(function () {
  'use strict';
  if (document.body.dataset.app !== 'jinglun' || new URLSearchParams(location.search).get('view') !== 'project-extraction') return;
  const root = document.getElementById('content');
  const projects = {
    personal: {name:'陈宇的个人项目',path:'个人空间',kind:'quality'},
    insight: {name:'客户洞察项目',path:'赛豆企业空间 / 市场营销域 / 客户运营部',kind:'customer'},
    experience: {name:'客户体验提升项目',path:'赛豆企业空间 / 市场营销域 / 客户运营部',kind:'customer'},
    channel: {name:'渠道协同项目',path:'赛豆企业空间 / 市场营销域 / 华东渠道组',kind:'customer'},
    ai: {name:'智能营销试点项目',path:'赛豆企业空间 / 创新业务空间',kind:'customer'}
  };
  const schemas = {
    quality: {name:'质量管理本体',types:['供应商','采购批次','质量异常'],relations:['涉及供应商','发生异常'],props:['编码','质量等级'],existing:'华东精工有限公司',existingId:'SUP-00382',oldValue:'B',newValue:'A',relation:'涉及供应商'},
    customer: {name:'客户经营本体',types:['客户','服务工单','服务问题'],relations:['所属客户','涉及问题'],props:['编码','风险等级'],existing:'华东汽车有限公司',existingId:'CUS-00126',oldValue:'中',newValue:'高',relation:'所属客户'}
  };
  let project = new URLSearchParams(location.search).get('project') || 'personal';
  if (!projects[project]) project = 'personal';
  let tasks = [], task = null, step = 0, tab = 'entity', mode = 'list', query = '', filter = 'all', timers = [], drawerRecord = null, notice = '';
  const dataTypes = {document:'非结构化文档',longtext:'长文本字段'};
  const dataTypeLabel = t => dataTypes[t.dataType] || (t.inputs.some(x=>x.kind==='长文本字段') ? (t.inputs.some(x=>x.kind!=='长文本字段')?'非结构化文档 / 长文本字段':'长文本字段') : '非结构化文档');
  const clone = x => JSON.parse(JSON.stringify(x));
  const esc = x => String(x == null ? '' : x).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const btn = (text, action, extra = '') => `<button type="button" class="btn" data-ex-action="${action}" ${extra}>${text}</button>`;
  const tag = (text, tone = '') => `<span class="ex-tag ${tone}">${esc(text)}</span>`;
  const stamp = () => new Date().toLocaleString('zh-CN', {hour12:false,timeZone:'Asia/Shanghai'});
  const selectedSchema = () => schemas[task?.schema || projects[project].kind];
  const options = (values, value) => values.map(x => `<option value="${esc(x)}" ${x === value ? 'selected' : ''}>${esc(x)}</option>`).join('');
  function sources(kind) {
    const quality = kind === 'quality';
    return [
      {id:'doc',kind:'文档',name:quality?'供应商质量管理制度.pdf':'客户风险管理办法.pdf',where:'第 12 页 · 第 3 段',range:'全文',field:'',text:quality?'华东精工有限公司（供应商编码 SUP-00382）质量等级为 A。采购批次 PB-202609-018 由该供应商提供。':'华东汽车有限公司（客户编码 CUS-00126）风险等级为高。服务工单 WO-202609-018 属于该客户。'},
      {id:'article',kind:'文章',name:quality?'质量异常协同记录':'客户服务复盘',where:'第 2 段',range:'全文',field:'',text:quality?'华东精工为华东精工有限公司（供应商编码 SUP-00382，质量等级 A）的简称。批次 PB-202609-018 出现尺寸偏差，需安排复检。':'华东汽车为华东汽车有限公司（客户编码 CUS-00126，风险等级高）的简称。工单 WO-202609-018 记录交付延期问题，需跟进处理。'},
      {id:'table',kind:'长文本字段',name:quality?'dwd_supplier_quality_event':'customer_feedback_longtext',where:'记录 018 · description',range:'全部记录',field:'description',text:quality?'批次 PB-202609-018 检验记录：供应商华东精工有限公司（编码 SUP-00382，质量等级 A）；异常为尺寸偏差。':'工单 WO-202609-018 客户反馈：华东汽车有限公司（编码 CUS-00126，风险等级高）提出交付延期问题。'}
    ];
  }
  function knowledgeCatalog(){
    const quality=projects[project].kind==='quality',docs=sources(projects[project].kind);
    return [{id:'kb-main',name:quality?'质量制度知识库':'客户运营知识库',items:[docs[0]]},
      {id:'kb-record',name:quality?'质量协同知识库':'客户服务知识库',items:[docs[1]]}];
  }
  function assetCatalog(){
    const source=sources(projects[project].kind).find(x=>x.id==='table');
    const fields=[{name:'id',type:'BIGINT'},{name:'description',type:'TEXT'},{name:'remark',type:'VARCHAR(2000)'},{name:'created_at',type:'TIMESTAMP'},{name:'amount',type:'DECIMAL(18,2)'}];
    return [{id:'asset-current',name:source.name,source:'业务数据资产',fields},
      {id:'asset-history',name:source.name+'_history',source:'历史数据资产',fields:clone(fields)},
      {id:'asset-metrics',name:projects[project].kind==='quality'?'supplier_quality_metrics':'customer_service_metrics',source:'指标数据资产',fields:[fields[0],fields[3],fields[4]]}];
  }
  const isTextField = field => /^(TEXT|STRING|VARCHAR|CHAR|NVARCHAR|NCHAR|CLOB)(\s*\(|$)/i.test(field.type);
  function fieldsFor(input){return assetCatalog().find(x=>x.id===(input.assetId||'asset-current'))?.fields || [];}
  function knowledgePickerBody(kbId){
    const catalog=knowledgeCatalog(),kb=catalog.find(x=>x.id===kbId)||catalog[0],c=currentConfig();
    return `<label class="ex-field">知识库<select id="exKnowledgeBase">${catalog.map(x=>`<option value="${x.id}" ${kb.id===x.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select></label><p class="ex-hint">选择当前项目可用知识库中的文档或文章。</p><div class="ex-resource-picker">${kb.items.map(x=>`<label><input type="checkbox" data-ex-kb-item="${x.id}" ${c.inputs.some(i=>i.id===x.id)?'checked':''}><span><b>${esc(x.name)}</b><small>${x.kind} · 已解析</small></span></label>`).join('')}</div>`;
  }
  function tablePickerBody(assetId){
    const tables=assetCatalog(),selected=tables.find(x=>x.id===assetId);
    return `<label class="ex-field">数据资产 / 数据表<select id="exAssetTable"><option value="">请选择数据表</option>${tables.map(x=>`<option value="${x.id}" ${x.id===assetId?'selected':''}>${esc(x.name)} · ${esc(x.source)}</option>`).join('')}</select></label><div id="exAssetFields">${selected?tableFieldPreview(selected):'<p class="ex-hint">选择数据表后查看字段结构；文本字段在工作区继续选择。</p>'}</div>`;
  }
  function tableFieldPreview(table){
    return `<h3>字段结构</h3><div class="ex-field-schema">${table.fields.map(f=>`<div><b>${esc(f.name)}</b><span>${esc(f.type)}</span>${tag(isTextField(f)?'可用于文本抽取':'非文本字段',isTextField(f)?'blue':'')}</div>`).join('')}</div><p class="ex-hint">${table.fields.filter(isTextField).length} 个文本类型字段可选，数值和日期等字段不会出现在抽取字段选项中。</p>`;
  }
  function recordList(t) {
    const s = schemas[t.schema], quality = t.schema === 'quality';
    const inputs = t.inputs.filter(x => x.text.includes(s.existing));
    if (!inputs.length) return [];
    const evidence = inputs.map(x => ({source:x.id,where:x.where,text:x.text}));
    const first = evidence[0];
    const hasArticle = inputs.some(x => x.id === 'article'), hasTable = inputs.some(x => x.id === 'table');
    let rows = [
      {id:'e1',kind:'entity',type:s.types[0],name:s.existing,props:{编码:s.existingId,[s.props[1]]:s.newValue},confidence:96,evidence:[first],confirmed:false,decision:'pending',existing:s.existingId,conflict:true,resolution:'',manual:false},
      {id:'e2',kind:'entity',type:s.types[1],name:quality?'PB-202609-018':'WO-202609-018',props:{编码:quality?'PB-202609-018':'WO-202609-018'},confidence:91,evidence:[first],confirmed:false,decision:'new',manual:false}
    ];
    if (hasArticle || hasTable) rows.push({id:'e3',kind:'entity',type:s.types[2],name:quality?'尺寸偏差':'交付延期',props:{编码:''},confidence:78,evidence:evidence.filter(x=>x.source!=='doc'),confirmed:false,decision:'new',manual:false});
    if (hasArticle) rows.push({id:'e4',kind:'entity',type:s.types[0],name:quality?'华东精工':'华东汽车',props:{编码:s.existingId},confidence:88,evidence:evidence.filter(x=>x.source==='article'),confirmed:false,decision:'new',duplicate:'e1',manual:false});
    rows.push({id:'r1',kind:'relation',type:s.relations[0],name:s.relations[0],from:'e2',to:'e1',props:{},confidence:94,evidence:[first],confirmed:false,manual:false});
    if (hasArticle || hasTable) rows.push({id:'r2',kind:'relation',type:s.relations[1],name:s.relations[1],from:'e2',to:'e3',props:{},confidence:86,evidence:evidence.filter(x=>x.source!=='doc'),confirmed:false,manual:false});
    rows = rows.filter(r=>r.kind==='relation' ? t.relations.includes(r.type) : t.types.includes(r.type));
    return rows.filter(r=>r.kind!=='relation'||rows.some(x=>x.id===r.from)&&rows.some(x=>x.id===r.to));
  }
  function seed() {
    const kind = projects[project].kind;
    const t = {id:'EX-018',name:kind==='quality'?'供应商质量知识抽取':'客户服务知识抽取',schema:kind,status:'待校正',inputs:sources(kind),types:clone(schemas[kind].types),relations:clone(schemas[kind].relations),instructions:'仅提取原文明确出现的实体、属性和关系，保留来源依据。',records:[],logs:[],messages:[],history:[],updated:'示例任务',runStage:-1};
    t.records=recordList(t);
    return [t];
  }
  function load() {
    cancelTimers(); task=null; step=0; query='';filter='all';notice='';
    try { const saved=JSON.parse(localStorage.getItem('knora:extraction:v1:'+project)||'null');tasks=Array.isArray(saved)?saved:seed(); } catch(e){tasks=seed();}
  }
  function save() {
    if(task) task.updated=stamp();
    try {localStorage.setItem('knora:extraction:v1:'+project,JSON.stringify(tasks));}catch(e){notice='浏览器未允许本地保存，当前修改仅保留在本次页面中。';}
  }
  function cancelTimers(){timers.forEach(clearTimeout);timers=[];}
  function log(text){task.logs.push({time:stamp(),text});save();}
  function status(t){if(t.status==='抽取中'||t.status==='草稿'||t.status==='已入库')return t.status;return t.records.filter(x=>!x.ignored&&!x.ingested).every(x=>x.confirmed&&issues(x,t).length===0)?'待入库':'待校正';}
  function record(id){return task.records.find(x=>x.id===id);}
  function issues(r,t=task){
    if(r.ignored||r.ingested)return [];
    const out=[],s=schemas[t.schema];
    if(!r.name.trim())out.push('名称不能为空');
    if(r.kind==='entity'){
      if(!s.types.includes(r.type))out.push('实体类型不在目标本体中');
      if(!r.props.编码?.trim())out.push('缺少必填属性“编码”');
      if(r.type===s.types[0]&&r.props[s.props[1]]&&! (t.schema==='quality'?['A','B','C']:['高','中','低']).includes(r.props[s.props[1]]))out.push(s.props[1]+'不在允许值中');
      if(r.decision==='pending')out.push('已有实体匹配尚未确认');
      if(r.existing&&r.decision==='new'&&r.props.编码===r.existing)out.push('编码已存在，请关联已有实体或修正编码');
      if(r.decision==='link'&&r.props.编码!==r.existing)out.push('候选编码与关联实体不一致，请重新确认对齐');
      if(r.duplicate&&r.decision!=='merge')out.push('重复候选尚未处理');
      if(r.conflict&&r.decision==='link'&&!r.resolution)out.push('与已有实体的属性冲突未决定');
    }else{
      if(!s.relations.includes(r.type))out.push('关系类型不在目标本体中');
      const a=t.records.find(x=>x.id===r.from),b=t.records.find(x=>x.id===r.to);
      if(!a||!b||a.ignored||b.ignored)out.push('关系端点缺失或已忽略');
      else if(a.type!==s.types[1]||b.type!==(r.type===s.relations[0]?s.types[0]:s.types[2]))out.push('关系端点类型不符合本体约束');
    }
    if(!r.evidence.length)out.push('缺少来源依据');
    return out;
  }
  function eligible(r){if(r.ignored||r.ingested||!r.confirmed||issues(r).length)return false;if(r.kind==='relation')return [record(r.from),record(r.to)].every(x=>x&&(x.ingested||eligible(x)));return true;}
  function label(r){return r.kind==='entity'?r.name:`${record(r.from)?.name||'未选择'} → ${record(r.to)?.name||'未选择'}`;}
  function header(){return `<div class="ex-header"><div><h1>非结构化处理</h1><p><b id="jinglunProjectName">${esc(projects[project].name)}</b> · ${esc(projects[project].path)}</p></div><div>${task?btn('← 任务列表','list')+btn('保存','save'):''}${btn('＋ 新建抽取任务','new')}</div></div><div class="ex-demo">交互原型 · 示例数据 · 抽取与入库为本地模拟${notice?`<span role="status">${esc(notice)}</span>`:''}</div>`;}
  function render(){root.innerHTML=`<div class="ex-app">${header()}${task?workbench():list()}</div>`;}
  function list(){
    return `<div class="ex-list-tools"><div class="searchbox"><input id="exTaskSearch" placeholder="搜索任务名称" value="${esc(query)}"></div><select id="exTaskStatus" class="select">${options(['全部状态','草稿','抽取中','待校正','待入库','已入库'],filter==='all'?'全部状态':filter)}</select><span>${tasks.length} 个任务</span></div><section class="ex-task-table"><div class="ex-task-row ex-th"><span>任务名称</span><span>输入内容</span><span>目标本体</span><span>状态</span><span>更新时间</span><span>操作</span></div>${tasks.filter(t=>(!query||t.name.includes(query))&&(filter==='all'||status(t)===filter)).map(t=>`<div class="ex-task-row"><span><b>${esc(t.name)}</b><small>${esc(t.id)} · ${dataTypeLabel(t)}</small></span><span>${t.inputs.map(x=>tag(x.kind)).join(' ')}<small>${t.inputs.length} 个来源</small></span><span>${schemas[t.schema]?.name || '待配置'}</span><span>${tag(status(t),status(t)==='已入库'?'green':'blue')}</span><span>${esc(t.updated)}</span><span>${btn(status(t)==='已入库'?'查看结果':'继续处理','open',`data-id="${t.id}"`)}</span></div>`).join('')||'<div class="ex-empty">暂无匹配任务，点击“新建抽取任务”开始。</div>'}</section>`;
  }
  function workbench(){
    const count=task.records.filter(x=>!x.ignored).length, confirmed=task.records.filter(x=>x.confirmed&&!x.ignored).length;
    return `<div class="ex-taskbar"><div><div class="ex-task-name"><b>${esc(task.name)}</b>${btn('修改名称','rename',task.status==='抽取中'?'disabled':'')}</div><small>${esc(task.id)} · ${dataTypeLabel(task)} · ${schemas[task.schema]?.name || '目标本体待配置'}</small></div>${tag(status(task),'blue')}<span>${task.inputs.length} 个来源 · ${count} 项候选 · ${confirmed} 项已确认</span><div>${btn(task.records.length?'重新抽取':'开始抽取','run',task.status==='抽取中'||task.status==='已入库'||configErrors(currentConfig()).length?'disabled':'')}${task.status==='抽取中'?btn('停止抽取','stop'):''}</div></div><div class="ex-workbench"><aside class="ex-config">${config()}</aside><section class="ex-agent">${agent()}</section><section class="ex-review"><header><h2>结果审核工作区</h2><span>确认内容后写入目标本体</span></header><nav class="ex-steps">${['结果校正','对齐与融合','质量检查','确认入库'].map((x,i)=>`<button class="${step===i?'active':''}" data-ex-action="step" data-step="${i}"><i>${i+1}</i>${x}</button>`).join('')}</nav><div class="ex-review-body">${review()}</div><footer class="ex-step-footer"><small>步骤 ${step+1} / 4</small>${btn('上一步','prev',step===0?'disabled':'')}${btn(step===3?'确认入库':'下一步','next',task.status==='抽取中'||step===3&&!task.records.some(eligible)?'disabled':'')}</footer></section></div>`;
  }
  function currentConfig(){return task.configDraft || task;}
  function configErrors(c){
    const errors=[];
    if(!schemas[c.schema])errors.push('选择目标本体');
    if(!c.inputs.length)errors.push('选择至少一个输入来源');
    if(c.inputs.some(x=>x.kind==='长文本字段'&&!fieldsFor(x).filter(isTextField).some(f=>f.name===x.field)))errors.push('选择数据表中的文本类型字段');
    if(!c.types.length)errors.push('选择至少一种实体类型');
    const schema=schemas[c.schema];
    if(schema&&c.relations.some(r=>!c.types.includes(schema.types[1])||!c.types.includes(r===schema.relations[0]?schema.types[0]:schema.types[2])))errors.push('补齐所选关系对应的起点和终点实体类型');
    return errors;
  }
  function configValues(c){return clone({schema:c.schema,inputs:c.inputs,types:c.types,relations:c.relations,instructions:c.instructions});}
  function updateConfig(update, redraw=true){
    if(task.status==='抽取中'||task.history.length)return;
    const c=task.records.length?(task.configDraft ||= configValues(task)):task;
    update(c);
    if(task.configDraft&&JSON.stringify(task.configDraft)===JSON.stringify(configValues(task)))delete task.configDraft;
    save();if(redraw)render();
  }
  function config(){
    const c=currentConfig(),schema=schemas[c.schema],locked=task.status==='抽取中'||task.history.length>0;
    const available=c.inputs;
    const missing=configErrors(c);
    return `<header><h2>输入与抽取配置</h2>${tag(locked?'只读':'可直接编辑','blue')}</header>
      <div class="ex-config-value">数据类型：${dataTypeLabel(task)}</div><h3>输入内容 <em>已选 ${c.inputs.length}</em></h3>
      <div class="ex-input-pick-actions">${task.dataType!=='longtext'?btn('＋ 从知识库选择内容','pick-knowledge',locked?'disabled':''):''}${task.dataType!=='document'?btn(c.inputs.some(x=>x.kind==='长文本字段')?'更换数据表':'＋ 从数据资产选择数据表','pick-table',locked?'disabled':''):''}</div>
      <div class="ex-inline-sources">${available.map(x=>`<article class="ex-inline-source selected"><div class="ex-selected-source"><span><b>${esc(x.name)}</b><small>${x.kind==='长文本字段'?'数据资产 · '+esc(x.assetSource||'业务数据资产'):'知识库 · '+esc(x.knowledgeBase||knowledgeCatalog().find(k=>k.items.some(i=>i.id===x.id))?.name||'项目知识库')}</small></span>${btn('移除','remove-source',`data-source="${x.id}" ${locked?'disabled':''}`)}</div><label class="ex-field">处理范围<select data-ex-range="${x.id}" ${locked?'disabled':''}>${options(x.kind==='长文本字段'?['全部记录','仅记录 018']:['全文','仅示例段落'],x.range)}</select></label>${x.kind==='长文本字段'?`<label class="ex-field">长文本字段<select data-ex-field="${x.id}" ${locked?'disabled':''}><option value="" ${!x.field?'selected':''}>请选择文本类型字段</option>${fieldsFor(x).filter(isTextField).map(f=>`<option value="${f.name}" ${x.field===f.name?'selected':''}>${esc(f.name)} · ${esc(f.type)}</option>`).join('')}</select></label><p class="ex-hint">仅显示文本类型字段，已过滤数值、日期等字段。</p>${!fieldsFor(x).some(isTextField)?'<p class="ex-warning">该数据表没有文本类型字段，请更换数据表。</p>':''}`:''}${btn('查看原文','config-source',`data-source="${x.id}" ${x.kind==='长文本字段'&&!x.field?'disabled':''}`)}</article>`).join('')||`<p class="ex-hint">${task.dataType==='longtext'?'先从数据资产选择数据表，再选择需要抽取的文本字段。':'从知识库选择需要处理的文档或文章。'}</p>`}</div>
      <label class="ex-field ex-schema-field">目标本体<select id="exSchema" ${locked?'disabled':''}><option value="" ${!c.schema?'selected':''}>请选择目标本体</option>${Object.entries(schemas).filter(([k])=>project==='personal'||k===projects[project].kind||k===c.schema).map(([k,x])=>`<option value="${k}" ${c.schema===k?'selected':''}>${x.name}</option>`).join('')}</select></label>
      <h3>抽取范围</h3>${schema?`<div class="ex-inline-scope"><small>实体类型</small>${schema.types.map(x=>`<label><input type="checkbox" data-ex-type="${x}" ${c.types.includes(x)?'checked':''} ${locked?'disabled':''}>${x}</label>`).join('')}<small>关系类型</small>${schema.relations.map(x=>`<label><input type="checkbox" data-ex-rel="${x}" ${c.relations.includes(x)?'checked':''} ${locked?'disabled':''}>${x}</label>`).join('')}</div>`:'<p class="ex-hint">选择目标本体后，可设置实体类型和关系范围。</p>'}
      <label class="ex-field">补充要求<textarea id="exInstructions" placeholder="填写业务要求，例如只抽取原文明确出现的内容…" ${locked?'disabled':''}>${esc(c.instructions)}</textarea></label>
      ${task.configDraft?`<div class="ex-config-pending"><p>配置已修改，当前结果仍对应上一次抽取。应用后重新抽取，旧结果保留为快照。</p>${btn('应用配置并重新抽取','apply-inline-config',missing.length?'disabled':'')}${btn('撤销配置修改','discard-config')}</div>`:''}
      ${missing.length?`<p class="ex-config-requirements">还需：${missing.map(esc).join('；')}。</p>`:'<p class="ex-config-ready">✓ 配置完整，可以开始抽取。</p>'}
      <div class="ex-config-actions">${btn('保存为模板','template',!schema||!c.types.length?'disabled':'')}${btn('使用模板','use-template',locked||task.records.length?'disabled':'')}</div>
      <p class="ex-hint">草稿和配置自动保存。${locked?'已有入库记录或正在抽取时，配置保持只读。':'结果保留来源位置，可在审核时逐项对照原文。'}</p>`;
  }
  function agent(){
    const names=['解析输入','按本体抽取','检查结果','匹配已有实体'];
    return `<header><h2>抽取 Agent</h2>${tag(task.status==='抽取中'?'处理中':'辅助校正','blue')}</header><div class="ex-agent-scroll"><div class="ex-agent-message user"><small>抽取要求</small><p>${esc(task.instructions)||'按照目标本体抽取实体、属性和关系。'}</p></div><div class="ex-stage-list">${names.map((x,i)=>`<div class="${task.status==='抽取中'&&i===task.runStage?'running':task.records.length||i<task.runStage?'done':''}"><i>${task.records.length||i<task.runStage?'✓':i+1}</i><span>${x}<small>${task.status==='抽取中'&&i===task.runStage?'正在处理':task.records.length?'已完成':'等待执行'}</small></span></div>`).join('')}</div>${task.records.length?`<div class="ex-agent-message"><b>抽取结果已生成</b><p>${task.records.filter(x=>x.kind==='entity').length} 个实体、${task.records.filter(x=>x.kind==='relation').length} 条关系。请检查原文依据，并处理必填属性、重复候选和已有实体匹配。</p></div>`:''}${task.messages.map(m=>`<div class="ex-agent-message ${m.role==='user'?'user':''}"><small>${m.role==='user'?'你':'Agent'}</small><p>${esc(m.text)}</p>${m.proposal&&!m.applied?btn('预览修改建议','suggestion'):m.applied?tag('已应用','green'):''}</div>`).join('')}${task.snapshots?.length?`<details class="ex-log"><summary>重抽前结果快照（${task.snapshots.length}）</summary>${task.snapshots.map((x,i)=>btn(esc(x.time)+' · '+x.records.length+' 项','snapshot',`data-index="${i}"`)).join('')}</details>`:''}${task.logs.length?`<details class="ex-log"><summary>处理与修改记录（${task.logs.length}）</summary>${task.logs.slice(-12).map(x=>`<p><small>${esc(x.time)}</small>${esc(x.text)}</p>`).join('')}</details>`:''}</div><div class="ex-agent-input"><textarea id="exAgentText" placeholder="补充要求，或询问某项结果的依据…"></textarea>${btn('发送','send')}</div>`;
  }
  function review(){if(task.status==='抽取中')return '<div class="ex-empty"><i>抽</i><h3>正在生成候选结果</h3><p>可在中间查看处理阶段，完成后继续审核校正。</p></div>';if(!task.records.length)return `<div class="ex-empty"><i>抽</i><h3>${task.status==='抽取中'?'正在生成候选结果':'配置输入后开始抽取'}</h3><p>${task.status==='抽取中'?'可在中间查看处理阶段。':'先选择输入内容、目标本体与抽取范围。'}</p></div>`;return [results,fusion,quality,ingest][step]();}
  function results(){
    let rows=task.records.filter(r=>r.kind===tab&&(!query||(r.name+' '+label(r)+' '+r.type).includes(query))&&(filter==='all'||filter==='unconfirmed'&&!r.confirmed&&!r.ignored||filter==='issue'&&issues(r).length||filter==='ignored'&&r.ignored));
    return `<div class="ex-result-tools"><div class="ex-segment">${['entity','relation'].map(k=>`<button class="${tab===k?'active':''}" data-ex-action="tab" data-tab="${k}">${k==='entity'?'实体与属性':'关系'} ${task.records.filter(x=>x.kind===k).length}</button>`).join('')}</div><div class="ex-segment">${btn('列表','mode','data-mode="list"')}${btn('图谱','mode','data-mode="graph"')}</div></div><div class="ex-filters"><input id="exResultSearch" placeholder="搜索名称、类型" value="${esc(query)}"><select id="exResultFilter">${[['all','全部结果'],['unconfirmed','未确认'],['issue','存在问题'],['ignored','已忽略']].map(x=>`<option value="${x[0]}" ${filter===x[0]?'selected':''}>${x[1]}</option>`).join('')}</select>${btn('确认可用结果','confirm-valid')}</div>${mode==='graph'?graph():`<div class="ex-result-list">${rows.map(r=>`<article class="ex-result ${r.ignored?'ignored':''}"><div class="ex-result-title"><button data-ex-action="edit" data-id="${r.id}"><b>${esc(label(r))}</b><small>${esc(r.type)} · ${r.id}</small></button>${tag(r.ingested?'已入库':r.ignored?'已忽略':r.confirmed?'已确认':'未确认',r.confirmed?'green':'')}</div><div class="ex-result-properties">${Object.entries(r.props).map(([k,v])=>`<span>${esc(k)}：<b>${esc(v)||'待补充'}</b></span>`).join('')}${tag(r.confidence+'%','blue')}</div>${issues(r).length?`<p class="ex-warning">${esc(issues(r).join('；'))}</p>`:''}<footer>${r.evidence.map((e,i)=>`<button data-ex-action="evidence" data-id="${r.id}" data-index="${i}">${esc(task.inputs.find(x=>x.id===e.source)?.name||'人工证据')} · ${esc(e.where)}</button>`).join('')}${btn('编辑','edit',`data-id="${r.id}"`)}${btn(r.confirmed?'撤销确认':'确认','confirm',`data-id="${r.id}" ${r.ignored||r.ingested?'disabled':''}`)}</footer></article>`).join('')||'<div class="ex-empty">没有匹配的结果</div>'}</div>`}<div class="ex-add">${btn('＋ 补充实体','add',`data-kind="entity" ${task.status==='已入库'?'disabled':''}`)}${btn('＋ 补充关系','add',`data-kind="relation" ${task.status==='已入库'?'disabled':''}`)}</div>`;
  }
  function graph(){
    const nodes=task.records.filter(x=>x.kind==='entity'&&!x.ignored),coords={};nodes.forEach((n,i)=>coords[n.id]=[90+(i%2)*270,75+Math.floor(i/2)*140]);
    const edges=task.records.filter(x=>x.kind==='relation'&&!x.ignored&&coords[x.from]&&coords[x.to]);
    return `<div class="ex-graph"><svg viewBox="0 0 470 350" role="img" aria-label="抽取实体与关系图"><defs><marker id="exArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8" fill="#8aa9d2"/></marker></defs>${edges.map(r=>{const a=coords[r.from],b=coords[r.to];return `<g data-ex-action="edit" data-id="${r.id}" tabindex="0" role="button" aria-label="编辑关系 ${esc(r.type)}"><line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#8aa9d2" stroke-width="2" marker-end="url(#exArrow)"/><text x="${(a[0]+b[0])/2}" y="${(a[1]+b[1])/2-8}" text-anchor="middle">${esc(r.type)}</text></g>`}).join('')}${nodes.map(n=>`<g data-ex-action="edit" data-id="${n.id}" tabindex="0" role="button" aria-label="编辑实体 ${esc(n.name)}"><rect x="${coords[n.id][0]-76}" y="${coords[n.id][1]-26}" width="152" height="52" rx="7" fill="${n.confirmed?'#eaf8f2':'#edf5ff'}" stroke="${n.confirmed?'#8bceb4':'#adc8f1'}"/><text x="${coords[n.id][0]}" y="${coords[n.id][1]-3}" text-anchor="middle">${esc(n.name)}</text><text x="${coords[n.id][0]}" y="${coords[n.id][1]+15}" text-anchor="middle" class="ex-graph-type">${esc(n.type)}</text></g>`).join('')}</svg><small>点击实体或关系进行编辑，列表与图谱同步更新。</small></div>`;
  }
  function fusion(){
    return `<p class="ex-section-note">确定候选对应新实体还是已有实体，并逐项决定属性写入方式。</p>${task.records.filter(x=>x.kind==='entity'&&!x.ignored).map(r=>`<article class="ex-fusion"><header><b>${esc(r.name)}</b>${tag(r.ingested?'已入库':r.decision==='link'?'关联已有':r.decision==='merge'?'已合并':r.decision==='pending'?'待对齐':'新建实体','blue')}</header>${r.existing?`<div class="ex-match"><small>已有实体候选 · 按编码及名称匹配</small><b>${esc(selectedSchema().existing)}</b><span>${esc(r.existing)} · ${selectedSchema().props[1]}：${selectedSchema().oldValue}</span></div>${btn('关联已有实体','link',`data-id="${r.id}" ${r.ingested?'disabled':''}`)} ${btn('创建新实体','unlink',`data-id="${r.id}" ${r.ingested?'disabled':''}`)}${r.decision==='link'?`<div class="ex-conflict"><b>${selectedSchema().props[1]}不一致</b><p>已有值 ${selectedSchema().oldValue} → 抽取值 ${esc(r.props[selectedSchema().props[1]])}</p><select data-ex-resolution="${r.id}" ${r.ingested?'disabled':''}>${options(['请选择处理方式','保留已有值，仅附加证据','使用抽取值更新属性'],r.resolution||'请选择处理方式')}</select></div>`:''}`:r.duplicate?`<p>与“${esc(record(r.duplicate)?.name)}”编码相同，建议合并候选并汇集来源。</p>${btn('合并至主实体','merge',`data-id="${r.id}"`)}`:'<p>未找到相同编码的已有实体，当前选择新建。</p>'}${r.ingested?'':btn('忽略','ignore',`data-id="${r.id}"`)}</article>`).join('')}`;
  }
  function quality(){
    const pending=task.records.filter(x=>!x.ignored&&!x.ingested),bad=pending.filter(x=>issues(x).length),unconfirmed=pending.filter(x=>!x.confirmed);
    return `<div class="ex-quality-summary"><div><b>${pending.length}</b><span>待入库结果</span></div><div><b>${bad.length}</b><span>存在问题</span></div><div><b>${unconfirmed.length}</b><span>尚未确认</span></div><div><b>${pending.filter(eligible).length}</b><span>可入库</span></div></div><p class="ex-section-note">检查必填属性、属性值、本体类型、关系端点、重复候选和来源依据。</p>${pending.filter(x=>issues(x).length||!x.confirmed).map(r=>`<article class="ex-quality-item"><div><b>${esc(label(r))}</b><small>${esc(issues(r).join('；')||'检查通过，尚未人工确认')}</small></div>${btn('去修正','edit',`data-id="${r.id}"`)}</article>`).join('')||'<div class="ex-success">✓ 当前结果已完成确认并通过质量检查。</div>'}${btn('确认可用结果','confirm-valid')}`;
  }
  function operation(r){if(r.kind==='relation')return '新增关系';if(r.decision==='link')return r.resolution==='使用抽取值更新属性'?'更新已有属性':'关联已有实体并附加证据';return '新增实体';}
  function ingest(){
    const ready=task.records.filter(eligible),blocked=task.records.filter(r=>!r.ignored&&!r.ingested&&!eligible(r));
    return `<div class="ex-target"><small>入库目标</small><b>${schemas[task.schema].name}</b><span>当前项目：${esc(projects[project].name)}</span></div><div class="ex-ingest-summary">${tag(ready.filter(x=>x.kind==='entity'&&x.decision!=='link').length+' 个新增实体','blue')}${tag(ready.filter(x=>x.kind==='entity'&&x.decision==='link').length+' 个已有实体处理','blue')}${tag(ready.filter(x=>x.kind==='relation').length+' 条新增关系','blue')}</div><h3>本次写入预览</h3>${ready.map(r=>`<article class="ex-write-row"><span><b>${esc(label(r))}</b><small>${esc(r.type)} · ${esc(operation(r))}</small></span><span>${r.kind==='entity'?Object.entries(r.props).map(([k,v])=>`${esc(k)}：${r.decision==='link'&&k===selectedSchema().props[1]&&r.resolution==='保留已有值，仅附加证据'?selectedSchema().oldValue:esc(v)}`).join('<br>'):'两端实体已确认'}</span></article>`).join('')||'<p class="ex-hint">暂无可写入内容，请先完成结果校正与确认。</p>'}${blocked.length?`<div class="ex-warning ex-blocked"><b>${blocked.length} 项暂不入库</b>${blocked.map(r=>`<p>${esc(label(r))}：${esc(issues(r).join('；')||(!r.confirmed?'未人工确认':'关系端点尚未通过检查或确认'))}</p>`).join('')}</div>`:''}<p class="ex-hint">仅写入已确认且检查通过的结果。暂不入库项保留在任务中，可修正后继续提交。</p><label class="ex-field">知识更新说明<textarea id="exIngestNote" placeholder="填写本次更新说明">${esc(task.ingestNote||'')}</textarea></label>${task.history.length?`<h3>入库记录</h3>${task.history.map(h=>`<article class="ex-history"><b>${esc(h.time)} · 模拟入库成功 ${h.ids.length} 项</b><p>${esc(h.note)||'未填写更新说明'}</p>${h.ids.map(id=>`<button data-ex-action="edit" data-id="${id}">${esc(label(record(id)))} · ${esc(record(id).targetId)}</button>`).join('')}</article>`).join('')}`:''}`;
  }
  function modal(title,body,action,label='确认',wide=false){
    closeOverlay();
    const overlay=document.createElement('div');overlay.className='ex-overlay';overlay.innerHTML=`<section class="ex-dialog ${wide?'wide':''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header><h2>${esc(title)}</h2>${btn('×','close')}</header><div class="ex-dialog-body">${body}<p id="exDialogError" role="alert"></p></div><footer>${btn('取消','close')}${action?btn(label,action):''}</footer></section>`;document.body.appendChild(overlay);overlay.querySelector('input,select,textarea,button')?.focus();
  }
  function closeOverlay(){document.querySelectorAll('.ex-overlay').forEach(x=>x.remove());drawerRecord=null;}
  function error(text){const el=document.getElementById('exDialogError');if(el)el.textContent=text;}
  function newTask(){
    modal('新建抽取任务','<label class="ex-field">任务名称<input id="exName" placeholder="请输入任务名称" maxlength="100"></label><label class="ex-field">数据类型<select id="exDataType"><option value="document">非结构化文档</option><option value="longtext">长文本字段</option></select></label>','create','创建并进入');
    document.getElementById('exName').focus();
  }
  function edit(id,newKind){
    const s=selectedSchema();let r=id?record(id):{id:(newKind==='entity'?'e':'r')+Date.now(),kind:newKind,type:newKind==='entity'?s.types[0]:s.relations[0],name:'',props:{编码:''},evidence:[],confirmed:false,confidence:0,decision:'new',manual:true};
    modal(id?'编辑'+(r.kind==='entity'?'实体与属性':'关系'):'补充'+(r.kind==='entity'?'实体':'关系'),`<div class="ex-edit-layout"><div><label class="ex-field">${r.kind==='entity'?'实体':'关系'}类型<select id="exRecordType" ${r.ingested?'disabled':''}>${options(r.kind==='entity'?s.types:s.relations,r.type)}</select></label>${r.kind==='entity'?`<label class="ex-field">实体名称<input id="exRecordName" value="${esc(r.name)}" ${r.ingested?'disabled':''}></label><label class="ex-field">编码（必填）<input id="exRecordCode" value="${esc(r.props.编码)}" ${r.ingested?'disabled':''}></label><label class="ex-field">${s.props[1]}<select id="exRecordGrade" ${r.ingested?'disabled':''}>${options(['',...(task.schema==='quality'?['A','B','C']:['高','中','低'])],r.props[s.props[1]]||'')}</select></label>`:`<label class="ex-field">起点实体<select id="exRecordFrom" ${r.ingested?'disabled':''}>${entityOptions(r.from)}</select></label><label class="ex-field">终点实体<select id="exRecordTo" ${r.ingested?'disabled':''}>${entityOptions(r.to)}</select></label>`}<label class="ex-field">来源依据<select id="exRecordSource" ${r.ingested?'disabled':''}>${task.inputs.map(x=>`<option value="${x.id}" ${r.evidence[0]?.source===x.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select></label><label class="ex-field">原文位置<input id="exRecordWhere" value="${esc(r.evidence[0]?.where||task.inputs[0]?.where)}" ${r.ingested?'disabled':''}></label><label class="ex-field">原文片段<textarea id="exRecordEvidence" ${r.ingested?'disabled':''}>${esc(r.evidence[0]?.text||task.inputs[0]?.text)}</textarea></label>${id&&!r.ingested?btn(r.ignored?'恢复结果':'删除 / 忽略结果','ignore',`data-id="${r.id}"`):''}</div><aside><h3>原文对照</h3>${r.evidence.length?r.evidence.map(e=>`<article><b>${esc(task.inputs.find(x=>x.id===e.source)?.name)}</b><small>${esc(e.where)}</small><blockquote>${esc(e.text)}</blockquote></article>`).join(''):'<p>补充结果时请填写原文依据。</p>'}${r.ingested?`<p>${tag('已入库','green')}<br>目标标识：${esc(r.targetId)}</p>`:''}${issues(r).length?`<p class="ex-warning">${esc(issues(r).join('；'))}</p>`:''}</aside></div>`,'apply-edit','保存修改',true);
    drawerRecord={r:clone(r),isNew:!id};if(r.ingested)document.querySelector('[data-ex-action="apply-edit"]').disabled=true;
  }
  function entityOptions(value){return '<option value="">请选择实体</option>'+task.records.filter(x=>x.kind==='entity'&&!x.ignored).map(x=>`<option value="${x.id}" ${value===x.id?'selected':''}>${esc(x.name)} · ${esc(x.type)}</option>`).join('');}
  function applyEdit(){
    const r=drawerRecord.r;r.type=document.getElementById('exRecordType').value;
    if(r.kind==='entity'){r.name=document.getElementById('exRecordName').value.trim();r.props={编码:document.getElementById('exRecordCode').value.trim()};const grade=document.getElementById('exRecordGrade').value;if(grade)r.props[selectedSchema().props[1]]=grade;if(!r.name){error('请填写实体名称。');return;}}
    else{r.from=document.getElementById('exRecordFrom').value;r.to=document.getElementById('exRecordTo').value;r.name=r.type;if(!r.from||!r.to){error('请选择关系两端实体。');return;}}
    const text=document.getElementById('exRecordEvidence').value.trim(),where=document.getElementById('exRecordWhere').value.trim(),source=document.getElementById('exRecordSource').value;
    if(!text||!where){error('请保留原文片段和位置，便于审核溯源。');return;}
    r.evidence=[{source,where,text},...r.evidence.slice(1)];r.confirmed=false;r.manual=true;
    if(drawerRecord.isNew)task.records.push(r);else Object.assign(record(r.id),r);
    log('人工编辑：'+r.name+'；确认状态已重置');closeOverlay();render();
  }
  function source(id,r,index=0){
    const e=r?.evidence[index],input=task.inputs.find(x=>x.id===(e?e.source:id));
    modal('原文溯源',`<div class="ex-source-preview"><h3>${esc(input?.name)}</h3><p>${esc(e?.where||input?.where)}</p>${r?`<p>抽取结果：${esc(label(r))} · ${esc(r.type)}</p>`:''}<blockquote><mark>${esc(e?.text||input?.text)}</mark></blockquote><small>${input?.kind==='长文本字段'?`数据表 ${esc(input.name)} · ${esc(input.range)} · 字段 ${esc(input.field)}`:'项目已选资源 · 示例原文'}</small></div>`,r&&!r.ingested?'source-edit':null,'编辑此结果');if(r)drawerRecord={r};
  }
  function run(modeName){
    const missing=configErrors(task);if(missing.length){notice='还需：'+missing.join('；');render();return;}
    cancelTimers();const running=task,activeProject=project;task.status='抽取中';task.runStage=0;save();render();
    for(let i=1;i<=4;i++)timers.push(setTimeout(()=>{if(task!==running||project!==activeProject||running.status!=='抽取中')return;if(i<4){running.runStage=i;save();render();return;}const generated=recordList(running);running.records=modeName==='unchecked'?generated.map(r=>{const old=running.records.find(x=>x.id===r.id);return old&&(old.manual||old.confirmed)?old:r;}).concat(running.records.filter(x=>x.manual&&!generated.some(y=>y.id===x.id))):generated;running.status='待校正';running.runStage=4;log('模拟抽取完成：'+running.records.length+' 项候选'+(modeName==='unchecked'?'，保留人工校正与已确认结果':''));render();},i*500));
  }
  function commit(){
    const ready=task.records.filter(eligible);if(!ready.length){notice='没有通过检查且已确认的结果。';render();return;}
    const note=document.getElementById('exIngestNote')?.value.trim()||'';task.ingestNote=note;
    modal('确认写入本体',`<p>将向“${schemas[task.schema].name}”写入 ${ready.length} 项已确认结果。</p><p>当前项目：${esc(projects[project].name)}</p><ul>${ready.map(r=>`<li>${esc(operation(r))}：${esc(label(r))}</li>`).join('')}</ul><p class="ex-hint">本次为交互原型模拟，不连接真实本体服务。</p>`,'commit','确认入库');
  }
  const actions={
    snapshot:el=>{const x=task.snapshots[Number(el.dataset.index)];modal('重抽前结果快照',`<p>${esc(x.time)} · ${schemas[x.schema].name}</p>${x.records.map(r=>`<article class="ex-quality-item"><div><b>${esc(r.name)}</b><small>${esc(r.type)} · ${r.manual?'人工修改':'抽取结果'} · ${r.confirmed?'已确认':'未确认'}</small><p>${Object.entries(r.props).map(([k,v])=>esc(k)+'：'+esc(v)).join('；')}</p>${r.evidence.map(e=>`<small>${esc(e.where)}：${esc(e.text)}</small>`).join('')}</div></article>`).join('')}`,null);},
    new:newTask,open:el=>{task=tasks.find(x=>x.id===el.dataset.id);if(task.status==='抽取中')task.status=task.records.length?'待校正':'草稿';step=task.status==='已入库'?3:0;query='';filter='all';render();},
    list:()=>{cancelTimers();if(task.status==='抽取中'){task.status=task.records.length?'待校正':'草稿';save();}task=null;query='';filter='all';render();},
    save:()=>{save();notice='任务已保存到当前浏览器。';render();},close:closeOverlay,
    create:()=>{const name=document.getElementById('exName').value.trim();if(!name){error('请填写任务名称。');return;}const dataType=document.getElementById('exDataType').value;if(!dataTypes[dataType]){error('请选择数据类型。');return;}task={name,dataType,schema:'',inputs:[],types:[],relations:[],instructions:'',id:'EX-'+Date.now(),status:'草稿',records:[],logs:[],messages:[],history:[],runStage:-1};tasks.unshift(task);step=0;tab='entity';mode='list';query='';filter='all';notice='';save();closeOverlay();render();},
    rename:()=>{modal('修改任务名称',`<label class="ex-field">任务名称<input id="exRename" maxlength="100" value="${esc(task.name)}"></label>`,'apply-name','保存名称');document.getElementById('exRename').focus();},
    'apply-name':()=>{const name=document.getElementById('exRename').value.trim();if(!name){error('请填写任务名称。');return;}task.name=name;log('修改任务名称：'+name);closeOverlay();render();},
    'pick-knowledge':()=>{const kbId=currentConfig().inputs.find(x=>x.knowledgeBaseId)?.knowledgeBaseId;modal('从知识库选择输入内容',knowledgePickerBody(kbId),'apply-knowledge','添加所选内容');},
    'apply-knowledge':()=>{const kb=knowledgeCatalog().find(x=>x.id===document.getElementById('exKnowledgeBase').value),ids=[...document.querySelectorAll('[data-ex-kb-item]:checked')].map(x=>x.dataset.exKbItem);if(!ids.length){error('请至少选择一项知识库内容。');return;}updateConfig(c=>{const selected=kb.items.filter(x=>ids.includes(x.id)).map(x=>Object.assign(clone(x),{knowledgeBaseId:kb.id,knowledgeBase:kb.name}));c.inputs=c.inputs.filter(x=>!kb.items.some(i=>i.id===x.id)).concat(selected);});closeOverlay();},
    'pick-table':()=>{const selected=currentConfig().inputs.find(x=>x.kind==='长文本字段');modal('从数据资产选择数据表',tablePickerBody(selected?.assetId||''),'apply-table','选择数据表',true);},
    'apply-table':()=>{const table=assetCatalog().find(x=>x.id===document.getElementById('exAssetTable').value);if(!table){error('请选择数据表。');return;}updateConfig(c=>{const existing=c.inputs.find(x=>x.kind==='长文本字段'),same=existing?.assetId===table.id;const input=Object.assign(sources(projects[project].kind).find(x=>x.id==='table'),{name:table.name,assetId:table.id,assetSource:table.source,field:same?existing.field:'',where:same?existing.where:'记录 018 · 待选择字段',range:same?existing.range:'全部记录'});c.inputs=c.inputs.filter(x=>x.kind!=='长文本字段').concat(input);});closeOverlay();},
    'remove-source':el=>{updateConfig(c=>{c.inputs=c.inputs.filter(x=>x.id!==el.dataset.source);});},
    'config-source':el=>{const input=currentConfig().inputs.find(x=>x.id===el.dataset.source);modal('输入原文',`<div class="ex-source-preview"><h3>${esc(input.name)}</h3><p>${esc(input.where)}</p><blockquote>${esc(input.text)}</blockquote><small>${esc(input.kind)} · ${esc(input.range)}${input.field?' · 字段 '+esc(input.field):''}</small></div>`,null);},
    'apply-inline-config':()=>{if(configErrors(currentConfig()).length)return;modal('应用配置并重新抽取','<p>将使用左侧的新配置重新生成结果。当前结果及人工修改保留为快照，可在处理记录中查看。</p>','replace-config','应用并重新抽取');},
    'discard-config':()=>{delete task.configDraft;save();render();},
    'replace-config':()=>{task.snapshots=task.snapshots||[];task.snapshots.push({time:stamp(),records:clone(task.records),schema:task.schema});Object.assign(task,task.configDraft);delete task.configDraft;task.records=[];closeOverlay();run('all');},
    run:()=>{if(task.configDraft){actions['apply-inline-config']();return;}if(task.records.length)modal('重新抽取','<p>默认保留人工校正和已确认结果，只更新其余候选。</p><label class="ex-field">更新范围<select id="exRerunMode"><option value="unchecked">仅更新未校正、未确认结果</option><option value="all">重新生成全部结果（保留旧结果快照）</option></select></label>','rerun','开始重新抽取');else run('all');},
    rerun:()=>{const m=document.getElementById('exRerunMode').value;if(m==='all'){task.snapshots=task.snapshots||[];task.snapshots.push({time:stamp(),records:clone(task.records),schema:task.schema});}closeOverlay();run(m);},
    stop:()=>{cancelTimers();task.status=task.records.length?'待校正':'草稿';log('人工停止抽取');render();},
    step:el=>{step=Number(el.dataset.step);query='';filter='all';render();},prev:()=>{step=Math.max(0,step-1);render();},next:()=>{if(step<3){step++;query='';filter='all';render();}else commit();},
    tab:el=>{tab=el.dataset.tab;query='';filter='all';render();},mode:el=>{mode=el.dataset.mode;render();},
    edit:el=>edit(el.dataset.id),add:el=>edit(null,el.dataset.kind),'apply-edit':applyEdit,
    source:el=>source(el.dataset.source),evidence:el=>source(null,record(el.dataset.id),Number(el.dataset.index)),
    'source-edit':()=>edit(drawerRecord.r.id),
    confirm:el=>{const r=record(el.dataset.id);if(!r.confirmed&&issues(r).length){notice='该结果仍有问题，请先编辑或处理融合。';render();return;}r.confirmed=!r.confirmed;log((r.confirmed?'确认':'撤销确认')+'：'+r.name);render();},
    'confirm-valid':()=>{let count=0;task.records.forEach(r=>{if(!r.ignored&&!r.ingested&&!r.confirmed&&!issues(r).length){r.confirmed=true;count++;}});log('批量确认 '+count+' 项检查通过的结果');notice='已确认 '+count+' 项，存在问题的结果需继续处理。';render();},
    ignore:el=>{const r=record(el.dataset.id);if(r.ingested)return;r.ignored=!r.ignored;r.confirmed=false;r.manual=true;log((r.ignored?'忽略':'恢复')+'：'+r.name);closeOverlay();render();},
    link:el=>{const r=record(el.dataset.id);r.decision='link';r.conflict=true;r.confirmed=false;r.manual=true;log('关联已有实体：'+r.name);render();},
    unlink:el=>{const r=record(el.dataset.id);r.decision='new';r.confirmed=false;r.manual=true;log('选择新建实体：'+r.name);render();},
    merge:el=>{const r=record(el.dataset.id),target=record(r.duplicate);target.evidence=target.evidence.concat(r.evidence.filter(e=>!target.evidence.some(x=>x.source===e.source&&x.where===e.where)));target.manual=true;target.confirmed=false;r.ignored=true;r.decision='merge';r.manual=true;task.records.forEach(x=>{if(x.from===r.id){x.from=target.id;x.confirmed=false;}if(x.to===r.id){x.to=target.id;x.confirmed=false;}});log('合并 '+r.name+' 至 '+target.name+' 并汇集来源');render();},
    send:()=>{const text=document.getElementById('exAgentText').value.trim();if(!text)return;task.messages.push({role:'user',text});if(/依据|原文|来源/.test(text)){task.messages.push({role:'agent',text:task.records.length?'每项结果均可通过“来源”打开原文对照。当前有 '+task.records.filter(x=>issues(x).length).length+' 项需要继续处理。':'请先执行抽取，生成候选后可逐项查看来源。'});}else{task.messages.push({role:'agent',text:'建议将这条要求加入抽取配置。应用后可重新抽取未校正结果，已确认及人工修改的内容予以保留。',proposal:text});}log('记录补充要求：'+text);render();},
    suggestion:()=>{const m=[...task.messages].reverse().find(x=>x.proposal&&!x.applied);modal('预览修改建议',`<p>修改对象：抽取配置中的“补充要求”。</p><blockquote>${esc(m.proposal)}</blockquote><p>应用后仅保存要求。你可以点击“重新抽取”更新候选结果。</p>`,'apply-suggestion','确认应用');},
    'apply-suggestion':()=>{const m=[...task.messages].reverse().find(x=>x.proposal&&!x.applied);task.instructions+=(task.instructions?'\n':'')+m.proposal;m.applied=true;log('应用 Agent 建议至补充要求');closeOverlay();render();},
    template:()=>{const c=currentConfig();try{localStorage.setItem('knora:extraction:template:'+project,JSON.stringify({schema:c.schema,types:c.types,relations:c.relations,instructions:c.instructions}));notice='已保存当前项目的抽取模板。';}catch(e){notice='当前浏览器不支持保存模板。';}render();},
    'use-template':()=>{let t;try{t=JSON.parse(localStorage.getItem('knora:extraction:template:'+project)||'null');}catch(e){}if(!t){notice='当前项目尚无模板，请先保存一份配置。';render();return;}Object.assign(task,t);log('使用当前项目抽取模板');render();},
    commit:()=>{const ready=task.records.filter(eligible),ids=ready.map(r=>r.id);ready.forEach(r=>{r.ingested=true;r.targetId=r.decision==='link'?r.existing:(r.kind==='entity'?'ENT-':'REL-')+project.toUpperCase()+'-'+r.id;});task.history.push({time:stamp(),ids,note:task.ingestNote});task.status=task.records.some(x=>!x.ignored&&!x.ingested)?'待校正':'已入库';log('模拟入库成功 '+ids.length+' 项');notice='模拟入库完成，可查看写入结果及来源记录。';closeOverlay();render();}
  };
  document.addEventListener('click',e=>{const el=e.target.closest('[data-ex-action]');if(el&&!el.disabled){e.preventDefault();actions[el.dataset.exAction]?.(el);}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeOverlay();if(e.key==='Enter'&&e.target.matches('g[data-ex-action]'))actions.edit(e.target);});
  document.addEventListener('change',e=>{
    if(e.target.id==='exSchema'){const schema=e.target.value;updateConfig(c=>{c.schema=schema;c.types=schema?clone(schemas[schema].types):[];c.relations=schema?clone(schemas[schema].relations):[];});}
    if(e.target.id==='exKnowledgeBase'){const id=e.target.value;document.querySelector('.ex-dialog-body').innerHTML=knowledgePickerBody(id)+'<p id="exDialogError" role="alert"></p>';}
    if(e.target.id==='exAssetTable'){const table=assetCatalog().find(x=>x.id===e.target.value);document.getElementById('exAssetFields').innerHTML=table?tableFieldPreview(table):'<p class="ex-hint">请选择数据表。</p>';}
    if(e.target.dataset.exRange){const id=e.target.dataset.exRange,value=e.target.value;updateConfig(c=>{c.inputs.find(x=>x.id===id).range=value;});}
    if(e.target.dataset.exField){const id=e.target.dataset.exField,value=e.target.value;updateConfig(c=>{const x=c.inputs.find(x=>x.id===id);const field=fieldsFor(x).filter(isTextField).find(f=>f.name===value);x.field=field?value:'';x.fieldType=field?.type||'';x.where='记录 018 · '+(x.field||'待选择字段');});}
    if(e.target.dataset.exType){const type=e.target.dataset.exType,checked=e.target.checked;updateConfig(c=>{c.types=checked?[...new Set(c.types.concat(type))]:c.types.filter(x=>x!==type);const schema=schemas[c.schema];if(!checked)c.relations=c.relations.filter(r=>c.types.includes(schema.types[1])&&c.types.includes(r===schema.relations[0]?schema.types[0]:schema.types[2]));});}
    if(e.target.dataset.exRel){const rel=e.target.dataset.exRel,checked=e.target.checked;updateConfig(c=>{c.relations=checked?[...new Set(c.relations.concat(rel))]:c.relations.filter(x=>x!==rel);});}
    if(e.target.id==='exTaskStatus'){filter=e.target.value==='全部状态'?'all':e.target.value;render();}
    if(e.target.id==='exResultFilter'){filter=e.target.value;render();}
    if(e.target.dataset.exResolution){const r=record(e.target.dataset.exResolution);r.resolution=e.target.value==='请选择处理方式'?'':e.target.value;r.confirmed=false;r.manual=true;log('属性冲突决策：'+r.name+' '+r.resolution);render();}
  });
  document.addEventListener('input',e=>{if(e.target.id==='exInstructions'){const value=e.target.value;updateConfig(c=>{c.instructions=value;},false);if(task.configDraft&&!document.querySelector('.ex-config-pending')){const field=e.target.closest('.ex-field'),hint=document.createElement('div');hint.className='ex-config-pending';hint.innerHTML='<p>补充要求已修改，应用后重新抽取。</p>'+btn('应用配置并重新抽取','apply-inline-config',configErrors(currentConfig()).length?'disabled':'')+btn('撤销配置修改','discard-config');field.after(hint);}}if(e.target.id==='exIngestNote'){task.ingestNote=e.target.value;save();}if(e.target.id==='exTaskSearch'||e.target.id==='exResultSearch'){const id=e.target.id,start=e.target.selectionStart;query=e.target.value;render();const input=document.getElementById(id);input.focus();input.setSelectionRange(start,start);}});
  document.getElementById('globalProjectList')?.addEventListener('click',e=>{const row=e.target.closest('[data-project-key]');if(!row||!projects[row.dataset.projectKey])return;if(task?.status==='抽取中'){cancelTimers();task.status=task.records.length?'待校正':'草稿';save();}project=row.dataset.projectKey;closeOverlay();load();document.querySelectorAll('.jinglun-sidebar a[href*="project="]').forEach(a=>{const u=new URL(a.href,location.href);u.searchParams.set('project',project);a.href=u.href;});render();});
  window.addEventListener('beforeunload',()=>{if(task?.status==='抽取中'){task.status=task.records.length?'待校正':'草稿';save();}});
  load();render();
  window.KnoraExtractionPrototype={getState:()=>clone({project,tasks,task,step}),issues:id=>issues(record(id)),eligible:id=>eligible(record(id))};
})();
