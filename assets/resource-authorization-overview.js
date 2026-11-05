(function(){
  'use strict';
  var DIALOG='.mine-share-modal:not(.pr2-public-auth-modal),.pr2-public-auth-modal,.data-auth-dialog,.multi-auth-dialog';
  var VIEW='[data-share-pane="view"],[data-public-auth-main-pane="view"],[data-ontology-auth-pane="view"],[data-data-auth-main-pane="view"],[data-agent-auth-pane="view"],[data-multi-auth-pane="view"]';
  var ROW='.mine-auth-row,.pr2-auth-overview-row,.data-auth-overview-row,.multi-auth-overview-row';
  function plain(node){return node?node.textContent.replace(/\s+/g,' ').trim():''}
  function value(cell){return plain(cell)}
  function sourceType(dialog){if(dialog.matches('.mine-share-modal:not(.pr2-public-auth-modal)'))return 'personal';if(dialog.matches('.pr2-public-auth-modal'))return 'document';if(dialog.matches('.multi-auth-dialog'))return 'generic';return 'structured'}
  function resourceName(dialog,source,type){
    if(dialog.dataset.authResourceName)return dialog.dataset.authResourceName;
    if(type==='personal'){var doc=source.querySelector('.mine-auth-row>span:first-child b');return plain(doc)||'当前文件'}
    var subtitle=dialog.querySelector(':scope>header p');if(subtitle)return plain(subtitle).split(' · ')[0];
    var generic=dialog.querySelector('.pr2-multi-form>p>b');return plain(generic)||'当前资源';
  }
  function resourceLabel(dialog,type){
    if(type==='personal'||type==='document')return '文件名称';
    var title=plain(dialog.querySelector(':scope>header h2'));
    if(/数据库/.test(title))return '数据库名称';
    if(/数据表/.test(title))return '表名称';
    if(/实体/.test(title))return '实体名称';
    if(/关系/.test(title))return '关系名称';
    if(/事件/.test(title))return '事件名称';
    if(/流程/.test(title))return '流程名称';
    if(/智能体/.test(title))return '智能体名称';
    if(/Action|行为/.test(title))return 'Action名称';
    var kind=plain(dialog.querySelector('.pr2-multi-form>p>small')).split(' · ')[0];
    return kind?kind+'名称':'资源名称';
  }
  function readRows(source,type,resource){return Array.from(source.querySelectorAll(ROW)).map(function(row){
    var cells=Array.from(row.children),mine=type==='personal',grantee=mine?value(cells[1]):plain(cells[0]&&cells[0].querySelector('b'))||value(cells[0]);
    var objectType=mine?'用户':value(cells[1]),permission=value(cells[mine?2:2]),period=value(cells[mine?3:(cells.length>=5?4:3)]);
    var scope=!mine&&cells.length>=5?value(cells[3]):'',org=!mine?plain(cells[0]&&cells[0].querySelector('small')):'';
    return {source:row,resource:mine?plain(cells[0]&&cells[0].querySelector('b'))||resource:resource,grantee:grantee,granter:row.dataset.grantor||'陈宇',objectType:objectType,permission:permission,period:period,scope:scope,org:org};
  })}
  function cell(textValue,className){var el=document.createElement('span');if(className)el.className=className;el.textContent=textValue||'—';return el}
  function render(dialog){
    var pane=dialog.querySelector(VIEW);if(!pane)return;
    var source=pane.querySelector('.auth-unified-source'),output=pane.querySelector('.auth-unified-output');if(!source||!output)return;
    var type=sourceType(dialog),resource=resourceName(dialog,source,type),label=resourceLabel(dialog,type),rows=readRows(source,type,resource);
    output.replaceChildren();
    var tools=document.createElement('div');tools.className='auth-unified-tools';
    var filter=document.createElement('select');filter.setAttribute('aria-label','筛选授权对象类型');[['all','全部对象'],['用户','用户'],['角色','角色']].forEach(function(pair){var option=document.createElement('option');option.value=pair[0];option.textContent=pair[1];filter.appendChild(option)});
    var searchWrap=document.createElement('label');searchWrap.className='auth-unified-search';var search=document.createElement('input');search.placeholder='搜索被授权对象';search.setAttribute('aria-label','搜索被授权对象');var icon=document.createElement('span');icon.textContent='⌕';searchWrap.append(search,icon);tools.append(filter,searchWrap);output.appendChild(tools);
    var table=document.createElement('div');table.className='auth-unified-table';var head=document.createElement('div');head.className='auth-unified-grid auth-unified-head';[label,'被授权对象','授权人','对象类型','权限','有效期','操作'].forEach(function(h){var b=document.createElement('b');b.textContent=h;head.appendChild(b)});table.appendChild(head);
    var list=document.createElement('div');list.className='auth-unified-list';table.appendChild(list);output.appendChild(table);
    var records=[];
    rows.forEach(function(record){var wrapper=document.createElement('div');wrapper.className='auth-unified-record';var grid=document.createElement('div');grid.className='auth-unified-grid auth-unified-row';
      grid.append(cell(record.resource,'auth-unified-resource'),cell(record.grantee,'auth-unified-grantee'),cell(record.granter),cell(record.objectType),cell(record.permission,'auth-unified-permission'),cell(record.period));
      var action=document.createElement('span');action.className='auth-unified-action';var button=document.createElement('button');button.type='button';button.textContent='详情';action.appendChild(button);grid.appendChild(action);wrapper.appendChild(grid);
      var detail=document.createElement('div');detail.className='auth-unified-detail';detail.hidden=true;var info=document.createElement('span');info.textContent='授权对象：'+record.grantee+(record.org?' · '+record.org:'')+'　授权人：'+record.granter+(record.scope?'　授权范围：'+record.scope:'');detail.appendChild(info);
      record.source.querySelectorAll('button').forEach(function(original){var proxy=document.createElement('button');proxy.type='button';proxy.textContent=plain(original);proxy.addEventListener('click',function(){original.click()});detail.appendChild(proxy)});
      button.addEventListener('click',function(){detail.hidden=!detail.hidden;button.textContent=detail.hidden?'详情':'收起'});wrapper.appendChild(detail);list.appendChild(wrapper);records.push({node:wrapper,data:record})
    });
    var empty=document.createElement('div');empty.className='auth-unified-empty';empty.innerHTML='<span aria-hidden="true">▱</span><p>暂无授权记录</p>';list.appendChild(empty);
    function update(){var chosen=filter.value,word=search.value.trim().toLowerCase(),visible=0;records.forEach(function(entry){var match=(chosen==='all'||entry.data.objectType===chosen)&&(!word||entry.data.grantee.toLowerCase().includes(word));entry.node.hidden=!match;if(match)visible++});empty.hidden=visible>0}
    filter.addEventListener('change',update);search.addEventListener('input',update);update();
  }
  function setup(dialog){if(dialog.dataset.authUnifiedDone)return;var pane=dialog.querySelector(VIEW);if(!pane)return;dialog.dataset.authUnifiedDone='1';dialog.classList.add('auth-unified-dialog');pane.classList.add('auth-unified-pane');var source=document.createElement('div');source.className='auth-unified-source';while(pane.firstChild)source.appendChild(pane.firstChild);var output=document.createElement('div');output.className='auth-unified-output';pane.append(source,output);render(dialog)}
  function scan(root){if(root.nodeType!==1&&root.nodeType!==9)return;if(root.matches&&root.matches(DIALOG))setup(root);if(root.querySelectorAll)root.querySelectorAll(DIALOG).forEach(setup)}
  function start(){scan(document);new MutationObserver(function(mutations){mutations.forEach(function(m){var target=m.target.nodeType===1?m.target:m.target.parentElement;if(target&&target.closest&&target.closest('.auth-unified-output'))return;if(target&&target.closest){var source=target.closest('.auth-unified-source');if(source){var dialog=source.closest(DIALOG);if(dialog)render(dialog);return}}m.addedNodes.forEach(scan)})}).observe(document.body,{childList:true,subtree:true})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
