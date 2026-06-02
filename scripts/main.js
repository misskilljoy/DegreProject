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

/* Скрепка садится на угол фото при скролле */
const aboutSection = document.querySelector('.about');
const aboutPin = document.querySelector('.about__pin');
const aboutPinSide = document.querySelector('.about__pin-side');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let clipTicking = false;

const updateClipPin = () => {
  if (!aboutSection || !aboutPin || window.matchMedia('(max-width: 768px)').matches) return;

  if (reduceMotion.matches) {
    aboutPin.style.opacity = '1';
    aboutPin.style.transform = 'none';
    if (aboutPinSide) aboutPinSide.style.opacity = '0';
    aboutPin.classList.add('is-pinned');
    return;
  }

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const sectionTop = aboutSection.offsetTop;
  const start = sectionTop - viewportHeight * 0.85;
  const end = sectionTop - viewportHeight * 0.18;
  const progress = clamp((window.scrollY - start) / (end - start), 0, 1);
  const eased = 1 - Math.pow(1 - progress, 3);
  const x = 180 * (1 - eased);
  const press = progress > 0.82 ? Math.sin((progress - 0.82) / 0.18 * Math.PI) * 0.08 : 0;
  const scale = 1 + 0.18 * (1 - eased) - press;
  const opacity = clamp((progress - 0.08) / 0.35, 0, 1);
  const headProgress = clamp((progress - 0.58) / 0.34, 0, 1);
  const sideOpacity = 1 - headProgress;
  const headOpacity = opacity * headProgress;

  aboutPin.style.opacity = String(opacity);
  aboutPin.style.transform = `translateX(${x}px) scale(${scale})`;
  aboutPin.style.background = `radial-gradient(circle at 35% 30%,
    rgba(255,255,255,${0.95 * headProgress}) 0 8%,
    rgba(210,209,202,${0.9 * headProgress}) 9% 28%,
    rgba(122,119,111,${0.95 * headProgress}) 60%,
    rgba(70,69,65,${0.95 * headProgress}) 100%)`;
  aboutPin.style.boxShadow = `
    0 ${8 - 5 * eased}px ${14 - 7 * eased}px rgba(28, 26, 23, ${(0.24 - 0.08 * eased) * headProgress}),
    inset -5px -5px 8px rgba(28, 26, 23, ${0.28 * headProgress}),
    inset 4px 4px 7px rgba(255, 255, 255, ${0.72 * headProgress})
  `;
  if (aboutPinSide) {
    const sideRotate = -34 + 34 * headProgress;
    const sideScale = 1.1 - 0.32 * headProgress;
    aboutPinSide.style.opacity = String(sideOpacity);
    aboutPinSide.style.transform = `rotate(${sideRotate}deg) scale(${sideScale})`;
  }
  aboutPin.classList.toggle('is-pinned', progress > 0.96);
};

const requestClipPinUpdate = () => {
  if (clipTicking) return;

  clipTicking = true;
  window.requestAnimationFrame(() => {
    updateClipPin();
    clipTicking = false;
  });
};

updateClipPin();
window.addEventListener('scroll', requestClipPinUpdate, { passive: true });
window.addEventListener('resize', updateClipPin);
window.addEventListener('load', updateClipPin);
