<template>
  <div class="np-module-container np-slim-box">
    <message :location="'TOP_STICKY'" />
    <h2>{{npContent('create a free account')}}</h2>
    <form>
      <div class="form-group">
        <input type="text" class="form-control" :placeholder="npContent('display_name_optional')" v-model="displayName">
      </div>
      <div class="form-group">
        <input type="text" class="form-control" :placeholder="npContent('email')" v-bind:class="{ 'is-invalid': invalidEmail() }" v-model="email">
      </div>
      <div class="form-group">
        <input type="password" class="form-control" :placeholder="npContent('password')" v-bind:class="{ 'is-invalid': invalidPass() }" v-model="password">
      </div>
      <div class="form-group">
        <input type="password" class="form-control" :placeholder="npContent('confirm password')" v-bind:class="{ 'is-invalid': invalidPass() }" v-model="confirmPassword">
      </div>
      <div class="form-group">
        By clicking creating account, you agree to our
        <a href="https://nexuspad.com/termsofuse.html" target="_blank">Terms of Use</a>,
        <a href="https://nexuspad.com/privacy.html" target="_blank">Data and Cookies Policy</a>.
      </div>
      <div class="form-group">
        <button class="btn btn-primary" v-on:click="register($event)" :disabled="!submissionEnabled()">{{npContent('create account')}}</button>
      </div>
    </form>
  </div>
</template>

<script>
import AccountActionProvider from '../account/AccountActionProvider';
import AccountService from '../../core/service/AccountService';
import Message from '../common/Message';
import EventManager from '../../core/util/EventManager';
import AppEvent from '../../core/util/AppEvent';
import CommonUtils from '../../core/util/CommonUtils';
import SiteProvider from '../common/SiteProvider';
import AppManager from '../../core/util/AppManager';

export default {
  name: 'Register',
  mixins: [ AccountActionProvider, SiteProvider ],
  components: {
    Message
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
      return this.email && this.password && this.confirmPassword && !CommonUtils.isValidEmail(this.email);
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
      AccountService.register(componentSelf.email, componentSelf.password, componentSelf.displayName, componentSelf.timezoneName, AppManager.uuid)
        .then(function (userObj) {
          AccountService.hello(userObj.sessionId)
            .then(function () {
              componentSelf.goToDefaultModule();
            })
            .catch(function (error) {
              console.log(error);
              componentSelf.kickToLogin();
            });
        })
        .catch(function (error) {
          EventManager.publishAppEvent(AppEvent.ofFailure(AppEvent.ACCOUNT_CREATION_FAILURE, error));
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
