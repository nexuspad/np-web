export default class SearchItem {
  constructor (data) {
    if (data) {
      for (var key in data) {
        this[key] = data[key];
      }
    }
  }

  getTitle () {
    return this.title;
  }

  getModuleId () {
    if (this.isFolder()) {
      return this.moduleId;
    }
    return this.folder.moduleId;
  }

  getKeyId () {
    return this.entryId;
  }

  isFolder () {
    if (this.tag && this.tag === 'folder') return true;
    return false;
  }
}
