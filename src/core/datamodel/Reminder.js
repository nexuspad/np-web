export default class Reminder {
  deliverType = 'EMAIL';
  deliverAddress;

  // ex., "1 day" before the event
  unit = 'MINUTE';
  unitCount = 15;

  constructor (data) {
    if (data) {
      this.deliverType = data.deliverType;
      this.deliverAddress = data.deliverAddress;
      this.unit = data.unit;
      this.unitCount = data.unitCount;
    }
  }

  toJson () {
    return {
      deliverType: this.deliverType,
      deliverAddress: this.deliverAddress,
      unit: this.unit,
      unitCount: this.unitCount
    };
  }
}
