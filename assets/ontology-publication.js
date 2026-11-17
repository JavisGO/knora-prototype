(function () {
  'use strict';
  // Organization model publication only. Personal projects keep their existing publication behavior.
  const MODEL_TYPES = ['entity', 'relation', 'event'];
  const STORE = 'knora:ontology-publication:v1';
  const CONFIG = 'knora:ontology-publication:approval';
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (_) { return fallback; } };
  const params = () => new URLSearchParams(location.search);
  const project = () => params().get('project') || localStorage.getItem('knora:lastProject') || 'personal';
  const personal = () => project() === 'personal';
  const kind = () => params().get('module');
  const label = type => ({entity:'实体',relation:'关系',event:'事件'})[type] || '本体';
  const rootName = () => localStorage.getItem('knora:tenant') === 'sailisi' ? '赛力斯集团' : '赛豆企业';
  const normalize = value => String(value || '').trim().replace(/^赛豆企业空间$/, '赛豆企业').replace(/^赛力斯企业空间$/, '赛力斯集团');
  const parts = path => String(path || '').split('/').map(normalize).filter(Boolean);
  function projectPath() {
    const row = Array.from(document.querySelectorAll('#projectTree [data-project]')).find(row => row.dataset.project === project());
    return row?.querySelector('small')?.textContent.trim() || window.KnoraSpacePublisher?.projectSpace().path || rootName();
  }
  function target(path) {
    const chain = parts(path);
    const selected = chain.slice(0, chain.length === 1 ? 1 : 2);
    return {name:selected[selected.length - 1],path:selected.join(' / '),level:selected.length === 1 ? 'enterprise' : 'domain'};
  }
  const levelLabel = level => ({enterprise:'企业级本体',domain:'业务域级本体',draft:'项目未发布本体'})[level];
  function state() { const data=read(STORE, {models:[],requests:[],grants:[]});demoRequests().concat(demoEditRequests()).forEach(r=>{if(!data.requests.some(x=>x.id===r.id))data.requests.push(r);});return data; }
  function save(data) { localStorage.setItem(STORE, JSON.stringify(data)); schedule();window.dispatchEvent(new Event('knora:ontology-publication-updated')); }
  function config(space) { return read(CONFIG, {})[normalize(space)] || {required:false,nodes:[]}; }
  function modelId(type, api, owner) { return [owner || project(), type, api].join(':'); }
  function seeds() {
    const groups=[
      ['enterprise-master','集团客户主数据项目','',[
        ['entity','group_customer_profile','集团客户主体'],['entity','group_legal_entity','企业法人'],['entity','group_organization','集团组织'],
        ['relation','customer_legal_entity','客户归属法人','group_customer_profile','group_legal_entity'],['relation','legal_organization','法人隶属组织','group_legal_entity','group_organization']]],
      ['marketing-master','营销客户模型项目','市场营销域',[
        ['entity','domain_customer_segment','客户分群'],['entity','domain_campaign_template','营销活动模板'],['entity','domain_touch_channel','触达渠道'],
        ['relation','segment_campaign','分群匹配活动','domain_customer_segment','domain_campaign_template'],['relation','campaign_channel','活动覆盖渠道','domain_campaign_template','domain_touch_channel']]],
      ['supply-master','供应链协同建模项目','供应链域',[
        ['entity','domain_supplier','供应商'],['entity','domain_material','采购物料'],['entity','domain_warehouse','仓储库位'],
        ['relation','supplier_material','供应商供应物料','domain_supplier','domain_material'],['relation','material_warehouse','物料存放库位','domain_material','domain_warehouse']]],
      ['innovation-master','智能营销能力建模项目','创新业务空间',[
        ['entity','domain_experiment','营销实验'],['entity','domain_strategy','推荐策略'],['entity','domain_audience','实验客群'],
        ['relation','experiment_strategy','实验采用策略','domain_experiment','domain_strategy'],['relation','strategy_audience','策略面向客群','domain_strategy','domain_audience']]],
      ['service-master','售后服务建模项目','服务运营域',[
        ['entity','domain_service_customer','服务客户'],['entity','domain_service_order','售后工单'],['entity','domain_service_station','服务网点'],
        ['relation','customer_service_order','客户提交工单','domain_service_customer','domain_service_order'],['relation','order_service_station','工单由网点处理','domain_service_order','domain_service_station']]]
    ];
    return groups.flatMap(([owner,projectName,domain,rows])=>rows.map(([type,api,name,sourceApi,targetApi])=>{
      const ownerPath=rootName()+(domain?' / '+domain:'');
      return {id:modelId(type,api,owner),type,api,name,ownerProject:owner,projectName,ownerPath,target:target(ownerPath),status:'已发布',visibility:'public',version:3,sourceApi,targetApi,demo:true,
        desc:sourceApi?rows.find(r=>r[1]===sourceApi)[2]+' → '+name+' → '+rows.find(r=>r[1]===targetApi)[2]:projectName+'维护的已发布'+(domain?'业务域':'企业')+'实体'};
    }));
  }
  function demoRequests() {
    const samples=seeds();
    return [
      {id:'op-demo-marketing-1115',owner:'marketing-master',api:'segment_campaign',reason:'修改客户分群与营销活动的匹配关系。\n补充适用渠道、活动有效期和客户层级说明。\n发布通过后，市场营销域及其下级项目使用更新后的域级本体。'},
      {id:'op-demo-enterprise-1115',owner:'enterprise-master',api:'group_credit_profile',reason:'新增企业级实体“集团信用档案”。\n定义统一信用编号、信用等级、评估日期与所属法人。\n供各业务域在客户经营与供应商管理中复用。'}
    ].map((item,i)=>{const model=samples.find(m=>m.api===item.api)||{id:modelId('entity',item.api,item.owner),type:'entity',api:item.api,name:'集团信用档案',ownerProject:item.owner,projectName:'集团客户主数据项目',ownerPath:rootName(),target:target(rootName()),status:'草稿',version:0};return {id:item.id,type:'publish',models:[model],target:model.target,visibility:'public',reason:item.reason,rule:{required:true,nodes:[{source:'本空间管理员',mode:'any',members:[model.target.name+'管理员']}]},node:0,votes:[],status:'审批中',project:item.owner,projectName:model.projectName,created:'2026-11-15 09:'+(i?'40':'20'),sample:true};});
  }
  function demoEditRequests() {
    const models=seeds().filter(m=>m.ownerProject==='marketing-master'&&['domain_customer_segment','segment_campaign'].includes(m.api));
    const base=models[0];
    models.push({...base,id:modelId('event','customer_segment_changed',base.ownerProject),type:'event',api:'customer_segment_changed',name:'客户分群变更事件',desc:'记录客户分群调整及原因。'});
    return [{id:'op-demo-edit-1116',type:'edit',models,project:'experience',projectName:'客户体验项目',applicant:'王晨',reason:'为客户体验分析完善客户分群定义及关联规则。\n申请共同维护客户分群实体、分群匹配活动关系和客户分群变更事件，补充体验指标与变更原因。',created:'2026-11-16 09:20:00',status:'审批中',node:0,votes:[],rule:{required:true,nodes:[{source:base.projectName+'管理员',mode:'any',members:[base.projectName+'管理员']}]},sample:true}];
  }
  function requestProjectName(request) {
    return request.projectName || ({insight:'客户洞察项目',experience:'客户体验项目',channel:'渠道协同项目',ai:'智能营销项目'})[request.project] || request.project || '未记录';
  }
  function requestApplicant(request) { return request.applicant || (request.type==='edit'?'未记录（历史申请）':'陈宇'); }
  function currentApplicant() { return window.knoraRolePerspective?.config?.person || window.KnoraKnowledgeFeedback?.currentUser?.() || '陈宇'; }
  function approvalKind(request) { return request.type==='edit'?'ontology-edit':'ontology'; }
  function approvalLabel(request) { return request.type==='edit'?'申请本体管理':'本体发布'; }
  function approvalRequests() { return state().requests.filter(r=>r.type==='edit'||(r.type==='publish'&&r.rule.required)); }
  function editRequestLines(request) {
    return ['申请对象：',...request.models.map(m=>label(m.type)+'「'+m.name+'」 · '+m.api),
      '申请项目：'+requestProjectName(request),'申请原因：\n'+(request.reason||'未填写'),
      '申请时间：'+request.created,'申请人：'+requestApplicant(request),
      '对象来源项目：'+[...new Set(request.models.map(m=>m.projectName))].join('、')].join('\n');
  }
  function requestLines(request) {
    if(request.type==='edit')return editRequestLines(request);
    const lines=['发起项目：'+(request.projectName||request.models[0].projectName)];
    request.models.forEach(m=>{
      lines.push((m.status==='草稿'||!m.version?'新增发布':'修改发布')+'：'+label(m.type)+'「'+m.name+'」 · '+m.api);
      if(m.definition){const d=m.definition;if(d.properties)lines.push('模型属性：'+d.properties.map(p=>p[0]+'（'+p[1]+'）').join('、'));if(d.desc)lines.push('模型说明：'+d.desc);}
      else if(m.desc)lines.push('内容说明：'+m.desc);
    });
    lines.push('目标空间：'+request.target.path+'（'+levelLabel(request.target.level)+'）');
    lines.push('发布范围：'+(request.visibility==='public'?'公开，发布成功后本空间及下级项目自动可用':'非公开'));
    if(request.reason)lines.push('变更说明：\n'+request.reason);
    return lines.join('\n');
  }
  function requestInfo(request) { return '<section class="op-publication-info"><h3>'+approvalLabel(request)+'审批通知</h3><p>'+esc(requestLines(request))+'</p></section>'; }
  function portalItems() {
    return approvalRequests().slice().reverse().flatMap(r=>['review','submitted'].map(mode=>({
      id:r.id+(mode==='submitted'?'-submitted':''),requestId:r.id,kind:approvalKind(r),mode,tag:approvalLabel(r),
      title:(r.type==='edit'?'申请本体管理':r.models.some(m=>m.version)?'本体修改发布':'本体首次发布')+' · '+r.models.map(m=>m.name).join('、'),
      desc:requestLines(r),source:requestProjectName(r),target:r.type==='edit'?[...new Set(r.models.map(m=>m.projectName))].join('、'):r.target.path,
      applicant:requestApplicant(r),time:r.created,status:r.status==='审批中'?(mode==='review'?'待我审批':'审批中'):['发布中','已发布'].includes(r.status)?'已通过':r.status,
      resources:r.models.map(m=>({id:m.id,name:m.name,type:'本体',format:label(m.type),meta:levelLabel((r.target||m.target).level)}))
    })));

  }
  function markNoticeRead(id) {const data=state(),r=data.requests.find(r=>r.id===id);if(r&&!r.noticeRead){r.noticeRead=true;save(data);}}
  function publicationNotices() {
    const requests=approvalRequests().slice().reverse();
    const mask=modal('本体审批通知',requests.map(r=>'<button class="op-notice-card" data-op-notice="'+esc(r.id)+'"><b>'+approvalLabel(r)+' · '+esc(r.models.map(m=>m.name).join('、'))+' · '+esc(r.status)+'</b><p>'+esc(requestLines(r))+'</p><small>'+esc(r.created)+' · 查看审批详情 →</small></button>').join('')||'<p>暂无本体审批通知</p>','<a class="btn primary" href="portal-mine.html?tab=approval">进入我的审批待办</a><button class="btn" data-op-close>关闭</button>');
  }
  function refreshPublicationNotices() {
    const requests=approvalRequests(),pop=document.getElementById('approvalNotificationPop');
    if(pop){
      let anchor=pop.querySelector('header');
      requests.slice().reverse().forEach(r=>{let link=Array.from(pop.querySelectorAll('[data-op-notice]')).find(n=>n.dataset.opNotice===r.id);if(!link){link=document.createElement('a');link.dataset.opNotice=r.id;link.href='portal-mine.html?tab=approval&approvalKind='+approvalKind(r)+'&ontologyRequest='+encodeURIComponent(r.id);}if(anchor.nextElementSibling!==link)anchor.after(link);anchor=link;link.className='approval-notification-item op-publication-notice'+(r.noticeRead?'':' unread');const html='<i>本</i><span><b>'+approvalLabel(r)+'审批 · '+esc(r.models.map(m=>m.name).join('、'))+'</b><small>'+esc(requestLines(r))+'</small></span><em>'+esc(r.status)+'</em>';if(link.innerHTML!==html)link.innerHTML=html;});
      const unread=pop.querySelectorAll('.approval-notification-item.unread').length;setText(document.querySelector('#approvalNotificationTrigger .badge'),String(unread));setText(pop.querySelector('header small'),unread+' 条未读');
    }
    const bell=document.querySelector('.top-actions button:has(use[href="#bell"])');
    if(bell&&!personal()){bell.dataset.opNotificationTrigger='';bell.setAttribute('aria-label','本体审批通知');setText(bell.querySelector('.badge'),String(requests.filter(r=>!r.noticeRead).length));}
  }

  function ownModels() {
    return MODEL_TYPES.flatMap(type=>(window.KnoraOntologyModelCatalog?.(type)||[]).map(row=>({id:modelId(type,row[1]),type,api:row[1],name:row[0],desc:row[2],ownerProject:project(),projectName:document.getElementById('currentProjectName')?.textContent||project(),ownerPath:projectPath(),target:target(projectPath()),status:row[7]==='草稿'?'草稿':'已发布',visibility:'public',version:row[7]==='草稿'?0:1})));
  }
  function catalog() { const data=state(); return seeds().concat(ownModels()).filter(s => !data.models.some(m=>m.id===s.id)).concat(data.models); }
  function accessible(model) {
    if (personal()) return false;
    if (model.ownerProject === project()) return true;
    const path=parts(projectPath()),scope=parts(model.target?.path);
    return model.status==='已发布' && model.visibility==='public' && scope.length>0 && scope.every((p,i)=>p===path[i]);
  }
  function canEdit(model) { return !!model && (model.ownerProject===project() || state().grants.some(g=>g.modelId===model.id&&g.project===project())); }
  function currentModel(id) {
    const explicit=params().get('ontologyModel');
    return explicit?catalog().find(m=>m.id===explicit&&accessible(m)):catalog().find(m=>(m.entityKey===id||m.api===id)&&m.ownerProject===project())||catalog().find(m=>(m.entityKey===id||m.api===id)&&accessible(m));
  }
  function canEditId(api) { return canEdit(currentModel(api)); }
  function cardModel(card, type) {
    const api=card.querySelector('.om-api')?.textContent.trim() || card.dataset.graphName || 'model';
    const existing=catalog().find(m=>m.id===card.dataset.opId) || catalog().find(m=>m.api===api&&m.ownerProject===project());
    return existing || {id:modelId(type,api),type,api,name:card.querySelector('h3,b')?.textContent.trim()||api,ownerProject:project(),projectName:document.getElementById('currentProjectName')?.textContent||project(),ownerPath:projectPath(),status:card.querySelector('.om-status')?.textContent.includes('草稿')?'草稿':'已发布',target:target(projectPath()),visibility:'public',version:1};
  }
  function notice(text) {
    document.querySelector('.op-toast')?.remove(); const node=document.createElement('div'); node.className='op-toast'; node.textContent=text;document.body.appendChild(node);setTimeout(()=>node.remove(),3200);
  }
  function modal(title, body, footer='') {
    document.querySelector('.op-mask')?.remove();const mask=document.createElement('div');mask.className='op-mask';
    mask.innerHTML='<section class="op-dialog" role="dialog" aria-modal="true" aria-label="'+esc(title)+'"><header><div><small>本体管理</small><h2>'+esc(title)+'</h2></div><button data-op-close aria-label="关闭">×</button></header><main>'+body+'</main><footer>'+footer+'</footer></section>';
    mask.addEventListener('click',e=>{if(e.target===mask||e.target.closest('[data-op-close]'))mask.remove();});document.body.appendChild(mask);return mask;
  }
  function chainHtml(rule) {
    if(!rule.required) return '<div class="op-chain"><span>提交发布</span><i>→</i><span>无需审批</span><i>→</i><span>构建并发布模型</span></div>';
    return '<div class="op-chain"><span>提交申请</span>'+rule.nodes.map((n,i)=>'<i>→</i><span><b>'+(i+1)+'. '+esc(n.source)+'</b><small>'+esc(n.members.join('、'))+' · '+(n.mode==='all'?'所有人通过':'任意一人通过')+'</small></span>').join('')+'<i>→</i><span>构建并发布模型</span></div>';
  }
  function publish(models) {
    if(personal())return;
    models=models.map(m=>m.draft?Object.assign({},m,{name:m.draft.name,api:m.draft.api||m.api,desc:m.draft.desc,definition:m.draft}):m);
    if(models.some(m=>!canEdit(m)))return notice('此对象仅可使用，请先向来源项目管理员申请编辑权限。');
    if(models.some(m=>state().requests.some(r=>r.type==='publish'&&r.models.some(x=>x.id===m.id)&&['审批中','发布中'].includes(r.status))))return notice('所选对象已有审批或发布任务，请在“发布与编辑申请”中查看。');
    const destination=target(models[0].ownerPath),rule=config(destination.name);
    if(models.some(m=>target(m.ownerPath).path!==destination.path))return publishBatch(models);
    const mask=modal(models.length>1?'批量发布本体到空间':'发布'+label(models[0].type)+'到空间',
      '<section class="op-target"><i>空</i><div><small>发布目标 · '+levelLabel(destination.level)+'</small><h3>'+esc(destination.name)+'</h3><p>'+esc(destination.path)+'</p></div><input type="radio" aria-label="发布目标空间" checked disabled></section><p class="op-note">一级空间项目发布到企业空间；二级及以下空间项目发布到所属业务域空间。目标随对象来源项目确定。</p><div class="op-names">'+models.map(m=>'<span>'+esc(m.name)+'</span>').join('')+'</div><div class="op-options"><label><input type="radio" name="opVisibility" value="public" checked><b>公开</b><small>发布成功后，本空间及所有下级空间的项目自动可见、可用，无需申请资源。</small></label><label><input type="radio" name="opVisibility" value="private"><b>非公开</b><small>不自动向其它项目开放；保留来源项目使用范围。</small></label></div><h3>本体发布审批链</h3>'+chainHtml(rule)+'<p class="op-note">使用“'+esc(destination.name)+'”空间配置的本体发布审批链。审批通过后才开始构建存储、索引和模型版本，不执行数据同步。更新发布期间，原版本继续可用。</p><label class="op-field">申请说明<textarea data-op-reason placeholder="填写发布或更新说明"></textarea></label>',
      '<span>模型发布与数据同步分开执行</span><button class="btn" data-op-close>取消</button><button class="btn primary" data-op-submit>'+(rule.required?'提交审批':'发布模型')+'</button>');
    mask.querySelector('[data-op-submit]').onclick=()=>{
      if(rule.required&&!rule.nodes.length)return notice('目标空间已开启审批但没有审批节点，请先配置。');
      const data=state(),request={id:'op-'+Date.now(),type:'publish',models:JSON.parse(JSON.stringify(models)),target:destination,visibility:mask.querySelector('[name=opVisibility]:checked').value,reason:mask.querySelector('[data-op-reason]').value,rule:JSON.parse(JSON.stringify(rule)),node:0,votes:[],status:rule.required?'审批中':'发布中',project:project(),projectName:document.getElementById('currentProjectName')?.textContent||project(),created:new Date().toLocaleString('zh-CN'),started:rule.required?null:Date.now()};
      data.requests.push(request);save(data);showRequest(request.id);if(rule.required)notice('本体发布审批已提交，通知已发送，可在知识门户“我的审批待办”查看。');
    };
  }
  function publishBatch(models) {
    const groups=[];
    models.forEach(model=>{const destination=target(model.ownerPath);let group=groups.find(g=>g.target.path===destination.path);if(!group){group={target:destination,models:[],rule:config(destination.name)};groups.push(group);}group.models.push(model);});
    const mask=modal('批量发布本体到空间',groups.map(g=>'<section class="op-target"><div><h3>'+esc(g.target.name)+'</h3><p>'+esc(g.target.path)+'</p><p>'+esc(g.models.map(m=>m.name).join('、'))+'</p></div></section>'+chainHtml(g.rule)).join('')+'<div class="op-options"><label><input type="radio" name="opBatchVisibility" value="public" checked>公开<small>发布完成后自动供本空间与所有下级空间项目使用</small></label><label><input type="radio" name="opBatchVisibility" value="private">非公开<small>不自动向其他项目开放</small></label></div>','<span>按对象来源项目分别执行目标空间审批链</span><button class="btn" data-op-close>取消</button><button class="btn primary" data-op-submit>提交发布</button>');
    mask.querySelector('[data-op-submit]').onclick=()=>{if(groups.some(g=>g.rule.required&&!g.rule.nodes.length))return notice('开启审批的空间必须先配置审批节点。');const data=state();groups.forEach((g,i)=>data.requests.push({id:'op-batch-'+Date.now()+'-'+i,type:'publish',models:JSON.parse(JSON.stringify(g.models)),target:g.target,visibility:mask.querySelector('[name=opBatchVisibility]:checked').value,rule:JSON.parse(JSON.stringify(g.rule)),node:0,votes:[],status:g.rule.required?'审批中':'发布中',project:project(),projectName:document.getElementById('currentProjectName')?.textContent||project(),created:new Date().toLocaleString('zh-CN'),started:g.rule.required?null:Date.now()}));save(data);requests();};
  }
  function publishBuilder(builder) {
    const api=builder.api,existing=currentModel(params().get('entityId'))||catalog().find(m=>m.api===api&&m.ownerProject===project());
    const model=existing || {id:modelId('entity',params().get('entityId')||api),ownerProject:project(),projectName:document.getElementById('currentProjectName')?.textContent||project(),ownerPath:projectPath(),version:0};
    publish([Object.assign({},model,{draft:null,type:'entity',api,entityKey:params().get('entityId')||api,name:builder.name,status:model.status||'草稿',definition:JSON.parse(JSON.stringify(builder))})]);
  }
  function saveDraft(builder) {
    if(personal())return;
    const data=state(),api=builder.api,id=params().get('entityId')||api;
    const existing=currentModel(id)||data.models.find(m=>m.id===modelId('entity',id));
    if(existing&&!canEdit(existing))return;
    const m=existing?.status==='已发布' ? Object.assign({},existing,{draft:JSON.parse(JSON.stringify(builder))}) : Object.assign({},existing||{id:modelId('entity',id),type:'entity',ownerProject:project(),projectName:document.getElementById('currentProjectName')?.textContent||project(),ownerPath:projectPath(),version:0,status:'草稿',target:target(projectPath()),visibility:'public'}, {api,entityKey:id,name:builder.name,definition:JSON.parse(JSON.stringify(builder))});
    data.models=data.models.filter(x=>x.id!==m.id);data.models.push(m);save(data);
  }
  function commitPublished(request,data) {
    let portal=read('knora:publishedProjectResources',[]);
    request.models.forEach(input=>{
      const model=Object.assign({},input,{status:'已发布',visibility:request.visibility,target:request.target,version:(input.version||0)+1});delete model.draft;
      data.models=data.models.filter(m=>m.id!==model.id);data.models.push(model);
      const record={id:'ontology-model-'+model.id,category:'ontology',type:model.type,kind:label(model.type),name:model.name,api:model.api,project:model.projectName,source:model.projectName,owner:'来源项目管理员',space:model.target.name,spacePath:model.target.path,status:'已发布',updated:new Date().toLocaleDateString('zh-CN'),desc:levelLabel(model.target.level)+' · '+(model.visibility==='public'?'公开 · 下级项目可直接使用':'非公开'),attributes:(model.definition?.properties||[]).map(p=>[p[0],p[1],p[2],p[3]]),metrics:['来源项目：'+model.projectName,levelLabel(model.target.level),'v'+model.version]};
      portal=portal.filter(p=>p.id!==record.id);portal.push(record);
    });
    localStorage.setItem('knora:publishedProjectResources',JSON.stringify(portal));
  }
  function tick() {
    const data=state();let changed=false;
    data.requests.forEach(r=>{if(r.status==='发布中'&&Date.now()-r.started>=4500){r.status='已发布';commitPublished(r,data);changed=true;}});
    if(changed)save(data);
  }
  function showRequest(id, options={}) {
    tick();const request=state().requests.find(r=>r.id===id);if(!request)return;
    const publishing=request.type==='publish',waiting=request.status==='审批中'&&!(request.type==='edit'&&options.readOnly);
    let body='<div class="op-request-summary"><b>'+esc(request.models.map(m=>m.name).join('、'))+'</b><strong>'+esc(request.status)+'</strong><p>'+esc(request.created)+' · '+esc(publishing?request.target.path:request.models[0].projectName+' · 项目管理员')+'</p></div>';
    if(publishing)body+=requestInfo(request)+chainHtml(request.rule);
    else body+=requestInfo(request)+'<p class="op-note">向对象所属项目“'+esc(request.models[0].projectName)+'”的管理员申请编辑。批准后可编辑对象；对象的来源项目与发布归属不变。</p>';
    if(waiting){const node=request.rule.nodes[request.node];body+='<section class="op-review"><h3>当前审批节点 '+(request.node+1)+' · '+esc(node.source)+'</h3><p>'+(node.mode==='all'?'全部审批人通过后进入下一节点':'任意一位审批人通过后进入下一节点')+'</p><label>审批身份（原型演示）<select data-op-voter>'+node.members.filter(m=>!request.votes.includes(m)).map(m=>'<option>'+esc(m)+'</option>').join('')+'</select></label><label class="op-field">审批意见<textarea data-op-opinion placeholder="驳回时请填写原因"></textarea></label></section>';}
    if(request.status==='发布中'||request.status==='已发布'){
      const phase=request.status==='已发布'?3:Math.min(2,Math.floor((Date.now()-request.started)/1500));
      body+='<ol class="op-progress">'+['构建存储','构建索引','发布模型版本'].map((s,i)=>'<li class="'+(i<phase?'done':i===phase?'active':'')+'"><b>'+(i<phase?'✓':i+1)+'</b>'+s+'<small>'+(i<phase?'已完成':i===phase?'进行中':'等待中')+'</small></li>').join('')+'</ol><p class="op-note">'+(request.status==='已发布'?'发布成功，可在目标空间查看模型资源。数据同步请在实体的数据映射或同步数据入口单独执行。':'审批已完成，正在发布；关闭窗口后任务继续执行。')+'</p>';
    }
    if(request.rejection)body+='<p class="op-note">驳回原因：'+esc(request.rejection)+'</p>';
    const mask=modal(publishing?(waiting?'本体发布审批':'本体发布进度'):'申请本体管理审批',body,'<span>审批与发布状态自动保存</span><button class="btn" data-op-close>关闭</button>'+(waiting?'<button class="btn" data-op-reject>驳回（演示）</button><button class="btn primary" data-op-approve>通过（演示）</button>':''));
    mask.dataset.requestId=id;
    if(waiting){mask.querySelector('[data-op-approve]').onclick=()=>decide(id,true,mask);mask.querySelector('[data-op-reject]').onclick=()=>decide(id,false,mask);}
  }
  function decide(id,yes,mask) {
    const data=state(),r=data.requests.find(r=>r.id===id);if(!r||r.status!=='审批中')return;
    const opinion=mask.querySelector('[data-op-opinion]').value.trim();
    if(!yes&&!opinion)return notice('请填写驳回原因。');
    if(!yes){r.status='已驳回';r.rejection=opinion;}
    else {const node=r.rule.nodes[r.node];r.votes.push(mask.querySelector('[data-op-voter]').value);if(node.mode!=='all'||node.members.every(m=>r.votes.includes(m))){r.node++;r.votes=[];}if(r.node>=r.rule.nodes.length){if(r.type==='edit'){r.status='已通过';r.models.forEach(model=>{if(!data.grants.some(g=>g.modelId===model.id&&g.project===r.project))data.grants.push({modelId:model.id,project:r.project});});}else{r.status='发布中';r.started=Date.now();}}}
    save(data);showRequest(id);
  }
  function requestEdit(model) {
    const pending=state().requests.find(r=>r.type==='edit'&&r.models[0].id===model.id&&r.project===project()&&r.status==='审批中');if(pending)return showRequest(pending.id,{readOnly:true});
    const mask=modal('申请编辑 · '+model.name,'<section class="op-target"><div><small>审批人：对象所属项目管理员</small><h3>'+esc(model.projectName)+'</h3><p>'+esc(model.target.path)+'</p></div></section><p class="op-note">当前可使用此对象，并添加相关关系、事件、Action、流程与智能体。编辑对象本身须经来源项目管理员批准。</p><label class="op-field">申请原因<textarea data-op-reason placeholder="请说明需要修改的内容"></textarea></label>','<button class="btn" data-op-close>取消</button><button class="btn primary" data-op-submit>提交申请</button>');
    mask.querySelector('[data-op-submit]').onclick=()=>{const reason=mask.querySelector('textarea').value.trim();if(!reason)return notice('请填写申请原因。');const data=state(),r={id:'op-edit-'+Date.now(),type:'edit',models:[model],project:project(),projectName:document.getElementById('currentProjectName')?.textContent.trim()||project(),applicant:currentApplicant(),status:'审批中',node:0,votes:[],reason,created:new Date().toLocaleString('zh-CN'),rule:{required:true,nodes:[{source:model.projectName+'管理员',mode:'any',members:[model.projectName+'管理员']}]}};data.requests.push(r);save(data);showRequest(r.id,{readOnly:true});notice('申请本体管理已提交，通知已发送给来源项目管理员，可在“我的审批待办”查看。');};
  }
  function requests(space) {
    const rows=state().requests.filter(r=>!space||normalize(r.target?.name)===normalize(space));
    const mask=modal('发布与编辑申请','<div class="op-request-list">'+(rows.length?rows.slice().reverse().map(r=>'<button data-op-request="'+esc(r.id)+'"><span><b>'+esc(r.models.map(m=>m.name).join('、'))+'</b><small>'+esc(r.type==='edit'?'申请编辑':'本体发布')+' · '+esc(r.created)+'</small></span><em>'+esc(r.status)+'</em></button>').join(''):'<p>暂无申请记录</p>')+'</div>','<button class="btn" data-op-close>关闭</button>');
    mask.querySelectorAll('[data-op-request]').forEach(b=>b.onclick=()=>showRequest(b.dataset.opRequest));
  }
  function detail(model) {
    const mask=modal(model.name,'<section class="op-target"><div><small>'+levelLabel(model.target.level)+' · '+(canEdit(model)?'✎ 可编辑':'🔒 仅可使用')+'</small><h3>'+esc(model.projectName)+'</h3><p>'+esc(model.target.path)+'</p></div></section><p class="op-note">'+(canEdit(model)?'已获得编辑权限，修改后仍需通过所属空间的本体发布流程。':'可直接使用此对象，添加相关关系、事件、Action、流程和智能体；不可修改对象定义、属性或数据映射。')+'</p><div class="op-related">'+[['relation','添加相关关系'],['event','添加相关事件'],['action','添加相关 Action'],['flow','添加相关流程'],['reasoning','添加相关智能体']].map(([k,t])=>'<a class="btn" href="knowledge-base-management.html?project='+encodeURIComponent(project())+'&module='+k+'&relatedEntity='+encodeURIComponent(model.api)+'">'+t+'</a>').join('')+'</div>','<button class="btn" data-op-close>关闭</button>'+(canEdit(model)?'<button class="btn primary" data-op-edit>编辑对象</button>':'<button class="btn primary" data-op-edit>申请编辑</button>'));
    mask.querySelector('[data-op-edit]').onclick=()=>{if(!canEdit(model))return requestEdit(model);mask.remove();openEditor(model);};
  }
  function openEditor(model) {
    if(!canEdit(model))return requestEdit(model);
    if(model.type!=='entity')return editSimple(model);
    const entityId=model.entityKey||model.api,key='knora:entity-builder:v2:'+project()+':'+(model.ownerProject===project()?entityId:model.id);
    if(!localStorage.getItem(key)&&model.definition)localStorage.setItem(key,JSON.stringify(model.definition));
    location.href='knowledge-base-management.html?project='+encodeURIComponent(project())+'&module=entity&entityView=edit&entityScope='+(model.ownerProject===project()?'created':'shared')+'&entityId='+encodeURIComponent(entityId)+'&entityName='+encodeURIComponent(model.name)+'&ontologyModel='+encodeURIComponent(model.id);
  }
  function editSimple(model) {
    const mask=modal('编辑'+label(model.type),' <label class="op-field">名称<input data-op-name value="'+esc(model.name)+'"></label><label class="op-field">说明<textarea>'+esc(model.desc||'')+'</textarea></label>','<button class="btn" data-op-close>取消</button><button class="btn primary" data-op-save>保存草稿</button>');
    mask.querySelector('[data-op-save]').onclick=()=>{const data=state(),draft={name:mask.querySelector('input').value.trim(),api:model.api,desc:mask.querySelector('textarea').value};if(!draft.name)return notice('请填写名称。');const copy=model.status==='已发布'?Object.assign({},model,{draft}):Object.assign({},model,draft);data.models=data.models.filter(m=>m.id!==copy.id);data.models.push(copy);save(data);mask.remove();};
  }
  // Third approval category, reusing the drawer's visual components and leaving its original two categories intact.
  function bindApproval(mask,space) {
    if(mask.dataset.opApproval)return;mask.dataset.opApproval='1';
    const modes=mask.querySelector('.spm-approval-modes'),chain=mask.querySelector('.spm-chain');if(!modes||!chain)return;
    const draft=JSON.parse(JSON.stringify(config(space)));
    let active=false;
    const button=document.createElement('button');button.dataset.approvalMode='ontology';button.innerHTML='<i>◇</i><span><b>本体发布</b><small>实体、关系、事件模型发布到此空间时是否审批；默认无需审批</small></span><em class="spm-switch '+(draft.required?'on':'')+'"></em>';modes.appendChild(button);
    // Use the same chain board and node dialog as the two existing approval categories.
    mask.addEventListener('click',e=>{
      const mode=e.target.closest('[data-approval-mode]');
      if(mode){
        active=mode===button;
        if(!active)return;
        e.stopImmediatePropagation();
        modes.querySelectorAll('[data-approval-mode]').forEach(b=>b.classList.toggle('active',b===button));
        chain.querySelector('#spmChainTitle').textContent='本体发布 · 审批链';
        if(e.target.closest('.spm-switch'))draft.required=!draft.required;
        button.querySelector('.spm-switch').classList.toggle('on',draft.required);
        return;
      }
      if(active&&e.target.closest('#spmApprovalSave')){
        e.stopImmediatePropagation();
        if(draft.required&&!draft.nodes.length)draft.nodes=[{source:'本空间管理员',mode:'any',members:[space+'管理员']}];
        const configs=read(CONFIG,{});configs[normalize(space)]=draft;localStorage.setItem(CONFIG,JSON.stringify(configs));
        notice('本体发布审批机制已保存');
      }
    },true);
  }
  function sharedCard(model) {
    const card=document.createElement('article');card.className='om-card shared-project-card';card.dataset.projectOrigin='shared';card.dataset.entityScope='shared';card.dataset.opId=model.id;
    if(model.type==='entity')card.dataset.entityOpen=model.name;
    card.innerHTML='<div class="om-card-top"><span class="om-icon '+model.type+'">◇</span><span class="om-status">已发布</span></div><h3>'+esc(model.name)+'</h3><div class="om-api">'+esc(model.api)+'</div><div class="om-linkline"><span>来源：'+esc(model.projectName)+'</span></div><div class="om-tags"><span class="om-tag">公开 · 自动可用</span></div><div class="om-card-actions"><button class="om-mini" data-op-detail>查看与使用</button><button class="om-mini" data-op-request-edit>申请编辑</button></div>';return card;
  }
  function setText(node,value){if(node&&node.textContent!==value)node.textContent=value;}
  let scheduled=false;
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;decorate();});}
  function decorate() {
    const page=document.getElementById('ontologyModulePage');
    if(document.body.dataset.page==='mine'&&!document.querySelector('[data-op-open-requests]')){const host=document.getElementById('content');if(host){const button=document.createElement('button');button.className='btn op-mine-entry';button.dataset.opOpenRequests='';button.textContent='本体发布与编辑审批';host.prepend(button);}}
    refreshPublicationNotices();if(!page)return;
    if(personal()) {if(kind()==='entity')addMapping(page);return;}
    if(MODEL_TYPES.includes(kind())&&page.querySelector('.om-grid')) {
      const grid=page.querySelector('.om-grid');
      grid.querySelectorAll('.shared-project-card:not([data-op-id])').forEach(c=>c.remove());
      const shared=catalog().filter(m=>m.type===kind()&&m.ownerProject!==project()&&accessible(m));
      grid.querySelectorAll('.shared-project-card[data-op-id][data-project-origin="shared"]').forEach(card=>{if(!shared.some(m=>m.id===card.dataset.opId))card.remove();});
      shared.forEach(m=>{if(!Array.from(grid.children).some(c=>c.dataset.opId===m.id))grid.appendChild(sharedCard(m));});
      state().models.filter(m=>m.ownerProject===project()&&m.type===kind()).forEach(m=>{if(Array.from(grid.children).some(c=>c.dataset.opId===m.id||modelId(kind(),c.querySelector('.om-api')?.textContent)===m.id||c.querySelector('.om-api')?.textContent===m.api))return;const card=sharedCard(m);card.dataset.projectOrigin='created';card.dataset.entityScope='created';grid.appendChild(card);});
      const tabs=page.querySelectorAll('[data-project-group]');['全部','本项目构建','其他项目分享'].forEach((t,i)=>setText(tabs[i],t));
      const toolbar=page.querySelector('.om-toolbar');
      if(toolbar&&!toolbar.querySelector('[data-op-level]'))toolbar.insertAdjacentHTML('beforeend','<select class="select" aria-label="本体层级" data-unified-tags="1" data-op-level><option value="all">全部本体层级</option><option value="enterprise">企业级本体</option><option value="domain">业务域级本体</option><option value="draft">项目未发布本体</option></select><button class="btn" data-op-open-requests>发布与编辑申请</button>');
      page.querySelectorAll('.om-grid>.om-card:not(.om-create)').forEach(card=>{
        const m=cardModel(card,kind());card.dataset.opId=m.id;
        const saved=state().models.find(x=>x.id===m.id);if(saved){setText(card.querySelector('h3'),saved.name);setText(card.querySelector('.om-api'),saved.api);if(kind()==='entity')card.dataset.entityOpen=saved.name;}
        const pending=state().requests.find(r=>r.type==='publish'&&r.models.some(x=>x.id===m.id)&&['审批中','发布中'].includes(r.status));
        let badge=card.querySelector('.op-card-meta');if(!badge){badge=document.createElement('div');badge.className='op-card-meta';card.querySelector('.om-api').after(badge);}
        const level=m.status==='草稿'?'draft':m.target.level;
        setText(badge,(canEdit(m)?'✎ 可编辑':'🔒 仅可使用')+' · '+levelLabel(level)+(m.target.level==='domain'?' · '+m.target.name:'')+(pending?' · '+pending.status:''));
        card.dataset.opOntologyLevel=level;
        setText(card.querySelector('.om-status'),pending?pending.status:m.status==='草稿'?'草稿':'已发布');
        const levelFilter=toolbar.querySelector('[data-op-level]').value;
        card.classList.toggle('op-level-hidden',levelFilter!=='all'&&levelFilter!==level);
        const sharedCard=card.dataset.projectOrigin==='shared';
        if(sharedCard){
          setText(card.querySelector('.om-tag'),m.demo?'已发布 · 已共享至本项目':'公开 · 自动可用');
          const actions=card.querySelector('.om-card-actions');
          if(actions&&!actions.querySelector('[data-op-request-edit]'))actions.insertAdjacentHTML('beforeend','<button class="oac-btn" data-op-request-edit>申请编辑</button>');
          card.querySelectorAll('[data-oac-entity-publish],[data-oac-space-publish],[data-oac-entity-delete],.om-batch-card-check').forEach(b=>{b.disabled=!canEdit(m);});
          card.querySelectorAll('[data-oac-entity-publish],[data-oac-more]').forEach(b=>b.hidden=!canEdit(m));
          setText(card.querySelector('[data-op-request-edit]'),canEdit(m)?'编辑对象':'申请编辑');setText(card.querySelector('[data-entity-edit]'),'查看');
        }
        if(!personal()){const redundant=card.querySelector('[data-oac-space-publish="entity"]');if(redundant)redundant.hidden=true;}
      });
      addMapping(page);
      setText(page.querySelector('.om-pager>span'),'共 '+grid.querySelectorAll('.om-card:not(.om-create)').length+' 条');
    }
    const graph=page.querySelector('#projectSemanticGraph');if(graph)decorateGraph(graph);
    const builder=page.querySelector('[data-eb-mounted]');
    if(builder&&params().get('entityScope')==='shared'&&!canEditId(params().get('entityId'))){builder.querySelectorAll('input,select,textarea,button:not([data-entity-back-list])').forEach(el=>el.disabled=true);if(!builder.querySelector('.op-readonly'))builder.insertAdjacentHTML('afterbegin','<p class="op-note op-readonly">🔒 来源项目对象只可使用。请返回列表申请编辑，通过后再修改。</p>');}
  }
  function addMapping(page){if(kind()!=='entity')return;page.querySelectorAll('.om-card[data-entity-open] .om-card-actions').forEach(actions=>{if(!actions.querySelector('[data-op-mapping]'))actions.insertAdjacentHTML('afterbegin','<button class="oac-btn" data-op-mapping>数据映射</button>');});}
  function decorateGraph(graph) {
    const toolbar=graph.querySelector('.semantic-toolbar'),canvas=graph.querySelector('.semantic-canvas');
    if(!toolbar.querySelector('[data-op-origin]'))toolbar.insertAdjacentHTML('afterbegin','<select class="select" aria-label="构建来源" data-op-origin><option value="all">全部构建来源</option><option value="created">本项目构建</option><option value="shared">其他项目构建</option></select><select class="select" aria-label="本体层级" data-op-graph-level><option value="all">全部本体层级</option><option value="enterprise">企业级本体</option><option value="domain">业务域级本体</option><option value="draft">本项目未发布本体</option></select>');
    const destination=target(projectPath());
    const domainOption=toolbar.querySelector('[data-op-graph-level] [value="domain"]');
    setText(domainOption,destination.level==='domain'?'业务域级 · '+destination.name:'业务域级本体');domainOption.disabled=destination.level!=='domain';
    const typeSelect=graph.querySelector('#projectSemanticGraphType');
    if(!typeSelect.querySelector('[value="event"]'))typeSelect.insertAdjacentHTML('beforeend','<option value="event">事件</option>');
    // A project sees enterprise ontologies, its own domain and its own unpublished models.
    const models=catalog().filter(accessible).filter(m=>m.status==='草稿'?m.ownerProject===project():m.target.level==='enterprise'||m.target.path===destination.path);
    canvas.querySelectorAll('.semantic-node:not(.op-extra-node)').forEach(n=>{if(!n.dataset.opId){const row=(window.KnoraOntologyModelCatalog?.(n.dataset.graphType)||[]).find(row=>row[0]===n.dataset.graphName);if(row)n.dataset.opId=modelId(n.dataset.graphType,row[1]);}});
    canvas.querySelectorAll('.op-extra-node').forEach(n=>{if(!models.some(m=>m.id===n.dataset.opId))n.remove();});
    models.forEach(m=>{if(Array.from(canvas.querySelectorAll('.semantic-node')).some(n=>n.dataset.opId===m.id))return;const node=document.createElement('article');node.className='semantic-node op-extra-node';node.dataset.opId=m.id;node.dataset.graphType=m.type;node.innerHTML='<i>'+esc(m.type==='relation'?'关':m.type==='event'?'事':'实')+'</i><b></b>';canvas.appendChild(node);});
    canvas.classList.add('op-unified-canvas');
    const origin=toolbar.querySelector('[data-op-origin]').value,level=toolbar.querySelector('[data-op-graph-level]').value,type=typeSelect.value;
    const query=graph.querySelector('#projectSemanticGraphSearch').value.trim().toLowerCase(),tag=graph.querySelector('#projectSemanticGraphTag').value;
    const nodes=Array.from(canvas.querySelectorAll('.semantic-node'));
    nodes.forEach(node=>{
      const m=models.find(m=>m.id===node.dataset.opId);if(!m){node.classList.add('op-level-hidden');return;}
      node._opModel=m;node.dataset.graphName=m.name;
      if(!node.dataset.graphTags)node.dataset.graphTags=m.target.name+' '+(m.target.name==='市场营销域'?'客户经营 营销管理':m.target.name==='服务运营域'?'服务管理':m.target.name==='创新业务空间'?'客户经营':'供应链');
      setText(node.querySelector('b'),m.name);node.classList.toggle('op-shared-node',m.ownerProject!==project());
      const source=m.ownerProject===project()?'created':'shared',l=m.status==='草稿'?'draft':m.target.level;node.dataset.opOntologyLevel=l;
      node.classList.remove('is-filtered');node.classList.toggle('op-level-hidden',(origin!=='all'&&origin!==source)||(level!=='all'&&level!==l)||(type!=='all'&&type!==m.type)||(query&&!m.name.toLowerCase().includes(query))||(tag!=='all'&&!node.dataset.graphTags.includes(tag)));
      let badge=node.querySelector('.op-graph-meta');if(!badge){badge=document.createElement('small');badge.className='op-graph-meta';node.appendChild(badge);}
      setText(badge,(canEdit(m)?'✎':'🔒')+' '+levelLabel(l));node.title=(canEdit(m)?'可编辑':'仅可使用')+' · '+m.projectName+' · '+m.target.name+' · '+m.status;
    });
    const visible=nodes.filter(n=>!n.classList.contains('op-level-hidden'));
    const pairs={'客户购买产品':['客户主体','产品目录'],'工单关联客户':['服务工单','客户主体'],'客户参与活动':['客户主体','营销活动'],'活动使用渠道':['营销活动','渠道伙伴'],'伙伴经营区域':['渠道伙伴','经营区域'],'产品归属目录':['产品目录','经营区域']};
    const links=[];
    visible.filter(n=>n._opModel.type==='relation').forEach(r=>{const m=r._opModel,ends=m.sourceApi?[m.sourceApi,m.targetApi]:pairs[m.name];if(!ends)return;const find=key=>visible.find(n=>n._opModel.ownerProject===m.ownerProject&&(n._opModel.api===key||n._opModel.name===key));const a=find(ends[0]),b=find(ends[1]);if(a&&b)links.push([visible.indexOf(a),visible.indexOf(r)],[visible.indexOf(r),visible.indexOf(b)]);});
    const width=canvas.clientWidth,height=Math.max(650,Math.ceil(visible.length/Math.max(3,Math.floor(width/175)))*120+140);
    canvas.style.height=height+'px';canvas.style.minHeight=height+'px';
    const signature=width+':'+height+':'+visible.map(n=>n.dataset.opId).join(',')+JSON.stringify(links);
    if(canvas._opLayoutKey!==signature){canvas._opLayoutKey=signature;canvas._opLayout=layoutNetwork(visible,links,width,height);}
    visible.forEach((n,i)=>{n.style.left=(canvas._opLayout[i].x-n.offsetWidth/2)+'px';n.style.top=(canvas._opLayout[i].y-n.offsetHeight/2)+'px';});
    let svg=canvas.querySelector('.op-network-edges');if(!svg){svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('op-network-edges');svg.setAttribute('aria-hidden','true');canvas.appendChild(svg);}svg.setAttribute('viewBox','0 0 '+width+' '+height);
    const paths=links.map(([a,b])=>{const p=canvas._opLayout[a],q=canvas._opLayout[b],dx=q.x-p.x,dy=q.y-p.y,scale=Math.min(Math.abs(dx)>0?74/Math.abs(dx):1,Math.abs(dy)>0?28/Math.abs(dy):1,.42);const x1=p.x+dx*scale,y1=p.y+dy*scale,x2=q.x-dx*scale,y2=q.y-dy*scale;return '<path d="M'+x1+' '+y1+' Q'+((x1+x2)/2-dy*.06)+' '+((y1+y2)/2+dx*.06)+' '+x2+' '+y2+'"/>';});
    const html='<defs><marker id="opNetworkArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill="#9bafca"/></marker></defs><g fill="none" stroke="#9bafca" stroke-width="1.4" marker-end="url(#opNetworkArrow)">'+paths.join('')+'</g>';if(svg._opMarkup!==html){svg._opMarkup=html;svg.innerHTML=html;}
    canvas.dataset.opSummary=visible.length+' 个本体对象 · 紫：企业级 · 蓝：业务域级 · 橙：未发布 · ✎ 可编辑 · 🔒 仅可使用';
  }
  function layoutNetwork(nodes,links,width,height) {
    // A single network layout; publication level never determines a spatial section.
    const points=nodes.map((n,i)=>{const angle=i*2.3999632297,radius=Math.sqrt((i+.5)/Math.max(1,nodes.length));return {x:width/2+Math.cos(angle)*radius*(width/2-100),y:height/2+Math.sin(angle)*radius*(height/2-90)};});
    for(let step=0;step<200;step++){
      const force=points.map(p=>({x:(width/2-p.x)*.005,y:(height/2-p.y)*.005}));
      for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){let dx=points[i].x-points[j].x,dy=points[i].y-points[j].y;if(!dx&&!dy)dx=1;const d=Math.max(30,Math.hypot(dx,dy)),strength=4200/(d*d);force[i].x+=dx/d*strength;force[i].y+=dy/d*strength;force[j].x-=dx/d*strength;force[j].y-=dy/d*strength;}
      links.forEach(([i,j])=>{const dx=points[j].x-points[i].x,dy=points[j].y-points[i].y,d=Math.max(1,Math.hypot(dx,dy)),f=(d-185)*.025;force[i].x+=dx/d*f;force[i].y+=dy/d*f;force[j].x-=dx/d*f;force[j].y-=dy/d*f;});
      points.forEach((p,i)=>{p.x=Math.max(90,Math.min(width-90,p.x+Math.max(-8,Math.min(8,force[i].x))));p.y=Math.max(85,Math.min(height-90,p.y+Math.max(-8,Math.min(8,force[i].y))));});
      for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){const a=points[i],b=points[j],dx=a.x-b.x,dy=a.y-b.y,ox=170-Math.abs(dx),oy=94-Math.abs(dy);if(ox>0&&oy>0){if(ox<oy){const f=(Math.sign(dx)||1)*ox*.52;a.x+=f;b.x-=f;}else{const f=(Math.sign(dy)||1)*oy*.52;a.y+=f;b.y-=f;}}}
    }
    return points.map(p=>({x:Math.round(Math.max(86,Math.min(width-86,p.x))),y:Math.round(Math.max(85,Math.min(height-85,p.y)))}));
  }

  function selectEntity(card) {
    const model=catalog().find(m=>m.id===card.dataset.opId);
    const u=new URL(location.href);u.searchParams.set('entityId',model?.entityKey||card.querySelector('.om-api').textContent.trim());u.searchParams.set('entityName',card.querySelector('h3').textContent.trim());if(model)u.searchParams.set('ontologyModel',model.id);else u.searchParams.delete('ontologyModel');history.replaceState(null,'',u);
    u.searchParams.set('entityScope',card.dataset.projectOrigin==='shared'?'shared':'created');history.replaceState(null,'',u);
  }
  window.addEventListener('click',e=>{
    const notification=e.target.closest('[data-op-notice]');if(notification){e.preventDefault();e.stopImmediatePropagation();markNoticeRead(notification.dataset.opNotice);return showRequest(notification.dataset.opNotice);}
    const bell=e.target.closest('[data-op-notification-trigger]');if(bell){e.preventDefault();e.stopImmediatePropagation();return publicationNotices();}
    const chain=e.target.closest('.ontology-object-actions .approval-chain-button');
    if(chain){const row=chain.closest('article'),resource=row?.querySelector('[data-ontology-detail]')?.dataset.ontologyDetail;const request=state().requests.slice().reverse().find(r=>r.type==='publish'&&r.status==='已发布'&&r.models.some(m=>'ontology-model-'+m.id===resource));if(request){e.preventDefault();e.stopImmediatePropagation();return showRequest(request.id);}}
    if(e.target.closest('[data-op-open-requests]')){e.preventDefault();e.stopImmediatePropagation();return requests();}
    const page=e.target.closest('#ontologyModulePage');if(!page)return;
    const card=e.target.closest('.om-card:not(.om-create)');
    if(e.target.closest('[data-op-mapping]')){e.preventDefault();e.stopImmediatePropagation();if(!personal()&&!canEdit(cardModel(card,'entity')))return detail(cardModel(card,'entity'));return window.KnoraEntityBuilder.openMapping(card);}
    if(card&&kind()==='entity'&&(e.target.closest('[data-entity-edit],[data-eb-rerun],[data-eb-progress]')||!e.target.closest('button,input'))){selectEntity(card);if(e.target.closest('[data-eb-rerun],[data-eb-progress]'))window.KnoraEntityBuilder.select(card);}
    if(!personal()&&e.target.closest('[data-eb-save],[data-eb-save-return]'))saveDraft(window.KnoraEntityBuilder.state());
    if(personal())return;
    if(card&&MODEL_TYPES.includes(kind())){
      const m=cardModel(card,kind());
      if(e.target.closest('[data-op-request-edit]')){e.preventDefault();e.stopImmediatePropagation();return canEdit(m)?openEditor(m):requestEdit(m);}
      if(m.ownerProject!==project()&&e.target.closest('[data-entity-edit]')){e.preventDefault();e.stopImmediatePropagation();return detail(m);}
      if(e.target.closest('[data-op-detail]')||(m.ownerProject!==project()&&!canEdit(m)&&!e.target.closest('[data-project-group]'))){e.preventDefault();e.stopImmediatePropagation();return detail(m);}
      if(e.target.closest('[data-oac-entity-publish],[data-oac-space-publish]')){e.preventDefault();e.stopImmediatePropagation();return publish([m]);}
    }
    if(e.target.closest('[data-batch-publish]')&&MODEL_TYPES.includes(kind())){e.preventDefault();e.stopImmediatePropagation();const models=Array.from(page.querySelectorAll('.om-batch-card-check:checked:not(:disabled)')).map(box=>box.closest('.om-card')).filter(card=>!card.hidden&&card.style.display!=='none'&&!card.classList.contains('op-level-hidden')).map(card=>cardModel(card,kind()));if(models.length)return publish(models);}
    const graphNode=e.target.closest('.semantic-node');if(graphNode?._opModel){e.preventDefault();e.stopImmediatePropagation();return detail(graphNode._opModel);}
    if(e.target.closest('[data-project-graph-action="发布"]')){e.preventDefault();e.stopImmediatePropagation();const models=Array.from(page.querySelectorAll('.semantic-node')).filter(n=>n._opModel&&n._opModel.ownerProject===project()&&!n.classList.contains('op-level-hidden')&&!n.classList.contains('is-filtered')).map(n=>n._opModel);if(models.length)return publish(models);}
  },true);
  window.addEventListener('change',e=>{if(e.target.matches('[data-op-level],[data-op-origin],[data-op-graph-level]')||e.target.closest('#projectSemanticGraph .semantic-toolbar'))schedule();});
  window.addEventListener('input',e=>{if(e.target.closest('#projectSemanticGraph .semantic-toolbar'))schedule();});
  window.addEventListener('storage',schedule);
  window.KnoraOntologyPublication={portalItems,showRequest,personal,bindApproval,publishBuilder,saveDraft,canEditId,target,accessible,config,currentModel,modelForCard:card=>cardModel(card,'entity')};
  const observer=new MutationObserver(schedule);observer.observe(document.getElementById('ontologyModulePage')||document.getElementById('content')||document.body,{childList:true,subtree:true});
  setInterval(()=>{tick();const mask=document.querySelector('.op-mask[data-request-id]');if(mask){const r=state().requests.find(r=>r.id===mask.dataset.requestId);if(r&&(r.status==='发布中'||(r.status==='已发布'&&!mask.textContent.includes('发布成功'))))showRequest(r.id);}},1000);
  // Support the drawer opened before this deferred script ran.
  document.querySelectorAll('.spm-mask').forEach(mask=>{const title=mask.querySelector('.spm-drawer h2');if(title)bindApproval(mask,title.textContent);});
  window.addEventListener('resize',schedule);
  window.addEventListener('knora:ontology-publication-updated',schedule);
  schedule();
  window.dispatchEvent(new Event('knora:ontology-publication-updated'));
})();
