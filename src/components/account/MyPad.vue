<template>
  <div class="np-module-container">
    <message :location="'TOP_STICKY'" />
    <ul class="nav nav-tabs h5 pt-2 mb-3">
      <li class="nav-item">
        <router-link class="nav-link" to="/account">account</router-link>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="'active'">my pad</a>
      </li>
    </ul>
    <h2>modules</h2>
    <ul class="list-group mt-4">
      <li class="list-group-item">
        <div class="row mt-2 mb-2">
          <div class="col">
            <span :class="{ 'text-muted': !isActive(1) }">CONTACT</span>
          </div>
          <div class="col-md-auto">
            <button class="btn btn-primary" v-on:click="exportModule(1)" :disabled="posting === true">export</button>
          </div>
          <div class="col-md-auto">
            <button class="btn btn-danger" v-if="isActive(1)" v-on:click="changeStatus(1, false)" :disabled="posting === true">de-activate</button>
            <button class="btn btn-primary" v-if="!isActive(1)" v-on:click="changeStatus(1, true)" :disabled="posting === true">activate</button>
          </div>
        </div>
      </li>
      <li class="list-group-item">
        <div class="row mt-2 mb-2">
          <div class="col">
            <span :class="{ 'text-muted': !isActive(2) }">CALENDAR</span>
          </div>
          <div class="col-md-auto">
            <button class="btn btn-primary" v-on:click="exportModule(2)" :disabled="!isActive(2) || posting === true">export</button>
          </div>
          <div class="col-md-auto">
            <button class="btn btn-danger" v-if="isActive(2)" v-on:click="changeStatus(2, false)" :disabled="posting === true">de-activate</button>
            <button class="btn btn-primary" v-if="!isActive(2)" v-on:click="changeStatus(2, true)" :disabled="posting === true">activate</button>
          </div>
        </div>
      </li>
      <li class="list-group-item">
        <div class="row mt-2 mb-2">
          <div class="col">
            <span :class="{ 'text-muted': !isActive(4) }">DOC</span>
          </div>
          <div class="col-md-auto">
            <button class="btn btn-primary" v-on:click="exportModule(4)" :disabled="!isActive(4) || posting === true">export</button>
          </div>
          <div class="col-md-auto">
            <button class="btn btn-danger" v-if="isActive(4)" v-on:click="changeStatus(4, false)" :disabled="posting === true">de-activate</button>
            <button class="btn btn-primary" v-if="!isActive(4)" v-on:click="changeStatus(4, true)" :disabled="posting === true">activate</button>
          </div>
        </div>
      </li>
      <li class="list-group-item">
        <div class="row mt-2 mb-2">
          <div class="col">
            <span :class="{ 'text-muted': !isActive(3) }">BOOKMARK</span>
          </div>
          <div class="col-md-auto">
            <button class="btn btn-primary" v-on:click="exportModule(3)" :disabled="!isActive(3) || posting === true">export</button>
          </div>
          <div class="col-md-auto">
            <button class="btn btn-danger" v-if="isActive(3)" v-on:click="changeStatus(3, false)" :disabled="posting === true">de-activate</button>
            <button class="btn btn-primary" v-if="!isActive(3)" v-on:click="changeStatus(3, true)" :disabled="posting === true">activate</button>
          </div>
        </div>
      </li>
      <li class="list-group-item">
        <div class="row mt-2 mb-2">
          <div class="col">
            <span :class="{ 'text-muted': !isActive(6) }">PHOTO</span>
          </div>
          <div class="col-md-auto">
            <button class="btn btn-primary" v-on:click="exportModule(6)" :disabled="!isActive(6) || posting === true">export</button>
          </div>
          <div class="col-md-auto">
            <button class="btn btn-danger" v-if="isActive(6)" v-on:click="changeStatus(6, false)" :disabled="posting === true">de-activate</button>
            <button class="btn btn-primary" v-if="!isActive(6)" v-on:click="changeStatus(6, true)" :disabled="posting === true">activate</button>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import AccountService from '../../core/service/AccountService';
import NPModule from '../../core/datamodel/NPModule';
import NPUser from '../../core/datamodel/NPUser';
import Message from '../common/Message';
import EventManager from '../../core/util/EventManager';
import AppEvent from '../../core/util/AppEvent';
import EntryService from '../../core/service/EntryService';
import PreferenceService from '../../core/service/PreferenceService';

export default {
  name: 'Account',
  mixins: [],
  components: {
    Message
  },
  data () {
    return {
      user: new NPUser(),
      posting: false
    };
  },
  mounted () {
    let componentSelf = this;
    AccountService.hello()
      .then(function (userObj) {
        componentSelf.user = userObj;
      })
      .catch(function (error) {
        console.error(error);
      });    
  },
  methods: {
    isActive (moduleId) {
      if (this.user.preference.moduleSettings) {
        if (this.user.preference.moduleSettings[NPModule.codeForId(moduleId)] === true) {
          return true;
        }
        return false;
      }
      return true;
    },
    changeStatus (moduleId, active) {
      let componentSelf = this;
      componentSelf.user.preference.moduleSettings[NPModule.codeForId(moduleId)] = active;
      this.posting = true;
      AccountService.hello()
        .then(() => {
          PreferenceService.updateModuleSettings(componentSelf.user.preference.moduleSettings)
            .then(function (userObj) {
              componentSelf.user = userObj;
              EventManager.publishAppEvent(AppEvent.ofSuccess(AppEvent.ACCOUNT_MODULE_SETTINGS_UPDATE));
              componentSelf.posting = false;
            })
            .catch(function (error) {
              console.error(error);
              EventManager.publishAppEvent(AppEvent.ofFailure(AppEvent.ACCOUNT_MODULE_SETTINGS_UPDATE, error));
              componentSelf.posting = false;
            });
        })
        .catch(function (error) {
          console.error(error);
          componentSelf.posting = false;
        });
    },
    exportModule (moduleId) {
      AccountService.hello()
        .then(function () {
          EntryService.exportModule(moduleId)
            .then(function (response) {
              EventManager.publishAppEvent(AppEvent.ofSuccess(AppEvent.MODULE_EXPORT_IN_PROGRESS));
            })
            .catch(function (error) {
              EventManager.publishAppEvent(AppEvent.ofFailure(AppEvent.MODULE_EXPORT_FAILED, error));
              console.log(error);
            });
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }
}
</script>