(function(){
'use strict';
const form=document.querySelector('#drawer .form'),query=document.getElementById('query');
query.add(new Option('关系拓展','关系拓展'));
const entityPane=document.createElement('div');entityPane.id='entityQueryPane';
while(query.parentElement.nextSibling)entityPane.append(query.parentElement.nextSibling);
form.append(entityPane);
const pane=document.createElement('div');pane.id='relationExpansionPane';pane.hidden=true;
pane.innerHTML=`<label class="section">实体数据</label><div class="re-card re-source flex"><select aria-label="实体数据来源"><option>引用</option></select><select aria-label="实体数据变量"><option value="">请选择变量</option><option>查询的配件</option><option>配件.115139</option><option>实体列表.140123</option></select></div>
<label class="section">关系配置</label><div class="re-card"><div class="subtitle">最大拓展深度</div><input aria-label="最大拓展深度" type="number" min="1" step="1" value="3"><div class="subtitle">关系类型选择</div><details class="re-types"><summary>请选择关系类型（可多选）</summary><div class="re-type-options"><label><input type="checkbox" value="PN-Claim">PN-Claim</label><label><input type="checkbox" value="Claim-Dealer">Claim-Dealer</label><label><input type="checkbox" value="Claim-HU-TU">Claim-HU-TU</label><label><input type="checkbox" value="Claim-ClaimDoc">Claim-ClaimDoc</label></div></details><div class="subtitle">关系方向</div><select aria-label="关系方向"><option>双向</option><option>出向</option><option>入向</option></select><div class="subtitle">最大条目数</div><input aria-label="最大条目数" type="number" min="1" step="1" value="100"></div>
<label class="section">参数配置</label><button class="re-parameters" title="配置关系与关联实体条件">参数配置 ⓘ</button>
<label class="section">返回内容</label><div class="re-card radios"><label><input type="radio" name="relationReturn" value="all" checked>全部</label><label><input type="radio" name="relationReturn" value="fields">指定对象属性</label></div><div class="re-fields" hidden><select aria-label="指定对象属性"><option value="">请选择对象属性</option><option>配件编号(外部)</option></select></div>
<label class="section">输出参数</label><div class="re-outputs"></div>`;
form.append(pane);
[['Tₜ 文本','拓展结果.140119'],['♧ 本体拓展…','拓展子图.140121'],['₁₂₃ 数组','实体列表.140123'],['Tₜ 文本','查询是否成功.140125'],['Tₜ 文本','查询错误信息.140127']].forEach(([type,name])=>{const row=document.createElement('div');row.className='output';const t=document.createElement('select');t.disabled=true;t.setAttribute('aria-label','关系拓展输出类型');t.add(new Option(type));const input=document.createElement('input');input.value=name;input.setAttribute('aria-label','关系拓展输出参数');row.append(t,input);pane.querySelector('.re-outputs').append(row)});
const key='logic-relation-expansion:'+ (new URLSearchParams(location.search).get('flow')||'default');
function refresh(){const relation=query.value==='关系拓展';entityPane.hidden=relation;pane.hidden=!relation;const checked=[...pane.querySelectorAll('.re-types input:checked')].map(i=>i.value);pane.querySelector('summary').textContent=checked.join('、')||'请选择关系类型（可多选）';pane.querySelector('summary').classList.toggle('has-value',!!checked.length);pane.querySelector('.re-fields').hidden=pane.querySelector('[name=relationReturn]:checked').value!=='fields';}
query.addEventListener('change',refresh);pane.addEventListener('change',refresh);
try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved){query.value=saved.mode;[...pane.querySelectorAll('input,select')].forEach((el,i)=>{const v=saved.fields[i];if(v){el.value=v.value;if(el.type==='radio'||el.type==='checkbox')el.checked=v.checked}})}}catch{}
if(!query.value)query.value='实体查询';refresh();
['save','newversion'].forEach(id=>document.getElementById(id).addEventListener('click',()=>{localStorage.setItem(key,JSON.stringify({mode:query.value,fields:[...pane.querySelectorAll('input,select')].map(el=>({value:el.value,checked:el.checked}))}))}));
})();


