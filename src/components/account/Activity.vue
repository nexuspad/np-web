<template>
  <div class="np-module-container np-slim-box">
    <message :location="'TOP_STICKY'" />
    <h2>activites</h2>
    <timeline :data="timelineList" />
  </div>
</template>

<script>
import DateRangePicker from 'vue2-daterange-picker'
import AccountService from '../../core/service/AccountService';
import TimelineListService from '../../core/service/TimelineListService';
import Message from '../common/Message';
import EventManager from '../../core/util/EventManager';
import AppEvent from '../../core/util/AppEvent';
import CommonUtils from '../../core/util/CommonUtils';
import Timeline from '../common/Timeline';

export default {
  name: 'Activity',
  mixins: [ ],
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
      .then(function (userObj) {
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
