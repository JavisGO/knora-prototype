(function(){
  'use strict';
  var mode='create',settingsCard=null,patched=false,kbKind='document',emptyCreated={},rebuilding={};
  function q(s,r){return (r||document).querySelector(s)}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function openModal(el){if(el)el.classList.add('open')}
  function closeModal(el){if(el)el.classList.remove('open')}
  function safe(v){return String(v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function syncProjectCopy(){
    var note=q('#createPrivacyNote');if(!note)return;
    var kind=(q('#currentProjectKind')||{}).textContent||'',name=(q('#currentProjectName')||{}).textContent||'';
    var personal=kind.indexOf('个人')>-1||name.indexOf('个人项目')>-1;
    note.innerHTML=personal?'<b>个人项目知识库：</b>创建后默认仅本人使用。':'<b>公共项目知识库：</b>只能使用当前项目中已有的文档资源。';
  }
  function buildBasicForm(){
    var body=q('#createModal .modal-body'); if(!body)return;
    body.innerHTML='<div class="kb-basic-form">'+
      '<div class="kb-form-intro">创建文档知识库，并选择索引模型。创建后可在设置中修改模型并发起知识库重建。</div>'+
      '<div class="field"><label><span class="req">*</span> 图标和名称</label><div class="kb-name-row"><span class="kb-create-icon">▣</span><input class="input" id="createName" placeholder="请输入名称"></div></div>'+
      '<div class="field"><label>描述</label><textarea class="textarea" id="kbCreateDescription" placeholder="说明资料范围、适用业务和维护口径"></textarea></div>'+
      '<div class="field"><label><span class="req">*</span> 索引模型</label><div class="kb-model-cards"><label><input type="radio" name="kbEmbeddingMode" value="builtin" checked><span><b>内置模型</b><small>使用平台内置向量引擎和关键词索引，提供基础知识库构建与检索能力。</small></span></label><label><input type="radio" name="kbEmbeddingMode" value="custom"><span><b>自定义模型</b><small>选择已接入的 Embedding 模型，适配业务语义与多语言检索。</small></span></label></div></div>'+
      '<div class="field kb-custom-model" id="kbCustomModel" hidden><label>Embedding 模型</label><select class="input" id="kbCustomModelSelect"><option>bce_embedding</option><option>bge-m3</option><option>text2vec-large-chinese</option><option>企业行业增强 Embedding</option></select></div>'+
      '<div class="note" id="createPrivacyNote"></div></div>';
    syncProjectCopy();
  }
  function prepareCreate(){mode='create';settingsCard=null;var modal=q('#createModal');if(!modal)return;q('.modal-head h2',modal).textContent='创建文档知识库';q('#confirmCreate',modal).textContent='创建并进入';var rebuild=q('#kbRebuild',modal);if(rebuild)rebuild.hidden=true;var n=q('#createName'),d=q('#kbCreateDescription');if(n)n.value='';if(d)d.value='';var builtin=q('[name="kbEmbeddingMode"][value="builtin"]',modal);if(builtin)builtin.checked=true;q('#kbCustomModel',modal).hidden=true;syncProjectCopy();}
  function keepNewKnowledgeBaseEmpty(){var title=q('#detailTitle'),body=q('#detailDocs');if(!title||!body||!emptyCreated[title.textContent.trim()]||document.querySelector('#kbfBreadcrumb [aria-current]'))return;if(body.children.length)body.innerHTML='';var count=q('#detailDocCount'),chunks=q('#detailChunks'),summary=q('#detailDocSummary');if(count)count.textContent='0';if(chunks)chunks.textContent='0';if(summary)summary.textContent='共 0 条';}
  function prepareSettings(card){
    mode='settings';settingsCard=card;var modal=q('#createModal');if(!modal)return;
    q('.modal-head h2',modal).textContent='编辑知识库信息';q('.modal-head p',modal).textContent=card.querySelector('h3').textContent;
    q('#confirmCreate',modal).textContent='保存配置';var rebuild=q('#kbRebuild',modal);if(rebuild)rebuild.hidden=false;q('#createName',modal).value=card.querySelector('h3').textContent;
    q('#kbCreateDescription',modal).value=(card.querySelector('p')||{}).textContent||'';openModal(modal);
  }
  function normalizeTabsAndCards(){
    var controls=q('#listPage .list-controls');if(controls){var tabs=q('.tabs',controls);if(tabs&&!q('[data-kb-kind]',tabs)){tabs.innerHTML='<button class="tab" data-kb-kind="document">文档知识库</button><button class="tab" data-kb-kind="data">数据知识库</button>';}qa('[data-kb-kind]',tabs).forEach(function(tab){tab.classList.toggle('active',tab.dataset.kbKind===kbKind)});}
    qa('#kbGrid .kb-card:not(.create-card)').forEach(function(card){
      var actions=q('.card-actions',card);if(actions&&!actions.dataset.merged){var id=card.dataset.card,share=q('.share-kb',actions),auth=q('.auth-kb',actions),del=q('[data-action="删除"]',actions);actions.dataset.merged='1';actions.innerHTML='<button class="mini open-kb" data-kb="'+safe(id)+'">设置</button>'+(share?share.outerHTML:'')+(auth?auth.outerHTML:'')+(del?del.outerHTML:'');}var typeChip=q('.chips .chip',card),type=(typeChip||{}).textContent||'';if(typeChip&&type.indexOf('数据')<0&&type!=='文档知识库')typeChip.textContent='文档知识库';if(rebuilding[card.dataset.card]&&!q('.kb-rebuild-chip',card)){q('.chips',card).insertAdjacentHTML('beforeend','<span class="chip kb-rebuild-chip">重建中</span>')}card.style.display=kbKind==='data'?(type.indexOf('数据')>-1?'':'none'):(type.indexOf('数据')>-1?'none':'');
    });
    var create=q('#kbGrid .create-card');if(create){var doc=q('[data-create="document"]',create),data=q('[data-create="data"]',create);if(doc)doc.style.display='';if(data){data.style.display='';data.title='数据知识库创建功能暂未开放';data.classList.add('kb-data-create');}}
  }
  function applyRebuildState(){if(!window.activeKb||!rebuilding[activeKb.id])return;qa('#detailDocs tr').forEach(function(row){var cell=row.querySelector('td:nth-child(8)');if(cell)cell.innerHTML='<span class="chip kb-rebuild-chip">重新解析中</span>'});}
  function saveSettings(){var name=q('#createName').value.trim();if(!name||!settingsCard)return false;q('h3',settingsCard).textContent=name;var p=q('p',settingsCard);if(p)p.textContent=q('#kbCreateDescription').value.trim()||'暂无描述';return true;}
  function startRebuild(){if(!saveSettings())return;var id=settingsCard.dataset.card;rebuilding[id]=true;if(window.activeKb&&activeKb.id===id)activeKb.rebuilding=true;normalizeTabsAndCards();applyRebuildState();closeModal(q('#createModal'));}
  var parsingHelp={general:'适用于文字可直接选取的常规文档，处理速度较快。扫描页或截图中的内容可能无法完整识别。',layout:'根据页面呈现识别文字、标题、图片和表格，适用于扫描件、截图或排版复杂的文档。',mixed:'逐页选择解析方式，优先使用通用解析；无法提取内容的页面自动切换为版面识别解析，适用于常规页面与扫描页混合的文档。'};
  var strategyHelp={auto:'适用于常规文档及多种格式混合导入。系统根据文件类型和解析结果自动选择分片方式；有标题结构的文档按目录层级组织内容。',custom:'适用于纯文本、按条目组织的内容，或需要自行控制切分规则的文档。按指定长度、重叠范围和分隔符切分内容。'};
  function chunkMarkup(){return '<section class="kb-chunk-config"><div class="kb-chunk-head"><h3>此批文档配置</h3><p>为本次选中或上传的文档设置解析方式、分片策略与内容增强选项。</p></div><div class="kb-chunk-body">'+
    '<div class="kb-chunk-row" id="kbParsingRow"><label for="kbParsingMode">解析方式</label><select class="input" id="kbParsingMode" aria-describedby="kbParsingHelp"><option value="general">通用解析</option><option value="layout">版面识别解析</option><option value="mixed">混合模式</option></select><small class="kb-field-help" id="kbParsingHelp" aria-live="polite">'+parsingHelp.general+'</small></div>'+
    '<div class="kb-chunk-row"><label for="kbChunkStrategy">分片策略 <span class="kb-strategy-help" tabindex="0" aria-label="自动模式适用范围" id="kbStrategyHelp">ⓘ<span role="tooltip">'+strategyHelp.auto+'</span></span></label><select class="input" id="kbChunkStrategy"><option value="auto" title="'+strategyHelp.auto+'">自动模式</option><option value="custom" title="'+strategyHelp.custom+'">自定义分片</option><option value="table">表格分片</option><option value="resume">简历分片</option></select></div>'+
    '<div class="kb-secondary-panel show" data-panel="auto"><div class="kb-chunk-note">根据文件类型和解析结果自动选择分片方式；有标题结构的文档按目录层级组织内容，并保留所属章节路径。</div><div class="kb-chunk-panel"><div class="kb-chunk-switch"><span><b>连续文本块合并</b><small>同一标题下连续的正文文本块，在总字符数不超过上限时合并为一个分片。</small></span><button class="kb-toggle" id="kbMergeToggle" type="button" role="switch" aria-label="连续文本块合并" aria-checked="false"></button></div><div class="kb-chunk-row" id="kbMergeLimitRow" hidden><label for="kbMergeLimit">合并长度上限（字符）</label><input class="input" id="kbMergeLimit" type="number" min="1" placeholder="请输入合并后的总字符数上限"><small class="kb-field-help">仅控制连续文本块能否合并，不用于截断已有分片；默认值待确认。</small></div><div class="kb-chunk-switch"><span><b>PageIndex</b><small>为没有目录层级的文档生成目录结构，辅助内容组织与定位。</small></span><button class="kb-toggle" type="button" role="switch" aria-label="PageIndex" aria-checked="false"></button></div></div></div>'+
    '<div class="kb-secondary-panel" data-panel="custom"><div class="kb-chunk-note">按指定规则组织文本。分段标识符用于划分内容段落；文本块长度与重叠长度共同控制切分范围。</div><div class="kb-chunk-grid"><div class="kb-chunk-row"><label for="kbChunkLength">文本块长度</label><input class="input" id="kbChunkLength" type="number" min="1" placeholder="请输入文本块长度"><small class="kb-field-help">控制按文本规则形成的块大小。</small></div><div class="kb-chunk-row"><label for="kbChunkOverlap">重叠长度</label><input class="input" id="kbChunkOverlap" type="number" min="0" placeholder="请输入相邻块的重叠长度"><small class="kb-field-help">相邻切分内容保留的重复范围。</small></div></div><div class="kb-chunk-row"><label for="kbChunkDelimiter">分段标识符／自定义分隔符</label><input class="input" id="kbChunkDelimiter" placeholder="例如：### 或换行符"><small class="kb-field-help">按指定标记划分内容段落。</small></div><small class="kb-field-help">长度单位、默认值、作用于完整分片还是底层小块，以及与分隔符的组合规则，待确认。</small></div>'+
    '<div class="kb-secondary-panel show" data-context-panel><div class="kb-chunk-panel"><b class="kb-enrich-title">图像与表格上下文</b><div class="kb-chunk-grid"><div class="kb-chunk-row"><label for="kbImageContext">图像上下文窗口</label><input class="input" id="kbImageContext" type="number" min="0" placeholder="请输入关联范围"><small class="kb-field-help">关联图片附近的文字，补充图片语境。</small></div><div class="kb-chunk-row"><label for="kbTableContext">表格上下文窗口</label><input class="input" id="kbTableContext" type="number" min="0" placeholder="请输入关联范围"><small class="kb-field-help">关联表格附近的文字，补充表格背景。</small></div></div><small class="kb-field-help">窗口单位、默认值及上下文取值范围待确认。</small></div></div>'+
    '<div class="kb-secondary-panel" data-panel="table"><div class="kb-chunk-row"><label>表格类型</label><div role="radiogroup" aria-label="表格类型" style="display:flex;gap:28px;align-items:center"><label style="display:inline-flex;gap:6px;align-items:center;cursor:pointer"><input type="radio" name="kbTableType" value="auto">自动识别 <span class="kb-strategy-help" tabindex="0" aria-label="自动识别说明">ⓘ<span role="tooltip">根据文档中的表格结构，自动判断使用二维表或复杂表格处理方式。</span></span></label><label style="display:inline-flex;gap:6px;align-items:center;cursor:pointer"><input type="radio" name="kbTableType" value="two-dimensional" checked>二维表 <span class="kb-strategy-help" tabindex="0" aria-label="二维表说明">ⓘ<span role="tooltip">以行、列组织数据，通常每列对应一个字段、每行对应一条记录。表头和数据区域较规则，少量合并单元格也可以属于二维表，例如人员清单、销售明细。</span></span></label><label style="display:inline-flex;gap:6px;align-items:center;cursor:pointer"><input type="radio" name="kbTableType" value="complex">复杂表格 <span class="kb-strategy-help" tabindex="0" aria-label="复杂表格说明">ⓘ<span role="tooltip">包含多级表头、较多合并单元格，或同一 Sheet 内分布多个独立内容块，难以按“每行一条记录”理解的表格，例如分区填写的检验记录、综合报表。</span></span></label></div></div><div class="kb-chunk-row" id="kbCsvRow" hidden><label for="kbCsvDelimiter">CSV 分隔符</label><select class="input" id="kbCsvDelimiter"><option value=",">逗号（,）</option><option value=";">分号（;）</option><option value="tab">制表符（Tab）</option><option value="|">竖线（|）</option><option value="custom">自定义</option></select><input class="input" id="kbCsvCustom" hidden maxlength="1" placeholder="请输入一个分隔字符"><small class="kb-field-help">仅对本次所选 CSV 文件生效。</small></div></div>'+
    '<div class="kb-secondary-panel" data-panel="resume"><div class="kb-chunk-note">适用于简历文档。</div></div>'+
    '<div class="kb-chunk-panel"><b class="kb-enrich-title">内容增强</b><div class="kb-chunk-switch"><span><b>自动关键词</b><small>为每个分片生成可检索关键词。</small></span><button class="kb-toggle on" type="button" role="switch" aria-label="自动关键词" aria-checked="true"></button></div><div class="kb-chunk-switch"><span><b>自动问题</b><small>根据分片生成检索增强问题。</small></span><button class="kb-toggle" type="button" role="switch" aria-label="自动问题" aria-checked="false"></button></div></div></div></section>'}
  function patchImport(){var old=q('#importModal .param-card');if(old&&!old.dataset.merged){old.outerHTML=chunkMarkup();patched=true;}}
  var importStep=1,uploadReady=false;
  function updateCsvConfig(){var row=q('#kbCsvRow');if(!row)return;var names=window.KnoraKnowledgeImport?window.KnoraKnowledgeImport.selectedNames():[];row.hidden=q('#kbChunkStrategy').value!=='table'||!names.some(function(n){return /\.csv$/i.test(n)});q('#kbCsvCustom').hidden=q('#kbCsvDelimiter').value!=='custom';}
  function updateImportSelection(){updateCsvConfig();var count=Number(q('#selectedResourceCount').textContent)||0;if(window.importMode==='upload'&&uploadReady)count=1;var next=q('#kbImportNext');if(next)next.disabled=count===0;var summary=q('#kbImportSummary');if(summary)summary.textContent='已选择 '+count+' 个文档，以下配置对本次所选文档生效。';}
  function syncImportPanes(){var center=q('#centerPane'),upload=q('#uploadPane');if(!center||!upload)return;if(importStep===2){center.hidden=true;upload.hidden=true;return}center.hidden=window.importMode==='upload';upload.hidden=window.importMode!=='upload';}
  function setImportStep(step){
    importStep=step;var modal=q('#importModal');modal.dataset.importStep=String(step);
    syncImportPanes();q('.kb-chunk-config',modal).hidden=step!==2;q('#kbImportSummary').hidden=step!==2;
    q('#kbImportNext').hidden=step!==1;q('#kbImportBack').hidden=step!==2;q('#confirmImport').hidden=step!==2;
    qa('[data-import-step]',modal).forEach(function(item){var current=Number(item.dataset.importStep);item.classList.toggle('active',current===step);item.classList.toggle('done',current<step);if(current===step)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');});
    q('#importFootHint').textContent=step===1?'请从文档中心选择至少一个文档':'确认配置后导入所选文档';
    q('.modal-body',modal).scrollTop=0;updateImportSelection();
  }
  function auditConfigFields(prefix){return '<div class="kb-audit-fields"><label for="'+prefix+'Model">审核模型 <span class="req">*</span></label><select class="input" id="'+prefix+'Model" required><option value="">请选择审核模型</option><option>通用语言模型 A（示例）</option><option>通用语言模型 B（示例）</option></select><label for="'+prefix+'Requirements">补充审核要求（可选）</label><textarea class="input" id="'+prefix+'Requirements" rows="3" placeholder="例如：重点检查数字与单位表达、内容连贯性"></textarea><small>基于解析后的全文文字，检查文本异常、内容连贯性、结构合理性及分片一致性。支持文本理解的语言模型，无需限定视觉模型。</small></div>';}
  function prepareImportSteps(){
    var modal=q('#importModal'),body=q('.modal-body',modal),tabs=q('.modal-tabs',modal);if(tabs)tabs.hidden=true;
    body.insertAdjacentHTML('beforebegin','<ol class="kb-import-steps" aria-label="导入步骤"><li data-import-step="1"><span>1</span>选择文档</li><li data-import-step="2"><span>2</span>配置解析与分片</li></ol>');
    body.insertAdjacentHTML('afterbegin','<div class="kb-chunk-note" id="kbImportSummary" hidden></div>');
    q('#importRule').hidden=true;
    q('.modal-foot',modal).insertAdjacentHTML('beforebegin','<div class="kb-import-review-options"><div class="kb-confirm-import"><div><b>用户确认后入库</b><small>开启后，处理完成的文档需经用户检查并确认入库，才可用于检索。</small></div><button type="button" class="kb-toggle" id="kbRequireConfirmation" role="switch" aria-label="用户确认后入库" aria-checked="false"></button></div><div class="kb-confirm-import kb-ai-child" id="kbAIChild" hidden><div><b>解析后立即 AI 审核</b><small>开启后自动进行 AI 审核，审核结果供人工复核，仍需用户确认后入库。</small></div><button type="button" class="kb-toggle" id="kbAutoAudit" role="switch" aria-label="解析后立即 AI 审核" aria-checked="false"></button></div></div>');
    q('.kb-import-review-options',modal).insertAdjacentHTML('beforeend','<div id="kbImportAuditConfig" class="kb-import-audit-config" hidden>'+auditConfigFields('kbImportAudit')+'</div>');
    var confirm=q('#confirmImport');confirm.insertAdjacentHTML('beforebegin','<button type="button" class="btn" id="kbImportBack" hidden>上一步</button><button type="button" class="btn primary" id="kbImportNext" disabled>下一步</button>');
    q('#kbImportNext').onclick=function(){if(Number(q('#selectedResourceCount').textContent)>0)setImportStep(2)};
    q('#kbImportBack').onclick=function(){setImportStep(1)};
    new MutationObserver(updateImportSelection).observe(q('#selectedResourceCount'),{childList:true,subtree:true,characterData:true});
    new MutationObserver(function(records){records.forEach(function(record){if(modal.classList.contains('open')&&(' '+(record.oldValue||'')+' ').indexOf(' open ')<0){uploadReady=false;qa('#kbRequireConfirmation,#kbAutoAudit').forEach(function(toggle){toggle.classList.remove('on');toggle.setAttribute('aria-checked','false')});q('#kbAIChild').hidden=true;q('#kbImportAuditConfig').hidden=true;q('#kbImportAuditModel').value='';q('#kbImportAuditRequirements').value='';setImportStep(1)}});}).observe(modal,{attributes:true,attributeFilter:['class'],attributeOldValue:true});
    setImportStep(1);
  }
  function openAuditDialog(name,overlay){
    var api=window.KnoraKnowledgeAudit;if(!api)return;var dialog=q('#kbAIAuditDialog',overlay);if(dialog){dialog.showModal();return;}
    dialog=document.createElement('dialog');dialog.id='kbAIAuditDialog';dialog.className='kr-correction-dialog kb-audit-dialog kb-audit-tasks-dialog';
    dialog.innerHTML='<header><button type="button" id="kbAuditBack" hidden>← 返回任务列表</button><strong id="kbAuditViewTitle">AI 文档审核 · 任务列表</strong><button type="button" data-audit-close aria-label="关闭 AI 文档审核">×</button></header><div class="kr-correction-body"><p class="kb-audit-file"></p><div id="kbAuditConfig" hidden>'+auditConfigFields('kbDetailAudit')+'<p id="kbAuditConfigError" role="alert"></p></div><div id="kbAuditContent" aria-live="polite"></div><p class="kr-correction-note">本地原型演示：任务记录保留于当前页面会话，模型及结果为示例，未调用真实模型。AI 审核后仍需用户确认入库。</p></div><footer><button type="button" data-audit-close>关闭</button><button type="button" class="primary" id="kbAuditRun">新建审核任务</button></footer>';
    overlay.appendChild(dialog);q('.kb-audit-file',dialog).textContent=name;var timer,view='list',selectedId=null;
    function taskName(task){return '审核任务 '+String(task.number).padStart(2,'0')}
    function configure(config){view='config';config=config||{};q('#kbDetailAuditModel',dialog).value=config.model||'';q('#kbDetailAuditRequirements',dialog).value=config.requirements||'';q('#kbAuditConfigError',dialog).textContent='';draw();}
    function draw(){clearTimeout(timer);if(!dialog.isConnected)return;var tasks=api.list(name),current=api.get(name),info=window.KnoraKnowledgeIngestion.get(name),busy=current.status==='审核中'||current.status==='待审核',processing=info&&(info.status==='待处理'||info.status==='处理中'),selected=tasks.find(function(t){return t.id===selectedId}),html='';
      q('#kbAuditBack',dialog).hidden=view==='list';q('#kbAuditConfig',dialog).hidden=view!=='config';q('#kbAuditViewTitle',dialog).textContent=view==='list'?'AI 文档审核 · 任务列表':view==='config'?'新建审核任务':selected?taskName(selected):'审核任务';
      var run=q('#kbAuditRun',dialog);run.hidden=view==='detail';run.disabled=busy||processing;run.textContent=view==='config'?'开始审核':'新建审核任务';
      if(view==='list')html=tasks.length?'<div class="kb-audit-table-wrap"><table class="kb-audit-task-table"><thead><tr><th>触发方式</th><th>审核模型</th><th>状态</th><th>创建时间</th><th>操作</th></tr></thead><tbody>'+tasks.map(function(task){return '<tr><td>'+safe(task.trigger)+'</td><td>'+safe(task.config.model)+'</td><td>'+safe(task.status)+'</td><td>'+safe(task.createdAt)+'</td><td><button type="button" data-audit-task="'+safe(task.id)+'">查看</button></td></tr>';}).join('')+'</tbody></table></div>':'<div class="kb-audit-empty">暂无审核任务。可新建审核任务，配置模型后开始审核。</div>';
      if(view==='config')html='<p class="kr-correction-note">本次审核将新增独立任务，已有任务的配置和结果保持不变。</p>';
      if(view==='detail'&&selected){html='<div class="kb-audit-summary"><b>'+safe(selected.status)+'</b><span>'+safe(selected.trigger)+' · '+safe(selected.createdAt)+'</span></div><p>审核模型：'+safe(selected.config.model)+'</p><p>补充审核要求：'+safe(selected.config.requirements||'未填写')+'</p>'+(selected.completedAt?'<p>完成时间：'+safe(selected.completedAt)+'</p>':'');
        if(selected.status==='审核完成')html+='<p>本次示例审核发现 '+selected.issues.length+' 项待复核建议。</p>'+selected.issues.map(function(issue){return '<article class="kb-audit-issue"><header><b>'+safe(issue.title)+'</b><span>'+safe(issue.category)+' · 第 '+issue.page+' 页</span></header><p>'+safe(issue.detail)+'</p><p><strong>建议：</strong>'+safe(issue.suggestion)+'</p></article>';}).join('');
        else html+='<p>'+safe(selected.status==='审核中'?'正在审核，可返回列表或关闭弹窗，任务将继续执行。':'等待文档处理完成后自动开始审核。')+'</p>';
      }
      q('#kbAuditContent',dialog).innerHTML=html;if(busy||processing)timer=setTimeout(draw,350);
    }
    dialog.addEventListener('click',function(e){var task=e.target.closest('[data-audit-task]');if(task){selectedId=task.dataset.auditTask;view='detail';draw();}});
    q('#kbAuditBack',dialog).onclick=function(){view='list';selectedId=null;draw()};
    qa('[data-audit-close]',dialog).forEach(function(button){button.onclick=function(){dialog.close()}});
    q('#kbAuditRun',dialog).onclick=function(){if(view!=='config'){var selected=api.list(name).find(function(t){return t.id===selectedId});configure(selected?selected.config:api.get(name).config);return;}var model=q('#kbDetailAuditModel',dialog).value;if(!model){q('#kbAuditConfigError',dialog).textContent='请选择审核模型。';q('#kbDetailAuditModel',dialog).focus();return;}if(window.KnoraKnowledgeReview.canConfirm()&&api.start(name,{model:model,requirements:q('#kbDetailAuditRequirements',dialog).value.trim()})){selectedId=api.list(name)[0].id;view='detail';draw()}};
    dialog.addEventListener('close',function(){clearTimeout(timer);dialog.remove()});dialog.showModal();draw();
  }
  function openReview(name,processing){
    if(!window.KnoraKnowledgeReview)return;
    var overlay=document.createElement('div');overlay.className='kb-review-overlay';overlay.innerHTML='<header class="kb-review-top"><button type="button">← 返回知识库</button><div><h2>'+safe(name)+'</h2><span>文档解析、版面还原与分片预览</span></div></header><main class="kb-review-host" id="kbReviewHost"></main>';document.body.appendChild(overlay);
    q('button',overlay).onclick=function(){overlay.remove()};
    var host=q('#kbReviewHost');host.innerHTML=window.KnoraKnowledgeReview.render(name);
    window.KnoraKnowledgeReview.bind();
    var bar=q('.kr-document-bar',overlay),top=q('.kb-review-top',overlay),intro=q('.kb-review-top>div',overlay),sync=q('.kr-sync-control',bar);
    var known=processing&&processing.parsing&&processing.strategy?processing:null;
    var sample=['客户分层运营指引.pdf','客户经营分析报告.pdf'].indexOf(name)>-1;
    var parsing=known?known.parsing:(sample?'通用解析（示例）':'未明确'),strategy=known?known.strategy:(sample?'自动模式（示例）':'未明确');
    var extension=name.lastIndexOf('.')>-1?name.split('.').pop().toUpperCase():'格式未明确';
    intro.innerHTML='<h2>'+safe(name)+'</h2><div class="kb-review-meta"><span>'+safe(extension)+' · 5 页 · 示例解析</span><span class="kb-review-method">'+safe(parsing)+'</span><span class="kb-review-method">'+safe(strategy)+'</span></div>';
    if(sync)top.appendChild(sync);if(bar)bar.remove();
    var audit=document.createElement('button');audit.type='button';audit.className='kb-ai-document-review';audit.textContent='AI 文档审核';audit.style.cssText='flex:none;white-space:nowrap';audit.onclick=function(){openAuditDialog(name,overlay)};top.appendChild(audit);
    var ingestion=window.KnoraKnowledgeIngestion,info=ingestion&&ingestion.get(name);
    if(info&&info.requireConfirmation){
      var footer=document.createElement('footer');footer.className='kb-ingest-footer';
      footer.innerHTML='<div><b id="kbIngestStatus"></b><small id="kbIngestHint"></small></div><button type="button" class="btn primary" id="kbConfirmIngest">确认入库</button>';overlay.appendChild(footer);
      var hints={'待处理':'文档等待处理，完成后可检查并确认入库。','处理中':'正在解析文档并生成分片，请稍候。','待确认':'请核对解析结果与分片；确认入库前，本文档不参与检索。','入库中':'正在入库，请稍候。','已入库':'文档已入库，可在知识库列表中开启或关闭检索。','处理失败':'文档处理失败，请返回列表重新入库。'};
      function refresh(){var current=ingestion.get(name);if(!current||current.kbId!==info.kbId)return;var status=current.status;q('#kbIngestStatus',footer).textContent='文档状态：'+status;q('#kbIngestHint',footer).textContent=hints[status]||'';var button=q('button',footer);var auditState=window.KnoraKnowledgeAudit.get(name).status;button.disabled=status!=='待确认'||auditState==='审核中'||auditState==='待审核';button.textContent=status==='入库中'?'入库中…':status==='已入库'?'已入库':'确认入库';}
      function changed(e){if(!overlay.isConnected){window.removeEventListener('kb-ingestion-change',changed);return;}if(e.detail.name===name&&e.detail.kbId===info.kbId)refresh();}
      window.addEventListener('kb-ingestion-change',changed);q('button',footer).onclick=function(){if(window.KnoraKnowledgeReview.canConfirm())ingestion.confirm(name)};
      var back=q('.kb-review-top>button',overlay),close=back.onclick;back.onclick=function(){close();if(!overlay.isConnected)window.removeEventListener('kb-ingestion-change',changed)};refresh();
    }
  }
  document.addEventListener('click',function(e){
    if(e.target.closest('#confirmImport')&&importStep!==2){e.preventDefault();e.stopImmediatePropagation();return;}
    var kind=e.target.closest('[data-kb-kind]');if(kind){e.preventDefault();kbKind=kind.dataset.kbKind;normalizeTabsAndCards();return;}
    var create=e.target.closest('[data-create="document"]');if(create)prepareCreate();
    var data=e.target.closest('[data-create="data"]');if(data){e.preventDefault();e.stopImmediatePropagation();return;}
    var confirm=e.target.closest('#confirmCreate');if(confirm&&mode==='create'){var createName=q('#createName').value.trim();if(createName)setTimeout(function(){emptyCreated[createName]=true;keepNewKnowledgeBaseEmpty()},0);}
    if(confirm&&mode==='settings'){
      e.preventDefault();e.stopImmediatePropagation();if(!saveSettings())return;closeModal(q('#createModal'));return;
    }
    var detailSettings=e.target.closest('#detailPage .page-head .btn:not(.kb-share-current):not(.kb-auth-current):not(.danger):not(.mcp-publish-button):not(#knowledgeDetailRetrievalTest)');if(detailSettings&&window.activeKb){e.preventDefault();e.stopImmediatePropagation();var card=q('#kbGrid [data-card="'+safe(activeKb.id)+'"]');if(card)prepareSettings(card);return;}
    if(e.target.closest('#kbRebuild')){e.preventDefault();e.stopImmediatePropagation();startRebuild();return;}
    var docCell=e.target.closest('#detailDocs td:nth-child(2)');if(docCell&&!docCell.closest('[data-kbf-folder]')){e.preventDefault();e.stopImmediatePropagation();var b=q('b',docCell);if(b)openReview(b.textContent.trim(),{parsing:b.dataset.parseMode,strategy:b.dataset.chunkMode});return;}
    var toggle=e.target.closest('.kb-toggle');if(toggle){toggle.classList.toggle('on');if(toggle.id==='kbRequireConfirmation'){var enabled=toggle.classList.contains('on');q('#kbAIChild').hidden=!enabled;if(!enabled){q('#kbAutoAudit').classList.remove('on');q('#kbAutoAudit').setAttribute('aria-checked','false');q('#kbImportAuditConfig').hidden=true;}}if(toggle.id==='kbAutoAudit')q('#kbImportAuditConfig').hidden=!toggle.classList.contains('on');toggle.setAttribute('aria-checked',String(toggle.classList.contains('on')));if(toggle.id==='kbMergeToggle')q('#kbMergeLimitRow').hidden=!toggle.classList.contains('on');}
    if(e.target.closest('[data-import-tab]'))setTimeout(function(){syncImportPanes();updateImportSelection()},0);
    if(e.target.closest('#pickUpload'))setTimeout(function(){uploadReady=true;q('#selectedResourceCount').textContent='1';updateImportSelection()},0);
  },true);
  document.addEventListener('change',function(e){
    if(['kbChunkStrategy','kbCsvDelimiter'].indexOf(e.target.id)>-1)updateCsvConfig();
    if(e.target.id==='kbParsingMode'){q('#kbParsingHelp').textContent=parsingHelp[e.target.value]||'';}
    if(e.target.name==='kbEmbeddingMode'){var custom=q('#kbCustomModel');if(custom)custom.hidden=e.target.value!=='custom';}
    if(e.target.id==='kbChunkStrategy'){qa('.kb-secondary-panel').forEach(function(p){p.classList.toggle('show',p.hasAttribute('data-context-panel')?['auto','custom'].indexOf(e.target.value)>-1:p.dataset.panel===e.target.value)});var help=q('#kbStrategyHelp'),description=strategyHelp[e.target.value];help.hidden=!description;if(description){help.setAttribute('aria-label',e.target.selectedOptions[0].textContent+'适用范围');q('[role="tooltip"]',help).textContent=description;}q('#kbParsingRow').hidden=e.target.value==='table';}
  });
  function boot(){buildBasicForm();var authRule=q('#authRule');if(authRule)authRule.innerHTML='<b>授权设置：</b>请选择用户并设置使用范围，保存后不改变原知识库归属。';var confirm=q('#confirmCreate');if(confirm)confirm.insertAdjacentHTML('beforebegin','<button type="button" class="btn" id="kbRebuild" hidden>保存并重建</button>');patchImport();prepareImportSteps();normalizeTabsAndCards();var grid=q('#kbGrid');if(grid)new MutationObserver(normalizeTabsAndCards).observe(grid,{childList:true,subtree:true});var modal=q('#importModal');if(modal)new MutationObserver(patchImport).observe(modal,{childList:true,subtree:true});var docs=q('#detailDocs');if(docs)new MutationObserver(function(){keepNewKnowledgeBaseEmpty();applyRebuildState()}).observe(docs,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();


