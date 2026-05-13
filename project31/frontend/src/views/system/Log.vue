<template>
  <div class="page-container">
    <el-card>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="操作">
          <el-input v-model="searchForm.operation" placeholder="请输入操作" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border style="width: 100%; margin-top: 20px">
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="operation" label="操作" width="150" />
        <el-table-column prop="method" label="请求方法" width="100" />
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column prop="time" label="耗时(ms)" width="100" />
        <el-table-column prop="createTime" label="操作时间" width="180" />
      </el-table>

      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        @size-change="handleSearch"
        @current-change="handleSearch"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getLogList } from '../../api/log'

const searchForm = reactive({
  username: '',
  operation: ''
})
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref([])

const loadData = async () => {
  const res = await getLogList({
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    username: searchForm.username,
    operation: searchForm.operation
  })
  tableData.value = res.data.records
  total.value = res.data.total
}

const handleSearch = () => {
  pageNum.value = 1
  loadData()
}

const handleReset = () => {
  searchForm.username = ''
  searchForm.operation = ''
  handleSearch()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.search-form {
  margin-bottom: 20px;
}
</style>
