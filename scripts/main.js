/* ══════════════════════════════════════
   Degre Design — main.js
══════════════════════════════════════ */

const pageLoader = document.querySelector('.page-loader');
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

if (pageLoader) {
  const hideLoader = () => {
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 150 : 1150;

    window.setTimeout(() => {
      pageLoader.classList.add('is-hidden');
    }, delay);
  };

  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader, { once: true });
  }
}

/* Плавное появление секций при скролле */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll(
  '.about, .services, .portfolio, .reviews, .contacts'
).forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

/* Активный пункт меню при скролле */
const sections = document.querySelectorAll('section[id], footer[id]');
const navLinks = document.querySelectorAll('.nav__links a');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.remove('active'));
      const active = document.querySelector(`.nav__links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => navObserver.observe(s));

/* Переход из портфолио на страницу проекта */
const portfolioItems = document.querySelectorAll('.portfolio__item');

portfolioItems.forEach(item => {
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'link');
  item.setAttribute('aria-label', 'Открыть страницу проекта');

  const openProject = () => {
    const projectId = item.dataset.project || 'city-park';
    window.location.href = `project.html?project=${encodeURIComponent(projectId)}`;
  };

  item.addEventListener('click', openProject);
  item.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openProject();
    }
  });
});

const renderProjectPage = () => {
  if (!document.body.classList.contains('project-page')) return;

  const projects = window.PROJECT_DATA || {};
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('project') || 'city-park';
  const project = projects[projectId] || projects['city-park'];
  const projectEntries = Object.entries(projects);

  if (!project) return;

  document.title = `Degre Design — ${project.title}`;

  const setText = (selector, text) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = text;
  };

  setText('.project-hero__eyebrow', project.type);
  setText('.project-hero__title', project.title);
  setText('.project-info__lead', project.lead);

  const heroImg = document.querySelector('.project-hero__media img');
  if (heroImg) {
    heroImg.src = project.cover;
    heroImg.alt = `${project.title} — обложка проекта`;
    heroImg.decoding = 'async';
    heroImg.fetchPriority = 'high';
    heroImg.onerror = () => {
      if (project.fallback && heroImg.src.indexOf(project.fallback) === -1) {
        heroImg.src = project.fallback;
      }
    };
  }

  const values = [project.date, project.category, project.area, project.rooms, project.team, project.docs, project.visual];
  document.querySelectorAll('.project-info__item dd').forEach((item, index) => {
    item.textContent = values[index] || '';
  });

  const gallery = document.querySelector('.project-gallery');
  if (gallery) {
    const galleryItems = document.createDocumentFragment();
    project.gallery.forEach((src, index) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = `${project.title} — рендер ${index + 1}`;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.sizes = '(max-width: 900px) 100vw, 50vw';
      img.onerror = () => {
        if (project.fallback && img.src.indexOf(project.fallback) === -1) {
          img.src = project.fallback;
        }
      };
      galleryItems.appendChild(img);
    });
    gallery.replaceChildren(galleryItems);
  }

  const relatedGrid = document.querySelector('.project-related__grid');
  if (relatedGrid) {
    const relatedItems = document.createDocumentFragment();
    projectEntries
      .filter(([id]) => id !== projectId)
      .slice(0, 2)
      .forEach(([id, related]) => {
        const link = document.createElement('a');
        link.href = `project.html?project=${encodeURIComponent(id)}`;
        link.className = 'project-related__item';

        const image = document.createElement('img');
        image.src = related.fallback || related.cover;
        image.alt = related.title;
        image.loading = 'lazy';
        image.decoding = 'async';
        image.sizes = '(max-width: 900px) 100vw, 50vw';

        const name = document.createElement('span');
        name.className = 'project-related__name';
        name.textContent = related.title;

        const meta = document.createElement('span');
        meta.className = 'project-related__meta';
        meta.textContent = `${related.category} · ${related.area}`;

        link.append(image, name, meta);
        relatedItems.appendChild(link);
      });
    relatedGrid.replaceChildren(relatedItems);
  }
};

renderProjectPage();

/* Мобильное меню */
const nav = document.querySelector('.nav');
const navToggle = document.querySelector('.nav__toggle');

if (nav && navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Открыть меню');
    });
  });
}

/* Аккордеон услуг — Figma: Default / Variant2 */
const serviceItems = document.querySelectorAll('.services__item');

serviceItems.forEach(item => {
  const button = item.querySelector('.services__row');

  if (!button) return;

  button.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-open');

    serviceItems.forEach(currentItem => {
      currentItem.classList.remove('is-open');
      currentItem.querySelector('.services__row')?.setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      item.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
    }
  });
});
