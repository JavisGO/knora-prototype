(() => {
  "use strict";
  const root = document.getElementById("content");
  const today = new Date("2026-11-13T00:00:00Z");
  const date = (value) => new Date(value + "T00:00:00Z");
  const days = (value) => Math.round((date(value) - today) / 86400000);
  // 子部门：各部门管理员只在自己有权限的子部门范围内查看（原“业务领域”筛选改为子部门）
  const SUB = {
    "客户服务部|售后服务": "华东服务组",
    "客户服务部|辅助驾驶": "华南服务组",
    "客户服务部|充电服务": "热线服务组",
    "产品支持部|辅助驾驶": "辅助驾驶组",
    "产品支持部|售后服务": "智能座舱组",
    "产品支持部|充电服务": "智能座舱组",
    "技术支持部|充电服务": "充电技术组",
    "技术支持部|售后服务": "售后技术组",
    "技术支持部|辅助驾驶": "售后技术组",
  };
  const sub = (dept, g) => SUB[dept + "|" + g] || g;
  const records = [
    [
      "售后服务政策说明",
      "客户服务部",
      "售后服务",
      "政策制度",
      ["服务政策", "售后服务"],
      "李明",
      "已发布",
      "2026-11-05",
      "2026-11-02",
      42,
      16,
      8,
      3,
    ],
    [
      "辅助驾驶功能使用指南",
      "产品支持部",
      "辅助驾驶",
      "产品手册",
      ["辅助驾驶", "使用指南"],
      "王晓",
      "已发布",
      "2026-11-20",
      "2026-11-10",
      86,
      34,
      18,
      2,
    ],
    [
      "辅助驾驶常见问题",
      "客户服务部",
      "辅助驾驶",
      "常见问题",
      ["辅助驾驶", "常见问题"],
      "陈晨",
      "已发布",
      "2026-11-28",
      "2026-11-06",
      64,
      28,
      12,
      4,
    ],
    [
      "充电故障排查手册",
      "技术支持部",
      "充电服务",
      "产品手册",
      ["充电服务", "故障排查"],
      "赵宁",
      "已发布",
      "2027-06-30",
      "2026-10-28",
      110,
      48,
      24,
      1,
    ],
    [
      "充电权益说明",
      "客户服务部",
      "充电服务",
      "政策制度",
      ["充电服务", "服务政策"],
      "李明",
      "已发布",
      "2026-10-31",
      "2026-10-15",
      30,
      12,
      6,
      2,
    ],
    [
      "旧版辅助驾驶说明",
      "产品支持部",
      "辅助驾驶",
      "产品手册",
      ["辅助驾驶", "使用指南"],
      "王晓",
      "已下架",
      "2026-09-30",
      "2026-11-04",
      8,
      4,
      1,
      0,
    ],
    [
      "交付验车检查清单",
      "产品支持部",
      "售后服务",
      "服务规范",
      ["新车交付", "检查清单"],
      "陈晨",
      "已发布",
      "2027-03-31",
      "2026-11-09",
      74,
      30,
      16,
      1,
    ],
    [
      "冬季车辆养护建议",
      "技术支持部",
      "售后服务",
      "服务规范",
      ["季节养护", "使用指南"],
      "赵宁",
      "未发布",
      "",
      "2026-11-12",
      0,
      0,
      0,
      0,
    ],
    [
      "充电设备保养规范",
      "技术支持部",
      "充电服务",
      "服务规范",
      ["充电设备", "故障排查"],
      "赵宁",
      "已发布",
      "",
      "2026-09-20",
      0,
      0,
      0,
      0,
    ],
    [
      "辅助驾驶系统更新说明",
      "产品支持部",
      "辅助驾驶",
      "产品手册",
      ["辅助驾驶", "使用指南"],
      "王晓",
      "已发布",
      "2026-11-25",
      "2026-11-11",
      52,
      20,
      10,
      1,
    ],
    [
      "道路救援服务说明",
      "客户服务部",
      "售后服务",
      "政策制度",
      ["道路救援", "服务政策"],
      "李明",
      "已发布",
      "2026-11-30",
      "2026-10-30",
      38,
      14,
      7,
      1,
    ],
    [
      "历史充电服务政策",
      "客户服务部",
      "充电服务",
      "政策制度",
      ["充电服务", "服务政策"],
      "李明",
      "已下架",
      "2026-10-01",
      "2026-10-25",
      4,
      2,
      0,
      0,
    ],
  ].map((r, i) =>
    Object.fromEntries(
      [
        "name",
        "dept",
        "domain",
        "folder",
        "tags",
        "owner",
        "status",
        "expiry",
        "updated",
        "views",
        "hits",
        "refs",
        "dislikes",
      ]
        .map((key, j) => [key, r[j]])
        .concat([["id", i]]),
    ),
  ).map((r) => ({ ...r, domain: sub(r.dept, r.domain) }));
  // 每日行为样例共用同一数据源，指标、图表与明细使用相同筛选结果。
  const events = [];
  records.forEach((r) => {
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const weight = (i + r.id) % 5 === 0 ? 0 : 1;
      events.push({
        id: r.id,
        day: d.toISOString().slice(0, 10),
        views: weight * Math.round(r.views / 20),
        hits: weight * Math.round(r.hits / 20),
        refs: weight * Math.round(r.refs / 20),
        likes: weight * (r.id % 3),
        dislikes: i === r.id ? r.dislikes : 0,
      });
    }
  });
  const searches = [
    ["辅助驾驶雨天使用限制", "产品支持部", "辅助驾驶", 18, "2026-11-12"],
    ["充电桩离线处理", "技术支持部", "充电服务", 12, "2026-11-10"],
    ["异地道路救援范围", "客户服务部", "售后服务", 9, "2026-11-08"],
    ["辅助驾驶升级条件", "产品支持部", "辅助驾驶", 7, "2026-10-29"],
    ["家用充电桩迁移", "客户服务部", "充电服务", 6, "2026-11-11"],
  ].map((r) => ({
    word: r[0],
    dept: r[1],
    domain: sub(r[1], r[2]),
    count: r[3],
    day: r[4],
  }));
  const successfulSearches = records
    .slice(0, 7)
    .map((r) => ({
      dept: r.dept,
      domain: r.domain,
      count: 30 + r.id * 4,
      clicks: 20 + r.id * 2,
      day: r.updated,
    }));
  const state = {
    tab: "盘点",
    tagNodes: [],
    tagOpen: false,
    tagType: 0,
    tagGroup: 0,
    tagQ: "",
    exp: {},
    invCard: 0,
    role: "admin",
    roleDept: "客户服务部",
    roleOwner: "李明",
    ovMetric: 0,
    group: "owner",
    sla: 5,
    taskFilter: "全部",
    topic: "使用价值",
    metric: 0,
    dept: "全部",
    domain: "全部",
    period: 30,
    from: "2026-10-15",
    to: "2026-11-13",
    query: "",
    folder: "全部",
    status: "全部",
    tags: [],
    updated: "全部",
  };
  const owners = ["李明", "王晓", "陈晨", "赵宁"];
  const ownerByDept = {
    客户服务部: "李明",
    产品支持部: "王晓",
    技术支持部: "赵宁",
  };
  const ownerDept = {
    李明: "客户服务部",
    王晓: "产品支持部",
    陈晨: "客户服务部",
    赵宁: "技术支持部",
  };
  const depts = ["客户服务部", "产品支持部", "技术支持部"];
  const teams = {
    客户服务部: [
      ["华东服务组", 0.4],
      ["华南服务组", 0.33],
      ["热线服务组", 0.27],
    ],
    产品支持部: [
      ["辅助驾驶组", 0.58],
      ["智能座舱组", 0.42],
    ],
    技术支持部: [
      ["充电技术组", 0.55],
      ["售后技术组", 0.45],
    ],
  };
  const deptShare = { 客户服务部: 0.45, 产品支持部: 0.3, 技术支持部: 0.25 };
  const domainShare = { 售后服务: 0.4, 辅助驾驶: 0.35, 充电服务: 0.25 };
  const userMetrics = [
    ["日均活跃用户", 380, "人", "avg"],
    ["检索次数", 1260, "次", "sum"],
    ["智能体问答", 840, "次", "sum"],
    ["知识引用", 520, "次", "sum"],
  ];
  const iso = (offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  };
  const share = (dept, domain) =>
    (dept === "全部" ? 1 : deptShare[dept]) *
    (domain === "全部" ? 1 : domainShare[domain]);
  const userSeries = (m, s, shift) =>
    Array.from({ length: state.period }, (_, k) => {
      const offset = -state.period + 1 + k - shift;
      const weekday = [0, 6].includes(new Date(iso(offset)).getUTCDay());
      const wave = 0.92 + 0.1 * Math.sin(offset * 0.7 + m * 1.3);
      return userMetrics[m][1] * s * (weekday ? 0.45 : 1) * wave * (1 + 0.004 * offset);
    });
  const aggregate = (m, values) =>
    values.reduce((n, v) => n + v, 0) / (userMetrics[m][3] === "avg" ? values.length : 1);
  // 按最大余数法取整，保证下级合计与上级数字一致。
  const apportion = (values, total) => {
    const floors = values.map(Math.floor);
    let rest = Math.round(total) - floors.reduce((n, v) => n + v, 0);
    values
      .map((v, i) => [v - Math.floor(v), i])
      .sort((a, b) => b[0] - a[0])
      .forEach(([, i]) => {
        if (rest > 0) {
          floors[i] += 1;
          rest -= 1;
        }
      });
    return floors;
  };
  // 字段：编码、标题、关联指标、责任人、部门、领域、状态、创建偏移、闭环偏移、回复、关联对象、来源、效果验证
  const taskSeeds = [
    ["OPS-1101", "核实「充电权益说明」条款与最新权益是否一致", "内容质量 · 点踩量", "李明", "客户服务部", "充电服务", "处理中", -9, null, "已联系产品确认新版权益，预计本周更新", "d:4", "运营看板", null],
    ["OPS-1102", "补充「辅助驾驶雨天使用限制」知识", "覆盖缺口 · 无结果搜索", "王晓", "产品支持部", "辅助驾驶", "已闭环", -12, -8, "已新增知识条目并发布", "w:辅助驾驶雨天使用限制", "运营看板", ["该词无结果搜索", 18, 2, "次/周"]],
    ["OPS-1103", "处理「辅助驾驶常见问题」点踩反馈", "内容质量 · 点踩量", "陈晨", "客户服务部", "辅助驾驶", "已闭环", -10, -7, "已更正适用版本说明", "d:2", "反馈流", ["该知识点踩", 4, 0, "次/周"]],
    ["OPS-1104", "新建「充电桩离线处理」知识", "覆盖缺口 · 无结果搜索", "赵宁", "技术支持部", "充电服务", "待处理", -7, null, "", "w:充电桩离线处理", "运营看板", null],
    ["OPS-1105", "下架零访问的「旧版辅助驾驶说明」", "使用价值 · 零访问知识", "王晓", "产品支持部", "辅助驾驶", "已闭环", -20, -13, "确认已下架，关联审批流程已归档", "z:5", "审批流", ["知识状态", "已发布 · 长期零访问", "已下架", ""]],
    ["OPS-1106", "评估零访问知识「充电设备保养规范」", "使用价值 · 零访问知识", "赵宁", "技术支持部", "充电服务", "处理中", -15, null, "评估是否合并到故障排查手册", "z:8", "运营看板", null],
    ["OPS-1107", "优化「道路救援服务说明」标题与摘要", "使用价值 · 检索命中", "李明", "客户服务部", "售后服务", "已闭环", -6, -3, "已补充关键词并改写摘要", "m:10", "运营看板", ["检索命中次数", 7, 14, "次/周", "up"]],
    ["OPS-1108", "补充「异地道路救援范围」知识", "覆盖缺口 · 无结果搜索", "陈晨", "客户服务部", "售后服务", "待处理", -4, null, "", "w:异地道路救援范围", "运营看板", null],
    ["OPS-1109", "复核「辅助驾驶系统更新说明」点踩反馈", "内容质量 · 点踩量", "王晓", "产品支持部", "辅助驾驶", "处理中", -2, null, "已定位到版本差异，正在修订", "d:9", "反馈流", null],
  ];
  const tasks = taskSeeds.map((r) => ({
    code: r[0],
    title: r[1],
    metric: r[2],
    owner: r[3],
    dept: r[4],
    domain: sub(r[4], r[5]),
    status: r[6],
    createdDay: iso(r[7]),
    closedDay: r[8] === null ? "" : iso(r[8]),
    reply: r[9],
    ref: r[10],
    origin: r[11],
    effect: r[12],
  }));
  const mine = (r) => state.role !== "owner" || r.owner === state.roleOwner;
  const taskView = (t) => {
    const elapsed = Math.round(
      ((t.closedDay ? date(t.closedDay) : today) - date(t.createdDay)) / 86400000,
    );
    const overdue = t.status !== "已闭环" && elapsed > state.sla;
    return {
      ...t,
      elapsed,
      overdue,
      statusText: overdue ? t.status + " · 超期" : t.status,
      replyText: t.reply || "—",
    };
  };
  const taskBase = () =>
    tasks
      .filter(
        (t) =>
          mine(t) &&
          (state.dept === "全部" || t.dept === state.dept) &&
          (state.domain === "全部" || t.domain === state.domain) &&
          inPeriod(t.createdDay),
      )
      .map(taskView);
  const taskStats = (list) => {
    const closed = list.filter((t) => t.status === "已闭环");
    return {
      total: list.length,
      open: list.filter((t) => t.status !== "已闭环").length,
      closed: closed.length,
      overdue: list.filter((t) => t.overdue).length,
      rate: list.length ? ((closed.length / list.length) * 100).toFixed(0) : "—",
      avg: closed.length
        ? (closed.reduce((n, t) => n + t.elapsed, 0) / closed.length).toFixed(1)
        : "—",
    };
  };
  let pending = null;
  // 标签三级：标签类型 › 标签子级 › 标签
  const tagTree = [
    { type: "业务领域", groups: [
      { name: "车辆服务", tags: ["售后服务", "道路救援"] },
      { name: "智能驾驶", tags: ["辅助驾驶"] },
      { name: "能源补给", tags: ["充电服务", "充电设备"] },
    ] },
    { type: "内容类型", groups: [
      { name: "对客说明", tags: ["使用指南", "常见问题"] },
      { name: "内部规范", tags: ["服务政策", "故障排查", "检查清单"] },
    ] },
    { type: "适用阶段", groups: [
      { name: "交付阶段", tags: ["新车交付"] },
      { name: "用车阶段", tags: ["季节养护"] },
    ] },
  ];
  const tagInfo = {};
  tagTree.forEach((t) => t.groups.forEach((g) => g.tags.forEach((tag) => (tagInfo[tag] = { type: t.type, group: g.name }))));
  const pathOf = (tag) => (tagInfo[tag] ? `${tagInfo[tag].type} › ${tagInfo[tag].group} › ${tag}` : tag);
  const inNode = (tag, node) => {
    const [type, group] = node.split("/");
    const i = tagInfo[tag];
    return !!i && i.type === type && (!group || i.group === group);
  };
  const tagMatch = (r) =>
    state.tags.every((t) => r.tags.includes(t)) &&
    true;
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const sum = (rows, key) => rows.reduce((n, r) => n + r[key], 0);
  const endOff = () => days(state.to);
  const inPeriod = (value) =>
    days(value) >= endOff() - state.period + 1 && days(value) <= endOff();
  function setRange(from, to) {
    const max = iso(0);
    if (to > max) to = max;
    if (from > to) from = to;
    let len = days(to) - days(from) + 1;
    if (len > 90) {
      from = iso(days(to) - 89);
      len = 90;
    }
    Object.assign(state, { from, to, period: len });
  }
  const base = () =>
    records.filter(
      (r) =>
        mine(r) &&
        (state.dept === "全部" || r.dept === state.dept) &&
        (state.domain === "全部" || r.domain === state.domain),
    );
  const activity = (r) =>
    events.filter((e) => e.id === r.id && inPeriod(e.day));
  const stats = (r) => {
    const a = activity(r);
    return {
      ...r,
      statusLabel: expired(r) || r.status === "已下架" ? "已归档" : r.status,
      views: sum(a, "views"),
      hits: sum(a, "hits"),
      refs: sum(a, "refs"),
      likes: sum(a, "likes"),
      dislikes: sum(a, "dislikes"),
    };
  };
  const expired = (r) =>
    r.status === "已发布" && r.expiry && days(r.expiry) < 0;
  const soon = (r) =>
    r.status === "已发布" &&
    r.expiry &&
    days(r.expiry) >= 0 &&
    days(r.expiry) <= 7;
  const select = (key, label, values) =>
    `<label>${label}<select data-filter="${key}" aria-label="${label}">${values.map((v) => `<option value="${v}" ${String(state[key]) === String(v) ? "selected" : ""}>${v}</option>`).join("")}</select></label>`;
  const button = (label, key, value, active) =>
    `<button class="ko-tab ${active ? "selected" : ""}" data-${key}="${value}" aria-pressed="${!!active}">${label}</button>`;
  const statusMatch = (r) =>
    state.status === "全部" ||
    (state.status === "7天内到期" ? soon(r) : r.statusLabel === state.status);
  function searchRate(kind) {
    const positive = successfulSearches.filter(
      (r) =>
        (state.dept === "全部" || r.dept === state.dept) &&
        (state.domain === "全部" || r.domain === state.domain) &&
        inPeriod(r.day),
    );
    const empty = sum(searchRows(), "count");
    const total = sum(positive, "count") + empty;
    return total
      ? (
          ((kind === "clicks" ? sum(positive, "clicks") : empty) / total) *
          100
        ).toFixed(1)
      : "—";
  }
  function searchRows() {
    return searches.filter(
      (r) =>
        (state.dept === "全部" || r.dept === state.dept) &&
        (state.domain === "全部" || r.domain === state.domain) &&
        inPeriod(r.day),
    );
  }
  function currentRows() {
    if (state.tab === "任务") {
      const list = taskBase().filter(
        (t) => state.taskFilter === "全部" || t.statusText.startsWith(state.taskFilter) || (state.taskFilter === "超期" && t.overdue),
      );
      return list.filter((t) => (t.title + t.code).includes(state.query));
    }
    let rows = base().map(stats);
    if (state.tab === "盘点")
      return rows.filter(
        (r) =>
          statusMatch(r) &&
          tagMatch(r) &&
          (state.updated === "全部" || inPeriod(r.updated)) &&
          r.name.includes(state.query),
      );
    if (state.topic === "覆盖缺口")
      return searchRows().filter((r) => r.word.includes(state.query));
    if (state.topic === "使用价值" && state.metric === 3)
      rows = rows.filter((r) => r.statusLabel === "已发布" && !r.views);
    if (state.topic === "内容质量")
      rows = rows.filter((r) => (state.metric === 0 ? r.likes : r.dislikes));
    return rows.filter((r) => r.name.includes(state.query));
  }
  function chart(rows, metric) {
    // 状态指标只展示当前分布，避免用当前状态伪造历史趋势。
    const isRate =
      (state.topic === "使用价值" && state.metric === 4) ||
      (state.topic === "覆盖缺口" && state.metric === 2);
    if (isRate)
      return `<div class="ko-panel"><h3>${metric[0]} ${metric[1]}%</h3><p class="ko-muted">${state.metric === 4 ? "所选期间内，发生结果点击的搜索次数 ÷ 搜索总次数。" : "所选期间内，无结果搜索次数 ÷ 搜索总次数。"} 下方列出相关${state.metric === 4 ? "知识使用" : "无结果搜索"}明细。</p></div>`;
    const isStatus = state.topic === "使用价值" && state.metric === 3;
    if (isStatus)
      return `<div class="ko-panel"><h3>${metric[0]} · 部门分布</h3><p class="ko-muted">截至 2026-11-13 · 点击部门筛选明细</p>${bars(rows)}</div>`;
    const values = Array.from({ length: state.period }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + endOff() - state.period + 1 + i);
      const day = d.toISOString().slice(0, 10);
      if (state.topic === "覆盖缺口")
        return sum(
          searchRows().filter((r) => r.day === day),
          "count",
        );
      const key =
        state.topic === "内容质量"
          ? state.metric === 0
            ? "likes"
            : "dislikes"
          : ["views", "hits", "refs"][state.metric];
      return sum(
        events.filter((e) => e.day === day && rows.some((r) => r.id === e.id)),
        key,
      );
    });
    const max = Math.max(1, ...values);
    const points = values
      .map(
        (v, i) =>
          `${48 + (i * 700) / (values.length - 1)},${166 - (v / max) * 130}`,
      )
      .join(" ");
    return `<div class="ko-panel"><h3>${metric[0]}趋势</h3><p class="ko-muted">所选期间 · 单位 ${metric[2]}</p><svg class="ko-chart" viewBox="0 0 800 205" role="img" aria-label="${metric[0]}趋势"><path d="M48 35H750 M48 100H750 M48 166H750" stroke="#edf0f5" fill="none"/><text x="8" y="40">${max}</text><text x="20" y="170">0</text><polyline points="${points}" stroke="#1764ff" stroke-width="2.5" fill="none"/><text x="48" y="196">${state.from.slice(5)}</text><text x="710" y="196">${state.to.slice(5)}</text></svg></div>`;
  }
  function bars(rows) {
    const groups = ["客户服务部", "产品支持部", "技术支持部"].map((dept) => [
      dept,
      rows.filter((r) => r.dept === dept).length,
    ]);
    const max = Math.max(1, ...groups.map((g) => g[1]));
    return `<div class="ko-bars">${groups.map(([d, n]) => `<button data-dept="${d}"><span>${d}</span><i><em style="width:${(n / max) * 100}%"></em></i><b>${n}</b></button>`).join("")}</div>`;
  }
  function columns() {
    if (state.tab === "任务")
      return [
        ["code", "任务编码"],
        ["title", "任务标题"],
        ["origin", "来源"],
        ["metric", "关联指标"],
        ["statusText", "任务状态"],
        ["owner", "当前处理人"],
        ["createdDay", "创建时间"],
        ["elapsed", "已用天数"],
        ["replyText", "回复内容"],
      ];
    if (state.tab === "盘点")
      return [
        ["name", "知识名称"],
        ["dept", "所属部门"],
        ["tags", "标签"],
        ["statusLabel", "状态"],
        ["owner", "负责人"],
        ["updated", "更新时间"],
        ["expiry", "有效期至"],
      ];
    if (state.topic === "覆盖缺口")
      return [
        ["word", "搜索词"],
        ["count", "无结果次数"],
        ["dept", "所属部门"],
        ["domain", "所属子部门"],
        ["day", "最近搜索时间"],
      ];
    const common = [
      ["name", "知识名称"],
      ["dept", "所属部门"],
      ["owner", "负责人"],
    ];
    if (state.topic === "使用价值")
      return [
        ...common,
        ["views", "浏览量"],
        ["hits", "检索命中次数"],
        ["refs", "引用次数"],
      ];
    return [...common, ["likes", "点赞量"], ["dislikes", "点踩量"]];
  }
  function cell(r, key) {
    if (key === "tags") return r.tags.map(pathOf).join("；");
    return r[key] === 0 ? "0" : r[key] || "—";
  }
  const fmt = (n) => Math.round(n).toLocaleString("en-US");
  const pill = (text) => {
    const kind = text.startsWith("已归档") || text.startsWith("已过期")
      ? "mute"
      : text.includes("超期")
      ? "danger"
      : text.startsWith("已闭环")
        ? "ok"
        : text.startsWith("处理中")
          ? "info"
          : text.startsWith("待处理")
            ? "warn"
            : text === "已发布"
              ? "ok"
              : text === "已下架"
                ? "mute"
                : text === "未发布"
                  ? "warn"
                  : "";
    return kind ? `<span class="ko-pill ${kind}">${escape(text)}</span>` : escape(text);
  };
  const cellHTML = (r, key) =>
    key === "tags"
      ? r.tags.map((t) => `<span class="ko-tagchip" title="${escape(pathOf(t))}">${escape(t)}</span>`).join("")
      : key === "statusText" || key === "status" || key === "statusLabel"
        ? pill(cell(r, key))
        : escape(cell(r, key));
  function lineChart(values, label) {
    const w = 760;
    const h = 220;
    const left = 44;
    const top = 16;
    const bottom = 36;
    const max = Math.max(1, ...values) * 1.1;
    const x = (i) => left + (i * (w - left - 12)) / (values.length - 1);
    const y = (v) => top + (1 - v / max) * (h - top - bottom);
    const line = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
    const area = `${left},${h - bottom} ${line} ${x(values.length - 1).toFixed(1)},${h - bottom}`;
    const ticks = [0, 1, 2, 3].map((i) => {
      const v = (max / 1.1) * (i / 3);
      return `<path d="M${left} ${y(v).toFixed(1)}H${w - 12}" class="grid"/><text x="${left - 8}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end">${fmt(v)}</text>`;
    });
    const labels = [0, 0.33, 0.66, 1].map((p) => {
      const i = Math.round(p * (values.length - 1));
      return `<text x="${x(i).toFixed(1)}" y="${h - 12}" text-anchor="${p === 0 ? "start" : p === 1 ? "end" : "middle"}">${iso(-state.period + 1 + i).slice(5)}</text>`;
    });
    const last = values.length - 1;
    return `<svg class="ko-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}趋势"><defs><linearGradient id="ko-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1764ff" stop-opacity=".18"/><stop offset="1" stop-color="#1764ff" stop-opacity="0"/></linearGradient></defs>${ticks.join("")}<polygon points="${area}" fill="url(#ko-fill)"/><polyline points="${line}" class="line"/><circle cx="${x(last).toFixed(1)}" cy="${y(values[last]).toFixed(1)}" r="4.5" class="dot"/>${labels.join("")}</svg>`;
  }
  function issues() {
    const rows = base().map(stats);
    const items = [];
    const push = (o) => {
      const raw = tasks.find((t) => t.ref === o.ref);
      const task = raw ? taskView(raw) : null;
      if (task && task.status === "已闭环") return;
      items.push({ ...o, task });
    };
    searchRows().forEach((w) =>
      push({ ref: `w:${w.word}`, sev: w.count >= 10 ? 3 : 2, topic: "覆盖缺口", kind: "无结果搜索", title: w.word, impact: `${w.count} 次搜索无结果`, age: -days(w.day), owner: ownerByDept[w.dept], dept: w.dept, domain: w.domain, metric: "覆盖缺口 · 无结果搜索", taskTitle: `补充「${w.word}」相关知识` }),
    );
    rows.filter((r) => r.dislikes).forEach((r) =>
      push({ ref: `d:${r.id}`, sev: 2, topic: "内容质量", kind: "点踩反馈", title: r.name, impact: `所选期间 ${r.dislikes} 次点踩`, age: 0, owner: r.owner, dept: r.dept, domain: r.domain, metric: "内容质量 · 点踩量", taskTitle: `处理「${r.name}」的点踩反馈` }),
    );
    rows.filter((r) => r.statusLabel === "已发布" && !r.views).forEach((r) =>
      push({ ref: `z:${r.id}`, sev: 1, topic: "使用价值", kind: "零访问", title: r.name, impact: "所选期间零访问", age: 0, owner: r.owner, dept: r.dept, domain: r.domain, metric: "使用价值 · 零访问知识", taskTitle: `评估零访问知识「${r.name}」` }),
    );
    return items.sort((x, y) => y.sev - x.sev || y.age - x.age);
  }
  function effectText(e) {
    if (!e) return `<span class="ko-muted">观察中，7 天后自动对比</span>`;
    if (typeof e[1] !== "number") return `<em>${e[1]}</em> → <strong>${e[2]}</strong>`;
    const pct = e[1] ? Math.round(((e[2] - e[1]) / e[1]) * 100) : 0;
    const good = e[4] === "up" ? pct >= 0 : pct <= 0;
    return `<em>${e[1]}</em> → <strong>${e[2]}</strong> ${e[3]}<i class="${good ? "good" : "bad"}">${pct > 0 ? "+" : ""}${pct}%</i>`;
  }
  function overviewHTML(rows) {
    const s = share(state.dept, state.domain);
    const cur = userMetrics.map((_, i) => userSeries(i, s, 0));
    const prev = userMetrics.map((_, i) => userSeries(i, s, state.period));
    const m = state.ovMetric;
    const total = aggregate(m, cur[m]);
    const dim = state.dept === "全部"
      ? depts.map((d) => [d, aggregate(m, userSeries(m, share(d, state.domain), 0))])
      : teams[state.dept].map(([t, r]) => [t, total * r]);
    const rounded = apportion(dim.map((d) => d[1]), total);
    const rank = dim.map((d, i) => [d[0], rounded[i]]).sort((a, b) => b[1] - a[1]);
    const rankMax = Math.max(1, ...rank.map((r) => r[1]));
    const kpis = userMetrics
      .map((u, i) => {
        const v = aggregate(i, cur[i]);
        const p = aggregate(i, prev[i]);
        const delta = ((v - p) / p) * 100;
        return `<button class="ko-kpi ${m === i ? "selected" : ""}" data-ovmetric="${i}" aria-pressed="${m === i}"><span>${u[0]}</span><strong>${fmt(v)}<small>${u[2]}</small></strong><em class="${delta >= 0 ? "up" : "down"}">${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta).toFixed(1)}%</em><i>较上一周期</i></button>`;
      })
      .join("");
    const list = issues();
    pending = pending || {};
    pending.issues = list;
    const ts = taskStats(taskBase());
    const tl = taskBase();
    const undispatched = list.filter((i) => !i.task).length;
    const scoped = tasks
      .filter((t) => mine(t) && (state.dept === "全部" || t.dept === state.dept) && (state.domain === "全部" || t.domain === state.domain))
      .map(taskView);
    const closedInPeriod = scoped.filter((t) => t.status === "已闭环" && inPeriod(t.closedDay)).length;
    const resp = [
      ["待处理问题", undispatched + ts.open, "个", `未派发 ${undispatched} · 处理中 ${ts.open}`, undispatched ? "warn" : ""],
      ["本期新增任务", tl.length, "个", "所选周期内派发", ""],
      ["本期闭环", closedInPeriod, "个", "所选周期内完成", ""],
      ["问题反馈闭环率", ts.rate, ts.rate === "—" ? "" : "%", `${ts.closed} / ${ts.total} 个任务`, ""],
      ["平均处理时长", ts.avg, ts.avg === "—" ? "" : "天", "已闭环任务", ""],
      ["超期未闭环", ts.overdue, "个", `超期时效 ${state.sla} 天 · 待确认`, ts.overdue ? "bad" : ""],
    ]
      .map(([name, v, unit, sub, tone]) => `<button class="ko-health ${tone}" data-go="tab:任务"><b>${name}</b><strong>${v}<small>${unit}</small></strong><i>${sub}</i></button>`)
      .join("");
    const sevName = { 3: "高", 2: "中", 1: "低" };
    const shown = list.slice(0, 7);
    const issueRows = shown
      .map((it, i) => {
        const action = it.task
          ? `<span class="ko-pill ${it.task.overdue ? "danger" : it.task.status === "处理中" ? "info" : "warn"}">${it.task.code} · ${it.task.statusText}</span>`
          : `<button class="btn primary ko-sm" data-issue="${i}">派发任务</button>`;
        return `<li><span class="ko-sev s${it.sev}">${sevName[it.sev]}</span><div class="main"><b>${escape(it.title)}</b><small>${it.kind} · ${it.impact}</small></div><span class="who">${it.owner}<small>${it.dept}</small></span><div class="act">${action}</div></li>`;
      })
      .join("");
    const closedTasks = tl.filter((t) => t.status === "已闭环");
    const effectRows = closedTasks.length
      ? closedTasks.map((t) => `<li><b>${escape(t.title)}</b><small>${escape(t.effect ? t.effect[0] : "后续指标变化")}</small><div class="eff">${effectText(t.effect)}</div></li>`).join("")
      : `<li class="ko-empty">暂无已闭环任务</li>`;
    const unreach = list.filter((i) => i.sev === 3 && !i.task).length;
    const empty = searchRows();
    const emptyRate = searchRate("empty");
    const dislikeSum = sum(rows, "dislikes");
    const health = [
      ["使用价值", "零访问知识", rows.filter((r) => r.statusLabel === "已发布" && !r.views).length, "条", `检索点击率 ${searchRate("clicks")}%`, "", "", "tab:运营|使用价值"],
      ["内容质量", "点踩量", dislikeSum, "次", `点赞 ${sum(rows, "likes")} 次`, dislikeSum ? "warn" : "", "点踩分类待确认", "tab:运营|内容质量"],
      ["覆盖缺口", "无结果率", emptyRate, emptyRate === "—" ? "" : "%", `${empty.length} 个搜索词待补充`, empty.length ? "bad" : "", "", "tab:运营|覆盖缺口"],
    ]
      .map(([dim, name, v, unit, sub, tone, flag, go]) => `<button class="ko-health ${tone}" data-go="${go}"><span class="dim">${dim}${flag ? `<em class="ko-tbd">${flag}</em>` : ""}</span><b>${name}</b><strong>${v}<small>${unit}</small></strong><i>${sub}</i></button>`)
      .join("");
    const crumb = state.dept === "全部"
      ? `<span class="current">企业</span>`
      : state.role === "admin"
        ? `<button data-dept="全部">企业</button><span class="sep">›</span><span class="current">${state.dept}</span>`
        : `<span class="current">${state.dept}</span>`;
    const usage = state.role === "owner"
      ? `<section class="ko-panel"><div class="ko-panel-head"><h3>我名下的知识</h3><span class="ko-muted">${state.roleOwner} 负责的知识使用情况</span></div><table class="ko-mini"><thead><tr><th>知识名称</th><th>状态</th><th>更新时间</th><th>浏览量</th><th>引用次数</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${escape(r.name)}</td><td>${pill(r.statusLabel)}</td><td>${r.updated}</td><td>${r.views}</td><td>${r.refs}</td></tr>`).join("") || `<tr><td colspan="5" class="ko-empty">暂无名下知识</td></tr>`}</tbody></table></section>`
      : `<div class="ko-section-title"><h3>使用概览</h3><span class="ko-muted">背景指标，点击指标卡切换趋势</span></div><div class="ko-kpis">${kpis}</div>
    <div class="ko-split">
      <section class="ko-panel"><div class="ko-panel-head"><h3>${userMetrics[m][0]}趋势</h3><span class="ko-muted">近 ${state.period} 天 · 单位 ${userMetrics[m][2]}</span></div>${lineChart(cur[m], userMetrics[m][0])}</section>
      <section class="ko-panel"><div class="ko-panel-head"><h3>组织使用排行</h3><nav class="ko-crumb">${crumb}</nav></div><p class="ko-muted">${userMetrics[m][0]} · ${state.dept === "全部" ? "按部门，点击部门查看下一级" : "按下一级团队"}</p><ol class="ko-rank">${rank.map((r, i) => `<li><span class="no">${i + 1}</span>${state.dept === "全部" ? `<button data-dept="${r[0]}">${r[0]}</button>` : `<span class="name">${r[0]}</span>`}<i><em style="width:${(r[1] / rankMax) * 100}%"></em></i><b>${fmt(r[1])}</b></li>`).join("")}</ol></section>
    </div>`;
    return `<div class="ko-section-title first"><h3>运营响应</h3><span class="ko-muted">问题从派发到闭环的处理情况，点击查看闭环追踪</span></div><div class="ko-healths six">${resp}</div>
    <div class="ko-split">
      <section class="ko-panel"><div class="ko-panel-head"><h3>待处理的问题 <small class="ko-muted">${list.length} 项${unreach ? ` · 其中 ${unreach} 项高优先级未派发` : ""}</small></h3><button class="ko-link" data-goto="使用价值|0">查看全部指标 ›</button></div><ul class="ko-issues">${issueRows || `<li class="ko-empty">当前管理范围内没有待处理的问题</li>`}</ul></section>
      <section class="ko-panel"><div class="ko-panel-head"><h3>效果验证</h3><span class="ko-muted">任务闭环后，对应指标有没有改善</span></div><ul class="ko-effects">${effectRows}</ul></section>
    </div>
    <div class="ko-section-title"><h3>内容健康概览</h3><span class="ko-muted">三个维度，点击进入明细</span></div>
    <div class="ko-healths three">${health}</div>
    ${usage}`;
  }
  function tasksHTML() {
    const list = taskBase();
    const ts = taskStats(list);
    const key = state.group === "owner" ? "owner" : "dept";
    const names = [...new Set(list.map((t) => t[key]))];
    const groups = names
      .map((n) => {
        const g = list.filter((t) => t[key] === n);
        const closed = g.filter((t) => t.status === "已闭环").length;
        return [n, g.length, closed, g.filter((t) => t.overdue).length];
      })
      .sort((a, b) => b[2] / b[1] - a[2] / a[1]);
    const card = (name, v, unit, cls = "") =>
      `<article class="${cls}"><span>${name}</span><strong>${v}<small>${unit}</small></strong></article>`;
    return `<p class="ko-note">任务来自反馈流与审批流里的单子。看板发起的单子来源标记为运营看板，处理在原流程内完成，这里只做统计和跟踪。</p><div class="ko-summary five">${card("任务总数", ts.total, "个")}${card("处理中", ts.open, "个")}${card("已闭环", ts.closed, "个")}${card("超期未闭环", ts.overdue, "个", ts.overdue ? "warn" : "")}${card("问题反馈闭环率", ts.rate, ts.rate === "—" ? "" : "%")}</div>
    <div class="ko-split even">
      <section class="ko-panel"><div class="ko-panel-head"><h3>闭环率 · 按${state.group === "owner" ? "责任人" : "部门"}</h3><div class="ko-seg">${button("责任人", "group", "owner", state.group === "owner")}${button("部门", "group", "dept", state.group === "dept")}</div></div>
        <ul class="ko-groups">${groups.length ? groups.map(([n, t, c, o]) => `<li><span>${n}</span><i><em style="width:${(c / t) * 100}%"></em></i><b>${((c / t) * 100).toFixed(0)}%</b><small>${c}/${t}${o ? ` · 超期 ${o}` : ""}</small></li>`).join("") : `<li class="ko-empty">暂无任务</li>`}</ul></section>
      <section class="ko-panel"><div class="ko-panel-head"><h3>超期统计</h3><span class="ko-tbd">时效规则待确认</span></div>
        <label class="ko-sla">超期时效<select data-filter="sla" aria-label="超期时效">${[3, 5, 7].map((d) => `<option value="${d}" ${state.sla === d ? "selected" : ""}>${d} 天</option>`).join("")}</select></label>
        <p class="ko-muted">任务创建后超过所设时效仍未闭环，即计为超期。平均处理时长 ${ts.avg}${ts.avg === "—" ? "" : " 天"}。</p>
        <ul class="ko-groups compact">${["客户服务部", "产品支持部", "技术支持部"].map((d) => { const g = list.filter((t) => t.dept === d); return `<li><span>${d}</span><i class="red"><em style="width:${g.length ? (g.filter((t) => t.overdue).length / g.length) * 100 : 0}%"></em></i><b>${g.filter((t) => t.overdue).length}</b><small>共 ${g.length} 个</small></li>`; }).join("")}</ul></section>
    </div>`;
  }
  const listDefs = {
    use: { topic: "使用价值", file: "知识使用", cols: [["name", "知识名称"], ["dept", "所属部门"], ["owner", "负责人"], ["views", "浏览量"], ["hits", "检索命中次数"], ["refs", "引用次数"]] },
    zero: { topic: "使用价值", file: "零访问知识", cols: [["name", "知识名称"], ["dept", "所属部门"], ["owner", "负责人"], ["updated", "最近更新"]] },
    dislike: { topic: "内容质量", file: "点踩知识", cols: [["name", "知识名称"], ["dept", "所属部门"], ["owner", "负责人"], ["likes", "点赞量"], ["dislikes", "点踩量"]] },
    gap: { topic: "覆盖缺口", file: "无结果搜索", cols: [["word", "搜索词"], ["count", "无结果次数"], ["dept", "所属部门"], ["domain", "所属子部门"], ["day", "最近搜索时间"]] },
  };
  const reasons = [
    ["内容过时", "说明与当前版本存在差异，请核对适用版本。"],
    ["答非所问", "回答没有覆盖提问的具体场景。"],
    ["信息缺失", "缺少适用条件和例外情况。"],
    ["表述不清", "步骤顺序容易让人误解。"],
  ];
  const feedbackOf = (r) => reasons[r.id % reasons.length].join(" · ");
  function dispatchBtn(k, r, i) {
    const saved = state.topic;
    state.topic = listDefs[k].topic;
    const ref = rowPreset(r).ref;
    state.topic = saved;
    const raw = tasks.find((t) => t.ref === ref && t.status !== "已闭环");
    if (!raw) return `<button class="btn primary ko-sm" data-dispatch-row="${k}:${i}">派发任务</button>`;
    const t = taskView(raw);
    return `<span class="ko-pill ${t.overdue ? "danger" : t.status === "处理中" ? "info" : "warn"}" title="${t.code} · 已在闭环追踪中">${t.statusText.replace(" · ", "·")}</span>`;
  }
  function trendOf(topic, label, total, rows) {
    const st = state.topic;
    const sm = state.metric;
    state.topic = topic;
    state.metric = 0;
    const html = chart(rows, [label, total, "次"]);
    state.topic = st;
    state.metric = sm;
    return html;
  }
  function jumpBtn(ref, label) {
    const raw = tasks.find((t) => t.ref === ref && t.status !== "已闭环");
    if (!raw) return `<button class="btn primary ko-sm" data-jump="${ref}">${label}</button>`;
    const t = taskView(raw);
    return `<button class="ko-pill ko-pillbtn ${t.overdue ? "danger" : t.status === "处理中" ? "info" : "warn"}" data-jump="${ref}" title="${t.code} · 点击查看任务">${t.statusText.replace(" · ", "·")} ›</button>`;
  }
  const kpi3 = (items) =>
    `<div class="ko-kpi3">${items.map(([n, v, u, bad, hint]) => `<div title="${escape(hint || "")}"><span>${n}</span><strong class="${bad ? "bad" : ""}">${v}<small>${u}</small></strong>${hint ? `<em>${hint}</em>` : ""}</div>`).join("")}</div>`;
  const colHead = (title, desc, tbd = "") => `<header class="ko-colhead"><h3>${title}</h3><span class="ko-muted">${desc}</span>${tbd}</header>`;
  const subHead = (title, k, total, limit) =>
    `<div class="ko-subhead"><h4>${title}</h4><span class="ko-muted">${total} 条</span>${total > limit ? `<button class="ko-link" data-exp="${k}">${state.exp[k] ? "收起" : "全部 " + total + " 条"}</button>` : ""}${k === "gap" ? `<button class="ko-link" data-export="${k}" ${total ? "" : "disabled"}>导出</button>` : ""}</div>`;
  const top = (k, list, limit) => (state.exp[k] ? list : list.slice(0, limit));
  function analysisHTML(rows) {
    const L = {
      use: [...rows].sort((a, b) => b.views - a.views),
      zero: rows.filter((r) => r.statusLabel === "已发布" && !r.views).sort((a, b) => a.updated.localeCompare(b.updated)),
      dislike: rows.filter((r) => r.dislikes).sort((a, b) => b.dislikes - a.dislikes),
      gap: [...searchRows()].sort((a, b) => b.count - a.count),
    };
    pending = pending || {};
    pending.lists = L;
    pending.presets = {};
    L.dislike.forEach((r) => (pending.presets[`d:${r.id}`] = { title: `处理「${r.name}」的点踩反馈`, metric: "内容质量 · 点踩量", owner: r.owner, dept: r.dept, domain: r.domain, ref: `d:${r.id}` }));
    L.gap.forEach((r) => (pending.presets[`w:${r.word}`] = { title: `补充「${r.word}」相关知识`, metric: "覆盖缺口 · 无结果搜索", owner: ownerByDept[r.dept], dept: r.dept, domain: r.domain, ref: `w:${r.word}` }));
    const clickRate = searchRate("clicks");
    const emptyRate = searchRate("empty");
    const emptyCount = sum(L.gap, "count");
    const likes = sum(rows, "likes");
    const dislikes = sum(rows, "dislikes");
    const good = likes + dislikes ? ((likes / (likes + dislikes)) * 100).toFixed(1) : "—";
    const answers = rows.reduce((n, r) => n + (r.likes + r.dislikes) * 7 + r.refs * 4, 0);
    const fbRate = answers ? (((likes + dislikes) / answers) * 100).toFixed(1) : "—";
    const row = (no, main, sub, val, acts) =>
      `<li class="ko-crow">${no === null ? "" : `<span class="no">${no}</span>`}<div class="m"><b>${main}</b><small>${sub}</small></div>${val || ""}<div class="a">${acts}</div></li>`;
    const vbar = (v, max, cls = "") => `<div class="v"><i><em class="${cls}" style="width:${(v / max) * 100}%"></em></i><b>${v}</b></div>`;
    const empty = (t) => `<p class="ko-empty">${t}</p>`;

    // 使用价值
    const umax = Math.max(1, ...L.use.map((r) => r.views));
    const useList = top("use", L.use, 5).map((r, i) => row(i + 1, escape(r.name), `${r.dept} · 命中 ${r.hits} · 引用 ${r.refs}`, vbar(r.views, umax), `<button class="ko-link" data-detail="use:${i}">查看</button>`)).join("");
    const pos = successfulSearches.filter((r) => (state.dept === "全部" || r.dept === state.dept) && (state.domain === "全部" || r.domain === state.domain) && inPeriod(r.day));
    const clicks = sum(pos, "clicks");
    const noClick = sum(pos, "count") - clicks;
    const totalS = clicks + noClick + emptyCount;
    const pct = (n) => (totalS ? ((n / totalS) * 100).toFixed(0) : 0);
    const dist = totalS
      ? `<div class="ko-stackbar"><span class="c" style="flex:${clicks}"></span><span class="n" style="flex:${noClick}"></span><span class="e" style="flex:${emptyCount}"></span></div><ul class="ko-legend"><li><i class="c"></i>有结果且点击 <b>${pct(clicks)}%</b></li><li><i class="n"></i>有结果未点击 <b>${pct(noClick)}%</b></li><li><i class="e"></i>无结果 <b>${pct(emptyCount)}%</b></li></ul>`
      : empty("所选范围内没有搜索记录");
    const zeroList = top("zero", L.zero, 3).map((r, i) => row(null, escape(r.name), `${r.dept} · 最近更新 ${r.updated}`, "", dispatchBtn("zero", r, i))).join("");
    const colA = `<section class="ko-col">${colHead("使用价值", "知识有没有被用起来")}${kpi3([["浏览量", sum(rows, "views"), "次"], ["检索点击率", clickRate, clickRate === "—" ? "" : "%"], ["零访问知识", L.zero.length, "条", L.zero.length > 0]])}
      <div class="ko-subhead"><h4>浏览量趋势</h4></div>${trendOf("使用价值", "浏览量", sum(rows, "views"), rows)}
      ${subHead("热门知识", "use", L.use.length, 5)}<ul class="ko-clist">${useList || empty("暂无数据")}</ul>
      <div class="ko-subhead"><h4>零访问知识</h4><span class="ko-muted">${L.zero.length} 条</span><button class="ko-link" data-viewzero ${L.zero.length ? "" : "disabled"}>查看</button></div><ul class="ko-clist">${zeroList || empty("没有零访问的已发布知识")}</ul></section>`;

    // 内容质量
    const bySub = state.dept !== "全部";
    const satKeys = bySub ? (teams[state.dept] || []).map((t) => t[0]) : depts;
    const satRaw = satKeys
      .map((d) => {
        const rs = rows.filter((r) => (bySub ? r.domain : r.dept) === d);
        const f = sum(rs, "likes") + sum(rs, "dislikes");
        const ans = rs.reduce((n, r) => n + (r.likes + r.dislikes) * 7 + r.refs * 4, 0);
        return [d, f, ans, ans ? (f / ans) * 100 : 0];
      })
      .filter((r) => r[2]);
    const satMax = Math.max(1, ...satRaw.map((r) => r[3])) * 1.25;
    const sat = satRaw
      .map(([d, f, ans, rate]) => `<li title="${f} / ${ans} 次回答"><span>${d}</span><div class="ko-stackbar slim"><span class="c" style="flex:${rate}"></span><span class="r" style="flex:${satMax - rate}"></span></div><b>${rate.toFixed(1)}%</b></li>`)
      .join("");
    const dislikeList = top("dislike", L.dislike, 4)
      .map((r, i) => {
        const rs = reasons[r.id % reasons.length];
        return `<li class="ko-crow fbrow"><div class="m"><b>${escape(r.name)}</b><small>${r.dept} · 点踩 ${r.dislikes} 次</small><p class="ko-quote"><span class="ko-pill">${rs[0]}</span>${escape(rs[1])}</p></div><div class="a">${jumpBtn(`d:${r.id}`, "去处理 ›")}<button class="ko-link" data-detail="dislike:${i}">查看</button></div></li>`;
      })
      .join("");
    const colB = `<section class="ko-col">${colHead("内容质量", "智能体回答得好不好", '<em class="ko-tbd">分类待确认</em>')}${kpi3([["反馈率", fbRate, fbRate === "—" ? "" : "%", false, `${likes + dislikes} / ${answers} 次回答`], ["好评率", good, good === "—" ? "" : "%", false, `赞 ${likes} · 踩 ${dislikes}`], ["点踩", dislikes, "次", dislikes > 0, "需处理"]])}
      <div class="ko-subhead"><h4>${bySub ? "各子部门反馈率" : "各部门反馈率"}</h4><span class="ko-muted">有反馈的回答 ÷ 回答总数</span></div><ul class="ko-sat rate">${sat || `<li class="ko-empty">暂无数据</li>`}</ul>
      ${subHead("被点踩的知识", "dislike", L.dislike.length, 4)}<ul class="ko-clist">${dislikeList || empty("所选范围内没有点踩")}</ul></section>`;

    // 覆盖缺口
    const gmax = Math.max(1, ...L.gap.map((r) => r.count));
    const gapList = top("gap", L.gap, 5)
      .map((r, i) => row(i + 1, escape(r.word), `${r.dept} · ${r.domain} · 最近 ${r.day.slice(5)}`, vbar(r.count, gmax, "bad"), `${jumpBtn(`w:${r.word}`, "去处理 ›")}<button class="ko-link" data-detail="gap:${i}">查看</button>`))
      .join("");
    const trend = trendOf("覆盖缺口", "无结果搜索次数", emptyCount, rows);
    const colC = `<section class="ko-col">${colHead("覆盖缺口", "员工需要的知识有没有")}${kpi3([["无结果搜索", emptyCount, "次", emptyCount > 0], ["无结果率", emptyRate, emptyRate === "—" ? "" : "%", emptyRate !== "—" && emptyRate > 0], ["涉及搜索词", L.gap.length, "个"]])}
      <div class="ko-subhead"><h4>无结果趋势</h4></div>${trend}
      <div class="ko-subhead"><h4>搜索去向</h4><span class="ko-muted">红色即覆盖缺口</span></div>${dist}
      ${subHead("无结果搜索词", "gap", L.gap.length, 5)}<ul class="ko-clist">${gapList || empty("所选范围内没有无结果搜索")}</ul>
      </section>`;
    return `<div class="ko-cols">${colA}${colB}${colC}</div><p class="ko-muted ko-def">好评率 = 点赞 ÷（点赞 + 点踩），只统计有反馈的回答；反馈率 = 有反馈的回答数 ÷ 智能体回答总数，用来判断好评率是否可信。回答总数为示例口径，待确认。</p>`;
  }
  function tagTreeHTML(scopeRows) {
    const n = (tag) => scopeRows.filter((r) => r.tags.includes(tag)).length;
    const t = tagTree[state.tagType] || tagTree[0];
    const g = t.groups[state.tagGroup] || t.groups[0];
    const q = state.tagQ.trim();
    const chk = (tag, path) => `<label class="tp-item ${state.tags.includes(tag) ? "on" : ""}"><input type="checkbox" data-tag="${tag}" ${state.tags.includes(tag) ? "checked" : ""}><span>${tag}${path ? `<small class="path">${path}</small>` : ""}</span><small>${n(tag)}</small></label>`;
    let body;
    if (q) {
      const hits = Object.keys(tagInfo).filter((x) => x.includes(q));
      body = `<div class="tp-flat">${hits.map((x) => chk(x, `${tagInfo[x].type} › ${tagInfo[x].group}`)).join("") || '<p class="ko-empty">没有匹配的标签</p>'}</div>`;
    } else {
      body = `<div class="tp-cols"><ul>${tagTree.map((x, i) => `<li><button class="${i === state.tagType ? "on" : ""}" data-tptype="${i}">${x.type}</button></li>`).join("")}</ul><ul>${t.groups.map((x, i) => `<li><button class="${i === state.tagGroup ? "on" : ""}" data-tpgroup="${i}">${x.name}</button></li>`).join("")}</ul><div class="tp-tags">${g.tags.map((x) => chk(x, "")).join("")}</div></div>`;
    }
    const chips = state.tags.map((x) => `<span class="tp-chip" title="${escape(pathOf(x))}">${x}<button data-tagdel="${x}" aria-label="移除${x}">×</button></span>`).join("");
    return `<div class="ko-tagpick"><span class="tp-label">标签（多选取交集）</span><div class="tp-wrap"><button class="btn" data-tpopen>选择标签 ▾</button>${state.tagOpen ? `<div class="tp-pop"><input data-tpq placeholder="搜索标签，如：驾驶" value="${escape(state.tagQ)}" aria-label="搜索标签">${body}</div>` : ""}</div>${chips}${state.tags.length ? '<button class="ko-link" data-tagclear>清除</button>' : '<span class="ko-muted">未选择，显示全部知识</span>'}</div>`;
  }
  const archAt = (r) => (r.statusLabel !== "已归档" ? null : r.status === "已下架" ? r.updated : r.expiry);
  function invSeries(idx, vis) {
    const n = state.period;
    const past = Array.from({ length: n }, (_, k) => endOff() - n + 1 + k);
    const future = Array.from({ length: 30 }, (_, k) => k);
    const cfg = [
      { type: "bar", offs: past, title: "每日更新的知识数", f: (o) => vis.filter((r) => r.updated === iso(o)).length },
      { type: "stack", offs: past, title: "每日现存（已发布）知识数", f: (o) => vis.filter((r) => r.status !== "未发布" && (!archAt(r) || archAt(r) > iso(o))).length },
      { type: "bar", offs: future, title: "未来 30 天每日到期的知识数", hi: 8, f: (o) => vis.filter((r) => r.statusLabel === "已发布" && r.expiry === iso(o)).length },
      { type: "bar", offs: past, title: "累计已归档知识数", f: (o) => vis.filter((r) => archAt(r) && archAt(r) <= iso(o)).length },
      { type: "bar", offs: past, title: "每日未发布知识数", f: (o) => vis.filter((r) => r.status === "未发布" && r.updated <= iso(o)).length },
    ][idx];
    const out = { ...cfg, vals: cfg.offs.map(cfg.f) };
    if (cfg.type === "stack") {
      const bySub = state.dept !== "全部";
      const names = bySub ? (teams[state.dept] || []).map((t) => t[0]) : depts;
      out.stack = names.map((nm) => ({
        name: nm,
        vals: cfg.offs.map((o) => vis.filter((r) => (bySub ? r.domain : r.dept) === nm && r.status !== "未发布" && (!archAt(r) || archAt(r) > iso(o))).length),
      }));
    }
    return out;
  }
  function invChartHTML(idx, vis) {
    const sr = invSeries(idx, vis);
    const w = 900;
    const h = 200;
    const l = 36;
    const r = 10;
    const t = 12;
    const bt = 30;
    const n = sr.vals.length;
    const max = Math.max(2, ...sr.vals);
    const y = (v) => t + (1 - v / max) * (h - t - bt);
    const step = (w - l - r) / n;
    const xb = (i) => l + i * step;
    const xl = (i) => l + (i * (w - l - r)) / (n - 1);
    const grid = [0, 0.5, 1].map((p) => { const v = Math.round(max * p); return `<path d="M${l} ${y(v).toFixed(1)}H${w - r}" class="grid"/><text x="${l - 8}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end">${v}</text>`; }).join("");
    const lab = [0, 0.33, 0.66, 1].map((p) => { const i = Math.round(p * (n - 1)); return `<text x="${(sr.type === "bar" ? xb(i) + step / 2 : xl(i)).toFixed(1)}" y="${h - 10}" text-anchor="${p === 0 ? "start" : p === 1 ? "end" : "middle"}">${iso(sr.offs[i]).slice(5)}</text>`; }).join("");
    const pal = ["#1764ff", "#6fa2ff", "#a9c4f8", "#34b27b"];
    let shape;
    if (sr.type === "stack") {
      const cum = sr.stack.map(() => []);
      sr.vals.forEach((_, i) => {
        let acc = 0;
        sr.stack.forEach((g, gi) => {
          acc += g.vals[i];
          cum[gi][i] = acc;
        });
      });
      const areas = sr.stack
        .map((g, gi) => {
          const upper = cum[gi].map((v, i) => `${xl(i).toFixed(1)},${y(v).toFixed(1)}`);
          const lower = (gi ? cum[gi - 1] : cum[gi].map(() => 0)).map((v, i) => `${xl(i).toFixed(1)},${y(v).toFixed(1)}`).reverse();
          return `<polygon points="${upper.join(" ")} ${lower.join(" ")}" fill="${pal[gi % pal.length]}" fill-opacity="0.88"/><polyline points="${upper.join(" ")}" fill="none" stroke="#fff" stroke-width="1.2"/>`;
        })
        .reverse()
        .join("");
      const hover = sr.vals
        .map((_, i) => `<rect x="${(xl(i) - (w - l - r) / (n - 1) / 2).toFixed(1)}" y="${t}" width="${((w - l - r) / (n - 1)).toFixed(1)}" height="${h - t - bt}" fill="transparent"><title>${iso(sr.offs[i])}（共 ${sr.vals[i]} 条）\n${sr.stack.map((g) => `${g.name}：${g.vals[i]} 条`).join("\n")}</title></rect>`)
        .join("");
      shape = areas + hover;
    } else if (sr.type === "bar") {
      shape = sr.vals.map((v, i) => `<rect x="${(xb(i) + step * 0.2).toFixed(1)}" y="${y(v).toFixed(1)}" width="${(step * 0.6).toFixed(1)}" height="${Math.max(0, h - bt - y(v)).toFixed(1)}" rx="2" class="${sr.hi && i < sr.hi ? "hi" : ""}"><title>${iso(sr.offs[i])}：${v} 条</title></rect>`).join("");
    } else {
      const pts = sr.vals.map((v, i) => `${xl(i).toFixed(1)},${y(v).toFixed(1)}`);
      const dots = sr.vals.map((v, i) => (i === 0 || v !== sr.vals[i - 1] || i === n - 1 ? `<circle cx="${xl(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3.5"><title>${iso(sr.offs[i])}：${v} 条</title></circle>` : "")).join("");
      shape = `<polygon points="${l},${h - bt} ${pts.join(" ")} ${xl(n - 1).toFixed(1)},${h - bt}" class="area"/><polyline points="${pts.join(" ")}" class="line"/>${dots}`;
    }
    const note = idx === 1 ? `按${state.dept === "全部" ? "部门" : "子部门"}堆叠，示例数据` : idx === 2 ? "深色为未来 7 天内到期，浅色为之后到期" : idx === 0 ? "按知识的更新时间统计" : "按发布和归档时间推演，示例数据";
    return `<section class="ko-panel ko-invchart"><div class="ko-panel-head"><h3>${sr.title}</h3><span class="ko-muted">${note} · 点击上方卡片切换</span></div><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${sr.title}"><g class="ax">${grid}${lab}</g><g class="sh ${sr.type}">${shape}</g></svg>${sr.stack ? `<ul class="ko-legend">${sr.stack.map((g, gi) => `<li><i style="background:${pal[gi % pal.length]}"></i>${g.name}</li>`).join("")}</ul>` : ""}</section>`;
  }
  function render() {
    const rows = base().map(stats);
    const visible = currentRows();
    const scrollY = window.scrollY;
    const cols = columns();
    const tabs = [["盘点", "知识盘点"], ["运营", "知识分析"], ["任务", "闭环追踪"]];
    const showTable = state.tab === "任务";
    const heading = state.tab === "盘点" ? "知识清单" : state.tab === "任务" ? "任务明细" : state.topic === "覆盖缺口" ? "无结果搜索词" : state.topic === "内容质量" ? "知识反馈统计" : "知识明细";
    const canDispatch = state.tab === "运营";
    let body = "";
    if (state.tab === "任务") body = tasksHTML();
    else if (state.tab === "运营")
      body = analysisHTML(rows);
    else
      body = (() => {
        const n = (f) => visible.filter(f).length;
        const defs = [["所选期间更新", n((r) => inPeriod(r.updated))], ["现存（已发布）", n((r) => r.statusLabel === "已发布")], ["其中 7 天内到期", n(soon)], ["已归档", n((r) => r.statusLabel === "已归档")], ["未发布", n((r) => r.statusLabel === "未发布")]];
        const cards = defs
          .map(([name, v], i) => `<button class="ko-icard ${state.invCard === i ? "sel" : ""}" data-invcard="${i}" aria-pressed="${state.invCard === i}"><span>${name}</span><strong>${v}<small>条</small></strong></button>`)
          .join("");
        const chartHTML = invChartHTML(state.invCard, visible);
        const deptRows = depts
          .filter((d) => state.dept === "全部" || d === state.dept)
          .map((d) => {
            const g = visible.filter((r) => r.dept === d);
            return `<tr><td>${d}</td><td>${g.length}</td><td>${g.filter((r) => r.statusLabel === "已发布").length}</td><td>${g.filter(soon).length}</td><td>${g.filter((r) => r.statusLabel === "已归档").length}</td><td>${g.filter((r) => r.statusLabel === "未发布").length}</td></tr>`;
          })
          .join("");
        
        return `<div class="ko-panel ko-inventory">${tagTreeHTML(rows)}<div class="ko-summary five">${cards}</div>${chartHTML}<table class="ko-mini"><thead><tr><th>部门</th><th>知识总数</th><th>已发布</th><th>7 天内到期</th><th>已归档</th><th>未发布</th></tr></thead><tbody>${deptRows}</tbody></table><p class="ko-muted">已过期和已下架的知识统一按已归档处理，不进入待处理问题。有效期字段待确认。</p></div>`;
      })();
    const taskChips = state.tab === "任务" ? `<div class="ko-seg">${["全部", "待处理", "处理中", "已闭环", "超期"].map((t) => `<button class="ko-tab ${state.taskFilter === t ? "selected" : ""}" data-taskfilter="${t}">${t}</button>`).join("")}</div>` : "";
    const table = showTable
      ? `<section class="ko-panel"><div class="ko-table-head"><h3>${heading} <small>${visible.length} 条</small></h3>${taskChips}<form id="ko-search"><input name="query" placeholder="${state.tab === "任务" ? "搜索任务编码或标题" : state.topic === "覆盖缺口" && state.tab === "运营" ? "搜索关键词" : "搜索知识名称"}" aria-label="搜索明细" value="${escape(state.query)}"><button class="btn">搜索</button></form><button class="btn" data-export ${visible.length ? "" : "disabled"}>导出当前结果</button></div><div class="ko-table-wrap"><table><thead><tr>${cols.map((c) => `<th>${c[1]}</th>`).join("")}<th>操作</th></tr></thead><tbody>${visible.length ? visible.map((r, i) => `<tr>${cols.map((c) => `<td>${cellHTML(r, c[0])}</td>`).join("")}<td class="ko-ops"><button class="ko-link" data-detail="${i}">查看</button>${canDispatch ? `<button class="ko-link" data-dispatch-row="${i}">派发任务</button>` : ""}</td></tr>`).join("") : `<tr><td colspan="${cols.length + 1}" class="ko-empty">暂无符合条件的数据，可调整筛选条件</td></tr>`}</tbody></table></div></section>`
      : "";
    const foot = state.tab === "盘点" ? "未设置有效期的知识不计入过期统计；有效期字段待确认。" : "行为指标按所选期间统计。";
    root.innerHTML = `<section class="ko"><header class="ko-head"><div><h1>知识运营看板</h1><p class="ko-muted">指标根据实际情况做调整 · 发现问题、派发任务、跟踪处理、验证效果</p></div><div class="ko-head-right"><div class="ko-seg ko-roles" role="group" aria-label="查看视角">${[["admin", "企业管理员"], ["dept", "部门管理员"], ["owner", "知识负责人"]].map(([k, l]) => `<button class="ko-tab ${state.role === k ? "selected" : ""}" data-role="${k}" aria-pressed="${state.role === k}">${l}</button>`).join("")}</div><span class="ko-mock">Mock 数据 · 非真实运营数据</span></div></header><div class="ko-filters"><span class="ko-scope"><b>管理范围</b>${state.role === "admin" ? "全企业" : state.role === "dept" ? state.roleDept + "（含 " + (teams[state.roleDept] || []).length + " 个子部门）" : state.roleOwner + " 名下知识"}</span>${state.role === "dept" ? select("roleDept", "当前部门（演示切换）", depts) : ""}${state.role === "admin" ? select("dept", "部门", ["全部", ...depts]) : ""}${(() => {
      const scopeDept = state.role === "admin" ? state.dept : state.role === "dept" ? state.roleDept : ownerDept[state.roleOwner];
      const names = scopeDept === "全部" ? depts.flatMap((d) => teams[d].map((t) => t[0])) : teams[scopeDept].map((t) => t[0]);
      return select("domain", "子部门", ["全部", ...names]);
    })()}<div class="ko-range"><span>统计时间</span><input type="date" data-range="from" value="${state.from}" max="${iso(0)}" aria-label="开始日期"><i>至</i><input type="date" data-range="to" value="${state.to}" max="${iso(0)}" aria-label="结束日期"><div class="ko-seg">${[[7, "近7天"], [30, "近30天"]].map(([n, l]) => `<button class="ko-tab ${state.to === iso(0) && state.period === n ? "selected" : ""}" data-quick="${n}">${l}</button>`).join("")}</div></div><button class="btn" data-reset>重置筛选</button><span class="ko-muted">样例统计截至 2026-11-13</span></div><nav class="ko-main-tabs">${tabs.map(([k, label]) => button(label, "tab", k, state.tab === k)).join("")}</nav>${body}${state.tab === "运营" ? "" : table}<p class="ko-muted ko-foot">${foot} 示例数据用于交互评审。</p>
    <dialog id="ko-detail" aria-label="明细"><div id="ko-detail-content"></div><div class="ko-dialog-actions" id="ko-detail-actions"></div></dialog>
    <dialog id="ko-dispatch" aria-label="派发任务"><form id="ko-dispatch-form"><h2>派发任务</h2><p class="ko-muted">将在反馈流中创建一张单子，来源标记为运营看板；处理在原流程内完成，进展在「闭环追踪」查看。</p><label>任务标题<input name="title" required maxlength="60"></label><label>关联指标<input name="metric" readonly></label><label>责任人<select name="owner">${owners.map((o) => `<option>${o}</option>`).join("")}</select></label><label>说明<textarea name="note" rows="3" placeholder="补充背景或期望的处理结果（可选）"></textarea></label><div class="ko-dialog-actions"><button type="button" class="btn" data-close-dispatch>取消</button><button class="btn primary">派发</button></div></form></dialog><div class="ko-status" role="status" id="ko-status"></div></section>`;
    window.scrollTo(0, scrollY);
  }
  function openDispatch(p) {
    const form = document.getElementById("ko-dispatch-form");
    pending = { ...(pending || {}), dispatch: p };
    form.title.value = p.title;
    form.metric.value = p.metric;
    form.owner.value = owners.includes(p.owner) ? p.owner : owners[0];
    document.getElementById("ko-dispatch").showModal();
  }
  function rowPreset(r) {
    if (state.topic === "覆盖缺口")
      return { title: `补充「${r.word}」相关知识`, metric: "覆盖缺口 · 无结果搜索", owner: ownerByDept[r.dept], dept: r.dept, domain: r.domain, ref: `w:${r.word}` };
    const name = r.name;
    const map = {
      使用价值: [`评估「${name}」的使用情况`, "使用价值 · 零访问与低使用"],
      内容质量: [`处理「${name}」的点踩反馈`, "内容质量 · 点踩量"],
    };
    const [title, metric] = map[state.topic];
    const ref = { 使用价值: `z:${r.id}`, 内容质量: `d:${r.id}` }[state.topic];
    return { title, metric, owner: r.owner, dept: r.dept, domain: r.domain, ref };
  }
  root.addEventListener("change", (e) => {
    if (e.target.dataset.range) {
      const f = root.querySelector('[data-range="from"]').value || state.from;
      const t = root.querySelector('[data-range="to"]').value || state.to;
      setRange(f, t);
      render();
      return;
    }
    if (e.target.dataset.filter) {
      const k = e.target.dataset.filter;
      state[k] = k === "period" || k === "sla" ? Number(e.target.value) : e.target.value;
      if (k === "dept") state.domain = "全部";
      if (k === "roleDept") {
        state.dept = state.roleDept;
        state.domain = "全部";
      }
      state.query = "";
      render();
    }
    if (e.target.dataset.tag) {
      state.tags = e.target.checked
        ? [...state.tags, e.target.dataset.tag]
        : state.tags.filter((t) => t !== e.target.dataset.tag);
      render();
    }
  });
  root.addEventListener("input", (e) => {
    if (e.target.dataset.tpq !== undefined) {
      state.tagQ = e.target.value;
      render();
      const el = root.querySelector("[data-tpq]");
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  });
  document.addEventListener("mousedown", (e) => {
    if (state.tagOpen && !e.target.closest(".tp-wrap")) {
      state.tagOpen = false;
      state.tagQ = "";
      render();
    }
  });
  root.addEventListener("submit", (e) => {
    if (e.target.id === "ko-dispatch-form") {
      e.preventDefault();
      const f = e.target;
      const p = pending.dispatch;
      const owner = f.owner.value;
      const code = "OPS-" + (1110 + tasks.length - taskSeeds.length);
      tasks.push({
        code,
        title: f.title.value.trim(),
        metric: p.metric,
        owner,
        dept: p.dept || ownerDept[owner],
        domain: p.domain && p.domain !== "全部" ? p.domain : (teams[p.dept || ownerDept[owner]] || [["华东服务组"]])[0][0],
        status: "待处理",
        createdDay: iso(0),
        closedDay: "",
        reply: "",
        ref: p.ref || "",
        origin: "运营看板",
        effect: null,
      });
      document.getElementById("ko-dispatch").close();
      state.tab = "任务";
      state.taskFilter = "全部";
      state.query = "";
      render();
      document.getElementById("ko-status").textContent = `已派发 ${code}，责任人 ${owner}，超期时效按 ${state.sla} 天计`;
      return;
    }
    if (e.target.id === "ko-search") {
      e.preventDefault();
      state.query = new FormData(e.target).get("query").trim();
      render();
    }
  });
  root.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.goto !== undefined) {
      const [topic, metric] = b.dataset.goto.split("|");
      Object.assign(state, { tab: "运营", topic, metric: Number(metric), query: "" });
      render();
      return;
    }
    if (b.dataset.ovmetric !== undefined) {
      state.ovMetric = Number(b.dataset.ovmetric);
      render();
      return;
    }
    if (b.dataset.taskfilter !== undefined) {
      state.taskFilter = b.dataset.taskfilter;
      render();
      return;
    }
    if (b.dataset.quick !== undefined) {
      const q = Number(b.dataset.quick);
      setRange(iso(-q + 1), iso(0));
      render();
      return;
    }
    if (b.dataset.invcard !== undefined) {
      state.invCard = Number(b.dataset.invcard);
      render();
      return;
    }
    if (b.dataset.jump !== undefined) {
      const ref = b.dataset.jump;
      const preset = pending.presets[ref];
      const open = tasks.find((t) => t.ref === ref && t.status !== "已闭环");
      Object.assign(state, { tab: "任务", taskFilter: "全部", query: open ? open.code : "" });
      render();
      window.scrollTo(0, 0);
      if (open) document.getElementById("ko-status").textContent = `已定位到任务 ${open.code}`;
      else if (preset) openDispatch(preset);
      return;
    }
    if (b.hasAttribute("data-viewzero")) {
      const z = pending.lists.zero;
      document.getElementById("ko-detail-content").innerHTML = `<h2>零访问知识</h2><p class="ko-muted">已发布，所选期间没有被浏览 · ${z.length} 条 · Mock 数据</p><ul class="ko-plain">${z.map((r) => `<li><div><b>${escape(r.name)}</b><small>${r.dept} · ${r.owner} · 最近更新 ${r.updated}</small></div></li>`).join("")}</ul>`;
      document.getElementById("ko-detail-actions").innerHTML = `<button class="btn" data-close>关闭</button>`;
      document.getElementById("ko-detail").showModal();
      return;
    }
    if (b.dataset.exp !== undefined) {
      state.exp = { ...state.exp, [b.dataset.exp]: !state.exp[b.dataset.exp] };
      render();
      return;
    }
    if (b.hasAttribute("data-tpopen")) {
      state.tagOpen = !state.tagOpen;
      render();
      return;
    }
    if (b.dataset.tptype !== undefined) {
      state.tagType = Number(b.dataset.tptype);
      state.tagGroup = 0;
      render();
      return;
    }
    if (b.dataset.tpgroup !== undefined) {
      state.tagGroup = Number(b.dataset.tpgroup);
      render();
      return;
    }
    if (b.dataset.tagdel !== undefined) {
      state.tags = state.tags.filter((x) => x !== b.dataset.tagdel);
      render();
      return;
    }
    if (b.hasAttribute("data-tagclear")) {
      state.tags = [];
      state.tagNodes = [];
      render();
      return;
    }
    if (b.dataset.issue !== undefined) {
      const it = pending.issues[Number(b.dataset.issue)];
      openDispatch({ title: it.taskTitle, metric: it.metric, owner: it.owner, dept: it.dept, domain: it.domain, ref: it.ref });
      return;
    }
    if (b.dataset.go !== undefined) {
      const [, target] = b.dataset.go.split(":");
      if (target.includes("|")) {
        const [tab, topic] = target.split("|");
        Object.assign(state, { tab, topic, metric: 0, query: "" });
      } else Object.assign(state, { tab: target, query: "" });
      render();
      return;
    }
    if (b.dataset.role !== undefined) {
      state.role = b.dataset.role;
      state.domain = "全部";
      state.dept = state.role === "admin" ? "全部" : state.role === "dept" ? state.roleDept : ownerDept[state.roleOwner];
      state.query = "";
      render();
      return;
    }
    if (b.dataset.dispatchRow !== undefined) {
      if (b.dataset.dispatchRow.includes(":")) {
        const [k, i] = b.dataset.dispatchRow.split(":");
        state.topic = listDefs[k].topic;
        openDispatch(rowPreset(pending.lists[k][Number(i)]));
      } else openDispatch(rowPreset(currentRows()[Number(b.dataset.dispatchRow)]));
      return;
    }
    if (b.hasAttribute("data-close-dispatch")) {
      document.getElementById("ko-dispatch").close();
      return;
    }
    if (b.dataset.advance !== undefined) {
      const t = tasks.find((x) => x.code === b.dataset.advance);
      if (t.status === "待处理") {
        t.status = "处理中";
        t.reply = t.reply || "已受理，正在核实";
      } else {
        t.status = "已闭环";
        t.closedDay = iso(0);
        t.reply = (t.reply && t.reply !== "已受理，正在核实" ? t.reply : "") || "已处理完成（示例回复）";
      }
      render();
      document.getElementById("ko-status").textContent = `${t.code} 状态已更新为「${t.status}」，闭环率与超期统计同步变化`;
      return;
    }
    for (const key of ["tab", "topic", "metric", "dept", "group"])
      if (b.dataset[key] !== undefined) {
        state[key] = key === "metric" ? Number(b.dataset[key]) : b.dataset[key];
        if (key === "topic") {
          state.metric = 0;
          state.query = "";
        }
        if (key === "tab") state.query = "";
        render();
        return;
      }
    if (b.hasAttribute("data-reset")) {
      Object.assign(state, {
        dept: state.role === "admin" ? "全部" : state.dept,
        domain: "全部",
        period: 30,
        from: "2026-10-15",
        to: "2026-11-13",
        query: "",
        folder: "全部",
        status: "全部",
        tags: [],
        tagNodes: [],
        updated: "全部",
        taskFilter: "全部",
      });
      render();
    }
    if (b.hasAttribute("data-close"))
      document.getElementById("ko-detail").close();
    if (b.dataset.detail !== undefined && b.dataset.detail.includes(":")) {
      const [k, i] = b.dataset.detail.split(":");
      const r = pending.lists[k][Number(i)];
      const def = listDefs[k];
      const fb = k === "dislike" ? `<h3>点踩反馈样例</h3><p>${escape(feedbackOf(r))}</p><p class="ko-muted">点踩分类为新增项，待确认；点赞不附带反馈内容。</p>` : "";
      document.getElementById("ko-detail-content").innerHTML = `<h2>${escape(r.name || r.word)}</h2><p class="ko-muted">Mock 数据</p><dl>${def.cols.map(([key, title]) => `<dt>${title}</dt><dd>${escape(cell(r, key))}</dd>`).join("")}</dl>${fb}`;
      document.getElementById("ko-detail-actions").innerHTML = `<button class="btn" data-close>关闭</button>`;
      document.getElementById("ko-detail").showModal();
      return;
    }
    if (b.dataset.detail !== undefined) {
      const r = currentRows()[Number(b.dataset.detail)];
      const isTask = state.tab === "任务";
      const extra = isTask
        ? `<h3>处理过程</h3><ol class="ko-steps"><li class="done"><b>${r.createdDay}</b> 运营看板派发，责任人 ${escape(r.owner)}</li><li class="${r.status !== "待处理" ? "done" : ""}">受理并处理</li><li class="${r.status === "已闭环" ? "done" : ""}">${r.closedDay ? "<b>" + r.closedDay + "</b> " : ""}闭环验证</li></ol>`
        : state.topic === "内容质量" && state.tab === "运营"
          ? `<h3>点踩反馈样例</h3><p>${r.dislikes ? "内容过时 · “说明与当前版本存在差异，请核对适用版本。”" : "暂无点踩反馈内容"}</p><p class="ko-muted">样例反馈用于展示阅读路径，点赞不附带反馈内容。</p>`
          : "";
      document.getElementById("ko-detail-content").innerHTML =
        `<h2>${escape(r.title || r.name || r.word)}</h2><p class="ko-muted">Mock 数据</p><dl>${columns().map(([key, title]) => `<dt>${title}</dt><dd>${key === "tags" ? r.tags.map((t) => escape(pathOf(t))).join("<br>") : cellHTML(r, key)}</dd>`).join("")}</dl>${extra}`;
      document.getElementById("ko-detail-actions").innerHTML =
        `${isTask && r.status !== "已闭环" ? `<button class="btn primary" data-advance="${r.code}">${r.status === "待处理" ? "受理任务" : "标记已闭环"}</button>` : ""}<button class="btn" data-close>关闭</button>`;
      document.getElementById("ko-detail").showModal();
    }
    if (b.hasAttribute("data-export")) {
      const lk = b.dataset.export;
      const cols = lk ? listDefs[lk].cols : columns();
      const data = lk ? pending.lists[lk] : currentRows();
      const quote = (v) =>
        '"' +
        String(v)
          .replace(/^[=+@-]/, "'$&")
          .replace(/"/g, '""') +
        '"';
      const csv =
        "\uFEFF" +
        [
          cols.map((c) => quote(c[1])).join(","),
          ...data.map((r) =>
            cols.map((c) => quote(cell(r, c[0]))).join(","),
          ),
        ].join("\r\n");
      const url = URL.createObjectURL(
        new Blob([csv], { type: "text/csv;charset=utf-8" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = lk ? `${listDefs[lk].file}-Mock.csv` : `${state.tab === "任务" ? "任务闭环" : "知识" + (state.tab === "盘点" ? "盘点" : state.topic)}-Mock.csv`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      document.getElementById("ko-status").textContent = "已导出当前筛选结果";
    }
  });
  root.addEventListener("click", (e) => {
    if (e.target.id === "ko-detail" || e.target.id === "ko-dispatch") e.target.close();
  });
  render();
})();
