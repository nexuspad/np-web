<template>
  <div class="np-module-container np-slim-box">
    <h2>create an account</h2>
    <message :location="'TOP_STICKY'" />
    <form>
      <div class="form-group">
        <input type="text" class="form-control" placeholder="display name (optional)" v-model="displayName">
      </div>
      <div class="form-group">
        <input type="text" class="form-control" placeholder="email" v-bind:class="{ 'is-invalid': invalidEmail() }" v-model="email">
      </div>
      <div class="form-group">
        <input type="password" class="form-control" placeholder="password" v-bind:class="{ 'is-invalid': invalidPass() }" v-model="password">
      </div>
      <div class="form-group">
        <input type="password" class="form-control" placeholder="confirm password" v-bind:class="{ 'is-invalid': invalidPass() }" v-model="confirmPassword">
      </div>
      <div class="form-group">
        By clicking creating account, you agree to our
        <a href="https://davinci.nexuspad.com/termsofuse.html" target="_blank">Terms of Use</a>,
        <a href="https://davinci.nexuspad.com/privacy.html" target="_blank">Data and Cookies Policy</a>.
      </div>
      <div class="form-group">
        <button class="btn btn-primary" v-on:click="register($event)" :disabled="!submissionEnabled()">create account</button>
      </div>
    </form>
    <cookie-law theme="dark-lime" v-if="!isDesktopApp()"></cookie-law>
  </div>
</template>

<script>
import CookieLaw from 'vue-cookie-law';
import AccountActionProvider from '../account/AccountActionProvider';
import AccountService from '../../core/service/AccountService';
import Message from '../common/Message';
import WindowInfo from '../common/WindowInfo';
import CommonUtils from '../../core/util/CommonUtils';

export default {
  name: 'Register',
  mixins: [ AccountActionProvider, WindowInfo ],
  components: {
    CookieLaw, Message
  },
  data () {
    return {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
      timezoneName: '',
      posting: false
    };
  },
  mounted () {
    this.timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
  },
  methods: {
    submissionEnabled () {
      if (this.posting) {
        return false;
      }
      if (!CommonUtils.isValidEmail(this.email) || this.password.length === 0 || this.confirmPassword.length === 0) {
        return false;
      }
      return true;
    },
    invalidEmail () {
      return this.submissionEnabled() && !CommonUtils.isValidEmail(this.email);
    },
    invalidPass () {
      if (this.submissionEnabled()) {
        if (this.password.length === 0 || this.confirmPassword.length === 0 || this.password !== this.confirmPassword) {
          return true;
        }
      }
      return false;
    },
    register: function (event) {
      event.preventDefault();

      this.posting = true;
      let componentSelf = this;
      AccountService.register(componentSelf.email, componentSelf.password, componentSelf.displayName, componentSelf.timezoneName)
        .then(function (userObj) {
          AccountService.hello(userObj.sessionId)
            .then(function () {
              componentSelf.goToDefaultModule();
            })
            .catch(function (error) {
              console.log(error);
            });
        })
        .catch(function (error) {
          componentSelf.posting = false;
          console.log(error);
        });
    },
    cancel: function () {
      this.$router.back();
    }
  }
}
</script>

<style>

</style>
