import ListKey from './ListKey';
import NPUser from './NPUser';

/*
 * In addition to ListKey, there are other attributes in this class to further define what an EntryList
 * might contain. It's especially useful in pagination.
 */
export default class ListSetting extends ListKey {
  totalCount;
  pages = [];

  sortBy;
  sortOrder;

  constructor (data) {
    super(data);

    if (data) {
      this.moduleId = data.moduleId;
      this.includeEntriesInAllFolders = data.includeEntriesInAllFolders;

      if (data.folders && data.folders.length > 0) {
        this.folderId = data.folders[0];
      }

      if (data.owner) {
        this.ownerId = data.owner.userId;
      }

      if (data.requester) {
        this.requester = new NPUser();
        this.requester.setUserId(data.requester.userId);
      }

      this.templateId = data.templateId;
      this.keyword = data.keyword;
      this.keywordSet = data.keywordSet;

      if (data.pages) {
        this.pages = data.pages;
      }

      this.totalCount = data.totalCount;
      this.countPerPage = data.countPerPage;

      this.startDate = data.startDate;
      this.endDate = data.endDate;

      this.sortBy = data.sortBy;
      this.sortOrder = data.sortOrder;
    }
  }

  isSuperSetOf (otherSetting) {
    if (this.pages && this.pages.length > 0) {
      if (this.moduleId === otherSetting.moduleId && this.folderId === otherSetting.folderId && this.ownerId === otherSetting.ownerId) {
        if (this.pages.indexOf(otherSetting.pageId) !== -1) {
          return true;
        }
      }
    } else {
      if (this.moduleId === otherSetting.moduleId && this.folderId === otherSetting.folderId && this.ownerId === otherSetting.ownerId &&
          Date.parse(this.startDate) <= Date.parse(otherSetting.startDate) &&
          Date.parse(this.endDate) >= Date.parse(otherSetting.endDate)) {
        return true;
      }
    }
    return false;
  }

  nextPage () {
    if (!this.countPerPage) {
      return 1;
    }
    let maxPageId = Math.ceil(this.totalCount / this.countPerPage);
    if (this.pages.length > 0) {
      if (maxPageId > this.pages[this.pages.length - 1]) {
        return this.pages[this.pages.length - 1] + 1;
      }
    } else {
      if (maxPageId) {
        return 1;
      }
    }
    return false;
  }

  totalPages () {
    if (this.countPerPage > 0) {
      return Math.ceil(this.totalCount / this.countPerPage);
    }
    return 1;
  }

  isTimeline () {
    return this.startDate && this.endDate;
  }

  toString () {
    return 'moduleId:' + this.moduleId + ' folderId:' + this.folderId + ' pageId:' + this.pageId +
      ' startDate:' + this.startDate + ' endDate:' + this.endDate + ' keyword:' + this.keyword;
  }
}
