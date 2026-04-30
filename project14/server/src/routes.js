import express from 'express';
import { 
  initialApplications, 
  createApplication, 
  ROLE_ORDER_MAP 
} from './data.js';

const router = express.Router();

let applications = [...initialApplications];
let currentRole = 'employee';

const isApprovalRole = (role) => {
  return role !== 'employee';
};

const getRoleOrder = (role) => {
  return ROLE_ORDER_MAP[role] || 0;
};

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.post('/login', (req, res) => {
  const { role } = req.body;
  
  if (!role) {
    return res.status(400).json({ error: '角色不能为空' });
  }

  const validRoles = ['employee', 'department_manager', 'finance', 'general_manager'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: '无效的角色' });
  }

  currentRole = role;
  
  res.json({ 
    success: true, 
    role, 
    isApprovalRole: isApprovalRole(role) 
  });
});

router.get('/current-role', (req, res) => {
  res.json({ 
    role: currentRole, 
    isApprovalRole: isApprovalRole(currentRole) 
  });
});

router.get('/applications/pending', (req, res) => {
  if (!isApprovalRole(currentRole)) {
    return res.json({ applications: [] });
  }
  
  const roleOrder = getRoleOrder(currentRole);
  const pendingApps = applications.filter(
    app => app.status === 'pending' && app.currentNodeOrder === roleOrder
  );
  
  res.json({ applications: pendingApps });
});

router.get('/applications/my', (req, res) => {
  const myApps = applications.filter(app => app.createdBy === currentRole);
  res.json({ applications: myApps });
});

router.get('/applications/cc', (req, res) => {
  const ccApps = applications.filter(app => app.ccRoles.includes(currentRole));
  res.json({ applications: ccApps });
});

router.get('/applications/:id', (req, res) => {
  const { id } = req.params;
  const app = applications.find(a => a.id === id);
  
  if (!app) {
    return res.status(404).json({ error: '申请不存在' });
  }
  
  res.json({ application: app });
});

router.post('/applications', (req, res) => {
  const { title, amount, description } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: '申请标题不能为空' });
  }
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: '金额必须是正数' });
  }
  
  const newApp = createApplication({ title, amount, description }, currentRole);
  applications.unshift(newApp);
  
  res.json({ success: true, application: newApp });
});

router.put('/applications/:id/approve', (req, res) => {
  const { id } = req.params;
  const { comment = '同意' } = req.body;
  
  const appIndex = applications.findIndex(a => a.id === id);
  if (appIndex === -1) {
    return res.status(404).json({ error: '申请不存在' });
  }
  
  const app = applications[appIndex];
  
  if (!isApprovalRole(currentRole)) {
    return res.status(403).json({ error: '没有审批权限' });
  }
  
  const roleOrder = getRoleOrder(currentRole);
  if (app.status !== 'pending' || app.currentNodeOrder !== roleOrder) {
    return res.status(400).json({ error: '当前节点不需要您审批' });
  }
  
  const updatedNodes = app.nodes.map(n => {
    if (n.order === app.currentNodeOrder) {
      return {
        ...n,
        status: 'approved',
        comment,
        approvedAt: new Date().toISOString(),
      };
    }
    return n;
  });

  const hasNextNode = app.currentNodeOrder < 3;
  const updatedApp = {
    ...app,
    nodes: updatedNodes,
    currentNodeOrder: hasNextNode ? app.currentNodeOrder + 1 : 4,
    status: hasNextNode ? 'pending' : 'completed',
  };
  
  applications[appIndex] = updatedApp;
  
  res.json({ success: true, application: updatedApp });
});

router.put('/applications/:id/reject', (req, res) => {
  const { id } = req.params;
  const { comment = '驳回' } = req.body;
  
  const appIndex = applications.findIndex(a => a.id === id);
  if (appIndex === -1) {
    return res.status(404).json({ error: '申请不存在' });
  }
  
  const app = applications[appIndex];
  
  if (!isApprovalRole(currentRole)) {
    return res.status(403).json({ error: '没有审批权限' });
  }
  
  const roleOrder = getRoleOrder(currentRole);
  if (app.status !== 'pending' || app.currentNodeOrder !== roleOrder) {
    return res.status(400).json({ error: '当前节点不需要您审批' });
  }
  
  const updatedNodes = app.nodes.map(n => {
    if (n.order === app.currentNodeOrder) {
      return {
        ...n,
        status: 'rejected',
        comment,
        approvedAt: new Date().toISOString(),
      };
    }
    return n;
  });

  const updatedApp = {
    ...app,
    nodes: updatedNodes,
    status: 'rejected',
  };
  
  applications[appIndex] = updatedApp;
  
  res.json({ success: true, application: updatedApp });
});

router.put('/applications/:id/cc', (req, res) => {
  const { id } = req.params;
  const { roles } = req.body;
  
  if (!roles || !Array.isArray(roles)) {
    return res.status(400).json({ error: '抄送角色不能为空' });
  }
  
  const appIndex = applications.findIndex(a => a.id === id);
  if (appIndex === -1) {
    return res.status(404).json({ error: '申请不存在' });
  }
  
  const app = applications[appIndex];
  const updatedCcRoles = [...new Set([...app.ccRoles, ...roles])];
  
  const updatedApp = {
    ...app,
    ccRoles: updatedCcRoles,
  };
  
  applications[appIndex] = updatedApp;
  
  res.json({ success: true, application: updatedApp });
});

export default router;
