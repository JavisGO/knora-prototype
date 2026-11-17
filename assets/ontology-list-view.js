(function () {
  "use strict";
  /* 业务对象 / 业务关联 / 事实明细：卡片 ⇄ 列表视图切换。
     列表视图完全由 CSS 把现有卡片重排为表格行，卡片上已有的点击、批量选择、
     打标、发布等行为全部沿用，不重复实现。偏好按模块记忆到 localStorage。 */
  var KEY = "knora:om-view:";
  var MODULES = ["entity", "relation", "event"];
  function getPage() {
    return document.getElementById("ontologyModulePage");
  }

  function moduleKey() {
    return new URLSearchParams(location.search).get("module");
  }
  function pref(m) {
    try {
      return localStorage.getItem(KEY + m) === "list" ? "list" : "card";
    } catch (e) {
      return "card";
    }
  }
  function save(m, v) {
    try {
      localStorage.setItem(KEY + m, v);
    } catch (e) {}
  }

  var ICON_CARD =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>';
  var ICON_LIST =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>';

  function buildSwitch(m) {
    var box = document.createElement("div");
    box.className = "om-view-switch";
    box.setAttribute("role", "group");
    box.setAttribute("aria-label", "切换视图");
    box.innerHTML =
      '<button type="button" data-om-view="card" title="卡片视图" aria-label="卡片视图">' +
      ICON_CARD +
      '</button><button type="button" data-om-view="list" title="列表视图" aria-label="列表视图">' +
      ICON_LIST +
      "</button>";
    box.addEventListener("click", function (e) {
      var b = e.target.closest("[data-om-view]");
      if (!b) return;
      save(m, b.dataset.omView);
      apply(m);
    });
    return box;
  }

  function buildHead(grid) {
    var sample = grid.querySelector(".om-card:not(.om-create)");
    var labels = ["属性", "数据", "关联"];
    var hasSync = false;
    if (sample) {
      labels = Array.prototype.map.call(sample.querySelectorAll(".om-metric"), function (el) {
        return (el.firstChild && el.firstChild.textContent.trim()) || "";
      });
      hasSync = !!sample.querySelector(".entity-data-state");
    }
    grid.dataset.omSync = hasSync ? "1" : "0";
    var head = grid.querySelector(".om-list-head");
    var html =
      "<span></span><span></span><span>名称</span><span>描述</span>" +
      [0, 1, 2]
        .map(function (i) {
          return '<span class="num">' + (labels[i] || "") + "</span>";
        })
        .join("") +
      "<span>" +
      (hasSync ? "数据同步" : "") +
      "</span><span>状态</span><span>标签</span><span>创建人 / 更新</span><span>操作</span>";
    if (!head) {
      head = document.createElement("div");
      head.className = "om-list-head";
      grid.insertBefore(head, grid.firstChild);
    }
    if (head.dataset.sig !== html) {
      head.innerHTML = html;
      head.dataset.sig = html;
    }
  }

  function apply(m) {
    var page = getPage();
    if (!page) return;
    var grid = page.querySelector(".om-grid");
    var toolbar = page.querySelector(".om-toolbar");
    if (!grid || !toolbar || MODULES.indexOf(m) < 0) return;
    var sw = toolbar.querySelector(".om-view-switch");
    if (!sw) {
      sw = buildSwitch(m);
      var anchor = toolbar.querySelector(":scope > .btn");
      if (anchor) toolbar.insertBefore(sw, anchor);
      else toolbar.appendChild(sw);
    }
    var view = pref(m);
    if (grid.dataset.view !== view) grid.dataset.view = view;
    sw.querySelectorAll("[data-om-view]").forEach(function (b) {
      var on = b.dataset.omView === view;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (view === "list") buildHead(grid);
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      apply(moduleKey());
    });
  }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  schedule();
})();
