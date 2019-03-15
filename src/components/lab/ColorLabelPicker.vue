<template>
  <compact-picker :value="colors" @input="updateValue" />
</template>

<script>
import { Compact } from 'vue-color'

export default {
  components: {
    'compact-picker': Compact
  },
  props: ['initValue'],
  data () {
    return {
      // colors: {
      //   hex: '#194d33',
      //   hsl: {
      //     h: 150,
      //     s: 0.5,
      //     l: 0.2,
      //     a: 1
      //   },
      //   hsv: {
      //     h: 150,
      //     s: 0.66,
      //     v: 0.30,
      //     a: 1
      //   },
      //   rgba: {
      //     r: 25,
      //     g: 77,
      //     b: 51,
      //     a: 1
      //   },
      //   a: 1
      // }
      colors: '#999999'
    }
  },
  mounted () {
    if (this.initValue) {
      this.colors = this.initValue;
    }
  },
  methods: {
    updateValue: function (value) {
      this.$emit('colorSelected', value);
    }
  }
}
</script>