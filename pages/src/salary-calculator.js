// ============================================================
// 智能薪酬 - 仁励家智能薪酬复刻版
// ============================================================

var FORM_UUID = 'FORM-FED8903F78F94F7DAF749E787D37DCE3B67J';

var FIELD_MAP = {
  planName: 'textField_1opupwtx',
  city: 'textField_1opukb6y',
  monthlySalary: 'numberField_1opv4w73',
  bonusMonths: 'numberField_1opvbjq2',
  fundRatio: 'selectField_1opvpdvm',
  bonusTaxMethod: 'selectField_1opvp78s',
  specialDeduction: 'numberField_1opvwqxp',
  insuranceMonthly: 'numberField_1opvlhdm',
  fundMonthly: 'numberField_1opv3oh2',
  taxableIncome: 'numberField_1opwfowi',
  monthlyTax: 'numberField_1opw8zyi',
  monthlyNetSalary: 'numberField_1opwrevm',
  yearlyGross: 'numberField_1opwpmw4',
  yearlyNet: 'numberField_1opwkx7u',
  yearlyTax: 'numberField_1opwirbr',
  yearlyInsuranceFund: 'numberField_1opwhwel',
  bonusGross: 'numberField_1opwl0de',
  bonusTax: 'numberField_1opwnu26',
  bonusNet: 'numberField_1opwlls3',
};

// 五险一金比例数据库（主要城市）
var CITY_INSURANCE_DATA = {
  '北京': { pension: 0.08, medical: 0.02, unemployment: 0.005, medicalExtra: 3, fundBase: 'salary' },
  '上海': { pension: 0.08, medical: 0.02, unemployment: 0.005, medicalExtra: 0, fundBase: 'salary' },
  '广州': { pension: 0.08, medical: 0.02, unemployment: 0.002, medicalExtra: 0, fundBase: 'salary' },
  '深圳': { pension: 0.08, medical: 0.02, unemployment: 0.003, medicalExtra: 0, fundBase: 'salary' },
  '杭州': { pension: 0.08, medical: 0.02, unemployment: 0.005, medicalExtra: 0, fundBase: 'salary' },
  '成都': { pension: 0.08, medical: 0.02, unemployment: 0.004, medicalExtra: 0, fundBase: 'salary' },
  '南京': { pension: 0.08, medical: 0.02, unemployment: 0.005, medicalExtra: 10, fundBase: 'salary' },
  '武汉': { pension: 0.08, medical: 0.02, unemployment: 0.003, medicalExtra: 0, fundBase: 'salary' },
  '西安': { pension: 0.08, medical: 0.02, unemployment: 0.003, medicalExtra: 0, fundBase: 'salary' },
  '重庆': { pension: 0.08, medical: 0.02, unemployment: 0.005, medicalExtra: 0, fundBase: 'salary' },
  '苏州': { pension: 0.08, medical: 0.02, unemployment: 0.005, medicalExtra: 5, fundBase: 'salary' },
  '天津': { pension: 0.08, medical: 0.02, unemployment: 0.005, medicalExtra: 0, fundBase: 'salary' },
  '长沙': { pension: 0.08, medical: 0.02, unemployment: 0.003, medicalExtra: 0, fundBase: 'salary' },
  '郑州': { pension: 0.08, medical: 0.02, unemployment: 0.003, medicalExtra: 0, fundBase: 'salary' },
  '东莞': { pension: 0.08, medical: 0.02, unemployment: 0.002, medicalExtra: 0, fundBase: 'salary' },
};

var DEFAULT_INSURANCE = { pension: 0.08, medical: 0.02, unemployment: 0.005, medicalExtra: 0, fundBase: 'salary' };

// 个税累进税率表（月度）
var TAX_BRACKETS = [
  { min: 0, max: 36000, rate: 0.03, deduction: 0 },
  { min: 36000, max: 144000, rate: 0.10, deduction: 2520 },
  { min: 144000, max: 300000, rate: 0.20, deduction: 16920 },
  { min: 300000, max: 420000, rate: 0.25, deduction: 31920 },
  { min: 420000, max: 660000, rate: 0.30, deduction: 52920 },
  { min: 660000, max: 960000, rate: 0.35, deduction: 85920 },
  { min: 960000, max: Infinity, rate: 0.45, deduction: 181920 },
];

// 年终奖单独计税税率表
var BONUS_TAX_BRACKETS = [
  { min: 0, max: 36000, rate: 0.03, deduction: 0 },
  { min: 36000, max: 144000, rate: 0.10, deduction: 210 },
  { min: 144000, max: 300000, rate: 0.20, deduction: 1410 },
  { min: 300000, max: 420000, rate: 0.25, deduction: 2660 },
  { min: 420000, max: 660000, rate: 0.30, deduction: 4410 },
  { min: 660000, max: 960000, rate: 0.35, deduction: 7160 },
  { min: 960000, max: Infinity, rate: 0.45, deduction: 15160 },
];

var CITY_LIST = Object.keys(CITY_INSURANCE_DATA);

// ============================================================
// 状态管理
// ============================================================

var _customState = {
  monthlySalary: 15000,
  city: '杭州',
  bonusMonths: 2,
  fundRatioPercent: 12,
  bonusTaxMethod: 'separate',
  specialDeduction: 0,
  customInsurance: false,
  customInsuranceAmount: 0,
  customFundAmount: 0,
  result: null,
  savedPlans: [],
  comparePlans: [],
  showCompare: false,
  showHistory: false,
  activeTab: 'input',
  saving: false,
  loading: false,
};

export function getCustomState(key) {
  if (key) return _customState[key];
  return Object.assign({}, _customState);
}

export function setCustomState(newState) {
  Object.keys(newState).forEach(function (key) {
    _customState[key] = newState[key];
  });
  this.forceUpdate();
}

export function forceUpdate() {
  this.setState({ timestamp: new Date().getTime() });
}

// ============================================================
// 计算引擎
// ============================================================

function calculateInsurance(salary, city, fundRatioPercent) {
  var cityData = CITY_INSURANCE_DATA[city] || DEFAULT_INSURANCE;
  var pensionPersonal = salary * cityData.pension;
  var medicalPersonal = salary * cityData.medical + (cityData.medicalExtra || 0);
  var unemploymentPersonal = salary * cityData.unemployment;
  var fundPersonal = salary * (fundRatioPercent / 100);
  var totalPersonal = pensionPersonal + medicalPersonal + unemploymentPersonal + fundPersonal;
  return {
    pension: Math.round(pensionPersonal * 100) / 100,
    medical: Math.round(medicalPersonal * 100) / 100,
    unemployment: Math.round(unemploymentPersonal * 100) / 100,
    fund: Math.round(fundPersonal * 100) / 100,
    total: Math.round(totalPersonal * 100) / 100,
    insuranceOnly: Math.round((pensionPersonal + medicalPersonal + unemploymentPersonal) * 100) / 100,
  };
}

function calculateMonthlyTax(yearlyTaxableIncome) {
  for (var i = 0; i < TAX_BRACKETS.length; i++) {
    var bracket = TAX_BRACKETS[i];
    if (yearlyTaxableIncome <= bracket.max) {
      return Math.round((yearlyTaxableIncome * bracket.rate - bracket.deduction) * 100) / 100;
    }
  }
  return 0;
}

function calculateBonusTaxSeparate(bonusAmount) {
  var monthlyBonus = bonusAmount / 12;
  for (var i = 0; i < BONUS_TAX_BRACKETS.length; i++) {
    var bracket = BONUS_TAX_BRACKETS[i];
    if (monthlyBonus * 12 <= bracket.max) {
      return Math.round((bonusAmount * bracket.rate - bracket.deduction) * 100) / 100;
    }
  }
  return 0;
}

function performCalculation() {
  var salary = _customState.monthlySalary || 0;
  var city = _customState.city || '杭州';
  var bonusMonths = _customState.bonusMonths || 0;
  var fundRatio = _customState.fundRatioPercent || 12;
  var bonusTaxMethod = _customState.bonusTaxMethod || 'separate';
  var specialDeduction = _customState.specialDeduction || 0;

  var insurance = _customState.customInsurance
    ? { total: (_customState.customInsuranceAmount || 0) + (_customState.customFundAmount || 0), insuranceOnly: _customState.customInsuranceAmount || 0, fund: _customState.customFundAmount || 0, pension: 0, medical: 0, unemployment: 0 }
    : calculateInsurance(salary, city, fundRatio);

  var monthlyTaxableIncome = salary - insurance.total - 5000 - specialDeduction;
  if (monthlyTaxableIncome < 0) monthlyTaxableIncome = 0;

  var bonusGross = salary * bonusMonths;

  // 按月累计计算全年个税
  var monthlyDetails = [];
  var cumulativeTaxableIncome = 0;
  var cumulativeTaxPaid = 0;

  for (var month = 1; month <= 12; month++) {
    cumulativeTaxableIncome += monthlyTaxableIncome;
    var cumulativeTax = calculateMonthlyTax(cumulativeTaxableIncome);
    var currentMonthTax = Math.max(0, Math.round((cumulativeTax - cumulativeTaxPaid) * 100) / 100);
    cumulativeTaxPaid += currentMonthTax;
    var netSalary = Math.round((salary - insurance.total - currentMonthTax) * 100) / 100;
    monthlyDetails.push({
      month: month,
      grossSalary: salary,
      insurance: insurance.total,
      taxableIncome: monthlyTaxableIncome,
      tax: currentMonthTax,
      netSalary: netSalary,
    });
  }

  var yearlyGross = salary * 12 + bonusGross;
  var yearlyInsuranceFund = Math.round(insurance.total * 12 * 100) / 100;
  var yearlySalaryTax = cumulativeTaxPaid;

  var bonusTax = 0;
  var bonusNet = bonusGross;
  if (bonusGross > 0) {
    if (bonusTaxMethod === 'separate') {
      bonusTax = calculateBonusTaxSeparate(bonusGross);
    } else {
      var combinedTaxableIncome = cumulativeTaxableIncome + bonusGross;
      var combinedTax = calculateMonthlyTax(combinedTaxableIncome);
      bonusTax = Math.round((combinedTax - cumulativeTaxPaid) * 100) / 100;
    }
    bonusNet = Math.round((bonusGross - bonusTax) * 100) / 100;
  }

  var yearlyTotalTax = Math.round((yearlySalaryTax + bonusTax) * 100) / 100;
  var yearlyNet = Math.round((yearlyGross - yearlyInsuranceFund - yearlyTotalTax) * 100) / 100;

  var avgMonthlyTax = Math.round((yearlySalaryTax / 12) * 100) / 100;
  var avgMonthlyNet = Math.round(((salary * 12 - yearlyInsuranceFund - yearlySalaryTax) / 12) * 100) / 100;

  return {
    insurance: insurance,
    monthlyDetails: monthlyDetails,
    avgMonthlyTax: avgMonthlyTax,
    avgMonthlyNet: avgMonthlyNet,
    monthlyTaxableIncome: monthlyTaxableIncome,
    yearlyGross: yearlyGross,
    yearlyNet: yearlyNet,
    yearlyTotalTax: yearlyTotalTax,
    yearlyInsuranceFund: yearlyInsuranceFund,
    yearlySalaryTax: yearlySalaryTax,
    bonusGross: bonusGross,
    bonusTax: bonusTax,
    bonusNet: bonusNet,
    salary: salary,
    city: city,
    bonusMonths: bonusMonths,
    fundRatio: fundRatio,
    bonusTaxMethod: bonusTaxMethod,
    specialDeduction: specialDeduction,
  };
}

// ============================================================
// 生命周期
// ============================================================

export function didMount() {
  var result = performCalculation();
  _customState.result = result;
  this.setCustomState({ result: result });
  this.loadSavedPlans();
}

export function didUnmount() {}

// ============================================================
// 业务方法
// ============================================================

export function loadSavedPlans() {
  var self = this;
  _customState.loading = true;
  this.utils.yida.searchFormDatas({
    formUuid: FORM_UUID,
    currentPage: 1,
    pageSize: 50,
  }).then(function (res) {
    var plans = (res.data || []).map(function (item) {
      var fd = item.formData || {};
      return {
        formInstId: item.formInstId,
        name: fd[FIELD_MAP.planName] || '未命名方案',
        city: fd[FIELD_MAP.city] || '',
        monthlySalary: fd[FIELD_MAP.monthlySalary] || 0,
        bonusMonths: fd[FIELD_MAP.bonusMonths] || 0,
        monthlyNet: fd[FIELD_MAP.monthlyNetSalary] || 0,
        yearlyNet: fd[FIELD_MAP.yearlyNet] || 0,
        yearlyGross: fd[FIELD_MAP.yearlyGross] || 0,
        yearlyTax: fd[FIELD_MAP.yearlyTax] || 0,
      };
    });
    _customState.loading = false;
    _customState.savedPlans = plans;
    self.setCustomState({ savedPlans: plans, loading: false });
  }).catch(function (err) {
    _customState.loading = false;
    self.setCustomState({ loading: false });
    self.utils.toast({ title: '加载方案失败: ' + err.message, type: 'error' });
  });
}

export function savePlan() {
  var self = this;
  var result = _customState.result;
  if (!result) {
    this.utils.toast({ title: '请先计算薪酬', type: 'warning' });
    return;
  }
  var planNameEl = document.getElementById('salary-plan-name');
  var planName = (planNameEl && planNameEl.value) || (result.city + '-' + formatMoney(result.salary) + '月薪方案');

  _customState.saving = true;
  this.setCustomState({ saving: true });

  var formData = {};
  formData[FIELD_MAP.planName] = planName;
  formData[FIELD_MAP.city] = result.city;
  formData[FIELD_MAP.monthlySalary] = result.salary;
  formData[FIELD_MAP.bonusMonths] = result.bonusMonths;
  formData[FIELD_MAP.fundRatio] = result.fundRatio + '%';
  formData[FIELD_MAP.bonusTaxMethod] = result.bonusTaxMethod === 'separate' ? '单独计税' : '合并计税';
  formData[FIELD_MAP.specialDeduction] = result.specialDeduction;
  formData[FIELD_MAP.insuranceMonthly] = result.insurance.insuranceOnly;
  formData[FIELD_MAP.fundMonthly] = result.insurance.fund;
  formData[FIELD_MAP.taxableIncome] = result.monthlyTaxableIncome;
  formData[FIELD_MAP.monthlyTax] = result.avgMonthlyTax;
  formData[FIELD_MAP.monthlyNetSalary] = result.avgMonthlyNet;
  formData[FIELD_MAP.yearlyGross] = result.yearlyGross;
  formData[FIELD_MAP.yearlyNet] = result.yearlyNet;
  formData[FIELD_MAP.yearlyTax] = result.yearlyTotalTax;
  formData[FIELD_MAP.yearlyInsuranceFund] = result.yearlyInsuranceFund;
  formData[FIELD_MAP.bonusGross] = result.bonusGross;
  formData[FIELD_MAP.bonusTax] = result.bonusTax;
  formData[FIELD_MAP.bonusNet] = result.bonusNet;

  this.utils.yida.saveFormData({
    formUuid: FORM_UUID,
    appType: window.pageConfig.appType,
    formDataJson: JSON.stringify(formData),
  }).then(function () {
    _customState.saving = false;
    self.setCustomState({ saving: false });
    self.utils.toast({ title: '方案保存成功！', type: 'success' });
    self.loadSavedPlans();
  }).catch(function (err) {
    _customState.saving = false;
    self.setCustomState({ saving: false });
    self.utils.toast({ title: '保存失败: ' + err.message, type: 'error' });
  });
}

export function deletePlan(formInstId) {
  var self = this;
  this.utils.dialog({
    type: 'confirm',
    title: '确认删除',
    content: '确定要删除这个薪酬方案吗？',
    onOk: function () {
      self.utils.yida.deleteFormData({
        formUuid: FORM_UUID,
        formInstId: formInstId,
      }).then(function () {
        self.utils.toast({ title: '删除成功', type: 'success' });
        self.loadSavedPlans();
      }).catch(function (err) {
        self.utils.toast({ title: '删除失败: ' + err.message, type: 'error' });
      });
    },
  });
}

// ============================================================
// 工具函数
// ============================================================

function formatMoney(num) {
  if (num === null || num === undefined) return '0';
  var n = Math.round(num * 100) / 100;
  var parts = n.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (parts.length === 1) parts.push('00');
  else if (parts[1].length === 1) parts[1] += '0';
  return parts.join('.');
}

function formatMoneyShort(num) {
  if (num >= 10000) return (Math.round(num / 100) / 100) + '万';
  return formatMoney(num);
}

// ============================================================
// 渲染
// ============================================================

export function renderJsx() {
  var timestamp = this.state.timestamp;
  var self = this;
  var isMobile = this.utils.isMobile();
  var result = _customState.result;
  var savedPlans = _customState.savedPlans || [];
  var comparePlans = _customState.comparePlans || [];
  var showCompare = _customState.showCompare;
  var showHistory = _customState.showHistory;
  var activeTab = _customState.activeTab || 'input';

  // ========== 颜色系统 ==========
  var colors = {
    primary: '#10B981',
    primaryDark: '#059669',
    primaryLight: '#D1FAE5',
    primaryBg: '#ECFDF5',
    white: '#FFFFFF',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    red: '#EF4444',
    orange: '#F59E0B',
    blue: '#3B82F6',
    purple: '#8B5CF6',
    pink: '#EC4899',
  };

  // ========== 样式定义 ==========
  var styles = {
    page: {
      padding: 0,
      margin: 0,
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 50%, #F9FAFB 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      borderRadius: 0,
    },
    header: {
      background: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)',
      padding: isMobile ? '20px 16px' : '28px 40px',
      color: colors.white,
      position: 'relative',
      overflow: 'hidden',
    },
    headerPattern: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 40%)',
    },
    headerContent: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
    },
    logoIcon: {
      width: isMobile ? '40px' : '48px',
      height: isMobile ? '40px' : '48px',
      background: 'rgba(255,255,255,0.2)',
      borderRadius: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: isMobile ? '20px' : '24px',
      backdropFilter: 'blur(10px)',
    },
    headerTitle: {
      fontSize: isMobile ? '20px' : '26px',
      fontWeight: '700',
      letterSpacing: '1px',
      margin: 0,
    },
    headerSubtitle: {
      fontSize: '13px',
      opacity: 0.85,
      marginTop: '2px',
    },
    headerActions: {
      display: 'flex',
      gap: '8px',
    },
    headerBtn: {
      padding: '8px 16px',
      background: 'rgba(255,255,255,0.2)',
      border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: '8px',
      color: colors.white,
      fontSize: '13px',
      cursor: 'pointer',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.2s',
    },
    mainLayout: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '0' : '0',
      maxWidth: '1400px',
      margin: '0 auto',
      padding: isMobile ? '0' : '24px 24px',
    },
    leftPanel: {
      width: isMobile ? '100%' : '38%',
      minWidth: isMobile ? 'auto' : '380px',
      padding: isMobile ? '16px' : '0 12px 0 0',
    },
    rightPanel: {
      flex: 1,
      padding: isMobile ? '0 16px 16px' : '0 0 0 12px',
    },
    card: {
      background: colors.white,
      borderRadius: '16px',
      padding: isMobile ? '16px' : '24px',
      marginBottom: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      border: '1px solid ' + colors.gray100,
    },
    cardTitle: {
      fontSize: '16px',
      fontWeight: '700',
      color: colors.gray800,
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    cardTitleIcon: {
      width: '28px',
      height: '28px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
    },
    formGroup: {
      marginBottom: '14px',
    },
    formLabel: {
      fontSize: '13px',
      fontWeight: '600',
      color: colors.gray600,
      marginBottom: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    formInput: {
      width: '100%',
      padding: '10px 14px',
      border: '1.5px solid ' + colors.gray200,
      borderRadius: '10px',
      fontSize: '15px',
      color: colors.gray800,
      outline: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxSizing: 'border-box',
      background: colors.gray50,
    },
    formSelect: {
      width: '100%',
      padding: '10px 14px',
      border: '1.5px solid ' + colors.gray200,
      borderRadius: '10px',
      fontSize: '15px',
      color: colors.gray800,
      outline: 'none',
      background: colors.gray50,
      boxSizing: 'border-box',
      cursor: 'pointer',
      appearance: 'none',
      WebkitAppearance: 'none',
    },
    formRow: {
      display: 'flex',
      gap: '12px',
    },
    formHalf: {
      flex: 1,
    },
    calculateBtn: {
      width: '100%',
      padding: '14px',
      background: 'linear-gradient(135deg, ' + colors.primaryDark + ', ' + colors.primary + ')',
      color: colors.white,
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '700',
      cursor: 'pointer',
      letterSpacing: '1px',
      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
      transition: 'all 0.2s',
      marginTop: '8px',
    },
    // 4宫格指标卡片
    metricsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr',
      gap: '12px',
      marginBottom: '16px',
    },
    metricCard: {
      padding: isMobile ? '14px' : '18px',
      borderRadius: '14px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    metricLabel: {
      fontSize: '12px',
      fontWeight: '500',
      opacity: 0.8,
      marginBottom: '6px',
    },
    metricValue: {
      fontSize: isMobile ? '20px' : '26px',
      fontWeight: '800',
      fontFamily: '"SF Mono", "Fira Code", "Cascadia Code", monospace',
      letterSpacing: '-0.5px',
    },
    metricUnit: {
      fontSize: '12px',
      fontWeight: '500',
      opacity: 0.7,
      marginTop: '2px',
    },
    // 图表区域
    chartCard: {
      background: colors.white,
      borderRadius: '16px',
      padding: isMobile ? '16px' : '24px',
      marginBottom: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      border: '1px solid ' + colors.gray100,
    },
    chartTitle: {
      fontSize: '15px',
      fontWeight: '700',
      color: colors.gray800,
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    // 环形图
    donutContainer: {
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: isMobile ? '16px' : '24px',
      flexDirection: isMobile ? 'column' : 'row',
    },
    donutChart: {
      width: isMobile ? '160px' : '180px',
      height: isMobile ? '160px' : '180px',
      borderRadius: '50%',
      position: 'relative',
      flexShrink: 0,
      margin: isMobile ? '0 auto' : '0',
    },
    donutCenter: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
    },
    donutCenterValue: {
      fontSize: isMobile ? '18px' : '22px',
      fontWeight: '800',
      color: colors.gray800,
      fontFamily: '"SF Mono", monospace',
    },
    donutCenterLabel: {
      fontSize: '11px',
      color: colors.gray500,
    },
    legendList: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '13px',
    },
    legendDot: {
      width: '10px',
      height: '10px',
      borderRadius: '3px',
      flexShrink: 0,
    },
    legendLabel: {
      flex: 1,
      color: colors.gray600,
    },
    legendValue: {
      fontWeight: '700',
      color: colors.gray800,
      fontFamily: '"SF Mono", monospace',
      fontSize: '13px',
    },
    // 柱状图
    barChartContainer: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: isMobile ? '4px' : '8px',
      height: '200px',
      padding: '0 4px',
    },
    barGroup: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: '100%',
      justifyContent: 'flex-end',
    },
    barValue: {
      fontSize: '10px',
      color: colors.gray500,
      marginBottom: '4px',
      fontFamily: '"SF Mono", monospace',
      whiteSpace: 'nowrap',
    },
    bar: {
      width: '100%',
      maxWidth: '40px',
      borderRadius: '6px 6px 2px 2px',
      transition: 'height 0.5s ease',
      minHeight: '4px',
    },
    barLabel: {
      fontSize: '10px',
      color: colors.gray500,
      marginTop: '6px',
      textAlign: 'center',
      whiteSpace: 'nowrap',
    },
    // 瀑布图
    waterfallContainer: {
      position: 'relative',
      padding: '0 4px',
    },
    waterfallBar: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '8px',
      gap: '8px',
    },
    waterfallLabel: {
      width: isMobile ? '70px' : '90px',
      fontSize: '12px',
      color: colors.gray600,
      textAlign: 'right',
      flexShrink: 0,
    },
    waterfallBarInner: {
      height: '28px',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '10px',
      fontSize: '12px',
      fontWeight: '600',
      fontFamily: '"SF Mono", monospace',
      color: colors.white,
      transition: 'width 0.5s ease',
      minWidth: '50px',
    },
    // 操作按钮
    actionBar: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
      marginTop: '12px',
    },
    actionBtn: {
      padding: '10px 18px',
      borderRadius: '10px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    primaryBtn: {
      background: 'linear-gradient(135deg, ' + colors.primaryDark + ', ' + colors.primary + ')',
      color: colors.white,
      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
    },
    secondaryBtn: {
      background: colors.gray100,
      color: colors.gray700,
      border: '1px solid ' + colors.gray200,
    },
    dangerBtn: {
      background: '#FEF2F2',
      color: colors.red,
      border: '1px solid #FECACA',
    },
    // 历史方案
    planItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 14px',
      background: colors.gray50,
      borderRadius: '10px',
      marginBottom: '8px',
      border: '1px solid ' + colors.gray100,
    },
    planInfo: {
      flex: 1,
    },
    planName: {
      fontSize: '14px',
      fontWeight: '600',
      color: colors.gray800,
    },
    planMeta: {
      fontSize: '12px',
      color: colors.gray500,
      marginTop: '2px',
    },
    planActions: {
      display: 'flex',
      gap: '6px',
    },
    smallBtn: {
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '12px',
      cursor: 'pointer',
      border: 'none',
      fontWeight: '500',
    },
    // 对比表格
    compareTable: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
      fontSize: '13px',
      borderRadius: '10px',
      overflow: 'hidden',
      border: '1px solid ' + colors.gray200,
    },
    compareTh: {
      padding: '10px 12px',
      background: colors.primaryLight,
      color: colors.primaryDark,
      fontWeight: '600',
      textAlign: 'left',
      borderBottom: '1px solid ' + colors.gray200,
    },
    compareTd: {
      padding: '8px 12px',
      borderBottom: '1px solid ' + colors.gray100,
      color: colors.gray700,
    },
    // 切换标签
    switchContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      background: colors.gray100,
      borderRadius: '8px',
      padding: '3px',
      marginBottom: '4px',
    },
    switchLabel: {
      fontSize: '12px',
      color: colors.gray500,
      marginRight: '4px',
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '13px',
      color: colors.gray600,
      cursor: 'pointer',
    },
    // 保存区域
    saveSection: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
      marginTop: '16px',
      padding: '14px',
      background: colors.primaryBg,
      borderRadius: '12px',
      border: '1px solid ' + colors.primaryLight,
    },
    saveInput: {
      flex: 1,
      padding: '8px 12px',
      border: '1.5px solid ' + colors.primary,
      borderRadius: '8px',
      fontSize: '13px',
      outline: 'none',
      background: colors.white,
      boxSizing: 'border-box',
    },
    // Tab 切换（移动端）
    tabBar: {
      display: 'flex',
      background: colors.white,
      borderBottom: '2px solid ' + colors.gray100,
      position: 'sticky',
      top: 0,
      zIndex: 10,
    },
    tab: {
      flex: 1,
      padding: '12px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      border: 'none',
      background: 'transparent',
      transition: 'all 0.2s',
    },
    tabActive: {
      color: colors.primary,
      borderBottom: '2px solid ' + colors.primary,
      marginBottom: '-2px',
    },
    tabInactive: {
      color: colors.gray400,
    },
    emptyState: {
      textAlign: 'center',
      padding: '32px 16px',
      color: colors.gray400,
    },
    emptyIcon: {
      fontSize: '40px',
      marginBottom: '8px',
    },
  };

  // ========== 事件处理 ==========
  var handleCalculate = function () {
    var result = performCalculation();
    _customState.result = result;
    self.setCustomState({ result: result });
    self.utils.toast({ title: '计算完成', type: 'success' });
  };

  var handleSalaryChange = function (e) {
    _customState.monthlySalary = parseFloat(e.target.value) || 0;
  };

  var handleCityChange = function (e) {
    _customState.city = e.target.value;
  };

  var handleBonusChange = function (e) {
    _customState.bonusMonths = parseFloat(e.target.value) || 0;
  };

  var handleFundRatioChange = function (e) {
    _customState.fundRatioPercent = parseInt(e.target.value) || 12;
  };

  var handleBonusTaxChange = function (e) {
    _customState.bonusTaxMethod = e.target.value;
  };

  var handleSpecialDeductionChange = function (e) {
    _customState.specialDeduction = parseFloat(e.target.value) || 0;
  };

  var handleCustomInsuranceToggle = function () {
    _customState.customInsurance = !_customState.customInsurance;
    self.setCustomState({ customInsurance: _customState.customInsurance });
  };

  var handleCustomInsuranceChange = function (e) {
    _customState.customInsuranceAmount = parseFloat(e.target.value) || 0;
  };

  var handleCustomFundChange = function (e) {
    _customState.customFundAmount = parseFloat(e.target.value) || 0;
  };

  var handleTabChange = function (tab) {
    _customState.activeTab = tab;
    self.setCustomState({ activeTab: tab });
  };

  var handleToggleCompare = function (plan) {
    var idx = comparePlans.findIndex(function (p) { return p.formInstId === plan.formInstId; });
    var newPlans;
    if (idx >= 0) {
      newPlans = comparePlans.filter(function (p) { return p.formInstId !== plan.formInstId; });
    } else {
      if (comparePlans.length >= 3) {
        self.utils.toast({ title: '最多对比3个方案', type: 'warning' });
        return;
      }
      newPlans = comparePlans.concat([plan]);
    }
    _customState.comparePlans = newPlans;
    self.setCustomState({ comparePlans: newPlans });
  };

  var handleCopyResult = function () {
    if (!result) return;
    var text = '【智能薪酬计算结果】\n'
      + '城市：' + result.city + '\n'
      + '月薪(税前)：' + formatMoney(result.salary) + '元\n'
      + '月到手工资：' + formatMoney(result.avgMonthlyNet) + '元\n'
      + '年税前总收入：' + formatMoney(result.yearlyGross) + '元\n'
      + '年到手总收入：' + formatMoney(result.yearlyNet) + '元\n'
      + '年总个税：' + formatMoney(result.yearlyTotalTax) + '元\n'
      + '年五险一金：' + formatMoney(result.yearlyInsuranceFund) + '元\n';
    if (result.bonusGross > 0) {
      text += '年终奖(税前)：' + formatMoney(result.bonusGross) + '元\n'
        + '年终奖(到手)：' + formatMoney(result.bonusNet) + '元\n';
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () {
        self.utils.toast({ title: '已复制到剪贴板', type: 'success' });
      });
    } else {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      self.utils.toast({ title: '已复制到剪贴板', type: 'success' });
    }
  };

  // ========== 渲染环形图 ==========
  function renderDonutChart() {
    if (!result) return null;
    var netRatio = result.yearlyNet / result.yearlyGross;
    var taxRatio = result.yearlyTotalTax / result.yearlyGross;
    var insuranceRatio = result.yearlyInsuranceFund / result.yearlyGross;

    var netDeg = netRatio * 360;
    var taxDeg = taxRatio * 360;
    var insuranceDeg = insuranceRatio * 360;

    var gradientStr = 'conic-gradient('
      + colors.primary + ' 0deg ' + netDeg + 'deg, '
      + colors.orange + ' ' + netDeg + 'deg ' + (netDeg + taxDeg) + 'deg, '
      + colors.blue + ' ' + (netDeg + taxDeg) + 'deg 360deg)';

    return (
      <div style={styles.donutContainer}>
        <div style={Object.assign({}, styles.donutChart, { background: gradientStr })}>
          <div style={{
            position: 'absolute', top: '20%', left: '20%', right: '20%', bottom: '20%',
            background: colors.white, borderRadius: '50%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={styles.donutCenterLabel}>年到手</div>
            <div style={styles.donutCenterValue}>{formatMoneyShort(result.yearlyNet)}</div>
            <div style={{ fontSize: '11px', color: colors.primary, fontWeight: '600' }}>
              {(netRatio * 100).toFixed(1)}%
            </div>
          </div>
        </div>
        <div style={styles.legendList}>
          <div style={styles.legendItem}>
            <div style={Object.assign({}, styles.legendDot, { background: colors.primary })}></div>
            <span style={styles.legendLabel}>到手收入</span>
            <span style={styles.legendValue}>¥{formatMoney(result.yearlyNet)}</span>
          </div>
          <div style={styles.legendItem}>
            <div style={Object.assign({}, styles.legendDot, { background: colors.orange })}></div>
            <span style={styles.legendLabel}>个人所得税</span>
            <span style={styles.legendValue}>¥{formatMoney(result.yearlyTotalTax)}</span>
          </div>
          <div style={styles.legendItem}>
            <div style={Object.assign({}, styles.legendDot, { background: colors.blue })}></div>
            <span style={styles.legendLabel}>五险一金</span>
            <span style={styles.legendValue}>¥{formatMoney(result.yearlyInsuranceFund)}</span>
          </div>
          <div style={{ marginTop: '8px', padding: '8px 10px', background: colors.gray50, borderRadius: '8px', fontSize: '12px', color: colors.gray500 }}>
            税后收入占比 <span style={{ color: colors.primary, fontWeight: '700' }}>{(netRatio * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>
    );
  }

  // ========== 渲染柱状图（月度到手趋势）==========
  function renderBarChart() {
    if (!result || !result.monthlyDetails) return null;
    var details = result.monthlyDetails;
    var maxNet = Math.max.apply(null, details.map(function (d) { return d.netSalary; }));
    var maxHeight = 160;

    return (
      <div style={styles.barChartContainer}>
        {details.map(function (detail) {
          var barHeight = maxNet > 0 ? (detail.netSalary / maxNet) * maxHeight : 0;
          var barColor = detail.month <= 3 ? colors.primary
            : detail.month <= 6 ? '#34D399'
            : detail.month <= 9 ? colors.blue
            : colors.purple;
          return (
            <div key={detail.month} style={styles.barGroup}>
              <div style={styles.barValue}>{formatMoneyShort(detail.netSalary)}</div>
              <div style={Object.assign({}, styles.bar, {
                height: barHeight + 'px',
                background: 'linear-gradient(180deg, ' + barColor + ', ' + barColor + 'CC)',
              })}></div>
              <div style={styles.barLabel}>{detail.month}月</div>
            </div>
          );
        })}
      </div>
    );
  }

  // ========== 渲染瀑布图 ==========
  function renderWaterfallChart() {
    if (!result) return null;
    var items = [
      { label: '税前月薪', value: result.salary, color: colors.primary },
      { label: '五险', value: -result.insurance.insuranceOnly, color: colors.orange },
      { label: '公积金', value: -result.insurance.fund, color: colors.blue },
      { label: '个税', value: -result.avgMonthlyTax, color: colors.red },
      { label: '到手月薪', value: result.avgMonthlyNet, color: colors.primaryDark },
    ];
    var maxVal = result.salary;

    return (
      <div style={styles.waterfallContainer}>
        {items.map(function (item, index) {
          var absVal = Math.abs(item.value);
          var widthPercent = maxVal > 0 ? (absVal / maxVal) * 100 : 0;
          if (widthPercent < 8) widthPercent = 8;
          return (
            <div key={index} style={styles.waterfallBar}>
              <div style={styles.waterfallLabel}>{item.label}</div>
              <div style={Object.assign({}, styles.waterfallBarInner, {
                width: widthPercent + '%',
                background: 'linear-gradient(90deg, ' + item.color + ', ' + item.color + 'DD)',
              })}>
                {item.value < 0 ? '-' : ''}¥{formatMoney(absVal)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ========== 渲染输入面板 ==========
  function renderInputPanel() {
    return (
      <div style={styles.leftPanel}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <div style={Object.assign({}, styles.cardTitleIcon, { background: colors.primaryLight, color: colors.primaryDark })}>💰</div>
            薪资参数
          </div>

          <div style={styles.formGroup}>
            <div style={styles.formLabel}>月薪（税前）</div>
            <input
              id="salary-input"
              type="number"
              defaultValue={_customState.monthlySalary}
              onChange={handleSalaryChange}
              style={styles.formInput}
              placeholder="请输入税前月薪"
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formHalf}>
              <div style={styles.formGroup}>
                <div style={styles.formLabel}>城市</div>
                <select
                  defaultValue={_customState.city}
                  onChange={handleCityChange}
                  style={styles.formSelect}
                >
                  {CITY_LIST.map(function (c) {
                    return <option key={c} value={c}>{c}</option>;
                  })}
                </select>
              </div>
            </div>
            <div style={styles.formHalf}>
              <div style={styles.formGroup}>
                <div style={styles.formLabel}>年终奖（月数）</div>
                <input
                  id="bonus-input"
                  type="number"
                  defaultValue={_customState.bonusMonths}
                  onChange={handleBonusChange}
                  style={styles.formInput}
                  placeholder="如：2"
                />
              </div>
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formHalf}>
              <div style={styles.formGroup}>
                <div style={styles.formLabel}>公积金比例</div>
                <select
                  defaultValue={_customState.fundRatioPercent}
                  onChange={handleFundRatioChange}
                  style={styles.formSelect}
                >
                  {[5, 6, 7, 8, 9, 10, 11, 12].map(function (r) {
                    return <option key={r} value={r}>{r}%</option>;
                  })}
                </select>
              </div>
            </div>
            <div style={styles.formHalf}>
              <div style={styles.formGroup}>
                <div style={styles.formLabel}>年终奖计税</div>
                <select
                  defaultValue={_customState.bonusTaxMethod}
                  onChange={handleBonusTaxChange}
                  style={styles.formSelect}
                >
                  <option value="separate">单独计税</option>
                  <option value="combined">合并计税</option>
                </select>
              </div>
            </div>
          </div>

          <div style={styles.formGroup}>
            <div style={styles.formLabel}>专项附加扣除（月）</div>
            <input
              id="special-deduction-input"
              type="number"
              defaultValue={_customState.specialDeduction}
              onChange={handleSpecialDeductionChange}
              style={styles.formInput}
              placeholder="子女教育、房贷利息等"
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={styles.checkboxLabel} onClick={handleCustomInsuranceToggle}>
              <input type="checkbox" checked={_customState.customInsurance} readOnly style={{ accentColor: colors.primary }} />
              自定义五险一金金额
            </label>
          </div>

          {_customState.customInsurance && (
            <div style={styles.formRow}>
              <div style={styles.formHalf}>
                <div style={styles.formGroup}>
                  <div style={styles.formLabel}>五险（月）</div>
                  <input
                    id="custom-insurance-input"
                    type="number"
                    defaultValue={_customState.customInsuranceAmount}
                    onChange={handleCustomInsuranceChange}
                    style={styles.formInput}
                  />
                </div>
              </div>
              <div style={styles.formHalf}>
                <div style={styles.formGroup}>
                  <div style={styles.formLabel}>公积金（月）</div>
                  <input
                    id="custom-fund-input"
                    type="number"
                    defaultValue={_customState.customFundAmount}
                    onChange={handleCustomFundChange}
                    style={styles.formInput}
                  />
                </div>
              </div>
            </div>
          )}

          <button style={styles.calculateBtn} onClick={handleCalculate}>
            🚀 立即计算
          </button>
        </div>

        {/* 保存方案区域 */}
        <div style={styles.saveSection}>
          <input
            id="salary-plan-name"
            type="text"
            defaultValue=""
            placeholder="方案名称（可选）"
            style={styles.saveInput}
          />
          <button
            style={Object.assign({}, styles.actionBtn, styles.primaryBtn, { whiteSpace: 'nowrap' })}
            onClick={function () { self.savePlan(); }}
            disabled={_customState.saving}
          >
            {_customState.saving ? '⏳' : '💾'} {_customState.saving ? '保存中...' : '保存方案'}
          </button>
        </div>

        {/* 快捷操作 */}
        <div style={Object.assign({}, styles.card, { marginTop: '16px' })}>
          <div style={styles.cardTitle}>
            <div style={Object.assign({}, styles.cardTitleIcon, { background: '#EDE9FE', color: colors.purple })}>📋</div>
            快捷操作
          </div>
          <div style={styles.actionBar}>
            <button
              style={Object.assign({}, styles.actionBtn, styles.secondaryBtn)}
              onClick={handleCopyResult}
            >
              📋 复制结果
            </button>
            <button
              style={Object.assign({}, styles.actionBtn, styles.secondaryBtn)}
              onClick={function () {
                _customState.showHistory = !_customState.showHistory;
                self.setCustomState({ showHistory: _customState.showHistory });
              }}
            >
              📂 {showHistory ? '收起历史' : '历史方案'}
            </button>
            <button
              style={Object.assign({}, styles.actionBtn, styles.secondaryBtn)}
              onClick={function () {
                _customState.showCompare = !_customState.showCompare;
                self.setCustomState({ showCompare: _customState.showCompare });
              }}
            >
              📊 {showCompare ? '收起对比' : '方案对比'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== 渲染结果面板 ==========
  function renderResultPanel() {
    if (!result) {
      return (
        <div style={styles.rightPanel}>
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📊</div>
            <div>请输入薪资参数并点击计算</div>
          </div>
        </div>
      );
    }

    return (
      <div style={styles.rightPanel}>
        {/* 4宫格核心指标 */}
        <div style={styles.metricsGrid}>
          <div style={Object.assign({}, styles.metricCard, {
            background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
            border: '1px solid #A7F3D0',
          })}>
            <div style={Object.assign({}, styles.metricLabel, { color: colors.primaryDark })}>月到手工资</div>
            <div style={Object.assign({}, styles.metricValue, { color: colors.primaryDark })}>
              ¥{formatMoney(result.avgMonthlyNet)}
            </div>
            <div style={Object.assign({}, styles.metricUnit, { color: colors.primary })}>元/月</div>
          </div>
          <div style={Object.assign({}, styles.metricCard, {
            background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
            border: '1px solid #FCD34D',
          })}>
            <div style={Object.assign({}, styles.metricLabel, { color: '#92400E' })}>年到手总收入</div>
            <div style={Object.assign({}, styles.metricValue, { color: '#92400E' })}>
              ¥{formatMoneyShort(result.yearlyNet)}
            </div>
            <div style={Object.assign({}, styles.metricUnit, { color: '#B45309' })}>元/年</div>
          </div>
          <div style={Object.assign({}, styles.metricCard, {
            background: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)',
            border: '1px solid #C4B5FD',
          })}>
            <div style={Object.assign({}, styles.metricLabel, { color: '#5B21B6' })}>年总个税</div>
            <div style={Object.assign({}, styles.metricValue, { color: '#5B21B6' })}>
              ¥{formatMoneyShort(result.yearlyTotalTax)}
            </div>
            <div style={Object.assign({}, styles.metricUnit, { color: '#7C3AED' })}>元/年</div>
          </div>
          <div style={Object.assign({}, styles.metricCard, {
            background: 'linear-gradient(135deg, #DBEAFE, #BFDBFE)',
            border: '1px solid #93C5FD',
          })}>
            <div style={Object.assign({}, styles.metricLabel, { color: '#1E40AF' })}>年五险一金</div>
            <div style={Object.assign({}, styles.metricValue, { color: '#1E40AF' })}>
              ¥{formatMoneyShort(result.yearlyInsuranceFund)}
            </div>
            <div style={Object.assign({}, styles.metricUnit, { color: '#2563EB' })}>元/年</div>
          </div>
        </div>

        {/* 年终奖信息卡片 */}
        {result.bonusGross > 0 && (
          <div style={Object.assign({}, styles.card, {
            background: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)',
            border: '1px solid #FED7AA',
          })}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#9A3412', fontWeight: '600' }}>🎁 年终奖（{result.bonusTaxMethod === 'separate' ? '单独计税' : '合并计税'}）</div>
                <div style={{ fontSize: '12px', color: '#C2410C', marginTop: '4px' }}>
                  税前 ¥{formatMoney(result.bonusGross)} → 个税 ¥{formatMoney(result.bonusTax)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#9A3412' }}>到手</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#9A3412', fontFamily: '"SF Mono", monospace' }}>
                  ¥{formatMoney(result.bonusNet)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 收入结构环形图 */}
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>
            <span>🍩</span> 年收入结构分析
          </div>
          {renderDonutChart()}
        </div>

        {/* 月度到手趋势柱状图 */}
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>
            <span>📊</span> 月度到手工资趋势
          </div>
          {renderBarChart()}
          <div style={{ marginTop: '8px', fontSize: '11px', color: colors.gray400, textAlign: 'center' }}>
            因个税累进税率，前几个月到手更多，后几个月个税增加
          </div>
        </div>

        {/* 薪资瀑布图 */}
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>
            <span>🏗️</span> 月薪构成瀑布图
          </div>
          {renderWaterfallChart()}
        </div>

        {/* 五险一金明细 */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <div style={Object.assign({}, styles.cardTitleIcon, { background: '#DBEAFE', color: colors.blue })}>🏥</div>
            五险一金明细（月）
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { label: '养老保险', value: result.insurance.pension, color: colors.primary },
              { label: '医疗保险', value: result.insurance.medical, color: colors.blue },
              { label: '失业保险', value: result.insurance.unemployment, color: colors.purple },
              { label: '住房公积金', value: result.insurance.fund, color: colors.orange },
            ].map(function (item, index) {
              return (
                <div key={index} style={{
                  padding: '10px 12px',
                  background: colors.gray50,
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: '12px', color: colors.gray600 }}>{item.label}</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: item.color, fontFamily: '"SF Mono", monospace' }}>
                    ¥{formatMoney(item.value)}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{
            marginTop: '10px',
            padding: '10px 12px',
            background: colors.primaryBg,
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid ' + colors.primaryLight,
          }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: colors.primaryDark }}>合计（月）</span>
            <span style={{ fontSize: '16px', fontWeight: '800', color: colors.primaryDark, fontFamily: '"SF Mono", monospace' }}>
              ¥{formatMoney(result.insurance.total)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ========== 渲染历史方案 ==========
  function renderHistoryPanel() {
    if (!showHistory) return null;
    return (
      <div style={Object.assign({}, styles.card, { marginTop: '16px' })}>
        <div style={styles.cardTitle}>
          <div style={Object.assign({}, styles.cardTitleIcon, { background: '#FEF3C7', color: '#B45309' })}>📂</div>
          历史方案
          {_customState.loading && <span style={{ fontSize: '12px', color: colors.gray400 }}>加载中...</span>}
        </div>
        {savedPlans.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <div>暂无保存的方案</div>
          </div>
        ) : (
          savedPlans.map(function (plan) {
            var isSelected = comparePlans.some(function (p) { return p.formInstId === plan.formInstId; });
            return (
              <div key={plan.formInstId} style={Object.assign({}, styles.planItem, isSelected ? { border: '1.5px solid ' + colors.primary, background: colors.primaryBg } : {})}>
                <div style={styles.planInfo}>
                  <div style={styles.planName}>{plan.name}</div>
                  <div style={styles.planMeta}>
                    {plan.city} · 月薪¥{formatMoney(plan.monthlySalary)} · 年到手¥{formatMoneyShort(plan.yearlyNet)}
                  </div>
                </div>
                <div style={styles.planActions}>
                  {showCompare && (
                    <button
                      style={Object.assign({}, styles.smallBtn, isSelected
                        ? { background: colors.primary, color: colors.white }
                        : { background: colors.gray100, color: colors.gray600 })}
                      onClick={function () { handleToggleCompare(plan); }}
                    >
                      {isSelected ? '✓ 已选' : '对比'}
                    </button>
                  )}
                  <button
                    style={Object.assign({}, styles.smallBtn, { background: '#FEF2F2', color: colors.red })}
                    onClick={function () { self.deletePlan(plan.formInstId); }}
                  >
                    删除
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  }

  // ========== 渲染方案对比 ==========
  function renderComparePanel() {
    if (!showCompare || comparePlans.length < 2) {
      if (showCompare) {
        return (
          <div style={Object.assign({}, styles.card, { marginTop: '16px' })}>
            <div style={styles.cardTitle}>
              <div style={Object.assign({}, styles.cardTitleIcon, { background: '#FCE7F3', color: colors.pink })}>📊</div>
              方案对比
            </div>
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📊</div>
              <div>请在历史方案中选择至少2个方案进行对比</div>
            </div>
          </div>
        );
      }
      return null;
    }

    return (
      <div style={Object.assign({}, styles.card, { marginTop: '16px', overflowX: 'auto' })}>
        <div style={styles.cardTitle}>
          <div style={Object.assign({}, styles.cardTitleIcon, { background: '#FCE7F3', color: colors.pink })}>📊</div>
          方案对比
        </div>
        <table style={styles.compareTable}>
          <thead>
            <tr>
              <th style={styles.compareTh}>指标</th>
              {comparePlans.map(function (plan) {
                return <th key={plan.formInstId} style={styles.compareTh}>{plan.name}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {[
              { label: '城市', key: 'city', format: false },
              { label: '月薪', key: 'monthlySalary', format: true },
              { label: '月到手', key: 'monthlyNet', format: true },
              { label: '年税前', key: 'yearlyGross', format: true },
              { label: '年到手', key: 'yearlyNet', format: true },
              { label: '年个税', key: 'yearlyTax', format: true },
            ].map(function (row) {
              var values = comparePlans.map(function (p) { return p[row.key]; });
              var maxVal = row.format ? Math.max.apply(null, values) : 0;
              return (
                <tr key={row.key}>
                  <td style={Object.assign({}, styles.compareTd, { fontWeight: '600', color: colors.gray700 })}>{row.label}</td>
                  {comparePlans.map(function (plan) {
                    var val = plan[row.key];
                    var isMax = row.format && val === maxVal && comparePlans.length > 1;
                    return (
                      <td key={plan.formInstId} style={Object.assign({}, styles.compareTd, {
                        fontFamily: row.format ? '"SF Mono", monospace' : 'inherit',
                        fontWeight: isMax ? '700' : '400',
                        color: isMax ? colors.primary : colors.gray700,
                      })}>
                        {row.format ? '¥' + formatMoney(val) : val}
                        {isMax && ' 👑'}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // ========== 主渲染 ==========
  return (
    <div style={styles.page}>
      <div style={{ display: 'none' }}>{timestamp}</div>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerPattern}></div>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <div style={styles.logoIcon}>💰</div>
            <div>
              <div style={styles.headerTitle}>智能薪酬</div>
              <div style={styles.headerSubtitle}>专业薪资结构分析 · 精准计算到手收入</div>
            </div>
          </div>
          <div style={styles.headerActions}>
            <button style={styles.headerBtn} onClick={handleCopyResult}>📋 复制</button>
            <button style={styles.headerBtn} onClick={function () { self.savePlan(); }}>💾 保存</button>
          </div>
        </div>
      </div>

      {/* 移动端 Tab 切换 */}
      {isMobile && (
        <div style={styles.tabBar}>
          <button
            style={Object.assign({}, styles.tab, activeTab === 'input' ? styles.tabActive : styles.tabInactive)}
            onClick={function () { handleTabChange('input'); }}
          >
            ⚙️ 参数设置
          </button>
          <button
            style={Object.assign({}, styles.tab, activeTab === 'result' ? styles.tabActive : styles.tabInactive)}
            onClick={function () { handleTabChange('result'); }}
          >
            📊 计算结果
          </button>
        </div>
      )}

      {/* 主体布局 */}
      <div style={styles.mainLayout}>
        {(!isMobile || activeTab === 'input') && renderInputPanel()}
        {(!isMobile || activeTab === 'result') && renderResultPanel()}
      </div>

      {/* 历史方案 & 对比（PC端在底部，移动端在输入tab下） */}
      {(!isMobile || activeTab === 'input') && (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '0 16px 16px' : '0 24px 24px' }}>
          {renderHistoryPanel()}
          {renderComparePanel()}
        </div>
      )}

      {/* 底部 */}
      <div style={{
        textAlign: 'center',
        padding: '20px',
        fontSize: '12px',
        color: colors.gray400,
        borderTop: '1px solid ' + colors.gray100,
        background: colors.white,
      }}>
        智能薪酬 · 仁励家风格 · 基于2024年最新个税政策 · 数据仅供参考
      </div>
    </div>
  );
}
