<script>
export default {
  name: 'WindowInfo',
  data () {
    return {
      window: window
    };
  },
  mounted () {
  },
  methods: {
    debuggingEnabled () {
      if (this.window.npDebugging) {
        return true;
      }
      return false;
    },
    isDesktopApp () {
      if (this.window.NP_DESKTOP) {
        return true;
      }
      return false;
    }
  }
}
</script>
