<template>
  <div class="np-module-container" :class="{ fadeOut: isDeleted }">
    <message :location="'TOP_STICKY'" />
    <ul class="nav nav-tabs h5 pt-2 mb-3">
      <li class="nav-item">
        <a class="nav-link" :class="'active'">account</a>
      </li>
      <li class="nav-item" v-if="onEdge">
        <router-link class="nav-link" to="/mypad">my pad</router-link>
      </li>
    </ul>
    <h2>email</h2>
    <div class="ml-4 mb-4">
      {{user.email}}
    </div>
    <h2>password</h2>
    <form>
      <div class="row form-group">
        <div class="col">
          <label for="CurrentPassword">current password</label>
          <input type="password" class="form-control" v-model="currentPassword">
          <label for="newPassword">new password</label>
          <input type="password" class="form-control" v-model="newPassword">
        </div>
      </div>
      <div class="row">
        <div class="col">
        </div>
        <div class="col-auto">
          <button class="btn btn-primary" v-on:click="updatePassword($event)">update</button>
        </div>
      </div>
    </form>
    <h2>timezone</h2>
    <div class="row form-group">
      <div class="col">
        <select class="form-control" v-model="user.preference.timezoneName">
          <option v-for="(name, index) in timezoneNames" :key="index" :value="name">{{name}}</option>
        </select>
        <span class="small pl-2">time zone setting on this device: <strong>{{ browserTimezone }}</strong></span>
      </div>
      <div class="col-auto">
        <button class="btn btn-primary" v-on:click="updateTimezone($event)">update</button>
      </div>
    </div>
    <h2>display name</h2>
    <div class="row form-group">
      <div class="col">
        <input class="form-control" type="text" v-model="user.displayName" placeholder="display name" />
      </div>
      <div class="col-auto">
        <button class="btn btn-primary" v-on:click="updateDisplayName($event)">update</button>
      </div>
    </div>
    <h2>user name</h2>
    <div class="row form-group">
      <div class="col">
        <input class="form-control" type="text" v-model="user.userName" placeholder="user name" />
      </div>
      <div class="col-auto">
        <button class="btn btn-primary" v-on:click="updateUserName($event)">update</button>
      </div>
    </div>
    <h2>service</h2>
    <div class="row form-group">
      <div class="col">
        {{ serviceInfo }}
      </div>
    </div>
    <div class="row form-group">
      <div class="col">
        <button class="btn btn-primary" v-on:click="rebuildSearchIndex($event)" :disabled="posting === true">rebuild search index</button>
      </div>
    </div>
    <div class="row form-group">
      <div class="col">
        <button class="btn btn-danger" v-on:click="deleteAccount($event)" :disabled="posting === true">delete account</button>
        <span class="text-danger ml-2"><i class="fa fa-long-arrow-alt-left"></i> this is not reversible</span>
      </div>
    </div>
    <div class="mb-12">&nbsp;</div>
  </div>
</template>

<script>
import AccountActionProvider from '../account/AccountActionProvider';
import AccountService from '../../core/service/AccountService';
import NPUser from '../../core/datamodel/NPUser';
import Message from '../common/Message';
import EventManager from '../../core/util/EventManager';
import AppEvent from '../../core/util/AppEvent';
import PreferenceService from '../../core/service/PreferenceService';
import CmsService from '../../core/service/CmsService';
import RestClient from '../../core/util/RestClient';

export default {
  name: 'Account',
  mixins: [ AccountActionProvider ],
  components: {
    Message
  },
  data () {
    return {
      user: new NPUser(),
      currentPassword: '',
      newPassword: '',
      timezoneNames: [],
      browserTimezone: '',
      serviceInfo: '',
      onEdge: false,
      posting: false,
      isDeleted: false
    };
  },
  mounted () {
    let componentSelf = this;
    AccountService.hello()
      .then(function (userObj) {
        componentSelf.user = userObj;
        CmsService.getTimezoneHelperData()
          .then(function (data) {
            componentSelf.timezoneNames.push(...data.timezoneNames);
          });
      })
      .catch(function (error) {
        console.error(error);
      });
    
    this.browserTimezone = PreferenceService.getActiveTimezone();

    RestClient.get(RestClient.apiUrl + '/health').then((result) => {
      componentSelf.serviceInfo = result.data;
      if (componentSelf.serviceInfo.indexOf('3.2') !== -1) {
        componentSelf.onEdge = true;
      }
    });
  },
  methods: {
    updatePassword: function (event) {
      event.preventDefault();
      let componentSelf = this;
      AccountService.hello()
        .then(() => {
          AccountService.changePassword({ currentPassword: componentSelf.currentPassword, password: componentSelf.newPassword })
            .then(function (result) {
              if (result === true) {
                EventManager.publishAppEvent(AppEvent.ofSuccess(AppEvent.ACCOUNT_PASSWORD_UPDATE));
              }
            })
            .catch(function (error) {
              console.error(error);
              EventManager.publishAppEvent(AppEvent.ofFailure(AppEvent.ACCOUNT_PASSWORD_UPDATE, error));
            });
        })
        .catch(function (error) {
          console.error(error);
        });
    },
    updateTimezone: function (event) {
      event.preventDefault();
      let componentSelf = this;
      AccountService.hello()
        .then(() => {
          PreferenceService.updateTimePreference({timezone: componentSelf.user.preference.timezoneName})
            .then(function (userObj) {
              componentSelf.user = userObj;
              EventManager.publishAppEvent(AppEvent.ofSuccess(AppEvent.ACCOUNT_TIMEZONE_UPDATE));
            })
            .catch(function (error) {
              console.error(error);
              EventManager.publishAppEvent(AppEvent.ofFailure(AppEvent.ACCOUNT_TIMEZONE_UPDATE, error));
            });
        })
        .catch(function (error) {
          console.error(error);
        });
    },
    updateDisplayName: function (event) {
      event.preventDefault();
      let componentSelf = this;
      AccountService.hello()
        .then(() => {
          AccountService.changeDisplayname(componentSelf.user.displayName)
            .then(function (userObj) {
              componentSelf.user = userObj;
              EventManager.publishAppEvent(AppEvent.ofSuccess(AppEvent.ACCOUNT_DISPLAYNAME_UPDATE));
            })
            .catch(function (error) {
              console.error(error);
              EventManager.publishAppEvent(AppEvent.ofFailure(AppEvent.ACCOUNT_DISPLAYNAME_UPDATE, error));
            });
        })
        .catch(function (error) {
          console.error(error);
        });
    },
    updateUserName: function (event) {
      event.preventDefault();
      let componentSelf = this;
      AccountService.hello()
        .then(() => {
          AccountService.changeUsername(componentSelf.user.userName)
            .then(function (userObj) {
              componentSelf.user = userObj;
              EventManager.publishAppEvent(AppEvent.ofSuccess(AppEvent.ACCOUNT_USERNAME_UPDATE));
            })
            .catch(function (error) {
              console.error(error);
              EventManager.publishAppEvent(AppEvent.ofFailure(AppEvent.ACCOUNT_USERNAME_UPDATE, error));
            });
        })
        .catch(function (error) {
          console.error(error);
        });
    },
    rebuildSearchIndex: function (event) {
      event.preventDefault();
      this.posting = true;
      let componentSelf = this;
      AccountService.hello()
        .then(() => {
          AccountService.rebuildSearchIndex()
            .then(function () {
              componentSelf.posting = false;
            })
            .catch(function (error) {
              console.error(error);
              componentSelf.posting = false;
            });
        })
        .catch(function (error) {
          console.error(error);
        });
    },
    deleteAccount: function (event) {
      event.preventDefault();
      this.posting = true;
      let componentSelf = this;
      AccountService.hello()
        .then(() => {
          AccountService.deleteAccount()
            .then(function () {
              componentSelf.posting = false;
              EventManager.publishAppEvent(AppEvent.ofSuccess(AppEvent.ACCOUNT_DELETED));
              componentSelf.isDeleted = true;
              setTimeout(() => {
                window.location.replace('/');
              },  3000);

            })
            .catch(function (error) {
              componentSelf.posting = false;
              EventManager.publishAppEvent(AppEvent.ofFailure(AppEvent.ACCOUNT_DELETED, error));
            });
        })
        .catch(function (error) {
          console.error(error);
          EventManager.publishAppEvent(AppEvent.ofFailure(AppEvent.ACCOUNT_DELETED));
        });
    }
  }
}
</script>

<style>
.fadeOut {
  visibility: hidden;
  opacity: 0;
  transition: visibility 0s 3s, opacity 3s linear;
}
</style>
