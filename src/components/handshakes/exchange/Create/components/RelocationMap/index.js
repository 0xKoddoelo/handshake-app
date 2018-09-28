/* eslint camelcase:0 */
import React, { PureComponent, Component } from 'react';
import { GoogleMap, Marker, withGoogleMap, withScriptjs } from 'react-google-maps';
import PropTypes from 'prop-types';
import currentLocationIndicator from '@/assets/images/icon/current-location-indicator.png';
import { getAddressFromLatLng } from '@/components/handshakes/exchange/utils';
import { debounce } from 'lodash';

let mapInstance = null;

class RelocationMap extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { position: props.position };
    this.map = React.createRef();
    this.onCenterChanged = :: this.onCenterChanged;
    this.getAddress = debounce(::this.getAddress, 1000);
  }

  componentDidMount() {
    mapInstance = this;
  }

  UNSAFE_componentWillReceiveProps({ position }) {
    position?.lat !== undefined && position?.lng !== undefined && this.setState({ position });
  }

  onCenterChanged() {
    const { onCenterChanged } = this.props;
    const centerPoint = this.map.current?.getCenter();
    const position = { lat: centerPoint.lat(), lng: centerPoint.lng() };
    this.setState({ position });

    // resolve to address
    this.getAddress(position);

    if (typeof onCenterChanged === 'function') {
      onCenterChanged(position);
    }
  }

  async getAddress(position) {
    try {
      const address = await getAddressFromLatLng(position);
      const { onAddressResolved } = this.props;
      if (typeof onAddressResolved === 'function') {
        onAddressResolved({
          address,
          lat: position.lat,
          lng: position.lng,
        });
      }
    } catch (e) {
      console.warn(e);
    }
  }

  render() {
    const { position } = this.state;
    return (
      <GoogleMap
        zoom={19}
        center={position}
        ref={this.map}
        onCenterChanged={this.onCenterChanged}
        options={{ gestureHandling: 'greedy' }}
        defaultOptions={{
          mapTypeControl: false,
          panControl: false,
          zoomControl: false,
        }}
      >
        <Marker
          defaultIcon={{
            url: currentLocationIndicator,
            scaledSize: { width: 30, height: 30 },
          }}
          position={position}
          zIndex={-1111}
        />
      </GoogleMap>
    );
  }
}

/* eslint react/no-multi-comp:0 */
class RelocationMapContainer extends Component {
  constructor() {
    super();
    this.map = React.createRef();
  }

  UNSAFE_componentWillReceiveProps({ position }) {
    position && mapInstance?.setState({ position });
  }

  shouldComponentUpdate() { return false; }

  render() {
    const Map = withScriptjs(withGoogleMap(RelocationMap));
    return (
      <Map
        ref={this.map}
        googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_API_KEY}`}
        loadingElement={<div style={{ height: `100%` }} />}
        containerElement={<div className="address-update-map-container" style={{ height: '400px', position: 'relative' }} />}
        mapElement={<div style={{ height: `100%` }} />}
        {...this.props}
      />
    );
  }
}

RelocationMap.defaultProps = {
  onCenterChanged: () => {},
};

RelocationMap.propTypes = {
  onCenterChanged: PropTypes.func,
  position: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }).isRequired,
};

export default RelocationMapContainer;