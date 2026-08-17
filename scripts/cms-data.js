(function () {
  const config = window.DEGRE_CMS_CONFIG || {};
  const hasRemote = Boolean(config.supabaseUrl && config.anonKey);

  const normalizeProject = row => ({
    title: row.title,
    type: row.type || '',
    lead: row.lead || '',
    date: row.project_date || '',
    category: row.category || '',
    area: row.area || '',
    rooms: row.rooms || '',
    team: row.team || '',
    docs: row.docs || '',
    visual: row.visual || '',
    cover: row.cover_url || '',
    fallback: row.cover_url || '',
    plan: row.plan_url || '',
    planNote: row.plan_note || '',
    showPlan: row.show_plan !== false,
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    city: row.city || '',
    published: row.published !== false,
    sortOrder: row.sort_order || 0,
  });

  const renderPortfolio = projects => {
    const grid = document.querySelector('.portfolio__grid');
    if (!grid) return;
    const fragment = document.createDocumentFragment();
    Object.entries(projects).forEach(([id, project]) => {
      if (project.published === false || !project.cover) return;
      const card = document.createElement('div');
      card.className = 'portfolio__item';
      card.dataset.project = id;
      card.dataset.category = (project.category || '').toLowerCase();
      const image = document.createElement('img');
      image.src = project.cover;
      image.alt = project.title || 'Проект Degre Design';
      image.loading = 'lazy';
      image.decoding = 'async';
      image.sizes = '(max-width: 900px) 100vw, 33vw';
      const caption = document.createElement('div');
      caption.className = 'portfolio__caption';
      const date = document.createElement('span');
      date.className = 'portfolio__date';
      date.textContent = project.date || '';
      const title = document.createElement('span');
      title.className = 'portfolio__project';
      title.textContent = project.title || '';
      const city = document.createElement('span');
      city.className = 'portfolio__city';
      city.textContent = [project.city, project.area].filter(Boolean).join(' · ');
      caption.append(date, title, city);
      card.append(image, caption);
      fragment.appendChild(card);
    });
    grid.replaceChildren(fragment);
  };

  window.DEGRE_CMS_READY = (async () => {
    if (!hasRemote) return window.PROJECT_DATA || {};
    try {
      const endpoint = `${config.supabaseUrl.replace(/\/$/, '')}/rest/v1/projects?published=eq.true&select=*&order=sort_order.asc`;
      const response = await fetch(endpoint, {
        headers: { apikey: config.anonKey, Authorization: `Bearer ${config.anonKey}` },
      });
      if (!response.ok) throw new Error(`CMS ${response.status}`);
      const rows = await response.json();
      if (!rows.length) return window.PROJECT_DATA || {};
      window.PROJECT_DATA = Object.fromEntries(rows.map(row => [row.slug, normalizeProject(row)]));
      renderPortfolio(window.PROJECT_DATA);
    } catch (error) {
      console.warn('CMS недоступна, используются данные из проекта.', error);
    }
    return window.PROJECT_DATA || {};
  })();
})();
