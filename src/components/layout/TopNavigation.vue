<template>
  <b-navbar toggleable="md" fixed="top" type="dark" variant="dark">
    <b-navbar-toggle target="topnav_collapse"></b-navbar-toggle>
    <b-navbar-brand href="/about.html" v-if="!isLoggedIn">
      <img style="width:26px;" :class="{imageRotateHorizontal:loadingIcon}" src="https://nexuspad.com/images/np-logo.png"/>
    </b-navbar-brand>
    <b-navbar-brand href="/" v-if="isLoggedIn && !onEdge">
      <img style="width:26px;" :class="{imageRotateHorizontal:loadingIcon}" src="https://nexuspad.com/images/np-logo.png"/>
    </b-navbar-brand>
    <b-navbar-brand v-if="isLoggedIn && onEdge">
      <router-link to="/activities">
        <img style="width:26px;" :class="{imageRotateHorizontal:loadingIcon}" src="https://nexuspad.com/images/np-logo.png"/>
      </router-link>
    </b-navbar-brand>

    <b-collapse is-nav id="topnav_collapse" v-if="isLoggedIn === false">
      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav-item to="/login">{{npContent('log in')}}</b-nav-item>
      </b-navbar-nav>
    </b-collapse>

    <b-collapse is-nav id="topnav_collapse" v-if="isLoggedIn === true">
      <b-navbar-nav>
        <b-nav-item v-for="m in availableModules" :to="m.link" v-bind:key="m.id" :class="{'highlight' : activeModule == m.id}"
          :active="activeModule == m.id">
          {{npContent('m' + m.id)}}
        </b-nav-item>
        <b-nav-item></b-nav-item>
        <b-nav-form @submit="search">
          <input ref="searchInput" class="form-control mr-sm-2" type="search" v-model="searchKeyword"
            v-on:keyup.enter="search($event)" v-on:keyup.delete="clearSearch($event)" />
          <b-button class="my-2 my-sm-0" v-on:click="search($event)">{{npContent('search')}}</b-button>
        </b-nav-form>
      </b-navbar-nav>

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav-item to="/account">{{npContent('settings')}}</b-nav-item>
        <b-nav-item @click="logout()">{{npContent('log_out')}}</b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
import NPModule from '../../core/datamodel/NPModule';
import EventManager from '../../core/util/EventManager';
import AppEvent from '../../core/util/AppEvent';
import NPError from '../../core/datamodel/NPError';
import AppRoute from '../AppRoute';
import SiteProvider from '../common/SiteProvider';
import AccountActionProvider from '../account/AccountActionProvider';
import AccountService from '../../core/service/AccountService';
import PreferenceService from '../../core/service/PreferenceService';

export default {
  name: 'TopNavigation',
  mixins: [ SiteProvider, AccountActionProvider ],
  data () {
    return {
      activeModule: 0,
      availableModules: [],
      searchKeyword: '',
      isLoggedIn: AccountService.isLoggedIn(),
      loadingIcon: false
    };
  },
  beforeCreate () {
  },
  mounted () {
    this.setModules();

    if (this.$route && this.$route.query['keyword']) {
      this.searchKeyword = this.$route.query['keyword'];
    } else {
      this.searchKeyword = '';
    }
    EventManager.subscribe(AppEvent.LOADING, this.showLoadingIcon);
    EventManager.subscribe(AppEvent.ACCOUNT_LOGIN_SUCCESS, this.setModules);
    EventManager.subscribe(AppEvent.ACCOUNT_MODULE_SETTINGS_UPDATE, this.setModules);

    let componentSelf = this;
    if (this.$refs.searchInput) {
      this.$refs.searchInput.addEventListener('search', function() {
        console.log('search value', this.value)
        if (!this.value || this.value.length === 0) {
          componentSelf.searchKeyword = '';
          componentSelf.clearSearch();
        }
      });
    }

    this.setActiveModule();
    this.isEdgeApi();
  },
  beforeDestroy () {
    EventManager.unSubscribe(AppEvent.LOADING, this.showLoadingIcon);
    EventManager.unSubscribe(AppEvent.ACCOUNT_LOGIN_SUCCESS, this.setModules);
  },
  methods: {
    setModules () {
      let componentSelf = this;
      AccountService.hello()
        .then((userObj) => {
          componentSelf.isLoggedIn = true;
          while (componentSelf.availableModules.length) {
            componentSelf.availableModules.pop();
          }
          let moduleSetting = userObj.preference.moduleSettings;
          if (!moduleSetting || moduleSetting.length === 0) {
            NPModule.ALL_MODULES.forEach(mid => {
              componentSelf.availableModules.push(
                {
                  id: mid,
                  name: NPModule.codeForId(mid),
                  link: '/organize/' + NPModule.codeForId(mid)
                }
              );
            })
          } else {
            for (var name in moduleSetting) {
              if (moduleSetting[name] !== false) {
                componentSelf.availableModules.push(
                  {
                    id: NPModule.idForCode(name),
                    name: name,
                    link: '/organize/' + name
                  }
                );
              }
            }
          }
        })
        .catch(function (error) {
          console.error(error);
          if (error instanceof NPError) {
            if (error.errorCode === 'NO_SESSION' && componentSelf.$router.currentRoute.meta.requiresAuth === true) {
              console.log('TopNavigation: redirect to login page');
              componentSelf.$router.push({name: 'login'});
            }
          }
        });
    },
    setActiveModule () {
      let module = AppRoute.module(this.$route);

      if (this.activeModule !== module) {
        this.activeModule = module;
        if (this.activeModule !== NPModule.NOT_ASSIGNED) {
          PreferenceService.getPreference().updateLastVisit(this.activeModule);
          PreferenceService.updateViewPreference();
        }
      }
    },
    isAvailable (moduleId) {
      if (this.availableModules.indexOf(moduleId) !== -1) {
        return true;
      }
      return false;
    },
    search (event) {
      if (event) {
        event.preventDefault();
      }
      let moduleId = AppRoute.module(this.$route);
      let routeName = '';
      switch (moduleId) {
        case NPModule.CONTACT:
          routeName = 'contactSearch';
          break;
        case NPModule.CALENDAR:
          routeName = 'eventSearch';
          break;
        case NPModule.DOC:
          routeName = 'docSearch';
          break;
        case NPModule.BOOKMARK:
          routeName = 'bookmarkSearch';
          break;
        case NPModule.PHOTO:
          routeName = 'photoSearch';
          break;
      }
      this.$router.push({name: routeName, query: {keyword: this.searchKeyword}});
    },
    clearSearch () {
      if (this.searchKeyword == '') {
        this.$router.push(AppRoute.moduleHome(this.$route));
      }
    },
    accountPage () {
      this.$router.push({name: 'account'});
    },
    showLoadingIcon (loading) {
      this.loadingIcon = loading;
    }
  },
  watch: {
    '$route.path': function () {
      let componentSelf = this;
      AccountService.hello()
        .then(() => {
          componentSelf.isLoggedIn = true;
        })
        .catch(function (error) {
          componentSelf.isLoggedIn = false;
          console.log(error);
        });

      this.setActiveModule();
    },
    '$route.query.keyword': function (value) {
      if (!value) {
        this.searchKeyword = '';
      } else {
        this.searchKeyword = value;
      }
    },
    'searchKeyword': function (value) {
      if (!value || value.trim().length === 0) {
        // this.$router.push(AppRoute.moduleHome(this.$route));
      }
    }
  }
};
</script>

<style scoped>
.highlight { color: #fff; }
</style>