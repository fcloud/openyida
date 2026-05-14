'use strict';

const {
  DEFAULT_GLOBAL_BASE_URL,
  DEFAULT_GLOBAL_LOGIN_URL,
  DEFAULT_GLOBAL_ENV,
  resolveEnvName,
  isYidaServiceHost,
  loadEnvsConfig,
} = require('../lib/core/env-manager');

// ── Global environment constants ──────────────────────────────────────

describe('Global YiDA environment config', () => {
  test('DEFAULT_GLOBAL_BASE_URL points to yidaapps.com', () => {
    expect(DEFAULT_GLOBAL_BASE_URL).toBe('https://www.yidaapps.com');
  });

  test('DEFAULT_GLOBAL_LOGIN_URL points to yidaapps.com/workPlatform', () => {
    expect(DEFAULT_GLOBAL_LOGIN_URL).toBe('https://www.yidaapps.com/workPlatform');
  });

  test('DEFAULT_GLOBAL_ENV has English-only description', () => {
    expect(DEFAULT_GLOBAL_ENV.description).toBe('Global YiDA (yidaapps.com)');
    expect(DEFAULT_GLOBAL_ENV.cookieFile).toBe('cookies-global.json');
  });

  test('loadEnvsConfig always includes global environment', () => {
    const config = loadEnvsConfig();
    expect(config.environments).toHaveProperty('global');
    expect(config.environments.global.baseUrl).toBe('https://www.yidaapps.com');
  });
});

// ── resolveEnvName ────────────────────────────────────────────────────

describe('resolveEnvName — exact names', () => {
  test('resolves "global" to global', () => {
    expect(resolveEnvName('global')).toBe('global');
  });

  test('resolves "public" to public', () => {
    expect(resolveEnvName('public')).toBe('public');
  });

  test('resolves "alibaba" to alibaba', () => {
    expect(resolveEnvName('alibaba')).toBe('alibaba');
  });
});

describe('resolveEnvName — Global YiDA aliases', () => {
  const globalAliases = [
    'overseas', 'international', 'yidaapps', 'japan', 'sg',
    'singapore', 'us', '海外', '国际', '海外版', '海外yida',
    '宜搭海外', '宜搭海外版本', '日本', '日本yida', '日本宜搭',
    '全球', '全球yida', '全球版',
  ];

  globalAliases.forEach((alias) => {
    test(`resolves "${alias}" to global`, () => {
      expect(resolveEnvName(alias)).toBe('global');
    });
  });

  test('is case-insensitive for English aliases', () => {
    expect(resolveEnvName('OVERSEAS')).toBe('global');
    expect(resolveEnvName('Global')).toBe('global');
    expect(resolveEnvName('INTERNATIONAL')).toBe('global');
  });

  test('trims whitespace before resolving', () => {
    expect(resolveEnvName('  global  ')).toBe('global');
    expect(resolveEnvName('  海外  ')).toBe('global');
  });
});

describe('resolveEnvName — China aliases', () => {
  const chinaAliases = ['cn', 'china', '国内', '国内版', 'aliwork'];

  chinaAliases.forEach((alias) => {
    test(`resolves "${alias}" to public`, () => {
      expect(resolveEnvName(alias)).toBe('public');
    });
  });
});

describe('resolveEnvName — unknown input passthrough', () => {
  test('returns original string when no alias matches', () => {
    expect(resolveEnvName('my-private-env')).toBe('my-private-env');
  });

  test('returns empty string unchanged', () => {
    expect(resolveEnvName('')).toBe('');
  });

  test('returns null/undefined unchanged', () => {
    expect(resolveEnvName(null)).toBe(null);
    expect(resolveEnvName(undefined)).toBe(undefined);
  });
});

// ── isYidaServiceHost — yidaapps.com ─────────────────────────────────

describe('isYidaServiceHost — yidaapps.com', () => {
  test('recognizes www.yidaapps.com as a YiDA host', () => {
    expect(isYidaServiceHost('www.yidaapps.com')).toBe(true);
  });

  test('recognizes subdomains of yidaapps.com', () => {
    expect(isYidaServiceHost('api.yidaapps.com')).toBe(true);
    expect(isYidaServiceHost('custom.yidaapps.com')).toBe(true);
  });

  test('does not treat bare yidaapps.com as a YiDA service host', () => {
    expect(isYidaServiceHost('yidaapps.com')).toBe(false);
  });

  test('still recognizes aliwork.com subdomains', () => {
    expect(isYidaServiceHost('www.aliwork.com')).toBe(true);
    expect(isYidaServiceHost('custom.aliwork.com')).toBe(true);
  });
});
