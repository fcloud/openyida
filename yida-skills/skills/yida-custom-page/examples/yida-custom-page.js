// ============================================================
// 状态管理
// ============================================================

// 定义 _customState 变量
const _customState = {
  // 在此定义所有业务状态的初始值
  count: 0,
  loading: false,
};

/**
 * 获取状态
 * @param {string} [key] - 传入 key 返回单个值，不传返回全部状态的浅拷贝
 */
export function getCustomState(key) {
  if (key) {
    return _customState[key];
  }
  return { ..._customState };
}

/**
 * 设置状态（合并更新，自动触发重新渲染）
 * @param {Object} newState - 需要更新的状态键值对
 */
export function setCustomState(newState) {
  Object.keys(newState).forEach(function(key) {
    _customState[key] = newState[key];
  });
  this.forceUpdate();
}

/**
 * 强制重新渲染（通过更新 timestamp 触发 React 重渲染）
 */
export function forceUpdate() {
  this.setState({ timestamp: new Date().getTime() });
}

// ============================================================
// 生命周期
// ============================================================

/**
 * 组件挂载到 DOM 后（等同于 componentDidMount）
 * 用于：初始化数据、启动定时器、绑定事件等
 */
export function didMount() {
  // 初始化逻辑
}

/**
 * 页面卸载时调用
 * 用于：清理定时器、解绑事件、释放资源等
 */
export function didUnmount() {
  // 清理逻辑
}

export function handleSubmit(e) {
  this.setCustomState({ submitted: true });
  this.utils.toast({ title: '提交成功', type: 'success' });
}
// ============================================================
// 渲染
// ============================================================

/**
 * 页面渲染函数（等同于 React 类组件的 render 方法）
 * 注意：必须包含隐藏的 timestamp div 以支持 forceUpdate 机制
 * 
 */
// ⚠️ **关键约束：`renderJsx` 的每个 `return` 分支都必须包含 `<div style={{ display: 'none' }}>{this.state.timestamp}</div>`**，否则 `forceUpdate` 调用 `this.setState({ timestamp })` 后，React 无法检测到输出变化，`renderJsx` 不会被重新执行，页面将无法更新。这是宜搭渲染引擎触发重渲染的核心机制。
export function renderJsx() {
  const { timestamp } = this.state;

  return (
    <div>
      {/* 必须保留：用于触发重新渲染 */}
      <div style={{ display: "none" }}>{timestamp}</div>

      {/* 页面内容写在这里 */}
      <div onClick={(e) => { this.handleSubmit(e) }}>提交</div>
    </div>
  );
}