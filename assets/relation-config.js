(() => {
  const page = document.getElementById('ontologyModulePage');
  if (!page) return;
  const steps = ['基本信息', '数据映射', '属性定义', '属性映射'];
  const entities = {
    customer_profile: '客户主体', service_ticket: '服务工单', product: '产品',
    product_catalog: '产品目录', campaign: '营销活动', partner: '渠道伙伴',
    region: '经营区域', channel: '投放渠道'
  };
  const tables = {
    customer_profile: ['customer_master', 'customer_id'],
    service_ticket: ['service_ticket', 'ticket_id'],
    product_catalog: ['product_catalog', 'catalog_id']
  };
  const sourceTable = entity => tables[entity] || [entity, entity + '_id'];
  const catalog = Object.fromEntries(Object.keys(entities).map(entity => {
    const [table, key] = sourceTable(entity);
    return [table, {entity, key, fields: [key, ...({
      service_ticket: ['customer_id', 'ticket_status'],
      customer_profile: ['customer_name', 'customer_level'],
      product: ['catalog_id', 'product_name'],
      product_catalog: ['catalog_name']
    }[entity] || [])]}];
  }));
  catalog.customer_contact = {entity: 'customer_profile', key: '', fields: ['customer_id', 'mobile']};
  const endpoints = {
    customer_buys_product: ['customer_profile', 'product'],
    customer_joins_campaign: ['customer_profile', 'campaign'],
    ticket_belongs_customer: ['service_ticket', 'customer_profile'],
    partner_operates_region: ['partner', 'region'],
    product_in_catalog: ['product', 'product_catalog'],
    campaign_uses_channel: ['campaign', 'channel']
  };
  const project = () => document.querySelector('#projectTrigger')?.textContent.trim() || 'personal';
  const storageKey = () => 'knora.relation.config.v1:' + project();
  const read = () => {
    try { return JSON.parse(localStorage.getItem(storageKey())) || {}; }
    catch { return {}; }
  };
  const escape = value => String(value ?? '').replace(/[&<>"']/g, ch =>
    ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[ch]));
  const options = (values, selected) => values.map(([value, label]) =>
    '<option value="' + escape(value) + '"' + (value === selected ? ' selected' : '') + '>' + escape(label) + '</option>').join('');
  const field = (label, name, value, required = false) =>
    '<label><span>' + label + (required ? ' *' : '') + '</span><input name="' + name + '" value="' + escape(value) + '"' + (required ? ' required' : '') + '></label>';
  const select = (label, name, values, selected) =>
    '<label><span>' + label + '</span><select class="select" name="' + name + '">' + options(values, selected) + '</select></label>';

  function relationList() {
    return new URLSearchParams(location.search).get('module') === 'relation' && page.querySelector('.om-grid');
  }

  function refreshCards() {
    const grid = relationList();
    if (!grid) return;
    const records = read();
    const cards = [...grid.querySelectorAll('.om-card:not(.om-create)')];
    const existing = new Set();
    for (const card of cards) {
      const api = card.querySelector('.om-api')?.textContent.trim();
      existing.add(api);
      const saved = records[api];
      if (!saved) continue;
      const title = card.querySelector('h3');
      if (title && title.textContent !== saved.name) title.textContent = saved.name;
      const desc = card.querySelector('.om-linkline span');
      if (desc && desc.textContent !== saved.desc) desc.textContent = saved.desc;
      const status = card.querySelector('.om-status');
      if (status && status.textContent !== saved.status) status.textContent = saved.status;
      status?.classList.toggle('draft', saved.status === '草稿');
    }
    for (const [api, saved] of Object.entries(records)) {
      if (existing.has(api) || !saved.created) continue;
      const card = document.createElement('article');
      card.className = 'om-card';
      card.innerHTML = `<div class="om-card-top"><span class="om-icon relation">⌘</span><span class="om-status ${saved.status === '草稿' ? 'draft' : ''}">${escape(saved.status)}</span></div><h3>${escape(saved.name)}</h3><div class="om-api">${escape(api)}</div><div class="om-metrics"><span class="om-metric">属性<b>2</b></span><span class="om-metric">数据<b>0</b></span><span class="om-metric">行为<b>0</b></span></div><div class="om-linkline"><i>◇</i><span>${escape(saved.desc)}</span></div><div class="om-tags"></div><div class="om-card-foot"></div><div class="om-card-actions"><button class="om-mini">编辑</button></div>`;
      grid.append(card);
    }
    const count = page.querySelector('.om-pager > span');
    const label = '共 ' + grid.querySelectorAll('.om-card:not(.om-create)').length + ' 条';
    if (count && count.textContent !== label) count.textContent = label;
  }

  function open(card) {
    const originalApi = card?.querySelector('.om-api')?.textContent.trim();
    const records = read();
    const [subject, object] = endpoints[originalApi] || ['service_ticket', 'customer_profile'];
    const draft = {name: card?.querySelector('h3')?.textContent || '', api: originalApi || '',
      desc: card?.querySelector('.om-linkline span')?.textContent || '', subject, object,
      mode: 'junction', junction: originalApi ? originalApi + '_map' : '',
      subjectColumn: 'subject_id', objectColumn: 'object_id', foreignSide: 'subject',
      subjectTable: '', objectTable: '', foreignKey: '', targetKey: '', subjectNote: '', objectNote: '',
      status: card?.querySelector('.om-status')?.textContent || '草稿', created: !card,
      ...records[originalApi]};
    draft.selectedTables ??= draft.junction ? [draft.junction] : [];
    const sides = [['subject', '主体'], ['object', '客体']];
    // Carry forward the entity IDs and source tables implied by earlier direct mappings.
    if (draft.subjectSourceField === undefined && draft.objectSourceField === undefined) {
      if (draft.mode === 'direct') {
        draft.selectedTables = [...new Set([...draft.selectedTables, draft.subjectTable, draft.objectTable].filter(Boolean))];
      }
      for (const [side] of sides) {
        const table = draft[side + 'Table'];
        draft[side + 'SourceField'] = catalog[table]?.key || '';
      }
    }
    draft.bindings ??= {};
    draft.attributes ??= [];
    const activeTables = () => draft.mode === 'junction' ? draft.selectedTables : [...new Set([draft.subjectTable, draft.objectTable].filter(Boolean))];
    const needsTableMatch = () => draft.subjectTable && draft.objectTable && draft.subjectTable !== draft.objectTable;
    const availableTables = [...new Set(['dealer_claim_merged', ...draft.selectedTables,
      ...Object.keys(endpoints).map(api => api + '_map'), ...Object.keys(catalog)])];
    function columns(table) {
      return catalog[table]?.fields || ['subject_id', 'object_id', 'linked_at', 'source'];
    }
    function toggleTable(table) {
      const removing = draft.selectedTables.includes(table);
      draft.selectedTables = removing
        ? draft.selectedTables.filter(item => item !== table) : [...draft.selectedTables, table];
      if (removing) {
        let changed = false;
        for (const [side] of sides) {
          if (draft[side + 'Table'] !== table) continue;
          draft[side + 'Table'] = '';
          draft[side + 'SourceField'] = '';
          changed = true;
        }
        if (changed) resetDirectMatch();
      }
      draft.junction = draft.selectedTables[0] || '';
      render();
    }
    function tablePicker() {
      const rows = availableTables.map(table => {
        const checked = draft.selectedTables.includes(table);
        return `<tr data-relation-candidate="${escape(table)}"><td><label><input type="checkbox" data-pick="${escape(table)}" ${checked ? 'checked' : ''}> ${escape(table)}</label></td><td>${table === 'dealer_claim_merged' ? 'Excel' : '物理表'}</td><td>${table === 'dealer_claim_merged' ? '2026-11-21 16:20' : '—'}</td></tr>`;
      }).join('');
      return `<div class="relation-table-picker"><aside><b>空间目录</b><input type="search" data-space-search placeholder="搜索空间名称"><span data-personal>个人空间</span></aside><main><header><b>已选 ${draft.selectedTables.length} 张表</b><input type="search" data-relation-search placeholder="搜索库名、表名"></header><div class="relation-config-table"><table><thead><tr><th>名称</th><th>类型</th><th>更新时间</th></tr></thead><tbody>${rows}</tbody></table><p data-relation-empty hidden>暂无库表</p></div></main><aside><b>已映射数据表</b>${draft.selectedTables.map(t => `<div class="relation-picked">${escape(t)}<button type="button" class="btn" data-remove-table="${escape(t)}" aria-label="移除 ${escape(t)}">×</button></div>`).join('') || '<span>暂无数据</span>'}</aside></div>`;
    }
    const list = [...page.childNodes];
    const form = document.createElement('form');
    form.className = 'relation-config';
    form.addEventListener('submit', event => event.preventDefault());
    page.replaceChildren(form);
    let step = 0;
    let tableQuery = '';

    const sourceKeys = () => {
      const foreign = draft[draft.foreignSide + 'Table'];
      const target = draft[(draft.foreignSide === 'subject' ? 'object' : 'subject') + 'Table'];
      return {foreign, target, foreignKey: draft.foreignKey, targetKey: draft.targetKey};
    };
    const leave = () => { page.replaceChildren(...list); refreshCards(); };
    const section = (title, content, hint = '') => `<section class="entity-step-pane active">
      <div class="entity-form-card"><div class="entity-section-title"><b>${title}</b>${hint ? '<small>' + hint + '</small>' : ''}</div>${content}</div></section>`;
    draft.targetKey = needsTableMatch() ? catalog[sourceKeys().target]?.key || '' : '';

    function resetDirectMatch() {
      draft.foreignKey = '';
      if (needsTableMatch() && !catalog[sourceKeys().target]?.key && catalog[sourceKeys().foreign]?.key) {
        draft.foreignSide = draft.foreignSide === 'subject' ? 'object' : 'subject';
      }
      draft.targetKey = needsTableMatch() ? catalog[sourceKeys().target]?.key || '' : '';
    }

    function referenceSourceControls(side, label) {
      const table = draft[side + 'Table'];
      return `<td>${select(label + '主键来源表', side + 'Table',
        [['', '请选择来源表'], ...draft.selectedTables.map(name => [name, name])], table)}</td>
        <td>${table
          ? select(label + '主键来源字段', side + 'SourceField',
            [['', '请选择来源字段'], ...columns(table).map(name => [name, name])], draft[side + 'SourceField'])
          : '<span class="relation-source-empty">请先选择来源表</span>'}</td>`;
    }

    function tableMatchConfiguration() {
      if (!needsTableMatch()) return '';
      const {foreign, target, foreignKey, targetKey} = sourceKeys();
      return `<section class="relation-condition" aria-label="配置主外键">
        <div class="relation-condition-heading"><b>跨表匹配条件</b>
          ${targetKey && catalog[foreign]?.key ? '<button type="button" class="btn" data-relation-flip>交换主外键方向</button>' : ''}</div>
        ${targetKey ? `<div class="relation-key-pair">
          ${select('外键 · ' + escape(foreign), 'foreignKey', [['', '请选择外键字段'], ...columns(foreign).map(name => [name, name])], foreignKey)}
          <span aria-hidden="true">→</span>
          <div class="relation-referenced-key"><span>被引用的主键 · ${escape(target)}</span><code>${escape(targetKey)}</code></div>
        </div><p data-relation-condition aria-live="polite"></p>`
          : '<p>两张来源表均未配置表主键，请调整来源表后再配置跨表匹配。</p>'}
      </section>`;
    }

    function updateCondition() {
      const output = form.querySelector('[data-relation-condition]');
      if (!output) return;
      const {foreign, target, foreignKey, targetKey} = sourceKeys();
      output.textContent = foreignKey
        ? '匹配条件　' + foreign + '.' + foreignKey + ' = ' + target + '.' + targetKey
        : '请选择用于匹配另一张表主键的外键字段。';
    }

    function body() {
      if (step === 0) return section('基本信息', '<div class="entity-basic-form">'
        + field('关系名称', 'name', draft.name, true) + field('API 名称', 'api', draft.api, true)
        + select('主体实体', 'subject', Object.entries(entities), draft.subject)
        + select('客体实体', 'object', Object.entries(entities), draft.object)
        + '<label class="wide"><span>描述</span><textarea name="desc">' + escape(draft.desc) + '</textarea></label></div>');
      if (step === 1) {
        return section('数据映射', tablePicker(), '勾选此关系需要使用的数据表。');
      }
      if (step === 2) {
        const properties = [
          ['subject', '主体', 'key', 'subjectNote'],
          ['object', '客体', 'key_label_2', 'objectNote']
        ].map(([side, label, api, note]) => ({api, note, name: entities[draft[side]] + '_' + label}));
        return section('属性定义', `<div class="entity-property-summary relation-pk-summary"><span><small>关系主键（PK）</small><b>${properties.map(({name, api}) => name + '（' + api + '）').join(' · ')}</b></span></div>
          <div class="relation-config-table"><table><thead><tr><th>属性类型</th><th>名称 / API 名称</th><th>PK</th><th>描述或操作</th></tr></thead><tbody>
          ${properties.map(({name, api, note}) => `<tr><td>实体引用</td><td>${name}<br><code>${api}</code></td><td><input type="checkbox" checked disabled aria-label="${name}是主键"></td>
            <td><input name="${note}" value="${escape(draft[note])}" placeholder="请输入描述" aria-label="${name}描述"></td></tr>`).join('')}
          ${draft.attributes.map((attr,i) => `<tr><td>普通属性</td><td><input required data-attr="${i}" data-part="name" aria-label="属性名称" placeholder="属性名称" value="${escape(attr.name)}"><input required pattern="[A-Za-z][A-Za-z0-9_]*" data-attr="${i}" data-part="api" aria-label="API 名称" placeholder="API 名称" value="${escape(attr.api)}"></td><td>—</td><td><button type="button" class="btn" data-drop="${i}">移除</button></td></tr>`).join('')}
          </tbody></table></div>
          <button type="button" class="btn relation-add-property" data-add-attr>＋ 插入属性</button>`);
      }
      const mode = select('映射方式', 'mode', [['junction', '中间表'], ['direct', '主外键直连']], draft.mode);
      const direct = draft.mode === 'direct';
      let referenceMappings;
      if (direct) {
        referenceMappings = `<div class="relation-config-table relation-source-table"><table>
          <thead><tr><th>关系属性</th><th>来源表</th><th>来源字段</th></tr></thead><tbody>
          ${sides.map(([side, label]) => `<tr><td><b>${label}主键</b><br>${entities[draft[side]]}</td>
            ${referenceSourceControls(side, label)}</tr>`).join('')}
          </tbody></table></div>${tableMatchConfiguration()}`;
      } else {
        referenceMappings = '<div class="entity-basic-form">' + draft.selectedTables.map(table => {
          const fields = columns(table);
          const choices = [['', '请选择源字段'], ...fields.map(f => [f, f])];
          return '<section><b>' + escape(table) + '</b>' + ['subjectColumn', 'objectColumn'].map((key, i) => {
            const value = draft.bindings[table]?.[key] ?? (fields.includes(draft[key]) ? draft[key] : '');
            return select(i ? '客体引用' : '主体引用', key, choices, value)
              .replace('<select ', '<select required data-binding="' + escape(table) + '" ');
          }).join('') + '</section>';
        }).join('') + '</div>';
      }
      const attributeMappings = draft.attributes.length
        ? '<div class="entity-basic-form">' + draft.attributes.map((attr,i) => {
          const choices = activeTables().flatMap(table => columns(table).map(col => [table+'.'+col, table+'.'+col]));
          return select(escape(attr.name), '', [['','请选择源字段'], ...choices], attr[draft.mode])
            .replace('<select ', '<select required data-attr="'+i+'" data-part="'+draft.mode+'" ');
        }).join('') + '</div>' : '';
      return section('属性映射', '<div class="relation-mapping-mode">' + mode + '</div>'
        + referenceMappings + attributeMappings, '配置关系属性的来源表和字段。');

    }

    function render() {
      form.innerHTML = `<header class="entity-designer-crumb"><button type="button" data-relation-action="cancel" aria-label="返回业务关系">←</button><span>业务关系</span><em>/</em><b>${card ? '编辑关系' : '新建关系'}${draft.name ? '【' + escape(draft.name) + '】' : ''}</b></header>
      <div class="entity-stepper">${steps.map((label, index) => (index ? '<em></em>' : '') + '<button type="button" class="' + (index === step ? 'active' : index < step ? 'done' : '') + '" data-relation-step="' + index + '"' + (index === step ? ' aria-current="step"' : '') + '><i>' + (index + 1) + '</i>' + label + '</button>').join('')}</div>
      ${body()}<footer class="entity-designer-foot">${step ? '<button type="button" class="btn" data-relation-action="prev">上一步</button>' : ''}
      <span role="status" data-relation-status></span><button type="button" class="btn" data-relation-action="save">保存</button>
      <button type="button" class="btn" data-relation-action="return">保存并返回</button>
      <button type="button" class="btn" data-relation-action="cancel">取消</button>
      <button type="button" class="btn primary" data-relation-action="${step < 3 ? 'next">保存并下一步' : 'publish">保存并发布'}</button></footer>`;
      updateCondition();
      const search = form.querySelector('[data-relation-search]');
      if (search) { search.value = tableQuery; filterTables(); }
      const apiInput = form.elements.namedItem('api');
      if (apiInput) { apiInput.pattern = '[A-Za-z][A-Za-z0-9_]*'; apiInput.readOnly = Boolean(originalApi || draft.saved); }
    }

    function validate() {
      for (const control of form.querySelectorAll('[required]')) {
        control.setCustomValidity(control.value.trim() ? '' : '请填写此字段');
      }
      const status = form.querySelector('[data-relation-status]');
      if (step === 1 && !draft.selectedTables.length) {
        status.textContent = '请至少选择一张数据表';
        return false;
      }
      if (step === 3 && draft.mode === 'direct') {
        for (const [side, label] of sides) {
          const table = draft[side + 'Table'];
          if (!table || !draft.selectedTables.includes(table) || !columns(table).includes(draft[side + 'SourceField'])) {
            status.textContent = '请为' + label + '主键选择来源表和来源字段';
            form.elements.namedItem(table ? side + 'SourceField' : side + 'Table')?.focus();
            return false;
          }
        }
        if (needsTableMatch() && (!draft.targetKey || !columns(sourceKeys().foreign).includes(draft.foreignKey))) {
          status.textContent = '请配置跨表匹配条件';
          return false;
        }
      }
      status.textContent = '';
      return form.reportValidity();
    }

    function save(action) {
      const all = read();
      const api = draft.api.trim();
      const status = form.querySelector('[data-relation-status]');
      if (!draft.name.trim() || !/^[A-Za-z][A-Za-z0-9_]*$/.test(api) ||
        (!originalApi && !draft.saved && (Object.hasOwn(all, api) || list.some(node => node.nodeType === 1 && [...node.querySelectorAll('.om-api')].some(el => el.textContent.trim() === api))))) {
        step = 0; render();
        form.querySelector('[data-relation-status]').textContent = '请填写名称和唯一的 API 名称（字母开头）';
        return;
      }
      if (action === 'publish' && !draft.selectedTables.length) {
        step = 1; render(); validate(); return;
      }
      const saved = {...draft, api, name: draft.name.trim(), status: action === 'publish' ? '可用' : draft.status};
      try {
        if (draft.saved && draft.saved !== api) delete all[draft.saved];
        const {saved: previous, ...record} = saved;
        localStorage.setItem(storageKey(), JSON.stringify({...all, [api]: record}));
      } catch { status.textContent = '浏览器无法保存配置'; return; }
      Object.assign(draft, saved, {saved: api});
      if (action === 'next') { step++; render(); }
      else if (action !== 'save') leave();
      else status.textContent = '已保存';
    }

    function filterTables() {
      let count = 0;
      for (const row of form.querySelectorAll('[data-relation-candidate]')) {
        row.hidden = !row.cells[0].textContent.toLowerCase().includes(tableQuery.trim().toLowerCase());
        if (!row.hidden) count++;
      }
      form.querySelector('[data-relation-empty]').hidden = count > 0;
    }

    form.addEventListener('input', event => {
      const control = event.target;
      if (control.matches('[data-relation-search]')) {
        tableQuery = control.value;
        filterTables();
      }
      if (control.hasAttribute('data-space-search')) form.querySelector('[data-personal]').hidden = !'个人空间'.includes(control.value.trim());
      if (control.hasAttribute('data-attr')) {
        draft.attributes[Number(control.dataset.attr)][control.dataset.part] = control.value;
      } else if (control.dataset.binding) {
        (draft.bindings[control.dataset.binding] ??= {})[control.name] = control.value;
      } else if (control.name) draft[control.name] = control.value;
      if (control.name === 'foreignKey') updateCondition();
    });
    form.addEventListener('change', event => {
      if (event.target.hasAttribute('data-pick')) { toggleTable(event.target.dataset.pick); return; }
      const name = event.target.name;
      if (name === 'subject' || name === 'object') {
        draft[name + 'Table'] = '';
        draft[name + 'SourceField'] = '';
        resetDirectMatch();
      }
      if (name === 'subjectTable' || name === 'objectTable') {
        const side = name === 'subjectTable' ? 'subject' : 'object';
        draft[side + 'SourceField'] = '';
        resetDirectMatch();
        render();
        form.elements.namedItem(name)?.focus();
      }
      if (name === 'mode') render();
    });
    form.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      if (button.hasAttribute('data-add-attr')) { draft.attributes.push({name:'',api:''}); render(); return; }
      if (button.hasAttribute('data-drop')) { draft.attributes.splice(Number(button.dataset.drop),1); render(); return; }
      if (button.hasAttribute('data-remove-table')) { toggleTable(button.dataset.removeTable); return; }
      if (button.hasAttribute('data-relation-flip')) {
        draft.foreignSide = draft.foreignSide === 'subject' ? 'object' : 'subject';
        resetDirectMatch();
        render();
        return;
      }
      const action = button.dataset.relationAction;
      if (action === 'cancel') { leave(); return; }
      if (action === 'prev') { step--; render(); return; }
      const destination = button.dataset.relationStep;
      if (destination !== undefined || action === 'next') {
        const next = destination === undefined ? step + 1 : Number(destination);
        if (action === 'next' && validate()) save('next');
        else if (destination !== undefined && (next <= step || (next === step + 1 && validate()))) { step = next; render(); }
      } else if (action && validate()) save(action);
    });
    render();
    page.scrollIntoView({block:'start'});
  }

  page.addEventListener('click', event => {
    if (!relationList()) return;
    const card = event.target.closest('.om-card');
    const button = event.target.closest('button');
    if (!card || !button) return;
    const create = card.classList.contains('om-create') && button.textContent.includes('新建关系');
    const edit = button.textContent.trim() === '编辑' && card.querySelector('.om-api');
    if (!create && !edit) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    open(create ? null : card);
  }, true);

  new MutationObserver(refreshCards).observe(page, {childList:true, subtree:true});
  refreshCards();
})();
