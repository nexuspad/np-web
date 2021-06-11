<template>
  <nav class="navbar fixed-top navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <a class="navbar-brand" href="https://nexuspad.com/about.html" v-if="!isLoggedIn">
        <img style="width:26px;" :class="{imageRotateHorizontal:loadingIcon}" src="https://nexuspad.com/images/np-logo.png"/>
      </a>
      <a class="navbar-brand" href="https://nexuspad.com/about.html" v-if="isLoggedIn && !onEdge">
        <img style="width:26px;" :class="{imageRotateHorizontal:loadingIcon}" src="https://nexuspad.com/images/np-logo.png"/>
      </a>
      <a class="navbar-brand" href="https://nexuspad.com/about.html" v-if="isLoggedIn && onEdge">
        <img style="width:26px;" :class="{imageRotateHorizontal:loadingIcon}" src="https://nexuspad.com/images/np-logo.png"/>
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item" v-for="m in availableModules" v-bind:key="m.id" :class="{'highlight' : activeModule == m.id}">
            <router-link class="nav-link" :to="m.link">{{npContent('m' + m.id)}}</router-link>
          </li>
        </ul>
        <form class="d-flex">
          <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search"
            v-model="searchKeyword" v-on:keyup.enter="search($event)" v-on:keyup.delete="clearSearch($event)" >
          <button class="btn btn-outline-success" type="submit">Search</button>
        </form>
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0" v-if="isLoggedIn === false">
          <li class="nav-item">
            <a class="nav-link active" aria-current="page" href="/login">{{npContent('log in')}}</a>
          </li>
        </ul>
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0" v-if="isLoggedIn === true">
          <li class="nav-item">
            <a class="nav-link" aria-current="page" href="/account">{{npContent('settings')}}</a>
          </li>
          <li>
            <a class="nav-link" aria-current="page" href="#" @click="logout()">{{npContent('log_out')}}</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
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
  beforeUnmount () {
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
          // PreferenceService.updateViewPreference();
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