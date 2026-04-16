var fs = require('fs');
var raw = fs.readFileSync('/Users/yuyun/Documents/openyida-main-2026-03-19/.cache/rs-tmp.txt', 'utf8');
var last = raw.lastIndexOf('}');
var j = JSON.parse(raw.substring(0, last + 1));
var pages = j.content.pages || [];
var tree = pages[0].componentsTree || [];
function walk(n, r) {
  if (!n) return;
  if (n.id && n.componentName) {
    var info = { id: n.id, componentName: n.componentName };
    if (n.props && n.props.dataSetModelMap) {
      info.hasData = true;
      info.dataSetKeys = Object.keys(n.props.dataSetModelMap);
    }
    if (n.props && n.props.settings && n.props.settings.labelConfig && n.props.settings.labelConfig.label) {
      info.label = n.props.settings.labelConfig.label.zh_CN;
    }
    if (n.props && n.props.settings && n.props.settings.title) {
      info.title = n.props.settings.title.zh_CN || n.props.settings.title;
    }
    r.push(info);
  }
  if (n.children) n.children.forEach(function(c) { walk(c, r); });
}
var nodes = [];
tree.forEach(function(t) { walk(t, nodes); });
var dataNodes = nodes.filter(function(n) { return n.hasData; });
console.log(JSON.stringify(dataNodes, null, 2));
