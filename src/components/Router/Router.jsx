import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Switch, BrowserRouter, Route, Redirect } from 'react-router-dom';
// constants
import { URL } from '@/constants';
// services
import { createDynamicImport } from '@/services/app';
// components
import Loading from '@/components/core/presentation/Loading';
import ScrollToTop from '@/components/App/ScrollToTop';
import Layout from '@/components/Layout/Main';

// import NetworkError from '@/components/Router/NetworkError';
import Maintain from '@/components/Router/Maintain';

const RouterMe = createDynamicImport(() => import('@/components/Router/Me'), Loading);
const RouterDiscover = createDynamicImport(() => import('@/components/Router/Discover'), Loading);
const RouterChat = createDynamicImport(() => import('@/components/Router/Chat'), Loading);
const RouterCreate = createDynamicImport(() => import('@/components/Router/Create'), Loading);
const RouterWallet = createDynamicImport(() => import('@/components/Router/Wallet'), Loading);
const RouterExchange = createDynamicImport(() => import('@/components/Router/Exchange'), Loading);
const RouterTransaction = createDynamicImport(() => import('@/components/Router/Transaction'), Loading);
const RouterComment = createDynamicImport(() => import('@/components/Router/Comment'), Loading);

const rootRouterMap = [
  { path: URL.HANDSHAKE_ME, component: RouterMe },
  { path: URL.HANDSHAKE_DISCOVER, component: RouterDiscover },
  { path: URL.HANDSHAKE_CHAT, component: RouterChat },
  { path: URL.HANDSHAKE_WALLET, component: RouterWallet },
  { path: URL.HANDSHAKE_CREATE, component: RouterCreate },
  { path: URL.HANDSHAKE_EXCHANGE, component: RouterExchange },
  { path: URL.TRANSACTION_LIST, component: RouterTransaction },
  { path: URL.COMMENTS_BY_SHAKE, component: RouterComment },
];

const Page404 = createDynamicImport(() => import('@/pages/Error/Page404'), Loading, true);

class Router extends React.Component {
  static propTypes = {
    firebaseApp: PropTypes.object.isRequired,
  }
  constructor(props) {
    super(props);

    const initFirebaseApp = this.props.firebaseApp;
    if (!initFirebaseApp.config) initFirebaseApp.config = {};

    this.state = {
      firebaseApp: initFirebaseApp,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.firebaseApp.config) {
      if (nextProps.firebaseApp.config.isMaintain !== prevState.firebaseApp.config.isMaintain) {
        return { firebaseApp: nextProps.firebaseApp };
      }
    }
    return null;
  }

  updateRewardAddress() {    
    let walletReward = MasterWallet.getRewardWalletJson();      
    const params = new URLSearchParams();
          params.append('reward_wallet_addresses', walletReward);
          this.props.authUpdate({
            PATH_URL: 'user/profile',
            data: params,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            METHOD: 'POST',
          });
  }

  getFreeETH(){
    const wallet = MasterWallet.getWalletDefault('ETH');            
    this.props.getFreeETH({//todo remove xxxxxx:
      PATH_URL: `/user/free-rinkeby-eth?address=xxxxxx${wallet.address}`,
      METHOD: 'POST',
      successFn: (response) => {                
        this.setState({ isLoading: false, loadingText: '' });
        // run cron alert user when got 1eth:
        this.timeOutCheckGotETHFree = setInterval(() => {
          wallet.getBalance().then((result) => {
            if (result > 0) {
              this.porps.showAlert({
                message: <div className="text-center">You have ETH! Now you can play for free on the Ninja testnet.</div>,
                timeOut: false,
                isShowClose: true,
                type: 'success',
                callBack: () => {},
              });
              // notify user:
              clearInterval(this.timeOutCheckGotETHFree);
            }
          });
        }, 20 * 60 * 1000); // 20'
      },
      errorFn: () => { this.setState({ isLoading: false, loadingText: '' }); },
    });
  }

  notification() {
    try {
      const messaging = this.props.firebase.messaging();
      messaging
        .requestPermission()
        .then(() => messaging.getToken())
        .catch(e => console.log(e))
        .then((notificationToken) => {
          const params = new URLSearchParams();
          params.append('fcm_token', notificationToken);
          this.props.authUpdate({
            PATH_URL: 'user/profile',
            data: params,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            METHOD: 'POST',
          });
        })
        .catch(e => console.log(e));
    } catch (e) {
      console.log(e);
    }

  routers() {
    return rootRouterMap.map(router => (
      <Route
        key={router.path}
        path={router.path}
        component={router.component}
      />
    ));
  }

  render() {
    return (
      <BrowserRouter>
        <Route
          path={URL.INDEX}
          render={props =>
            (
              <Layout {...props}>
                {
                  this.state.firebaseApp.config.isMaintain
                  ? <Maintain />
                  : (
                    <ScrollToTop>
                      <Switch>
                        <Route
                          exact
                          path={URL.INDEX}
                          render={() => (
                            <Redirect to={{ pathname: URL.HANDSHAKE_DISCOVER }} />
                          )}
                        />
                        {this.routers()}
                        <Route component={Page404} />
                      </Switch>
                    </ScrollToTop>
                  )
                }
              </Layout>
            )
          }
        />
      </BrowserRouter>
    );
  }
}

export default connect(state => ({ firebaseApp: state.firebase.data }))(Router);
