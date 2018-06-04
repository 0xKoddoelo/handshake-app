import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
// action, mock
import { loadMyHandshakeList } from '@/reducers/me/action';
import { API_URL, HANDSHAKE_ID } from '@/constants';
import { URL } from '@/config';
// components
import { Link } from 'react-router-dom';
import { Grid, Row, Col } from 'react-bootstrap';
import NoData from '@/components/core/presentation/NoData';
import FeedPromise from '@/components/handshakes/promise/Feed';
import FeedBetting from '@/components/handshakes/betting/Feed';
import FeedExchange from '@/components/handshakes/exchange/Feed/FeedExchange';
import FeedSeed from '@/components/handshakes/seed/Feed';
import Image from '@/components/core/presentation/Image';
// style
import AvatarSVG from '@/assets/images/icon/avatar.svg';
import ExpandArrowSVG from '@/assets/images/icon/expand-arrow.svg';
import './Me.scss';
import { getListOfferPrice } from "@/reducers/exchange/action";


const maps = {
  [HANDSHAKE_ID.PROMISE]: FeedPromise,
  [HANDSHAKE_ID.BETTING]: FeedBetting,
  [HANDSHAKE_ID.EXCHANGE]: FeedExchange,
  [HANDSHAKE_ID.SEED]: FeedSeed,
};

class Me extends React.Component {

  componentDidMount() {
    this.getListOfferPrice();
    this.loadMyHandshakeList();
  }

  getListOfferPrice = () => {
    this.props.getListOfferPrice({
      BASE_URL: API_URL.EXCHANGE.BASE,
      PATH_URL: API_URL.EXCHANGE.GET_LIST_OFFER_PRICE,
      qs: { fiat_currency: this.props?.app?.ipInfo?.currency },
      successFn: this.handleGetPriceSuccess,
      errorFn: this.handleGetPriceFailed,
    });
  }

  loadMyHandshakeList = () => {
    this.props.loadMyHandshakeList({ PATH_URL: API_URL.ME.BASE });
  }

  render() {
    const { list } = this.props.me;
    return (
      <Grid className="me">
        <Row>
          <Col md={12}>
            <Link className="update-profile" to={URL.HANDSHAKE_ME_PROFILE} title="profile">
              <Image src={AvatarSVG} alt="avatar" />
              <div className="text">
                <strong>My Profile</strong>
                <p>Vertify your email, phone numbers</p>
              </div>
              <div className="arrow">
                <Image src={ExpandArrowSVG} alt="arrow" />
              </div>
            </Link>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            {
              list && list.length > 0 ? (
                list.map((handshake) => {
                  const FeedComponent = maps[handshake.type];
                  if (FeedComponent) {
                    return (
                      <Col key={handshake.id} className="feed-wrapper">
                        <FeedComponent {...handshake} history={this.props.history} onFeedClick={() => this.clickFeedDetail(handshake.id)} mode={'me'}
                                       refreshPage={this.loadMyHandshakeList}
                        />
                      </Col>
                    );
                  }
                })
              ) : (
                <NoData />
              )
            }
          </Col>
        </Row>
      </Grid>
    );
  }
}

Me.propTypes = {
  me: PropTypes.object.isRequired,
  loadMyHandshakeList: PropTypes.func.isRequired,
  getListOfferPrice: PropTypes.func.isRequired,
};

const mapState = state => ({
  me: state.me,
  app: state.app,
});

const mapDispatch = ({
  loadMyHandshakeList,
  getListOfferPrice,
});

export default connect(mapState, mapDispatch)(Me);
