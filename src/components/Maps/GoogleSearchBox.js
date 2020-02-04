/* eslint-disable react/jsx-closing-tag-location,camelcase */
import _ from 'lodash';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {compose, withProps, lifecycle} from 'recompose';
import {withScriptjs} from 'react-google-maps';
import * as addressHelper from '../common/utils/address_helpers';
import Autocomplete from 'react-google-autocomplete';


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
                place: {},
                onSearchBoxMounted: ref => {
                    refs.searchBox = ref;
                },
                onPlacesChanged: place => {
                    this.setState({place});
                    const address = addressHelper.placeToAddress(place);
                    this.props.onChange(address);
                }
            });
        }
    }),
    withScriptjs
)((props, state) =>
    (<div data-standalone-searchbox="">
        <Autocomplete
            style={{
                boxSizing: 'border-box',
                // border: '1px solid rgba(0,0,0,.1)',
                border: '0',
                width: '100%',
                height: '30px',
                padding: '0 8px',
                borderRadius: '0.3rem',
                backgroundColor: '#f1f1f1',
                // boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                fontSize: '14px`',
                outline: 'none',
                // textOverflow: 'ellipses'
            }}
            placeholder={props.formattedAddress !== undefined ? props.formattedAddress : 'Escriba ubicación'}
            defaultValue=""
            onPlaceSelected={props.onPlacesChanged}
            types={[]}
            bounds={props.bounds}
            componentRestrictions={{country: ["ar", "uy"]}}
            fields={['address_components', 'geometry.location']}
            ref={props.onSearchBoxMounted}
        />
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
        if (this.props.address !== undefined) {
            address = this.props.address;
            formattedAddress = `${address.streetName ? address.streetName : ''} ${address.streetNumber ? address.streetNumber : ''} ${address.city}, ${address.state}`;
            if (formattedAddress === undefined) {
                formattedAddress = undefined;
            }
        } else {
            address = {};
            formattedAddress = undefined;
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
