'use strict';

const { parseCreateAppArgs } = require('../lib/app/create-app');

describe('create-app argument parsing', () => {
  test('keeps backward-compatible positional arguments', () => {
    const parsed = parseCreateAppArgs([
      'CRM',
      'Customer management',
      'xian-qiye',
      '#00B853',
      'deepBlue',
      'light',
      'ver',
    ]);

    expect(parsed).toMatchObject({
      appName: 'CRM',
      description: 'Customer management',
      icon: 'xian-qiye',
      iconColor: '#00B853',
      colour: 'deepBlue',
      navTheme: 'light',
      layoutDirection: 'ver',
    });
  });

  test('supports agent-friendly named options', () => {
    const parsed = parseCreateAppArgs([
      '--name', '电商经营管理看板',
      '--desc', 'E-commerce operations management dashboard demo',
      '--theme', 'deepBlue',
    ]);

    expect(parsed).toMatchObject({
      appName: '电商经营管理看板',
      description: 'E-commerce operations management dashboard demo',
      colour: 'deepBlue',
      icon: 'xian-yingyong',
      iconColor: '#0089FF',
      navTheme: 'dark',
      layoutDirection: 'slide',
    });
  });

  test('rejects unknown flags instead of treating them as the app name', () => {
    expect(() => parseCreateAppArgs(['--unknown'])).toThrow('Unknown option: --unknown');
  });
});
