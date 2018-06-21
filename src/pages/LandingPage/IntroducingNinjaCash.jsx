/**
 * Trade component.
 */
import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
// service
import axios from 'axios';
import qs from 'qs';
import {showAlert} from '@/reducers/app/action';
import {injectIntl} from 'react-intl';

import Alert from '@/components/core/presentation/Alert';

// style
import './IntroducingNinjaCash.scss';


const inputRefOne = 'emailRef';
const inputRefTwo = 'emailRefTwo';

class Handshake extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {messages, locale} = this.props.intl;
    return (
      <div className="whitePaper">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <h1>Представляем вашему вниманию NinjaCash.</h1>
              <p>
                Это децентрализованная платформа, которая позволяет обменивать криптовалюты на наличные, анонимно и
                минуя посредников.<br/> <br/>

                Идея проста: Ниндзя даст возможность пользователям со всего мира покупать и продавать криптовалюты,
                ломая барьеры, которые существуют на традиционных платформах. Здесь вам не понадобится верифицировать
                личность, также не понадобится и банковский счёт. Это означает, что более двух миллиардов людей на
                земле, которые в данный момент не имеют возможности использовать традиционные платформы, смогут купить и
                продать криптовалюты за реальные деньги.<br/> <br/>

                Позволяя пользователям оставаться анонимными и защищая транзакции при помощи блокчейн, мы возвращаемся к
                истокам использования криптовалют, где основной целью было сбежать от банков и других централизованных
                организаций. Мы переходим к децентрализованному использованию денег.
              </p>
            </div>

            <div className="col-lg-12">
              <h3>Как это работает</h3>
              <p>Когда вы хотите купить или продать биткоин или эфириум, вы заходите на Ninja и создаёте предложение.
                Ниндзя уведомит других пользователей, что они могут купить или продать BTC или ETH за определённую цену.
                Ниндзя основывается на вашем местоположении, поэтому только люди вблизи от вас узнают о
                предложении.<br/> <br/>

                Продавцы становятся своеобразными “станциями”, где пользователи могут встретиться и совершить сделку.
                “Станции” могут указывать желаемую цену для продажи, когда человек заинтересуется покупкой у вас, он
                подтвердит транзакцию кнопкой Shake (зд.: по рукам).. Всё, что вам требуется сделать, это согласиться с
                “shake”, после чего будет заключён смарт контракт. Ваша криптовалюта будет на депонированном счету до
                тех пор, пока вам её не оплатят.<br/> <br/>

                Следующий шаг заключается в том, чтобы встретиться с покупателем для завершения транзакции. Весь процесс
                защищен смарт контрактом (все коды доступны на Github), следовательно, как только вам заплатят за
                криптовалюту, она будет разморожена и переведена на кошелёк покупателя. Легко и безопасно.</p>
            </div>

            <div className="col-lg-12">
              <h3>Ниндзя Станции</h3>
              <p>Ниндзя Станции - это места, где совершаются сделки NinjaCash. Позволяя пользователям со всего мира
                встречаться и торговать криптовалютой, оставаясь анонимными и защищёнными. Вы можете стать “станцией”,
                кликнув на кнопку (+) в центре панели задач.</p>
            </div>

            <div className="col-lg-12">
              <h3>Устанавливайте Вашу цену</h3>
              <p>Здесь мы покажем вам текущую рыночную цену как базовую точку для определения того, сколько вы хотите
                продать. Потом у вас будет возможность изменять дополнительные проценты для покупки/продажи к текущей
                цене, с которыми вы согласны. С добавлением процентов, у вас не будет необходимости постоянно изменять
                цену в зависимости от колебаний на рынке. Не забудьте активировать ваш магазин, чтобы у пользователей
                была возможность увидеть его и посетить.</p>
            </div>

            <div className="col-lg-12">
              <h3>Почему мы делаем это?</h3>
              <p>{messages.WHITE_PAPER_SUBTITLE_1}</p>
            </div>

            <div className="col-lg-12">
              <h3>{messages.WHITE_PAPER_H1}</h3>
              <p>Мы хотели создать платформу, которую каждый мог бы использовать независимо от местоположения и
                независимо от статуса в своем банке. Нынешние платформы имеют высокие комиссии и практикуют процесс
                идентификации личностиKYC, что делает их всё ближе и ближе к традиционной банковской системе.<br/> <br/>

                Ninja возвращает вас к основам криптовалют, соединяя пользователей всего мира.Торгуйте анонимно. Платите
                только за gas.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}


Handshake.propTypes = {};


export default injectIntl(Handshake);