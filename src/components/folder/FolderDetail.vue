<template>
  <div class="mt-2">
    <form>
      <div class="row mb-4" v-if="!folder.isRoot()">
        <div class="col">
          <input type="text" class="form-control input-underline display-4" placeholder="folder name" v-model="folder.folderName">
        </div>
        <div class="col-2">
          <input type="color" class="form-control color-label" :style="{background: folder.colorLabel}" v-model="folder.colorLabel">
        </div>
      </div>
      <h2 class="display-6">sharing</h2>
      <div class="row" v-if="!folder.sharing || folder.sharing.length === 0">
        <div class="col">
          not shared to anyone.
        </div>
      </div>
      <div class="row" id="Sharing" v-for="(accessPermission, idx) in folder.sharing" :key="idx">
        <div class="col">
          <span v-bind:class="{ 'text-muted': !accessPermission.permission.read }">{{ accessPermission.accessor.badge.name }}</span>
          &lt;<span v-bind:class="{ 'text-muted': !accessPermission.permission.read }">{{ accessPermission.accessor.email }}</span>&gt;
        </div>
        <div class="col">
          <input type="checkbox" v-model="accessPermission.permission.read" :disabled="accessPermission.permission.write === true" />
          read
          <input type="checkbox" v-model="accessPermission.permission.write"
                @change="accessPermission.permission.read = accessPermission.permission.write" />
          write
        </div>
        <div class="col">
          <button type="button" class="icon-button" v-on:click="removeSharing(idx)">
            <i class="fa fa-times fa-lg text-secondary"></i>
          </button>
        </div>
      </div>
      <div class="row mt-2">
        <div class="col">
          <input class="form-control ac-input" v-bind:class="{ 'is-invalid': newSharing.accessor._error }" type="email" v-model="newSharing.accessor.email" placeholder="email" />
          <div class="invalid-feedback">{{ newSharing.accessor._error }}</div>
        </div>
        <div class="col">
          <input type="checkbox" v-model="newSharing.permission.read" :disabled="newSharing.permission.write === true" />
          read
          <input type="checkbox" v-model="newSharing.permission.write"
                @change="newSharing.permission.read = newSharing.permission.write" />
          write
        </div>
        <div class="col">
          <button type="button" class="icon-button" v-on:click="addNewSharing(newSharing)">
            <i class="fa fa-plus fa-lg text-primary"></i>
          </button>
        </div>
      </div>
    </form>
    <b-navbar toggleable="md" fixed="top" type="dark" variant="dark">
      <b-collapse is-nav id="editor_nav_menu_collapse">
        <b-navbar-nav>
          <b-nav-text class="mr-2"><message :location="'TOP_NAVBAR'" /></b-nav-text>
          <b-nav-text v-if="folder.folderId === -1">new folder</b-nav-text>
          <b-nav-text v-if="folder.folderId !== -1">update folder</b-nav-text>
        </b-navbar-nav>
        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-button-group class="mx-1">
            <b-button class="my-2 my-sm-0" type="button" v-on:click="cancel()">Cancel</b-button>
          </b-button-group>
          <b-button-group class="mx-1">
            <button class="btn btn-primary" v-on:click="save($event)">Save</button>
          </b-button-group>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
import NPFolder from '../../core/datamodel/NPFolder';
import AccountService from '../../core/service/AccountService';
import FolderService from '../../core/service/FolderService';
import UserLookupService from '../../core/service/UserLookupService';
import AppRoute from '../AppRoute';
import AccessPermission from '../../core/datamodel/AccessPermission';
import Message from '../common/Message';
import AppEvent from '../../core/util/AppEvent.js';
import EventManager from '../../core/util/EventManager';

export default {
  name: 'FolderDetail',
  components: {
    Message
  },
  props: ['parentFolder'],
  data () {
    return {
      folder: new NPFolder(),
      newSharing: AccessPermission.instance()
    };
  },
  mounted () {
    // a new folder
    let paths = this.$route.path.split('/');
    if (paths.length && paths[paths.length - 1] === 'add') {
      this.folder = NPFolder.of(this.parentFolder.moduleId, NPFolder.UNASSIGNED, AccountService.currentUser());
      return;
    }

    if (this.$route.params.folderId === 0) {
      this.folder = NPFolder.of(AppRoute.module(this.$route), NPFolder.ROOT, AccountService.currentUser());
    }

    let componentSelf = this;

    AccountService.hello()
      .then(function (response) {
        FolderService.get(NPFolder.of(AppRoute.module(componentSelf.$route), componentSelf.$route.params.folderId))
          .then(function (folder) {
            if (folder.folderId === 0) {
              componentSelf.folder.sharing = folder.sharing;
            } else {
              componentSelf.folder = folder;
            }
          })
          .catch(function (error) {
            console.log(error);
          });
      })
      .catch(function (error) {
        console.log(error);
      });
  },
  methods: {
    addNewSharing (newSharing) {
      let ap = new AccessPermission(newSharing);

      let noGo = false;
      if (this.folder.sharing) {
        for (let rec of this.folder.sharing) {
          if (rec.accessor.email === newSharing.accessor.email) {
            noGo = true;
            break;
          }
        }
      }

      if (!noGo) {
        let componentSelf = this;
        AccountService.hello()
          .then(function (response) {
            UserLookupService.searchUser(ap.accessor)
              .then(function (user) {
                ap.accessor.userId = user.userId;
                if (!ap.permission.read) {
                  ap.permission.read = true;
                }
                componentSelf.folder.sharing.push(ap);
                newSharing.accessor.email = '';
              })
              .catch(function (error) {
                newSharing.accessor._error = 'user cannot be found';
                console.log(error);
              })
              .finally(() => {
              });
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    },
    removeSharing (idx) {
      this.folder.sharing.splice(idx, 1);
    },
    save (event) {
      if (event) {
        event.preventDefault();
      }

      // get the parent folder
      if (!this.folder.parent) {
        this.folder.parent = this.parentFolder;
      }

      let action = FolderService.UPDATE;
      if (this.folder.isRoot()) {
        action = FolderService.UPDATE_SHARINGS;
      }

      let componentSelf = this;
      AccountService.hello()
        .then(function (response) {
          FolderService.save(componentSelf.folder, action)
            .then(function (folderObj) {
              EventManager.publish(AppEvent.FOLDER_RELOAD_EVENT, folderObj);
              componentSelf.$router.back();
            })
            .catch(function (error) {
              console.log(error);
            });
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    updateSharing () {
    },
    cancel () {
      this.$router.back();
    }
  }
}
</script>

<style scoped>
.ac-input {
  outline: 0 !important;
  background: transparent;
  border-radius: 0 !important;
  border-top: 0 !important;
  border-left: 0 !important;
  border-right: 0 !important;
  border-bottom: 1px solid #ced4da;
}

.is-invalid {
  border-color: #dc3545 !important;
}
</style>