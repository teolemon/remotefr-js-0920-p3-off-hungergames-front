import Vue from 'vue'
import VueRouter from 'vue-router'
import Viewer from 'v-viewer'
import App from './App.vue'
import QuestionView from './views/QuestionView.vue'
import NutritionView from './views/NutritionView.vue'
import SettingsView from './views/SettingsView.vue'
import InsightListView from './views/InsightListView.vue'
import LogoSearchView from './views/LogoSearchView.vue'
import LogoAnnotationView from './views/LogoAnnotationView.vue'
import LogoUpdateView from './views/LogoUpdateView.vue'
import 'viewerjs/dist/viewer.css'
import SuiVue from 'semantic-ui-vue'

Vue.use(SuiVue)
Vue.use(VueRouter)
Vue.use(Viewer)
Vue.config.productionTip = false


const routes = [
  { path: '/', redirect: '/questions' },
  { path: '/insights', component: InsightListView },
  { path: '/questions', component: QuestionView },
  { path: '/nutritions', component: NutritionView },
  { path: '/settings', component: SettingsView },
  { path: '/logos', component: LogoAnnotationView },
  { path: '/logos/search', component: LogoSearchView },
  { path: '/logos/:id', component: LogoUpdateView },
];

const router = new VueRouter({
  mode: 'history',
  routes,
});
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
