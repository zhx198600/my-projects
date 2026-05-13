<template>
  <div class="archive-list">
    <el-card>
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="档案列表" name="list">
          <ArchiveListContent />
        </el-tab-pane>
        <el-tab-pane label="归档审核" name="archive">
          <ArchiveAuditContent />
        </el-tab-pane>
        <el-tab-pane label="借阅管理" name="borrow">
          <BorrowManageContent />
        </el-tab-pane>
        <el-tab-pane label="销毁审核" name="destroy">
          <DestroyAuditContent />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ArchiveListContent from './ArchiveListContent.vue'
import ArchiveAuditContent from './ArchiveAuditContent.vue'
import BorrowManageContent from './BorrowManageContent.vue'
import DestroyAuditContent from './DestroyAuditContent.vue'

const activeTab = ref('list')

const handleTabChange = () => {
}
</script>

<style scoped>
.archive-list {
  padding: 20px;
}
</style>
