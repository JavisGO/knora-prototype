/* 部门概览看板（2026-11-16）：只做统计。
 * 指标条 → 资源构成 / 知识时序分布 / 空间成员。单色系（品牌蓝）表达数量。数据为原型示例，按空间名确定性生成。 */
(function(){
'use strict';
var BLUE='#0253ff',SOFT='#b9cffd',INK='#010b33',INK3='#8d91a3',GRID='#eef1f6';
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var MONTHS=['2026-06','2026-07','2026-08','2026-09','2026-10','2026-11'];
var mlabel=function(m){return Number(m.slice(5))+'月'};
function seedOf(s){var h=7;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h}
function spread(total,weights){var sum=weights.reduce(function(a,b){return a+b},0),raw=weights.map(function(w){return total*w/sum}),out=raw.map(Math.floor),left=total-out.reduce(function(a,b){return a+b},0);raw.map(function(r,i){return [r-Math.floor(r),i]}).sort(function(a,b){return b[0]-a[0]}).slice(0,left).forEach(function(x){out[x[1]]++});return out}
function stepOf(raw){var p=Math.pow(10,Math.floor(Math.log10(raw))),n=raw/p,c=[1,1.5,2,2.5,3,4,5,6,8,10].filter(function(x){return x>=n})[0]||10;return Math.max(1,c*p)}

var tip;function tipEl(){if(!tip||!tip.isConnected){tip=document.createElement('div');tip.className='sd-tip';tip.hidden=true;document.body.appendChild(tip)}return tip}
function showTip(e,html){var t=tipEl();t.innerHTML=html;t.hidden=false;var x=e.clientX+14,y=e.clientY-10,w=t.offsetWidth;if(x+w>window.innerWidth-12)x=e.clientX-w-14;t.style.left=x+'px';t.style.top=y+'px'}
function hideTip(){if(tip)tip.hidden=true}

/* 知识时序：按更新月份统计文档数 */
function columnChart(el,vals,labels,w){
  var h=200,m={l:30,r:10,t:22,b:28},iw=w-m.l-m.r,ih=h-m.t-m.b,mx=Math.max.apply(null,vals),step=stepOf(Math.max(mx,3)*1.1/4),max=step*4,slot=iw/vals.length,bw=Math.min(24,slot*.5);
  var y=function(v){return m.t+ih-v/max*ih},g='',bars='',hi=vals.indexOf(mx);
  for(var t=0;t<=4;t++){var yy=y(step*t);g+='<line x1="'+m.l+'" x2="'+(w-m.r)+'" y1="'+yy+'" y2="'+yy+'" stroke="'+GRID+'" stroke-width="1"/><text x="'+(m.l-8)+'" y="'+(yy+4)+'" text-anchor="end" font-size="11" fill="'+INK3+'">'+step*t+'</text>'}
  vals.forEach(function(v,i){var cx=m.l+slot*i+slot/2,x0=cx-bw/2,top=y(v),base=m.t+ih,r=Math.min(4,base-top);
    if(v>0)bars+='<path d="M'+x0+','+base+'L'+x0+','+(top+r)+'Q'+x0+','+top+' '+(x0+r)+','+top+'L'+(x0+bw-r)+','+top+'Q'+(x0+bw)+','+top+' '+(x0+bw)+','+(top+r)+'L'+(x0+bw)+','+base+'Z" fill="'+(i===hi&&mx>0?BLUE:SOFT)+'"/>';
    bars+='<text x="'+cx+'" y="'+(h-8)+'" text-anchor="middle" font-size="11" fill="'+INK3+'">'+labels[i]+'</text>';
    if(i===hi&&mx>0)bars+='<text x="'+cx+'" y="'+(top-6)+'" text-anchor="middle" font-size="12" font-weight="700" fill="'+INK+'">'+v+'</text>';
    bars+='<rect x="'+(cx-slot/2)+'" y="'+m.t+'" width="'+slot+'" height="'+ih+'" fill="transparent" data-i="'+i+'"/>'});
  el.innerHTML='<svg viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" role="img" aria-label="按更新月份统计文档数">'+g+bars+'</svg>';
  el.querySelectorAll('[data-i]').forEach(function(r){var i=Number(r.dataset.i);r.addEventListener('mousemove',function(e){showTip(e,'<b>'+MONTHS[i]+'</b><span>更新文档 <i>'+vals[i]+'</i> 篇</span>')});r.addEventListener('mouseleave',hideTip)});
}
function tableHtml(head,rows){return '<table class="sd-table"><thead><tr>'+head.map(function(h){return '<th>'+h+'</th>'}).join('')+'</tr></thead><tbody>'+rows.map(function(r){return '<tr>'+r.map(function(c){return '<td>'+c+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table>'}

function mount(host,c){
  var seed=seedOf(c.space),base=c.space==='采购组',pendingDocs=base?0:seed%2,docMonths=spread(c.docs,[1,1,1,3]).concat([0,0]),total=c.docs+c.tables+c.ontologyTotal+c.agents,view='chart';
  var adminN=c.members.filter(function(m){return m.role==='管理员'}).length;
  var tiles=[
   {label:'资源总数',val:total,sub:'文档 · 数据表 · 本体 · 智能体',tab:'doc',hero:1},
   {label:'文档',val:c.docs,sub:'已解析 '+c.docs+' · 待审批 '+pendingDocs,tab:'doc'},
   {label:'数据表',val:c.tables,sub:'来自已接入的数据源',tab:'data'},
   {label:'本体对象',val:c.ontologyTotal,sub:'实体 '+c.ontology.entity+' · 关系 '+c.ontology.relation+' · 事件 '+c.ontology.event+' · 行为 '+c.ontology.action+' · 流程 '+c.ontology.flow,tab:'ontology'},
   {label:'智能体',val:c.agents,sub:c.agentsPublished+' 已发布',tab:'agent'},
   {label:'空间成员',val:c.members.length,sub:adminN+' 管理员 · '+(c.members.length-adminN)+' 普通成员',tab:c.isAdmin?'members':''}
  ];
  function tile(t){var tag=t.tab?'button type="button" data-sd-tab="'+t.tab+'"':'div';return '<'+tag+' class="sd-tile'+(t.hero?' hero':'')+'"><span class="sd-tl">'+t.label+'</span><strong>'+t.val+'</strong><small title="'+esc(t.sub)+'">'+esc(t.sub)+'</small></'+(t.tab?'button':'div')+'>'}
  var comp=[['数据表',c.tables,'data'],['智能体',c.agents,'agent'],['本体对象',c.ontologyTotal,'ontology'],['文档',c.docs,'doc']].sort(function(a,b){return b[1]-a[1]}),cmax=Math.max.apply(null,comp.map(function(x){return x[1]}))||1,ctot=comp.reduce(function(a,x){return a+x[1]},0)||1;
  var roleCount={};c.members.forEach(function(m){roleCount[m.role]=(roleCount[m.role]||0)+1});
  host.innerHTML='<div class="sd">'+
   '<section class="sd-kpis">'+tiles.map(tile).join('')+'</section>'+
   '<div class="sd-row">'+
    '<section class="sd-card"><header><div><h3>资源构成</h3><p>按资源类型，共 '+ctot+' 项</p></div></header><div class="sd-rank">'+comp.map(function(r){return '<button type="button" class="sd-rrow" data-sd-tab="'+r[2]+'" data-tip="'+r[0]+' '+r[1]+' 项 · 占 '+Math.round(r[1]/ctot*100)+'%"><span class="sd-rname">'+r[0]+'</span><span class="sd-track"><i style="width:'+Math.max(r[1]?3:0,r[1]/cmax*100)+'%"></i></span><span class="sd-rval"><b>'+r[1]+'</b><small>'+Math.round(r[1]/ctot*100)+'%</small></span></button>'}).join('')+'</div></section>'+
    '<section class="sd-card"><header><div><h3>知识时序分布 <span class="sd-cnt">（'+docMonths.filter(function(v){return v>0}).length+'条）</span></h3><p>按更新月份统计文档数</p></div><div class="sd-ctl"><button type="button" class="sd-view" data-sd-view title="切换图表 / 表格">表格</button></div></header><div class="sd-body" data-body="time"></div></section>'+
    '<section class="sd-card"><header><div><h3>空间成员</h3><p>共 '+c.members.length+' 人'+(Object.keys(roleCount).length?' · '+Object.keys(roleCount).map(function(k){return k+' '+roleCount[k]}).join(' · '):'')+'</p></div>'+(c.isAdmin?'<button type="button" class="sd-link" data-sd-tab="members">管理成员 ›</button>':'')+'</header><ul class="sd-members">'+(c.members.length?c.members.slice(0,5).map(function(mm){return '<li><i>'+esc(mm.account.charAt(0).toUpperCase())+'</i><b>'+esc(mm.account)+'</b><em class="'+(mm.role==='管理员'?'admin':'')+'">'+esc(mm.role)+'</em></li>'}).join(''):'<li class="sd-empty">暂无成员</li>')+'</ul></section>'+
   '</div>'+
   '<p class="sd-note">以上为原型示例数据。</p></div>';

  function drawTime(){var body=host.querySelector('[data-body=time]');
    if(view==='table'){body.innerHTML=tableHtml(['更新月份','文档数'],docMonths.map(function(v,i){return [MONTHS[i],v]}));return}
    if(!c.docs){body.innerHTML='<div class="sd-empty-chart">暂无文档</div>';return}
    columnChart(body,docMonths,MONTHS.map(mlabel),Math.max(260,body.clientWidth||320))}
  drawTime();
  host.querySelector('[data-sd-view]').addEventListener('click',function(e){view=view==='chart'?'table':'chart';e.currentTarget.textContent=view==='chart'?'表格':'图表';drawTime()});
  host.addEventListener('click',function(e){var t=e.target.closest('[data-sd-tab]');if(t&&window.KnoraResourceTabs)window.KnoraResourceTabs.show(t.dataset.sdTab)});
  host.querySelectorAll('[data-tip]').forEach(function(el){el.addEventListener('mousemove',function(e){showTip(e,esc(el.dataset.tip))});el.addEventListener('mouseleave',hideTip)});
  if(window.ResizeObserver){var ro=new ResizeObserver(function(){if(!host.isConnected){ro.disconnect();return}if(c.docs&&view==='chart')drawTime()});ro.observe(host.querySelector('[data-body=time]'))}
}
window.KnoraSpaceDashboard={mount:mount};
})();
