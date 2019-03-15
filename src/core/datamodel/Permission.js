/**
 * read
 * write
 */
export default class Permission {
  read = false;
  write = false;
  constructor (data) {
    if (data) {
      if (typeof data['read'] !== 'undefined') {
        this.read = data['read'];
      }
      if (typeof data['write'] !== 'undefined') {
        this.write = data['write'];
      }
    }
  }

  /**
  * read and write are booleans.
  */
  setPermission (canRead, canWrite) {
    this.read = canRead;
    this.write = canWrite;
  }

  toJson () {
    return {
      read: this.read,
      write: this.write
    }
  }
}
