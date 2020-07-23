import NPModule from '../core/datamodel/NPModule';

export default class AppRoute {
  static base;

  static moduleBaseUri () {
    return '/' + AppRoute.base + '/';
  }

  static moduleHome (route) {
    let pathParts = route.path.split('/');
    if (pathParts.length) {
      if (pathParts[0].length === 0) {
        pathParts.shift();
      }
      if (pathParts[0] === AppRoute.base) {
        pathParts.shift();
      }
      return '/' + AppRoute.base + '/' + pathParts[0];
    }
    return '/';
  }

  static module (route) {
    let pathParts = route.path.split('/');
    if (pathParts.length) {
      if (pathParts[0].length === 0) {
        pathParts.shift();
      }
      if (pathParts[0] === AppRoute.base) {
        pathParts.shift();
      }
      return NPModule.idForCode(pathParts[0]);
    }

    return NPModule.NOT_ASSIGNED;
  }

  static moduleHomeRouteName (moduleId) {
    let routeName = ''
    switch (moduleId) {
      case NPModule.CONTACT:
        routeName = 'contactHome';
        break;
      case NPModule.CALENDAR:
        routeName = 'calendarHome';
        break;
      case NPModule.DOC:
        routeName = 'docHome';
        break;
      case NPModule.BOOKMARK:
        routeName = 'bookmarkHome';
        break;
      case NPModule.PHOTO:
        routeName = 'photoHome';
        break;
    }
    return routeName;
  }

  static folderRouteName (folder) {
    let routeName = '';
    switch (folder.moduleId) {
      case NPModule.CONTACT:
        if (!folder.folderId) {
          routeName = 'contactHome';
        } else {
          routeName = 'contactFolder';
        }
        break;
      case NPModule.CALENDAR:
        if (!folder.folderId) {
          routeName = 'calendarHome';
        } else {
          routeName = 'eventCalendar';
        }
        break;
      case NPModule.DOC:
        if (!folder.folderId) {
          routeName = 'docHome';
        } else {
          routeName = 'docFolder';
        }
        break;
      case NPModule.BOOKMARK:
        if (!folder.folderId) {
          routeName = 'bookmarkHome';
        } else {
          routeName = 'bookmarkFolder';
        }
        break;
      case NPModule.PHOTO:
        if (!folder.folderId) {
          routeName = 'photoHome';
        } else {
          routeName = 'photoFolder';
        }
        break;
    }
    return routeName;
  }

  static sharedFolderRouteName (folder) {
    let routeName = '';
    switch (folder.moduleId) {
      case NPModule.CONTACT:
        routeName = 'sharedContactFolder';
        break;
      case NPModule.CALENDAR:
        routeName = 'sharedCalendar';
        break;
      case NPModule.DOC:
        routeName = 'sharedDocFolder';
        break;
      case NPModule.BOOKMARK:
        routeName = 'sharedBookmarkFolder';
        break;
      case NPModule.PHOTO:
        routeName = 'sharedPhotoFolder';
        break;
    }
    return routeName;
  }

  static trashFolderRouteName (moduleId) {
    let routeName = '';
    switch (moduleId) {
      case NPModule.CONTACT:
        routeName = 'contactTrash';
        break;
      case NPModule.CALENDAR:
        routeName = 'calendarTrash';
        break;
      case NPModule.DOC:
        routeName = 'docTrash';
        break;
      case NPModule.BOOKMARK:
        routeName = 'bookmarkTrash';
        break;
      case NPModule.PHOTO:
        routeName = 'photoTrash';
        break;
    }
    return routeName;
  }

  static entryRouteName (entry, action) {
    let routeName = '';
    switch (entry.moduleId) {
      case NPModule.CONTACT:
        routeName = action + 'Contact';
        break;
      case NPModule.CALENDAR:
        if (entry.recurring) {
          routeName = action + 'RecurEvent';
        } else {
          routeName = action + 'Event';
        }
        break;
      case NPModule.DOC:
        routeName = action + 'Doc';
        break;
      case NPModule.BOOKMARK:
        routeName = action + 'Bookmark';
        break;
    }
    return routeName;
  }

  static sharedEntryRouteName (entry, action) {
    let routeName = '';
    switch (entry.moduleId) {
      case NPModule.CONTACT:
        routeName = action + 'SharedContact';
        break;
      case NPModule.CALENDAR:
        if (entry.recurring) {
          routeName = action + 'SharedRecurEvent';
        } else {
          routeName = action + 'SharedEvent';
        }
        break;
      case NPModule.DOC:
        routeName = action + 'SharedDoc';
        break;
      case NPModule.BOOKMARK:
        routeName = action + 'SharedBookmark';
        break;
    }
    return routeName;
  }

  static isSharedRoute (routeName) {
    if (['shared'].indexOf(routeName) !== -1) {
      return true;
    }
    return false;
  }

  static isEditorRoute (routeName) {
    routeName = routeName.toLowerCase();
    if (['newcontact', 'editcontact', 'newevent', 'editevent', 'newdoc', 'editdoc', 'newbookmark', 'editbookmark'].indexOf(routeName) !== -1) {
      return true;
    }
    return false;
  }
}
