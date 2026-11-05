/* Business identity excludes internal row IDs and requires sufficient evidence. */
window.reviewBusinessIdentity=function(kind,r){
 const n=v=>String(v??'').trim().toLowerCase();
 if(kind==='entity')return n(r.code)||n(r.name);
 if(kind==='relation'||kind==='event'&&r.primaryKeys?.includes('from'))return n(r.from)&&n(r.to)?JSON.stringify([kind,n(r.name),n(r.from),n(r.to)]):'';
 const context=['contract','batch','validFrom','validTo'].map(k=>n(r[k]));
 if(n(r.code))return JSON.stringify([kind,n(r.name),n(r.code),...context]);
 const required=kind==='relation'?['name','from','to','date']:['from','to','code','supplyType','price','quantity','date','approval'];
 if(required.some(k=>!n(r[k])))return '';
 return JSON.stringify([kind,...required.map(k=>n(r[k])),...context]);
};
/* Shared treatment preview: proposals remain local until explicitly applied. */
window.installReviewTreatment=function(env){
 const E=env.escape;let draft;
 const standardCategories=['格式与数据类型不统一','单位度量不统一','空值处理不一致'];
 const fieldLabel=k=>env.kind()!=='entity'?({approval:'审批状态',from:'供应商 / 供应商编号（必填）',to:'SY物料 / 物料编号（必填）',code:'采购或供货记录编号',supplyType:'供应类型',price:'采购单价',quantity:'采购数量',approval:'审批状态',date:'供货日期'}[k]||labels[k]):labels[k];
 const labels={name:'名称',code:'业务编号',level:'等级 / 分类',address:'地址 / 规格',unit:'单位',from:'起点实体',to:'终点实体',subject:'关联实体',date:'发生时间',supplyType:'供应类型',price:'采购单价',quantity:'采购数量'};
 const keys=()=>env.kind()==='entity'?['name','code','level','address','unit']:env.kind()==='relation'?['from','to','code','supplyType','price','quantity','date']:['from','to','code','supplyType','price','quantity','date','approval'];
 const valid=r=>!['excluded','merged'].includes(r.status);
 const recordTitle=r=>env.kind()==='entity'?(r.name||r.code||r.id):[r.from||'起点缺失',r.to||'终点缺失',r.code||r.id].join(' · ');
 const source=r=>env.tableName()+' · '+r.id;
 const button=(text,action)=>'<button data-treatment="'+action+'">'+text+'</button>';
 const norm=v=>String(v??'').trim().toLowerCase();
 const shortName=v=>norm(v).replace(/有限责任公司$|有限公司$|公司$/,'');
 function pool(){
  const local=env.rows().filter(valid).map(r=>({row:r,origin:'当前表 · '+source(r),existing:false}));
  return env.configured()?local.concat(env.references().filter(valid).map(r=>({row:r,origin:'已有实例 · '+env.element()+' · '+r.id,existing:true}))):local;
 }
 function match(row,c){
  if(!c.existing&&c.row.id===row.id)return 0;
  const r=c.row;
  if(env.kind()!=='entity'){const a=window.reviewBusinessIdentity(env.kind(),row),b=window.reviewBusinessIdentity(env.kind(),r);return a&&a===b?100:0;}
  if(env.kind()==='entity'){
   if(norm(row.code)&&norm(r.code))return norm(row.code)===norm(r.code)?100:0;
   if(norm(row.name)&&norm(row.name)===norm(r.name))return 80;
   return shortName(row.name)&&shortName(row.name)===shortName(r.name)?60:0;
  }
  const links=env.kind()==='relation'?['from','to']:['subject'];
  if(!norm(row.name)||norm(row.name)!==norm(r.name)||links.some(k=>!norm(row[k])||norm(row[k])!==norm(r[k])))return 0;
  if(env.kind()==='event'&&norm(row.date)&&norm(r.date)&&norm(row.date)!==norm(r.date))return 0;
  return 90;
 }
 function related(row){return pool().map(c=>({...c,score:match(row,c)})).filter(c=>c.score>0).sort((a,b)=>b.score-a.score||Number(b.existing)-Number(a.existing))}
 function best(candidates,key){return candidates.filter(c=>norm(c.row[key])).sort((a,b)=>(b.score||0)-(a.score||0)||Number(b.existing)-Number(a.existing))[0]}
 function referenceColumns(rows){
  const candidates=pool().filter(c=>rows.every(r=>match(r,c)>0||!c.existing&&c.row.id===r.id));
  const rank=c=>keys().filter(k=>norm(c.row[k])).length;
  return [false,true].flatMap(existing=>{
   const list=candidates.filter(c=>c.existing===existing).sort((a,b)=>rank(b)-rank(a)||String(a.row.id).localeCompare(String(b.row.id)));
   const outside=list.filter(c=>c.existing||!rows.some(r=>r.id===c.row.id));
   const c=outside[0]||list[0];return c?[{...c,score:100,row:{...c.row}}]:[];
  });
 }
 function buckets(){const result=[];draft.rows.forEach(row=>{let g=result.find(rows=>rows.every(r=>match(row,{row:r,existing:false})>0));if(!g)result.push(g=[]);g.push(row)});return result}
 function open(mode,ids){
  if(env.readonly())return;
  const selected=ids?.length?ids:env.selected(),rows=env.rows().filter(r=>valid(r)&&(!selected.length||selected.includes(r.id)));
  draft={mode,rows,selected:!!selected.length,groups:[],active:0,category:standardCategories[0]};
  build();
  if(mode==='standard'){
   const records=draft.groups;
   draft.groups=standardCategories.map(category=>{
    const matching=records.filter(g=>g.categories.includes(category));
    return {title:category,categories:[category],rows:matching.flatMap(g=>g.rows),changes:matching.flatMap(g=>g.changes.map(c=>({...c,readonly:c.category!==category||c.old===c.value,checked:c.category===category&&c.old!==c.value,value:c.category===category?c.value:c.old}))),applied:false};
   });
  }
  if(mode==='standard')draft.category=standardCategories[0];
  draft.groups.forEach(g=>{g.processed=false;if(g.changes)g.changes.forEach(c=>{c.proposed=c.value;c.value=c.old;c.autoProcessed=false;c.confidence=null});else keys().forEach(k=>{g.winners[k]={value:g.rows[0][k]??'',origin:'当前表 · '+source(g.rows[0])}})});
  env.modal('treatment',({standard:'标准化',align:'数据对齐',merge:'数据融合'})[mode],'','',button('关闭','cancel')+button('应用当前页签','apply-current')+button('应用全部已选结果','apply-all'));
  draw();
 }
 function build(){
  if(draft.mode==='align'){
   buckets().forEach(rows=>{
    const references=referenceColumns(rows),changes=[];
    rows.forEach(row=>keys().forEach(key=>{const ref=best(references,key),old=String(row[key]??''),value=ref?String(ref.row[key]):old;
     changes.push({row,key,old,value,reference:ref||null,origin:ref?.origin||'当前表 · '+source(row),checked:true});
    }));
    const targets=draft.selected?rows:rows.filter(r=>changes.some(c=>c.row===r&&c.old!==c.value));if(!targets.length)return;
    draft.groups.push({title:recordTitle(targets[0])+' · '+targets.length+' 条',rows:targets,references,changes:changes.filter(c=>targets.includes(c.row)),applied:false});
   });return;
  }
  if(draft.mode==='merge'){
   const buckets=[];
   draft.rows.forEach(row=>{let group=buckets.find(g=>g.every(r=>match(row,{row:r,existing:false})>0));if(!group)buckets.push(group=[]);group.push(row)});
   buckets.filter(rows=>draft.selected||rows.length>1).forEach(rows=>{
    const references=referenceColumns(rows);
    const candidates=rows.map(row=>({row:{...row},origin:'当前表 · '+source(row),existing:false,score:100})).concat(references);
    const winners=Object.fromEntries(keys().map(key=>{const c=best(candidates,key);return [key,{value:c?.row[key]??'',origin:c?.origin||'手动输入'}]}));
    draft.groups.push({title:recordTitle(rows[0])+' · '+rows.length+' 条',rows,references,candidates,winners,survivor:rows[0].id,checked:rows.length>1,applied:false});
   });return;
  }
  draft.rows.forEach(row=>{
   const sourceFields=Object.keys(row.sourceValues||{});
   const descriptors=sourceFields.map(label=>({label,key:Object.keys(row.sourceAliases||{}).find(k=>row.sourceAliases[k]===label)||null,sourceKey:label}));
   keys().forEach(key=>{if(!descriptors.some(d=>d.key===key)&&(!sourceFields.length||Object.hasOwn(row,key)))descriptors.push({key,label:fieldLabel(key)});});
   const changes=descriptors.map(({key,label,sourceKey})=>{
    const raw=key?row[key]??row.sourceValues?.[sourceKey]??'':row.sourceValues[sourceKey]??'',numeric=row.standardFieldTypes?.[key||sourceKey]==='number';const old=numeric&&typeof raw==='number'?raw:String(raw);
    let value=String(old).trim(),category=standardCategories[0];const reasons=[];if(value!==String(old))reasons.push('移除首尾空格');if(numeric&&value!==''&&/^[+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?$/.test(value)){value=Number(value.replaceAll(',',''));if(typeof raw!=='number')reasons.push('文本数值转换为数值类型');}
    if(key==='unit'&&value==='只'){value='个';category=standardCategories[1];reasons.push('单位统一：只 → 个');}
    if(key==='date'&&/^\d{4}\/\d{2}\/\d{2}$/.test(value)){const normalized=value.replaceAll('/','-'),date=new Date(normalized);if(!Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===normalized){value=normalized;reasons.push('日期格式统一为 YYYY-MM-DD');}}
    if((old.length&&!value)||/^(null|n\/a)$/i.test(value)){value='';category=standardCategories[2];reasons.splice(0,reasons.length,'空白或空值标记统一为空值');}
    return {row,key,label,sourceKey,old,value,category,reason:reasons.join('；'),origin:'当前表 · '+source(row),checked:true};
   });
   if(changes.some(c=>c.old!==c.value))draft.groups.push({title:recordTitle(row).trim(),rows:[row],changes,categories:[...new Set(changes.filter(c=>c.old!==c.value).map(c=>c.category))],applied:false});
  });
 }

 function groupProblems(group){
  if(draft.mode==='standard')return group.changes.filter(c=>c.reason).map(c=>c.label+'：'+c.reason).join('；');
  const rows=group.rows||group.changes?.map(c=>c.row)||[];
  const problems=[...new Set(rows.flatMap(r=>env.problemTypes?.(r)||[]))];
  return problems.length?'问题类型：'+problems.join('、'):'暂无已识别的问题类型';
 }
 function current(){return draft.groups[draft.active]}
 function ready(g){return g&&!g.applied&&(draft.mode==='merge'?g.checked&&g.processed:g.changes.some(c=>!c.readonly&&c.checked&&c.value!==c.old))}
 const sourceTag=c=>'<span class="tag">'+(c.existing?'已有实例':'当前表')+'</span><small>'+E(c.existing?env.element():env.tableName())+'</small>';
 const recordHead=(r,role,existing=false)=>{
  const primary=env.kind()!=='entity'?((r.sourceAliases?.from||'起点编号')+' + '+(r.sourceAliases?.to||'终点编号')+'（联合主键）'):r.sourceAliases?.[env.kind()==='event'?'id':'code']||({entity:'业务编号',relation:'采购或供货记录编号',event:'事件编号'})[env.kind()];
  const label=role.startsWith('待')?role:existing?(env.kind()==='relation'?'关系实例':env.kind()==='event'?'事件实例':'实体实例'):'当前表参考';
  return '<th><span>'+E(primary)+'</span> <span class="tag">'+label+'</span>'+'</th>';
 };
 const confidenceBadge=c=>c.origin==='手动输入'?'<small class="treat-confidence">手动编辑</small>':c.confidence!=null?'<small class="treat-confidence" title="原型模拟置信度，非模型实际评分">置信度 '+c.confidence+'% · 模拟</small>':'';
 function draw(){
  closeChoices();
  const g=current(),merge=draft.mode==='merge';
  let html=draft.mode==='standard'?'<nav class="treat-tabs standard-category-tabs" aria-label="标准化分类">'+standardCategories.map((name,i)=>'<button data-treatment="category" data-index="'+i+'" class="'+(draft.category===name?'primary':'')+'" aria-pressed="'+(draft.category===name)+'">'+name+'（'+(draft.groups.find(x=>x.categories.includes(name))?.rows.length||0)+'）</button>').join('')+'</nav><p class="muted">每列是一条记录，仅当前分类下存在问题的字段可编辑；其他字段只读。</p>':'';html+='<div class="treat-toolbar">';
  html+=(draft.mode==='standard'?'':'<nav class="treat-tabs" aria-label="处理结果页签">'+draft.groups.map((x,i)=>draft.mode==='standard'&&!x.categories.includes(draft.category)?'':'<button data-treatment="tab" data-index="'+i+'" title="'+E(groupProblems(x))+'" aria-pressed="'+(draft.active===i)+'" class="'+(draft.active===i?'primary':'')+'">'+E(x.title)+(x.applied?' · 已应用':'')+'</button>').join('')+'</nav>')+button('自动处理','recommend')+'</div>';
  if(g&&merge){
   html+='<div class="compare-scroll"><table class="compare"><thead><tr><th>字段</th>'+g.candidates.map((c,i)=>recordHead(c.row,i<g.rows.length?'待融合':'参考 · 只读',c.existing)).join('')+'<th>最终采用</th></tr></thead><tbody>'+keys().map(k=>'<tr><td>'+fieldLabel(k)+'</td>'+g.candidates.map(c=>'<td>'+E(c.row[k]??'')+'</td>').join('')+'<td><div class="treat-combo"><input data-treat-value="'+k+'" value="'+E(g.winners[k].value)+'" '+(g.applied?'disabled':'')+' aria-label="'+fieldLabel(k)+'最终值" role="combobox" aria-autocomplete="none" aria-expanded="false" aria-controls="treat-options" autocomplete="off"><button type="button" data-treatment="dropdown" data-key="'+k+'" '+(g.applied?'disabled':'')+' aria-label="展开'+fieldLabel(k)+'候选值">▾</button></div>'+confidenceBadge(g.winners[k])+'</td></tr>').join('')+'</tbody></table></div>';
  }else if(g&&draft.mode==='align'){
   html+='<div class="compare-scroll"><table class="compare"><thead><tr><th>字段</th>'+g.rows.map(r=>recordHead(r,'待对齐')).join('')+g.references.map(c=>recordHead(c.row,'参考 · 只读',c.existing)).join('')+'</tr></thead><tbody>'+keys().map(k=>'<tr><td>'+fieldLabel(k)+'</td>'+g.rows.map(r=>{const i=g.changes.findIndex(c=>c.row===r&&c.key===k),c=g.changes[i];return '<td class="'+(c.value!==c.old?'treat-changed':'')+'"><div class="treat-combo"><input data-treat-change="'+i+'" data-align-combo="true" role="combobox" aria-expanded="false" aria-controls="treat-options" autocomplete="off" value="'+E(c.value)+'" '+(g.applied?'disabled':'')+' aria-label="'+E(r.name||r.id)+' '+fieldLabel(k)+'修改后"><button type="button" data-treatment="align-dropdown" data-index="'+i+'" '+(g.applied?'disabled':'')+' aria-label="展开候选值">▾</button></div><small>修改前：'+E(c.old||'空')+'</small>'+confidenceBadge(c)+'</td>'}).join('')+g.references.map(c=>'<td>'+E(c.row[k]??'')+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
  }else if(g&&g.rows.length){
   const fields=[...new Map(g.changes.map(c=>[c.sourceKey||c.key,c.label])).entries()];const refs=[...new Map(g.rows.flatMap(r=>related(r)).filter(c=>!g.rows.some(r=>!c.existing&&r.id===c.row.id)).map(c=>[(c.existing?'instance:':'table:')+c.row.id,c])).values()];
   html+='<div class="compare-scroll standard-matrix"><table class="compare"><thead><tr><th>字段</th>'+g.rows.map(r=>'<th>'+E(recordTitle(r).trim())+'<small>'+E(r.code||r.id)+'</small></th>').join('')+refs.map(c=>'<th>'+E(recordTitle(c.row))+'<small>'+(c.existing?'已有实例 · 只读':'当前表参考 · 只读')+'</small><small>'+E(c.row.code||c.row.id)+'</small></th>').join('')+'</tr></thead><tbody>'+fields.map(([key,label])=>'<tr><td>'+E(label)+'</td>'+g.rows.map(r=>{
    const i=g.changes.findIndex(c=>c.row===r&&(c.sourceKey||c.key)===key),c=g.changes[i];if(!c)return '<td>—</td>';
    if(c.readonly)return '<td class="standard-readonly">'+E((c.key?r[c.key]:r.sourceValues?.[c.sourceKey])??'')+'</td>';

    return '<td class="'+(c.value!==c.old?'treat-changed':'')+'"><input data-treat-change="'+i+'" value="'+E(c.value)+'" '+(g.applied?'disabled':'')+' aria-label="'+E(recordTitle(r)+' '+label)+'标准化后"><small class="standard-reason">'+E(c.origin==='手动输入'?'手动编辑':c.autoProcessed?c.reason:'待处理')+'</small></td>';
   }).join('')+refs.map(ref=>{const field=g.changes.find(c=>(c.sourceKey||c.key)===key),value=field.key?ref.row[field.key]??ref.row.sourceValues?.[field.sourceKey]:ref.row.sourceValues?.[field.sourceKey];return '<td class="standard-readonly">'+E(value??'—')+(typeof value==='number'?'<small>数值</small>':'')+'</td>'}).join('')+'</tr>').join('')+'</tbody></table></div>';
  }else html+='<div class="empty treat-blank"><p>暂无可处理的数据</p><small>当前范围内没有可用的处理建议</small></div>';
  env.body().innerHTML=html;
  if(draft.mode==='standard'){
   const nav=env.body().querySelector('.standard-category-tabs'),toolbar=env.body().querySelector('.treat-toolbar'),auto=toolbar?.querySelector('[data-treatment="recommend"]');
   if(nav&&auto){const row=document.createElement('div');row.className='standard-category-header';nav.before(row);row.append(nav,auto);toolbar.remove();}
  }
  document.querySelectorAll('[data-treatment="recommend"]').forEach(b=>b.disabled=!draft.groups.some(g=>!g.applied&&(draft.mode!=='standard'||g.changes.some(c=>!c.readonly))));
  updateApplyButtons();
 }
 function updateApplyButtons(){
  const g=current(),count=draft.mode==='standard'?new Set(draft.groups.filter(ready).flatMap(g=>g.changes.filter(c=>!c.readonly&&c.checked&&c.value!==c.old).map(c=>c.row.id))).size:draft.groups.filter(ready).length;
  document.querySelectorAll('[data-treatment="apply-current"]').forEach(b=>{b.disabled=!ready(g);if(draft.mode==='standard')b.textContent='应用当前分类';});
  document.querySelectorAll('[data-treatment="apply-all"]').forEach(b=>{b.disabled=!count;if(draft.mode==='standard')b.textContent='应用全部处理结果（'+count+'）';});
 }
 function apply(all){
  const groups=(all?draft.groups:[current()]).filter(ready);if(!groups.length)return;
  env.commit(({standard:'标准化',align:'数据对齐',merge:'数据融合'})[draft.mode],groups.length+' 个结果',()=>{
   groups.forEach(g=>{
    const merge=draft.mode==='merge',keep=merge?g.rows.find(r=>r.id===g.survivor):null;
    const entries=merge?keys().map(key=>({row:keep,key,...g.winners[key]})):g.changes.filter(c=>!c.readonly&&c.checked&&c.value!==c.old);
    entries.forEach(c=>{if(c.key)c.row[c.key]=c.value;if(c.sourceKey){c.row.sourceValues??={};c.row.sourceValues[c.sourceKey]=c.value;}c.row.status='pending';c.row.fieldSources??={};c.row.fieldSources[c.key||c.sourceKey]={record:c.row.id,document:c.origin,method:'人工采用处理建议'};if(c.row.sourceAliases?.[c.key])c.row.sourceValues[c.row.sourceAliases[c.key]]=c.value;env.record(c.row,'字段修正',(c.label||labels[c.key])+' → '+c.value+'；来源：'+c.origin)});
    if(merge){keep.origins=[...new Set(g.rows.flatMap(r=>r.origins||[r.id]))];g.rows.filter(r=>r!==keep).forEach(r=>{r.status='merged';r.mergedInto=keep.id;env.retarget(r.id,keep.id);env.record(r,'数据融合','保留记录 '+keep.id)})}
    g.applied=true;
   });env.recheck();
  });draw();
 }
 let choiceInput=null;
 function closeChoices(){document.getElementById('treat-options')?.remove();if(choiceInput)choiceInput.setAttribute('aria-expanded','false');choiceInput=null}
 function showChoices(input){
  if(!input||input.disabled||!current()||current().applied)return;closeChoices();choiceInput=input;input.setAttribute('aria-expanded','true');
  const change=input.dataset.alignCombo?current().changes[+input.dataset.treatChange]:null,key=change?change.key:input.dataset.treatValue,box=document.createElement('div');box.id='treat-options';box.setAttribute('role','listbox');box.setAttribute('aria-label',labels[key]+'候选值');
  const candidates=change?current().rows.map(row=>({row,origin:'当前表 · '+source(row)})).concat(current().references):current().candidates;box.innerHTML=candidates.map((c,i)=>'<button type="button" role="option" data-treatment="'+(change?'choose-align':'choose-value')+'" data-change="'+(change?input.dataset.treatChange:'')+'" data-key="'+key+'" data-index="'+i+'">'+E(c.row[key]??'')+'<small>'+E(c.origin)+'</small></button>').join('');
  box.addEventListener('mousedown',e=>e.preventDefault());document.body.append(box);const rect=input.getBoundingClientRect(),height=Math.min(240,box.scrollHeight);box.style.width=Math.min(Math.max(240,rect.width),innerWidth-16)+'px';box.style.left=Math.max(8,Math.min(rect.left,innerWidth-box.offsetWidth-8))+'px';box.style.top=(rect.bottom+height>innerHeight?Math.max(8,rect.top-height):rect.bottom+4)+'px';
 }
 document.addEventListener('focusin',e=>{if(e.target.dataset?.treatValue||e.target.dataset?.alignCombo)showChoices(e.target)});
 document.addEventListener('keydown',e=>{
  const input=e.target.closest('[data-treat-value],[data-align-combo]');if(!input)return;
  if(e.key==='Enter'&&!e.isComposing){e.preventDefault();e.stopImmediatePropagation();if(input.dataset.alignCombo){const c=current().changes[+input.dataset.treatChange];c.value=input.value;c.checked=true;}else current().winners[input.dataset.treatValue]={value:input.value,origin:current().winners[input.dataset.treatValue]?.value===input.value?current().winners[input.dataset.treatValue].origin:'手动输入'};closeChoices();input.blur()}
  if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeChoices()}
  if(e.key==='ArrowDown'){e.preventDefault();showChoices(input);document.querySelector('#treat-options button')?.focus()}
 },true);
 document.addEventListener('click',e=>{const b=e.target.closest('[data-treatment]');if(b?.dataset.treatment==='align-dropdown'){e.preventDefault();showChoices(document.querySelector('[data-treat-change="'+b.dataset.index+'"]'));return}if(b?.dataset.treatment==='choose-align'){e.preventDefault();const g=current(),c=g.changes[+b.dataset.change],candidates=g.rows.map(row=>({row,origin:'当前表 · '+source(row)})).concat(g.references),ref=candidates[+b.dataset.index];if(g.applied)return;c.value=String(ref.row[c.key]??'');c.origin=ref.origin;c.checked=true;c.confidence=null;g.processed=true;closeChoices();draw();return}if(b?.dataset.treatment==='dropdown'){e.preventDefault();showChoices(document.querySelector('[data-treat-value="'+b.dataset.key+'"]'));return}if(b?.dataset.treatment==='choose-value'){e.preventDefault();const g=current(),key=b.dataset.key,c=g.candidates[+b.dataset.index];if(g.applied)return;g.processed=true;g.winners[key]={value:c.row[key]??'',origin:'手动输入'};closeChoices();draw();return}if(e.target.matches?.('[data-treat-value],[data-align-combo]'))showChoices(e.target);else if(!e.target.closest('#treat-options'))closeChoices()},true);
 window.addEventListener('resize',closeChoices);document.addEventListener('scroll',e=>{if(!e.target.closest?.('#treat-options'))closeChoices()},true);
 document.addEventListener('click',e=>{const b=e.target.closest('[data-treatment]');if(!b||b.disabled)return;e.preventDefault();e.stopImmediatePropagation();const a=b.dataset.treatment;if(a==='cancel'){closeChoices();env.close()};if(a==='category'){draft.category=standardCategories[+b.dataset.index];draft.active=draft.groups.findIndex(g=>g.categories.includes(draft.category));draw()}if(a==='tab'){draft.active=+b.dataset.index;draw()}if(a==='recommend'){draft.groups.filter(g=>!g.applied).forEach(g=>{g.processed=true;if(draft.mode==='merge'){keys().forEach(key=>{const c=best(g.candidates,key),values=new Set(g.candidates.map(x=>String(x.row[key]??'')).filter(Boolean));g.winners[key]={value:c?.row[key]??'',origin:c?.origin||'当前表',confidence:c?(values.size>1?82:96):null}})}else{g.changes.filter(c=>!c.readonly).forEach(c=>{c.value=c.proposed;c.autoProcessed=true;c.checked=true;c.origin=c.reference?.origin||'当前表 · '+source(c.row);c.confidence=draft.mode==='standard'?null:c.value!==c.old?(c.reference?.existing?94:88):null})}});draw()}if(a==='apply-current')apply(false);if(a==='apply-all')apply(true)},true);
 document.addEventListener('change',e=>{if(!draft||!current()||current().applied)return;const el=e.target,g=current();if(el.id==='treatSurvivor')g.survivor=el.value;if(el.id==='treatGroup')g.checked=el.checked;if(el.id==='treatAll')g.changes.forEach(c=>c.checked=el.checked);if(el.dataset.treatCheck!==undefined)g.changes[+el.dataset.treatCheck].checked=el.checked;if(el.dataset.treatPick&&el.value!==''){const c=g.candidates[+el.value],key=el.dataset.treatPick;g.winners[key]={value:c.row[key]??'',origin:c.origin}}if(el.id.startsWith('treat')||Object.keys(el.dataset).some(k=>k.startsWith('treat')))draw()});
 document.addEventListener('input',e=>{if(!draft||!current()||current().applied)return;const el=e.target,g=current();if(el.dataset.treatChange!==undefined){const c=g.changes[+el.dataset.treatChange];if(!c||c.readonly)return;c.value=el.value;c.origin='手动输入';c.confidence=null;c.checked=true;g.processed=true;el.closest('td')?.classList.toggle('treat-changed',c.value!==c.old)}if(el.dataset.treatValue){g.processed=true;g.winners[el.dataset.treatValue]={value:el.value,origin:'手动输入'};showChoices(el)}if(el.dataset.treatChange!==undefined||el.dataset.treatValue){const cell=el.closest('td');if(cell&&draft.mode==='standard'){const note=cell.querySelector('.standard-reason');if(note)note.textContent=g.changes[+el.dataset.treatChange].value===g.changes[+el.dataset.treatChange].old?'未修改':'手动编辑';}if(cell&&draft.mode!=='standard'){cell.querySelector('.treat-confidence')?.remove();cell.insertAdjacentHTML('beforeend','<small class="treat-confidence">手动编辑</small>')}}updateApplyButtons()});
 const style=document.createElement('style');style.textContent='.treat-toolbar{display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:nowrap;margin-bottom:18px}.treat-toolbar>button{flex-shrink:0}.treat-tabs{display:flex;flex:1;min-width:0;gap:8px;overflow:auto;padding:4px 0}.treat-tabs button{white-space:nowrap}.treat-blank{min-height:160px}.compare small{display:block;color:#71819a;margin-top:6px;white-space:normal}.compare td input:not([type=checkbox]),.compare td select{width:100%;min-width:170px;border:1px solid #dce4ef;border-radius:6px;padding:9px;margin:4px 0}';style.textContent+='.treat-issue-tags{display:inline-flex;flex-wrap:wrap;gap:4px;margin-left:8px;vertical-align:middle}.treat-changed{background:#edf4ff}.treat-combo{position:relative;min-width:200px}.treat-combo input{padding-right:32px!important}.treat-combo button{position:absolute;right:4px;top:8px;border:0;background:transparent;padding:6px}#treat-options{position:fixed;z-index:100000;background:white;border:1px solid #dce4ef;border-radius:7px;box-shadow:0 5px 20px #18305220;max-height:240px;overflow:auto}#treat-options button{display:block;width:100%;border:0;border-radius:0;text-align:left;padding:10px 12px;background:white}#treat-options button:hover,#treat-options button:focus{background:#edf4ff}#treat-options small{display:block;color:#71819a;margin-top:5px}.compare th{min-width:160px}.compare th:first-child{min-width:100px}';style.textContent+='.standard-category-header{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:8px}.standard-category-header>.treat-tabs{margin:0}.standard-category-header>button{flex-shrink:0;white-space:nowrap}.standard-matrix{overflow:auto}.standard-matrix .compare{min-width:100%;width:max-content}.standard-matrix th:not(:first-child),.standard-matrix td:not(:first-child){min-width:260px;max-width:320px}.standard-matrix th:first-child,.standard-matrix td:first-child{position:sticky;left:0;background:#f7f9fc;z-index:1}.standard-readonly{color:#71819a;background:#fafbfc}';document.head.append(style);
 return open;
};
