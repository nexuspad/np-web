<template>
  <div class="pt-5">
    <div class="d-flex justify-content-center mx-auto">
      {{ message }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'Empty',
  props: ['list', 'search', 'entry'],
  data () {
    return {
      message: ''
    };
  },
  mounted () {
    if (this.list) {
      this.message = 'no content here.';
    } else if (this.search) {
      this.message = 'nothing found for this keyword.'
    } else {
      this.message = 'empty content.';
    }
  },
};
</script>