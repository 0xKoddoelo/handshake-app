export const EXCHANGE_ACTIONS = {
  GET_CRYPTO_PRICE: 'GET_CRYPTO_PRICE',
  GET_CRYPTO_PRICE_SUCCESS: 'GET_CRYPTO_PRICE_SUCCESS',
  GET_CRYPTO_PRICE_FAILED: 'GET_CRYPTO_PRICE_FAILED',

  CREATE_CC_ORDER: 'CREATE_CC_ORDER',
  CREATE_CC_ORDER_SUCCESS: 'CREATE_CC_ORDER_SUCCESS',
  CREATE_CC_ORDER_FAILED: 'CREATE_CC_ORDER_FAILED',

  GET_USER_CC_LIMIT: 'GET_USER_CC_LIMIT',
  GET_USER_CC_LIMIT_SUCCESS: 'GET_USER_CC_LIMIT_SUCCESS',
  GET_USER_CC_LIMIT_FAILED: 'GET_USER_CC_LIMIT_FAILED',

  GET_CC_LIMITS: 'GET_CC_LIMITS',
  GET_CC_LIMITS_SUCCESS: 'GET_CC_LIMITS_SUCCESS',
  GET_CC_LIMITS_FAILED: 'GET_CC_LIMITS_FAILED',

  GET_USER_PROFILE: 'GET_USER_PROFILE',
  GET_USER_PROFILE_SUCCESS: 'GET_USER_PROFILE_SUCCESS',
  GET_USER_PROFILE_FAILED: 'GET_USER_PROFILE_FAILED',

  GET_USER_TRANSACTION: 'GET_USER_TRANSACTION',
  GET_USER_TRANSACTION_SUCCESS: 'GET_USER_TRANSACTION_SUCCESS',
  GET_USER_TRANSACTION_FAILED: 'GET_USER_TRANSACTION_FAILED',
};

import { HANDSHAKE_API } from '@/config';
import { createAPI } from '@/reducers/action';

export const getCryptoPrice = createAPI({
  API: HANDSHAKE_API.EXCHANGE.GET_CRYPTO_PRICE,
  INIT: EXCHANGE_ACTIONS.GET_CRYPTO_PRICE,
  SUCCESS: EXCHANGE_ACTIONS.GET_CRYPTO_PRICE_SUCCESS,
  FAILED: EXCHANGE_ACTIONS.GET_CRYPTO_PRICE_FAILED
});

export const createCCOrder = createAPI({
  API: HANDSHAKE_API.EXCHANGE.CREATE_CC_ORDER,
  INIT: EXCHANGE_ACTIONS.CREATE_CC_ORDER,
  SUCCESS: EXCHANGE_ACTIONS.CREATE_CC_ORDER_SUCCESS,
  FAILED: EXCHANGE_ACTIONS.CREATE_CC_ORDER_FAILED
});

export const getUserCcLimit = createAPI({
  API: HANDSHAKE_API.EXCHANGE.GET_USER_CC_LIMIT,
  INIT: EXCHANGE_ACTIONS.GET_USER_CC_LIMIT,
  SUCCESS: EXCHANGE_ACTIONS.GET_USER_CC_LIMIT_SUCCESS,
  FAILED: EXCHANGE_ACTIONS.GET_USER_CC_LIMIT_FAILED
});

export const getCcLimits = createAPI({
  API: HANDSHAKE_API.EXCHANGE.GET_CC_LIMITS,
  INIT: EXCHANGE_ACTIONS.GET_CC_LIMITS,
  SUCCESS: EXCHANGE_ACTIONS.GET_CC_LIMITS_SUCCESS,
  FAILED: EXCHANGE_ACTIONS.GET_CC_LIMITS_FAILED
});

export const getUserProfile = createAPI({
  API: HANDSHAKE_API.EXCHANGE.GET_USER_PROFILE,
  INIT: EXCHANGE_ACTIONS.GET_USER_PROFILE,
  SUCCESS: EXCHANGE_ACTIONS.GET_USER_PROFILE_SUCCESS,
  FAILED: EXCHANGE_ACTIONS.GET_USER_PROFILE_FAILED
});

export const getUserTransaction = createAPI({
  API: HANDSHAKE_API.EXCHANGE.GET_USER_TRANSACTION,
  INIT: EXCHANGE_ACTIONS.GET_USER_TRANSACTION,
  SUCCESS: EXCHANGE_ACTIONS.GET_USER_TRANSACTION_SUCCESS,
  FAILED: EXCHANGE_ACTIONS.GET_USER_TRANSACTION_FAILED
});


