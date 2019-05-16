<template>
  <div>
    <div v-if="sharers.length > 0">
      <ul class="nav nav-tabs h6 mt-2 mb-3" v-if="sharers.length > 0">
        <li class="nav-item">
          <a class="nav-link" :class="{ active: !$route.hash || $route.hash === '#mine' }" href="#mine">mine</a>
        </li>
        <li class="nav-item" v-for="(user, index) in sharers" v-bind:key="index">
          <a class="nav-link" :class="{ active: $route.hash === '#' + user.userName }" :href="'#' + user.userName">{{ user.displayName }}</a>
        </li>
      </ul>
    </div>
    <div v-for="(entryList, index) in searchResultAll" :key="index">
      <list :searchKeyword="keyword" :folder="entryList.folder" :pageId="pageId" :entryList="entryList" :listStyle=listStyle
        v-show="$route.hash === '#' + entryList.listSetting.ownerUserName || (!$route.hash && entryList.listSetting.ownerUserName === 'mine')" />
    </div>
    <div v-if="sharers.length === 0 && searchResultAll.length > 0">
      <empty :search=keyword v-if="searchResultAll[0].isEmpty() === true" />
    </div>
  </div>
</template>

<script>
import EntryActionProvider from './EntryActionProvider';
import List from './List';
import Empty from './Empty';
import AccountService from '../../core/service/AccountService';
import ListServiceFactory from '../../core/service/ListServiceFactory';
import AppRoute from '../AppRoute';
import NPFolder from '../../core/datamodel/NPFolder';
import ListKey from '../../core/datamodel/ListKey';
import SharedFolderService from '../../core/service/SharedFolderService';
import UserLookupService from '../../core/service/UserLookupService';
import NPModule from '../../core/datamodel/NPModule';
import Highlighter from '../../core/util/Highlighter.js';

export default {
  name: 'Search',
  mixins: [ EntryActionProvider ],
  data () {
    return {
      moduleId: 0,
      folder: null,
      folders: [],
      keyword: '',
      pageId: 1,
      countPerPage: 10,
      sharers: [],
      searchResultAll: [],
      listStyle: 'default',
    };
  },
  components: {
    List, Empty
  },
  beforeMount () {
    this.moduleId = AppRoute.module(this.$route);
    // in page refresh, AccountService.currentUser() may not return valid user object
    this.folder = NPFolder.of(this.moduleId, NPFolder.ROOT, AccountService.currentUser());
  },
  mounted () {
    if (this.$route.query.page) {
      this.pageId = this.$route.query.page;
    }
    if (this.$route.query.keyword) {
      this.keyword = this.$route.query.keyword;
      this.doSearch(this.moduleId, this.keyword);
    }

    if (this.moduleId === NPModule.PHOTO) {
      this.listStyle = 'grid';
    }
  },
  methods: {
    doSearch (moduleId, keyword) {
      while (this.searchResultAll.length > 0) {
        this.searchResultAll.pop();
      }

      let componentSelf = this;
      AccountService.hello().then(function (response) {
        componentSelf.folder = NPFolder.of(componentSelf.moduleId, NPFolder.ROOT, AccountService.currentUser());
        componentSelf.allRequests().then((allRequestPromises) => {
          Promise.all(allRequestPromises).then((entryListArr) => {
            for (let entryList of entryListArr) {
              if (entryList.listSetting.ownerId !== AccountService.currentUser().userId) {
                entryList.listSetting.ownerUserName = UserLookupService.getUserName(entryList.listSetting.ownerId);
              } else {
                entryList.listSetting.ownerUserName = 'mine';
              }

              entryList.entries.forEach(entry => {
                entry.title = Highlighter.mark(entry.title, entryList.listSetting.keywordSet);
                if (entry.description) {
                  entry.description = Highlighter.mark(entry.description, entryList.listSetting.keywordSet);
                }
                if (entry.tags && entry.tags.length > 0) {
                  entry.tags = entry.tags.map(tag => {
                    return Highlighter.mark(tag, entryList.listSetting.keywordSet);
                  });
                }
              });

              componentSelf.searchResultAll.push(entryList);
            }
          });
        });
      })
      .catch(function (error) {
        console.error(error);
      });
    },
    allRequests () {
      // returns all request promises
      let componentSelf = this;
      let moduleId = this.folder.moduleId;

      return new Promise((resolve) => {
        let searchReqPromiseArr = [];

        // search for own
        let listQuery = ListKey.ofSearch(moduleId, AccountService.currentUser().userId, componentSelf.keyword);
        let listService = ListServiceFactory.locate({
          moduleId: moduleId,
          folderId: componentSelf.folder.folderId,
          ownerId: AccountService.currentUser().userId,
          keyword: componentSelf.keyword
        });
        searchReqPromiseArr.push(listService.getList(listQuery));

        // search for all shared
        // there is no need to get all the shared folders. howeve this is needed to make sure the sharers are retrieved.
        SharedFolderService.getAllFolders(moduleId)
          .then(function () {
            componentSelf.sharers = SharedFolderService.sharers();
            componentSelf.sharers.forEach(u => {
              let listService = ListServiceFactory.locate({
                moduleId: moduleId,
                folderId: NPFolder.ROOT,
                ownerId: u.userId,
                keyword: componentSelf.keyword
              });
              let listQuery = ListKey.ofSearch(moduleId, u.userId, componentSelf.keyword);
              searchReqPromiseArr.push(listService.getList(listQuery));
            });

            resolve(searchReqPromiseArr);
          })
          .catch(function (error) {
            console.error(error);
          });
      });
    }
  },
  watch: {
    '$route.query.keyword': function (newKeyword) {
      this.keyword = newKeyword;
      this.doSearch(this.moduleId, this.keyword);
    }
  }
};
</script>