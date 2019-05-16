import AuthInfo from './AuthInfo';
import UserPreference from './UserPreference';

export default class NPUser {
  auth = new AuthInfo();
  preference = new UserPreference();

  constructor (data) {
    this.userId = '';
    this.userName = '';
    this.sessionId = '';
    this.displayName = '';
    this.email = '';
    this.firstName = '';
    this.lastName = '';
    this.badge = {};
    this.dataEncrypted = false;

    if (data) {
      this.userId = data['userId'];
      this.userName = data['userName'];
      this.sessionId = data['sessionId'];
      this.displayName = data['displayName'];
      this.email = data['email'];
      this.firstName = data['firstName'];
      this.lastName = data['lastName'];
      this.preference = new UserPreference(data['preference']);
      this.badge = data['badge'];
      this.dataEncrypted = data['dataEncrypted'];
    }
  }

  copy (otherUser) {
    if (otherUser) {
      this.userId = otherUser.userId;
      this.userName = otherUser.userName;
      this.displayName = otherUser.displayName;
      this.badge = otherUser.badge;
      this.dataEncrypted = otherUser.dataEncrypted;
    }
  }

  static newFromId (userId) {
    let u = new NPUser();
    u.setUserId(userId);
    return u;
  }

  setUserId (userId) {
    this.userId = userId;
  }

  toJson() {
    return {
      userId: this.userId
    }
  }
}
