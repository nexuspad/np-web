<template>
  <b-navbar toggleable="md" fixed="top" type="dark" variant="dark">
    <b-navbar-toggle target="topnav_collapse"></b-navbar-toggle>
    <b-navbar-brand href="/dev/">/dev/</b-navbar-brand>

    <b-collapse is-nav id="topnav_collapse">
      <b-navbar-nav>
        <b-nav-item href="/">nexusPad v2</b-nav-item>
      </b-navbar-nav>

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav-item href="http://nexuspad.com" target="_blank">nexuspad</b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
export default {
  name: 'TopNavigation'
};
</script>