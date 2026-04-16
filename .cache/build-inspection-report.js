const {
  buildSchema,
  buildDataSetEntry,
  buildFieldDefinition,
  buildOrderByItem,
} = require('../yida-skills/skills/yida-chart/build-yida-report-schema.js');

// 设备巡检记录表配置
const CUBE_CODE = 'FORM_F696F9ECD173453AAEC806BBEB3F496CYOBR';

// 构建报表 Schema
const schema = buildSchema.pageHeader({
  titleContent: '设备巡检数据报表',
  children: [
    // 指标卡：巡检总数
    buildSchema.simpleIndicatorCard({
      dataSetModelMap: {
        kpi_dataset: buildDataSetEntry({
          cubeCode: CUBE_CODE,
          fieldDefinitionList: [
            buildFieldDefinition({
              alias: 'serialNumberField_pq061hs9t',
              aliasName: '巡检总数',
              isDim: false,
              dataType: 'STRING',
              aggregateType: 'COUNT',
            }),
          ],
          fieldList: ['serialNumberField_pq061hs9t'],
        }),
      },
      settings: {
        columnCount: 1,
      },
    }),

    // 饼图：设备状态分布
    buildSchema.pieChart({
      dataSetModelMap: {
        pie_dataset: buildDataSetEntry({
          cubeCode: CUBE_CODE,
          fieldDefinitionList: [
            buildFieldDefinition({
              alias: 'radioField_pq067njt6',
              aliasName: '设备状态',
              isDim: true,
              dataType: 'STRING',
            }),
            buildFieldDefinition({
              alias: 'status_count',
              aliasName: '数量',
              isDim: false,
              dataType: 'NUMBER',
              aggregateType: 'COUNT',
            }),
          ],
          fieldList: ['radioField_pq067njt6', 'status_count'],
        }),
      },
      settings: {
        titleConfig: {
          label: '设备状态分布',
        },
        height: 400,
      },
    }),

    // 柱状图1：各区域巡检次数
    buildSchema.groupedBarChart({
      dataSetModelMap: {
        bar_dataset: buildDataSetEntry({
          cubeCode: CUBE_CODE,
          fieldDefinitionList: [
            buildFieldDefinition({
              alias: 'selectField_pq0647gqt',
              aliasName: '巡检区域',
              isDim: true,
              dataType: 'STRING',
            }),
            buildFieldDefinition({
              alias: 'area_count',
              aliasName: '巡检次数',
              isDim: false,
              dataType: 'NUMBER',
              aggregateType: 'COUNT',
            }),
          ],
          fieldList: ['selectField_pq0647gqt', 'area_count'],
        }),
      },
      settings: {
        titleConfig: {
          label: '各区域巡检次数',
        },
        height: 400,
      },
    }),

    // 柱状图2：各设备巡检次数
    buildSchema.groupedBarChart({
      dataSetModelMap: {
        bar_dataset: buildDataSetEntry({
          cubeCode: CUBE_CODE,
          fieldDefinitionList: [
            buildFieldDefinition({
              alias: 'selectField_pq062vhhm',
              aliasName: '设备名称',
              isDim: true,
              dataType: 'STRING',
            }),
            buildFieldDefinition({
              alias: 'device_count',
              aliasName: '巡检次数',
              isDim: false,
              dataType: 'NUMBER',
              aggregateType: 'COUNT',
            }),
          ],
          fieldList: ['selectField_pq062vhhm', 'device_count'],
        }),
      },
      settings: {
        titleConfig: {
          label: '各设备巡检次数',
        },
        height: 400,
      },
    }),

    // 折线图：巡检日期趋势
    buildSchema.lineChart({
      dataSetModelMap: {
        line_dataset: buildDataSetEntry({
          cubeCode: CUBE_CODE,
          fieldDefinitionList: [
            buildFieldDefinition({
              alias: 'dateField_pq066npit',
              aliasName: '巡检日期',
              isDim: true,
              dataType: 'DATE',
              timeGranularityType: 'DAY',
            }),
            buildFieldDefinition({
              alias: 'date_count',
              aliasName: '巡检次数',
              isDim: false,
              dataType: 'NUMBER',
              aggregateType: 'COUNT',
            }),
          ],
          fieldList: ['dateField_pq066npit', 'date_count'],
          orderByList: [buildOrderByItem('dateField_pq066npit', 'ASC')],
        }),
      },
      settings: {
        titleConfig: {
          label: '巡检日期趋势',
        },
        height: 400,
      },
    }),

    // 明细表格
    buildSchema.table({
      dataSetModelMap: {
        table: buildDataSetEntry({
          cubeCode: CUBE_CODE,
          fieldDefinitionList: [
            buildFieldDefinition({
              alias: 'serialNumberField_pq061hs9t',
              aliasName: '巡检编号',
              isDim: true,
              dataType: 'STRING',
            }),
            buildFieldDefinition({
              alias: 'selectField_pq062vhhm',
              aliasName: '设备名称',
              isDim: true,
              dataType: 'STRING',
            }),
            buildFieldDefinition({
              alias: 'selectField_pq0647gqt',
              aliasName: '巡检区域',
              isDim: true,
              dataType: 'STRING',
            }),
            buildFieldDefinition({
              alias: 'radioField_pq067njt6',
              aliasName: '设备状态',
              isDim: true,
              dataType: 'STRING',
            }),
            buildFieldDefinition({
              alias: 'dateField_pq066npit',
              aliasName: '巡检日期',
              isDim: true,
              dataType: 'DATE',
              timeGranularityType: 'DAY',
            }),
            buildFieldDefinition({
              alias: 'rateField_pq06a9x8n',
              aliasName: '设备评分',
              isDim: false,
              dataType: 'NUMBER',
              aggregateType: 'NONE',
            }),
          ],
          fieldList: [
            'serialNumberField_pq061hs9t',
            'selectField_pq062vhhm',
            'selectField_pq0647gqt',
            'radioField_pq067njt6',
            'dateField_pq066npit',
            'rateField_pq06a9x8n',
          ],
        }),
      },
      settings: {
        fixedHeader: true,
        theme: 'split',
        maxBodyHeight: 500,
        pagination: {
          pageSize: 20,
          showPageSelect: true,
          pageSizeList: [10, 20, 50],
        },
      },
    }),
  ],
});

// 输出完整的 JSON Schema
console.log(JSON.stringify(schema, null, 2));
