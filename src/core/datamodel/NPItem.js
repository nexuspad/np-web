export default class NPItem {
  constructor (data) {
    if (data) {
      this.value = data.value;
      this.label = data.label;
      
      if (data['formattedValue']) {
        this.formattedValue = data['formattedValue'];
      }

    } else {
      this.value = '';
      this.label = '';
    }
  }

  toJson () {
    return {
      label: this.label,
      value: this.value
    }
  }
}
