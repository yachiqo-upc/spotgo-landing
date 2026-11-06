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
  const videoUrl = embed.dataset.videoUrl?.trim();
  const iframe = embed.querySelector('iframe');
  if (!videoUrl || !iframe) return;

  iframe.src = videoUrl;
  iframe.hidden = false;
  embed.classList.add('has-video');
});

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
