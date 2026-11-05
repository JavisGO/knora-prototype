(function(){
  'use strict';
  var root, trigger, workbook, fileName='', sheetName='', headers=[], rows=[], mapping='', page=0, importToken=0, profile='mixed', bindings={}, attachments={}, repeats=1;
  var params=new URLSearchParams(location.search), flow=params.get('flow')||'default', project=params.get('project')||'personal';
  var flowName=params.get('flowName')||'', kind='flow';
  var draftKey='knora:batch-preparation:'+project+':'+flow;
  var E=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
  var specs={text:[{id:'用户输入',type:'文本',example:'请分析客户近期活跃度下降的原因'}],mixed:[{id:'用户输入',type:'文本',example:'分析附件中的客户信息'},{id:'数量',type:'数字',example:3},{id:'启用通知',type:'布尔',example:'true'},{id:'截止日期',type:'日期',example:'2026-10-26'},{id:'客户等级',type:'枚举',example:'重点',options:['重点','普通']},{id:'标签',type:'数组',example:'["客户","关怀"]'},{id:'扩展信息',type:'对象',example:'{"渠道":"线上"}'},{id:'参考文件',type:'文件',example:'客户资料.pdf'},{id:'参考图片',type:'图片',example:'客户截图.png'}]};
  function fields(){return kind==='agent'?[{id:'用户输入',type:'文本',example:'请说明运行日志的查看权限'},{id:'参考附件',type:'文件',example:'',optional:true}]:specs[profile]||specs.text}
  function binding(f){var b=bindings[f.id]||(bindings[f.id]={source:'column',column:'',value:''});if(['文件','图片'].includes(f.type))b.source='column';return b}
  function parse(f,value){
    var str=String(value==null?'':value).trim();if(!str)return {error:'必填值缺失'};
    if(f.type==='数字'){if(!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(str)||!Number.isFinite(Number(str)))return {error:'请输入数字'};return {value:Number(str)}}
    if(f.type==='布尔'){if(['true','是','1'].includes(str.toLowerCase()))return {value:true};if(['false','否','0'].includes(str.toLowerCase()))return {value:false};return {error:'应为 true / false 或是 / 否'}}
    if(f.type==='日期'){if(!/^\d{4}-\d{2}-\d{2}$/.test(str)||isNaN(Date.parse(str))||new Date(str).toISOString().slice(0,10)!==str)return {error:'日期应为有效的 YYYY-MM-DD'};return {value:str}}
    if(f.type==='枚举'&&!f.options.includes(str))return {error:'允许值：'+f.options.join('、')};
    if(f.type==='数组'||f.type==='对象'){try{var obj=JSON.parse(str);if(f.type==='数组'?!Array.isArray(obj):obj===null||Array.isArray(obj)||typeof obj!=='object')throw Error();return {value:obj}}catch(e){return {error:'请输入有效的 JSON '+f.type}}}
    if(['文件','图片'].includes(f.type)){var matches=(attachments[f.id]||[]).filter(function(x){return x.name===str});if(matches.length!==1)return {error:matches.length?'存在同名附件，请重命名':'未上传对应附件：'+str};if(f.type==='图片'&&!/\.(png|jpe?g|gif|webp|bmp)$/i.test(str))return {error:'请选择图片附件'};return {value:str}}
    return {value:str};
  }
  function resolve(row){return fields().map(function(f){var b=binding(f);return {field:f,result:f.optional&&!(b.source==='fixed'?b.value:row[Number(b.column)])?{value:''}:b.source==='column'&&b.column===''?{error:'未映射数据列'}:parse(f,b.source==='fixed'?b.value:row[Number(b.column)])}})}
  function attachmentControl(f,b){
    var list=attachments[f.id]||[],fixed=b.source==='fixed';
    return '<div class="fb-parameter-files"><div class="fb-file-actions"><button type="button" class="fb-button" data-upload-for="'+E(f.id)+'">＋ '+(list.length&&fixed?'替换附件':'上传附件')+'</button><input type="file" data-files-for="'+E(f.id)+'" '+(fixed?'':'multiple')+(f.type==='图片'?' accept="image/png,image/jpeg,image/gif,image/webp,image/bmp"':'')+' hidden></div><p class="fb-note">'+(fixed?'此附件用于所有用例':'按所引用数据列中的文件名匹配，可上传多个附件')+'</p><div class="fb-param-file-list">'+list.map(function(file,i){return '<span>'+E(file.name)+'<button type="button" data-remove-for="'+E(f.id)+'" data-file-index="'+i+'" aria-label="移除 '+E(f.id)+' 的 '+E(file.name)+'">×</button></span>'}).join('')+'</div></div>';
  }
  function renderMappings(){
    root.querySelector('#fbMappings').innerHTML=fields().map(function(f){
      var b=binding(f),file=['文件','图片'].includes(f.type),control='';
      if(b.source==='column')control='<select data-column="'+E(f.id)+'" aria-label="'+E(f.id)+'对应数据列"><option value="">请选择数据列</option>'+headers.map(function(h,i){return '<option value="'+i+'" '+(String(i)===b.column?'selected':'')+'>'+E(h)+'</option>'}).join('')+'</select>';
      else if(!file)control=f.type==='布尔'||f.type==='枚举'?'<select data-fixed="'+E(f.id)+'"><option value="">请选择</option>'+(f.options||['true','false']).map(function(x){return '<option '+(b.value===x?'selected':'')+'>'+E(x)+'</option>'}).join('')+'</select>':'<input data-fixed="'+E(f.id)+'" value="'+E(b.value)+'" placeholder="'+E(f.example)+'">';
      return '<div class="fb-typed-row"><div><b>'+(f.optional?'':'<i>*</i>')+E(f.id)+'</b><span class="fb-type">'+f.type+'</span></div><select data-source="'+E(f.id)+'" '+(file?'disabled ':'')+'aria-label="'+E(f.id)+'输入来源"><option value="column" '+(b.source==='column'?'selected':'')+'>引用</option>'+(file?'':'<option value="fixed" '+(b.source==='fixed'?'selected':'')+'>输入</option>')+'</select><div class="fb-param-control">'+control+(file?attachmentControl(f,b):'')+'</div></div>';
    }).join('');
  }
  function title(){return flowName||document.querySelector('.toolbar strong')?.textContent||'当前工作流'}
  function persist(){try{localStorage.setItem(draftKey,JSON.stringify({name:root.querySelector('#fbName').value,description:root.querySelector('#fbDescription').value,fileName:fileName,sheetName:sheetName,headers:headers,rows:rows,mapping:mapping,profile:profile,bindings:bindings,repeats:root.querySelector('#fbRepeat').value}));message('',false)}catch(e){message('本机存储空间不足，草稿未保存；当前数据仍可预览。',true)}}
  function message(s,error){var n=root.querySelector('#fbMessage');n.textContent=s;n.classList.toggle('error',!!error)}
  function close(){importToken++;root.remove();root=null;trigger?.focus()}
  function valid(row){return resolve(row).every(function(x){return !x.result.error})}
  function paint(){
    var loaded=headers.length>0, ok=rows.filter(valid).length;
    root.querySelector('#fbFile').hidden=!loaded;
    root.querySelector('#fbUpload').hidden=loaded;
    root.querySelector('#fbFileName').textContent=fileName;
    root.querySelector('#fbFileMeta').textContent=rows.length+' 条数据 · '+headers.length+' 列';
    var sheet=root.querySelector('#fbSheet');sheet.innerHTML=workbook?workbook.SheetNames.map(function(x){return '<option '+(x===sheetName?'selected':'')+'>'+E(x)+'</option>'}).join(''):'<option>'+E(sheetName||'Sheet1')+'</option>';sheet.disabled=!workbook||workbook.SheetNames.length<2;
    renderMappings();
    var repeatValue=root.querySelector('#fbRepeat').value, repeatOK=/^[1-9]\d*$/.test(repeatValue)&&Number.isSafeInteger(Number(repeatValue));repeats=repeatOK?Number(repeatValue):0;var total=rows.length*repeats;if(!Number.isSafeInteger(total))repeatOK=false;
    root.querySelector('#fbReady').disabled=false;
    root.querySelector('#fbCount').textContent=loaded?rows.length+' 条用例 · '+(repeatOK?total+' 次执行':'次数无效'):'尚未上传数据';
  }
  function useSheet(name){
    var data=XLSX.utils.sheet_to_json(workbook.Sheets[name],{header:1,defval:'',raw:false,blankrows:false});
    if(data.length<2)throw Error('文件需包含表头和至少一条测试数据。');
    var first=data[0].map(function(x){return String(x).trim()});
    if(!first.length||first.some(function(x){return !x})||new Set(first).size!==first.length)throw Error('表头不能为空或重复，请修正文件后重新上传。');
    var incoming=data.slice(1).filter(function(r){return r.some(function(x){return String(x).trim()!==''})});
    if(!incoming.length)throw Error('未找到测试数据。');
    if(incoming.some(function(r){return r.length>first.length}))throw Error('存在超出表头范围的数据，请检查列数。');
    headers=first;rows=incoming;sheetName=name;page=0;var index=headers.indexOf('用户输入');mapping=index<0?'':String(index);fields().forEach(function(f){var b=binding(f),idx=headers.indexOf(f.id);b.column=idx<0?'':String(idx)});paint();persist();
  }
  async function upload(file){
    if(!file)return;
    if(!/\.(xlsx|xls|csv)$/i.test(file.name))return message('请上传 Excel（.xlsx / .xls）或 CSV 文件。',true);
    if(file.size>10*1024*1024)return message('文件超过 10 MB，请拆分后上传。',true);
    var token=++importToken;message('正在读取文件…',false);
    try{var buffer=await file.arrayBuffer();if(!root||token!==importToken)return;var book=XLSX.read(buffer,{type:'array'}),old=workbook,oldName=fileName;workbook=book;fileName=file.name;try{useSheet(book.SheetNames[0])}catch(e){workbook=old;fileName=oldName;throw e}}
    catch(e){if(root&&token===importToken)message(e.message||'文件读取失败，请检查文件格式。',true)}
  }
  function download(){var book=XLSX.utils.book_new(),sheet=XLSX.utils.aoa_to_sheet([fields().map(function(f){return f.id})]);sheet['!cols']=fields().map(function(){return {wch:32}});XLSX.utils.book_append_sheet(book,sheet,'测试数据');var guide=[['参数','类型','必填','格式及示例']].concat(fields().map(function(f){return [f.id,f.type,f.optional?'否':'是',String(f.example)+(f.options?'；允许值：'+f.options.join('、'):'')]}));guide.push(['填写说明','','','测试数据表首行为表头，第二行开始填用例。附件按文件名匹配；重复次数在页面中设置。']);var ws=XLSX.utils.aoa_to_sheet(guide);ws['!cols']=[{wch:22},{wch:12},{wch:10},{wch:90}];XLSX.utils.book_append_sheet(book,ws,'填写说明');XLSX.writeFile(book,title()+'_评测模板.xlsx');message('模板已下载，包含测试数据表和参数填写说明。',false)}
  function open(button,context){
    if(root)return;context=context||{};kind=context.kind||'flow';flow=context.flow||params.get('flow')||'default';project=context.project||params.get('project')||'personal';flowName=context.name||params.get('flowName')||'';draftKey='knora:batch-preparation:'+project+':'+flow;trigger=button||document.activeElement;workbook=null;fileName='';sheetName='';headers=[];rows=[];mapping='';page=0;profile='mixed';bindings={};attachments={};repeats=1;
    root=document.createElement('div');root.className='fb-mask';root.innerHTML='<section class="fb-dialog" role="dialog" aria-modal="true" aria-labelledby="fbTitle"><header class="fb-header"><div class="fb-heading-group"><button class="fb-button" id="fbBackTasks" aria-label="返回任务列表" title="返回任务列表">←</button><div><h2 id="fbTitle">评测配置</h2><p>'+E(title())+'</p></div></div><div class="fb-header-actions"><button data-fb-close aria-label="关闭评测">×</button></div></header><div class="fb-body"><section class="fb-section"><h3>任务信息</h3><label class="fb-name"><span><i>*</i> 任务名称</span><input id="fbName" maxlength="100"></label><label class="fb-name fb-description"><span>任务描述</span><textarea id="fbDescription" maxlength="1000" placeholder="选填，说明本次调试的目的或关注点"></textarea></label></section><section class="fb-section"><div class="fb-section-head"><h3>测试数据</h3><button id="fbDownload" class="fb-button">↓ 下载模板</button></div><div id="fbUpload" class="fb-upload"><span class="fb-upload-icon">↥</span><b>将文件拖到此处，或<button id="fbChoose">选择文件</button></b><p>支持 Excel / CSV，文件不超过 10 MB；首行为表头，每行是一条用例</p></div><input id="fbInput" type="file" accept=".xlsx,.xls,.csv" hidden><div id="fbFile" class="fb-file" hidden><span class="fb-file-icon">▤</span><div><b id="fbFileName"></b><small id="fbFileMeta"></small></div><select id="fbSheet" aria-label="选择工作表"></select><button id="fbReplace" class="fb-button">替换文件</button></div></section><section class="fb-section"><h3>运行设置</h3><div class="fb-repeat"><label>每条用例运行 <input id="fbRepeat" type="number" min="1" step="1" value="1"> 次</label></div><p class="fb-note">每次使用相同输入和配置快照，独立运行；调整工作流后再次运行生成新任务。</p></section><section class="fb-section"><div class="fb-section-head"><h3>输入参数映射</h3><span class="fb-hint">每个参数独立映射数据列</span></div><div class="fb-typed-head"><span>工作流输入参数</span><span>输入来源</span><span>参数值 / 数据列</span></div><div id="fbMappings"></div></section></div><footer class="fb-footer"><div><span id="fbCount"></span><small id="fbMessage" role="status"></small></div><button class="fb-button primary" id="fbReady">开始运行</button></footer></section>';
    document.documentElement.appendChild(root);if(kind==='flow'){var version=context.version||document.querySelector('#version')?.value||'';if(!version){try{version=JSON.parse(localStorage.getItem('aigo-replica-v1:'+flow)||'null')?.version||''}catch(e){}}var versionRow=document.createElement('label');versionRow.className='fb-name';versionRow.style.marginTop='14px';versionRow.innerHTML='<span>版本</span><input id="fbVersion" readonly value="'+E(version||'当前保存版本（未记录编号）')+'">';root.querySelector('.fb-description').before(versionRow);}if(kind==='agent'){root.querySelector('.fb-typed-head span').textContent='智能体输入';root.querySelector('.fb-repeat').nextElementSibling.textContent='每次运行使用独立会话和相同配置，互不继承对话上下文。';}root.querySelector('#fbName').value=title()+'_评测_'+new Date().toLocaleString('zh-CN',{hour12:false}).replace(/[/: ]/g,'');
    try{var saved=JSON.parse(localStorage.getItem(draftKey)||'null');if(saved){root.querySelector('#fbName').value=saved.name;root.querySelector('#fbDescription').value=saved.description||'';fileName=saved.fileName;sheetName=saved.sheetName;headers=saved.headers;rows=saved.rows;mapping=saved.mapping;bindings=saved.bindings||{};if(!saved.bindings)binding(specs.text[0]).column=saved.mapping||'';root.querySelector('#fbRepeat').value=saved.repeats||1;message('',false)}}catch(e){}
    root.querySelectorAll('[data-fb-close]').forEach(function(b){b.onclick=close});
    root.querySelector('#fbDownload').onclick=download;
    root.querySelector('#fbChoose').onclick=root.querySelector('#fbReplace').onclick=function(){root.querySelector('#fbInput').click()};
    root.querySelector('#fbInput').onchange=function(e){upload(e.target.files[0]);e.target.value=''};

    root.querySelector('#fbMappings').onchange=function(e){var id=e.target.dataset.source||e.target.dataset.column||e.target.dataset.fixed;if(!id)return;var b=bindings[id];if(e.target.hasAttribute('data-source')){b.source=e.target.value;var f=fields().find(function(x){return x.id===id});if(['文件','图片'].includes(f.type)&&b.source==='fixed')b.value=(attachments[id]||[])[0]?.name||'';}else if(e.target.hasAttribute('data-column'))b.column=e.target.value;else b.value=e.target.value;paint();persist()};
    root.querySelector('#fbRepeat').oninput=function(){paint();persist()};
    root.querySelector('#fbMappings').addEventListener('click',function(e){
      var upload=e.target.closest('[data-upload-for]'),remove=e.target.closest('[data-remove-for]');
      if(upload){var input=Array.from(root.querySelectorAll('[data-files-for]')).find(function(x){return x.dataset.filesFor===upload.dataset.uploadFor});input.click()}
      if(remove){var id=remove.dataset.removeFor,list=attachments[id]||[],removed=list.splice(Number(remove.dataset.fileIndex),1)[0];if(removed&&binding({id:id}).value===removed.name)bindings[id].value='';paint();persist()}
    });
    root.querySelector('#fbMappings').addEventListener('change',function(e){
      if(!e.target.hasAttribute('data-files-for'))return;
      var id=e.target.dataset.filesFor,f=fields().find(function(x){return x.id===id}),chosen=Array.from(e.target.files),b=binding(f);if(!chosen.length)return;
      if(f.type==='图片'&&chosen.some(function(x){return !/\.(png|jpe?g|gif|webp|bmp)$/i.test(x.name)})){e.target.value='';message('请为「'+id+'」上传图片文件。',true);return}
      var list=b.source==='fixed'?chosen.slice(0,1):(attachments[id]||[]).concat(chosen);
      if(new Set(list.map(function(x){return x.name})).size!==list.length){e.target.value='';message('「'+id+'」存在同名附件，请重命名后上传。',true);return}
      attachments[id]=list;if(b.source==='fixed')b.value=list[0].name;paint();persist();
    });
    root.querySelector('#fbSheet').onchange=function(e){try{useSheet(e.target.value)}catch(err){e.target.value=sheetName;message(err.message,true)}};
    root.querySelector('#fbDescription').oninput=persist;
    root.querySelector('#fbBackTasks').onclick=function(){close();window.KnoraBatchTasks.open({version:version,kind:kind,flow:flow,project:project,name:title()})};
    root.querySelector('#fbName').oninput=function(){paint();persist()};
    var drop=root.querySelector('#fbUpload');drop.ondragover=function(e){e.preventDefault();drop.classList.add('dragging')};drop.ondragleave=function(){drop.classList.remove('dragging')};drop.ondrop=function(e){e.preventDefault();drop.classList.remove('dragging');upload(e.dataTransfer.files[0])};
    root.querySelector('#fbReady').onclick=function(){
      var snapshot={version:document.querySelector('#version')?.value||'当前编辑配置',nodes:typeof nodes==='undefined'?[]:JSON.parse(JSON.stringify(nodes)),fields:Array.from(document.querySelectorAll('.form input,.form select,.desc')).map(function(n){return {value:n.value,checked:n.checked}})};
      if(!document.querySelector('[data-flow-preparation]')){var stored=null;try{stored=JSON.parse(localStorage.getItem('aigo-replica-v1:'+flow)||'null')}catch(e){}snapshot={version:'当前保存配置',nodes:stored?.nodes||[],fields:stored?.fields||[]};}
      var demoRows=rows.length?rows:[[],[],[]],runRepeats=Number.isSafeInteger(repeats)&&repeats>0?repeats:1;
      if(kind==='agent'){snapshot=window.KnoraAgentEvaluationSnapshot?.()||JSON.parse(localStorage.getItem('knora:react-config:v1:'+project+':'+flow.replace(/^agent:/,''))||'null')||{};}
      var data={kind:kind,version:kind==='flow'?root.querySelector('#fbVersion').value:null,flow:flow,project:project,flowName:title(),name:root.querySelector('#fbName').value.trim()||title()+'_评测',description:root.querySelector('#fbDescription').value.trim(),repeats:runRepeats,snapshot:snapshot,configuration:{fileName:fileName,sheetName:sheetName,mappings:fields().map(function(f){var b=binding(f);return {name:f.id,type:f.type,source:b.source,value:b.source==='column'?b.column:b.value}})},inputs:demoRows.map(function(row){var input={};resolve(row).forEach(function(x){if(!x.result.error){input[x.field.id]=x.result.value;return}var value=x.field.example;if(x.field.type==='数组'||x.field.type==='对象')value=JSON.parse(value);if(x.field.type==='布尔')value=value==='true';input[x.field.id]=value});return input})};
      try{var task=window.KnoraBatchTasks.create(data);close();window.KnoraBatchTasks.open({version:version,kind:kind,flow:flow,project:project,name:title(),current:task.id})}catch(e){message('任务保存失败：'+e.message,true)}
    };
    root.onkeydown=function(e){if(e.key==='Escape'){e.stopPropagation();close();return}if(e.key==='Tab'){var items=Array.from(root.querySelectorAll('button,input,select')).filter(function(n){return !n.disabled&&n.getClientRects().length}),first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}};
    paint();root.querySelector('#fbName').focus();
  }
  window.KnoraBatchPreparation={open:function(context){open(document.querySelector('[data-flow-preparation]')||document.activeElement,context)}};
  document.addEventListener('click',function(e){var b=e.target.closest('[data-flow-preparation]');if(b){e.preventDefault();e.stopImmediatePropagation();window.KnoraBatchTasks.open({kind:kind,flow:flow,project:project,name:title()})}},true);
})();
