/* 部门概览看板（2026-11-16）
 * 指标条 → 趋势 / 构成 → 待办 / 知识时序 / 成员 → 最近动态。
 * 单色系（品牌蓝）表达数量；状态色只用于待办，且带图标和文字。数据为原型示例，按空间名确定性生成。 */
(function(){
'use strict';
var BLUE='#0253ff',SOFT='#b9cffd',INK='#010b33',INK2='#5a607a',INK3='#8d91a3',GRID='#eef1f6';
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var MONTHS=['2025-12','2026-01','2026-02','2026-03','2026-04','2026-05','2026-06','2026-07','2026-08','2026-09','2026-10','2026-11'];
var mlabel=function(m){return Number(m.slice(5))+'月'};
function seedOf(s){var h=7;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h}

/* ---------- 数据（示例） ---------- */
var SHAPE={docs:[1/6,2/6,3/6,1,1,1],tables:[16/31,19/31,22/31,26/31,28/31,1],onto:[3/11,4/11,6/11,8/11,10/11,1],agents:[4/12,6/12,8/12,9/12,11/12,1]};
function series(count,fr){var out=fr.map(function(f){return Math.round(count*f)});out[out.length-1]=count;for(var i=1;i<out.length;i++)if(out[i]<out[i-1])out[i]=out[i-1];return out}
function spread(total,weights){var sum=weights.reduce(function(a,b){return a+b},0),raw=weights.map(function(w){return total*w/sum}),out=raw.map(Math.floor),left=total-out.reduce(function(a,b){return a+b},0);raw.map(function(r,i){return [r-Math.floor(r),i]}).sort(function(a,b){return b[0]-a[0]}).slice(0,left).forEach(function(x){out[x[1]]++});return out}
function build(c){
  var docs=series(c.docs,SHAPE.docs),tables=series(c.tables,SHAPE.tables),onto=series(c.ontologyTotal,SHAPE.onto),agents=series(c.agents,SHAPE.agents);
  var total6=docs.map(function(_,i){return docs[i]+tables[i]+onto[i]+agents[i]});
  var pre=[4,6,9,12,16,20].map(function(v){return Math.round(v/24*total6[0])});for(var i=1;i<pre.length;i++)if(pre[i]<pre[i-1])pre[i]=pre[i-1];
  var total12=pre.concat(total6).map(function(v,i,a){return Math.max(v,i?0:v)});for(var k=1;k<total12.length;k++)if(total12[k]<total12[k-1])total12[k]=total12[k-1];
  var docMonths=spread(c.docs,[1,1,1,3]).concat([0,0]);
  var seed=seedOf(c.space),base=c.space==='采购组';
  var pend=base?[0,2,1,2,1]:[seed%2,(seed>>2)%3,(seed>>4)%2,(seed>>6)%3,(seed>>8)%2];
  return {docs:docs,tables:tables,onto:onto,agents:agents,total6:total6,total12:total12,docMonths:docMonths,pend:pend,total:total6[5]}
}

/* ---------- 小工具：提示框、迷你折线 ---------- */
var tip;function tipEl(){if(!tip||!tip.isConnected){tip=document.createElement('div');tip.className='sd-tip';tip.hidden=true;document.body.appendChild(tip)}return tip}
function showTip(e,html){var t=tipEl();t.innerHTML=html;t.hidden=false;var x=e.clientX+14,y=e.clientY-10,w=t.offsetWidth;if(x+w>window.innerWidth-12)x=e.clientX-w-14;t.style.left=x+'px';t.style.top=y+'px'}
function hideTip(){if(tip)tip.hidden=true}
function spark(vals){var w=76,h=30,pad=4,max=Math.max.apply(null,vals),min=Math.min.apply(null,vals),span=max-min||1,pts=vals.map(function(v,i){return [pad+i*(w-pad*2)/(vals.length-1),h-pad-(v-min)/span*(h-pad*2)]}),last=pts[pts.length-1];return '<svg class="sd-spark" viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" aria-hidden="true"><polyline fill="none" stroke="'+BLUE+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="'+pts.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1)}).join(' ')+'"/><circle cx="'+last[0]+'" cy="'+last[1]+'" r="4" fill="'+BLUE+'" stroke="#fff" stroke-width="2"/></svg>'}
function stepOf(raw){var p=Math.pow(10,Math.floor(Math.log10(raw))),n=raw/p,c=[1,1.5,2,2.5,3,4,5,6,8,10].filter(function(x){return x>=n})[0]||10;return Math.max(1,c*p)}

/* ---------- 趋势折线 ---------- */
function lineChart(el,pts,w){
  var h=236,m={l:38,r:48,t:16,b:30},iw=w-m.l-m.r,ih=h-m.t-m.b,step=stepOf(Math.max.apply(null,pts.map(function(p){return p.v}))*1.08/4),max=step*4;
  var x=function(i){return m.l+i*iw/(pts.length-1)},y=function(v){return m.t+ih-v/max*ih};
  var d=pts.map(function(p,i){return (i?'L':'M')+x(i).toFixed(1)+','+y(p.v).toFixed(1)}).join('');
  var area=d+'L'+x(pts.length-1)+','+(m.t+ih)+'L'+x(0)+','+(m.t+ih)+'Z',grid='';
  for(var t=0;t<=4;t++){var yy=y(step*t);grid+='<line x1="'+m.l+'" x2="'+(w-m.r)+'" y1="'+yy+'" y2="'+yy+'" stroke="'+GRID+'" stroke-width="1"/><text x="'+(m.l-8)+'" y="'+(yy+4)+'" text-anchor="end" font-size="11" fill="'+INK3+'">'+step*t+'</text>'}
  var xl=pts.map(function(p,i){return (pts.length<=6||i%2===(pts.length-1)%2)?'<text x="'+x(i)+'" y="'+(h-8)+'" text-anchor="middle" font-size="11" fill="'+INK3+'">'+mlabel(p.m)+'</text>':''}).join('');
  var last=pts[pts.length-1];
  el.innerHTML='<svg viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" role="img" aria-label="累计资源数趋势">'+grid+xl+'<path d="'+area+'" fill="'+BLUE+'" fill-opacity=".10"/><path d="'+d+'" fill="none" stroke="'+BLUE+'" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><g data-hover style="display:none"><line y1="'+m.t+'" y2="'+(m.t+ih)+'" stroke="'+INK3+'" stroke-width="1"/><circle r="5" fill="'+BLUE+'" stroke="#fff" stroke-width="2"/></g><circle cx="'+x(pts.length-1)+'" cy="'+y(last.v)+'" r="5" fill="'+BLUE+'" stroke="#fff" stroke-width="2"/><text x="'+(x(pts.length-1)+10)+'" y="'+(y(last.v)+4)+'" font-size="13" font-weight="700" fill="'+INK+'">'+last.v+'</text><rect x="'+m.l+'" y="'+m.t+'" width="'+iw+'" height="'+ih+'" fill="transparent" data-hit/></svg>';
  var svg=el.firstChild,hv=svg.querySelector('[data-hover]'),hit=svg.querySelector('[data-hit]');
  function at(e){var r=svg.getBoundingClientRect(),px=(e.clientX-r.left)*(w/r.width),i=Math.round((px-m.l)/(iw/(pts.length-1)));return Math.max(0,Math.min(pts.length-1,i))}
  hit.addEventListener('mousemove',function(e){var i=at(e),p=pts[i];hv.style.display='';hv.querySelector('line').setAttribute('x1',x(i));hv.querySelector('line').setAttribute('x2',x(i));var c=hv.querySelector('circle');c.setAttribute('cx',x(i));c.setAttribute('cy',y(p.v));showTip(e,'<b>'+p.m+'</b><span>累计资源 <i>'+p.v+'</i></span><span>当月新增 <i>'+(p.d>0?'+':'')+p.d+'</i></span>')});
  hit.addEventListener('mouseleave',function(){hv.style.display='none';hideTip()});
}

/* ---------- 知识时序柱状 ---------- */
function columnChart(el,vals,labels,w){
  var h=190,m={l:30,r:10,t:22,b:28},iw=w-m.l-m.r,ih=h-m.t-m.b,mx=Math.max.apply(null,vals),step=stepOf(Math.max(mx,3)*1.1/4),max=step*4,slot=iw/vals.length,bw=Math.min(24,slot*.5);
  var y=function(v){return m.t+ih-v/max*ih},g='',bars='',hi=vals.indexOf(mx);
  for(var t=0;t<=4;t++){var yy=y(step*t);g+='<line x1="'+m.l+'" x2="'+(w-m.r)+'" y1="'+yy+'" y2="'+yy+'" stroke="'+GRID+'" stroke-width="1"/><text x="'+(m.l-8)+'" y="'+(yy+4)+'" text-anchor="end" font-size="11" fill="'+INK3+'">'+step*t+'</text>'}
  vals.forEach(function(v,i){var cx=m.l+slot*i+slot/2,x0=cx-bw/2,top=y(v),base=m.t+ih,r=Math.min(4,base-top);
    if(v>0)bars+='<path d="M'+x0+','+base+'L'+x0+','+(top+r)+'Q'+x0+','+top+' '+(x0+r)+','+top+'L'+(x0+bw-r)+','+top+'Q'+(x0+bw)+','+top+' '+(x0+bw)+','+(top+r)+'L'+(x0+bw)+','+base+'Z" fill="'+(i===hi&&mx>0?BLUE:SOFT)+'"/>';
    bars+='<text x="'+cx+'" y="'+(h-8)+'" text-anchor="middle" font-size="11" fill="'+INK3+'">'+labels[i]+'</text>';
    if(i===hi&&mx>0)bars+='<text x="'+cx+'" y="'+(top-6)+'" text-anchor="middle" font-size="12" font-weight="700" fill="'+INK+'">'+v+'</text>';
    bars+='<rect x="'+(cx-slot/2)+'" y="'+m.t+'" width="'+slot+'" height="'+ih+'" fill="transparent" data-i="'+i+'"/>'});
  el.innerHTML='<svg viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" role="img" aria-label="按更新月份统计文档数">'+g+bars+'</svg>';
  el.querySelectorAll('[data-i]').forEach(function(r){var i=Number(r.dataset.i);r.addEventListener('mousemove',function(e){showTip(e,'<b>'+labels[i]+'</b><span>更新文档 <i>'+vals[i]+'</i> 篇</span>')});r.addEventListener('mouseleave',hideTip)});
}

/* ---------- 页面 ---------- */
function tableHtml(head,rows){return '<table class="sd-table"><thead><tr>'+head.map(function(h){return '<th>'+h+'</th>'}).join('')+'</tr></thead><tbody>'+rows.map(function(r){return '<tr>'+r.map(function(c){return '<td>'+c+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table>'}
function mount(host,c){
  var D=build(c),st={range:6,trend:'chart',time:'chart'};
  var tiles=[
   {label:'资源总数',val:D.total,ser:D.total6,tab:'doc',hero:1},
   {label:'文档',val:c.docs,ser:D.docs,tab:'doc'},
   {label:'数据表',val:c.tables,ser:D.tables,tab:'data'},
   {label:'本体对象',val:c.ontologyTotal,ser:D.onto,tab:'ontology',sub:'实体 '+c.ontology.entity+' · 关系 '+c.ontology.relation+' · 事件 '+c.ontology.event+' · 行为 '+c.ontology.action+' · 流程 '+c.ontology.flow},
   {label:'智能体',val:c.agents,ser:D.agents,tab:'agent',sub:c.agentsPublished+' 已发布'},
   {label:'空间成员',val:c.members.length,tab:c.isAdmin?'members':'',sub:c.members.filter(function(m){return m.role==='管理员'}).length+' 管理员'}
  ];
  function tile(t){var d=t.ser?t.ser[5]-t.ser[4]:0,delta=d>0?'<em class="up">▲ '+d+'</em>':d<0?'<em class="down">▼ '+Math.abs(d)+'</em>':'<em class="flat">持平</em>';
    return '<'+(t.tab?'button type="button" data-sd-tab="'+t.tab+'"':'div')+' class="sd-tile'+(t.hero?' hero':'')+'"><span class="sd-tl">'+t.label+'</span><strong>'+t.val+'</strong><span class="sd-delta">较上月 '+delta+'</span>'+(t.sub?'<small title="'+esc(t.sub)+'">'+esc(t.sub)+'</small>':'')+(t.ser?spark(t.ser):'')+'</'+(t.tab?'button':'div')+'>'}
  var comp=[['数据表',c.tables,'data'],['智能体',c.agents,'agent'],['本体对象',c.ontologyTotal,'ontology'],['文档',c.docs,'doc']].sort(function(a,b){return b[1]-a[1]}),cmax=Math.max.apply(null,comp.map(function(x){return x[1]}))||1,ctot=comp.reduce(function(a,x){return a+x[1]},0)||1;
  var P=[
   {n:D.pend[0],name:'待审批文档',desc:'提交后等待空间管理员审核',lv:'warn',tab:'doc'},
   {n:D.pend[1],name:'资源申请待审批',desc:'项目申请本空间的资源',lv:'warn',href:'portal-mine.html'},
   {n:D.pend[2],name:'授权即将到期',desc:'7 天内到期的资源授权',lv:'warn',href:'portal-mine.html'},
   {n:D.pend[3],name:'未打标签的文档',desc:'补充标签便于检索与统计',lv:'info',tab:'doc'},
   {n:D.pend[4],name:'数据源同步异常',desc:'同步失败的数据源需检查',lv:'bad',tab:'data'}
  ],pendTotal=P.reduce(function(a,x){return a+x.n},0),ICON={warn:'!',info:'i',bad:'✕',ok:'✓'},LV={warn:'需处理',info:'建议',bad:'异常'};
  var ACT=[['表','新增数据表 supplier_performance_monthly','sailisi_caigou','2026-11-12 16:05'],['本','发布本体对象「供应商」','sailisi','2026-11-10 11:32'],['申','提交资源申请（采购价格分析项目）','陈宇','2026-11-09 18:10'],['智','智能体「供应商风险洞察」发布上线','sailisi_caigou','2026-11-08 10:20'],['文','上传文档「通知＋申报书（司局发）.pdf」','sailisi_caigou','2026-09-23 17:37']];
  var m6=MONTHS.slice(6),doc6=D.docMonths,roleCount={};c.members.forEach(function(m){roleCount[m.role]=(roleCount[m.role]||0)+1});
  host.innerHTML='<div class="sd">'+
   '<section class="sd-kpis">'+tiles.map(tile).join('')+'</section>'+
   '<div class="sd-row r-8-4">'+
    '<section class="sd-card" data-card="trend"><header><div><h3>资源增长趋势</h3><p>累计资源数 · 每月末</p></div><div class="sd-ctl"><span class="sd-seg"><button type="button" data-sd-range="6" class="on">近 6 个月</button><button type="button" data-sd-range="12">近 12 个月</button></span><button type="button" class="sd-view" data-sd-view="trend" title="切换图表 / 表格">表格</button></div></header><div class="sd-body" data-body="trend"></div></section>'+
    '<section class="sd-card"><header><div><h3>资源构成</h3><p>按资源类型，共 '+ctot+' 项</p></div></header><div class="sd-rank">'+comp.map(function(r){return '<button type="button" class="sd-rrow" data-sd-tab="'+r[2]+'" data-tip="'+r[0]+' '+r[1]+' 项 · 占 '+Math.round(r[1]/ctot*100)+'%"><span class="sd-rname">'+r[0]+'</span><span class="sd-track"><i style="width:'+Math.max(r[1]?3:0,r[1]/cmax*100)+'%"></i></span><span class="sd-rval"><b>'+r[1]+'</b><small>'+Math.round(r[1]/ctot*100)+'%</small></span></button>'}).join('')+'</div></section>'+
   '</div>'+
   '<div class="sd-row r-4-4-4">'+
    '<section class="sd-card"><header><div><h3>待办事项</h3><p>'+(pendTotal?'共 '+pendTotal+' 项待处理':'暂无待办')+'</p></div></header><ul class="sd-todo">'+P.map(function(x){var go=x.n>0?(x.href?'data-sd-href="'+x.href+'"':'data-sd-tab="'+x.tab+'"'):'';return '<li><'+(x.n>0?'button type="button" '+go:'div')+' class="sd-t'+(x.n>0?' act':'')+'"><i class="lv-'+(x.n>0?x.lv:'ok')+'" aria-hidden="true">'+ICON[x.n>0?x.lv:'ok']+'</i><span class="sd-tx"><b>'+x.name+'</b><small>'+x.desc+'</small></span>'+(x.n>0?'<span class="sd-tn"><b>'+x.n+'</b><em>'+LV[x.lv]+' ›</em></span>':'<span class="sd-tn ok"><em>✓ 已清零</em></span>')+'</'+(x.n>0?'button':'div')+'></li>'}).join('')+'</ul></section>'+
    '<section class="sd-card" data-card="time"><header><div><h3>知识时序分布 <span class="sd-cnt">（'+doc6.filter(function(v){return v>0}).length+'条）</span></h3><p>按更新月份统计文档数</p></div><div class="sd-ctl"><button type="button" class="sd-view" data-sd-view="time" title="切换图表 / 表格">表格</button></div></header><div class="sd-body" data-body="time"></div></section>'+
    '<section class="sd-card"><header><div><h3>空间成员</h3><p>共 '+c.members.length+' 人'+(Object.keys(roleCount).length?' · '+Object.keys(roleCount).map(function(k){return k+' '+roleCount[k]}).join(' · '):'')+'</p></div>'+(c.isAdmin?'<button type="button" class="sd-link" data-sd-tab="members">管理成员 ›</button>':'')+'</header><ul class="sd-members">'+(c.members.length?c.members.slice(0,5).map(function(mm){return '<li><i>'+esc(mm.account.charAt(0).toUpperCase())+'</i><b>'+esc(mm.account)+'</b><em class="'+(mm.role==='管理员'?'admin':'')+'">'+esc(mm.role)+'</em></li>'}).join(''):'<li class="sd-empty">暂无成员</li>')+'</ul></section>'+
   '</div>'+
   '<section class="sd-card sd-activity"><header><div><h3>最近动态</h3><p>空间内资源与申请的最新变化</p></div></header><ul>'+ACT.map(function(a){return '<li><i>'+a[0]+'</i><span class="sd-ax"><b>'+esc(a[1])+'</b></span><span class="sd-ap">'+esc(a[2])+'</span><time>'+a[3]+'</time></li>'}).join('')+'</ul></section>'+
   '<p class="sd-note">以上为原型示例数据。</p></div>';

  /* 趋势 / 时序：图与表可切换 */
  function drawTrend(){var body=host.querySelector('[data-body=trend]'),n=st.range,v=D.total12.slice(12-n),ms=MONTHS.slice(12-n),pts=v.map(function(val,i){return {v:val,m:ms[i],d:val-(i?v[i-1]:(12-n>0?D.total12[12-n-1]:val))}});
    if(st.trend==='table'){body.innerHTML=tableHtml(['月份','累计资源','当月新增'],pts.map(function(p){return [p.m,p.v,(p.d>0?'+':'')+p.d]}));return}
    lineChart(body,pts,Math.max(320,body.clientWidth||640))}
  function drawTime(){var body=host.querySelector('[data-body=time]');
    if(st.time==='table'){body.innerHTML=tableHtml(['更新月份','文档数'],doc6.map(function(v,i){return [MONTHS.slice(6)[i],v]}));return}
    if(!c.docs){body.innerHTML='<div class="sd-empty-chart">暂无文档</div>';return}
    columnChart(body,doc6,MONTHS.slice(6).map(mlabel),Math.max(260,body.clientWidth||320))}
  drawTrend();drawTime();
  host.querySelectorAll('[data-sd-range]').forEach(function(b){b.addEventListener('click',function(){st.range=Number(b.dataset.sdRange);host.querySelectorAll('[data-sd-range]').forEach(function(x){x.classList.toggle('on',x===b)});drawTrend()})});
  host.querySelectorAll('[data-sd-view]').forEach(function(b){b.addEventListener('click',function(){var k=b.dataset.sdView;st[k]=st[k]==='chart'?'table':'chart';b.textContent=st[k]==='chart'?'表格':'图表';k==='trend'?drawTrend():drawTime()})});
  host.addEventListener('click',function(e){var t=e.target.closest('[data-sd-tab]');if(t&&window.KnoraResourceTabs){window.KnoraResourceTabs.show(t.dataset.sdTab);return}var h=e.target.closest('[data-sd-href]');if(h)location.href=h.dataset.sdHref});
  host.querySelectorAll('[data-tip]').forEach(function(el){el.addEventListener('mousemove',function(e){showTip(e,esc(el.dataset.tip))});el.addEventListener('mouseleave',hideTip)});
  if(window.ResizeObserver){var ro=new ResizeObserver(function(){if(!host.isConnected){ro.disconnect();return}drawTrend();if(c.docs&&st.time==='chart')drawTime()});ro.observe(host.querySelector('[data-body=trend]'))}
}
window.KnoraSpaceDashboard={mount:mount};
})();
