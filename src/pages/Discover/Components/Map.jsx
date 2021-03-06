import React from 'react';
import { GoogleMap, Marker, withGoogleMap, withScriptjs } from 'react-google-maps';

import StationMarker from './StationMarker';
import './Map.scss';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';

import iconCurLocationButton from '@/assets/images/icon/current-location-button.png';
import currentLocationIndicator from '@/assets/images/icon/current-location-indicator.png';
import iconManageAtm from '@/assets/images/cash/ic-manage-atm.svg';
import iconManageDashboard from '@/assets/images/cash/ic-dashboard.svg';
import { HANDSHAKE_ID, URL } from '@/constants';
import cx from 'classnames';

class Map extends React.Component {
  constructor(props) {
    super(props);

    // const { lat, lng } = this.props;

    this.state = {
      curStationIdShowAllDetails: null,
    };
  }

  handleOnChangeShowAllDetails = (id, newValue) => {
    this.setState({ curStationIdShowAllDetails: newValue ? id : null });
  }

  goToDashboard = () => {
    this.props.history.push(`${URL.HANDSHAKE_ME}?id=${HANDSHAKE_ID.EXCHANGE}&tab=transaction`);
  }

  goToManageAtm = () => {
    this.props.history.push(`${URL.HANDSHAKE_CREATE}?id=${HANDSHAKE_ID.EXCHANGE}`);
  }

  render() {
    const {
      isMarkerShown,
      onMarkerClick,
      stations,
      offers,
      actionActive,
      currencyActive,
      onFeedClick,
      modalRef,
      setLoading,
      history,
      onGoToCurrentLocation,
      zoomLevel,
      lat, lng,
      onZoomChanged,
      onCenterChanged,
      onMapMounted,
      curLocation,
      mapCenterLat,
      mapCenterLng,
      offerStores,
    } = this.props;
    const { curStationIdShowAllDetails } = this.state;

    let markers = [];
    if (stations && stations.length > 0) {
      markers = stations.map((station, index) => {
        const { id, ...rest } = station;
        const offer = offers[index];

        return (
          <StationMarker
            key={id}
            {...rest}
            actionActive={actionActive}
            currencyActive={currencyActive}
            onFeedClick={extraData => onFeedClick(station, extraData)}
            history={history}
            offer={offer}
            modalRef={modalRef}
            setLoading={setLoading}
            showAllDetails={curStationIdShowAllDetails === id}
            onChangeShowAllDetails={(newValue) => this.handleOnChangeShowAllDetails(id, newValue)}
          />
        );
      });
    }

    return (
      <GoogleMap
        zoom={zoomLevel}
        center={{ lat: mapCenterLat, lng: mapCenterLng }}
        onZoomChanged={onZoomChanged}
        ref={onMapMounted}
        onCenterChanged={onCenterChanged}
        options={{ gestureHandling: 'greedy' }}
      >
        {markers}
        <button
          className="btn-current-location"
          onClick={onGoToCurrentLocation}
        >
          <img src={iconCurLocationButton} width={30} />
        </button>
        <Marker
          defaultIcon={{
            url: currentLocationIndicator,
            scaledSize: { width: 30, height: 30 },
          }}
          position={curLocation}
          zIndex={-1111}
        />
        <div className="container-button">
          {
            offerStores && (
              <div className="d-inline-block w-50 pr-1">
                <button className="btn bg-white btn-block btn-dashboard" onClick={this.goToDashboard}>
                  <img src={iconManageDashboard} width={16} className="mr-2" />
                  <FormattedMessage id="ex.discover.label.dashboard" />
                </button>
              </div>
            )
          }

          <div className={cx('d-inline-block pl-1', offerStores ? 'w-50' : 'w-100')}>
            <button className="btn btn-block btn-manage-atm" onClick={this.goToManageAtm}>
              <img src={iconManageAtm} width={16} className="mr-2" />
              {
                offerStores ? <FormattedMessage id="ex.discover.label.manage.atm" /> : <FormattedMessage id="ex.discover.label.open.atm" />
              }

            </button>
          </div>
        </div>
      </GoogleMap>
    );
  }
}

const mapState = state => ({
  ipInfo: state.app.ipInfo,
  offerStores: state.exchange.offerStores,
});

const mapDispatch = dispatch => ({
  // rfChange: bindActionCreators(change, dispatch),
});

export default injectIntl(
  connect(mapState, mapDispatch)(withScriptjs(withGoogleMap(Map))),
);
