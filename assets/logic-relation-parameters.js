(function(){
'use strict';
const storageKey='logic-relation-parameters:'+(new URLSearchParams(location.search).get('flow')||'default');
const types=['PN-Claim','Claim-Dealer','Claim-HU-TU','Claim-ClaimDoc'];
const endpoints={'PN-Claim':['Part','Claim'],'Claim-Dealer':['Claim','Dealer'],'Claim-HU-TU':['Claim','HU-TU'],'Claim-ClaimDoc':['Claim','ClaimDoc']};
let saved=[],draft=[];try{saved=JSON.parse(localStorage.getItem(storageKey)||'[]')}catch{}
const mask=document.createElement('div');mask.className='rp-mask';mask.hidden=true;
mask.innerHTML='<section class="rp-dialog" role="dialog" aria-modal="true" aria-labelledby="rpTitle"><header><b id="rpTitle">参数配置</b><button type="button" data-action="cancel" aria-label="关闭参数配置">×</button></header><div class="rp-body"><div id="rpGroups"></div><button class="rp-add-group" data-action="add-group">⊕ 添加关系配置</button><p class="rp-error" role="alert"></p></div><footer><button class="rp-confirm" data-action="confirm">确定</button><button class="rp-cancel" data-action="cancel">取消</button></footer></section>';
document.body.append(mask);
const groups=mask.querySelector('#rpGroups');let returnFocus;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const condition=()=>({property:'',operator:'等于',source:'引用',value:''});
const group=()=>({types:[],direction:'双向',join:'AND',conditions:[condition()],entities:[]});
function options(values,value,placeholder){return (placeholder?'<option value="">'+placeholder+'</option>':'')+values.map(v=>'<option '+(value===v?'selected ':'')+'value="'+esc(v)+'">'+esc(v)+'</option>').join('')}
// 原型配置示例：正式接入时使用实体/关系 Schema 的属性类型和语义索引状态。
const properties=['编号','名称','状态','描述','故障描述','索赔原因','维修措施','配件名称','关系说明'];
const indexedProperties=new Set(['名称','描述','故障描述','索赔原因','维修措施','配件名称','关系说明']);
const textVariables=['用户输入','PartNumber_Location','故障描述变量','维修记录变量','索赔原因变量'];
function conditionHTML(c){
  const semantic=c.operator==='语义相似于',score=c.minSimilarity??'0.80',limit=c.maxItems??'10';
  const unavailable=semantic&&c.property&&!indexedProperties.has(c.property);
  const propertyOptions='<option value="">请选择属性</option>'+properties.map(p=>`<option value="${esc(p)}" ${p===c.property?'selected':''} ${semantic&&!indexedProperties.has(p)?'disabled':''}>${esc(p)}${semantic&&!indexedProperties.has(p)?'（未构建语义检索）':''}</option>`).join('');
  return `<div class="rp-condition" data-min-similarity="${esc(score)}" data-max-items="${esc(limit)}"><div class="rp-condition-top"><select data-field="property" aria-label="条件属性">${propertyOptions}</select><select data-field="operator" aria-label="条件运算符">${options(['等于','不等于','包含','不包含','语义相似于'],c.operator)}</select><button data-action="remove-condition" aria-label="删除条件">♜</button></div><div class="rp-condition-bottom"><select data-field="source" aria-label="条件值来源">${options(semantic?['引用']:['引用','输入'],semantic?'引用':c.source)}</select>${semantic||c.source==='引用'?`<select data-field="value" aria-label="条件引用变量">${options(semantic?textVariables:[...textVariables,'claimNumbers'],c.value,semantic?'请选择文本变量':'请选择变量')}</select>`:`<input data-field="value" aria-label="条件输入值" placeholder="请输入值" value="${esc(c.value)}">`}</div>${semantic?`<div class="rp-semantic-settings"><label>最低相似度<input data-field="minSimilarity" aria-label="最低相似度" type="number" min="0" max="1" step="0.01" required value="${esc(score)}"></label><label>最大条目数<input data-field="maxItems" aria-label="语义条件最大条目数" type="number" min="1" step="1" required value="${esc(limit)}"></label></div><p class="rp-semantic-note">相似度达到设置值时命中，按相似度从高到低最多保留指定条数。</p>${unavailable?'<p class="rp-semantic-error">当前属性未构建语义检索</p>':''}`:''}</div>`;
}

function render(){groups.innerHTML=draft.map((g,i)=>{const enabled=g.types.length>0,entities=[...new Set(g.types.flatMap(t=>endpoints[t]||[]))];return `<article class="rp-group" data-index="${i}"><div class="rp-group-title"><b><em>*</em> 关系类型选择：</b><details class="rp-type-picker"><summary>${g.types.length?g.types.map(esc).join('、'):'请选择关系类型（可多选）'}</summary><div>${types.map(t=>`<label><input type="checkbox" data-type="${t}" ${g.types.includes(t)?'checked':''}>${t}</label>`).join('')}</div></details><button data-action="remove-group">⊖ 移除</button></div><div class="rp-conditions"><button class="rp-join" data-action="join">${g.join} ⇄</button><div class="rp-condition-list">${g.conditions.map(c=>conditionHTML(c)).join('')}<button class="rp-add-condition" data-action="add-condition" ${enabled?'':'disabled'}>⊕ 添加条件</button></div></div><div class="rp-direction"><b>关系方向：</b><select data-field="direction" aria-label="参数关系方向">${options(['双向','出向','入向'],g.direction)}</select></div><div class="rp-entity-hint">${enabled?'关联实体条件':'请选择关系后配置实体条件'}</div><div class="rp-entities">${g.entities.map((e,j)=>`<section class="rp-entity" data-entity-index="${j}"><div class="rp-entity-title"><b>关联实体：</b><select data-field="entity" aria-label="关联实体">${options(entities,e.name,'请选择实体')}</select><button data-action="remove-entity">⊖ 移除</button></div><div class="rp-condition-list">${e.conditions.map(c=>conditionHTML(c)).join('')}<button class="rp-add-condition" data-action="add-condition">⊕ 添加条件</button></div></section>`).join('')}</div><button class="rp-add-entity" data-action="add-entity" ${enabled?'':'disabled'}>⊕ 添加关联实体</button></article>`}).join('')}
function readConditions(root){return [...root.children].filter(el=>el.classList.contains('rp-condition')).map(el=>({minSimilarity:el.dataset.minSimilarity,maxItems:el.dataset.maxItems,...Object.fromEntries([...el.querySelectorAll('[data-field]')].map(f=>[f.dataset.field,f.value]))}))}

function read(){draft=[...groups.children].map(el=>({types:[...el.querySelectorAll('[data-type]:checked')].map(c=>c.dataset.type),direction:el.querySelector('[data-field=direction]').value,join:el.querySelector('.rp-join').textContent.startsWith('OR')?'OR':'AND',conditions:readConditions(el.querySelector('.rp-conditions>.rp-condition-list')),entities:[...el.querySelectorAll('.rp-entity')].map(e=>({name:e.querySelector('[data-field=entity]').value,conditions:readConditions(e.querySelector('.rp-condition-list'))}))}))}
function close(){mask.hidden=true;returnFocus?.focus()}
document.querySelector('.re-parameters').onclick=()=>{returnFocus=document.activeElement;draft=JSON.parse(JSON.stringify(saved.length?saved:[group()]));mask.querySelector('.rp-error').textContent='';render();mask.hidden=false;mask.querySelector('[data-action=cancel]').focus()};
mask.addEventListener('change',e=>{
  read();
  if(e.target.matches('[data-type]'))draft.forEach(g=>{const allowed=new Set(g.types.flatMap(t=>endpoints[t]||[]));g.entities=g.entities.filter(e=>!e.name||allowed.has(e.name))});
  if(e.target.matches('[data-field=operator]')){
    const article=e.target.closest('.rp-group'),g=draft[+article.dataset.index],entity=e.target.closest('.rp-entity');
    const target=entity?g.entities[+entity.dataset.entityIndex]:g;
    const row=e.target.closest('.rp-condition'),index=[...row.parentElement.children].filter(el=>el.classList.contains('rp-condition')).indexOf(row),c=target.conditions[index];
    if(c.operator==='语义相似于'){c.source='引用';if(!textVariables.includes(c.value))c.value='';}
  }
  if(e.target.matches('[data-type],[data-field=source],[data-field=operator],[data-field=property]'))render();
});
mask.addEventListener('click',e=>{const button=e.target.closest('[data-action]');if(!button)return;const action=button.dataset.action;if(action==='cancel'){close();return}read();const article=button.closest('.rp-group'),g=article?draft[+article.dataset.index]:null;const entity=button.closest('.rp-entity'),target=entity?g.entities[+entity.dataset.entityIndex]:g;
if(action==='add-group')draft.push(group());
if(action==='remove-group')draft.splice(+article.dataset.index,1);
if(action==='join')g.join=g.join==='AND'?'OR':'AND';
if(action==='add-condition')target.conditions.push(condition());
if(action==='remove-condition'){const row=button.closest('.rp-condition');const index=[...row.parentElement.querySelectorAll(':scope>.rp-condition')].indexOf(row);target.conditions.splice(index,1)}
if(action==='add-entity')g.entities.push({name:'',conditions:[condition()]});
if(action==='remove-entity')g.entities.splice(+entity.dataset.entityIndex,1);
if(action==='confirm'){
  const conditions=draft.flatMap(g=>[...g.conditions,...g.entities.flatMap(e=>e.conditions)]);
  const semanticInvalid=conditions.some(c=>c.operator==='语义相似于'&&(!indexedProperties.has(c.property)||!textVariables.includes(c.value)||c.source!=='引用'||c.minSimilarity===''||!Number.isFinite(Number(c.minSimilarity))||Number(c.minSimilarity)<0||Number(c.minSimilarity)>1||!/^(?:0(?:\.\d{1,2})?|1(?:\.0{1,2})?)$/.test(String(c.minSimilarity))||!/^\d+$/.test(String(c.maxItems))||!Number.isSafeInteger(Number(c.maxItems))||Number(c.maxItems)<1));
  if(semanticInvalid){mask.querySelector('.rp-error').textContent='语义条件需选择已构建语义检索的文本属性和文本变量；最低相似度须为 0～1、最多两位小数，最大条目数须为正整数。';return}
  const invalid=draft.some(g=>!g.types.length||g.entities.some(e=>!e.name)||[...g.conditions,...g.entities.flatMap(e=>e.conditions)].some(c=>!c.property||!c.value.trim()));
  if(invalid){mask.querySelector('.rp-error').textContent='请选择关系类型，并补全已填写的条件及关联实体。';return}
  saved=JSON.parse(JSON.stringify(draft));localStorage.setItem(storageKey,JSON.stringify(saved));close();return;
}
render();});
mask.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close()}if(e.key==='Tab'){const els=[...mask.querySelectorAll('button:not(:disabled),select:not(:disabled),input:not(:disabled),summary')].filter(el=>el.getClientRects().length);const first=els[0],last=els[els.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
})();
