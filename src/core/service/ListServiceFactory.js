import AccountService from './AccountService';
import ListService from './ListService';

export default class ListServiceFactory {
  static _serviceObjMap = new Map();

  static locate ({ moduleId, folderId, ownerId = 0, startDate = '', endDate = '', keyword = '' }, createNew = true) {
    if (ownerId === 0) {
      ownerId = AccountService.currentUser().userId;
    }

    let key = ListServiceFactory._key(moduleId, folderId, ownerId, keyword);

    if (this._serviceObjMap.has(key)) {
      return this._serviceObjMap.get(key);
    }

    if (createNew === false) {
      return null;
    }

    let listServiceObj = new ListService({
      moduleId: moduleId,
      folderId: folderId,
      ownerId: ownerId,
      startDate: startDate,
      endDate: endDate
    });

    ListServiceFactory._serviceObjMap.set(key, listServiceObj);
    return listServiceObj;
  }

  static locateAll (moduleId, ownerId) {
    let serviceArr = [];
    let re = new RegExp(ListServiceFactory._key(moduleId, '.*', ownerId, '.*'));
    for (let [key, value] of ListServiceFactory._serviceObjMap) {
      if (key.match(re)) {
        serviceArr.push(value);
      }
    }
    return serviceArr;
  }

  static clearAll () {
    ListServiceFactory._serviceObjMap = new Map();
  }

  static _key (moduleId, folderId, ownerId, keyword) {
    let k = moduleId + '_' + folderId + '_' + ownerId + '_';
    if (keyword) {
      k += keyword;
    }
    return k;
  }
}
