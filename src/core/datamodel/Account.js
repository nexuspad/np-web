import NPUser from './NPUser';
import UserPreference from './UserPreference';

export default class Account extends NPUser {
  preference = null;

  constructor (data) {
    super(data);

    if (data) {
      if (data['preference']) {
        this.preference = new UserPreference(data['preference']);
      }

      if (data['servicehost']) {
        this.servicehost = data['servicehost'];
      }
    }
  }

  isValid () {
    if (this.userId !== '') {
      return true;
    }
    return false;
  }
}
