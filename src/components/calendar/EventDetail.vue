<template>
  <div class="card">
    <h1 class="card-header">
      <span v-html="$options.filters.npHighlighter(eventObj.title, keyword)" />
    </h1>
    <div class="card-body">
      <ul class="list-inline">
        <li v-for="tag in eventObj.tags" :key="tag" class="list-inline-item">
          <span class="badge badge-info">{{ tag }}</span>
        </li>
      </ul>
      <div v-if="eventDisplay.range === false">
        <div v-if="eventDisplay.dateAndTime">
          <b>{{ eventObj.localStartDate }}</b>
          &nbsp;
          <b>{{ eventObj.localStartTime }}</b>
          &nbsp;
          <span>{{eventObj.timezone}}</span>
        </div>
        <div v-if="!eventDisplay.dateAndTime">
          <b>{{ eventObj.localStartDate }}</b>
        </div>
      </div>
      <div v-if="eventDisplay.range === true">
        <div v-if="eventDisplay.dateAndTime">
          from&nbsp; <b>{{ eventObj.localStartDate }}</b> &nbsp; <b>{{ eventObj.localStartTime }}</b>
          to&nbsp; <b>{{ eventObj.localEndDate }}</b>&nbsp; <b>{{ eventObj.localEndTime }}</b>
          &nbsp;
          <span>{{eventObj.timezone}}</span>
        </div>
        <div v-if="!eventDisplay.dateAndTime">
          from&nbsp; <b>{{ eventObj.localStartDate }}</b>
          to&nbsp; <b>{{ eventObj.localEndDate }}</b>
        </div>
      </div>
      <div v-if="eventObj.getRecurrence() !== null">
        <span class="lead">recurring</span>
        <span>{{eventObj.getRecurrence().pattern}}</span>
        <span v-if="eventObj.getRecurrence().endDate">until {{eventObj.getRecurrence().endDate}}</span>
        <span v-if="eventObj.getRecurrence().recurrenceTimes">for {{eventObj.getRecurrence().recurrenceTimes}} times</span>
      </div>
      <div v-if="eventObj.hasReminder()">
        <span class="lead">reminder:</span>
        {{eventObj.eventReminders[0].deliverType}}
        {{eventObj.eventReminders[0].deliverAddress}}
        {{eventObj.eventReminders[0].unitCount}}
        {{eventObj.eventReminders[0].unit}}
        before start
      </div>
    </div>
    <div class="card-footer" v-if="eventObj.note">
      <span style="white-space: pre;">{{ eventObj.note }}</span>
    </div>
    <pre class="debug-info" v-if="debuggingEnabled()">
      <code>{{debug()}}</code>
    </pre>
  </div>
</template>

<script>
import TimeUtil from '../../core/util/TimeUtil';
import SiteProvider from '../common/SiteProvider';

export default {
  name: 'EventDetail',
  props: ['eventObj', 'keyword'],
  mixins: [ SiteProvider ],
  data () {
    return {
      eventDisplay: {
        singlePoint: true,
        range: false,
        dateAndTime: false
      }
    };
  },
  computed: {
  },
  mounted () {
    if (this.eventObj.localStartTime) {
      this.eventDisplay.dateAndTime = true;
    }
    if (this.eventObj.localEndDate && this.eventObj.localEndDate !== this.eventObj.localStartDate) {
      this.eventDisplay.range = true;
    } else if (this.eventObj.localEndTime && this.eventObj.localEndTime !== this.eventObj.localStartTime) {
      this.eventDisplay.range = true;
    }

    this.eventObj.localStartTime = TimeUtil.hh24ToAmPm(this.eventObj.localStartTime);
    this.eventObj.localEndTime = TimeUtil.hh24ToAmPm(this.eventObj.localEndTime);
  },
  methods: {
    debug () {
      return JSON.stringify(this.eventObj, null, 4);
    }
  }
};
</script> 