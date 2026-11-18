(function (global) {
  "use strict";

  /* Knora 统一左侧导航（平铺 + 灰色分类标题，无折叠）
     - 顶部：品牌
     - 全局入口：首页 / 我的 / 资源 / 项目 / 标签 / 运营看板（不受项目约束，页面顶部无固定栏）
     - 项目制入口：数据与知识、本体构建、本体建模、本体逻辑、本体行动、本体浏览
       （进入后页面顶部出现固定栏，含项目切换）
     - 底部：用户与通知
     本体管理页内二级入口为 button.ontology-module（页内切换）；其余页面为链接。 */

  var script = document.currentScript;
  if (script && script.src) {
    var cssHref = script.src.replace(/unified-nav\.js(\?.*)?$/, "unified-nav.css$1");
    if (!document.querySelector('link[href="' + cssHref + '"]')) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssHref;
      document.head.appendChild(link);
    }
  }

  var KB_PAGE = "knowledge-base-management.html";
  var SCROLL_KEY = "knora:nav-scroll";

  var ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    network: '<circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="5.5" r="2.6"/><circle cx="18" cy="18.5" r="2.6"/><path d="m8.3 10.8 7.4-4M8.3 13.2l7.4 4"/>',
    chart: '<path d="M3 3v18h18"/><path d="M8 17v-5M13 17V8M18 17v-8"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>',
    book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 21.5V4.5M8 7h8"/>',
    build: '<path d="M12 2.8 20 7.4v9.2l-8 4.6-8-4.6V7.4z"/><path d="M4 7.4l8 4.6 8-4.6M12 12v9.2"/>',
    graph: '<circle cx="12" cy="12" r="2.6"/><circle cx="5" cy="5.5" r="2"/><circle cx="19" cy="5.5" r="2"/><circle cx="12" cy="20" r="2"/><path d="m6.6 6.8 3.4 3.4M17.4 6.8l-3.4 3.4M12 14.6V18"/>',
    weave: '<circle cx="5" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="12" r="2"/><path d="M7 6h3a4 4 0 0 1 4 4v.5M7 18h3a4 4 0 0 0 4-4v-.5M14 12h3"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 12.5 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
    logic: '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="12" r="2"/><path d="M6 7v10"/><path d="M6 12h6a4 4 0 0 1 4 0"/>',
    rule: '<path d="M12 3 4.5 6v5.5c0 4.5 3 8 7.5 9.5 4.5-1.5 7.5-5 7.5-9.5V6z"/><path d="m9 12 2 2 4-4"/>',
    action: '<path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12z"/>',
    tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    insight: '<path d="M3 3v18h18"/><path d="m7 15 4-4.5 3 3L20 7"/><path d="M16 7h4v4"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  };
  function svg(name) {
    return (
      '<svg class="un-ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
      (ICONS[name] || "") +
      "</svg>"
    );
  }

  /* 全局入口（不受项目约束） */
  var globalItems = [
    { page: "home", label: "首页", icon: "home", href: "portal-home.html" },
    { page: "mine", label: "我的", icon: "user", href: "portal-mine.html" },
    { page: "resources", label: "资源", icon: "database", href: "portal-resources.html" },
    { page: "projects", label: "项目", icon: "folder", href: "portal-projects.html" },
    { page: "tags", label: "标签", icon: "tag", href: "portal-tags.html" },
    { app: "operations", label: "运营看板", icon: "chart", href: "operations-dashboard.html" },
  ];

  /* 项目制入口。hidden:true 的分组暂不展示，保留定义便于恢复。
     module：本体管理页内的模块 key；href：独立页面。 */
  var projectGroups = [
    {
      title: "本体建模",
      items: [
        { module: "aigo", label: "本体自动构建", icon: "spark", badge: "AI" },
        { module: "graph", label: "语义图谱", icon: "network" },
        { module: "entity", label: "业务对象", icon: "build" },
        { module: "relation", label: "业务关联", icon: "weave" },
        { module: "event", label: "事实明细", icon: "layers" },
      ],
    },
    {
      title: "本体逻辑",
      items: [
        { module: "flow", label: "业务流程", icon: "logic" },
        { module: "rule", label: "业务规则", icon: "rule" },
      ],
    },
    {
      title: "本体行动",
      items: [
        { module: "action", label: "业务操作与行为", icon: "action" },
        { module: "tool", label: "工具与模型", icon: "tool" },
      ],
    },
    {
      title: "智能应用",
      hidden: true,
      items: [
        { module: "skill", label: "技能", icon: "spark" },
        { module: "reasoning", label: "智能体", icon: "graph" },
        { module: "ui", label: "用户界面", icon: "grid" },
      ],
    },
    {
      title: "本体浏览",
      items: [
        { app: "entity", label: "实体看板", icon: "grid", href: "entity-dashboard.html" },
        { app: "graph", label: "图析", icon: "insight", href: "graph-analysis.html" },
      ],
    },
    {
      title: "数据与知识",
      items: [
        { module: "dataset", label: "数据集", icon: "database" },
        { module: "knowledge", label: "知识库", icon: "book" },
      ],
    },
    {
      title: "经纶",
      hidden: true,
      items: [{ app: "jinglun", label: "经纶", icon: "weave", href: "jinglun.html?view=project-overview" }],
    },
  ];

  function row(item, o) {
    var active = o.active;
    var inner =
      '<span class="nav-icon">' +
      svg(item.icon) +
      "</span><span><b>" +
      item.label +
      "</b></span>" +
      (item.badge ? "<em>" + item.badge + "</em>" : "");
    var attrs =
      ' title="' +
      item.label +
      '"' +
      (active ? ' aria-current="page"' : "") +
      (o.dataApp ? ' data-app="' + o.dataApp + '"' : "");
    if (o.button) {
      return (
        '<button type="button" class="nav-link ontology-module' +
        (active ? " active" : "") +
        '" data-module="' +
        item.module +
        '"' +
        attrs +
        ">" +
        inner +
        "</button>"
      );
    }
    return (
      '<a class="nav-link' +
      (active ? " active" : "") +
      '" href="' +
      o.href +
      '"' +
      attrs +
      ">" +
      inner +
      "</a>"
    );
  }

  /* ctx: { app, page, module, asButton } */
  function html(ctx) {
    ctx = ctx || {};
    var app = ctx.app || "portal";
    var onKb = !!ctx.asButton;

    var top = globalItems
      .map(function (item) {
        var active = item.app ? app === item.app : app === "portal" && ctx.page === item.page;
        return row(item, { active: active, href: item.href, dataApp: item.app });
      })
      .join("");

    var groups = projectGroups
      .filter(function (g) {
        return !g.hidden;
      })
      .map(function (g) {
        return (
          '<div class="un-group"><div class="un-cap">' +
          g.title +
          "</div>" +
          g.items
            .map(function (item) {
              if (item.module) {
                var current = app === "ontology" && (ctx.module || (onKb ? "aigo" : "")) === item.module;
                return row(item, {
                  active: current,
                  button: onKb,
                  href: KB_PAGE + "?module=" + item.module,
                  dataApp: "ontology",
                });
              }
              return row(item, { active: app === item.app, href: item.href, dataApp: item.app });
            })
            .join("") +
          "</div>"
        );
      })
      .join("");

    return (
      '<div class="un-pinned"><div class="un-brand"><span class="un-logo">K</span><strong>Mevo Ontology</strong></div>' +
      '<div class="un-group un-global">' +
      top +
      "</div>" +
      '<div class="un-divider"></div></div>' +
      groups
    );
  }

  /* 静态用户与通知（本体管理页使用；其余页面由 blueprint.js 挂入带菜单的版本） */
  function staticDock() {
    return (
      '<div class="un-dock un-dock-static"><a class="profile profile-trigger" href="portal-mine.html" title="陈宇"><span class="avatar">陈</span><span><b>陈宇</b><small>平台管理员</small></span></a>' +
      '<div class="approval-notification-wrap"><a class="top-btn" href="portal-mine.html" aria-label="审批通知">' +
      svg("bell") +
      '<span class="badge">3</span></a></div></div>'
    );
  }

  function bind(host) {
    if (!host || host.__unBound) return;
    host.__unBound = true;
    host.addEventListener("click", function (e) {
      if (e.target.closest("a.nav-link")) {
        try {
          sessionStorage.setItem(SCROLL_KEY, String(host.scrollTop));
        } catch (err) {}
      }
    });
    host.addEventListener(
      "scroll",
      function () {
        try {
          sessionStorage.setItem(SCROLL_KEY, String(host.scrollTop));
        } catch (e) {}
      },
      { passive: true },
    );
    function restore() {
      try {
        var saved = Number(sessionStorage.getItem(SCROLL_KEY));
        if (saved > 0) host.scrollTop = saved;
      } catch (e) {}
      var cur = host.querySelector(".nav-link.active");
      if (!cur) return;
      var hr = host.getBoundingClientRect(),
        cr = cur.getBoundingClientRect();
      if (hr.height && (cr.bottom > hr.bottom - 120 || cr.top < hr.top + 8)) {
        host.scrollTop += cr.top - hr.top - hr.height / 3;
      }
    }
    function dockToggle() {
      var dock = host.querySelector(".un-dock");
      var t = host.querySelector("#sidebarCollapseToggle, .ontology-sidebar-toggle");
      if (dock && t && t.parentNode !== dock) dock.appendChild(t);
    }
    dockToggle();
    new MutationObserver(dockToggle).observe(host, { childList: true });
    requestAnimationFrame(restore);
    window.addEventListener("load", restore);
  }

  /* 渲染到已有容器（本体管理页的 .ontology-side） */
  function renderInto(host, ctx) {
    if (!host) return;
    host.classList.add("unified-nav");
    host.innerHTML = html(ctx) + staticDock();
    bind(host);
  }

  global.KnoraUnifiedNav = {
    html: html,
    bind: bind,
    renderInto: renderInto,
    projectApps: ["ontology", "jinglun", "entity", "graph"],
  };
})(window);
