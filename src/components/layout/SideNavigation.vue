<template>
  <div>
    <folder-tree :moduleId="moduleId" :active-folder-key=activeFolderKey :usage="'sidenav'" />
    <shared-folder-tree :moduleId="moduleId" :active-folder-key=activeFolderKey :usage="'sidenav'" />
    <div>
      <i class="fas fa-trash-alt mr-1"></i>
      <a @click="openTrash()" v-bind:class="{ 'folder-selected': isTrashPage() }">trash</a>
    </div>
  </div>
</template>

<script>
import FolderTree from '../folder/FolderTree';
import SharedFolderTree from '../folder/SharedFolderTree';
import AppRoute from '../AppRoute';
import NPFolder from '../../core/datamodel/NPFolder';
import AccountService from '../../core/service/AccountService';

export default {
  name: 'SideNavigation',
  data () {
    return {
      moduleId: 0,
      activeFolderKey: ''
    };
  },
  components: {
    FolderTree, SharedFolderTree
  },
  created () {
    this.moduleId = AppRoute.module(this.$route);
    this.makeKey();
  },
  mounted () {
  },
  methods: {
    makeKey () {
      if (this.$route.params.user) {
        this.activeFolderKey = NPFolder.key({moduleId: this.moduleId, folderId: this.$route.params.folderId, ownerId: this.$route.params.user});
      } else {
        let componentSelf = this;
        // must wrap this for page refresh.
        AccountService.hello()
          .then(function (response) {
            componentSelf.activeFolderKey = 
              NPFolder.key({moduleId: componentSelf.moduleId, folderId: componentSelf.$route.params.folderId, ownerId: AccountService.currentUser().userId});
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    },
    isTrashPage () {
      return this.$route.path.includes('trash');
    },
    openTrash () {
      this.$router.push({name: AppRoute.trashFolderRouteName(this.moduleId), params: {moduleId: this.moduleId, folderId: NPFolder.TRASH}});
    }
  },
  watch: {
    '$route.params': function (params) {
      this.makeKey();
    }
  }
};
</script>

<style scoped>
a {
  text-decoration: none;
  color: black;
}
</style>
