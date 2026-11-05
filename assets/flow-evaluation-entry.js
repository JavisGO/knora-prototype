(function () {
  'use strict';
  var previousFocus;
  function close() {
    var mask = document.getElementById('flowEvaluationMask');
    if (mask) mask.remove();
    if (previousFocus) previousFocus.focus();
  }
  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-flow-evaluation]');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (document.getElementById('flowEvaluationMask')) return;
    previousFocus = button;
    var card = button.closest('[data-flow-open]');
    var params = new URLSearchParams(location.search);
    var name = card ? card.dataset.flowName : params.get('flowName') || document.querySelector('.toolbar strong').textContent;
    if(window.KnoraBatchTasks){window.KnoraBatchTasks.open({version:card?Array.from(card.querySelectorAll('.om-metric')).find(function(n){return n.textContent.trim().startsWith('版本')})?.querySelector('b')?.textContent:null,flow:card?card.dataset.flowOpen:params.get('flow')||'default',project:params.get('project')||localStorage.getItem('knora:lastProject')||'personal',name:name});return;}
    var mask = document.createElement('div');
    mask.id = 'flowEvaluationMask';
    mask.className = 'flow-evaluation-mask';
    mask.innerHTML = '<section class="flow-evaluation-dialog" role="dialog" aria-modal="true" aria-labelledby="flowEvaluationTitle"><header><div><h2 id="flowEvaluationTitle">评测管理</h2><p></p></div><button type="button" data-evaluation-close aria-label="关闭评测管理">×</button></header><main><div class="flow-evaluation-empty"><span aria-hidden="true">▤</span><b>工作流评测</b><p>评测任务管理功能待设计</p></div></main><footer><button type="button" data-evaluation-close>关闭</button></footer></section>';
    mask.querySelector('header p').textContent = name;
    mask.dataset.flowId = card ? card.dataset.flowOpen : params.get('flow') || 'default';
    mask.querySelectorAll('[data-evaluation-close]').forEach(function (item) { item.addEventListener('click', close); });
    mask.addEventListener('click', function (e) { if (e.target === mask) close(); });
    mask.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); close(); }
      if (e.key === 'Tab') {
        var items = mask.querySelectorAll('button'), first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    document.body.appendChild(mask);
    mask.querySelector('button').focus();
  }, true);
})();
