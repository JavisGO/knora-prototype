(function (global) {
  "use strict";

  /* Knora 统一左侧导航：所有模块共用同一份分组数据，替代顶部「应用中心」弹窗。
     - 普通页面（blueprint.js 渲染）：本体管理 / 经纶的二级菜单为链接
     - 本体管理页（knowledge-base-management.html）：二级菜单为 button.ontology-module，
       沿用页面内的 data-module 切换逻辑
     交互：二级分组同一时间只展开一个；侧栏收起后，二级菜单以悬浮面板展示；
          翻页后保留侧栏滚动位置，并把当前页滚入可视区；分组折叠状态跨页面记忆。 */

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

  /* 线性图标（Lucide 画法，24×24，描边 1.7） */
  var ICONS = {
    action: '<path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12z"/>',
    portal: '<path d="M2.5 5.5C5 4.2 8.5 4.4 12 6.6c3.5-2.2 7-2.4 9.5-1.1V19c-2.5-1.3-6-1.1-9.5 1.1C8.5 17.9 5 17.7 2.5 19z"/><path d="M12 6.6v13.5"/>',
    insight: '<path d="M3 3v18h18"/><path d="m7 15 4-4.5 3 3L20 7"/><path d="M16 7h4v4"/>',
    build: '<path d="M12 2.8 20 7.4v9.2l-8 4.6-8-4.6V7.4z"/><path d="M4 7.4l8 4.6 8-4.6M12 12v9.2"/>',
    graph: '<circle cx="12" cy="12" r="2.6"/><circle cx="5" cy="5.5" r="2"/><circle cx="19" cy="5.5" r="2"/><circle cx="12" cy="20" r="2"/><path d="m6.6 6.8 3.4 3.4M17.4 6.8l-3.4 3.4M12 14.6V18"/>',
    knowledge: '<path d="M6 3h8.5L19 7.5V21H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',
    logic: '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="12" r="2"/><path d="M6 7v10"/><path d="M6 12h6a4 4 0 0 1 4 0"/>',
    smart: '<rect x="4" y="7.5" width="16" height="12" rx="3"/><path d="M12 3.5v4M9 13v1.5M15 13v1.5M2 12v3M22 12v3"/>',
    weave: '<circle cx="5" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="12" r="2"/><path d="M7 6h3a4 4 0 0 1 4 4v.5M7 18h3a4 4 0 0 0 4-4v-.5M14 12h3"/>',
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    network: '<circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="5.5" r="2.6"/><circle cx="18" cy="18.5" r="2.6"/><path d="m8.3 10.8 7.4-4M8.3 13.2l7.4 4"/>',
    chart: '<path d="M3 3v18h18"/><path d="M8 17v-5M13 17V8M18 17v-8"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 12.5 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>',
    book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 21.5V4.5M8 7h8"/>',
    bot: '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M9 13v1.5M15 13v1.5"/>',
    workflow: '<rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="15" y="15" width="6" height="6" rx="1.5"/><path d="M9 6h4a2 2 0 0 1 2 2v7"/>',
  };
  function svg(name) {
    return (
      '<svg class="un-ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
      (ICONS[name] || "") +
      "</svg>"
    );
  }
  var FOLD_KEY = "knora:nav-folded";
  var SCROLL_KEY = "knora:nav-scroll";

  var knowledge = [
    { page: "home", label: "首页 · 综合", icon: "home", href: "portal-home.html" },
    { page: "mine", label: "我的", icon: "user", href: "portal-mine.html" },
    { page: "resources", label: "资源", icon: "database", href: "portal-resources.html" },
    { page: "projects", label: "项目", icon: "folder", href: "portal-projects.html" },
    { page: "tags", label: "标签", icon: "tag", href: "portal-tags.html" },
  ];

  var insight = [
    { app: "entity", label: "实体看板", icon: "grid", href: "entity-dashboard.html" },
    { app: "graph", label: "图析", icon: "network", href: "graph-analysis.html" },
    { app: "operations", label: "运营看板", icon: "chart", href: "operations-dashboard.html" },
  ];

  var ontologyGroups = [
    {
      title: "本体事实层",
      icon: "graph",
      items: [
        { key: "aigo", label: "本体自动构建", badge: "默认" },
        { key: "graph", label: "语义图谱" },
        { key: "entity", label: "业务对象" },
        { key: "relation", label: "业务关联" },
        { key: "event", label: "事实明细" },
      ],
    },
    {
      title: "本体事理层",
      icon: "logic",
      items: [
        { key: "flow", label: "业务流程" },
        { key: "rule", label: "业务规则" },
      ],
    },
    {
      title: "本体行动层",
      icon: "action",
      items: [
        { key: "action", label: "业务操作与行为" },
        { key: "tool", label: "工具与模型" },
      ],
    },
    {
      title: "业务知识",
      icon: "knowledge",
      items: [
        { key: "knowledge", label: "知识库" },
        { key: "faq", label: "FAQ 管理" },
        { key: "dataset", label: "数据集" },
      ],
    },
    {
      title: "智能应用",
      icon: "smart",
      items: [
        { key: "skill", label: "技能" },
        { key: "reasoning", label: "智能体" },
        { key: "ui", label: "用户界面" },
      ],
    },
  ];

  var jinglunGroups = [
    {
      title: "项目运行",
      items: [
        { key: "project-overview", label: "项目概览" },
        { key: "project-flows", label: "流程管理" },
        { key: "project-schedules", label: "调度管理" },
        { key: "project-tasks", label: "任务管理" },
        { key: "project-extraction", label: "非结构化处理" },
      ],
    },
    {
      title: "知识管理",
      items: [
        { key: "operators", label: "算子管理" },
        { key: "rules", label: "规则管理" },
        { key: "templates", label: "流程模板" },
      ],
    },
  ];

  function lastProject() {
    var key = new URLSearchParams(location.search).get("project");
    if (!key) {
      try {
        key = localStorage.getItem("knora:lastProject");
      } catch (e) {}
    }
    return key || "personal";
  }

  function foldedSet() {
    try {
      return JSON.parse(localStorage.getItem(FOLD_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveFolded(list) {
    try {
      localStorage.setItem(FOLD_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function section(key, title, bodyHtml, hasCurrent) {
    var folded = !hasCurrent && foldedSet().indexOf(key) > -1;
    return (
      '<section class="un-section' +
      (folded ? " folded" : "") +
      '" data-un-section="' +
      key +
      '"><button type="button" class="side-group un-group-head" data-un-group aria-expanded="' +
      (folded ? "false" : "true") +
      '"><span>' +
      title +
      '</span><i class="un-chev" aria-hidden="true"></i></button><div class="un-group-body">' +
      bodyHtml +
      "</div></section>"
    );
  }

  function navLink(item, attrs, active) {
    return (
      '<a class="nav-link' +
      (active ? " active" : "") +
      '" href="' +
      item.href +
      '" title="' +
      item.label +
      '"' +
      (active ? ' aria-current="page"' : "") +
      (attrs || "") +
      '><span class="nav-icon">' +
      svg(item.icon) +
      "</span><span><b>" +
      item.label +
      "</b></span></a>"
    );
  }

  function subItem(item, host) {
    var current = host.current === item.key;
    var cls = "un-sub" + (current ? " active" : "");
    var badge = item.badge ? "<em>" + item.badge + "</em>" : "";
    if (host.asButton) {
      return (
        '<button type="button" class="ontology-module ' +
        cls +
        '" data-module="' +
        item.key +
        '"' +
        (current ? ' aria-current="page"' : "") +
        "><span>" +
        item.label +
        "</span>" +
        badge +
        "</button>"
      );
    }
    return (
      '<a class="' +
      cls +
      '" href="' +
      host.href(item.key) +
      '"' +
      (item.app ? ' data-app="' + item.app + '"' : "") +
      (current ? ' aria-current="page"' : "") +
      "><span>" +
      item.label +
      "</span>" +
      badge +
      "</a>"
    );
  }

  function accordion(opts) {
    return (
      '<div class="un-acc' +
      (opts.flat ? " un-flat" : "") +
      (opts.open ? " open" : "") +
      (opts.active ? " has-current" : "") +
      '" data-app="' +
      opts.app +
      '"><button type="button" class="nav-link un-acc-head' +
      (opts.active ? " has-current" : "") +
      '" data-un-acc aria-expanded="' +
      (opts.open ? "true" : "false") +
      '" title="' +
      opts.label +
      '"><span class="nav-icon">' +
      svg(opts.icon) +
      "</span><span><b>" +
      opts.label +
      '</b></span><i class="un-chev" aria-hidden="true"></i></button>' +
      '<div class="un-acc-body"><div class="un-acc-inner"><div class="un-flyout-title">' +
      opts.label +
      "</div>" +
      opts.groups
        .map(function (group) {
          return (
            '<div class="un-sub-group">' +
            (group.title ? '<div class="un-sub-title">' + group.title + "</div>" : "") +
            group.items
              .map(function (item) {
                return subItem(item, opts.host);
              })
              .join("") +
            "</div>"
          );
        })
        .join("") +
      "</div></div></div>"
    );
  }

  /* ctx: { app, page, view, module }  asButton: 本体管理二级用 button（本体管理页内切换） */
  function html(ctx) {
    ctx = ctx || {};
    var app = ctx.app || "portal";
    var project = lastProject();
    var onKb = !!ctx.asButton;

    function linkGroup(label, icon, items, keyOf, isCur) {
      var cur = items.some(isCur);
      return accordion({
        app: "portal",
        label: label,
        icon: icon,
        active: cur,
        open: cur,
        groups: [
          {
            title: "",
            items: items.map(function (i) {
              return { key: keyOf(i), label: i.label, href: i.href, app: i.app };
            }),
          },
        ],
        host: {
          current: (items.filter(isCur)[0] || {}).label ? keyOf(items.filter(isCur)[0]) : "",
          asButton: false,
          href: function (key) {
            return items.filter(function (i) {
              return keyOf(i) === key;
            })[0].href;
          },
        },
      });
    }
    var knowledgeHtml = linkGroup(
      "知识门户",
      "portal",
      knowledge,
      function (i) {
        return i.page;
      },
      function (i) {
        return app === "portal" && ctx.page === i.page;
      },
    );
    var insightHtml = linkGroup(
      "洞察分析",
      "insight",
      insight,
      function (i) {
        return i.app;
      },
      function (i) {
        return app === i.app;
      },
    );

    var ontCur = app === "ontology" ? ctx.module || (onKb ? "aigo" : "") : "";
    var ontologyHtml = ontologyGroups
      .map(function (group) {
        var has = group.items.some(function (i) {
          return i.key === ontCur;
        });
        return accordion({
          app: "ontology",
          label: group.title,
          icon: group.icon,
          active: has,
          open: has,
          groups: [{ title: "", items: group.items }],
          host: {
            current: ontCur,
            asButton: onKb,
            href: function (key) {
              return KB_PAGE + "?module=" + key;
            },
          },
        });
      });

    var jinglunHtml = accordion({
      app: "jinglun",
      label: "经纶",
      icon: "weave",
      active: app === "jinglun",
      open: app === "jinglun",
      groups: jinglunGroups,
      host: {
        current: app === "jinglun" ? ctx.view : "",
        asButton: false,
        href: function (key) {
          return "jinglun.html?view=" + key + "&project=" + project;
        },
      },
    });

    var buildHtml = ontologyHtml.concat([insightHtml, jinglunHtml]).join("");

    return knowledgeHtml + buildHtml;
  }

  function isCollapsed(host) {
    return !!host.closest(".workspace.sidebar-collapsed, .app.ontology-sidebar-collapsed");
  }

  function currentItem(host) {
    return host.querySelector(".un-sub.active, .nav-link.active:not(.un-acc-head)");
  }

  /* 翻页后保持侧栏滚动位置，并确保当前页可见 */
  function restoreScroll(host) {
    try {
      var saved = Number(sessionStorage.getItem(SCROLL_KEY));
      if (saved > 0) host.scrollTop = saved;
    } catch (e) {}
    var cur = currentItem(host);
    if (!cur || isCollapsed(host)) return;
    var hostRect = host.getBoundingClientRect();
    var curRect = cur.getBoundingClientRect();
    if (!hostRect.height) return;
    var margin = 56;
    if (curRect.bottom > hostRect.bottom - margin || curRect.top < hostRect.top + 8) {
      host.scrollTop += curRect.top - hostRect.top - hostRect.height / 3;
    }
  }

  function closeFlyouts(host) {
    host.querySelectorAll(".un-acc.fly").forEach(function (acc) {
      acc.classList.remove("fly");
    });
  }

  function openFlyout(host, acc) {
    closeFlyouts(host);
    var head = acc.querySelector(".un-acc-head");
    var hostRect = host.getBoundingClientRect();
    var headRect = head.getBoundingClientRect();
    var body = acc.querySelector(".un-acc-body");
    acc.style.setProperty("--un-fly-left", hostRect.right + 6 + "px");
    acc.style.setProperty("--un-fly-max", window.innerHeight - 24 + "px");
    acc.style.setProperty("--un-fly-top", headRect.top + "px");
    acc.classList.add("fly");
    /* 面板贴近视口底部时上移，保证完整可见 */
    var height = body.offsetHeight;
    var top = Math.max(12, Math.min(headRect.top, window.innerHeight - height - 12));
    acc.style.setProperty("--un-fly-top", top + "px");
  }

  function bind(host) {
    if (!host || host.__unBound) return;
    host.__unBound = true;
    var flyTimer = null;

    host.addEventListener("click", function (e) {
      var acc = e.target.closest("[data-un-acc]");
      if (acc && host.contains(acc)) {
        var wrap = acc.closest(".un-acc");
        if (isCollapsed(host)) {
          if (wrap.classList.contains("fly")) closeFlyouts(host);
          else openFlyout(host, wrap);
          return;
        }
        var open = !wrap.classList.contains("open");
        if (open && !wrap.classList.contains("un-flat")) {
          host.querySelectorAll(".un-acc.open:not(.un-flat)").forEach(function (other) {
            if (other === wrap) return;
            other.classList.remove("open");
            other.querySelector("[data-un-acc]").setAttribute("aria-expanded", "false");
          });
        }
        wrap.classList.toggle("open", open);
        acc.setAttribute("aria-expanded", open ? "true" : "false");
        if (open) {
          setTimeout(function () {
            var rect = wrap.getBoundingClientRect(),
              hostRect = host.getBoundingClientRect();
            if (rect.bottom > hostRect.bottom - 56) host.scrollTop += rect.bottom - hostRect.bottom + 64;
          }, 200);
        }
        return;
      }
      var group = e.target.closest("[data-un-group]");
      if (group && host.contains(group)) {
        var sec = group.closest("[data-un-section]");
        var folded = !sec.classList.contains("folded");
        sec.classList.toggle("folded", folded);
        group.setAttribute("aria-expanded", folded ? "false" : "true");
        var list = foldedSet().filter(function (k) {
          return k !== sec.dataset.unSection;
        });
        if (folded) list.push(sec.dataset.unSection);
        saveFolded(list);
        return;
      }
      if (e.target.closest("a.nav-link, a.un-sub")) {
        try {
          sessionStorage.setItem(SCROLL_KEY, String(host.scrollTop));
        } catch (err) {}
      }
      if (e.target.closest(".un-sub")) closeFlyouts(host);
    });

    /* 侧栏收起后：悬停图标弹出二级菜单 */
    host.addEventListener("mouseover", function (e) {
      if (!isCollapsed(host)) return;
      var wrap = e.target.closest(".un-acc");
      clearTimeout(flyTimer);
      if (wrap && host.contains(wrap)) {
        if (!wrap.classList.contains("fly")) openFlyout(host, wrap);
      } else {
        closeFlyouts(host);
      }
    });
    host.addEventListener("mouseout", function (e) {
      if (!isCollapsed(host)) return;
      var wrap = e.target.closest(".un-acc");
      if (!wrap || wrap.contains(e.relatedTarget)) return;
      clearTimeout(flyTimer);
      flyTimer = setTimeout(function () {
        closeFlyouts(host);
      }, 160);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeFlyouts(host);
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".un-acc")) closeFlyouts(host);
    });
    host.addEventListener(
      "scroll",
      function () {
        try {
          sessionStorage.setItem(SCROLL_KEY, String(host.scrollTop));
        } catch (e) {}
        closeFlyouts(host);
      },
      { passive: true },
    );

    requestAnimationFrame(function () {
      restoreScroll(host);
    });
    window.addEventListener("load", function () {
      restoreScroll(host);
    });
  }

  /* 把导航渲染到已有容器（本体管理页的 .ontology-side） */
  function renderInto(host, ctx) {
    if (!host) return;
    host.classList.add("unified-nav");
    host.innerHTML = html(ctx);
    bind(host);
  }

  global.KnoraUnifiedNav = {
    html: html,
    bind: bind,
    renderInto: renderInto,
  };
})(window);
