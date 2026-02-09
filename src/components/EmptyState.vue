<template>
  <div style="padding: 40px 0; text-align: center">
    <div style="font-weight: 700; font-size: 16px">{{ title }}</div>
    <div class="subtle" style="margin-top: 8px">{{ description }}</div>
    <div v-if="$slots.action" style="margin-top: 16px">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '暂无数据' },
  description: { type: String, default: '可以调整筛选条件，或新建一条记录' }
})
</script>
