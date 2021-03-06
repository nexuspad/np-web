import { toDate, format, parseISO, formatISO, addSeconds, addMinutes, addDays, differenceInSeconds } from 'date-fns'

export default class TimeUtil {
  /* -------------------------------------------------------------
   * Parsing and formatting
   * -------------------------------------------------------------
   */
  static npLocalDate (dateObj) {
    return format(toDate(dateObj), 'yyyy-MM-dd');
  }

  static npLocalTime (dateObj) {
    return format(toDate(dateObj), 'HH:mm');
  }

  static iso8601ToDate (iso8601Str) {
    return toDate(iso8601Str);
  }

  static iso8601Format (dateObj) {
    return formatISO(dateObj);
  }

  // The dateTimeStr should be in ISO8601 format
  static toDateObj (dateTimeStr) {
    return parseISO(dateTimeStr);
  }

  static isDateObj (dateObj) {
    if (dateObj instanceof Date) return true;
    return false;
  }

  static timestampToNPDateStr (timestamp) {
    if (timestamp.toString().length === 10) {
      timestamp = timestamp * 1000;
    }

    let d = toDate(timestamp);
    return format(d, 'YYYY-MM-DD');
  }

  /* -------------------------------------------------------------
   * General utilities
   * -------------------------------------------------------------
   */
  static addDays(dateObj, days) {
    return addDays(dateObj, days)
  }

  static addSeconds (dateObj, seconds) {
    return addSeconds(dateObj, seconds);
  }

  static addMinutes (dateObj, minutes) {
    return addMinutes(dateObj, minutes);
  }

  static findDurationInSeconds (dateObj1, dateObj2) {
    return Math.abs(differenceInSeconds(dateObj1, dateObj2));
  }

  static hh24ToAmPm (timeStr) {
    if (timeStr && timeStr.length === 5) {
      let timeArr = timeStr.split(':');

      if (timeArr.length > 1) {
        timeArr[2] = timeArr[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
        timeArr[0] = timeArr[0] % 12 || 12; // Adjust hours
        return timeArr[0] + ':' + timeArr[1] + ' ' + timeArr[2];
      }
    }
    return timeStr;
  }
}
