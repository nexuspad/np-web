export default class Recurrence {
  static NOREPEAT = 'NOREPEAT';
  static DAILY = 'DAILY';
  static WEEKDAILY = 'WEEKDAILY';
  static WEEKLY = 'WEEKLY';
  static MONTHLY = 'MONTHLY';
  static YEARLY = 'YEARLY';

  pattern = '';
  interval = 0;
  recurrenceTimes = 0;
  endDate;

  constructor (data) {
    if (data) {
      this.pattern = data.pattern;
      this.interval = data.interval;
      this.recurrenceTimes = data.recurrenceTimes;
      this.endDate = data.endDate;
      if (this.endDate) {
        this.recurrenceTimes = 0;
      }
    } else {
      this.pattern = Recurrence.NOREPEAT;
    }
  }

  toJson () {
    return {
      pattern: this.pattern,
      interval: this.interval,
      recurrenceTimes: this.recurrenceTimes,
      endDate: this.endDate
    };
  }
}
