export default class CommonUtils {
  static sprintf (str, ...args) {
    var counter = 0;
    return str.replace(/%s/g, function () {
      return args[counter++];
    });
  }

  // not in use
  static logError (str, ...args) {
    if (arguments.length > 1) {
      console.log(CommonUtils.sprintf(str, args));
    } else {
      console.log(str);
    }
  }

  // not in use
  static logDebug (str, ...args) {
    console.log(str, args);
  }

  static isValidEmail (inputText) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(inputText);
  }

  static isValidPassword (inputText) {
    return true;
  }

  static addParamToUrl (url, key, value) {
    if (!url) {
      return '';
    }

    let urlParts = url.split('?');

    if (urlParts.length > 1) {
      return url + '&' + key + '=' + encodeURIComponent(value);
    } else {
      return url + '?' + key + '=' + encodeURIComponent(value);
    }
  }

  static updateQueryStringParameter (uri, key, value) {
    let re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
    let separator = uri.indexOf('?') !== -1 ? '&' : '?';
    if (uri.match(re)) {
      return uri.replace(re, '$1' + key + '=' + value + '$2');
    } else {
      return uri + separator + key + '=' + value;
    }
  }

  static nullToEmpty (value) {
    if (typeof value === 'undefined' || value === null) {
      return '';
    }
    return value;
  }
}
