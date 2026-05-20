'use client';

import { useState, useEffect } from 'react';
import { Edge } from '@xyflow/react';
import {
  WorkflowConditionOperator,
  WorkflowConditionLogicalOperator,
} from '@project33/shared';

interface FormField {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  options?: { label: string; value: string }[];
}

interface ConditionRule {
  id: string;
  fieldName: string;
  operator: WorkflowConditionOperator;
  value: string;
  logicalOperator: WorkflowConditionLogicalOperator;
}

interface EdgeConfigPanelProps {
  edge: Edge;
  onUpdate: (edgeId: string, data: { conditionExpression?: string; priority?: number }) => void;
  onClose: () => void;
}

const formFields: FormField[] = [
  { name: 'amount', label: '申请金额', type: 'number' },
  { name: 'days', label: '请假天数', type: 'number' },
  { name: 'department', label: '所属部门', type: 'select', options: [
    { label: '技术部', value: 'tech' },
    { label: '财务部', value: 'finance' },
    { label: '人事部', value: 'hr' },
  ]},
  { name: 'level', label: '紧急程度', type: 'select', options: [
    { label: '普通', value: 'normal' },
    { label: '紧急', value: 'urgent' },
    { label: '非常紧急', value: 'critical' },
  ]},
  { name: 'projectType', label: '项目类型', type: 'string' },
  { name: 'isOverseas', label: '是否境外', type: 'boolean' },
];

const operatorLabels: Record<WorkflowConditionOperator, string> = {
  [WorkflowConditionOperator.EQUALS]: '等于',
  [WorkflowConditionOperator.NOT_EQUALS]: '不等于',
  [WorkflowConditionOperator.GREATER_THAN]: '大于',
  [WorkflowConditionOperator.LESS_THAN]: '小于',
  [WorkflowConditionOperator.GREATER_THAN_OR_EQUALS]: '大于等于',
  [WorkflowConditionOperator.LESS_THAN_OR_EQUALS]: '小于等于',
  [WorkflowConditionOperator.CONTAINS]: '包含',
  [WorkflowConditionOperator.NOT_CONTAINS]: '不包含',
  [WorkflowConditionOperator.IS_EMPTY]: '为空',
  [WorkflowConditionOperator.IS_NOT_EMPTY]: '不为空',
};

const numberOperators = [
  WorkflowConditionOperator.EQUALS,
  WorkflowConditionOperator.NOT_EQUALS,
  WorkflowConditionOperator.GREATER_THAN,
  WorkflowConditionOperator.LESS_THAN,
  WorkflowConditionOperator.GREATER_THAN_OR_EQUALS,
  WorkflowConditionOperator.LESS_THAN_OR_EQUALS,
];

const stringOperators = [
  WorkflowConditionOperator.EQUALS,
  WorkflowConditionOperator.NOT_EQUALS,
  WorkflowConditionOperator.CONTAINS,
  WorkflowConditionOperator.NOT_CONTAINS,
  WorkflowConditionOperator.IS_EMPTY,
  WorkflowConditionOperator.IS_NOT_EMPTY,
];

const booleanOperators = [
  WorkflowConditionOperator.EQUALS,
  WorkflowConditionOperator.NOT_EQUALS,
];

export default function EdgeConfigPanel({ edge, onUpdate, onClose }: EdgeConfigPanelProps) {
  const [priority, setPriority] = useState((edge.data as any)?.priority || 0);
  const [rules, setRules] = useState<ConditionRule[]>([]);
  const [expression, setExpression] = useState(edge.label as string || '');

  useEffect(() => {
    const savedRules = (edge.data as any)?.rules;
    if (savedRules) {
      setRules(savedRules);
    }
  }, [edge.id]);

  const addRule = () => {
    const newRule: ConditionRule = {
      id: `rule-${Date.now()}`,
      fieldName: 'amount',
      operator: WorkflowConditionOperator.GREATER_THAN,
      value: '',
      logicalOperator: WorkflowConditionLogicalOperator.AND,
    };
    setRules([...rules, newRule]);
    generateExpression([...rules, newRule]);
  };

  const removeRule = (ruleId: string) => {
    const newRules = rules.filter(r => r.id !== ruleId);
    setRules(newRules);
    generateExpression(newRules);
  };

  const updateRule = (ruleId: string, field: keyof ConditionRule, value: any) => {
    const newRules = rules.map(r => 
      r.id === ruleId ? { ...r, [field]: value } : r
    );
    setRules(newRules);
    generateExpression(newRules);
  };

  const generateExpression = (currentRules: ConditionRule[]) => {
    if (currentRules.length === 0) {
      setExpression('');
      return;
    }

    const parts = currentRules.map((rule, index) => {
      const field = formFields.find(f => f.name === rule.fieldName);
      const fieldLabel = field?.label || rule.fieldName;
      const opLabel = operatorLabels[rule.operator];
      
      let prefix = '';
      if (index > 0) {
        prefix = rule.logicalOperator === WorkflowConditionLogicalOperator.AND ? ' 且 ' : ' 或 ';
      }
      
      if ([WorkflowConditionOperator.IS_EMPTY, WorkflowConditionOperator.IS_NOT_EMPTY].includes(rule.operator)) {
        return `${prefix}[${fieldLabel}] ${opLabel}`;
      }
      return `${prefix}[${fieldLabel}] ${opLabel} ${rule.value}`;
    });

    const expr = parts.join('');
    setExpression(expr);
    onUpdate(edge.id, { conditionExpression: expr });
  };

  const getOperatorsForField = (fieldName: string): WorkflowConditionOperator[] => {
    const field = formFields.find(f => f.name === fieldName);
    if (!field) return stringOperators;
    
    switch (field.type) {
      case 'number':
        return numberOperators;
      case 'boolean':
        return booleanOperators;
      default:
        return stringOperators;
    }
  };

  const handlePriorityChange = (newPriority: number) => {
    setPriority(newPriority);
    onUpdate(edge.id, { priority: newPriority, conditionExpression: expression });
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">连接线配置</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mb-4 p-3 bg-purple-50 rounded-lg">
        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
          条件分支连接线
        </span>
        <span className="text-xs text-gray-500 ml-2">ID: {edge.id}</span>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            分支优先级
            <span className="text-xs text-gray-400 ml-2">（数值越大优先级越高）</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="100"
              value={priority}
              onChange={(e) => handlePriorityChange(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="w-10 text-center font-mono text-sm font-bold text-purple-600">
              {priority}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>低</span>
            <span>高</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              条件判断规则
            </label>
            <button
              onClick={addRule}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              + 添加条件
            </button>
          </div>

          {rules.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-500">默认分支（无判断条件）</p>
              <p className="text-xs text-gray-400 mt-1">点击上方按钮添加条件规则</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule, index) => (
                <div key={rule.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">
                      条件 {index + 1}
                    </span>
                    <button
                      onClick={() => removeRule(rule.id)}
                      className="text-xs text-red-500 hover:text-red-600"
                    >
                      删除
                    </button>
                  </div>

                  {index > 0 && (
                    <div className="mb-2">
                      <select
                        value={rule.logicalOperator}
                        onChange={(e) => updateRule(rule.id, 'logicalOperator', e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded bg-white"
                      >
                        <option value={WorkflowConditionLogicalOperator.AND}>并且 (AND)</option>
                        <option value={WorkflowConditionLogicalOperator.OR}>或者 (OR)</option>
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <select
                      value={rule.fieldName}
                      onChange={(e) => updateRule(rule.id, 'fieldName', e.target.value)}
                      className="px-2 py-1.5 text-sm border border-gray-300 rounded bg-white"
                    >
                      {formFields.map(field => (
                        <option key={field.name} value={field.name}>
                          {field.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={rule.operator}
                      onChange={(e) => updateRule(rule.id, 'operator', e.target.value)}
                      className="px-2 py-1.5 text-sm border border-gray-300 rounded bg-white"
                    >
                      {getOperatorsForField(rule.fieldName).map(op => (
                        <option key={op} value={op}>
                          {operatorLabels[op]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {![WorkflowConditionOperator.IS_EMPTY, WorkflowConditionOperator.IS_NOT_EMPTY].includes(rule.operator) && (
                    <input
                      type="text"
                      value={rule.value}
                      onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                      placeholder="输入比较值..."
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            生成的条件表达式
          </label>
          <div className="p-3 bg-gray-900 rounded-lg">
            <code className="text-sm text-green-400 font-mono break-all">
              {expression || '(默认分支，无判断条件)'}
            </code>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            此表达式将在流程流转时进行判断，满足条件则进入此分支
          </p>
        </div>
      </div>
    </div>
  );
}
