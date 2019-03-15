<template>
  <div>
    <form>
      <div class="form-group">
        <input type="text" class="form-control" v-model="npEvent.title" placeholder="Title" />
      </div>
      <div class="row">
        <div class="col">
          <date-time-picker :value="startDateValue" v-on:dateTimeSelected="onStartDateSelected" placeholder="Start date" />
        </div>
        <div class="col">
          <date-time-picker :value="startTimeValue" isFor="time" v-on:dateTimeSelected="onStartTimeSelected" placeholder="Start time" />
        </div>
      </div>
      <div class="row">
        <div class="col">
          <date-time-picker :value="endDateValue" v-on:dateTimeSelected="onEndDateSelected" placeholder="End date" />
        </div>
        <div class="col">
          <date-time-picker :value="endTimeValue" isFor="time" v-on:dateTimeSelected="onEndTimeSelected" placeholder="End time" />
        </div>
      </div>
      <div class="row form-group">
        <div class="col">
          <input class="form-control" id="startDate" type="date" v-model="testDate" />
        </div>
        <div class="col">
          <input class="form-control" id="startTime" type="time" v-model="testTime" />
        </div>
      </div>
      <div class="row form-group">
        <div class="col">
          <input class="form-control" id="endDate" type="date" />
        </div>
        <div class="col">
          <input class="form-control" id="endTime" type="time">
        </div>
      </div>
      <div class="form-group">
        <auto-resize-text-area v-model="npEvent.note" />
      </div>
    </form>
    <b-navbar toggleable="md" fixed="top" type="dark" variant="dark">
      <b-collapse is-nav id="editor_nav_menu_collapse">
        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-button-group class="mx-1">
            <b-button class="my-2 my-sm-0" type="button">Cancel</b-button>
          </b-button-group>
          <b-button-group class="mx-1">
            <button class="btn btn-primary" v-on:click="save($event)">Save</button>
          </b-button-group>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
import AutoResizeTextArea from '../common/AutoResizeTextArea';
import DateTimePicker from '../common/DateTimePicker';
import AccountService from '../../core/service/AccountService';
import NPEntry from '../../core/datamodel/NPEntry';
import EntryService from '../../core/service/EntryService';
import NPModule from '../../core/datamodel/NPModule';
import NPEvent from '../../core/datamodel/NPEvent';
import TimeUtil from '../../core/util/TimeUtil';

export default {
  name: 'EventEdit',
  props: ['event'],
  components: {
    AutoResizeTextArea, DateTimePicker
  },
  data () {
    return {
      npEvent: {},
      startDateValue: '',
      startTimeValue: '',
      endDateValue: '',
      endTimeValue: '',
      testDate: '2018-08-09',
      testTime: '14:20'
    };
  },
  mounted () {
    if (!this.$route.params.entryId) {
      this.npEvent = new NPEvent();
      this.npEvent.folder = NPFolder.of(NPModule.CALENDAR, NPFolder.ROOT);
      this.npEvent.localStartDate = TimeUtil.npLocalDate(Date.now());
      this.startDateValue = Date.now();
      return;
    }

    let entry = new NPEntry();
    entry.moduleId = NPModule.CALENDAR;
    entry.entryId = this.$route.params.entryId;

    let componentSelf = this;

    AccountService.hello()
      .then(function (response) {
        EntryService.get(entry)
          .then(function (entry) {
            componentSelf.npEvent = entry;
            componentSelf.startDateValue = entry.startDateObj;
          })
          .catch(function (error) {
            console.log(error);
          });
      })
      .catch(function (error) {
        console.log(error);
      });
  },
  methods: {
    onStartDateSelected: function (selectedDate) {
      this.npEvent.localStartDate = selectedDate.replace(/-/g, '');
    },
    onStartTimeSelected: function (selectedTime) {
      this.npEvent.localStartTime = selectedTime.replace(':', '');
    },
    onEndDateSelected: function (selectedDate) {
      this.npEvent.localEndDate = selectedDate.replace(/-/g, '');
    },
    onEndTimeSelected: function (selectedTime) {
      this.npEvent.localEndTime = selectedTime.replace(':', '');
    },
    save: function ($event) {
      console.log(this.npEvent);
      if ($event) {
        $event.preventDefault();
      }
      EntryService.save(this.npEvent)
        .then(function (entry) {
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }
};
</script>