import Permission from './Permission';
import NPUser from './NPUser';

/**
 * Accessor
 * Permission
 */
export default class AccessPermission {
  permission = new Permission();
  accessor = new NPUser();

  constructor (data) {
    if (data) {
      if (data.permission) {
        this.permission = new Permission(data.permission);
      }
      if (data.accessor) {
        this.accessor = new NPUser(data.accessor);
      }
    }
  }

  static ofOwnerDefault (ownerId) {
    let ap = AccessPermission.instance();
    ap.accessor = NPUser.newFromId(ownerId);
    ap.permission.read = true;
    ap.permission.write = true;
    return ap;
  }

  static forAccessReadonly (accessorUserId) {
    let ap = AccessPermission.instance();
    ap.accessor = NPUser.newFromId(accessorUserId);
    ap.permission.read = true;
    ap.permission.write = false;
    return ap;
  }

  static instance () {
    let obj = new AccessPermission();
    obj.accessor = new NPUser();
    obj.accessor._error = '';
    obj.permission = new Permission();
    return obj;
  }

  /**
   * read and write are booleans.
   */
  setSharing (user, canRead, canWrite) {
    this.accessor = user;
    this.permission = new Permission();
    this.permission.setPermission(canRead, canWrite);
  }

  toJson () {
    return {
      permission: this.permission.toJson(),
      accessor: this.accessor.toJson()
    }
  }
}
