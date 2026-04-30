import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UploadView from '../views/UploadView.vue'
import QuestionSelectView from '../views/QuestionSelectView.vue'
import SolveView from '../views/SolveView.vue'
import MistakeBookView from '../views/MistakeBookView.vue'
import PracticeView from '../views/PracticeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/upload',
    name: 'upload',
    component: UploadView
  },
  {
    path: '/question-select',
    name: 'question-select',
    component: QuestionSelectView
  },
  {
    path: '/solve',
    name: 'solve',
    component: SolveView
  },
  {
    path: '/mistake-book',
    name: 'mistake-book',
    component: MistakeBookView
  },
  {
    path: '/practice',
    name: 'practice',
    component: PracticeView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
