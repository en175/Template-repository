<template>
  <AppLayout>
    <div class="panel">
      <div class="panel-hd">
        <div>
          <div style="font-weight: 800; font-size: 16px">记录管理（模板示例）</div>
          <div class="subtle" style="margin-top: 4px">上筛选-中列表-右侧详情抽屉；含新增/编辑弹窗</div>
        </div>
        <div class="table-ops">
          <el-button type="primary" @click="openCreate">新增</el-button>
        </div>
      </div>
      <div class="panel-bd">
        <div class="filters">
          <el-input v-model="filters.keyword" placeholder="标题/编号/负责人" clearable @keyup.enter="onSearch" />
          <el-select v-model="filters.status" placeholder="状态" clearable>
            <el-option v-for="s in statuses" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
          <el-button type="primary" :loading="loading" @click="onSearch">搜索</el-button>
          <el-button :disabled="loading" @click="onReset">重置</el-button>
        </div>

        <div style="margin-top: 16px">
          <el-table v-loading="loading" :data="rows" height="520" @row-click="openDetail">
            <el-table-column prop="id" label="编号" width="100" />
            <el-table-column label="标题" min-width="220">
              <template #default="{ row }">
                <div class="truncate" :title="row.title">{{ row.title }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="owner" label="负责人" width="120" />
            <el-table-column label="金额" width="120" align="right">
              <template #default="{ row }">{{ formatMoney(row.amount) }}</template>
            </el-table-column>
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="getStatusMeta(row.status).tagType" effect="light">{{ getStatusMeta(row.status).label }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="更新时间" width="180">
              <template #default="{ row }">{{ formatTime(row.updatedAt) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click.stop="openEdit(row)">编辑</el-button>
                <el-button link type="danger" :disabled="row.status === 'done'" @click.stop="onDelete(row)">删除</el-button>
              </template>
            </el-table-column>
            <template #empty>
              <EmptyState>
                <template #action>
                  <el-button type="primary" @click="openCreate">新建记录</el-button>
                </template>
              </EmptyState>
            </template>
          </el-table>
        </div>

        <div style="margin-top: 12px; display: flex; justify-content: flex-end">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50]"
            background
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="onSearch"
            @current-change="onSearch"
          />
        </div>
      </div>
    </div>

    <el-drawer v-model="detail.open" size="600" destroy-on-close>
      <template #header>
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%">
          <div style="font-weight: 800">详情</div>
          <el-button type="primary" plain @click="openEdit(detail.data)">编辑</el-button>
        </div>
      </template>
      <div v-loading="detail.loading">
        <el-descriptions v-if="detail.data" :column="1" border>
          <el-descriptions-item label="编号">{{ detail.data.id }}</el-descriptions-item>
          <el-descriptions-item label="标题">{{ detail.data.title }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ detail.data.owner || '-' }}</el-descriptions-item>
          <el-descriptions-item label="金额">{{ formatMoney(detail.data.amount) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusMeta(detail.data.status).tagType" effect="light">
              {{ getStatusMeta(detail.data.status).label }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatTime(detail.data.updatedAt) }}</el-descriptions-item>
        </el-descriptions>
        <div v-else class="subtle">-</div>
      </div>
    </el-drawer>

    <el-dialog v-model="form.open" :title="form.title" width="720" destroy-on-close>
      <el-form ref="formRef" :model="form.model" :rules="rules" label-width="96px" status-icon>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.model.title" placeholder="请输入标题" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="负责人" prop="owner">
          <el-input v-model="form.model.owner" placeholder="如：张三" maxlength="20" />
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input-number v-model="form.model.amount" :min="0" :precision="2" :step="100" style="width: 220px" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.model.status" placeholder="请选择状态" style="width: 220px">
            <el-option v-for="s in statuses" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :disabled="form.submitting" @click="form.open = false">取消</el-button>
        <el-button type="primary" :loading="form.submitting" @click="onSubmit">保存</el-button>
      </template>
    </el-dialog>
  </AppLayout>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AppLayout from '../layouts/AppLayout.vue'
import EmptyState from '../components/EmptyState.vue'
import { deleteRecord, fetchRecordDetail, fetchRecords, upsertRecord } from '../api/records'
import { getStatusMeta, listStatuses } from '../data/mockRecords'

const statuses = listStatuses()

const loading = ref(false)
const rows = ref([])
const filters = reactive({ keyword: '', status: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const detail = reactive({ open: false, loading: false, data: null })

const formRef = ref()
const form = reactive({
  open: false,
  title: '新增',
  submitting: false,
  model: { id: '', title: '', owner: '', amount: 1000, status: 'draft' }
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  owner: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

onMounted(() => {
  onSearch()
})

async function onSearch() {
  loading.value = true
  try {
    const res = await fetchRecords({
      keyword: filters.keyword,
      status: filters.status,
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    rows.value = res.list || []
    pagination.total = res.total || 0
  } catch (e) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function onReset() {
  filters.keyword = ''
  filters.status = ''
  pagination.page = 1
  onSearch()
}

async function openDetail(row) {
  if (!row?.id) return
  detail.open = true
  detail.loading = true
  detail.data = null
  try {
    detail.data = await fetchRecordDetail(row.id)
  } catch (e) {
    ElMessage.error(e?.message || '加载详情失败')
  } finally {
    detail.loading = false
  }
}

function openCreate() {
  form.title = '新增'
  form.model = { id: '', title: '', owner: '', amount: 1000, status: 'draft' }
  form.open = true
  formRef.value?.clearValidate?.()
}

function openEdit(row) {
  const r = row || detail.data
  if (!r) return
  form.title = '编辑'
  form.model = { id: r.id, title: r.title, owner: r.owner, amount: r.amount, status: r.status }
  form.open = true
  formRef.value?.clearValidate?.()
}

async function onSubmit() {
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  form.submitting = true
  try {
    await upsertRecord(form.model)
    ElMessage.success('保存成功')
    form.open = false
    await onSearch()
    if (detail.open && detail.data?.id) {
      detail.data = await fetchRecordDetail(detail.data.id)
    }
  } catch (e) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    form.submitting = false
  }
}

async function onDelete(row) {
  try {
    await ElMessageBox.confirm('删除后不可恢复，确认删除？', '危险操作确认', {
      type: 'warning',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      autofocus: false
    })
  } catch {
    return
  }

  try {
    loading.value = true
    await deleteRecord(row.id)
    ElMessage.success('已删除')
    if (detail.open && detail.data?.id === row.id) detail.open = false
    await onSearch()
  } catch (e) {
    ElMessage.error(e?.message || '删除失败')
  } finally {
    loading.value = false
  }
}

function formatMoney(v) {
  const n = Number(v)
  if (Number.isNaN(n)) return '-'
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatTime(s) {
  if (!s) return '-'
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return '-'
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
</script>
