export const CRYPTOSIGN_MINIMUM_MONEY = 0.00002;
export const PERCENT_DISPUTE = 0.05;
export const BET_BLOCKCHAIN_STATUS = {
  STATUS_DISPUTE_PENDING: -14,
  STATUS_REFUND_PENDING: -13,
  STATUS_MAKER_SHOULD_UNINIT: -12,
  STATUS_INIT_FAILED: -10,
  STATUS_COLLECT_FAILED: -9,
  STATUS_COLLECT_PENDING: -8,
  STATUS_DISPUTE_FAILED: -7,
  STATUS_REFUND_FAILED: -6,
  STATUS_MAKER_UNINIT_FAILED: -5,
  STATUS_MAKER_UNINIT_PENDING: -4,

  STATUS_SHAKER_ROLLBACK: -3,
  STATUS_MAKER_INIT_ROLLBACK: -2,


  STATUS_INIT_PENDING: -1,
  STATUS_INITED: 0,
  STATUS_MAKER_UNINITED: 1,
  STATUS_SHAKER_SHAKED: 2,
  STATUS_REFUNDED: 3,
  STATUS_USER_DISPUTED: 7,
  STATUS_DISPUTED: 4,
  STATUS_RESOLVED: 5,
  STATUS_DONE: 6,
};

export const ROLE = {
  INITER: 1,
  SHAKER: 2,
};

export const SIDE = {
  SUPPORT: 1,
  // AGAINST: 2,
  OPPOSE: 2,
};
export const BET_TYPE = {
  INIT: 'init',
  SHAKE: 'shake',
};
export const BETTING_RESULT = {
  DISPUTED: -3,
  INITED: -1,
  DISPUTE_PENDING: -4,
  DRAW: 3,
  SUPPORT_WIN: 1,
  AGAINST_WIN: 2,
};

export const CONTRACT_METHOD = {
  INIT: 'init',
  SHAKE: 'shake',
  CANCEL: 'uninit',
  REFUND: 'refund',
  DISPUTE: 'dispute',
  COLLECT: 'collect',
  REPORT: 'report',
  CREATE_MARKET: 'createMarket',
};
