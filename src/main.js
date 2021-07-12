import Vue from 'vue';
import { createApp } from 'vue'
import VueRouter from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router'
import bootstrap from 'bootstrap'
import VueTextareaAutosize from 'vue-textarea-autosize';

import './assets/global.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.css'

import AppManager from './core/util/AppManager';
import AppRoute from './components/AppRoute';
import AppEvent from './core/util/AppEvent.js';
import EventManager from './core/util/EventManager';
import ErrorPage from './components/common/ErrorPage';
import AccountModule from './components/account/AccountModule';
import BookmarkModule from './components/bookmark/BookmarkModule';
import DocModule from './components/doc/DocModule';
import CalendarModule from './components/calendar/CalendarModule';
import PhotoModule from './components/photo/PhotoModule';
import ContactModule from './components/contact/ContactModule';
import Landing from './components/Landing';
import TopNavigation from './components/layout/TopNavigation';
import SideNavigation from './components/layout/SideNavigation';
import SplitPanel from './components/layout/SplitPanel';
import Highlighter from './core/util/Highlighter';
import ContentHelper from './core/service/ContentHelper';

Vue.component('TopNavigation', TopNavigation);
Vue.component('SideNavigation', SideNavigation);
Vue.component('SplitPanel', SplitPanel);

Vue.config.productionTip = false;

Vue.use(bootstrap)
Vue.use(VueRouter);
Vue.use(ErrorPage);
Vue.use(VueTextareaAutosize);

// -------------------------------------------------------------------------------------------
// routes
// -------------------------------------------------------------------------------------------
let router;

const scrollBehavior = function (to, from, savedPosition) {
  if (savedPosition) {
    return savedPosition;
  } else {
    if (to.hash) {
      return {
        selector: to.hash
      }
    }
    return { x: 0, y: 0 }
  }
};

console.log('[App] creating router for web...');
router = createRouter({
  history: createWebHistory(__dirname),
  scrollBehavior,
  routes: [
    { name: 'landing', path: '/', component: Landing, meta: { requiresAuth: false } }
  ],
});

// router.addRoute(AccountModule.routes());
AccountModule.routes().forEach(r => router.addRoute(r))

AppRoute.base = 'organize';
BookmarkModule.routes(AppRoute.base).forEach(r => router.addRoute(r))
CalendarModule.routes(AppRoute.base).forEach(r => router.addRoute(r))
DocModule.routes(AppRoute.base).forEach(r => router.addRoute(r))
ContactModule.routes(AppRoute.base).forEach(r => router.addRoute(r))
PhotoModule.routes(AppRoute.base).forEach(r => router.addRoute(r))

EventManager.subscribe(AppEvent.ACCOUNT_SESSION_INACTIVE, () => {
  if (router.currentRoute.meta.requiresAuth !== false) {
    console.log('redirect to login page');
    // use index.html to make sure desktop app works
    window.location.replace('/')
  }
});

import App from './components/App.vue'
const app = createApp(App)
app.use(router)


// -------------------------------------------------------------------------------------------
// global filters
// -------------------------------------------------------------------------------------------
app.config.globalProperties.$filters = {
  npHighlighter(value, keyword) {
    return Highlighter.mark(value, keyword)
  },
  npTranslate(value) {
    if (!value) return '';
    return ContentHelper.translate(value);
  }
}


import AppError from './components/AppError'

let initPromises = [AppManager.serviceLocate(), AppManager.initClient('browser')];

Promise.all(initPromises).then(() => {
  app.mount('#app');
}).catch((error) => {
  console.error(error);
  const appError = createApp(AppError)
  appError.mount('#app');
});
