import { createRouter, createWebHistory } from 'vue-router'

import TematicaView from '../views/TematicaView.vue'
import VideoView from '../views/VideoView.vue'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/tematica',
      name: 'tematica',
      component: TematicaView
    },
    {
      path: '/video',
      name: 'video',
      component: VideoView
    }
  ]
});

export default router;