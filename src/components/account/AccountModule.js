import Account from './Account';
import MyPad from './MyPad';
import Login from './Login';
import Register from './Register';
import RequestPasswordReset from './RequestPasswordReset';
import PasswordReset from './PasswordReset';
import Activity from './Activity';

export default class AccountModule {
  static routes () {
    return [
      {
        name: 'login',
        path: '/login',
        component: Login,
        meta: { requiresAuth: false }
      },
      {
        name: 'register',
        path: '/register',
        component: Register,
        meta: { requiresAuth: false }
      },
      {
        name: 'reqpasswordreset',
        path: '/reqpasswordreset',
        component: RequestPasswordReset,
        meta: { requiresAuth: false }
      },
      {
        name: 'resetpassword',
        path: '/resetpassword/:verificationCode',
        component: PasswordReset,
        meta: { requiresAuth: false },
        props: true
      },
      {
        name: 'account',
        path: '/account',
        component: Account
      },
      {
        name: 'mypad',
        path: '/mypad',
        component: MyPad
      },
      {
        name: 'activity',
        path: '/activities',
        component: Activity
      }
    ];
  }
}
