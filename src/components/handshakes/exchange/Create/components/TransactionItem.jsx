import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
// action, mock
import {CRYPTO_CURRENCY, FIAT_CURRENCY,} from '@/constants';
import {FormattedDate, FormattedMessage, injectIntl} from 'react-intl';
// components
// style
import {change} from 'redux-form';

import iconBitcoin from '@/assets/images/icon/coin/btc.svg';
import iconEthereum from '@/assets/images/icon/coin/eth.svg';
import iconBitcoinCash from '@/assets/images/icon/coin/bch.svg';
import iconUsd from '@/assets/images/icon/coin/icons8-us_dollar.svg';

import './TransactionItem.scss';
import CashStoreTransaction from "@/models/CashStoreTransaction";
import cx from 'classnames';

export const CRYPTO_ICONS = {
  [CRYPTO_CURRENCY.ETH]: iconEthereum,
  [CRYPTO_CURRENCY.BTC]: iconBitcoin,
  BCH: iconBitcoinCash,
  '': iconUsd,
};

export const CASH_ORDER_STATUS = {
  PROCESSING: 'processing',
  SUCCESS: 'success',
  TRANSFERRING: 'transferring',
  CANCELLED: 'cancelled',
};

class TransactionItem extends React.Component {
  constructor(props) {
    super(props);
    const { extraData } = props;

    this.transaction = CashStoreTransaction.cashStoreTransaction(JSON.parse(extraData));
  }

  render() {
    const { messages } = this.props.intl;
    const { initAt } = this.props;
    const { amount, currency, fiatAmount, status } = this.transaction;

    return (
      <div className="transaction">
        <div className="text-normal" style={{ padding: '0 15px' }}>
          <FormattedDate
            value={new Date(initAt * 1000)}
            year="numeric"
            month="long"
            day="2-digit"
            hour="2-digit"
            minute="2-digit"
          />
        </div>
        <div className="transaction-detail">
          {
            <div>
              {/*<div className="d-table w-100">
                <div className="d-table-cell font-weight-bold">
                  <img src={CRYPTO_ICONS[currency]} width={19} />
                  <span className="type-order ml-2">{feedType === CREDIT_FEED_TYPES.DEPOSIT ? messages.me.credit.transaction.deposit.title :
                    feedType === CREDIT_FEED_TYPES.TRANSACTION ? messages.me.credit.transaction.transaction.title :
                      feedType === CREDIT_FEED_TYPES.WITHDRAW ? messages.me.credit.transaction.withdraw.title :
                        feedType === CREDIT_FEED_TYPES.INSTANT ? messages.me.credit.transaction.instant.title : ''
                  }</span>
                </div>
                {
                  subStatus === 'transferring' && (
                    <div className="d-table-cell text-right">
                      <img src={iconSpinner} width="14px" />
                      <span className="status ml-2">{messages.me.credit.transaction.processing}</span>
                    </div>
                  )
                }
              </div>*/}

              {status === CASH_ORDER_STATUS.TRANSFERRING && (
                <div className="text-normal mt-2">
                  {messages.create.atm.transactions.messageTransfer}
                </div>
              )
              }

              {/*<hr />*/}
            </div>
          }

          <div className="mt-3">
            <div className="d-table w-100">
              <div className="d-table-cell text-normal">
                {messages.create.atm.transactions.amount}
              </div>
              <div className="d-table-cell text-right">
                <span className="font-weight-bold">{amount}</span>
                &nbsp;
                <span className="text-normal">{currency}</span>
              </div>
            </div>

            <div className="d-table w-100">
              <div className="d-table-cell text-normal">
                {messages.create.atm.transactions.needToTransfer}
              </div>
              <div className="d-table-cell text-right">
                <span className="font-weight-bold">{fiatAmount}</span>
                &nbsp;
                <span className="text-normal">{FIAT_CURRENCY.USD}</span>
              </div>
            </div>
            <div className="d-table w-100">
              <div className="d-table-cell text-normal">
                {messages.create.atm.transactions.status}
              </div>
              <div className="d-table-cell text-right">
                <span className={cx('text-normal', `${status}`)}>{messages.create.atm.transactions.statusValues[status]}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }
}

const mapState = state => ({
  // me: state.me
});

const mapDispatch = dispatch => ({
  rfChange: bindActionCreators(change, dispatch),
});

export default injectIntl(connect(mapState, mapDispatch)(TransactionItem));