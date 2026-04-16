var fs = require('fs');
var raw = fs.readFileSync(__dirname + '/report-schema-recheck.txt', 'utf8');
var jsonStart = raw.indexOf('{');
var json = raw.substring(jsonStart);
var schema = JSON.parse(json);
var tree = schema.content.pages[0].componentsTree[0];

function walk(node, results) {
  if (!node) return;
  if (node.componentName && node.id && node.props && node.props.cid) {
    var info = { componentName: node.componentName, id: node.id, cid: node.props.cid };
    if (node.props.dataSetModelMap) {
      var dsKeys = Object.keys(node.props.dataSetModelMap);
      info.dataSetKeys = dsKeys;
      dsKeys.forEach(function(dk) {
        var ds = node.props.dataSetModelMap[dk];
        if (ds && ds.dataViewQueryModel && ds.dataViewQueryModel.fieldDefinitionList) {
          info[dk + '_fields'] = ds.dataViewQueryModel.fieldDefinitionList.map(function(f) {
            return { alias: f.alias, fieldCode: f.fieldCode, aggregateType: f.aggregateType };
          });
        }
      });
    }
    results.push(info);
  }
  if (Array.isArray(node.children)) {
    node.children.forEach(function(c) { walk(c, results); });
  }
}

var results = [];
walk(tree, results);
console.log(JSON.stringify(results, null, 2));
