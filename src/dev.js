import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue'
import VueRouter from 'vue-router';
import FullCalendar from 'vue-full-calendar';

import './assets/global.css';

// https://github.com/CroudTech/vue-fullcalendar
import '../node_modules/fullcalendar/dist/fullcalendar.min.css';

import NPModule from './core/datamodel/NPModule';
import AppRoute from './components/AppRoute';
import ErrorPage from './components/common/ErrorPage';
import TopNavigation from './components/lab/TopNavigation';
import SideNavigation from './components/layout/SideNavigation';
import Login from './components/account/Login';
import List from './components/common/List';
import InfiniteList from './components/common/InfiniteList';
import BookmarkModule from './components/bookmark/BookmarkModule';
import BookmarkDev from './components/lab/BookmarkDev';
import DocModule from './components/doc/DocModule';
import DocDev from './components/lab/DocDev';
import CalendarDev from './components/lab/CalendarDev';
import CalendarModule from './components/calendar/CalendarModule';
import FolderTree from './components/folder/FolderTree';
import FolderTreeDropDown from './components/folder/FolderTreeDropDown';
import ComponentIntro from './components/lab/ComponentIntro';
import AutoCompletion from './components/lab/AutoCompletion';
import Uploaders from './components/lab/Uploaders';
import PhotoModule from './components/photo/PhotoModule';
import PhotoDev from './components/lab/PhotoDev';
import ContactModule from './components/contact/ContactModule';
import ContactDev from './components/lab/ContactDev';
import RestClient from './core/util/RestClient';
import StorageUtils from './core/util/StorageUtils';
import AccountService from './core/service/AccountService';

Vue.config.productionTip = false;

Vue.component('TopNavigation', TopNavigation);
Vue.component('SideNavigation', SideNavigation);

Vue.use(BootstrapVue);
Vue.use(VueRouter);
Vue.use(FullCalendar);

const router = new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: [
    { path: '/dev/', component: ComponentIntro },
    { path: '/dev/error', component: ErrorPage, props: true },
    { path: '/dev/login', component: Login },
    { path: '/dev/list', component: List, props: { moduleId: NPModule.BOOKMARK } },
    { path: '/dev/infinitelist', component: InfiniteList, props: { moduleId: NPModule.DOC } },
    { path: '/dev/foldertree', component: FolderTree, props: { moduleId: NPModule.BOOKMARK } },
    { path: '/dev/foldertreedropdown', component: FolderTreeDropDown, props: { moduleId: NPModule.BOOKMARK } },
    { path: '/dev/autocomplete', component: AutoCompletion },
    { path: '/dev/uploaders', component: Uploaders },
    { path: '/dev/bookmark', component: BookmarkDev },
    { path: '/dev/calendar', component: CalendarDev },
    { path: '/dev/doc', component: DocDev },
    { path: '/dev/contact', component: ContactDev },
    { path: '/dev/photo', component: PhotoDev }
  ]
})

AppRoute.base = 'dev';

router.addRoutes(BookmarkModule.routes(AppRoute.base));
router.addRoutes(CalendarModule.routes(AppRoute.base));
router.addRoutes(DocModule.routes(AppRoute.base));
router.addRoutes(PhotoModule.routes(AppRoute.base));
router.addRoutes(ContactModule.routes(AppRoute.base));

let appInstance = new Vue({
  router,
  template: `
    <div class="container-fluid">
      <TopNavigation />
      <div class="row" style="margin-top:60px;">
        <div class="col-sm-2">
          <div style="position:sticky; top:5px;">
            <ul>
              <li>
                <router-link to="/dev/login">account</router-link>
              </li>
              <li>
                common
                <ul>
                  <li><router-link to="/dev/bookmark/search?keyword=test">search</router-link></li>
                  <li><router-link to="/dev/list">list</router-link></li>
                  <li><router-link to="/dev/infinitelist">infinitelist</router-link></li>
                  <li><router-link to="/dev/foldertree">foldertree</router-link></li>
                  <li><router-link to="/dev/foldertreedropdown">foldertree dropdown</router-link></li>
                  <li><router-link to="/dev/calendar/101/update">Update folder</router-link></li>
                  <li><router-link to="/dev/autocomplete">Auto completion</router-link></li>
                  <li><router-link to="/dev/uploaders">Uploaders</router-link></li>
                </ul>
              </li>
              <li>
                <router-link to="/dev/bookmark">bookmark</router-link>
                <ul>
                  <li><router-link to="/dev/bookmark/add">add</router-link></li>
                  <li><router-link to="/dev/bookmark/8Hyig/edit">8Hyig/edit</router-link></li>
                </ul>
              </li>
              <li>
                <router-link to="/dev/calendar">Calendar</router-link>
                <ul>
                  <li><router-link to="/dev/calendar/add">Add</router-link></li>
                  <li><router-link to="/dev/calendar/o5Fcr/edit">Edit</router-link></li>
                </ul>
              </li>
              <li>
                <router-link to="/dev/doc">Docs</router-link>
                <ul>
                  <li><router-link to="/dev/doc/edit">Edit Doc</router-link></li>
                </ul>
              </li>
              <li>
                <router-link to="/dev/contact">Contact</router-link>
                <ul>
                  <li><router-link to="/dev/contact/add">Add</router-link></li>
                  <li><router-link to="/dev/contact/UhVy3/edit">Edit</router-link></li>
                </ul>
              </li>
              <li><router-link to="/dev/photo">Photos</router-link></li>
            </ul>
          </div>
        </div>
        <div class="col-sm-10">
          <router-view class="view"></router-view>
        </div>
      </div>
    </div>
  `
});

let errorInstance = new Vue({
  template: `
    <div class="container-fluid">
      <TopNavigation />
      <div class="row" style="margin-top:60px;">
        Cannot find any healthy service endpoint.
      </div>
    </div>
  `
});

RestClient.serviceLocate().then(() => {
  let sessionId = StorageUtils.getCookieValue(StorageUtils.SESSION_COOKIE_NAME);
  if (!sessionId) {
    sessionId = 'nptest';
  }
  AccountService.hello(sessionId)
  .then(function (response) {
    appInstance.$mount('#dev');
    console.log('Lab module account initialized using ', sessionId);
  })
  .catch(function (error) {
    console.log(error);
  });
}).catch(() => {
  errorInstance.$mount('#dev');
});
