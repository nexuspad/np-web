<template>
  <div>
    <form>
      <div class="row form-group">
        <div class="col">
          <input type="text" class="form-control input-underline" v-model="npEvent.title" :placeholder="npContent('title')" />
        </div>
        <div class="col-2">
          <input type="color" class="form-control color-label" :style="{background: getColorLabel()}" v-model="npEvent.colorLabel">
        </div>
      </div>
      <div class="row form-group">
        <div class="col">
          <input class="form-control" id="startDate" type="date" v-model="npEvent.localStartDate" />
        </div>
        <div class="col">
          <input class="form-control" id="startTime" type="time" v-model="npEvent.localStartTime" />
        </div>
      </div>
      <div class="row form-group">
        <div class="col">
          <input class="form-control" id="endDate" type="date" v-model="npEvent.localEndDate" />
        </div>
        <div class="col">
          <input class="form-control" id="endTime" type="time" v-model="npEvent.localEndTime" >
        </div>
      </div>
      <div class="row form-group pt-2">
        <div class="col">
          <label class="mr-2">{{npContent('reminder')}}</label>
          <div class="custom-control custom-radio custom-control-inline">
            <input type="radio" id="reminderYes" name="reminderToggle" class="custom-control-input"
                  :checked="hasReminder()" v-on:change="toggleReminder(true)">
            <label class="custom-control-label" for="reminderYes">{{npContent('yes')}}</label>
          </div>
          <div class="custom-control custom-radio custom-control-inline">
            <input type="radio" id="reminderNo" name="reminderToggle" class="custom-control-input"
                  :checked="!hasReminder()" v-on:change="toggleReminder(false)">
            <label class="custom-control-label" for="reminderNo">{{npContent('no')}}</label>
          </div>
        </div>
      </div>
      <div class="row form-group" v-if="hasReminder()">
        <div class="col-6">
          <label for="ReminderAddress">{{npContent('deliver to')}}</label>
          <input class="form-control" id="ReminderAddress" v-model="npEvent.eventReminders[0].deliverAddress" >
        </div>
        <div class="col">
          <label>&nbsp;</label>
          <select class="form-control" v-model="npEvent.eventReminders[0].unitCount">
            <option v-for="(value, index) in reminderTimeValues(npEvent.eventReminders[0].unit)" :key="index" :value="value">{{value}}</option>
          </select>
        </div>
        <div class="col">
          <label>&nbsp;</label>
          <select class="form-control" v-model="npEvent.eventReminders[0].unit" v-on:change="reminderUnitUpdated()">
            <option value="MINUTE">{{npContent('minute')}}</option>
            <option value="HOUR">{{npContent('hour')}}</option>
            <option value="DAY">{{npContent('day')}}</option>
          </select>
        </div>
      </div>
      <div class="row form-group">
        <div class="col">
          <label>repeat</label>
          <select class="form-control" id="RepeatPattern" v-model="npEvent.recurrence.pattern">
            <option value="NOREPEAT">{{npContent('no')}}</option>
            <option value="DAILY">{{npContent('daily')}}</option>
            <option value="WEEKDAILY">{{npContent('every weekday')}}</option>
            <option value="WEEKLY">{{npContent('weekly')}}</option>
            <option value="MONTHLY">{{npContent('monthly')}}</option>
            <option value="YEARLY">{{npContent('yearly')}}</option>
          </select>
        </div>
        <div class="col" v-show="recurring()">
          <label for="RepeatTimes">{{npContent('times')}}</label>
          <input class="form-control" size="3" id="RepeatTimes" v-model="npEvent.recurrence.recurrenceTimes" >
        </div>
        <div class="col" v-show="recurring()">
          <label for="RepeatEndDate">{{npContent('or end by')}}</label>
          <input class="form-control" type="date" id="RepeatEndDate" :min="npEvent.localStartDate" v-model="npEvent.recurrence.endDate" >
        </div>
      </div>
      <div class="form-group row">
        <div class="col">
          <label-input ref="tagInput" :initialValues="npEvent.tags" />
        </div>
      </div>
      <div class="form-group row">
        <div class="col">
          <textarea-autosize class="form-control input-underline" :placeholder="npContent('notes')" v-model="npEvent.note"></textarea-autosize>
        </div>
      </div>
    </form>
    <b-navbar toggleable="md" fixed="top" type="dark" variant="dark">
      <b-collapse is-nav id="editor_nav_menu_collapse">
        <b-navbar-nav>
          <b-nav-text class="mr-2"><message :location="'TOP_NAVBAR'" /></b-nav-text>
          <b-nav-text v-if="!npEvent.entryId">{{npContent('new event')}}</b-nav-text>
          <b-nav-text v-if="npEvent.entryId">{{npContent('update event')}}</b-nav-text>
        </b-navbar-nav>
        <b-navbar-nav v-if="npEvent.recurring">
          <b-dropdown :text="whatsUpdateOption(updateOption)" class="ml-4" size="sm">
            <b-dropdown-item @click="updateOption = 0">{{ whatsUpdateOption(0) }}</b-dropdown-item>
            <b-dropdown-item @click="updateOption = 1">{{ whatsUpdateOption(1) }}</b-dropdown-item>
          </b-dropdown>
        </b-navbar-nav>

        <!-- right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-button-group class="mx-1">
            <button class="btn btn-primary" v-on:click="collectTags(); saveEvent($event, npEvent)">{{npContent('save')}}</button>
          </b-button-group>
          <b-button-group class="mx-1">
            <b-button class="my-2 my-sm-0" type="button" v-on:click="cancel()">{{npContent('cancel')}}</b-button>
          </b-button-group>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
import Message from '../common/Message';
import LabelInput from '../common/LabelInput';
import AccountService from '../../core/service/AccountService';
import PreferenceService from '../../core/service/PreferenceService';
import EventService from '../../core/service/EventService';
import NPEvent from '../../core/datamodel/NPEvent';
import TimeUtil from '../../core/util/TimeUtil';
import EntryActionProvider from '../common/EntryActionProvider';
import Reminder from '../../core/datamodel/Reminder';
import Recurrence from '../../core/datamodel/Recurrence';
import SiteProvider from '../common/SiteProvider';

export default {
  name: 'EventEdit',
  mixins: [ EntryActionProvider, SiteProvider ],
  components: {
    LabelInput, Message
  },
  props: ['event', 'folder'],
  data () {
    return {
      npEvent: new NPEvent(),
      updateOption: 0
    };
  },
  mounted () {
    if (this.$route.params.entryId) {
      this.npEvent = NPEvent.blankInstance(this.folder, this.$route.params.entryId);

      if (this.$route.params.recurId) {
        this.npEvent.recurId = this.$route.params.recurId;
        this.updateOption = 1;
      }

      let componentSelf = this;
      AccountService.hello()
        .then(function (response) {
          EventService.get(componentSelf.npEvent)
            .then(function (entry) {
              componentSelf.npEvent = entry;
              // repoint the folder reference to the one in the component so changing folder would work
              componentSelf.npEvent.folder = componentSelf.folder;
            })
            .catch(function (error) {
              console.log(error);
            });
        })
        .catch(function (error) {
          console.log(error);
        });
    } else {
      if (this.event) {
        this.npEvent = this.event;
        this.npEvent.folder = this.folder;
      } else {
        this.npEvent = NPEvent.blankInstance(this.folder);
        this.npEvent.localStartDate = TimeUtil.npLocalDate(Date.now());
      }

      if (!this.npEvent.entryId) {
        this.npEvent.colorLabel = this.folder.colorLabel;
      }

      if (!this.npEvent.timezone) {
        this.npEvent.timezone = PreferenceService.getPreference().getTimezoneName();
      }
    }
  },
  methods: {
    getColorLabel () {
      if (this.npEvent.colorLabel) {
        return this.npEvent.colorLabel;
      } else if (this.npEvent.folder.colorLabel) {
        return this.npEvent.folder.colorLabel;
      } else {
        return '#336699';
      }
    },
    hasReminder () {
      return this.npEvent.hasReminder();
    },
    toggleReminder (yes) {
      if (yes) {
        let reminder = new Reminder();
        reminder.deliverType = 'EMAIL';
        reminder.deliverAddress = AccountService.currentUser().email;
        this.npEvent.addReminder(reminder);
      } else {
        this.npEvent.clearReminder();
      }
    },
    reminderUnitUpdated () {
      // make sure something is selected in the dropdown
      if (this.npEvent.eventReminders[0].unit == 'MINUTE') {
        this.npEvent.eventReminders[0].unitCount = 15;
      } else {
        this.npEvent.eventReminders[0].unitCount = 1;
      }
    },
    reminderTimeValues (timeUnit) {
      if (timeUnit === 'MINUTE') {
        return [15, 30, 45];
      } else {
        return [1, 2, 3, 4, 5, 6, 6, 8, 9, 10, 11, 12];
      }
    },
    defaultRecurEndDateValue () {
    },
    recurring () {
      if (this.npEvent.recurrence && this.npEvent.recurrence.pattern !== Recurrence.NOREPEAT) {
        return true;
      }
      return false;
    },
    collectTags () {
      this.npEvent.tags = this.$refs.tagInput.getLabels();
    },
    switchToUpdateAll (newValue, oldValue) {
      if (typeof oldValue !== 'undefined' && oldValue !== 'NOREPEAT')
        this.updateOption = 0;
    },
    whatsUpdateOption (option) {
      if (option == 0) {
        return 'all occurrences';
      } else {
        return 'this one only';
      }
    },
    saveEvent ($event, npEventObj) {
      if (!npEventObj.timezone) {
        npEventObj.timezone = PreferenceService.getPreference().getTimezoneName();
      }
      this.save($event, npEventObj, this.updateOption);
    },
    cancel () {
      this.$router.back();
    }
  },
  watch: {
    'folder.folderId': function () {
      this.npEvent.colorLabel = this.folder.colorLabel;
    },
    'npEvent.localStartDate': function (newValue, oldValue) {
      this.switchToUpdateAll(newValue, oldValue);
    },
    'npEvent.localStartTime': function (newValue, oldValue) {
      this.switchToUpdateAll(newValue, oldValue);
    },
    'npEvent.localEndDate': function (newValue, oldValue) {
      this.switchToUpdateAll(newValue, oldValue);
    },
    'npEvent.localEndTime': function (newValue, oldValue) {
      this.switchToUpdateAll(newValue, oldValue);
    },
    'npEvent.recurrence.pattern': function (newValue, oldValue) {
      this.switchToUpdateAll(newValue, oldValue);
    },
    'npEvent.recurrence.recurrenceTimes': function (newValue, oldValue) {
      this.switchToUpdateAll(newValue, oldValue);
    },
    'npEvent.recurrence.endDate': function (newValue, oldValue) {
      this.switchToUpdateAll(newValue, oldValue);
    }
  }
};
</script>

<style scoped>
label {font-size: 85%; font-weight: bold;}
</style>
