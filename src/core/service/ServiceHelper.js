let SERVICE_URIS = {
  'acct'                : '/user',
  'password'            : '/user/password',
  'resetPassword'       : '/user/resetPassword',
  'checkResetPasswordVerificationCode' : '/user/checkResetPasswordVerificationCode',

  'register'            : '/user/register',
  'accountHello'        : '/user/hello/%s',
  'accountVerification' : '/user/verify',
  'userName'            : '/user/username',
  'requestPasswordReset': '/user/requestpasswordreset',
  'displayName'         : '/user/displayname',
  'login'               : '/user/login',
  'logout'              : '/user/logout',
  'preference'          : '/user/account/preference',
  'activities'          : '/user/activities',

  'disableGCalendar'    : '/user/account/external/google/service',

  'search'              : '/search',

  'contactModule'       : '/contact',
  'contactFolder'       : '/contact/folder',
  'contactList'         : '/contacts?folder_id=%s&page=%s',
  'contactTimeline'     : '/contacts/timeline?start_date=%s&end_date=%s',
  'contactAll'          : '/contacts?page=%i',
  'contact'             : '/contact/%s',
  'newContact'          : '/contact',
  'contactLookup'       : '/addressbook',

  'eventModule'         : '/event',
  'eventCalendar'       : '/event/folder',
  'eventList'           : '/events?page=0&folder_id=%s&start_date=%s&end_date=%s',
  'searchEvent'         : '/events?page=0&folder_id=%s',
  'event'               : '/event/%s',
  'newEvent'            : '/event',

  'docModule'           : '/doc',
  'docFolder'           : '/doc/folder',
  'docList'             : '/docs?type=401&folder_id=%s&page=%s',
  'docTimeline'         : '/docs/timeline?start_date=%s&end_date=%s',
  'doc'                 : '/doc/%s',
  'newDoc'              : '/doc',
  'doc_placeholder'     : '/doc/placeholder',
  'doc_attachment'      : '/doc/%s/placeholder',
  'doc_s3_complete'     : '/doc/s3/%s',
  'docAttribute'        : '/doc/%s/attribute',

  'deleteAttachment'    : '/doc/upload/%s',

  'photoModule'         : '/photo',
  'photoFolder'         : '/photo/folder',
  'photoList'           : '/photos?type=601&folder_id=%s&page=%s',
  'photoTimeline'       : '/photos/timeline?start_date=%s&end_date=%s',
  'photo'               : '/photo/%s',
  'newPhoto'            : '/photo',
  'photoImage'          : '/photo/%s/image/%s',
  'photoNote'           : '/photo/%s/note',
  'photoRestore'        : '/photo/%s?action=restore',
  'photo_placeholder'   : '/photo/placeholder',
  'photo_s3_complete'   : '/photo/s3/%s',

  'imageUpdate'         : '/upload/image/%s',

  'bookmarkModule'      : '/bookmark',
  'bookmarkFolder'      : '/bookmark/folder',
  'bookmarkList'        : '/bookmarks?type=301&folder_id=%s&page=%s',
  'bookmarkTimeline'    : '/bookmarks/timeline?start_date=%s&end_date=%s',
  'bookmark'            : '/bookmark/%s',
  'newBookmark'         : '/bookmark',
  'bookmarkAttribute'   : '/bookmark/%s/attribute',

  'upload'              : '/upload/%s',
  'uploadToFolder'      : '/%s/file',
  'uploadToEntry'       : '/%s/%s/file',

  'folder'              : '/%s/folder',
  'updateFolder'        : '/%s/folder',

  'trashed'             : '/%s/trashed',

  'sharers'             : '/sharing/%s/sharers',

  'findUser'            : '/contacts/lookup?keyword=%s',
  'userLookup'          : '/addressbook',

  'cms'                 : '/cms'
}

export default SERVICE_URIS
