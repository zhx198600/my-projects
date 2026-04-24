
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import FortuneTelling from '../views/FortuneTelling.vue'
import Personality from '../views/Personality.vue'
import DailyFortune from '../views/DailyFortune.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/fortune-telling',
    name: 'FortuneTelling',
    component: FortuneTelling
  },
  {
    path: '/personality',
    name: 'Personality',
    component: Personality
  },
  {
    path: '/daily-fortune',
    name: 'DailyFortune',
    component: DailyFortune
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
