export default class AuthInfo {
  constructor (data) {
    if (data) {
      for (var key in data) {
        this[key] = data[key];
      }
    }
  }

  static forLogin (login, password) {
    let authInfo = new AuthInfo();
    authInfo.login = login;
    authInfo.password = password;
    return authInfo;
  }

  static forResetPassword (login) {
    let authInfo = new AuthInfo();
    authInfo.passwordResetRequest = login;
    return authInfo;
  }

  static forNewAccountVerification (code) {
    let authInfo = new AuthInfo();
    authInfo.newAccountVerificationCode = code;
    return authInfo;
  }

  static forChangePassword (previousPassword, newPassword) {
    let authInfo = new AuthInfo();
    authInfo.previousPassword = previousPassword;
    authInfo.password = newPassword;
    return authInfo;
  }
}
