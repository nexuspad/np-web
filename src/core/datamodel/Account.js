import NPUser from './NPUser';
import UserPreference from './UserPreference';

export default class Account extends NPUser {
  preference = null;

  constructor (data) {
    super(data);
    if (data['preference']) {
      this.preference = new UserPreference(data['preference']);
    }
  }

  isValid () {
    if (this.userId !== '') {
      return true;
    }
    return false;
  }
}
