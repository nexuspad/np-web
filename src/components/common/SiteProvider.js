import RestClient from '../../core/util/RestClient';
import ContentHelper from '../../core/service/ContentHelper';

export default {
  data () {
    return {
      window: window,
      onEdge: false
    };
  },
  computed: {
  },
  methods: {
    npContent (str) {
      return ContentHelper.translate(str);
    },
    kickToLogin () {
      this.$router.push({name: 'login'});
    },
    isEdgeApi () {
      let componentSelf = this;
      RestClient.get(RestClient.apiUrl + '/health').then((result) => {
        componentSelf.serviceInfo = result.data;
        if (componentSelf.serviceInfo.indexOf('3.2') !== -1) {
          componentSelf.onEdge = true;
        }
      });
    },
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