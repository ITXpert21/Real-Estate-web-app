/* eslint-disable react/jsx-closing-tag-location,camelcase */
import _ from 'lodash';
import React from 'react';
import {compose, withProps, lifecycle} from 'recompose';
import {withScriptjs} from 'react-google-maps';
import PlacesAutocomplete from 'react-places-autocomplete';
import TagsInput from '../common/TagInput';
import * as addressHelper from '../common/utils/address_helpers';

const divRef = React.createRef();

const MultipleSearchBox = compose(
    withProps({
        // eslint-disable-next-line max-len
        googleMapURL: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAoyN3MVzA2q2XIxZ7jwRz54uo4C08ZUpQ&language=es&v=3.exp&libraries=geometry,drawing,places',
        loadingElement: <div style={{height: '100%'}}/>,
        containerElement: <div style={{height: '400px'}}/>
    }),
    lifecycle({
        componentWillMount() {
            this.setState({
                place: {},
                address: '',
                value: this.props.value,
                // searchOptions: {
                //     componentRestrictions: {
                //         country: ['ar', 'ur']
                //     }
                // },
                // defaultBounds: {
                //     west: -73.5600329, south: -55.1850761, east: -53.6374515, north: -21.781168
                // },
                onPlacesChanged: (formattedAddress, placeId) => {
                    this.placeService = new google.maps.places.PlacesService(divRef.current);
                    this.placeService.getDetails({placeId}, (place, status) => {
                        if (status === 'OK') {
                            const address = addressHelper.placeToAddress(place);
                            address.formatted_address = place.formatted_address;

                            this.setState({place, address: ''});
                            let value = [];
                            if (this.state.value) {
                                value = this.state.value.concat(address);
                            } else {
                                value = value.concat(address);
                            }
                            this.setState({value});
                            this.props.onChange(value);
                        }
                    });
                },
                onChange: value => {
                    this.setState({value});
                    this.props.onChange(value);
                },
                handleChange: address => {
                    this.setState({address});
                },
                renderResults: (suggestions, loading, getSuggestionItemProps) => {
                    if (!suggestions || suggestions.length === 0) {
                        return null;
                    }

                    return (
                        <div className="pac-container pac-logo">
                            {loading && <div>Loading...</div>}
                            {suggestions.map(suggestion => {
                                const className = 'pac-item';

                                const exactMatchPart = suggestion.description.substring(0, this.state.address.length);
                                const theRestOfSuggestion = suggestion.description.substring(this.state.address.length);

                                return (
                                    <div
                                        {...getSuggestionItemProps(suggestion, {
                                            className
                                        })}
                                    >
                                        <span className="pac-icon pac-icon-marker"/>
                                        <span className="pac-item-query">
                                            <span className="pac-matched">
                                                {exactMatchPart}
                                            </span>
                                            <span>
                                                {theRestOfSuggestion}
                                            </span>
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    );
                }
            });
        }
    }),
    withScriptjs
)(props => (
    <div>
        <TagsInput
            renderInput={({addTag, ...childProps}) => (
                <PlacesAutocomplete
                    ref={props.onSearchBoxMounted}
                    value={props.address}
                    onChange={props.handleChange}
                    onSelect={props.onPlacesChanged}
                    searchOptions={props.searchOptions}
                    shouldFetchSuggestions={props.address.length > 2}
                    debounce={500}
                >
                    {({getInputProps, suggestions, getSuggestionItemProps, loading}) => (
                        <div>
                            <input
                                {...getInputProps({
                                    placeholder: props.formattedAddress !== undefined ? props.formattedAddress : 'Agregue una o más ubicaciones o calles...',
                                    className: 'location-search-input'
                                })}
                            />
                            {props.renderResults(suggestions, loading, getSuggestionItemProps)}
                        </div>
                    )}
                </PlacesAutocomplete>
            )}
            value={props.value}
            onChange={props.onChange}
            renderTag={props => {
                let {tag, key, disabled, onRemove, classNameRemove, getTagDisplayValue, ...other} = props

                return (
                    <div key={key} {...other}>
                        {/*getTagDisplayValue(tag)*/}
                        <div className="pull-left">{tag.formatted_address}</div>
                        {!disabled &&
                        <div className="pull-right"><a className={classNameRemove} onClick={(e) => onRemove(key)} /></div>
                        }
                    </div>
                );
            }}
        />
        <div ref={divRef}/>
    </div>)
);

const enhance = _.identity;
export default enhance(MultipleSearchBox);
