(function () {
  "use strict";
  /* 「我的」页 · 平台地图：横向六步流程，每步下是可直达的功能入口。
     步骤与侧栏分类对应；本体三层（语义 / 逻辑 / 行动）口径取自《Ontology 本体培训》。 */
  var KB = "knowledge-base-management.html?module=";
  var STEPS = [
    {
      title: "准备工作",
      desc: "选定范围，备好资料",
      ask: "先确定在哪个范围内工作，并备好资料",
      cards: [
        { name: "资源管理", text: "上传文档、接入数据源，统一管理空间资产", href: "portal-resources.html" },
        { name: "项目管理", text: "查看、创建项目，作为本体与知识的工作范围", href: "portal-projects.html" },
        { name: "标签体系", text: "维护企业统一标签，用于资源与本体的分类筛选", href: "portal-tags.html" },
      ],
    },
    {
      title: "业务知识",
      desc: "把资料变成可用知识",
      ask: "数据从哪里来，知识怎么沉淀",
      project: true,
      cards: [
        { name: "知识库", text: "创建文档知识库，解析、分片并检索", href: KB + "knowledge" },
        { name: "数据集", text: "管理数据表、特征集与业务数据视图", href: KB + "dataset" },
        { name: "本体数据加工", text: "多源知识抽取、数据处理流程与调度", href: "jinglun.html?view=project-overview" },
      ],
    },
    {
      title: "本体建模",
      layer: "语义层",
      desc: "沉淀业务事实",
      ask: "发生了什么，何时何地，处于什么状态",
      project: true,
      cards: [
        { name: "自动建模", text: "上传资料，由 AI 对话引导生成业务对象、关联与规则", href: KB + "aigo" },
        { name: "知识抽取", text: "从非结构化资料中抽取业务知识，形成可复用的本体要素", href: KB + "kextract" },
        { name: "业务本体", text: "图谱、业务对象、业务关系、业务事件统一管理", href: KB + "graph" },
      ],
    },
    {
      title: "业务逻辑",
      layer: "逻辑层",
      desc: "固化规律与规则",
      ask: "遵循什么规则，为什么如此",
      project: true,
      cards: [
        { name: "业务流程", text: "编排业务过程、环节与流转", href: KB + "flow" },
        { name: "业务规则", text: "配置判断规则、条件与校验逻辑", href: KB + "rule" },
      ],
    },
    {
      title: "业务行为",
      layer: "行动层",
      desc: "让 AI 可控执行",
      ask: "如何触发，如何执行",
      project: true,
      cards: [
        { name: "业务行动", text: "设计可执行的 Action，需要时进入审批链", href: KB + "action" },
        { name: "平台工具", text: "接入工具、MCP 与模型能力", href: KB + "tool" },
        { name: "MCP", text: "将本体能力发布为 MCP 服务，供智能体与外部应用调用", href: KB + "mcp" },
        { name: "Skill", text: "管理可由智能体调用的专业任务技能与执行说明", href: KB + "skill" },
      ],
    },
    {
      title: "应用与运营",
      desc: "使用成果，看运营效果",
      ask: "成果怎么使用，效果怎么样",
      cards: [
        { name: "实体看板", text: "检索业务实体，或直接运行已授权的 Action", href: "entity-dashboard.html", project: true },
        { name: "知识推演", text: "图谱探索与关系分析", href: "graph-analysis.html", project: true },
        { name: "运营", text: "查看知识使用、检索与反馈的运营指标", href: "operations-dashboard.html" },
      ],
    },
  ];

  var current = 0;
  var FOLD_KEY = "knora:platform-map-folded";
  function isFolded() {
    try {
      return localStorage.getItem(FOLD_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

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

  function stepperHtml() {
    return (
      '<div class="pm-note"><b>推荐了解顺序</b><span>6 个模块按「由数据到应用」排列，只表示逻辑先后，彼此没有前置依赖，可直接进入任意一个。</span></div>' +
      '<div class="pm-stepper" role="tablist">' +
      STEPS.map(function (s, i) {
        var cls = i === current ? " active" : "";
        return (
          '<button type="button" role="tab" class="pm-step' +
          cls +
          '" data-pm-step="' +
          i +
          '" aria-selected="' +
          (i === current ? "true" : "false") +
          '"><span class="pm-dot"><i>' +
          (i + 1) +
          "</i></span>" +
          '<span class="pm-step-text"><b>' +
          s.title +
          "</b><small>" +
          s.desc +
          "</small>" +
          (s.layer ? "<em>" + s.layer + "</em>" : "") +
          "</span></button>"
        );
      }).join("") +
      "</div>"
    );
  }

  function barHtml(folded) {
    return (
      '<div class="pm-bar"><div class="pm-bar-title"><b>平台地图</b><span>' +
      (folded ? "按「由数据到应用」的顺序，找到要做的事" : "") +
      '</span></div><button type="button" class="pm-fold" data-pm-fold aria-expanded="' +
      (folded ? "false" : "true") +
      '"><span>' +
      (folded ? "展开" : "收起") +
      '</span><i></i></button></div>'
    );
  }

  function body() {
    var s = STEPS[current];
    return (
      barHtml(false) +
      '<div class="pm-content">' +
      stepperHtml() +
      '<div class="pm-body"><div class="pm-head"><div class="pm-head-main"><b>' +
      (current + 1) +
      " · " +
      s.title +
      "</b>" +
      (s.layer ? '<em class="pm-layer">' + s.layer + "</em>" : "") +
      '</div><span class="pm-ask">' +
      s.ask +
      "</span>" +
      (s.project ? '<i class="pm-proj">进入后顶部可切换项目</i>' : "") +
      '</div><div class="pm-grid">' +
      s.cards
        .map(function (c) {
          return cardHtml(c, s.project);
        })
        .join("") +
      "</div></div></div>"
    );
  }

  function render(pane) {
    var folded = isFolded();
    pane.classList.toggle("folded", folded);
    pane.innerHTML = folded ? barHtml(true) : body();
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
      if (e.target.closest("[data-pm-fold]") || (isFolded() && e.target.closest(".pm-bar"))) {
        try {
          localStorage.setItem(FOLD_KEY, isFolded() ? "0" : "1");
        } catch (err) {}
        render(pane);
        return;
      }
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
