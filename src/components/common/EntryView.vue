<template>
  <div class="np-module-container">
    <message :location="'TOP_STICKY'" />
    <split-panel>
      <div slot="left-pane">
        <folder-tree :moduleId="moduleId" :active-folder-key="folderKey" usage="sidenav" />
        <shared-folder-tree :moduleId="moduleId" :active-folder-key="folderKey" usage="sidenav" />
      </div>
      <div slot="right-pane">
        <div class="mt-1 mb-2 np-entry-menu-bar" v-if="entryObj.entryId">
          <b-button-toolbar variant="light" size="sm">
            <b-button-group size="sm" class="mr-1">
              <b-button class="pl-3 pr-3" variant="light" @click="backToFolder()">
                <i class="fas fa-level-up-alt flipH" data-fa-transform="flip-h"></i>
              </b-button>
            </b-button-group>
            <entry-menu :entry="entryObj" :folder="folder" v-if="entryObj.hasWritePermission()" />
          </b-button-toolbar>
        </div>
        <div class="np-content-below-menu">
          <contact-detail :contactObj="entryObj" v-if="entryObj.moduleId === 1" />
          <event-detail :eventObj="entryObj" v-if="entryObj.moduleId === 2" />
          <bookmark-detail :bookmarkObj="entryObj" v-if="entryObj.moduleId === 3" />
          <doc-detail :docObj="entryObj" v-if="entryObj.moduleId === 4" />
        </div>
      </div>
    </split-panel>
  </div>
</template>

<script>
import Message from './Message';
import FolderTree from '../folder/FolderTree';
import SharedFolderTree from '../folder/SharedFolderTree';
import EntryMenu from './EntryMenu';
import EntryActionProvider from './EntryActionProvider';
import NPEntry from '../../core/datamodel/NPEntry';
import AccountService from '../../core/service/AccountService';
import EntryService from '../../core/service/EntryService';
import AppRoute from '../AppRoute';
import ContactDetail from '../contact/ContactDetail';
import BookmarkDetail from '../bookmark/BookmarkDetail';
import DocDetail from '../doc/DocDetail';
import EventDetail from '../calendar/EventDetail';
import NPModule from '../../core/datamodel/NPModule';
import NPContact from '../../core/datamodel/NPContact';
import NPEvent from '../../core/datamodel/NPEvent';
import NPDoc from '../../core/datamodel/NPDoc';
import NPBookmark from '../../core/datamodel/NPBookmark';
import NPFolder from '../../core/datamodel/NPFolder';
import EventManager from '../../core/util/EventManager';
import AppEvent from '../../core/util/AppEvent';
import NPUser from '../../core/datamodel/NPUser';
import EventService from '../../core/service/EventService';

export default {
  name: 'EntryView',
  props: ['entryId', 'recurId', 'folder'],
  mixins: [ EntryActionProvider ],
  components: {
    Message, FolderTree, SharedFolderTree, EntryMenu, ContactDetail, EventDetail, BookmarkDetail, DocDetail
  },
  data () {
    return {
      moduleId: 0,
      folderKey: '',
      entryObj: new NPEntry()
    };
  },
  beforeMount () {
    /*
     * get an entry object.
     * don't rely on props because the page may be refreshed.
     */
    let entryObj, folder;
    this.moduleId = AppRoute.module(this.$route);

    if (!this.folder) {
      folder = NPFolder.of(this.moduleId, NPFolder.UNASSIGNED);
    } else {
      folder = this.folder;
    }

    switch (this.moduleId) {
      case NPModule.CONTACT:
        entryObj = NPContact.blankInstance(folder, this.entryId);
        break;
      case NPModule.CALENDAR:
        entryObj = NPEvent.blankInstance(folder, this.entryId, this.recurId);
        break;
      case NPModule.DOC:
        entryObj = NPDoc.blankInstance(folder, this.entryId);
        break;
      case NPModule.BOOKMARK:
        entryObj = NPBookmark.blankInstance(folder, this.entryId);
        break;
    }

    if (this.$route.params.user) {
      entryObj.owner = NPUser.newFromId(this.$route.params.user);
    }

    let componentSelf = this;
    AccountService.hello()
      .then(function (response) {
        let p;
        if (entryObj instanceof NPEvent) {
          p = EventService.get(entryObj);
        } else {
          p = EntryService.get(entryObj);
        }
        p.then(function (entryObj) {
            componentSelf.entryObj = entryObj;
            componentSelf.folderKey = NPFolder.key({folder: entryObj.folder});
          })
          .catch(function (error) {
            console.log(error);
          });
      })
      .catch(function (error) {
        console.log(error);
      });
  },
  mounted () {
    EventManager.subscribe(AppEvent.ENTRY_DELETE, this.backToFolder);
    EventManager.subscribe(AppEvent.ENTRY_UPDATE, this.entryUpdated);
  },
  beforeDestroy () {
    EventManager.unSubscribe(AppEvent.ENTRY_DELETE, this.backToFolder);
    EventManager.unSubscribe(AppEvent.ENTRY_UPDATE, this.entryUpdated);
  },
  methods: {
    entryUpdated (appEvent) {
      // when update event is received, update the entry object with the latest in the event.
      let entryObj = appEvent.affectedItem;
      if (entryObj && entryObj.entryId == this.entryObj.entryId) {
        this.entryObj = entryObj;
      }
    },
    backToFolder () {
      this.$router.back();
      // if (!this.$router) {
      //   this.navigateToFolder(this.entryObj.folder);
      // }
    }
  }
};
</script> 