    const navbar = document.getElementById('navbar');
    const burger = document.getElementById('burger');
    const mobileMenu = document.getElementById('mobileMenu');

const THEME_STORAGE_KEY = 'spotgo-theme';

const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    const icon = document.getElementById('themeIcon');
    const mobileIcon = document.getElementById('mobileThemeIcon');
    const isDark = theme === 'dark';

    if (icon) icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    if (mobileIcon) mobileIcon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
};

const initTheme = () => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    applyTheme(theme);
};

initTheme();

document.getElementById('themeToggle')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
});

document.getElementById('mobileThemeToggle')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
});

const setNavbarShadow = () => {
    if (!navbar) {
        return;
    }
    navbar.classList.toggle('scrolled', window.scrollY > 8);
};

    setNavbarShadow();
    window.addEventListener('scroll', setNavbarShadow, { passive: true });

    if (burger && mobileMenu) {
        const closeMobileMenu = () => {
            burger.classList.remove('open');
            burger.setAttribute('aria-expanded', 'false');
            mobileMenu.classList.remove('open');
        };

        burger.addEventListener('click', () => {
            const isOpen = burger.classList.toggle('open');
            burger.setAttribute('aria-expanded', String(isOpen));
            mobileMenu.classList.toggle('open', isOpen);
        });

        mobileMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                if (!link.classList.contains('lang-btn')) {
                    closeMobileMenu();
                }
            });
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 920) {
                closeMobileMenu();
            }
        });
    }

    // FAQ accordion
    document.querySelectorAll('.faq-question').forEach((btn) => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const isOpen = btn.getAttribute('aria-expanded') === 'true';

            document.querySelectorAll('.faq-item').forEach((faqItem) => {
                faqItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                faqItem.classList.remove('open');
            });

            if (!isOpen && item) {
                btn.setAttribute('aria-expanded', 'true');
                item.classList.add('open');
            }
        });
    });

// ===== LANGUAGE DROPDOWN =====
const LANG_STORAGE_KEY = 'spotgo-language';

    const setText = (selector, value) => {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = value;
        }
    };

    const setHtml = (selector, value) => {
        const element = document.querySelector(selector);
        if (element) {
            element.innerHTML = value;
        }
    };

    const setTextList = (selector, values) => {
        document.querySelectorAll(selector).forEach((element, index) => {
            if (typeof values[index] === 'string') {
                element.textContent = values[index];
            }
        });
    };

    const setHtmlList = (selector, values) => {
        document.querySelectorAll(selector).forEach((element, index) => {
            if (typeof values[index] === 'string') {
                element.innerHTML = values[index];
            }
        });
    };

const TRANSLATIONS_BASE_PATH = 'i18n';
const translationCache = {};
const translationRequests = {};

const emptyTranslation = {
    documentLang: 'en',
    pageTitle: document.title,
    langCode: 'EN',
    text: {},
    html: {},
    listText: [],
    listHtml: []
};

const normalizeLanguage = (language) => {
    const supported = ['en', 'es', 'pt', 'fr'];
    return supported.includes(language) ? language : 'en';
};

    const loadLanguageFile = async (language) => {
        const normalized = normalizeLanguage(language);

        if (translationCache[normalized]) {
            return translationCache[normalized];
        }

        if (!translationRequests[normalized]) {
            translationRequests[normalized] = fetch(`${TRANSLATIONS_BASE_PATH}/${normalized}.json`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Could not load ${normalized}.json (${response.status})`);
                    }
                    return response.json();
                })
                .then((data) => {
                    translationCache[normalized] = data;
                    return data;
                })
                .catch((error) => {
                    console.error(`[i18n] Failed to load language file: ${normalized}`, error);
                    return null;
                })
                .finally(() => {
                    delete translationRequests[normalized];
                });
        }

        return translationRequests[normalized];
    };

    const getTranslation = async (language) => {
        const normalized = normalizeLanguage(language);

        const primary = await loadLanguageFile(normalized);
        if (primary) {
            return primary;
        }

        if (normalized !== 'en') {
            const fallback = await loadLanguageFile('en');
            if (fallback) {
                return fallback;
            }
        }

        return emptyTranslation;
    };

    let languageUpdateToken = 0;

const updateDropdownDisplay = (langCode) => {
    document.querySelectorAll('.lang-current').forEach((el) => {
        el.textContent = langCode;
    });
};

const updateActiveOption = (lang) => {
    document.querySelectorAll('.lang-option').forEach((option) => {
        option.classList.toggle('active', option.dataset.lang === lang);
    });
};

const applyLanguage = async (language) => {
    const normalized = normalizeLanguage(language);
    const token = ++languageUpdateToken;
    const translation = await getTranslation(normalized);

        if (token !== languageUpdateToken) {
            return;
        }

        document.documentElement.lang = translation.documentLang || 'en';
        document.title = translation.pageTitle || document.title;

        Object.entries(translation.text || {}).forEach(([selector, value]) => {
            setText(selector, value);
        });

        Object.entries(translation.html || {}).forEach(([selector, value]) => {
            setHtml(selector, value);
        });

        (translation.listText || []).forEach(({ selector, values }) => {
            setTextList(selector, values);
        });

        (translation.listHtml || []).forEach(({ selector, values }) => {
            setHtmlList(selector, values);
        });

    const langCode = translation.langCode || normalized.toUpperCase();
    updateDropdownDisplay(langCode);
    updateActiveOption(normalized);

        localStorage.setItem(LANG_STORAGE_KEY, normalized);
    };

    let currentLanguage = normalizeLanguage(localStorage.getItem(LANG_STORAGE_KEY));

// Initialize language on load
applyLanguage(currentLanguage);

// Setup dropdown toggles
const setupDropdown = (dropdownId, menuId, btnId) => {
    const dropdown = document.getElementById(dropdownId);
    const menu = document.getElementById(menuId);
    const btn = document.getElementById(btnId);

    if (!dropdown || !menu || !btn) return;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(isOpen));
    });
};

setupDropdown('langDropdown', 'langMenu', 'langBtn');
setupDropdown('mobileLangDropdown', 'mobileLangMenu', 'mobileLangBtn');

// Close dropdowns when clicking outside
document.addEventListener('click', () => {
    document.querySelectorAll('.lang-dropdown').forEach((dropdown) => {
        dropdown.classList.remove('open');
        const btn = dropdown.querySelector('.lang-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
    });
});

// Prevent closing when clicking inside the menu
document.querySelectorAll('.lang-menu').forEach((menu) => {
    menu.addEventListener('click', (e) => {
        e.stopPropagation();
    });
});

// Handle language option clicks
document.querySelectorAll('.lang-option').forEach((option) => {
    option.addEventListener('click', async (e) => {
        e.stopPropagation();
        const lang = option.dataset.lang;
        if (lang && lang !== currentLanguage) {
            currentLanguage = lang;
            await applyLanguage(currentLanguage);
            // Close all dropdowns
            document.querySelectorAll('.lang-dropdown').forEach((dropdown) => {
                dropdown.classList.remove('open');
                const btn = dropdown.querySelector('.lang-btn');
                if (btn) btn.setAttribute('aria-expanded', 'false');
            });
        }
    });
});
