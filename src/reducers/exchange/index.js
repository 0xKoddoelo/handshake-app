import CcLimit from '@/models/CcLimit';
import UserCcLimit from '@/models/UserCcLimit';
import UserProfile from '@/models/UserProfile';
import CryptoPrice from '@/models/CryptoPrice';
import OfferPrice from '@/models/OfferPrice';
import OfferShop from '@/models/OfferShop';
import { EXCHANGE_ACTIONS } from './action';
import { EXCHANGE_ACTION } from '@/constants';
import Dashboard from '@/models/Dashboard';
import Referal from '@/models/Referal';
import Deposit from '@/models/Deposit';
import Handshake from '@/models/Handshake';

const initListOfferPrice = [];
initListOfferPrice.updatedAt = Date.now();
const initDepositInfo = {};
initDepositInfo.updatedAt = Date.now();

const handleListPayload = (payload) => {
  const result = [];
  payload.map((handshake) => {
    result.push(Handshake.handshake(handshake));
  });

  return result;
};

function exchangeReducter(state = {
  listOfferPrice: initListOfferPrice,
  isChooseFreeStart: false,
  depositInfo: initDepositInfo,
}, action) {
  // console.log('exchangeReducter', JSON.stringify(action));
  switch (action.type) {
    case `${EXCHANGE_ACTIONS.GET_CRYPTO_PRICE}_SUCCESS`: {
      return { ...state, cryptoPrice: CryptoPrice.cryptoPrice(action.payload.data) };
    }
    case `${EXCHANGE_ACTIONS.GET_USER_CC_LIMIT}_SUCCESS`: {
      return { ...state, userCcLimit: UserCcLimit.userCcLimit(action.payload.data) };
    }
    case `${EXCHANGE_ACTIONS.GET_CC_LIMITS}_SUCCESS`: {
      return { ...state, ccLimits: action.payload.data.map(ccLimit => CcLimit.ccLimit(ccLimit)) };
    }
    case `${EXCHANGE_ACTIONS.GET_USER_PROFILE}_SUCCESS`: {
      return { ...state, userProfile: UserProfile.userProfile(action.payload.data) };
    }
    case `${EXCHANGE_ACTIONS.GET_OFFER_PRICE}_SUCCESS`: {
      return { ...state, offerPrice: OfferPrice.offerPrice(action.payload.data) };
    }
    case `${EXCHANGE_ACTIONS.GET_USER_TRANSACTION}_SUCCESS`: {
      return { ...state, userTransaction: action.payload };
    }
    case `${EXCHANGE_ACTIONS.GET_LIST_OFFER_PRICE}_SUCCESS`: {
      const listOfferPrice = action.payload.data.map((offerPrice) => {
        const price = OfferPrice.offerPrice(offerPrice);

        price.type = price.type === EXCHANGE_ACTION.SELL ? EXCHANGE_ACTION.BUY : EXCHANGE_ACTION.SELL;

        return price;
      });
      listOfferPrice.updatedAt = Date.now();
      return {
        ...state,
        listOfferPrice,
      };
    }
    case `${EXCHANGE_ACTIONS.GET_IP_INFORM}_SUCCESS`: {
      return { ...state, ipInfo: action.payload.data };
    }
    case `${EXCHANGE_ACTIONS.GET_OFFER_STORES}_SUCCESS`: {
      return { ...state, offerStores: OfferShop.offerShop(action.payload.data) };
    }
    case `${EXCHANGE_ACTIONS.GET_FREE_START_INFO}_SUCCESS`: {
      return { ...state, freeStartInfo: action.payload.data };
    }
    case `${EXCHANGE_ACTIONS.SET_FREE_START}`: {
      return { ...state, isChooseFreeStart: action.payload.data };
    }
    case `${EXCHANGE_ACTIONS.GET_DASHBOARD_INFO}_SUCCESS`: {
      return { ...state, dashboardInfo: Dashboard.dashboard(action.payload.data) };
    }
    case `${EXCHANGE_ACTIONS.GET_REFERAL_INFO}_SUCCESS`: {
      return { ...state, referalInfo: Referal.referal(action.payload.data) };
    }
    case `${EXCHANGE_ACTIONS.GET_CREDIT_ATM}_SUCCESS`: {
      const depositInfo = { };

      Object.entries(action.payload.data.items).forEach(([key, value]) => {
        console.log('key, value', key, value);
        depositInfo[key] = Deposit.deposit(value);
      });
      depositInfo.updatedAt = Date.now();
      return { ...state, depositInfo, creditRevenue: action.payload.data.revenue || '0' };
    }
    case `${EXCHANGE_ACTIONS.GET_TRANSACTION_CREDIT_ATM}_SUCCESS`: {
      const list = handleListPayload(action.payload.data.handshakes);
      return {
        ...state,
        creditTransactions: list,
      };
    }
    case `${EXCHANGE_ACTIONS.FIREBASE_CREDITS_DATA_CHANGE}_SUCCESS`: {
      const itemDepositInfos = action.payload;
      const oldDepositInfo = state.depositInfo;
      console.log('oldDepositInfo', oldDepositInfo);
      console.log('itemDepositInfos', itemDepositInfos);

      const depositInfo = { ...oldDepositInfo };
      console.log('depositInfo', depositInfo);

      Object.keys(itemDepositInfos).forEach((itemDepositId) => {
        const itemDeposit = Object.assign({}, itemDepositInfos[itemDepositId]);
        const currency = itemDepositId.replace('credit_item_', '');
        depositInfo[currency].balance = itemDeposit.balance;
        depositInfo[currency].status = itemDeposit.status;
        depositInfo[currency].subStatus = itemDeposit.sub_status;
      });

      depositInfo.updatedAt = Date.now();

      return {
        ...state, depositInfo,
      };
    }
    default:
      return state;
  }
}

export default exchangeReducter;
