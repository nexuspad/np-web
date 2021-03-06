<template>
  <div>
    <form autocomplete="off">
      <div class="form-group row">
        <div class="col">
          <input type="text" class="form-control input-underline" :placeholder="npContent('title_optional')" v-model="contact.title" />
        </div>
      </div>
      <div class="row form-group">
        <div class="col">
          <input class="form-control" type="text" v-model="contact.firstName" :placeholder="npContent('first name')" autocomplete="disabled" />
        </div>
        <div class="col-md-auto">
          <input class="form-control" type="text" size="2" v-model="contact.middleName" :placeholder="npContent('MI')" />
        </div>
        <div class="col">
          <input class="form-control" type="text" v-model="contact.lastName" :placeholder="npContent('last name')" autocomplete="disabled" />
        </div>
      </div>
      <div class="row form-group mb-5">
        <div class="col">
          <input class="form-control" type="text" v-model="contact.businessName" :placeholder="npContent('business name')" autocomplete="disabled" />
        </div>
        <div class="col">
          <input class="form-control" type="text" v-model="contact.webAddress" :placeholder="npContent('web address')"  autocomplete="disabled" />
        </div>
      </div>
      <div class="row pb-2 form-group" v-for="(item, index) in contact.emails" v-bind:key="`email-${index}`">
        <div class="col">
          <input class="form-control" type="email" v-model="item.value" :placeholder="npContent('email')" autocomplete="disabled" />
        </div>
        <div class="col-md-auto">
          <button type="button" class="icon-button" v-on:click="addEmail()" v-if="index === 0">
            <i class="fa fa-plus fa-lg text-primary"></i>
          </button>
          <button type="button" class="icon-button" v-on:click="removeEmail(index)" v-if="item.value !== '' && index !== 0">
            <i class="fa fa-times fa-lg text-secondary"></i>
          </button>
        </div>
      </div>
      <div class="row form-group mb-5" v-for="(item, phoneIndex) in contact.phones" v-bind:key="`phone-${phoneIndex}`">
        <div class="col">
          <input class="form-control" type="tel" v-model="item.value" :placeholder="npContent('phone')" autocomplete="disabled" />
        </div>
        <div class="col-md-auto">
          <input class="form-control" type="text" v-model="item.label" :placeholder="npContent('label')" autocomplete="disabled" />
        </div>
        <div class="col-md-auto">
          <button type="button" class="icon-button" v-on:click="addPhone()" v-if="phoneIndex === 0">
            <i class="fa fa-plus fa-lg text-primary"></i>
          </button>
          <button type="button" class="icon-button" v-on:click="removePhone(phoneIndex)" v-if="item.value !== '' && phoneIndex !== 0">
            <i class="fa fa-times fa-lg text-secondary"></i>
          </button>
        </div>
      </div>
      <div class="row form-group">
        <div class="col-8">
          <input class="form-control" type="text" v-model="contact.address.streetAddress" :placeholder="npContent('address')" autocomplete="disabled" />
        </div>
        <div class="col-4">
          <input class="form-control" type="text" v-model="contact.address.city" :placeholder="npContent('city')" autocomplete="disabled" />
        </div>
      </div>
      <div class="row form-group">
        <div class="col-4">
          <input class="form-control" type="text" v-model="contact.address.province" :placeholder="npContent('state_province')" autocomplete="disabled" />
        </div>
        <div class="col-4">
          <input class="form-control" type="text" v-model="contact.address.postalCode" :placeholder="npContent('postal code')" autocomplete="disabled" />
        </div>
        <div class="col-4">
          <input class="form-control" type="text" v-model="contact.address.country" :placeholder="npContent('country')" autocomplete="disabled" />
        </div>
      </div>
      <div class="form-group row">
        <div class="col">
          <label-input ref="tagInput" :initialValues="contact.tags" />
        </div>
      </div>
      <div class="form-group row">
        <div class="col">
          <textarea-autosize class="form-control input-underline" placeholder="notes" v-model="contact.note"></textarea-autosize>
        </div>
      </div>
    </form>
    <b-navbar toggleable="md" fixed="top" type="dark" variant="dark">
      <b-collapse is-nav id="editor_nav_menu_collapse">
        <b-navbar-nav>
          <b-nav-text class="mr-2"><message :location="'TOP_NAVBAR'" /></b-nav-text>
          <b-nav-text v-if="!contact.entryId">{{npContent('new contact')}}</b-nav-text>
          <b-nav-text v-if="contact.entryId">{{npContent('edit contact')}}</b-nav-text>
        </b-navbar-nav>
        <!-- right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-button-group class="mx-1">
            <button class="btn btn-primary" v-on:click="collectTags(); save($event, contact)">{{npContent('save')}}</button>
          </b-button-group>
          <b-button-group class="mx-1">
            <b-button class="my-2 my-sm-0" type="button" v-on:click="cancel()">{{npContent('cancel')}}</b-button>
          </b-button-group>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
import NPContact from '../../core/datamodel/NPContact';
import NPItem from '../../core/datamodel/NPItem';
import AccountService from '../../core/service/AccountService';
import EntryService from '../../core/service/EntryService';
import Message from '../common/Message';
import EntryActionProvider from '../common/EntryActionProvider';
import LabelInput from '../common/LabelInput';
import SiteProvider from '../common/SiteProvider';

export default {
  name: 'ContactEdit',
  props: ['folder'],
  mixins: [ EntryActionProvider, SiteProvider ],
  components: {
    LabelInput, Message
  },
  data () {
    return {
      contact: new NPContact()
    };
  },
  mounted () {
    this.contact = NPContact.blankInstance(this.folder);
    this.initEmptyInput();

    if (this.$route.params.entryId) {
      this.contact.entryId = this.$route.params.entryId;
      let componentSelf = this;
      AccountService.hello()
        .then(function () {
          EntryService.get(componentSelf.contact)
            .then(function (entry) {
              componentSelf.contact = entry;
              // repoint the folder reference to the one in the component so changing folder would work
              componentSelf.contact.folder = componentSelf.folder;
              componentSelf.initEmptyInput();
            })
            .catch(function (error) {
              console.log(error);
            });
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  },
  methods: {
    initEmptyInput () {
      if (this.contact.emails.length === 0) {
        this.contact.emails.unshift(new NPItem());
      }
      if (this.contact.phones.length === 0) {
        this.contact.phones.unshift(new NPItem());
      }
    },
    addEmail () {
      this.contact.emails.unshift(new NPItem());
    },
    removeEmail (index) {
      this.contact.emails.splice(index, 1);
    },
    addPhone () {
      this.contact.phones.unshift(new NPItem());
    },
    removePhone (index) {
      this.contact.phones.splice(index, 1);
    },
    collectTags () {
      this.contact.tags = this.$refs.tagInput.getLabels();
    },
    cancel () {
      this.$router.back();
    }
  }
}
</script>
