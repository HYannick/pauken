import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import StatsView from './views/StatsView.vue'
import GameView from './views/GameView.vue'
import VocabView from './views/VocabView.vue'

export const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/', name: 'home', component: HomeView },
        { path: '/stats', name: 'stats', component: StatsView },
        { path: '/game', name: 'game', component: GameView },
        { path: '/vocab/:sectionId', name: 'vocab', component: VocabView },
    ],
})
