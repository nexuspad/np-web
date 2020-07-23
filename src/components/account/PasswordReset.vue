<template>
  <div class="np-module-container np-slim-box">
    <message :location="'TOP_STICKY'" />
    <h2>{{npContent('reset password')}}</h2>
    <form>
      <div class="row form-group">
        <div class="col">
          <label for="CurrentPassword">{{npContent('new password')}}</label>
          <input type="password" class="form-control" v-bind:class="{ 'is-invalid': passwordsDoNotMatch() }" v-model="newPassword">
          <label for="newPassword">{{npContent('confirm new password')}}</label>
          <input type="password" class="form-control" v-bind:class="{ 'is-invalid': passwordsDoNotMatch() }" v-model="newPassword2">
        </div>
      </div>
      <div class="row">
        <div class="col">
        </div>
        <div class="col-auto">
          <button class="btn btn-primary" v-on:click="updatePassword($event)" :disabled="posting || !readyToSubmit">
            {{npContent('update')}}
          </button>
        </div>
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
  name: 'PasswordReset',
  mixins: [ AccountActionProvider, SiteProvider ],
  components: {
    Message
  },
  data () {
    return {
      newPassword: '',
      newPassword2: '',
      posting: false,
      readyToSubmit: false
    };
  },
  props: ['verificationCode'],
  mounted () {
    this.posting = false;
    AccountService.checkResetPasswordVerificationCode(this.verificationCode)
      .then(function () {
      })
      .catch(function (error) {
        console.log(error);
        EventManager.publishAppEvent(AppEvent.ofFailure(AppEvent.ACCOUNT_PASSWORD_RESET_REQUEST, error));
      });
  },
  methods: {
    passwordsDoNotMatch() {
      if (this.newPassword != '' && this.newPassword2 != '' && CommonUtils.isValidPassword(this.newPassword) &&
          this.newPassword === this.newPassword2) {
        this.readyToSubmit = true;
        return false;
      } else {
        this.readyToSubmit = false;
        if (this.newPassword != '' && this.newPassword2 != '') {
          return true;
        }
        return false;
      }
    },
    updatePassword: function (event) {
      event.preventDefault();
      let componentSelf = this;
      this.posting = true;
      AccountService.changePassword({ verificationCode: componentSelf.verificationCode, password: componentSelf.newPassword })
        .then(function (result) {
          componentSelf.posting = false;
          if (result === true) {
            EventManager.publishAppEvent(AppEvent.ofSuccess(AppEvent.ACCOUNT_PASSWORD_UPDATE));
            componentSelf.newPassword = '';
            componentSelf.newPassword2 = '';
          }
        })
        .catch(function (error) {
          componentSelf.posting = false;
          console.log(error);
          EventManager.publishAppEvent(AppEvent.ofFailure(AppEvent.ACCOUNT_PASSWORD_UPDATE, error));
        });
    }
  }
}
</script>

<style>

</style>
