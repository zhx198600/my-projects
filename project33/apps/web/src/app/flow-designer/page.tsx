'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  Handle,
  Position,
  NodeProps,
  useReactFlow,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './styles.css';
import api, { workflowApi, formApi } from '@/lib/api';
import {
  WorkflowDefinition,
  SaveWorkflowDiagramDto,
  ApiResponse,
  WorkflowValidationResult,
  WorkflowValidationIssue,
  WorkflowNodeType,
  WorkflowStatus,
  WorkflowVersion,
  FormDefinition,
  FieldPermissionType,
} from '@project33/shared';
import EdgeConfigPanel from '@/components/EdgeConfigPanel';
import WorkflowValidationPanel from '@/components/WorkflowValidationPanel';
import { Layout, Card, Button, Input, Select, Tag, Space, Typography, Divider, Modal } from 'antd';

const { Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

interface NodeConfigData {
  name: string;
  description?: string;
  assigneeType?: string;
  timeout?: string;
  [key: string]: any;
}

function StartNode({ data, selected }: NodeProps) {
  return (
    <div className={`react-flow-node-start ${selected ? 'selected' : ''}`}>
      <Handle type="source" position={Position.Right} />
      <div className="node-flex-row">
        <svg className="svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{(data as NodeConfigData).name || '开始'}</span>
      </div>
    </div>
  );
}

function EndNode({ data, selected }: NodeProps) {
  return (
    <div className={`react-flow-node-end ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} />
      <div className="node-flex-row">
        <svg className="svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        </svg>
        <span>{(data as NodeConfigData).name || '结束'}</span>
      </div>
    </div>
  );
}

function ApprovalNode({ data, selected }: NodeProps) {
  return (
    <div className={`react-flow-node-approval ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Left} />
      <div style={{ padding: '16px 20px' }}>
        <div className="node-flex-row" style={{ marginBottom: '4px' }}>
          <svg className="svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span style={{ fontWeight: 'bold' }}>{(data as NodeConfigData).name || '审批节点'}</span>
        </div>
        {(data as NodeConfigData).description && (
          <p className="node-description">{(data as NodeConfigData).description}</p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

function ConditionNode({ data, selected }: NodeProps) {
  return (
    <div className={`react-flow-node-condition ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Left} />
      <div className="node-content">
        <div className="condition-node-content">
          <svg className="svg-icon-lg" style={{ marginBottom: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '12px', lineHeight: '1.2' }}>{(data as NodeConfigData).name || '条件分支'}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

function SerialNode({ data, selected }: NodeProps) {
  return (
    <div className={`react-flow-node-serial ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} />
      <div style={{ padding: '12px 16px' }}>
        <div className="node-flex-row">
          <svg className="svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{(data as NodeConfigData).name || '串行节点'}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = {
  start: StartNode,
  end: EndNode,
  approval: ApprovalNode,
  condition: ConditionNode,
  serial: SerialNode,
};

const nodeConfigs = [
  { type: 'start', label: '开始节点', bgColors: ['#22c55e', '#16a34a'], icon: '▶' },
  { type: 'end', label: '结束节点', bgColors: ['#ef4444', '#dc2626'], icon: '■' },
  { type: 'approval', label: '审批节点', bgColors: ['#3b82f6', '#2563eb'], icon: '✓' },
  { type: 'condition', label: '条件分支', bgColors: ['#eab308', '#ca8a04'], icon: '?' },
  { type: 'serial', label: '串行节点', bgColors: ['#a855f7', '#9333ea'], icon: '→' },
];

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'start',
    position: { x: 100, y: 200 },
    data: { name: '开始', description: '流程开始' },
  },
  {
    id: '2',
    type: 'approval',
    position: { x: 350, y: 200 },
    data: { name: '部门经理审批', description: '需要部门经理审核通过' },
  },
  {
    id: '3',
    type: 'condition',
    position: { x: 600, y: 200 },
    data: { name: '金额判断', description: '判断申请金额是否大于10000' },
  },
  {
    id: '4',
    type: 'approval',
    position: { x: 850, y: 100 },
    data: { name: '总经理审批', description: '大额申请需总经理审批' },
  },
  {
    id: '5',
    type: 'end',
    position: { x: 1100, y: 200 },
    data: { name: '结束', description: '流程结束' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e3-4', source: '3', target: '4', label: '>10000', data: { priority: 10 }, style: { strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e3-5', source: '3', target: '5', label: '≤10000', data: { priority: 0 }, style: { strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e4-5', source: '4', target: '5', style: { strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed } },
];

let nodeId = 10;
const getId = () => `${nodeId++}`;

function FlowDesignerContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string>('');
  const [workflowName, setWorkflowName] = useState('新建审批流程');
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [validationResult, setValidationResult] = useState<WorkflowValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showValidationPanel, setShowValidationPanel] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [workflowVersions, setWorkflowVersions] = useState<WorkflowVersion[]>([]);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<WorkflowVersion | null>(null);
  const [showVersionDetailModal, setShowVersionDetailModal] = useState(false);
  const [publishChangeLog, setPublishChangeLog] = useState('');
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>('');
  const [nodeFieldPermissions, setNodeFieldPermissions] = useState<Record<string, { fieldName: string; permission: FieldPermissionType }[]>>({});
  
  const { screenToFlowPosition } = useReactFlow();

  useEffect(() => {
    loadWorkflows();
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const response = await formApi.findAll();
      if (response.data.success && response.data.data) {
        setForms(response.data.data);
      }
    } catch (error) {
      console.error('加载表单列表失败:', error);
    }
  };

  useEffect(() => {
    if (selectedNode) {
      const node = nodes.find(n => n.id === selectedNode.id);
      if (node) setSelectedNode(node);
    }
  }, [nodes, selectedNode?.id]);

  const loadWorkflows = async () => {
    try {
      const response = await api.get<ApiResponse<WorkflowDefinition[]>>('/workflows');
      if (response.data.success && response.data.data) {
        setWorkflows(response.data.data);
      }
    } catch (error) {
      console.error('加载流程列表失败:', error);
    }
  };

  const loadWorkflow = async (id: string) => {
    try {
      const response = await workflowApi.getWorkflowWithForm(id);
      if (response.data.success && response.data.data) {
        const workflow = response.data.data;
        setCurrentWorkflowId(workflow.id);
        setWorkflowName(workflow.name);
        setSelectedFormId(workflow.formId || '');
        
        const permissions: Record<string, { fieldName: string; permission: FieldPermissionType }[]> = {};
        workflow.nodes.forEach((node: any) => {
          if (node.fieldPermissions) {
            permissions[node.id] = node.fieldPermissions;
          }
        });
        setNodeFieldPermissions(permissions);
        
        const loadedNodes: Node[] = workflow.nodes.map((node: any) => ({
          id: node.id,
          type: node.type.toLowerCase(),
          position: { x: node.x, y: node.y },
          data: {
            name: node.name,
            description: node.properties?.description,
            ...node.properties,
          },
        }));
        
        const loadedEdges: Edge[] = workflow.edges.map((edge: any) => ({
          id: edge.id,
          source: edge.sourceId,
          target: edge.targetId,
          label: edge.conditionExpression,
          data: { priority: edge.priority },
          animated: true,
          style: { strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed },
        }));
        
        setNodes(loadedNodes);
        setEdges(loadedEdges);
        setValidationResult(null);
      }
    } catch (error) {
      console.error('加载流程失败:', error);
    }
  };

  const bindWorkflowForm = async (formId: string) => {
    if (!currentWorkflowId) {
      alert('请先保存流程后再关联表单');
      return;
    }
    try {
      const response = await workflowApi.bindForm(currentWorkflowId, formId);
      if (response.data.success) {
        setSelectedFormId(formId);
        alert('表单关联成功');
      }
    } catch (error) {
      console.error('关联表单失败:', error);
      alert('关联表单失败');
    }
  };

  const updateFieldPermission = async (nodeId: string, fieldName: string, permission: FieldPermissionType) => {
    if (!currentWorkflowId) return;
    
    const currentPermissions = nodeFieldPermissions[nodeId] || [];
    const existingIndex = currentPermissions.findIndex(p => p.fieldName === fieldName);
    
    let newPermissions: { fieldName: string; permission: FieldPermissionType }[];
    if (existingIndex >= 0) {
      newPermissions = [...currentPermissions];
      newPermissions[existingIndex] = { fieldName, permission };
    } else {
      newPermissions = [...currentPermissions, { fieldName, permission }];
    }
    
    setNodeFieldPermissions({
      ...nodeFieldPermissions,
      [nodeId]: newPermissions
    });
  };

  const saveNodeFieldPermissions = async (nodeId: string) => {
    if (!currentWorkflowId) return;
    try {
      const permissions = nodeFieldPermissions[nodeId] || [];
      await workflowApi.updateNodeFieldPermissions(currentWorkflowId, nodeId, permissions);
      alert('字段权限保存成功');
    } catch (error) {
      console.error('保存字段权限失败:', error);
      alert('保存字段权限失败');
    }
  };

  const validateWorkflow = async () => {
    if (!currentWorkflowId) {
      alert('请先保存流程后再校验');
      return;
    }
    
    setIsValidating(true);
    setShowValidationPanel(true);
    
    try {
      await saveWorkflow();
      
      const response = await api.get<ApiResponse<WorkflowValidationResult>>(`/workflows/${currentWorkflowId}/validate`);
      if (response.data.success && response.data.data) {
        setValidationResult(response.data.data);
      }
    } catch (error) {
      console.error('校验流程失败:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleIssueClick = (issue: WorkflowValidationIssue) => {
    console.log('定位到问题:', issue);
  };

  const publishWorkflow = async () => {
    if (!currentWorkflowId) {
      alert('请先保存流程后再发布');
      return;
    }

    setIsPublishing(true);
    try {
      await saveWorkflow();
      const response = await workflowApi.publish(currentWorkflowId, publishChangeLog);
      if (response.data.success) {
        alert('流程发布成功！');
        setShowPublishDialog(false);
        setPublishChangeLog('');
        await loadWorkflows();
      } else {
        alert(`发布失败: ${response.data.error}`);
      }
    } catch (error: any) {
      const details = error.response?.data?.details;
      if (details?.issues) {
        alert(`发布失败: 校验未通过，请查看校验结果`);
        setShowValidationPanel(true);
        setValidationResult({
          valid: false,
          issues: details.issues,
        });
      } else {
        alert(`发布失败: ${error.response?.data?.error || error.message}`);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const toggleWorkflowStatus = async (status: WorkflowStatus) => {
    if (!currentWorkflowId) {
      alert('请先选择流程');
      return;
    }

    try {
      const response = await workflowApi.updateStatus(currentWorkflowId, status);
      if (response.data.success) {
        alert(status === 'published' ? '流程已启用！' : '流程已停用！');
        await loadWorkflows();
        if (currentWorkflowId && response.data.data) {
          setWorkflowName(response.data.data.name);
        }
      }
    } catch (error: any) {
      alert(`操作失败: ${error.message}`);
    }
  };

  const loadWorkflowVersions = async () => {
    if (!currentWorkflowId) {
      alert('请先选择流程');
      return;
    }

    try {
      const response = await workflowApi.getVersions(currentWorkflowId);
      if (response.data.success && response.data.data) {
        setWorkflowVersions(response.data.data);
        setShowVersionModal(true);
      }
    } catch (error) {
      console.error('加载版本历史失败:', error);
    }
  };

  const viewVersionDetail = async (version: number) => {
    if (!currentWorkflowId) return;

    try {
      const response = await workflowApi.getVersion(currentWorkflowId, version);
      if (response.data.success && response.data.data) {
        setSelectedVersion(response.data.data);
        setShowVersionDetailModal(true);
      }
    } catch (error) {
      console.error('加载版本详情失败:', error);
    }
  };

  const getStatusBadge = (status: WorkflowStatus) => {
    const classMap: Record<WorkflowStatus, string> = {
      draft: 'flow-designer-tag-warning',
      published: 'flow-designer-tag-success',
      disabled: 'flow-designer-tag-error',
    };
    const labels: Record<WorkflowStatus, string> = {
      draft: '草稿',
      published: '已发布',
      disabled: '已停用',
    };
    return (
      <span className={classMap[status] || classMap.draft}>
        {labels[status] || '草稿'}
      </span>
    );
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ 
      ...params, 
      animated: true, 
      style: { strokeWidth: 2 },
      data: { priority: 0 },
      markerEnd: { type: MarkerType.ArrowClosed }
    }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const config = nodeConfigs.find(n => n.type === type);
      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: { 
          name: config?.label || type,
          description: '',
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  const updateNodeData = useCallback((field: string, value: string) => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              [field]: value,
            },
          };
        }
        return node;
      })
    );
  }, [selectedNode, setNodes]);

  const updateEdgeData = useCallback((edgeId: string, data: { conditionExpression?: string; priority?: number }) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === edgeId) {
          return {
            ...edge,
            label: data.conditionExpression || edge.label,
            data: {
              ...edge.data,
              priority: data.priority ?? edge.data?.priority ?? 0,
            },
          };
        }
        return edge;
      })
    );
  }, [setEdges]);

  const deleteSelected = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
      setSelectedNode(null);
    }
    if (selectedEdge) {
      setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge.id));
      setSelectedEdge(null);
    }
  }, [selectedNode, selectedEdge, setNodes, setEdges]);

  const saveWorkflow = async () => {
    setSaveStatus('saving');
    
    try {
      let workflowId = currentWorkflowId;
      
      if (!workflowId) {
        const createResponse = await api.post<ApiResponse<WorkflowDefinition>>('/workflows', {
          name: workflowName,
          code: `WF_${Date.now()}`,
        });
        if (createResponse.data.success && createResponse.data.data) {
          workflowId = createResponse.data.data.id;
          setCurrentWorkflowId(workflowId);
          await loadWorkflows();
        }
      }

      const diagramData: SaveWorkflowDiagramDto = {
        nodes: nodes.map(node => ({
          id: node.id,
          workflowId: workflowId,
          type: (node.type?.toUpperCase() || 'APPROVAL') as WorkflowNodeType,
          name: (node.data as NodeConfigData).name || '未命名节点',
          x: node.position.x,
          y: node.position.y,
          properties: {
            description: (node.data as NodeConfigData).description || '',
          },
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          workflowId: workflowId,
          sourceId: edge.source,
          targetId: edge.target,
          conditionExpression: edge.label as string || '',
          priority: (edge.data as any)?.priority || 0,
        })),
      };

      await api.post(`/workflows/${workflowId}/diagram`, diagramData);
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      await loadWorkflows();
    } catch (error) {
      console.error('保存流程失败:', error);
      setSaveStatus('error');
    }
  };

  const createNewWorkflow = () => {
    setCurrentWorkflowId('');
    setWorkflowName('新建审批流程');
    setNodes(initialNodes);
    setEdges(initialEdges);
    setSelectedNode(null);
    setSelectedEdge(null);
    setValidationResult(null);
  };

  return (
    <div className="flow-designer-container">
      <div className="flow-designer-sidebar">
        <div className="flow-designer-sidebar-section">
          <h2 className="flow-designer-sidebar-title">流程设计器</h2>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="flow-designer-input"
            placeholder="流程名称"
          />
        </div>

        <div className="flow-designer-sidebar-section">
          <h3 className="flow-designer-sidebar-subtitle">节点组件库</h3>
          <div style={{ marginBottom: '8px' }}>
            {nodeConfigs.map((node) => (
              <div
                key={node.type}
                draggable
                onDragStart={(event) => onDragStart(event, node.type)}
                className="flow-designer-node-item"
                style={{ background: `linear-gradient(to right, ${node.bgColors?.[0]}, ${node.bgColors?.[1]})`, color: 'white' }}
              >
                <span style={{ fontSize: '18px' }}>{node.icon}</span>
                <span>{node.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flow-designer-sidebar-section">
          <h3 className="flow-designer-sidebar-subtitle">已有流程</h3>
          <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
            {workflows.map((wf) => (
              <div
                key={wf.id}
                onClick={() => loadWorkflow(wf.id)}
                className={`flow-designer-workflow-item ${currentWorkflowId === wf.id ? 'active' : ''}`}
              >
                <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wf.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span className="flow-designer-small-text-gray">v{wf.version}</span>
                  {getStatusBadge((wf.status as WorkflowStatus) || 'draft')}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flow-designer-sidebar-section">
          <h3 className="flow-designer-sidebar-subtitle">关联表单</h3>
          <select
            value={selectedFormId}
            onChange={(e) => bindWorkflowForm(e.target.value)}
            className="flow-designer-select"
            disabled={!currentWorkflowId}
          >
            <option value="">选择关联表单...</option>
            {forms.map((form) => (
              <option key={form.id} value={form.id}>
                {form.name}
              </option>
            ))}
          </select>
          {!currentWorkflowId && (
            <p className="flow-designer-hint">请先保存流程后再关联表单</p>
          )}
          {selectedFormId && (
            <div className="flow-designer-form-success">
              <span className="flow-designer-small-text-green">✓ 已关联表单</span>
            </div>
          )}
        </div>

        <div className="flow-designer-footer">
          <div style={{ marginBottom: '8px' }}>
            <button
              onClick={createNewWorkflow}
              className="flow-designer-btn flow-designer-btn-gray"
            >
              新建流程
            </button>
            <button
              onClick={saveWorkflow}
              disabled={saveStatus === 'saving'}
              className="flow-designer-btn flow-designer-btn-green"
            >
              {saveStatus === 'saving' ? '保存中...' : saveStatus === 'saved' ? '✓ 已保存' : saveStatus === 'error' ? '保存失败' : '保存流程'}
            </button>
            <button
              onClick={() => setShowPublishDialog(true)}
              disabled={isPublishing || !currentWorkflowId}
              className="flow-designer-btn flow-designer-btn-green"
            >
              {isPublishing ? '发布中...' : '发布流程'}
            </button>
            <div className="flow-designer-btn-row">
              <button
                onClick={() => toggleWorkflowStatus('published')}
                disabled={!currentWorkflowId || (workflows.find(w => w.id === currentWorkflowId)?.status as WorkflowStatus) === 'published'}
                className="flow-designer-btn flow-designer-btn-emerald"
              >
                启用
              </button>
              <button
                onClick={() => toggleWorkflowStatus('disabled')}
                disabled={!currentWorkflowId || (workflows.find(w => w.id === currentWorkflowId)?.status as WorkflowStatus) !== 'published'}
                className="flow-designer-btn flow-designer-btn-orange"
              >
                停用
              </button>
            </div>
            <button
              onClick={loadWorkflowVersions}
              disabled={!currentWorkflowId}
              className="flow-designer-btn flow-designer-btn-indigo"
            >
              版本历史
            </button>
            <button
              onClick={validateWorkflow}
              disabled={isValidating}
              className="flow-designer-btn flow-designer-btn-purple"
            >
              {isValidating ? '校验中...' : '校验流程'}
            </button>
            <button
              onClick={deleteSelected}
              disabled={!selectedNode && !selectedEdge}
              className="flow-designer-btn flow-designer-btn-red"
            >
              删除选中
            </button>
          </div>
        </div>
      </div>

      <div className="flow-designer-main">
        <div className="flow-designer-toolbar">
          <span className="flow-designer-toolbar-item">节点数: {nodes.length}</span>
          <span className="flow-designer-toolbar-item">连线数: {edges.length}</span>
          {selectedNode && (
            <span className="flow-designer-toolbar-blue">
              已选中节点: {(selectedNode.data as NodeConfigData).name}
            </span>
          )}
          {selectedEdge && (
            <span className="flow-designer-toolbar-purple">
              已选中连接线: {selectedEdge.id}
            </span>
          )}
        </div>
        
        <div className="flow-designer-content">
          <div className="flow-designer-canvas" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              fitView
              selectionOnDrag
              panOnDrag
              zoomOnScroll
              minZoom={0.2}
              maxZoom={4}
              defaultEdgeOptions={{
                type: 'smoothstep',
              }}
            >
              <Controls style={{ background: 'white', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
              <MiniMap
                style={{ background: 'white', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                nodeColor={(node) => {
                  switch (node.type) {
                    case 'start': return '#22c55e';
                    case 'end': return '#ef4444';
                    case 'approval': return '#3b82f6';
                    case 'condition': return '#eab308';
                    case 'serial': return '#a855f7';
                    default: return '#6b7280';
                  }
                }}
              />
              <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#d1d5db" />
            </ReactFlow>
          </div>

          {showValidationPanel && (
            <div className="flow-designer-validation-panel">
              <div className="flow-designer-panel-header">
                <h3 className="flow-designer-panel-title">校验结果</h3>
                <button
                  onClick={() => setShowValidationPanel(false)}
                  className="flow-designer-panel-close"
                >
                  ✕
                </button>
              </div>
              <WorkflowValidationPanel
                validationResult={validationResult}
                isValidating={isValidating}
                onValidate={validateWorkflow}
                onIssueClick={handleIssueClick}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flow-designer-config-panel">
        {selectedNode && (
          <div style={{ padding: '16px', height: '100%', overflowY: 'auto' }}>
            <div className="flow-designer-config-header">
              <h2 className="flow-designer-config-title">节点配置</h2>
              <button
                onClick={() => setSelectedNode(null)}
                className="flow-designer-panel-close"
              >
                ✕
              </button>
            </div>

            <div className="flow-designer-info-card">
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                selectedNode.type === 'start' ? 'background: rgb(220, 252, 231); color: rgb(22, 101, 52)' :
                selectedNode.type === 'end' ? 'background: rgb(254, 226, 226); color: rgb(153, 27, 27)' :
                selectedNode.type === 'approval' ? 'background: rgb(219, 234, 254); color: rgb(29, 78, 216)' :
                selectedNode.type === 'serial' ? 'background: rgb(237, 233, 254); color: rgb(109, 40, 217)' :
                'background: rgb(254, 243, 199); color: rgb(146, 64, 14)'
              }`} style={{
                background: selectedNode.type === 'start' ? 'rgb(220, 252, 231)' :
                          selectedNode.type === 'end' ? 'rgb(254, 226, 226)' :
                          selectedNode.type === 'approval' ? 'rgb(219, 234, 254)' :
                          selectedNode.type === 'serial' ? 'rgb(237, 233, 254)' :
                          'rgb(254, 243, 199)',
                color: selectedNode.type === 'start' ? 'rgb(22, 101, 52)' :
                       selectedNode.type === 'end' ? 'rgb(153, 27, 27)' :
                       selectedNode.type === 'approval' ? 'rgb(29, 78, 216)' :
                       selectedNode.type === 'serial' ? 'rgb(109, 40, 217)' :
                       'rgb(146, 64, 14)'
              }}>
                {nodeConfigs.find(n => n.type === selectedNode.type)?.label || '未知类型'}
              </span>
              <span className="flow-designer-small-text-gray">ID: {selectedNode.id}</span>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div className="flow-designer-form-item">
                <label className="flow-designer-form-label">
                  节点名称
                </label>
                <input
                  type="text"
                  value={(selectedNode.data as NodeConfigData).name || ''}
                  onChange={(e) => updateNodeData('name', e.target.value)}
                  className="flow-designer-input"
                />
              </div>

              <div className="flow-designer-form-item">
                <label className="flow-designer-form-label">
                  节点描述
                </label>
                <textarea
                  value={(selectedNode.data as NodeConfigData).description || ''}
                  onChange={(e) => updateNodeData('description', e.target.value)}
                  rows={3}
                  className="flow-designer-textarea"
                  placeholder="添加节点描述说明..."
                />
              </div>

              {selectedNode.type === 'approval' && (
                <>
                  <div className="flow-designer-form-item">
                    <label className="flow-designer-form-label">
                      审批人类型
                    </label>
                    <select
                      value={(selectedNode.data as NodeConfigData).assigneeType || ''}
                      onChange={(e) => updateNodeData('assigneeType', e.target.value)}
                      className="flow-designer-select"
                    >
                      <option value="">请选择</option>
                      <option value="user">指定人员</option>
                      <option value="role">指定角色</option>
                      <option value="position">指定岗位</option>
                      <option value="supervisor">直属上级</option>
                    </select>
                  </div>
                  <div className="flow-designer-form-item">
                    <label className="flow-designer-form-label">
                      审批时限（小时）
                    </label>
                    <input
                      type="number"
                      value={(selectedNode.data as NodeConfigData).timeout || ''}
                      onChange={(e) => updateNodeData('timeout', e.target.value)}
                      className="flow-designer-input"
                      placeholder="24"
                    />
                  </div>
                </>
              )}

              {selectedFormId && (
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '16px' }}>
                  <div className="flow-designer-field-perms-header">
                    <h3 className="flow-designer-field-perms-title">字段权限配置</h3>
                    <button
                      onClick={() => saveNodeFieldPermissions(selectedNode.id)}
                      className="flow-designer-btn-xs"
                    >
                      保存权限
                    </button>
                  </div>
                  <p className="flow-designer-hint">为当前节点配置表单字段的查看和编辑权限</p>
                  <div style={{ maxHeight: '256px', overflowY: 'auto' }}>
                    {(() => {
                      const selectedForm = forms.find(f => f.id === selectedFormId);
                      const fields = selectedForm?.config?.fields || [];
                      const permissions = nodeFieldPermissions[selectedNode.id] || [];
                      
                      return fields.map((field: any) => {
                        const currentPerm = permissions.find(p => p.fieldName === field.name);
                        const permissionValue = currentPerm?.permission || FieldPermissionType.EDITABLE;
                        
                        return (
                          <div key={field.name} className="flow-designer-field-card">
                            <div className="flow-designer-field-name">
                              {field.label || field.name}
                            </div>
                            <div className="flow-designer-perms-row">
                              <label className="flow-designer-perm-label">
                                <input
                                  type="radio"
                                  name={`perm-${field.name}`}
                                  checked={permissionValue === FieldPermissionType.EDITABLE}
                                  onChange={() => updateFieldPermission(selectedNode.id, field.name, FieldPermissionType.EDITABLE)}
                                />
                                <span style={{ color: permissionValue === FieldPermissionType.EDITABLE ? '#059669' : '#6b7280' }}>可编辑</span>
                              </label>
                              <label className="flow-designer-perm-label">
                                <input
                                  type="radio"
                                  name={`perm-${field.name}`}
                                  checked={permissionValue === FieldPermissionType.READ_ONLY}
                                  onChange={() => updateFieldPermission(selectedNode.id, field.name, FieldPermissionType.READ_ONLY)}
                                />
                                <span style={{ color: permissionValue === FieldPermissionType.READ_ONLY ? '#ca8a04' : '#6b7280' }}>只读</span>
                              </label>
                              <label className="flow-designer-perm-label">
                                <input
                                  type="radio"
                                  name={`perm-${field.name}`}
                                  checked={permissionValue === FieldPermissionType.HIDDEN}
                                  onChange={() => updateFieldPermission(selectedNode.id, field.name, FieldPermissionType.HIDDEN)}
                                />
                                <span style={{ color: permissionValue === FieldPermissionType.HIDDEN ? '#dc2626' : '#6b7280' }}>隐藏</span>
                              </label>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {!selectedFormId && (selectedNode.type === 'approval' || selectedNode.type === 'start') && (
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '16px' }}>
                  <p className="flow-designer-center-text">请先在左侧面板关联表单后配置字段权限</p>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedEdge && (
          <EdgeConfigPanel
            edge={selectedEdge}
            onUpdate={updateEdgeData}
            onClose={() => setSelectedEdge(null)}
          />
        )}
      </div>

      {showPublishDialog && (
        <div className="flow-designer-modal-overlay">
          <div className="flow-designer-modal">
            <div className="flow-designer-modal-header">
              <h3 className="flow-designer-modal-title">发布流程</h3>
              <button
                onClick={() => setShowPublishDialog(false)}
                className="flow-designer-modal-close"
              >
                ✕
              </button>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div className="flow-designer-form-item">
                <label className="flow-designer-form-label">
                  版本变更说明
                </label>
                <textarea
                  value={publishChangeLog}
                  onChange={(e) => setPublishChangeLog(e.target.value)}
                  rows={4}
                  className="flow-designer-textarea"
                  placeholder="描述此版本的主要变更内容..."
                />
              </div>
              <div className="flow-designer-modal-info">
                <p className="flow-designer-modal-info-text">
                  ℹ️ 发布前将自动校验流程，校验通过后版本号自动递增
                </p>
              </div>
            </div>
            <div className="flow-designer-modal-footer">
              <button
                onClick={() => setShowPublishDialog(false)}
                className="flow-designer-btn flow-designer-btn-gray"
              >
                取消
              </button>
              <button
                onClick={publishWorkflow}
                disabled={isPublishing}
                className="flow-designer-btn flow-designer-btn-green"
              >
                {isPublishing ? '发布中...' : '确认发布'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showVersionModal && (
        <div className="flow-designer-modal-overlay">
          <div className="flow-designer-modal flow-designer-modal-lg">
            <div className="flow-designer-modal-header">
              <h3 className="flow-designer-modal-title">历史版本</h3>
              <button
                onClick={() => setShowVersionModal(false)}
                className="flow-designer-modal-close"
              >
                ✕
              </button>
            </div>
            <div className="flow-designer-modal-content">
              {workflowVersions.length === 0 ? (
                <div className="flow-designer-empty-state">
                  <p>⏱️ 暂无发布记录</p>
                </div>
              ) : (
                <div>
                  {workflowVersions.map((version, index) => (
                    <div
                      key={version.id}
                      className="flow-designer-version-card"
                      onClick={() => viewVersionDetail(version.version)}
                    >
                      <div className="flow-designer-version-header">
                        <div className="flow-designer-version-info">
                          <div className="flow-designer-version-badge">
                            v{version.version}
                          </div>
                          <div>
                            <div className="flow-designer-version-name">{version.name}</div>
                            <div className="flow-designer-version-meta">
                              发布者: {(version as any).createdBy?.name || '未知'} • {new Date(version.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <span style={{ color: '#9ca3af' }}>→</span>
                      </div>
                      {version.changeLog && (
                        <div className="flow-designer-version-changelog">
                          {version.changeLog}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showVersionDetailModal && selectedVersion && (
        <div className="flow-designer-modal-overlay">
          <div className="flow-designer-modal flow-designer-modal-lg">
            <div className="flow-designer-modal-header">
              <h3 className="flow-designer-modal-title">
                版本详情 - v{selectedVersion.version}
              </h3>
              <button
                onClick={() => {
                  setShowVersionDetailModal(false);
                  setSelectedVersion(null);
                }}
                className="flow-designer-modal-close"
              >
                ✕
              </button>
            </div>
            <div className="flow-designer-modal-content">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="flow-designer-info-card">
                  <div className="flow-designer-small-text">流程名称</div>
                  <div style={{ fontWeight: 500, marginTop: '4px' }}>{selectedVersion.name}</div>
                </div>
                <div className="flow-designer-info-card">
                  <div className="flow-designer-small-text">发布时间</div>
                  <div style={{ fontWeight: 500, marginTop: '4px' }}>{new Date(selectedVersion.createdAt).toLocaleString()}</div>
                </div>
                <div className="flow-designer-info-card">
                  <div className="flow-designer-small-text">发布者</div>
                  <div style={{ fontWeight: 500, marginTop: '4px' }}>{(selectedVersion as any).createdBy?.name || '未知'}</div>
                </div>
                <div className="flow-designer-info-card">
                  <div className="flow-designer-small-text">状态</div>
                  <div style={{ marginTop: '4px' }}>{getStatusBadge((selectedVersion.status as WorkflowStatus) || 'published')}</div>
                </div>
              </div>
              {selectedVersion.changeLog && (
                <div className="flow-designer-modal-info">
                  <div style={{ fontWeight: 500, marginBottom: '4px' }}>变更说明</div>
                  <div>{selectedVersion.changeLog}</div>
                </div>
              )}
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ fontWeight: 500, color: '#374151', marginBottom: '8px' }}>节点信息 ({(selectedVersion as any).nodes?.length || 0}个节点)</h4>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', fontSize: '14px' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                      <tr>
                        <th style={{ padding: '8px 16px', textAlign: 'left', color: '#4b5563', fontWeight: 500 }}>节点名称</th>
                        <th style={{ padding: '8px 16px', textAlign: 'left', color: '#4b5563', fontWeight: 500 }}>节点类型</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedVersion as any).nodes?.map((node: any) => (
                        <tr key={node.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '8px 16px' }}>{node.name}</td>
                          <td style={{ padding: '8px 16px' }}>
                            <span className="flow-designer-small-text" style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>
                              {node.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
              <button
                onClick={() => {
                  setShowVersionDetailModal(false);
                  setSelectedVersion(null);
                }}
                className="flow-designer-btn flow-designer-btn-gray"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FlowDesignerPage() {
  return (
    <ReactFlowProvider>
      <FlowDesignerContent />
    </ReactFlowProvider>
  );
}
