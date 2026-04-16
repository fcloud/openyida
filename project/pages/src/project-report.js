const {
  buildSchema,
  buildDataSetEntry,
  buildFieldDefinition,
  buildOrderByItem,
} = require('../../../yida-skills/skills/yida-chart/build-yida-report-schema');

const CUBE_CODE = 'FORM-5FE501D96DDA42BDABA8AA33323CC4319LIC';

// 构建项目信息分析报表页面 Schema
const reportPageSchema = buildSchema.pageHeader({
  titleContent: '项目信息分析报表',
  titleTip: '基于项目信息表数据的多维度分析看板',
  children: [
    // 1. 顶部筛选器
    buildSchema.topFilterContainer({
      showTag: true,
      children: [
        buildSchema.selectFilter({
          dataSetModelMap: {
            selectFilter: buildDataSetEntry({
              cubeCode: CUBE_CODE,
              cubeCodes: [CUBE_CODE],
              fieldDefinitionList: [
                buildFieldDefinition({
                  alias: 'selectField_j2xeiduk',
                  aliasName: '项目状态',
                  isDim: true,
                  dataType: 'STRING',
                }),
              ],
              fieldList: ['selectField_j2xeiduk'],
              valueField: ['selectField_j2xeiduk'],
              labelField: ['selectField_j2xeiduk'],
            }),
          },
          settings: {
            labelConfig: { label: '项目状态' },
            mode: 'multiple',
            showLabel: true,
          },
        }),
        buildSchema.selectFilter({
          dataSetModelMap: {
            selectFilter: buildDataSetEntry({
              cubeCode: CUBE_CODE,
              cubeCodes: [CUBE_CODE],
              fieldDefinitionList: [
                buildFieldDefinition({
                  alias: 'selectField_j2xeiguj',
                  aliasName: '项目优先级',
                  isDim: true,
                  dataType: 'STRING',
                }),
              ],
              fieldList: ['selectField_j2xeiguj'],
              valueField: ['selectField_j2xeiguj'],
              labelField: ['selectField_j2xeiguj'],
            }),
          },
          settings: {
            labelConfig: { label: '项目优先级' },
            mode: 'multiple',
            showLabel: true,
          },
        }),
        buildSchema.timeFilter({
          dataSetModelMap: {
            filterData: buildDataSetEntry({
              cubeCode: CUBE_CODE,
              cubeCodes: [CUBE_CODE],
              fieldDefinitionList: [
                buildFieldDefinition({
                  alias: 'dateField_j2xe9bqx',
                  aliasName: '开始日期',
                  isDim: true,
                  dataType: 'DATE',
                  timeGranularityType: 'DAY',
                }),
              ],
              fieldList: ['dateField_j2xe9bqx'],
              valueField: ['dateField_j2xe9bqx'],
            }),
          },
          settings: {
            labelConfig: { label: '开始日期' },
            mode: 'range',
            dataConfig: { queryType: 'Between' },
          },
        }),
      ],
    }),

    // 2. KPI 指标卡
    buildSchema.simpleIndicatorCard({
      dataSetModelMap: {
        kpi_dataset: buildDataSetEntry({
          cubeCode: CUBE_CODE,
          fieldDefinitionList: [
            buildFieldDefinition({
              alias: 'textField_j2xehece',
              aliasName: '项目总数',
              isDim: false,
              dataType: 'STRING',
              aggregateType: 'COUNT',
            }),
            buildFieldDefinition({
              alias: 'numberField_d9h5xczk',
              aliasName: '总预算',
              isDim: false,
              dataType: 'NUMBER',
              aggregateType: 'SUM',
            }),
            buildFieldDefinition({
              alias: 'rateField_j2xeiy60',
              aliasName: '平均进度评分',
              isDim: false,
              dataType: 'NUMBER',
              aggregateType: 'AVG',
            }),
          ],
          fieldList: [
            'textField_j2xehece',
            'numberField_d9h5xczk',
            'rateField_j2xeiy60',
          ],
        }),
      },
      settings: { columnCount: 3, columnCountForH5: 1 },
    }),

    // 3. 项目状态分布饼图
    buildSchema.pieChart({
      dataSetModelMap: {
        pie_dataset: buildDataSetEntry({
          cubeCode: CUBE_CODE,
          fieldDefinitionList: [
            buildFieldDefinition({
              alias: 'selectField_j2xeiduk',
              aliasName: '项目状态',
              isDim: true,
              dataType: 'STRING',
            }),
            buildFieldDefinition({
              alias: 'textField_j2xehece',
              aliasName: '项目数量',
              isDim: false,
              dataType: 'STRING',
              aggregateType: 'COUNT',
            }),
          ],
          fieldList: ['selectField_j2xeiduk', 'textField_j2xehece'],
        }),
      },
      settings: {
        titleConfig: { label: '项目状态分布' },
        innerRadius: 0.6,
        height: 350,
      },
    }),

    // 4. 各优先级项目预算对比条形图
    buildSchema.groupedBarChart({
      dataSetModelMap: {
        bar_dataset: buildDataSetEntry({
          cubeCode: CUBE_CODE,
          fieldDefinitionList: [
            buildFieldDefinition({
              alias: 'selectField_j2xeiguj',
              aliasName: '项目优先级',
              isDim: true,
              dataType: 'STRING',
            }),
            buildFieldDefinition({
              alias: 'numberField_d9h5xczk',
              aliasName: '项目预算',
              isDim: false,
              dataType: 'NUMBER',
              aggregateType: 'SUM',
            }),
          ],
          fieldList: ['selectField_j2xeiguj', 'numberField_d9h5xczk'],
        }),
      },
      settings: {
        titleConfig: { label: '各优先级项目预算对比' },
        height: 350,
        isStack: false,
        isPercent: false,
      },
    }),

    // 5. 项目启动趋势折线图
    buildSchema.lineChart({
      dataSetModelMap: {
        line_dataset: buildDataSetEntry({
          cubeCode: CUBE_CODE,
          fieldDefinitionList: [
            buildFieldDefinition({
              alias: 'dateField_j2xe9bqx',
              aliasName: '开始日期',
              isDim: true,
              dataType: 'DATE',
              timeGranularityType: 'MONTH',
            }),
            buildFieldDefinition({
              alias: 'textField_j2xehece',
              aliasName: '项目数量',
              isDim: false,
              dataType: 'STRING',
              aggregateType: 'COUNT',
            }),
          ],
          fieldList: ['dateField_j2xe9bqx', 'textField_j2xehece'],
          orderByList: [buildOrderByItem('dateField_j2xe9bqx', 'ASC')],
        }),
      },
      settings: {
        titleConfig: { label: '项目启动趋势（按月）' },
        height: 350,
        smooth: true,
      },
    }),

    // 6. 项目明细表格
    buildSchema.table({
      dataSetModelMap: {
        table: buildDataSetEntry({
          cubeCode: CUBE_CODE,
          fieldDefinitionList: [
            buildFieldDefinition({
              alias: 'textField_j2xehece',
              aliasName: '项目名称',
              isDim: true,
              dataType: 'STRING',
            }),
            buildFieldDefinition({
              alias: 'selectField_j2xeiduk',
              aliasName: '项目状态',
              isDim: true,
              dataType: 'STRING',
            }),
            buildFieldDefinition({
              alias: 'selectField_j2xeiguj',
              aliasName: '项目优先级',
              isDim: true,
              dataType: 'STRING',
            }),
            buildFieldDefinition({
              alias: 'employeeField_j2xe83h6',
              aliasName: '项目负责人',
              isDim: true,
              dataType: 'STRING',
            }),
            buildFieldDefinition({
              alias: 'departmentSelectField_j2xe5myr',
              aliasName: '所属部门',
              isDim: true,
              dataType: 'STRING',
            }),
            buildFieldDefinition({
              alias: 'dateField_j2xe9bqx',
              aliasName: '开始日期',
              isDim: true,
              dataType: 'DATE',
              timeGranularityType: 'DAY',
            }),
            buildFieldDefinition({
              alias: 'dateField_j2xex1if',
              aliasName: '结束日期',
              isDim: true,
              dataType: 'DATE',
              timeGranularityType: 'DAY',
            }),
            buildFieldDefinition({
              alias: 'numberField_d9h5xczk',
              aliasName: '项目预算',
              isDim: false,
              dataType: 'NUMBER',
              aggregateType: 'NONE',
            }),
            buildFieldDefinition({
              alias: 'rateField_j2xeiy60',
              aliasName: '项目进度',
              isDim: false,
              dataType: 'NUMBER',
              aggregateType: 'NONE',
            }),
          ],
          fieldList: [
            'textField_j2xehece',
            'selectField_j2xeiduk',
            'selectField_j2xeiguj',
            'employeeField_j2xe83h6',
            'departmentSelectField_j2xe5myr',
            'dateField_j2xe9bqx',
            'dateField_j2xex1if',
            'numberField_d9h5xczk',
            'rateField_j2xeiy60',
          ],
          orderByList: [buildOrderByItem('dateField_j2xe9bqx', 'DESC')],
        }),
      },
      settings: {
        fixedHeader: true,
        theme: 'border',
        maxBodyHeight: 500,
        pagination: {
          pageSize: 20,
          showPageSelect: true,
          pageSizeList: [10, 20, 50, 100],
        },
      },
    }),
  ],
});

console.log(JSON.stringify(reportPageSchema, null, 2));
