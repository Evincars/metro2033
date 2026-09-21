import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'vdnch',
    component: () => import('../views/HomeView.vue'),
    meta: { label: 'VDNCh', code: '01', leftMenu: true },
  },
  {
    path: '/map',
    name: 'map',
    component: () => import('../views/MapView.vue'),
    meta: { label: 'Metro Map', code: '02', leftMenu: true },
  },
  {
    path: '/stations',
    name: 'stations',
    component: () => import('../views/StationsView.vue'),
    meta: { label: 'Stations', code: '03', leftMenu: true },
  },
  {
    path: '/factions',
    name: 'factions',
    component: () => import('../views/FactionsView.vue'),
    meta: { label: 'Factions', code: '04', leftMenu: true },
  },
  {
    path: '/chronicles',
    name: 'chronicles',
    component: () => import('../views/ChroniclesView.vue'),
    meta: { label: 'Chronicles', code: '05', leftMenu: true },
  },
  {
    path: '/levels',
    name: 'levels',
    component: () => import('../views/LevelsView.vue'),
    meta: { label: 'Levels', code: '06', leftMenu: true },
  },
  {
    path: '/levels/:id',
    name: 'level-detail',
    component: () => import('../views/LevelsView.vue'),
    meta: { label: 'Levels' },
  },
  {
    path: '/games',
    name: 'games',
    component: () => import('../views/GamesView.vue'),
    meta: { label: 'Games' },
  },
  {
    path: '/books',
    name: 'books',
    component: () => import('../views/BooksView.vue'),
    meta: { label: 'Books' },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: { label: 'About' },
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
