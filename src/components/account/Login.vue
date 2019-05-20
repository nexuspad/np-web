<template>
  <div class="np-module-container np-slim-box">
    <message :location="'TOP_STICKY'" />
    <h2>log in or <router-link to="/register">{{ 'create a free account' | npTranslate }}</router-link></h2>
    <form v-if="user === null || !user.sessionId">
      <div class="form-group">
        <input type="text" class="form-control" placeholder="username or email" autocomplete="username" v-model="username">
      </div>
      <div class="form-group">
        <input type="password" class="form-control" placeholder="password" autocomplete="current-password" v-model="password">
        <p style="margin:1em;"><a href="javascript:" @click="$router.push({name: 'reqpasswordreset'})">reset password</a></p>
      </div>
      <div class="form-group">
        <button class="btn btn-primary" v-on:click="login($event, username, password)" :disabled="posting">login</button>
      </div>
    </form>
    <b-alert :show="showLegacyAccountLink">
      You might have an older account which can be accessed at:
      <a href="https://legacy.nexuspad.com/account.htm#/login">https://legacy.nexuspad.com/account.htm#/login</a>.
    </b-alert>
    <div v-if="user !== null && user.sessionId">
      {{ user.sessionId }}
      <div class="form-group">
        <button class="btn btn-primary" v-on:click="logout">logout</button>
      </div>
    </div>
    <cookie-law theme="dark-lime" v-if="!isDesktopApp()"></cookie-law>
  </div>
</template>

<script>
import CookieLaw from 'vue-cookie-law';
import AccountActionProvider from '../account/AccountActionProvider';
import AccountService from '../../core/service/AccountService';
import Message from '../common/Message';
import WindowInfo from '../common/WindowInfo';
import EventManager from '../../core/util/EventManager';
import AppEvent from '../../core/util/AppEvent';

export default {
  name: 'Login',
  mixins: [ AccountActionProvider, WindowInfo ],
  components: {
    CookieLaw, Message
  },
  data () {
    return {
      user: { },
      username: '',
      password: '',
      posting: false,
      showLegacyAccountLink: false
    };
  },
  mounted () {
    let componentSelf = this;
    AccountService.hello()
      .then(function (userObj) {
        componentSelf.user = userObj;
        if (AccountService.isLoggedIn()) {
          componentSelf.goToLastVisit();
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  },
  methods: {
    login: function (event, userName, password) {
      if (event) {
        event.preventDefault();
      }

      this.posting = true;
      let componentSelf = this;
      AccountService.login(userName, password)
        .then(function (userObj) {
          componentSelf.user = userObj;
          EventManager.publishAppEvent(AppEvent.ofInformation(AppEvent.ACCOUNT_LOGIN_SUCCESS));
          componentSelf.goToLastVisit();
        })
        .catch(function (error) {
          console.log(error);
          EventManager.publishAppEvent(AppEvent.ofInformation(AppEvent.ACCOUNT_LOGIN_FAILURE, error));
          componentSelf.posting = false;
          componentSelf.showLegacyAccountLink = true;
        });
    },
    cancel: function () {
      this.$router.back();
    }
  }
};
</script>