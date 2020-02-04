/* eslint-disable react/jsx-closing-tag-location */
import _ from 'lodash';
import React, {Component} from 'react';
import { compose, withProps, lifecycle, withStateHandlers, withState, withHandlers } from 'recompose';
import {
    withScriptjs,
    withGoogleMap,
    GoogleMap,
    Marker,
    InfoWindow
} from 'react-google-maps';
import { Row, Col, Button, ButtonGroup } from 'reactstrap';
import MdArrowForward from 'react-icons/lib/md/arrow-forward';
import Spiderfy from './Spiderfy';
import FaShare from 'react-icons/lib/md/share';
import SweetAlert from 'react-bootstrap-sweetalert';
import ShareModal from '../common/Share/ShareModal';
import DwellingTitle from '../../services/dwellingTitle';

const PLACE_OF_USAGE = 'aside';

const MapWithASearchBox = compose(
    withProps({
        // eslint-disable-next-line max-len
        googleMapURL: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAoyN3MVzA2q2XIxZ7jwRz54uo4C08ZUpQ&language=es&v=3.exp&libraries=geometry,drawing,places',
        loadingElement: <div style={{height: '100%'}}/>,
        containerElement: <div style={{height: '100%'}}/>,
        mapElement: <div style={{height: '100%'}}/>
    }),
    withStateHandlers(() => ({
        isOpen: null
    }), {
        onToggleOpen: () => event => (
            {isOpen: event}
        ),
        refHelper: () => (nextCenter, prevRef) => (
            {helper: nextCenter, prevRef}
        ),
        openDetailViewInNewTab: () => url => {
            // eslint-disable-next-line no-undef
            // this.props.history.push(detail_url) // NOTE: This was replaced with window.open to be able to open in new tab.
            console.log(url);
            window.open(url, '_blank');
        },
        onRefChange: props => (center, selectedRef) => ({})
    }),
    lifecycle({
        componentWillMount() {
            const refs = {};
            var latitude = -34.9204948;
            var altitude = -57.95356570000001;
            if (this.props.dwellings && this.props.dwellings[0] && this.props.dwellings[0].address.hasOwnProperty('latitude')) {
                latitude = this.props.dwellings[0].address.latitude;
                altitude = this.props.dwellings[0].address.altitude;
            }
            this.setState({
                bounds: null,
                initialCenter: {
                    lat: latitude,
                    lng: altitude
                },
                markers: [],
                onMapMounted: ref => {
                    refs.map = ref;
                },
                onBoundsChanged: _.debounce(
                    () => {
                        this.setState({
                            bounds: refs.map.getBounds(),
                            center: refs.map.getCenter()
                        });
                        let {onBoundsChange} = this.props;
                        if (onBoundsChange) {
                            onBoundsChange(refs.map);
                        }
                    },
                    300,
                    {maxWait: 1500}
                ),
                onSearchBoxMounted: ref => {
                    refs.searchBox = ref;
                },
                onPlacesChanged: () => {
                    const places = refs.searchBox.getPlaces();
                    // eslint-disable-next-line no-undef
                    const bounds = new google.maps.LatLngBounds();

                    // eslint-disable-next-line lodash/prefer-lodash-method
                    places.forEach(place => {
                        if (place.geometry.viewport) {
                            bounds.union(place.geometry.viewport);
                        } else {
                            bounds.extend(place.geometry.location);
                        }
                    });
                    const nextMarkers = places.map(place => ({
                        position: place.geometry.location
                    }));
                    const nextCenter = _.get(nextMarkers, '0.position', this.state.center);
                    this.props.refHelper(nextCenter, this.props.selectedRef);
                    this.setState({markers: nextMarkers});
                    // refs.map.fitBounds(bounds);
                },
                onRefChanged: () => {
                    this.props.refHelper(this.props.selectedRef, this.props.selectedRef);
                },
                modalShare: false,
                alert: null,
                toggleShare: (e, dwelling) => {
                  e.stopPropagation();
                  if (this.state.modalShare) this.setState({modalShare: !this.state.modalShare});
                  else this.setState({dwelling, modalShare: !this.state.modalShare});
                },
                showAlert: (title, type, param, load=false) => {
                    const getAlert = () => (
                        <SweetAlert
                            type={type}
                            title={title}
                            onConfirm={() => this.state.hideAlert()}
                        />
                    );
                    this.setState({alert: getAlert()});
                },
                hideAlert: () => {
                    this.setState({alert: null});
                }
            });
        }
    }),
    withScriptjs,
    withGoogleMap
)(props =>
    (
        <GoogleMap
            ref={props.onMapMounted}
            defaultZoom={13}
            center={!props.helper ? props.initialCenter : props.helper}
            onBoundsChanged={props.onBoundsChanged}
        >
            {(props.prevRef !== props.selectedRef) && props.onRefChanged()}
            {(props.prevRef !== props.selectedRef) && props.onToggleOpen(props.selectedRef.dwellingId)}
            {/*<SearchBox
                ref={props.onSearchBoxMounted}
                bounds={props.bounds}
                // eslint-disable-next-line no-undef
                controlPosition={google.maps.ControlPosition.TOP_LEFT}
                onPlacesChanged={props.onPlacesChanged}
            >
                <input
                    type="text"
                    placeholder="Escriba ubicación"
                    style={{
                        boxSizing: 'border-box',
                        border: '1px solid transparent',
                        width: '240px',
                        height: '32px',
                        marginTop: '27px',
                        padding: '0 12px',
                        borderRadius: '3px',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                        fontSize: '14px',
                        outline: 'none',
                        textOverflow: 'ellipses'
                    }}
                />
            </SearchBox>*/}

            <Spiderfy onSpiderClick={props.onToggleOpen}>
                {props.dwellings !== undefined && props.dwellings.map((dwelling, index) => {
                    let img_url = dwelling.images[0] !== undefined
                        ? dwelling.images[0].secure_url.replace('/upload/', '/upload/w_350,q_auto,f_auto/')
                        : 'https://res.cloudinary.com/sioc/image/upload/w_350,q_auto,f_auto/v1525712940/epnvioppkpvwye1qs66z.jpg';

                    const dwellingPosition = {
                        lat: dwelling.address.hasOwnProperty('latitude') ? dwelling.address.latitude : 0,
                        lng: dwelling.address.hasOwnProperty('altitude') ? dwelling.address.altitude : 0
                    };
                    const title = DwellingTitle.get(dwelling, PLACE_OF_USAGE);

                    return (
                        <Marker
                            key={index}
                            position={dwellingPosition}
                            title={dwelling._id}
                            options={props.visitedDwellings.includes(dwelling._id) ? {icon: {url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png", scaledSize: new google.maps.Size(46, 43)}} : {}}
                        >
                            {props.isOpen && props.isOpen === dwelling._id &&
                            <InfoWindow>
                                <Row>
                                    <Col style={{padding: '0'}}>
                                        <div
                                            style={{
                                            marginRight: '0',
                                            width: '150px',
                                            height: '150px',
                                            backgroundSize: 'cover',
                                            backgroundImage: `url(${img_url})`
                                        }} />
                                    </Col>
                                    <Col>
                                        <h4 style={{marginBottom: '0'}}>{title}</h4>
                                        {dwelling.spaces &&
                                        <span>
                                            {(dwelling.spaces.bathRoom > 0) && `${dwelling.spaces.bathRoom} Baños` }
                                            {(dwelling.spaces.bathRoom > 0 && dwelling.spaces.bedrooms > 0) && `,` } {' '}
                                            {(dwelling.spaces.bedrooms > 0) && `${dwelling.spaces.bedrooms} Dormitorios` }
                                        </span>}
                                        <h3 className="mt-3">
                                            {dwelling.price
                                            ? <span>{dwelling.currency && `${dwelling.currency}` || `$`}<b>{dwelling.price}</b> </span>
                                            : <span>Consulte Precio</span>}
                                        </h3>
                                        <br/>
                                        <ButtonGroup>
                                            <Button color="light" onClick={e => props.toggleShare(e, dwelling)}>
                                                <FaShare />
                                            </Button>
                                            <Button className="text-uppercase" color="light" onClick={() => {
                                                if (!props.visitedDwellings.includes(dwelling._id)) props.visitDwelling(dwelling._id);
                                                props.openDetailViewInNewTab(`/${dwelling.siocId}`);
                                            }}>
                                                Ir a la propiedad <MdArrowForward/>
                                            </Button>
                                        </ButtonGroup>
                                    </Col>
                                </Row>
                            </InfoWindow>}
                        </Marker>
                    );
                })}
            </Spiderfy>
            <ShareModal
                modalShare={props.modalShare}
                toggleShare={props.toggleShare}
                dwelling={props.dwelling}
                showAlert={props.showAlert} />
            {props.alert}
        </GoogleMap>)
);

const enhance = _.identity;

class MapWithSearchBox extends Component {
    render() {
        let {user, dwellings, history, selectedRef, visitedDwellings, visitDwelling} = this.props;
        if (dwellings === undefined) {
            dwellings = {};
        }
        return (
            <MapWithASearchBox
                key="map"
                user={user}
                dwellings={dwellings}
                history={history}
                selectedRef={selectedRef}
                helper={selectedRef}
                visitedDwellings={visitedDwellings}
                visitDwelling={visitDwelling}
            />
        );
    }
}

export default enhance(MapWithSearchBox);
