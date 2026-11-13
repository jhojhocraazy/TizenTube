import i18n from 'i18next';
import resources from './i18nResources.js';

// Chrome 47 / ES5: no optional chaining, no shorthand, no template literals.
// Normalizes "pt_BR", "pt-br" and "PT-BR" to "pt-BR", the tag shape used by
// the resource keys, and title-cases 4-letter script subtags ("sr-latn").
function normalizeLanguageTag(tag) {
  var parts = String(tag).replace(/_/g, '-').split('-');
  var normalized = parts[0].toLowerCase();

  for (var i = 1; i < parts.length; i++) {
    var part = parts[i];

    if (part.length === 2) {
      normalized = normalized + '-' + part.toUpperCase();
    } else if (part.length === 4) {
      normalized = normalized + '-' + part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    } else {
      normalized = normalized + '-' + part;
    }
  }

  return normalized;
}

// Prefer the language YouTube actually rendered (HL), then the platform
// language. Returning the full tag (not just "pt") keeps regional variants
// such as pt-PT, es-419 and zh-CN resolvable.
function getLanguage() {
  var hl = null;

  try {
    hl = window.yt && window.yt.config_ && window.yt.config_.HL;
  } catch (e) {
    hl = null;
  }

  if (hl) {
    return normalizeLanguageTag(hl);
  }

  var navigatorLanguage = typeof navigator !== 'undefined' &&
    (navigator.language || navigator.userLanguage);

  if (navigatorLanguage) {
    return normalizeLanguageTag(navigatorLanguage);
  }

  return 'en';
}

function InitI18next(lng) {
  i18n
    .init({
      lng: lng,
      fallbackLng: 'en',
      resources: resources,
      debug: false,
      interpolation: {
        escapeValue: false,
      }
    });
}

InitI18next(getLanguage());

export default i18n;
