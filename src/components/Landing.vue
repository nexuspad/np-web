<template>
  <div class="np-module-container">
    <div class="d-flex justify-content-center mx-auto pt-5">
      <div class="display-5">{{npContent('initializing')}}...</div>
    </div>
  </div>
</template>

<script>
import TopNavigation from './layout/TopNavigation';
import NPError from '../core/datamodel/NPError';
import AccountService from '../core/service/AccountService';
import AccountActionProvider from './account/AccountActionProvider';
import SiteProvider from './common/SiteProvider';

export default {
  name: 'Landing',
  mixins: [ AccountActionProvider, SiteProvider ],
  components: {
    TopNavigation
  },
  data () {
    return {
    }
  },
  mounted () {
    let componentSelf = this;
    AccountService.hello()
      .then(function (userObj) {
        componentSelf.user = userObj;
        if (AccountService.isLoggedIn()) {
          componentSelf.goToLastVisit();
        }
      })
      .catch(function (error) {
        console.log(error);
        if (error instanceof NPError) {
          if (error.errorCode === 'NO_SESSION') {
            console.log('Landing: redirect to login page');
            componentSelf.$router.push({name: 'login'});
          }
        }
      });
  }
}
</script>

<style scoped>
h1, h2 {
  font-weight: normal;
}
</style>
