import { createRouter, createWebHashHistory } from 'vue-router'
import RecordsView from '../views/RecordsView.vue'

const routes = [
  { path: '/', redirect: '/records' },
  { path: '/records', name: 'records', component: RecordsView }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
