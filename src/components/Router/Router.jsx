import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { Switch, BrowserRouter, Route, Redirect } from 'react-router-dom';
import DynamicImport from '@/components/App/DynamicImport';
import Loading from '@/components/core/presentation/Loading';
import { APP, FIREBASE_PATH, API_URL, URL } from '@/constants';

import local from '@/services/localStore';
import { setIpInfo, showAlert, changeLocale } from '@/reducers/app/action';
import { signUp, fetchProfile, authUpdate, getFreeETH } from '@/reducers/auth/action';

import ScrollToTop from '@/components/App/ScrollToTop';
import Layout from '@/components/Layout/Main';

import { addLocaleData, IntlProvider } from 'react-intl';
// languages
import en from 'react-intl/locale-data/en';
import fr from 'react-intl/locale-data/fr';
import zh from 'react-intl/locale-data/zh';
import de from 'react-intl/locale-data/de';
import ja from 'react-intl/locale-data/ja';
import ko from 'react-intl/locale-data/ko';
import ru from 'react-intl/locale-data/ru';
import es from 'react-intl/locale-data/es';
import vi from 'react-intl/locale-data/vi';

import { withFirebase } from 'react-redux-firebase';
import messages from '@/locals';
import COUNTRIES_BLACKLIST from '@/data/country-blacklist';
import axios from 'axios';
import { getUserProfile, getListOfferPrice } from '@/reducers/exchange/action';
import { MasterWallet } from '@/models/MasterWallet';
import { createMasterWallets } from '@/reducers/wallet/action';
import MobileOrTablet from '@/components/MobileOrTablet';
import BrowserDetect from '@/services/browser-detect';
import NetworkError from '@/components/Router/NetworkError';
import BlockCountry from '@/components/core/presentation/BlockCountry';
import qs from 'querystring';

addLocaleData([...en, ...fr, ...zh, ...de, ...ja, ...ko, ...ru, ...es, ...vi ]);

const MeRootRouter = props => (
  <DynamicImport
    loading={Loading}
    load={() => import('@/components/Router/Me')}
  >
    {Component => <Component {...props} />}
  </DynamicImport>
);
const DiscoverRootRouter = props => (
  <DynamicImport
    loading={Loading}
    load={() => import('@/components/Router/Discover')}
  >
    {Component => <Component {...props} />}
  </DynamicImport>
);
const ChatRootRouter = props => (
  <DynamicImport
    loading={Loading}
    load={() => import('@/components/Router/Chat')}
  >
    {Component => <Component {...props} />}
  </DynamicImport>
);
const WalletRootRouter = props => (
  <DynamicImport
    loading={Loading}
    load={() => import('@/components/Router/Wallet')}
  >
    {Component => <Component {...props} />}
  </DynamicImport>
);
const CreateRootRouter = props => (
  <DynamicImport
    loading={Loading}
    load={() => import('@/components/Router/Create')}
  >
    {Component => <Component {...props} />}
  </DynamicImport>
);
const ExchangeRootRouter = props => (
  <DynamicImport
    loading={Loading}
    load={() => import('@/components/Router/Exchange')}
  >
    {Component => <Component {...props} />}
  </DynamicImport>
);
const TransactionRootRouter = props => (
  <DynamicImport
    loading={Loading}
    load={() => import('@/components/Router/Transaction')}
  >
    {Component => <Component {...props} />}
  </DynamicImport>
);
const CommentRootRouter = props => (
  <DynamicImport
    loading={Loading}
    load={() => import('@/components/Router/Comment')}
  >
    {Component => <Component {...props} />}
  </DynamicImport>
);
const LandingPageRootRouter = props => (
  <DynamicImport
    loading={Loading}
    load={() => import('@/components/Router/LandingPage')}
  >
    {Component => <Component {...props} />}
  </DynamicImport>
);
const LandingTradeRootRouter = props => (
  <DynamicImport
    loading={Loading}
    load={() => import('@/components/Router/LandingTrade')}
  >
    {Component => <Component {...props} />}
  </DynamicImport>
);
const FAQRootRouter = props => (
  <DynamicImport
    loading={Loading}
    load={() => import('@/components/Router/FAQ')}
  >
    {Component => <Component {...props} />}
  </DynamicImport>
);
const Page404 = props => (
  <DynamicImport
    isNotFound
    loading={Loading}
    load={() => import('@/pages/Error/Page404')}
  >
    {Component => <Component {...props} />}
  </DynamicImport>
);

class Router extends React.Component {
  static propTypes = {
    app: PropTypes.object.isRequired,
    signUp: PropTypes.func.isRequired,
    fetchProfile: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    authUpdate: PropTypes.func.isRequired,
    setIpInfo: PropTypes.func.isRequired,
    getUserProfile: PropTypes.func.isRequired,
    firebase: PropTypes.object.isRequired,
    getListOfferPrice: PropTypes.func.isRequired,
    getFreeETH: PropTypes.func.isRequired,
    changeLocale: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    // State
    this.state = {
      currentLocale: this.props.app.locale,
      isLoading: true,
      isLogged: this.props.auth.isLogged,
      profile: this.props.auth.profile,
      updatedAt: this.props.auth.updatedAt,
      loadingText: 'Loading application',
      isNetworkError: false,
      isCountryBlackList: false,
    };

    this.checkRegistry = ::this.checkRegistry;
    this.authSuccess = ::this.authSuccess;
    this.notification = ::this.notification;
    this.setLanguage = ::this.setLanguage;
    this.detectCountry.call(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.auth.isLogged !== prevState.isLogged) {
      return { isLogged: nextProps.auth.isLogged };
    }
    if (nextProps.auth.updatedAt !== prevState.updatedAt) {
      nextProps.firebase.unWatchEvent('value', `${FIREBASE_PATH.USERS}/${String(prevState.profile?.id)}`);
      nextProps.firebase.watchEvent('value', `${FIREBASE_PATH.USERS}/${String(nextProps.auth.profile?.id)}`);
      return { profile: nextProps.auth.profile, updatedAt: nextProps.auth.updatedAt };
    }
    if (nextProps.app.locale !== prevState.currentLocale) {
      return { currentLocale: nextProps.app.locale };
    }
    return null;
  }

  componentDidMount() {
    this.checkRegistry();
    this.notification();
  }

  componentWillUnmount() {
    this.props.firebase.unWatchEvent('value', `${FIREBASE_PATH.USERS}/${String(this.state.profile?.id)}`);

    if (this.timeOutInterval) {
      clearInterval(this.timeOutInterval);
    }

    if (this.timeOutGetPrice) {
      clearInterval(this.timeOutGetPrice);
    }
    if (this.timeOutCheckGotETHFree) {
      clearInterval(this.timeOutCheckGotETHFree);
    }
  }

  getListOfferPrice = () => {
    this.props.getListOfferPrice({
      PATH_URL: API_URL.EXCHANGE.GET_LIST_OFFER_PRICE,
      qs: { fiat_currency: this.props?.app?.ipInfo?.currency },
    });
  }

  getIpInfo = () => {
    axios.get(API_URL.EXCHANGE.IP_DOMAIN, {
      params: {
        auth: process.env.ipfindKey,
      },
    }).then((response) => {
      this.props.setIpInfo(response.data);
      local.save(APP.IP_INFO, response.data);
    });
  }

  setLanguage(language, autoDetect = true) {
    const isSupportedLanguages = ['en', 'zh', 'fr', 'de', 'ja', 'ko', 'ru', 'es', 'vi'];
    if (isSupportedLanguages.indexOf(language) >= 0) {
      this.props.changeLocale(language, autoDetect);
    } else {
      this.props.changeLocale('en', autoDetect);
    }
  }

  async detectCountry() {
    const url = `https://ipapi.co/json${process.env.ipapiKey ? `?key=${process.env.ipapiKey}` : ''}`;
    const { data } = await axios.get(url);
    const firstLanguage = data.languages.split(',')[0];
    this.setLanguage(firstLanguage);
    if (COUNTRIES_BLACKLIST.indexOf(data.country_name) !== -1) {
      this.setState({ isCountryBlackList: true });
    }
  }

  checkRegistry() {
    const token = local.get(APP.AUTH_TOKEN);
    // auth
    const searchQS = window.location.search.replace('?', '');
    const { language, ref } = qs.parse(searchQS);
    console.log('searchQS', language, ref);
    if (language) {
      this.setLanguage(language, false);
    }
    if (!token) {
      this.props.signUp({
        PATH_URL: `user/sign-up${ref ? `?ref=${ref}` : ''}`,
        METHOD: 'POST',
        successFn: () => {
          this.authSuccess();
        },
      });
    } else {
      this.authSuccess();
    }
  }

  authSuccess() {
    // basic profile
    this.props.fetchProfile({
      PATH_URL: 'user/profile',
      errorFn: (res) => {
        if (res.message === 'Network Error') {
          this.setState({ isNetworkError: true });
        }

        if (!process.env.isProduction) {
          if (res.message === 'Invalid user.') {
            local.remove(APP.AUTH_TOKEN);
            this.checkRegistry();
          }
        } else {
          this.porps.showAlert({
            message: <div className="text-center">Have something wrong with your profile, please contact supporters</div>,
            timeOut: false,
            isShowClose: true,
            type: 'danger',
            callBack: () => {},
          });
        }
      },
      successFn: () => {
        // exchange profile
        this.props.getUserProfile({
          PATH_URL: API_URL.EXCHANGE.GET_USER_PROFILE,
        });

        // GET IP INFO
        this.getIpInfo();
        this.timeOutInterval = setInterval(() => {
          this.getIpInfo();
        }, 30 * 60 * 1000); // 30'

        // GET PRICE
        this.getListOfferPrice();
        this.timeOutGetPrice = setInterval(() => {
          this.getListOfferPrice();
        }, 2 * 60 * 1000); // 2'

        // wallet handle
        let listWallet = MasterWallet.getMasterWallet();

        if (listWallet === false) {
          this.setState({ loadingText: 'Creating your local wallets' });
          listWallet = createMasterWallets().then(() => {
            this.setState({ loadingText: 'Please be patient. We are gathering ETH for you.' });
            const wallet = MasterWallet.getWalletDefault('ETH');
            this.props.getFreeETH({
              PATH_URL: `/user/free-rinkeby-eth?address=${wallet.address}`,
              METHOD: 'POST',
              successFn: () => {
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
          });
        } else {
          this.setState({ isLoading: false });
        }
      },
      // end success fn
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
  }

  render() {
    if (window.location.pathname === URL.LANDING_PAGE_SHURIKEN) return <LandingPageRootRouter />;
    if (window.location.pathname === URL.FAQ) {
      return (
        <IntlProvider
          locale={this.state.currentLocale}
          messages={messages[this.state.currentLocale]}
        >
          <FAQRootRouter />
        </IntlProvider>
      );
    }
    if (window.location.pathname === URL.LANDING_PAGE_TRADE) return <LandingTradeRootRouter />;
    if (BrowserDetect.isDesktop && process.env.isProduction) return <MobileOrTablet />;
    if (!this.state.isLogged || this.state.isLoading) {
      return (
        <BrowserRouter>
          <Route
            path={URL.INDEX}
            render={loadingProps => (
              <Layout {...loadingProps}>
                {(this.state.isNetworkError) ? <NetworkError /> : <Loading message={this.state.loadingText} />}
              </Layout>
              )}
          />
        </BrowserRouter>
      );
    }
    if (this.state.isCountryBlackList && process.env.isProduction) return <BlockCountry />;
    return (
      <IntlProvider
        locale={this.state.currentLocale}
        messages={messages[this.state.currentLocale]}
      >
        <BrowserRouter>
          <Route
            path={URL.INDEX}
            render={props =>
              (
                <Layout {...props}>
                  <ScrollToTop>
                    <Switch>
                      <Route
                        exact
                        path={URL.INDEX}
                        render={() => (
                          <Redirect to={{ pathname: URL.HANDSHAKE_DISCOVER }} />
                        )}
                      />
                      <Route path={URL.HANDSHAKE_ME} component={MeRootRouter} />
                      <Route
                        path={URL.HANDSHAKE_DISCOVER}
                        component={DiscoverRootRouter}
                      />
                      <Route
                        path={URL.HANDSHAKE_CHAT}
                        component={ChatRootRouter}
                      />
                      <Route
                        path={URL.HANDSHAKE_WALLET}
                        component={WalletRootRouter}
                      />
                      <Route
                        path={URL.HANDSHAKE_CREATE}
                        component={CreateRootRouter}
                      />
                      <Route
                        path={URL.HANDSHAKE_EXCHANGE}
                        component={ExchangeRootRouter}
                      />
                      <Route
                        path={URL.TRANSACTION_LIST}
                        component={TransactionRootRouter}
                      />
                      <Route
                        path={URL.COMMENTS_BY_SHAKE}
                        component={CommentRootRouter}
                      />
                      <Route component={Page404} />
                    </Switch>
                  </ScrollToTop>
                </Layout>
              )
            }
          />
        </BrowserRouter>
      </IntlProvider>
    );
  }
}

export default compose(
  withFirebase,
  connect(state => ({ auth: state.auth, app: state.app }), {
    signUp,
    fetchProfile,
    setIpInfo,
    getUserProfile,
    authUpdate,
    getListOfferPrice,
    getFreeETH,
    showAlert,
    changeLocale,
  }),
)(Router);
