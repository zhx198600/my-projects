<template>
  <div class="layout-container">
    <el-container>
      <el-aside width="220px" class="sidebar">
        <div class="logo">联华保险</div>
        <el-menu
          :default-active="$route.path"
          :collapse="isCollapse"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409eff"
        >
          <template v-for="menu in menuList" :key="menu.id">
            <el-sub-menu v-if="menu.children && menu.children.length" :index="menu.path">
              <template #title>
                <el-icon><component :is="menu.icon || 'Menu'" /></el-icon>
                <span>{{ menu.menuName }}</span>
              </template>
              <el-menu-item v-for="child in menu.children" :key="child.id" :index="child.path">
                <el-icon><component :is="child.icon || 'Document'" /></el-icon>
                <span>{{ child.menuName }}</span>
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item v-else :index="menu.path">
              <el-icon><component :is="menu.icon || 'Document'" /></el-icon>
              <span>{{ menu.menuName }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="header">
          <div class="header-left">
            <el-button @click="toggleCollapse" link>
              <el-icon :size="20"><Fold /></el-icon>
            </el-button>
            <el-autocomplete
              v-model="searchKeyword"
              class="global-search"
              :fetch-suggestions="handleSearchSuggest"
              placeholder="搜索客户、销售、档案、工单..."
              size="large"
              clearable
              @select="handleSelectResult"
              @keyup.enter="handleSearch"
            >
              <template #default="{ item }">
                <div class="search-suggest-item">
                  <el-tag size="small" type="info" class="module-tag">{{ item.moduleName }}</el-tag>
                  <span class="item-title">{{ item.name || item.opportunityName || item.title || item.archiveNo }}</span>
                </div>
              </template>
              <template #append>
                <el-button :icon="Search" @click="handleSearch" />
              </template>
            </el-autocomplete>
          </div>
          <div class="header-right">
            <span class="user-name">{{ userStore.realName || userStore.username }}</span>
            <el-button @click="logout" link>退出</el-button>
          </div>
        </el-header>
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>

    <el-dialog
      v-model="searchDialogVisible"
      title="全局搜索结果"
      width="80%"
      top="5vh"
    >
      <el-empty v-if="!searchResults || searchResults.total === 0" description="未找到匹配结果" />
      <div v-else>
        <el-tabs v-model="activeTab" type="card">
          <el-tab-pane label="全部" name="all">
            <div class="search-result-section" v-if="searchResults.customers?.length">
              <h4>客户信息 ({{ resultStats.customer || 0 }})</h4>
              <el-card shadow="hover" v-for="item in searchResults.customers" :key="'c_' + item.id" class="result-card" @click="goToDetail(item)">
                <div class="result-title">{{ item.name }}</div>
                <div class="result-desc">{{ item.phone }} | {{ item.address }}</div>
              </el-card>
            </div>
            <div class="search-result-section" v-if="searchResults.salesOpportunities?.length">
              <h4>销售机会 ({{ resultStats.sales || 0 }})</h4>
              <el-card shadow="hover" v-for="item in searchResults.salesOpportunities" :key="'s_' + item.id" class="result-card" @click="goToDetail(item)">
                <div class="result-title">{{ item.opportunityName }}</div>
                <div class="result-desc">客户: {{ item.customerName }} | 预估金额: ¥{{ item.expectedAmount }}</div>
              </el-card>
            </div>
            <div class="search-result-section" v-if="searchResults.archives?.length">
              <h4>客户档案 ({{ resultStats.archive || 0 }})</h4>
              <el-card shadow="hover" v-for="item in searchResults.archives" :key="'a_' + item.id" class="result-card" @click="goToDetail(item)">
                <div class="result-title">{{ item.archiveNo }} - {{ item.name }}</div>
                <div class="result-desc">客户: {{ item.customerName }} | 分类: {{ item.category }}</div>
              </el-card>
            </div>
            <div class="search-result-section" v-if="searchResults.serviceTickets?.length">
              <h4>服务工单 ({{ resultStats.ticket || 0 }})</h4>
              <el-card shadow="hover" v-for="item in searchResults.serviceTickets" :key="'t_' + item.id" class="result-card" @click="goToDetail(item)">
                <div class="result-title">{{ item.ticketNo }} - {{ item.title }}</div>
                <div class="result-desc">客户: {{ item.customerName }} | {{ item.customerPhone }}</div>
              </el-card>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { storeToRefs } from 'pinia'
import { Fold, Expand, Search } from '@element-plus/icons-vue'
import { searchSuggest, globalSearch } from '../api/search'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const router = useRouter()
const { menuList } = storeToRefs(userStore)
const isCollapse = ref(false)
const searchKeyword = ref('')
const searchDialogVisible = ref(false)
const activeTab = ref('all')
const searchResults = ref(null)
const resultStats = ref({})

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const logout = () => {
  userStore.logout()
}

const debounce = (fn, delay) => {
  let timer = null
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

const handleSearchSuggest = debounce(async (queryString, callback) => {
  if (!queryString.trim()) {
    callback([])
    return
  }
  try {
    const res = await searchSuggest(queryString)
    const suggestions = []
    if (res.data?.customers) suggestions.push(...res.data.customers)
    if (res.data?.salesOpportunities) suggestions.push(...res.data.salesOpportunities)
    if (res.data?.archives) suggestions.push(...res.data.archives)
    if (res.data?.serviceTickets) suggestions.push(...res.data.serviceTickets)
    callback(suggestions.slice(0, 10))
  } catch (e) {
    callback([])
  }
}, 300)

const handleSelectResult = (item) => {
  goToDetail(item)
}

const goToDetail = (item) => {
  const routes = {
    customer: '/customer/list',
    sales: '/sales/opportunity',
    archive: '/archive/list',
    ticket: '/service/ticket'
  }
  searchDialogVisible.value = false
  router.push(routes[item.module])
  ElMessage.success(`跳转到${item.moduleName}模块`)
}

const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  searchDialogVisible.value = true
  try {
    const res = await globalSearch({
      keyword: searchKeyword.value,
      module: activeTab.value,
      pageNum: 1,
      pageSize: 100
    })
    searchResults.value = res.data
    resultStats.value = res.data?.moduleStats || {}
  } catch (e) {
    ElMessage.error('搜索失败')
  }
}

onMounted(async () => {
  if (menuList.value.length === 0) {
    await userStore.loadMenus()
  }
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  overflow-y: auto;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #1f2d3d;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-name {
  color: #666;
}

.main-content {
  background: #f0f2f5;
}

.global-search {
  width: 450px;
  margin-left: 10px;
}

.search-suggest-item {
  display: flex;
  align-items: center;
  gap: 8px;
  line-height: 1.5;
}

.module-tag {
  flex-shrink: 0;
}

.item-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-result-section {
  margin-bottom: 20px;
}

.search-result-section h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 14px;
}

.result-card {
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.result-card:hover {
  transform: translateX(5px);
}

.result-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.result-desc {
  font-size: 12px;
  color: #909399;
}
</style>
