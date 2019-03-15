import EntryView from '../common/EntryView';
import EntryEdit from '../common/EntryEdit';
import Search from '../common/Search';
import Trashed from '../common/Trashed'
import Calendar from './Calendar'
import CalendarViews from './CalendarViews'
import NPModule from '../../core/datamodel/NPModule';
import FolderDetail from '../folder/FolderDetail';
import AppRoute from '../AppRoute';

export default class CalendarModule extends AppRoute {
  static routes (base) {
    AppRoute.base = base;

    if (base) {
      base = '/' + base;
    } else {
      base = '';
    }

    return [
      {
        path: base + '/calendar',
        component: Calendar,
        props: { moduleId: NPModule.CALENDAR },
        children: [
          {
            name: 'calendarHome',
            path: '',
            component: CalendarViews
          },
          {
            name: 'eventCalendar',
            path: 'calendar/:folderId',
            component: CalendarViews
          },
          {
            name: 'sharedCalendar',
            path: 'shared/:user/:folderId',
            component: CalendarViews
          },
          {
            name: 'newCalendar',
            path: 'calendar/add',
            component: FolderDetail,
            props: true
          },
          {
            name: 'updateCalendar',
            path: 'calendar/:folderId/update',
            component: FolderDetail,
            props: true
          },
          {
            name: 'eventSearch',
            path: 'search',
            component: Search,
            props: true
          },
          {
            name: 'calendarTrash',
            path: 'trash',
            component: Trashed,
            props: true
          }
        ]
      },
      {
        path: base + '/calendar/:entryId/view',
        name: 'viewEvent',
        component: EntryView,
        props: true
      },
      {
        path: base + '/calendar/:entryId/:recurId/view',
        name: 'viewRecurEvent',
        component: EntryView,
        props: true
      },
      {
        path: base + '/calendar/add',
        name: 'newEvent',
        component: EntryEdit,
        props: true
      },
      {
        path: base + '/calendar/:entryId/edit',
        name: 'editEvent',
        component: EntryEdit,
        props: true
      },
      {
        path: base + '/calendar/:entryId/:recurId/edit',
        name: 'editRecurEvent',
        component: EntryEdit,
        props: true
      },
      {
        path: base + '/calendar/shared/:user/:entryId/view',
        name: 'viewSharedEvent',
        component: EntryView,
        props: true
      },
      {
        path: base + '/calendar/shared/:user/:entryId/:recurId/view',
        name: 'viewSharedRecurEvent',
        component: EntryView,
        props: true
      },
      {
        path: base + '/calendar/shared/:user/add',
        name: 'newSharedEvent',
        component: EntryEdit,
        props: true
      },
      {
        path: base + '/calendar/shared/:user/:entryId/edit',
        name: 'editSharedEvent',
        component: EntryEdit,
        props: true
      },
      {
        path: base + '/calendar/shared/:user/:entryId/:recurId/edit',
        name: 'editSharedRecurEvent',
        component: EntryEdit,
        props: true
      }
    ];
  }
}
