import Vue from 'vue'
import store from '@/store/index'
import { getLocalStorage } from '@utils'
import Router from 'vue-router'

Vue.use(Router)
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(() => {})
}

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import(/* webpackChunkName: "home" */ '@views/Login.vue')
  },
  {
    path: '/ExpertList',
    name: 'ExpertList',
    component: () => import(/* webpackChunkName: "home" */ '@views/ExpertList.vue')
  },
  {
    path: '/ExpertDetails',
    name: 'ExpertDetails',
    component: () => import(/* webpackChunkName: "home" */ '@views/ExpertDetails.vue')
  },
  {
    path: '/ExpertServiceCenter',
    name: 'ExpertServiceCenter',
    component: () => import(/* webpackChunkName: "home" */ '@views/ExpertServiceCenter.vue')
  },
  {
    path: '/OrderList',
    name: 'OrderList',
    component: () => import(/* webpackChunkName: "home" */ '@views/OrderList.vue')
  }
]
const router = new Router({
  base: process.env.BUILD_BASE_API,
  mode: 'hash',
  routes
})
router.beforeEach((to, from, next) => {
  if (Object.keys(getLocalStorage('STOREINFO') || {}).length === 0) {
    if (to.path === '/') {
      next()
    } else {
      next('/')
    }
  } else {
    store.commit('SET_STORE_INFO', getLocalStorage('STOREINFO'))
    store.commit('SET_USER_INFO', getLocalStorage('USERINFO'))
    if (to.path === '/') {
      if (from.path === '/') {
        next('/ExpertList')
      } else {
        next(false)
      }
    } else {
      next()
    }
  }
})
export default router
