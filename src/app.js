import Vue from 'vue';
import VueRouter from 'vue-router';
import BootstrapVue from 'bootstrap-vue'
import FullCalendar from 'vue-full-calendar';
import VueTextareaAutosize from 'vue-textarea-autosize';

import './assets/global.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/fullcalendar/dist/fullcalendar.min.css';

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
import UploaderModal from './components/common/UploaderModal';
import CmsService from './core/service/CmsService';

Vue.component('TopNavigation', TopNavigation);
Vue.component('SideNavigation', SideNavigation);
Vue.component('SplitPanel', SplitPanel);

Vue.config.productionTip = false;

Vue.use(BootstrapVue);
Vue.use(VueRouter);
Vue.use(ErrorPage);
Vue.use(FullCalendar);
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

// window.DESKTOP is set in index.html. index.html is built in desktop/prebuild.js
if (window.NP_DESKTOP) {
  console.log('[App] creating router for desktop...');
  router = new VueRouter({
    base: __dirname,
    routes: [
      { name: 'landing', path: '/', component: Landing, meta: { requiresAuth: false } }
    ],
    scrollBehavior
  });
} else {
  console.log('[App] creating router for web...');
  router = new VueRouter({
    mode: 'history',
    base: __dirname,
    scrollBehavior,
    routes: [
      { name: 'landing', path: '/', component: Landing, meta: { requiresAuth: false } }
    ],
  });
}

router.addRoutes(AccountModule.routes());

AppRoute.base = 'organize';
router.addRoutes(BookmarkModule.routes(AppRoute.base));
router.addRoutes(CalendarModule.routes(AppRoute.base));
router.addRoutes(DocModule.routes(AppRoute.base));
router.addRoutes(PhotoModule.routes(AppRoute.base));
router.addRoutes(ContactModule.routes(AppRoute.base));

EventManager.subscribe(AppEvent.ACCOUNT_SESSION_INACTIVE, () => {
  if (router.currentRoute.meta.requiresAuth === false) {
  } else {
    console.log('redirect to login page');
    // use index.html to make sure desktop app works
    window.location.replace('/')
  }
});

// -------------------------------------------------------------------------------------------
// global filter
// -------------------------------------------------------------------------------------------
Vue.filter('npTranslate', function (value) {
  if (!value) return '';
  return CmsService.getCmsValue(value);
})

//// create the instance
var app = new Vue({
  router,
  template: `
  <div class="container-fluid">
    <uploader-modal ref="uploaderRef" />
    <top-navigation />
    <router-view class="view"></router-view>
  </div>
  `,
  components: { UploaderModal }
});

EventManager.subscribe(AppEvent.SHOW_UPLOADER, (appEvent) => {
  app.$refs.uploaderRef.showUploader(appEvent.affectedItem);
});

let tryAgain = '<a href="/">Try again.</a>';
if (window.NP_DESKTOP) {
  tryAgain = 'Use file -> reload to retry.'
}
let errorInstance = new Vue({
  template: `
    <div class="container-fluid">
      <top-navigation />
      <div class="row" style="margin-top:120px;">
        Cannot connect to the service. Either the service is down or internet connection is not available.
        &nbsp; ${tryAgain}
      </div>
    </div>
  `
});

let initPromises = [AppManager.serviceLocate(), AppManager.initClient()];

Promise.all(initPromises).then(() => {
  app.$mount('#app');
}).catch((error) => {
  console.error(error);
  errorInstance.$mount('#app');
});
