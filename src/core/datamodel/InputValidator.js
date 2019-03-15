export default class InputValidator {
  static isValidEmail (str) {
    let pattern = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return pattern.test(str);
  }

  static validFolderName (str) {
    let pattern = /[!@#$%^&*+=[\]{};':"\\|,<>/?]/;
    return !pattern.test(str);
  }

  static validWebAddress (str) {
    if (str) {
      if (str.toLowerCase().indexOf('http://') !== 0) {
        str = 'http://' + str;
      }
    }

    let pattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?/;
    return pattern.test(str);
  }
}
