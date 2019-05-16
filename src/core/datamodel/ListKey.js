import NPFolder from './NPFolder';
import NPModule from './NPModule';

/*
 * The class define the basic keys to make a query on list.
 */
export default class ListKey {
  moduleId;
  folderId = 0;
  ownerId;
  includeEntriesInAllFolders = false;
  templateId;
  keyword;
  keywordSet;
  pageId = 0;   // this is only for querying
  countPerPage;
  startDate = '';
  endDate = '';

  requester;

  constructor () {
    this.moduleId = NPModule.NOT_ASSIGNED;
  }

  static ofPaging (moduleId, folderIdOrOption, ownerId, pageId) {
    let instance = new ListKey();
    instance.moduleId = parseInt(moduleId);
    if (folderIdOrOption === 'all') {
      instance.folderId = 0;
      instance.includeEntriesInAllFolders = true;
    } else {
      instance.folderId = parseInt(folderIdOrOption);
    }
    instance.ownerId = ownerId;
    instance.pageId = parseInt(pageId);
    return instance;
  }

  static ofTimeline (moduleId, ownerId, startDate, endDate, folderId) {
    let instance = new ListKey();
    instance.moduleId = parseInt(moduleId);

    if (folderId) {
      instance.folderId = folderId;
      instance.includeEntriesInAllFolders = false;
    } else {
      instance.folderId = NPFolder.ROOT;
      instance.includeEntriesInAllFolders = true;
    }

    instance.ownerId = ownerId;
    instance.startDate = startDate;
    instance.endDate = endDate;
    return instance;
  }

  static ofSearch (moduleId, ownerId, keyword) {
    let instance = new ListKey();
    instance.moduleId = parseInt(moduleId);
    instance.folderId = NPFolder.ROOT;
    instance.ownerId = ownerId;
    instance.includeEntriesInAllFolders = true;
    instance.keyword = keyword;
    return instance;
  }
}
