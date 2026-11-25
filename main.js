const DEFAULT_LOCALE = 'en_US';
const SUPPORTED_LOCALES = new Set(['en_US', 'es_419']);
const LANGUAGE_STORAGE_KEY = 'spotgo-language';
const SITE_ROOT = document.documentElement.dataset.siteRoot || './';
const PAGE_TITLE_KEY = document.documentElement.dataset.pageTitle || 'site.title';
const PAGE_DESCRIPTION_KEY = document.documentElement.dataset.pageDescription || 'site.description';
const languageSelect = document.getElementById('languageSelect');
const languagePicker = document.getElementById('languagePicker');
const languageOptionsList = document.getElementById('languageOptions');
const languageOptions = [...(languageOptionsList?.querySelectorAll('[data-locale]') || [])];
const menuToggle = document.getElementById('menuToggle');
const siteNavigation = document.getElementById('siteNavigation');
const appsDialog = document.getElementById('appsDialog');
let languageRequest = 0;
let languageScrollPosition = null;

const readSavedLocale = () => {
  try {
    const savedLocale = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return SUPPORTED_LOCALES.has(savedLocale) ? savedLocale : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
};

const syncLanguagePicker = (locale) => {
  const languageCode = languageSelect?.querySelector('[data-language-label]');
  if (languageCode) languageCode.textContent = locale === 'es_419' ? 'ES' : 'EN';

  languageOptions.forEach((option) => {
    option.setAttribute('aria-selected', String(option.dataset.locale === locale));
  });
};

const closeLanguagePicker = (returnFocus = false) => {
  if (languageOptionsList) languageOptionsList.hidden = true;
  languageSelect?.setAttribute('aria-expanded', 'false');
  languageScrollPosition = null;
  if (returnFocus) languageSelect?.focus({ preventScroll: true });
};

const openLanguagePicker = (locale = readSavedLocale()) => {
  if (!languageSelect || !languageOptionsList) return;
  languageOptionsList.hidden = false;
  languageSelect.setAttribute('aria-expanded', 'true');
  languageOptions.forEach((option) => {
    option.tabIndex = -1;
  });
  const selectedOption = languageOptions.find((option) => option.dataset.locale === locale) || languageOptions[0];
  selectedOption?.focus({ preventScroll: true });
};

const chooseLanguage = (locale) => {
  const scrollPosition = languageScrollPosition || { x: window.scrollX, y: window.scrollY };
  closeLanguagePicker(true);
  setLocale(locale, scrollPosition);
};

const loadTranslations = async (locale) => {
  const response = await fetch(new URL(`${SITE_ROOT}i18n/${locale}.json`, document.baseURI));
  if (!response.ok) {
    throw new Error(`Could not load ${locale} translations (${response.status})`);
  }
  return response.json();
};

const applyTranslations = (translations) => {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const value = translations[element.dataset.i18n];
    if (typeof value === 'string') element.textContent = value;
  });

  document.querySelectorAll('[data-i18n-html]').forEach((element) => {
    const value = translations[element.dataset.i18nHtml];
    if (typeof value === 'string') element.innerHTML = value;
  });

  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
    const value = translations[element.dataset.i18nAriaLabel];
    if (typeof value === 'string') element.setAttribute('aria-label', value);
  });

  document.querySelectorAll('[data-i18n-alt]').forEach((element) => {
    const value = translations[element.dataset.i18nAlt];
    if (typeof value === 'string') element.setAttribute('alt', value);
  });

  document.querySelectorAll('[data-i18n-title]').forEach((element) => {
    const value = translations[element.dataset.i18nTitle];
    if (typeof value === 'string') element.setAttribute('title', value);
  });

  const description = document.querySelector('meta[name="description"]');
  if (description && translations[PAGE_DESCRIPTION_KEY]) {
    description.setAttribute('content', translations[PAGE_DESCRIPTION_KEY]);
  }
  if (translations[PAGE_TITLE_KEY]) document.title = translations[PAGE_TITLE_KEY];
};

const setLocale = async (requestedLocale, scrollPosition = null) => {
  const locale = SUPPORTED_LOCALES.has(requestedLocale) ? requestedLocale : DEFAULT_LOCALE;
  const requestId = ++languageRequest;
  let translations;

  try {
    translations = await loadTranslations(locale);
  } catch (error) {
    console.error('[i18n] Unable to load the selected language.', error);
    if (locale !== DEFAULT_LOCALE) {
      try {
        translations = await loadTranslations(DEFAULT_LOCALE);
      } catch (fallbackError) {
        console.error('[i18n] Unable to load the default language.', fallbackError);
      }
    }
  }

  if (requestId !== languageRequest) return;
  if (translations) applyTranslations(translations);

  document.documentElement.lang = locale === 'es_419' ? 'es-419' : 'en-US';
  syncLanguagePicker(locale);
  if (scrollPosition) {
    window.requestAnimationFrame(() => {
      window.scrollTo({ left: scrollPosition.x, top: scrollPosition.y, behavior: 'instant' });
    });
  }
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
  } catch {
    // Language switching still works when local storage is unavailable.
  }
};

const closeNavigation = () => {
  if (!menuToggle || !siteNavigation) return;
  menuToggle.setAttribute('aria-expanded', 'false');
  siteNavigation.classList.remove('is-open');
};

document.querySelectorAll('[data-scroll-to-top]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    closeNavigation();
    document.documentElement.scrollTo({ top: 0, behavior: 'auto' });
  });
});

menuToggle?.addEventListener('click', () => {
  const willOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(willOpen));
  siteNavigation?.classList.toggle('is-open', willOpen);
});

siteNavigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeNavigation);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 900) closeNavigation();
});

document.querySelectorAll('[data-video-embed]').forEach((embed) => {
  const video = embed.querySelector('video');
  const playButton = embed.querySelector('[data-video-play]');
  if (!video || !playButton) return;

  const showCover = () => {
    video.hidden = true;
    embed.classList.remove('has-video');
  };

  playButton.addEventListener('click', () => {
    video.hidden = false;
    embed.classList.add('has-video');
    video.focus({ preventScroll: true });
    video.play().catch(() => {
      // Autoplay can be refused; the native controls stay available to start playback.
    });
  });

  // Keep the static cover when the file cannot be loaded.
  video.querySelector('source')?.addEventListener('error', showCover);

  // Visual playing state for the frame around the player.
  video.addEventListener('play', () => embed.classList.add('is-playing'));
  video.addEventListener('pause', () => embed.classList.remove('is-playing'));
  video.addEventListener('ended', () => embed.classList.remove('is-playing'));
});

const screenViewer = document.getElementById('screenViewer');
const screenTriggers = [...document.querySelectorAll('[data-screen]')];

if (screenViewer && screenTriggers.length) {
  const screens = [];
  screenTriggers.forEach((trigger) => {
    if (screens.some((screen) => screen.id === trigger.dataset.screen)) return;
    screens.push({ id: trigger.dataset.screen, image: trigger.querySelector('img'), nameKey: trigger.dataset.screenNameKey });
  });

  const viewerImage = screenViewer.querySelector('.viewer-image');
  const viewerTitle = screenViewer.querySelector('.viewer-title');
  const viewerCount = screenViewer.querySelector('.viewer-count');
  const viewerScroll = screenViewer.querySelector('.viewer-scroll');
  let currentScreen = 0;
  let lastTrigger = null;
  let swipeStart = null;

  const showScreen = (index) => {
    currentScreen = (index + screens.length) % screens.length;
    const screen = screens[currentScreen];
    viewerImage.src = screen.image.currentSrc || screen.image.src;
    viewerImage.alt = screen.image.alt;
    // App names come from the already translated page text.
    viewerTitle.textContent = document.querySelector(`[data-i18n="${screen.nameKey}"]`)?.textContent || '';
    viewerCount.textContent = `${currentScreen + 1} / ${screens.length}`;
    viewerScroll.scrollTop = 0;
  };

  screenTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      lastTrigger = trigger;
      showScreen(screens.findIndex((screen) => screen.id === trigger.dataset.screen));
      screenViewer.showModal();
      viewerScroll.focus({ preventScroll: true });
    });
  });

  screenViewer.querySelector('.viewer-prev')?.addEventListener('click', () => showScreen(currentScreen - 1));
  screenViewer.querySelector('.viewer-next')?.addEventListener('click', () => showScreen(currentScreen + 1));
  screenViewer.querySelector('.viewer-close')?.addEventListener('click', () => screenViewer.close());

  screenViewer.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showScreen(currentScreen - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      showScreen(currentScreen + 1);
    }
  });

  screenViewer.addEventListener('click', (event) => {
    if (event.target === screenViewer) screenViewer.close();
  });

  screenViewer.addEventListener('close', () => {
    lastTrigger?.focus({ preventScroll: true });
  });

  // Horizontal swipe switches screens; vertical movement keeps scrolling the screenshot.
  viewerScroll.addEventListener('pointerdown', (event) => {
    swipeStart = { x: event.clientX, y: event.clientY };
  });

  viewerScroll.addEventListener('pointercancel', () => {
    swipeStart = null;
  });

  viewerScroll.addEventListener('pointerup', (event) => {
    if (!swipeStart) return;
    const deltaX = event.clientX - swipeStart.x;
    const deltaY = event.clientY - swipeStart.y;
    swipeStart = null;
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) showScreen(currentScreen + (deltaX < 0 ? 1 : -1));
  });
}

const sectionLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];

if ('IntersectionObserver' in window && sectionLinks.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      sectionLinks.forEach((link) => {
        if (link.getAttribute('href') === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sectionLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean)
    .forEach((section) => sectionObserver.observe(section));
}

// Gentle reveal of section blocks; skipped entirely when reduced motion is requested.
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('reveal-on');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('[data-reveal]').forEach((block) => revealObserver.observe(block));
}

languageSelect?.addEventListener('pointerdown', () => {
  languageScrollPosition = { x: window.scrollX, y: window.scrollY };
});

languageSelect?.addEventListener('keydown', (event) => {
  languageScrollPosition = { x: window.scrollX, y: window.scrollY };
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    openLanguagePicker();
  } else if (event.key === 'Escape' && languageOptionsList && !languageOptionsList.hidden) {
    event.preventDefault();
    closeLanguagePicker(true);
  }
});

languageSelect?.addEventListener('click', () => {
  if (!languageOptionsList) return;
  if (languageOptionsList.hidden) openLanguagePicker();
  else closeLanguagePicker();
});

languageOptions.forEach((option, index) => {
  option.addEventListener('pointerdown', () => {
    languageScrollPosition = { x: window.scrollX, y: window.scrollY };
  });
  option.addEventListener('click', () => chooseLanguage(option.dataset.locale));
  option.addEventListener('keydown', (event) => {
    let nextIndex = index;
    if (event.key === 'ArrowDown') nextIndex = (index + 1) % languageOptions.length;
    else if (event.key === 'ArrowUp') nextIndex = (index - 1 + languageOptions.length) % languageOptions.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = languageOptions.length - 1;
    else if (event.key === 'Escape') {
      event.preventDefault();
      closeLanguagePicker(true);
      return;
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      chooseLanguage(option.dataset.locale);
      return;
    } else if (event.key === 'Tab') {
      closeLanguagePicker();
      return;
    } else {
      return;
    }

    event.preventDefault();
    languageOptions[nextIndex]?.focus({ preventScroll: true });
  });
});

document.addEventListener('pointerdown', (event) => {
  if (!languagePicker?.contains(event.target)) closeLanguagePicker();
});

const openAppsDialog = () => {
  closeNavigation();
  if (appsDialog && !appsDialog.open) appsDialog.showModal();
};

document.querySelectorAll('[data-open-apps]').forEach((button) => {
  button.addEventListener('click', openAppsDialog);
});

appsDialog?.querySelector('.dialog-close')?.addEventListener('click', () => {
  appsDialog.close();
});

appsDialog?.addEventListener('click', (event) => {
  if (event.target === appsDialog) appsDialog.close();
});

const savedLocale = readSavedLocale();
syncLanguagePicker(savedLocale);
setLocale(savedLocale);
