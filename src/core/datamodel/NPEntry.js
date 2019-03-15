import NPModule from './NPModule';
import EntryTemplate from './EntryTemplate';
import AccessPermission from './AccessPermission';
import NPFolder from './NPFolder';
import NPUser from './NPUser';

export default class NPEntry {
  static DELETED = 25;

  module;
  moduleId;
  entryId;
  title;
  description;
  timelineKey;
  updateTime;
  pinned;
  colorLabel;
  tags = [];
  tagsInString = '';
  note;
  weight;
  status;

  folder;
  owner;

  accessPermission = new AccessPermission();

  constructor (data) {
    if (data) {
      this.module = data['module'];
      this.moduleId = parseInt(data['moduleId']);
      this.entryId = data['entryId'];
      this.title = data['title'];
      this.description = data['description'];
      this.timelineKey = data['timelineKey'];
      this.updateTime = new Date(data['updateTime']);
      this.pinned = data['pinned'];
      this.colorLabel = data['colorLabel'];
      this.tags = data['tags'];
      this.tagsInString = data['tagsInString'];
      this.note = data['note'];
      this.weight = data['weight'];
      this.status = data['status'];

      if (data['folder']) {
        this.folder = new NPFolder(data['folder']);
      }

      if (data['owner']) {
        this.owner = new NPUser(data['owner']);
      }

      if (data['accessPermission']) {
        this.accessPermission = new AccessPermission(data['accessPermission']);
      }
    }
  }

  copy (otherEntry) {
    this.folder = new NPFolder();
    this.folder.copy(otherEntry.folder);
    this.module = otherEntry.module;
    this.moduleId = otherEntry.moduleId;
    this.entryId = otherEntry.entryId;
    this.title = otherEntry.title;
    this.description = otherEntry.description;
    this.timelineKey = otherEntry.timelineKey;
    this.updateTime = otherEntry.updateTime;
    this.pinned = otherEntry.pinned;
    this.colorLabel = otherEntry.colorLabel;
    this.tags = otherEntry.tags;
    this.tagsInString = otherEntry.tagsInString;
    this.note = otherEntry.note;
    this.weight = otherEntry.weight;
    this.status = otherEntry.status;

    this.owner = new NPUser();
    this.owner.copy(otherEntry.owner);
  }

  static of (moduleId) {
    let entry = new NPEntry();
    entry.setModuleId(moduleId);
    return entry;
  }

  get owner () {
    if (this.owner) {
      return this.owner;
    } else if (this.folder) {
      return this.folder.owner;
    }
    return null;
  }

  getOwnerId () {
    if (this.owner) {
      return this.owner.userId;
    } else if (this.folder) {
      return this.folder.owner.userId;
    }
    return false;
  }

  getModuleId () {
    if (this.folder) {
      return this.folder.moduleId;
    }
    return this.moduleId;
  }

  setModuleId (moduleId) {
    this.moduleId = moduleId;
    this.module = NPModule.codeForId(moduleId).toUpperCase();

    switch (moduleId) {
      case NPModule.CONTACT:
        this.templateId = EntryTemplate.CONTACT;
        break;
      case NPModule.CALENDAR:
        this.templateId = EntryTemplate.EVENT;
        break;
      case NPModule.DOC:
        this.templateId = EntryTemplate.DOC;
        break;
      case NPModule.PHOTO:
        this.templateId = EntryTemplate.PHOTO;
        break;
      case NPModule.BOOKMARK:
        this.templateId = EntryTemplate.BOOKMARK;
        break;
    }
  }

  keyMatches (otherEntry) {
    return this.entryId === otherEntry.entryId;
  }

  getKeyId () {
    return this.entryId;
  }

  isNewEntry () {
    if (this.entryId) return false;
    return true;
  }

  isMine () {
    if (this.accessPermission.accessor && this.owner && this.accessPermission.accessor.userId !== this.owner.userId) {
      return false;
    }
    return true;
  }

  hasWritePermission () {
    if (this.accessPermission && this.accessPermission.permission.write === true) {
      return true;
    }
    return false;
  }

  toJson () {
    let data = {
      moduleId: this.moduleId,
      entryId: this.entryId,
      title: this.title,
      note: this.note,
      tags: this.tags,
      colorLabel: this.colorLabel,
      pinned: this.pinned,
      folder: this.folder.toJson()
    };

    if (this.owner) {
      data['owner'] = this.owner.toJson();
    }
    return data;
  }
}
