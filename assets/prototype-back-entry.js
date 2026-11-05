(function () {
  function loadRolePerspective() {
    if (!document.querySelector('link[data-role-perspective-style]')) {
      var style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = 'assets/role-perspectives.css?v=20261016d';
      style.dataset.rolePerspectiveStyle = '1';
      document.head.appendChild(style);
    }
    if (!document.querySelector('script[data-role-perspective-script]')) {
      var script = document.createElement('script');
      script.src = 'assets/role-perspectives.js?v=20261016c';
      script.defer = true;
      script.dataset.rolePerspectiveScript = '1';
      document.head.appendChild(script);
    }
  }
  function mountEntryBar() {
    var body = document.body;
    if (!body) return;

    var embedded = window.self !== window.top || new URLSearchParams(window.location.search).get("embed") === "1";
    if (embedded) {
      body.querySelectorAll(".prototype-entry-bar, .prototype-back-entry").forEach(function (node) { node.remove(); });
      body.classList.remove("has-prototype-entry-bar");
      return;
    }

    var link = body.querySelector(".prototype-back-entry");
    var bar = body.querySelector(".prototype-entry-bar");

    if (!bar) {
      bar = document.createElement("div");
      bar.className = "prototype-entry-bar";
      body.insertBefore(bar, body.firstChild);
    }

    if (!link) {
      link = document.createElement("a");
      link.className = "prototype-back-entry";
      link.href = "index.html";
      link.setAttribute("aria-label", "返回原型入口");
      link.title = "返回原型入口";
      link.innerHTML = "<span>返回入口</span>";
    } else {
      var label = link.querySelector("span");
      if (label) label.textContent = "返回入口";
    }

    if (link.parentNode !== bar) bar.appendChild(link);
    body.classList.add("has-prototype-entry-bar");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountEntryBar, { once: true });
  } else {
    mountEntryBar();
  }

  window.setTimeout(mountEntryBar, 0);
  window.setTimeout(mountEntryBar, 250);
  loadRolePerspective();
})();

// 全局 AI 助手入口，iframe 内不重复挂载。
(function(){if(window.self!==window.top)return;var base=new URL('.',document.currentScript.src);function load(){if(document.querySelector('[data-global-ai-loader]'))return;var css=document.createElement('link');css.rel='stylesheet';css.href=new URL('global-ai-assistant.css',base);document.head.appendChild(css);var js=document.createElement('script');js.src=new URL('global-ai-assistant.js',base);js.dataset.globalAiLoader='1';document.body.appendChild(js)}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load()})();
