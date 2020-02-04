import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Container, Row, Col, Button} from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import FaShare from 'react-icons/lib/md/share';
import moment from 'moment/moment';
import SweetAlert from 'react-bootstrap-sweetalert';
import {
    requestUserProfile,
    requestDwellings,
    requestAddFavorite,
    requestSearchClients,
    requestFavoriteToClients,
    requestRemoveFavoriteFromClient
} from '../../actions';

import ShareModal from '../common/Share/ShareModal';
import DwellingTitle from '../../services/dwellingTitle';
import FavoriteModal from '../common/Favorite/FavoriteModal';
import {previewImage} from '../common/utils/custom_helpers';

const PLACE_OF_USAGE = 'home';

class Search extends Component {
    static propTypes = {
        requestUserProfile: PropTypes.func.isRequired,
        requestDwellings: PropTypes.func.isRequired,
        requestAddFavorite: PropTypes.func.isRequired,
        requestSearchClients: PropTypes.func.isRequired,
        requestFavoriteToClients: PropTypes.func.isRequired,
        requestRemoveFavoriteFromClient: PropTypes.func.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired
        }).isRequired,
        dwellings: PropTypes.arrayOf(PropTypes.shape({}))
    };
    static defaultProps = {
        dwellings: []
    };

    constructor(props) {
        super(props);
        this.state = {
            alert: null,
            modalShare: false,
            modalFavorite: false,
            dwellingId: null
        };

        this.toggleShare = this.toggleShare.bind(this);
        this.toggleFavorite = this.toggleFavorite.bind(this);
        this.handleFavorite = this.handleFavorite.bind(this);
        this.showAlert = this.showAlert.bind(this);
    }

    componentDidMount() {
        this.props.requestUserProfile();
        this.props.requestDwellings();
        if (this.props.userProfile && ['martillero', 'vendedor'].includes(this.props.userProfile.role)) {
            this.props.requestSearchClients();
        }
    }

    componentWillReceiveProps(props) {
        if (!this.props.userProfile && props.userProfile && ['martillero', 'vendedor'].includes(props.userProfile.role)) {
            this.props.requestSearchClients();
        }
    }

    showAlert(title, type, param, load = false) {
        let getAlert;
        if (load)
            getAlert = () => (
                <SweetAlert
                    type={type}
                    title={title}
                    onConfirm={() => this.loadWindow()} />
                );
        else
            getAlert = () => (
                <SweetAlert
                    type={type}
                    title={title}
                    onConfirm={() => this.hideAlert(param)} />
            );

        this.setState({alert: getAlert()});
    }

    hideAlert(param) {
        this.setState({alert: null});
        if (param && param.hasOwnProperty('favoriteMode')) {
            param.favoriteMode === 0 ? this.props.requestUserProfile() : this.props.requestSearchClients();
        }
    }

    loadWindow() {
        window.location.pathname = '/home';
    }

    myFavorite(dwellingId) {
        ['martillero', 'vendedor'].includes(this.props.userProfile.role) ?
            this.toggleFavorite(dwellingId) : this.handleFavorite(false, dwellingId, []);
    }

    async removeFavoriteFromClient(dwellingId) {
        await this.props.requestRemoveFavoriteFromClient({dwellingId: dwellingId, clientId: this.props.userProfile.client});
        this.props.requestUserProfile();
    }

    async handleFavorite(favoriteToClient, dwellingId, clientsOptions) {
        if (favoriteToClient) {
            if (clientsOptions.length > 0) {
                await this.props.requestFavoriteToClients(clientsOptions);
                this.showAlert('Favoritos del cliente editados!', 'success', {favoriteMode: 1}, false);
            }
        } else {
            const favorite = this.props.userProfile;
            favorite['dwelling_id'] = dwellingId;
            await this.props.requestAddFavorite(favorite);
            if (this.props.userProfile.favorite.includes(dwellingId))
                this.showAlert('Eliminado de tus favoritos', 'success', {favoriteMode: 0}, false);
            else
                this.showAlert('Agregado a tus favoritos', 'success', {favoriteMode: 0}, false);
        }
    }

    toggleFavorite(dwellingId) {
        this.state.modalFavorite ? this.setState({modalFavorite: !this.state.modalFavorite})
            : this.setState({dwellingId: dwellingId, modalFavorite: !this.state.modalFavorite});
    }

    toggleShare(e, dwelling) {
        e.stopPropagation();
        if (this.state.modalShare) this.setState({modalShare: !this.state.modalShare});
        else this.setState({dwelling, modalShare: !this.state.modalShare});
    }

    renderContent() {
        const {dwellings} = this.props;
        const favorites = this.props.userProfile && this.props.userProfile.hasOwnProperty('favorite') ? this.props.userProfile.favorite : [];
        const clientUser = this.props.userProfile && this.props.userProfile.role === 'cliente';
        const clientFavorites = this.props.userProfile && this.props.userProfile['client_favorite'] ? this.props.userProfile['client_favorite'] : [];
        return (
            <Row className="highlights-main">
                {
                    this.props.userProfile !== 'anonymous' ?
                        dwellings.map(dwelling => {
                            const imageUrl = previewImage(dwelling, ['/upload/', '/upload/w_400,q_auto:eco,f_auto/'], 'http://via.placeholder.com/330x200?text=Sin+Imagen');
                            const title = DwellingTitle.get(dwelling, PLACE_OF_USAGE);

                            let marginShare = {marginRight: '40px', color: 'white'}, marginHeart = {};
                            if (clientUser && clientFavorites.includes(dwelling['_id'])) {
                                marginShare = {marginRight: '82px', color: 'white'};
                                marginHeart = {marginRight: '40px'};
                            }

                            return (
                                <Col className="prop-listing-margin-fix" sm={6} md={4} key={dwelling._id}>
                                    <div
                                        className="highlight-box"
                                        onClick={() => this.props.history.push(`/${dwelling.siocId}`)}
                                    >
                                        <div className="prop-detail-btns">
                                            <Button className="goto">
                                                <FontAwesome name="map-marker"/>
                                                <small style={{color: '#fff'}}> {dwelling.address.city} </small>
                                            </Button>
                                            <Button className="like" style={marginShare}
                                                onClick={e => this.toggleShare(e, dwelling)}>
                                                <FaShare/>
                                            </Button>
                                            <Button
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    this.myFavorite(dwelling['_id']);
                                                }}
                                                className="like"
                                                style={marginHeart}
                                            >
                                                {
                                                    favorites.includes(dwelling._id)?
                                                        <FontAwesome name="heart" size="lg" style={{color: '#fbad1c'}}/>
                                                    :
                                                        <FontAwesome name="heart" size="lg" style={{color: 'white'}}/>
                                                }
                                            </Button>
                                            { clientUser && clientFavorites.includes(dwelling['_id']) &&
                                            <Button
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    this.removeFavoriteFromClient(dwelling['_id']);
                                                }}
                                                className="like"
                                            >
                                                <FontAwesome name="times" size="lg" style={{color: '#fbad1c'}} />
                                            </Button>
                                            }
                                        </div>
                                        <div className="preview-img" style={{
                                            width: '100%',
                                            height: '200px',
                                            backgroundImage: 'url("' + imageUrl + '")'
                                        }} />
                                        <Row className="highlight-body" style={{left: '0px', right: '0px'}}>
                                            <Col sm={12}>
                                                {dwelling.price ?
                                                    <h4>
                                                        <small>{dwelling.currency && `${dwelling.currency}` || `$`}</small>
                                                        {dwelling.price}
                                                    </h4>
                                                    : <h4>Consulte</h4>}
                                                <h3 className="primary">{title}</h3>
                                            </Col>
                                            <Col sm={12}>
                                                <span className="pull-left">
                                                    {dwelling.createdAt !== dwelling.updatedAt ?
                                                        `Actualizado hace ${moment(dwelling.updatedAt).startOf('minutes').fromNow()}` :
                                                        `Subido ${moment(dwelling.createdAt).startOf('minutes').fromNow()}`}
                                                </span>
                                                <span className="pull-right">#{dwelling.siocId}</span>
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                            );
                        })
                        :
                        this.props.dwellings.map(dwelling => {
                            const imageUrl = previewImage(dwelling, ['/upload/', '/upload/w_400,q_auto:eco,f_auto/'], 'http://via.placeholder.com/330x220?text=Sin+Imagen');
                            const title = DwellingTitle.get(dwelling, PLACE_OF_USAGE);

                            return (
                                <Col className="prop-listing-margin-fix" sm={6} md={4} key={dwelling._id}>
                                    <div
                                        className="highlight-box"
                                        onClick={() => this.props.history.push(`/${dwelling.siocId}`)}
                                    >
                                        <div className="prop-detail-btns">
                                            <Button className="goto">
                                                <FontAwesome name="map-marker"/>
                                                <small style={{color: '#fff'}}> {dwelling.address.city} </small>
                                            </Button>
                                        </div>
                                        <div className="preview-img" style={{
                                            width: '100%',
                                            height: '200px',
                                            backgroundImage: 'url("' + imageUrl + '")'
                                        }} />
                                        <Row className="highlight-body">
                                            <Col sm={12}>
                                                {dwelling.price ?
                                                    <h4>
                                                        <small>{dwelling.currency && `${dwelling.currency}` || `$`}</small>
                                                        {dwelling.price}
                                                    </h4>
                                                    : <h4>Consulte</h4>}
                                                <h3 className="primary">{title}</h3>
                                            </Col>
                                            <Col sm={12}>
                                                <span className="pull-left">
                                                    {dwelling.createdAt !== dwelling.updatedAt ?
                                                        `Actualizado hace ${moment(dwelling.updatedAt).startOf('minutes').fromNow()}` :
                                                        `Subido ${moment(dwelling.createdAt).startOf('minutes').fromNow()}`}
                                                </span>
                                                <span className="pull-right">#{dwelling.siocId}</span>
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                            );
                        })
                }
            </Row>
        );
    }

    render() {
        return (
            <Container fluid className="animated fadeIn highlights" style={{padding: '0'}}>
                {/*<Col sm={12} className="text-center">
                    <hr/>
                    <h3>Presentamos las últimas novedades del <b>SIOC</b> en tiempo real!</h3>
                    <hr/>
                </Col>*/}
                {this.props.dwellings && this.renderContent()}
                <Row className="pt-5 mt-5 pb-5 mb-5">
                    <Col sm={12} className="text-center mb-5">
                        <Button
                            size="lg"
                            color="light"
                            onClick={() => this.props.history.push('/dwellings/latest')}
                        >
                            <FontAwesome name="angle-right"/> <FontAwesome name="angle-right"/> <FontAwesome name="angle-right"/> &nbsp; VER MÁS &nbsp; <FontAwesome name="angle-right"/> <FontAwesome name="angle-right"/> <FontAwesome name="angle-right"/>
                        </Button>
                    </Col>
                </Row>
                <ShareModal
                    modalShare={this.state.modalShare}
                    toggleShare={this.toggleShare}
                    dwelling={this.state.dwelling}
                    showAlert={this.showAlert} />
                <FavoriteModal
                    modalFavorite={this.state.modalFavorite}
                    toggleFavorite={this.toggleFavorite}
                    handleFavorite={this.handleFavorite}
                    userProfile={this.props.userProfile}
                    clientsOptions={this.props.clientsOptions}
                    dwellingId={this.state.dwellingId} />
                {this.state.alert}
            </Container>
        );
    }
}

export default withRouter(connect(
    state => ({
        userProfile: state.user.userProfile,
        dwellings: state.dwelling.dwellings,
        clientsOptions: state.client.clientsOptions
    }),
    dispatch => ({
        requestUserProfile: () => dispatch(requestUserProfile()),
        requestDwellings: () => dispatch(requestDwellings()),
        requestAddFavorite: favorite_data => dispatch(requestAddFavorite(favorite_data)),
        requestSearchClients: () => dispatch(requestSearchClients(null, true)),
        requestFavoriteToClients: (clientsOptions) => dispatch(requestFavoriteToClients(clientsOptions)),
        requestRemoveFavoriteFromClient: (data) => dispatch(requestRemoveFavoriteFromClient(data)),
    })
)(Search));
