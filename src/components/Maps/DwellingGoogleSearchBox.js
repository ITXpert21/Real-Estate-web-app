/* eslint-disable react/jsx-closing-tag-location,camelcase */
import _ from 'lodash';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {compose, withProps, lifecycle} from 'recompose';
import {withScriptjs} from 'react-google-maps';
import StandaloneSearchBox from 'react-google-maps/lib/components/places/StandaloneSearchBox';


const PlacesWithStandaloneSearchBox = compose(
    withProps({
        // eslint-disable-next-line max-len
        googleMapURL: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAoyN3MVzA2q2XIxZ7jwRz54uo4C08ZUpQ&language=es&v=3.exp&libraries=geometry,drawing,places',
        loadingElement: <div style={{height: '100%'}}/>,
        containerElement: <div style={{height: '400px'}}/>
    }),
    lifecycle({
        componentWillMount() {
            const refs = {};
            this.setState({
                places: {},
                onSearchBoxMounted: ref => {
                    refs.searchBox = ref;
                },
                onPlacesChanged: () => {
                    const places = refs.searchBox.getPlaces();

                    this.setState({
                        places
                    });

                    function placeToAddress(place) {
                        const address = {
                            latitude: places[0].geometry.location.lat(),
                            altitude: places[0].geometry.location.lng()
                        };
                        place.address_components.forEach(c => {
                            switch (c.types[0]) {
                                case 'street_number':
                                    address.streetNumber = c.long_name;
                                    break;
                                case 'route':
                                    address.streetName = c.long_name;
                                    break;
                                case 'neighborhood':
                                case 'locality':
                                    address.city = c.long_name;
                                    break;
                                case 'administrative_area_level_1':
                                    if (address.city === undefined) {
                                        address.city = c.short_name;
                                    }
                                    address.state = c.long_name;
                                    break;
                                case 'postal_code':
                                    address.zip = c.long_name;
                                    break;
                                case 'country':
                                    address.country = c.long_name;
                                    break;
                                default:
                                    break;
                            }
                        });

                        return address;
                    }

                    const address = placeToAddress(places[0]);
                    this.props.onChange(address);
                }
            });
        }
    }),
    withScriptjs
)((props, state) =>
    (<div data-standalone-searchbox="">
        <StandaloneSearchBox
            ref={props.onSearchBoxMounted}
            bounds={props.bounds}
            onPlacesChanged={props.onPlacesChanged}
        >

            <input
                type="text"
                placeholder={props.formattedAddress !== undefined ? props.formattedAddress : 'Escriba ubicación'}
                style={{
                    boxSizing: 'border-box',
                    // border: '1px solid rgba(0,0,0,.1)',
                    border: '0',
                    width: '100%',
                    height: '37px',
                    padding: '0.5rem 1rem',
                    fontSize: '1.25rem',
                    lineHeight: '1.5',
                    color: '#495057',
                    borderRadius: '0.3rem',
                    backgroundColor: '#f1f1f1',
                    // boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                    outline: 'none',
                    // textOverflow: 'ellipses'
                }}
            />
        </StandaloneSearchBox>
    </div>)
);

const enhance = _.identity;

class GoogleSearchBox extends Component {
    static propTypes = {
        onChange: PropTypes.func.isRequired
    };

    handleChange(e) {
        this.props.onChange(e);
    }

    render() {
        let address;
        let formattedAddress;
        if (this.props.address.streetName !== undefined) {
            address = this.props.address;
            formattedAddress = `${address.streetName ? address.streetName : ''} ${address.streetNumber ? address.streetNumber : ''} ${address.city}, ${address.state}`;
            if (formattedAddress === undefined) {
                formattedAddress = 'Indique Dirección';
            }
        } else {
            address = {};
            formattedAddress = 'Indique Dirección';
        }
        return (
            <PlacesWithStandaloneSearchBox
                formattedAddress={formattedAddress}
                address={address}
                onChange={e => this.handleChange(e)}
                key="map"
            />
        );
    }
}

export default enhance(GoogleSearchBox);
