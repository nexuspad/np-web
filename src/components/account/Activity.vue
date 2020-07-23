<template>
  <div class="np-module-container np-slim-box">
    <message :location="'TOP_STICKY'" />
    <h2>{{npContent('activites')}}</h2>
    <timeline :data="timelineList" />
  </div>
</template>

<script>
import AccountService from '../../core/service/AccountService';
import TimelineListService from '../../core/service/TimelineListService';
import Message from '../common/Message';
import Timeline from '../common/Timeline';
import SiteProvider from '../common/SiteProvider';

export default {
  name: 'Activity',
  mixins: [SiteProvider ],
  components: {
    Message, Timeline
  },
  data () {
    return {
      timelineList: {}
    };
  },
  mounted () {
    let componentSelf = this;
    AccountService.hello()
      .then(function () {
        TimelineListService.activities()
          .then(function (timelineList) {
            componentSelf.timelineList = timelineList;
          });
      })
      .catch(function (error) {
        console.error(error);
      });
  },
  methods: {
    isEmailValid () {
    },
    cancel: function () {
      this.$router.back();
    }
  }
}
</script>

<style>

</style>
