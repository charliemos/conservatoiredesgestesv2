import { createRouter, createWebHashHistory } from 'vue-router';
import CataloguePage from '@/pages/CataloguePage.vue';
import MetiersPage from '@/pages/MetiersPage.vue';
import AboutPage from '@/pages/AboutPage.vue';
import SuiviPage from '@/pages/SuiviPage.vue';
import SuiviHome from '@/suivi/components/SuiviHome.vue';
import OperationForm from '@/suivi/components/OperationForm.vue';
import ProductionForm from '@/suivi/components/ProductionForm.vue';

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: CataloguePage },
    { path: '/metiers', component: MetiersPage },
    { path: '/about', component: AboutPage },
    {
      path: '/suivi',
      component: SuiviPage,
      children: [
        { path: '', component: SuiviHome },
        { path: 'operation/nouvelle', component: OperationForm, props: { mode: 'create' } },
        { path: 'operation/modifier', component: OperationForm, props: { mode: 'edit' } },
        { path: 'production/nouvelle', component: ProductionForm, props: { mode: 'create' } },
        { path: 'production/modifier', component: ProductionForm, props: { mode: 'edit' } },
      ],
    },
  ],
});
