<template>
  <div class="card">
    <h1 class="card-header">
      <span v-html="$options.filters.npHighlighter(contactObj.title, keyword)" />
      <a :href="contactObj.webAddress" class="float-right font-weight-normal h5" target="_blank" v-if="contactObj.webAddress">
        <i class="fa fa-external-link-alt"></i>
      </a>
    </h1>
    <div class="card-body">
      <ul class="list-inline" v-if="contactObj.tags && contactObj.tags.length > 0">
        <li v-for="tag in contactObj.tags" :key="tag" class="list-inline-item">
          <span class="badge badge-info">{{ tag }}</span>
        </li>
      </ul>
      <h5 class="card-title" v-if="contactObj.fullName && contactObj.fullName !== contactObj.title">
        {{ contactObj.fullName }}
      </h5>
      <h5 class="card-title" v-if="contactObj.businessName && contactObj.businessName !== contactObj.title">
        {{ contactObj.businessName }}
      </h5>
      <ul class="list-group list-group" v-if="contactObj.phones.length > 0 || contactObj.emails.length > 0">
        <li class="list-group-item" v-for="phone in contactObj.phones" :key="phone.value">
          <span>{{ phone.formattedValue }}</span>
          <span class="badge badge-info" v-if="phone.label !== 'PHONE'">{{ phone.label }}</span>
        </li>
        <li class="list-group-item" v-for="email in contactObj.emails" :key="email.value">
          <span>{{ email.value }}</span>
          <span class="badge badge-info" v-if="email.label !== 'EMAIL'">{{ email.label }}</span>
        </li>
      </ul>
      <div v-if="contactObj.address && contactObj.address.addressStr">
        <div class="d-flex flex-wrap">
          <div class="p-2 text-capitalize" v-if="contactObj.address.streetAddress">{{ contactObj.address.streetAddress }},</div>
          <div class="p-2 text-capitalize" v-if="contactObj.address.city">{{ contactObj.address.city }},</div>
          <div class="p-2 text-capitalize">
            {{ contactObj.address.province }} {{ contactObj.address.postalCode }}
          </div>
          <div class="p-2 text-capitalize">
            {{ contactObj.address.country }}
          </div>
          <div class="mt-2">
            <a :href="mapLink(contactObj.address.addressStr)" target="_blank"><i class="fa fa-map-marked-alt"></i></a>
          </div>
        </div>
      </div>
    </div>
    <div class="card-footer" v-if="contactObj.note">
      <span style="white-space: pre;">{{ contactObj.note }}</span>
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
  props: ['contactObj', 'keyword'],
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