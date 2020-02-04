import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withGoogleMap, GoogleMap, withScriptjs, InfoWindow, Marker} from 'react-google-maps';
import Geocode from 'react-geocode';
import Autocomplete from 'react-google-autocomplete';
import {
    Row,
    Col
} from 'reactstrap';
import Switch from 'react-switch';
import {Label} from 'react-bootstrap';
import * as addressHelper from '../common/utils/address_helpers';

Geocode.setApiKey('AIzaSyAoyN3MVzA2q2XIxZ7jwRz54uo4C08ZUpQ');
Geocode.enableDebug();

class MapAutocompleteDraggableMarker extends Component {
  static propTypes = {
      onChange: PropTypes.func.isRequired,
      onAddressTypeChange: PropTypes.func.isRequired,
      isCustomAddress: PropTypes.bool.isRequired
  };

  constructor(props) {
      super(props);
      this.state = {
          address: {},
          formattedAddress: '',
          isCustomAddress: this.props.isCustomAddress || false,
          mapPosition: {
              lat: this.props.center.lat,
              lng: this.props.center.lng
          },
          markerPosition: {
              lat: this.props.center.lat,
              lng: this.props.center.lng
          }
      };
  }

    /**
     * Get the current address from the default map position and set those values in the state
     */
  componentDidMount() {
    if (Object.keys(this.props.address).length > 0) {
      const address = this.props.address;
      let formattedAddress = '';
      if (this.props.center.lat !== -34.9208532 && this.props.center.lng !== -57.9542241) {
        formattedAddress = `${address.streetName ? address.streetName : ''} ${address.streetNumber ? address.streetNumber : ''} ${address.city}, ${address.state}`;
      }
      this.setState({
        address,
        formattedAddress
      });
    } else {
      Geocode.fromLatLng(this.state.mapPosition.lat, this.state.mapPosition.lng).then(
        response => {
          const address = addressHelper.placeToAddress(response.results[0]);
          let formattedAddress = '';
          if (this.props.center.lat !== -34.9208532 && this.props.center.lng !== -57.9542241) {
            formattedAddress = `${address.streetName ? address.streetName : ''} ${address.streetNumber ? address.streetNumber : ''} ${address.city}, ${address.state}`;
          }
          this.setState({
            address,
            formattedAddress
          });
        },
        error => {
          console.error(error);
        }
      );
    }
  }

    /**
     * Component should only update ( meaning re-render ), when the user selects the address, or drags the pin
     *
     * @param nextProps
     * @param nextState
     * @return {boolean}
     */
    shouldComponentUpdate(nextProps, nextState) {
      if (
          this.state.markerPosition.lat !== nextState.markerPosition.lat ||
            this.state.address !== nextState.address ||
            this.state.isCustomAddress !== nextState.isCustomAddress
      ) {
          return true;
      }
      return false;
  }

    /**
     * This Event triggers when the marker window is closed
     *
     * @param event
     */
    onInfoWindowClose = event => {

    };

    /**
     * When the marker is dragged you get the lat and long using the functions available from event object.
     * Use geocode to get the address, city, area and state from the lat and lng positions.
     * And then set those values in the state.
     *
     * @param event
     */
    onMarkerDragEnd = event => {
        const newLat = event.latLng.lat();
        const newLng = event.latLng.lng();

        Geocode.fromLatLng(newLat, newLng).then(
            response => {
                const address = addressHelper.placeToAddress(response.results[0]);

                const formattedAddress = `${address.streetName ? address.streetName : ''} ${address.streetNumber ? address.streetNumber : ''} ${address.city}, ${address.state}`;
                this.setState({
                    address,
                    formattedAddress,
                    markerPosition: {
                        lat: newLat,
                        lng: newLng
                    },
                    mapPosition: {
                        lat: newLat,
                        lng: newLng
                    }
                });
                this.props.onChange(address);
            },
            error => {
                console.error(error);
            }
        );
    };

    /**
     * Get the city and set the city input value to the one selected
     *
     * @param addressArray
     * @return {string}
     */
    getCity = addressArray => {
        let city = '';
        for (let i = 0; i < addressArray.length; i++) {
            if (addressArray[i].types[0] && addressArray[i].types[0] === 'administrative_area_level_2') {
                city = addressArray[i].long_name;
                return city;
            }
        }
    };

    /**
     * Get the area and set the area input value to the one selected
     *
     * @param addressArray
     * @return {string}
     */
    getArea = addressArray => {
        let area = '';
        for (let i = 0; i < addressArray.length; i++) {
            if (addressArray[i].types[0]) {
                for (let j = 0; j < addressArray[i].types.length; j++) {
                    if (addressArray[i].types[j] === 'sublocality_level_1' || addressArray[i].types[j] === 'locality') {
                        area = addressArray[i].long_name;
                        return area;
                    }
                }
            }
        }
    };

    /**
     * When the user types an address in the search box
     * @param place
     */
    onPlaceSelected = place => {
        const address = addressHelper.placeToAddress(place), //this.placeToAddress(place),
            formattedAddress = `${address.streetName ? address.streetName : ''} ${address.streetNumber ? address.streetNumber : ''} ${address.city}, ${address.state}`,
            latValue = address.latitude,
            lngValue = address.altitude;
        this.setState({
            address,
            formattedAddress,
            markerPosition: {
                lat: latValue,
                lng: lngValue
            },
            mapPosition: {
                lat: latValue,
                lng: lngValue
            }
        });
        this.props.onChange(address);
    };

    /**
     * Get the address and set the address input value to the one selected
     *
     * @param addressArray
     * @return {string}
     */
    getState = addressArray => {
        let state = '';
        for (let i = 0; i < addressArray.length; i++) {
            for (let i = 0; i < addressArray.length; i++) {
                if (addressArray[i].types[0] && addressArray[i].types[0] === 'administrative_area_level_1') {
                    state = addressArray[i].long_name;
                    return state;
                }
            }
        }
    };

    handleSwitch(e) {
        this.setState({
            isCustomAddress: e
        }, () => {
            this.props.onAddressTypeChange(this.state.isCustomAddress);
        });
    }

    render() {
        const addressInput = !this.state.isCustomAddress ? (
            <Autocomplete
                style={{
                    boxSizing: 'border-box',
                    border: '0',
                    width: '100%',
                    height: '30px',
                    padding: '0 8px',
                    borderRadius: '0.3rem',
                    backgroundColor: '#f1f1f1',
                    fontSize: '14px`',
                    outline: 'none',
                    marginTop: '4px'
                }}
                placeholder="Escriba ubicación"
                defaultValue={this.state.formattedAddress !== '' ? this.state.formattedAddress : ''}
                onPlaceSelected={this.onPlaceSelected}
                types={[]}
                componentRestrictions={{country: ["ar", "uy"]}}
                fields={['address_components', 'geometry.location']}
            />
        ) : (
            null
        );

        const AsyncMap = withScriptjs(
            withGoogleMap(
                props => (
                    <GoogleMap
                        defaultZoom={this.props.zoom}
                        defaultCenter={{lat: this.state.mapPosition.lat, lng: this.state.mapPosition.lng}}
                        onClick={this.onMarkerDragEnd}
                    >
                        {this.state.formattedAddress !== '' &&
                        <InfoWindow
                            onClose={this.onInfoWindowClose}
                            position={{lat: (this.state.markerPosition.lat + 0.0018), lng: this.state.markerPosition.lng}}
                        >
                            <div>
                                <span style={{padding: 0, margin: 0}}>{ this.state.formattedAddress }</span>
                            </div>
                        </InfoWindow>}
                        <Marker
                          name="Marker"
                          draggable
                          onDragEnd={this.onMarkerDragEnd}
                          position={{lat: this.state.markerPosition.lat, lng: this.state.markerPosition.lng}}
                        />
                        <Marker/>
                        <Row>
                          <Col sm="10" style={{paddingLeft: 0}}>
                              {addressInput}
                          </Col>
                          <Col sm="2">
                            <Label>Dir. Personalizada</Label>
                            <Switch
                              onChange={e => this.handleSwitch(e)}
                              checked={this.state.isCustomAddress}
                              id="normal-switch"
                              onColor="#003d6f"
                              onHandleColor="#fbad1c"
                              handleDiameter={20}
                              uncheckedIcon={false}
                              checkedIcon={false}
                              boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                              activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                              height={15}
                              width={38}
                              className="react-switch"
                            />
                          </Col>
                        </Row>
                    </GoogleMap>
                )
            )
        );
        let map;
        if (this.props.center.lat !== undefined) {
            map = (
                <div>
                    <AsyncMap
                        googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyAoyN3MVzA2q2XIxZ7jwRz54uo4C08ZUpQ&language=es&v=3.exp&libraries=places"
                        loadingElement={
                            <div style={{height: `${parseInt(this.props.height) - 34}px`}}/>
                        }
                        containerElement={
                            <div style={{height: this.props.height}}/>
                        }
                        mapElement={
                            <div style={{height: `${parseInt(this.props.height) - 34}px`}}/>
                        }
                    />
                </div>
            );
        } else {
            map = <div style={{height: this.props.height}}/>;
        }
        return (map);
    }
}
export default MapAutocompleteDraggableMarker;

