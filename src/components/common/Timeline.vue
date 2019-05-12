<template>
  <div v-if="data && data.itemsByDate" class="container mb-5">
    <div v-for="dateStr in Object.keys(data.itemsByDate).sort().reverse()" v-bind:key="dateStr" class="row">
      <h4>{{formatDate(dateStr)}}</h4>
      <ul class="timeline">
        <li v-for="(item, idx) in data.itemsByDate[dateStr]" :key="idx">
          <a @click="openEntry(item)"><strong>{{ item.title }}</strong></a>
          <div>
            <small v-if="item.description">{{ item.description }}</small>
            <job-result :jobObj="item" v-if="item.jobId" />
          </div>
          <div>
            <span class="badge badge-pill badge-light">{{ time(item.updateTime) }}</span>
            <span class="badge badge-pill badge-info" v-if="status(item) === 0">in queue</span>
            <span class="badge badge-pill badge-info" v-if="status(item) === 1">running</span>
            <span class="badge badge-pill badge-warning" v-if="status(item) === 4">canceled</span>
            <span class="badge badge-pill badge-success" v-if="status(item) === 5">successful</span>
            <span class="badge badge-pill badge-danger" v-if="status(item) === 6">failed</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { parse, format } from 'date-fns';
import EntryActionProvider from './EntryActionProvider';
import JobResult from './JobResult';
import NPJob from '../../core/datamodel/NPJob';

export default {
  name: 'Timeline',
  mixins: [ EntryActionProvider ],
  props: ['data'],
  components: {
    JobResult
  },
  mounted () {
  },
  methods: {
    formatDate (dateStr) {
      return parse(dateStr).toLocaleDateString();
    },
    time (dateObj) {
      return format(parse(dateObj), 'HH:mm');
    },
    openEntry (entry) {
      this.goEntryRoute(entry, 'view', entry.folder);
    },
    status (item) {
      if (item instanceof NPJob) {
        return item.status;
      }
      return null;
    }
  }
}
</script>

<style>

</style>
