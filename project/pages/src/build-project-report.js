/**
 * 项目信息统计分析 - vc-yida-report 报表 Schema 构建脚本
 *
 * 使用方式：
 *   node project/pages/src/build-project-report.js > .cache/project-report-schema.json
 *
 * 数据源：项目信息表 FORM-5FE501D96DDA42BDABA8AA33323CC4319LIC
 */

const path = require('path');
const {
  buildSchema,
  buildDataSetEntry,
  buildFieldDefinition,
  buildOrderByItem,
} = require(path.resolve(__dirname, '../../../yida-skills/skills/yida-chart/build-yida-report-schema'));

const CUBE_CODE = 'FORM-5FE501D96DDA42BDABA8AA33323CC4319LIC';

// ============================================================
// 报表页面 Schema
// ============================================================

const reportPageSchema = buildSchema.pageHeader({
  titleContent: '项目信息统计分析',
  titleTip: '基于项目信息表的实时统计分析看板',
  showTitle: true,
  children: [

    // ── 1. 顶部筛选器 ──────────────────────────────
    buildSchema.topFilterContainer({
      showTag: true,
      children: [
        // 按项目状态筛选
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

        // 按项目优先级筛选
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

        // 按开始日期范围筛选
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

    // ── 2. KPI 指标卡 ──────────────────────────────
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
              alias: 'numberField_d9h5xczk_avg',
              aliasName: '平均预算',
              isDim: false,
              dataType: 'NUMBER',
              aggregateType: 'AVG',
              originField: 'numberField_d9h5xczk',
            }),
            buildFieldDefinition({
              alias: 'rateField_j2xeiy60',
              aliasName: '平均进度',
              isDim: false,
              dataType: 'NUMBER',
              aggregateType: 'AVG',
            }),
          ],
          fieldList: ['textField_j2xehece', 'numberField_d9h5xczk', 'numberField_d9h5xczk_avg', 'rateField_j2xeiy60'],
        }),
      },
      settings: {
        columnCount: 4,
        columnCountForH5: 2,
      },
    }),

    // ── 3. 项目状态分布饼图 ──────────────────────────
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
        height: 350,
        innerRadius: 0.5,
        percent: true,
      },
    }),

    // ── 4. 项目优先级分布条形图 ──────────────────────
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
              alias: 'textField_j2xehece_count',
              aliasName: '项目数量',
              isDim: false,
              dataType: 'STRING',
              aggregateType: 'COUNT',
              originField: 'textField_j2xehece',
            }),
          ],
          fieldList: ['selectField_j2xeiguj', 'textField_j2xehece_count'],
        }),
      },
      settings: {
        titleConfig: { label: '项目优先级分布' },
        height: 350,
        showLabel: true,
      },
    }),

    // ── 5. 项目预算趋势折线图（按月） ──────────────────
    buildSchema.lineChart({
      dataSetModelMap: {
        line_dataset: buildDataSetEntry({
          cubeCode: CUBE_CODE,
          fieldDefinitionList: [
            buildFieldDefinition({
              alias: 'dateField_j2xe9bqx',
              aliasName: '开始月份',
              isDim: true,
              dataType: 'DATE',
              timeGranularityType: 'MONTH',
            }),
            buildFieldDefinition({
              alias: 'numberField_d9h5xczk',
              aliasName: '预算合计',
              isDim: false,
              dataType: 'NUMBER',
              aggregateType: 'SUM',
            }),
          ],
          fieldList: ['dateField_j2xe9bqx', 'numberField_d9h5xczk'],
          orderByList: [buildOrderByItem('dateField_j2xe9bqx', 'ASC')],
        }),
      },
      settings: {
        titleConfig: { label: '项目预算趋势（按月）' },
        height: 350,
        smooth: true,
      },
    }),

    // ── 6. 项目明细表格 ──────────────────────────────
    buildSchema.table({
      dataSetModelMap: {
        table: buildDataSetEntry({
          cubeCode: CUBE_CODE,
          fieldDefinitionList: [
            buildFieldDefinition({ alias: 'textField_j2xehece', aliasName: '项目名称', isDim: true, dataType: 'STRING' }),
            buildFieldDefinition({ alias: 'employeeField_j2xe83h6', aliasName: '项目负责人', isDim: true, dataType: 'STRING' }),
            buildFieldDefinition({ alias: 'departmentSelectField_j2xe5myr', aliasName: '所属部门', isDim: true, dataType: 'STRING' }),
            buildFieldDefinition({ alias: 'selectField_j2xeiduk', aliasName: '项目状态', isDim: true, dataType: 'STRING' }),
            buildFieldDefinition({ alias: 'selectField_j2xeiguj', aliasName: '项目优先级', isDim: true, dataType: 'STRING' }),
            buildFieldDefinition({ alias: 'numberField_d9h5xczk', aliasName: '项目预算', isDim: false, dataType: 'NUMBER', aggregateType: 'NONE' }),
            buildFieldDefinition({ alias: 'rateField_j2xeiy60', aliasName: '项目进度', isDim: false, dataType: 'NUMBER', aggregateType: 'NONE' }),
            buildFieldDefinition({ alias: 'dateField_j2xe9bqx', aliasName: '开始日期', isDim: true, dataType: 'DATE', timeGranularityType: 'DAY' }),
            buildFieldDefinition({ alias: 'dateField_j2xex1if', aliasName: '结束日期', isDim: true, dataType: 'DATE', timeGranularityType: 'DAY' }),
          ],
          fieldList: [
            'textField_j2xehece',
            'employeeField_j2xe83h6',
            'departmentSelectField_j2xe5myr',
            'selectField_j2xeiduk',
            'selectField_j2xeiguj',
            'numberField_d9h5xczk',
            'rateField_j2xeiy60',
            'dateField_j2xe9bqx',
            'dateField_j2xex1if',
          ],
          orderByList: [buildOrderByItem('dateField_j2xe9bqx', 'DESC')],
        }),
      },
      settings: {
        titleConfig: { label: '项目明细表' },
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

// 输出完整 Schema JSON
console.log(JSON.stringify(reportPageSchema, null, 2));
