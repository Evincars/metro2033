import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'vdnh',
    component: () => import('../views/HomeView.vue'),
    meta: { label: 'VDNH', code: '01', leftMenu: true },
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
    path: '/factions/:id',
    name: 'faction-detail',
    component: () => import('../views/FactionsView.vue'),
    meta: { label: 'Factions', leftMenu: true },
  },
  {
    path: '/events',
    name: 'events',
    component: () => import('../views/EventsView.vue'),
    meta: { label: 'Events', code: '05', leftMenu: true },
  },
  {
    path: '/events/:id',
    name: 'event-detail',
    component: () => import('../views/EventsView.vue'),
    meta: { label: 'Events', leftMenu: true },
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
    meta: { label: 'Levels', leftMenu: true },
  },
  {
    path: '/locations',
    name: 'locations',
    component: () => import('../views/LocationsView.vue'),
    meta: { label: 'Locations', code: '07', leftMenu: true },
  },
  {
    path: '/locations/:id',
    name: 'location-detail',
    component: () => import('../views/LocationsView.vue'),
    meta: { label: 'Locations', leftMenu: true },
  },
  {
    path: '/metro-line/:id',
    name: 'metro-line',
    component: () => import('../views/MetroLineView.vue'),
    meta: { label: 'Locations', leftMenu: true },
  },
  {
    path: '/characters',
    name: 'characters',
    component: () => import('../views/CharactersView.vue'),
    meta: { label: 'Characters', code: '08', leftMenu: true },
  },
  {
    path: '/characters/:id',
    name: 'character-detail',
    component: () => import('../views/CharactersView.vue'),
    meta: { label: 'Characters', leftMenu: true },
  },
  {
    path: '/mutants',
    name: 'mutants',
    component: () => import('../views/MutantsView.vue'),
    meta: { label: 'Mutants', code: '09', leftMenu: true },
  },
  {
    path: '/mutants/:id',
    name: 'mutant-detail',
    component: () => import('../views/MutantsView.vue'),
    meta: { label: 'Mutants', leftMenu: true },
  },
  {
    path: '/equipment',
    name: 'equipment',
    component: () => import('../views/EquipmentView.vue'),
    meta: { label: 'Equipment', code: '10', leftMenu: true },
  },
  {
    path: '/equipment/:id',
    name: 'equipment-detail',
    component: () => import('../views/EquipmentView.vue'),
    meta: { label: 'Equipment', leftMenu: true },
  },
  {
    path: '/weapons',
    name: 'weapons',
    component: () => import('../views/WeaponsView.vue'),
    meta: { label: 'Weapons', code: '11', leftMenu: true },
  },
  {
    path: '/weapons/:id',
    name: 'weapon-detail',
    component: () => import('../views/WeaponsView.vue'),
    meta: { label: 'Weapons', leftMenu: true },
  },
  {
    path: '/ammunition',
    name: 'ammunition',
    component: () => import('../views/AmmunitionView.vue'),
    meta: { label: 'Ammunition', code: '12', leftMenu: true },
  },
  {
    path: '/ammunition/:id',
    name: 'ammo-detail',
    component: () => import('../views/AmmunitionView.vue'),
    meta: { label: 'Ammunition', leftMenu: true },
  },
  {
    path: '/vehicles',
    name: 'vehicles',
    component: () => import('../views/VehiclesView.vue'),
    meta: { label: 'Vehicles', code: '13', leftMenu: true },
  },
  {
    path: '/vehicles/:id',
    name: 'vehicle-detail',
    component: () => import('../views/VehiclesView.vue'),
    meta: { label: 'Vehicles', leftMenu: true },
  },
  {
    path: '/achievements',
    name: 'achievements',
    component: () => import('../views/AchievementsView.vue'),
    meta: { label: 'Achievements', code: '14', leftMenu: true },
  },
  {
    path: '/achievements/:id',
    name: 'achievement-detail',
    component: () => import('../views/AchievementsView.vue'),
    meta: { label: 'Achievements', leftMenu: true },
  },
  {
    path: '/endings',
    name: 'endings',
    component: () => import('../views/EndingsView.vue'),
    meta: { label: 'Endings', code: '15', leftMenu: true },
  },
  {
    path: '/endings/:id',
    name: 'ending-detail',
    component: () => import('../views/EndingsView.vue'),
    meta: { label: 'Endings', leftMenu: true },
  },
  {
    path: '/real-metro',
    name: 'real-metro',
    component: () => import('../views/RealMetroView.vue'),
    meta: { label: 'Real Moscow Metro', code: '16', leftMenu: true },
  },
  {
    path: '/real-metro/:id',
    name: 'real-metro-detail',
    component: () => import('../views/RealMetroView.vue'),
    meta: { label: 'Real Moscow Metro', leftMenu: true },
  },
  {
    path: '/games',
    name: 'games',
    component: () => import('../views/GamesView.vue'),
    meta: { label: 'Games' },
  },
  {
    path: '/games/:id',
    name: 'game-detail',
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
    path: '/books/:id',
    name: 'book-detail',
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
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    // In-page anchors such as #disqus_thread (comment-count links).
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

export default router
