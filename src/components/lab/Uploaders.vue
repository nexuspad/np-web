<template>
  <div>
    Upload to folder {{ this.folder }}
    <uploader :folder="this.folder" />
  </div>
</template>

<script>
import Uploader from '../common/Uploader';
import NPFolder from '../../core/datamodel/NPFolder';
import NPModule from '../../core/datamodel/NPModule';
import AccountService from '../../core/service/AccountService';

export default {
  components: { Uploader },
  data: function () {
    return {
      folder: {}
    };
  },
  mounted () {
    let componentSelf = this;
    AccountService.hello()
      .then(function (response) {
        componentSelf.folder = NPFolder.of(NPModule.DOC, NPFolder.ROOT, AccountService.currentUser().userId);
      })
      .catch(function (error) {
        console.log(error);
      });
  }
}
</script>
