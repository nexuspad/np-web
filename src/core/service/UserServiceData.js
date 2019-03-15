export default class UserServiceData {
  static of (user) {
    let userServiceData = new UserServiceData();
    userServiceData.user = user;
    return userServiceData;
  }

  static forPreference (acctPreference) {
    let userServiceData = new UserServiceData();
    userServiceData.preference = acctPreference;
    return userServiceData;
  }
}
