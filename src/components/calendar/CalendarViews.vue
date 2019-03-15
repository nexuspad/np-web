<template>
  <div>
    <message :location="'TOP_STICKY'" />
    <entry-modal ref="entryModalRef" />
    <list-menu :folder="folder" v-on:toggleBulkEdit="bulkEdit = !bulkEdit" v-on:refreshList="refreshEvents()" />
    <div class="np-content-below-menu">
      <full-calendar ref="calendar"
                    :event-sources="eventSources"
                    :config="config"
                    @event-selected="eventSelected"
                    @event-created="eventCreated" />
    </div>
    <div>
      <span class="small float-right">timezone: <strong>{{ config.timzone }}</strong></span>
    </div>
  </div>
</template>

<script>
import $ from 'jquery';
import Message from '../common/Message';
import ListMenu from '../common/ListMenu';
import FolderTree from '../folder/FolderTree';
import AccountService from '../../core/service/AccountService';
import PreferenceService from '../../core/service/PreferenceService';
import EntryActionProvider from '../common/EntryActionProvider';
import FolderActionProvider from '../common/FolderActionProvider.js';
import EntryModal from '../common/EntryModal';
import NPModule from '../../core/datamodel/NPModule';
import NPFolder from '../../core/datamodel/NPFolder';
import ListServiceFactory from '../../core/service/ListServiceFactory';
import ListKey from '../../core/datamodel/ListKey';
import TimeUtil from '../../core/util/TimeUtil';
import NPEvent from '../../core/datamodel/NPEvent';
import EventManager from '../../core/util/EventManager';
import AppEvent from '../../core/util/AppEvent';

export default {
  name: 'CalendarViews',
  components: {
    ListMenu, Message, FolderTree, EntryModal
  },
  mixins: [ FolderActionProvider, EntryActionProvider ],
  props: ['mode'],
  data () {
    return {
      moduleId: NPModule.CALENDAR,
      folder: NPFolder.of(NPModule.CALENDAR, NPFolder.UNASSIGNED),
      config: {
        defaultDate: this.defaultDate(),
        timzone: PreferenceService.getActiveTimezone(),
        nextDayThreshold: '00:00.00',
        customButtons: {
          monthButton: {
            text: 'month',
            click: function (event) {
              let view = $('#calendar').fullCalendar('getView');
              if (view.name.startsWith('list')) {
                $('#calendar').fullCalendar('changeView', 'listMonth');
              } else {
                $('#calendar').fullCalendar('changeView', 'month');
              }
            }
          },
          weekButton: {
            text: 'week',
            click: function (event) {
              let view = $('#calendar').fullCalendar('getView');
              if (view.name.startsWith('list')) {
                $('#calendar').fullCalendar('changeView', 'listWeek');
              } else {
                $('#calendar').fullCalendar('changeView', 'agendaWeek');
              }
            }
          },
          dayButton: {
            text: 'day',
            click: function (event) {
              let view = $('#calendar').fullCalendar('getView');
              if (view.name.startsWith('list')) {
                $('#calendar').fullCalendar('changeView', 'listDay');
              } else {
                $('#calendar').fullCalendar('changeView', 'agendaDay');
              }
            }
          },
          toggleListButton: {
            text: 'list',
            click: function (event) {
              let view = $('#calendar').fullCalendar('getView');
              if (view.name.startsWith('list')) {
                $(this).removeClass('fc-state-active');
              } else {
                $(this).addClass('fc-state-active');
              }
              if (view.name.startsWith('list')) {
                if (view.name === 'listMonth') {
                  $('#calendar').fullCalendar('changeView', 'month');
                } else {
                  let newView = view.name.replace('list', 'agenda');
                  $('#calendar').fullCalendar('changeView', newView);
                }
              } else {
                if (view.name === 'month') {
                  $('#calendar').fullCalendar('changeView', 'listMonth');
                } else {
                  let newView = view.name.replace('agenda', 'list');
                  $('#calendar').fullCalendar('changeView', newView);
                }
              }
            }
          }
        },
        header: {
          left: 'prev,next today',
          center: 'title',
          right: 'monthButton,weekButton,dayButton toggleListButton'
        },
        defaultView: 'month',
        viewRender: (view, element) => {
          let calendarYmd = $('#calendar').fullCalendar('getDate').format('YYYY-MM-DD');
          PreferenceService.getPreference().setCalendarDefaultDate(calendarYmd);
        },
        eventClick: (event) => {
          this.selected = event;
          let npEvent = this.entryList.getEvent(event.id, event.npRecurId);    // get the NP event object and pass it to modal
          this.goEntryRoute(npEvent, 'view', this.folder);
        },
        dayClick: (moment, jsEvent, view) => {
          let eventObj = NPEvent.of(this.folder, TimeUtil.npLocalDate(moment.local().toDate()));
          this.$router.push({name: 'newEvent', params: {entry: eventObj, folder: this.folder}});
        },
        select: (mStart, mEnd, jsEvent, view) => {
          let d1 = mStart.local().toDate();
          let d2 = mEnd.local().toDate();
          let eventObj = NPEvent.of(this.folder, TimeUtil.npLocalDate(d1), TimeUtil.npLocalTime(d1), TimeUtil.npLocalDate(d2), TimeUtil.npLocalTime(d2));
          this.$router.push({name: 'newEvent', params: {entry: eventObj, folder: this.folder}});
        },
        eventDrop: (event, delta) => {
          let npEvent = this.entryList.getEvent(event.id, event.npRecurId);
          /*
           * here we have to use format() function from momentjs to produce a date-time string with timezone offset (iso8601) first,
           * then use the date-fns utility in TimeUtil to convert the string to a date object.
           * the date object will then be used to set the local data/time in NPEvent object.
           */
          let endDateObj = event.end ? TimeUtil.iso8601ToDate(event.end.format()) : null;
          npEvent.setTime(TimeUtil.iso8601ToDate(event.start.format()), endDateObj);
          if (!npEvent.timezone) {
            npEvent.timezone = PreferenceService.getActiveTimezone();
          }
          this.save(null, npEvent);
        },
        drop: (...args) => {
        }
      }
    }
  },
  computed: {
    eventSources () {
      let componentSelf = this;
      return [
        {
          events (start, end, timezone, callback) {
            // the folder may not have been initialized. check here to avoid service call if it's not
            if (!componentSelf.folder || !componentSelf.folder.isValid()) {
              return;
            }

            // from moment to date to ymd
            let startYmd = TimeUtil.npLocalDate(start.toDate());
            let endYmd = TimeUtil.npLocalDate(end.toDate());
            let listQuery = ListKey.ofTimeline(NPModule.CALENDAR, componentSelf.folder.getOwnerId(), startYmd, endYmd, componentSelf.folder.folderId);

            componentSelf.listService = ListServiceFactory.locate({
              moduleId: NPModule.CALENDAR,
              folderId: componentSelf.folder.folderId,
              ownerId: componentSelf.folder.getOwnerId(),
              startDate: startYmd,
              endDate: endYmd
            });

            AccountService.hello()
              .then(function (response) {
                componentSelf.listService.getEntriesInDateRange(listQuery)
                  .then(function (entryList) {
                    componentSelf.entryList = entryList;
                    callback(componentSelf.entryListToFCEvents(entryList));
                  })
                  .catch(function (error) {
                    console.log(error);
                  });
              })
              .catch(function (error) {
                console.log(error);
              });
          }
        }
      ];
    }
  },
  created () {
    let componentSelf = this;
    this.locateRouteFolder(NPModule.CALENDAR, this.$route.params).then(() => {
      componentSelf.$refs.calendar.$emit('refetch-events');
    });
    EventManager.subscribe(AppEvent.ENTRY_UPDATE, this.refreshEvents);
  },
  beforeDestroy () {
    EventManager.unSubscribe(AppEvent.ENTRY_UPDATE, this.refreshEvents);
  },
  methods: {
    defaultDate () {
      return PreferenceService.getPreference().getCalendarDefaultDate();
    },
    changeView (view) {
      this.$refs.calendar.fireMethod('changeView', view)
    },
    refreshEvents () {
      this.listService.clear();
      this.$refs.calendar.$emit('refetch-events');
    },
    removeEvent () {
      this.$refs.calendar.$emit('remove-event', this.selected);
      this.selected = {};
    },
    eventSelected: function (event) {
      this.$router.push({name: 'editEvent', params: {entryId: event.id}});
    },
    eventCreated (...eventObj) {
      console.debug(eventObj);
    },
    eventTextColor (bgColor) {
      if (!bgColor) return '#222222';
      bgColor = bgColor.replace('#', '');
      let r = parseInt(bgColor.substr(0, 2), 16);
      let g = parseInt(bgColor.substr(2, 2), 16);
      let b = parseInt(bgColor.substr(4, 2), 16);
      let yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      return (yiq >= 128) ? '#222222' : '#fefefe';
    },
    entryListToFCEvents: function (entryList) {
      return entryList.entries.map(
        entry => {
          let fcEvent = {};
          fcEvent.id = entry.entryId;
          fcEvent.npRecurId = entry.recurId;
          fcEvent.title = entry.title;

          fcEvent.start = TimeUtil.iso8601Format(entry.startDateObj);
          if (entry.endDateObj !== null) {
            fcEvent.end = TimeUtil.iso8601Format(entry.endDateObj);
          }

          // one day or multiple days
          if (entry.hasTime() === false) {
            fcEvent.allDay = true;
          }

          fcEvent.backgroundColor = entry.colorLabel;
          fcEvent.textColor = this.eventTextColor(entry.colorLabel);

          return fcEvent;
        }
      )
    }
  },
  watch: {
    '$route.params': function () {
      let componentSelf = this;
      this.locateRouteFolder(NPModule.CALENDAR, this.$route.params).then(() => {
        componentSelf.$refs.calendar.$emit('refetch-events');
      });
    }
  }
};
</script>