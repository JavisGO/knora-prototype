(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const statuses = ['待启动', '进行中', '待测试', '待部署', '已完成', '待优化', '未标注'];
  const seed = JSON.parse($('platform-schedule-data').textContent);
  // A changed source file starts a new local draft, so old browser data cannot hide new schedules.
  const fingerprint = JSON.stringify(seed).split('').reduce((hash, char) => (Math.imul(hash, 31) + char.charCodeAt(0)) | 0, 0);
  const storageKey = `knora-platform-schedule:${location.pathname}:${fingerprint}`;
  let rows = structuredClone(seed);
  let pending = null;
  let editing = false;
  let editSnapshot = null;
  let dirty = false;
  let fileSaving = false;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const validRows = data => Array.isArray(data) && data.every(row => row && ['id','module','name','description','date','status'].every(key => typeof row[key] === 'string'));
  try {
    const legacyFingerprint = $('platform-schedule-data').dataset.legacyFingerprint;
    const saved = JSON.parse(localStorage.getItem(storageKey) || (legacyFingerprint ? localStorage.getItem(`knora-platform-schedule:${location.pathname}:${legacyFingerprint}`) : null));
    if (validRows(saved)) { rows = saved; localStorage.setItem(storageKey, JSON.stringify(rows)); dirty = true; $('save-status').textContent = '已恢复此浏览器中保存的排期。'; }
  } catch (_) { /* Local storage may be unavailable when opening a local HTML file. */ }
  const options = selected => statuses.map(status => `<option${status === selected ? ' selected' : ''}>${status}</option>`).join('');
  $('filter-status').innerHTML = '<option value="">全部状态</option>' + options('');
  $('field-status').innerHTML = options('待启动');
  const filterIds = ['filter-module','filter-group','filter-name','filter-description','filter-month','filter-status','filter-start','filter-end','filter-date'];
  filterIds.forEach(id => { $(id).value = ''; });
  $('task-dialog').removeAttribute('open');
  function moduleColumns(value) {
    const paths = value.split(' / ').map(path => path.split(' · '));
    return [
      [...new Set(paths.map(([platform]) => platform))].join(' / '),
      [...new Set(paths.map(([, ...groups]) => groups.filter(group => group !== '-').join(' · ')).filter(Boolean))].join(' / ')
    ];
  }
  function visibleRows() {
    const textFilters = ['name','description'].map(key => [key, $(`filter-${key}`).value.trim().toLowerCase()]);
    const status = $('filter-status').value;
    const month = $('filter-month').value;
    const start = $('filter-start').value;
    const end = $('filter-end').value;
    return rows.filter(row => textFilters.every(([key, query]) => row[key].toLowerCase().includes(query)) &&
      (!month || (row.month || row.date.slice(5, 7)) === month) && (!status || row.status === status) && (!start || (row.date && row.date >= start)) && (!end || (row.date && row.date <= end)) &&
      (!$('filter-date').value || ($('filter-date').value === 'empty' ? !row.date : !!row.date)));
  }
  function render() {
    document.body.classList.toggle('schedule-editing', editing);
    $('edit-list').hidden = editing;
    const visible = visibleRows();
    $('filter-result').textContent = `显示 ${visible.length} / ${rows.length} 项`;
    const textEditor = (row, key, label) => `<textarea class="schedule-cell-editor" data-key="${key}" aria-label="${label}" rows="${key === 'description' ? 3 : 2}">${escape(row[key])}</textarea>`;
    $('schedule-body').innerHTML = visible.length ? visible.map((row, index) => `<tr data-id="${escape(row.id)}">
      ${editing ? `<td colspan="2">${textEditor(row, 'module', '平台及功能模块')}</td>` : moduleColumns(row.module).map(value => `<td>${escape(value)}</td>`).join('')}
      <td class="schedule-task-name">${editing ? textEditor(row, 'name', '功能名称') : escape(row.name)}</td>
      <td>${editing ? textEditor(row, 'description', '功能描述') : escape(row.description)}</td>
      <td>${editing ? `<input class="schedule-cell-editor" data-key="date" aria-label="计划排期日期" type="date" value="${escape(row.date)}">` : escape(row.date) || '<span style="color:#94a0b0">未排期</span>'}</td>
      <td>${editing ? `<select class="schedule-cell-editor" data-key="status" aria-label="状态">${options(row.status)}</select>` : `<span class="schedule-status" data-status="${escape(row.status)}">${escape(row.status)}</span>`}</td>
      ${editing ? `<td><div class="row-actions"><button type="button" data-action="add">下方新增</button><button type="button" data-action="up" ${index === 0 ? 'disabled' : ''}>上移</button><button type="button" data-action="down" ${index === visible.length - 1 ? 'disabled' : ''}>下移</button><button type="button" data-action="delete">删除</button></div></td>` : ''}
    </tr>`).join('') : `<tr><td colspan="${editing ? 7 : 6}" class="schedule-empty">暂无符合条件的任务，可重置筛选${editing ? '或新增任务' : ''}。</td></tr>`;
  }
  function persist(message, redraw = true) {
    dirty = true;
    try {
      localStorage.setItem(storageKey, JSON.stringify(rows));
      $('save-status').textContent = `${message}，已保存到此浏览器。`;
    } catch (_) { $('save-status').textContent = `${message}；浏览器无法保存，请使用“保存到 HTML”保留修改。`; }
    if (redraw) render();
  }
  function validateRows() {
    const invalid = rows.find(row => !row.name.trim());
    if (!invalid) return true;
    clearFilters();
    const input = [...$('schedule-body').querySelectorAll('[data-key="name"]')].find(element => element.closest('tr').dataset.id === invalid.id);
    input.setCustomValidity('请填写功能名称');
    input.reportValidity(); input.focus();
    return false;
  }
  $('edit-list').addEventListener('click', () => {
    editSnapshot = structuredClone(rows); editing = true; render();
  });
  $('finish-edit').addEventListener('click', () => {
    if (!validateRows()) return;
    editing = false; editSnapshot = null; persist('排期修改已保存');
  });
  $('cancel-edit').addEventListener('click', () => {
    rows = editSnapshot; editSnapshot = null; editing = false; persist('已取消本次编辑');
  });
  $('schedule-body').addEventListener('input', event => {
    const input = event.target.closest('[data-key]');
    if (!editing || fileSaving || !input) return;
    const row = rows.find(item => item.id === input.closest('tr').dataset.id);
    row[input.dataset.key] = input.value;
    input.setCustomValidity('');
    // Do not rebuild the table while typing: preserve focus and the caret.
    persist('排期已更新', false);
  });

  function clearFilters() { filterIds.forEach(id => { $(id).value = ''; }); render(); }
  function openEditor(id, addBelow = false) {
    if (!editing || fileSaving) return;
    pending = addBelow ? {after: id} : id ? {edit: id} : {after: null};
    const row = pending.edit ? rows.find(item => item.id === id) : {module: id ? rows.find(item => item.id === id).module : '', name:'', description:'', date:'', status:'待启动'};
    $('dialog-title').textContent = pending.edit ? '编辑功能任务' : addBelow ? '在此行下方新增任务' : '新增功能任务';
    $('field-name').setCustomValidity('');
    ['module','name','description','date','status'].forEach(key => { $(`field-${key}`).value = row[key]; });
    $('task-dialog').showModal();
    $('field-name').focus();
  }
  $('task-form').addEventListener('submit', event => {
    event.preventDefault();
    const values = Object.fromEntries(['module','name','description','date','status'].map(key => [key, $(`field-${key}`).value.trim()]));
    if (!values.name) { $('field-name').setCustomValidity('请填写功能名称'); $('field-name').reportValidity(); return; }
    if (!values.description) values.description = values.name;
    if (pending.edit) Object.assign(rows.find(row => row.id === pending.edit), values);
    else {
      const index = pending.after ? rows.findIndex(row => row.id === pending.after) + 1 : rows.length;
      rows.splice(index, 0, {id: `task-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, ...values, month: rows.find(row => row.id === pending.after)?.month || $('filter-month').value || values.date.slice(5, 7)});
    }
    const added = !pending.edit;
    $('task-dialog').close();
    // A new task must stay visible even if the current filter excludes its default values.
    if (added) clearFilters();
    persist(added ? '任务已新增' : '任务已更新');
  });
  $('field-name').addEventListener('input', () => $('field-name').setCustomValidity(''));
  $('cancel-task').addEventListener('click', () => $('task-dialog').close());
  $('add-task').addEventListener('click', () => openEditor());
  $('schedule-body').addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!editing || !button || button.disabled || fileSaving) return;
    const id = button.closest('tr').dataset.id;
    const index = rows.findIndex(row => row.id === id);
    const action = button.dataset.action;
    if (action === 'add') return openEditor(id, true);
    if (action === 'delete') {
      if (!confirm(`确定删除“${rows[index].name}”吗？`)) return;
      rows.splice(index, 1); persist('任务已删除'); return;
    }
    const visible = visibleRows();
    const position = visible.findIndex(row => row.id === id);
    const target = visible[position + (action === 'up' ? -1 : 1)];
    if (!target) return;
    const [moving] = rows.splice(index, 1);
    const targetIndex = rows.findIndex(row => row.id === target.id);
    rows.splice(targetIndex + (action === 'down' ? 1 : 0), 0, moving);
    persist('任务顺序已调整');
  });
  filterIds.forEach(id => $(id).addEventListener('input', render));
  $('reset-filters').addEventListener('click', clearFilters);
  $('sort-date').addEventListener('click', () => {
    if (!editing || fileSaving) return;
    rows.sort((a,b) => (a.date || '9999').localeCompare(b.date || '9999'));
    persist('已按日期从早到晚排序，未排期任务置后');
  });
  $('save-html').addEventListener('click', async () => {
    if (!editing || fileSaving || !validateRows()) return;
    editing = false; render();
    fileSaving = true;
    $('edit-list').disabled = true;
    $('save-html').disabled = $('add-task').disabled = $('sort-date').disabled = true;
    $('save-status').textContent = '正在保存…';
    try {
      const result = await window.KnoraHtmlFileStore.save({elementId:'platform-schedule-data', data:rows, fileName:'platform-development-schedule.html'});
      dirty = false; editSnapshot = null;
      $('save-status').textContent = result.mode === 'download' ? '已下载更新后的 HTML，请用它替换原排期页面文件。' : '已保存到 HTML 文件。';
    } catch (error) {
      editing = true; render();
      $('save-status').textContent = error.name === 'AbortError' ? '已取消文件保存；当前排期仍保留在此浏览器。' : `保存失败：${error.message}`;
    } finally {
      fileSaving = false;
      $('edit-list').disabled = false;
      $('save-html').disabled = $('add-task').disabled = $('sort-date').disabled = false;
    }
  });
  window.addEventListener('beforeunload', event => {
    if (!dirty) return;
    try { if (localStorage.getItem(storageKey)) return; } catch (_) { /* Prompt only when a browser draft could not be retained. */ }
    event.preventDefault(); event.returnValue = '';
  });
  render();
})();
