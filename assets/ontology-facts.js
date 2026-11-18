(function () {
  "use strict";
  /* 本体事实：把语义图谱、业务对象、业务关联、事实明细合成同一页面。
     四个视图沿用各自原有页面，顶部加一条切换；URL 仍是 ?module=graph|entity|relation|event，旧链接不失效。 */
  var VIEWS = [
    ["graph", "图谱"],
    ["entity", "业务对象"],
    ["relation", "业务关联"],
    ["event", "事实明细"],
  ];
  function key() {
    return new URLSearchParams(location.search).get("module");
  }
  function isFact(k) {
    return VIEWS.some(function (v) {
      return v[0] === k;
    });
  }
  function proxies() {
    var side = document.querySelector(".ontology-side");
    if (!side || side.querySelector(".of-proxy")) return;
    var box = document.createElement("span");
    box.className = "of-proxy";
    box.hidden = true;
    box.innerHTML = VIEWS.map(function (v) {
      return '<button type="button" data-module="' + v[0] + '" tabindex="-1"></button>';
    }).join("");
    side.appendChild(box);
  }
  function build() {
    var nav = document.createElement("nav");
    nav.className = "of-switch";
    nav.setAttribute("aria-label", "本体事实视图");
    nav.innerHTML =
      '<div class="of-title"><b>本体事实</b><span>图谱与对象、关联、事实在同一处管理</span></div><div class="of-tabs" role="tablist">' +
      VIEWS.map(function (v) {
        return '<button type="button" role="tab" data-of="' + v[0] + '">' + v[1] + "</button>";
      }).join("") +
      "</div>";
    nav.addEventListener("click", function (e) {
      var b = e.target.closest("[data-of]");
      if (!b || b.dataset.of === key()) return;
      var p = document.querySelector('.of-proxy [data-module="' + b.dataset.of + '"]');
      if (p) p.click();
    });
    return nav;
  }
  function sync() {
    var page = document.getElementById("ontologyModulePage");
    var k = key();
    if (!page || !isFact(k)) return;
    var params = new URLSearchParams(location.search);
    if (page.querySelector("[data-eb-mounted]") || params.get("entityView") === "edit") return;
    proxies();
    var sw = page.querySelector(":scope > .of-switch");
    if (!sw) {
      sw = build();
      page.insertBefore(sw, page.firstChild);
    }
    sw.querySelectorAll("[data-of]").forEach(function (b) {
      var on = b.dataset.of === k;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
  }
  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      sync();
    });
  }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  schedule();
})();
