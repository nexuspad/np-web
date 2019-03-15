<template>
  <div>
    <ul class="list-inline">
      <li v-for="contact in contacts" v-bind:key="contact.entryId" class="list-inline-item">
        <span class="bg-info">{{ contact.title }}</span>
        <a v-on:click="removeUser(contact.entryId)" href="#"><i class="fas fa-times"></i></a>
      </li>
    </ul>
    <input class="form-control ac-input" ref="theLabelInput" placeholder="Add user" />
  </div>
</template>

<script>
import Awesomplete from 'Awesomplete';
import '../../../node_modules/awesomplete/awesomplete.css';
import AccountService from '../../core/service/AccountService';
import ContactService from '../../core/service/ContactService';

export default {
  name: 'AddUserInput',
  data () {
    return {
      lookupData: {},
      contacts: []
    };
  },
  mounted () {
    let input = this.$refs.theLabelInput;
    let acInput = new Awesomplete(input);

    let componentSelf = this;
    input.addEventListener('awesomplete-select', function (event) {
      let selectedContact = componentSelf.lookupData[event.text.value];
      let foundInArray = false;
      componentSelf.contacts.forEach(function (item, index, theArray) {
        if (item.entryId === selectedContact.entryId) {
          foundInArray = true;
        }
      });
      if (!foundInArray) {
        componentSelf.contacts.push(selectedContact);
      }
    });
    input.addEventListener('awesomplete-selectcomplete', function (event) {
      this.value = '';
    });

    AccountService.hello()
      .then(function (response) {
        ContactService.lookupContact(true)
          .then(function (data) {
            componentSelf.lookupData = data;
            acInput.list = Object.keys(data);
          })
          .catch(function (error) {
            console.log(error);
          });
      })
      .catch(function (error) {
        console.log(error);
      });
  },
  methods: {
    removeUser: function (entryId) {
      this.contacts.forEach(function (item, index, theArray) {
        if (item.entryId === entryId) {
          theArray.splice(index, 1);
        }
      });
    }
  }
}
</script>

<style>
.ac-input {
  border: 0 !important;
  outline: 0 !important;
  background: transparent;
  border-radius: 0 !important;
  border-bottom: 1px solid black !important;
}
</style>
