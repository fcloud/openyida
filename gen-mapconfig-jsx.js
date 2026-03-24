#!/usr/bin/env node
/**
 * 生成 mapconfig.js 宜搭自定义页面
 * 将 mapconfig.html 通过 iframe srcdoc 方式嵌入宜搭自定义页面
 * 父页面负责与宜搭表单 API 交互，iframe 通过 postMessage 通信
 */
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'pages', 'src', 'mapconfig.html');
const outputPath = path.join(__dirname, 'pages', 'src', 'mapconfig.js');

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const htmlEscaped = JSON.stringify(htmlContent);

// ============================================================
// 生成的 JSX 内容（字符串拼接方式，兼容宜搭自定义页面格式）
// ============================================================

const jsxContent = `// ============================================================
// 状态管理
// ============================================================

var _customState = {
  loaded: false,
};

export function getCustomState(key) {
  if (key) return _customState[key];
  return Object.assign({}, _customState);
}

export function setCustomState(newState) {
  Object.keys(newState).forEach(function(key) {
    _customState[key] = newState[key];
  });
  this.forceUpdate();
}

export function forceUpdate() {
  this.setState({ timestamp: new Date().getTime() });
}

// ============================================================
// 地图区域配置页面 HTML 内容（完整嵌入）
// ============================================================

var MAPCONFIG_HTML = ${htmlEscaped};

// ============================================================
// 表单 UUID 与字段 ID 映射
// ============================================================

var ZONE_FORM_UUID = 'FORM-9C641A1BD69D4DE9BBB103643AF95EA0EEKS';
var ZONE_FIELD_IDS = {
  name:              'textField_qo1zkq1o',
  color:             'textField_qo1zoaku',
  provincesJson:     'textareaField_qo1z92mi',
  cityProvincesJson: 'textareaField_qo1zdqp3',
  desc:              'textareaField_qo1z1fz6',
};

var VERSION_FORM_UUID = 'FORM-B48904696FCF476EA7D64F8C90C3CAD0JNN2';
var VERSION_FIELD_IDS = {
  name:         'textField_3lmffjoq',
  snapshotJson: 'textareaField_3lmfbfi0',
};

var PERSON_FORM_UUID = 'FORM-4C975906D8A6442D9512E0B0B3178A7EB2AR';
var PERSON_FIELD_IDS = {
  name:        'textField_ziyx10ry',
  codename:    'textField_ziyxxhf0',
  role:        'selectField_ziyxvnpo',
  defaultZone: 'selectField_ziyy7qol',
  tag:         'textField_ziyy60p8',
};

// ============================================================
// 数据加载辅助函数
// ============================================================

function loadAndSendZonesToIframe(yidaUtils, iframe) {
  var allRecords = [];
  var yidaApi = (yidaUtils && yidaUtils.yida) || yidaUtils;
  if (!yidaApi || typeof yidaApi.searchFormDatas !== 'function') {
    console.error('[区域表] searchFormDatas 不可用');
    iframe.contentWindow.postMessage({ type: 'YIDA_ZONES_DATA', zones: [] }, '*');
    return;
  }
  function fetchPage(currentPage) {
    yidaApi.searchFormDatas({
      formUuid: ZONE_FORM_UUID,
      currentPage: currentPage,
      pageSize: 100,
    }).then(function(result) {
      var records = (result && result.data) || [];
      allRecords = allRecords.concat(records);
      var totalCount = (result && result.totalCount) || 0;
      if (allRecords.length < totalCount && records.length === 100) {
        fetchPage(currentPage + 1);
      } else {
        var zones = allRecords.map(function(record) {
          var fields = record.formData || {};
          return {
            formInstId:        record.formInstId,
            name:              fields[ZONE_FIELD_IDS.name]              || '',
            color:             fields[ZONE_FIELD_IDS.color]             || '#4fc3f7',
            provincesJson:     fields[ZONE_FIELD_IDS.provincesJson]     || '[]',
            cityProvincesJson: fields[ZONE_FIELD_IDS.cityProvincesJson] || '[]',
            desc:              fields[ZONE_FIELD_IDS.desc]              || '',
          };
        });
        console.log('[区域表] 加载完成，共', zones.length, '条');
        iframe.contentWindow.postMessage({ type: 'YIDA_ZONES_DATA', zones: zones }, '*');
      }
    }).catch(function(err) {
      console.warn('[区域表] searchFormDatas 失败:', err);
      iframe.contentWindow.postMessage({ type: 'YIDA_ZONES_DATA', zones: [] }, '*');
    });
  }
  fetchPage(1);
}

function loadAndSendVersionsToIframe(yidaUtils, iframe) {
  var allRecords = [];
  var yidaApi = (yidaUtils && yidaUtils.yida) || yidaUtils;
  if (!yidaApi || typeof yidaApi.searchFormDatas !== 'function') {
    console.error('[版本表] searchFormDatas 不可用');
    iframe.contentWindow.postMessage({ type: 'YIDA_VERSIONS_DATA', versions: [] }, '*');
    return;
  }
  function fetchPage(currentPage) {
    yidaApi.searchFormDatas({
      formUuid: VERSION_FORM_UUID,
      currentPage: currentPage,
      pageSize: 100,
    }).then(function(result) {
      var records = (result && result.data) || [];
      allRecords = allRecords.concat(records);
      var totalCount = (result && result.totalCount) || 0;
      if (allRecords.length < totalCount && records.length === 100) {
        fetchPage(currentPage + 1);
      } else {
        var versions = allRecords.map(function(record) {
          var fields = record.formData || {};
          var snapshotRaw = fields[VERSION_FIELD_IDS.snapshotJson] || '{}';
          var snapshot = {};
          try { snapshot = JSON.parse(snapshotRaw); } catch (e) {}
          return {
            formInstId: record.formInstId,
            name:       fields[VERSION_FIELD_IDS.name] || snapshot.name || '',
            time:       snapshot.time || '',
            zones:      snapshot.zones || [],
          };
        });
        console.log('[版本表] 加载完成，共', versions.length, '条');
        iframe.contentWindow.postMessage({ type: 'YIDA_VERSIONS_DATA', versions: versions }, '*');
      }
    }).catch(function(err) {
      console.warn('[版本表] searchFormDatas 失败:', err);
      iframe.contentWindow.postMessage({ type: 'YIDA_VERSIONS_DATA', versions: [] }, '*');
    });
  }
  fetchPage(1);
}

function loadAndSendPersonsToIframe(yidaUtils, iframe) {
  var allRecords = [];
  var yidaApi = (yidaUtils && yidaUtils.yida) || yidaUtils;
  if (!yidaApi || typeof yidaApi.searchFormDatas !== 'function') {
    console.error('[人员表] searchFormDatas 不可用');
    iframe.contentWindow.postMessage({ type: 'YIDA_PERSONS_DATA', persons: [] }, '*');
    return;
  }
  function fetchPage(currentPage) {
    yidaApi.searchFormDatas({
      formUuid: PERSON_FORM_UUID,
      currentPage: currentPage,
      pageSize: 100,
    }).then(function(result) {
      var records = (result && result.data) || [];
      allRecords = allRecords.concat(records);
      var totalCount = (result && result.totalCount) || 0;
      if (allRecords.length < totalCount && records.length === 100) {
        fetchPage(currentPage + 1);
      } else {
        var persons = allRecords.map(function(record) {
          var fields = record.formData || {};
          return {
            formInstId:  record.formInstId,
            name:        fields[PERSON_FIELD_IDS.name]        || '',
            codename:    fields[PERSON_FIELD_IDS.codename]    || '',
            role:        fields[PERSON_FIELD_IDS.role]        || 'bd',
            defaultZone: fields[PERSON_FIELD_IDS.defaultZone] || '',
            tag:         fields[PERSON_FIELD_IDS.tag]         || '',
          };
        });
        console.log('[人员表] 加载完成，共', persons.length, '条');
        iframe.contentWindow.postMessage({ type: 'YIDA_PERSONS_DATA', persons: persons }, '*');
      }
    }).catch(function(err) {
      console.warn('[人员表] searchFormDatas 失败:', err);
      iframe.contentWindow.postMessage({ type: 'YIDA_PERSONS_DATA', persons: [] }, '*');
    });
  }
  fetchPage(1);
}

// ============================================================
// 生命周期
// ============================================================

export function didMount() {
  var iframe = document.getElementById('mapconfig-iframe');
  if (!iframe) return;

  var yidaUtils = this.utils;

  function onIframeMessage(event) {
    var msg = event.data;
    if (!msg || !msg.type) return;

    // ── iframe 就绪：同时拉取区域、版本、人员数据 ──
    if (msg.type === 'MAPCONFIG_IFRAME_READY') {
      loadAndSendZonesToIframe(yidaUtils, iframe);
      loadAndSendVersionsToIframe(yidaUtils, iframe);
      loadAndSendPersonsToIframe(yidaUtils, iframe);
      return;
    }

    // ── 新建区域 ──
    if (msg.type === 'MAPCONFIG_SAVE_ZONE') {
      var tempId = msg.tempId;
      var zone = msg.zone || {};
      var yidaApi = (yidaUtils && yidaUtils.yida) || yidaUtils;
      if (!yidaApi || typeof yidaApi.saveFormData !== 'function') {
        console.error('[区域表] saveFormData 不可用');
        return;
      }
      yidaApi.saveFormData({
        formUuid: ZONE_FORM_UUID,
        formDataJson: JSON.stringify({
          textField_qo1zkq1o:     zone.name  || '',
          textField_qo1zoaku:     zone.color || '#4fc3f7',
          textareaField_qo1z92mi: JSON.stringify(zone.provinces     || []),
          textareaField_qo1zdqp3: JSON.stringify(zone.cityProvinces || []),
          textareaField_qo1z1fz6: zone.desc  || '',
        }),
      }).then(function(result) {
        var formInstId = result && (result.formInstId || result.id || result);
        console.log('[区域表] 新建成功，formInstId:', formInstId);
        iframe.contentWindow.postMessage({
          type: 'YIDA_ZONE_SAVED',
          tempId: tempId,
          formInstId: String(formInstId),
        }, '*');
      }).catch(function(err) {
        console.error('[区域表] saveFormData 失败:', err);
      });
      return;
    }

    // ── 更新区域 ──
    if (msg.type === 'MAPCONFIG_UPDATE_ZONE') {
      var zoneId = msg.zoneId;
      var zone = msg.zone || {};
      var yidaApi = (yidaUtils && yidaUtils.yida) || yidaUtils;
      if (!yidaApi || typeof yidaApi.updateFormData !== 'function') {
        console.error('[区域表] updateFormData 不可用');
        return;
      }
      yidaApi.updateFormData({
        formUuid: ZONE_FORM_UUID,
        formInstId: zoneId,
        formDataJson: JSON.stringify({
          textField_qo1zkq1o:     zone.name  || '',
          textField_qo1zoaku:     zone.color || '#4fc3f7',
          textareaField_qo1z92mi: JSON.stringify(zone.provinces     || []),
          textareaField_qo1zdqp3: JSON.stringify(zone.cityProvinces || []),
          textareaField_qo1z1fz6: zone.desc  || '',
        }),
      }).then(function() {
        console.log('[区域表] 更新成功，formInstId:', zoneId);
        iframe.contentWindow.postMessage({ type: 'YIDA_ZONE_UPDATED', zoneId: zoneId }, '*');
      }).catch(function(err) {
        console.error('[区域表] updateFormData 失败:', err);
      });
      return;
    }

    // ── 删除区域 ──
    if (msg.type === 'MAPCONFIG_DELETE_ZONE') {
      var zoneId = msg.zoneId;
      var yidaApi = (yidaUtils && yidaUtils.yida) || yidaUtils;
      if (!yidaApi || typeof yidaApi.deleteFormData !== 'function') {
        console.error('[区域表] deleteFormData 不可用');
        return;
      }
      yidaApi.deleteFormData({
        formUuid: ZONE_FORM_UUID,
        formInstId: zoneId,
      }).then(function() {
        console.log('[区域表] 删除成功，formInstId:', zoneId);
        iframe.contentWindow.postMessage({ type: 'YIDA_ZONE_DELETED', zoneId: zoneId }, '*');
      }).catch(function(err) {
        console.error('[区域表] deleteFormData 失败:', err);
      });
      return;
    }

    // ── 保存版本 ──
    if (msg.type === 'MAPCONFIG_SAVE_VERSION') {
      var snapshot = msg.snapshot || {};
      var yidaApi = (yidaUtils && yidaUtils.yida) || yidaUtils;
      if (!yidaApi || typeof yidaApi.saveFormData !== 'function') {
        console.error('[版本表] saveFormData 不可用');
        return;
      }
      yidaApi.saveFormData({
        formUuid: VERSION_FORM_UUID,
        formDataJson: JSON.stringify({
          textField_3lmffjoq:     snapshot.name || '',
          textareaField_3lmfbfi0: JSON.stringify(snapshot),
        }),
      }).then(function(result) {
        var formInstId = result && (result.formInstId || result.id || result);
        console.log('[版本表] 保存成功，formInstId:', formInstId);
        iframe.contentWindow.postMessage({
          type: 'YIDA_VERSION_SAVED',
          formInstId: String(formInstId),
          snapshot: snapshot,
        }, '*');
      }).catch(function(err) {
        console.error('[版本表] saveFormData 失败:', err);
      });
      return;
    }

    // ── 删除版本 ──
    if (msg.type === 'MAPCONFIG_DELETE_VERSION') {
      var versionId = msg.versionId;
      var yidaApi = (yidaUtils && yidaUtils.yida) || yidaUtils;
      if (!yidaApi || typeof yidaApi.deleteFormData !== 'function') {
        console.error('[版本表] deleteFormData 不可用');
        return;
      }
      yidaApi.deleteFormData({
        formUuid: VERSION_FORM_UUID,
        formInstId: versionId,
      }).then(function() {
        console.log('[版本表] 删除成功，formInstId:', versionId);
        iframe.contentWindow.postMessage({ type: 'YIDA_VERSION_DELETED', versionId: versionId }, '*');
      }).catch(function(err) {
        console.error('[版本表] deleteFormData 失败:', err);
      });
      return;
    }

    // ── 新建人员 ──
    if (msg.type === 'MAPCONFIG_CREATE_PERSON') {
      var tempId = msg.tempId;
      var person = msg.person || {};
      var yidaApi = (yidaUtils && yidaUtils.yida) || yidaUtils;
      if (!yidaApi || typeof yidaApi.saveFormData !== 'function') {
        console.error('[人员表] saveFormData 不可用');
        return;
      }
      yidaApi.saveFormData({
        formUuid: PERSON_FORM_UUID,
        formDataJson: JSON.stringify({
          textField_ziyx10ry:   person.name        || '',
          textField_ziyxxhf0:   person.codename    || '',
          selectField_ziyxvnpo: person.role        || 'bd',
          selectField_ziyy7qol: person.defaultZone || '',
          textField_ziyy60p8:   person.tag         || '',
        }),
      }).then(function(result) {
        var formInstId = result && (result.formInstId || result.id || result);
        console.log('[人员表] 新建成功，formInstId:', formInstId);
        iframe.contentWindow.postMessage({
          type: 'YIDA_PERSON_CREATED',
          tempId: tempId,
          formInstId: String(formInstId),
        }, '*');
      }).catch(function(err) {
        console.error('[人员表] saveFormData 失败:', err);
      });
      return;
    }

    // ── 删除人员 ──
    if (msg.type === 'MAPCONFIG_DELETE_PERSON') {
      var personId = msg.personId;
      var yidaApi = (yidaUtils && yidaUtils.yida) || yidaUtils;
      if (!yidaApi || typeof yidaApi.deleteFormData !== 'function') {
        console.error('[人员表] deleteFormData 不可用');
        return;
      }
      yidaApi.deleteFormData({
        formUuid: PERSON_FORM_UUID,
        formInstId: personId,
      }).then(function() {
        console.log('[人员表] 删除成功，formInstId:', personId);
      }).catch(function(err) {
        console.error('[人员表] deleteFormData 失败:', err);
      });
      return;
    }
  }

  window.addEventListener('message', onIframeMessage);
  iframe.srcdoc = MAPCONFIG_HTML;
}

export function didUnmount() {
  var iframe = document.getElementById('mapconfig-iframe');
  if (iframe) {
    iframe.srcdoc = '';
  }
}

// ============================================================
// 渲染
// ============================================================

export function renderJsx() {
  var timestamp = this.state.timestamp;

  var wrapperStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    overflow: 'hidden',
    background: '#060f1e',
  };

  var iframeStyle = {
    width: '100%',
    height: '100%',
    border: 'none',
    display: 'block',
  };

  var hiddenStyle = { display: 'none' };

  return (
    <div style={wrapperStyle}>
      <div style={hiddenStyle}>{timestamp}</div>
      <iframe
        id="mapconfig-iframe"
        style={iframeStyle}
        sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups"
        title="地图区域配置"
      />
    </div>
  );
}`;

fs.writeFileSync(outputPath, jsxContent, 'utf8');
console.log('Generated: ' + outputPath);
console.log('Size: ' + jsxContent.length + ' bytes');
console.log('Lines: ' + jsxContent.split('\n').length);
