<template>
  <div class="np-module-container np-slim-box">
    <message :location="'TOP_STICKY'" />
    <h2>{{ npContent("log in") }}</h2>
    <form v-if="user === null || !user.sessionId">
      <div class="form-group">
        <input
          type="text"
          class="form-control"
          :placeholder="npContent('email or username')"
          autocomplete="username"
          v-model="username"
        />
      </div>
      <div class="form-group">
        <input
          type="password"
          class="form-control"
          :placeholder="npContent('password')"
          autocomplete="current-password"
          v-model="password"
        />
        <p style="margin: 1em">
          <a
            href="javascript:"
            @click="$router.push({ name: 'reqpasswordreset' })"
            >{{ npContent("reset password") }}</a
          >
        </p>
      </div>
      <div class="form-group">
        <button
          class="btn btn-primary"
          v-on:click="login($event, username, password)"
          :disabled="posting"
        >
          {{ npContent("login") }}
        </button>
      </div>
    </form>
    <b-alert :show="showLegacyAccountLink">
      You might have an older account which can be accessed at:
      <a href="https://legacy.nexuspad.com/account.htm#/login"
        >https://legacy.nexuspad.com/account.htm#/login</a
      >.
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
import CookieLaw from "vue-cookie-law";
import AccountActionProvider from "../account/AccountActionProvider";
import AccountService from "../../core/service/AccountService";
import Message from "../common/Message";
import EventManager from "../../core/util/EventManager";
import AppEvent from "../../core/util/AppEvent";
import SiteProvider from "../common/SiteProvider";
import AppManager from "../../core/util/AppManager";

export default {
  name: "Login",
  mixins: [AccountActionProvider, SiteProvider],
  components: {
    CookieLaw,
    Message,
  },
  data() {
    return {
      user: {},
      username: "",
      password: "",
      posting: false,
      showLegacyAccountLink: false,
    };
  },
  mounted() {
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
      AccountService.login(userName, password, AppManager.uuid)
        .then(function (userObj) {
          componentSelf.user = userObj;
          EventManager.publishAppEvent(
            AppEvent.ofInformation(AppEvent.ACCOUNT_LOGIN_SUCCESS)
          );
          componentSelf.goToLastVisit();
        })
        .catch(function (error) {
          console.log(error);
          EventManager.publishAppEvent(
            AppEvent.ofInformation(AppEvent.ACCOUNT_LOGIN_FAILURE, error)
          );
          componentSelf.posting = false;
          componentSelf.showLegacyAccountLink = true;
        });
    },
    cancel: function () {
      this.$router.back();
    },
  },
};
</script>
