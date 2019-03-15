<template>
  <div>
    <ul class="list-inline">
      <li v-for="item in labels" v-bind:key="item" class="list-inline-item">
        <span class="bg-info">{{ item }}</span>
      </li>
    </ul>
    <input class="form-control ac-input" ref="theLabelInput" placeholder="Add label" />
  </div>
</template>

<script>
import Awesomplete from 'Awesomplete';
import '../../../node_modules/awesomplete/awesomplete.css';

export default {
  name: 'LabelInput',
  data () {
    return { labels: [] };
  },
  mounted () {
    let input = this.$refs.theLabelInput;
    let acInput = new Awesomplete(input);
    acInput.list = ['Ada', 'Java', 'JavaScript', 'Brainfuck', 'LOLCODE', 'Node.js', 'Ruby on Rails'];

    let componentSelf = this;
    input.addEventListener('awesomplete-select', function (event) {
      console.log(event.text.label, event.text.value);
      componentSelf.labels.push(event.text.value);
    });
    input.addEventListener('awesomplete-selectcomplete', function (event) {
      this.value = '';
    });
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
