<template>
  <b-navbar toggleable="md" fixed="top" type="dark" variant="dark">
    <b-navbar-toggle target="topnav_collapse"></b-navbar-toggle>
    <b-navbar-brand href="/">
      <img style="width:26px;" :class="{imageRotateHorizontal:loadingIcon}" src="https://davinci.nexuspad.com/images/np-logo.png"/>
    </b-navbar-brand>

    <b-collapse is-nav id="topnav_collapse" v-if="isLoggedIn === false">
      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav-item to="/login">log in</b-nav-item>
      </b-navbar-nav>
    </b-collapse>

    <b-collapse is-nav id="topnav_collapse" v-if="isLoggedIn === true">
      <b-navbar-nav>
        <b-nav-item to="/organize/contact" :active="activeModule === 1">contact</b-nav-item>
        <b-nav-item to="/organize/calendar" :active="activeModule === 2">calendar</b-nav-item>
        <b-nav-item to="/organize/doc" :active="activeModule === 4">doc</b-nav-item>
        <b-nav-item to="/organize/bookmark" :active="activeModule === 3">bookmark</b-nav-item>
        <b-nav-item to="/organize/photo" :active="activeModule === 6">photo</b-nav-item>
        <b-nav-item></b-nav-item>
        <b-nav-form @submit="search">
          <input ref="searchInput" class="form-control mr-sm-2" type="search" v-model="searchKeyword"
            v-on:keyup.enter="search($event)" v-on:keyup.delete="clearSearch($event)" />
          <b-button class="my-2 my-sm-0" v-on:click="search($event)">search</b-button>
        </b-nav-form>
      </b-navbar-nav>

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav-item to="/account">account</b-nav-item>
        <b-nav-item @click="logout()">log out</b-nav-item>
        <!--
        <b-nav-item-dropdown text="Lang" right>
          <b-dropdown-item href="#">EN</b-dropdown-item>
        </b-nav-item-dropdown>
        <b-nav-item-dropdown right>
          <template slot="button-content">
            User
          </template>
          <b-dropdown-item @click="accountPage()" href="#">account</b-dropdown-item>
          <b-dropdown-item @click="logout()">signout</b-dropdown-item>
        </b-nav-item-dropdown>
        -->
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
import AccountActionProvider from '../account/AccountActionProvider';
import AccountService from '../../core/service/AccountService';
import PreferenceService from '../../core/service/PreferenceService';

export default {
  name: 'TopNavigation',
  mixins: [ AccountActionProvider ],
  data () {
    return {
      activeModule: 0,
      searchKeyword: '',
      isLoggedIn: AccountService.isLoggedIn(),
      loadingIcon: false
    };
  },
  beforeCreate () {
    let componentSelf = this;
    AccountService.hello()
      .then(() => {
        this.isLoggedIn = true;
      })
      .catch(function (error) {
        console.error(error);
        if (error instanceof NPError) {
          if (error.errorCode === 'NO_SESSION' && this.$router.currentRoute.meta.requiresAuth === true) {
            console.log('TopNavigation: redirect to login page');
            componentSelf.$router.push({name: 'login'});
          }
        }
      });
  },
  mounted () {
    if (this.$route && this.$route.query['keyword']) {
      this.searchKeyword = this.$route.query['keyword'];
    } else {
      this.searchKeyword = '';
    }
    EventManager.subscribe(AppEvent.LOADING, this.showLoadingIcon);

    let componentSelf = this;
    if (this.$refs.searchInput) {
      this.$refs.searchInput.addEventListener('search', function() {
        if(!this.value) {
          componentSelf.searchKeyword = '';
          componentSelf.clearSearch();
        }
      });
    }
  },
  beforeDestroy () {
    EventManager.unSubscribe(AppEvent.LOADING, this.showLoadingIcon);
  },
  methods: {
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

      let module = AppRoute.module(this.$route);

      if (this.activeModule !== module) {
        this.activeModule = module;
        if (this.activeModule !== NPModule.NOT_ASSIGNED) {
          PreferenceService.getPreference().updateLastVisit(this.activeModule);
          PreferenceService.updateViewPreference();
        }
      }
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
</style>