/* ══════════════════════════════════════
   Degre Design — main.js
══════════════════════════════════════ */

const pageLoader = document.querySelector('.page-loader');
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/* Повторно позиционируем страницу по якорю после загрузки изображений.
   Это предотвращает смещение #contacts к предыдущей секции. */
const restoreHashPosition = () => {
  if (!window.location.hash) return;
  const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
  if (!target) return;

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  });
};

window.addEventListener('load', restoreHashPosition);
window.addEventListener('pageshow', event => {
  if (event.persisted) restoreHashPosition();
});

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

  const planDrawing = document.querySelector('.project-plan__drawing');
  const planSection = document.querySelector('.project-plan');
  if (planSection && project.showPlan === false) {
    planSection.hidden = true;
  }

  if (planDrawing && project.plan) {
    const planImage = document.createElement('img');
    planImage.src = project.plan;
    planImage.alt = `${project.title} — план расстановки мебели`;
    planImage.className = 'project-plan__image';
    planImage.loading = 'lazy';
    planImage.decoding = 'async';
    planDrawing.replaceChildren(planImage);
  }

  if (project.planNote) {
    setText('.project-plan__notes p', project.planNote);
  }

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

  const lightboxSources = [project.cover, ...project.gallery]
    .filter((src, index, sources) => src && sources.indexOf(src) === index);
  const lightboxTriggers = [heroImg, ...document.querySelectorAll('.project-gallery img')].filter(Boolean);

  if (lightboxSources.length && lightboxTriggers.length) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', `Галерея проекта ${project.title}`);
    lightbox.innerHTML = `
      <button class="lightbox__close" type="button" aria-label="Закрыть галерею">×</button>
      <button class="lightbox__prev" type="button" aria-label="Предыдущая фотография">←</button>
      <figure class="lightbox__figure">
        <img class="lightbox__image" alt="">
        <figcaption class="lightbox__counter"></figcaption>
      </figure>
      <button class="lightbox__next" type="button" aria-label="Следующая фотография">→</button>
    `;
    document.body.appendChild(lightbox);

    const lightboxImage = lightbox.querySelector('.lightbox__image');
    const lightboxCounter = lightbox.querySelector('.lightbox__counter');
    const closeButton = lightbox.querySelector('.lightbox__close');
    const previousButton = lightbox.querySelector('.lightbox__prev');
    const nextButton = lightbox.querySelector('.lightbox__next');
    let activeIndex = 0;
    let previousFocus = null;
    let touchStartX = 0;

    const showImage = index => {
      activeIndex = (index + lightboxSources.length) % lightboxSources.length;
      lightboxImage.src = lightboxSources[activeIndex];
      lightboxImage.alt = `${project.title} — изображение ${activeIndex + 1}`;
      lightboxCounter.textContent = `${activeIndex + 1} / ${lightboxSources.length}`;
    };

    const openLightbox = index => {
      previousFocus = document.activeElement;
      showImage(index);
      lightbox.classList.add('is-open');
      document.body.classList.add('lightbox-open');
      closeButton.focus();
    };

    const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      document.body.classList.remove('lightbox-open');
      if (previousFocus) previousFocus.focus();
    };

    lightboxTriggers.forEach((image, triggerIndex) => {
      const sourceIndex = lightboxSources.findIndex(src => image.getAttribute('src') === src);
      const imageIndex = sourceIndex >= 0 ? sourceIndex : Math.min(triggerIndex, lightboxSources.length - 1);
      image.classList.add('lightbox-trigger');
      image.setAttribute('tabindex', '0');
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', `Открыть изображение ${imageIndex + 1} в галерее`);
      image.addEventListener('click', () => openLightbox(imageIndex));
      image.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openLightbox(imageIndex);
        }
      });
    });

    closeButton.addEventListener('click', closeLightbox);
    previousButton.addEventListener('click', () => showImage(activeIndex - 1));
    nextButton.addEventListener('click', () => showImage(activeIndex + 1));
    lightbox.addEventListener('click', event => {
      if (event.target === lightbox) closeLightbox();
    });
    lightbox.addEventListener('touchstart', event => {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener('touchend', event => {
      const distance = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(distance) < 45) return;
      showImage(activeIndex + (distance < 0 ? 1 : -1));
    }, { passive: true });

    document.addEventListener('keydown', event => {
      if (!lightbox.classList.contains('is-open')) return;
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') showImage(activeIndex - 1);
      if (event.key === 'ArrowRight') showImage(activeIndex + 1);
    });
  }

  const relatedGrid = document.querySelector('.project-related__grid');
  if (relatedGrid) {
    const relatedItems = document.createDocumentFragment();
    projectEntries
      .filter(([id]) => id !== projectId)
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

    const relatedCards = [...relatedGrid.querySelectorAll('.project-related__item')];
    if (relatedCards.length > 1) {
      const cloneCount = Math.min(3, relatedCards.length);
      const leadingClones = relatedCards
        .slice(-cloneCount)
        .map(card => card.cloneNode(true));
      const trailingClones = relatedCards
        .slice(0, cloneCount)
        .map(card => card.cloneNode(true));

      [...leadingClones, ...trailingClones].forEach(clone => {
        clone.classList.add('project-related__item--clone');
        clone.setAttribute('aria-hidden', 'true');
        clone.setAttribute('tabindex', '-1');
      });

      leadingClones.reverse().forEach(clone => relatedGrid.prepend(clone));
      trailingClones.forEach(clone => relatedGrid.append(clone));

      const getMetrics = () => {
        const first = relatedCards[0];
        const second = relatedCards[1];
        const step = second.offsetLeft - first.offsetLeft;
        return {
          step,
          start: first.offsetLeft,
          width: step * relatedCards.length,
        };
      };

      const resetRelatedPosition = () => {
        const { start } = getMetrics();
        relatedGrid.scrollTo({ left: start, behavior: 'instant' });
      };

      const normalizeRelatedPosition = () => {
        const { step, start, width } = getMetrics();
        if (!step) return;

        if (relatedGrid.scrollLeft < start - step * 0.5) {
          relatedGrid.scrollTo({ left: relatedGrid.scrollLeft + width, behavior: 'instant' });
        } else if (relatedGrid.scrollLeft >= start + width - step * 0.5) {
          relatedGrid.scrollTo({ left: relatedGrid.scrollLeft - width, behavior: 'instant' });
        }
      };

      let relatedScrollTimer;
      relatedGrid.addEventListener('scroll', () => {
        window.clearTimeout(relatedScrollTimer);
        relatedScrollTimer = window.setTimeout(normalizeRelatedPosition, 90);
      }, { passive: true });

      let relatedResizeTimer;
      window.addEventListener('resize', () => {
        window.clearTimeout(relatedResizeTimer);
        relatedResizeTimer = window.setTimeout(resetRelatedPosition, 120);
      });

      window.requestAnimationFrame(resetRelatedPosition);
    }
  }
};

renderProjectPage();

/* Бесконечная мобильная лента портфолио.
   Копии крайних карточек позволяют продолжать свайп в обе стороны,
   а после остановки позиция незаметно переносится на оригинал. */
const portfolioGrid = document.querySelector('.portfolio__grid');

if (portfolioGrid) {
  const cards = [...portfolioGrid.querySelectorAll('.portfolio__item')];
  const mobilePortfolio = window.matchMedia('(max-width: 767px)');

  if (cards.length > 1) {
    const cardStep = () => cards[0].getBoundingClientRect().width + 8;
    const jumpToFirst = () => portfolioGrid.scrollTo({ left: cardStep(), behavior: 'instant' });
    let clones = [];

    const openCloneProject = event => {
      const clone = event.currentTarget;
      if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
      if (event.type === 'keydown') event.preventDefault();
      window.location.href = `project.html?project=${encodeURIComponent(clone.dataset.project)}`;
    };

    const setupLoop = () => {
      if (!mobilePortfolio.matches || clones.length) return;

      const firstClone = cards[0].cloneNode(true);
      const lastClone = cards[cards.length - 1].cloneNode(true);
      clones = [lastClone, firstClone];

      clones.forEach(clone => {
        clone.classList.add('portfolio__item--clone');
        clone.addEventListener('click', openCloneProject);
        clone.addEventListener('keydown', openCloneProject);
      });

      portfolioGrid.prepend(lastClone);
      portfolioGrid.append(firstClone);
      window.requestAnimationFrame(jumpToFirst);
    };

    const removeLoop = () => {
      clones.forEach(clone => clone.remove());
      clones = [];
      portfolioGrid.scrollLeft = 0;
    };

    const normalizeLoopPosition = () => {
      if (!mobilePortfolio.matches || !clones.length) return;
      const step = cardStep();
      if (portfolioGrid.scrollLeft <= step * 0.25) {
        portfolioGrid.scrollTo({ left: step * cards.length, behavior: 'instant' });
      } else if (portfolioGrid.scrollLeft >= step * (cards.length + 0.75)) {
        portfolioGrid.scrollTo({ left: step, behavior: 'instant' });
      }
    };

    let scrollTimer;
    portfolioGrid.addEventListener('scroll', () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(normalizeLoopPosition, 90);
    }, { passive: true });

    mobilePortfolio.addEventListener('change', event => {
      if (event.matches) setupLoop();
      else removeLoop();
    });

    setupLoop();
  }
}

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
