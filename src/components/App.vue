<template>
  <div class="container-fluid">
    <uploader-modal ref="uploaderRef" />
    <top-navigation />
    <router-view></router-view>
  </div>
</template>

<script>
import UploaderModal from './common/UploaderModal'
import EventManager from '../core/util/EventManager';
import AppEvent from '../core/util/AppEvent.js';

export default {
    components: { UploaderModal },
    mounted () {
      var me = this
      EventManager.subscribe(AppEvent.SHOW_UPLOADER, (appEvent) => {
        me.$refs.uploaderRef.showUploader(appEvent.affectedItem);
      })
    }
}
</script>