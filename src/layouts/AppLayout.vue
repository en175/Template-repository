<template>
  <div class="app-shell">
    <header class="app-topbar">
      <div class="app-brand">
        <span>系统模板</span>
        <span class="subtle">Vue3 + Vite + Element Plus</span>
      </div>
      <div class="table-ops">
        <el-tag v-if="useMock" type="info" effect="light">Mock数据</el-tag>
        <el-tag v-else type="success" effect="light">真实接口</el-tag>
        <el-switch v-model="useMock" inline-prompt active-text="Mock" inactive-text="API" @change="onModeChange" />
      </div>
    </header>
    <main class="app-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUseMock, setUseMock } from '../services/runtimeMode'

const router = useRouter()
const route = useRoute()

const useMock = computed({
  get: () => getUseMock(),
  set: (v) => setUseMock(v)
})

function onModeChange() {
  router.replace({ path: route.path, query: { ...route.query, t: Date.now().toString() } })
}
</script>
