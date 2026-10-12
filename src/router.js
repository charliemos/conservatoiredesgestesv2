import { createRouter, createWebHashHistory } from 'vue-router';
import CataloguePage from '@/pages/CataloguePage.vue';
import MetiersPage from '@/pages/MetiersPage.vue';
import AboutPage from '@/pages/AboutPage.vue';

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: CataloguePage },
    { path: '/metiers', component: MetiersPage },
    { path: '/about', component: AboutPage },
  ],
});
