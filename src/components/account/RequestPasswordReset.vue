<template>
  <div class="np-module-container np-slim-box">
    <message :location="'TOP_STICKY'" />
    <h2>{{npContent('reset password')}}</h2>
    <p>provide your account email to receive a link to reset your password.</p>
    <form>
      <div class="form-group">
        <input type="text" class="form-control" :placeholder="npContent('email')" v-bind:class="{ 'is-invalid': email != '' && !isEmailValid() }" v-model="email">
      </div>
      <div class="form-group">
        <button class="btn btn-primary" v-on:click="requestPasswordReset($event)" :disabled="posting || !readyToSubmit">
          {{npContent('request password reset')}}
        </button>
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

export default {
  name: 'RequestPasswordReset',
  mixins: [ AccountActionProvider, SiteProvider ],
  components: {
    Message
  },
  data () {
    return {
      email: '',
      posting: false,
      readyToSubmit: false
    };
  },
  mounted () {
    this.posting = false;
  },
  methods: {
    isEmailValid () {
      let emailValid = CommonUtils.isValidEmail(this.email);
      if (emailValid) {
        this.readyToSubmit = true;
      } else {
        this.readyToSubmit = false;
      }
      return emailValid;
    },
    requestPasswordReset: function (event) {
      event.preventDefault();

      this.posting = true;
      let componentSelf = this;
      AccountService.requestPasswordReset(componentSelf.email)
        .then(function () {
          componentSelf.posting = false;
          componentSelf.email = '';
          EventManager.publishAppEvent(AppEvent.ofSuccess(AppEvent.ACCOUNT_PASSWORD_RESET_REQUEST));
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
