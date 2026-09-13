import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { label: 'Surface', code: '01', showInNav: true },
  },
  {
    path: '/map',
    name: 'map',
    component: () => import('../views/MapView.vue'),
    meta: { label: 'Metro Map', code: '02', showInNav: true },
  },
  {
    path: '/stations',
    name: 'stations',
    component: () => import('../views/StationsView.vue'),
    meta: { label: 'Stations', code: '03', showInNav: true },
  },
  {
    path: '/factions',
    name: 'factions',
    component: () => import('../views/FactionsView.vue'),
    meta: { label: 'Factions', code: '04', showInNav: true },
  },
  {
    path: '/chronicles',
    name: 'chronicles',
    component: () => import('../views/ChroniclesView.vue'),
    meta: { label: 'Chronicles', code: '05', showInNav: true },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: { label: 'Dossier', code: '06', showInNav: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
    meta: { showInNav: false },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
