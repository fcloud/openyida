/**
 * i18n.ts - 国际化支持模块
 *
 * 支持语言：
 *   zh      - 简体中文（默认）
 *   zh-TW   - 繁體中文（台灣 / 香港）
 *   en      - English
 *   ja      - 日本語
 *   ko      - 한국어
 *   fr      - Français
 *   de      - Deutsch
 *   es      - Español
 *   pt      - Português
 *   vi      - Tiếng Việt
 *   hi      - हिन्दी
 *   ar      - العربية
 *
 * 语言检测优先级：
 *   1. OPENYIDA_LANG 环境变量（如：OPENYIDA_LANG=en）
 *   2. LANG / LC_ALL 系统环境变量
 *   3. 默认：zh（简体中文）
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_LANGUAGES = void 0;
exports.detectLanguage = detectLanguage;
exports.t = t;
exports.getLanguage = getLanguage;
exports.setLanguage = setLanguage;
exports.SUPPORTED_LANGUAGES = ['zh', 'zh-TW', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'pt', 'vi', 'hi', 'ar'];
const DEFAULT_LANGUAGE = 'zh';
/**
 * 将系统 locale 代码映射到支持的语言代码。
 */
function mapLocaleToLanguage(code) {
    const localeMap = {
        zh: 'zh',
        'zh-tw': 'zh-TW',
        'zh-hk': 'zh-TW',
        'zh-mo': 'zh-TW',
        en: 'en',
        ja: 'ja',
        ko: 'ko',
        fr: 'fr',
        de: 'de',
        es: 'es',
        pt: 'pt',
        vi: 'vi',
        hi: 'hi',
        ar: 'ar',
    };
    return localeMap[code] || null;
}
/**
 * 从环境变量或系统 locale 中检测当前语言。
 */
function detectLanguage() {
    // 优先级1：OPENYIDA_LANG 环境变量
    const envLang = process.env.OPENYIDA_LANG;
    if (envLang) {
        const normalized = envLang.toLowerCase().replace(/_/g, '-');
        const fullMatch = mapLocaleToLanguage(normalized);
        if (fullMatch) {
            return fullMatch;
        }
        const primaryCode = normalized.split('-')[0];
        const primaryMatch = mapLocaleToLanguage(primaryCode);
        if (primaryMatch) {
            return primaryMatch;
        }
    }
    // 优先级2：系统 LANG / LC_ALL 环境变量
    const systemLang = process.env.LC_ALL || process.env.LANG || '';
    const normalizedSystem = systemLang.toLowerCase().replace(/_/g, '-').split('.')[0];
    const systemMatch = mapLocaleToLanguage(normalizedSystem);
    if (systemMatch) {
        return systemMatch;
    }
    const systemPrimary = normalizedSystem.split('-')[0];
    const systemPrimaryMatch = mapLocaleToLanguage(systemPrimary);
    if (systemPrimaryMatch) {
        return systemPrimaryMatch;
    }
    return DEFAULT_LANGUAGE;
}
let currentLanguage = detectLanguage();
let translations = null;
/**
 * 懒加载翻译文件。
 */
function loadTranslations() {
    if (translations) {
        return translations;
    }
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        translations = require(`./locales/${currentLanguage}`);
    }
    catch {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        translations = require('./locales/zh');
    }
    return translations;
}
/**
 * 将 {0} {1} 占位符替换为实际参数。
 */
function interpolate(template, args) {
    if (!args || args.length === 0) {
        return template;
    }
    return template.replace(/\{(\d+)\}/g, (match, index) => {
        const argValue = args[parseInt(index, 10)];
        return argValue !== undefined ? String(argValue) : match;
    });
}
/**
 * 翻译函数，支持 {0} {1} 占位符插值。
 */
function t(key, ...args) {
    const dict = loadTranslations();
    const value = key.split('.').reduce((obj, segment) => {
        return obj && typeof obj === 'object' ? obj[segment] : undefined;
    }, dict);
    if (typeof value !== 'string') {
        if (currentLanguage !== 'zh') {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const zhDict = require('./locales/zh');
            const zhValue = key.split('.').reduce((obj, segment) => {
                return obj && typeof obj === 'object' ? obj[segment] : undefined;
            }, zhDict);
            if (typeof zhValue === 'string') {
                return interpolate(zhValue, args);
            }
        }
        return key;
    }
    return interpolate(value, args);
}
/**
 * 获取当前语言。
 */
function getLanguage() {
    return currentLanguage;
}
/**
 * 手动设置语言（主要用于测试）。
 */
function setLanguage(lang) {
    if (exports.SUPPORTED_LANGUAGES.includes(lang)) {
        currentLanguage = lang;
        translations = null;
    }
}
//# sourceMappingURL=i18n.js.map