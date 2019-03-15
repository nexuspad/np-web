<template>
  <div>
    <h1>{{ contactObj.title }}</h1>
    <div>
      <ul class="list-inline">
        <li v-for="tag in contactObj.tags" :key="tag" class="list-inline-item">
          <span class="badge badge-info">{{ tag }}</span>
        </li>
      </ul>
      <div class="row" v-if="contactObj.fullName && contactObj.fullName !== contactObj.title">
        <div class="col">{{ contactObj.fullName }}</div>
      </div>
      <div class="row" v-if="contactObj.emails.length > 0">
        <div class="col">
          <ul class="list-unstyled">
            <li v-for="email in contactObj.emails" :key="email.value">
              <span>{{ email.value }}</span>
              <span class="badge badge-info" v-if="email.label !== 'EMAIL'">{{ email.label }}</span>
            </li>
          </ul>
        </div>
      </div>
      <div class="row" v-if="contactObj.phones.length > 0">
        <div class="col">
          <ul class="list-unstyled">
            <li v-for="phone in contactObj.phones" :key="phone.value">
              <span>{{ phone.formattedValue }}</span>
              <span class="badge badge-info" v-if="phone.label !== 'PHONE'">{{ phone.label }}</span>
            </li>
          </ul>
        </div>
      </div>
      <div class="row" v-if="contactObj.address && contactObj.address.addressStr">
        <div class="d-flex flex-wrap">
          <div class="p-2 text-capitalize" v-if="contactObj.address.streetAddress">{{ contactObj.address.streetAddress }},</div>
          <div class="p-2 text-capitalize" v-if="contactObj.address.city">{{ contactObj.address.city }},</div>
          <div class="p-2 text-capitalize">
            {{ contactObj.address.province }} {{ contactObj.address.postalCode }}
          </div>
          <div class="p-2 text-capitalize">
            {{ contactObj.address.country }}
          </div>
          <div>
            <a :href="mapLink(contactObj.address.addressStr)" target="_blank"><i class="fa fa-map-marked-alt"></i></a>
          </div>
        </div>
      </div>
      <div class="row" v-if="contactObj.note">
        <span style="white-space: pre;">{{ contactObj.note }}</span>
      </div>
    </div>
    <pre class="debug-info" v-if="debuggingEnabled()">
      <code>{{debug()}}</code>
    </pre>
  </div>
</template>

<script>
import WindowInfo from '../common/WindowInfo';

export default {
  name: 'ContactDetail',
  props: ['contactObj'],
  mixins: [ WindowInfo ],
  methods: {
    mapLink (addressStr) {
      return 'https://www.google.com/maps/search/?api=1&query=' + addressStr;
    },
    debug () {
      return JSON.stringify(this.contactObj, null, 4);
    }
  }
};
</script> 