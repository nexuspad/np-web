<template>
  <div class="np-module-container">
    <h1>{{ msg }}</h1>
    <a href="/dev/">Check out all the components</a>
    <login />
  </div>
</template>

<script>
import TopNavigation from './layout/TopNavigation';
import Login from './account/Login';

export default {
  name: 'Home',
  components: {
    TopNavigation, Login
  },
  data () {
    return {
      msg: 'Welcome to NexusPad Vue.js App'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
