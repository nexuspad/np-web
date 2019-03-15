export default class NPLocation {
  constructor (data) {
    this.locationName = '';
    this.streetAddress = '';
    this.city = '';
    this.province = '';
    this.postalCode = '';
    this.country = '';

    if (data) {
      for (var key in data) {
        this[key] = data[key];
      }
    }
  }

  toJson () {
    return {
      'streetAddress': this.streetAddress,
      'city': this.city,
      'province': this.province,
      'postalCode': this.postalCode,
      'country': this.country
    }
  }
}
