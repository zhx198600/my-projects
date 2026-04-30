<template>
  <el-dialog
    v-model="visible"
    title="器材详情"
    width="900px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <div class="detail-container" v-loading="loading">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <el-descriptions :column="2" border class="info-descriptions">
            <el-descriptions-item label="器材编号">
              {{ equipmentDetail.code || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="器材名称">
              {{ equipmentDetail.name || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="分类">
              {{ equipmentDetail.categoryPath || equipmentDetail.categoryName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="规格型号">
              {{ equipmentDetail.specification || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag
                :type="getStatusTagType(equipmentDetail.status)"
                :effect="'light'"
                size="small"
              >
                {{ getStatusName(equipmentDetail.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="所属实验室">
              {{ equipmentDetail.laboratoryName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="库存数量">
              {{ equipmentDetail.stockQuantity || 0 }} {{ equipmentDetail.unit || '台' }}
            </el-descriptions-item>
            <el-descriptions-item label="当前可用">
              <span :class="{ 'text-danger': equipmentDetail.availableQuantity === 0 }">
                {{ equipmentDetail.availableQuantity || 0 }} {{ equipmentDetail.unit || '台' }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="存放位置">
              {{ equipmentDetail.location || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="购买日期">
              {{ equipmentDetail.purchaseDate || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="价格">
              {{ equipmentDetail.price ? '¥' + equipmentDetail.price : '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="供应商">
              {{ equipmentDetail.supplier || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="描述" :span="2">
              {{ equipmentDetail.description || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">
              {{ equipmentDetail.remark || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="入库时间">
              {{ equipmentDetail.createdAt || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
              {{ equipmentDetail.updatedAt || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="借用记录" name="borrow">
          <div class="table-section">
            <el-table
              :data="borrowRecords"
              style="width: 100%"
              v-loading="borrowLoading"
              stripe
              max-height="400"
            >
              <el-table-column
                type="index"
                label="序号"
                width="60"
                align="center"
              />
              <el-table-column prop="borrowerName" label="借用人" min-width="100" />
              <el-table-column prop="borrowTime" label="借用时间" min-width="160">
                <template #default="scope">
                  {{ formatTime(scope.row.borrowTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="expectedReturnTime" label="预计归还时间" min-width="160">
                <template #default="scope">
                  {{ formatTime(scope.row.expectedReturnTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="actualReturnTime" label="实际归还时间" min-width="160">
                <template #default="scope">
                  {{ formatTime(scope.row.actualReturnTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100" align="center">
                <template #default="scope">
                  <el-tag
                    :type="getBorrowStatusTagType(scope.row.status)"
                    :effect="'light'"
                    size="small"
                  >
                    {{ getBorrowStatusName(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" align="center">
                <template #default="scope">
                  <el-button
                    type="primary"
                    link
                    size="small"
                    @click="viewBorrowDetail(scope.row)"
                  >
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="!borrowLoading && borrowRecords.length === 0" description="暂无借用记录" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="操作日志" name="logs">
          <div class="table-section">
            <el-table
              :data="logList"
              style="width: 100%"
              v-loading="logLoading"
              stripe
              max-height="400"
            >
              <el-table-column
                type="index"
                label="序号"
                width="60"
                align="center"
              />
              <el-table-column prop="operatorName" label="操作人" min-width="100" />
              <el-table-column prop="action" label="操作类型" min-width="100">
                <template #default="scope">
                  <el-tag size="small" :type="getLogTagType(scope.row.action)">
                    {{ getLogActionName(scope.row.action) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="操作描述" min-width="250">
                <template #default="scope">
                  {{ scope.row.description || '-' }}
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="操作时间" min-width="160">
                <template #default="scope">
                  {{ formatTime(scope.row.createdAt) }}
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="!logLoading && logList.length === 0" description="暂无操作日志" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog
      v-model="borrowDetailVisible"
      title="借用记录详情"
      width="600px"
    >
      <el-descriptions :column="2" border v-if="currentBorrowRecord">
        <el-descriptions-item label="借用人">
          {{ currentBorrowRecord.borrowerName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="器材名称">
          {{ currentBorrowRecord.equipmentName || equipmentDetail.name || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="借用数量">
          {{ currentBorrowRecord.quantity || 1 }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag
            :type="getBorrowStatusTagType(currentBorrowRecord.status)"
            :effect="'light'"
            size="small"
          >
            {{ getBorrowStatusName(currentBorrowRecord.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="借用时间">
          {{ formatTime(currentBorrowRecord.borrowTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="预计归还时间">
          {{ formatTime(currentBorrowRecord.expectedReturnTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="实际归还时间">
          {{ formatTime(currentBorrowRecord.actualReturnTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="实验室">
          {{ currentBorrowRecord.laboratoryName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="借用用途" :span="2">
          {{ currentBorrowRecord.purpose || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="归还备注" :span="2">
          {{ currentBorrowRecord.returnRemark || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import equipmentApi from '@/api/equipment'
import logsApi from '@/api/logs'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  equipmentId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['close'])

const loading = ref(false)
const borrowLoading = ref(false)
const logLoading = ref(false)
const activeTab = ref('basic')
const equipmentDetail = ref({})
const borrowRecords = ref([])
const logList = ref([])
const borrowDetailVisible = ref(false)
const currentBorrowRecord = ref(null)

const statusMap = {
  available: { name: '可用', type: 'success' },
  borrowed: { name: '借用中', type: 'warning' },
  repair: { name: '维修中', type: '' },
  scrapped: { name: '已报废', type: 'danger' }
}

const borrowStatusMap = {
  borrowing: { name: '借用中', type: 'warning' },
  returned: { name: '已归还', type: 'success' },
  overdue: { name: '已逾期', type: 'danger' }
}

const logActionMap = {
  create: { name: '创建', type: 'primary' },
  update: { name: '更新', type: 'primary' },
  delete: { name: '删除', type: 'danger' },
  borrow: { name: '借用', type: 'warning' },
  return: { name: '归还', type: 'success' },
  scrap: { name: '报废', type: 'danger' },
  repair: { name: '维修', type: 'info' }
}

const getStatusName = (status) => {
  return statusMap[status]?.name || status
}

const getStatusTagType = (status) => {
  return statusMap[status]?.type || ''
}

const getBorrowStatusName = (status) => {
  return borrowStatusMap[status]?.name || status
}

const getBorrowStatusTagType = (status) => {
  return borrowStatusMap[status]?.type || ''
}

const getLogActionName = (action) => {
  return logActionMap[action]?.name || action
}

const getLogTagType = (action) => {
  return logActionMap[action]?.type || ''
}

const formatTime = (time) => {
  if (!time) return '-'
  return time
}

const fetchEquipmentDetail = async () => {
  if (!props.equipmentId) return
  
  loading.value = true
  try {
    const result = await equipmentApi.getById(props.equipmentId)
    equipmentDetail.value = result || {}
  } catch (error) {
    console.error('获取器材详情失败:', error)
    equipmentDetail.value = {}
  } finally {
    loading.value = false
  }
}

const fetchBorrowRecords = async () => {
  if (!props.equipmentId) return
  
  borrowLoading.value = true
  try {
    const result = await equipmentApi.getBorrowRecords(props.equipmentId, {
      page: 1,
      pageSize: 100
    })
    borrowRecords.value = result.list || result.data || result || []
  } catch (error) {
    console.error('获取借用记录失败:', error)
    borrowRecords.value = []
  } finally {
    borrowLoading.value = false
  }
}

const fetchLogs = async () => {
  if (!props.equipmentId) return
  
  logLoading.value = true
  try {
    const result = await logsApi.getList({
      targetType: 'equipment',
      targetId: props.equipmentId,
      page: 1,
      pageSize: 10
    })
    logList.value = result.list || result.data || result || []
  } catch (error) {
    console.error('获取操作日志失败:', error)
    logList.value = []
  } finally {
    logLoading.value = false
  }
}

const viewBorrowDetail = (record) => {
  currentBorrowRecord.value = { ...record }
  borrowDetailVisible.value = true
}

const handleClosed = () => {
  equipmentDetail.value = {}
  borrowRecords.value = []
  logList.value = []
  activeTab.value = 'basic'
  currentBorrowRecord.value = null
  borrowDetailVisible.value = false
  emit('close')
}

watch(() => props.visible, (newVal) => {
  if (newVal && props.equipmentId) {
    fetchEquipmentDetail()
    fetchBorrowRecords()
    fetchLogs()
  }
})
</script>

<style scoped>
.detail-container {
  min-height: 300px;
}

.info-descriptions {
  margin-top: 10px;
}

.table-section {
  margin-top: 10px;
}

.text-danger {
  color: #f56c6c;
  font-weight: 600;
}

:deep(.el-descriptions__label) {
  width: 100px;
  font-weight: 500;
  background-color: #fafafa;
}

:deep(.el-tag--light) {
  border: none;
}

:deep(.el-tag--light.el-tag--success) {
  background-color: #f0f9eb;
  color: #67c23a;
}

:deep(.el-tag--light.el-tag--warning) {
  background-color: #fdf6ec;
  color: #e6a23c;
}

:deep(.el-tag--light.el-tag--danger) {
  background-color: #fef0f0;
  color: #f56c6c;
}
</style>