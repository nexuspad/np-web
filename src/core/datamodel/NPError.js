export default class NPError {
  static TIMEOUT = 'TIMEOUT';
  static EMPTY_DATA = 'EMPTY_DATA';
  static UNKNOWN = 'UNKNOWN';
  static ABORT = 'ABORT';

  static NO_SESSION = 'NO_SESSION';
  static INVALID_SESSION = 'INVALID_SESSION';

  errorCode;

  constructor (errorCode) {
    if (Number.isInteger(errorCode)) {
      switch (errorCode) {
        case '1001':
          this.errorCode = NPError.INVALID_SESSION;
          break;
        default:
          break;
      }
      this.errorCode = errorCode.toString();
    } else {
      this.errorCode = errorCode;
    }
  }

  static ofErrorId (errorId) {
    let errorCode = errorId;
    switch (errorId) {
      case '1001':
        errorCode = NPError.INVALID_SESSION;
        break;
      default:
        errorCode = errorId;
        break;
    }
    return new NPError(errorCode);
  }
}
