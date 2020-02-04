import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {MoonLoader, BeatLoader} from 'react-spinners';
import FontAwesome from 'react-fontawesome';
import FaHeart from 'react-icons/lib/fa/heart';
import FaShare from 'react-icons/lib/fa/share-alt';
import FaImg from 'react-icons/lib/fa/image';
import FaBed from 'react-icons/lib/fa/bed';
import FaBank from 'react-icons/lib/fa/bank';
import FaPencil from 'react-icons/lib/fa/pencil';
import MdChart from 'react-icons/lib/md/show-chart';
import FaBuilding from 'react-icons/lib/fa/building';
import FaTint from 'react-icons/lib/fa/tint';
import FaPhone from 'react-icons/lib/fa/phone';
import FaAuto from 'react-icons/lib/fa/road';
import FaFire from 'react-icons/lib/fa/fire';
import MdLight from 'react-icons/lib/md/wb-incandescent';
import MdTv from 'react-icons/lib/md/tv';
import FaLeaf from 'react-icons/lib/fa/leaf';
import MdPatio from 'react-icons/lib/md/event-seat';
import FaArrows from 'react-icons/lib/fa/arrows-alt';

import InquiriesService from '../../services/inquiries';

import MdDirectionsCar from 'react-icons/lib/md/directions-car';
import FaIntersex from 'react-icons/lib/fa/intersex';
import MdBeachAccess from 'react-icons/lib/md/beach-access';
import LinkIcon from 'react-icons/lib/fa/external-link';
import SweetAlert from 'react-bootstrap-sweetalert';
import {
    Container,
    Row,
    Col,
    Button, Modal, ModalHeader, ModalBody, ModalFooter,
    UncontrolledCarousel, Input, FormGroup, Form, Label,
    UncontrolledTooltip
} from 'reactstrap';
import {
    FacebookShareButton,
    WhatsappShareButton,
    EmailShareButton,
    FacebookIcon,
    WhatsappIcon,
    EmailIcon
} from 'react-share';
import {withRouter} from 'react-router-dom';

import {
    requestDwelling,
    requestAddFavorite,
    requestUserProfile,
    requestAgencies,
    requestSendMessage,
    clearMessageSent,
    visitDwelling,
    requestSearchClients,
    requestFavoriteToClients
} from '../../actions/index';
import Clipboard from 'react-clipboard.js';
import {Helmet} from 'react-helmet';
import DwellingTitle from '../../services/dwellingTitle';
import FavoriteModal from '../common/Favorite/FavoriteModal';
import ModalCropper from '../common/ModalCropper';
import {previewImage} from '../common/utils/custom_helpers';
import moment from 'moment'

class Propiedades extends Component {
    static propTypes = {
        requestFindDwelling: PropTypes.func.isRequired,
        requestAddFavorite: PropTypes.func.isRequired,
        requestUserProfile: PropTypes.func.isRequired,
        requestSendMessage: PropTypes.func.isRequired,
        clearMessageSent: PropTypes.func.isRequired,
        requestAgencies: PropTypes.func.isRequired,
        requestSearchClients: PropTypes.func.isRequired,
        requestFavoriteToClients: PropTypes.func.isRequired,
        match: PropTypes.shape({
            params: PropTypes.shape({
                siocId: PropTypes.string
            })
        }),
        dwelling: PropTypes.shape({
            _id: PropTypes.string,
            siocId: PropTypes.number
        }),
        id: PropTypes.shape({
            id: PropTypes.string
        }),
        loading: PropTypes.bool,
        agencies: PropTypes.arrayOf(PropTypes.shape({})),
        messageSent: PropTypes.bool,
        sendingMessage: PropTypes.bool,
        visitDwelling: PropTypes.func.isRequired,
        visitedDwellings: PropTypes.arrayOf(PropTypes.string),
        headerImageUpdated: PropTypes.func.isRequired
    };

    static defaultProps = {
        dwelling: undefined,
        siocId: {
            siocId: ''
        },
        match: {},
        loading: true,
        agencies: [],
        messageSent: false,
        sendingMessage: false,
        visitedDwellings: [],
        userBelongsToAgency: false
    };

    constructor(props) {
        super(props);
        this.state = {
            modalShare: false,
            modalImg: false,
            alert: null,
            communicationForm: {
                name: '',
                phone: '',
                email: '',
                agencyEmail: '',
                agencyName: '',    //inserted by galaxy 2019/10/30
                message: '',
                dwellingId: '',
                siocId: ''
            },
            hasEmail: true,
            modalFavorite: false,
            dwellingId: null,
            agencyId : null,     //inserted by galaxy 2019/10/30
            counterflag : '',     //inserted by galaxy 2019/10/30
            userrole : '',     //inserted by galaxy 2019/10/30
            date: moment().format(),
            modalCropper: false
        };
        this.toggleShare = this.toggleShare.bind(this);
        this.toggleFavorite = this.toggleFavorite.bind(this);
        this.handleFavorite = this.handleFavorite.bind(this);
        this.toggleImg = this.toggleImg.bind(this);
        this.toggleCropper = this.toggleCropper.bind(this);
    }

    componentDidMount() {
        this.props.requestUserProfile();
        this.props.requestAgencies();

        this.requestDwelling();

        if (this.props.userProfile && ['martillero', 'vendedor'].includes(this.props.userProfile.role)) {
            this.props.requestSearchClients();
        }
    }

    componentWillReceiveProps(props) {
        if (props.messageSent) {
            this.showAlert('Mensaje enviado con éxito.', 'success', null, false);
            this.props.clearMessageSent();
        }
        if (!this.props.userProfile && props.userProfile && ['martillero', 'vendedor'].includes(props.userProfile.role)) {
            this.props.requestSearchClients();
        }
    }

    toggleShare(event) {
        if (event) event.stopPropagation();
        this.setState({modalShare: !this.state.modalShare});
    }

    toggleImg() {
        this.setState({modalImg: !this.state.modalImg});
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

    //inserted by galaxy 2019/10/29
    calcTime( offset, seletdate) {

        // create Date object for current location
        // convert to msec
        // add local time zone offset
        // get UTC time in msec
        var utc = new Date(seletdate).getTime() + (new Date(seletdate).getTimezoneOffset() * 60000);
       
        // create new Date object for different city
        // using supplied offset
        var nd = new Date(utc + (3600000*offset));
       
        // return time as a string
        return  nd.toLocaleString();
    
    }

    async handleWhastapp(){
        
        window.open(`https://wa.me/${this.props.dwelling.createdBy.whatsapp}?text=Hola! Estoy interesado en la propiedad ${this.props.dwelling.siocId}  https://www.sioc.com.ar/${this.props.dwelling.siocId}`);        
        try {
            const agencyId_dwelling = await InquiriesService.findDwellings(this.props.dwelling._id);

            var agency = {
                agencyId : agencyId_dwelling
            };
            const user = await InquiriesService.findUser(agency);

            this.setState({
                agencyId: agencyId_dwelling,
                userrole: user.role,
                dwellingId: this.props.dwelling._id,
                counterflag: "whatsapp"
            });
                
            const result_add = await InquiriesService.addwhatsappcounter(this.state);
          

        } catch (ex) {
            this.setState({invalidLogin: true});
        }
    }

    //end inserted

    async handleSubmit(e) {

        e.preventDefault();

        const {communicationForm} = this.state;
        communicationForm.dwellingId = this.props.dwelling._id;
        communicationForm.siocId = this.props.dwelling.siocId;
        if (this.props.dwelling.publicationType === 'Alquiler') {
            communicationForm.agencyEmail = this.props.dwelling.agency.email;
        } else {
            if (!communicationForm.agencyEmail) {
                communicationForm.agencyEmail = this.props.dwelling.agency.email;
            }
        }

        const {dwelling} = this.props;
        const title = DwellingTitle.get(dwelling);

        communicationForm.message = `<br/><b>${dwelling.siocId}</b> - ${title}<br/>https://www.sioc.com.ar/${dwelling.siocId}<br/><br/>${communicationForm.message}`;
        this.props.requestSendMessage(communicationForm);
        this.setState({
            communicationForm: {
                name: '',
                phone: '',
                email: '',
                agencyEmail: communicationForm.agencyEmail,
                message: '',
                dwellingId: ''
            }
        });
        const agencyId_dwelling = await InquiriesService.findDwellings(this.props.dwelling._id);

        var agency = {
            agencyId : agencyId_dwelling
        };
        const user = await InquiriesService.findUser(agency);
        
        this.setState({
            agencyId: agencyId_dwelling,
            userrole: user.role,
            dwellingId: this.props.dwelling._id,
            counterflag: "mail"
        });
        const result_add = await InquiriesService.addwhatsappcounter(this.state);

    }

    handleSelectChange(event) {
        const agencyEmail = event.target.value;
        const hasEmail = !!agencyEmail;

        this.setState({
            communicationForm: (Object.assign(this.state.communicationForm, {agencyEmail})),
            hasEmail
        });
    }

    handleChange(value, id) {
        this.setState(
            state => ({
                communicationForm: (Object.assign(state.communicationForm, {[id]: value}))
            })
        );
    }

    createSelectItems() {
        const dwelling = this.props.dwelling;
        const agencyId = dwelling.publicationType === 'Venta' ? dwelling.agency._id : undefined;
        let agencyOptions = [];

        this.props.agencies.filter(agency => !agency.deleted || agency.deleted === false).forEach(agency => {
            if (dwelling.publicationType === 'Venta' && agency._id === agencyId) {
                agencyOptions.unshift(<option key={agency._id} value={agency.email}>{agency.name}</option>);
            } else {
                agencyOptions.push(<option key={agency._id} value={agency.email}>{agency.name}</option>);
            }
        });

        return agencyOptions;
    }

    copyLink() {
        this.showAlert('Link copiado al portapapeles!', 'success', '', false);
    }

    toggleCropper(event, updated) {
        if (event) event.stopPropagation();
        this.setState({modalCropper: !this.state.modalCropper});
        if (updated) {
            this.props.headerImageUpdated();
        }
    }

    requestDwelling() {
        if (this.props.match.params === undefined) {
            const {siocId} = this.props.siocId;
            if (siocId) this.props.requestFindDwelling(siocId);
        } else {
            const {siocId} = this.props.match.params;
            if (siocId) this.props.requestFindDwelling(siocId);
        }
    }

    renderContent() {
        const {dwelling} = this.props;
        if (!dwelling) return null;

        const siocId = this.props.dwelling.siocId;
        const shareUrl = `https://www.sioc.com.ar/${siocId}`;
        const title = DwellingTitle.get(dwelling);

        const favorites = this.props.userProfile && this.props.userProfile.hasOwnProperty('favorite') ? this.props.userProfile.favorite : [];
        const items = [];
        const imageUrl = previewImage(dwelling, [], 'http://via.placeholder.com/1000?text=Sin+Imagen');

        if (dwelling.images.length > 0) {
            dwelling.images.map(image => {
                items.push({src: image.secure_url.replace('/upload/', '/upload/w_auto,q_auto:good,f_auto/'), caption: ''});
            });
        }

        const rowClassCol = dwelling.publicationType === 'Alquiler' ? 4 : 3;

        return (
            <div>
                <Helmet>
                    <meta charSet="utf-8"/>
                    <title>{title}</title>
                    <meta property="og:url" content={shareUrl}/>
                    <meta property="og:title" content={title}/>
                    <meta property="og:description" content={dwelling.generalDescription}/>
                    <meta property="og:image" content={imageUrl}/>
                </Helmet>

                <div
                    className={'head-img'}
                    style={{backgroundImage: `url(${imageUrl})`}}
                    onClick={this.toggleImg}>
                    <div className="d-flex flex-row">
                        <Button className="p-2 mr-1" onClick={e => this.toggleShare(e)}><FaShare/>{' '} Compartir</Button>

                        {
                            this.props.userProfile !== 'anonymous' &&
                            <Button
                                className="p-2"
                                onClick={e => {
                                    e.stopPropagation();
                                    this.myFavorite(dwelling._id);
                                }}
                            >
                            {
                                favorites.includes(dwelling['_id']) ? <FaHeart style={{color: '#fbad1c'}}/> : <FaHeart/>
                            }
                            {' '} Guardar
                        </Button>
                        }
                        <Button className="ml-auto mr-1 p-2" onClick={this.toggleImg}><FaImg/>{' '} Ver más</Button>
                        {
                            this.props.userBelongsToAgency &&
                            <Button className="p-2" onClick={e => this.toggleCropper(e, false)}><FaArrows/>{' '} Ajustar</Button>
                        }
                    </div>
                </div>

                <Modal isOpen={this.state.modalShare} toggle={this.toggleShare} className={this.props.className}>
                    <ModalHeader toggle={this.toggleShare}>Compartir Propiedad</ModalHeader>
                    <ModalBody className="mt-4 mb-4 d-flex justify-content-around">
                        <FacebookShareButton
                            url={shareUrl}
                            quote={`${title}.`}
                            style={{cursor: 'pointer'}}>
                            <FacebookIcon size={40} round/>
                        </FacebookShareButton>
                        <WhatsappShareButton
                            url={shareUrl}
                            title={`${title}.`}
                            separator=" Más info en el SIOC >>> "
                            picture={imageUrl}
                            style={{cursor: 'pointer'}}
                        >
                            <WhatsappIcon size={40} round/>
                        </WhatsappShareButton>
                        <EmailShareButton
                            url={shareUrl}
                            subject={`${title}.`}
                            body={dwelling.generalDescription +" Más info en el SIOC >>> "+ shareUrl}
                            separator=" Más info en el SIOC >>> "
                            style={{cursor: 'pointer'}}
                        >
                            <EmailIcon size={40} round/>
                        </EmailShareButton>
                    </ModalBody>
                    <ModalFooter className="justify-content-around">
                        <Clipboard
                            style={{color: '#003d6f', fontSize: '14px'}}
                            component="a"
                            data-clipboard-text={shareUrl}
                            onSuccess={this.copyLink.bind(this)}>
                            <LinkIcon /> Copiar Link
                        </Clipboard>
                    </ModalFooter>
                </Modal>
                <Modal isOpen={this.state.modalImg} toggle={this.toggleImg} className="modal-prop-imgs">
                    <UncontrolledCarousel items={items} />
                </Modal>
                <ModalCropper
                    modalCropper={this.state.modalCropper}
                    toggleCropper={this.toggleCropper}
                    dwelling={dwelling} />

                <Container>
                    <Row>
                        <Col sm={12} className="head">
                            <div className="head-main">
                                <div className="head-pre mt-5">
                                    {dwelling.features.status}
                                </div>
                                <div className="head-title">
                                    {title}
                                </div>
                                <div className="head-sub">
                                    cód: {dwelling.siocId}
                                </div>
                                <Row className="price mt-4">
                                    <div className="number">
                                        {dwelling.price
                                            ? <span>{dwelling.currency && `${dwelling.currency}` || `$`}<b>{dwelling.price}</b> </span>
                                            : <span>Consulte Precio</span>
                                        }
                                    </div>
                                    <div className="price-detail">
                                        {dwelling.legal.bank &&
                                            <span><FaBank/>Apto Banco</span>
                                        }{' '}
                                        {dwelling.legal.prof &&
                                            <span><FaPencil/>Apto Profesional</span>
                                        }
                                        {dwelling.services.expenses &&
                                            <div className="expenses">
                                            Expensas: ${dwelling.services.expenses}
                                            </div>
                                        }
                                    </div>
                                </Row>
                            </div>
                        </Col>

                        <Col sm={12} className="content">
                            <div className="content-highlights d-flex flex-wrap">
                                {dwelling.spaces.floors > 1 &&
                                <span>
                                    <FaBuilding/> {' '}
                                    {dwelling.spaces.floors} Plantas
                                </span>}

                                {dwelling.spaces.bedrooms > 0 &&
                                <span>
                                    <FaBed/> {' '}
                                    {dwelling.spaces.bedrooms} Dormitorios
                                </span>}

                                {dwelling.spaces.bathRoom > 0 &&
                                <span>
                                    <FontAwesome name="bath" style={{marginRight: '4px'}}/>
                                    {dwelling.spaces.bathRoom} Baños
                                </span>}

                                {dwelling.spaces.garden &&
                                <span>
                                    <FaLeaf/>{' '}
                                    Jardín
                                </span>}

                                {dwelling.spaces.backYard &&
                                <span>
                                    <MdPatio/>{' '}
                                    Patio
                                </span>}

                                {(dwelling.spaces.toilette > 0) &&
                                <span>
                                    <FaIntersex/>
                                    {dwelling.spaces.toilette} Toilette
                                </span>}

                                {dwelling.spaces.swimmingPool &&
                                <span>
                                    <MdBeachAccess/>
                                    Piscina
                                </span>}

                                {dwelling.spaces.barbecue &&
                                <span>
                                    <FontAwesome name="fire" style={{marginRight: '4px'}}/>
                                    Parrilla
                                </span>}
                                {(dwelling.spaces.garage !== undefined && dwelling.spaces.garage !== 'No') &&
                                <span>
                                    <MdDirectionsCar/>
                                    Garage {dwelling.spaces.garage}
                                </span>}
                            </div>
                            <div
                                className="content-main"
                                dangerouslySetInnerHTML={{__html: dwelling.generalDescription}}
                            />
                            <hr/>
                            {
                                (dwelling.features.lotSurface > 0 ||
                                dwelling.features.coveredSurface > 0 ||
                                dwelling.features.totalSurface > 0 ||
                                dwelling.features.lotWidth > 0 ||
                                dwelling.features.lotLength > 0) &&
                                <div>
                                    <div className="content-info d-flex flex-wrap">
                                        {dwelling.features.lotSurface > 0 &&
                                        <span>
                                            <p>sup. total</p>
                                            <h1>{dwelling.features.lotSurface}<small> mt2</small></h1>
                                        </span>}

                                        {dwelling.features.coveredSurface > 0 &&
                                        <span>
                                            <p>sup. cubierta</p>
                                            <h1>{dwelling.features.coveredSurface}<small> mt2</small></h1>
                                        </span>}

                                        {dwelling.features.totalSurface > 0 &&
                                        <span>
                                            <p>sup. semicubierta</p>
                                            <h1>{dwelling.features.totalSurface}<small> mt2</small></h1>
                                        </span>}

                                        {dwelling.features.lotWidth > 0 &&
                                        <span>
                                            <p>frente</p>
                                            <h1>{dwelling.features.lotWidth}<small> m</small></h1>
                                        </span>}
                                        {dwelling.features.lotLength > 0 &&
                                        <span>
                                            <p>fondo</p>
                                            <h1>{dwelling.features.lotLength}<small> m</small></h1>
                                        </span>}
                                    </div>
                                    <hr/>
                                </div>
                            }

                            {
                                (dwelling.spaces.closets > 0 ||
                                (dwelling.spaces.laundryRoom !== undefined && dwelling.spaces.laundryRoom !== 'No') ||
                                dwelling.spaces.terrace === true ||
                                dwelling.spaces.balcony === true ||
                                dwelling.spaces.living === true ||
                                dwelling.spaces.livingDining === true ||
                                dwelling.spaces.diningRoom === true ||
                                dwelling.spaces.dailyDiningRoom === true ||
                                dwelling.spaces.kitchen === true ||
                                dwelling.spaces.kitchenDining === true) &&
                                <div className="content-info-detailed mt-4 mb-4">
                                    <h2>Cuenta con:</h2>
                                    <Row>
                                        {(dwelling.spaces.closets > 0) &&
                                            <span>{dwelling.spaces.closets} Placard </span> }
                                        {(dwelling.spaces.laundryRoom !== undefined &&
                                            dwelling.spaces.laundryRoom !== 'No') &&
                                            <span>Lavadero {dwelling.spaces.laundryRoom} </span> }
                                        {(dwelling.spaces.terrace === true) && <span>Terraza </span> }
                                        {(dwelling.spaces.balcony === true) && <span>Balcón </span> }
                                        {(dwelling.spaces.living === true) && <span> Living </span> }
                                        {(dwelling.spaces.livingDining === true) && <span>Living comedor </span> }
                                        {(dwelling.spaces.diningRoom === true) && <span>Comedor </span> }
                                        {(dwelling.spaces.dailyDiningRoom === true) && <span>Comedor Diario</span> }
                                        {(dwelling.spaces.kitchen === true) && <span>Cocina </span> }
                                        {(dwelling.spaces.kitchenDining === true) && <span>Cocina comedor </span> }
                                    </Row>
                                </div>
                            }
                        </Col>

                        <Col sm={6} className="content">
                            <div className="content-main">
                                { (dwelling.features.luminosity ||
                                    dwelling.features.orientation ||
                                    dwelling.features.floor ||
                                    dwelling.features.apartments ||
                                    dwelling.features.location ||
                                    dwelling.features.security ||
                                    dwelling.features.depser ||
                                    dwelling.features.constructionYear ||
                                    dwelling.features.repair ||
                                    dwelling.features.refurbished) &&
                                    <div className="boxed">
                                        <h4 className="azul-sioc">Características:</h4>
                                        <p>
                                            {dwelling.features.luminosity && dwelling.features.luminosity !== 'Desconocida' && <span>Luminosidad: <b>{dwelling.features.luminosity}</b> <span className="azul-sioc"></span><br/></span>} {' '}
                                            {dwelling.features.orientation && dwelling.features.orientation !== 'Desconocida' && <span>Orientación: <b>{dwelling.features.orientation}</b> <span className="azul-sioc"></span><br/></span>} {' '}
                                            {dwelling.features.floor > 0 && <span>Piso: <b>{dwelling.features.floor}</b> <span className="azul-sioc"></span><br/></span>} {' '}
                                            {dwelling.features.apartments && dwelling.features.apartments !== 'Desconocida' && <span>Dtos x piso: <b>{dwelling.features.apartments}</b> <span className="azul-sioc"></span><br/></span>} {' '}
                                            {dwelling.features.location && dwelling.features.location !== 'Desconocida' && <span>Ubicación: <b>{dwelling.features.location}</b> <span className="azul-sioc"></span><br/></span>} {' '}
                                            {dwelling.features.security && dwelling.features.security !== 'Desconocida' && <span>Seguridad: <b>{dwelling.features.security}</b> <span className="azul-sioc"></span><br/></span>} {' '}
                                            {dwelling.features.depser && dwelling.features.depser !== 'Desconocida' && <span>Dep. Servicios: <b>{dwelling.features.depser}</b> <span className="azul-sioc"></span><br/></span>} {' '}
                                            {dwelling.features.antiquity && dwelling.features.antiquity !== 'Desconocida' && <span>Antiguedad: <b>{dwelling.features.antiquity}</b> <span className="azul-sioc"></span><br/></span>} {' '}
                                            {dwelling.features.constructionYear && dwelling.features.constructionYear !== 'Desconocida' && <span>Año de Construcción: <b>{dwelling.features.constructionYear}</b> <span className="azul-sioc"></span><br/></span>} {' '}
                                            {dwelling.features.repair && dwelling.features.repair !== 'Desconocida' && <span>Fue refaccionada: <b>{dwelling.features.repair}</b> <span className="azul-sioc"></span><br/></span>} {' '}
                                            {dwelling.features.refurbished === true && <span>Por refaccionar: <b>Si</b> <span className="azul-sioc"></span><br/></span>} {' '}
                                        </p>
                                    </div>
                                }
                            </div>
                        </Col>
                        <Col sm={6} className="content">
                            <div className="content-main">
                                { (dwelling.services.gas || dwelling.services.sewer || dwelling.services.water || dwelling.services.phone || dwelling.services.pavement || dwelling.services.electricity || dwelling.services.cable) == true &&
                                <div className="boxed">
                                    <h4 className="azul-sioc">Con que servicios cuenta?</h4>
                                    <Row>
                                        <div>
                                            {(dwelling.services.gas === true) && <div><FaFire/> Gas </div>}{' '}
                                            {(dwelling.services.sewer === true) && <div><MdChart/> Cloacas </div>}{' '}
                                            {(dwelling.services.water === true) && <div><FaTint/> Agua Corriente </div>}{' '}
                                            {(dwelling.services.phone === true) && <div><FaPhone/> Teléfono </div>}{' '}
                                            {(dwelling.services.pavement === true) && <div><FaAuto/> Asfalto </div>}{' '}
                                            {(dwelling.services.electricity === true) && <div><MdLight/> Electricidad </div>}{' '}
                                            {(dwelling.services.cableTv === true) && <div><MdTv/> TV Cable </div>}{' '}
                                        </div>
                                    </Row>
                                    {(dwelling.tax.aprTax || dwelling.tax.absaTax || dwelling.tax.arbaTax) != 0 &&
                                    <Row className="w-100 m-0">
                                        <hr/>
                                        {dwelling.tax.aprTax &&
                                        <Col xs={4} className="m-0">
                                            APR: <b className="azul-sioc">${dwelling.tax.aprTax}</b>
                                        </Col>
                                        }
                                        {dwelling.tax.absaTax &&
                                        <Col xs={4} className="m-0">
                                            ABSA: <b className="azul-sioc">${dwelling.tax.absaTax}</b>
                                        </Col>
                                        }
                                        {dwelling.tax.arbaTax &&
                                        <Col xs={4} className="m-0">
                                            ARBA: <b className="azul-sioc">${dwelling.tax.arbaTax}</b>
                                        </Col>
                                        }
                                    </Row>
                                    }
                                </div>
                                }
                            </div>
                        </Col>

                        <Col sm={12}>
                            <hr/>
                        </Col>

                        <Col sm={12} className="content-map mb-5">
                            {this.renderMap()}
                        </Col>

                        <Col sm={12} className="text-center">
                            <hr/>
                            <h3>Consultanos ahora! Puede ser tuya...</h3>
                            <hr/>
                        </Col>

                        <Col sm={12} className="text-center mt-5 mb-5">
                            <div className="pr-box text-center">
                                <a onClick={() => this.handleWhastapp()} style={{cursor: 'pointer'}}>
                                    <FontAwesome
                                        name="whatsapp"
                                        size="5x"
                                        style={{color: '#25d366'}}
                                    />
                                    <h4>Escribinos por <span style={{color: '#25d366'}}>Whatsapp</span> web!</h4>
                                </a>
                            </div>
                        </Col>

                        <Col sm={12} className="mt-5 mb-5">
                        <Form className="dwelling-detail-form" onSubmit={e => this.handleSubmit(e)}>
                                <fieldset disabled={this.props.sendingMessage}>
                                    <div className="pr-box">
                                        <Row className="mb-3">
                                            <Col>
                                                <h4 className="text-center">
                                                    {/* Escribinos ahora por
                                                        <a
                                                            onClick={() => window.open(`https://wa.me/${this.props.dwelling.createdBy.whatsapp}?text=Hola! Estoy interesado en la propiedad ${this.props.dwelling.siocId} https://www.sioc.com.ar/${this.props.dwelling.siocId}`)}
                                                            target="_blank"
                                                            style={{color: '#25d366'}}>Whatsapp Web
                                                        </a>
                                                    */}
                                                    O dejanos un mensaje y nosotros nos comunicamos.
                                                </h4>
                                            </Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Col xs={12} sm={rowClassCol} className="mb-2">
                                                <Input
                                                    id="name"
                                                    value={this.state.communicationForm.name}
                                                    placeholder="Nombre"
                                                    onChange={e => this.handleChange(e.target.value, 'name')}
                                                    required
                                                />
                                            </Col>
                                            <Col xs={12} sm={rowClassCol} className="mb-2">
                                                <Input
                                                    type="tel"
                                                    id="phone"
                                                    value={this.state.communicationForm.phone}
                                                    onChange={e => this.handleChange(e.target.value, 'phone')}
                                                    placeholder="Cel."
                                                    required
                                                />
                                            </Col>
                                            <Col xs={12} sm={rowClassCol} className="mb-2">
                                                <Input
                                                    type="email"
                                                    id="email"
                                                    value={this.state.communicationForm.email}
                                                    onChange={e => this.handleChange(e.target.value, 'email')}
                                                    placeholder="E-mail"
                                                    required
                                                />
                                            </Col>
                                            { rowClassCol === 3 &&
                                                <Col xs={12} sm={3}>
                                                    <FormGroup>
                                                        <Input
                                                            type="select"
                                                            onChange={e => this.handleSelectChange(e)}
                                                            label="Que inmobiliaria elegís?"
                                                            required
                                                        >
                                                            <option value="NO_AGENCY">Alguna inmobiliaria en especial?</option>
                                                            {this.createSelectItems()}
                                                        </Input>
                                                        {!this.state.hasEmail && <Label><span style={{color: 'red'}}>A la agencia le falta el correo electrónico</span></Label>}
                                                    </FormGroup>
                                                </Col>
                                            }
                                        </Row>
                                        <Row>
                                            <Col>
                                                <Input
                                                    type="textarea"
                                                    id="message"
                                                    value={this.state.communicationForm.message}
                                                    onChange={e => this.handleChange(e.target.value, 'message')}
                                                    placeholder="Mensaje"
                                                    required
                                                />
                                            </Col>
                                        </Row>
                                        <FormGroup className="text-center mt-3">
                                            {this.props.sendingMessage ? (
                                                <div>
                                                    <BeatLoader
                                                        color="#fbad1c"
                                                    />
                                                </div>
                                            ) : (
                                                <Button size="lg" className="btn-send-message" type="submit">
                                                    ENVIAR
                                                </Button>
                                            )}
                                        </FormGroup>
                                    </div>
                                </fieldset>
                            </Form>

                        </Col>
                    </Row>
                </Container>
                <Row className="float-btns proceed-btns">
                    <Col className="text-right">
                        <Button id="GoBack" className="goback" onClick={() => this.props.history.goBack()}>
                            <FontAwesome name="angle-left"/>
                            <UncontrolledTooltip placement="top" target="GoBack"> Volver </UncontrolledTooltip>
                        </Button> {' '}
                        <Button
                            onClick={() => this.handleWhastapp()}
                            id="Whatsapp"
                            className="whatsapp"
                        >
                            <FontAwesome name="whatsapp"/>
                            <UncontrolledTooltip placement="top" target="Whatsapp"> Escribinos por whatsapp
                                web
                            </UncontrolledTooltip>
                        </Button>
                    </Col>
                </Row>
            </div>
        );
    }

    renderMap() {
        const dwelling = this.props.dwelling;
        const center = `${dwelling.address.latitude},${dwelling.address.altitude}`;
        return (
            <iframe
                width="100%"
                height="250"
                allowFullScreen
                frameBorder="0"
                style={{border:0}}
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyAoyN3MVzA2q2XIxZ7jwRz54uo4C08ZUpQ&q=${center}&center=${center}&zoom=15`} />
        );
    }

    render() {
        return (
            (this.props.loading ?
                <div className="overlay-spinner">
                    <MoonLoader className="overlay-spinner-child"/>
                </div>
                :
                <div className="single-page">
                    {this.props.dwelling && this.renderContent()}
                    <FavoriteModal
                        modalFavorite={this.state.modalFavorite}
                        toggleFavorite={this.toggleFavorite}
                        handleFavorite={this.handleFavorite}
                        userProfile={this.props.userProfile}
                        clientsOptions={this.props.clientsOptions}
                        dwellingId={this.state.dwellingId} />
                    {this.state.alert}
                </div>
            )
        );
    }
}


export default withRouter(connect(
    state => ({
        loading: state.dwelling.loading,
        dwelling: state.dwelling.dwelling,
        userProfile: state.user.userProfile,
        agencies: state.agency.agencies,
        sendingMessage: state.dwelling.sendingMessage,
        messageSent: state.dwelling.messageSent,
        messageFailed: state.dwelling.messageFailed,
        visitedDwellings: state.dwelling.visitedDwellings,
        clientsOptions: state.client.clientsOptions
    }),
    dispatch => ({
        requestUserProfile: () => dispatch(requestUserProfile()),
        requestFindDwelling: siocId => dispatch(requestDwelling(siocId)),
        requestAddFavorite: favorite_data => dispatch(requestAddFavorite(favorite_data)),
        requestAgencies: () => dispatch(requestAgencies()),
        requestSendMessage: data => dispatch(requestSendMessage(data)),
        clearMessageSent: () => dispatch(clearMessageSent()),
        visitDwelling: dwellingId => dispatch(visitDwelling(dwellingId)),
        requestSearchClients: () => dispatch(requestSearchClients(null, true)),
        requestFavoriteToClients: (clientsOptions) => dispatch(requestFavoriteToClients(clientsOptions))
    })
)(Propiedades));
