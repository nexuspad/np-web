import NPModule from '../../core/datamodel/NPModule';
import NPFolder from '../../core/datamodel/NPFolder';
import AccountService from '../../core/service/AccountService';
import PreferenceService from '../../core/service/PreferenceService';
import AppRoute from '../AppRoute';

export default {
  methods: {
    logout () {
      if (this.user) {
        this.user = null;
      }
      let componentSelf = this;
      AccountService.logout()
        .then(function () {
          // route to login page
          componentSelf.$router.push('/login');
        })
        .catch(function (error) {
          componentSelf.$router.push('/login');
          console.log(error);
        });
    },
    goToLastVisit () {
      let lastVisit = PreferenceService.getPreference().getLastVisit();
      if (lastVisit && lastVisit.moduleId !== NPModule.NOT_ASSIGNED) {
        let folder = new NPFolder();
        folder.moduleId = lastVisit.moduleId;
        folder.folderId = NPFolder.ROOT;
        this.$router.push({ name: AppRoute.folderRouteName(folder) });
      } else {
        this.goToDefaultModule();
      }
    },
    goToDefaultModule () {
      let folder = new NPFolder();
      folder.moduleId = NPModule.DOC;
      folder.folderId = NPFolder.ROOT;
      this.$router.push({ name: AppRoute.folderRouteName(folder) });
    }
  }
}
