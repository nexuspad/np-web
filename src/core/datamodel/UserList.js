export default class UserList {
  constructor (data) {
    if (data !== null) {
      for (var key in data) {
        this[key] = data[key];
      }
    }

    if (!this.users) {
      this.users = [];
    }
  }

  addUser (user) {
    for (var i = 0; i < this.users.length; i++) {
      if (this.users[i].email === user.email) {
        return;
      }
    }
    this.users.push(user);
  }

  removeUser (user) {
    for (var i = 0; i < this.users.length; i++) {
      if (this.users[i].email === user.email) {
        this.users.splice(i, 1);
      }
    }
  }
}
