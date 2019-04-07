<template>
  <div>
    <div v-if="location === 'TOP_STICKY'" class="np-message">
      <b-alert variant="success"
              dismissible
              :show="showSuccessWithCountDown"
              @dismissed="showSuccessWithCountDown=0">
        {{successMessage}}
      </b-alert>
      <b-alert variant="danger"
              dismissible
              :show="showError"
              @dismissed="showError=false">
        {{failureMessage}}
      </b-alert>
    </div>
    <div v-if="location === 'LIST'">
      <b-alert :show="showInformation"
              dismissible
              @dismissed="showInformation=false">
        {{informationMessage}}
      </b-alert>
      <b-alert variant="success"
              dismissible
              :show="showSuccess"
              @dismissed="showSuccess=false">
        {{successMessage}}
      </b-alert>
      <b-alert variant="danger"
              dismissible
              :show="showError"
              @dismissed="showError=false">
        {{failureMessage}}
      </b-alert>
    </div>
    <div v-if="location === 'TOP_NAVBAR'">
      <i class="fas fa-dot-circle" v-show="!loadingIcon"></i>
      <i class="fas fa-spinner fa-spin" v-show="loadingIcon"></i>
      <span v-show="showInformation">
        {{informationMessage}}
      </span>
      <span v-show="showSuccess">
        {{successMessage}}
      </span>
      <span v-show="showError">
        {{failureMessage}}
      </span>
    </div>
  </div>
</template>

<script>
import EventManager from '../../core/util/EventManager';
import AppEvent from '../../core/util/AppEvent';
import NPError from '../../core/datamodel/NPError';

export default {
  props: ['location'],
  data: function () {
    return {
      showError: false,
      showSuccess: false,
      showSuccessWithCountDown: 0,
      showInformation: false,
      informationMessage: '',
      successMessage: 'success!',
      failureMessage: 'failed!',
      loadingIcon: false
    }
  },
  mounted () {
    EventManager.subscribe(AppEvent.ACCOUNT_CREATION_FAILURE, this.showErrorMessage);
    EventManager.subscribe(AppEvent.ACCOUNT_LOGIN_FAILURE, this.showErrorMessage);
    EventManager.subscribe(AppEvent.ACCOUNT_PASSWORD_UPDATE, this.showUpdateResult);
    EventManager.subscribe(AppEvent.ACCOUNT_TIMEZONE_UPDATE, this.showUpdateResult);
    EventManager.subscribe(AppEvent.ACCOUNT_DISPLAYNAME_UPDATE, this.showUpdateResult);
    EventManager.subscribe(AppEvent.ACCOUNT_USERNAME_UPDATE, this.showUpdateResult);
    EventManager.subscribe(AppEvent.ACCOUNT_PASSWORD_RESET_REQUEST, this.showUpdateResult);
    EventManager.subscribe(AppEvent.ACCOUNT_DELETED, this.showUpdateResult);
    EventManager.subscribe(AppEvent.ENTRY_UPDATE, this.showUpdateResult);
    EventManager.subscribe(AppEvent.ENTRY_MOVE, this.showUpdateResult);
    EventManager.subscribe(AppEvent.ENTRY_DELETE, this.showUpdateResult);
    EventManager.subscribe(AppEvent.ENTRY_RESTORE, this.showUpdateResult);
    EventManager.subscribe(AppEvent.EMPTY_TRASH, this.showUpdateResult);
    EventManager.subscribe(AppEvent.EMPTY_LIST, this.showGeneralMessage);
    EventManager.subscribe(AppEvent.LOADING, this.showLoadingIcon);
  },
  beforeDestroy () {
    EventManager.unSubscribe(AppEvent.ACCOUNT_CREATION_FAILURE, this.showErrorMessage);
    EventManager.unSubscribe(AppEvent.ACCOUNT_LOGIN_FAILURE, this.showErrorMessage);
    EventManager.unSubscribe(AppEvent.ACCOUNT_PASSWORD_UPDATE, this.showUpdateResult);
    EventManager.unSubscribe(AppEvent.ACCOUNT_TIMEZONE_UPDATE, this.showUpdateResult);
    EventManager.unSubscribe(AppEvent.ACCOUNT_DISPLAYNAME_UPDATE, this.showUpdateResult);
    EventManager.unSubscribe(AppEvent.ACCOUNT_USERNAME_UPDATE, this.showUpdateResult);
    EventManager.unSubscribe(AppEvent.ACCOUNT_PASSWORD_RESET_REQUEST, this.showUpdateResult);
    EventManager.unSubscribe(AppEvent.ACCOUNT_DELETED, this.showUpdateResult);
    EventManager.unSubscribe(AppEvent.ENTRY_UPDATE, this.showUpdateResult);
    EventManager.unSubscribe(AppEvent.ENTRY_MOVE, this.showUpdateResult);
    EventManager.unSubscribe(AppEvent.ENTRY_DELETE, this.showUpdateResult);
    EventManager.unSubscribe(AppEvent.ENTRY_RESTORE, this.showUpdateResult);
    EventManager.unSubscribe(AppEvent.EMPTY_TRASH, this.showUpdateResult);
    EventManager.unSubscribe(AppEvent.EMPTY_LIST, this.showGeneralMessage);
    EventManager.unSubscribe(AppEvent.LOADING, this.showLoadingIcon);
  },
  methods: {
    showErrorMessage (appEvent) {
      this.clearAll();
      this.showError = true;
      this.failureMessage = appEvent.messageKey();
    },
    showUpdateResult (appEvent) {
      this.clearAll();
      if (appEvent.error && appEvent.error instanceof NPError) {
        this.showError = true;
        this.failureMessage = appEvent.messageKey();
      } else {
        this.showSuccess = true;
        this.showSuccessWithCountDown = 2;
        this.successMessage = appEvent.messageKey();
      }
    },
    showGeneralMessage (appEvent) {
      this.clearAll();
      this.showInformation = true;
      this.informationMessage = appEvent.messageKey();
    },
    showLoadingIcon (loading) {
      this.loadingIcon = loading;
    },
    clearAll () {
      this.showError = false;
      this.showSuccess = false;
      this.showInformation = false;
      this.failureMessage = '';
      this.successMessage = '';
      this.informationMessage = '';
    }
  }
}
</script>