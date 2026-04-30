<template>
  <div class="dashboard-container">
    <h2 class="page-title">系统概览</h2>
    
    <div class="stat-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card total-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><Box /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalEquipment }}</div>
                <div class="stat-label">器材总数</div>
              </div>
            </div>
            <div class="stat-footer">
              <span class="trend-up">
                <el-icon><TrendCharts /></el-icon>
                较上月 +12%
              </span>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card available-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.availableEquipment }}</div>
                <div class="stat-label">可用器材数</div>
              </div>
            </div>
            <div class="stat-footer">
              <span class="percentage">
                占比 {{ ((stats.availableEquipment / stats.totalEquipment) * 100).toFixed(1) }}%
              </span>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card borrowed-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.borrowedEquipment }}</div>
                <div class="stat-label">借用中器材</div>
              </div>
            </div>
            <div class="stat-footer">
              <span class="trend-down">
                <el-icon><Warning /></el-icon>
                待归还 {{ stats.pendingReturn }}
              </span>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card repair-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><Tools /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.repairingEquipment }}</div>
                <div class="stat-label">维修中器材</div>
              </div>
            </div>
            <div class="stat-footer">
              <span class="warning">
                <el-icon><Timer /></el-icon>
                预计 {{ stats.repairDays }} 天内完成
              </span>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <div class="content-section">
      <el-row :gutter="20">
        <el-col :xs="24" :lg="16">
          <el-card class="logs-card">
            <template #header>
              <div class="card-header">
                <span class="card-title">最近操作记录</span>
                <el-button type="primary" text @click="$router.push('/logs')">
                  查看全部
                </el-button>
              </div>
            </template>
            
            <el-table :data="recentLogs" style="width: 100%" v-loading="loading">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="action" label="操作类型" width="100">
                <template #default="scope">
                  <el-tag :type="getActionTagType(scope.row.action)" size="small">
                    {{ scope.row.action }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="操作描述" />
              <el-table-column prop="username" label="操作人" width="100" />
              <el-table-column prop="createdAt" label="操作时间" width="180">
                <template #default="scope">
                  {{ formatTime(scope.row.createdAt) }}
                </template>
              </el-table-column>
            </el-table>
            
            <el-empty v-if="!loading && recentLogs.length === 0" description="暂无操作记录" />
          </el-card>
        </el-col>
        
        <el-col :xs="24" :lg="8">
          <el-card class="quick-actions-card">
            <template #header>
              <span class="card-title">快捷操作</span>
            </template>
            
            <div class="quick-actions">
              <div class="action-item" @click="$router.push('/borrow-records/apply')">
                <el-icon class="action-icon"><Plus /></el-icon>
                <span class="action-text">申请借用</span>
              </div>
              
              <div class="action-item" @click="$router.push('/equipment')">
                <el-icon class="action-icon"><Search /></el-icon>
                <span class="action-text">器材查询</span>
              </div>
              
              <div class="action-item" @click="$router.push('/categories')">
                <el-icon class="action-icon"><FolderOpened /></el-icon>
                <span class="action-text">分类浏览</span>
              </div>
              
              <div class="action-item" @click="$router.push('/profile')">
                <el-icon class="action-icon"><User /></el-icon>
                <span class="action-text">个人中心</span>
              </div>
            </div>
          </el-card>
          
          <el-card class="system-info-card" style="margin-top: 20px;">
            <template #header>
              <span class="card-title">系统信息</span>
            </template>
            
            <div class="system-info-list">
              <div class="info-item">
                <span class="info-label">当前用户</span>
                <span class="info-value">{{ currentUser }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">用户角色</span>
                <span class="info-value">
                  <el-tag :type="getRoleTagType(authStore.userRole)" size="small">
                    {{ roleName }}
                  </el-tag>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">所属实验室</span>
                <span class="info-value">{{ authStore.userInfo?.laboratoryName || '无' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">登录时间</span>
                <span class="info-value">{{ loginTime }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { ROLE_NAMES } from '@/config/menu'
import {
  Box,
  CircleCheck,
  Document,
  Tools,
  TrendCharts,
  Warning,
  Timer,
  Plus,
  Search,
  FolderOpened,
  User
} from '@element-plus/icons-vue'

const authStore = useAuthStore()

const loading = ref(false)

const stats = ref({
  totalEquipment: 156,
  availableEquipment: 124,
  borrowedEquipment: 28,
  pendingReturn: 5,
  repairingEquipment: 4,
  repairDays: 3
})

const recentLogs = ref([
  {
    id: 1,
    action: '登录',
    description: '用户张三登录系统',
    username: '张三',
    createdAt: '2026-04-27 10:30:00'
  },
  {
    id: 2,
    action: '借用',
    description: '借用器材：显微镜 (ID: 1001)',
    username: '张三',
    createdAt: '2026-04-27 10:25:00'
  },
  {
    id: 3,
    action: '归还',
    description: '归还器材：烧杯 (ID: 1005)',
    username: '李四',
    createdAt: '2026-04-27 09:45:00'
  },
  {
    id: 4,
    action: '新增',
    description: '新增器材：电子天平',
    username: '管理员',
    createdAt: '2026-04-26 16:30:00'
  },
  {
    id: 5,
    action: '编辑',
    description: '编辑用户信息：王五',
    username: '管理员',
    createdAt: '2026-04-26 14:20:00'
  }
])

const currentUser = computed(() => {
  return authStore.userInfo?.username || '未登录'
})

const roleName = computed(() => {
  const role = authStore.userRole
  return ROLE_NAMES[role] || role
})

const loginTime = computed(() => {
  const now = new Date()
  return now.toLocaleString('zh-CN')
})

const getActionTagType = (action) => {
  const typeMap = {
    '登录': 'success',
    '借用': 'primary',
    '归还': 'info',
    '新增': 'success',
    '编辑': 'warning',
    '删除': 'danger'
  }
  return typeMap[action] || 'info'
}

const getRoleTagType = (role) => {
  const typeMap = {
    'super_admin': 'danger',
    'lab_admin': 'warning',
    'user': 'primary'
  }
  return typeMap[role] || 'info'
}

const formatTime = (time) => {
  return time
}

onMounted(() => {
})
</script>

<style scoped>
.dashboard-container {
  width: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  margin-bottom: 20px;
}

.total-card {
  --card-border-color: #409eff;
  border-left: 4px solid #409eff;
}

.available-card {
  --card-border-color: #67c23a;
  border-left: 4px solid #67c23a;
}

.borrowed-card {
  --card-border-color: #e6a23c;
  border-left: 4px solid #e6a23c;
}

.repair-card {
  --card-border-color: #f56c6c;
  border-left: 4px solid #f56c6c;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.total-card .stat-icon {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: #fff;
}

.available-card .stat-icon {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  color: #fff;
}

.borrowed-card .stat-icon {
  background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
  color: #fff;
}

.repair-card .stat-icon {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
  color: #fff;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.stat-footer {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
  font-size: 12px;
}

.trend-up {
  color: #67c23a;
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend-down {
  color: #e6a23c;
  display: flex;
  align-items: center;
  gap: 4px;
}

.percentage {
  color: #909399;
}

.warning {
  color: #f56c6c;
  display: flex;
  align-items: center;
  gap: 4px;
}

.content-section {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.logs-card {
  height: 100%;
}

.quick-actions-card {
  height: fit-content;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 12px;
  border-radius: 8px;
  background-color: #f5f7fa;
  cursor: pointer;
  transition: all 0.3s;
}

.action-item:hover {
  background-color: #ecf5ff;
  transform: translateY(-2px);
}

.action-icon {
  font-size: 28px;
  color: #409eff;
  margin-bottom: 8px;
}

.action-text {
  font-size: 14px;
  color: #606266;
}

.system-info-card {
  height: fit-content;
}

.system-info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 14px;
  color: #909399;
}

.info-value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 20px;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style>
