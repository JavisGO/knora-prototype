(function () {
  "use strict";
  /* 「我的」页 · 平台地图：按做事顺序列出六步，每步下是可直达的功能入口。 */
  var KB = "knowledge-base-management.html?module=";
  var STEPS = [
    {
      title: "准备工作",
      desc: "选定范围，备好资料",
      cards: [
        { name: "项目管理", text: "查看、创建项目，作为本体与知识的工作范围", href: "portal-projects.html" },
        { name: "资源管理", text: "上传文档、接入数据源，统一管理空间资产", href: "portal-resources.html" },
        { name: "标签体系", text: "维护企业统一标签，用于资源与本体的分类筛选", href: "portal-tags.html" },
      ],
    },
    {
      title: "数据与知识",
      desc: "把资料变成可用知识",
      project: true,
      cards: [
        { name: "数据集", text: "管理数据表、特征集与业务数据视图", href: KB + "dataset" },
        { name: "知识库", text: "创建文档知识库，解析、分片并检索", href: KB + "knowledge" },
      ],
    },
    {
      title: "本体构建",
      desc: "让 AI 引导建模",
      project: true,
      cards: [
        { name: "本体自动构建", text: "上传资料，由 AI 对话引导生成业务对象、关联与规则", href: KB + "aigo", tag: "AI" },
      ],
    },
    {
      title: "本体建模",
      desc: "沉淀业务对象与关系",
      project: true,
      cards: [
        { name: "语义图谱", text: "以图的方式查看项目内业务对象与业务关联", href: KB + "graph" },
        { name: "业务对象", text: "定义核心业务概念、属性及数据映射", href: KB + "entity" },
        { name: "业务关联", text: "定义业务对象之间可复用的语义关系与约束", href: KB + "relation" },
        { name: "事实明细", text: "管理已发生的事件、状态变化与事实记录", href: KB + "event" },
      ],
    },
    {
      title: "逻辑与行动",
      desc: "固化规则与动作",
      project: true,
      cards: [
        { name: "业务流程", text: "编排业务过程与环节", href: KB + "flow" },
        { name: "业务规则", text: "配置判断规则与校验逻辑", href: KB + "rule" },
        { name: "业务操作与行为", text: "设计可执行的 Action，需要时进入审批链", href: KB + "action" },
        { name: "工具与模型", text: "接入工具、MCP 与模型能力", href: KB + "tool" },
      ],
    },
    {
      title: "查看与运营",
      desc: "使用成果，看运营效果",
      cards: [
        { name: "实体看板", text: "检索业务实体，或直接运行已授权的 Action", href: "entity-dashboard.html", project: true },
        { name: "图析", text: "图谱探索与关系分析", href: "graph-analysis.html", project: true },
        { name: "运营看板", text: "查看知识使用、检索与反馈的运营指标", href: "operations-dashboard.html" },
      ],
    },
  ];

  var current = 0;

  function cardHtml(c, stepProject) {
    var inProject = stepProject || c.project;
    return (
      '<article class="pm-card"><div class="pm-card-main"><b>' +
      c.name +
      (c.tag ? "<em>" + c.tag + "</em>" : "") +
      (inProject ? '<i class="pm-proj">项目内</i>' : "") +
      "</b><p>" +
      c.text +
      '</p></div><a class="pm-go" href="' +
      c.href +
      '">立即前往</a></article>'
    );
  }

  function body() {
    var q = "";
    var steps = STEPS.map(function (s, i) {
      var n = s.cards.filter(function (c) {
        return !q || (c.name + c.text).toLowerCase().indexOf(q) > -1;
      }).length;
      return (
        '<button type="button" class="pm-step' +
        (i === current ? " active" : "") +
        '" data-pm-step="' +
        i +
        '"><i>' +
        (i + 1) +
        "</i><span><b>" +
        s.title +
        "</b><small>" +
        s.desc +
        "</small></span>" +
        (q ? "<em>" + n + "</em>" : "") +
        "</button>"
      );
    }).join("");
    var list = q
      ? STEPS.reduce(function (all, s) {
          return all.concat(
            s.cards
              .filter(function (c) {
                return (c.name + c.text).toLowerCase().indexOf(q) > -1;
              })
              .map(function (c) {
                return cardHtml(c, s.project);
              }),
          );
        }, [])
      : STEPS[current].cards.map(function (c) {
          return cardHtml(c, STEPS[current].project);
        });
    var head = q
      ? '<div class="pm-head"><b>搜索结果</b><span>共 ' + list.length + " 项</span></div>"
      : '<div class="pm-head"><b>' +
        (current + 1) +
        " · " +
        STEPS[current].title +
        "</b><span>" +
        STEPS[current].desc +
        "</span>" +
        (STEPS[current].project ? '<i class="pm-proj">进入后顶部可切换项目</i>' : "") +
        "</div>";
    return (
      '<div class="pm-steps">' +
      steps +
      '</div><div class="pm-panel">' +
      head +
      (list.length ? '<div class="pm-grid">' + list.join("") + "</div>" : '<div class="pm-empty">没有匹配的功能入口</div>') +
      "</div>"
    );
  }

  function render(pane) {
    pane.innerHTML = body();
  }

  function mount() {
    var tabs = document.getElementById("mineTabs");
    var wb = document.getElementById("mineWorkbenchV15");
    if (!tabs || !wb || document.querySelector(".pm-pane")) return;
    var head = document.querySelector("#content .page-head");
    if (head) {
      var h = new Date().getHours();
      var hello = h < 6 ? "夜深了" : h < 12 ? "早上好" : h < 14 ? "中午好" : h < 18 ? "下午好" : "晚上好";
      head.querySelector("h1").textContent = "你好，陈宇";
      head.querySelector("p").textContent = hello + "，从平台地图找到要做的事，也可以在下方处理审批、收藏与最近访问。";
    }
    var pane = document.createElement("section");
    pane.className = "pm-pane";
    wb.parentNode.insertBefore(pane, wb);
    render(pane);
    pane.addEventListener("click", function (e) {
      var s = e.target.closest("[data-pm-step]");
      if (!s) return;
      current = Number(s.dataset.pmStep);
      render(pane);
    });
    /* 「本体发布与编辑审批」入口由另一模块插到内容区顶部，这里把它归位到标签栏右端 */
    function dockEntry() {
      var btn = document.querySelector("[data-op-open-requests]");
      if (btn && btn.parentNode !== tabs) {
        btn.classList.add("pm-tabs-entry");
        tabs.appendChild(btn);
      }
    }
    dockEntry();
    new MutationObserver(dockEntry).observe(document.getElementById("content") || document.body, { childList: true });
  }

  var tries = 0;
  (function wait() {
    if (document.getElementById("mineTabs")) return mount();
    if (tries++ < 40) setTimeout(wait, 100);
  })();
})();
