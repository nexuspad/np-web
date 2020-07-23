<template>
  <div>
    <ul class="list-inline">
      <li v-for="item in labels" v-bind:key="item" class="list-inline-item">
        <span class="badge badge-info">{{ item }}
          <button type="button" class="icon-button" v-on:click="removeLabel(item)">
            <i class="fa fa-times text-dark"></i>
          </button>
        </span>
      </li>
    </ul>
    <form @submit.prevent="addLabel">
      <input class="form-control ac-input" ref="theLabelInput" :placeholder="npContent('add tags')" tabindex="1" />
      <button type="submit" class="icon-button" tabindex="2">
        <i class="fa fa-plus fa-lg text-primary"></i>
      </button>
    </form>
  </div>
</template>

<script>
import Awesomplete from 'awesomplete';
import '../../../node_modules/awesomplete/awesomplete.css';
import SiteProvider from './SiteProvider';

export default {
  name: 'LabelInput',
  props: ['initialValues'],
  mixins: [ SiteProvider ],
  data () {
    return {
      labels: [],
      acInput: Object
    };
  },
  mounted () {
    let input = this.$refs.theLabelInput;
    this.acInput = new Awesomplete(input);
    this.acInput.list = ['Ada', 'Java', 'JavaScript', 'Brainfuck', 'LOLCODE', 'Node.js', 'Ruby on Rails'];

    let componentSelf = this;
    input.addEventListener('awesomplete-select', function (event) {
      componentSelf.addLabel(null, event.text.value);
    });
    input.addEventListener('awesomplete-selectcomplete', function () {
      this.value = '';
    });

    if (this.initialValues && this.initialValues.length) {
      this.labels = this.initialValues.slice(0);
    }
  },
  methods: {
    addLabel: function (event, value) {
      if (event) {
        event.preventDefault();
      }

      // when triggered by onClick event
      if (!value) {
        value = this.acInput.input.value;
        this.acInput.input.value = '';
      }

      // Not a valid input
      if (!value) {
        return;
      }

      let foundInArray = false;
      this.labels.forEach(function (item) {
        if (item === value) {
          foundInArray = true;
        }
      });
      if (!foundInArray) {
        this.labels.push(value);
        this.$emit('labelUpdated', this.labels);
      }
    },
    removeLabel: function (value) {
      let componentSelf = this;
      this.labels.forEach(function (item, index, theArray) {
        if (item === value) {
          theArray.splice(index, 1);
          componentSelf.$emit('labelUpdated', componentSelf.labels);
        }
      });
    },
    // this is called by the parent form component when saving the entry
    getLabels: function () {
      let value = this.acInput.input.value;
      if (value) {
        let foundInArray = false;
        this.labels.forEach(function (item) {
          if (item === value) {
            foundInArray = true;
          }
        });
        if (!foundInArray) {
          this.labels.push(value);
        }
      }
      return this.labels;
    }
  },
  watch: {
    initialValues: function (values) {
      if (values && values.length) {
        this.labels = values.slice(0);
      } else {
        this.labels = [];
      }
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
  border-bottom: 1px solid #ced4da !important;
}
</style>
