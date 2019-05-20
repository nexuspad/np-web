import RestClient from '../../core/util/RestClient';

export default {
  data () {
    return {
      onEdge: false
    };
  },
  methods: {
    isEdgeApi () {
      let componentSelf = this;
      RestClient.get(RestClient.apiUrl + '/health').then((result) => {
        componentSelf.serviceInfo = result.data;
        if (componentSelf.serviceInfo.indexOf('3.2') !== -1) {
          componentSelf.onEdge = true;
        }
      });
    }
  }
}