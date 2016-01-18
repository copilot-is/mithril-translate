/**
 * Microlib for translations with support for placeholders and multiple plural forms.
 *
 * v0.1.0
 *
 * Usage:
 * var en_US = {
 *  translationKey: 'translationValue',
 *  moduleA: {
 *    translationKey: 'value123'
 *  }
 * }
 *
 * mx.translate.configure({ debug: false, pluralize: function (n, translKey) { return Math.abs(n); } });
 * mx.translate.language(function () {
 *   var locale = 'en_US';
 *   var languages = { 'en_US': en_US };
 *   return languages[locale];
 * });
 *
 * mx.translate('translationKey')
 * mx.translate('translationKey', count)
 * mx.translate('translationKey', {replaceKey: 'replacevalue'})
 * mx.translate('translationKey', count, {replaceKey: 'replacevalue'})
 * mx.translate('translationKey', {replaceKey: 'replacevalue'}, count)
 *
 *
 * @author Jonas Girnatis <dermusterknabe@gmail.com>
 * @licence May be freely distributed under the MIT license.
 */

/* global console, module */
(function (m) {
  'use strict'

  var options;

  window.mx = window.mx || {};

  var isObject = function (obj) {
    return obj && typeof obj === 'object'
  }

  var debug = options && options.debug

  function getPluralValue(translation, count) {
    // Opinionated assumption: Pluralization rules are the same for negative and positive values.
    // By normalizing all values to positive, pluralization functions become simpler, and less error-prone by accident.
    var mappedCount = Math.abs(count)

    if (translation[mappedCount] != null) {
      translation = translation[mappedCount]
    } else {
      var plFunc = (tFunc.opts || {}).pluralize
      mappedCount = plFunc ? plFunc(mappedCount, translation) : mappedCount
      if (translation[mappedCount] != null) {
        translation = translation[mappedCount]
      } else if (translation.n != null) {
        translation = translation.n
      } else {
        debug && console.warn('No plural forms found for "' + count + '" in', translation)
      }
    }
    return translation
  }

  var replCache = {}

  var assemble = function (parts, replacements, count) {
    var result = parts[0]
    var isText = false
    var i = 1
    var len = parts.length
    while (i < len) {
      var part = parts[i]
      if (isText) {
        result += part
      } else {
        var val = replacements[part]
        if (val == null) {
          if (part === 'n' && count != null) {
            val = count
          } else {
            debug && console.warn('No "' + part + '" in placeholder object:', replacements)
            val = '{' + part + '}'
          }
        }
        result += val
      }
      isText = !isText
      i++
    }
    return result
  }

  function replacePlaceholders(translation, replacements, count) {
    var result = replCache[translation]
    if (result == null) {
      var parts = translation
      // turn both curly braces around tokens into the a unified
      // (and now unique/safe) token `{x}` signifying boundry between
      // replacement variables and static text.
        .replace(/\{(\w+)\}/g, '{x}$1{x}')
      // Adjacent placeholders will always have an empty string between them.
      // The array will also always start with a static string (at least a '').
        .split('{x}') // stupid but works™

      // NOTE: parts no consists of alternating [text,replacement,text,replacement,text]
      // Cache a function that loops over the parts array - unless there's only text
      // (i.e. parts.length === 1) - then we simply cache the string.
      result = parts.length > 1 ? parts : parts[0]
      replCache[translation] = result
    }
    result = result.pop ? assemble(result, replacements, count) : result
    return result
  }

  var tFunc = function (translationKey, count, replacements) {
    var translation = tFunc.keys[translationKey]
    var complex = count != null || replacements != null

    if (complex) {
      if (isObject(count)) {
        var tmp = replacements
        replacements = count
        count = tmp
      }
      replacements = replacements || {}
      count = typeof count === 'number' ? count : null

      if (count !== null && isObject(translation)) {
        // get appropriate plural translation string
        translation = getPluralValue(translation, count)
      }
    }

    if (typeof translation !== 'string') {
      translation = translationKey
      if (debug) {
        translation = '@@' + translation + '@@'
        console.warn('Translation for "' + translationKey + '" not found.')
      }
    } else if (complex || debug) {
      translation = replacePlaceholders(translation, replacements, count)
    }

    return translation
  }

  mx.translate = function (key) {
    return tFunc(key);
  };

  mx.translate.configure = function (options) {
    tFunc.opts = options || {}
  };
  
  mx.translate.language = function (language) {
    tFunc.keys = language() || {}
  };
})(m);
