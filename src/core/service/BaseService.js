import ServiceHelper from './ServiceHelper'
import NPModule from '../datamodel/NPModule'
import CommonUtils from '../util/CommonUtils'
import TimeUtil from '../util/TimeUtil';
import AccountService from './AccountService';
import NPFolder from '../datamodel/NPFolder';
import PreferenceService from './PreferenceService';

export default class BaseService {
  // folder and entry actions
  static UPDATE = 'UPDATE';
  static DELETE = 'DELETE';
  static RESTORE = 'RESTORE';
  static MOVE = 'MOVE';

  // folder only actions
  static UPDATE_COLOR_LABEL = 'UPDATE_COLOR_LABEL';
  static UPDATE_SHARINGS = 'UPDATE_SHARINGS';

  static getHeaders ({ entry, folder, listQuery, timezone, locale }) {
    let headers = {};
    if (entry && entry.owner) {
      headers['otoken'] = entry.owner.userId;
    } else if (folder) {
      headers['otoken'] = folder.getOwnerId();
    } else if (listQuery) {
      headers['otoken'] = listQuery.ownerId;
    }

    if (!headers['otoken'] && AccountService.currentUser() !== null) {
      headers['otoken'] = AccountService.currentUser().userId;
    }

    if (timezone) {
      headers['timezone'] = timezone;
    }
    if (locale) {
      headers['locale'] = locale;
    } else {
      headers['locale'] = PreferenceService.getLocale();
    }
    return headers;
  }

  static getEntryEndPoint (entry) {
    let uri = '';
    switch (entry.getModuleId()) {
      case NPModule.CONTACT:
        if (entry.isNewEntry()) {
          uri = CommonUtils.sprintf(ServiceHelper.newContact);
        } else {
          uri = CommonUtils.sprintf(ServiceHelper.contact, entry.entryId);
        }
        break;
      case NPModule.CALENDAR:
        if (entry.isNewEntry()) {
          uri = CommonUtils.sprintf(ServiceHelper.newEvent);
        } else {
          uri = CommonUtils.sprintf(ServiceHelper.event, entry.entryId);
        }
        break;
      case NPModule.DOC:
        if (entry.isNewEntry()) {
          uri = CommonUtils.sprintf(ServiceHelper.newDoc);
        } else {
          uri = CommonUtils.sprintf(ServiceHelper.doc, entry.entryId);
        }
        break;
      case NPModule.PHOTO:
        if (entry.isNewEntry()) {
          uri = CommonUtils.sprintf(ServiceHelper.newPhoto);
        } else {
          uri = CommonUtils.sprintf(ServiceHelper.photo, entry.entryId);
        }
        break;
      case NPModule.BOOKMARK:
        if (entry.isNewEntry()) {
          uri = CommonUtils.sprintf(ServiceHelper.newBookmark);
        } else {
          uri = CommonUtils.sprintf(ServiceHelper.bookmark, entry.entryId);
        }
        break;
      case NPModule.UPLOAD:
        if (entry.isNewEntry()) {
          throw new Error('No implementation');
        } else {
          uri = CommonUtils.sprintf(ServiceHelper.upload, entry.entryId);
        }
        break;
    }

    return uri;
  }

  static getBulkEditEndPoint (moduleId, serviceAction) {
    let uri = '';
    switch (moduleId) {
      case NPModule.CONTACT:
        uri = CommonUtils.sprintf(ServiceHelper.contact, serviceAction);
        break;
      case NPModule.CALENDAR:
        uri = CommonUtils.sprintf(ServiceHelper.event, serviceAction);
        break;
      case NPModule.DOC:
        uri = CommonUtils.sprintf(ServiceHelper.doc, serviceAction);
        break;
      case NPModule.PHOTO:
        uri = CommonUtils.sprintf(ServiceHelper.photo, serviceAction);
        break;
      case NPModule.BOOKMARK:
        uri = CommonUtils.sprintf(ServiceHelper.bookmark, serviceAction);
        break;
    }
    return uri;
  }

  static getListEndPoint (moduleId, folderId, page) {
    let uri = '';
    switch (moduleId) {
      case NPModule.CONTACT:
        uri = CommonUtils.sprintf(ServiceHelper.contactList, folderId, page);
        break;
      case NPModule.CALENDAR:
        uri = CommonUtils.sprintf(ServiceHelper.eventList, folderId, page);
        break;
      case NPModule.DOC:
        uri = CommonUtils.sprintf(ServiceHelper.docList, folderId, page);
        break;
      case NPModule.PHOTO:
        uri = CommonUtils.sprintf(ServiceHelper.photoList, folderId, page);
        break;
      case NPModule.BOOKMARK:
        uri = CommonUtils.sprintf(ServiceHelper.bookmarkList, folderId, page);
        break;
    }

    return uri;
  }

  static getSearchEndPoint (moduleId, folderId, keyword) {
    let uri = ServiceHelper.search + '/' + BaseService._entriesForId(moduleId);
    uri = CommonUtils.addParamToUrl(uri, 'keyword', keyword)
    return uri;
  }

  static getTimelineEndPoint (moduleId, folderOption, startDate, endDate) {
    let uri = '';
    switch (moduleId) {
      case NPModule.CONTACT:
        uri = CommonUtils.sprintf(ServiceHelper.contactTimeline, TimeUtil.npLocalDate(startDate), TimeUtil.npLocalDate(endDate));
        break;
      case NPModule.CALENDAR:
        uri = CommonUtils.sprintf(ServiceHelper.eventList, folderOption, TimeUtil.npLocalDate(startDate), TimeUtil.npLocalDate(endDate));
        break;
      case NPModule.DOC:
        uri = CommonUtils.sprintf(ServiceHelper.docTimeline, TimeUtil.npLocalDate(startDate), TimeUtil.npLocalDate(endDate));
        break;
      case NPModule.PHOTO:
        uri = CommonUtils.sprintf(ServiceHelper.photoTimeline, TimeUtil.npLocalDate(startDate), TimeUtil.npLocalDate(endDate));
        break;
      case NPModule.BOOKMARK:
        uri = CommonUtils.sprintf(ServiceHelper.bookmarkTimeline, TimeUtil.npLocalDate(startDate), TimeUtil.npLocalDate(endDate));
        break;
    }

    return uri;
  }

  static getSubFoldersEndPoint (folderObj, shared) {
    let uri = BaseService._getModuleBase(folderObj.moduleId);
    if (shared) {
      uri = uri + '/shared/folders';
    } else {
      uri = uri + '/folders';
    }
    return uri;
  }

  static getFolderDetailEndPoint (folderObj) {
    let uri = BaseService._getFolderEndPoint(folderObj);

    if (folderObj.folderId !== NPFolder.UNASSIGNED) {
      uri = uri + '/' + folderObj.folderId;
    }

    if (folderObj.owner && AccountService.currentUser().userId !== folderObj.owner.userId) {
      uri = uri + '?owner_id=' + folderObj.owner.userId;
    }
    return uri;
  }

  static getTrashedEndpoint (moduleId) {
    return CommonUtils.sprintf(ServiceHelper.trashed, BaseService._entriesForId(moduleId));
  }

  static getDeleteAttachmentEndpoint (uploadEntryId) {
    return CommonUtils.sprintf(ServiceHelper.deleteAttachment, uploadEntryId);
  }

  static getUploadPlaceHolderEndPoint (moduleId, entryId) {
    let uploadPlaceholderUrl;
    if (moduleId === NPModule.DOC) {
      if (entryId) {
        uploadPlaceholderUrl = CommonUtils.sprintf(ServiceHelper.doc_attachment, entryId);
      } else {
        uploadPlaceholderUrl = ServiceHelper.doc_placeholder;
      }
    } else if (moduleId === NPModule.PHOTO) {
      uploadPlaceholderUrl = ServiceHelper.photo_placeholder;
    }
    return uploadPlaceholderUrl;
  }

  static getUploadCompletionEndPoint (uploadEntry) {
    let uploadCompletionUrl;
    if (uploadEntry.parentEntry.getModuleId() === NPModule.DOC) {
      uploadCompletionUrl = CommonUtils.sprintf(ServiceHelper.doc_s3_complete, uploadEntry.entryId);
    } else if (uploadEntry.parentEntry.getModuleId() === NPModule.PHOTO) {
      uploadCompletionUrl = CommonUtils.sprintf(ServiceHelper.photo_s3_complete, uploadEntry.entryId);
    }

    if (AccountService.currentUser().userId !== uploadEntry.parentEntry.owner.userId) {
      uploadCompletionUrl = uploadCompletionUrl + '?owner_id=' + uploadEntry.parentEntry.owner.userId;
    }

    return uploadCompletionUrl;
  }

  static getEmptyTrashEndPoint (moduleId) {
    let uri = BaseService._entriesForId(moduleId) + '/trashed';
    return uri;
  }

  static parseResponse (response) {
    /**
     * Let non-api related XHR through.
     */
    if (response.config) {
      return;
    }

    if (response.status && response.status.toUpperCase() === 'FAILURE') {
      console.log('API error response: ', response);
      return this.getMessage(response.code);
    } else if (response.data && response.data.status && response.data.status.toUpperCase() === 'FAILURE' && response.data.code) {
      return this.getMessage(response.data.code);
    }

    return response.code;
  }

  static getMessage (code) {
    switch (parseInt(code)) {
      case 1001:
        // Invalid session error
        window.location = '/account.htm';
        break;
      case 2001:
        break;
      case 2070:
        return 'Folder with same name exists';
      default:
        return 'API error';
    }
  }

  static _getFolderEndPoint (folderObj) {
    let uri = '';
    switch (folderObj.moduleId) {
      case NPModule.CONTACT:
        uri = ServiceHelper.contactFolder;
        break;
      case NPModule.CALENDAR:
        uri = ServiceHelper.eventCalendar;
        break;
      case NPModule.DOC:
        uri = ServiceHelper.docFolder;
        break;
      case NPModule.PHOTO:
        uri = ServiceHelper.photoFolder;
        break;
      case NPModule.BOOKMARK:
        uri = ServiceHelper.bookmarkFolder;
        break;
      default:
        throw Error('Invalid module Id');
    }
    return uri;
  }

  static _getModuleBase (moduleId) {
    let uri = '';
    switch (moduleId) {
      case NPModule.CONTACT:
        uri = ServiceHelper.contactModule;
        break;
      case NPModule.CALENDAR:
        uri = ServiceHelper.eventModule;
        break;
      case NPModule.DOC:
        uri = ServiceHelper.docModule;
        break;
      case NPModule.PHOTO:
        uri = ServiceHelper.photoModule;
        break;
      case NPModule.BOOKMARK:
        uri = ServiceHelper.bookmarkModule;
        break;
    }
    return uri;
  }

  static _entriesForId (id) {
    switch (id) {
      case NPModule.BOOKMARK:
        return 'bookmarks';
      case NPModule.CONTACT:
        return 'contacts';
      case NPModule.CALENDAR:
        return 'events';
      case NPModule.DOC:
        return 'docs';
      case NPModule.PHOTO:
        return 'photos';
      case NPModule.UPLOAD:
        return 'uploads';
    }
  }
}
