(function () {
  "use strict";
  var body = document.body,
    app = body.dataset.app || "portal",
    page = body.dataset.page || "home";
  var routes = {
    portal: {
      name: "知识门户",
      kicker: "KNORA KNOWLEDGE",
      title: "知识门户",
      pages: [
        ["home", "首页 · 综合", "统一检索与问答", "portal-home.html", "⌂"],
        ["mine", "我的", "个人知识工作台", "portal-mine.html", "人"],
        ["resources", "资源", "空间与资产治理", "portal-resources.html", "资"],
        ["projects", "项目", "项目目录与管理", "portal-projects.html", "项"],
        ["tags", "标签", "标签体系管理", "portal-tags.html", "#"],
      ],
    },
    ontology: {
      name: "本体管理",
      kicker: "KNORA ONTOLOGY",
      title: "本体平台",
      pages: [],
    },
    jinglun: {
      name: "经纶",
      kicker: "KNORA JINGLUN",
      title: "经纶",
      pages: [],
    },
    graph: {
      name: "图析",
      kicker: "KNORA GRAPH",
      title: "图析",
      pages: [
        ["overview", "模块概览", "能力规划占位", "graph-analysis.html", "析"],
      ],
    },
    entity: {
      name: "实体看板",
      kicker: "KNORA ENTITY",
      title: "实体看板",
      pages: [
        ["overview", "模块概览", "能力规划占位", "entity-dashboard.html", "实"],
      ],
    },
    operations: {
      name: "运营看板",
      kicker: "KNORA OPERATIONS",
      title: "运营看板",
      pages: [
        [
          "overview",
          "模块概览",
          "能力规划占位",
          "operations-dashboard.html",
          "运",
        ],
      ],
    },
  };
  var tenantCatalog = {
    saidoo: { id: "saidoo", name: "赛豆企业", root: "赛豆企业", mark: "赛" },
    sailisi: {
      id: "sailisi",
      name: "赛力斯集团",
      root: "赛力斯集团",
      mark: "力",
    },
  };
  function currentTenant() {
    var id = "saidoo";
    try {
      id = localStorage.getItem("knora:tenant") || id;
    } catch (e) {}
    return tenantCatalog[id] || tenantCatalog.saidoo;
  }
  function tenantChoiceHtml() {
    var active = currentTenant();
    return (
      '<div class="profile-tenant-block"><div class="profile-tenant-title"><span>当前租户</span><small>独立切换空间与资源范围</small></div><div class="profile-tenant-options">' +
      Object.keys(tenantCatalog)
        .map(function (id) {
          var item = tenantCatalog[id];
          return (
            '<button class="profile-tenant-choice ' +
            (id === active.id ? "active" : "") +
            '" data-tenant-choice="' +
            id +
            '"><i>' +
            item.mark +
            "</i><span><b>" +
            item.name +
            "</b><small>根空间：" +
            item.root +
            "</small></span><em>" +
            (id === active.id ? "当前" : "切换") +
            "</em></button>"
          );
        })
        .join("") +
      "</div></div>"
    );
  }
  function profileCommonHtml() {
    return (
      '<div class="profile-common-block"><div class="profile-section-title"><span>通用配置</span><small>账号与平台偏好</small></div>' +
      '<button type="button" data-toast="个人资料设置为功能示意"><span class="profile-menu-icon">人</span><span><b>个人资料</b><small>头像、姓名与联系方式</small></span><em>›</em></button>' +
      '<button type="button" data-toast="账号安全设置为功能示意"><span class="profile-menu-icon">安</span><span><b>账号与安全</b><small>密码、登录与安全验证</small></span><em>›</em></button>' +
      '<button type="button" data-toast="消息通知设置为功能示意"><span class="profile-menu-icon">知</span><span><b>消息通知</b><small>站内消息与审批提醒</small></span><em>›</em></button>' +
      '<a class="profile-menu-link profile-about-link" href="feature-iteration-list.html"><span class="profile-menu-icon">关</span><span><b>关于（迭代计划）</b><small>查看版本功能与迭代入口</small></span><em>›</em></a>' +
      "</div>"
    );
  }
  function applyTenantContext() {
    var tenant = currentTenant(),
      other =
        tenant.id === "saidoo" ? tenantCatalog.sailisi : tenantCatalog.saidoo,
      context = document.querySelector("#spaceContext span"),
      profile = document.querySelector("#profileTrigger small");
    if (context) context.textContent = tenant.root;
    if (profile) profile.textContent = "平台管理员 · " + tenant.name + "租户";
    document.querySelectorAll("[data-tenant-choice]").forEach(function (btn) {
      var active = btn.dataset.tenantChoice === tenant.id;
      btn.classList.toggle("active", active);
      var state = btn.querySelector("em");
      if (state) state.textContent = active ? "当前" : "切换";
    });
    var rootRows = document.querySelectorAll(
      "#spaceTree>.org-tree-node>.org-space-row:first-child,#projectSpaceTree>.pv2-tree-row:first-child,#projectSpaceTree>.project-space-node>.project-space-row:first-child",
    );
    rootRows.forEach(function (row) {
      var name = row.querySelector(".org-name,.pv2-tree-name,b");
      if (
        name &&
        (name.textContent.trim() === other.root ||
          name.textContent.trim() === tenant.root ||
          name.textContent.trim() === "赛力斯集团" ||
          name.textContent.trim() === "赛豆企业空间")
      )
        name.textContent = tenant.root;
      ["data-space", "data-path"].forEach(function (attr) {
        if (row.hasAttribute(attr)) row.setAttribute(attr, tenant.root);
      });
    });
    ["projectSpaceTitle", "spaceName"].forEach(function (id) {
      var el = document.getElementById(id);
      if (
        el &&
        (el.textContent.trim() === other.root ||
          el.textContent.trim() === tenant.root)
      )
        el.textContent = tenant.root;
    });
    document.querySelectorAll("[data-tenant-root]").forEach(function (el) {
      el.textContent = tenant.root;
    });
    window.dispatchEvent(
      new CustomEvent("knora:tenantchange", { detail: tenant }),
    );
  }
  var apps = [
    ["portal", "首页工作台", "⌂", "portal-home.html", "knowledge"],
    ["entity", "实体看板", "◉", "entity-dashboard.html", "knowledge"],
    ["graph", "图析", "⌘", "graph-analysis.html", "knowledge"],
    ["operations", "运营看板", "▥", "operations-dashboard.html", "knowledge"],
    ["ontology", "本体管理", "◇", "knowledge-base-management.html?module=aigo", "ontology"],
    ["jinglun", "经纶", "经", "jinglun.html?view=project-overview", "ontology"],
  ];
  var sharedProjects = {
    personal: {
      name: "陈宇的个人项目",
      path: "个人空间",
      kind: "个人默认项目",
      role: "项目管理员",
    },
    insight: {
      name: "客户洞察项目",
      path: "赛豆企业空间 / 市场营销域 / 客户运营部",
      kind: "公共项目",
      role: "普通成员",
    },
    experience: {
      name: "客户体验提升项目",
      path: "赛豆企业空间 / 市场营销域 / 客户运营部",
      kind: "公共项目",
      role: "项目管理员",
    },
    channel: {
      name: "渠道协同项目",
      path: "赛豆企业空间 / 市场营销域 / 华东渠道组",
      kind: "公共项目",
      role: "普通成员",
    },
    ai: {
      name: "智能营销试点项目",
      path: "赛豆企业空间 / 创新业务空间",
      kind: "公共项目",
      role: "项目管理员",
    },
  };
  function lastProjectKey() {
    var key = new URLSearchParams(location.search).get("project");
    if (!key)
      try {
        key = localStorage.getItem("knora:lastProject") || "personal";
      } catch (e) {
        key = "personal";
      }
    return sharedProjects[key] ? key : "personal";
  }
  function jinglunView() {
    var view =
      new URLSearchParams(location.search).get("view") || "project-overview";
    return view === "projects" || view === "overview"
      ? "project-overview"
      : view;
  }
  function jinglunInProject() {
    return app === "jinglun";
  }
  var icons =
    '<svg width="0" height="0" style="position:absolute"><symbol id="i-grid" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></symbol><symbol id="i-bell" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></symbol><symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></symbol><symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol><symbol id="i-settings" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.5 1A7 7 0 0 0 15 6l-.4-2.7h-4L10 6a7 7 0 0 0-1.5 1L6 6l-2 3.4L6.1 11a7 7 0 0 0 0 2L4 14.5 6 18l2.5-1a7 7 0 0 0 1.5 1l.5 2.7h4L15 18a7 7 0 0 0 1.5-1l2.5 1 2-3.4-2.1-1.5a7 7 0 0 0 .1-1z"/></symbol><symbol id="i-chevron" viewBox="0 0 24 24"><path d="m8 10 4 4 4-4"/></symbol><symbol id="i-filter" viewBox="0 0 24 24"><path d="M4 6h16l-6.5 7v5l-3 1v-6z"/></symbol><symbol id="i-folder" viewBox="0 0 24 24"><path d="M3 6h7l2 2h9v11H3z"/></symbol><symbol id="i-doc" viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6zM14 3v5h5M9 12h6M9 16h6"/></symbol></svg>';
  function icon(id) {
    return '<svg class="ico"><use href="#i-' + id + '"/></svg>';
  }
  function status(type, text) {
    return type === "current" || type === "iterating"
      ? '<span class="status-pill ' + type + '">' + text + "</span>"
      : "";
  }
  function blueprintNote() {
    return "";
  }
  function appGrid() {
    return [
      ["knowledge", "知识门户"],
      ["ontology", "本体平台"],
    ]
      .map(function (group) {
        return (
          '<section class="app-group"><div class="app-group-title"><b>' +
          group[1] +
          "</b><span>" +
          (group[0] === "knowledge"
            ? "面向知识使用与洞察"
            : "面向本体建设与业务运行") +
          '</span></div><div class="app-group-grid">' +
          apps
            .filter(function (x) {
              return x[4] === group[0];
            })
            .map(function (x) {
              return (
                '<a class="app-item ' +
                (x[0] === app ? "active" : "") +
                '" data-app="' +
                x[0] +
                '" href="' +
                x[3] +
                '"><span class="app-icon">' +
                x[2] +
                "</span><span>" +
                x[1] +
                "</span></a>"
              );
            })
            .join("") +
          "</div></section>"
        );
      })
      .join("");
  }
  function jinglunProjectSwitchHtml() {
    var active = lastProjectKey(),
      p = sharedProjects[active];
    return (
      '<div class="global-project-switch"><button class="global-project-trigger" id="globalProjectTrigger"><span class="global-project-icon">项</span><span><b id="globalProjectName">' +
      p.name +
      '</b><small id="globalProjectPath">' +
      p.path +
      '</small></span><i id="globalProjectKind">' +
      p.kind +
      "</i>" +
      icon("chevron") +
      '</button><div class="global-project-pop" id="globalProjectPop"><div class="global-project-head"><b>切换项目</b><span>经纶与本体管理共享最近项目</span></div><div class="searchbox">' +
      icon("search") +
      '<input id="globalProjectSearch" placeholder="检索项目名称或空间路径"></div><div class="global-project-list" id="globalProjectList">' +
      Object.keys(sharedProjects)
        .map(function (key) {
          var x = sharedProjects[key];
          return (
            '<button class="global-project-row ' +
            (key === active ? "active" : "") +
            '" data-project-key="' +
            key +
            '"><span class="global-project-icon">项</span><span><b>' +
            x.name +
            "</b><small>" +
            x.path +
            "</small></span><i>" +
            x.role +
            "</i></button>"
          );
        })
        .join("") +
      "</div></div></div>"
    );
  }
  function jinglunSidebar() {
    var view = jinglunView(),
      projectKey = lastProjectKey(),
      projectViews = [
        ["project-overview", "项目概览", "当前项目运行统计", "览"],
        ["project-flows", "流程管理", "Pipeline 设计与发布", "流"],
        ["project-schedules", "调度管理", "定时与事件调度", "调"],
        ["project-tasks", "任务管理", "运行实例与执行日志", "任"],
        ["project-extraction", "非结构化处理", "多源知识抽取与融合流程", "抽"],
      ],
      knowledgeViews = [
        ["operators", "算子管理", "当前项目可用的数据处理算子", "算"],
        ["rules", "规则管理", "当前项目的抽取与校验规则", "规"],
        ["templates", "流程模板", "当前项目可用的流程模板", "模"],
      ];
    function links(items, scoped) {
      return items
        .map(function (x) {
          return (
            '<a class="nav-link ' +
            (x[0] === view ? "active" : "") +
            '" href="jinglun.html?view=' +
            x[0] +
            (scoped ? "&project=" + projectKey : "") +
            '"><span class="nav-icon">' +
            x[3] +
            "</span><span><b>" +
            x[1] +
            "</b><small>" +
            x[2] +
            "</small></span></a>"
          );
        })
        .join("");
    }
    return (
      '<aside class="sidebar jinglun-sidebar project-mode"><div class="side-kicker">KNORA JINGLUN</div><h2 class="side-title">经纶</h2><div class="side-group">当前项目</div><div class="jinglun-current-project"><i>项</i><span><b id="jinglunSideProjectName">' +
      sharedProjects[projectKey].name +
      "</b><small>与本体管理共享项目范围</small></span></div>" +
      links(projectViews, true) +
      '<div class="side-group">知识管理</div>' +
      links(knowledgeViews, true) +
      "</aside>"
    );
  }
  function sidebar() {
    if (app === "jinglun") return jinglunSidebar();
    var r = routes[app] || routes.portal;
    return (
      '<aside class="sidebar"><div class="side-kicker">' +
      r.kicker +
      '</div><h2 class="side-title">' +
      r.title +
      '</h2><div class="side-group">一级页面</div>' +
      r.pages
        .map(function (x) {
          return (
            '<a class="nav-link ' +
            (x[0] === page ? "active" : "") +
            '" href="' +
            x[3] +
            '"><span class="nav-icon">' +
            x[4] +
            "</span><span><b>" +
            x[1] +
            "</b><small>" +
            x[2] +
            "</small></span></a>"
          );
        })
        .join("") +
      "</aside>"
    );
  }
  function renderShell() {
    var r = routes[app] || routes.portal,
      tenant = currentTenant(),
      context =
        app === "ontology" || jinglunInProject()
          ? jinglunProjectSwitchHtml()
          : app === "jinglun"
            ? ""
            : '<button class="context-pill" id="spaceContext"><span>' +
              tenant.root +
              "</span>" +
              icon("chevron") +
              "</button>";
    body.insertAdjacentHTML("afterbegin", icons);
    body.insertAdjacentHTML(
      "beforeend",
      '<div class="shell"><header class="topbar"><button class="app-trigger" id="appTrigger" aria-label="应用中心">' +
        icon("grid") +
        '</button><div class="brand"><span class="logo">K</span><strong>' +
        r.name +
        "</strong><small>产品蓝图</small></div>" +
        context +
        '<span class="top-spacer"></span><div class="approval-notification-wrap"><button class="top-btn" id="approvalNotificationTrigger" aria-label="审批通知" aria-expanded="false">' +
        icon("bell") +
        '<span class="badge">3</span></button><section class="approval-notification-pop" id="approvalNotificationPop"><header><span><b>审批通知</b><small>3 条待处理</small></span><a href="portal-mine.html?approvalDetail=approval-05">进入我的审批待办</a></header><a class="approval-notification-item unread" href="portal-mine.html?approvalDetail=approval-05"><i>表</i><span><b>客户经营数据资源申请</b><small>王晨 · 重点客户经营项目 · 待我审批</small></span><em>刚刚</em></a><a class="approval-notification-item unread" href="portal-mine.html?approvalDetail=approval-06"><i>文</i><span><b>月度经营分析文档申请</b><small>赵宁 · 区域经营复盘项目 · 待我审批</small></span><em>15:30</em></a><a class="approval-notification-item unread" href="portal-mine.html?approvalDetail=approval-data-allocation"><i>表</i><span><b>客户经营数据表共享审批</b><small>赵宁 · 采购组空间 · 待我审批</small></span><em>10:36</em></a></section></div><div class="profile-menu-wrap"><button class="profile profile-trigger" id="profileTrigger" aria-expanded="false"><span class="avatar">陈</span><span><b>陈宇</b><small>平台管理员 · ' +
        tenant.name +
        "租户</small></span>" +
        icon("chevron") +
        '</button><div class="profile-menu" id="profileMenu"><header><span class="avatar">陈</span><span><b>陈宇</b><small>chenyu@saidoo.com</small></span></header>' +
        profileCommonHtml() +
        tenantChoiceHtml() +
        '<button id="tenantSwitch" class="tenant-switch-legacy" hidden type="button"></button><div class="profile-menu-footer"><button data-toast="退出登录交互沿用统一认证中心"><span class="profile-menu-icon">退</span><span><b>退出登录</b><small>安全退出当前账号</small></span></button></div></div></div><div class="app-pop" id="appPop"><div class="app-pop-head"><b>Knora 应用中心</b><span>六个应用 · 两个平台</span></div><div class="app-grid">' +
        appGrid() +
        '</div></div></header><div class="workspace">' +
        sidebar() +
        '<main class="content" id="content"></main></div></div><div class="toast" id="toast"></div><div class="modal-mask" id="modalMask"><div class="modal" id="modal"><div class="modal-head"><div><h2 id="modalTitle"></h2><p id="modalDesc"></p></div><button class="modal-close" data-close-modal>×</button></div><div class="modal-body" id="modalBody"></div><div class="modal-foot" id="modalFoot"><button class="btn" data-close-modal>取消</button><button class="btn primary" id="modalConfirm">确认</button></div></div></div>',
    );
  }
  var toastTimer;
  function toast(text) {
    var el = document.getElementById("toast");
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove("show");
    }, 2300);
  }
  function openModal(title, desc, html, confirmText, onConfirm, wide) {
    var modal = document.getElementById("modal");
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalDesc").textContent = desc || "";
    document.getElementById("modalBody").innerHTML = html;
    document.getElementById("modalConfirm").textContent = confirmText || "确认";
    modal.classList.remove("space-governance-modal", "datasource-v2-modal");
    modal.classList.toggle("wide", !!wide);
    document.getElementById("modalMask").classList.add("open");
    document.getElementById("modalConfirm").onclick = function () {
      if (onConfirm) onConfirm();
      closeModal();
    };
  }
  function closeModal() {
    document.getElementById("modalMask").classList.remove("open");
  }
  function pageHead(title, desc, actions) {
    return (
      '<div class="page-head"><div><h1>' +
      title +
      "</h1><p>" +
      desc +
      '</p></div><div class="head-actions">' +
      (actions || "") +
      "</div></div>"
    );
  }
  function currentPage() {
    if (app === "portal" && page === "home") return homePage();
    if (app === "portal" && page === "mine") return minePage();
    if (app === "portal" && page === "document-detail")
      return documentDetailPage();
    if (app === "portal" && page === "resources") return resourcesPage();
    if (app === "portal" && page === "projects") return projectsPage();
    if (app === "portal" && page === "tags") return tagsPage();
    if (app === "portal" && page === "shortcuts") return shortcutsPage();
    if (app === "ontology" && page === "overview") return ontologyOverviewV3();
    if (app === "ontology" && page === "projects") return ontologyProjects();
    if (app === "jinglun") return jinglunPage();
    if (app === "entity") {
      var entityView = new URLSearchParams(location.search).get("view");
      return entityView === "search"
        ? entityDashboardPage()
        : entityDashboardV2Page();
    }
    if (app === "graph") return graphAnalysisPage();
    if (app === "operations") return operationsDashboardPage();
    return placeholderPage();
  }
  function homeDocResults() {
    return '<div class="home-result-list"><article class="home-doc-result"><span class="home-file-icon word">W</span><div><h3>客户风险分级与处置管理办法.docx</h3><p>依据客户经营状况、回款表现和服务记录进行<span class="home-match">客户风险</span>等级划分，并明确高风险客户的业务限制与升级处置要求。</p><footer><span>更新时间：2026-09-18 16:50</span><span>上传人：risk_admin</span><span>市场营销域 / 客户洞察项目</span></footer></div></article><article class="home-doc-result"><span class="home-file-icon pdf">P</span><div><h3>2026 年重点客户经营分析报告.pdf</h3><p>聚焦重点客户价值贡献、订单变化及<span class="home-match">风险暴露</span>，提出区域差异化经营与客户关系维护建议。</p><footer><span>更新时间：2026-09-16 09:26</span><span>上传人：张敏</span><span>市场营销域 / 精准营销项目</span></footer></div></article><article class="home-doc-result"><span class="home-file-icon sheet">X</span><div><h3>客户信用与应收风险台账.xlsx</h3><p>覆盖重点客户授信额度、应收余额、账龄结构与逾期情况，支持按区域、行业和风险等级筛选。</p><footer><span>更新时间：2026-09-12 14:12</span><span>上传人：finance_ops</span><span>财务与风控域</span></footer></div></article></div>';
  }
  function homeImageResults() {
    return (
      '<div class="home-image-results">' +
      [
        ["图", "客户风险传导关系图.png", "客户洞察项目 · 2026-09-17"],
        ["看", "区域客户风险分布.png", "经营分析报告附件 · 2026-09-16"],
        ["数", "客户风险指标口径.png", "风险管理部 · 2026-09-12"],
        ["流", "高风险客户处置流程.png", "制度知识库 · 2026-09-08"],
      ]
        .map(function (x, i) {
          return (
            '<article><div class="home-image-thumb c' +
            i +
            '"><span>' +
            x[0] +
            "</span></div><div><b>" +
            x[1] +
            "</b><small>" +
            x[2] +
            "</small></div></article>"
          );
        })
        .join("") +
      "</div>"
    );
  }
  function homeTypeResults() {
    return (
      '<div class="home-result-list">' +
      [
        [
          "客户风险",
          "customer_risk",
          "描述客户当前信用、履约与经营风险状态",
          "1,286",
        ],
        ["客户", "customer", "企业客户主数据、统一标识与关系属性", "38,420"],
        [
          "风险事件",
          "risk_event",
          "客户相关风险信号、触发原因与处置事件",
          "8,651",
        ],
      ]
        .map(function (x, i) {
          return (
            '<article class="home-type-result"><i class="c' +
            i +
            '">类</i><div><b>' +
            x[0] +
            "</b><code>" +
            x[1] +
            "</code><p>" +
            x[2] +
            "</p></div><aside><span>实体类型</span><strong>" +
            x[3] +
            " 条数据</strong></aside></article>"
          );
        })
        .join("") +
      "</div>"
    );
  }
  function homeEntityResults() {
    return (
      '<div class="home-entity-layout"><aside><button class="active">全部数据 <span>162</span></button><button>客户风险 <span>111</span></button><button>风险事件 <span>32</span></button><button>客户 <span>19</span></button></aside><div class="home-result-list"><article class="home-entity-card"><h3>CR_20260918_00028 · 华东客户经营风险</h3><div>' +
      [
        ["风险等级", "高"],
        ["客户名称", "上海宏远实业"],
        ["责任人", "陈宇"],
        ["当前状态", "待确认"],
        ["风险来源", "模型自动识别"],
        ["逾期金额", "¥ 2,860,000"],
        ["最近更新", "2026-09-18 09:18"],
        ["所属区域", "华东区域"],
      ]
        .map(function (x) {
          return "<span><small>" + x[0] + "</small><b>" + x[1] + "</b></span>";
        })
        .join("") +
      '</div></article><article class="home-entity-card"><h3>CR_20260917_00017 · 客户履约风险</h3><div>' +
      [
        ["风险等级", "中"],
        ["客户名称", "苏州启明科技"],
        ["责任人", "王晨"],
        ["当前状态", "处理中"],
        ["风险来源", "订单波动监测"],
        ["逾期金额", "¥ 860,000"],
        ["最近更新", "2026-09-17 16:42"],
        ["所属区域", "华东区域"],
      ]
        .map(function (x) {
          return "<span><small>" + x[0] + "</small><b>" + x[1] + "</b></span>";
        })
        .join("") +
      "</div></article></div></div>"
    );
  }
  function homeActionResults() {
    return (
      '<div class="home-result-list">' +
      [
        [
          "生成客户风险处置任务",
          "createCustomerRiskTask",
          "基于风险实体生成跟进任务，写入责任人、优先级、截止时间和处置建议。",
          "客户风险事件",
          "任务编号、执行状态",
        ],
        [
          "更新客户风险等级",
          "updateCustomerRiskLevel",
          "根据最新经营信号更新客户风险等级，并记录变更原因和审计信息。",
          "客户、风险等级",
          "更新结果、变更记录",
        ],
        [
          "通知客户负责人",
          "notifyCustomerOwner",
          "通过企业消息渠道通知客户负责人，并附带风险摘要与建议动作。",
          "客户、负责人、消息模板",
          "通知状态",
        ],
      ]
        .map(function (x, i) {
          return (
            '<article class="home-action-result"><i>A' +
            (i + 1) +
            "</i><div><div><b>" +
            x[0] +
            "</b><code>" +
            x[1] +
            "</code></div><p>" +
            x[2] +
            "</p><footer><span>输入：" +
            x[3] +
            "</span><span>输出：" +
            x[4] +
            '</span></footer></div><button class="btn" data-toast="Action 详情跳转将在后续原型中接入">查看定义</button></article>'
          );
        })
        .join("") +
      "</div>"
    );
  }
  function homeTableResults() {
    return (
      '<div class="home-table-results">' +
      [
        [
          "customer_risk_signal",
          "CRM_PROD · risk.customer_risk_signal",
          "客户风险信号宽表，汇聚交易、回款、投诉与模型评分。",
          "46 个字段",
          "2.4 亿行",
          "每小时",
        ],
        [
          "sales_order_detail",
          "ERP_DW · sales.sales_order_detail",
          "销售订单明细表，包含客户、产品、渠道、金额及履约状态。",
          "62 个字段",
          "8.6 亿行",
          "实时同步",
        ],
        [
          "customer_profile_wide",
          "CDP_PROD · customer.customer_profile_wide",
          "客户画像宽表，统一基础属性、标签、价值分层和活跃度。",
          "128 个字段",
          "3,842 万行",
          "每日",
        ],
      ]
        .map(function (x, i) {
          return (
            "<article><header><i>表</i><div><b>" +
            x[0] +
            "</b><code>" +
            x[1] +
            "</code></div><span>已接入</span></header><p>" +
            x[2] +
            '</p><div class="home-table-meta"><span><small>字段</small><b>' +
            x[3] +
            "</b></span><span><small>数据量</small><b>" +
            x[4] +
            "</b></span><span><small>更新频率</small><b>" +
            x[5] +
            "</b></span><span><small>数据负责人</small><b>" +
            ["数据分析组", "经营分析组", "客户数据组"][i] +
            '</b></span></div><footer><button class="btn" data-toast="打开数据表元数据详情（蓝图示意）">查看元数据</button><button class="btn" data-toast="正在预览表结构（蓝图示意）">预览表结构</button></footer></article>'
          );
        })
        .join("") +
      "</div>"
    );
  }
  function homePage() {
    var resultTabs = [
      ["docs", "文档", "24"],
      ["images", "图片", "12"],
      ["types", "实体类型", "3"],
      ["entities", "实体数据", "162"],
      ["actions", "Action", "8"],
      ["tables", "数据资源表", "15"],
    ];
    return (
      '<section class="portal-search-hero" id="homeSearchHero"><div class="portal-search-copy"><h1 id="homeSearchTitle">检索全域知识</h1><p id="homeSearchDesc">在赛豆企业空间中统一检索文档、图片、实体、本体 Action 与外部数据资源表</p></div><div class="portal-mode-switch" id="homeModeSwitch"><button class="active" data-search-mode="search">' +
      icon("search") +
      '知识检索</button><button data-search-mode="ask">✦ 智能问答</button></div><div class="portal-search-console"><div class="portal-search-line">' +
      icon("search") +
      '<input id="homeSearch" value="客户风险" placeholder="输入关键词，搜索全平台有权限的资源"><button id="homeSearchBtn">' +
      icon("search") +
      '<span>搜索</span></button></div><div class="portal-filter-line"><div class="portal-filter-wrap"><button class="portal-filter-trigger" id="homeScopeTrigger">' +
      icon("folder") +
      '<span>空间：</span><b id="homeScopeLabel">全部空间</b>⌄</button><div class="portal-scope-menu" id="homeScopeMenu"><div><b>空间目录</b><button class="active" data-home-scope="全部空间">赛豆企业空间 · 全部空间</button><button data-home-scope="市场营销域">市场营销域</button><button data-home-scope="市场营销域 / 客户运营部">　客户运营部</button><button data-home-scope="市场营销域 / 渠道管理部">　渠道管理部</button><button data-home-scope="生产制造域">生产制造域</button><button data-home-scope="运营与供应链域">运营与供应链域</button></div><div><b>项目范围</b><button data-home-scope="客户洞察项目">客户洞察项目</button><button data-home-scope="精准营销项目">精准营销项目</button><button data-home-scope="供应链风险洞察项目">供应链风险洞察项目</button><button data-home-scope="设备预测性维护项目">设备预测性维护项目</button></div></div></div><div class="portal-filter-wrap"><button class="portal-filter-trigger" id="homeTypeTrigger">' +
      icon("filter") +
      '<span>类型：</span><b id="homeTypeLabel">全部类型</b>⌄</button><div class="portal-type-menu" id="homeTypeMenu"><label><input type="checkbox" data-home-type="all" checked>全部类型</label>' +
      resultTabs
        .map(function (x) {
          return (
            '<label><input type="checkbox" data-home-type="' +
            x[0] +
            '">' +
            x[1] +
            "</label>"
          );
        })
        .join("") +
      '</div></div><select class="portal-filter-select" id="homeTimeFilter"><option value="all">更新时间：不限</option><option value="day">近 24 小时</option><option value="week">近 7 天</option><option value="month">近 30 天</option></select><span class="portal-permission-scope">仅检索当前用户有权限的 <b>186,420</b> 项资源</span></div></div></section><section class="portal-search-results" id="homeSearchResults"><div class="portal-result-header"><div><b>“<span id="homeResultKeyword">客户风险</span>”的检索结果</b><small id="homeResultContext">全部空间 · 全部类型 · 共 224 条</small></div><button class="btn" id="homeBackFromSearch">‹ 返回首页</button></div><div class="portal-result-tabs" id="homeResultTabs">' +
      resultTabs
        .map(function (x, i) {
          return (
            '<button class="' +
            (i === 0 ? "active" : "") +
            '" data-home-result="' +
            x[0] +
            '">' +
            x[1] +
            "<span>" +
            x[2] +
            "</span></button>"
          );
        })
        .join("") +
      '</div><div class="portal-result-pane active" data-home-result-pane="docs">' +
      homeDocResults() +
      '</div><div class="portal-result-pane" data-home-result-pane="images">' +
      homeImageResults() +
      '</div><div class="portal-result-pane" data-home-result-pane="types">' +
      homeTypeResults() +
      '</div><div class="portal-result-pane" data-home-result-pane="entities">' +
      homeEntityResults() +
      '</div><div class="portal-result-pane" data-home-result-pane="actions">' +
      homeActionResults() +
      '</div><div class="portal-result-pane" data-home-result-pane="tables">' +
      homeTableResults() +
      '</div><div class="portal-result-pagination"><span>共 224 条，每页 10 条</span><div><button disabled>‹</button><button class="active">1</button><button>2</button><button>3</button><em>…</em><button>23</button><button>›</button></div></div></section><section class="portal-qa-result" id="homeQaResult"><div class="portal-result-header"><div><b>全平台智能问答</b><small>基于当前用户有权限的文档、本体、实体数据、Action 与数据资源表</small></div><button class="btn" id="homeBackFromQa">‹ 返回首页</button></div><article class="portal-answer-card"><header><span>AI</span><div><b id="homeQuestionText">哪些重点客户近期存在经营风险？</b><small id="homeQaScopeSummary">已检索全部空间 · 6 类资源 · 186,420 项可访问内容</small></div></header><div class="portal-answer-body"><p>根据近 30 天的客户交易、回款、投诉事件及风险规则，当前有 <strong>18 家重点客户</strong>需要关注，其中 5 家处于高风险状态。</p><h3>主要风险判断</h3><ol><li><b>上海宏远实业</b>：应收账款逾期 286 万元，近两周订单下降 31%，风险等级为高。</li><li><b>苏州启明科技</b>：连续两次交付延期并产生重大投诉，当前处于风险处置流程。</li><li><b>华南联创集团</b>：合同续签意向下降，客户活跃度较上月降低 42%。</li></ol><p>建议优先执行“生成客户风险处置任务”Action，并由客户负责人在 3 个工作日内完成经营回访。</p></div><div class="portal-answer-evidence"><div class="portal-answer-evidence-head"><b>答案依据</b><span>引用 5 项平台资源</span></div><div class="portal-citation-list"><button data-home-citation><i class="doc">文</i><span><b>[1] 客户风险分级与处置管理办法</b><small>文档 · 市场营销域 / 制度知识库</small></span></button><button data-home-citation><i class="ontology">本</i><span><b>[2] 客户风险实体类型</b><small>本体 · 客户洞察项目</small></span></button><button data-home-citation><i class="data">数</i><span><b>[3] customer_risk_signal</b><small>数据资源表 · CRM_PROD</small></span></button><button data-home-citation><i class="entity">实</i><span><b>[4] 高风险客户实体数据</b><small>实体数据 · 18 条匹配记录</small></span></button><button data-home-citation><i class="action">A</i><span><b>[5] 生成客户风险处置任务</b><small>Action · 本体平台</small></span></button></div></div></article></section><section class="portal-home-default" id="homeDefault"><div class="section-head"><div><h2>我的工作台</h2><p>最近活动、知识空间概览与常用入口</p></div><a href="portal-mine.html">查看全部 →</a></div><div class="portal-home-grid"><article class="panel home-recent-panel"><div class="panel-head"><div><h3>最近访问</h3><p>跨类型资源使用记录</p></div></div><div class="panel-body">' +
      activityRows() +
      '</div></article><article class="panel home-approval-panel"><div class="panel-head"><div><h3>审批待办</h3><p>4 项资源申请等待处理</p></div><span class="top-spacer"></span><a href="portal-mine.html?roadmap=mine-approvals" class="btn">进入审批</a></div><div class="panel-body"><div class="home-approval-brief"><i>文</i><span><b>客户运营制度文档共享申请</b><small>3 份文档 · 市场营销域</small></span><em>待审批</em></div><div class="home-approval-brief"><i>项</i><span><b>客户洞察项目资源申请</b><small>2 项空间资源 · 客户洞察项目</small></span><em>待审批</em></div></div></article><article class="panel"><div class="panel-head"><div><h3>知识空间概览</h3><p>当前用户可访问资源</p></div></div><div class="panel-body home-knowledge-stats">' +
      [
        ["126", "实体类型"],
        ["2.8k", "数据资源"],
        ["846", "知识文档"],
        ["37", "业务流程"],
      ]
        .map(function (x) {
          return "<span><b>" + x[0] + "</b><small>" + x[1] + "</small></span>";
        })
        .join("") +
      '</div></article><article class="panel"><div class="panel-head"><div><h3>常用入口</h3><p>快速进入个人知识工作</p></div></div><div class="panel-body"><div class="quick-grid"><a class="quick-card" href="portal-mine.html"><i>★</i><span><b>我的收藏</b><small>8 项</small></span></a><a class="quick-card" href="portal-projects.html"><i>项</i><span><b>我的项目</b><small>5 个</small></span></a><a class="quick-card" href="portal-tags.html"><i>#</i><span><b>标签</b><small>32 个</small></span></a><a class="quick-card" href="portal-resources.html"><i>资</i><span><b>空间资源</b><small>846 项</small></span></a></div></div></article></div></section>'
    );
  }
  function activityRows() {
    return [
      ["本体", "客户价值分析本体", "市场营销域 / 客户洞察项目", "8 分钟前"],
      ["数据", "2026 销售明细表", "数据表 · 2.4 亿行", "43 分钟前"],
      ["文档", "重点客户分级管理办法", "制度文档 · v3.2", "2 天前"],
    ]
      .map(function (x) {
        return (
          '<div class="activity-row"><span class="activity-icon">' +
          x[0] +
          "</span><span><b>" +
          x[1] +
          "</b><small>" +
          x[2] +
          "</small></span><time>" +
          x[3] +
          "</time></div>"
        );
      })
      .join("");
  }
  var mineData = {
    favorite: [
      {
        id: "fav-ontology",
        name: "客户价值分析本体",
        type: "本体",
        desc: "统一描述客户、产品、交易与风险事件之间的业务关系。",
        location: "市场营销域 / 客户洞察项目",
        owner: "张敏",
        time: "今天 09:42",
        tags: ["客户洞察", "业务对象"],
        starred: true,
      },
      {
        id: "fav-data-customer",
        name: "客户标签宽表",
        type: "数据表",
        desc: "沉淀客户基础属性、价值分层、行为偏好与风险标签。",
        location: "市场营销域 / 数据分析组",
        owner: "每日更新",
        time: "昨天 18:30",
        tags: ["2.4 亿行", "每日同步"],
        starred: true,
      },
      {
        id: "fav-doc-policy",
        name: "重点客户分级管理办法",
        type: "文档",
        desc: "明确重点客户分层标准、经营动作与升级审批要求。",
        location: "客户运营部 / 制度知识库",
        owner: "风险管理部",
        time: "3 天前",
        tags: ["制度", "v3.2"],
        starred: true,
      },
      {
        id: "fav-kb-operation",
        name: "客户运营方法库",
        type: "知识库",
        desc: "汇聚运营案例、话术、复盘报告和客户关怀方法。",
        location: "客户运营部 / 客户洞察项目",
        owner: "陈宇",
        time: "9 月 17 日",
        tags: ["128 篇", "持续更新"],
        starred: true,
      },
      {
        id: "fav-graph-risk",
        name: "供应链风险关系图",
        type: "图析",
        desc: "关联供应商、物料、风险事件与处置任务的关系网络。",
        location: "运营与供应链域",
        owner: "李琪",
        time: "9 月 16 日",
        tags: ["关系图", "风险"],
        starred: true,
      },
      {
        id: "fav-data-sales",
        name: "销售订单明细",
        type: "数据表",
        desc: "销售订单、渠道、产品与客户维度的实时明细数据。",
        location: "经营分析域 / 销售分析",
        owner: "每小时更新",
        time: "9 月 15 日",
        tags: ["实时表", "销售"],
        starred: true,
      },
      {
        id: "fav-doc-channel",
        name: "渠道政策手册",
        type: "文档",
        desc: "渠道准入、返利、价格保护和违规处置政策汇编。",
        location: "市场营销域 / 渠道管理部",
        owner: "渠道管理部",
        time: "9 月 13 日",
        tags: ["政策", "渠道"],
        starred: true,
      },
      {
        id: "fav-ontology-device",
        name: "设备风险事件",
        type: "本体",
        desc: "定义设备异常、风险等级、维修工单与责任主体。",
        location: "生产制造域 / 设备维护项目",
        owner: "王晨",
        time: "9 月 12 日",
        tags: ["设备", "事件"],
        starred: true,
      },
    ],
    recent: [
      ["客户价值分析本体", "本体", "市场营销域 / 客户洞察项目", "8 分钟前"],
      ["2026 销售订单明细", "数据表", "经营分析域 / 销售分析", "43 分钟前"],
      ["供应链风险关系图", "图析", "运营与供应链域", "昨天 16:20"],
      ["重点客户分级管理办法", "文档", "客户运营部 / 制度知识库", "2 天前"],
      ["客户运营方法库", "知识库", "客户运营部 / 客户洞察项目", "2 天前"],
      ["设备风险事件", "本体", "生产制造域 / 设备维护项目", "3 天前"],
      ["渠道经营分析宽表", "数据表", "市场营销域 / 渠道管理部", "4 天前"],
      ["客户投诉处理规范", "文档", "客户运营部 / 服务标准库", "5 天前"],
      ["客户流失预警本体", "本体", "市场营销域 / 客户洞察项目", "6 天前"],
      ["高价值客户清单", "数据表", "市场营销域 / 客户运营部", "7 天前"],
      ["营销活动复盘报告", "文档", "市场营销域 / 营销知识库", "8 天前"],
      ["渠道伙伴知识库", "知识库", "市场营销域 / 渠道管理部", "9 天前"],
    ],
    approval: [
      {
        id: "approval-share-customer",
        kind: "share",
        category: "资源共享至空间",
        title: "客户运营制度文档共享申请",
        desc: "将客户运营知识库中的制度资料共享到客户运营部空间，供空间成员统一检索和使用。",
        source: "客户运营知识库",
        target: "赛豆企业空间 / 市场营销域 / 客户运营部",
        applicant: "张敏",
        department: "客户运营部",
        time: "今天 09:42",
        status: "待我审批",
        reason:
          "为统一客户分级、服务响应和投诉闭环规范，申请将本批制度文档共享至部门空间。",
        docs: [
          {
            name: "重点客户分级管理办法.pdf",
            type: "PDF",
            no: "DOC-CUS-001",
            title: "重点客户分级管理办法",
            summary: "本办法规定重点客户的识别、分层、经营动作和动态调整机制。",
            sections: [
              "一、适用范围：适用于客户运营部及各区域经营团队。",
              "二、分级标准：综合客户价值、成长潜力、合作黏性与风险水平进行分级。",
              "三、经营要求：A级客户建立专项经营计划，B级客户按月跟进，C级客户纳入标准化运营。",
            ],
          },
          {
            name: "客户投诉升级处理规范.docx",
            type: "DOCX",
            no: "DOC-CUS-006",
            title: "客户投诉升级处理规范",
            summary: "明确投诉分级、响应时限、升级路径和闭环验收标准。",
            sections: [
              "重大投诉须在 30 分钟内完成首次响应并同步负责人。",
              "跨部门问题由客户运营部发起协同任务并持续跟踪。",
              "闭环后需沉淀原因、措施与客户反馈，形成可检索案例。",
            ],
          },
          {
            name: "客户关怀服务标准.pdf",
            type: "PDF",
            no: "DOC-CUS-011",
            title: "客户关怀服务标准",
            summary: "规定重点节点、异常事件与周期性客户关怀的服务标准。",
            sections: [
              "客户关怀应结合客户等级、生命周期阶段和近期业务事件。",
              "所有关怀动作需记录触达渠道、结果及下一步建议。",
              "涉及敏感信息的资料仅允许授权角色查看。",
            ],
          },
        ],
      },
      {
        id: "approval-project-insight",
        kind: "project",
        category: "空间资源申请至项目",
        title: "客户洞察项目申请使用空间文档",
        desc: "客户洞察项目申请引用市场营销域的研究报告与客户标签说明，用于项目分析。",
        source: "赛豆企业空间 / 市场营销域",
        target: "客户洞察项目",
        applicant: "李琪",
        department: "数字化中心",
        time: "今天 08:26",
        status: "待我审批",
        reason:
          "项目需要使用最新的客户研究报告和标签口径说明，支撑客户分群与价值分析。",
        docs: [
          {
            name: "2026 客户价值研究报告.pdf",
            type: "PDF",
            no: "RES-MKT-026",
            title: "2026 客户价值研究报告",
            summary: "报告基于客户交易、互动与服务数据分析价值变化趋势。",
            sections: [
              "研究覆盖近 12 个月活跃客户及重点行业客户。",
              "高价值客户群体对服务及时性和定制化方案敏感度显著提升。",
              "建议结合本体中的客户关系和风险事件进行进一步分析。",
            ],
          },
          {
            name: "客户标签口径说明.xlsx",
            type: "XLSX",
            no: "RES-DATA-018",
            title: "客户标签口径说明",
            summary: "列明客户标签名称、计算口径、更新频率和责任部门。",
            sections: [
              "价值等级：按最近 12 个月综合贡献度计算，每月更新。",
              "流失风险：由活跃度变化、投诉事件与合同状态综合判断。",
              "行业分类：采用集团统一行业分类编码。",
            ],
          },
        ],
      },
      {
        id: "approval-share-device",
        kind: "share",
        category: "资源共享至空间",
        title: "设备运维标准文档批量共享",
        desc: "将集团设备知识库中的检修规程和应急处置手册共享至生产制造域。",
        source: "集团设备知识库",
        target: "赛豆企业空间 / 生产制造域",
        applicant: "王晨",
        department: "设备管理部",
        time: "昨天 16:18",
        status: "待我审批",
        reason: "各工厂需统一执行设备点检、故障处置和安全检修标准。",
        docs: [
          {
            name: "关键设备点检标准.pdf",
            type: "PDF",
            no: "DOC-EQP-101",
            title: "关键设备点检标准",
            summary: "规定关键设备的点检项目、周期、阈值和异常上报要求。",
            sections: [
              "日常点检由岗位人员执行，专业点检由设备工程师执行。",
              "关键参数超过预警阈值时自动生成风险事件。",
              "点检记录需关联设备实体和对应工单。",
            ],
          },
          {
            name: "设备故障应急处置手册.pdf",
            type: "PDF",
            no: "DOC-EQP-109",
            title: "设备故障应急处置手册",
            summary: "覆盖停机隔离、故障分级、协同处置和复产确认流程。",
            sections: [
              "发现重大故障时应立即停机并完成能量隔离。",
              "一级故障由工厂负责人组织现场应急处置。",
              "复产前必须完成安全检查和责任人确认。",
            ],
          },
          {
            name: "检修作业安全规范.docx",
            type: "DOCX",
            no: "DOC-EQP-115",
            title: "检修作业安全规范",
            summary: "规范检修作业许可、风险辨识和现场防护要求。",
            sections: [
              "检修前必须完成作业风险分析和安全交底。",
              "高风险作业实行双人复核和全过程监护。",
              "检修结束后清点工具并恢复安全装置。",
            ],
          },
        ],
      },
      {
        id: "approval-project-supply",
        kind: "project",
        category: "空间资源申请至项目",
        title: "供应链风险洞察项目资源申请",
        desc: "项目申请使用供应商风险报告、准入规范与风险事件数据说明。",
        source: "赛豆企业空间 / 运营与供应链域",
        target: "供应链风险洞察项目",
        applicant: "赵远",
        department: "供应链管理部",
        time: "昨天 14:10",
        status: "待我审批",
        reason: "用于完善供应商风险识别规则，并验证项目中的风险预警模型。",
        docs: [
          {
            name: "供应商风险评估报告.pdf",
            type: "PDF",
            no: "RES-SCM-031",
            title: "供应商风险评估报告",
            summary:
              "对核心供应商的履约、质量、财务和外部事件风险进行综合评估。",
            sections: [
              "评估范围包含 126 家核心供应商。",
              "质量与交付风险是本期最主要的两类风险。",
              "建议对高风险供应商建立周度跟踪机制。",
            ],
          },
          {
            name: "供应商准入管理规范.docx",
            type: "DOCX",
            no: "RES-SCM-044",
            title: "供应商准入管理规范",
            summary: "定义供应商准入条件、审核材料和分级审批流程。",
            sections: [
              "准入审核包括资质、质量、交付、合规与信息安全。",
              "战略供应商需通过现场审查和跨部门评审。",
              "资质到期前 30 天触发复审提醒。",
            ],
          },
        ],
      },
    ],
  };
  function mineTypeMeta(type) {
    var map = {
      文档: ["文", "orange"],
      本体: ["本", "purple"],
      数据表: ["数", "green"],
      知识库: ["库", "blue"],
      图析: ["图", "blue"],
    };
    return map[type] || [type.slice(0, 1), "blue"];
  }
  function mineRowsHtml(kind, rows) {
    if (!rows.length)
      return '<tr><td colspan="6"><div class="mine-empty">暂无符合条件的记录</div></td></tr>';
    return rows
      .map(function (x) {
        var meta = mineTypeMeta(x[1]);
        return (
          '<tr><td><div class="mine-name-cell"><span class="mine-type ' +
          meta[1] +
          '">' +
          meta[0] +
          "</span><b>" +
          x[0] +
          "</b></div></td><td>" +
          x[1] +
          "</td><td>" +
          x[2] +
          "</td><td>" +
          (kind === "favorite" ? x[3] : x[3]) +
          "</td>" +
          (kind === "favorite" ? "<td>" + x[4] + "</td>" : "") +
          "</tr>"
        );
      })
      .join("");
  }
  function mineTypeFilters(kind) {
    return (
      '<div class="mine-type-tabs" data-mine-types="' +
      kind +
      '"><button class="active" data-mine-type="文档">文档</button><button data-mine-type="数据表">数据表</button><button data-mine-type="本体">本体</button><button data-mine-type="知识库">知识库</button><button data-mine-type="图析">图析</button></div>'
    );
  }
  function mineFavoriteCardsHtml(rows) {
    if (!rows.length)
      return '<div class="mine-empty mine-card-empty">暂无符合条件的收藏资源</div>';
    return rows
      .map(function (x) {
        var meta = mineTypeMeta(x.type);
        return (
          '<article class="mine-favorite-card" data-favorite-id="' +
          x.id +
          '"><div class="mine-favorite-top"><span class="mine-type ' +
          meta[1] +
          '">' +
          meta[0] +
          '</span><span class="mine-favorite-title"><b>' +
          x.name +
          "</b><small>" +
          x.type +
          " · " +
          x.location +
          '</small></span><button class="mine-star ' +
          (x.starred ? "active" : "") +
          '" type="button" aria-label="' +
          (x.starred ? "取消收藏" : "添加收藏") +
          '">★</button></div><p>' +
          x.desc +
          '</p><div class="mine-favorite-tags">' +
          x.tags
            .map(function (tag) {
              return "<span>" + tag + "</span>";
            })
            .join("") +
          '</div><div class="mine-favorite-foot"><span>来源 / 更新人：' +
          x.owner +
          "</span><time>" +
          x.time +
          "</time></div></article>"
        );
      })
      .join("");
  }
  function mineApprovalCardsHtml(rows) {
    if (!rows.length)
      return '<div class="mine-empty mine-card-empty">暂无符合条件的审批事项</div>';
    return rows
      .map(function (x) {
        var processed = x.status !== "待我审批",
          statusClass =
            x.status === "已通过"
              ? "done"
              : x.status === "已驳回"
                ? "rejected"
                : "";
        return (
          '<article class="mine-approval-card ' +
          (processed ? "is-processed" : "") +
          '" data-approval-id="' +
          x.id +
          '"><div class="mine-approval-head"><span class="mine-approval-kind ' +
          x.kind +
          '">' +
          (x.kind === "share" ? "共" : "项") +
          '</span><div class="mine-approval-title"><div><b>' +
          x.title +
          '</b><span class="mine-kind-badge">' +
          x.category +
          "</span></div><p>" +
          x.desc +
          '</p></div><span class="mine-status ' +
          statusClass +
          '">' +
          x.status +
          '</span></div><div class="mine-approval-meta"><span><small>来源</small><b>' +
          x.source +
          "</b></span><i>→</i><span><small>目标</small><b>" +
          x.target +
          "</b></span><span><small>提交人</small><b>" +
          x.applicant +
          " · " +
          x.department +
          "</b></span><span><small>提交时间</small><b>" +
          x.time +
          '</b></span></div><div class="mine-approval-resources"><span class="mine-resource-caption">申请资料 ' +
          x.docs.length +
          " 项</span>" +
          x.docs
            .slice(0, 2)
            .map(function (doc) {
              return (
                '<button type="button" class="mine-doc-chip mine-approval-detail"><i>' +
                doc.type.slice(0, 3) +
                "</i>" +
                doc.name +
                "</button>"
              );
            })
            .join("") +
          (x.docs.length > 2
            ? '<button type="button" class="mine-more-docs mine-approval-detail">另 ' +
              (x.docs.length - 2) +
              " 项</button>"
            : "") +
          '<div class="mine-approval-actions"><button class="btn mine-approval-detail" type="button">查看详细信息</button><button class="btn danger mine-approval-reject" type="button" ' +
          (processed ? "disabled" : "") +
          '>驳回</button><button class="btn primary mine-approval-approve" type="button" ' +
          (processed ? "disabled" : "") +
          ">通过</button></div></div></article>"
        );
      })
      .join("");
  }
  function minePage() {
    return (
      pageHead(
        "我的工作台",
        "个人知识工作台，集中管理收藏、最近访问与审批事项",
      ) +
      '<section class="mine-workbench-v15" id="mineWorkbenchV15">' +
      '<div class="mine-primary-tabs" id="mineTabs"><button class="active" data-mine-tab="approval">我的审批待办<span id="mineApprovalTabCount">4</span></button><button data-mine-tab="favorite">我的收藏<span>8</span></button><button data-mine-tab="recent">最近访问<span>12</span></button></div>' +
      '<div class="mine-tab-pane" data-mine-pane="favorite"><div class="mine-toolbar"><div class="searchbox"><span>⌕</span><input id="mineFavoriteSearch" placeholder="在我的收藏中搜索"></div>' +
      mineTypeFilters("favorite") +
      '<select class="select" id="mineFavoriteSort"><option value="default">最近收藏</option><option value="name">按名称排序</option></select></div><div class="mine-favorite-grid" id="mineFavoriteGrid"></div><div class="mine-list-foot mine-standalone-foot"><span id="mineFavoriteCount">共 8 条</span><span>跨文档、本体、数据表、知识库与图析资源</span></div></div>' +
      '<div class="mine-tab-pane" data-mine-pane="recent"><div class="mine-toolbar"><div class="searchbox"><span>⌕</span><input id="mineRecentSearch" placeholder="搜索最近访问记录"></div>' +
      mineTypeFilters("recent") +
      '<select class="select" id="mineRecentTime"><option value="all">全部时间</option><option value="today">今天</option><option value="week">近 7 天</option></select></div><div class="mine-list-shell"><table class="table mine-table"><thead><tr><th>名称</th><th>类型</th><th>所属位置</th><th>最后访问</th></tr></thead><tbody id="mineRecentRows"></tbody></table><div class="mine-list-foot"><span id="mineRecentCount">共 12 条</span><span>按最近访问时间倒序排列</span></div></div></div>' +
      '<div class="mine-tab-pane active" data-mine-pane="approval"><div class="mine-approval-subtabs" id="mineApprovalSubtabs"><button class="active" data-approval-view="reviewing">我审批的<span id="mineReviewingCount">4</span></button><button data-approval-view="submitted">我提交的<span>0</span></button></div><div class="mine-approval-view active" data-approval-view-pane="reviewing"><div class="mine-toolbar mine-approval-toolbar"><div class="searchbox"><span>⌕</span><input id="mineApprovalSearch" placeholder="搜索申请、资料或提交人"></div><div class="mine-type-tabs" data-mine-types="approval"><button class="active" data-mine-type="all">全部</button><button data-mine-type="资源共享至空间">资源共享至空间</button><button data-mine-type="空间资源申请至项目">空间资源申请至项目</button></div><select class="select" id="mineApprovalStatus"><option value="待我审批">待我审批</option><option value="all">全部状态</option><option value="已通过">已通过</option><option value="已驳回">已驳回</option></select><button class="btn" id="mineApprovalReset" type="button">重置</button><button class="btn mine-refresh" id="mineApprovalRefresh" type="button">↻</button></div><div class="mine-approval-list" id="mineApprovalList"></div><div class="mine-list-foot mine-standalone-foot"><span id="mineApprovalCount">共 4 条</span><span>可查看申请资料并完成通过或驳回</span></div></div><div class="mine-approval-view" data-approval-view-pane="submitted"><div class="mine-submitted-empty"><span>审</span><b>暂无我提交的审批</b><p>从空间或项目发起的资源申请，将在这里跟踪审批进度。</p></div></div></div>' +
      '</section><div class="mine-approval-mask" id="mineApprovalDetail" aria-hidden="true"><section class="mine-approval-modal" role="dialog" aria-modal="true" aria-labelledby="mineApprovalDetailTitle"><header><div><span class="mine-modal-kicker" id="mineApprovalDetailKind">审批详情</span><h2 id="mineApprovalDetailTitle">审批事项</h2></div><button type="button" id="mineApprovalDetailClose" aria-label="关闭">×</button></header><div class="mine-approval-modal-body"><div class="mine-approval-summary" id="mineApprovalSummary"></div><div class="mine-approval-reason"><b>申请说明</b><p id="mineApprovalReason"></p></div><div class="mine-approval-document-layout"><aside><div class="mine-document-list-head"><b>申请资料</b><span id="mineApprovalDocCount"></span></div><div class="mine-document-list" id="mineApprovalDocList"></div></aside><main class="mine-document-preview"><div class="mine-preview-toolbar"><div><span id="minePreviewType">PDF</span><b id="minePreviewTitle">资料预览</b></div><span id="minePreviewNo"></span></div><article class="mine-preview-paper"><span class="mine-paper-label">KNORA · 企业知识资料</span><h3 id="minePreviewPaperTitle"></h3><p class="mine-paper-summary" id="minePreviewSummary"></p><div id="minePreviewContent"></div></article></main></div></div><footer><span id="mineApprovalDecisionHint">请确认申请范围与资料内容后处理</span><button class="btn danger" id="mineDetailReject" type="button">驳回</button><button class="btn primary" id="mineDetailApprove" type="button">通过</button></footer></section></div>'
    );
  }
  var assetData = {
    doc: [
      ["客户分层运营指引.pdf", "PDF", "已解析", "客户运营部", "2026-09-18"],
      ["重点客户季度复盘.pptx", "PPTX", "已解析", "客户运营部", "2026-09-17"],
      ["客户满意度调研报告.docx", "DOCX", "解析中", "洞察研究组", "2026-09-16"],
    ],
    data: [
      [
        "customer_profile_wide",
        "TABLE",
        "2.4 亿行",
        "数据分析组",
        "2026-09-18",
      ],
      [
        "customer_event_stream",
        "STREAM",
        "实时同步",
        "数据分析组",
        "2026-09-18",
      ],
      [
        "satisfaction_survey_detail",
        "TABLE",
        "860 万行",
        "洞察研究组",
        "2026-09-15",
      ],
    ],
    ontology: [
      ["客户", "业务对象", "86 个属性", "客户洞察项目", "2026-09-18"],
      ["客户—购买—产品", "业务关联", "3 个角色", "客户洞察项目", "2026-09-17"],
      ["客户流失预警", "事件", "12 条规则", "客户洞察项目", "2026-09-16"],
      ["生成关怀任务", "Action", "5 个参数", "客户体验项目", "2026-09-15"],
    ],
    kb: [
      [
        "客户运营方法库",
        "文档知识库",
        "5 篇文档",
        "客户洞察项目",
        "2026-09-18",
      ],
      [
        "客户声音语料库",
        "文档知识库",
        "128 篇文档",
        "洞察研究组",
        "2026-09-17",
      ],
    ],
    flow: [
      ["客户流失干预流程", "业务流程", "运行中", "客户洞察项目", "2026-09-18"],
      ["重点客户升级流程", "业务流程", "草稿", "客户体验项目", "2026-09-14"],
    ],
    agent: [
      ["客户洞察智能体", "业务智能体", "已发布", "客户洞察项目", "2026-09-18"],
      ["客诉分析助手", "问答智能体", "测试中", "客户体验项目", "2026-09-16"],
    ],
  };
  function resourcesPage() {
    return (
      pageHead(
        "空间与资源",
        "左侧管理 UUMS 同步组织与自建空间，右侧查看当前空间的全部知识资产",
        '<span class="org-sync-policy"><i></i>仅手动 · 增量更新 · 保留删除部门</span><button class="btn" id="syncUumsBtn">↻ 手动增量同步 UUMS</button>',
      ) +
      '<section class="resource-layout v15-resource-layout"><aside class="space-tree v15-space-tree"><div class="tree-head"><span><b>空间组织目录</b><small>点击节点查看并配置空间</small></span><span class="org-legend"><i class="sync"></i>同步<i class="local"></i>自建</span></div><div class="searchbox tree-search">' +
      icon("search") +
      '<input id="spaceTreeSearch" placeholder="搜索组织空间名称"></div><div id="spaceTree" class="org-directory"><div class="org-tree-node"><div class="tree-row org-space-row active" data-space="赛豆企业空间" data-source="root" data-type="企业空间" data-path="赛豆企业空间"><span class="tree-caret">⌄</span><i>企</i><span class="org-name">赛豆企业空间</span><span class="tree-tag root">根空间</span><span class="org-count">4</span><button class="node-create" data-parent="赛豆企业空间" title="新建下级空间">＋</button></div><div class="org-children"><div class="org-tree-node"><div class="tree-row org-space-row" data-space="市场营销域" data-source="uums" data-type="业务领域" data-path="赛豆企业空间 / 市场营销域"><span class="tree-caret">⌄</span><i>市</i><span class="org-name">市场营销域</span><span class="tree-tag sync">UUMS同步</span><span class="org-count">2</span><button class="node-create" data-parent="市场营销域" title="创建直属下级空间">＋</button></div><div class="org-children"><div class="org-tree-node"><div class="tree-row org-space-row" data-space="客户运营部" data-source="uums" data-type="部门" data-path="赛豆企业空间 / 市场营销域 / 客户运营部"><span class="tree-caret"></span><i>客</i><span class="org-name">客户运营部</span><span class="tree-tag sync">UUMS同步</span><button class="node-create" data-parent="客户运营部">＋</button></div></div><div class="org-tree-node"><div class="tree-row org-space-row" data-space="渠道管理部" data-source="uums" data-type="部门" data-path="赛豆企业空间 / 市场营销域 / 渠道管理部"><span class="tree-caret"></span><i>渠</i><span class="org-name">渠道管理部</span><span class="tree-tag sync">UUMS同步</span><button class="node-create" data-parent="渠道管理部">＋</button></div></div></div></div><div class="org-tree-node"><div class="tree-row org-space-row" data-space="生产制造域" data-source="uums" data-type="业务领域" data-path="赛豆企业空间 / 生产制造域"><span class="tree-caret"></span><i>产</i><span class="org-name">生产制造域</span><span class="tree-tag sync">UUMS同步</span><button class="node-create" data-parent="生产制造域">＋</button></div></div><div class="org-tree-node"><div class="tree-row org-space-row" data-space="创新业务空间" data-source="local" data-type="组织空间" data-path="赛豆企业空间 / 创新业务空间"><span class="tree-caret">⌄</span><i>创</i><span class="org-name">创新业务空间</span><span class="tree-tag local">自建空间</span><span class="org-count">1</span><button class="node-create" data-parent="创新业务空间">＋</button></div><div class="org-children"><div class="org-tree-node"><div class="tree-row org-space-row" data-space="AI创新组" data-source="local" data-type="组织空间" data-path="赛豆企业空间 / 创新业务空间 / AI创新组"><span class="tree-caret"></span><i>AI</i><span class="org-name">AI创新组</span><span class="tree-tag local">自建空间</span><button class="node-create" data-parent="AI创新组">＋</button></div></div></div></div><div class="org-tree-node"><div class="tree-row org-space-row" data-space="区域运营空间" data-source="local" data-type="组织空间" data-path="赛豆企业空间 / 区域运营空间"><span class="tree-caret"></span><i>区</i><span class="org-name">区域运营空间</span><span class="tree-tag local">自建空间</span><button class="node-create" data-parent="区域运营空间">＋</button></div></div></div></div></div></aside><div class="space-main"><div class="space-title"><span class="space-symbol">资</span><div><h2 id="spaceName">赛豆企业空间</h2><p id="spacePath">根空间 · 汇总本空间及全部下级空间资产</p></div><div class="head-actions"><button class="btn" id="openCurrentSpaceConfig">空间配置</button></div></div><div class="asset-summary">' +
      [
        ["846", "文档"],
        ["31", "数据表"],
        ["126", "本体资源"],
        ["18", "知识库"],
        ["37", "流程"],
        ["12", "智能体"],
      ]
        .map(function (x) {
          return (
            '<div class="asset-stat"><b>' +
            x[0] +
            "</b><span>" +
            x[1] +
            "</span></div>"
          );
        })
        .join("") +
      '</div><div class="asset-tabs" id="assetTabs"><button class="asset-tab active" data-asset="doc">文档</button><button class="asset-tab" data-asset="data">数据表</button><button class="asset-tab" data-asset="ontology">本体</button><button class="asset-tab" data-asset="kb">知识库</button><button class="asset-tab" data-asset="flow">流程</button><button class="asset-tab" data-asset="agent">智能体</button></div><div class="toolbar"><button class="btn soft" id="resourcePermissionBtn">配置资源权限</button><select class="select"><option>全部状态</option><option>已发布</option><option>草稿</option></select><div class="searchbox"><input id="assetSearch" placeholder="检索当前类型资产">' +
      icon("search") +
      '</div></div><div class="asset-list" id="assetList"></div></div></section>'
    );
  }
  function renderAssets(type) {
    var rows = assetData[type] || [];
    var target = document.getElementById("assetList");
    if (!target) return;
    target.innerHTML = rows
      .map(function (x) {
        return (
          '<div class="asset-row"><div class="asset-name"><i>' +
          x[1].slice(0, 3) +
          "</i><span><b>" +
          x[0] +
          "</b><small>空间资源 · 可申请至项目</small></span></div><span>" +
          x[1] +
          "</span><span>" +
          x[2] +
          "</span><span>" +
          x[3] +
          '</span><button class="btn" style="height:27px;padding:0 8px" data-toast="打开 ' +
          x[0] +
          ' 详情">查看</button></div>'
        );
      })
      .join("");
  }

  var resourceCatalog = {
    doc: [
      {
        id: "doc-risk",
        name: "客户风险分级与处置管理办法.docx",
        format: "Word",
        parse: "已解析",
        approval: "已发布",
        permission: "管理",
        owner: "张敏",
        updated: "2026-09-18 16:50",
        size: "2.8 MB",
        source: "本地上传",
        scope: "public",
      },
      {
        id: "doc-report",
        name: "2026 年重点客户经营分析报告.pdf",
        format: "PDF",
        parse: "已解析",
        approval: "已发布",
        permission: "只读",
        owner: "陈宇",
        updated: "2026-09-16 09:26",
        size: "8.6 MB",
        source: "飞书文档",
        scope: "public",
        feishu: true,
        feishuPath: "经营分析知识库 / 客户经营 / 月度报告",
      },
      {
        id: "doc-feishu-wiki",
        name: "渠道策略复盘纪要",
        format: "飞书",
        parse: "已解析",
        approval: "已同步",
        permission: "只读",
        owner: "王晨",
        updated: "2026-09-19 10:32",
        size: "在线文档",
        source: "飞书知识库",
        scope: "public",
        feishu: true,
        feishuPath: "渠道运营知识库 / 2026 复盘 / 华东区域",
      },
      {
        id: "doc-playbook",
        name: "重点客户联合运营手册.docx",
        format: "Word",
        parse: "解析中",
        approval: "审核中",
        permission: "浏览",
        owner: "王晨",
        updated: "2026-09-15 14:10",
        size: "4.1 MB",
        source: "本地上传",
        scope: "public",
      },
      {
        id: "doc-personal",
        name: "客户洞察分析草稿.docx",
        format: "Word",
        parse: "未解析",
        approval: "仅个人",
        permission: "管理",
        owner: "陈宇",
        updated: "2026-09-19 11:08",
        size: "1.3 MB",
        source: "个人上传",
        scope: "personal",
      },
    ],
    ontology: [
      {
        id: "ont-customer",
        name: "客户经营本体",
        version: "v3.4",
        status: "已发布",
        owner: "客户数据组",
        updated: "2026-09-18",
        desc: "统一客户、订单、风险事件与经营动作的语义模型。",
        metrics: ["18 个实体类型", "32 种关系", "46 个 Action"],
        sample: [
          ["客户", "上海宏远实业", "重点客户"],
          ["风险事件", "回款逾期", "高风险"],
          ["经营动作", "升级跟进", "执行中"],
        ],
      },
      {
        id: "ont-device",
        name: "设备运维本体",
        version: "v2.1",
        status: "已发布",
        owner: "设备智能组",
        updated: "2026-09-12",
        desc: "覆盖设备、部件、故障、工单和维保计划。",
        metrics: ["12 个实体类型", "21 种关系", "19 个 Action"],
        sample: [
          ["设备", "冲压机 A-103", "运行中"],
          ["故障", "液压压力异常", "待处理"],
          ["工单", "WO-20260918", "已派发"],
        ],
      },
      {
        id: "ont-supply",
        name: "供应链风险本体",
        version: "v1.8",
        status: "草稿",
        owner: "供应链中心",
        updated: "2026-09-10",
        desc: "供应商、物料、订单和风险事件关联模型。",
        metrics: ["15 个实体类型", "27 种关系", "22 个 Action"],
        sample: [
          ["供应商", "华东精密", "A级"],
          ["物料", "齿轮组件", "库存偏低"],
          ["风险事件", "交期延迟", "预警"],
        ],
      },
    ],
    kb: [
      {
        id: "kb-sales",
        name: "客户运营知识库",
        kind: "业务知识库",
        status: "已发布",
        owner: "客户运营部",
        updated: "2026-09-18",
      },
      {
        id: "kb-policy",
        name: "制度与规范知识库",
        kind: "制度知识库",
        status: "已发布",
        owner: "数字化中心",
        updated: "2026-09-16",
      },
    ],
    flow: [
      {
        id: "flow-risk",
        name: "客户风险升级处置流程",
        kind: "业务流程",
        status: "已发布",
        owner: "客户运营部",
        updated: "2026-09-18",
      },
      {
        id: "flow-review",
        name: "重点客户材料审核流程",
        kind: "审批流程",
        status: "草稿",
        owner: "销售管理部",
        updated: "2026-09-13",
      },
    ],
    agent: [
      {
        id: "agent-insight",
        name: "客户经营洞察助手",
        kind: "分析智能体",
        status: "已发布",
        owner: "客户数据组",
        updated: "2026-09-18",
      },
      {
        id: "agent-risk",
        name: "风险跟进助手",
        kind: "任务智能体",
        status: "内测中",
        owner: "客户运营部",
        updated: "2026-09-15",
      },
    ],
  };
  var resourceTables = [
    {
      id: "tbl-customer",
      source: "MySQL · CRM_PROD",
      database: "crm_prod",
      schema: "customer",
      name: "customer_profile",
      status: "已接入",
      owner: "客户数据组",
      updated: "每小时",
      rows: "3,842 万",
      desc: "客户基础信息、分层标签与活跃度统一宽表。",
      columns: [
        ["customer_id", "varchar(64)", "客户统一标识"],
        ["customer_name", "varchar(200)", "客户名称"],
        ["customer_level", "varchar(20)", "客户等级"],
        ["risk_score", "decimal(8,2)", "当前风险评分"],
      ],
      sample: [
        ["C100328", "上海宏远实业", "战略客户", "82.6"],
        ["C100917", "苏州启明科技", "重点客户", "63.2"],
        ["C101126", "杭州远景制造", "普通客户", "28.5"],
      ],
    },
    {
      id: "tbl-order",
      source: "Oracle · ERP_DW",
      database: "erp_dw",
      schema: "sales",
      name: "sales_order_detail",
      status: "已接入",
      owner: "经营分析组",
      updated: "实时同步",
      rows: "8.6 亿",
      desc: "销售订单明细、履约状态、产品与渠道信息。",
      columns: [
        ["order_no", "varchar(40)", "订单号"],
        ["customer_id", "varchar(64)", "客户标识"],
        ["amount", "decimal(18,2)", "订单金额"],
        ["delivery_status", "varchar(20)", "交付状态"],
      ],
      sample: [
        ["SO20260918001", "C100328", "2860000", "待交付"],
        ["SO20260918017", "C100917", "860000", "部分交付"],
        ["SO20260918028", "C101126", "428000", "已完成"],
      ],
    },
    {
      id: "tbl-signal",
      source: "Kafka · RISK_STREAM",
      database: "risk_stream",
      schema: "realtime",
      name: "customer_risk_signal",
      status: "已接入",
      owner: "风控算法组",
      updated: "实时流入",
      rows: "2.4 亿",
      desc: "交易、回款、投诉与模型评分产生的实时风险信号。",
      columns: [
        ["event_id", "string", "事件标识"],
        ["customer_id", "string", "客户标识"],
        ["signal_type", "string", "信号类型"],
        ["event_time", "timestamp", "发生时间"],
      ],
      sample: [
        ["EVT-88201", "C100328", "PAYMENT_OVERDUE", "09:18:02"],
        ["EVT-88217", "C100917", "ORDER_DROP", "09:19:46"],
        ["EVT-88243", "C101126", "COMPLAINT", "09:22:11"],
      ],
    },
  ];
  var activeResourceType = "doc";
  function resourceMainHtml() {
    return (
      '<div class="space-title resource-space-title"><span class="space-symbol">资</span><div><h2 id="spaceName">赛豆企业空间</h2><p id="spacePath">根空间 · 汇总本空间及全部下级空间资产</p></div><div class="head-actions"><button class="btn" id="openCurrentSpaceConfig">空间配置</button><button class="btn feishu-sync-btn" id="syncFeishuBtn"><i class="feishu-mark">飞</i>同步飞书文档</button><button class="btn" id="uploadResourceBtn">上传资源</button><button class="btn primary" id="addDataSourceBtn">＋ 添加数据源</button></div></div>' +
      '<div class="asset-summary">' +
      [
        ["846", "文档"],
        ["31", "数据表"],
        ["126", "本体资源"],
        ["18", "知识库"],
        ["37", "流程"],
        ["12", "智能体"],
      ]
        .map(function (x) {
          return (
            '<div class="asset-stat"><b>' +
            x[0] +
            "</b><span>" +
            x[1] +
            "</span></div>"
          );
        })
        .join("") +
      "</div>" +
      '<div class="asset-tabs" id="assetTabs"><button class="asset-tab active" data-asset="doc">文档</button><button class="asset-tab" data-asset="data">数据表</button><button class="asset-tab" data-asset="ontology">本体数据</button><button class="asset-tab" data-asset="kb">知识库</button><button class="asset-tab" data-asset="flow">流程</button><button class="asset-tab" data-asset="agent">智能体</button></div>' +
      '<div class="resource-commandbar"><div class="resource-admin-actions"><span>管理员操作</span><button class="btn soft document-auto-tag-btn" id="documentAutoTagBtn">✦ 文档自动打标</button><button class="btn soft" id="resourceShareBtn">共享至其它空间</button><button class="btn soft" id="resourcePermissionBtn">授权到人 / 组织 / 项目</button></div><select class="select" id="assetStatus"><option value="all">全部状态</option><option value="已发布">已发布</option><option value="草稿">草稿 / 审核中</option></select><div class="searchbox"><input id="assetSearch" placeholder="检索名称、来源或负责人">' +
      icon("search") +
      "</div></div>" +
      '<div class="asset-list resource-asset-list" id="assetList"></div>' +
      '<div class="resource-drawer-mask" id="resourceDrawerMask"></div><aside class="resource-detail-drawer" id="resourceDrawer" aria-hidden="true"><header><div><span id="resourceDrawerKind">资源详情</span><h2 id="resourceDrawerTitle"></h2></div><button id="resourceDrawerClose">×</button></header><div class="resource-drawer-body" id="resourceDrawerBody"></div></aside>'
    );
  }
  function installResourceWorkspace() {
    var main = document.querySelector(".space-main");
    if (main) main.innerHTML = resourceMainHtml();
    var children = document.querySelector(
      "#spaceTree > .org-tree-node > .org-children",
    );
    if (children && !document.querySelector('[data-source="personal"]'))
      children.insertAdjacentHTML(
        "afterbegin",
        '<div class="org-tree-node personal-space-node"><div class="tree-row org-space-row" data-space="个人空间" data-source="personal" data-type="个人空间" data-path="赛豆企业空间 / 个人空间"><span class="tree-caret"></span><i>个</i><span class="org-name">个人空间</span><span class="tree-tag personal">仅自己</span><span class="org-count">18</span></div></div>',
      );
  }
  function assetFiltered(items) {
    var q = (document.getElementById("assetSearch") || {}).value || "",
      state = (document.getElementById("assetStatus") || {}).value || "all";
    q = q.trim().toLowerCase();
    return items.filter(function (x) {
      var text = Object.keys(x)
          .map(function (k) {
            return Array.isArray(x[k]) ? "" : x[k];
          })
          .join(" ")
          .toLowerCase(),
        okState =
          state === "all" ||
          x.status === state ||
          x.approval === state ||
          (state === "草稿" &&
            ["草稿", "审核中", "内测中"].includes(x.status || x.approval));
      return (!q || text.includes(q)) && okState;
    });
  }
  function docActions(x) {
    var link = "portal-document-detail.html?doc=" + encodeURIComponent(x.id);
    if (x.feishu)
      return (
        '<div class="resource-row-actions"><a class="text-action" href="' +
        link +
        '" target="_blank" rel="noopener">预览</a><button class="text-action" data-resource-action="download" data-id="' +
        x.id +
        '">下载</button><button class="text-action" data-resource-action="feishu-refresh" data-id="' +
        x.id +
        '">同步</button></div>'
      );
    return (
      '<div class="resource-row-actions"><a class="text-action" href="' +
      link +
      '" target="_blank" rel="noopener">预览</a>' +
      (x.permission !== "浏览"
        ? '<a class="text-action" href="' +
          link +
          '&mode=edit" target="_blank" rel="noopener">编辑</a>'
        : "") +
      '<button class="text-action" data-resource-action="share" data-id="' +
      x.id +
      '">共享</button><button class="text-action" data-resource-action="authorize" data-id="' +
      x.id +
      '">授权</button><button class="more-action" data-resource-action="more" data-id="' +
      x.id +
      '">•••</button></div>'
    );
  }
  function renderDocumentAssets() {
    var rows = assetFiltered(resourceCatalog.doc),
      personal = document.querySelector('[data-source="personal"].active');
    if (personal)
      rows = rows.filter(function (x) {
        return x.scope === "personal";
      });
    return (
      '<div class="resource-list-caption"><span><b>' +
      rows.length +
      '</b> 个文档</span><em>飞书文档与平台文档统一存放；飞书来源内容保持只读</em></div><div class="resource-table-head doc-grid"><span>文档名称</span><span>解析 / 发布</span><span>我的权限</span><span>来源 / 更新人</span><span>更新时间</span><span>大小</span><span>操作</span></div>' +
      rows
        .map(function (x) {
          return (
            '<article class="resource-table-row doc-grid ' +
            (x.feishu ? "feishu-document-row" : "") +
            '" data-resource-id="' +
            x.id +
            '"><div class="resource-primary"><span class="file-badge ' +
            (x.feishu ? "feishu" : x.format.toLowerCase()) +
            '">' +
            (x.feishu ? "飞" : x.format.slice(0, 1)) +
            '</span><span><a href="portal-document-detail.html?doc=' +
            encodeURIComponent(x.id) +
            '" target="_blank" rel="noopener">' +
            x.name +
            "</a><small>" +
            x.format +
            " · " +
            x.source +
            (x.feishu
              ? '<em class="feishu-source-tag">飞书同步 · 只读</em>'
              : "") +
            '</small></span></div><div><span class="resource-status ok">' +
            x.parse +
            "</span><small>" +
            x.approval +
            '</small></div><span class="permission-badge ' +
            (x.feishu ? "readonly" : "") +
            '">' +
            x.permission +
            "</span><span>" +
            x.source +
            "<small>" +
            x.owner +
            "</small></span><span>" +
            x.updated +
            "</span><span>" +
            x.size +
            "</span>" +
            docActions(x) +
            "</article>"
          );
        })
        .join("") +
      (rows.length
        ? ""
        : '<div class="resource-empty">当前筛选条件下暂无文档</div>')
    );
  }
  function sourceLogo(source, compact) {
    var name = source.split(" · ")[0],
      key = name.toLowerCase().replace(/\s/g, "");
    return (
      '<span class="source-logo ' +
      key +
      " " +
      (compact ? "compact" : "") +
      '"><i>' +
      (name === "MySQL"
        ? "◒"
        : name === "Oracle"
          ? "O"
          : name === "Kafka"
            ? "●"
            : name === "XML"
              ? "&lt;/&gt;"
              : "API") +
      "</i><b>" +
      name +
      "</b></span>"
    );
  }
  function renderTableAssets() {
    var rows = assetFiltered(resourceTables),
      sources = {};
    rows.forEach(function (x) {
      if (!sources[x.source]) sources[x.source] = {};
      if (!sources[x.source][x.database]) sources[x.source][x.database] = [];
      sources[x.source][x.database].push(x);
    });
    var tree = Object.keys(sources)
      .map(function (source) {
        return (
          '<div class="data-source-node"><b>' +
          sourceLogo(source, true) +
          "<span>" +
          source +
          "</span></b>" +
          Object.keys(sources[source])
            .map(function (db) {
              return (
                '<div class="data-db-node"><span>▾ 库 · ' +
                db +
                "</span>" +
                sources[source][db]
                  .map(function (x) {
                    return (
                      '<button data-table-id="' +
                      x.id +
                      '">└ 表 · ' +
                      x.name +
                      "</button>"
                    );
                  })
                  .join("") +
                "</div>"
              );
            })
            .join("") +
          "</div>"
        );
      })
      .join("");
    return (
      '<div class="resource-data-layout"><aside class="data-catalog"><header><b>数据资源目录</b><small>数据源 / 数据库 / 表</small></header>' +
      tree +
      '</aside><section class="data-table-panel"><div class="resource-list-caption"><span><b>' +
      rows.length +
      "</b> 张数据表</span><em>按外部数据源、数据库和表三级展示</em></div>" +
      rows
        .map(function (x) {
          return (
            '<article class="data-table-card" data-table-id="' +
            x.id +
            '">' +
            sourceLogo(x.source, false) +
            "<div><b>" +
            x.name +
            "</b><code>" +
            x.source +
            " / " +
            x.database +
            " / " +
            x.schema +
            "</code><p>" +
            x.desc +
            "</p><footer><span>" +
            x.rows +
            " 行</span><span>" +
            x.columns.length +
            " 个示例字段</span><span>" +
            x.updated +
            '</span></footer></div><aside><span class="resource-status ok">' +
            x.status +
            '</span><button class="btn" data-table-id="' +
            x.id +
            '">查看详情</button><button class="btn" data-resource-action="authorize" data-id="' +
            x.id +
            '">授权</button></aside></article>'
          );
        })
        .join("") +
      (rows.length
        ? ""
        : '<div class="resource-empty">当前筛选条件下暂无数据表</div>') +
      "</section></div>"
    );
  }
  function renderOntologyAssets() {
    var rows = assetFiltered(resourceCatalog.ontology);
    return (
      '<div class="resource-list-caption"><span><b>' +
      rows.length +
      '</b> 个本体资源</span><em>点击资源，在右侧查看元数据和数据样例</em></div><div class="ontology-resource-grid">' +
      rows
        .map(function (x) {
          return (
            '<article data-ontology-id="' +
            x.id +
            '"><header><i>本</i><div><b>' +
            x.name +
            "</b><small>" +
            x.version +
            " · " +
            x.owner +
            '</small></div><span class="resource-status ' +
            (x.status === "已发布" ? "ok" : "") +
            '">' +
            x.status +
            "</span></header><p>" +
            x.desc +
            "</p><div>" +
            x.metrics
              .map(function (m) {
                return "<span>" + m + "</span>";
              })
              .join("") +
            '</div><footer><button class="btn primary" data-ontology-id="' +
            x.id +
            '">查看元数据与样例</button><button class="btn" data-resource-action="share" data-id="' +
            x.id +
            '">共享</button><button class="btn" data-resource-action="authorize" data-id="' +
            x.id +
            '">授权</button></footer></article>'
          );
        })
        .join("") +
      "</div>"
    );
  }
  function renderGenericAssets(type) {
    var rows = assetFiltered(resourceCatalog[type] || []);
    return (
      '<div class="resource-list-caption"><span><b>' +
      rows.length +
      '</b> 个资源</span><em>支持按名称、状态与负责人查询</em></div><div class="resource-generic-list">' +
      rows
        .map(function (x) {
          return (
            "<article><i>" +
            ({ kb: "库", flow: "流", agent: "智" }[type] || "资") +
            "</i><div><b>" +
            x.name +
            "</b><small>" +
            x.kind +
            " · " +
            x.owner +
            " · " +
            x.updated +
            '</small></div><span class="resource-status ok">' +
            x.status +
            '</span><button class="btn" data-toast="打开 ' +
            x.name +
            ' 详情（蓝图示意）">查看</button><button class="btn" data-resource-action="share" data-id="' +
            x.id +
            '">共享</button><button class="btn" data-resource-action="authorize" data-id="' +
            x.id +
            '">授权</button></article>'
          );
        })
        .join("") +
      "</div>"
    );
  }
  function renderAssets(type) {
    activeResourceType = type;
    var target = document.getElementById("assetList"),
      autoTagBtn = document.getElementById("documentAutoTagBtn");
    if (!target) return;
    if (autoTagBtn)
      autoTagBtn.style.display = type === "doc" ? "inline-flex" : "none";
    target.innerHTML =
      type === "doc"
        ? renderDocumentAssets()
        : type === "data"
          ? renderTableAssets()
          : type === "ontology"
            ? renderOntologyAssets()
            : renderGenericAssets(type);
  }
  function findResource(id) {
    var result = null;
    Object.keys(resourceCatalog).some(function (k) {
      result = (resourceCatalog[k] || []).find(function (x) {
        return x.id === id;
      });
      return !!result;
    });
    return (
      result ||
      resourceTables.find(function (x) {
        return x.id === id;
      })
    );
  }
  function drawerMeta(items) {
    return (
      '<div class="drawer-meta-grid">' +
      items
        .map(function (x) {
          return "<span><small>" + x[0] + "</small><b>" + x[1] + "</b></span>";
        })
        .join("") +
      "</div>"
    );
  }
  function openResourceDrawer(kind, id) {
    var x = findResource(id),
      drawer = document.getElementById("resourceDrawer"),
      body = document.getElementById("resourceDrawerBody");
    if (!x || !drawer) return;
    document.getElementById("resourceDrawerKind").textContent =
      kind === "data" ? "数据表详情" : "本体数据详情";
    document.getElementById("resourceDrawerTitle").textContent = x.name;
    var html =
      '<section class="drawer-section"><h3>基本信息</h3>' +
      drawerMeta(
        kind === "data"
          ? [
              ["数据源", x.source],
              ["数据库", x.database],
              ["Schema", x.schema],
              ["数据量", x.rows],
              ["更新方式", x.updated],
              ["负责人", x.owner],
            ]
          : [
              ["版本", x.version],
              ["状态", x.status],
              ["负责人", x.owner],
              ["最近更新", x.updated],
            ],
      ) +
      '<p class="drawer-description">' +
      x.desc +
      "</p></section>";
    if (kind === "data")
      html +=
        '<section class="drawer-section"><h3>字段元数据</h3><table class="drawer-table"><thead><tr><th>字段</th><th>类型</th><th>说明</th></tr></thead><tbody>' +
        x.columns
          .map(function (r) {
            return (
              "<tr><td><code>" +
              r[0] +
              "</code></td><td>" +
              r[1] +
              "</td><td>" +
              r[2] +
              "</td></tr>"
            );
          })
          .join("") +
        '</tbody></table></section><section class="drawer-section"><h3>数据样例 <small>仅展示脱敏后的前 3 行</small></h3><div class="drawer-sample"><table><tbody>' +
        x.sample
          .map(function (r) {
            return (
              "<tr>" +
              r
                .map(function (c) {
                  return "<td>" + c + "</td>";
                })
                .join("") +
              "</tr>"
            );
          })
          .join("") +
        "</tbody></table></div></section>";
    else
      html +=
        '<section class="drawer-section"><h3>规模概览</h3><div class="drawer-metrics">' +
        x.metrics
          .map(function (m) {
            return "<span>" + m + "</span>";
          })
          .join("") +
        '</div></section><section class="drawer-section"><h3>实体数据样例</h3><table class="drawer-table"><thead><tr><th>类型</th><th>名称</th><th>关键属性</th></tr></thead><tbody>' +
        x.sample
          .map(function (r) {
            return (
              "<tr><td>" +
              r[0] +
              "</td><td>" +
              r[1] +
              "</td><td>" +
              r[2] +
              "</td></tr>"
            );
          })
          .join("") +
        "</tbody></table></section>";
    html +=
      '<div class="drawer-actions"><button class="btn primary" data-toast="打开资源工作台（蓝图示意）">进入资源</button><button class="btn" data-resource-action="share" data-id="' +
      id +
      '">共享至空间</button><button class="btn" data-resource-action="authorize" data-id="' +
      id +
      '">授权到人 / 项目</button></div>';
    body.innerHTML = html;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    document.getElementById("resourceDrawerMask").classList.add("open");
  }
  function closeResourceDrawer() {
    var drawer = document.getElementById("resourceDrawer");
    if (!drawer) return;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    document.getElementById("resourceDrawerMask").classList.remove("open");
  }
  function openResourceGrant(action, name) {
    var sharing = action === "share";
    openModal(
      sharing ? "共享至其它空间" : "授权到人 / 组织 / 项目",
      (name || "当前筛选资源") + " · 仅空间管理员可执行",
      sharing
        ? '<div class="field"><label>目标空间</label><div class="member-pick-list"><label><input type="checkbox"> 市场营销域 / 客户运营部</label><label><input type="checkbox"> 创新业务空间 / AI 创新组</label><label><input type="checkbox"> 生产制造域</label></div></div><div class="field"><label>共享权限</label><select class="input"><option>可浏览</option><option>可使用</option><option>可下载</option></select></div><div class="field"><label>共享说明</label><textarea class="textarea" placeholder="填写共享范围与用途"></textarea></div>'
        : '<div class="grant-target-tabs"><button class="active">授权到人</button><button>授权到组织</button><button>授权到项目</button></div><div class="field"><label>选择授权对象</label><div class="member-pick-list"><label><input type="checkbox"> 张敏 · 客户运营部 · 成员</label><label><input type="checkbox"> 市场营销域 / 客户运营部 · 组织空间</label><label><input type="checkbox"> 客户洞察项目 · 项目</label></div></div><div class="field"><label>权限</label><div class="inline-checks"><label><input type="checkbox" checked> 浏览</label><label><input type="checkbox"> 使用</label><label><input type="checkbox"> 下载</label><label><input type="checkbox"> 编辑</label></div></div><div class="data-source-tip">飞书同步文档继承飞书源端权限，将自动排除在平台再次授权范围之外。</div>',
      sharing ? "发起共享" : "确认授权",
      function () {
        toast(sharing ? "共享申请已提交" : "资源授权已生效");
      },
      true,
    );
  }
  function feishuAppSetupHtml() {
    return '<div class="feishu-app-setup"><div class="feishu-app-guide"><div class="feishu-guide-title"><i class="feishu-mark large">飞</i><span><b>先在飞书开放平台创建 Knora 应用</b><small>此步骤由平台管理员完成一次，后续用户通过个人授权同步文档。</small></span></div><ol><li><i>1</i><span><b>创建企业自建应用</b><small>进入飞书开放平台 → 开发者后台，新建“Knora 文档连接器”。</small></span></li><li><i>2</i><span><b>申请只读能力</b><small>开通云文档、云空间与知识库的读取权限，不申请编辑权限。</small></span></li><li><i>3</i><span><b>配置安全回调并发布</b><small>填写 Knora OAuth 回调地址，完成企业管理员审核并发布应用。</small></span></li><li><i>4</i><span><b>复制应用凭证</b><small>将 App ID 与 App Secret 填入右侧，即完成平台级数据源创建。</small></span></li></ol><div class="feishu-security-note">App Secret 仅用于服务端 OAuth 换取凭证，将加密保存；每位用户仍需单独授权自己的文档访问范围。</div></div><div class="feishu-app-credential"><span class="step-label">平台级配置</span><h4>应用凭证</h4><div class="field"><label>数据源名称</label><input class="input" value="飞书文档连接器"></div><div class="field"><label>App ID</label><input class="input" placeholder="cli_xxxxxxxxxxxxxxxx"></div><div class="field"><label>App Secret</label><input class="input" type="password" placeholder="请输入 App Secret"></div><div class="field"><label>OAuth 回调地址</label><div class="copy-field"><code>https://knora.example.com/oauth/feishu/callback</code><button class="btn" type="button" data-toast="回调地址已复制（蓝图示意）">复制</button></div></div><div class="credential-result"><i>✓</i><span><b>创建后即可在任意空间同步</b><small>用户访问令牌与 App Secret 分开管理。</small></span></div></div></div>';
  }
  function dataSourceForm(type) {
    var common =
      '<div class="field"><label>数据源名称</label><input class="input" value="' +
      type +
      ' 数据源" placeholder="请输入便于识别的名称"></div>';
    if (type === "飞书文档") return feishuAppSetupHtml();
    if (type === "XML")
      return '<div class="xml-roadmap-panel"><span class="source-logo xml"><i>&lt;/&gt;</i><b>XML</b></span><div><b>半结构化数据接入</b><p>规划支持上传或定时拉取 XML 文件，自动解析节点层级、属性与命名空间，并映射为可治理的数据资源。</p><span>11 月规划能力 · 当前仅展示入口，不开放配置交互</span></div></div>';
    if (type === "MySQL" || type === "Oracle")
      return (
        common +
        '<div class="form-grid"><div class="field"><label>主机地址</label><input class="input" placeholder="192.168.1.100"></div><div class="field"><label>端口</label><input class="input" value="' +
        (type === "MySQL" ? "3306" : "1521") +
        '"></div><div class="field"><label>' +
        (type === "MySQL" ? "数据库" : "Service Name") +
        '</label><input class="input" placeholder="业务库名称"></div><div class="field"><label>账号</label><input class="input" placeholder="只读账号"></div></div><div class="field"><label>密码</label><input class="input" type="password" value="password"></div>'
      );
    if (type === "API")
      return (
        common +
        '<div class="field"><label>Base URL</label><input class="input" placeholder="https://api.example.com/v1"></div><div class="form-grid"><div class="field"><label>认证方式</label><select class="input"><option>Bearer Token</option><option>API Key</option><option>OAuth 2.0</option></select></div><div class="field"><label>同步周期</label><select class="input"><option>每小时</option><option>每日</option><option>手动</option></select></div></div>'
      );
    return (
      common +
      '<div class="field"><label>Bootstrap Servers</label><input class="input" placeholder="kafka01:9092,kafka02:9092"></div><div class="form-grid"><div class="field"><label>Topic</label><input class="input" placeholder="customer-events"></div><div class="field"><label>安全协议</label><select class="input"><option>SASL_SSL</option><option>SASL_PLAINTEXT</option><option>PLAINTEXT</option></select></div></div>'
    );
  }
  function dataSourceLogo(type) {
    var label = {
        MySQL: "MySQL",
        Oracle: "ORACLE",
        API: "API",
        Kafka: "Kafka",
        飞书文档: "飞书文档",
        XML: "XML",
      }[type],
      symbol = {
        MySQL: "◒",
        Oracle: "O",
        API: "API",
        Kafka: "●",
        飞书文档: "飞",
        XML: "</>",
      }[type];
    return (
      '<span class="source-logo ' +
      type.toLowerCase().replace(/\s/g, "") +
      '"><i>' +
      symbol.replace("<", "&lt;").replace(">", "&gt;") +
      "</i><b>" +
      label +
      "</b></span>"
    );
  }
  function openDataSourceModal(focusType, roadmap) {
    var selected = focusType || "MySQL",
      types = [
        ["MySQL", "关系型数据库"],
        ["Oracle", "关系型数据库"],
        ["Kafka", "消息与流数据"],
        ["API", "网络 API"],
        ["飞书文档", "文件数据"],
        ["XML", "半结构化数据"],
      ];
    openModal(
      "添加数据源",
      "从企业数据库、流数据、接口或文件服务接入新的资源。",
      '<div class="data-source-market"><aside><b>数据源分类</b><button class="active">全部 <span>6</span></button><button>关系型数据库 <span>2</span></button><button>消息与接口 <span>2</span></button><button>文件与半结构化 <span>2</span></button></aside><section><div class="source-type-gallery">' +
        types
          .map(function (x) {
            return (
              '<button class="source-type-card ' +
              (x[0] === selected ? "active " : "") +
              (x[0] === "XML" ? "planned" : "") +
              '" ' +
              (x[0] === "XML"
                ? 'aria-disabled="true"'
                : 'data-source-type="' + x[0] + '"') +
              ' data-source-card="' +
              x[0] +
              '">' +
              dataSourceLogo(x[0]) +
              "<span><b>" +
              x[0] +
              "</b><small>" +
              x[1] +
              (x[0] === "XML" ? " · 11 月规划" : "") +
              "</small></span>" +
              (x[0] === "飞书文档" ? "<em>文件接入</em>" : "") +
              "</button>"
            );
          })
          .join("") +
        '</div><div class="data-source-config"><div class="data-source-form-head"><div><span>连接配置</span><h3 id="dataSourceFormTitle">' +
        selected +
        '</h3></div><button class="btn" id="testDataSource" ' +
        (selected === "XML" ? "disabled" : "") +
        ">" +
        (selected === "飞书文档" ? "校验应用凭证" : "测试连接") +
        '</button></div><div id="dataSourceForm">' +
        dataSourceForm(selected) +
        "</div></div></section></div>",
      "保存并创建",
      function () {
        toast(
          selected === "飞书文档"
            ? "飞书文档数据源已创建，用户现在可在空间中发起同步"
            : "数据源配置已保存，正在执行首次元数据采集",
        );
      },
      true,
    );
    if (selected === "XML")
      document.getElementById("modalConfirm").disabled = true;
    if (roadmap) {
      var note = document.createElement("section");
      note.className = "roadmap-context-note datasource-roadmap-note";
      note.innerHTML =
        '<span class="roadmap-month">' +
        (selected === "XML" ? "11 月上线" : "功能示意") +
        "</span><div><b>" +
        (selected === "XML" ? "半结构化数据接入" : "飞书文档接入与管理") +
        "</b><p>" +
        (selected === "XML"
          ? "当前展示 XML 数据源入口，具体解析、同步与映射机制在详细方案中设计。"
          : "当前原型展示平台应用创建与用户授权同步主流程，权限范围和同步策略将在详细方案中确认。") +
        "</p></div>";
      document.querySelector(".data-source-market").before(note);
    }
    document.querySelectorAll("[data-source-type]").forEach(function (b) {
      b.onclick = function () {
        selected = b.dataset.sourceType;
        document.querySelectorAll("[data-source-card]").forEach(function (x) {
          x.classList.toggle("active", x === b);
        });
        document.getElementById("dataSourceFormTitle").textContent = selected;
        document.getElementById("dataSourceForm").innerHTML =
          dataSourceForm(selected);
        var test = document.getElementById("testDataSource");
        test.disabled = false;
        test.textContent =
          selected === "飞书文档" ? "校验应用凭证" : "测试连接";
        document.getElementById("modalConfirm").disabled = false;
      };
    });
    document.getElementById("testDataSource").onclick = function () {
      this.textContent = "✓ 校验成功";
      this.classList.add("success");
      toast(
        selected === "飞书文档"
          ? "应用凭证校验成功，可创建飞书数据源"
          : "连接测试成功，可保存并开始元数据采集",
      );
    };
  }
  function openFeishuSyncModal(spaceName) {
    var authorized = false,
      space = spaceName || "当前空间";
    openModal(
      "同步飞书文档",
      "目标位置：" + space + " · 每个用户仅能同步自己有权限访问的内容。",
      '<div class="feishu-sync-flow"><div class="feishu-sync-steps"><span class="active"><i>1</i>用户授权</span><em>→</em><span><i>2</i>选择文档</span><em>→</em><span><i>3</i>同步到空间</span></div><section class="feishu-oauth-card" id="feishuOauthCard"><i class="feishu-mark large">飞</i><div><b>使用飞书账号授权 Knora</b><p>授权后 Knora 获得当前用户的短期访问令牌，仅拉取该用户可访问的云文档与知识库目录；不会获得编辑权限。</p><div class="oauth-scopes"><span>读取云文档</span><span>读取云空间</span><span>读取知识库目录</span><span>离线增量同步</span></div></div><button class="btn primary" id="authorizeFeishuUser">授权 access token</button></section><section class="feishu-picker" id="feishuPicker"><div class="feishu-picker-head"><span><b>已授权：陈宇</b><small>访问令牌已安全保存 · 可随时撤销</small></span><button class="btn" id="revokeFeishu">撤销授权</button></div><div class="feishu-picker-layout"><aside><b>我的飞书资源</b><button class="active">我的空间</button><button>我参与的知识库</button><button>与我共享</button></aside><div class="feishu-tree-picker"><label><input type="checkbox" checked><i>库</i><span><b>客户经营知识库</b><small>知识库 · 保留目录结构</small></span></label><div class="feishu-tree-children"><label><input type="checkbox" checked><i>夹</i><span><b>月度经营分析</b><small>文件夹 · 12 项内容</small></span></label><label><input type="checkbox"><i>文</i><span><b>2026 年重点客户经营分析报告</b><small>飞书文档 · 今天更新</small></span></label></div><label><input type="checkbox"><i>库</i><span><b>渠道运营知识库</b><small>知识库 · 28 项内容</small></span></label><label><input type="checkbox"><i>文</i><span><b>客户风险处置协同记录</b><small>飞书多维表格 · 仅同步为只读文档快照</small></span></label></div></div><div class="feishu-sync-options"><label><input type="checkbox" checked> 保留飞书知识库与文件夹目录结构</label><label><input type="checkbox" checked> 每 30 分钟增量同步</label><label><input type="checkbox" checked> 源文档无权限后自动停止展示</label></div></section></div>',
      "开始同步",
      function () {
        if (!authorized) {
          toast("请先完成飞书用户授权");
          return;
        }
        if (
          !resourceCatalog.doc.some(function (x) {
            return x.id === "doc-feishu-sync-demo";
          })
        )
          resourceCatalog.doc.unshift({
            id: "doc-feishu-sync-demo",
            name: "客户经营知识库（飞书同步）",
            format: "飞书",
            parse: "已解析",
            approval: "已同步",
            permission: "只读",
            owner: "陈宇",
            updated: "刚刚",
            size: "12 项",
            source: "飞书知识库",
            scope: space === "个人空间" ? "personal" : "public",
            feishu: true,
            feishuPath: "客户经营知识库 / 月度经营分析",
          });
        document.querySelectorAll("[data-asset]").forEach(function (x) {
          x.classList.toggle("active", x.dataset.asset === "doc");
        });
        renderAssets("doc");
        toast("已开始同步飞书知识库，目录结构将保留在文档资源中");
      },
      true,
    );
    var confirm = document.getElementById("modalConfirm");
    confirm.disabled = true;
    document.getElementById("authorizeFeishuUser").onclick = function () {
      authorized = true;
      document.getElementById("feishuOauthCard").classList.add("authorized");
      document.getElementById("feishuPicker").classList.add("show");
      document
        .querySelectorAll(".feishu-sync-steps span")
        .forEach(function (x) {
          x.classList.add("active");
        });
      confirm.disabled = false;
      toast("飞书用户授权成功，access token 已安全保存");
    };
    document.getElementById("revokeFeishu").onclick = function () {
      authorized = false;
      document.getElementById("feishuOauthCard").classList.remove("authorized");
      document.getElementById("feishuPicker").classList.remove("show");
      confirm.disabled = true;
      toast("已撤销本次飞书授权");
    };
  }
  function openParseModal(x) {
    openModal(
      "解析文档",
      x.name + " · 参考文档管理 V9 解析能力",
      '<div class="parse-pipeline"><span class="done"><i>1</i><b>版面识别</b><small>识别标题、段落与表格</small></span><em>→</em><span class="done"><i>2</i><b>内容抽取</b><small>OCR 与文本结构化</small></span><em>→</em><span><i>3</i><b>智能切片</b><small>按语义生成知识块</small></span><em>→</em><span><i>4</i><b>向量索引</b><small>写入全域知识索引</small></span></div><div class="field"><label>解析策略</label><select class="input"><option>智能识别（推荐）</option><option>按标题层级切片</option><option>按固定长度切片</option></select></div>',
      "开始解析",
      function () {
        toast("已提交文档解析任务");
      },
      true,
    );
  }
  function documentPlanningSections() {
    return '<div class="document-planning-hub"><div class="document-planning-title"><span>规划能力</span><b>文档生命周期治理</b><small>版本、状态与质量校验逐步上线</small></div><section class="document-plan-card" data-document-plan="version"><header><i>版</i><span><b>版本管理</b><small>保留变更记录，可对比与回退</small></span><em>11 月</em></header><div class="document-version-list"><button data-document-plan-action="查看 v3.2"><b>v3.2</b><span>当前版本 · 张敏</span><small>今天 16:50</small></button><button data-document-plan-action="查看 v3.1"><b>v3.1</b><span>调整风险处置时限</span><small>9 月 12 日</small></button><button data-document-plan-action="查看 v3.0"><b>v3.0</b><span>首次正式发布</span><small>9 月 1 日</small></button></div><button class="document-plan-link" data-document-plan-action="版本对比">版本对比与回退 →</button></section><section class="document-plan-card" data-document-plan="status"><header><i>态</i><span><b>文档状态</b><small>草稿、审批、发布与归档全流程</small></span><em>12 月</em></header><div class="document-status-flow"><span class="done">草稿</span><i>→</i><span class="done">审核通过</span><i>→</i><span class="current">已发布</span><i>→</i><span>归档</span></div><div class="document-status-meta"><span><small>当前状态</small><b>已发布</b></span><span><small>状态责任人</small><b>张敏</b></span></div><button class="document-plan-link" data-document-plan-action="状态流转记录">查看状态流转记录 →</button></section><section class="document-plan-card" data-document-plan="validation"><header><i>检</i><span><b>文档校验</b><small>发布前检查内容、格式与元数据</small></span><em>12 月</em></header><div class="document-validation-score"><strong>92</strong><span><b>校验通过</b><small>最近校验：今天 16:48</small></span></div><div class="document-validation-items"><span class="pass">✓ 必填元数据完整</span><span class="pass">✓ 文档格式可解析</span><span class="warn">! 2 处业务术语待确认</span><span class="pass">✓ 未发现敏感内容</span></div><button class="document-plan-link" data-document-plan-action="重新执行文档校验">重新校验 →</button></section></div>';
  }
  function documentDetailPage() {
    var id = new URLSearchParams(location.search).get("doc") || "doc-risk",
      x =
        (resourceCatalog.doc || []).find(function (d) {
          return d.id === id;
        }) || resourceCatalog.doc[0],
      edit =
        new URLSearchParams(location.search).get("mode") === "edit" &&
        !x.feishu;
    return (
      '<section class="document-detail-page" data-document-id="' +
      x.id +
      '"><header class="document-detail-head"><div><a href="portal-resources.html">‹ 返回资源管理</a><span>文档详情 / ' +
      x.source +
      '</span><h1 id="documentDetailTitle">' +
      x.name +
      (x.feishu
        ? '<em class="feishu-source-tag title-tag">飞书同步 · 只读</em>'
        : "") +
      '</h1></div><div><span class="permission-badge ' +
      (x.feishu ? "readonly" : "") +
      '">' +
      x.permission +
      '权限</span><button class="btn" id="documentDownload">下载原文</button><button class="btn" id="documentParse">重新解析</button><button class="btn primary" id="documentEdit" ' +
      (x.feishu ? "disabled" : "") +
      ">" +
      (x.feishu ? "源文档不可编辑" : edit ? "保存编辑" : "编辑文档") +
      "</button></div></header>" +
      (x.feishu
        ? '<div class="feishu-readonly-banner"><i class="feishu-mark">飞</i><span><b>来自飞书的只读同步文档</b>目录位置：' +
          x.feishuPath +
          '。权限以飞书源文档为准，在 Knora 中不可编辑、共享或再次授权。</span><button class="btn" data-toast="打开飞书源文档（蓝图示意）">打开飞书原文</button></div>'
        : "") +
      '<div class="document-detail-meta"><span><small>解析状态</small><b>' +
      x.parse +
      "</b></span><span><small>发布状态</small><b>" +
      x.approval +
      "</b></span><span><small>更新人</small><b>" +
      x.owner +
      "</b></span><span><small>更新时间</small><b>" +
      x.updated +
      "</b></span><span><small>文件大小</small><b>" +
      x.size +
      '</b></span></div><div class="document-preview-layout"><aside class="document-pages"><b>页面</b>' +
      [1, 2, 3, 4]
        .map(function (n) {
          return (
            '<button class="' +
            (n === 1 ? "active" : "") +
            '"><span>' +
            n +
            "</span><i>第 " +
            n +
            " 页</i></button>"
          );
        })
        .join("") +
      '</aside><main class="document-canvas"><article class="document-paper ' +
      (edit ? "editing" : "") +
      '"><div class="paper-brand">' +
      (x.feishu ? "飞书知识库同步内容" : "赛豆企业空间 · 管理制度") +
      '</div><h2 contenteditable="' +
      edit +
      '">' +
      (x.feishu ? x.name.replace(/\.pdf$/, "") : "客户风险分级与处置管理办法") +
      '</h2><p class="paper-no">' +
      (x.feishu ? "源路径：" + x.feishuPath : "制度编号：KNORA-CRM-2026-018") +
      '</p><h3>一、适用范围</h3><p contenteditable="' +
      edit +
      '">本办法适用于重点客户经营风险的识别、分级、跟进和闭环处置，统一风险等级、责任分工和升级路径。</p><h3>二、风险分级</h3><table><thead><tr><th>风险等级</th><th>识别条件</th><th>处置要求</th></tr></thead><tbody><tr><td>高风险</td><td>重大逾期、履约异常或经营恶化</td><td>24 小时内升级并生成专项任务</td></tr><tr><td>中风险</td><td>连续预警或关键指标显著波动</td><td>3 个工作日内完成复核</td></tr><tr><td>低风险</td><td>单项轻度异常</td><td>纳入常规跟踪</td></tr></tbody></table><h3>三、闭环要求</h3><p contenteditable="' +
      edit +
      '">处置过程需记录责任人、计划时间、执行结果和证据材料，并在本体中回写风险事件与经营动作的关联关系。</p></article></main><aside class="document-inspector"><div class="document-inspector-tabs"><button class="active">解析结果</button><button>文档信息</button></div><section><b>解析摘要</b><p>已识别 4 页、12 个段落、1 张表格，生成 18 个语义知识块。</p></section><section><b>知识块示例</b><article><span>#01</span><p>高风险客户须在 24 小时内完成升级并生成专项处置任务。</p></article><article><span>#02</span><p>处置过程需记录责任人、计划时间、执行结果和证据材料。</p></article></section><section><b>可见与使用</b><p>' +
      (x.feishu
        ? "继承飞书源文档访问权限；Knora 仅用于检索、问答和只读预览。"
        : "当前空间成员可浏览；已授权客户洞察项目使用。") +
      "</p>" +
      (x.feishu
        ? '<button class="btn" data-toast="正在从飞书检查最新版本（蓝图示意）">立即同步</button>'
        : '<button class="btn" id="documentShare">共享至空间</button><button class="btn" id="documentAuthorize">授权到人 / 项目</button>') +
      "</section>" +
      documentPlanningSections() +
      "</aside></div></section>"
    );
  }
  var portalProjects = [
    [
      "赛豆企业空间",
      "admin",
      "企业知识治理项目",
      "建立企业级知识治理规范与跨域知识资产目录",
      "36",
      "128",
      "386",
      "18",
      "今天 10:24",
    ],
    [
      "赛豆企业空间",
      "member",
      "数据资产盘点项目",
      "统一盘点企业数据资产及责任归属",
      "18",
      "42",
      "96",
      "31",
      "昨天 16:40",
    ],
    [
      "市场营销域",
      "admin",
      "客户洞察项目",
      "融合客户行为、价值分层与风险信号",
      "24",
      "86",
      "214",
      "12",
      "今天 09:18",
    ],
    [
      "市场营销域",
      "member",
      "精准营销项目",
      "沉淀活动策略、客群规则与转化分析知识",
      "16",
      "38",
      "128",
      "9",
      "9 月 17 日",
    ],
    [
      "客户运营部",
      "admin",
      "客户流失预警项目",
      "构建客户流失识别与分层处置机制",
      "12",
      "41",
      "87",
      "7",
      "9 月 16 日",
    ],
    [
      "客户运营部",
      "member",
      "华东客户经营提升",
      "整合区域客户运营经验与复盘资料",
      "10",
      "23",
      "64",
      "5",
      "9 月 15 日",
    ],
    [
      "渠道管理部",
      "member",
      "渠道经营分析项目",
      "建立渠道经营指标与政策知识库",
      "14",
      "31",
      "102",
      "8",
      "9 月 14 日",
    ],
    [
      "生产制造域",
      "admin",
      "设备预测性维护",
      "融合设备知识、故障案例和预测模型",
      "22",
      "97",
      "178",
      "16",
      "9 月 17 日",
    ],
    [
      "财务与风控域",
      "admin",
      "经营风险监测",
      "汇聚经营风险指标、规则与处置预案",
      "15",
      "54",
      "113",
      "11",
      "9 月 13 日",
    ],
    [
      "创新业务空间",
      "admin",
      "AI 知识助手试点",
      "验证企业知识问答与智能体协作场景",
      "9",
      "29",
      "76",
      "6",
      "今天 11:06",
    ],
  ];
  function projectRowHtml(x) {
    return (
      '<article class="portal-project-row" data-space="' +
      x[0] +
      '" data-role="' +
      x[1] +
      '" data-name="' +
      x[2] +
      '" data-desc="' +
      x[3] +
      '" data-members="' +
      x[4] +
      '" data-ontology="' +
      x[5] +
      '" data-docs="' +
      x[6] +
      '" data-sources="' +
      x[7] +
      '" data-updated="' +
      x[8] +
      '"><div class="portal-project-name"><span class="type-icon purple">项</span><div><b>' +
      x[2] +
      "</b><small>" +
      x[3] +
      '</small></div></div><span class="project-role-badge ' +
      (x[1] === "member" ? "member" : "") +
      '">' +
      (x[1] === "admin" ? "项目管理员" : "普通成员") +
      "</span><span>" +
      x[4] +
      " 人</span><span>" +
      x[5] +
      " 本体 · " +
      x[6] +
      " 文档</span><span>" +
      x[8] +
      "</span></article>"
    );
  }
  function legacyProjectsPage() {
    return (
      pageHead(
        "项目",
        "从空间组织选择工作范围，在右侧查看与管理当前空间项目",
        '<button class="btn primary" id="createProjectBtn">' +
          icon("plus") +
          "新建项目</button>",
      ) +
      '<section class="project-directory-layout"><aside class="project-directory-panel"><div class="tree-head"><span><b>空间组织</b><small>项目按所属空间归集</small></span><span class="org-legend"><i class="sync"></i>同步<i class="local"></i>自建</span></div><div class="searchbox tree-search">' +
      icon("search") +
      '<input id="projectSpaceSearch" placeholder="搜索空间名称"></div><div id="projectSpaceTree" class="project-space-tree"><div class="org-tree-node"><div class="tree-row project-space-row active" data-project-space="赛豆企业空间"><span class="tree-caret">⌄</span><i>企</i><span class="org-name">赛豆企业空间</span><span class="project-space-count">2</span></div><div class="org-children"><div class="org-tree-node"><div class="tree-row project-space-row" data-project-space="市场营销域"><span class="tree-caret">⌄</span><i>市</i><span class="org-name">市场营销域</span><span class="project-space-count">2</span></div><div class="org-children"><div class="tree-row project-space-row" data-project-space="客户运营部"><span></span><i>客</i><span class="org-name">客户运营部</span><span class="project-space-count">2</span></div><div class="tree-row project-space-row" data-project-space="渠道管理部"><span></span><i>渠</i><span class="org-name">渠道管理部</span><span class="project-space-count">1</span></div></div></div><div class="tree-row project-space-row" data-project-space="生产制造域"><span></span><i>产</i><span class="org-name">生产制造域</span><span class="project-space-count">1</span></div><div class="tree-row project-space-row" data-project-space="财务与风控域"><span></span><i>财</i><span class="org-name">财务与风控域</span><span class="project-space-count">1</span></div><div class="tree-row project-space-row" data-project-space="创新业务空间"><span></span><i>创</i><span class="org-name">创新业务空间</span><span class="tree-tag local">自建</span><span class="project-space-count">1</span></div></div></div></div></aside><section class="project-list-panel-blueprint"><div class="project-list-head-blueprint"><div><h2 id="projectSpaceTitle">赛豆企业空间</h2><p id="projectSpaceSummary">当前空间共 2 个项目，点击项目查看详情与配置</p></div><button class="btn primary" id="createProjectHere">' +
      icon("plus") +
      '在此空间新建项目</button></div><div class="project-list-toolbar-blueprint"><div class="project-role-switch"><button class="active" data-project-filter="all">全部</button><button data-project-filter="admin">我管理的</button><button data-project-filter="member">我参与的</button></div><div class="searchbox"><input id="projectSearch" placeholder="搜索项目名称或描述">' +
      icon("search") +
      '</div></div><div class="portal-project-columns"><span>项目</span><span>我的角色</span><span>成员</span><span>资源成果</span><span>最近更新</span></div><div id="projectGrid" class="portal-project-list">' +
      portalProjects.map(projectRowHtml).join("") +
      '<div class="project-empty" id="projectEmpty">当前空间下暂无符合条件的项目</div></div></section></section>'
    );
  }
  function projectSpaceRow(name, mark, count, active, children, local) {
    return (
      '<div class="org-tree-node"><div class="tree-row project-space-row ' +
      (active ? "active" : "") +
      '" data-project-space="' +
      name +
      '">' +
      (children ? '<span class="tree-caret">⌄</span>' : "<span></span>") +
      "<i>" +
      mark +
      '</i><span class="org-name">' +
      name +
      "</span>" +
      (local ? '<span class="tree-tag local">自建</span>' : "") +
      '<span class="project-space-count">' +
      count +
      '</span><button class="project-node-create" data-create-project-space="' +
      name +
      '" title="在此空间创建项目">+</button></div>' +
      (children ? '<div class="org-children">' + children + "</div>" : "") +
      "</div>"
    );
  }
  function projectDrawerHtml() {
    return (
      '<div class="blueprint-project-drawer-mask" id="projectDrawerMask"></div><aside class="blueprint-project-drawer" id="projectDetailDrawer" aria-hidden="true"><header class="blueprint-project-drawer-head"><div class="project-drawer-title"><span class="type-icon purple">项</span><span><small id="projectDrawerSpace">赛豆企业空间</small><h2 id="projectDrawerName">企业知识治理项目</h2><p id="projectDrawerDesc">建立企业级知识治理规范与跨域知识资产目录</p></span></div><div class="project-drawer-head-actions"><span class="project-role-badge" id="projectDrawerRole">项目管理员</span><button class="btn" id="projectEdit">编辑基本信息</button><button class="drawer-close" id="projectDrawerClose" aria-label="关闭">×</button></div></header><nav class="blueprint-project-tabs"><button class="active" data-project-drawer-tab="overview">项目概览</button><button data-project-drawer-tab="members">成员与角色</button><button data-project-drawer-tab="permissions">权限配置</button></nav><div class="project-drawer-roadmap" id="projectDrawerRoadmap"></div><div class="blueprint-project-drawer-body"><section class="project-drawer-view active" data-project-drawer-view="overview"><div class="project-summary-grid five"><div class="project-summary-card"><strong id="projectMemberCount">36</strong><span>项目成员</span></div><div class="project-summary-card"><strong id="projectOntologyCount">128</strong><span>本体成果</span></div><div class="project-summary-card"><strong id="projectKbCount">12</strong><span>知识库</span></div><div class="project-summary-card"><strong id="projectDocumentCount">386</strong><span>文档资源</span></div><div class="project-summary-card"><strong id="projectSourceCount">18</strong><span>数据资源</span></div></div><div class="project-overview-grid"><article class="project-profile-card"><header><b>基本信息</b><span id="projectDrawerUpdated">今天 10:24</span></header><dl><div><dt>所属空间</dt><dd id="projectProfileSpace">赛豆企业空间</dd></div><div><dt>项目编码</dt><dd>PRJ-KN-2026-018</dd></div><div><dt>负责人</dt><dd>陈宇·数字化中心</dd></div><div><dt>创建时间</dt><dd>2026-08-20</dd></div></dl><a class="btn primary" id="projectWorkbenchLink" href="ontology-workbench.html">进入本体与知识库工作台</a></article><article class="project-resource-card"><header><b>资源使用情况</b><small>项目已授权及自建资源</small></header><div class="project-resource-usage"><span><i class="ontology">本</i><b>本体与知识库</b><em>128 / 12</em><small style="--usage:74%"></small></span><span><i class="doc">文</i><b>文档</b><em>386 项</em><small style="--usage:62%"></small></span><span><i class="data">数</i><b>数据表</b><em>18 项</em><small style="--usage:45%"></small></span><span><i class="action">A</i><b>Action 与规则</b><em>26 项</em><small style="--usage:36%"></small></span></div></article></div><section class="project-resource-list"><header><div><b>最近使用的项目资源</b><small>统一查看资源来源、授权方式与使用状态</small></div><button class="btn" data-toast="进入项目资源清单（蓝图示意）">查看全部</button></header><div class="project-resource-row"><i class="ontology">本</i><span><b>客户经营本体</b><small>项目自建 · 客户洞察项目</small></span><em>可编辑</em><small>今天 09:18</small></div><div class="project-resource-row"><i class="doc">文</i><span><b>客户风险分级与处置管理办法</b><small>空间授权 · 客户运营部</small></span><em>可使用</em><small>昨天 16:40</small></div><div class="project-resource-row"><i class="data">表</i><span><b>dwd_customer_profile</b><small>数据资源授权 · CRM_PROD</small></span><em>可查询</em><small>9 月 18 日</small></div></section></section><section class="project-drawer-view" data-project-drawer-view="members"><div class="project-member-state" id="projectMemberState"><i>管</i><span><b>当前为项目管理员视图</b><small>可添加成员、移除成员或修改项目角色；项目管理员不得少于 1 人。</small></span></div><div class="project-member-toolbar"><div class="searchbox">' +
      icon("search") +
      '<input id="projectMemberSearch" placeholder="搜索姓名、部门或角色"></div><button class="btn primary" id="addProjectMember">' +
      icon("plus") +
      '添加成员</button></div><div class="table-wrap"><table class="table project-member-table" id="projectMemberTable"><thead><tr><th>成员</th><th>部门</th><th>项目角色</th><th>资源使用</th><th>加入时间</th><th>操作</th></tr></thead><tbody><tr><td><div class="member-name"><i>陈</i><span><b>陈宇</b><small>chenyu@knora.com</small></span></div></td><td>数字化中心</td><td><span class="role-chip admin">项目管理员</span></td><td>42 项</td><td>2026-08-20</td><td><button class="link-btn project-member-role">修改角色</button></td></tr><tr><td><div class="member-name"><i>张</i><span><b>张敏</b><small>zhangmin@knora.com</small></span></div></td><td>客户运营部</td><td><span class="role-chip">普通成员</span></td><td>18 项</td><td>2026-08-22</td><td><button class="link-btn project-member-role">修改角色</button><button class="link-btn danger project-member-delete">移除</button></td></tr><tr><td><div class="member-name"><i>王</i><span><b>王晨</b><small>wangchen@knora.com</small></span></div></td><td>渠道管理部</td><td><span class="role-chip">普通成员</span></td><td>11 项</td><td>2026-08-25</td><td><button class="link-btn project-member-role">修改角色</button><button class="link-btn danger project-member-delete">移除</button></td></tr></tbody></table></div></section><section class="project-drawer-view" data-project-drawer-view="permissions"><div class="project-permission-intro"><div><b>项目权限机制</b><p>项目权限受所属空间上限约束；项目管理员可在不超出空间授权范围的前提下进一步缩小成员权限。</p></div><span>11 月规划上线</span></div><div class="project-permission-mode"><button class="active" data-project-permission-mode="independent"><i>独</i><span><b>项目独立权限</b><small>仅项目成员可使用项目资源，按角色细化限制。</small></span></button><button data-project-permission-mode="inherit"><i>继</i><span><b>继承所属空间</b><small>空间成员默认可见，项目仍可限制编辑与下载。</small></span></button></div><section class="project-permission-section"><header><div><b>角色 × 资源类型权限</b><small>用于限制不同项目角色对各类资源的操作上限</small></div><button class="btn" id="saveProjectPermissions">保存配置</button></header><div class="table-wrap"><table class="table project-permission-matrix"><thead><tr><th>项目角色</th><th>文档</th><th>知识库</th><th>本体</th><th>数据表</th><th>Action</th></tr></thead><tbody><tr><td><span class="role-chip admin">项目管理员</span></td>' +
      ["管理", "管理", "编辑", "查询", "配置"]
        .map(function (x) {
          return (
            "<td><select><option>" +
            x +
            "</option><option>可使用</option><option>只读</option><option>不可见</option></select></td>"
          );
        })
        .join("") +
      '</tr><tr><td><span class="role-chip">普通成员</span></td>' +
      ["可使用", "可使用", "只读", "查询", "执行"]
        .map(function (x) {
          return (
            "<td><select><option>" +
            x +
            "</option><option>只读</option><option>申请后可用</option><option>不可见</option></select></td>"
          );
        })
        .join("") +
      '</tr></tbody></table></div><div class="project-policy-switches"><label><button class="switch on"></button><span><b>允许成员申请空间资源</b><small>申请将交由资源所属空间审批</small></span></label><label><button class="switch"></button><span><b>允许下载可使用文档</b><small>敏感资源仍以单项授权为准</small></span></label><label><button class="switch"></button><span><b>允许将项目资源再授权</b><small>建议仅对项目管理员开放</small></span></label></div></section><section class="project-permission-section"><header><div><b>项目资源授权与使用</b><small>按授权来源跟踪使用范围与到期时间</small></div></header><div class="project-grant-stats"><span><b>184</b><small>已授权资源</small></span><span><b>26</b><small>项目自建</small></span><span><b>7</b><small>30 日内到期</small></span><span><b>3</b><small>待续期</small></span></div><div class="project-grant-row"><span><b>客户运营部</b><small>空间批量授权</small></span><em>92 项资源</em><i>长期有效</i></div><div class="project-grant-row"><span><b>CRM 生产数据源</b><small>数据表专项授权</small></span><em>18 张表</em><i class="warn">2026-10-31 到期</i></div></section></section></div></aside>'
    );
  }
  function projectsPage() {
    var marketingChildren =
        projectSpaceRow("客户运营部", "客", "2", false, "", false) +
        projectSpaceRow("渠道管理部", "渠", "1", false, "", false),
      rootChildren =
        projectSpaceRow(
          "市场营销域",
          "市",
          "2",
          false,
          marketingChildren,
          false,
        ) +
        projectSpaceRow("生产制造域", "产", "1", false, "", false) +
        projectSpaceRow("财务与风控域", "财", "1", false, "", false) +
        projectSpaceRow("创新业务空间", "创", "1", false, "", true);
    return (
      pageHead(
        "项目管理",
        "以空间为管理边界，统一组织项目成员、知识资源与使用权限",
        '<button class="btn primary" id="createProjectBtn">' +
          icon("plus") +
          "新建项目</button>",
      ) +
      '<div id="projectRoadmapNote"></div><section class="project-directory-layout project-v15-layout"><aside class="project-directory-panel"><div class="tree-head"><span><b>空间组织</b><small>悬停节点可直接创建项目</small></span><span class="org-legend"><i class="sync"></i>同步<i class="local"></i>自建</span></div><div class="searchbox tree-search">' +
      icon("search") +
      '<input id="projectSpaceSearch" placeholder="搜索空间名称"></div><div id="projectSpaceTree" class="project-space-tree">' +
      projectSpaceRow("赛豆企业空间", "企", "2", true, rootChildren, false) +
      '</div><div class="project-space-help"><b>项目创建规则</b><p>只有空间管理员可在当前节点创建项目，项目权限不得超过所属空间上限。</p></div></aside><section class="project-list-panel-blueprint"><div class="project-list-head-blueprint"><div><span class="project-space-path">空间 / <b id="projectSpaceTitle">赛豆企业空间</b></span><h2>项目列表</h2><p id="projectSpaceSummary">当前空间共 2 个项目，点击项目从右侧查看与配置</p></div><button class="btn primary" id="createProjectHere">' +
      icon("plus") +
      '在此空间新建项目</button></div><div class="project-list-toolbar-blueprint"><div class="project-role-switch"><button class="active" data-project-filter="all">全部</button><button data-project-filter="admin">我管理的</button><button data-project-filter="member">我参与的</button></div><div class="searchbox"><input id="projectSearch" placeholder="搜索项目名称或描述">' +
      icon("search") +
      '</div></div><div class="portal-project-columns"><span>项目</span><span>我的角色</span><span>成员</span><span>资源成果</span><span>最近更新</span></div><div id="projectGrid" class="portal-project-list">' +
      portalProjects.map(projectRowHtml).join("") +
      '<div class="project-empty" id="projectEmpty">当前空间下暂无符合条件的项目</div></div></section></section>' +
      projectDrawerHtml()
    );
  }
  function tagsPage() {
    var tags = [
      ["客户运营", "32", "业务主题"],
      ["渠道管理", "18", "业务主题"],
      ["风险管理", "27", "业务主题"],
      ["经营分析", "21", "分析主题"],
      ["产品质量", "15", "业务主题"],
      ["制度规范", "46", "内容类型"],
      ["运营周报", "12", "内容类型"],
      ["重点客户", "38", "对象分类"],
      ["智能营销", "17", "业务主题"],
      ["供应链", "23", "业务主题"],
      ["知识治理", "11", "治理主题"],
      ["数据标准", "29", "治理主题"],
    ];
    return (
      pageHead(
        "标签",
        "建设跨空间、跨资源类型的统一标签体系与治理权限",
        '<button class="btn" data-toast="进入标签体系导入流程">导入标签</button><button class="btn primary" id="createTagBtn">' +
          icon("plus") +
          "新建标签</button>",
      ) +
      blueprintNote() +
      '<section class="tag-system-panel" id="tagSystemPanel"><header><div><span class="tag-kicker">ENTERPRISE TAXONOMY</span><h2>企业统一标签体系</h2><p>统一定义标签空间、标签集、标签值和跨空间映射，逐步对接文档、本体、数据表等资源。</p></div><span class="tag-version">体系版本 v2.0</span></header><div class="tag-system-metrics"><span><b>6</b><small>标签空间</small></span><span><b>28</b><small>标签集</small></span><span><b>312</b><small>标准标签</small></span><span><b>8</b><small>接入资源类型</small></span></div><div class="tag-taxonomy-flow"><article><i>1</i><span><b>标签空间</b><small>客户经营、供应链、质量等业务域</small></span></article><em>→</em><article><i>2</i><span><b>标签集</b><small>价值分层、生命周期、风险等级</small></span></article><em>→</em><article><i>3</i><span><b>标准标签</b><small>统一编码、别名、颜色与适用资源</small></span></article><em>→</em><article><i>4</i><span><b>资源打标</b><small>人工、规则与智能自动打标</small></span></article></div></section>' +
      '<section class="panel tag-space-panel"><div class="panel-head"><div><h3>标签空间</h3><p>标签可同时作用于文档、数据表、本体资源、知识库、流程和智能体</p></div><span class="top-spacer"></span><div class="searchbox" style="width:250px">' +
      icon("search") +
      '<input id="tagSearch" placeholder="搜索标签"></div></div><div class="tag-cloud" id="tagCloud">' +
      tags
        .map(function (x, i) {
          return (
            '<button class="tag-bubble" data-tag="' +
            x[0] +
            '"><span># ' +
            x[0] +
            "</span><em>" +
            x[1] +
            " 项 · " +
            x[2] +
            "</em>" +
            (i < 8 ? "" : status("q4", "待治理")) +
            "</button>"
          );
        })
        .join("") +
      "</div></section>" +
      '<div class="tag-bottom-grid"><section class="panel"><div class="panel-head"><div><h3>标签子集</h3><p>维护业务标签的分组、值域和上下级关系</p></div></div><div class="panel-body">' +
      [
        ["客户价值分层", "5 个标签"],
        ["客户生命周期", "7 个标签"],
        ["客户风险等级", "4 个标签"],
      ]
        .map(function (x) {
          return (
            '<div class="activity-row"><span class="activity-icon">#</span><span><b>' +
            x[0] +
            "</b><small>" +
            x[1] +
            '</small></span><button class="btn" style="height:27px">管理</button></div>'
          );
        })
        .join("") +
      "</div></section>" +
      '<section class="panel tag-permission-panel" id="tagPermissionPanel"><div class="panel-head"><div><h3>标签权限管理</h3><p>按角色控制标签定义、使用、审批和跨空间映射</p></div><span class="top-spacer"></span><button class="btn" id="editTagPermission">配置权限</button></div><div class="tag-permission-table"><header><span>角色</span><span>查看</span><span>使用</span><span>维护</span><span>审批</span><span>作用范围</span></header>' +
      [
        ["平台标签管理员", "✓", "✓", "✓", "✓", "全平台"],
        ["空间管理员", "✓", "✓", "✓", "✓", "所属空间"],
        ["项目管理员", "✓", "✓", "—", "—", "当前项目"],
        ["普通成员", "✓", "✓", "—", "—", "有权资源"],
      ]
        .map(function (x) {
          return (
            "<div>" +
            x
              .map(function (v, i) {
                return (
                  '<span class="' +
                  (v === "✓" ? "yes" : v === "—" ? "no" : "") +
                  '">' +
                  v +
                  "</span>"
                );
              })
              .join("") +
            "</div>"
          );
        })
        .join("") +
      "</div></section></div>"
    );
  }
  function shortcutsPage() {
    var cards = [
      ["最近访问", "跨模块展示最近打开的知识资产", "portal-mine.html", "时"],
      ["我的收藏", "收藏文档、数据表、本体与知识库", "portal-mine.html", "★"],
      ["审批待办", "处理资源共享和项目申请空间资源", "portal-mine.html", "审"],
      ["我的项目", "快速进入参与或管理的项目", "portal-projects.html", "项"],
      ["常用空间", "固定常用组织空间与资源目录", "portal-resources.html", "空"],
      ["我的标签", "使用个人与组织标签过滤资源", "portal-tags.html", "#"],
    ];
    return (
      pageHead("快捷访问", "将个人高频入口集中在一个页面，减少跨模块导航成本") +
      blueprintNote() +
      '<div class="shortcut-grid">' +
      cards
        .map(function (x, i) {
          return (
            '<a class="shortcut-card" href="' +
            x[2] +
            '"><i>' +
            x[3] +
            "</i><h3>" +
            x[0] +
            "</h3><p>" +
            x[1] +
            '</p><div style="margin-top:13px">' +
            status(i < 4 ? "current" : "q4", i < 4 ? "现有能力" : "预期 Q4") +
            "</div></a>"
          );
        })
        .join("") +
      "</div>"
    );
  }
  function ontologyOverview() {
    return '<section class="semantic-graph-page" id="enterpriseSemanticGraph"><nav class="semantic-view-switch"><div><button type="button">全局</button><button class="active" type="button">语义图谱</button></div><span>企业级语义图谱全局视角</span></nav><div class="semantic-toolbar"><select class="select" id="semanticGraphType"><option value="all">全部类型</option><option value="entity">实体</option><option value="relation">关系</option><option value="event">事实</option><option value="logic">规则与行为</option></select><div class="searchbox"><input id="semanticGraphSearch" placeholder="请输入搜索关键字">'+icon("search")+'</div><select class="select semantic-tag-filter" id="semanticGraphTag"><option value="all">请选择标签</option><option value="客户经营">客户经营</option><option value="供应链">供应链</option><option value="质量管理">质量管理</option><option value="风险管理">风险管理</option></select><span class="top-spacer"></span><div class="semantic-actions"><button type="button" data-semantic-action="布局">⌘<small>布局</small></button><button type="button" data-semantic-action="新增实体">◆<small>新增实体</small></button><button type="button" data-semantic-action="新增关系">⌘<small>新增关系</small></button><button type="button" data-semantic-action="新增事件">▥<small>新增事件</small></button><button class="primary" type="button" data-semantic-action="发布">↗<small>发布</small></button><a href="ontology-projects.html">项目索引</a></div></div><div class="semantic-canvas"><svg viewBox="0 0 1200 650" preserveAspectRatio="none"><path d="M130 220 L360 150 L610 280 L860 165"/><path d="M130 220 L350 360 L610 280 L845 420"/><path d="M360 150 L520 80"/><path d="M610 280 L680 505"/><path d="M350 360 L180 520"/><path d="M845 420 L1040 520"/></svg><article class="semantic-node n1" data-graph-name="客户" data-graph-type="entity" data-graph-tags="客户经营"><i>客</i><b>客户</b></article><article class="semantic-node n2" data-graph-name="产品目录" data-graph-type="entity" data-graph-tags="供应链"><i>产</i><b>产品目录</b></article><article class="semantic-node n3" data-graph-name="订单" data-graph-type="entity" data-graph-tags="客户经营 供应链"><i>单</i><b>订单</b></article><article class="semantic-node n4" data-graph-name="经营事件" data-graph-type="event" data-graph-tags="客户经营"><i>事</i><b>经营事件</b></article><article class="semantic-node n5" data-graph-name="生产工单" data-graph-type="entity" data-graph-tags="质量管理"><i>工</i><b>生产工单</b></article><article class="semantic-node n6" data-graph-name="库存" data-graph-type="entity" data-graph-tags="供应链"><i>库</i><b>库存</b></article><article class="semantic-node n7" data-graph-name="供应商" data-graph-type="entity" data-graph-tags="供应链 风险管理"><i>供</i><b>供应商</b></article><article class="semantic-node n8" data-graph-name="质量规则" data-graph-type="logic" data-graph-tags="质量管理"><i>规</i><b>质量规则</b></article><article class="semantic-node n9" data-graph-name="风险预警" data-graph-type="logic" data-graph-tags="风险管理"><i>警</i><b>风险预警</b></article><article class="semantic-node n10" data-graph-name="设备" data-graph-type="entity" data-graph-tags="质量管理"><i>设</i><b>设备</b></article><article class="semantic-node n11" data-graph-name="客户购买产品" data-graph-type="relation" data-graph-tags="客户经营"><i>关</i><b>客户购买产品</b></article><article class="semantic-node n12" data-graph-name="责任人" data-graph-type="relation" data-graph-tags="风险管理"><i>责</i><b>责任人</b></article><aside class="semantic-minimap"><span></span><i></i><b></b></aside><div class="semantic-canvas-tools"><button title="定位">⌖</button><button title="全屏">⛶</button><button title="放大">＋</button><input aria-label="缩放" type="range" min="30" max="100" value="72"><button title="缩小">−</button></div></div></section>';
  }
  function ontologyOverviewV3() {
    return '<section class="semantic-graph-page semantic-graph-v3" id="enterpriseSemanticGraph"><nav class="semantic-view-switch"><div><button type="button">全局</button><button class="active" type="button">语义图谱</button></div><span>企业级语义图谱全局视角</span></nav><div class="semantic-toolbar"><select class="select" id="semanticGraphType"><option value="all">全部类型</option><option value="entity">业务对象</option><option value="relation">业务关联</option></select><div class="searchbox"><input id="semanticGraphSearch" placeholder="请输入搜索关键字">'+icon("search")+'</div><select class="select semantic-tag-filter" id="semanticGraphTag"><option value="all">请选择标签</option><option value="客户经营">客户经营</option><option value="供应链">供应链</option><option value="服务管理">服务管理</option><option value="营销管理">营销管理</option></select><span class="top-spacer"></span><div class="semantic-actions"><button type="button" data-semantic-action="布局">⌘<small>布局</small></button><button type="button" data-semantic-action="新增实体">◆<small>新增实体</small></button><button type="button" data-semantic-action="新增关系">⌘<small>新增关系</small></button><button class="primary" type="button" data-semantic-action="发布">↗<small>发布</small></button><a href="ontology-projects.html">项目索引</a></div></div><div class="semantic-canvas"><svg viewBox="0 0 1200 650" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="graphArrowHome" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 Z"/></marker></defs><g class="semantic-edge-set" marker-end="url(#graphArrowHome)"><path d="M152 205 C214 168 274 141 342 126"/><path d="M342 126 C424 104 494 96 565 94"/><path d="M956 198 C838 175 728 182 610 217"/><path d="M610 217 C454 254 305 241 152 205"/><path d="M152 205 C360 302 623 248 825 278"/><path d="M825 278 C906 331 956 397 995 462"/><path d="M995 462 C947 449 900 432 854 414"/><path d="M854 414 C759 468 665 510 570 535"/><path d="M570 535 C497 506 431 480 366 459"/><path d="M366 459 C291 462 222 464 156 469"/><path d="M565 94 C526 203 542 301 594 380"/><path d="M594 380 C624 442 613 493 570 535"/></g></svg><article class="semantic-node n1" data-graph-name="客户主体" data-graph-type="entity" data-graph-tags="客户经营"><i>客</i><b>客户主体</b></article><article class="semantic-node n2" data-graph-name="产品目录" data-graph-type="entity" data-graph-tags="供应链"><i>产</i><b>产品目录</b></article><article class="semantic-node n3" data-graph-name="服务工单" data-graph-type="entity" data-graph-tags="服务管理 客户经营"><i>服</i><b>服务工单</b></article><article class="semantic-node n4" data-graph-name="营销活动" data-graph-type="entity" data-graph-tags="营销管理 客户经营"><i>营</i><b>营销活动</b></article><article class="semantic-node n5" data-graph-name="渠道伙伴" data-graph-type="entity" data-graph-tags="供应链"><i>渠</i><b>渠道伙伴</b></article><article class="semantic-node n6" data-graph-name="经营区域" data-graph-type="entity" data-graph-tags="供应链"><i>区</i><b>经营区域</b></article><article class="semantic-node n7" data-graph-name="客户购买产品" data-graph-type="relation" data-graph-tags="客户经营 供应链"><i>关</i><b>客户购买产品</b></article><article class="semantic-node n8" data-graph-name="工单关联客户" data-graph-type="relation" data-graph-tags="服务管理 客户经营"><i>关</i><b>工单关联客户</b></article><article class="semantic-node n9" data-graph-name="客户参与活动" data-graph-type="relation" data-graph-tags="营销管理 客户经营"><i>关</i><b>客户参与活动</b></article><article class="semantic-node n10" data-graph-name="活动使用渠道" data-graph-type="relation" data-graph-tags="营销管理 供应链"><i>关</i><b>活动使用渠道</b></article><article class="semantic-node n11" data-graph-name="伙伴经营区域" data-graph-type="relation" data-graph-tags="供应链"><i>关</i><b>伙伴经营区域</b></article><article class="semantic-node n12" data-graph-name="产品归属目录" data-graph-type="relation" data-graph-tags="供应链"><i>关</i><b>产品归属目录</b></article><aside class="semantic-minimap"><span></span><i></i><b></b></aside><div class="semantic-canvas-tools"><button title="定位">⌖</button><button title="全屏">⛶</button><button title="放大">＋</button><input aria-label="缩放" type="range" min="30" max="100" value="72"><button title="缩小">−</button></div></div></section>';
  }
  function ontologyProjects() {
    var items = [
      [
        "客户洞察项目",
        "赛豆企业空间 › 市场营销域 › 客户运营部",
        "24",
        "86",
        "214",
        "今天 09:18",
      ],
      [
        "客户体验提升项目",
        "赛豆企业空间 › 市场营销域 › 客户运营部",
        "18",
        "52",
        "146",
        "昨天 17:30",
      ],
      [
        "渠道协同项目",
        "赛豆企业空间 › 市场营销域 › 华东渠道组",
        "16",
        "41",
        "102",
        "9 月 18 日",
      ],
      [
        "智能营销试点项目",
        "赛豆企业空间 › 创新业务空间",
        "9",
        "29",
        "76",
        "今天 11:06",
      ],
    ];
    return (
      pageHead(
        "项目索引",
        "按完整空间路径定位项目，进入后直接在统一工作台管理各类项目元素",
        '<a class="btn" href="portal-projects.html">在知识门户管理项目</a>',
      ) +
      blueprintNote() +
      '<div class="toolbar"><select class="select"><option>全部空间</option><option>市场营销域</option><option>创新业务空间</option></select><button class="filter-chip active">全部项目</button><button class="filter-chip">我管理的</button><button class="filter-chip">我参与的</button><div class="searchbox"><input id="ontologyProjectSearch" placeholder="搜索项目或空间路径">' +
      icon("search") +
      '</div></div><section class="panel"><table class="table"><thead><tr><th>项目</th><th>完整空间路径</th><th>成员</th><th>本体成果</th><th>文档资源</th><th>最近更新</th><th></th></tr></thead><tbody id="ontologyProjectRows">' +
      items
        .map(function (x) {
          return (
            '<tr><td><div class="name-cell"><i>项</i><span><b>' +
            x[0] +
            '</b><small>公共项目</small></span></div></td><td><span class="project-path">' +
            x[1] +
            "</span></td><td>" +
            x[2] +
            " 人</td><td>" +
            x[3] +
            "</td><td>" +
            x[4] +
            "</td><td>" +
            x[5] +
            '</td><td><a class="btn soft" style="height:28px" href="knowledge-base-management.html?project=' +
            encodeURIComponent(x[0]) +
            '&entry=project">进入工作台</a></td></tr>'
          );
        })
        .join("") +
      "</tbody></table></section>"
    );
  }
  function entityDashboardV2Page() {
    body.classList.add("standalone-product", "entity-product", "entity-home-product");
    var logo = document.querySelector(".logo");
    if (logo) logo.textContent = "◉";
    var actions = [
      ["定位", "预警问题定位分析", "根据预警信息定位关联产线、批次与质量异常", "定位对象", "YL-20261022-0186", false],
      ["通知", "发出告警信息", "向产线责任人与质量管理人员发送告警", "告警级别", "高风险", false],
      ["追溯", "质量问题追溯", "沿批次、供应商与工序关系追溯质量根因", "追溯批次", "BAT-20261022-A17", true],
      ["批次", "新建批次", "创建生产批次并关联产线与负责人", "批次名称", "新能源整车批次 A18", true],
      ["分析", "产线质量智能分析", "综合规则与本体数据生成质量处置建议", "分析对象", "总装二线", true],
      ["派发", "质量问题处理与任务派发", "生成处置任务并派发至质量责任人", "责任部门", "制造质量中心", false],
      ["供应", "供应商质量追溯", "查询供应商批次、来料与质量异常链路", "供应商", "华东精密部件", false],
      ["新增", "新增供应商", "创建供应商实体并补充基础档案", "供应商名称", "新源汽车零部件", true],
    ];
    return (
      '<div class="entity-home-v2" id="entityHomeV2"><nav class="entity-home-nav"><button class="active">⌂ 首页</button></nav>' +
      '<section class="entity-home-hero"><div class="entity-hello"><span class="entity-hello-bot">AI</span><h1>陈宇，您好，欢迎使用实体看板</h1><p>检索业务实体，或直接运行已授权的 Action 完成业务操作。</p></div><div class="entity-home-search"><input placeholder="请输入搜索关键词"><button>⌕ 筛选</button><button class="primary">⌕ 搜索</button></div></section>' +
      '<section class="entity-home-board"><article class="entity-common-types"><header><div><b>常用类型</b><small>最近访问的实体类型</small></div></header><div class="entity-type-shortcuts"><button><i>预</i><span><b>产线预警单</b><small>126 条实体</small></span></button><button><i class="orange">批</i><span><b>生产批次</b><small>48 条实体</small></span></button><button><i class="green">供</i><span><b>供应商</b><small>32 条实体</small></span></button><button><i class="purple">质</i><span><b>质量问题</b><small>67 条实体</small></span></button></div></article>' +
      '<article class="entity-common-actions"><header><div><b>常用 Action</b><small>点击填写参数并执行；需要人工确认的 Action 将进入审批链</small></div><span>共 '+actions.length+' 项</span></header><div class="entity-action-grid">' +
      actions.map(function (x, i) { return '<button class="entity-action-card" data-entity-action data-action-title="'+x[1]+'" data-action-label="'+x[3]+'" data-action-value="'+x[4]+'" data-action-edit="'+(x[5]?'1':'0')+'"><i class="a'+(i%4)+'">'+x[0].slice(0,1)+'</i><span><b>'+x[1]+'</b><small>'+x[2]+'</small></span><em>'+(x[5]?'审批可改参数':'审批参数只读')+'</em><strong>运行 →</strong></button>' }).join("") +
      '</div></article></section>' +
      '<div class="entity-action-mask" id="entityActionMask"><section class="entity-action-modal"><header><div><span>ACTION RUN</span><h2 id="entityActionTitle">运行 Action</h2><p>填写本次执行参数，提交后按配置进入人工确认审批。</p></div><button class="action-history-trigger" id="entityActionHistory" title="查看我的执行历史" aria-label="查看我的执行历史">◷</button><button data-entity-action-close>×</button></header><div class="entity-action-form" id="entityActionForm"><label><span id="entityActionParamLabel">操作对象</span><input id="entityActionParamValue"></label><label><span>执行说明</span><textarea id="entityActionReason">请按当前业务信息执行，并记录完整操作结果。</textarea></label><div class="entity-action-impact"><i>审</i><span><b>本次执行需要人工确认</b><small id="entityActionEditHint">审批过程中参数只读，仅可确认或拒绝</small></span></div></div><div class="entity-action-running" id="entityActionRunning"><span class="entity-run-spinner"></span><b>Action 已运行，等待人工确认</b><p>审批通知已发送给：张敏（u-10028）</p><button class="primary" id="entityOpenApproval">查看审批通知</button></div><footer id="entityActionFoot"><button data-entity-action-close>取消</button><button class="primary" id="entityRunAction">运行 Action</button></footer></section></div>' +
      '<aside class="entity-approval-drawer" id="entityApprovalDrawer"><header><div><span>待我审批 · Action 执行确认</span><h2 id="entityApprovalTitle">Action 审批</h2></div><button data-entity-approval-close>×</button></header><div class="entity-approval-body"><section class="entity-approval-meta"><span><small>申请人</small><b>陈宇</b></span><span><small>审批人</small><b>张敏 · u-10028</b></span><span><small>审批节点</small><b>质量责任人确认</b></span></section><section class="entity-approval-params"><header><b>Action 参数</b><span id="entityApprovalMode">参数只读</span></header><label><span id="entityApprovalParamLabel">操作对象</span><input id="entityApprovalParamValue" disabled></label><label><span>执行说明</span><textarea id="entityApprovalReason" disabled></textarea></label></section><section class="entity-approval-timeline"><i>1</i><span><b>Action 已执行至确认节点</b><small>规则及参数校验已通过，等待当前用户确认</small></span></section></div><footer><button class="danger" id="entityRejectAction">拒绝</button><button class="primary" id="entityApproveAction">确认并继续执行</button></footer></aside><div class="entity-approval-mask" id="entityApprovalMask"></div>' +
      '<section class="entity-action-notice" id="entityActionNotice"><i>审</i><span><b>收到新的 Action 审批</b><small>张敏，请确认“<em id="entityNoticeAction">Action</em>”执行参数</small></span><button id="entityNoticeHandle">立即处理</button></section></div>'
    );
  }
  function entityDashboardPage() {
    body.classList.add("standalone-product", "entity-product");
    var logo = document.querySelector(".logo");
    if (logo) logo.textContent = "◉";
    var rows = [
      [
        "alert",
        "YL-20260921-0186",
        "高风险",
        "总装二线",
        "焊装扭矩连续偏离标准值",
        "2026-09-21 18:42",
        "待处置",
      ],
      [
        "alert",
        "YL-20260921-0173",
        "中风险",
        "涂装一线",
        "温湿度趋势接近工艺上限",
        "2026-09-21 17:05",
        "处理中",
      ],
      [
        "batch",
        "BAT-20260921-A17",
        "关联批次",
        "总装二线",
        "涉及 18 台整车，已暂停下线放行",
        "2026-09-21 16:36",
        "已拦截",
      ],
      [
        "product",
        "VIN-LD6A23K0198",
        "关联车辆",
        "整车质检",
        "关联预警单 YL-20260921-0186",
        "2026-09-21 15:58",
        "待复检",
      ],
    ];
    function resultCard(x) {
      var cls =
        x[2] === "高风险" ? "danger" : x[2] === "中风险" ? "warning" : "info";
      return (
        '<article class="entity-result-card" data-entity-kind="' +
        x[0] +
        '" data-entity-name="' +
        x[1] +
        '" data-entity-line="' +
        x[3] +
        '" data-entity-desc="' +
        x[4] +
        '"><header><div><span class="entity-risk ' +
        cls +
        '">' +
        x[2] +
        "</span><h3>" +
        x[1] +
        '</h3></div><span class="entity-status">' +
        x[6] +
        "</span></header><p>" +
        x[4] +
        '</p><div class="entity-attributes"><span><small>所属产线</small><b>' +
        x[3] +
        "</b></span><span><small>预警时间</small><b>" +
        x[5] +
        "</b></span><span><small>责任部门</small><b>制造质量中心</b></span><span><small>本体来源</small><b>生产质量本体</b></span></div><footer><span>关联实体 8</span><span>关系路径 12</span><button>查看详情与下钻 →</button></footer></article>"
      );
    }
    return (
      '<div class="entity-product-nav"><button class="active">⌂ 首页</button><span>›</span><button>⌕ 话题：产线预警单</button></div><main class="entity-search-stage">' +
      '<section class="entity-query-card" id="entityQueryCard"><div class="entity-query-heading"><div><span class="entity-query-kicker">ENTITY EXPLORER</span><h1>实体检索与关系下钻</h1><p>在有权限的项目本体中，以自然语言定位实体并沿关系继续探索。</p></div><span class="entity-query-scope">当前项目：新能源整车质量分析</span></div>' +
      '<div class="entity-query-panel active" id="entityKeywordPanel"><div class="entity-keyword-line">' +
      icon("search") +
      '<input id="entityKeywordInput" value="产线预警单" placeholder="输入实体名称、属性或业务关键字"><button class="entity-query-helper" id="entityAdvancedBtn">⌄ 高级筛选</button><button class="entity-run-query" data-entity-run>搜索</button></div><div class="entity-advanced-filters" id="entityAdvancedFilters"><label>空间目录<select><option>生产制造域 / 质量中心</option><option>全部有权空间</option></select></label><label>实体类型<select><option>产线预警单</option><option>全部实体类型</option></select></label><label>状态<select><option>全部状态</option><option>待处置</option><option>处理中</option></select></label><label>时间范围<select><option>近 30 天</option><option>近 7 天</option><option>全部时间</option></select></label></div></div>' +
      '<section class="entity-result-shell"><header class="entity-result-top"><div><span class="entity-topic-chip">话题 · 产线预警单</span><b id="entityResultSummary">找到 1 个实体类型、170 条实体数据</b></div><span id="entityResultNote">文字检索 · 170 条 · 86 ms</span></header><nav class="entity-result-tabs"><button data-entity-result-tab="type">实体类型 <span>1</span></button><button class="active" data-entity-result-tab="data">实体数据 <span>170</span></button></nav>' +
      '<div class="entity-result-pane" data-entity-result-pane="type"><article class="entity-type-summary"><i>预</i><div><span>生产质量本体</span><h2>产线预警单</h2><p>记录生产过程中由质量规则、设备指标或人工巡检触发的异常预警，关联产线、批次、车辆、责任组织与处置任务。</p><footer><b>42 个属性</b><b>12 类关系</b><b>170 条实体</b></footer></div><button data-switch-entity-data>查看实体数据 →</button></article></div>' +
      '<div class="entity-result-pane active" data-entity-result-pane="data"><div class="entity-results-board"><aside class="entity-type-filter"><h3>实体类型</h3><button class="active" data-entity-type="all"><span>全部结果</span><b>170</b></button><button data-entity-type="alert"><span><i class="blue">预</i>产线预警单</span><b>126</b></button><button data-entity-type="batch"><span><i class="orange">批</i>生产批次</span><b>18</b></button><button data-entity-type="product"><span><i class="green">车</i>车辆实例</span><b>14</b></button><button data-entity-type="org"><span><i class="purple">组</i>责任组织</span><b>12</b></button></aside><div class="entity-results-main"><div class="entity-results-toolbar"><span>按相关度排序</span><button data-toast="已导出当前查询结果（交互示意）">导出结果</button></div><div class="entity-result-list" id="entityResultCards">' +
      rows.map(resultCard).join("") +
      '</div><div class="entity-pagination"><span>共 170 条，每页 20 条</span><div><button disabled>‹</button><button class="active">1</button><button>2</button><button>3</button><button>…</button><button>9</button><button>›</button></div></div></div></div></div></section></main>' +
      '<div class="entity-drawer-mask" id="entityDrawerMask"></div><aside class="entity-detail-drawer" id="entityDetailDrawer" aria-hidden="true"><header><div><span>实体详情 · 关系下钻</span><h2 id="entityDrawerTitle">YL-20260921-0186</h2></div><button id="entityDrawerClose">×</button></header><div class="entity-drawer-body"><section class="entity-detail-overview"><div class="entity-detail-icon">预</div><div><span class="entity-risk danger">高风险</span><p id="entityDrawerDesc">焊装扭矩连续偏离标准值</p><small>生产质量本体 · 产线预警单</small></div></section><section class="entity-detail-section"><h3>核心属性</h3><dl><div><dt>所属产线</dt><dd id="entityDrawerLine">总装二线</dd></div><div><dt>责任部门</dt><dd>制造质量中心</dd></div><div><dt>处置状态</dt><dd>待处置</dd></div><div><dt>更新时间</dt><dd>2026-09-21 18:42</dd></div></dl></section><section class="entity-detail-section"><h3>关系路径</h3><div class="entity-relation-path"><span>产线预警单</span><em>影响 →</em><span>生产批次</span><em>包含 →</em><span>车辆实例</span></div></section><section class="entity-detail-section"><h3>关联实体 · 点击继续下钻</h3><div class="entity-related-list"><button data-related-name="BAT-20260921-A17" data-related-type="生产批次"><i>批</i><span><b>BAT-20260921-A17</b><small>影响批次 · 18 台车辆</small></span><em>→</em></button><button data-related-name="总装二线" data-related-type="生产线"><i class="blue">线</i><span><b>总装二线</b><small>发生于 · 制造一厂</small></span><em>→</em></button><button data-related-name="扭矩校验规则 R-028" data-related-type="质量规则"><i class="purple">规</i><span><b>扭矩校验规则 R-028</b><small>由规则触发</small></span><em>→</em></button></div></section><footer><button class="btn">查看本体关系图</button><button class="btn primary" data-toast="已定位到当前实体的完整档案（交互示意）">打开完整档案</button></footer></div></aside>'
    );
  }
  function graphAnalysisPage() {
    body.classList.add("standalone-product", "graph-product");
    var logo = document.querySelector(".logo");
    if (logo) logo.textContent = "✣";
    var nodes = [],
      lines = [],
      cx = 500,
      cy = 330,
      names = [
        "客户主体",
        "服务工单",
        "产品目录",
        "营销活动",
        "渠道伙伴",
        "经营区域",
        "订单事实",
        "支付事实",
        "投诉事件",
        "回访任务",
        "风险信号",
        "客户等级",
        "产品分类",
        "活动客群",
        "渠道合同",
        "服务人员",
        "问题类型",
        "权益方案",
        "触达记录",
        "跟进任务",
        "商机线索",
        "销售订单",
        "退款记录",
        "质量问题",
        "供应商",
        "库存批次",
        "交付任务",
        "门店网点",
        "会员权益",
        "满意度",
        "风险规则",
        "处置流程",
        "经营指标",
        "业务术语",
      ];
    names.forEach(function (name, i) {
      var outer = i >= 12,
        count = outer ? 22 : 12,
        index = outer ? i - 12 : i,
        angle = (Math.PI * 2 * index) / count + (outer ? 0.08 : 0.16),
        radius = outer ? 270 : 155,
        x = cx + Math.cos(angle) * radius,
        y = cy + Math.sin(angle) * (outer ? 235 : 135),
        blue = i % 9 === 0;
      lines.push(
        '<line x1="' +
          cx +
          '" y1="' +
          cy +
          '" x2="' +
          x.toFixed(1) +
          '" y2="' +
          y.toFixed(1) +
          '"/>',
      );
      nodes.push(
        '<div class="ga-node ' +
          (blue ? "blue" : "") +
          '" style="left:' +
          (x / 10).toFixed(2) +
          "%;top:" +
          (y / 6.5).toFixed(2) +
          '%"><i>' +
          (blue ? "◇" : "▣") +
          "</i><span>" +
          name +
          "</span></div>",
      );
    });
    return (
      '<section class="graph-analysis-page"><div class="graph-toolbar"><select><option>全文搜</option></select><div class="graph-query"><input placeholder="请输入搜索关键字"><button>' +
      icon("search") +
      "</button></div>" +
      [
        ["←", "后退"],
        ["→", "前进"],
        ["↗", "导出"],
        ["▽", "过滤"],
        ["□", "选择"],
        ["⌘", "图算法"],
        ["⌫", "清除"],
        ["⌘", "布局"],
        ["◇", "工具"],
        ["▦", "表格"],
        ["◎", "标准模式"],
        ["✣", "聚合设置"],
        ["↗", "上图方向"],
        ["▣", "保存"],
      ]
        .map(function (x) {
          return (
            '<button class="graph-tool"><i>' +
            x[0] +
            "</i><span>" +
            x[1] +
            "</span></button>"
          );
        })
        .join("") +
      '</div><div class="graph-stage"><svg class="graph-links" viewBox="0 0 1000 650" preserveAspectRatio="none">' +
      lines.join("") +
      '</svg><div class="ga-center"><i>核</i><b>企业经营网络</b><small>核心实体</small></div>' +
      nodes.join("") +
      '<div class="graph-side-tools"><button>◔</button><button>•••</button><button>▤</button><button>♧</button></div><div class="graph-zoom"><button>⌖</button><button>＋</button><input type="range" value="58"><button>－</button></div><div class="graph-minimap"><div class="mini-hub"></div><span>图谱导航</span></div></div></section>'
    );
  }
  function operationsDashboardPage() {
    body.classList.add("operations-product");
    var logo = document.querySelector(".logo");
    if (logo) logo.textContent = "▥";
    var roadmap = new URLSearchParams(location.search).get("roadmap"),
      items = [
        {
          key: "ops-resource-usage",
          icon: "资",
          title: "资源使用分析",
          desc: "统计文档、本体、数据表与知识库的访问、引用、共享和使用趋势。",
          metric: "12.8 万",
          label: "近 30 日资源访问",
          preview:
            '<div class="ops-bars">' +
            [
              ["文档", "82%"],
              ["本体", "64%"],
              ["数据表", "53%"],
              ["知识库", "46%"],
            ]
              .map(function (x) {
                return (
                  "<span><b>" +
                  x[0] +
                  '</b><i><em style="width:' +
                  x[1] +
                  '"></em></i><small>' +
                  x[1] +
                  "</small></span>"
                );
              })
              .join("") +
            "</div>",
        },
        {
          key: "ops-knowledge-overview",
          icon: "知",
          title: "知识总览",
          desc: "从空间、项目和资源类型维度展示全平台知识资产规模与治理状态。",
          metric: "4,286",
          label: "纳管知识资产",
          preview:
            '<div class="ops-donut-row"><i class="ops-donut"></i><span><b>62%</b><small>已完成治理</small></span><span><b>1,638</b><small>待完善元数据</small></span></div>',
        },
        {
          key: "ops-search-analysis",
          icon: "搜",
          title: "搜索分析",
          desc: "分析检索量、无结果关键词、热门查询和结果点击转化，持续优化知识供给。",
          metric: "36,520",
          label: "近 30 日搜索次数",
          preview:
            '<div class="ops-keywords"><span>客户风险 <b>2,860</b></span><span>产品手册 <b>1,924</b></span><span>渠道政策 <b>1,486</b></span><span class="warn">无结果率 <b>8.6%</b></span></div>',
        },
        {
          key: "ops-user-activity",
          icon: "活",
          title: "用户活跃",
          desc: "按组织、空间和角色观察访问用户、贡献行为及知识协作活跃趋势。",
          metric: "2,418",
          label: "月活跃用户",
          preview:
            '<div class="ops-activity-chart"><svg viewBox="0 0 260 75" preserveAspectRatio="none"><defs><linearGradient id="opsArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b83ea" stop-opacity=".34"/><stop offset="1" stop-color="#3b83ea" stop-opacity="0"/></linearGradient></defs><path class="area" d="M0 65 L0 57 L35 52 L70 55 L105 38 L140 43 L175 26 L210 31 L260 12 L260 75 Z"/><path d="M0 57 L35 52 L70 55 L105 38 L140 43 L175 26 L210 31 L260 12"/></svg><span>近 8 周活跃趋势</span></div>',
        },
      ];
    var selected = items.find(function (x) {
      return x.key === roadmap;
    });
    return (
      pageHead(
        "知识运营看板",
        "围绕知识资产供给、使用、检索与用户活跃形成持续运营闭环",
        '<select class="select"><option>全企业</option><option>市场营销域</option><option>生产制造域</option></select><select class="select"><option>近 30 天</option><option>近 7 天</option><option>本季度</option></select>',
      ) +
      '<section class="ops-hero"><div><span>KNOWLEDGE OPERATIONS</span><h2>让知识建设效果可衡量、可发现、可持续优化</h2><p>当前为规划阶段 UI 示意。待资源管理、检索问答、项目与标签等主流程能力完成迭代后，再逐步建设知识运营指标体系与统计看板。</p></div><aside><b>12 月</b><span>规划启动</span><small>主流程稳定后分阶段上线</small></aside></section>' +
      (selected
        ? '<section class="ops-roadmap-note"><span>12 月规划</span><div><b>' +
          selected.title +
          " · 功能规划中</b><p>" +
          selected.desc +
          ' 主流程能力完成迭代后进入指标口径确认与看板建设。</p></div><button aria-label="关闭规划说明">×</button></section>'
        : "") +
      '<div class="ops-summary">' +
      [
        ["4", "规划能力"],
        ["8", "预计数据主题"],
        ["12 月", "首版计划"],
        ["主流程后", "建设阶段"],
      ]
        .map(function (x, i) {
          return (
            "<article><i>" +
            ["能", "数", "期", "序"][i] +
            "</i><span><b>" +
            x[0] +
            "</b><small>" +
            x[1] +
            "</small></span></article>"
          );
        })
        .join("") +
      "</div>" +
      '<section class="ops-capability-grid">' +
      items
        .map(function (x) {
          return (
            '<article class="ops-capability ' +
            (roadmap === x.key ? "roadmap-target-highlight" : "") +
            '" data-ops-capability="' +
            x.key +
            '"><header><i>' +
            x.icon +
            "</i><span><b>" +
            x.title +
            "</b><small>" +
            x.desc +
            '</small></span><em>规划中 · 12 月</em></header><div class="ops-metric"><strong>' +
            x.metric +
            "</strong><span>" +
            x.label +
            "</span></div>" +
            x.preview +
            '<footer><span>指标口径待主流程稳定后细化</span><button data-toast="' +
            x.title +
            '详细指标将在主流程迭代后设计">查看规划</button></footer></article>'
          );
        })
        .join("") +
      "</section>" +
      '<section class="ops-roadmap-flow"><header><div><h3>建设顺序</h3><p>先完成业务主流程，再沉淀埋点与统计口径，最后交付运营看板。</p></div><span>规划原则</span></header><div><article class="done"><i>1</i><span><b>主流程功能迭代</b><small>资源、检索、项目、标签等核心能力</small></span></article><em>→</em><article><i>2</i><span><b>数据采集与指标口径</b><small>补齐行为埋点、统计周期与权限边界</small></span></article><em>→</em><article><i>3</i><span><b>知识运营看板</b><small>四大能力逐步上线并持续优化</small></span></article></div></section>'
    );
  }
  function jinglunExtractionPage(p, key, roadmap) {
    var reviewSteps = [
      ["1", "抽取确认"],
      ["2", "实体查询"],
      ["3", "融合处理"],
      ["4", "溯源与可视化"],
      ["5", "审核入库"],
    ];
    var reviewNav = reviewSteps
      .map(function (x, i) {
        return (
          '<button class="' +
          (i === 0 ? "active " : "") +
          '" data-jlx-review-step="' +
          x[0] +
          '"><i>' +
          x[0] +
          "</i><span>" +
          x[1] +
          "</span></button>"
        );
      })
      .join("<em>›</em>");
    return (
      '<div class="jinglun-project-context"><span><i>项</i><span><small>当前项目</small><b id="jinglunProjectName">' +
      p.name +
      "</b><em>" +
      p.path +
      '</em></span></span><div><a class="btn" href="jinglun.html?view=project-tasks&project=' +
      key +
      '">任务列表</a><button class="btn primary" id="jlxNewFlow">＋ 新建抽取任务</button></div></div>' +
      pageHead(
        "非结构化处理",
        "供应商质量知识抽取 / 结果确认",
        '<span class="jlx-plan-badge strong">待详细规划 · 12 月发布</span>',
      ) +
      (roadmap
        ? '<section class="jlx-planning-alert jlx-roadmap-note"><span><b>待详细规划</b><strong>12 月发布</strong></span><div><b>文档与结构化混合知识抽取与融合</b><p>Roadmap 已定位到抽取后的结果确认工作区：逐项完成实体查询、融合决策、来源溯源、可视化校订与审核入库。</p></div><button id="jlxRoadmapClose" aria-label="关闭规划说明">×</button></section>'
        : "") +
      '<section class="jlx-task-toolbar"><div><span class="jlx-task-icon">抽</span><span><b>供应商质量知识抽取</b><small>任务 JL-EX-20260922-018 · 最近运行 10:36</small></span></div><dl><div><dt>状态</dt><dd>抽取完成 · 待确认</dd></div><div><dt>输入</dt><dd>3 文档 + 1 数据表</dd></div><div><dt>结果</dt><dd>326 项候选</dd></div></dl><div><button class="btn" data-toast="已重新发起抽取任务（示意）">重新抽取</button><button class="btn primary" data-toast="任务草稿已保存">保存</button></div></section>' +
      '<section class="jlx-workbench jlx-functional-workbench"><aside class="jlx-sources"><div class="jlx-panel-head"><span><i>配</i><b>输入与抽取配置</b></span><button data-toast="打开统一项目资源选择器">选择资源</button></div><div class="jlx-source-group"><header><b>项目文档</b><span>3</span></header><article><i class="doc">文</i><span><b>供应商质量管理制度.pdf</b><small>26 页 · 已解析</small></span><em>主文档</em></article><article><i class="doc">文</i><span><b>采购风险处置手册.docx</b><small>42 页 · 已解析</small></span></article><article><i class="doc">飞</i><span><b>质量异常协同记录</b><small>飞书同步 · 18 篇</small></span></article></div><div class="jlx-source-group structured"><header><b>融合参照</b><span>2</span></header><article><i>表</i><span><b>dwd_supplier_quality_event</b><small>数据表 · 28 字段</small></span></article><article><i>实</i><span><b>供应商实体数据</b><small>12,680 条</small></span></article></div><div class="jlx-template-mini"><span><b>抽取模板</b><small>供应商质量知识抽取 V1.6</small></span><button data-toast="打开模板配置">配置</button></div><div class="jlx-config-summary"><span><b>目标本体</b><small>质量管理本体 V2.3</small></span><span><b>抽取范围</b><small>供应商 / 批次 / 异常 / 处置任务</small></span></div></aside>' +
      '<section class="jlx-agent"><div class="jlx-panel-head"><span><i>AI</i><b>抽取 Agent</b></span><em>分析与补充要求</em></div><div class="jlx-agent-body"><div class="jlx-user"><i>你</i><p>抽取供应商、质量异常、采购批次和处置责任，并保留原文依据。</p></div><div class="jlx-ai"><i>AI</i><div><b>抽取任务已完成</b><p>共识别 128 个实体、74 条关系和 124 个属性；发现 18 项可能冲突，已交由右侧确认。</p></div></div><div class="jlx-tools compact"><span><i>✓</i><b>版面解析</b><small>3 个来源</small></span><span><i>✓</i><b>本体约束抽取</b><small>326 项</small></span><span><i>✓</i><b>实体初步匹配</b><small>84%</small></span></div><div class="jlx-ai"><i>AI</i><div><b>建议先确认实体对齐</b><p>“华东精工”与平台已有供应商相似度 94%，可在右侧实体查询后决定是否融合。</p></div></div></div><div class="jlx-agent-input"><textarea placeholder="补充抽取要求，或询问某项结果的识别依据…"></textarea><button data-toast="Agent 已记录补充要求（示意）">➤</button></div></section>' +
      '<section class="jlx-review-workspace ' +
      (roadmap ? "roadmap-target-highlight" : "") +
      '" id="jinglunExtractionReview"><header><div><span class="jlx-review-kicker">抽取后处理</span><h3>结果确认工作区</h3><p>按步骤确认后再提交审核与入库。</p></div><span class="jlx-review-plan"><b>待详细规划</b><strong>12 月发布</strong></span></header><nav class="jlx-review-steps">' +
      reviewNav +
      '</nav><div class="jlx-review-body">' +
      '<section class="jlx-review-pane active" data-jlx-review-pane="1"><div class="jlx-pane-toolbar"><div class="searchbox">' +
      icon("search") +
      '<input placeholder="搜索实体、关系或属性"></div><select class="select"><option>全部结果</option><option>低置信度</option><option>存在冲突</option></select><span>已确认 308 / 326</span></div><div class="jlx-confirm-table"><header><span>结果</span><span>类型</span><span>置信度</span><span>来源</span><span>确认</span></header><article><span><b>华东精工</b><small>supplier_name</small></span><span>供应商实体</span><span><em>96%</em></span><span>文档 1 · P12</span><span><button class="active" data-jlx-decision>保留</button><button data-jlx-decision>编辑</button></span></article><article><span><b>PB-202609-018</b><small>purchase_batch</small></span><span>采购批次</span><span><em>91%</em></span><span>文档 2 · 附表 4</span><span><button class="active" data-jlx-decision>保留</button><button data-jlx-decision>编辑</button></span></article><article class="warning"><span><b>质量等级 A</b><small>quality_level</small></span><span>实体属性</span><span><em>78%</em></span><span>文档 1 · P18</span><span><button data-jlx-decision>保留</button><button class="active" data-jlx-decision>待复核</button></span></article></div></section>' +
      '<section class="jlx-review-pane" data-jlx-review-pane="2"><div class="jlx-entity-query"><div class="searchbox">' +
      icon("search") +
      '<input id="jlxEntityKeyword" value="华东精工" placeholder="查询平台已有实体"></div><button class="btn primary" id="jlxEntityQuery">查询实体</button></div><div class="jlx-match-grid"><article><header><i>实</i><span><b>华东精工有限公司</b><small>supplier · SUP-00382</small></span><em>94% 匹配</em></header><dl><div><dt>统一社会信用代码</dt><dd>9132••••681X</dd></div><div><dt>所属区域</dt><dd>华东 / 江苏</dd></div><div><dt>已有别名</dt><dd>华东精工、HDJG</dd></div></dl><footer><button class="active" data-jlx-decision>关联已有实体</button><button data-jlx-decision>创建新实体</button></footer></article><article class="jlx-query-empty"><i>查</i><b>继续查询其他候选</b><small>支持按名称、编码和关键属性检索平台实体数据。</small></article></div></section>' +
      '<section class="jlx-review-pane" data-jlx-review-pane="3"><div class="jlx-fusion-overview"><span><b>12</b><small>文档间去重</small></span><span><b>7</b><small>结构化属性补全</small></span><span><b>6</b><small>实体关联</small></span><span class="warn"><b>18</b><small>待决策冲突</small></span></div><article class="jlx-fusion-item"><header><i>!</i><span><b>供应商编码不一致</b><small>文档 HDJG-01 · 数据表 SUP-00382 · 实体匹配 94%</small></span><em>待确认</em></header><div><button class="active" data-jlx-decision>合并至已有实体</button><button data-jlx-decision>新建实体</button><button data-jlx-decision>忽略</button></div></article><article class="jlx-fusion-item"><header><i class="ok">＋</i><span><b>补充“质量认证有效期”</b><small>文档值 2027-06-30；结构化字段当前为空</small></span><em class="suggest">建议补全</em></header><div><button class="active" data-jlx-decision>写入空值字段</button><button data-jlx-decision>仅保留证据</button></div></article></section>' +
      '<section class="jlx-review-pane" data-jlx-review-pane="4"><div class="jlx-trace-visual"><div><div class="jlx-view-switch"><button class="active" data-jlx-visual="trace">原文溯源</button><button data-jlx-visual="graph">图谱可视化</button></div><article class="jlx-trace"><span><b>华东精工 · 质量等级 A</b><small>置信度 96% · supplier.quality_level</small></span><em>供应商质量管理制度.pdf · 第 12 页 · 第 3 段</em><blockquote>“华东精工有限公司当前有效质量等级为 A 级……”</blockquote><button data-toast="已定位到原文预览区域">在原文中定位</button></article><article class="jlx-trace"><span><b>批次 PB-202609-018 · 重点检验</b><small>置信度 91% · OCR 与表格联合识别</small></span><em>采购风险处置手册.docx · 附表 4 · 第 8 行</em><blockquote>“批次 PB-202609-018 进入重点检验范围……”</blockquote><button data-toast="已定位到原文表格">在原文中定位</button></article></div><div class="jlx-mini-graph"><span class="g1">华东精工</span><span class="g2">PB-018</span><span class="g3">质量异常</span><span class="g4">重点检验</span><svg viewBox="0 0 420 260"><path d="M70 60 C150 70 190 90 270 120"/><path d="M270 120 C330 140 340 175 350 210"/><path d="M70 60 C100 155 170 205 250 220"/></svg><small>可拖拽查看抽取实体与关系</small></div></div></section>' +
      '<section class="jlx-review-pane" data-jlx-review-pane="5"><div class="jlx-ingest-summary"><article><i>✓</i><span><b>结果质量检查</b><small>完整性、唯一性、本体约束和来源可追溯</small></span><em>308 / 326 通过</em></article><article><i>人</i><span><b>业务审核人</b><small>供应商质量负责人 · 王敏</small></span><button data-toast="选择审核人">更换</button></article></div><div class="jlx-ingest-targets"><h4>选择入库目标</h4><label><input type="checkbox" checked><span><b>质量管理本体</b><small>写入确认后的实体、关系与属性</small></span></label><label><input type="checkbox" checked><span><b>供应商实体数据</b><small>更新匹配实体并保留文档来源</small></span></label><label><input type="checkbox"><span><b>导出结果文件</b><small>JSON / CSV / RDF</small></span></label></div><div class="jlx-ingest-note"><b>入库说明</b><textarea placeholder="填写本次知识更新说明…">供应商质量制度与采购风险手册增量抽取结果。</textarea></div></section></div><footer class="jlx-review-actions"><span><b id="jlxReviewProgress">步骤 1 / 5</b><small>抽取结果确认</small></span><button class="btn" id="jlxReviewPrev" disabled>上一步</button><button class="btn primary" id="jlxReviewNext">下一步：实体查询</button></footer></section></section>'
    );
  }
  function jinglunPage() {
    body.classList.add("jinglun-product");
    var params = new URLSearchParams(location.search),
      view = jinglunView(),
      key = lastProjectKey(),
      p = sharedProjects[key];
    function projectHead(title, desc, actions) {
      return (
        '<div class="jinglun-project-context"><span><i>项</i><span><small>当前项目</small><b id="jinglunProjectName">' +
        p.name +
        "</b><em>" +
        p.path +
        "</em></span></span><div>" +
        (actions || "") +
        "</div></div>" +
        pageHead(title, desc)
      );
    }
    function tableHead(cols) {
      return (
        '<div class="jinglun-table-head">' +
        cols
          .map(function (x) {
            return "<span>" + x + "</span>";
          })
          .join("") +
        "</div>"
      );
    }
    if (view === "projects") {
      var projectCards = Object.keys(sharedProjects)
        .map(function (k, i) {
          var x = sharedProjects[k];
          return (
            '<article class="jinglun-project-card" data-jinglun-project="' +
            k +
            '"><header><i>项</i><span>' +
            (i === 0 ? "个人默认" : "公共项目") +
            "</span></header><h3>" +
            x.name +
            "</h3><p>" +
            x.path +
            "</p><div><span><b>" +
            [3, 12, 8, 6, 4][i] +
            "</b><small>流程</small></span><span><b>" +
            [18, 126, 64, 42, 28][i] +
            "</b><small>任务</small></span><span><b>" +
            [5, 16, 11, 9, 7][i] +
            "</b><small>资源</small></span></div><footer><small>" +
            x.role +
            " · 最近更新 " +
            (i + 1) +
            " 小时前</small><button>进入项目 →</button></footer></article>"
          );
        })
        .join("");
      return (
        pageHead(
          "经纶项目",
          "经纶与本体管理基于同一项目体系，项目成员、权限与资源范围保持一致",
          '<button class="btn primary" data-toast="项目创建统一从知识门户项目管理发起">＋ 新建项目</button>',
        ) +
        '<section class="jinglun-platform-banner"><div><span>PLATFORM / PROJECT</span><h2>选择项目，进入数据处理与知识抽取工作台</h2><p>平台级算子、规则和流程模板可跨项目复用；流程、调度、任务及文档抽取均在项目内构建和运行。</p></div><aside><b>5</b><span>可访问项目</span><small>与本体管理实时同步</small></aside></section><div class="jinglun-project-toolbar"><div class="searchbox">' +
        icon("search") +
        '<input id="jinglunProjectSearch" placeholder="搜索项目名称或空间路径"></div><select class="select"><option>全部项目</option><option>我管理的</option><option>我参与的</option></select></div><section class="jinglun-project-grid" id="jinglunProjectGrid">' +
        projectCards +
        "</section>"
      );
    }
    if (view === "overview") {
      return (
        pageHead(
          "经纶平台概览",
          "跨项目查看流程运行、数据处理与知识抽取整体情况",
          '<button class="btn">近 7 天⌄</button>',
        ) +
        '<div class="jinglun-overview-metrics">' +
        [
          ["9", "今日接入数据表", "表", "cyan"],
          ["3,118", "今日接入数据量", "数", "red"],
          ["10,370", "累计接入数据表", "库", "green"],
          ["89,732,927", "累计接入数据量", "量", "purple"],
        ]
          .map(function (x) {
            return (
              '<article class="' +
              x[3] +
              '"><i>' +
              x[2] +
              "</i><span><small>" +
              x[1] +
              "</small><b>" +
              x[0] +
              "</b><em>输出同步正常</em></span></article>"
            );
          })
          .join("") +
        '</div><div class="jinglun-overview-grid"><section class="panel"><div class="panel-head"><div><h3>跨项目流程运行状态</h3><p>今日所有项目的任务实例分布</p></div></div><div class="jinglun-donut-wrap"><div class="jinglun-donut"><b>228</b><small>任务实例</small></div><div class="jinglun-legend"><span><i class="ok"></i>成功 <b>216</b></span><span><i class="run"></i>正在运行 <b>8</b></span><span><i class="fail"></i>失败 <b>4</b></span></div></div></section><section class="panel"><div class="panel-head"><div><h3>接入 / 输出数据量趋势</h3><p>最近 7 日平台数据处理情况</p></div></div><div class="jinglun-line-chart"><i style="height:74%"></i><i style="height:56%"></i><i style="height:81%"></i><i style="height:48%"></i><i style="height:67%"></i><i style="height:88%"></i><i style="height:62%"></i></div></section></div>'
      );
    }
    if (view === "operators" || view === "rules" || view === "templates") {
      var cfg =
        view === "operators"
          ? {
              title: "算子管理",
              desc: "管理当前项目可用的数据处理算子，供项目 Pipeline 选择",
              button: "＋ 新建算子",
              cols: [
                "名称",
                "类别",
                "适用框架",
                "适用范围",
                "版本",
                "状态",
                "操作",
              ],
              rows: [
                [
                  "档案增量融合",
                  "Merge",
                  "Flink / Spark",
                  "批处理",
                  "V1.0",
                  "已启用",
                ],
                ["关联回填", "Extract", "Flink", "批处理", "V2.3", "已启用"],
                [
                  "数据质量分析",
                  "DataQuality",
                  "Spark",
                  "批处理",
                  "V1.6",
                  "已启用",
                ],
                [
                  "数据去重",
                  "Deduplication",
                  "Flink",
                  "批处理",
                  "V2.1",
                  "已启用",
                ],
              ],
            }
          : view === "rules"
            ? {
                title: "规则管理",
                desc: "管理当前项目使用的抽取、映射、校验和回填规则",
                button: "＋ 新建规则",
                cols: [
                  "规则名称",
                  "类名",
                  "类别",
                  "输入参数",
                  "输出参数",
                  "版本",
                  "操作",
                ],
                rows: [
                  ["年龄提取", "AgeExtract", "提取类", "1", "1", "V1.2"],
                  ["年龄段标签", "AgeRule", "标识类", "2", "1", "V2.0"],
                  ["字段映射", "AttrMapping", "映射类", "3", "2", "V3.1"],
                  ["白名单检测", "CheckAllowList", "校验类", "3", "1", "V1.8"],
                ],
              }
            : {
                title: "流程模板",
                desc: "查看和应用当前项目可用的标准 Pipeline 模板",
                button: "＋ 新建模板",
                cols: [
                  "模板名称",
                  "适用场景",
                  "节点数",
                  "引用项目",
                  "版本",
                  "状态",
                  "操作",
                ],
                rows: [
                  [
                    "文档知识抽取标准流程",
                    "文档结构化与本体映射",
                    "8",
                    "12",
                    "V3.2",
                    "已发布",
                  ],
                  [
                    "关系型数据清洗流程",
                    "数据表清洗与字段映射",
                    "11",
                    "8",
                    "V2.6",
                    "已发布",
                  ],
                  [
                    "增量数据融合流程",
                    "实时增量归并与校验",
                    "7",
                    "6",
                    "V1.9",
                    "已发布",
                  ],
                  [
                    "客户画像构建流程",
                    "多源数据融合与标签计算",
                    "14",
                    "4",
                    "V4.1",
                    "草稿",
                  ],
                ],
              };
      return (
        projectHead(
          cfg.title,
          cfg.desc,
          '<button class="btn primary" data-toast="' +
            cfg.button.slice(2) +
            '交互后续细化">' +
            cfg.button +
            "</button>",
        ) +
        '<section class="jinglun-library-panel"><div class="jinglun-library-toolbar"><select class="select"><option>全部类别</option></select><select class="select"><option>全部状态</option></select><div class="searchbox">' +
        icon("search") +
        '<input id="jinglunLibrarySearch" placeholder="输入名称或描述检索"></div><button class="btn primary">查询</button></div>' +
        tableHead(cfg.cols) +
        '<div class="jinglun-library-rows">' +
        cfg.rows
          .map(function (r, i) {
            return (
              '<div class="jinglun-table-row">' +
              r
                .map(function (c, j) {
                  return (
                    "<span>" +
                    (j === 0
                      ? "<b>" +
                        c +
                        "</b><small>ID · JL-" +
                        String(i + 1).padStart(3, "0") +
                        "</small>"
                      : j === r.length - 1
                        ? '<em class="jinglun-status ' +
                          (c === "草稿" ? "draft" : "") +
                          '">' +
                          c +
                          "</em>"
                        : c) +
                    "</span>"
                  );
                })
                .join("") +
              '<span><button data-toast="打开' +
              r[0] +
              '配置详情">查看</button><button data-toast="复制' +
              r[0] +
              '">复制</button></span></div>'
            );
          })
          .join("") +
        "</div></section>"
      );
    }
    if (view === "project-overview") {
      return (
        projectHead(
          "项目概览",
          "查看当前项目的数据处理、知识抽取、资源使用与任务运行情况",
          '<button class="btn">近 7 天⌄</button>',
        ) +
        '<div class="jinglun-project-kpis">' +
        [
          ["12", "项目流程", "流", "其中 9 个已上线"],
          ["126", "本月任务", "任", "成功率 97.6%"],
          ["5", "已授权资源", "资", "与本体管理共享"],
          ["28.6 万", "处理数据量", "数", "较上周 +12.4%"],
        ]
          .map(function (x, i) {
            return (
              '<article class="tone-' +
              i +
              '"><i>' +
              x[2] +
              "</i><span><small>" +
              x[1] +
              "</small><b>" +
              x[0] +
              "</b><em>" +
              x[3] +
              "</em></span></article>"
            );
          })
          .join("") +
        '</div><div class="jinglun-project-overview-grid"><section class="panel jinglun-project-health"><div class="panel-head"><div><h3>项目任务运行状态</h3><p>当前项目近 7 日任务实例分布</p></div><span class="jinglun-health-good">运行健康</span></div><div class="jinglun-donut-wrap"><div class="jinglun-donut project"><b>126</b><small>任务实例</small></div><div class="jinglun-legend"><span><i class="ok"></i>成功 <b>123</b></span><span><i class="run"></i>正在运行 <b>2</b></span><span><i class="fail"></i>失败 <b>1</b></span></div></div></section><section class="panel jinglun-project-activity"><div class="panel-head"><div><h3>最近活动</h3><p>流程、抽取与资源授权动态</p></div><a href="jinglun.html?view=project-tasks&project=' +
        key +
        '">查看全部任务</a></div><div class="jinglun-activity-list"><article><i class="success">✓</i><span><b>客户风险信号融合运行成功</b><small>流程任务 · 3 分钟前 · 处理 18,420 条</small></span></article><article><i>抽</i><span><b>重点客户报告抽取完成</b><small>文档抽取 · 26 分钟前 · 生成 326 个实体</small></span></article><article><i class="resource">资</i><span><b>新增授权资源 customer_risk_signal</b><small>统一项目资源池 · 2 小时前</small></span></article><article><i class="schedule">调</i><span><b>客户风险每日更新调度已启用</b><small>调度管理 · 昨天 16:40</small></span></article></div></section></div><section class="panel jinglun-project-resource-strip"><div><i>资</i><span><b>统一项目资源</b><small>5 项资源已与本体管理同步，可用于 Pipeline、文档抽取和字段映射</small></span></div><div class="jinglun-resource-mini"><span><b>2</b>文档</span><span><b>1</b>数据表</span><span><b>1</b>本体</span><span><b>1</b>知识库</span></div><a href="jinglun.html?view=project-resources&project=' +
        key +
        '">管理项目资源 →</a></section>'
      );
    }
    if (view === "project-resources") {
      var roadmap = params.get("roadmap") === "jinglun-project-auth";
      return (
        projectHead(
          "项目资源",
          "与本体管理共享同一项目资源池；授权完成的文档、数据表、本体和知识库可直接用于 Pipeline 与知识抽取",
          '<button class="btn primary ' +
            (roadmap ? "roadmap-target-highlight" : "") +
            '" id="jinglunApplyResource">＋ 申请空间资源</button>',
        ) +
        (roadmap
          ? '<section class="roadmap-context-note jinglun-roadmap-note"><span class="roadmap-month">11 月上线</span><div><b>经纶流程的项目管理与授权</b><p>经纶与本体管理共用项目、成员和资源授权结果；通过顶部切换项目，并在此申请项目所在空间及子空间的资源。</p></div><button id="jinglunRoadmapClose">×</button></section>'
          : "") +
        '<section class="jinglun-shared-resource-hint"><i>同</i><div><b>统一项目资源池</b><p>当前共 5 项可用资源，和本体管理“项目资源”保持一致；无需重复申请或复制数据。</p></div><span>已同步</span></section><div class="jinglun-resource-summary">' +
        [
          ["5", "全部资源"],
          ["2", "文档"],
          ["1", "数据表"],
          ["1", "本体"],
          ["1", "知识库"],
        ]
          .map(function (x, i) {
            return (
              "<span><i>" +
              ["全", "文", "表", "本", "知"][i] +
              "</i><b>" +
              x[0] +
              "</b><small>" +
              x[1] +
              "</small></span>"
            );
          })
          .join("") +
        '</div><section class="jinglun-library-panel jinglun-resource-panel"><div class="jinglun-library-toolbar"><div class="jinglun-segment"><button class="active">全部</button><button>文档</button><button>数据表</button><button>本体</button><button>知识库</button></div><div class="searchbox">' +
        icon("search") +
        '<input placeholder="搜索项目资源"></div></div>' +
        tableHead(["资源", "类型", "来源空间", "项目权限", "可用于", "操作"]) +
        '<div class="jinglun-library-rows">' +
        [
          [
            "客户风险分级与处置办法.docx",
            "文档",
            "客户运营部",
            "可查看",
            "文档抽取",
          ],
          [
            "重点客户经营分析报告.pdf",
            "文档",
            "客户运营部",
            "可查看",
            "文档抽取",
          ],
          [
            "customer_risk_signal",
            "数据表",
            "市场营销域",
            "可使用",
            "数据 Pipeline",
          ],
          ["客户经营本体", "本体", "客户洞察项目", "可使用", "字段映射"],
          ["客户运营方法库", "知识库", "客户运营部", "可引用", "知识抽取"],
        ]
          .map(function (r, i) {
            return (
              '<div class="jinglun-table-row jinglun-resource-row"><span><i class="res-' +
              i +
              '">' +
              ["文", "文", "表", "本", "知"][i] +
              "</i><b>" +
              r[0] +
              "</b></span>" +
              r
                .slice(1)
                .map(function (c, j) {
                  return (
                    "<span>" +
                    (j === 2
                      ? '<em class="jinglun-status">' + c + "</em>"
                      : c) +
                    "</span>"
                  );
                })
                .join("") +
              '<span><button data-toast="查看' +
              r[0] +
              '详情">查看</button></span></div>'
            );
          })
          .join("") +
        "</div></section>"
      );
    }
    if (view === "project-extraction")
      return jinglunExtractionPage(
        p,
        key,
        params.get("roadmap") === "hybrid-knowledge-extraction",
      );
    var projectCfg = {
        "project-flows": {
          title: "流程管理",
          desc: "在项目内构建数据处理 Pipeline 和文档知识抽取流程",
          button: "＋ 创建流程",
          cols: [
            "流程名称",
            "流程状态",
            "在线状态",
            "执行引擎",
            "流程类型",
            "数据源",
            "操作",
          ],
          rows: [
            [
              "客户风险信号融合",
              "验证通过",
              "上线",
              "SPARK",
              "批式",
              "customer_risk_signal",
            ],
            [
              "重点客户文档抽取",
              "验证通过",
              "上线",
              "Agent",
              "文档抽取",
              "经营分析报告",
            ],
            [
              "客户画像增量更新",
              "编辑中",
              "下线",
              "FLINK",
              "流式",
              "customer_profile",
            ],
          ],
        },
        "project-schedules": {
          title: "调度管理",
          desc: "配置项目流程的定时、事件与依赖调度",
          button: "＋ 新建调度",
          cols: [
            "调度名称",
            "关联流程",
            "触发方式",
            "执行周期",
            "最近运行",
            "下次运行",
            "状态",
          ],
          rows: [
            [
              "客户风险每日更新",
              "客户风险信号融合",
              "定时触发",
              "每天 02:00",
              "今天 02:00",
              "明天 02:00",
              "启用",
            ],
            [
              "重点报告自动抽取",
              "重点客户文档抽取",
              "资源变化",
              "文档新增时",
              "昨天 16:30",
              "等待事件",
              "启用",
            ],
            [
              "画像实时刷新",
              "客户画像增量更新",
              "数据变化",
              "实时",
              "10 分钟前",
              "持续运行",
              "暂停",
            ],
          ],
        },
        "project-tasks": {
          title: "任务管理",
          desc: "查看项目内流程任务实例、运行状态与执行日志",
          button: "刷新",
          cols: [
            "任务实例",
            "流程名称",
            "运行类型",
            "任务状态",
            "提交时间",
            "耗时",
            "操作",
          ],
          rows: [
            [
              "TASK-0922-031",
              "客户风险信号融合",
              "调度运行",
              "执行成功",
              "今天 10:40",
              "3m 18s",
            ],
            [
              "TASK-0922-030",
              "重点客户文档抽取",
              "手动运行",
              "执行成功",
              "今天 10:33",
              "1m 06s",
            ],
            [
              "TASK-0922-029",
              "客户画像增量更新",
              "事件触发",
              "运行中",
              "今天 10:28",
              "12m 42s",
            ],
          ],
        },
        "project-extraction": {
          title: "文档抽取",
          desc: "使用项目已授权文档与本体构建知识抽取任务",
          button: "＋ 新建任务",
          cols: [
            "任务名称",
            "输入文档",
            "目标本体",
            "抽取方式",
            "任务状态",
            "更新时间",
            "操作",
          ],
          rows: [
            [
              "产线质量预警抽取",
              "产线质量预警与追溯.docx",
              "质量管理本体",
              "Agent + 规则",
              "已完成",
              "今天 10:36",
            ],
            [
              "重点客户报告抽取",
              "重点客户经营分析报告.pdf",
              "客户经营本体",
              "Agent",
              "运行中",
              "今天 10:18",
            ],
            [
              "服务制度知识抽取",
              "客户服务管理制度.docx",
              "服务管理本体",
              "模板流程",
              "待运行",
              "昨天 16:42",
            ],
          ],
        },
      },
      cfg = projectCfg[view] || projectCfg["project-flows"];
    return (
      projectHead(
        cfg.title,
        cfg.desc,
        '<button class="btn primary" data-toast="' +
          cfg.button.replace("＋ ", "") +
          '功能示意">' +
          cfg.button +
          "</button>",
      ) +
      '<section class="jinglun-project-usage"><span><i>资</i><div><b>项目资源已同步</b><small>5 项统一资源可用于当前流程与任务</small></div></span><a href="jinglun.html?view=project-resources&project=' +
      key +
      '">管理与申请资源 →</a></section><section class="jinglun-library-panel"><div class="jinglun-library-toolbar"><select class="select"><option>全部状态</option></select><select class="select"><option>全部类型</option></select><div class="searchbox">' +
      icon("search") +
      '<input placeholder="输入名称或实例编号"></div><button class="btn primary">查询</button></div>' +
      tableHead(cfg.cols) +
      '<div class="jinglun-library-rows">' +
      cfg.rows
        .map(function (r, i) {
          return (
            '<div class="jinglun-table-row">' +
            r
              .map(function (c, j) {
                return (
                  "<span>" +
                  (j === 0
                    ? "<b>" + c + "</b><small>JL-" + (1008 - i) + "</small>"
                    : j === 3 || j === r.length - 2
                      ? '<em class="jinglun-status ' +
                        (c === "编辑中" || c === "暂停" || c === "待运行"
                          ? "draft"
                          : "") +
                        '">' +
                        c +
                        "</em>"
                      : c) +
                  "</span>"
                );
              })
              .join("") +
            '<span><button data-toast="查看' +
            r[0] +
            '详情">查看</button><button data-toast="运行' +
            r[0] +
            '">运行</button></span></div>'
          );
        })
        .join("") +
      "</div></section>"
    );
  }
  function placeholderPage() {
    var r = routes[app] || routes.jinglun;
    var map = {
      jinglun: ["经", "经纶模块当前仅保留产品框架入口。"],
      graph: ["析", "图析模块当前仅保留产品框架入口。"],
      entity: ["实", "实体看板当前仅保留产品框架入口。"],
      operations: ["运", "运营看板当前仅保留产品框架入口。"],
    };
    var x = map[app] || map.jinglun;
    return (
      pageHead(r.name, "整体产品蓝图中的预留模块") +
      '<section class="empty-stage"><div class="empty-inner"><div class="empty-mark">' +
      x[0] +
      "</div><h1>" +
      r.name +
      "</h1><p>" +
      x[1] +
      "</p></div></section>"
    );
  }
  function connectorLogoV2(type) {
    var map = {
        HDFS: ["HDFS", "HDFS"],
        Upload: ["X / CSV", "上传文件"],
        MySQL: ["MySQL", "MySQL"],
        Hive: ["HIVE", "Hive"],
        Oracle: ["ORACLE", "Oracle"],
        Doris: ["DORIS", "Doris"],
        GaussDB: ["GaussDB", "GaussDB"],
        SQLServer: ["SQL Server", "SQLServer"],
        PostgreSQL: ["PostgreSQL", "PostgreSQL"],
        Kafka: ["KAFKA", "Kafka"],
        API: ["API", "网络 API"],
        飞书文档: ["飞", "飞书文档"],
        XML: ["</>", "XML"],
      },
      x = map[type] || [type, type],
      cls = type.toLowerCase().replace(/[^a-z0-9]/g, "");
    return (
      '<span class="connector-brand ' +
      cls +
      '"><i>' +
      x[0].replace("<", "&lt;").replace(">", "&gt;") +
      "</i></span><b>" +
      x[1] +
      "</b>"
    );
  }
  function dataSourceGalleryV2(selected, roadmap) {
    var groups = [
      [
        "文件",
        [
          ["HDFS", "分布式文件"],
          ["Upload", "本地文件"],
          ["飞书文档", "文件数据源"],
        ],
      ],
      [
        "关系型数据库",
        [
          ["MySQL", "关系型数据库"],
          ["Hive", "数据仓库"],
          ["Oracle", "关系型数据库"],
          ["Doris", "分析型数据库"],
          ["GaussDB", "关系型数据库"],
          ["SQLServer", "关系型数据库"],
          ["PostgreSQL", "关系型数据库"],
        ],
      ],
      [
        "消息、接口与半结构化",
        [
          ["Kafka", "消息与流数据"],
          ["API", "网络接口"],
          ["XML", "半结构化数据"],
        ],
      ],
    ];
    return (
      '<div class="datasource-gallery-v2">' +
      (roadmap
        ? '<section class="roadmap-context-note datasource-v2-roadmap"><span class="roadmap-month">' +
          (selected === "XML" ? "11 月上线" : "功能示意") +
          "</span><div><b>" +
          (selected === "XML" ? "半结构化数据接入" : "飞书文档接入与管理") +
          "</b><p>" +
          (selected === "XML"
            ? "定位到 XML 数据源入口，解析与映射方案后续细化。"
            : "定位到飞书文档连接器；点击卡片后进入分步应用配置。") +
          "</p></div></section>"
        : "") +
      '<div class="datasource-gallery-head"><div><span>01</span><h3>选择数据源类型</h3><p>按资源类型查找连接器，选择后进入分步配置。</p></div><div class="searchbox">' +
      icon("search") +
      '<input id="connectorSearch" placeholder="搜索数据源"></div></div><div class="datasource-gallery-layout"><aside id="connectorCategory"><button class="active" data-connector-category="all">全部 <span>13</span></button><button data-connector-category="文件">文件 <span>3</span></button><button data-connector-category="关系型数据库">关系型数据库 <span>7</span></button><button data-connector-category="消息、接口与半结构化">消息与接口 <span>3</span></button></aside><section id="connectorGroups">' +
      groups
        .map(function (group) {
          return (
            '<div class="connector-group" data-connector-group="' +
            group[0] +
            '"><h4>' +
            group[0] +
            " <span>(" +
            group[1].length +
            ")</span></h4><div>" +
            group[1]
              .map(function (item) {
                var planned = item[0] === "XML",
                  active = item[0] === selected;
                return (
                  '<button class="connector-card-v2 ' +
                  (active ? "active " : "") +
                  (planned ? "planned" : "") +
                  '" data-connector-type="' +
                  item[0] +
                  '" ' +
                  (planned ? 'aria-disabled="true"' : "") +
                  ">" +
                  connectorLogoV2(item[0]) +
                  "<small>" +
                  item[1] +
                  "</small>" +
                  (item[0] === "飞书文档"
                    ? "<em>文件接入</em>"
                    : planned
                      ? "<em>11 月</em>"
                      : "") +
                  "</button>"
                );
              })
              .join("") +
            "</div></div>"
          );
        })
        .join("") +
      "</section></div></div>"
    );
  }
  function feishuConnectorStepHtmlV2(step) {
    if (step === 1)
      return '<div class="feishu-step-layout"><section class="feishu-operation-guide"><span class="step-kicker">操作说明</span><h3>在飞书开放平台创建 Knora 应用</h3><p>平台管理员仅需配置一次，后续每位用户通过个人 OAuth 授权同步自己可访问的文档。</p><ol><li><i>1</i><span><b>创建企业自建应用</b><small>进入飞书开放平台 → 开发者后台，创建“Knora 文档连接器”。</small></span></li><li><i>2</i><span><b>申请只读权限</b><small>开通云文档、云空间和知识库目录的读取权限。</small></span></li><li><i>3</i><span><b>配置 OAuth 回调</b><small>填写 Knora 回调地址，由企业管理员审核并发布应用。</small></span></li></ol><div class="feishu-security-note">App Secret 仅在服务端加密保存；用户访问令牌与应用凭证分开管理。</div></section><section class="feishu-credential-card"><span class="step-kicker">平台级配置</span><h3>录入应用凭证</h3><div class="field"><label>数据源名称</label><input class="input" value="飞书文档连接器"></div><div class="field"><label><span class="req">*</span> App ID</label><input class="input" id="feishuAppId" placeholder="cli_xxxxxxxxxxxxxxxx"></div><div class="field"><label><span class="req">*</span> App Secret</label><input class="input" id="feishuAppSecret" type="password" placeholder="请输入 App Secret"></div><div class="field"><label>OAuth 回调地址</label><div class="copy-field"><code>https://knora.example.com/oauth/feishu/callback</code><button class="btn" type="button" data-toast="回调地址已复制（蓝图示意）">复制</button></div></div></section></div>';
    if (step === 2)
      return '<div class="connector-test-page"><span class="connector-success-icon">飞</span><h3>校验应用凭证与授权范围</h3><p>Knora 将测试 App ID、App Secret 和 OAuth 回调地址，并检查云文档、云空间与知识库只读权限。</p><div class="connector-check-list"><span><i>✓</i>应用凭证格式正确</span><span><i>✓</i>OAuth 回调地址已配置</span><span><i>…</i>等待执行连接测试</span></div><button class="btn primary" id="runFeishuTest">开始测试连接</button></div>';
    return '<div class="connector-test-page complete"><span class="connector-success-icon">✓</span><h3>飞书文档数据源已就绪</h3><p>保存后，用户可在个人或组织空间点击“同步飞书文档”，授权 access token 后拉取有权限的文档与知识库目录。</p><div class="connector-created-summary"><span><small>连接器</small><b>飞书文档连接器</b></span><span><small>权限模式</small><b>源端权限 · 只读</b></span><span><small>同步方式</small><b>用户 OAuth 授权</b></span></div></div>';
  }
  function openDataSourceModalV2(focusType, roadmap) {
    var selected = focusType || "",
      step = 0,
      tested = false;
    openModal(
      "新增数据源",
      "选择连接器后，按步骤完成连接测试与保存。",
      dataSourceGalleryV2(selected, roadmap),
      "请选择数据源",
      null,
      true,
    );
    var confirm = document.getElementById("modalConfirm");
    document.getElementById("modal").classList.add("datasource-v2-modal");
    confirm.disabled = true;
    function renderStep() {
      document.getElementById("modalTitle").textContent = "配置飞书文档数据源";
      document.getElementById("modalDesc").textContent =
        "企业应用配置 · 仅申请文档只读能力";
      document.getElementById("modalBody").innerHTML =
        '<div class="datasource-stepper-v2"><span class="' +
        (step >= 1 ? "active" : "") +
        '"><i>1</i>应用配置</span><em></em><span class="' +
        (step >= 2 ? "active" : "") +
        '"><i>2</i>测试连接</span><em></em><span class="' +
        (step >= 3 ? "active" : "") +
        '"><i>3</i>保存连接</span></div><div class="datasource-step-body">' +
        feishuConnectorStepHtmlV2(step) +
        "</div>";
      confirm.textContent =
        step === 1
          ? "下一步"
          : step === 2
            ? tested
              ? "下一步"
              : "请先测试"
            : "保存并创建";
      confirm.disabled = step === 2 && !tested;
      confirm.onclick = function () {
        if (step === 1) {
          if (
            !document.getElementById("feishuAppId").value.trim() ||
            !document.getElementById("feishuAppSecret").value.trim()
          ) {
            toast("请先输入 App ID 和 App Secret");
            return;
          }
          step = 2;
          renderStep();
        } else if (step === 2 && tested) {
          step = 3;
          renderStep();
        } else if (step === 3) {
          toast("飞书文档数据源已创建，现可在空间中发起用户授权同步");
          closeModal();
        }
      };
      var test = document.getElementById("runFeishuTest");
      if (test)
        test.onclick = function () {
          tested = true;
          document
            .querySelectorAll(".connector-check-list span")
            .forEach(function (x) {
              x.classList.add("ok");
              x.querySelector("i").textContent = "✓";
            });
          test.textContent = "✓ 连接与权限校验成功";
          confirm.disabled = false;
          confirm.textContent = "下一步";
          toast("飞书应用凭证校验成功");
        };
    }
    document.getElementById("connectorSearch").oninput = function () {
      var q = this.value.trim().toLowerCase();
      document.querySelectorAll(".connector-card-v2").forEach(function (card) {
        card.style.display =
          !q || card.textContent.toLowerCase().includes(q) ? "flex" : "none";
      });
    };
    document.getElementById("connectorCategory").onclick = function (e) {
      var b = e.target.closest("[data-connector-category]");
      if (!b) return;
      document
        .querySelectorAll("[data-connector-category]")
        .forEach(function (x) {
          x.classList.toggle("active", x === b);
        });
      document.querySelectorAll("[data-connector-group]").forEach(function (x) {
        x.style.display =
          b.dataset.connectorCategory === "all" ||
          x.dataset.connectorGroup === b.dataset.connectorCategory
            ? "block"
            : "none";
      });
    };
    document.getElementById("connectorGroups").onclick = function (e) {
      var card = e.target.closest("[data-connector-type]");
      if (!card) return;
      selected = card.dataset.connectorType;
      if (selected === "XML") {
        toast("XML 半结构化数据源为 11 月规划入口");
        return;
      }
      if (selected !== "飞书文档") {
        toast(selected + " 分步配置界面将在后续原型中补充");
        return;
      }
      step = 1;
      renderStep();
    };
    if (selected) {
      var target = document.querySelector(
        '[data-connector-type="' + selected + '"]',
      );
      if (target) target.classList.add("roadmap-target-highlight");
    }
  }
  openDataSourceModal = openDataSourceModalV2;
  function bindGlobal() {
    var trigger = document.getElementById("appTrigger"),
      pop = document.getElementById("appPop"),
      profileTrigger = document.getElementById("profileTrigger"),
      profileMenu = document.getElementById("profileMenu");
    trigger.onclick = function (e) {
      e.stopPropagation();
      pop.classList.toggle("open");
      trigger.classList.toggle("open", pop.classList.contains("open"));
      profileMenu.classList.remove("open");
    };
    profileTrigger.onclick = function (e) {
      e.stopPropagation();
      profileMenu.classList.toggle("open");
      profileTrigger.setAttribute(
        "aria-expanded",
        profileMenu.classList.contains("open") ? "true" : "false",
      );
      pop.classList.remove("open");
      trigger.classList.remove("open");
    };
    document.addEventListener("click", function (e) {
      if (!e.target.closest("#appPop") && !e.target.closest("#appTrigger")) {
        pop.classList.remove("open");
        trigger.classList.remove("open");
      }
      if (!e.target.closest(".profile-menu-wrap")) {
        profileMenu.classList.remove("open");
        profileTrigger.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-toast]");
      if (t) {
        e.preventDefault();
        toast(t.dataset.toast);
      }
      if (e.target.closest("[data-close-modal]")) closeModal();
    });
    document.getElementById("tenantSwitch").onclick = function (e) {
      e.stopPropagation();
      openModal(
        "切换租户",
        "切换后，空间、项目、资源与权限范围将按所选租户刷新。",
        '<div class="tenant-choice-list"><label class="active"><input type="radio" name="tenant" checked><span class="tenant-logo">赛</span><span><b>赛豆企业租户</b><small>当前租户 · 12 个空间 · 28 个项目</small></span><i>当前</i></label><label><input type="radio" name="tenant"><span class="tenant-logo alt">示</span><span><b>集团创新试点租户</b><small>演示租户 · 3 个空间 · 5 个项目</small></span></label></div><div class="tenant-change-note"><b>切换范围</b><span>应用保持当前页面，项目上下文、空间目录和资源权限会根据目标租户重新加载。</span></div>',
        "切换租户",
        function () {
          toast("已切换租户，正在刷新空间、项目与权限范围（原型示意）");
        },
      );
      profileMenu.classList.remove("open");
      profileTrigger.setAttribute("aria-expanded", "false");
    };
    document.getElementById("modalMask").onclick = function (e) {
      if (e.target === this) closeModal();
    };
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeModal();
        pop.classList.remove("open");
        profileMenu.classList.remove("open");
      }
    });
    var spaceContext = document.getElementById("spaceContext");
    if (spaceContext)
      spaceContext.onclick = function () {
        toast("当前蓝图以“赛豆企业空间”为演示范围");
      };
    var globalRoadmap = new URLSearchParams(location.search).get("roadmap");
    if (globalRoadmap === "tenant-switch") {
      var tenantNote = document.createElement("section");
      tenantNote.className = "roadmap-context-note tenant-roadmap-note";
      tenantNote.innerHTML =
        '<span class="roadmap-month">10 月上线</span><div><b>项目与租户切换</b><p>项目切换能力已覆盖，本轮在全局用户菜单新增“切换租户”入口；切换后空间、项目、权限和资源范围随租户刷新。</p></div><button aria-label="关闭说明">×</button>';
      document.getElementById("content").prepend(tenantNote);
      profileMenu.classList.add("open");
      profileTrigger.setAttribute("aria-expanded", "true");
      document
        .getElementById("tenantSwitch")
        .classList.add("roadmap-target-highlight");
      tenantNote.querySelector("button").onclick = function () {
        tenantNote.remove();
        document
          .getElementById("tenantSwitch")
          .classList.remove("roadmap-target-highlight");
        profileMenu.classList.remove("open");
        profileTrigger.setAttribute("aria-expanded", "false");
        history.replaceState(null, "", location.pathname);
      };
    }
  }
  function bindPage() {
    if (app === "entity") {
      var entityHome = document.getElementById("entityHomeV2");
      if (entityHome) {
        var selectedEntityAction = null,
          actionMask = document.getElementById("entityActionMask"),
          approvalDrawer = document.getElementById("entityApprovalDrawer"),
          approvalMask = document.getElementById("entityApprovalMask"),
          actionNotice = document.getElementById("entityActionNotice");
        function closeEntityActionModal() {
          actionMask.classList.remove("open");
        }
        function closeEntityApproval() {
          approvalDrawer.classList.remove("open");
          approvalMask.classList.remove("open");
        }
        function openEntityApproval() {
          if (!selectedEntityAction) return;
          var editable = selectedEntityAction.dataset.actionEdit === "1";
          document.getElementById("entityApprovalTitle").textContent =
            selectedEntityAction.dataset.actionTitle;
          document.getElementById("entityApprovalParamLabel").textContent =
            selectedEntityAction.dataset.actionLabel;
          document.getElementById("entityApprovalParamValue").value =
            document.getElementById("entityActionParamValue").value;
          document.getElementById("entityApprovalReason").value =
            document.getElementById("entityActionReason").value;
          document.getElementById("entityApprovalParamValue").disabled = !editable;
          document.getElementById("entityApprovalReason").disabled = !editable;
          document.getElementById("entityApprovalMode").textContent = editable
            ? "审批人可修改参数"
            : "参数只读";
          document
            .querySelector(".entity-approval-params")
            .classList.toggle("editable", editable);
          closeEntityActionModal();
          approvalDrawer.classList.add("open");
          approvalMask.classList.add("open");
          actionNotice.classList.remove("show");
        }
        document.querySelectorAll("[data-entity-action]").forEach(function (card) {
          card.onclick = function () {
            selectedEntityAction = card;
            document.getElementById("entityActionTitle").textContent =
              card.dataset.actionTitle;
            document.getElementById("entityActionParamLabel").textContent =
              card.dataset.actionLabel;
            document.getElementById("entityActionParamValue").value =
              card.dataset.actionValue;
            document.getElementById("entityActionEditHint").textContent =
              card.dataset.actionEdit === "1"
                ? "审批人可以修改本次 Action 的执行参数"
                : "审批过程中参数只读，仅可确认或拒绝";
            document.getElementById("entityActionForm").style.display = "grid";
            document.getElementById("entityActionFoot").style.display = "flex";
            document.getElementById("entityActionRunning").classList.remove("show");
            actionMask.classList.add("open");
          };
        });
        document.querySelectorAll("[data-entity-action-close]").forEach(function (button) {
          button.onclick = closeEntityActionModal;
        });
        document.getElementById("entityActionHistory").onclick = function () {
          if (window.KnoraActionExecutionHistory)
            window.KnoraActionExecutionHistory.open({
              actionName: selectedEntityAction
                ? selectedEntityAction.dataset.actionTitle
                : "Action",
              scope: "mine",
            });
        };
        actionMask.onclick = function (e) {
          if (e.target === actionMask) closeEntityActionModal();
        };
        document.getElementById("entityRunAction").onclick = function () {
          document.getElementById("entityActionForm").style.display = "none";
          document.getElementById("entityActionFoot").style.display = "none";
          document.getElementById("entityActionRunning").classList.add("show");
          document.getElementById("entityNoticeAction").textContent =
            selectedEntityAction.dataset.actionTitle;
          setTimeout(function () {
            actionNotice.classList.add("show");
            toast("Action 已运行，审批通知已发送给张敏");
          }, 450);
        };
        document.getElementById("entityOpenApproval").onclick = openEntityApproval;
        document.getElementById("entityNoticeHandle").onclick = openEntityApproval;
        document.querySelector("[data-entity-approval-close]").onclick = closeEntityApproval;
        approvalMask.onclick = closeEntityApproval;
        document.getElementById("entityApproveAction").onclick = function () {
          closeEntityApproval();
          actionNotice.classList.remove("show");
          toast("审批已通过，Action 已恢复并执行完成");
        };
        document.getElementById("entityRejectAction").onclick = function () {
          closeEntityApproval();
          actionNotice.classList.remove("show");
          toast("已拒绝，本次 Action 执行已终止");
        };
        var entityHomeSearch = entityHome.querySelector(
            ".entity-home-search input",
          ),
          entityHomeSearchButton = entityHome.querySelector(
            ".entity-home-search .primary",
          );
        function openEntitySearchResult() {
          var keyword = entityHomeSearch.value.trim() || "产线预警单";
          location.href =
            "entity-dashboard.html?view=search&q=" + encodeURIComponent(keyword);
        }
        entityHomeSearchButton.onclick = openEntitySearchResult;
        entityHomeSearch.onkeydown = function (e) {
          if (e.key === "Enter") openEntitySearchResult();
        };
        return;
      }
      var entityResultMode = "data";
      function setEntityResult(mode) {
        entityResultMode = mode;
        document
          .querySelectorAll("[data-entity-result-tab]")
          .forEach(function (x) {
            x.classList.toggle("active", x.dataset.entityResultTab === mode);
          });
        document
          .querySelectorAll("[data-entity-result-pane]")
          .forEach(function (x) {
            x.classList.toggle("active", x.dataset.entityResultPane === mode);
          });
      }
      function runEntityQuery() {
        var buttons = document.querySelectorAll("[data-entity-run]"),
          note = document.getElementById("entityResultNote");
        buttons.forEach(function (x) {
          x.disabled = true;
        });
        note.textContent = "正在查询项目本体…";
        setTimeout(function () {
          buttons.forEach(function (x) {
            x.disabled = false;
          });
          setEntityResult("data");
          note.textContent = "文字检索 · 20 条 · 86 ms";
          document.getElementById("entityResultSummary").textContent =
            "找到 1 个实体类型、170 条实体数据";
          document
            .querySelector(".entity-result-shell")
            .scrollIntoView({ behavior: "smooth", block: "start" });
          toast("实体检索完成");
        }, 420);
      }
      function openEntityDrawer(card) {
        var drawer = document.getElementById("entityDetailDrawer");
        document.getElementById("entityDrawerTitle").textContent =
          card.dataset.entityName;
        document.getElementById("entityDrawerDesc").textContent =
          card.dataset.entityDesc;
        document.getElementById("entityDrawerLine").textContent =
          card.dataset.entityLine;
        drawer.classList.add("open");
        drawer.setAttribute("aria-hidden", "false");
        document.getElementById("entityDrawerMask").classList.add("show");
      }
      function closeEntityDrawer() {
        document.getElementById("entityDetailDrawer").classList.remove("open");
        document
          .getElementById("entityDetailDrawer")
          .setAttribute("aria-hidden", "true");
        document.getElementById("entityDrawerMask").classList.remove("show");
      }
      document.querySelectorAll("[data-entity-run]").forEach(function (x) {
        x.onclick = runEntityQuery;
      });
      document.getElementById("entityKeywordInput").onkeydown = function (e) {
        if (e.key === "Enter") runEntityQuery();
      };
      document.getElementById("entityAdvancedBtn").onclick = function () {
        document
          .getElementById("entityAdvancedFilters")
          .classList.toggle("show");
      };
      document
        .querySelectorAll("[data-entity-result-tab]")
        .forEach(function (x) {
          x.onclick = function () {
            setEntityResult(x.dataset.entityResultTab);
          };
        });
      var dataSwitch = document.querySelector("[data-switch-entity-data]");
      if (dataSwitch)
        dataSwitch.onclick = function () {
          setEntityResult("data");
        };
      document.querySelectorAll("[data-entity-type]").forEach(function (x) {
        x.onclick = function () {
          var type = x.dataset.entityType,
            count = 0;
          document.querySelectorAll("[data-entity-type]").forEach(function (y) {
            y.classList.toggle("active", y === x);
          });
          document
            .querySelectorAll(".entity-result-card")
            .forEach(function (card) {
              var show = type === "all" || card.dataset.entityKind === type;
              card.style.display = show ? "block" : "none";
              if (show) count++;
            });
          document.getElementById("entityResultSummary").textContent =
            "当前筛选展示 " + count + " 条示例数据";
          toast("已按实体类型筛选");
        };
      });
      document.getElementById("entityResultCards").onclick = function (e) {
        var card = e.target.closest(".entity-result-card");
        if (card) openEntityDrawer(card);
      };
      document.getElementById("entityDrawerClose").onclick = closeEntityDrawer;
      document.getElementById("entityDrawerMask").onclick = closeEntityDrawer;
      document.querySelectorAll("[data-related-name]").forEach(function (x) {
        x.onclick = function () {
          document.getElementById("entityDrawerTitle").textContent =
            x.dataset.relatedName;
          document.getElementById("entityDrawerDesc").textContent =
            "已沿关系下钻至" + x.dataset.relatedType;
          document.getElementById("entityDrawerLine").textContent =
            "关联自当前实体";
          toast("已下钻至“" + x.dataset.relatedName + "”");
        };
      });
      document
        .querySelectorAll(".entity-pagination button:not([disabled])")
        .forEach(function (x) {
          x.onclick = function () {
            if (/^\d+$/.test(x.textContent)) {
              document
                .querySelectorAll(".entity-pagination button")
                .forEach(function (y) {
                  y.classList.remove("active");
                });
              x.classList.add("active");
            }
            toast("已切换实体结果分页（交互示意）");
          };
        });
      var entityParams = new URLSearchParams(location.search);
      var requestedEntityKeyword = entityParams.get("q");
      if (requestedEntityKeyword)
        document.getElementById("entityKeywordInput").value =
          requestedEntityKeyword;
      var entityResultHomeButton = document.querySelector(
        ".entity-product-nav button:first-child",
      );
      if (entityResultHomeButton)
        entityResultHomeButton.onclick = function () {
          location.href = "entity-dashboard.html";
        };
    }
    if (app === "portal" && page === "home") {
      var homeMode = "search",
        homeScope = "全部空间";
      function resetHomeState() {
        document.getElementById("homeSearchResults").classList.remove("show");
        document.getElementById("homeQaResult").classList.remove("show");
        document.getElementById("homeDefault").classList.remove("hidden");
        document
          .getElementById("homeSearchHero")
          .scrollIntoView({ behavior: "smooth", block: "start" });
      }
      function setHomeMode(mode) {
        homeMode = mode;
        var ask = mode === "ask",
          input = document.getElementById("homeSearch"),
          button = document.getElementById("homeSearchBtn");
        document.querySelectorAll("[data-search-mode]").forEach(function (x) {
          x.classList.toggle("active", x.dataset.searchMode === mode);
        });
        document.getElementById("homeSearchTitle").textContent = ask
          ? "向全域知识提问"
          : "检索全域知识";
        document.getElementById("homeSearchDesc").textContent = ask
          ? "基于全平台所有有权限的文档、本体、实体数据、Action 与数据资源进行问答"
          : "在赛豆企业空间中统一检索文档、图片、实体、本体 Action 与外部数据资源表";
        input.placeholder = ask
          ? "输入业务问题，例如：哪些重点客户近期存在经营风险？"
          : "输入关键词，搜索全平台有权限的资源";
        button.querySelector("span").textContent = ask ? "提问" : "搜索";
        resetHomeState();
      }
      function selectedHomeTypes() {
        var all = document.querySelector('[data-home-type="all"]');
        if (all.checked) return ["all"];
        return Array.from(
          document.querySelectorAll(
            '[data-home-type]:not([data-home-type="all"]):checked',
          ),
        ).map(function (x) {
          return x.dataset.homeType;
        });
      }
      function updateHomeTypeLabel() {
        var types = selectedHomeTypes(),
          labels = {
            docs: "文档",
            images: "图片",
            types: "实体类型",
            entities: "实体数据",
            actions: "Action",
            tables: "数据资源表",
          };
        document.getElementById("homeTypeLabel").textContent =
          types[0] === "all"
            ? "全部类型"
            : types
                .map(function (x) {
                  return labels[x];
                })
                .join("、");
      }
      function switchHomeResultTab(name) {
        document.querySelectorAll("[data-home-result]").forEach(function (x) {
          x.classList.toggle("active", x.dataset.homeResult === name);
        });
        document
          .querySelectorAll("[data-home-result-pane]")
          .forEach(function (x) {
            x.classList.toggle("active", x.dataset.homeResultPane === name);
          });
      }
      function applyHomeResultTypes() {
        var types = selectedHomeTypes(),
          all = types[0] === "all",
          first;
        document.querySelectorAll("[data-home-result]").forEach(function (x) {
          var show = all || types.includes(x.dataset.homeResult);
          x.style.display = show ? "flex" : "none";
          if (show && !first) first = x.dataset.homeResult;
        });
        switchHomeResultTab(first || "docs");
      }
      function runHomeSearch() {
        var input = document.getElementById("homeSearch"),
          fallback =
            homeMode === "ask" ? "哪些重点客户近期存在经营风险？" : "客户风险",
          q = input.value.trim() || fallback,
          typeLabel = document.getElementById("homeTypeLabel").textContent,
          timeLabel =
            document.getElementById("homeTimeFilter").options[
              document.getElementById("homeTimeFilter").selectedIndex
            ].text;
        input.value = q;
        document.getElementById("homeDefault").classList.add("hidden");
        document.getElementById("homeScopeMenu").classList.remove("show");
        document.getElementById("homeTypeMenu").classList.remove("show");
        if (homeMode === "ask") {
          document.getElementById("homeSearchResults").classList.remove("show");
          document.getElementById("homeQaResult").classList.add("show");
          document.getElementById("homeQuestionText").textContent = q;
          document.getElementById("homeQaScopeSummary").textContent =
            "已检索" +
            homeScope +
            " · " +
            (typeLabel === "全部类型" ? "6 类资源" : typeLabel) +
            " · " +
            timeLabel +
            " · 186,420 项可访问内容";
          document
            .querySelector("#homeQaResult .portal-answer-card")
            .classList.add("answering");
          setTimeout(function () {
            var card = document.querySelector(
              "#homeQaResult .portal-answer-card",
            );
            if (card) card.classList.remove("answering");
          }, 450);
          document
            .getElementById("homeQaResult")
            .scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          document.getElementById("homeQaResult").classList.remove("show");
          document.getElementById("homeSearchResults").classList.add("show");
          document.getElementById("homeResultKeyword").textContent = q;
          document.getElementById("homeResultContext").textContent =
            homeScope + " · " + typeLabel + " · " + timeLabel + " · 共 224 条";
          applyHomeResultTypes();
          document
            .getElementById("homeSearchResults")
            .scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
      document.querySelectorAll("[data-search-mode]").forEach(function (b) {
        b.onclick = function () {
          if (typeof dismissHomeRoadmapFocus === "function")
            dismissHomeRoadmapFocus();
          setHomeMode(b.dataset.searchMode);
          if (homeMode === "ask")
            document.getElementById("homeSearch").value = "";
          document.getElementById("homeSearch").focus();
        };
      });
      document.getElementById("homeScopeTrigger").onclick = function (e) {
        e.stopPropagation();
        document.getElementById("homeScopeMenu").classList.toggle("show");
        document.getElementById("homeTypeMenu").classList.remove("show");
      };
      document.getElementById("homeTypeTrigger").onclick = function (e) {
        e.stopPropagation();
        document.getElementById("homeTypeMenu").classList.toggle("show");
        document.getElementById("homeScopeMenu").classList.remove("show");
      };
      document.getElementById("homeScopeMenu").onclick = function (e) {
        var option = e.target.closest("[data-home-scope]");
        if (!option) return;
        homeScope = option.dataset.homeScope;
        document.querySelectorAll("[data-home-scope]").forEach(function (x) {
          x.classList.toggle("active", x === option);
        });
        document.getElementById("homeScopeLabel").textContent = homeScope;
        document.getElementById("homeScopeMenu").classList.remove("show");
      };
      document.getElementById("homeTypeMenu").onchange = function (e) {
        var target = e.target,
          all = document.querySelector('[data-home-type="all"]'),
          specific = Array.from(
            document.querySelectorAll(
              '[data-home-type]:not([data-home-type="all"])',
            ),
          );
        if (target.dataset.homeType === "all" && target.checked)
          specific.forEach(function (x) {
            x.checked = false;
          });
        else if (target.dataset.homeType !== "all") {
          all.checked = false;
          if (
            !specific.some(function (x) {
              return x.checked;
            })
          )
            all.checked = true;
        }
        updateHomeTypeLabel();
      };
      document.addEventListener("click", function (e) {
        if (
          !e.target.closest("#homeScopeTrigger") &&
          !e.target.closest("#homeScopeMenu")
        )
          document.getElementById("homeScopeMenu").classList.remove("show");
        if (
          !e.target.closest("#homeTypeTrigger") &&
          !e.target.closest("#homeTypeMenu")
        )
          document.getElementById("homeTypeMenu").classList.remove("show");
      });
      document.getElementById("homeSearchBtn").onclick = runHomeSearch;
      document.getElementById("homeSearch").onkeydown = function (e) {
        if (e.key === "Enter") runHomeSearch();
      };
      document.getElementById("homeBackFromSearch").onclick = resetHomeState;
      document.getElementById("homeBackFromQa").onclick = resetHomeState;
      document.getElementById("homeResultTabs").onclick = function (e) {
        var tab = e.target.closest("[data-home-result]");
        if (tab) switchHomeResultTab(tab.dataset.homeResult);
      };
      document
        .querySelectorAll(".portal-result-pagination button:not([disabled])")
        .forEach(function (button) {
          button.onclick = function () {
            if (/^\d+$/.test(button.textContent)) {
              document
                .querySelectorAll(".portal-result-pagination button")
                .forEach(function (x) {
                  x.classList.remove("active");
                });
              button.classList.add("active");
            }
            toast("已切换检索结果分页（蓝图示意）");
          };
        });
      document
        .querySelectorAll(".home-entity-layout aside button")
        .forEach(function (button) {
          button.onclick = function () {
            document
              .querySelectorAll(".home-entity-layout aside button")
              .forEach(function (x) {
                x.classList.toggle("active", x === button);
              });
            toast(
              "实体数据已按“" +
                button.childNodes[0].textContent.trim() +
                "”筛选",
            );
          };
        });
      document
        .querySelectorAll("[data-home-citation]")
        .forEach(function (button) {
          button.onclick = function () {
            toast(
              "正在打开引用来源“" +
                button
                  .querySelector("b")
                  .textContent.replace(/^\[\d+\]\s*/, "") +
                "”（蓝图示意）",
            );
          };
        });
      var homeRoadmapKey = new URLSearchParams(location.search).get("roadmap"),
        homeRoadmapConfig =
          homeRoadmapKey === "global-search"
            ? {
                mode: "search",
                month: "10 月上线",
                title: "全资源检索",
                desc: "统一检索文档、图片、实体类型、实体数据、Action 和外部接入的数据资源表，并支持空间目录、类型和时间筛选。",
              }
            : homeRoadmapKey === "global-qa"
              ? {
                  mode: "ask",
                  month: "11 月上线",
                  title: "全资源问答",
                  desc: "基于全平台当前用户有权限的各类资源与数据进行问答，并展示文档、本体、数据表等答案引用来源。",
                }
              : null,
        homeRoadmapNote,
        homeRoadmapTab,
        homeRoadmapTarget;
      function dismissHomeRoadmapFocus() {
        if (!homeRoadmapNote) return;
        homeRoadmapNote.remove();
        homeRoadmapTab.classList.remove("roadmap-tab-highlight");
        homeRoadmapTarget.classList.remove("roadmap-target-highlight");
        history.replaceState(null, "", location.pathname + location.hash);
        homeRoadmapNote = null;
      }
      if (homeRoadmapConfig) {
        setHomeMode(homeRoadmapConfig.mode);
        document.getElementById("homeSearch").value =
          homeRoadmapConfig.mode === "ask"
            ? "哪些重点客户近期存在经营风险？"
            : "客户风险";
        homeRoadmapTab = document.querySelector(
          '[data-search-mode="' + homeRoadmapConfig.mode + '"]',
        );
        homeRoadmapTarget = document.querySelector(".portal-search-console");
        homeRoadmapNote = document.createElement("section");
        homeRoadmapNote.className = "roadmap-context-note home-roadmap-note";
        homeRoadmapNote.innerHTML =
          '<span class="roadmap-month">' +
          homeRoadmapConfig.month +
          "</span><div><b>" +
          homeRoadmapConfig.title +
          "</b><p>" +
          homeRoadmapConfig.desc +
          '</p></div><button type="button" aria-label="关闭规划说明">×</button>';
        document.getElementById("homeModeSwitch").after(homeRoadmapNote);
        homeRoadmapTab.classList.add("roadmap-tab-highlight");
        homeRoadmapTarget.classList.add("roadmap-target-highlight");
        homeRoadmapNote.querySelector("button").onclick =
          dismissHomeRoadmapFocus;
        requestAnimationFrame(function () {
          homeRoadmapTab.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        });
      }
    }
    if (app === "portal" && page === "mine") {
      var mineState = {
        tab: "approval",
        type: { favorite: "文档", recent: "文档", approval: "all" },
        approvalView: "reviewing",
        activeApproval: null,
      };
      function setMineTab(name) {
        mineState.tab = name;
        document
          .querySelectorAll("#mineTabs [data-mine-tab]")
          .forEach(function (x) {
            x.classList.toggle("active", x.dataset.mineTab === name);
          });
        document.querySelectorAll("[data-mine-pane]").forEach(function (x) {
          x.classList.toggle("active", x.dataset.minePane === name);
        });
      }
      function renderMineKind(kind) {
        var q = document
            .getElementById(
              kind === "favorite"
                ? "mineFavoriteSearch"
                : kind === "recent"
                  ? "mineRecentSearch"
                  : "mineApprovalSearch",
            )
            .value.trim()
            .toLowerCase(),
          type = mineState.type[kind],
          rows;
        if (kind === "favorite") {
          rows = mineData.favorite.filter(function (x) {
            return (
              x.starred &&
              (type === "all" || x.type === type) &&
              (!q ||
                [x.name, x.type, x.desc, x.location, x.owner, x.tags.join(" ")]
                  .join(" ")
                  .toLowerCase()
                  .includes(q))
            );
          });
          if (document.getElementById("mineFavoriteSort").value === "name")
            rows = rows.slice().sort(function (a, b) {
              return a.name.localeCompare(b.name, "zh-CN");
            });
          document.getElementById("mineFavoriteGrid").innerHTML =
            mineFavoriteCardsHtml(rows);
        } else if (kind === "approval") {
          var statusValue = document.getElementById("mineApprovalStatus").value;
          rows = mineData.approval.filter(function (x) {
            return (
              (type === "all" || x.category === type) &&
              (statusValue === "all" || x.status === statusValue) &&
              (!q ||
                [
                  x.title,
                  x.category,
                  x.desc,
                  x.source,
                  x.target,
                  x.applicant,
                  x.department,
                  x.docs
                    .map(function (doc) {
                      return doc.name;
                    })
                    .join(" "),
                ]
                  .join(" ")
                  .toLowerCase()
                  .includes(q))
            );
          });
          document.getElementById("mineApprovalList").innerHTML =
            mineApprovalCardsHtml(rows);
        } else {
          rows = mineData.recent.filter(function (x) {
            return (
              (type === "all" || x[1] === type) &&
              (!q || x.join(" ").toLowerCase().includes(q))
            );
          });
          document.getElementById("mineRecentRows").innerHTML = mineRowsHtml(
            "recent",
            rows,
          );
        }
        document.getElementById(
          kind === "favorite"
            ? "mineFavoriteCount"
            : kind === "recent"
              ? "mineRecentCount"
              : "mineApprovalCount",
        ).textContent = "共 " + rows.length + " 条";
      }
      function findMineApproval(id) {
        return mineData.approval.find(function (x) {
          return x.id === id;
        });
      }
      function updateMineApprovalCounts() {
        var pending = mineData.approval.filter(function (x) {
          return x.status === "待我审批";
        }).length;
        document.getElementById("mineApprovalTabCount").textContent = pending;
        document.getElementById("mineReviewingCount").textContent = pending;
      }
      function selectMineApprovalDocument(index) {
        var approval = mineState.activeApproval,
          doc = approval && approval.docs[index];
        if (!doc) return;
        document
          .querySelectorAll("#mineApprovalDocList [data-doc-index]")
          .forEach(function (x) {
            x.classList.toggle("active", Number(x.dataset.docIndex) === index);
          });
        document.getElementById("minePreviewType").textContent = doc.type;
        document.getElementById("minePreviewTitle").textContent = doc.name;
        document.getElementById("minePreviewNo").textContent = doc.no;
        document.getElementById("minePreviewPaperTitle").textContent =
          doc.title;
        document.getElementById("minePreviewSummary").textContent = doc.summary;
        document.getElementById("minePreviewContent").innerHTML = doc.sections
          .map(function (section, i) {
            return (
              "<section><b>0" + (i + 1) + "</b><p>" + section + "</p></section>"
            );
          })
          .join("");
      }
      function closeMineApprovalDetail() {
        var mask = document.getElementById("mineApprovalDetail");
        mask.classList.remove("open");
        mask.setAttribute("aria-hidden", "true");
        document.body.classList.remove("mine-modal-open");
        mineState.activeApproval = null;
      }
      function openMineApprovalDetail(id) {
        var approval = findMineApproval(id);
        if (!approval) return;
        mineState.activeApproval = approval;
        document.getElementById("mineApprovalDetailKind").textContent =
          approval.category;
        document.getElementById("mineApprovalDetailTitle").textContent =
          approval.title;
        document.getElementById("mineApprovalReason").textContent =
          approval.reason;
        document.getElementById("mineApprovalSummary").innerHTML =
          "<span><small>来源</small><b>" +
          approval.source +
          "</b></span><span><small>目标</small><b>" +
          approval.target +
          "</b></span><span><small>申请人</small><b>" +
          approval.applicant +
          " · " +
          approval.department +
          "</b></span><span><small>提交时间</small><b>" +
          approval.time +
          "</b></span>";
        document.getElementById("mineApprovalDocCount").textContent =
          approval.docs.length + " 项";
        document.getElementById("mineApprovalDocList").innerHTML = approval.docs
          .map(function (doc, i) {
            return (
              '<button type="button" data-doc-index="' +
              i +
              '" class="' +
              (i === 0 ? "active" : "") +
              '"><i>' +
              doc.type.slice(0, 3) +
              "</i><span><b>" +
              doc.name +
              "</b><small>" +
              doc.no +
              "</small></span><em>›</em></button>"
            );
          })
          .join("");
        var processed = approval.status !== "待我审批";
        document.getElementById("mineDetailReject").disabled = processed;
        document.getElementById("mineDetailApprove").disabled = processed;
        document.getElementById("mineApprovalDecisionHint").textContent =
          processed
            ? "该申请已" + approval.status.slice(1) + "，审批操作已完成"
            : "请确认申请范围与资料内容后处理";
        selectMineApprovalDocument(0);
        var mask = document.getElementById("mineApprovalDetail");
        mask.classList.add("open");
        mask.setAttribute("aria-hidden", "false");
        document.body.classList.add("mine-modal-open");
      }
      function finishMineApproval(id, approved) {
        var approval = findMineApproval(id);
        if (!approval || approval.status !== "待我审批") return;
        approval.status = approved ? "已通过" : "已驳回";
        toast("已" + (approved ? "通过" : "驳回") + "“" + approval.title + "”");
        updateMineApprovalCounts();
        renderMineKind("approval");
        if (mineState.activeApproval && mineState.activeApproval.id === id)
          closeMineApprovalDetail();
      }
      document
        .querySelectorAll("#mineTabs [data-mine-tab]")
        .forEach(function (b) {
          b.onclick = function () {
            if (typeof dismissMineRoadmapFocus === "function")
              dismissMineRoadmapFocus();
            setMineTab(b.dataset.mineTab);
          };
        });
      document.querySelectorAll("[data-mine-types]").forEach(function (group) {
        group.onclick = function (e) {
          var b = e.target.closest("[data-mine-type]");
          if (!b) return;
          group.querySelectorAll("[data-mine-type]").forEach(function (x) {
            x.classList.toggle("active", x === b);
          });
          mineState.type[group.dataset.mineTypes] = b.dataset.mineType;
          renderMineKind(group.dataset.mineTypes);
        };
      });
      document.getElementById("mineFavoriteSearch").oninput = function () {
        renderMineKind("favorite");
      };
      document.getElementById("mineRecentSearch").oninput = function () {
        renderMineKind("recent");
      };
      document.getElementById("mineApprovalSearch").oninput = function () {
        renderMineKind("approval");
      };
      document.getElementById("mineFavoriteSort").onchange = function () {
        renderMineKind("favorite");
      };
      document.getElementById("mineApprovalStatus").onchange = function () {
        renderMineKind("approval");
      };
      document.getElementById("mineRecentTime").onchange = function () {
        var value = this.value,
          limit =
            value === "today"
              ? 2
              : value === "week"
                ? 10
                : mineData.recent.length,
          rows = mineData.recent.slice(0, limit);
        document.getElementById("mineRecentRows").innerHTML = mineRowsHtml(
          "recent",
          rows,
        );
        document.getElementById("mineRecentCount").textContent =
          "共 " + rows.length + " 条";
      };
      document.getElementById("mineFavoriteGrid").onclick = function (e) {
        var star = e.target.closest(".mine-star"),
          card = e.target.closest("[data-favorite-id]");
        if (star && card) {
          var item = mineData.favorite.find(function (x) {
            return x.id === card.dataset.favoriteId;
          });
          if (item) {
            item.starred = false;
            toast("已取消收藏“" + item.name + "”");
            renderMineKind("favorite");
          }
        } else if (card)
          toast(
            "正在打开“" +
              mineData.favorite.find(function (x) {
                return x.id === card.dataset.favoriteId;
              }).name +
              "”资源详情（蓝图示意）",
          );
      };
      document.getElementById("mineApprovalList").onclick = function (e) {
        var card = e.target.closest("[data-approval-id]");
        if (!card) return;
        if (e.target.closest(".mine-approval-approve"))
          finishMineApproval(card.dataset.approvalId, true);
        else if (e.target.closest(".mine-approval-reject"))
          finishMineApproval(card.dataset.approvalId, false);
        else if (e.target.closest(".mine-approval-detail"))
          openMineApprovalDetail(card.dataset.approvalId);
      };
      document.getElementById("mineApprovalSubtabs").onclick = function (e) {
        var b = e.target.closest("[data-approval-view]");
        if (!b) return;
        mineState.approvalView = b.dataset.approvalView;
        document
          .querySelectorAll("#mineApprovalSubtabs [data-approval-view]")
          .forEach(function (x) {
            x.classList.toggle("active", x === b);
          });
        document
          .querySelectorAll("[data-approval-view-pane]")
          .forEach(function (x) {
            x.classList.toggle(
              "active",
              x.dataset.approvalViewPane === mineState.approvalView,
            );
          });
      };
      document.getElementById("mineApprovalReset").onclick = function () {
        document.getElementById("mineApprovalSearch").value = "";
        document.getElementById("mineApprovalStatus").value = "待我审批";
        mineState.type.approval = "all";
        document
          .querySelectorAll('[data-mine-types="approval"] [data-mine-type]')
          .forEach(function (x) {
            x.classList.toggle("active", x.dataset.mineType === "all");
          });
        renderMineKind("approval");
      };
      document.getElementById("mineApprovalRefresh").onclick = function () {
        renderMineKind("approval");
        toast("审批列表已刷新");
      };
      document.getElementById("mineApprovalDocList").onclick = function (e) {
        var b = e.target.closest("[data-doc-index]");
        if (b) selectMineApprovalDocument(Number(b.dataset.docIndex));
      };
      document.getElementById("mineApprovalDetailClose").onclick =
        closeMineApprovalDetail;
      document.getElementById("mineApprovalDetail").onclick = function (e) {
        if (e.target === this) closeMineApprovalDetail();
      };
      document.getElementById("mineDetailApprove").onclick = function () {
        if (mineState.activeApproval)
          finishMineApproval(mineState.activeApproval.id, true);
      };
      document.getElementById("mineDetailReject").onclick = function () {
        if (mineState.activeApproval)
          finishMineApproval(mineState.activeApproval.id, false);
      };
      document.addEventListener("keydown", function (e) {
        if (
          e.key === "Escape" &&
          document
            .getElementById("mineApprovalDetail")
            .classList.contains("open")
        )
          closeMineApprovalDetail();
      });
      renderMineKind("favorite");
      renderMineKind("recent");
      renderMineKind("approval");
      var roadmapMineKey = new URLSearchParams(location.search).get("roadmap"),
        roadmapMineConfig = {
          "mine-favorites": {
            tab: "favorite",
            month: "10 月上线",
            title: "我的收藏",
            desc: "统一收藏文档、本体、数据表、知识库和图析等资源，并支持按类型检索与筛选。",
          },
          "mine-recent": {
            tab: "recent",
            month: "10 月上线",
            title: "最近访问",
            desc: "集中记录跨资源类型的最近访问内容，并支持按类型、时间范围检索与筛选。",
          },
          "mine-approvals": {
            tab: "approval",
            month: "9 月上线",
            title: "我的审批待办",
            desc: "集中展示资源共享至空间、空间资源申请至项目等需要当前用户处理的审批事项。",
          },
        },
        roadmapMineContext = roadmapMineConfig[roadmapMineKey],
        mineRoadmapNote,
        mineRoadmapPane,
        mineRoadmapTab;
      function dismissMineRoadmapFocus() {
        if (!mineRoadmapNote) return;
        mineRoadmapNote.remove();
        mineRoadmapPane.classList.remove("roadmap-target-highlight");
        mineRoadmapTab.classList.remove("roadmap-tab-highlight");
        history.replaceState(null, "", location.pathname + location.hash);
        document.removeEventListener("click", dismissMineOnBlank);
        document.removeEventListener("keydown", dismissMineOnEscape);
        mineRoadmapNote = null;
      }
      function dismissMineOnBlank(e) {
        if (
          !e.target.closest(".mine-tab-pane.active") &&
          !e.target.closest(".roadmap-context-note")
        )
          dismissMineRoadmapFocus();
      }
      function dismissMineOnEscape(e) {
        if (e.key === "Escape") dismissMineRoadmapFocus();
      }
      if (roadmapMineContext) {
        setMineTab(roadmapMineContext.tab);
        mineRoadmapTab = document.querySelector(
          '#mineTabs [data-mine-tab="' + roadmapMineContext.tab + '"]',
        );
        mineRoadmapPane = document.querySelector(
          '[data-mine-pane="' + roadmapMineContext.tab + '"]',
        );
        mineRoadmapNote = document.createElement("section");
        mineRoadmapNote.className = "roadmap-context-note";
        mineRoadmapNote.setAttribute("role", "note");
        mineRoadmapNote.innerHTML =
          '<span class="roadmap-month">' +
          roadmapMineContext.month +
          "</span><div><b>" +
          roadmapMineContext.title +
          "</b><p>" +
          roadmapMineContext.desc +
          '</p></div><button type="button" aria-label="关闭规划说明">×</button>';
        document.getElementById("mineTabs").after(mineRoadmapNote);
        mineRoadmapPane.classList.add("roadmap-target-highlight");
        mineRoadmapTab.classList.add("roadmap-tab-highlight");
        mineRoadmapNote.querySelector("button").onclick =
          dismissMineRoadmapFocus;
        requestAnimationFrame(function () {
          mineRoadmapTab.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        });
        setTimeout(function () {
          document.addEventListener("click", dismissMineOnBlank);
          document.addEventListener("keydown", dismissMineOnEscape);
        }, 0);
      }
    }
    if (app === "portal" && page === "document-detail") {
      var detailId =
          new URLSearchParams(location.search).get("doc") || "doc-risk",
        detailDoc =
          resourceCatalog.doc.find(function (x) {
            return x.id === detailId;
          }) || resourceCatalog.doc[0],
        detailEditing =
          new URLSearchParams(location.search).get("mode") === "edit";
      function setDocumentEditing(on) {
        detailEditing = on;
        document
          .querySelectorAll(".document-paper [contenteditable]")
          .forEach(function (x) {
            x.contentEditable = on ? "true" : "false";
          });
        document
          .querySelector(".document-paper")
          .classList.toggle("editing", on);
        document.getElementById("documentEdit").textContent = on
          ? "保存编辑"
          : "编辑文档";
      }
      document.getElementById("documentDownload").onclick = function () {
        toast("已开始下载原始文件：" + detailDoc.name);
      };
      document.getElementById("documentParse").onclick = function () {
        openParseModal(detailDoc);
      };
      document.getElementById("documentEdit").onclick = function () {
        if (
          detailDoc.feishu ||
          detailDoc.permission === "浏览" ||
          detailDoc.permission === "只读"
        ) {
          toast(
            detailDoc.feishu
              ? "飞书同步文档继承源端权限，平台内不可编辑"
              : "当前仅有浏览权限，无法编辑文档",
          );
          return;
        }
        if (detailEditing) {
          toast("文档修改已保存");
          setDocumentEditing(false);
        } else setDocumentEditing(true);
      };
      if (!detailDoc.feishu) {
        document.getElementById("documentShare").onclick = function () {
          openResourceGrant("share", detailDoc.name);
        };
        document.getElementById("documentAuthorize").onclick = function () {
          openResourceGrant("authorize", detailDoc.name);
        };
      }
      document.querySelector(".document-pages").onclick = function (e) {
        var b = e.target.closest("button");
        if (!b) return;
        document
          .querySelectorAll(".document-pages button")
          .forEach(function (x) {
            x.classList.toggle("active", x === b);
          });
        toast("已切换至" + b.querySelector("i").textContent);
      };
      document.querySelector(".document-inspector").onclick = function (e) {
        var action = e.target.closest("[data-document-plan-action]");
        if (action)
          toast(action.dataset.documentPlanAction + "（规划交互示意）");
      };
      var documentRoadmapKey = new URLSearchParams(location.search).get(
          "roadmap",
        ),
        documentRoadmapConfig = {
          "document-version": {
            target: "version",
            month: "11 月上线",
            title: "文档版本",
            desc: "规划保留文档历史版本、变更说明及操作人记录，并支持版本对比与权限受控的回退。",
          },
          "document-status": {
            target: "status",
            month: "12 月上线",
            title: "文档状态",
            desc: "规划形成草稿、审核中、已发布、已归档等状态及完整流转记录。",
          },
          "document-validation": {
            target: "validation",
            month: "12 月上线",
            title: "文档校验",
            desc: "规划在发布前对必填元数据、解析质量、业务术语及敏感内容进行统一校验。",
          },
        }[documentRoadmapKey];
      if (documentRoadmapConfig) {
        var documentRoadmapTarget = document.querySelector(
            '[data-document-plan="' + documentRoadmapConfig.target + '"]',
          ),
          documentRoadmapNote = document.createElement("section");
        documentRoadmapNote.className = "document-plan-roadmap-note";
        documentRoadmapNote.innerHTML =
          "<span>" +
          documentRoadmapConfig.month +
          "</span><div><b>" +
          documentRoadmapConfig.title +
          " · 功能规划中</b><p>" +
          documentRoadmapConfig.desc +
          '</p></div><button aria-label="关闭规划说明">×</button>';
        documentRoadmapTarget.before(documentRoadmapNote);
        documentRoadmapTarget.classList.add("document-plan-highlight");
        documentRoadmapNote.querySelector("button").onclick = function () {
          documentRoadmapNote.remove();
          documentRoadmapTarget.classList.remove("document-plan-highlight");
          history.replaceState(
            null,
            "",
            location.pathname + "?doc=" + encodeURIComponent(detailDoc.id),
          );
        };
        requestAnimationFrame(function () {
          documentRoadmapTarget.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        });
      }
    }
    if (app === "portal" && page === "resources") {
      installResourceWorkspace();
      var activeSpaceRow = document.querySelector(".org-space-row.active");
      renderAssets("doc");
      document.getElementById("assetTabs").onclick = function (e) {
        var b = e.target.closest("[data-asset]");
        if (!b) return;
        document.querySelectorAll("[data-asset]").forEach(function (x) {
          x.classList.toggle("active", x === b);
        });
        renderAssets(b.dataset.asset);
      };
      var spaceApprovalResource = "文档",
        spaceApprovalScenario = "publish",
        spaceApprovalInsertIndex = 0,
        spaceApprovalConfigs = {};
      function spaceApprovalDefaults() {
        var result = {};
        ["文档", "数据表", "本体", "知识库", "流程", "智能体"].forEach(
          function (type) {
            result[type] = {
              publish: {
                required: type !== "数据表",
                nodes: [
                  {
                    label: "本空间管理员",
                    mode: "any",
                    detail: "任意人审批 · 任意 1 位管理员通过",
                  },
                ],
              },
              project: {
                required: true,
                nodes: [
                  {
                    label: "本空间管理员",
                    mode: "any",
                    detail: "任意人审批 · 任意 1 位管理员通过",
                  },
                ],
              },
            };
          },
        );
        return result;
      }
      function currentSpaceApprovalConfig() {
        var key = activeSpaceRow.dataset.space;
        if (!spaceApprovalConfigs[key])
          spaceApprovalConfigs[key] = spaceApprovalDefaults();
        return spaceApprovalConfigs[key];
      }
      function currentSpaceApprovalRule() {
        return currentSpaceApprovalConfig()[spaceApprovalResource][
          spaceApprovalScenario
        ];
      }
      function spacePermissionSelect(value) {
        return (
          '<select class="space-permission-select"><option' +
          (value === "管理" ? " selected" : "") +
          ">管理</option><option" +
          (value === "使用" ? " selected" : "") +
          ">使用</option><option" +
          (value === "浏览" ? " selected" : "") +
          ">浏览</option><option" +
          (value === "无权限" ? " selected" : "") +
          ">无权限</option></select>"
        );
      }
      function spacePermissionRow(role, cls, values) {
        return (
          '<tr><td><span class="role-chip ' +
          cls +
          '">' +
          role +
          "</span></td>" +
          values
            .map(function (value) {
              return "<td>" + spacePermissionSelect(value) + "</td>";
            })
            .join("") +
          "</tr>"
        );
      }
      function spaceMemberRows(source) {
        return (
          '<tr><td><span class="mini-user"><span class="mini-avatar">陈</span>陈宇</span></td><td>数字化中心</td><td><select class="space-member-role"><option selected>空间管理员</option><option>知识管理者</option><option>普通成员</option></select></td><td>本级添加</td><td><button class="space-member-delete">删除</button></td></tr><tr><td><span class="mini-user"><span class="mini-avatar">张</span>张敏</span></td><td>客户运营部</td><td><select class="space-member-role"><option>空间管理员</option><option>知识管理者</option><option selected>普通成员</option></select></td><td>' +
          (source === "uums" ? "UUMS 同步" : "本级添加") +
          '</td><td><button class="space-member-delete" ' +
          (source === "uums" ? "disabled" : "") +
          '>删除</button></td></tr><tr><td><span class="mini-user"><span class="mini-avatar">王</span>王晨</span></td><td>渠道管理部</td><td><select class="space-member-role"><option>空间管理员</option><option selected>知识管理者</option><option>普通成员</option></select></td><td>本级添加</td><td><button class="space-member-delete">删除</button></td></tr>'
        );
      }
      function spaceModalHtml(row) {
        var source = row.dataset.source,
          type = row.dataset.type,
          name = row.dataset.space,
          sourceText =
            source === "root"
              ? "企业根空间"
              : source === "uums"
                ? "UUMS 同步"
                : "自建空间";
        return (
          '<div class="space-governance">' +
          '<div class="space-modal-tabs"><button class="active" data-space-modal-tab="overview">概览与成员</button><button data-space-modal-tab="approval">审批机制配置</button><button data-space-modal-tab="permission">权限机制配置 <span class="tab-month">11月</span></button></div>' +
          '<section class="space-modal-pane active" data-space-modal-pane="overview"><div class="space-overview-metrics">' +
          [
            ["846", "文档"],
            ["31", "数据表"],
            ["126", "本体资源"],
            ["18", "知识库"],
          ]
            .map(function (x, i) {
              return (
                "<article><i>" +
                ["文", "数", "本", "库"][i] +
                "</i><b>" +
                x[0] +
                "</b><span>" +
                x[1] +
                "</span></article>"
              );
            })
            .join("") +
          '</div><div class="space-overview-info"><span><small>空间名称</small><b>' +
          name +
          "</b></span><span><small>空间类型</small><b>" +
          type +
          "</b></span><span><small>空间来源</small><b>" +
          sourceText +
          '</b></span><span class="wide"><small>空间说明</small><b>' +
          name +
          '的知识、数据和本体资产统一治理空间</b></span></div><div class="space-manage-scope">✓ 当前空间管理员及上一级空间管理员可维护本级成员、分配角色，并创建直属下级空间。</div><div class="modal-section-head space-member-head"><div><b>空间成员</b><small>空间管理员、知识管理者和普通成员的角色仅作用于当前空间</small></div><button class="btn primary" id="addSpaceMember">＋ 添加成员</button></div><div class="space-member-composer" id="spaceMemberComposer"><select id="spaceNewMember"><option value="李琪|市场营销域">李琪 · 市场营销域</option><option value="周宁|数字化中心">周宁 · 数字化中心</option><option value="赵远|供应链管理部">赵远 · 供应链管理部</option></select><select id="spaceNewMemberRole"><option>普通成员</option><option>知识管理者</option><option>空间管理员</option></select><button class="btn primary" id="confirmSpaceMember">确认添加</button><button class="btn" id="cancelSpaceMember">取消</button></div><div class="space-table-wrap"><table class="table compact-table space-member-table"><thead><tr><th>成员</th><th>所属部门</th><th>空间角色</th><th>来源</th><th>操作</th></tr></thead><tbody id="spaceMemberRows">' +
          spaceMemberRows(source) +
          "</tbody></table></div></section>" +
          '<section class="space-modal-pane" data-space-modal-pane="approval"><div class="space-config-note"><i>✦</i><span><b>按资源类型分别设置审批</b>空间管理员可分别配置资源发布到此空间、以及项目申请空间资源时的审批链。</span><span class="phase-badge september">9 月上线</span></div><div class="space-approval-toolbar"><div class="approval-resource-tabs">' +
          ["文档", "数据表", "本体", "知识库", "流程", "智能体"]
            .map(function (resource) {
              return (
                "<button " +
                (resource === "文档" ? 'class="active" ' : "") +
                'data-approval-resource="' +
                resource +
                '">' +
                resource +
                "</button>"
              );
            })
            .join("") +
          '</div><button class="btn primary" id="saveSpaceApproval">✓ 保存审批配置</button></div><div class="space-approval-scenarios"><article class="space-approval-scenario active" data-approval-scenario="publish"><i>↥</i><span><b id="spacePublishLabel">文档发布到此空间</b><small>控制资源从外部知识库或其它空间发布进入当前空间时是否审批。</small></span><button class="switch on" id="spacePublishSwitch"></button></article><article class="space-approval-scenario" data-approval-scenario="project"><i class="purple">项</i><span><b id="spaceProjectLabel">项目申请文档资源</b><small>控制项目申请引用当前空间资源时是否需要空间侧审批。</small></span><button class="switch on" id="spaceProjectSwitch"></button></article></div><div class="space-chain-panel"><div class="space-chain-head"><div><b id="spaceChainTitle">文档发布到此空间 · 审批链</b><small>按顺序经过各审批节点；多人节点可配置“同时审批”或“任意人审批”。</small></div><span class="mine-status done" id="spaceChainState">已启用</span></div><div class="space-chain" id="spaceApprovalChain"></div><div class="space-chain-editor" id="spaceChainEditor"><span id="spaceChainPosition">新增审批节点</span><select id="spaceApproverSource"><option value="current">本空间管理员</option><option value="parent">上一级空间管理员</option><option value="members">指定成员：张敏、李琪</option></select><select id="spaceApproverMode"><option value="any">任意人审批</option><option value="all">同时审批</option></select><button class="btn primary" id="confirmSpaceChainNode">添加</button><button class="btn" id="cancelSpaceChainNode">取消</button></div><div class="space-chain-help">默认包含一个“本空间管理员 · 任意人审批”节点；链条前端、节点之间及末端均可插入新节点。</div></div></section>' +
          '<section class="space-modal-pane" data-space-modal-pane="permission"><div class="space-config-note permission-note"><i>◇</i><span><b>空间整体权限机制</b>用于统一定义角色、资源类型和空间层级之间的默认访问规则。</span><span class="phase-badge november">11 月上线 · 机制待细化</span></div><div class="space-permission-mode"><button class="active" data-permission-mode="default"><i>✓</i><span><b>默认全员可见</b><small>空间成员默认可浏览空间内资源，管理及使用权限仍按角色控制。</small></span></button><button data-permission-mode="custom"><i>▦</i><span><b>逐项单独配置</b><small>成员默认无资源权限，由管理员在下方矩阵或单项资源中授权。</small></span></button><article><span><b>上级成员继承下级空间权限</b><small>开启后，上级空间成员自动获得本空间的默认浏览权限。</small></span><button class="switch" id="spaceInheritanceSwitch"></button></article></div><div class="space-permission-title"><div><b>角色 × 资源类型权限矩阵</b><small>当前为蓝图示意，权限颗粒度和继承冲突规则将在详细设计中确认。</small></div><button class="btn primary" id="saveSpacePermission">保存权限配置</button></div><div class="space-table-wrap"><table class="table space-permission-matrix"><thead><tr><th>空间角色</th><th>文档</th><th>数据表</th><th>本体</th><th>知识库</th><th>流程</th><th>智能体</th></tr></thead><tbody>' +
          spacePermissionRow("空间管理员", "admin", [
            "管理",
            "管理",
            "管理",
            "管理",
            "管理",
            "管理",
          ]) +
          spacePermissionRow("知识管理者", "manager", [
            "管理",
            "使用",
            "管理",
            "管理",
            "使用",
            "使用",
          ]) +
          spacePermissionRow("普通成员", "", [
            "浏览",
            "浏览",
            "浏览",
            "浏览",
            "浏览",
            "浏览",
          ]) +
          '</tbody></table></div><div class="space-permission-footnote"><b>权限生效原则（示意）</b><span>显式授权优先于默认权限；资源单项限制优先于空间权限；飞书文档继续同步飞书侧访问权限。</span></div></section></div>'
        );
      }
      function switchSpaceModalTab(name) {
        document
          .querySelectorAll("[data-space-modal-tab]")
          .forEach(function (x) {
            x.classList.toggle("active", x.dataset.spaceModalTab === name);
          });
        document
          .querySelectorAll("[data-space-modal-pane]")
          .forEach(function (x) {
            x.classList.toggle("active", x.dataset.spaceModalPane === name);
          });
        if (name === "approval") renderSpaceApproval();
      }
      function renderSpaceApproval() {
        var config = currentSpaceApprovalConfig(),
          rule = config[spaceApprovalResource][spaceApprovalScenario],
          scenarioLabel =
            spaceApprovalScenario === "publish"
              ? "发布到此空间"
              : "项目申请空间资源";
        document
          .querySelectorAll("[data-approval-resource]")
          .forEach(function (x) {
            x.classList.toggle(
              "active",
              x.dataset.approvalResource === spaceApprovalResource,
            );
          });
        document
          .querySelectorAll("[data-approval-scenario]")
          .forEach(function (x) {
            x.classList.toggle(
              "active",
              x.dataset.approvalScenario === spaceApprovalScenario,
            );
          });
        document.getElementById("spacePublishLabel").textContent =
          spaceApprovalResource + "发布到此空间";
        document.getElementById("spaceProjectLabel").textContent =
          "项目申请" + spaceApprovalResource + "资源";
        document
          .getElementById("spacePublishSwitch")
          .classList.toggle(
            "on",
            config[spaceApprovalResource].publish.required,
          );
        document
          .getElementById("spaceProjectSwitch")
          .classList.toggle(
            "on",
            config[spaceApprovalResource].project.required,
          );
        document.getElementById("spaceChainTitle").textContent =
          spaceApprovalResource + scenarioLabel + " · 审批链";
        var state = document.getElementById("spaceChainState");
        state.textContent = rule.required ? "已启用" : "无需审批";
        state.className = "mine-status " + (rule.required ? "done" : "");
        var chain = document.getElementById("spaceApprovalChain");
        if (!rule.required) {
          chain.innerHTML =
            '<div class="space-chain-empty">当前场景无需审批。开启审批后可配置审批链。</div>';
          return;
        }
        var parts = [
          '<button class="space-chain-insert" data-index="0" title="在最前插入节点">＋</button>',
        ];
        rule.nodes.forEach(function (node, index) {
          if (index) parts.push('<span class="space-chain-arrow">→</span>');
          parts.push(
            '<article class="space-chain-node"><div><span class="space-node-mode ' +
              (node.mode === "all" ? "all" : "") +
              '">' +
              (node.mode === "all" ? "同时审批" : "任意人审批") +
              '</span><button class="space-chain-remove" data-index="' +
              index +
              '">×</button></div><b>' +
              node.label +
              "</b><small>" +
              node.detail +
              '</small></article><button class="space-chain-insert" data-index="' +
              (index + 1) +
              '" title="在此处插入节点">＋</button>',
          );
        });
        if (!rule.nodes.length)
          parts.push(
            '<div class="space-chain-empty">暂无审批节点，请点击“＋”添加。</div>',
          );
        chain.innerHTML = parts.join("");
      }
      function bindSpaceModal() {
        document
          .querySelectorAll("[data-space-modal-tab]")
          .forEach(function (tab) {
            tab.onclick = function () {
              switchSpaceModalTab(tab.dataset.spaceModalTab);
            };
          });
        document.getElementById("addSpaceMember").onclick = function () {
          document.getElementById("spaceMemberComposer").classList.add("show");
        };
        document.getElementById("cancelSpaceMember").onclick = function () {
          document
            .getElementById("spaceMemberComposer")
            .classList.remove("show");
        };
        document.getElementById("confirmSpaceMember").onclick = function () {
          var data = document.getElementById("spaceNewMember").value.split("|"),
            role = document.getElementById("spaceNewMemberRole").value,
            row = document.createElement("tr");
          row.innerHTML =
            '<td><span class="mini-user"><span class="mini-avatar">' +
            data[0].slice(0, 1) +
            "</span>" +
            data[0] +
            "</span></td><td>" +
            data[1] +
            '</td><td><select class="space-member-role"><option ' +
            (role === "空间管理员" ? "selected" : "") +
            ">空间管理员</option><option " +
            (role === "知识管理者" ? "selected" : "") +
            ">知识管理者</option><option " +
            (role === "普通成员" ? "selected" : "") +
            '>普通成员</option></select></td><td>本级添加</td><td><button class="space-member-delete">删除</button></td>';
          document.getElementById("spaceMemberRows").appendChild(row);
          document
            .getElementById("spaceMemberComposer")
            .classList.remove("show");
          toast("已添加成员并分配“" + role + "”角色");
        };
        document.getElementById("spaceMemberRows").onchange = function (e) {
          if (e.target.matches(".space-member-role"))
            toast("成员角色已调整为“" + e.target.value + "”");
        };
        document.getElementById("spaceMemberRows").onclick = function (e) {
          var del = e.target.closest(".space-member-delete");
          if (del && !del.disabled) {
            del.closest("tr").remove();
            toast("空间成员已删除");
          }
        };
        document
          .querySelectorAll("[data-approval-resource]")
          .forEach(function (tab) {
            tab.onclick = function () {
              spaceApprovalResource = tab.dataset.approvalResource;
              renderSpaceApproval();
            };
          });
        document
          .querySelectorAll("[data-approval-scenario]")
          .forEach(function (card) {
            card.onclick = function (e) {
              if (e.target.closest(".switch")) return;
              spaceApprovalScenario = card.dataset.approvalScenario;
              renderSpaceApproval();
            };
          });
        document.getElementById("spacePublishSwitch").onclick = function (e) {
          e.stopPropagation();
          spaceApprovalScenario = "publish";
          var rule = currentSpaceApprovalRule();
          rule.required = !rule.required;
          renderSpaceApproval();
        };
        document.getElementById("spaceProjectSwitch").onclick = function (e) {
          e.stopPropagation();
          spaceApprovalScenario = "project";
          var rule = currentSpaceApprovalRule();
          rule.required = !rule.required;
          renderSpaceApproval();
        };
        document.getElementById("spaceApprovalChain").onclick = function (e) {
          var insert = e.target.closest(".space-chain-insert"),
            remove = e.target.closest(".space-chain-remove"),
            rule = currentSpaceApprovalRule();
          if (insert) {
            spaceApprovalInsertIndex = Number(insert.dataset.index);
            document.getElementById("spaceChainPosition").textContent =
              "将在第 " + (spaceApprovalInsertIndex + 1) + " 个位置插入节点";
            document.getElementById("spaceChainEditor").classList.add("show");
          }
          if (remove) {
            rule.nodes.splice(Number(remove.dataset.index), 1);
            renderSpaceApproval();
            toast("审批节点已删除");
          }
        };
        document.getElementById("cancelSpaceChainNode").onclick = function () {
          document.getElementById("spaceChainEditor").classList.remove("show");
        };
        document.getElementById("confirmSpaceChainNode").onclick = function () {
          var source = document.getElementById("spaceApproverSource"),
            mode = document.getElementById("spaceApproverMode").value,
            label = source.options[source.selectedIndex].text.replace(
              "指定成员：",
              "",
            ),
            detail =
              mode === "all"
                ? "同时审批 · 全部审批人均需通过"
                : "任意人审批 · 任意 1 位审批人通过";
          currentSpaceApprovalRule().nodes.splice(spaceApprovalInsertIndex, 0, {
            label: label,
            mode: mode,
            detail: detail,
          });
          document.getElementById("spaceChainEditor").classList.remove("show");
          renderSpaceApproval();
          toast("审批节点已添加");
        };
        document.getElementById("saveSpaceApproval").onclick = function () {
          toast(spaceApprovalResource + "审批机制配置已保存");
        };
        document
          .querySelectorAll("[data-permission-mode]")
          .forEach(function (card) {
            card.onclick = function () {
              document
                .querySelectorAll("[data-permission-mode]")
                .forEach(function (x) {
                  x.classList.toggle("active", x === card);
                });
              document
                .querySelector(".space-permission-matrix")
                .classList.toggle(
                  "custom-mode",
                  card.dataset.permissionMode === "custom",
                );
              toast(
                card.dataset.permissionMode === "default"
                  ? "已选择默认全员可见"
                  : "已选择逐项单独配置",
              );
            };
          });
        document.getElementById("saveSpacePermission").onclick = function () {
          toast("空间权限配置方案已保存（11 月规划能力）");
        };
        document
          .querySelectorAll(".space-permission-select")
          .forEach(function (select) {
            select.onchange = function () {
              toast("权限矩阵已更新");
            };
          });
        renderSpaceApproval();
      }
      function addSpaceRoadmapContext(key) {
        var config =
            key === "space-approval"
              ? {
                  tab: "approval",
                  month: "9 月上线",
                  title: "审批机制管理",
                  desc: "按资源类型分别配置“发布到空间”和“项目申请空间资源”的审批链，支持在链条任意位置添加审批节点。",
                }
              : {
                  tab: "permission",
                  month: "11 月上线",
                  title: "空间权限管理升级",
                  desc: "统一配置空间角色、资源类型及层级继承权限；具体权限颗粒度与冲突机制待细化设计。",
                },
          tabs = document.querySelector(".space-modal-tabs"),
          tab = document.querySelector(
            '[data-space-modal-tab="' + config.tab + '"]',
          ),
          pane = document.querySelector(
            '[data-space-modal-pane="' + config.tab + '"]',
          ),
          note = document.createElement("section");
        switchSpaceModalTab(config.tab);
        note.className = "roadmap-context-note space-modal-roadmap-note";
        note.innerHTML =
          '<span class="roadmap-month">' +
          config.month +
          "</span><div><b>" +
          config.title +
          "</b><p>" +
          config.desc +
          '</p></div><button type="button" aria-label="关闭规划说明">×</button>';
        tabs.after(note);
        tab.classList.add("roadmap-tab-highlight");
        pane.classList.add("roadmap-target-highlight");
        note.querySelector("button").onclick = function () {
          note.remove();
          tab.classList.remove("roadmap-tab-highlight");
          pane.classList.remove("roadmap-target-highlight");
          history.replaceState(null, "", location.pathname + location.hash);
        };
      }
      function openSpaceManagement(row, startTab, roadmapKey) {
        activeSpaceRow = row;
        document.querySelectorAll(".org-space-row").forEach(function (x) {
          x.classList.toggle("active", x === row);
        });
        document.getElementById("spaceName").textContent = row.dataset.space;
        document.getElementById("spacePath").textContent =
          row.dataset.path + " · 当前空间及下级空间资产";
        openModal(
          row.dataset.space,
          "管理空间成员、审批链与整体权限机制。",
          spaceModalHtml(row),
          "保存并关闭",
          function () {
            toast("空间配置已保存");
          },
          true,
        );
        document
          .getElementById("modal")
          .classList.add("space-governance-modal");
        bindSpaceModal();
        if (startTab) switchSpaceModalTab(startTab);
        if (roadmapKey) addSpaceRoadmapContext(roadmapKey);
      }
      function createSpace(parentRow) {
        openModal(
          "创建直属下级空间",
          "上级空间：" + parentRow.dataset.space,
          '<div class="field"><label>空间名称</label><input class="input" id="newSpaceName" placeholder="请输入空间名称"></div><div class="field"><label>空间说明</label><textarea class="textarea" id="newSpaceDesc" placeholder="说明空间的业务范围和治理目标"></textarea></div><div class="field"><label>创建时指定空间管理员</label><div class="member-pick-list"><label><input type="checkbox"> 张敏 · 客户运营部</label><label><input type="checkbox"> 王晨 · 渠道管理部</label><label><input type="checkbox"> 李琪 · 数字化中心</label></div></div>',
          "创建空间",
          function () {
            var name =
                document.getElementById("newSpaceName").value.trim() ||
                "新建空间",
              parentNode = parentRow.closest(".org-tree-node"),
              children = parentNode.querySelector(":scope > .org-children");
            if (!children) {
              children = document.createElement("div");
              children.className = "org-children";
              parentNode.appendChild(children);
              parentRow.querySelector(".tree-caret").textContent = "⌄";
            }
            var node = document.createElement("div");
            node.className = "org-tree-node";
            node.innerHTML =
              '<div class="tree-row org-space-row" data-space="' +
              name +
              '" data-source="local" data-type="组织空间" data-path="' +
              parentRow.dataset.path +
              " / " +
              name +
              '"><span class="tree-caret"></span><i>' +
              name.slice(0, 1) +
              '</i><span class="org-name">' +
              name +
              '</span><span class="tree-tag local">自建空间</span><button class="node-create" data-parent="' +
              name +
              '">＋</button></div>';
            children.appendChild(node);
            toast("自建空间“" + name + "”已创建");
          },
          true,
        );
      }
      document.getElementById("spaceTree").onclick = function (e) {
        var create = e.target.closest(".node-create"),
          row = e.target.closest(".org-space-row");
        if (create && row) {
          e.stopPropagation();
          createSpace(row);
          return;
        }
        if (e.target.closest(".tree-caret") && row) {
          var children = row
            .closest(".org-tree-node")
            .querySelector(":scope > .org-children");
          if (children) {
            var closed = children.style.display === "none";
            children.style.display = closed ? "block" : "none";
            row.querySelector(".tree-caret").textContent = closed ? "⌄" : "›";
          }
          return;
        }
        if (row && row.dataset.source === "personal") {
          activeSpaceRow = row;
          document.querySelectorAll(".org-space-row").forEach(function (x) {
            x.classList.toggle("active", x === row);
          });
          document.getElementById("spaceName").textContent = "个人空间";
          document.getElementById("spacePath").textContent =
            "仅自己可见 · 可上传、连接和管理个人资源";
          document.getElementById("openCurrentSpaceConfig").disabled = true;
          document.querySelectorAll("[data-asset]").forEach(function (x) {
            x.classList.toggle("active", x.dataset.asset === "doc");
          });
          renderAssets("doc");
          toast("已进入个人空间");
        } else if (row) {
          document.getElementById("openCurrentSpaceConfig").disabled = false;
          openSpaceManagement(row);
        }
      };
      document.getElementById("openCurrentSpaceConfig").onclick = function () {
        if (activeSpaceRow.dataset.source === "personal") {
          toast("个人空间无需组织空间配置");
          return;
        }
        openSpaceManagement(activeSpaceRow);
      };
      document.getElementById("syncUumsBtn").textContent =
        "↻ 手动同步 UUMS 组织用户";
      document.getElementById("syncUumsBtn").onclick = function () {
        this.textContent = "✓ 组织用户同步完成";
        toast("UUMS 手动增量同步完成：已更新组织与用户，保留已删除部门记录");
      };
      document.getElementById("spaceTreeSearch").oninput = function () {
        var q = this.value.trim().toLowerCase();
        document
          .querySelectorAll("#spaceTree .org-space-row")
          .forEach(function (x) {
            x.style.display =
              !q || x.textContent.toLowerCase().includes(q) ? "flex" : "none";
          });
      };
      document.getElementById("assetSearch").oninput = function () {
        renderAssets(activeResourceType);
      };
      document.getElementById("assetStatus").onchange = function () {
        renderAssets(activeResourceType);
      };
      document.getElementById("resourcePermissionBtn").onclick = function () {
        openResourceGrant(
          "authorize",
          "当前" +
            document.querySelector("[data-asset].active").textContent +
            "筛选结果",
        );
      };
      document.getElementById("resourceShareBtn").onclick = function () {
        openResourceGrant(
          "share",
          "当前" +
            document.querySelector("[data-asset].active").textContent +
            "筛选结果",
        );
      };
      document.getElementById("documentAutoTagBtn").onclick = function () {
        openModal(
          "文档自动打标",
          "逐步对接企业统一标签体系，基于文档标题、正文和元数据推荐标准标签。",
          '<div class="auto-tag-dialog"><section><span class="step-label">01 · 标签体系</span><h3>选择标签空间与策略</h3><div class="field"><label>标签空间</label><select class="input"><option>企业统一标签体系 / 客户经营</option><option>企业统一标签体系 / 制度规范</option><option>企业统一标签体系 / 数据治理</option></select></div><div class="field"><label>打标方式</label><div class="inline-checks"><label><input type="checkbox" checked> 规则匹配</label><label><input type="checkbox" checked> 语义模型推荐</label><label><input type="checkbox"> 人工复核后生效</label></div></div></section><section><span class="step-label">02 · 推荐示例</span><h3>模型推荐标签</h3><div class="auto-tag-suggestions"><span># 客户运营 <em>96%</em></span><span># 风险管理 <em>91%</em></span><span># 制度规范 <em>86%</em></span><span># 重点客户 <em>78%</em></span></div><p>低于 80% 的标签默认进入人工复核队列，避免直接污染统一标签体系。</p></section><section><span class="step-label">03 · 执行范围</span><h3>当前文档范围</h3><div class="auto-tag-scope"><b>846</b><span>当前空间文档</span><small>其中 638 份已解析，可立即识别；飞书只读文档仅写入平台侧标签索引。</small></div></section></div>',
          "开始自动打标",
          function () {
            toast("自动打标任务已创建，将按统一标签体系生成推荐结果");
          },
          true,
        );
      };
      document.getElementById("addDataSourceBtn").onclick = function () {
        openDataSourceModal();
      };
      document.getElementById("syncFeishuBtn").onclick = function () {
        openFeishuSyncModal(activeSpaceRow.dataset.space);
      };
      document.getElementById("uploadResourceBtn").onclick = function () {
        openModal(
          "上传资源",
          "上传文件至当前空间，或从飞书文档导入。",
          '<div class="upload-resource-zone"><i>⇧</i><b>拖拽文件到此处，或点击选择文件</b><span>支持 PDF、Word、Excel、PPT、TXT，单文件不超过 500 MB</span><button class="btn">选择本地文件</button></div><div class="field"><label>其它导入方式</label><button class="btn" id="importFeishuDoc">从飞书文档导入</button></div>',
          "开始上传",
          function () {
            toast("文件已加入上传队列");
          },
          true,
        );
        document.getElementById("importFeishuDoc").onclick = function () {
          closeModal();
          openDataSourceModal();
          setTimeout(function () {
            var b = document.querySelector('[data-connector-type="飞书文档"]');
            if (b) b.click();
          }, 0);
        };
      };
      document.getElementById("assetList").onclick = function (e) {
        var table = e.target.closest("[data-table-id]"),
          ontology = e.target.closest("[data-ontology-id]"),
          action = e.target.closest("[data-resource-action]");
        if (action) {
          var directItem = findResource(action.dataset.id),
            directName = directItem ? directItem.name : "当前资源",
            directOperation = action.dataset.resourceAction;
          if (directOperation === "authorize" || directOperation === "share") {
            openResourceGrant(directOperation, directName);
            return;
          }
          if (directOperation === "feishu-refresh") {
            toast("已检查飞书源文档，当前为最新版本");
            return;
          }
        }
        if (table) {
          openResourceDrawer("data", table.dataset.tableId);
          return;
        }
        if (ontology) {
          openResourceDrawer("ontology", ontology.dataset.ontologyId);
          return;
        }
        if (!action) return;
        var item = findResource(action.dataset.id),
          name = item ? item.name : "当前资源",
          operation = action.dataset.resourceAction;
        if (operation === "download") toast("已开始下载原始文件：" + name);
        else if (operation === "parse") openParseModal(item);
        else if (operation === "share" || operation === "authorize")
          openResourceGrant(operation, name);
        else if (operation === "more") {
          openModal(
            "更多文档操作",
            name,
            '<div class="resource-more-actions"><button class="btn" data-more-op="share">共享至其它空间</button><button class="btn" data-more-op="authorize">授权到人 / 项目</button><button class="btn" data-more-op="move">移动至目录</button><button class="btn danger" data-more-op="delete">删除文档</button></div>',
            "关闭",
            null,
          );
          document.querySelectorAll("[data-more-op]").forEach(function (b) {
            b.onclick = function () {
              if (
                b.dataset.moreOp === "share" ||
                b.dataset.moreOp === "authorize"
              ) {
                closeModal();
                openResourceGrant(b.dataset.moreOp, name);
              } else toast("已选择“" + b.textContent + "”（蓝图示意）");
            };
          });
        }
      };
      document.getElementById("resourceDrawerClose").onclick =
        closeResourceDrawer;
      document.getElementById("resourceDrawerMask").onclick =
        closeResourceDrawer;
      document.getElementById("resourceDrawerBody").onclick = function (e) {
        var action = e.target.closest("[data-resource-action]");
        if (action) {
          var item = findResource(action.dataset.id);
          openResourceGrant(action.dataset.resourceAction, item && item.name);
        }
      };
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeResourceDrawer();
      });
      document.addEventListener("click", function (e) {
        var sw = e.target.closest(".switch");
        if (sw) sw.classList.toggle("on");
      });
      function activateResourceTab(type) {
        document.querySelectorAll("[data-asset]").forEach(function (x) {
          x.classList.toggle("active", x.dataset.asset === type);
        });
        renderAssets(type);
      }
      function showResourceRoadmapNote(config, target) {
        var layout = document.querySelector(".v15-resource-layout"),
          note = document.createElement("section");
        note.className = "roadmap-context-note resource-roadmap-note";
        note.innerHTML =
          '<span class="roadmap-month">' +
          config.month +
          "</span><div><b>" +
          config.title +
          "</b><p>" +
          config.desc +
          "</p>" +
          (config.rollout
            ? '<div class="resource-rollout"><span><i>9月</i>文档管理、共享与申请</span><em>→</em><span><i>10月</i>本体资源纳管</span><em>→</em><span><i>11月</i>数据表及统一授权完善</span></div>'
            : "") +
          '</div><button type="button" aria-label="关闭规划说明">×</button>';
        layout.before(note);
        target.classList.add("roadmap-target-highlight");
        note.querySelector("button").onclick = function () {
          note.remove();
          target.classList.remove("roadmap-target-highlight");
          history.replaceState(null, "", location.pathname + location.hash);
        };
        requestAnimationFrame(function () {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
      var spaceRoadmapKey = new URLSearchParams(location.search).get("roadmap");
      if (spaceRoadmapKey === "space-organization") {
        var roadmapTarget = document.querySelector(".v15-space-tree"),
          roadmapLayout = document.querySelector(".v15-resource-layout"),
          roadmapNote = document.createElement("section");
        roadmapNote.className = "roadmap-context-note";
        roadmapNote.setAttribute("role", "note");
        roadmapNote.innerHTML =
          '<span class="roadmap-month">9 月上线</span><div><b>统一的空间组织管理</b><p>形成“企业—业务域—部门—自定义目录”多级空间组织，并支持从 IAM 同步一级、二级组织架构。</p></div><button type="button" aria-label="关闭规划说明">×</button>';
        roadmapLayout.before(roadmapNote);
        roadmapTarget.classList.add("roadmap-target-highlight");
        requestAnimationFrame(function () {
          roadmapTarget.scrollIntoView({ behavior: "smooth", block: "center" });
        });
        function dismissRoadmapFocus() {
          roadmapTarget.classList.remove("roadmap-target-highlight");
          roadmapNote.remove();
          history.replaceState(null, "", location.pathname + location.hash);
          document.removeEventListener("click", dismissOnBlank);
          document.removeEventListener("keydown", dismissOnEscape);
        }
        function dismissOnBlank(e) {
          if (
            !e.target.closest(".v15-space-tree") &&
            !e.target.closest(".roadmap-context-note")
          )
            dismissRoadmapFocus();
        }
        function dismissOnEscape(e) {
          if (e.key === "Escape") dismissRoadmapFocus();
        }
        roadmapNote.querySelector("button").onclick = dismissRoadmapFocus;
        setTimeout(function () {
          document.addEventListener("click", dismissOnBlank);
          document.addEventListener("keydown", dismissOnEscape);
        }, 0);
      } else if (
        spaceRoadmapKey === "space-approval" ||
        spaceRoadmapKey === "space-permission"
      ) {
        openSpaceManagement(
          activeSpaceRow,
          spaceRoadmapKey === "space-approval" ? "approval" : "permission",
          spaceRoadmapKey,
        );
      } else if (spaceRoadmapKey === "document-share") {
        var personalRoadmapRow = document.querySelector(
          '[data-source="personal"]',
        );
        if (personalRoadmapRow) personalRoadmapRow.click();
        activateResourceTab("doc");
        showResourceRoadmapNote(
          {
            month: "功能已上线",
            title: "文档共享",
            desc: "当前个人空间与组织空间均可对平台文档执行“共享至空间”和“授权到人 / 项目”；后续入口统一迁移至资源管理。",
          },
          document.getElementById("assetList"),
        );
      } else if (spaceRoadmapKey === "document-auto-tag") {
        activateResourceTab("doc");
        showResourceRoadmapNote(
          {
            month: "11 月上线",
            title: "文档自动打标",
            desc: "逐步对接新的企业统一标签体系，基于文档标题、正文和元数据开发规则与模型结合的自动打标能力。",
          },
          document.getElementById("documentAutoTagBtn"),
        );
      } else if (spaceRoadmapKey === "feishu-docs") {
        openDataSourceModal("飞书文档", true);
      } else if (spaceRoadmapKey === "semi-structured") {
        openDataSourceModal("XML", true);
      } else if (spaceRoadmapKey === "data-authorization") {
        activateResourceTab("data");
        showResourceRoadmapNote(
          {
            month: "9 月上线",
            title: "数据资源授权",
            desc: "空间管理员可将数据表授权给指定成员、组织空间或项目，并配置浏览、使用、下载等权限。",
          },
          document.querySelector(".data-table-panel"),
        );
      } else if (
        spaceRoadmapKey === "resource-portal" ||
        spaceRoadmapKey === "resource-auth-application"
      ) {
        showResourceRoadmapNote(
          {
            month: "逐步上线",
            title:
              spaceRoadmapKey === "resource-portal"
                ? "统一资源管理门户"
                : "统一资源授权与申请",
            desc: "主体区域统一承载文档、本体、数据表等资源的查询、详情、授权、共享和申请。9 月已有文档相关能力，10—11 月陆续纳入本体与数据表。",
            rollout: true,
          },
          document.querySelector(".space-main"),
        );
      }
    }
    if (app === "portal" && page === "projects") {
      var activeProjectSpace = "赛豆企业空间",
        projectRole = "all",
        activeProjectRow = null;
      function updateProjectList() {
        var q = document
            .getElementById("projectSearch")
            .value.trim()
            .toLowerCase(),
          visible = 0;
        document
          .querySelectorAll(".portal-project-row")
          .forEach(function (row) {
            var show =
              row.dataset.space === activeProjectSpace &&
              (projectRole === "all" || row.dataset.role === projectRole) &&
              (!q || row.textContent.toLowerCase().includes(q));
            row.style.display = show ? "grid" : "none";
            if (show) visible++;
          });
        document.getElementById("projectSpaceSummary").textContent =
          "当前空间共 " + visible + " 个项目，点击项目从右侧查看与配置";
        document
          .getElementById("projectEmpty")
          .classList.toggle("show", visible === 0);
      }
      function openCreateProject(space) {
        activeProjectSpace = space || activeProjectSpace;
        document.getElementById("projectSpaceTitle").textContent =
          activeProjectSpace;
        openModal(
          "新建项目",
          "项目将创建在“" +
            activeProjectSpace +
            "”中，创建后可在项目抽屉中调整成员与权限。",
          '<div class="form-grid"><div class="field"><label>项目名称</label><input class="input" id="newProjectName" value="新项目"></div><div class="field"><label>所属空间</label><input class="input" value="' +
            activeProjectSpace +
            '" disabled></div></div><div class="field"><label>项目说明</label><textarea class="textarea" id="newProjectDesc" placeholder="说明项目目标与使用范围"></textarea></div><div class="form-grid"><div class="field"><label>项目类型</label><select class="input"><option>公共项目</option><option>临时专项</option><option>个人项目</option></select></div><div class="field"><label>默认权限模式</label><select class="input"><option>项目独立权限</option><option>继承所属空间</option></select></div></div><div class="field"><label>项目管理员</label><div class="member-pick-list"><label><input type="checkbox" checked> 陈宇 · 数字化中心</label><label><input type="checkbox"> 张敏 · 客户运营部</label><label><input type="checkbox"> 王晨 · 渠道管理部</label></div></div>',
          "创建项目",
          function () {
            var name =
                document.getElementById("newProjectName").value.trim() ||
                "未命名项目",
              desc =
                document.getElementById("newProjectDesc").value.trim() ||
                "暂无项目说明",
              wrap = document.createElement("div");
            wrap.innerHTML = projectRowHtml([
              activeProjectSpace,
              "admin",
              name,
              desc,
              "1",
              "0",
              "0",
              "0",
              "刚刚",
            ]);
            document.getElementById("projectEmpty").before(wrap.firstChild);
            document
              .querySelectorAll("[data-project-space]")
              .forEach(function (x) {
                x.classList.toggle(
                  "active",
                  x.dataset.projectSpace === activeProjectSpace,
                );
              });
            updateProjectList();
            toast("项目“" + name + "”已创建");
          },
          true,
        );
      }
      function switchProjectDrawerTab(name) {
        document
          .querySelectorAll("[data-project-drawer-tab]")
          .forEach(function (x) {
            x.classList.toggle("active", x.dataset.projectDrawerTab === name);
          });
        document
          .querySelectorAll("[data-project-drawer-view]")
          .forEach(function (x) {
            x.classList.toggle("active", x.dataset.projectDrawerView === name);
          });
      }
      function showProjectDrawerRoadmap(config) {
        var box = document.getElementById("projectDrawerRoadmap");
        if (!config) {
          box.innerHTML = "";
          box.classList.remove("show");
          return;
        }
        box.innerHTML =
          "<span>" +
          config.month +
          "</span><div><b>" +
          config.title +
          "</b><p>" +
          config.desc +
          '</p></div><button title="关闭说明">×</button>';
        box.classList.add("show");
        box.querySelector("button").onclick = function () {
          box.classList.remove("show");
        };
      }
      function openProjectDrawer(row, startTab, roadmap) {
        activeProjectRow = row;
        var admin = row.dataset.role === "admin",
          drawer = document.getElementById("projectDetailDrawer");
        document.getElementById("projectDrawerName").textContent =
          row.dataset.name;
        document.getElementById("projectDrawerDesc").textContent =
          row.dataset.desc;
        document.getElementById("projectDrawerSpace").textContent =
          row.dataset.space + " / 项目";
        document.getElementById("projectProfileSpace").textContent =
          row.dataset.space;
        document.getElementById("projectDrawerUpdated").textContent =
          "最近更新 " + row.dataset.updated;
        document.getElementById("projectDrawerRole").textContent = admin
          ? "项目管理员"
          : "普通成员";
        document
          .getElementById("projectDrawerRole")
          .classList.toggle("member", !admin);
        document.getElementById("projectMemberCount").textContent =
          row.dataset.members;
        document.getElementById("projectOntologyCount").textContent =
          row.dataset.ontology;
        document.getElementById("projectKbCount").textContent = Math.max(
          1,
          Math.round(Number(row.dataset.ontology) / 10),
        );
        document.getElementById("projectDocumentCount").textContent =
          row.dataset.docs;
        document.getElementById("projectSourceCount").textContent =
          row.dataset.sources;
        document.getElementById("projectWorkbenchLink").href =
          "ontology-workbench.html?project=" +
          encodeURIComponent(row.dataset.name);
        document.getElementById("addProjectMember").disabled = !admin;
        document.getElementById("projectEdit").disabled = !admin;
        document.getElementById("saveProjectPermissions").disabled = !admin;
        document
          .querySelectorAll(
            ".project-member-role,.project-member-delete,.project-permission-matrix select,.project-policy-switches .switch,.project-permission-mode button",
          )
          .forEach(function (x) {
            x.disabled = !admin;
          });
        document
          .getElementById("projectMemberState")
          .classList.toggle("readonly", !admin);
        document
          .getElementById("projectMemberState")
          .querySelector("b").textContent = admin
          ? "当前为项目管理员视图"
          : "当前为项目成员只读视图";
        document
          .getElementById("projectMemberState")
          .querySelector("small").textContent = admin
          ? "可添加成员、移除成员或修改项目角色；项目管理员不得少于 1 人。"
          : "普通成员可查看项目配置，但不能修改成员角色与权限。";
        showProjectDrawerRoadmap(roadmap);
        switchProjectDrawerTab(startTab || "overview");
        drawer.classList.add("open");
        drawer.setAttribute("aria-hidden", "false");
        document.getElementById("projectDrawerMask").classList.add("open");
      }
      function closeProjectDrawer() {
        document.getElementById("projectDetailDrawer").classList.remove("open");
        document
          .getElementById("projectDetailDrawer")
          .setAttribute("aria-hidden", "true");
        document.getElementById("projectDrawerMask").classList.remove("open");
      }
      document.getElementById("projectSpaceTree").onclick = function (e) {
        var create = e.target.closest("[data-create-project-space]");
        if (create) {
          e.stopPropagation();
          openCreateProject(create.dataset.createProjectSpace);
          return;
        }
        var row = e.target.closest("[data-project-space]");
        if (!row) return;
        if (e.target.closest(".tree-caret")) {
          var children = row
            .closest(".org-tree-node")
            .querySelector(":scope > .org-children");
          if (children) {
            var closed = children.style.display === "none";
            children.style.display = closed ? "block" : "none";
            row.querySelector(".tree-caret").textContent = closed ? "⌄" : "›";
          }
          return;
        }
        document.querySelectorAll("[data-project-space]").forEach(function (x) {
          x.classList.toggle("active", x === row);
        });
        activeProjectSpace = row.dataset.projectSpace;
        document.getElementById("projectSpaceTitle").textContent =
          activeProjectSpace;
        updateProjectList();
      };
      document.getElementById("projectSpaceSearch").oninput = function () {
        var q = this.value.trim().toLowerCase();
        document.querySelectorAll("[data-project-space]").forEach(function (x) {
          x.style.display =
            !q || x.textContent.toLowerCase().includes(q) ? "flex" : "none";
        });
      };
      document.querySelectorAll("[data-project-filter]").forEach(function (b) {
        b.onclick = function () {
          projectRole = b.dataset.projectFilter;
          document
            .querySelectorAll("[data-project-filter]")
            .forEach(function (x) {
              x.classList.toggle("active", x === b);
            });
          updateProjectList();
        };
      });
      document.getElementById("projectSearch").oninput = updateProjectList;
      document.getElementById("createProjectBtn").onclick = function () {
        openCreateProject(activeProjectSpace);
      };
      document.getElementById("createProjectHere").onclick = function () {
        openCreateProject(activeProjectSpace);
      };
      document.getElementById("projectGrid").onclick = function (e) {
        var row = e.target.closest(".portal-project-row");
        if (row) openProjectDrawer(row, "overview");
      };
      document.getElementById("projectDrawerClose").onclick =
        closeProjectDrawer;
      document.getElementById("projectDrawerMask").onclick = closeProjectDrawer;
      document
        .querySelectorAll("[data-project-drawer-tab]")
        .forEach(function (tab) {
          tab.onclick = function () {
            switchProjectDrawerTab(tab.dataset.projectDrawerTab);
          };
        });
      document.getElementById("addProjectMember").onclick = function () {
        openModal(
          "添加项目成员",
          activeProjectRow ? activeProjectRow.dataset.name : "当前项目",
          '<div class="field"><label>搜索空间成员</label><input class="input" placeholder="输入姓名、邮箱或部门" value="李娜"></div><div class="member-pick-list"><label><input type="radio" name="project-new-member" checked> 李娜 · 市场营销部</label><label><input type="radio" name="project-new-member"> 周新 · 数据平台部</label></div><div class="field"><label>项目角色</label><select class="input" id="newProjectMemberRole"><option>普通成员</option><option>项目管理员</option></select></div>',
          "确认添加",
          function () {
            var role = document.getElementById("newProjectMemberRole").value,
              tr = document.createElement("tr");
            tr.innerHTML =
              '<td><div class="member-name"><i>李</i><span><b>李娜</b><small>lina@knora.com</small></span></div></td><td>市场营销部</td><td><span class="role-chip ' +
              (role === "项目管理员" ? "admin" : "") +
              '">' +
              role +
              '</span></td><td>0 项</td><td>今天</td><td><button class="link-btn project-member-role">修改角色</button><button class="link-btn danger project-member-delete">移除</button></td>';
            document.querySelector("#projectMemberTable tbody").appendChild(tr);
            toast("李娜已加入项目");
          },
          true,
        );
      };
      document.getElementById("projectMemberTable").onclick = function (e) {
        var tr = e.target.closest("tr");
        if (!tr) return;
        if (e.target.closest(".project-member-delete")) {
          var name = tr.querySelector(".member-name b").textContent;
          tr.remove();
          toast("已将“" + name + "”移出项目");
          return;
        }
        if (e.target.closest(".project-member-role")) {
          var chip = tr.querySelector(".role-chip"),
            name = tr.querySelector(".member-name b").textContent;
          openModal(
            "修改项目角色",
            name +
              " · " +
              (activeProjectRow ? activeProjectRow.dataset.name : "当前项目"),
            '<div class="field"><label>项目角色</label><select class="input" id="editProjectMemberRole"><option ' +
              (chip.textContent === "项目管理员" ? "selected" : "") +
              ">项目管理员</option><option " +
              (chip.textContent === "普通成员" ? "selected" : "") +
              '>普通成员</option></select></div><div class="data-source-tip">项目管理员可维护成员、角色、资源授权与项目权限。</div>',
            "保存角色",
            function () {
              var role = document.getElementById("editProjectMemberRole").value;
              chip.textContent = role;
              chip.classList.toggle("admin", role === "项目管理员");
              toast(name + "的项目角色已更新");
            },
            true,
          );
        }
      };
      document.getElementById("projectMemberSearch").oninput = function () {
        var q = this.value.trim().toLowerCase();
        document
          .querySelectorAll("#projectMemberTable tbody tr")
          .forEach(function (x) {
            x.style.display =
              !q || x.textContent.toLowerCase().includes(q)
                ? "table-row"
                : "none";
          });
      };
      document
        .querySelectorAll("[data-project-permission-mode]")
        .forEach(function (b) {
          b.onclick = function () {
            document
              .querySelectorAll("[data-project-permission-mode]")
              .forEach(function (x) {
                x.classList.toggle("active", x === b);
              });
            toast("已切换为“" + b.querySelector("b").textContent + "”");
          };
        });
      document
        .querySelectorAll(".project-policy-switches .switch")
        .forEach(function (b) {
          b.onclick = function () {
            b.classList.toggle("on");
          };
        });
      document.getElementById("saveProjectPermissions").onclick = function () {
        toast("项目权限配置已保存");
      };
      document.getElementById("projectEdit").onclick = function () {
        if (!activeProjectRow) return;
        openModal(
          "编辑项目信息",
          activeProjectRow.dataset.name,
          '<div class="field"><label>项目名称</label><input class="input" value="' +
            activeProjectRow.dataset.name +
            '"></div><div class="field"><label>项目说明</label><textarea class="textarea">' +
            activeProjectRow.dataset.desc +
            "</textarea></div>",
          "保存修改",
          function () {
            toast("项目信息已保存");
          },
          true,
        );
      };
      var projectRoadmapKey = new URLSearchParams(location.search).get(
        "roadmap",
      );
      if (projectRoadmapKey === "project-create") {
        var note = document.getElementById("projectRoadmapNote");
        note.innerHTML =
          '<section class="roadmap-context-note project-roadmap-note"><span class="roadmap-month">9 月上线</span><div><b>项目创建</b><p>可从页面顶部、当前空间，或左侧任一空间节点的 + 按钮创建项目。</p></div></section>';
        document
          .getElementById("createProjectBtn")
          .classList.add("roadmap-target-highlight");
        document
          .getElementById("createProjectHere")
          .classList.add("roadmap-target-highlight");
      } else if (
        projectRoadmapKey === "project-members" ||
        projectRoadmapKey === "project-permissions"
      ) {
        var target = document.querySelector(
            '.portal-project-row[data-role="admin"]',
          ),
          members = projectRoadmapKey === "project-members";
        openProjectDrawer(
          target,
          members ? "members" : "permissions",
          members
            ? {
                month: "9 月上线",
                title: "项目成员管理",
                desc: "项目管理员可在成员列表中添加成员、移除成员并修改项目角色。",
              }
            : {
                month: "11 月上线",
                title: "项目权限管理",
                desc: "统一配置权限模式、角色资源权限矩阵，并跟踪项目资源授权和使用情况。",
              },
        );
        (members
          ? document.querySelector(".project-member-toolbar")
          : document.querySelector(".project-permission-section")
        ).classList.add("roadmap-target-highlight");
      }
      updateProjectList();
    }
    if (app === "portal" && page === "tags") {
      document.getElementById("tagSearch").oninput = function () {
        var q = this.value.trim().toLowerCase();
        document.querySelectorAll("#tagCloud [data-tag]").forEach(function (x) {
          x.style.display =
            !q || x.textContent.toLowerCase().includes(q) ? "flex" : "none";
        });
      };
      document.getElementById("createTagBtn").onclick = function () {
        openModal(
          "新建标签",
          "标签可应用于多种知识资产。",
          '<div class="field"><label>标签名称</label><input class="input" placeholder="请输入标签名称"></div><div class="field"><label>标签类型</label><select class="input"><option>业务主题</option><option>内容类型</option><option>对象分类</option><option>治理主题</option></select></div>',
          "创建标签",
          function () {
            toast("标签已创建");
          },
        );
      };
      document.getElementById("editTagPermission").onclick = function () {
        openModal(
          "配置标签权限",
          "按角色配置标签查看、使用、维护与审批权限。",
          '<div class="tag-permission-edit"><div class="field"><label>角色</label><select class="input"><option>空间管理员</option><option>项目管理员</option><option>普通成员</option></select></div><div class="field"><label>允许操作</label><div class="inline-checks"><label><input type="checkbox" checked> 查看标签</label><label><input type="checkbox" checked> 使用标签</label><label><input type="checkbox"> 创建与维护</label><label><input type="checkbox"> 审批标签变更</label></div></div><div class="field"><label>作用范围</label><select class="input"><option>所属空间及下级空间</option><option>仅所属空间</option><option>当前项目</option></select></div></div>',
          "保存权限",
          function () {
            toast("标签权限配置已保存");
          },
          true,
        );
      };
      document.querySelectorAll("[data-tag]").forEach(function (b) {
        b.onclick = function () {
          toast("已按“" + b.dataset.tag + "”筛选相关资产");
        };
      });
      var tagRoadmapKey = new URLSearchParams(location.search).get("roadmap"),
        tagRoadmapConfig =
          tagRoadmapKey === "tag-system-upgrade"
            ? {
                month: "9 月上线",
                title: "标签体系升级",
                desc: "升级为企业统一标签体系，统一标签空间、标签集、标准标签及跨空间映射，并逐步对接各类资源。",
                target: "tagSystemPanel",
              }
            : tagRoadmapKey === "tag-permission"
              ? {
                  month: "11 月上线",
                  title: "标签权限管理",
                  desc: "按平台、空间、项目角色配置标签的查看、使用、维护与审批权限。",
                  target: "tagPermissionPanel",
                }
              : null;
      if (tagRoadmapConfig) {
        var tagRoadmapTarget = document.getElementById(tagRoadmapConfig.target),
          tagRoadmapNote = document.createElement("section");
        tagRoadmapNote.className = "roadmap-context-note tag-roadmap-note";
        tagRoadmapNote.innerHTML =
          '<span class="roadmap-month">' +
          tagRoadmapConfig.month +
          "</span><div><b>" +
          tagRoadmapConfig.title +
          "</b><p>" +
          tagRoadmapConfig.desc +
          '</p></div><button type="button" aria-label="关闭规划说明">×</button>';
        tagRoadmapTarget.before(tagRoadmapNote);
        tagRoadmapTarget.classList.add("roadmap-target-highlight");
        tagRoadmapNote.querySelector("button").onclick = function () {
          tagRoadmapNote.remove();
          tagRoadmapTarget.classList.remove("roadmap-target-highlight");
          history.replaceState(null, "", location.pathname + location.hash);
        };
        requestAnimationFrame(function () {
          tagRoadmapTarget.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        });
      }
    }
    if (app === "jinglun") {
      var jinglunSearch = document.getElementById("jinglunProjectSearch");
      if (jinglunSearch)
        jinglunSearch.oninput = function () {
          var q = this.value.trim().toLowerCase();
          document
            .querySelectorAll(".jinglun-project-card")
            .forEach(function (card) {
              card.style.display =
                !q || card.textContent.toLowerCase().includes(q)
                  ? "flex"
                  : "none";
            });
        };
      var jinglunGrid = document.getElementById("jinglunProjectGrid");
      if (jinglunGrid)
        jinglunGrid.onclick = function (e) {
          var card = e.target.closest("[data-jinglun-project]");
          if (!card) return;
          var key = card.dataset.jinglunProject;
          try {
            localStorage.setItem("knora:lastProject", key);
          } catch (err) {}
          location.href = "jinglun.html?view=project-overview&project=" + key;
        };
      var librarySearch = document.getElementById("jinglunLibrarySearch");
      if (librarySearch)
        librarySearch.oninput = function () {
          var q = this.value.trim().toLowerCase();
          document
            .querySelectorAll(".jinglun-library-rows .jinglun-table-row")
            .forEach(function (row) {
              row.style.display =
                !q || row.textContent.toLowerCase().includes(q)
                  ? "grid"
                  : "none";
            });
        };
      var resourceSegment = document.querySelector(
        ".jinglun-resource-panel .jinglun-segment",
      );
      if (resourceSegment)
        resourceSegment.onclick = function (e) {
          var b = e.target.closest("button");
          if (!b) return;
          resourceSegment.querySelectorAll("button").forEach(function (x) {
            x.classList.toggle("active", x === b);
          });
          document
            .querySelectorAll(".jinglun-resource-row")
            .forEach(function (row) {
              row.style.display =
                b.textContent === "全部" ||
                row.children[1].textContent === b.textContent
                  ? "grid"
                  : "none";
            });
        };
      var applyResource = document.getElementById("jinglunApplyResource");
      if (applyResource)
        applyResource.onclick = function () {
          openModal(
            "申请项目资源",
            "资源申请结果与本体管理共享，审批通过后可立即用于 Pipeline 与文档抽取。",
            '<div class="jinglun-resource-request"><section><b>选择来源空间</b><label class="active"><input type="radio" name="jl-space" checked> 客户运营部 <small>项目所在空间</small></label><label><input type="radio" name="jl-space"> 市场营销域 <small>上级空间</small></label><label><input type="radio" name="jl-space"> 客户运营部 / 重点客户组 <small>子空间</small></label></section><section><b>选择资源</b><label><input type="checkbox" checked> 客户经营指标口径.docx <small>文档</small></label><label><input type="checkbox" checked> customer_profile_wide <small>数据表</small></label><label><input type="checkbox"> 客户标签本体 <small>本体</small></label><label><input type="checkbox"> 重点客户知识库 <small>知识库</small></label></section></div><div class="jinglun-approval-chain"><b>审批链</b><span><i>1</i>陈宇提交</span><em>→</em><span><i>2</i>空间管理员审批</span><em>→</em><span><i>3</i>加入统一项目资源池</span></div>',
            "提交申请",
            function () {
              toast("资源申请已提交，并同步至本体管理的项目资源列表");
            },
            true,
          );
        };
      var roadmapClose = document.getElementById("jinglunRoadmapClose");
      if (roadmapClose)
        roadmapClose.onclick = function () {
          var note = document.querySelector(".jinglun-roadmap-note");
          if (note) note.remove();
          if (applyResource)
            applyResource.classList.remove("roadmap-target-highlight");
          var projectButton = document.getElementById("globalProjectTrigger");
          if (projectButton)
            projectButton.classList.remove("roadmap-target-highlight", "open");
          var projectPopup = document.getElementById("globalProjectPop");
          if (projectPopup) projectPopup.classList.remove("open");
          var clean = new URL(location.href);
          clean.searchParams.delete("roadmap");
          history.replaceState(null, "", clean);
        };
      var extractionReview = document.getElementById("jinglunExtractionReview");
      if (extractionReview) {
        var reviewNames = [
            "抽取结果确认",
            "实体查询与对齐",
            "融合处理",
            "溯源与可视化",
            "审核入库",
          ],
          reviewIndex = 1;
        function setReviewStep(index) {
          reviewIndex = Math.max(1, Math.min(5, Number(index) || 1));
          document
            .querySelectorAll("[data-jlx-review-step]")
            .forEach(function (step) {
              var n = Number(step.dataset.jlxReviewStep);
              step.classList.toggle("active", n === reviewIndex);
              step.classList.toggle("done", n < reviewIndex);
            });
          document
            .querySelectorAll("[data-jlx-review-pane]")
            .forEach(function (pane) {
              pane.classList.toggle(
                "active",
                Number(pane.dataset.jlxReviewPane) === reviewIndex,
              );
            });
          var progress = document.getElementById("jlxReviewProgress"),
            prev = document.getElementById("jlxReviewPrev"),
            next = document.getElementById("jlxReviewNext");
          if (progress) {
            progress.textContent = "步骤 " + reviewIndex + " / 5";
            progress.nextElementSibling.textContent =
              reviewNames[reviewIndex - 1];
          }
          if (prev) prev.disabled = reviewIndex === 1;
          if (next)
            next.textContent =
              reviewIndex === 5
                ? "提交审核并入库"
                : "下一步：" + reviewNames[reviewIndex];
        }
        document
          .querySelectorAll("[data-jlx-review-step]")
          .forEach(function (step) {
            step.onclick = function () {
              setReviewStep(step.dataset.jlxReviewStep);
            };
          });
        document
          .querySelectorAll("[data-jlx-decision]")
          .forEach(function (button) {
            button.onclick = function () {
              button.parentElement
                .querySelectorAll("[data-jlx-decision]")
                .forEach(function (x) {
                  x.classList.toggle("active", x === button);
                });
              toast("确认结果已记录", "可在提交审核前继续修改");
            };
          });
        document
          .querySelectorAll("[data-jlx-visual]")
          .forEach(function (button) {
            button.onclick = function () {
              button.parentElement
                .querySelectorAll("[data-jlx-visual]")
                .forEach(function (x) {
                  x.classList.toggle("active", x === button);
                });
              toast(
                button.dataset.jlxVisual === "graph"
                  ? "已切换到图谱可视化"
                  : "已切换到原文溯源",
              );
            };
          });
        var entityQuery = document.getElementById("jlxEntityQuery");
        if (entityQuery)
          entityQuery.onclick = function () {
            var keyword =
              document.getElementById("jlxEntityKeyword").value.trim() ||
              "当前关键词";
            toast("已查询“" + keyword + "”", "找到 1 个高相似度平台实体");
          };
        var prev = document.getElementById("jlxReviewPrev");
        if (prev)
          prev.onclick = function () {
            setReviewStep(reviewIndex - 1);
          };
        var next = document.getElementById("jlxReviewNext");
        if (next)
          next.onclick = function () {
            if (reviewIndex < 5) {
              setReviewStep(reviewIndex + 1);
              return;
            }
            openModal(
              "提交审核并入库",
              "确认本次抽取结果、融合决策和入库目标。",
              '<div class="jlx-review-modal"><section><span><i>✓</i><b>结果确认</b><small>308 项通过，18 项已完成人工决策</small></span><em>已完成</em></section><section><span><i>溯</i><b>来源与版本</b><small>全部结果保留文档坐标、处理记录与版本</small></span><em>可追溯</em></section><section><span><i>库</i><b>入库目标</b><small>质量管理本体、供应商实体数据</small></span><em>待审核</em></section></div>',
              "提交审核",
              function () {
                toast("已提交审核", "审核通过后写入选择的目标");
              },
              true,
            );
          };
        var newFlow = document.getElementById("jlxNewFlow");
        if (newFlow)
          newFlow.onclick = function () {
            toast("新建抽取任务", "将从项目资源与抽取模板配置开始");
          };
        var jlxClose = document.getElementById("jlxRoadmapClose");
        if (jlxClose)
          jlxClose.onclick = function () {
            var note = document.querySelector(".jlx-roadmap-note");
            if (note) note.remove();
            extractionReview.classList.remove("roadmap-target-highlight");
            var cleanExtractionUrl = new URL(location.href);
            cleanExtractionUrl.searchParams.delete("roadmap");
            cleanExtractionUrl.searchParams.delete("stage");
            history.replaceState(null, "", cleanExtractionUrl);
          };
        setReviewStep(1);
        if (
          new URLSearchParams(location.search).get("roadmap") ===
          "hybrid-knowledge-extraction"
        )
          setTimeout(function () {
            extractionReview.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }, 120);
      }
    }
    if (app === "ontology" || jinglunInProject()) {
      var projectTrigger = document.getElementById("globalProjectTrigger"),
        projectPop = document.getElementById("globalProjectPop");
      function applyJinglunProject(key, notify) {
        var p = sharedProjects[key] || sharedProjects.personal;
        try {
          localStorage.setItem("knora:lastProject", key);
        } catch (e) {}
        document.getElementById("globalProjectName").textContent = p.name;
        document.getElementById("globalProjectPath").textContent = p.path;
        document.getElementById("globalProjectKind").textContent = p.kind;
        var pageProjectName = document.getElementById("jinglunProjectName"),
          sideProjectName = document.getElementById("jinglunSideProjectName");
        if (pageProjectName) pageProjectName.textContent = p.name;
        if (sideProjectName) sideProjectName.textContent = p.name;
        document.querySelectorAll("[data-project-key]").forEach(function (row) {
          row.classList.toggle("active", row.dataset.projectKey === key);
        });
        projectPop.classList.remove("open");
        projectTrigger.classList.remove("open");
        if (app === "jinglun") {
          var next = new URL(location.href);
          next.searchParams.set("project", key);
          location.href = next.toString();
          return;
        }
        if (notify)
          toast("已切换至“" + p.name + "”，经纶与本体管理将沿用同一项目范围");
      }
      projectTrigger.onclick = function (e) {
        e.stopPropagation();
        projectPop.classList.toggle("open");
        projectTrigger.classList.toggle(
          "open",
          projectPop.classList.contains("open"),
        );
      };
      document.getElementById("globalProjectList").onclick = function (e) {
        var row = e.target.closest("[data-project-key]");
        if (row) applyJinglunProject(row.dataset.projectKey, true);
      };
      document.getElementById("globalProjectSearch").oninput = function () {
        var q = this.value.trim().toLowerCase();
        document.querySelectorAll("[data-project-key]").forEach(function (row) {
          row.style.display =
            !q || row.textContent.toLowerCase().includes(q) ? "flex" : "none";
        });
      };
      document.addEventListener("click", function (e) {
        if (!e.target.closest(".global-project-switch")) {
          projectPop.classList.remove("open");
          projectTrigger.classList.remove("open");
        }
      });
      var ontologyProjectRoadmap = new URLSearchParams(location.search).get(
        "roadmap",
      );
      if (
        app === "ontology" &&
        (ontologyProjectRoadmap === "project-knowledge-base" ||
          ontologyProjectRoadmap === "project-ontology")
      ) {
        var ontologyRoadmapNote = document.createElement("section"),
          isKnowledge = ontologyProjectRoadmap === "project-knowledge-base";
        ontologyRoadmapNote.className =
          "roadmap-context-note ontology-project-roadmap-note";
        ontologyRoadmapNote.innerHTML =
          '<span class="roadmap-month">' +
          (isKnowledge ? "9 月上线" : "10 月上线") +
          "</span><div><b>" +
          (isKnowledge ? "知识库基于项目管理" : "本体基于项目管理") +
          "</b><p>知识库已纳入本体管理模块，两类能力共用顶部项目切换器，切换后本体、知识库与相关资源同步变更项目范围。</p></div>";
        document.getElementById("content").prepend(ontologyRoadmapNote);
        projectPop.classList.add("open");
        projectTrigger.classList.add("open", "roadmap-target-highlight");
      }
      if (
        app === "jinglun" &&
        ontologyProjectRoadmap === "jinglun-project-auth"
      ) {
        projectPop.classList.add("open");
        projectTrigger.classList.add("open", "roadmap-target-highlight");
        setTimeout(function () {
          var target = document.getElementById("jinglunApplyResource");
          if (target)
            target.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 120);
      }
    }
    if (app === "ontology" && page === "overview") {
      var graphRoot = document.getElementById("enterpriseSemanticGraph"),
        graphSearch = document.getElementById("semanticGraphSearch"),
        graphType = document.getElementById("semanticGraphType"),
        graphTag = document.getElementById("semanticGraphTag");
      function filterSemanticGraph() {
        var q = graphSearch.value.trim().toLowerCase(),
          type = graphType.value,
          tag = graphTag.value;
        graphRoot.querySelectorAll(".semantic-node").forEach(function (node) {
          var visible =
            (!q || node.dataset.graphName.toLowerCase().includes(q)) &&
            (type === "all" || node.dataset.graphType === type) &&
            (tag === "all" || node.dataset.graphTags.includes(tag));
          node.classList.toggle("is-filtered", !visible);
        });
      }
      graphSearch.oninput = filterSemanticGraph;
      graphType.onchange = filterSemanticGraph;
      graphTag.onchange = function () {
        filterSemanticGraph();
        toast(this.value === "all" ? "已显示全部标签" : "已按标签“" + this.value + "”筛选");
      };
      graphRoot.querySelectorAll("[data-semantic-action]").forEach(function (button) {
        button.onclick = function () {
          toast(button.dataset.semanticAction + "功能已打开（原型示意）");
        };
      });
    }
    if (app === "ontology" && page === "projects") {
      document.getElementById("ontologyProjectSearch").oninput = function () {
        var q = this.value.trim().toLowerCase();
        document
          .querySelectorAll("#ontologyProjectRows tr")
          .forEach(function (x) {
            x.style.display =
              !q || x.textContent.toLowerCase().includes(q)
                ? "table-row"
                : "none";
          });
      };
    }
    if (app === "operations") {
      var opsRoadmapNote = document.querySelector(".ops-roadmap-note"),
        opsRoadmapTarget = document.querySelector(
          ".ops-capability.roadmap-target-highlight",
        );
      if (opsRoadmapNote && opsRoadmapTarget) {
        opsRoadmapNote.querySelector("button").onclick = function () {
          opsRoadmapNote.remove();
          opsRoadmapTarget.classList.remove("roadmap-target-highlight");
          history.replaceState(null, "", location.pathname);
        };
        requestAnimationFrame(function () {
          opsRoadmapTarget.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        });
      }
    }
  }
  function bindTenantSelector() {
    document
      .querySelectorAll("[data-tenant-choice]")
      .forEach(function (button) {
        button.onclick = function (e) {
          e.stopPropagation();
          var next = tenantCatalog[button.dataset.tenantChoice];
          if (!next) return;
          try {
            localStorage.setItem("knora:tenant", next.id);
          } catch (err) {}
          applyTenantContext();
          var menu = document.getElementById("profileMenu"),
            trigger = document.getElementById("profileTrigger");
          if (menu) menu.classList.remove("open");
          if (trigger) trigger.setAttribute("aria-expanded", "false");
          toast("已切换至“" + next.name + "”，顶部空间与组织根目录已同步更新");
        };
      });
    applyTenantContext();
  }
  function bindUnifiedSidebarCollapse() {
    var workspace = document.querySelector(".workspace"),
      sidebar = workspace && workspace.querySelector(":scope > .sidebar"),
      button = document.createElement("button"),
      collapsed = false;
    if (!workspace || !sidebar || body.classList.contains("standalone-product"))
      return;
    button.type = "button";
    button.id = "sidebarCollapseToggle";
    button.className = "sidebar-collapse-trigger";
    button.setAttribute("aria-label", "收起左侧菜单");
    button.setAttribute("aria-expanded", "true");
    button.innerHTML =
      '<span class="sidebar-collapse-glyph" aria-hidden="true"><i></i><i></i><i></i></span><em>收起左侧菜单</em>';
    function apply(next) {
      collapsed = next;
      workspace.classList.toggle("sidebar-collapsed", collapsed);
      body.classList.toggle("sidebar-is-collapsed", collapsed);
      button.classList.toggle("is-collapsed", collapsed);
      button.querySelector("em").textContent = collapsed
        ? "展开左侧菜单"
        : "收起左侧菜单";
      button.setAttribute(
        "aria-label",
        collapsed ? "展开左侧菜单" : "收起左侧菜单",
      );
      button.setAttribute("aria-expanded", collapsed ? "false" : "true");
      try {
        localStorage.setItem(
          "knora:" + app + ":sidebar-collapsed",
          collapsed ? "1" : "0",
        );
      } catch (err) {}
    }
    button.addEventListener("click", function () {
      apply(!collapsed);
    });
    sidebar.appendChild(button);
    try {
      collapsed =
        localStorage.getItem("knora:" + app + ":sidebar-collapsed") === "1";
    } catch (err) {}
    apply(collapsed);
  }
  function bindApprovalNotifications() {
    var trigger = document.getElementById("approvalNotificationTrigger"),
      pop = document.getElementById("approvalNotificationPop");
    if (!trigger || !pop) return;
    if (app !== "portal") {
      pop.remove();
      trigger.removeAttribute("id");
      trigger.setAttribute("data-toast", "蓝图原型中的通知中心沿用现有设计");
      return;
    }
    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = pop.classList.toggle("open");
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
      var profile = document.getElementById("profileMenu");
      if (profile) profile.classList.remove("open");
    });
    pop.addEventListener("click", function (e) {
      e.stopPropagation();
    });
    document.addEventListener("click", function () {
      pop.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        pop.classList.remove("open");
        trigger.setAttribute("aria-expanded", "false");
      }
    });
  }
  renderShell();
  document.getElementById("content").innerHTML = currentPage();
  bindGlobal();
  bindPage();
  bindTenantSelector();
  bindUnifiedSidebarCollapse();
  bindApprovalNotifications();
  if (new URLSearchParams(location.search).get("apps") === "open") {
    document.getElementById("appPop").classList.add("open");
    document.getElementById("appTrigger").classList.add("open");
  }
})();
