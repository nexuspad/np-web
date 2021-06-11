<template>
    <div>
        <message :location="'TOP_STICKY'" />
        <entry-modal ref="entryModalRef" />
        <div class="np-list-menu-bar">
            <list-menu :folder="folder" v-on:toggleBulkEdit="bulkEdit = !bulkEdit" v-on:refreshList="refreshEvents()" />
        </div>
        <div class="np-content-below-menu">
            <FullCalendar ref="calendar" :options="calendarOptions" />
        </div>
    </div>
</template>

<script>
// https://fullcalendar.io/docs/vue
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import Message from '../common/Message';
import ListMenu from '../common/ListMenu';
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
import SiteProvider from '../common/SiteProvider';

export default {
    components: {
        FullCalendar, ListMenu, Message, EntryModal
    },
    mixins: [ FolderActionProvider, EntryActionProvider, SiteProvider ],
    data() {
        return {
            moduleId: NPModule.CALENDAR,
            folder: NPFolder.of(NPModule.CALENDAR, NPFolder.UNASSIGNED),
            calendarOptions: {
                plugins: [ dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin ],
                selectable: true,
                editable: true,
                initialView: PreferenceService.getCalendarDefaultView(),
                initialDate: PreferenceService.getCalendarDefaultDate(),
                headerToolbar: {
                    left: 'prevYear,prev,next,nextYear today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay listWeek'
                },
                events: this.fetchEvents,
                datesSet: (dateInfo) => {
                    PreferenceService.setCalendarDefaultView(dateInfo.view.type)
                    let defaultStartYmd = TimeUtil.npLocalDate(dateInfo.start)
                    // For month view, the start date is the starting of the hidden dates, often goes back to last month
                    // we need to use the currentStart from the view object to set the default date so we wont see the
                    // calendar month keeps getting moved back.
                    if (dateInfo.view.type === 'dayGridMonth') {
                        defaultStartYmd = TimeUtil.npLocalDate(this.$refs.calendar.getApi().view.currentStart)
                    }
                    PreferenceService.setCalendarDefaultDate(defaultStartYmd);
                },
                eventClick: (eventInfo) => {
                    this.selected = eventInfo.event;
                    console.log(eventInfo.event)
                    let npEvent = this.entryList.getEvent(eventInfo.event.id, eventInfo.event.extendedProps.npRecurId);    // get the NP event object and pass it to modal
                    this.goEntryRoute(npEvent, 'view', this.folder);
                },
                select: (selectionInfo) => {
                    let eventObj
                    if (selectionInfo.allDay) {
                        let endDateAdj = TimeUtil.addDays(selectionInfo.end, -1)
                        eventObj = NPEvent.of(this.folder, selectionInfo.startStr, null, TimeUtil.npLocalDate(endDateAdj), null);
                    } else {
                        let d1 = selectionInfo.start;
                        let d2 = selectionInfo.end;
                        eventObj = NPEvent.of(this.folder, TimeUtil.npLocalDate(d1), TimeUtil.npLocalTime(d1), TimeUtil.npLocalDate(d2), TimeUtil.npLocalTime(d2));
                    }
                    this.$router.push({name: 'newEvent', params: {entry: eventObj, folder: this.folder}});
                },
                eventDrop: (eventDropInfo) => {
                    console.log(eventDropInfo)
                    let event = eventDropInfo.event
                    let npEvent = this.entryList.getEvent(event.id, event.extendedProps.npRecurId);
                    npEvent.setTime(event.start, event.end, event.allDay)
                    if (!npEvent.timezone) {
                        npEvent.timezone = PreferenceService.getActiveTimezone();
                    }
                    this.save(null, npEvent);
                }
            }
        }
    },
    created () {
        let componentSelf = this;
        this.locateRouteFolder(NPModule.CALENDAR, this.$route.params).then(() => {
            componentSelf.$refs.calendar.getApi().refetchEvents();
        });
        EventManager.subscribe(AppEvent.ENTRY_UPDATE, this.refreshEvents);
    },
    beforeUnmount () {
        EventManager.unSubscribe(AppEvent.ENTRY_UPDATE, this.refreshEvents);
    },
    methods: {
        fetchEvents(fetchInfo, successCallback) {
            let componentSelf = this
            // the folder may not have been initialized. check here to avoid service call if it's not
            if (!componentSelf.folder || !componentSelf.folder.isValid()) {
                return;
            }

            // from moment to date to ymd
            let startYmd = TimeUtil.npLocalDate(fetchInfo.start);
            let endYmd = TimeUtil.npLocalDate(fetchInfo.end);
            let listQuery = ListKey.ofTimeline(NPModule.CALENDAR, componentSelf.folder.getOwnerId(), startYmd, endYmd, componentSelf.folder.folderId);

            componentSelf.listService = ListServiceFactory.locate({
                moduleId: NPModule.CALENDAR,
                folderId: componentSelf.folder.folderId,
                ownerId: componentSelf.folder.getOwnerId(),
                startDate: startYmd,
                endDate: endYmd
            });

            AccountService.hello()
            .then(function () {
                componentSelf.listService.getEntriesInDateRange(listQuery)
                .then(function (entryList) {
                    componentSelf.entryList = entryList;
                    successCallback(componentSelf.entryListToFCEvents(entryList));
                })
                .catch(function (error) {
                    console.log(error);
                });
            })
            .catch(function (error) {
                console.log(error);
            });
        },
        defaultDate () {
            return PreferenceService.getPreference().getCalendarDefaultDate();
        },
        refreshEvents () {
            this.listService.clear();
            this.$refs.calendar.getApi().refetchEvents();
        },
        removeEvent () {
            this.$refs.calendar.$emit('remove-event', this.selected);
            this.$refs.calendar.getApi().remove();
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
                    fcEvent.extendedProps = {
                        npRecurId: entry.recurId
                    }
                    fcEvent.title = entry.title;

                    // For event with multiple all days span, make sure the end date is added by 1 day
                    if (entry.hasTime() === false) {
                        fcEvent.allDay = true;
                        fcEvent.startStr = entry.localStartDate
                        if (entry.localEndDate) {
                            fcEvent.endStr = TimeUtil.npLocalDate(
                                TimeUtil.addDays(TimeUtil.toDateObj(entry.localEndDate), 1))
                        } else {
                            fcEvent.endStr = TimeUtil.npLocalDate(
                                TimeUtil.addDays(TimeUtil.toDateObj(entry.localStartDate), 1))
                        }

                        fcEvent.start = TimeUtil.toDateObj(fcEvent.startStr)
                        fcEvent.end = TimeUtil.toDateObj(fcEvent.endStr)

                    } else {
                        fcEvent.start = TimeUtil.iso8601Format(entry.startDateObj);
                        if (entry.endDateObj !== null) {
                            fcEvent.end = TimeUtil.iso8601Format(entry.endDateObj);
                        }
                    }

                    fcEvent.backgroundColor = entry.colorLabel;
                    fcEvent.borderColor = entry.colorLabel;
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
                componentSelf.$refs.calendar.getApi().refetchEvents();
            });
        }
    }
}
</script>