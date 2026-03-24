#!/usr/bin/env python3
"""
钉钉流程查询脚本

用于查询用户的待办事项和待审批流程，并合并显示。
此脚本需要配合 dws 技能使用。
"""

import json
from typing import List, Dict, Any


def format_flow_item(item: Dict[str, Any], index: int, flow_type: str) -> str:
    """
    格式化单个流程项的显示文本
    
    Args:
        item: 流程项数据字典
        index: 序号
        flow_type: 流程类型（待办/待审批）
    
    Returns:
        格式化后的显示文本
    """
    title = item.get('title', '无标题')
    initiator = item.get('initiator', '未知')
    create_time = item.get('create_time', '')
    flow_id = item.get('flow_id', '')
    
    return f"{index}. [{title}] - {initiator} - {create_time} (ID: {flow_id}, 类型：{flow_type})"


def merge_and_sort_flows(todo_items: List[Dict], approval_items: List[Dict]) -> List[Dict]:
    """
    合并待办和待审批流程，并按时间排序
    
    Args:
        todo_items: 待办事项列表
        approval_items: 待审批流程列表
    
    Returns:
        合并并排序后的流程列表
    """
    merged = []
    
    # 标记来源类型
    for item in todo_items:
        item['_flow_type'] = '待办事项'
        merged.append(item)
    
    for item in approval_items:
        item['_flow_type'] = '待审批'
        merged.append(item)
    
    # 按创建时间倒序排序（最新的在前）
    merged.sort(key=lambda x: x.get('create_time', ''), reverse=True)
    
    return merged


def parse_user_command(command: str, total_flows: int) -> Dict[str, Any]:
    """
    解析用户的自然语言指令
    
    Args:
        command: 用户指令，如"第二个，同意"、"第一个 拒绝"
        total_flows: 总流程数，用于验证序号有效性
    
    Returns:
        解析结果字典，包含 index, action, comment 等字段
    """
    import re
    
    # 匹配序号
    index_match = re.search(r'(?:第？)(\d+)(?:个)?', command)
    if not index_match:
        return {'error': '未找到有效序号'}
    
    index = int(index_match.group(1))
    
    # 验证序号范围
    if index< 1 or index > total_flows:
        return {'error': f'序号超出范围，请输入 1-{total_flows} 之间的数字'}
    
    # 匹配操作类型
    approve_keywords = ['同意', '通过', '批准', 'ok', '好的', '可以']
    reject_keywords = ['拒绝', '驳回', '不通过', '否决']
    
    action = None
    for keyword in approve_keywords:
        if keyword in command.lower():
            action = 'approve'
            break
    
    if not action:
        for keyword in reject_keywords:
            if keyword in command:
                action = 'reject'
                break
    
    if not action:
        return {'error': '未找到有效操作（同意/拒绝）'}
    
    # 提取备注信息（操作词之后的内容）
    comment = ''
    action_index = max(command.find('同意'), command.find('拒绝'), 
                       command.find('通过'), command.find('驳回'))
    if action_index != -1 and action_index < len(command) - 2:
        comment = command[action_index + 2:].strip('，, .')
    
    return {
        'index': index,
        'action': action,
        'comment': comment
    }


if __name__ == '__main__':
    # 测试示例
    print("钉钉流程管理脚本 - 测试模式")
    print("=" * 50)
    
    # 测试指令解析
    test_commands = [
        "第二个，同意",
        "第一个 拒绝",
        "同意第三个",
        "拒绝 第二个，需要补充材料",
    ]
    
    for cmd in test_commands:
        result = parse_user_command(cmd, 5)
        print(f"指令：'{cmd}' => {result}")
