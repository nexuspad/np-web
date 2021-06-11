<template>
  <div>
    <div v-if="location === 'TOP_STICKY'" class="np-message">
      <div class="alert alert-success" v-show="showSuccess">
        {{successMessage}}
      </div>
      <div class="alert alert-danger" v-show="showError">
        {{failureMessage}}
      </div>
    </div>
    <div v-if="location === 'LIST'">
      <div class="alert alert-info" v-show="showInformation">
        {{informationMessage}}
      </div>
      <div class="alert alert-success" v-show="showSuccess">
        {{successMessage}}
      </div>
      <div class="alert alert-danger" v-show="showError">
        {{failureMessage}}
      </div>
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
import ContentHelper from '../../core/service/ContentHelper';

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
    EventManager.subscribe(AppEvent.MODULE_EXPORT_FAILED, this.showErrorMessage);
    EventManager.subscribe(AppEvent.MODULE_EXPORT_IN_PROGRESS, this.showUpdateResult);
    EventManager.subscribe(AppEvent.ENTRY_UPDATE, this.showUpdateResult);
    EventManager.subscribe(AppEvent.ENTRY_MOVE, this.showUpdateResult);
    EventManager.subscribe(AppEvent.ENTRY_DELETE, this.showUpdateResult);
    EventManager.subscribe(AppEvent.ENTRY_RESTORE, this.showUpdateResult);
    EventManager.subscribe(AppEvent.EMPTY_TRASH, this.showUpdateResult);
    EventManager.subscribe(AppEvent.EMPTY_LIST, this.showGeneralMessage);
    EventManager.subscribe(AppEvent.LOADING, this.showLoadingIcon);
  },
  beforeUnmount () {
    EventManager.unSubscribe(AppEvent.ACCOUNT_CREATION_FAILURE, this.showErrorMessage);
    EventManager.unSubscribe(AppEvent.ACCOUNT_LOGIN_FAILURE, this.showErrorMessage);
    EventManager.unSubscribe(AppEvent.ACCOUNT_PASSWORD_UPDATE, this.showUpdateResult);
    EventManager.unSubscribe(AppEvent.ACCOUNT_TIMEZONE_UPDATE, this.showUpdateResult);
    EventManager.unSubscribe(AppEvent.ACCOUNT_DISPLAYNAME_UPDATE, this.showUpdateResult);
    EventManager.unSubscribe(AppEvent.ACCOUNT_USERNAME_UPDATE, this.showUpdateResult);
    EventManager.unSubscribe(AppEvent.ACCOUNT_PASSWORD_RESET_REQUEST, this.showUpdateResult);
    EventManager.unSubscribe(AppEvent.ACCOUNT_DELETED, this.showUpdateResult);
    EventManager.unSubscribe(AppEvent.MODULE_EXPORT_FAILED, this.showErrorMessage);
    EventManager.unSubscribe(AppEvent.MODULE_EXPORT_IN_PROGRESS, this.showUpdateResult);
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
      this.failureMessage = ContentHelper.appEventMessage(appEvent);
    },
    showUpdateResult (appEvent) {
      this.clearAll();
      if (appEvent.error && appEvent.error instanceof NPError) {
        this.showError = true;
        this.failureMessage = ContentHelper.appEventMessage(appEvent);
      } else {
        this.showSuccess = true;
        this.showSuccessWithCountDown = 2;
        this.successMessage = ContentHelper.appEventMessage(appEvent);
      }
    },
    showGeneralMessage (appEvent) {
      this.clearAll();
      this.showInformation = true;
      this.informationMessage = ContentHelper.appEventMessage(appEvent);
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