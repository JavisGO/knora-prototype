(function(){
'use strict';
var storageKey='knora-document-versions-v2',records=readStore(),drawerMeta=null,detail=null;
function clone(value){return JSON.parse(JSON.stringify(value))}
function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function stamp(){return new Date().toLocaleString('sv-SE',{timeZone:'Asia/Shanghai'}).slice(0,16)}
function readStore(){try{var data=JSON.parse(localStorage.getItem(storageKey)||'{}');return data.schema===1&&data.documents?data.documents:{}}catch(e){return {}}}
function writeStore(){try{localStorage.setItem(storageKey,JSON.stringify({schema:1,documents:records}));return true}catch(e){notify('版本信息未能保存，请检查浏览器本地存储空间');return false}}
function notify(message){var api=window.KnoraDocumentViewerV2;if(api&&api.toast){api.toast(message);return}var el=document.getElementById('toast');if(!el){el=document.createElement('div');el.id='toast';document.body.appendChild(el)}el.textContent=message;el.classList.add('show');clearTimeout(notify.timer);notify.timer=setTimeout(function(){el.classList.remove('show')},2200)}
function statusClass(status){return status==='已发布'?'effective':'history'}
function pendingApproval(v){return !!(v.publication&&v.publication.state==='pending')}
function canEdit(v){return v.status==='未发布'}
function badge(status){return '<span class="dv2-status '+statusClass(status)+'">'+esc(status)+'</span>'}
function nextNumber(rec){return String(Math.max.apply(Math,[0].concat(rec.versions.map(function(v){return Number(v.number)||0})))+1)}
function safeKey(value){return String(value||'document').replace(/[^\w\u4e00-\u9fa5:-]+/g,'-')}
function seed(meta,snapshot){
 var make=function(id,number,status,createdAt,note,html){return {id:id,number:String(number),status:status,createdAt:createdAt,updatedAt:createdAt,creator:meta.owner||'陈宇',note:note,html:html||'',file:null,baseId:null}};
 var now=meta.updated||stamp(),base=snapshot||'';
 if(meta.id==='doc-risk'){
  var first=base.replace(/24 小时/g,'48 小时').replace(/和证据材料/g,''),second=base.replace(/并同步通知客户负责人及空间管理员/g,'并同步通知客户负责人');
  return {revision:0,effectiveId:'v3',versions:[make('v1',1,'未发布','2026-09-01 10:00','首次正式发布',first),make('v2',2,'未发布','2026-09-12 14:20','调整高风险处置时限，补充处置要求',second),make('v3',3,'已发布',now,'补充闭环记录与关联要求',base)]};
 }
 return {revision:0,effectiveId:'v1',versions:[make('v1',1,'已发布',now,'初始文档版本',base)]};
}
function record(meta,snapshot){
 var stored=readStore();if(stored[meta.key])records[meta.key]=stored[meta.key];
 if(!records[meta.key]||!Array.isArray(records[meta.key].versions)||!records[meta.key].versions.length)records[meta.key]=seed(meta,snapshot);
 var rec=records[meta.key];
 if(rec.versions.length===1&&!rec.demoVersionsAdded&&!(rec.revision>0)){
  var initial=rec.versions[0],example=clone(initial);example.id='demo-history';example.number=nextNumber(rec);example.status='未发布';example.note='示例：历史发布版本，可重新选择发布';example.html=initial.html;rec.versions.push(example);
  var draft=clone(initial);draft.id='demo-draft';draft.number=nextNumber(rec);draft.status='未发布';draft.note='示例：补充执行要求，尚未发布';draft.baseId=initial.id;rec.versions.push(draft);rec.demoVersionsAdded=true;
 }
 rec.versions.forEach(function(v){if(v.status==='审核中'){v.publication=v.publication||{};v.publication.state='pending'}v.status=v.id===rec.effectiveId?'已发布':'未发布';v.name=meta.name;v.type=meta.name.split('.').pop().toLowerCase();if(v.file)v.file.name=meta.name;if(!v.html&&snapshot)v.html=snapshot});return rec;
}
function versionUrl(meta,version,editing){var url='portal-document-detail.html?doc='+encodeURIComponent(meta.id)+'&dvKey='+encodeURIComponent(meta.key)+'&versionManage='+(meta.maintain?'1':'0');if(meta.name)url+='&docName='+encodeURIComponent(meta.name)+'&docOwner='+encodeURIComponent(meta.owner||'陈宇')+'&docKind='+encodeURIComponent(meta.name.split('.').pop().toUpperCase());if(meta.metadataKey)url+='&mdKey='+encodeURIComponent(meta.metadataKey);if(version)url+='&version='+encodeURIComponent(version);if(editing)url+='&mode=edit';return url}
function metaFromButton(button){return {metadataKey:button.dataset.mdKey||'',location:button.dataset.dv2Location||'',key:button.dataset.dv2Key||button.dataset.dv2Id,id:button.dataset.dv2Id||'doc-risk',name:button.dataset.dv2Name||'文档',owner:button.dataset.dv2Owner||'陈宇',updated:button.dataset.dv2Updated||stamp(),maintain:button.dataset.dv2Maintain==='1'}}

function ensureDrawer(){
 if(document.getElementById('dv2Drawer'))return;
 document.body.insertAdjacentHTML('beforeend','<div class="dv2-drawer-mask" id="dv2DrawerMask" hidden></div><aside class="dv2-drawer" id="dv2Drawer" role="dialog" aria-modal="true" aria-labelledby="dv2DrawerTitle" hidden><header><div><h2 id="dv2DrawerTitle" title="历史版本的操作权限：空间管理员">历史版本</h2><p id="dv2DrawerName"></p></div><button class="dv2-close" id="dv2DrawerClose" aria-label="关闭">×</button></header><div class="dv2-drawer-body" id="dv2DrawerBody"></div><footer id="dv2DrawerFooter"></footer></aside>');
 document.getElementById('dv2DrawerClose').onclick=closeDrawer;document.getElementById('dv2DrawerMask').onclick=closeDrawer;
 document.getElementById('dv2DrawerBody').onclick=function(event){var copy=event.target.closest('[data-dv2-copy]');if(copy){copyVersion(drawerMeta,copy.dataset.dv2Copy);return}var publish=event.target.closest('[data-dv2-publish]');if(publish){requestPublish(drawerMeta,publish.dataset.dv2Publish);return}var view=event.target.closest('[data-dv2-view]');if(view){if(detail&&isDirty()){notify('请先保存或退出编辑');return}location.href=versionUrl(drawerMeta,view.dataset.dv2View,false)}};
}
function openDrawer(meta){ensureDrawer();drawerMeta=meta;document.getElementById('dv2Drawer').hidden=false;document.getElementById('dv2DrawerMask').hidden=false;document.getElementById('dv2DrawerName').textContent=meta.name;renderDrawer()}
function closeDrawer(){var drawer=document.getElementById('dv2Drawer');if(!drawer)return;drawer.hidden=true;document.getElementById('dv2DrawerMask').hidden=true}
function renderDrawer(){
 var rec=record(drawerMeta,detail&&detail.meta.key===drawerMeta.key?snapshotPaper():''),active=rec.versions.find(function(v){return v.id===rec.effectiveId}),versions=rec.versions.slice().reverse();
 document.getElementById('dv2DrawerBody').innerHTML='<div class="dv2-current-summary"><span>当前发布版本</span><b>'+(active?'v'+esc(active.number):'尚未生效')+'</b><small>'+versions.length+' 个版本 · 版本号自动生成</small></div><p class="dv2-drawer-hint">版本按版本号倒序展示。复制新版本后可编辑；上传更新文件会自动新增一个未发布版本，不自动提交发布审批。文件名及文件类型保持一致；发布需走空间审批流程，通过后生效。审批通过前，当前生效版本保持不变。多版本内容为交互示例。</p><div class="dv2-table-wrap"><table class="dv2-version-table"><thead><tr><th>版本号</th><th>状态</th><th>创建人</th><th>创建时间</th><th>变更说明</th><th title="历史版本的操作权限：空间管理员">操作 ⓘ</th></tr></thead><tbody>'+versions.map(function(v){return '<tr class="'+(v.id===rec.effectiveId?'current':'')+'"><td><b>v'+esc(v.number)+'</b>'+(v.id===rec.effectiveId?'<small>当前发布</small>':'')+'</td><td>'+badge(v.status)+'</td><td>'+esc(v.creator)+'</td><td>'+esc(v.createdAt)+'</td><td class="note">'+esc(v.note||'尚未填写')+(v.file?'<small>附件：'+esc(v.file.name)+'</small>':'')+'</td><td><button data-dv2-view="'+esc(v.id)+'">查看</button>'+publishActions(rec,v,drawerMeta)+'</td></tr>'}).join('')+'</tbody></table></div>';
 document.getElementById('dv2DrawerFooter').innerHTML='<span>'+versions.length+' 个版本</span>'+(drawerMeta.maintain?'<button id="dv2HistoryUpload" title="空间管理员操作；上传后自动新增未发布版本，文件名和类型须一致">上传更新文件</button><input type="file" id="dv2HistoryUploadFile" accept=".'+esc(drawerMeta.name.split('.').pop())+'" hidden><p id="dv2UploadError" class="dv2-inline-error" hidden></p>':'');var upload=document.getElementById('dv2HistoryUpload');if(upload)upload.onclick=function(){var input=document.getElementById('dv2HistoryUploadFile');input.value='';input.click()};var input=document.getElementById('dv2HistoryUploadFile');if(input)input.onchange=function(){uploadNewVersion(drawerMeta,this.files&&this.files[0])};
}

function publishActions(rec,v,meta){
 if(!meta.maintain)return '';var copy='<button data-dv2-copy="'+esc(v.id)+'" title="历史版本的操作权限：空间管理员；先复制新版本，再编辑">复制新版本</button>';
 if(pendingApproval(v))return copy+'<small>发布审批中</small>';
 if(v.id===rec.effectiveId)return copy+'<small>当前发布版本</small>';
 var pending=rec.versions.some(function(x){return pendingApproval(x)});
 return copy+'<button data-dv2-publish="'+esc(v.id)+'" '+(pending?'disabled title="历史版本的操作权限：空间管理员；已有版本待审批，请先完成审批"':'title="历史版本的操作权限：空间管理员；发布生效需审批"')+'>发布此版本</button>';
}
function publicationLocation(meta){
 if(meta.location)return meta.location+' / '+meta.name;
 if(meta.key.indexOf('public:')===0){var parts=meta.key.split(':');return parts.slice(1,-2).join(':')+' / 原文档位置'}
 return '个人空间 / 原文档位置';
}
function refreshPublication(meta){
 if(drawerMeta&&drawerMeta.key===meta.key)renderDrawer();
 if(detail&&detail.meta.key===meta.key){detail.rec=records[meta.key];renderBar()}
}
function requestPublish(meta,id){
 if(!meta.maintain)return; if(window.KnoraDocumentMetadata){var error=window.KnoraDocumentMetadata.documentError(meta.metadataKey||meta.key);if(error){notify(error+'，请在文档详情的信息栏补齐后再发布');return}}
 var rec=record(meta),v=rec.versions.find(function(x){return x.id===id});
 if(!v){notify('未找到所选版本，请刷新后重试');return}
 if(v.id===rec.effectiveId){notify('此版本已是当前发布版本');return}
 var pending=rec.versions.find(function(x){return pendingApproval(x)});
 if(pending){openModal('已有版本待审批','v'+pending.number+' 正在审批中，请完成该版本的审批后再发布其他版本。当前发布版本保持不变。','查看历史版本',function(){closeModal();openDrawer(meta)});return}

 openModal('发布 v'+v.number,'发布位置：'+publicationLocation(meta)+'。此版本已生成，本次仅提交发布审批，不再生成版本。导入文档同样先生成版本，再单独发布；发布需走该空间的文档审批流程。审批通过后，将 v'+v.number+' 设为唯一发布版本；审批通过前，当前发布版本保持不变。','提交发布审批',function(){
  v.publication={state:'pending',previousStatus:v.status,target:publicationLocation(meta),submittedAt:stamp()};v.updatedAt=stamp();rec.revision=(rec.revision||0)+1;records[meta.key]=rec;
  if(!writeStore())return;closeModal();refreshPublication(meta);notify('发布审批已提交，当前发布版本保持不变（本机原型）');
 });
}
function snapshotPaper(){var paper=document.getElementById('officePaper');if(!paper)return '';var copy=paper.cloneNode(true);copy.querySelectorAll('script,style').forEach(function(node){node.remove()});copy.querySelectorAll('*').forEach(function(node){Array.from(node.attributes).forEach(function(attr){if(/^on/i.test(attr.name))node.removeAttribute(attr.name)});if(node.hasAttribute('contenteditable'))node.setAttribute('contenteditable','false')});return copy.innerHTML}
function setPaper(html,editing){var paper=document.getElementById('officePaper');if(!paper)return;paper.innerHTML=html||paper.innerHTML;paper.querySelectorAll('[contenteditable]').forEach(function(node){node.contentEditable=!!editing});paper.classList.toggle('editing',!!editing)}
function currentVersion(){return detail.rec.versions.find(function(v){return v.id===detail.versionId})||detail.rec.versions[detail.rec.versions.length-1]}
function isDirty(){return !!detail&&(snapshotPaper()!==detail.baseline||!!detail.pendingFile)}
function syncButtons(){if(!detail)return;var changed=isDirty();detail.dirty=changed;['dv2SaveCurrent','dv2SaveNew'].forEach(function(id){var button=document.getElementById(id);if(button)button.disabled=!changed||(id==='dv2SaveCurrent'&&!canEdit(currentVersion()))});var error=document.getElementById('dv2EditError');if(error&&changed)error.hidden=true}
function updateDetailUrl(){var url=new URL(location.href);url.searchParams.set('dvKey',detail.meta.key);url.searchParams.set('version',detail.versionId);url.searchParams.set('versionManage',detail.meta.maintain?'1':'0');if(detail.editing)url.searchParams.set('mode','edit');else url.searchParams.delete('mode');history.replaceState(null,'',url.href)}
function renderBar(){
 var v=currentVersion(),active=detail.rec.versions.find(function(x){return x.id===detail.rec.effectiveId}),options=detail.rec.versions.slice().reverse(),editing=detail.editing;
 detail.bar.innerHTML='<div class="dv2-bar-main"><label>正在查看 <b>v'+esc(v.number)+'</b></label>'+badge(v.status)+(pendingApproval(v)?'<span>发布审批中</span>':'')+'<div class="dv2-bar-actions">'+(detail.meta.maintain&&canEdit(v)&&detail.context.doc.editable&&!editing?'<button id="dv2Edit" title="历史版本的操作权限：空间管理员；编辑后保存至当前版本，不新增版本">编辑文档</button>':'')+(editing?'<button id="dv2ExitEdit">退出编辑</button>':'')+(!editing&&detail.pendingFile?'<button id="dv2CancelUpload">取消更新</button>':'')+(editing||detail.pendingFile?'<button id="dv2SaveCurrent" disabled>保存</button>':'')+(!editing&&!detail.pendingFile&&detail.meta.maintain&&v.id!==detail.rec.effectiveId&&!pendingApproval(v)?'<button class="primary" id="dv2Submit" title="历史版本的操作权限：空间管理员；提交发布审批，通过后生效">发布此版本</button>':'')+'</div></div><div class="dv2-bar-meta"><span>当前生效：<b>'+(active?'v'+esc(active.number):'尚未生效')+'</b></span><span>版本创建人 <b>'+esc(v.creator)+'</b></span><span>版本创建时间 <b>'+esc(v.createdAt)+'</b></span><span>最近保存时间 <b>'+esc(v.updatedAt)+'</b></span></div>'+(v.note?'<div class="dv2-version-note"><b>变更说明</b>'+esc(v.note)+'</div>':'')+(detail.meta.maintain?'<p class="dv2-inline-error" id="dv2EditError" hidden></p>':'');
 var headerActions=document.querySelector('.doc-viewer-head nav');if(headerActions&&!document.getElementById('dv2History'))headerActions.insertAdjacentHTML('beforeend','<button id="dv2History" title="历史版本的操作权限：空间管理员">历史版本</button>');
 document.getElementById('dv2History').onclick=function(){openDrawer(detail.meta)};
 var edit=document.getElementById('dv2Edit');if(edit)edit.onclick=beginEdit;var exit=document.getElementById('dv2ExitEdit');if(exit)exit.onclick=exitEdit;var save=document.getElementById('dv2SaveCurrent');if(save)save.onclick=function(){saveCurrent(false)};var submit=document.getElementById('dv2Submit');if(submit)submit.onclick=submitVersion;
 syncButtons();
}
function switchVersion(id){if(detail.dirty){notify('请先保存或退出编辑，再切换版本');renderBar();return}var version=detail.rec.versions.find(function(v){return v.id===id});if(!version)return;detail.versionId=id;detail.editing=false;detail.pendingFile=null;detail.context.setEditing(false,true);setPaper(version.html,false);detail.baseline=snapshotPaper();renderBar();updateDetailUrl()}
function beginEdit(){if(!detail.meta.maintain||!canEdit(currentVersion()))return;detail.editing=true;if(detail.context.doc.editable)detail.context.setEditing(true,true);setPaper(currentVersion().html,detail.context.doc.editable);detail.baseline=snapshotPaper();renderBar();updateDetailUrl()}
function exitEdit(){if(detail.dirty){openModal('退出编辑','当前修改尚未保存，退出后将恢复上次保存的版本。','放弃修改',function(){restoreAndExit()});return}restoreAndExit()}
function restoreAndExit(){var v=currentVersion();detail.editing=false;detail.pendingFile=null;detail.context.setEditing(false,true);setPaper(v.html,false);detail.baseline=snapshotPaper();closeModal();renderBar();updateDetailUrl()}
function saveCurrent(silent){if(!detail.meta.maintain||!isDirty())return false;if(window.KnoraDocumentMetadata){var metadataError=window.KnoraDocumentMetadata.documentError(new URLSearchParams(location.search).get('mdKey')||detail.meta.key);if(metadataError){notify(metadataError+'，请在信息栏补齐后保存');return false}}if(!canEdit(currentVersion())){if(!silent)notify('请先在历史版本列表中复制新版本，再编辑');return false;}var version=currentVersion();version.html=snapshotPaper();version.updatedAt=stamp();if(detail.pendingFile)version.file=detail.pendingFile;detail.rec.revision=(detail.rec.revision||0)+1;records[detail.meta.key]=detail.rec;if(!writeStore())return false;detail.editing=false;detail.pendingFile=null;detail.context.setEditing(false,true);setPaper(version.html,false);detail.baseline=snapshotPaper();renderBar();updateDetailUrl();if(!silent)notify('v'+version.number+' 已更新');return true}
function copyVersion(meta,id){if(!meta.maintain)return;if(detail&&isDirty()){notify('请先保存或退出编辑');return}var rec=record(meta),base=rec.versions.find(function(v){return v.id===id});if(!base)return;openModal('复制新版本','复制所选版本的内容，文件名和文件类型保持一致。新增后可编辑，发布需另行提交审批。','复制新版本',function(){var note=document.getElementById('dv2VersionNote').value.trim();if(!note){document.getElementById('dv2ModalError').textContent='请填写变更说明';document.getElementById('dv2ModalError').hidden=false;return}var copy=clone(base),now=stamp();copy.id='v-'+Date.now().toString(36);copy.number=nextNumber(rec);copy.baseId=base.id;copy.status='未发布';delete copy.publication;copy.createdAt=now;copy.updatedAt=now;copy.creator='陈宇';copy.note=note;copy.name=meta.name;rec.versions.push(copy);rec.revision=(rec.revision||0)+1;records[meta.key]=rec;if(!writeStore())return;closeModal();renderDrawer();notify('已复制新版本 v'+copy.number+'，请选择查看后编辑')},{note:true})}
function submitVersion(){if(detail.dirty){notify('请先保存编辑内容，再发布');return}requestPublish(detail.meta,currentVersion().id)}
async function uploadNewVersion(meta,file){if(!file||!meta.maintain)return;var error=document.getElementById('dv2UploadError');function fail(message){if(error){error.textContent=message;error.hidden=false}notify(message)}if(file.name!==meta.name||file.name.split('.').pop().toLowerCase()!==meta.name.split('.').pop().toLowerCase()){fail('更新文件的文件名和文件类型必须与原文档一致：'+meta.name);return}if(file.size>500*1024*1024){fail('文件不能超过 500 MB');return}var html;if(/\.(txt|md)$/i.test(file.name)){try{var text=await file.text();html='<p class="paper-topline">更新文件 · '+esc(file.name)+'</p><h1 contenteditable="true">'+esc(file.name.replace(/\.[^.]+$/,''))+'</h1><p contenteditable="true">'+esc(text).replace(/\n/g,'<br>')+'</p>'}catch(e){fail('文件读取失败，请重新上传');return}}else html='<p class="paper-topline">更新文件 · '+esc(file.name)+'</p><h1>'+esc(file.name)+'</h1><div class="paper-note"><b>更新文件已上传</b><br>该版本保留原文件，正文将在重新解析完成后展示。</div>';var rec=record(meta),now=stamp(),version={id:'v-'+Date.now().toString(36),number:nextNumber(rec),status:'未发布',name:meta.name,type:meta.name.split('.').pop().toLowerCase(),creator:'陈宇',createdAt:now,updatedAt:now,note:'上传更新文件',html:html,file:{name:meta.name,size:file.size,sizeLabel:file.size<1048576?(file.size/1024).toFixed(1)+' KB':(file.size/1048576).toFixed(1)+' MB'},baseId:rec.effectiveId};rec.versions.push(version);rec.revision=(rec.revision||0)+1;records[meta.key]=rec;if(!writeStore())return;if(detail&&detail.meta.key===meta.key)detail.rec=rec;if(drawerMeta&&drawerMeta.key===meta.key)renderDrawer();notify('已自动新增未发布版本 v'+version.number+'，当前发布版本保持不变')}
function showEditError(message){var error=document.getElementById('dv2EditError');if(error){error.textContent=message;error.hidden=false}notify(message)}

function openModal(title,text,confirmText,onConfirm,options){closeModal();var mask=document.createElement('div');mask.className='dv2-modal-mask';mask.id='dv2ModalMask';mask.innerHTML='<section class="dv2-modal" role="dialog" aria-modal="true"><header><h2>'+esc(title)+'</h2><button data-dv2-close>×</button></header><div><p>'+esc(text)+'</p>'+(options&&options.note?'<label>变更说明<textarea id="dv2VersionNote" maxlength="1000" placeholder="说明本次新版本的修改内容"></textarea></label>':'')+'<p class="dv2-inline-error" id="dv2ModalError" hidden></p></div><footer><button data-dv2-close>取消</button><button class="primary" id="dv2ModalConfirm">'+esc(confirmText)+'</button></footer></section>';document.body.appendChild(mask);mask.querySelectorAll('[data-dv2-close]').forEach(function(button){button.onclick=closeModal});mask.onclick=function(event){if(event.target===mask)closeModal()};document.getElementById('dv2ModalConfirm').onclick=onConfirm;var note=document.getElementById('dv2VersionNote');if(note)note.focus()}
function closeModal(){var modal=document.getElementById('dv2ModalMask');if(modal)modal.remove()}

function initDetail(){
 var context=window.KnoraDocumentViewerV2,paper=document.getElementById('officePaper'),viewer=document.querySelector('.doc-viewer-v2');if(!context||!paper||!viewer)return;
 var params=new URLSearchParams(location.search),explicit=params.get('versionManage'),maintain=explicit===null?!!context.doc.editable:explicit==='1',key=params.get('dvKey')||('detail:'+params.get('doc'));
 var originalEdit=document.getElementById('docEditToggle');if(originalEdit){originalEdit.hidden=true;originalEdit.disabled=true}
 var meta={metadataKey:params.get('mdKey')||'',key:key,id:params.get('doc')||'doc-risk',name:context.doc.name,owner:context.doc.owner,updated:context.doc.updated,maintain:maintain},snapshot=snapshotPaper(),rec=record(meta,snapshot),requested=rec.versions.find(function(v){return v.id===params.get('version')}),version=requested||rec.versions[rec.versions.length-1];
 var bar=document.createElement('section');bar.className='dv2-versionbar';bar.id='dv2VersionBar';viewer.classList.add('dv2-enabled');var headMeta=viewer.querySelector('.doc-viewer-head small');if(headMeta)headMeta.remove();viewer.querySelector('.doc-viewer-head').insertAdjacentElement('afterend',bar);
 detail={context:context,meta:meta,rec:rec,versionId:version.id,bar:bar,editing:params.get('mode')==='edit'&&maintain&&canEdit(version),dirty:false,pendingFile:null,baseline:''};
 setPaper(version.html||snapshot,detail.editing&&context.doc.editable);if(detail.editing&&context.doc.editable)context.setEditing(true,true);else context.setEditing(false,true);detail.baseline=snapshotPaper();renderBar();updateDetailUrl();
 paper.addEventListener('input',function(){if(detail.editing)syncButtons()});
 window.addEventListener('knora:document-editing-changed',function(event){if(!detail||!detail.meta.maintain)return;if(event.detail.editing){detail.editing=true;detail.baseline=snapshotPaper();renderBar();updateDetailUrl()}else if(detail.editing){if(isDirty())saveCurrent(true);else{detail.editing=false;renderBar();updateDetailUrl()}}});
}

document.addEventListener('click',function(event){var button=event.target.closest('[data-dv2-history]');if(button){event.preventDefault();openDrawer(metaFromButton(button))}});
document.addEventListener('keydown',function(event){if(event.key==='Escape'){if(document.getElementById('dv2ModalMask'))closeModal();else if(document.getElementById('dv2Drawer')&&!document.getElementById('dv2Drawer').hidden)closeDrawer()}});
window.addEventListener('storage',function(event){if(event.key!==storageKey)return;records=readStore();if(drawerMeta&&document.getElementById('dv2Drawer')&&!document.getElementById('dv2Drawer').hidden)renderDrawer()});
initDetail();
window.KnoraFeedbackVersions={
 current:function(){return detail?clone(currentVersion()):null},
 dirty:function(){return detail&&isDirty()},
 publishDemo:function(html,note){
  if(!detail||detail.editing)return null;
  var base=currentVersion(),v=clone(base),now=stamp();
  v.id='feedback-'+Date.now().toString(36);v.number=nextNumber(detail.rec);v.baseId=base.id;
  v.status='已发布';v.html=html;v.note=note;v.creator='陈宇';v.createdAt=now;v.updatedAt=now;delete v.publication;
  var previous=clone(detail.rec);
  detail.rec.versions.forEach(function(x){if(x.status==='已发布')x.status='历史版本'});
  detail.rec.versions.push(v);detail.rec.effectiveId=v.id;records[detail.meta.key]=detail.rec;
  if(!writeStore()){detail.rec=previous;records[detail.meta.key]=previous;return null}
  detail.dirty=false;switchVersion(v.id);return clone(v);
 }
};
})();
