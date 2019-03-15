export default class AppTask {
  name = '';
  funcRef = null;
  interval = 30000;
  id = 0;

  constructor (name, funcRef, interval) {
    this.name = name;
    this.funcRef = funcRef;
    this.interval = interval;
  }
}
