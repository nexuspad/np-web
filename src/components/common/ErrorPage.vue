<template>
  <div>
    <h1>Error page</h1>
    {{ error }}
  </div>
</template>

<script>
export default {
  name: 'ErrorPage',
  data () {
    return {
      error: this.$route.query.error
    };
  }
};
</script>