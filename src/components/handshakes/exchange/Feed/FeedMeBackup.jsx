import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import _sample from 'lodash/sample';
import { BigNumber } from 'bignumber.js';
import { Link } from 'react-router-dom';

import iconLocation from '@/assets/images/icon/icons8-geo_fence.svg';
import iconChat from '@/assets/images/icon/icons8-chat.svg';
import iconPhone from '@/assets/images/icon/icons8-phone.svg';

import Feed from '@/components/core/presentation/Feed/Feed';
import Button from '@/components/core/controls/Button/Button';
import {
  API_URL,
  APP_USER_NAME,
  CRYPTO_CURRENCY,
  DEFAULT_FEE,
  EXCHANGE_ACTION,
  EXCHANGE_ACTION_NAME,
  EXCHANGE_ACTION_PAST_NAME,
  EXCHANGE_ACTION_PERSON,
  EXCHANGE_ACTION_PRESENT_NAME,
  EXCHANGE_FEED_TYPE,
  EXCHANGE_METHOD_PAYMENT,
  HANDSHAKE_EXCHANGE_CC_STATUS,
  HANDSHAKE_EXCHANGE_CC_STATUS_NAME,
  HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS,
  HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS_NAME,
  HANDSHAKE_EXCHANGE_SHOP_OFFER_STATUS,
  HANDSHAKE_EXCHANGE_SHOP_OFFER_STATUS_NAME,
  HANDSHAKE_EXCHANGE_SHOP_OFFER_STATUS_VALUE,
  HANDSHAKE_EXCHANGE_STATUS,
  HANDSHAKE_EXCHANGE_STATUS_NAME,
  HANDSHAKE_STATUS_NAME,
  HANDSHAKE_USER,
  URL,
  NB_BLOCKS,
} from '@/constants';
import ModalDialog from '@/components/core/controls/ModalDialog';
import Rate from '@/components/core/controls/Rate';
import {
  acceptOffer,
  acceptOfferItem,
  cancelOffer,
  cancelOfferItem,
  cancelShakedOffer,
  closeOffer,
  completeOfferItem,
  completeShakedOffer,
  deleteOfferItem,
  rejectOfferItem,
  reviewOffer,
  shakeOffer,
  withdrawShakedOffer,
} from '@/reducers/exchange/action';
import Offer from '@/models/Offer';
import { MasterWallet } from '@/models/MasterWallet';
import { formatAmountCurrency, formatMoneyByLocale, getHandshakeUserType, getOfferPrice } from '@/services/offer-util';
import { hideLoading, showAlert, showLoading } from '@/reducers/app/action';

import { ExchangeHandshake, ExchangeCashHandshake } from '@/services/neuron';
import { feedBackgroundColors } from '@/components/handshakes/exchange/config';
import { updateOfferStatus } from '@/reducers/discover/action';
import { responseExchangeDataChange } from '@/reducers/me/action';
import { Ethereum } from '@/models/Ethereum.js';
import { Bitcoin } from '@/models/Bitcoin';
import { getLocalizedDistance } from '@/services/util';
import OfferShop from '@/models/OfferShop';

import { getDistanceFromLatLonInKm, getErrorMessageFromCode } from '../utils';
import './FeedExchange.scss';
import './FeedMe.scss';

class FeedMe extends React.PureComponent {
  constructor(props) {
    super(props);

    const { initUserId, shakeUserIds, extraData } = props;
    const offer = Offer.offer(JSON.parse(extraData));

    this.userType = getHandshakeUserType(initUserId, shakeUserIds);
    this.offer = offer;

    this.state = {
      modalContent: '',
      numStars: 0,
    };
    this.mainColor = _sample(feedBackgroundColors);
  }

  showLoading = () => {
    this.props.showLoading({ message: '' });
  }

  hideLoading = () => {
    this.props.hideLoading();
  }

  confirmOfferAction = (message, actionConfirm) => {
    console.log('offer', this.offer);

    this.setState({
      modalContent:
        (
          <div className="py-2">
            <Feed className="feed p-2" background="#259B24">
              <div className="text-white d-flex align-items-center" style={{ minHeight: '50px' }}>
                <div>{message}</div>
              </div>
            </Feed>
            <Button className="mt-2" block onClick={() => this.handleConfirmAction(actionConfirm)}><FormattedMessage id="ex.btn.confirm" /></Button>
            <Button block className="btn btn-secondary" onClick={this.cancelAction}><FormattedMessage id="ex.btn.notNow" /></Button>
          </div>
        ),
    }, () => {
      this.modalRef.open();
    });
  }

  handleConfirmAction = (actionConfirm) => {
    this.modalRef.close();
    actionConfirm();
  }

  cancelAction = () => {
    this.modalRef.close();
  }

  showAlert = (message) => {
    this.props.showAlert({
      message: (
        <div className="text-center">
          {message}
        </div>
      ),
      timeOut: 5000,
      type: 'danger',
      callBack: () => {
      },
    });
  }

  checkMainNetDefaultWallet = (wallet) => {
    let result = false;

    try {
      if (process.env.isLive) {
        if (wallet.network === MasterWallet.ListCoin[wallet.className].Network.Mainnet) {
          result = true;
        } else {
          result = false;
        }
      }
    } catch (e) {
      result = false;
    }

    if (process.env.isDojo) {
      result = true;
    }

    if (!result) {
      const message = <FormattedMessage id="requireDefaultWalletOnMainNet" />;
      this.showAlert(message);
    }

    return result;
  }

  showNotEnoughCoinAlert = (balance, amount, fee, currency) => {
    const bnBalance = new BigNumber(balance);
    const bnAmount = new BigNumber(amount);
    const bnFee = new BigNumber(fee);

    const condition = bnBalance.isLessThan(bnAmount.plus(bnFee));

    if (condition) {
      this.props.showAlert({
        message: (
          <div className="text-center">
            <FormattedMessage
              id="notEnoughCoinInWallet"
              values={{
              amount: formatAmountCurrency(balance),
              fee: formatAmountCurrency(fee),
              currency,
            }}
            />
          </div>
        ),
        timeOut: 3000,
        type: 'danger',
        callBack: () => {
        },
      });
    }

    return condition;
  }

  responseExchangeDataChangeSwap = (offerShake) => {
    const { id, status } = offerShake;
    const data = {};
    const firebaseOffer = {};

    firebaseOffer.id = id;
    firebaseOffer.status = status;
    firebaseOffer.type = 'exchange';

    data[`exchange_${id}`] = firebaseOffer;

    console.log('responseExchangeDataChange', data);

    this.props.responseExchangeDataChange(data);
  }

  responseExchangeDataChange = (offerShake) => {
    const { id, status } = offerShake;
    const data = {};
    const firebaseOffer = {};

    firebaseOffer.id = id;
    firebaseOffer.status = status;
    firebaseOffer.type = 'offer_store_shake';

    data[`offer_store_shake_${id}`] = firebaseOffer;

    console.log('responseExchangeDataChange', data);

    this.props.responseExchangeDataChange(data);
  }

  responseExchangeDataChangeOfferStore = (offerStore) => {
    const { id } = offerStore;
    const { currency } = this.offer;
    const data = {};
    const firebaseOffer = {};
    const status = offerStore.items[`${currency}`].status;

    firebaseOffer.id = id;
    firebaseOffer.status = `${currency.toLowerCase()}_${status}`;
    firebaseOffer.type = 'offer_store';


    data[`offer_store_${id}`] = firebaseOffer;

    console.log('responseExchangeDataChangeOfferStore', data);

    this.props.responseExchangeDataChange(data);
  }

  // /Exchange
  // //////////////////////

  getFromExchange = () => {
    const { status } = this.props;

    let from = '';
    switch (status) {
      case HANDSHAKE_EXCHANGE_STATUS.PRE_SHAKING:
      case HANDSHAKE_EXCHANGE_STATUS.PRE_SHAKE:
      case HANDSHAKE_EXCHANGE_STATUS.SHAKING:
      case HANDSHAKE_EXCHANGE_STATUS.SHAKE:
      case HANDSHAKE_EXCHANGE_STATUS.REJECTING:
      case HANDSHAKE_EXCHANGE_STATUS.REJECTED:
      case HANDSHAKE_EXCHANGE_STATUS.CANCELLING:
      case HANDSHAKE_EXCHANGE_STATUS.CANCELLED:
      case HANDSHAKE_EXCHANGE_STATUS.COMPLETING:
      case HANDSHAKE_EXCHANGE_STATUS.COMPLETED: {
        switch (this.userType) {
          case HANDSHAKE_USER.OWNER: {
            from = <FormattedMessage id="ex.me.label.with" />;
            break;
          }
          case HANDSHAKE_USER.SHAKED: {
            from = <FormattedMessage id="ex.me.label.from" />;
            break;
          }
          default: {
            // code
            break;
          }
        }

        break;
      }
      default: {
        from = <FormattedMessage id="ex.me.label.from" />;
        break;
      }
    }

    return from;
  }

  getContentExchange() {
    const { status } = this.props;
    // console.log('thisss', this.offer)
    const { offer } = this;
    let message = '';

    let offerType = '';
    switch (status) {
      case HANDSHAKE_EXCHANGE_STATUS.PRE_SHAKING:
      case HANDSHAKE_EXCHANGE_STATUS.PRE_SHAKE:
      case HANDSHAKE_EXCHANGE_STATUS.SHAKING:
      case HANDSHAKE_EXCHANGE_STATUS.SHAKE:
      case HANDSHAKE_EXCHANGE_STATUS.COMPLETING:
      case HANDSHAKE_EXCHANGE_STATUS.COMPLETED: {
        switch (this.userType) {
          case HANDSHAKE_USER.SHAKED: {
            offerType = EXCHANGE_ACTION_PAST_NAME[offer.type];
            break;
          }
          case HANDSHAKE_USER.OWNER: {
            if (offer.type === EXCHANGE_ACTION.BUY) {
              offerType = EXCHANGE_ACTION_PAST_NAME[EXCHANGE_ACTION.SELL];
            } else if (offer.type === EXCHANGE_ACTION.SELL) {
              offerType = EXCHANGE_ACTION_PAST_NAME[EXCHANGE_ACTION.BUY];
            }
            break;
          }
          default: {
            // code
            break;
          }
        }

        // offerType = EXCHANGE_ACTION_PAST_NAME[offer.type];
        message = (<FormattedMessage
          id="offerHandShakeExchangeContentMeDone"
          values={{
            offerType,
            something: offer.physicalItem,
            amount: formatAmountCurrency(offer.amount),
            currency: offer.currency,
          }}
        />);

        break;
      }
      case HANDSHAKE_EXCHANGE_STATUS.CREATED:
      case HANDSHAKE_EXCHANGE_STATUS.ACTIVE:
      case HANDSHAKE_EXCHANGE_STATUS.CLOSING:
      case HANDSHAKE_EXCHANGE_STATUS.CLOSED:
      case HANDSHAKE_EXCHANGE_STATUS.REJECTING:
      case HANDSHAKE_EXCHANGE_STATUS.REJECTED:
      case HANDSHAKE_EXCHANGE_STATUS.CANCELLING:
      case HANDSHAKE_EXCHANGE_STATUS.CANCELLED: {
        switch (this.userType) {
          case HANDSHAKE_USER.SHAKED: {
            offerType = EXCHANGE_ACTION_PRESENT_NAME[offer.type];
            break;
          }
          case HANDSHAKE_USER.OWNER: {
            if (offer.type === EXCHANGE_ACTION.BUY) {
              offerType = EXCHANGE_ACTION_PRESENT_NAME[EXCHANGE_ACTION.SELL];
            } else if (offer.type === EXCHANGE_ACTION.SELL) {
              offerType = EXCHANGE_ACTION_PRESENT_NAME[EXCHANGE_ACTION.BUY];
            }
            break;
          }
          default: {
            // code
            break;
          }
        }

        message = (<FormattedMessage
          id="offerHandShakeExchangeContentMe"
          values={{
            offerType,
            something: offer.physicalItem,
            amount: formatAmountCurrency(offer.amount),
            currency: offer.currency,
          }}
        />);
        break;
      }
      default: {
        break;
      }
    }

    return message;
  }

  getActionButtonsExchange = () => {
    const { status } = this.props;
    const offer = this.offer;
    let actionButtons = null;
    let message = '';

    switch (this.userType) {
      case HANDSHAKE_USER.NORMAL: {
        break;
      }
      case HANDSHAKE_USER.OWNER: {
        switch (status) {
          case HANDSHAKE_EXCHANGE_STATUS.ACTIVE: {
            message = <FormattedMessage id="cancelOfferConfirm" values={{}} />;
            actionButtons = (
              <div>
                <Button block className="mt-2 btn btn-secondary" onClick={() => this.confirmOfferAction(message, this.handleCloseOfferExchange)}><FormattedMessage id="btn.close" /></Button>
              </div>
            );
            break;
          }
          case HANDSHAKE_EXCHANGE_STATUS.PRE_SHAKE: {
            message = <FormattedMessage id="acceptOfferConfirm" values={{ }} />;
            actionButtons = (
              <div>
                {offer.type === EXCHANGE_ACTION.BUY &&
                <Button
                  block
                  className="mt-2"
                  onClick={() => this.confirmOfferAction(message, this.handleAcceptOfferExchange)}
                ><FormattedMessage id="btn.accept" />
                </Button>
                }
                {offer.type === EXCHANGE_ACTION.BUY &&
                <Button
                  block
                  className="mt-2 btn btn-secondary"
                  onClick={() => this.confirmOfferAction(message, this.handleCancelOfferExchange)}
                ><FormattedMessage id="btn.cancel" />
                </Button>
                }

              </div>
            );
            break;
          }
          case HANDSHAKE_EXCHANGE_STATUS.SHAKE: {
            message = <FormattedMessage id="rejectOfferConfirm" values={{}} />;
            const message2 = <FormattedMessage id="completeOfferConfirm" values={{}} />;
            actionButtons = (
              <div>
                {offer.type === EXCHANGE_ACTION.SELL &&
                <Button block className="mt-2" onClick={() => this.confirmOfferAction(message2, this.handleCompleteShakedOfferExchange)}><FormattedMessage id="btn.complete" /></Button>
                }
                <Button block className="mt-2 btn btn-secondary" onClick={() => this.confirmOfferAction(message, this.handleRejectShakedOfferExchange)}><FormattedMessage id="btn.reject" /></Button>
              </div>
            );
            break;
          }
          default: {
            // code
            break;
          }
        }
        break;
      }
      case HANDSHAKE_USER.SHAKED: {
        switch (status) {
          case HANDSHAKE_EXCHANGE_STATUS.PRE_SHAKE: {
            message = <FormattedMessage id="cancelOfferConfirm" values={{ }} />;
            actionButtons = (
              <div>
                {offer.type === EXCHANGE_ACTION.BUY &&
                <Button
                  block
                  className="mt-2 btn btn-secondary"
                  onClick={() => this.confirmOfferAction(message, this.handleCancelOfferExchange)}
                ><FormattedMessage id="btn.cancel" />
                </Button>
                }
              </div>
            );
            break;
          }
          case HANDSHAKE_EXCHANGE_STATUS.SHAKE: {
            message = <FormattedMessage id="rejectOfferConfirm" values={{}} />;
            const message2 = <FormattedMessage id="completeOfferConfirm" values={{}} />;
            actionButtons = (
              <div>
                {offer.type === EXCHANGE_ACTION.BUY &&
                <Button block className="mt-2" onClick={() => this.confirmOfferAction(message2, this.handleCompleteShakedOfferExchange)}><FormattedMessage id="btn.complete" /></Button>
                }
                <Button block className="mt-2 btn btn-secondary" onClick={() => this.confirmOfferAction(message, this.handleRejectShakedOfferExchange)}><FormattedMessage id="btn.reject" /></Button>
              </div>
            );

            break;
          }
          default: {
            // code
            break;
          }
        }
        break;
      }
      default: {
        // code
        break;
      }
    }

    return actionButtons;
  }

  // //////////////////////
  handleShakeOfferExchange = async () => {
    const { authProfile } = this.props;
    const offer = this.offer;
    const fiatAmount = this.fiatAmount;

    const wallet = MasterWallet.getWalletDefault(offer.currency);
    const balance = await wallet.getBalance();
    const fee = await wallet.getFee(NB_BLOCKS, true);

    if (!this.checkMainNetDefaultWallet(wallet)) {
      return;
    }

    if (offer.type === EXCHANGE_ACTION.BUY && this.showNotEnoughCoinAlert(balance, offer.totalAmount, fee, offer.currency)) {
      return;
    } else if (offer.currency === CRYPTO_CURRENCY.ETH && this.showNotEnoughCoinAlert(balance, 0, fee, offer.currency)) {
      return;
    }

    const { address } = wallet;

    const offerShake = {
      fiat_amount: fiatAmount.toString(),
      address,
      email: authProfile.email || '',
      username: authProfile.username || '',
    };

    this.showLoading();
    this.props.shakeOffer({
      PATH_URL: `${API_URL.EXCHANGE.OFFERS}/${offer.id}`,
      METHOD: 'POST',
      data: offerShake,
      successFn: this.handleShakeOfferExchangeSuccess,
      errorFn: this.handleShakeOfferExchangeFailed,
    });
  }

  handleShakeOfferExchangeSuccess = async (responseData) => {
    const { refreshPage } = this.props;
    const { data } = responseData;
    const { currency } = data;

    const { offer } = this;
    if (currency === CRYPTO_CURRENCY.ETH) {
      const wallet = MasterWallet.getWalletDefault(currency);
      const cashHandshake = new ExchangeHandshake(wallet.chainId);
      let amount = 0;

      if (offer.type === EXCHANGE_ACTION.BUY) {
        amount = data.total_amount;
      }
      const result = await cashHandshake.shake(data.hid, amount, data.id);

      console.log('handleShakeOfferExchangeSuccess', result);
    } else if (currency === CRYPTO_CURRENCY.BTC) {
      if (offer.type === EXCHANGE_ACTION.BUY) {
        const wallet = MasterWallet.getWalletDefault(offer.currency);
        wallet.transfer(offer.systemAddress, offer.totalAmount, NB_BLOCKS).then((success) => {
          console.log('transfer', success);
        });
      }
    }

    this.hideLoading();
    this.props.showAlert({
      message: <div className="text-center"><FormattedMessage id="shakeOfferSuccessMessage" /></div>,
      timeOut: 2000,
      type: 'success',
      callBack: () => {
        // this.props.updateOfferStatus({ [`exchange_${data.id}`]: data });
        this.props.history.push(URL.HANDSHAKE_ME);
      },
    });
  }

  handleShakeOfferExchangeFailed = (e) => {
    this.handleActionFailed(e);
  }

  // //////////////////////
  handleRejectShakedOfferExchange = async () => {
    const offer = this.offer;

    if (offer.currency === CRYPTO_CURRENCY.ETH) {
      const wallet = MasterWallet.getWalletDefault(offer.currency);
      const balance = await wallet.getBalance();
      const fee = await wallet.getFee();

      if (!this.checkMainNetDefaultWallet(wallet)) {
        return;
      }

      if (this.showNotEnoughCoinAlert(balance, 0, fee, offer.currency)) {
        return;
      }
    }

    this.showLoading();
    this.props.cancelShakedOffer({
      PATH_URL: `${API_URL.EXCHANGE.OFFERS}/${offer.id}/reject`,
      METHOD: 'POST',
      successFn: this.handleRejectShakedOfferExchangeSuccess,
      errorFn: this.handleRejectShakedOfferExchangeFailed,
    });
  }

  handleRejectShakedOfferExchangeSuccess = async (res) => {
    const { refreshPage } = this.props;
    const { data } = res;
    const {
      currency, type, hid, id,
    } = data;

    console.log('handleRejectShakedOfferExchangeSuccess', res);

    const offerShake = Offer.offer(data);

    this.responseExchangeDataChangeSwap(offerShake);

    if (currency === CRYPTO_CURRENCY.ETH) {
      const wallet = MasterWallet.getWalletDefault(currency);

      const cashHandshake = new ExchangeHandshake(wallet.chainId);

      let result = null;

      // if ((data.type === EXCHANGE_ACTION.BUY && this.userType === HANDSHAKE_USER.OWNER) ||
      //   (data.type === EXCHANGE_ACTION.SELL && this.userType === HANDSHAKE_USER.SHAKED)
      // ) {
      //   result = await cashHandshake.reject(data.hid, data.id);
      // } else {
      //   result = await cashHandshake.cancel(data.hid, data.id);
      // }
      result = await cashHandshake.cancel(hid, id);

      console.log('handleRejectShakedOfferExchangeSuccess', result);
    }

    this.hideLoading();
    this.props.showAlert({
      message: <div className="text-center"><FormattedMessage id="cancelShakedfferSuccessMessage" /></div>,
      timeOut: 2000,
      type: 'success',
      callBack: () => {
        // if (refreshPage) {
        //   refreshPage();
        // }
      },
    });
  }

  handleRejectShakedOfferExchangeFailed = (e) => {
    this.handleActionFailed(e);
  }

  // //////////////////////
  handleCompleteShakedOfferExchange = async () => {
    const offer = this.offer;

    if (offer.currency === CRYPTO_CURRENCY.ETH) {
      const wallet = MasterWallet.getWalletDefault(offer.currency);
      const balance = await wallet.getBalance();
      const fee = await wallet.getFee();

      if (!this.checkMainNetDefaultWallet(wallet)) {
        return;
      }

      if (this.showNotEnoughCoinAlert(balance, 0, fee, offer.currency)) {
        return;
      }
    }

    this.showLoading();
    this.props.completeShakedOffer({
      PATH_URL: `${API_URL.EXCHANGE.OFFERS}/${offer.id}/complete`,
      METHOD: 'POST',
      successFn: this.handleCompleteShakedOfferExchangeSuccess,
      errorFn: this.handleCompleteShakedOfferExchangeFailed,
    });
  }

  handleCompleteShakedOfferExchangeSuccess = async (res) => {
    const { refreshPage } = this.props;
    const { data } = res;
    const { currency, hid, id } = data;
    console.log('handleCompleteShakedOfferExchangeSuccess', res);

    const offerShake = Offer.offer(data);

    this.responseExchangeDataChangeSwap(offerShake);

    if (currency === CRYPTO_CURRENCY.ETH) {
      const wallet = MasterWallet.getWalletDefault(currency);

      const cashHandshake = new ExchangeHandshake(wallet.chainId);

      const result = await cashHandshake.accept(hid, id);

      console.log('handleCompleteShakedOfferExchangeSuccess', result);
    }

    // console.log('data', data);
    this.hideLoading();
    this.props.showAlert({
      message: <div className="text-center"><FormattedMessage id="completeShakedfferSuccessMessage" /></div>,
      timeOut: 2000,
      type: 'success',
      callBack: () => {
        // if (refreshPage) {
        //   refreshPage();
        // }
      },
    });
  }

  handleCompleteShakedOfferExchangeFailed = (e) => {
    this.handleActionFailed(e);
  }

  // //////////////////////
  handleCancelOfferExchange = async () => {
    const offer = this.offer;

    if (offer.currency === CRYPTO_CURRENCY.ETH) {
      const wallet = MasterWallet.getWalletDefault(offer.currency);
      const balance = await wallet.getBalance();
      const fee = await wallet.getFee();

      if (!this.checkMainNetDefaultWallet(wallet)) {
        return;
      }

      if (this.showNotEnoughCoinAlert(balance, 0, fee, offer.currency)) {
        return;
      }
    }

    this.showLoading();
    this.props.cancelOffer({
      PATH_URL: `${API_URL.EXCHANGE.OFFERS}/${offer.id}/cancel`,
      METHOD: 'POST',
      successFn: this.handleCancelOfferExchangeSuccess,
      errorFn: this.handleCancelOfferExchangeFailed,
    });
  }

  handleCancelOfferExchangeSuccess = async (res) => {
    const { refreshPage } = this.props;
    const { data } = res;
    const { currency, hid, id } = data;

    console.log('handleCancelOfferExchangeSuccess', res);

    const offerShake = Offer.offer(data);

    this.responseExchangeDataChangeSwap(offerShake);

    if (currency === CRYPTO_CURRENCY.ETH) {
      const wallet = MasterWallet.getWalletDefault(currency);

      const cashHandshake = new ExchangeHandshake(wallet.chainId);

      const result = await cashHandshake.cancel(hid, id);

      console.log('handleCompleteShakedOfferExchangeSuccess', result);
    }

    // console.log('data', data);
    this.hideLoading();
    this.props.showAlert({
      message: <div className="text-center"><FormattedMessage id="cancelShakedfferSuccessMessage" /></div>,
      timeOut: 2000,
      type: 'success',
      callBack: () => {
        // if (refreshPage) {
        //   refreshPage();
        // }
      },
    });
  }

  handleCancelOfferExchangeFailed = (e) => {
    this.handleActionFailed(e);
  }

  // //////////////////////
  handleWithdrawShakedOfferExchange = async () => {
    const offer = this.offer;

    if (offer.currency === CRYPTO_CURRENCY.ETH) {
      const wallet = MasterWallet.getWalletDefault(offer.currency);
      const balance = await wallet.getBalance();
      const fee = await wallet.getFee();

      if (!this.checkMainNetDefaultWallet(wallet)) {
        return;
      }

      if (this.showNotEnoughCoinAlert(balance, 0, fee, offer.currency)) {
        return;
      }
    }

    this.showLoading();
    this.props.cancelShakedOffer({
      PATH_URL: `${API_URL.EXCHANGE.OFFERS}/${offer.id}/${API_URL.EXCHANGE.WITHDRAW}`,
      METHOD: 'POST',
      successFn: this.handleWithdrawShakedOfferExchangeSuccess,
      errorFn: this.handleWithdrawShakedOfferExchangeFailed,
    });
  }

  handleWithdrawShakedOfferExchangeSuccess = async (responseData) => {
    const { refreshPage } = this.props;
    const { data } = responseData;
    const { currency } = data;

    if (currency === CRYPTO_CURRENCY.ETH) {
      const wallet = MasterWallet.getWalletDefault(currency);
      const cashHandshake = new ExchangeHandshake(wallet.chainId);

      const result = await cashHandshake.withdraw(data.hid, data.id);

      console.log('handleWithdrawShakedOfferExchangeSuccess', result);
    }

    this.hideLoading();
    this.props.showAlert({
      message: <div className="text-center"><FormattedMessage id="withdrawShakedfferSuccessMessage" /></div>,
      timeOut: 2000,
      type: 'success',
      callBack: () => {
        // if (refreshPage) {
        //   refreshPage();
        // }
      },
    });
  }

  handleWithdrawShakedOfferExchangeFailed = (e) => {
    this.handleActionFailed(e);
  }

  // //////////////////////
  handleAcceptOfferExchange = async () => {
    const offer = this.offer;

    if (offer.currency === CRYPTO_CURRENCY.ETH) {
      const wallet = MasterWallet.getWalletDefault(offer.currency);
      const balance = await wallet.getBalance();
      const fee = await wallet.getFee();

      if (!this.checkMainNetDefaultWallet(wallet)) {
        return;
      }

      if (this.showNotEnoughCoinAlert(balance, 0, fee, offer.currency)) {
        return;
      }
    }

    this.showLoading();
    this.props.acceptOffer({
      PATH_URL: `${API_URL.EXCHANGE.OFFERS}/${offer.id}/accept`,
      METHOD: 'POST',
      successFn: this.handleAcceptOfferExchangeSuccess,
      errorFn: this.handleAcceptOfferExchangeFailed,
    });
  }

  handleAcceptOfferExchangeSuccess = async (res) => {
    const { refreshPage } = this.props;
    const { data } = res;
    const {
      currency, hid, id, type,
    } = data;
    console.log('handleAcceptOfferExchangeSuccess', res);

    const offerShake = Offer.offer(data);

    this.responseExchangeDataChangeSwap(offerShake);

    if (currency === CRYPTO_CURRENCY.ETH) {
      const wallet = MasterWallet.getWalletDefault(currency);
      const cashHandshake = new ExchangeHandshake(wallet.chainId);

      let result = '';

      result = await cashHandshake.shake(hid, id);

      console.log('handleAcceptOfferExchangeSuccess', result);
    }

    this.hideLoading();
    this.props.showAlert({
      message: <div className="text-center"><FormattedMessage id="shakeOfferSuccessMessage" /></div>,
      timeOut: 2000,
      type: 'success',
      callBack: () => {
        // this.props.fireBaseDataChange( { [`exchange_${data.id}`]: data });
      },
    });
  }

  handleAcceptOfferExchangeFailed = (e) => {
    this.handleActionFailed(e);
  }

  // //////////////////////
  handleCloseOfferExchange = async () => {
    const offer = this.offer;

    if (offer.currency === CRYPTO_CURRENCY.ETH && offer.type === EXCHANGE_ACTION.SELL) {
      const wallet = MasterWallet.getWalletDefault(offer.currency);
      const balance = await wallet.getBalance();
      const fee = await wallet.getFee();

      if (!this.checkMainNetDefaultWallet(wallet)) {
        return;
      }

      if (this.showNotEnoughCoinAlert(balance, 0, fee, offer.currency)) {
        return;
      }
    }

    this.showLoading();
    this.props.closeOffer({
      PATH_URL: `${API_URL.EXCHANGE.OFFERS}/${offer.id}`,
      METHOD: 'DELETE',
      successFn: this.handleCloseOfferExchangeSuccess,
      errorFn: this.handleCloseOfferExchangeFailed,
    });
  }

  handleCloseOfferExchangeSuccess = async (res) => {
    const { refreshPage } = this.props;
    const { data } = res;
    const { currency, type } = data;
    const offerShake = Offer.offer(data);

    this.responseExchangeDataChangeSwap(offerShake);

    if (currency === CRYPTO_CURRENCY.ETH && type === EXCHANGE_ACTION.SELL) {
      const wallet = MasterWallet.getWalletDefault(currency);
      const cashHandshake = new ExchangeHandshake(wallet.chainId);

      let result = '';

      result = await cashHandshake.cancel(data.hid, data.id);

      console.log('handleCloseOfferExchangeSuccess', result);
    }

    this.hideLoading();
    this.props.showAlert({
      message: <div className="text-center"><FormattedMessage id="closeOfferSuccessMessage" /></div>,
      timeOut: 2000,
      type: 'success',
      callBack: () => {
        // this.props.fireBaseDataChange( { [`exchange_${data.id}`]: data });
      },
    });
  }

  handleCloseOfferExchangeFailed = (e) => {
    this.handleActionFailed(e);
  }

  // /Start Offer store
  // //////////////////////

  calculateFiatAmountOfferStore(amount, type, currency, percentage) {
    const { listOfferPrice } = this.props;
    let fiatAmount = 0;

    if (listOfferPrice) {
      const offerPrice = getOfferPrice(listOfferPrice, type, currency);
      if (offerPrice) {
        fiatAmount = amount * offerPrice.price || 0;
        fiatAmount += fiatAmount * percentage / 100;
      } else {
        // console.log('aaaa', offer.type, offer.currency);
      }
    }

    return fiatAmount;
  }

  getEmailOfferStore = () => {
    const {
      email, contactPhone, currency, userAddress,
    } = this.offer;

    if (email) { return email; }
    if (contactPhone) { return contactPhone; }
    if (currency === CRYPTO_CURRENCY.ETH) {
      const wallet = new Ethereum();
      wallet.address = userAddress;
      return wallet.getShortAddress();
    }
    if (currency === CRYPTO_CURRENCY.BTC) {
      const wallet = new Bitcoin();
      wallet.address = userAddress;
      return wallet.getShortAddress();
    }
    return '';
  }

  getContentOfferStore = () => {
    const { status } = this.props;
    const { offer } = this;
    const {
      buyAmount, sellAmount, currency, buyPercentage, sellPercentage,
    } = offer;
    let message = '';
    const fiatAmountBuy = this.calculateFiatAmountOfferStore(buyAmount, EXCHANGE_ACTION.BUY, currency, buyPercentage);
    const fiatAmountSell = this.calculateFiatAmountOfferStore(sellAmount, EXCHANGE_ACTION.SELL, currency, sellPercentage);
    switch (status) {
      case HANDSHAKE_EXCHANGE_SHOP_OFFER_STATUS.CREATED:
      case HANDSHAKE_EXCHANGE_SHOP_OFFER_STATUS.ACTIVE:
      case HANDSHAKE_EXCHANGE_SHOP_OFFER_STATUS.CLOSING:
      case HANDSHAKE_EXCHANGE_SHOP_OFFER_STATUS.CLOSED: {
        message = (
          <span>
            {offer.buyAmount > 0 && (
              <FormattedMessage
                id="offerStoreHandShakeContentBuy"
                values={{
                  offerTypeBuy: EXCHANGE_ACTION_NAME[EXCHANGE_ACTION.BUY],
                  amountBuy: offer.buyAmount,
                  currency: offer.currency,
                  fiatAmountCurrency: offer.fiatCurrency,
                  fiatAmountBuy: formatMoneyByLocale(fiatAmountBuy, offer.fiatCurrency),
                }}
              />
            )}
            {offer.sellAmount > 0 && (
              <FormattedMessage
                id="offerStoreHandShakeContentSell"
                values={{
                  offerTypeSell: EXCHANGE_ACTION_NAME[EXCHANGE_ACTION.SELL],
                  amountSell: offer.sellAmount,
                  currency: offer.currency,
                  fiatAmountCurrency: offer.fiatCurrency,
                  fiatAmountSell: formatMoneyByLocale(fiatAmountSell, offer.fiatCurrency),
                }}
              />
            )}
          </span>
        );
        break;
      }
    }

    return message;
  }

  getActionButtonsOfferStore = () => {
    const { offer } = this;
    const status = HANDSHAKE_EXCHANGE_SHOP_OFFER_STATUS_VALUE[offer.status];
    let actionButtons = null;

    switch (status) {
      case HANDSHAKE_EXCHANGE_SHOP_OFFER_STATUS.ACTIVE: {
        const message = <FormattedMessage id="closeOfferConfirm" values={{ }} />;
        actionButtons = (
          <div>
            <Button
              block
              className="mt-2 btn btn-secondary"
              onClick={() => this.confirmOfferAction(message, this.deleteOfferItem)}
            ><FormattedMessage id="btn.delete" />
            </Button>
          </div>
        );
        break;
      }
      case HANDSHAKE_EXCHANGE_SHOP_OFFER_STATUS.CREATED:
      case HANDSHAKE_EXCHANGE_SHOP_OFFER_STATUS.CLOSING:
      case HANDSHAKE_EXCHANGE_SHOP_OFFER_STATUS.CLOSED: {
        break;
      }
      default: {
        // code
        break;
      }
    }

    return actionButtons;
  }

  deleteOfferItem = async () => {
    const { offer } = this;
    const { currency, sellAmount, freeStart } = offer;
    console.log('deleteOfferItem', offer);

    if (currency === CRYPTO_CURRENCY.ETH) {
      if (sellAmount > 0 && !freeStart) {
        const wallet = MasterWallet.getWalletDefault(currency);
        const balance = await wallet.getBalance();
        const fee = await wallet.getFee();

        if (this.showNotEnoughCoinAlert(balance, 0, fee, currency)) {
          return;
        }
      }
    }

    this.showLoading();
    this.props.deleteOfferItem({
      PATH_URL: `${API_URL.EXCHANGE.OFFER_STORES}/${offer.id}`,
      METHOD: 'DELETE',
      qs: { currency: offer.currency },
      successFn: this.handleDeleteOfferItemSuccess,
      errorFn: this.handleDeleteOfferItemFailed,
    });
  }

  handleDeleteOfferItemSuccess = async (responseData) => {
    const { refreshPage } = this.props;
    const { data } = responseData;
    const { offer } = this;
    const { currency, sellAmount, freeStart } = offer;

    console.log('handleDeleteOfferItemSuccess', responseData);

    const offerStore = OfferShop.offerShop(data);

    // Update status to redux
    this.responseExchangeDataChangeOfferStore(offerStore);

    if (currency === CRYPTO_CURRENCY.ETH) {
      if (sellAmount > 0 && !freeStart && offerStore.items.ETH.status !== 'closed') {
        const wallet = MasterWallet.getWalletDefault(currency);

        const cashHandshake = new ExchangeCashHandshake(wallet.chainId);

        let result = null;

        result = await cashHandshake.closeByStationOwner(data.hid, data.id);

        console.log('handleDeleteOfferItemSuccess', result);
      }
    } else if (currency === CRYPTO_CURRENCY.BTC) {

    }

    this.hideLoading();
    const message = <FormattedMessage id="deleteOfferItemSuccessMassage" values={{ }} />;

    this.props.showAlert({
      message: <div className="text-center">{message}</div>,
      timeOut: 2000,
      type: 'success',
      callBack: () => {
        // if (refreshPage) {
        //   refreshPage();
        // }
      },
    });
  }

  handleDeleteOfferItemFailed = (e) => {
    this.handleActionFailed(e);
  }

  // /End Offer store
  // //////////////////////

  // /Start Offer store shake
  // //////////////////////

  calculateFiatAmount = (offer) => {
    const { listOfferPrice } = this.props;
    let fiatAmount = 0;

    if (offer.fiatAmount) {
      fiatAmount = offer.fiatAmount;
    } else if (listOfferPrice) {
      let checkType = offer.type;
      if (this.userType === HANDSHAKE_USER.SHAKED) {
        checkType = offer.type === EXCHANGE_ACTION.BUY ? EXCHANGE_ACTION.SELL : EXCHANGE_ACTION.BUY;
      }

      const offerPrice = getOfferPrice(listOfferPrice, checkType, offer.currency);
      if (offerPrice) {
        fiatAmount = offer.amount * offerPrice.price || 0;
        fiatAmount += fiatAmount * offer.percentage / 100;
      } else {
        console.log('aaaa', offer.type, offer.currency);
      }
    }
    return fiatAmount;
  }

  getContent = (fiatAmount) => {
    const { status } = this.props;
    const { offer } = this;
    let offerType = '';

    let idMessage = '';
    switch (this.userType) {
      case HANDSHAKE_USER.NORMAL: {
        break;
      }
      case HANDSHAKE_USER.SHAKED: {
        switch (status) {
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.PRE_SHAKING:
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.PRE_SHAKE:
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.REJECTING:
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.REJECTED:
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.CANCELLING:
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.CANCELLED: {
            if (offer.type === EXCHANGE_ACTION.BUY) {
              offerType = EXCHANGE_ACTION_PRESENT_NAME[EXCHANGE_ACTION.SELL];
            } else if (offer.type === EXCHANGE_ACTION.SELL) {
              offerType = EXCHANGE_ACTION_PRESENT_NAME[EXCHANGE_ACTION.BUY];
            }

            idMessage = 'offerHandShakeContentMe';

            break;
          }
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.SHAKING:
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.SHAKE:
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.COMPLETING:
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.COMPLETED: {
            if (offer.type === EXCHANGE_ACTION.BUY) {
              offerType = EXCHANGE_ACTION_PAST_NAME[EXCHANGE_ACTION.SELL];
            } else if (offer.type === EXCHANGE_ACTION.SELL) {
              offerType = EXCHANGE_ACTION_PAST_NAME[EXCHANGE_ACTION.BUY];
            }

            idMessage = 'offerHandShakeContentMeDone';

            break;
          }
        }

        break;
      }
      case HANDSHAKE_USER.OWNER: {
        switch (status) {
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.PRE_SHAKING:
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.PRE_SHAKE:
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.REJECTING:
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.REJECTED:
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.CANCELLING:
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.CANCELLED: {
            offerType = EXCHANGE_ACTION_PRESENT_NAME[offer.type];

            idMessage = 'offerHandShakeContentMe';

            break;
          }
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.SHAKING:
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.SHAKE:
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.COMPLETING:
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.COMPLETED: {
            offerType = EXCHANGE_ACTION_PAST_NAME[offer.type];

            idMessage = 'offerHandShakeContentMeDone';

            break;
          }
          default: {
            // code
            break;
          }
        }
      }
    }

    let message = '';
    if (idMessage) {
      message = (<FormattedMessage
        id={idMessage}
        values={{
        offerType,
        amount: formatAmountCurrency(offer.amount),
        currency: offer.currency,
        currency_symbol: offer.fiatCurrency,
        total: formatMoneyByLocale(fiatAmount, offer.fiatCurrency),
        // fee: offer.feePercentage,
        payment_method: EXCHANGE_METHOD_PAYMENT[EXCHANGE_FEED_TYPE.EXCHANGE],
        }}
      />);
    }

    return message;
  }

  getActionButtons = () => {
    const { status } = this.props;
    const offer = this.offer;
    let actionButtons = null;
    let message = '';

    switch (this.userType) {
      case HANDSHAKE_USER.NORMAL: {
        break;
      }
      case HANDSHAKE_USER.OWNER: {
        switch (status) {
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.PRE_SHAKE: {
            message = <FormattedMessage id="acceptOfferConfirm" values={{ }} />;
            actionButtons = (
              <div>
                <Button
                  block
                  className="mt-2"
                  onClick={() => this.confirmOfferAction(message, this.handleAcceptShakedOffer)}
                ><FormattedMessage id="btn.accept" />
                </Button>
              </div>
            );
            break;
          }
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.SHAKE: {
            // actionButtons = 'Reject'; // complete: nguoi nhan cash
            message = <FormattedMessage id="rejectOfferConfirm" values={{ }} />;
            const message2 = <FormattedMessage id="completeOfferConfirm" values={{ }} />;
            actionButtons = (
              <div>
                {offer.type === EXCHANGE_ACTION.SELL &&
                <Button
                  block
                  className="mt-2"
                  onClick={() => this.confirmOfferAction(message2, this.handleCompleteShakedOffer)}
                ><FormattedMessage id="btn.complete" />
                </Button>
                }
                <Button
                  block
                  className="mt-2 btn btn-secondary"
                  onClick={() => this.confirmOfferAction(message, this.handleRejectShakedOffer)}
                ><FormattedMessage id="btn.reject" />
                </Button>
              </div>
            );
            break;
          }
        }
        break;
      }
      case HANDSHAKE_USER.SHAKED: {
        switch (status) {
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.PRE_SHAKE: {
            message = <FormattedMessage id="cancelOfferConfirm" values={{ }} />;
            actionButtons = (
              <div>
                <Button
                  block
                  className="mt-2 btn btn-secondary"
                  onClick={() => this.confirmOfferAction(message, this.handleCancelShakeOffer)}
                ><FormattedMessage id="btn.cancel" />
                </Button>
              </div>
            );
            break;
          }
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.SHAKE: {
            // actionButtons = 'Reject'; // complete: nguoi nhan cash
            message = <FormattedMessage id="rejectOfferConfirm" values={{ }} />;
            const message2 = <FormattedMessage id="completeOfferConfirm" values={{ }} />;
            actionButtons = (
              <div>
                {offer.type === EXCHANGE_ACTION.BUY &&
                <Button
                  block
                  className="mt-2"
                  onClick={() => this.confirmOfferAction(message2, this.handleCompleteShakedOffer)}
                ><FormattedMessage id="btn.complete" />
                </Button>
                }
                <Button
                  block
                  className="mt-2 btn btn-secondary"
                  onClick={() => this.confirmOfferAction(message, this.handleRejectShakedOffer)}
                ><FormattedMessage id="btn.cancel" />
                </Button>
              </div>
            );
            break;
          }
        }
        break;
      }
      default: {
        // code
        break;
      }
    }

    return actionButtons;
  }

  getEmail = () => {
    const { offer } = this;
    let email = '';

    switch (this.userType) {
      case HANDSHAKE_USER.NORMAL: {
        break;
      }
      case HANDSHAKE_USER.SHAKED:
      case HANDSHAKE_USER.OWNER: {
        email = offer.email ? offer.email : offer.contactPhone ? offer.contactPhone : '';

        if (!email) {
          if (offer.currency === CRYPTO_CURRENCY.ETH) {
            const wallet = new Ethereum();
            wallet.address = offer.userAddress;
            email = wallet.getShortAddress();
          }
          if (offer.currency === CRYPTO_CURRENCY.BTC) {
            const wallet = new Bitcoin();
            wallet.address = offer.userAddress;
            email = wallet.getShortAddress();
          }
        }

        break;
      }
      default: {
        // code
        break;
      }
    }

    return email;
  }

  getChatUserName = () => {
    const { initUserId, shakeUserIds } = this.props;

    let chatUserName = '';

    switch (this.userType) {
      case HANDSHAKE_USER.NORMAL: {
        break;
      }
      case HANDSHAKE_USER.SHAKED: {
        chatUserName = initUserId;
        break;
      }
      case HANDSHAKE_USER.OWNER: {
        chatUserName = shakeUserIds && shakeUserIds.length > 0 ? shakeUserIds[0] : '';
        break;
      }
      default: {
        // code
        break;
      }
    }
    return chatUserName?.toString() || '';
  }

  handleOnClickRating = (numStars) => {
    this.setState({ numStars });
  }

  handleSubmitRating = () => {
    this.rateRef.close();
    const { offer } = this;
    const { initUserId } = this.props;
    this.props.reviewOffer({
      PATH_URL: `${API_URL.EXCHANGE.OFFER_STORES}/${initUserId}/${API_URL.EXCHANGE.REVIEWS}/${offer.id}`,
      METHOD: 'POST',
      qs: { score: this.state.numStars },
      successFn: this.handleReviewOfferSuccess,
      errorFn: this.handleReviewOfferFailed,
    });
  }

  handleReviewOfferSuccess = (responseData) => {
    console.log('handleReviewOfferSuccess', responseData);
    const data = responseData.data;
  }

  handleReviewOfferFailed = (e) => {
  }

  // //////////////////////

  handleRejectShakedOffer = async () => {
    const { offer } = this;
    const { initUserId } = this.props;
    const { id, currency, type } = offer;

    if (currency === CRYPTO_CURRENCY.ETH) {
      if (type === EXCHANGE_ACTION.BUY) {//shop buy
        const wallet = MasterWallet.getWalletDefault(currency);
        const balance = await wallet.getBalance();
        const fee = await wallet.getFee();

        if (!this.checkMainNetDefaultWallet(wallet)) {
          return;
        }

        if (this.showNotEnoughCoinAlert(balance, 0, fee, currency)) {
          return;
        }
      }
    }

    this.showLoading();
    this.props.rejectOfferItem({
      PATH_URL: `${API_URL.EXCHANGE.OFFER_STORES}/${initUserId}/${API_URL.EXCHANGE.SHAKES}/${id}`,
      METHOD: 'DELETE',
      successFn: this.handleRejectShakedOfferSuccess,
      errorFn: this.handleRejectShakedOfferFailed,
    });
  }

  handleRejectShakedOfferSuccess = async (responseData) => {
    const { refreshPage } = this.props;
    const { data } = responseData;
    const offerShake = Offer.offer(data);
    const {
      hid, currency, type, offChainId,
    } = offerShake;

    console.log('handleRejectShakedOfferSuccess', responseData);

    // Update status to redux
    this.responseExchangeDataChange(offerShake);

    if (currency === CRYPTO_CURRENCY.ETH) {
      if (type === EXCHANGE_ACTION.BUY) {//shop buy
        const wallet = MasterWallet.getWalletDefault(currency);

        const cashHandshake = new ExchangeCashHandshake(wallet.chainId);

        let result = null;

        result = await cashHandshake.reject(hid, offChainId);

        console.log('handleRejectShakedOfferSuccess', result);
      }
    }

    this.hideLoading();
    this.props.showAlert({
      message: <div className="text-center"><FormattedMessage id="rejectOfferItemSuccessMassage" /></div>,
      timeOut: 2000,
      type: 'success',
      callBack: () => {
        // if (refreshPage) {
        //   refreshPage();
        // }
      },
    });
  }

  handleRejectShakedOfferFailed = (e) => {
    this.handleActionFailed(e);
  }

  // //////////////////////
  handleCancelShakeOffer = async () => {
    const { offer } = this;
    const { initUserId } = this.props;
    const { id, currency, type } = offer;

    if (currency === CRYPTO_CURRENCY.ETH) {
      if (type === EXCHANGE_ACTION.BUY) { // shop buy
        const wallet = MasterWallet.getWalletDefault(currency);
        const balance = await wallet.getBalance();
        const fee = await wallet.getFee();

        if (!this.checkMainNetDefaultWallet(wallet)) {
          return;
        }

        if (this.showNotEnoughCoinAlert(balance, 0, fee, currency)) {
          return;
        }
      }
    }

    this.showLoading();
    this.props.cancelOfferItem({
      PATH_URL: `${API_URL.EXCHANGE.OFFER_STORES}/${initUserId}/${API_URL.EXCHANGE.SHAKES}/${id}/cancel`,
      METHOD: 'POST',
      successFn: this.handleCancelShakeOfferSuccess,
      errorFn: this.handleCancelShakeOfferFailed,
    });
  }

  handleCancelShakeOfferSuccess = async (responseData) => {
    const { refreshPage } = this.props;
    const { data } = responseData;
    const offerShake = Offer.offer(data);
    const {
      hid, currency, type, offChainId,
    } = offerShake;

    console.log('handleCancelShakeOfferSuccess', responseData);

    // Update status to redux
    this.responseExchangeDataChange(offerShake);

    if (currency === CRYPTO_CURRENCY.ETH) {
      if (type === EXCHANGE_ACTION.BUY) { // shop buy
        const wallet = MasterWallet.getWalletDefault(currency);

        const cashHandshake = new ExchangeCashHandshake(wallet.chainId);

        let result = null;

        result = await cashHandshake.cancel(hid, offChainId);

        console.log('handleCancelShakeOfferSuccess', result);
      }
    }

    this.hideLoading();
    this.props.showAlert({
      message: <div className="text-center"><FormattedMessage id="cancelOfferItemSuccessMassage" /></div>,
      timeOut: 2000,
      type: 'success',
      callBack: () => {
        // if (refreshPage) {
        //   refreshPage();
        // }
      },
    });
  }

  handleCancelShakeOfferFailed = (e) => {
    this.handleActionFailed(e);
  }

  // //////////////////////

  handleCompleteShakedOffer = async () => {
    const { offer } = this;
    const { initUserId } = this.props;
    const {
 id, currency, type, freeStart
} = offer;

    if (currency === CRYPTO_CURRENCY.ETH) {
      if ((type === EXCHANGE_ACTION.SELL && this.userType === HANDSHAKE_USER.OWNER && !freeStart) ||
      (type === EXCHANGE_ACTION.BUY && this.userType === HANDSHAKE_USER.SHAKED)) {
        const wallet = MasterWallet.getWalletDefault(currency);
        const balance = await wallet.getBalance();
        const fee = await wallet.getFee();

        if (!this.checkMainNetDefaultWallet(wallet)) {
          return;
        }

        if (this.showNotEnoughCoinAlert(balance, 0, fee, currency)) {
          return;
        }
      }
    }

    this.showLoading();
    this.props.completeOfferItem({
      PATH_URL: `${API_URL.EXCHANGE.OFFER_STORES}/${initUserId}/${API_URL.EXCHANGE.SHAKES}/${id}/complete`,
      METHOD: 'POST',
      successFn: this.handleCompleteShakedOfferSuccess,
      errorFn: this.handleCompleteShakedOfferFailed,
    });
  }

  handleCompleteShakedOfferSuccess = async (responseData) => {
    const { offer } = this;
    const { initUserId, refreshPage } = this.props;
    const { data } = responseData;
    const offerShake = Offer.offer(data);
    const {
 hid, currency, type, offChainId, amount
} = offerShake;
    const { freeStart } = offer;

    console.log('handleDeleteOfferItemSuccess', responseData);

    // Update status to redux
    this.responseExchangeDataChange(offerShake);

    if (currency === CRYPTO_CURRENCY.ETH) {
      if ((type === EXCHANGE_ACTION.SELL && this.userType === HANDSHAKE_USER.OWNER && !freeStart) ||
        (type === EXCHANGE_ACTION.BUY && this.userType === HANDSHAKE_USER.SHAKED)) {
        const wallet = MasterWallet.getWalletDefault(currency);
        const cashHandshake = new ExchangeCashHandshake(wallet.chainId);
        let result = null;

        if (type === EXCHANGE_ACTION.SELL && this.userType === HANDSHAKE_USER.OWNER) {
          result = await cashHandshake.releasePartialFund(hid, offer.userAddress, amount, initUserId, offChainId);
        } else if (type === EXCHANGE_ACTION.BUY && this.userType === HANDSHAKE_USER.SHAKED) {
          result = await cashHandshake.finish(hid, offChainId);
        }

        console.log('handleCompleteShakedOfferSuccess', result);
      }
    }

    // console.log('data', data);
    this.hideLoading();
    this.props.showAlert({
      message: <div className="text-center"><FormattedMessage id="completeOfferItemSuccessMassage" /></div>,
      timeOut: 2000,
      type: 'success',
      callBack: () => {
        // if (refreshPage) {
        //   refreshPage();
        // }
      },
    });

    if (type === EXCHANGE_ACTION.BUY && this.userType === HANDSHAKE_USER.SHAKED) {
      this.rateRef.open();
    }
  }

  handleCompleteShakedOfferFailed = (e) => {
    this.handleActionFailed(e);
  }

  // //////////////////////

  handleAcceptShakedOffer = async () => {
    const { offer } = this;
    const { initUserId } = this.props;

    if (offer.currency === CRYPTO_CURRENCY.ETH) {
      if (offer.type === EXCHANGE_ACTION.BUY) {
        const wallet = MasterWallet.getWalletDefault(offer.currency);
        const balance = await wallet.getBalance();
        const fee = await wallet.getFee();

        if (!this.checkMainNetDefaultWallet(wallet)) {
          return;
        }

        if (this.showNotEnoughCoinAlert(balance, 0, fee, offer.currency)) {
          return;
        }
      }
    }

    this.showLoading();
    this.props.acceptOfferItem({
      PATH_URL: `${API_URL.EXCHANGE.OFFER_STORES}/${initUserId}/${API_URL.EXCHANGE.SHAKES}/${offer.id}/accept`,
      METHOD: 'POST',
      successFn: this.handleAcceptShakedOfferSuccess,
      errorFn: this.handleAcceptShakedOfferFailed,
    });
  }

  handleAcceptShakedOfferSuccess = async (responseData) => {
    console.log('handleDeleteOfferItemSuccess', responseData);
    const { refreshPage } = this.props;
    const { data } = responseData;
    const offerShake = Offer.offer(data);
    const {
      hid, currency, type, offChainId,
    } = offerShake;

    // Update status to redux
    this.responseExchangeDataChange(offerShake);

    if (currency === CRYPTO_CURRENCY.ETH) {
      if (type === EXCHANGE_ACTION.BUY) {
        const wallet = MasterWallet.getWalletDefault(currency);

        const cashHandshake = new ExchangeCashHandshake(wallet.chainId);

        const result = await cashHandshake.shake(hid, offChainId);

        console.log('handleAcceptShakedOfferSuccess', result);
      }
    }

    // console.log('data', data);
    this.hideLoading();
    this.props.showAlert({
      message: <div className="text-center"><FormattedMessage id="acceptOfferItemSuccessMassage" /></div>,
      timeOut: 2000,
      type: 'success',
      callBack: () => {
        // if (refreshPage) {
        //   refreshPage();
        // }
      },
    });
  }

  handleAcceptShakedOfferFailed = (e) => {
    this.handleActionFailed(e);
  }

  // /End Offer store shake
  // //////////////////////

  handleActionFailed = (e) => {
    this.hideLoading();
    this.props.showAlert({
      message: <div className="text-center">{getErrorMessageFromCode(e)}</div>,
      timeOut: 3000,
      type: 'danger',
      callBack: () => {
        // this.props.history.push(URL.HANDSHAKE_ME);
      },
    });
  }

  getMessageMovingCoin = () => {
    const { status } = this.props;
    const { offer } = this;

    let idMessage = '';

    switch (offer.feedType) {
      case EXCHANGE_FEED_TYPE.INSTANT: {
        switch (status) {
          case HANDSHAKE_EXCHANGE_CC_STATUS.PROCESSING: {
            idMessage = 'movingCoinFromEscrow';
            break;
          }
          default: {
            // code
            break;
          }
        }
        break;
      }
      case EXCHANGE_FEED_TYPE.OFFER_STORE: {
        switch (status) {
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_STATUS.CREATED: {
            idMessage = 'ex.shop.explanation.created';
            break;
          }
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_STATUS.ACTIVE: {
            idMessage = 'ex.shop.explanation.active';
            break;
          }
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_STATUS.CLOSING: {
            idMessage = 'ex.shop.explanation.closing';
            break;
          }
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_STATUS.CLOSED: {
            break;
          }
          default: {
            // code
            break;
          }
        }

        break;
      }
      case EXCHANGE_FEED_TYPE.OFFER_STORE_SHAKE: {
        switch (status) {
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.CANCELLING: {
            idMessage = 'ex.shop.explanation.cancelling';
            break;
          }
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.REJECTING: {
            idMessage = 'ex.shop.explanation.rejecting';
            break;
          }
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.PRE_SHAKING: {
            if (this.userType === HANDSHAKE_USER.SHAKED) {
              idMessage = 'ex.shop.explanation.pre_shaking';
            }
            break;
          }
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.PRE_SHAKE: {
            if (this.userType === HANDSHAKE_USER.SHAKED) {
              idMessage = 'ex.shop.explanation.pre_shake';
            }
            break;
          }
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.SHAKING: {
            if (this.userType === HANDSHAKE_USER.SHAKED) {
              idMessage = 'ex.shop.explanation.shaking';
            }
            break;
          }
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.SHAKE: {
            switch (this.userType) {
              case HANDSHAKE_USER.NORMAL: {
                break;
              }
              case HANDSHAKE_USER.SHAKED: { // user shake
                if (offer.type === EXCHANGE_ACTION.SELL) { // shop sell
                  idMessage = 'ex.shop.explanation.shake';
                }
                break;
              }
              case HANDSHAKE_USER.OWNER: { // shop
                if (offer.type === EXCHANGE_ACTION.BUY) { // shop buy
                  idMessage = 'ex.shop.explanation.shake';
                }
                break;
              }
              default: {
                // code
                break;
              }
            }
          }
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.COMPLETING: {
            switch (this.userType) {
              case HANDSHAKE_USER.NORMAL: {
                break;
              }
              case HANDSHAKE_USER.SHAKED: { // user shake
                if (offer.type === EXCHANGE_ACTION.SELL) { // shop sell
                  idMessage = 'ex.shop.explanation.completing';
                }
                break;
              }
              case HANDSHAKE_USER.OWNER: { // shop
                if (offer.type === EXCHANGE_ACTION.BUY) { // shop buy
                  idMessage = 'ex.shop.explanation.completing';
                }
                break;
              }
              default: {
                // code
                break;
              }
            }

            break;
          }
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.REJECTED:
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.CANCELLED:
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.COMPLETED: {
            break;
          }
          default: {
            // code
            break;
          }
        }

        break;
      }
      case EXCHANGE_FEED_TYPE.EXCHANGE: {
        switch (status) {
          case HANDSHAKE_EXCHANGE_STATUS.CREATED:
          case HANDSHAKE_EXCHANGE_STATUS.SHAKING:
          case HANDSHAKE_EXCHANGE_STATUS.COMPLETING: {
            switch (this.userType) {
              case HANDSHAKE_USER.NORMAL: {
                break;
              }
              case HANDSHAKE_USER.SHAKED: { // user shake
                if (offer.type === EXCHANGE_ACTION.BUY) { // shop buy
                  idMessage = 'movingCoinToEscrow';
                }
                break;
              }
              case HANDSHAKE_USER.OWNER: { // shop
                if (offer.type === EXCHANGE_ACTION.SELL) { // shop sell
                  idMessage = 'movingCoinToEscrow';
                }
                break;
              }
              default: {
                // code
                break;
              }
            }

            break;
          }

          case HANDSHAKE_EXCHANGE_STATUS.CLOSING:
          case HANDSHAKE_EXCHANGE_STATUS.REJECTING: {
            switch (this.userType) {
              case HANDSHAKE_USER.NORMAL: {
                break;
              }
              case HANDSHAKE_USER.SHAKED: { // user shake
                if (offer.type === EXCHANGE_ACTION.BUY) { // shop buy
                  idMessage = 'movingCoinFromEscrow';
                }
                break;
              }
              case HANDSHAKE_USER.OWNER: { // shop
                if (offer.type === EXCHANGE_ACTION.SELL) { // shop sell
                  idMessage = 'movingCoinFromEscrow';
                }
                break;
              }
              default: {
                // code
                break;
              }
            }
            break;
          }

          case HANDSHAKE_EXCHANGE_STATUS.ACTIVE:
          case HANDSHAKE_EXCHANGE_STATUS.CLOSED:
          case HANDSHAKE_EXCHANGE_STATUS.SHAKE:
          case HANDSHAKE_EXCHANGE_STATUS.COMPLETED:
          case HANDSHAKE_EXCHANGE_STATUS.REJECTED: {
            break;
          }
          default: {
            // code
            break;
          }
        }
        break;
      }
      default: {
        // code
        break;
      }
    }

    let message = '';
    if (idMessage) {
      message = <FormattedMessage id={idMessage} values={{}} />;
    }

    return message;
  }

  render() {
    const {
 initUserId, shakeUserIds, extraData, location, state, status, mode = 'discover', ipInfo: { latitude, longitude, country }, initAt, review, reviewCount, ...props
 } = this.props;

    const offer = Offer.offer(JSON.parse(extraData));

    this.offer = offer;
    // const offer = this.offer;

    // console.log('render',offer);
    // const {listOfferPrice} = this.props;
    // console.log('review, reviewCount',review, reviewCount);
    const modalContent = this.state.modalContent;

    let email = '';
    let statusText = '';
    let message = '';
    const message2 = '';
    let actionButtons = null;
    let from = <FormattedMessage id="ex.me.label.from" />;
    let showChat = false;
    let chatUsername = '';
    // let buyerSeller = this.getBuyerSeller();
    let nameShop = offer.username;

    switch (offer.feedType) {
      case EXCHANGE_FEED_TYPE.INSTANT: {
        email = APP_USER_NAME;
        statusText = HANDSHAKE_EXCHANGE_CC_STATUS_NAME[status];
        let just = ' ';

        const hours = Math.abs(Date.now() - (initAt * 1000)) / 36e5;

        if (hours < 4) {
          just = ' just ';
        }

        const fiatAmount = this.calculateFiatAmount(offer);

        message = (<FormattedMessage
          id="instantOfferHandShakeContent"
          values={{
          just,
          offerType: 'bought',
          amount: formatAmountCurrency(offer.amount),
          currency: offer.currency,
          currency_symbol: offer.fiatCurrency,
          total: formatMoneyByLocale(fiatAmount, offer.fiatCurrency),
          fee: offer.feePercentage,
        }}
        />);

        actionButtons = null;
        break;
      }
      case EXCHANGE_FEED_TYPE.OFFER_STORE: {
        email = this.getEmailOfferStore();
        const statusValue = HANDSHAKE_EXCHANGE_SHOP_OFFER_STATUS_VALUE[offer.status];
        statusText = HANDSHAKE_EXCHANGE_SHOP_OFFER_STATUS_NAME[statusValue];

        message = this.getContentOfferStore();

        actionButtons = this.getActionButtonsOfferStore();

        break;
      }
      case EXCHANGE_FEED_TYPE.OFFER_STORE_SHAKE: {
        from = <FormattedMessage id="ex.me.label.with" />;
        email = this.getEmail();
        statusText = HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS_NAME[status];

        switch (status) {
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.PRE_SHAKING:
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.PRE_SHAKE:
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.SHAKING:
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.SHAKE:
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.COMPLETING:
          case HANDSHAKE_EXCHANGE_SHOP_OFFER_SHAKE_STATUS.COMPLETED: {
            chatUsername = this.getChatUserName();

            showChat = chatUsername.length > 0;

            break;
          }
          default: {
            // code
            break;
          }
        }

        const fiatAmount = this.calculateFiatAmount(offer);

        message = this.getContent(fiatAmount);

        actionButtons = this.getActionButtons();
        break;
      }
      case EXCHANGE_FEED_TYPE.EXCHANGE: {
        statusText = HANDSHAKE_EXCHANGE_STATUS_NAME[status];
        nameShop = <FormattedMessage id="ex.me.label.about" />;
        from = this.getFromExchange();
        email = this.getEmail();

        message = this.getContentExchange();

        switch (status) {
          case HANDSHAKE_EXCHANGE_STATUS.PRE_SHAKING:
          case HANDSHAKE_EXCHANGE_STATUS.PRE_SHAKE:
          case HANDSHAKE_EXCHANGE_STATUS.SHAKING:
          case HANDSHAKE_EXCHANGE_STATUS.SHAKE:
          case HANDSHAKE_EXCHANGE_STATUS.COMPLETING:
          case HANDSHAKE_EXCHANGE_STATUS.COMPLETED: {
            chatUsername = this.getChatUserName();

            showChat = chatUsername.length > 0;

            break;
          }
          default: {
            // code
            break;
          }
        }

        actionButtons = this.getActionButtonsExchange();
        break;
      }
      default: {
        // code
        break;
      }
    }

    /* const phone = offer.contactPhone; */
    const address = offer.contactInfo;


    let distanceKm = 0;

    if (location) {
      const latLng = location.split(',');
      distanceKm = getDistanceFromLatLonInKm(latitude, longitude, latLng[0], latLng[1]);
    }
    const isCreditCard = offer.feedType === EXCHANGE_FEED_TYPE.INSTANT;

    const phone = offer.contactPhone;
    const phoneDisplayed = phone.replace(/-/g, '');

    const messageMovingCoin = this.getMessageMovingCoin();

    // if (mode === 'me) {
    //   return (
    //     <FeedMeExchangeLocal />
    //   )
    // }

    return (
      <div className="feed-me-exchange">
        {/* <div>id: {this.offer.id}</div> */}
        {/* <div>userType: {this.userType}</div> */}
        {/* <div>status: {status}</div> */}
        <div className="mb-1">
          <span style={{ color: '#C8C7CC' }}>{from}</span> <span style={{ color: '#666666' }}>{email}</span>
          <span className="float-right" style={{ color: '#4CD964' }}>{statusText}</span>
        </div>
        <Feed
          className="feed text-white"
          // background={`${mode === 'discover' ? '#FF2D55' : '#50E3C2'}`}
          background="linear-gradient(-225deg, #EE69FF 0%, #955AF9 100%)"
        >
          <div className="d-flex mb-4">
            <div className="headline">{message}</div>
            {
              !isCreditCard && showChat && (
                <div className="ml-auto pl-2 pt-2" style={{ width: '50px' }}>                {/* to-do chat link */}
                  <Link to={`${URL.HANDSHAKE_CHAT_INDEX}/${chatUsername}`}>
                    <img src={iconChat} width="35px" alt="" />
                  </Link>
                </div>
              )
            }

          </div>

          <div className="mb-1 name-shop">{nameShop}</div>
          {/*
          {
            phone && phone.split('-')[1] !== '' && ( // no phone number
              <div className="media mb-1 detail">
                <img className="mr-2" src={iconPhone} width={20}/>
                <div className="media-body">
                  <div><a href={`tel:${phoneDisplayed}`} className="text-white">{phoneDisplayed}</a></div>
                </div>
              </div>
            )
          }

          <div className="media mb-1 detail">
            <img className="mr-2" src={iconLocation} width={20}/>
            <div className="media-body">
              <div>{address}</div>
            </div>
          </div>
          */}

          {
            phone && phone.split('-')[1] !== '' && ( // no phone number
              <div className="media mb-1 detail">
                <img className="mr-2" src={iconPhone} width={20} alt="" />
                <div className="media-body">
                  <div><a href={`tel:${phoneDisplayed}`} className="text-white">{phoneDisplayed}</a></div>
                </div>
              </div>
            )
          }
          {
            address && (
              <div className="media mb-1 detail">
                <img className="mr-2" src={iconLocation} width={20} alt="" />
                <div className="media-body">
                  <div>{address}</div>
                </div>
              </div>
            )
          }
          { messageMovingCoin && (<div className="mt-2">{messageMovingCoin}</div>) }

          {/*
            !isCreditCard && (
              <div className="media detail">
                <img className="mr-2" src={iconLocation} width={20} />
                <div className="media-body">
                  <div>
                    <FormattedMessage id="offerDistanceContent" values={{
                      // offerType: offer.type === 'buy' ? 'Buyer' : 'Seller',
                      distance: getLocalizedDistance(distanceKm, country_code)
                      // distanceKm: distanceKm > 1 || distanceMiles === 0 ? distanceKm.toFixed(0) : distanceKm.toFixed(3),
                      // distanceMiles: distanceMiles === 0 ? distanceKm.toFixed(0) : distanceMiles.toFixed(1),
                    }}/>
                  </div>
                </div>
              </div>
            )
          */}
        </Feed>
        {/* <Button block className="mt-2">Accept</Button> */}
        {actionButtons}
        <ModalDialog onRef={modal => this.modalRef = modal}>
          {modalContent}
        </ModalDialog>
        <Rate onRef={e => this.rateRef = e} startNum={5} onSubmit={this.handleSubmitRating} ratingOnClick={this.handleOnClickRating} />
      </div>
    );
  }
}

FeedMe.propTypes = {
  className: PropTypes.string,
  background: PropTypes.string,
};

const mapState = state => ({
  discover: state.discover,
  listOfferPrice: state.exchange.listOfferPrice,
  ipInfo: state.app.ipInfo,
  authProfile: state.auth.profile,
});

const mapDispatch = ({
  shakeOffer,
  closeOffer,
  completeShakedOffer,
  cancelShakedOffer,
  withdrawShakedOffer,
  showAlert,
  updateOfferStatus,
  showLoading,
  hideLoading,

  rejectOfferItem,
  completeOfferItem,
  cancelOfferItem,
  acceptOfferItem,
  deleteOfferItem,
  responseExchangeDataChange,
  reviewOffer,
  acceptOffer,
  cancelOffer,
});

export default injectIntl(connect(mapState, mapDispatch)(FeedMe));
