// import { BASE_API } from '@/constants';
import { createAPI } from '@/reducers/action';

export const EXCHANGE_ACTIONS = {
  GET_FIAT_CURRENCY: 'GET_FIAT_CURRENCY',
  GET_CRYPTO_PRICE: 'GET_CRYPTO_PRICE',
  GET_CRYPTO_PRICE_FOR_PACKAGE: 'GET_CRYPTO_PRICE_FOR_PACKAGE',
  CREATE_CC_ORDER: 'CREATE_CC_ORDER',
  GET_USER_CC_LIMIT: 'GET_USER_CC_LIMIT',
  GET_CC_LIMITS: 'GET_CC_LIMITS',
  GET_USER_PROFILE: 'GET_USER_PROFILE',
  GET_OFFER_PRICE: 'GET_OFFER_PRICE',
  GET_LIST_OFFER_PRICE: 'GET_LIST_OFFER_PRICE',
  GET_USER_TRANSACTION: 'GET_USER_TRANSACTION',
  CREATE_OFFER: 'CREATE_OFFER',
  GET_LIST_OFFERS: 'GET_LIST_OFFERS',
  GET_OFFER: 'GET_OFFER',
  CLOSE_OFFER: 'CLOSE_OFFER',
  SHAKE_OFFER: 'SHAKE_OFFER',
  COMPLETE_SHAKE_OFFER: 'COMPLETE_SHAKE_OFFER',
  CANCEL_SHAKE_OFFER: 'CANCEL_SHAKE_OFFER',
  WITHDRAW_SHAKE_OFFER: 'WITHDRAW_SHAKE_OFFER',
  ACCEPT_OFFER: 'ACCEPT_OFFER',
  CANCEL_OFFER: 'CANCEL_OFFER',

  GET_IP_INFORM: 'GET_IP_INFORM',

  // Store
  CREATE_OFFER_STORES: 'CREATE_OFFER_STORES',
  ADD_OFFER_ITEM: 'ADD_OFFER_ITEM',
  DELETE_OFFER_ITEM: 'DELETE_OFFER_ITEM',
  SHAKE_OFFER_ITEM: 'SHAKE_OFFER_ITEM',
  ACCEPT_OFFER_ITEM: 'ACCEPT_OFFER_ITEM',
  REJECT_OFFER_ITEM: 'REJECT_OFFER_ITEM',
  COMPLETE_OFFER_ITEM: 'COMPLETE_OFFER_ITEM',
  CANCEL_OFFER_ITEM: 'CANCEL_OFFER_ITEM',
  GET_OFFER_STORES: 'GET_OFFER_STORES',
  REVIEW_OFFER: 'REVIEW_OFFER',

  GET_FREE_START_INFO: 'GET_FREE_START_INFO',
  SET_FREE_START: 'SET_FREE_START',
  TRACKING_ONCHAIN: 'TRACKING_ONCHAIN',
  TRACKING_TRANSFER: 'TRACKING_TRANSFER',
  GET_DASHBOARD_INFO: 'GET_DASHBOARD_INFO',
  OFFER_ITEM_REFILL: 'OFFER_ITEM_REFILL',
  UPDATE_OFFER_STORES: 'UPDATE_OFFER_STORES',
  TRACKING_LOCATION: 'TRACKING_LOCATION',
  GET_REFERAL_INFO: 'GET_REFERAL_INFO',
  GET_CREDIT_ATM: 'GET_CREDIT_ATM',
  CREATE_CREDIT_ATM: 'CREATE_CREDIT_ATM',
  DEPOSIT_COIN_ATM: 'DEPOSIT_COIN_ATM',
  TRACKING_DEPOSIT_COIN_ATM: 'TRACKING_DEPOSIT_COIN_ATM',
  DEACTIVE_DEPOSIT_COIN_ATM: 'DEACTIVE_DEPOSIT_COIN_ATM',
  WITHDRAW_CASH_DEPOSIT_ATM: 'WITHDRAW_CASH_DEPOSIT_ATM',
  GET_TRANSACTION_CREDIT_ATM: 'GET_TRANSACTION_CREDIT_ATM',
  FIREBASE_CREDITS_DATA_CHANGE: 'FIREBASE_CREDITS_DATA_CHANGE',

  //Cash - ATM
  GET_CASH_ATM: 'GET_CASH_ATM',
  CREATE_CASH_ATM: 'CREATE_CASH_ATM',
  DELETE_CASH_ATM: 'DELETE_CASH_ATM',
  DEPOSIT_CASH_ATM: 'DEPOSIT_CASH_ATM',
  TRACKING_DEPOSIT_CASH_ATM: 'TRACKING_DEPOSIT_CASH_ATM',
  WITHDRAW_DEPOSIT_CASH_ATM: 'WITHDRAW_DEPOSIT_CASH_ATM',

  //Store - ATM
  GET_STORE_ATM: 'GET_STORE_ATM',
  CREATE_STORE_ATM: 'CREATE_STORE_ATM',
  UPDATE_STORE_ATM: 'UPDATE_STORE_ATM',
  GET_CRYPTO_PRICE_STORE_ATM: 'GET_CRYPTO_PRICE_STORE_ATM',
  COMPLETE_ORDER_STORE_ATM: 'COMPLETE_ORDER_STORE_ATM',
  DELETE_ORDER_STORE_ATM: 'DELETE_ORDER_STORE_ATM',
};

export const getFiatCurrency = createAPI(EXCHANGE_ACTIONS.GET_FIAT_CURRENCY);

export const getCryptoPrice = createAPI(EXCHANGE_ACTIONS.GET_CRYPTO_PRICE);
export const getCryptoPriceForPackage = createAPI(EXCHANGE_ACTIONS.GET_CRYPTO_PRICE_FOR_PACKAGE);

export const createCCOrder = createAPI(EXCHANGE_ACTIONS.CREATE_CC_ORDER);

export const getUserCcLimit = createAPI(EXCHANGE_ACTIONS.GET_USER_CC_LIMIT);

export const getCcLimits = createAPI(EXCHANGE_ACTIONS.GET_CC_LIMITS);

export const getUserProfile = createAPI(EXCHANGE_ACTIONS.GET_USER_PROFILE);

export const getOfferPrice = createAPI(EXCHANGE_ACTIONS.GET_OFFER_PRICE);

export const getListOfferPrice = createAPI(EXCHANGE_ACTIONS.GET_LIST_OFFER_PRICE);

export const getUserTransaction = createAPI(EXCHANGE_ACTIONS.GET_USER_TRANSACTION);

export const createOffer = createAPI(EXCHANGE_ACTIONS.CREATE_OFFER);

export const getListOffers = createAPI(EXCHANGE_ACTIONS.GET_LIST_OFFERS);

export const getOffer = createAPI(EXCHANGE_ACTIONS.GET_OFFER);

export const shakeOffer = createAPI(EXCHANGE_ACTIONS.SHAKE_OFFER);

export const closeOffer = createAPI(EXCHANGE_ACTIONS.CREATE_OFFER);

export const completeShakedOffer = createAPI(EXCHANGE_ACTIONS.COMPLETE_SHAKE_OFFER);

export const cancelShakedOffer = createAPI(EXCHANGE_ACTIONS.CANCEL_SHAKE_OFFER);

export const withdrawShakedOffer = createAPI(EXCHANGE_ACTIONS.WITHDRAW_SHAKE_OFFER);

export const acceptOffer = createAPI(EXCHANGE_ACTIONS.ACCEPT_OFFER);
export const cancelOffer = createAPI(EXCHANGE_ACTIONS.CANCEL_OFFER);

// Store
export const createOfferStores = createAPI(EXCHANGE_ACTIONS.CREATE_OFFER_STORES);
export const addOfferItem = createAPI(EXCHANGE_ACTIONS.ADD_OFFER_ITEM);
export const deleteOfferItem = createAPI(EXCHANGE_ACTIONS.DELETE_OFFER_ITEM);
export const shakeOfferItem = createAPI(EXCHANGE_ACTIONS.SHAKE_OFFER_ITEM);
export const acceptOfferItem = createAPI(EXCHANGE_ACTIONS.ACCEPT_OFFER_ITEM);
export const rejectOfferItem = createAPI(EXCHANGE_ACTIONS.REJECT_OFFER_ITEM);
export const completeOfferItem = createAPI(EXCHANGE_ACTIONS.COMPLETE_OFFER_ITEM);
export const cancelOfferItem = createAPI(EXCHANGE_ACTIONS.CANCEL_OFFER_ITEM);
export const getOfferStores = createAPI(EXCHANGE_ACTIONS.GET_OFFER_STORES);
export const reviewOffer = createAPI(EXCHANGE_ACTIONS.REVIEW_OFFER);

export const getFreeStartInfo = createAPI(EXCHANGE_ACTIONS.GET_FREE_START_INFO);
export const setFreeStart = data => ({ type: EXCHANGE_ACTIONS.SET_FREE_START, payload: data });
export const trackingOnchain = createAPI(EXCHANGE_ACTIONS.TRACKING_ONCHAIN);
export const trackingTransfer = createAPI(EXCHANGE_ACTIONS.TRACKING_TRANSFER);
export const getDashboardInfo = createAPI(EXCHANGE_ACTIONS.GET_DASHBOARD_INFO);
export const updateOfferStores = createAPI(EXCHANGE_ACTIONS.UPDATE_OFFER_STORES);
export const offerItemRefill = createAPI(EXCHANGE_ACTIONS.OFFER_ITEM_REFILL);
export const trackingLocation = createAPI(EXCHANGE_ACTIONS.TRACKING_LOCATION);
export const getReferalInfo = createAPI(EXCHANGE_ACTIONS.GET_REFERAL_INFO);
export const getCreditATM = createAPI(EXCHANGE_ACTIONS.GET_CREDIT_ATM);
export const createCreditATM = createAPI(EXCHANGE_ACTIONS.CREATE_CREDIT_ATM);
export const depositCoinATM = createAPI(EXCHANGE_ACTIONS.DEPOSIT_COIN_ATM);
export const trackingDepositCoinATM = createAPI(EXCHANGE_ACTIONS.TRACKING_DEPOSIT_COIN_ATM);
export const deactiveDepositCoinATM = createAPI(EXCHANGE_ACTIONS.DEACTIVE_DEPOSIT_COIN_ATM);
export const withdrawCashDepositATM = createAPI(EXCHANGE_ACTIONS.WITHDRAW_CASH_DEPOSIT_ATM);
export const getTransactionCreditATM = createAPI(EXCHANGE_ACTIONS.GET_TRANSACTION_CREDIT_ATM);

//Cash - ATM
export const getCashATM = createAPI(EXCHANGE_ACTIONS.GET_CASH_ATM);
export const createCashATM = createAPI(EXCHANGE_ACTIONS.CREATE_CASH_ATM);
export const deleteCashATM = createAPI(EXCHANGE_ACTIONS.DELETE_CASH_ATM);
export const depositCashATM = createAPI(EXCHANGE_ACTIONS.DEPOSIT_CASH_ATM);
export const trackingDepositCashATM = createAPI(EXCHANGE_ACTIONS.TRACKING_DEPOSIT_CASH_ATM);
export const withdrawDepositCashATM = createAPI(EXCHANGE_ACTIONS.WITHDRAW_DEPOSIT_CASH_ATM);

//Store - ATM
export const getStoreATM = createAPI(EXCHANGE_ACTIONS.GET_STORE_ATM);
export const createStoreATM = createAPI(EXCHANGE_ACTIONS.CREATE_STORE_ATM);
export const updateStoreATM = createAPI(EXCHANGE_ACTIONS.UPDATE_STORE_ATM);
export const getCryptoPriceStoreATM = createAPI(EXCHANGE_ACTIONS.GET_CRYPTO_PRICE_STORE_ATM);
export const comppleteOrderStoreATM = createAPI(EXCHANGE_ACTIONS.COMPLETE_ORDER_STORE_ATM);
export const deleteOrderStoreATM = createAPI(EXCHANGE_ACTIONS.DELETE_ORDER_STORE_ATM);


export const fireBaseCreditsDataChange = data => ({
  type: EXCHANGE_ACTIONS.FIREBASE_CREDITS_DATA_CHANGE,
  payload: data,
});
