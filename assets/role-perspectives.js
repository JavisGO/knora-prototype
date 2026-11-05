(function () {
  "use strict";

  var roles = {
    personal: {
      name: "个人用户",
      person: "林晓",
      account: "linxiao",
      summary: "知识检索、个人资源与已授权公共资源",
      apps: ["portal", "entity", "graph"],
      portalPages: ["home", "mine", "resources", "tags"],
      reviewApproval: false,
      projectManagement: false,
      dataSource: false,
      managedSpaces: []
    },
    "knowledge-admin": {
      name: "知识管理员",
      person: "王敏",
      account: "wangmin",
      summary: "空间治理、资源管理、审批与运营分析",
      apps: ["portal", "entity", "graph", "operations"],
      portalPages: ["home", "mine", "resources", "tags"],
      reviewApproval: true,
      projectManagement: false,
      dataSource: false,
      managedSpaces: ["采购组", "采购1组"]
    },
    aibp: {
      name: "AIBP",
      person: "赵宁",
      account: "zhaoning",
      summary: "知识使用与项目创建、管理、资源申请",
      apps: ["portal", "entity", "graph"],
      portalPages: ["home", "mine", "resources", "projects", "tags"],
      reviewApproval: false,
      projectManagement: true,
      dataSource: false,
      managedSpaces: []
    },
    "knowledge-bp": {
      name: "知识BP",
      person: "陈墨",
      account: "chenmo",
      summary: "知识门户基础能力、本体平台与经纶",
      apps: ["portal", "entity", "graph", "ontology", "jinglun"],
      portalPages: ["home", "mine", "resources", "tags"],
      reviewApproval: false,
      projectManagement: false,
      dataSource: false,
      managedSpaces: []
    },
    "data-bp": {
      name: "数据BP",
      person: "周岚",
      account: "zhoulan",
      summary: "知识使用、数据源连接与库表空间分配",
      apps: ["portal", "entity", "graph"],
      portalPages: ["home", "mine", "resources", "tags"],
      reviewApproval: false,
      projectManagement: false,
      dataSource: true,
      managedSpaces: []
    }
  };

  function resolveRole() {
    var params = new URLSearchParams(location.search), requested = params.get("role"), stored = "";
    try { stored = sessionStorage.getItem("knora:rolePerspective") || ""; } catch (e) {}
    if (requested === "superadmin") {
      try { sessionStorage.removeItem("knora:rolePerspective"); } catch (e) {}
      return "";
    }
    if (roles[requested]) {
      try { sessionStorage.setItem("knora:rolePerspective", requested); } catch (e) {}
      return requested;
    }
    return roles[stored] ? stored : "";
  }

  var roleKey = resolveRole();
  if (!roleKey) return;
  var config = roles[roleKey], body = document.body, frame = window.self !== window.top;
  window.knoraRolePerspective = { key: roleKey, config: config };
  body.classList.add("role-perspective", "role-" + roleKey);
  body.dataset.rolePerspective = roleKey;

  function currentFile() {
    return (location.pathname.split("/").pop() || "").toLowerCase();
  }

  function redirectIfDenied() {
    if (frame) return false;
    var file = currentFile(), denied = false;
    if (/^portal-projects\.html$/.test(file) && !config.projectManagement) denied = true;
    if (/operations-dashboard\.html$/.test(file) && config.apps.indexOf("operations") < 0) denied = true;
    if (/jinglun\.html$/.test(file) && config.apps.indexOf("jinglun") < 0) denied = true;
    if (/^(ontology-|knowledge-base-management|行业本体模板|agent-runtime)/.test(file) && config.apps.indexOf("ontology") < 0) denied = true;
    if (denied) {
      location.replace("portal-home.html?role=" + encodeURIComponent(roleKey));
      return true;
    }
    return false;
  }
  if (redirectIfDenied()) return;

  function text(node) { return node ? (node.textContent || "").replace(/\s+/g, " ").trim() : ""; }
  function setNodeText(node, value) { if (node && node.textContent !== value) node.textContent = value; }
  function hide(node) { if (node) node.classList.add("role-view-hidden"); }
  function show(node) { if (node) node.classList.remove("role-view-hidden"); }
  function roleToast(message) {
    var toast = document.getElementById("rolePerspectiveToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "rolePerspectiveToast";
      toast.className = "role-perspective-toast";
      body.appendChild(toast);
    }
    setNodeText(toast, message);
    toast.classList.add("show");
    clearTimeout(roleToast.timer);
    roleToast.timer = setTimeout(function () { toast.classList.remove("show"); }, 1800);
  }
  function portalPageFromHref(href) {
    var match = String(href || "").match(/portal-(home|mine|resources|projects|tags)\.html/);
    return match ? match[1] : "";
  }
  function appFromHref(href) {
    href = String(href || "");
    if (/knowledge-base-management|ontology-/.test(href)) return "ontology";
    if (/jinglun\.html/.test(href)) return "jinglun";
    if (/operations-dashboard/.test(href)) return "operations";
    if (/entity-dashboard/.test(href)) return "entity";
    if (/graph-analysis/.test(href)) return "graph";
    if (/portal-/.test(href)) return "portal";
    return "";
  }

  function updateIdentity() {
    document.querySelectorAll(".profile-trigger .avatar,.profile-menu header .avatar,.profile .avatar").forEach(function (node) {
      setNodeText(node, config.person.charAt(0));
    });
    document.querySelectorAll(".profile-trigger b,.profile-menu>header b,.profile>b,.profile span>b").forEach(function (node) {
      if (text(node) === "陈宇" || node.closest(".profile-trigger") || node.closest(".profile-menu>header")) setNodeText(node, config.person);
    });
    document.querySelectorAll(".profile-trigger small,.profile>small,.profile span>small").forEach(function (node) {
      setNodeText(node, config.name + " · 角色视角");
    });
    var email = document.querySelector(".profile-menu>header small");
    if (email) setNodeText(email, config.account + "@saidoo.com");
    var topbar = document.querySelector(".topbar");
    if (topbar && !topbar.querySelector(".role-perspective-badge")) {
      var badge = document.createElement("div");
      badge.className = "role-perspective-badge";
      badge.innerHTML = "<i>视</i><span><b>" + config.name + "</b><small>" + config.summary + "</small></span>";
      var spacer = topbar.querySelector(".top-spacer,.top-actions");
      topbar.insertBefore(badge, spacer || null);
    }
  }

  function filterNavigation() {
    document.querySelectorAll(".sidebar a.nav-link").forEach(function (link) {
      var page = portalPageFromHref(link.getAttribute("href"));
      if (page) link.classList.toggle("role-view-hidden", config.portalPages.indexOf(page) < 0);
    });
    document.querySelectorAll(".app-item,[data-app]").forEach(function (link) {
      var app = link.dataset.app || appFromHref(link.getAttribute("href"));
      if (app && roles[roleKey]) link.classList.toggle("role-view-hidden", config.apps.indexOf(app) < 0);
    });
    var appHead = document.querySelector(".app-pop-head span");
    if (appHead) setNodeText(appHead, config.apps.length + " 个可用应用 · 当前角色视角");
  }

  function applyApprovalScope() {
    var notification = document.querySelector(".approval-notification-wrap");
    if (notification) notification.classList.toggle("role-view-hidden", !config.reviewApproval);
    if (currentFile() !== "portal-mine.html") return;
    var review = document.querySelector('[data-approval-mode="review"]'), submitted = document.querySelector('[data-approval-mode="submitted"]');
    if (!config.reviewApproval && review) {
      hide(review);
      if (submitted && !submitted.classList.contains("active") && !submitted.dataset.roleAutoSelected) {
        submitted.dataset.roleAutoSelected = "1";
        submitted.click();
      }
    } else if (review) show(review);
    var primary = document.querySelector('[data-mine-tab="approval"]');
    if (primary && !config.reviewApproval) {
      var count = primary.querySelector("span");
      if (count) setNodeText(count, "");
    }
    var activeMode = document.querySelector('[data-approval-mode].active');
    var submittedActive = activeMode && activeMode.dataset.approvalMode === "submitted";
    var projectKind = document.querySelector('[data-approval-kind="project"]');
    if (projectKind) projectKind.classList.toggle("role-submitted-project-hidden", !config.projectManagement && submittedActive);
    document.querySelectorAll(".approval-v2-card").forEach(function (card) {
      card.classList.toggle("role-submitted-project-hidden", !config.projectManagement && submittedActive && /空间资源申请至项目/.test(text(card)));
    });
    if (!config.projectManagement && submittedActive) {
      var submittedCount = document.getElementById("approvalSubmittedCount");
      var visibleCards = document.querySelectorAll(".approval-v2-card:not(.role-submitted-project-hidden)").length;
      if (submittedCount) setNodeText(submittedCount, "(" + visibleCards + ")");
    }
  }

  function applyHomeScope() {
    if (currentFile() !== "portal-home.html") return;
    document.querySelectorAll(".portal-agent-zone").forEach(hide);
    document.querySelectorAll('a[href*="portal-projects.html"]').forEach(function (link) {
      link.classList.toggle("role-view-hidden", !config.projectManagement);
    });
    if (!config.reviewApproval) {
      document.querySelectorAll(".home-approval-panel").forEach(function (card) {
        var heading = card.querySelector("h3"), description = card.querySelector(".panel-head p"), link = card.querySelector(".panel-head a");
        if (heading && /审批待办/.test(text(heading))) setNodeText(heading, "我的申请进度");
        if (description) setNodeText(description, config.projectManagement ? "查看我提交的资源申请及处理进度" : "查看我发布至空间的资源及处理进度");
        if (link) {
          setNodeText(link, "查看申请");
          link.setAttribute("href", "portal-mine.html?roadmap=mine-approvals&mode=submitted");
        }
        card.querySelectorAll(".home-approval-brief em").forEach(function (status) { setNodeText(status, "审批中"); });
        var briefs = card.querySelectorAll(".home-approval-brief");
        if (briefs[1]) {
          var briefTitle = briefs[1].querySelector("b,strong,h4"), briefMeta = briefs[1].querySelector("small,p,span");
          if (briefTitle) setNodeText(briefTitle, config.projectManagement ? "客户洞察项目资源申请" : "个人空间资料发布至采购组");
          if (briefMeta) setNodeText(briefMeta, config.projectManagement ? "2 项资源 · 客户洞察项目" : "2 项资源 · 发布至公共空间");
        }
      });
    }
  }

  function activeSpaceName() {
    var active = document.querySelector(".pr2-enterprise-tree button.active b,.pr2-root-nav button.active b,.pv2-tree-row.active b,.org-space-row.active .org-name");
    var params = new URLSearchParams(location.search);
    return text(active) || params.get("space") || "个人空间";
  }
  function isPersonalSpace() { return /个人空间|回收站/.test(activeSpaceName()); }
  function isManagedSpace() {
    var name = activeSpaceName();
    return config.managedSpaces.some(function (space) { return name.indexOf(space) > -1; });
  }
  function managementButton(button) {
    var label = text(button);
    return /新建|上传|授权|移交|发布至|共享至|移动|删除|移除|编辑|归档|取消归档|更新文档|同步飞书|添加标签|自动打标|从空间中删除|空间配置/.test(label) ||
      button.matches("[data-data-admin-op],[data-ontology-auth],[data-ontology-transfer],[data-doc-share],[data-multi-share],[data-transfer-up],[data-open-space-config]");
  }
  function applyResourceScope() {
    if (currentFile() !== "portal-resources.html") return;
    var personal = isPersonalSpace(), admin = roleKey === "knowledge-admin" && isManagedSpace(), readOnly = !personal && !admin;
    body.classList.toggle("role-public-readonly", readOnly);
    body.classList.toggle("role-space-admin", admin);
    body.classList.toggle("role-personal-space", personal);
    body.classList.toggle("role-can-connect-data", !!config.dataSource);

    document.querySelectorAll("[data-open-datasource-manager],.ds-add-trigger").forEach(function (node) {
      node.classList.toggle("role-view-hidden", !config.dataSource);
    });
    document.querySelectorAll("button").forEach(function (button) {
      var label = text(button);
      var spaceConfig = /空间配置|配置空间|编辑空间/.test(label);
      var dataSourceControl = button.matches("[data-open-datasource-manager],.ds-add-trigger") || /新增数据源|连接数据源/.test(label);
      var shouldHide = (spaceConfig && !admin) || (readOnly && managementButton(button) && !/查看|详情|历史版本|下载/.test(label));
      if (button.closest(".pr2-directory") || button.matches("[data-pr2-space],[data-pr2-scope]")) shouldHide = false;
      if (dataSourceControl && config.dataSource) shouldHide = false;
      button.classList.toggle("role-view-hidden-control", shouldHide);
    });
    document.querySelectorAll(".data-admin-menu,.ontology-object-actions,.pr2-row-actions,.pr2-command").forEach(function (group) {
      group.classList.toggle("role-readonly-actions", readOnly);
    });
    document.querySelectorAll("[data-data-select],[data-data-select-all],[data-ontology-select],.pr2-resource-check input").forEach(function (input) {
      input.disabled = readOnly;
    });

    var activeTab = text(document.querySelector(".pr2-types .active,.pr2-type-tabs .active,.asset-tabs .active,.resource-tabs .active"));
    document.querySelectorAll(".pr2-resource-row,.resource-generic-list article,.document-resource-row,tr[data-row-id]").forEach(function (row) {
      row.classList.toggle("role-view-hidden-resource", readOnly && /文档|智能体/.test(activeTab) && /未授权|无权限/.test(text(row)));
    });
    if (readOnly && /数据表/.test(activeTab)) {
      document.querySelectorAll('[data-row-id="db-restricted"],[data-row-id="table-sensitive"]').forEach(function (row) {
        var access = row.querySelector(".data-access"), detail = row.querySelector("[data-data-detail]");
        if (access) {
          setNodeText(access, "无查看权限");
          access.classList.remove("ok");
          access.classList.add("denied");
        }
        if (detail) detail.setAttribute("title", "当前角色未获得详情查看权限");
      });
    }
    if (/文档/.test(activeTab) && !/回收站/.test(activeSpaceName())) {
      var documentIndex = 0;
      document.querySelectorAll(".pr2-table .pr2-tr:not(.pr2-folder-row)").forEach(function (row) {
        var actions = row.querySelector(".pr2-row-actions"), existing = row.querySelector("[data-role-doc-download]");
        var downloadable = documentIndex % 2 === 0 && !row.classList.contains("pr2-feishu-document-row");
        documentIndex += 1;
        if (downloadable && actions && !existing) {
          var download = document.createElement("button");
          download.type = "button";
          download.dataset.roleDocDownload = "1";
          download.title = "当前用户具有该文档的下载权限";
          download.textContent = "下载";
          actions.insertBefore(download, actions.firstChild);
        } else if (!downloadable && existing) {
          existing.remove();
        }
      });
    }
    document.querySelectorAll(".pr2-enterprise-tree button,.pr2-root-nav button").forEach(function (node) {
      var name = text(node.querySelector("b"));
      node.classList.toggle("role-managed-space-node", roleKey === "knowledge-admin" && config.managedSpaces.indexOf(name) > -1);
      node.classList.toggle("role-authorized-space-node", !/个人空间|回收站/.test(name) && !(roleKey === "knowledge-admin" && config.managedSpaces.indexOf(name) > -1));
      var role = node.querySelector("em,.role-badge,.pr2-role-badge");
      if (role && !/个人空间|回收站/.test(name)) setNodeText(role, roleKey === "knowledge-admin" && config.managedSpaces.indexOf(name) > -1 ? "节点管理员" : "已授权资源");
    });
  }

  function applyProjectScope() {
    if (currentFile() !== "portal-projects.html") return;
    if (!config.projectManagement) return;
    var heading = document.querySelector(".page-head p,.pv2-page-head p");
    if (heading) setNodeText(heading, "AIBP 可创建和管理项目，并在参与项目中申请、查看项目资源");
  }

  function applyTagScope() {
    if (currentFile() !== "portal-tags.html") return;
    document.querySelectorAll("button").forEach(function (button) {
      if (/权限配置|配置权限|审批配置/.test(text(button))) hide(button);
    });
  }

  function applyReadOnlyApplications() {
    if (!/entity-dashboard\.html|graph-analysis\.html/.test(currentFile())) return;
    document.querySelectorAll("button").forEach(function (button) {
      if (/新建|编辑|删除|发布|导入/.test(text(button))) hide(button);
    });
  }

  function applyStandaloneIdentity() {
    if (document.querySelector(".topbar")) return;
    if (!document.querySelector(".role-floating-badge")) {
      var badge = document.createElement("div");
      badge.className = "role-floating-badge";
      badge.innerHTML = "<i>视</i><span><b>" + config.name + "</b><small>" + config.person + "</small></span>";
      body.appendChild(badge);
    }
  }

  var scheduled = false;
  function apply() {
    scheduled = false;
    updateIdentity();
    filterNavigation();
    applyApprovalScope();
    applyHomeScope();
    applyResourceScope();
    applyProjectScope();
    applyTagScope();
    applyReadOnlyApplications();
    applyStandaloneIdentity();
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(apply);
  }
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("click", function (event) {
    var download = event.target.closest("[data-role-doc-download]");
    if (!download) return;
    var row = download.closest(".pr2-tr"), name = text(row && row.querySelector(".pr2-doc-name a,.pr2-doc-name b"));
    roleToast("已开始下载：" + (name || "文档"));
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, { once: true });
  schedule();
  setTimeout(schedule, 300);
  setTimeout(schedule, 900);
})();
