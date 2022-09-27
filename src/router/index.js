
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import(/* webpackChunkName: "about" */ '../components/TranslatedLanguages.vue')
  },
  {
    path: '/review/:locale',
    name: 'review',
    component: () => import(/* webpackChunkName: "about" */ '../components/ReviewTranslations.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
