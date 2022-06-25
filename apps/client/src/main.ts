import { game } from './engine/instance'
game

import { createApp } from 'vue'
import { createRouter,createWebHistory } from 'vue-router';
import routes from 'voie-pages';
import "./assets/main.css"
import "./assets/progress.css"

import App from './App.vue'

const router = createRouter({
    history: createWebHistory(),
    routes
});

const app = createApp(App)
app.use(router)
app.mount('#app')
