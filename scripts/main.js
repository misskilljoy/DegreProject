/* ══════════════════════════════════════
   Degre Design — main.js
══════════════════════════════════════ */

const pageLoader = document.querySelector('.page-loader');
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const isMobileDevice = navigator.userAgentData?.mobile
  ?? /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

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
    document.querySelector('.project-subnav a[href="#plans"]')?.remove();
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

  const gallerySources = [...new Set((project.gallery || []).filter(Boolean))];
  const gallery = document.querySelector('.project-gallery');
  if (gallery) {
    const galleryItems = document.createDocumentFragment();
    gallerySources.forEach((src, index) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = `${project.title} — рендер ${index + 1}`;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.sizes = '(max-width: 900px) 100vw, 50vw';
      img.onerror = () => {
        img.dataset.loadFailed = 'true';
        img.remove();
        layoutProjectGallery();
      };
      galleryItems.appendChild(img);
    });
    gallery.replaceChildren(galleryItems);

    const galleryImages = [...gallery.querySelectorAll('img')];
    let galleryLayoutFrame;

    const layoutProjectGallery = () => {
      cancelAnimationFrame(galleryLayoutFrame);
      galleryLayoutFrame = requestAnimationFrame(() => {
        const loadedImages = galleryImages.filter(img => img.dataset.loadFailed !== 'true');
        gallery.replaceChildren(...loadedImages);
        loadedImages.forEach((img) => {
          img.style.width = '';
          img.style.height = '';
        });

        if (window.innerWidth < 768) return;

        const styles = getComputedStyle(gallery);
        const horizontalPadding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
        const availableWidth = gallery.clientWidth - horizontalPadding;
        const gap = 8;
        const targetHeight = Math.min(620, Math.max(380, window.innerWidth * 0.32));
        const rows = [];
        let currentRow = [];
        let ratioSum = 0;

        loadedImages.forEach((img) => {
          const ratio = img.naturalWidth && img.naturalHeight
            ? img.naturalWidth / img.naturalHeight
            : 1.5;
          currentRow.push({ img, ratio });
          ratioSum += ratio;

          if ((ratioSum * targetHeight) + (gap * (currentRow.length - 1)) >= availableWidth) {
            rows.push({ items: currentRow, ratioSum, complete: true });
            currentRow = [];
            ratioSum = 0;
          }
        });

        if (currentRow.length) {
          rows.push({ items: currentRow, ratioSum, complete: false });
        }

        const fragment = document.createDocumentFragment();
        rows.forEach(({ items, ratioSum: rowRatio, complete }) => {
          const row = document.createElement('div');
          row.className = 'project-gallery__row';
          const fittedHeight = (availableWidth - gap * (items.length - 1)) / rowRatio;
          const rowHeight = complete ? fittedHeight : Math.min(targetHeight, fittedHeight);

          items.forEach(({ img, ratio }) => {
            img.style.width = `${ratio * rowHeight}px`;
            img.style.height = `${rowHeight}px`;
            row.appendChild(img);
          });
          fragment.appendChild(row);
        });
        gallery.replaceChildren(fragment);
      });
    };

    galleryImages.forEach((img) => {
      if (!img.complete) {
        img.addEventListener('load', layoutProjectGallery, { once: true });
        img.addEventListener('error', layoutProjectGallery, { once: true });
      }
    });

    layoutProjectGallery();
    window.addEventListener('resize', layoutProjectGallery);
  }

  const lightboxSources = [project.cover, ...gallerySources]
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
        <figcaption class="lightbox__meta">
          <span class="lightbox__counter"></span>
          <span class="lightbox__progress" aria-hidden="true"><span></span></span>
        </figcaption>
        <div class="lightbox__thumbs" aria-label="Миниатюры фотографий"></div>
      </figure>
      <button class="lightbox__next" type="button" aria-label="Следующая фотография">→</button>
    `;
    document.body.appendChild(lightbox);

    const lightboxImage = lightbox.querySelector('.lightbox__image');
    const lightboxCounter = lightbox.querySelector('.lightbox__counter');
    const lightboxProgress = lightbox.querySelector('.lightbox__progress span');
    const lightboxThumbs = lightbox.querySelector('.lightbox__thumbs');
    const closeButton = lightbox.querySelector('.lightbox__close');
    const previousButton = lightbox.querySelector('.lightbox__prev');
    const nextButton = lightbox.querySelector('.lightbox__next');
    let activeIndex = 0;
    let previousFocus = null;
    let touchStartX = 0;

    lightboxSources.forEach((src, index) => {
      const thumbnail = document.createElement('button');
      thumbnail.type = 'button';
      thumbnail.className = 'lightbox__thumb';
      thumbnail.setAttribute('aria-label', `Показать изображение ${index + 1}`);

      const image = document.createElement('img');
      image.src = src;
      image.alt = '';
      image.loading = 'lazy';
      image.decoding = 'async';

      thumbnail.appendChild(image);
      thumbnail.addEventListener('click', () => showImage(index));
      lightboxThumbs.appendChild(thumbnail);
    });

    const showImage = index => {
      activeIndex = (index + lightboxSources.length) % lightboxSources.length;
      lightboxImage.src = lightboxSources[activeIndex];
      lightboxImage.alt = `${project.title} — изображение ${activeIndex + 1}`;
      lightboxCounter.textContent = `${activeIndex + 1} / ${lightboxSources.length}`;
      lightboxProgress.style.width = `${((activeIndex + 1) / lightboxSources.length) * 100}%`;

      lightboxThumbs.querySelectorAll('.lightbox__thumb').forEach((thumbnail, thumbnailIndex) => {
        const isActive = thumbnailIndex === activeIndex;
        thumbnail.classList.toggle('is-active', isActive);
        thumbnail.setAttribute('aria-current', isActive ? 'true' : 'false');
        if (isActive) thumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });
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

/* Быстрая форма обращения: сайт ничего не сохраняет.
   На телефоне открывается почтовое приложение, на больших экранах — Gmail. */
const contactForm = document.querySelector('#contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    const data = new FormData(contactForm);
    const submittedAt = new Date().toISOString();
    const body = [
      `Имя: ${data.get('name')}`,
      `Telegram или телефон: ${data.get('contact')}`,
      `Тип объекта: ${data.get('objectType')}`,
      `Площадь: ${data.get('area')} м²`,
      '',
      'Согласие на обработку персональных данных: предоставлено',
      'Версия согласия: 03.08.2026',
      'Согласие: https://degredesign.ru/consent.html',
      'Политика: https://degredesign.ru/privacy.html',
      `Дата и время подтверждения (UTC): ${submittedAt}`,
      `Страница отправки: ${window.location.href}`,
    ].join('\n');
    const params = new URLSearchParams({
      view: 'cm',
      fs: '1',
      to: 'degre.design@yahoo.com',
      su: 'Запрос на дизайн-проект с сайта',
      body,
    });
    const status = contactForm.querySelector('.contact-form__status');
    const isMobileMail = isMobileDevice;

    if (isMobileMail) {
      const mailSubject = encodeURIComponent('Запрос на дизайн-проект с сайта');
      const mailBody = encodeURIComponent(body);
      window.location.href = `mailto:degre.design@yahoo.com?subject=${mailSubject}&body=${mailBody}`;
    } else {
      window.open(`https://mail.google.com/mail/?${params.toString()}`, '_blank', 'noopener,noreferrer');
    }

    if (status) {
      status.textContent = isMobileMail
        ? 'Письмо подготовлено в почтовом приложении.'
        : 'Письмо подготовлено в новой вкладке.';
    }
  });
}

/* Кнопка возврата к началу длинной страницы */
const backToTop = document.createElement('button');
backToTop.type = 'button';
backToTop.className = 'back-to-top';
backToTop.setAttribute('aria-label', 'Вернуться к началу страницы');
backToTop.textContent = '↑';
document.body.appendChild(backToTop);

const updateBackToTop = () => {
  backToTop.classList.toggle('is-visible', window.scrollY > window.innerHeight * 1.8);
};

window.addEventListener('scroll', updateBackToTop, { passive: true });
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
updateBackToTop();

/* Быстрый контакт на телефоне */
const quickContact = document.createElement('div');
quickContact.className = 'quick-contact';
const contactsHref = document.body.classList.contains('project-page') ? 'index.html#contacts' : '#contacts';
const emailSubject = encodeURIComponent('Новый проект');
const mobileEmailHref = `mailto:degre.design@yahoo.com?subject=${emailSubject}`;
const desktopEmailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=degre.design%40yahoo.com&su=${emailSubject}`;
quickContact.innerHTML = `
  <div class="quick-contact__menu" id="quick-contact-menu">
    <a href="https://t.me/zhenijoy" target="_blank" rel="noopener noreferrer">Telegram</a>
    <a href="${isMobileDevice ? mobileEmailHref : desktopEmailHref}" ${isMobileDevice ? '' : 'target="_blank" rel="noopener noreferrer"'}>E-mail</a>
    <a href="${contactsHref}">Контакты</a>
  </div>
  <button class="quick-contact__toggle" type="button" aria-expanded="false" aria-controls="quick-contact-menu">
    Обсудить проект
  </button>
`;
document.body.appendChild(quickContact);

const quickContactToggle = quickContact.querySelector('.quick-contact__toggle');
const closeQuickContact = () => {
  quickContact.classList.remove('is-open');
  quickContactToggle.setAttribute('aria-expanded', 'false');
};

quickContactToggle.addEventListener('click', () => {
  const isOpen = quickContact.classList.toggle('is-open');
  quickContactToggle.setAttribute('aria-expanded', String(isOpen));
});
quickContact.querySelectorAll('a').forEach(link => link.addEventListener('click', closeQuickContact));
document.addEventListener('click', event => {
  if (!quickContact.contains(event.target)) closeQuickContact();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeQuickContact();
});

/* Активный пункт компактной навигации по странице проекта */
const projectSectionsNav = document.querySelector('.project-sections');
if (projectSectionsNav) {
  const projectSectionLinks = [...projectSectionsNav.querySelectorAll('a')];
  const projectSectionTargets = projectSectionLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const projectSectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      projectSectionLinks.forEach(link => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

  projectSectionTargets.forEach(section => projectSectionObserver.observe(section));
}

/* Бесконечная мобильная лента портфолио.
   Полные копии набора с обеих сторон позволяют переносить позицию
   между визуально идентичными карточками без заметного скачка. */
const portfolioGrid = document.querySelector('.portfolio__grid');

if (portfolioGrid) {
  const cards = [...portfolioGrid.querySelectorAll('.portfolio__item')];
  const filterButtons = [...document.querySelectorAll('.portfolio__filters button')];
  const mobilePortfolio = window.matchMedia('(max-width: 767px)');
  let clones = [];
  let portfolioLayoutFrame;

  if (cards.length) {
    const visibleCards = () => cards.filter(card => !card.hidden);

    const openCloneProject = event => {
      const clone = event.currentTarget;
      if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
      if (event.type === 'keydown') event.preventDefault();
      window.location.href = `project.html?project=${encodeURIComponent(clone.dataset.project)}`;
    };

    const setupLoop = () => {
      if (!mobilePortfolio.matches || clones.length) return;
      const activeCards = visibleCards();
      if (activeCards.length < 2) {
        portfolioGrid.scrollLeft = 0;
        return;
      }

      const createClone = card => {
        const clone = card.cloneNode(true);
        clone.classList.add('portfolio__item--clone');
        clone.setAttribute('aria-hidden', 'true');
        clone.setAttribute('tabindex', '-1');
        clone.addEventListener('click', openCloneProject);
        clone.addEventListener('keydown', openCloneProject);
        return clone;
      };
      const leadingClones = activeCards.map(createClone);
      const trailingClones = activeCards.map(createClone);
      clones = [...leadingClones, ...trailingClones];

      const leadingFragment = document.createDocumentFragment();
      leadingClones.forEach(clone => leadingFragment.appendChild(clone));
      portfolioGrid.prepend(leadingFragment);
      trailingClones.forEach(clone => portfolioGrid.appendChild(clone));

      window.requestAnimationFrame(() => {
        const paddingLeft = parseFloat(getComputedStyle(portfolioGrid).paddingLeft);
        portfolioGrid.scrollTo({
          left: activeCards[0].offsetLeft - paddingLeft,
          behavior: 'instant',
        });
      });
    };

    const removeLoop = () => {
      clones.forEach(clone => clone.remove());
      clones = [];
      portfolioGrid.scrollLeft = 0;
    };

    const layoutPortfolio = () => {
      cancelAnimationFrame(portfolioLayoutFrame);
      portfolioLayoutFrame = requestAnimationFrame(() => {
        removeLoop();
        portfolioGrid.replaceChildren(...cards);
        cards.forEach(card => {
          card.style.width = '';
          card.style.height = '';
        });

        if (mobilePortfolio.matches) {
          setupLoop();
          return;
        }

        const activeCards = visibleCards();
        const styles = getComputedStyle(portfolioGrid);
        const horizontalPadding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
        const availableWidth = portfolioGrid.clientWidth - horizontalPadding;
        const gap = 8;
        const targetHeight = Math.min(560, Math.max(400, window.innerWidth * 0.3));
        const useFeaturedRow = !portfolioGrid.classList.contains('is-filtered') && activeCards.length >= 3;
        const featuredCards = useFeaturedRow ? activeCards.slice(0, 3) : [];
        const layoutCards = useFeaturedRow ? activeCards.slice(3) : activeCards;
        const rows = [];
        let currentRow = [];
        let ratioSum = 0;

        layoutCards.forEach(card => {
          const image = card.querySelector('img');
          const ratio = image?.naturalWidth && image?.naturalHeight
            ? image.naturalWidth / image.naturalHeight
            : 475 / 665;
          currentRow.push({ card, ratio });
          ratioSum += ratio;

          if ((ratioSum * targetHeight) + (gap * (currentRow.length - 1)) >= availableWidth) {
            rows.push({ items: currentRow, ratioSum, complete: true });
            currentRow = [];
            ratioSum = 0;
          }
        });

        if (currentRow.length) {
          rows.push({ items: currentRow, ratioSum, complete: false });
        }

        const fragment = document.createDocumentFragment();
        if (featuredCards.length) {
          const featuredRow = document.createElement('div');
          featuredRow.className = 'portfolio__row portfolio__row--featured';
          const featuredWidth = (availableWidth - gap * 2) / 3;
          const featuredHeight = featuredWidth * (665 / 475);

          featuredCards.forEach(card => {
            card.style.width = `${featuredWidth}px`;
            card.style.height = `${featuredHeight}px`;
            featuredRow.appendChild(card);
          });
          fragment.appendChild(featuredRow);
        }

        rows.forEach(({ items, ratioSum: rowRatio, complete }) => {
          const row = document.createElement('div');
          row.className = 'portfolio__row';
          const fittedHeight = (availableWidth - gap * (items.length - 1)) / rowRatio;
          const rowHeight = complete ? fittedHeight : Math.min(targetHeight, fittedHeight);

          items.forEach(({ card, ratio }) => {
            card.style.width = `${ratio * rowHeight}px`;
            card.style.height = `${rowHeight}px`;
            row.appendChild(card);
          });
          fragment.appendChild(row);
        });
        portfolioGrid.replaceChildren(fragment);
      });
    };

    const normalizeLoopPosition = () => {
      if (
        !mobilePortfolio.matches
        || !clones.length
        || portfolioGrid.classList.contains('is-loop-resetting')
      ) return;
      const activeCards = visibleCards();
      const firstTrailingClone = clones[activeCards.length];
      if (!activeCards[0] || !firstTrailingClone) return;

      const paddingLeft = parseFloat(getComputedStyle(portfolioGrid).paddingLeft);
      const originalStart = activeCards[0].offsetLeft - paddingLeft;
      const trailingStart = firstTrailingClone.offsetLeft - paddingLeft;
      const setWidth = trailingStart - originalStart;
      if (setWidth <= 0) return;

      let nextPosition = null;
      if (portfolioGrid.scrollLeft < originalStart - setWidth * 0.5) {
        nextPosition = portfolioGrid.scrollLeft + setWidth;
      } else if (portfolioGrid.scrollLeft >= originalStart + setWidth * 1.5) {
        nextPosition = portfolioGrid.scrollLeft - setWidth;
      }

      if (nextPosition !== null) {
        portfolioGrid.classList.add('is-loop-resetting');
        void portfolioGrid.offsetWidth;
        portfolioGrid.scrollLeft = nextPosition;
      }
    };

    const restoreLoopSnap = () => {
      portfolioGrid.classList.remove('is-loop-resetting');
    };
    portfolioGrid.addEventListener('touchstart', restoreLoopSnap, { passive: true });
    portfolioGrid.addEventListener('pointerdown', restoreLoopSnap, { passive: true });

    let scrollTimer;
    portfolioGrid.addEventListener('scroll', () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(normalizeLoopPosition, 90);
    }, { passive: true });

    mobilePortfolio.addEventListener('change', event => {
      layoutPortfolio();
    });

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const category = button.dataset.filter;
        removeLoop();
        portfolioGrid.replaceChildren(...cards);

        cards.forEach(card => {
          card.hidden = category !== 'all' && card.dataset.category !== category;
        });
        portfolioGrid.classList.toggle('is-filtered', category !== 'all');

        filterButtons.forEach(currentButton => {
          const isActive = currentButton === button;
          currentButton.classList.toggle('is-active', isActive);
          currentButton.setAttribute('aria-pressed', String(isActive));
        });

        layoutPortfolio();
      });
    });

    cards.forEach(card => {
      const image = card.querySelector('img');
      if (image && !image.complete) {
        const relayoutDesktopPortfolio = () => {
          if (!mobilePortfolio.matches) layoutPortfolio();
        };
        image.addEventListener('load', relayoutDesktopPortfolio, { once: true });
        image.addEventListener('error', relayoutDesktopPortfolio, { once: true });
      }
    });
    window.addEventListener('resize', layoutPortfolio);
    layoutPortfolio();
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
