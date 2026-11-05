(function (global) {
  'use strict';
  var groups = [
    { entry: true, title: '项目构建入口', items: [
      { key: 'aigo', icon: 'AI', label: '本体自动构建', detail: '对话引导 · 默认入口', badge: '默认', extra: 'ontology-module-aigo' },
      { key: 'template', icon: '模', label: '行业本体模板', detail: '浏览与应用行业模型', extra: 'ontology-module-template' }
    ] },
    { title: '语义图谱', items: [
      { key: 'graph', icon: '图', label: '语义图谱' }, { key: 'entity', icon: '01', label: '业务对象' },
      { key: 'relation', icon: '02', label: '业务关联' }, { key: 'event', icon: '03', label: '事实明细' }
    ] },
    { title: '业务知识', items: [
      { key: 'knowledge', icon: '04', label: '知识库' }, { key: 'faq', icon: '问', label: 'FAQ 管理' }, { key: 'dataset', icon: '05', label: '数据集' }
    ] },
    { title: '业务行为与逻辑', items: [
      { key: 'action', icon: '06', label: '业务操作与行为' }, { key: 'rule', icon: '07', label: '业务规则' },
      { key: 'flow', icon: '08', label: '业务流程' }, { key: 'tool', icon: '09', label: '工具与模型' }
    ] },
    { title: '智能应用', items: [
      { key: 'skill', icon: '10', label: '技能' }, { key: 'reasoning', icon: '11', label: '智能体' },
      { key: 'ui', icon: '12', label: '用户界面' }
    ] }
  ];
  function itemMarkup(item, active) {
    var current = item.key === active;
    var label = item.detail ? '<span><b>' + item.label + '</b><small>' + item.detail + '</small></span>' : '<span>' + item.label + '</span>';
    return '<button class="ontology-module ' + (item.extra || '') + (current ? ' active' : '') + '" data-module="' + item.key + '"' + (current ? ' aria-current="page"' : '') + '><i>' + item.icon + '</i>' + label + (item.badge ? '<em>' + item.badge + '</em>' : '') + '</button>';
  }
  function render(host, active) {
    if (!host) return;
    host.innerHTML = groups.map(function (group) {
      return '<div class="' + (group.entry ? 'ontology-menu-entry' : 'ontology-menu-group') + '"><span class="ontology-menu-group-title">' + group.title + '</span>' + group.items.map(function (item) { return itemMarkup(item, active); }).join('') + '</div>';
    }).join('');
  }
  global.KnoraOntologySidebar = { render: render };
})(window);
