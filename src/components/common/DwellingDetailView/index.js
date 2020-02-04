/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, {Component, Fragment} from 'react';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {replace, isEmpty, forEach} from 'lodash';
import {
    Row,
    Col,
    FormGroup,
    Button,
    ButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Input,
    InputGroup,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter
} from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import moment from 'moment';
import {BeatLoader} from 'react-spinners';

import Typeahead from '../../common/Typeahead';
import Propiedades from '../../Propiedades';

import {
    requestDwelling,
    requestSaveDwelling,
    savePartialDwelling,
    requestAgencies,
    requestSearchClients,
    saveVisit,
    requestSearchUsers,
    requestReplaceCreator
} from '../../../actions/index';

import {Visit} from '../../../model/index';
import '../../../sass/common.scss';

moment.locale('es');

class DwellingDetailView extends Component {
    static propTypes = {
        requestFindDwelling: PropTypes.func.isRequired,
        requestSearchClients: PropTypes.func.isRequired,
        requestSaveDwelling: PropTypes.func.isRequired,
        requestAgencies: PropTypes.func.isRequired,
        savePartialDwelling: PropTypes.func.isRequired,
        saveVisit: PropTypes.func.isRequired,
        requestSearchUsers: PropTypes.func.isRequired,
        requestReplaceCreator: PropTypes.func.isRequired,
        clientsOptions: PropTypes.arrayOf(PropTypes.shape({})),
        match: PropTypes.shape({
            params: PropTypes.shape({
                siocId: PropTypes.string
            })
        }),
        dwelling: PropTypes.shape({}),
        siocId: PropTypes.string,
        agencies: PropTypes.arrayOf(PropTypes.shape({})),
        visit: PropTypes.shape({}),
        savingFile: PropTypes.bool
    };

    static defaultProps = {
        dwelling: undefined,
        siocId: '',
        match: {},
        agencies: [],
        clientsOptions: [],
        usersOptions: [],
        visit: new Visit(),
        savingFile: false
    };

    constructor(props) {
        super(props);
        this.state = {
            visitOrderModal: false,
            createdByModal: false,
            ownerModal: false,
            descriptionModal: false,
            printOptionsModal: false,
            dropdownOpen: false,
            visit: new Visit(),
            first: true,
            selectedPrintOption: 'noImages',
            printGridSizeOption: '4',
            selectedPrintImages: []
        };
        this.requestDwelling = this.requestDwelling.bind(this);
    }

    componentDidMount() {
        this.props.requestAgencies();

        this.requestDwelling();
    }

    componentWillReceiveProps(props) {
        if (props.dwelling && props.usersOptions.length === 0 && this.state.first) {
            this.props.requestSearchUsers(undefined, undefined, props.dwelling.agency._id);
            this.setState({first: false});
        }
    }

    editClient(client) {
        this.props.history.push({pathname: '/admin/clients/edit', state: {client}});
    }

    toggleModals(modal) {
        this.setState({
            [modal]: !this.state[modal]
        });
    }

    parseHtmlForPrinting(pageEl) {
        // FIXME: Find another way of getting the element in React without using documet.
        // Merge two regexes into one if possible! For now this works!
        let filteredPageHtml = replace(pageEl.outerHTML, /<form.*\/form>/gm, '');
        filteredPageHtml = replace(filteredPageHtml, /<button(.*?)(?:\s|)<\/button>/gm, '');
        filteredPageHtml = replace(filteredPageHtml, '<div class="text-center mt-5 mb-5 col-sm-12"><div class="pr-box text-center"><a style="cursor: pointer;"><span aria-hidden="true" class="fa fa-whatsapp fa-5x" style="color: rgb(37, 211, 102);"></span><h4>Escribinos por <span style="color: rgb(37, 211, 102);">Whatsapp</span> web!</h4></a></div></div>', '');
        filteredPageHtml = replace(filteredPageHtml, '<div class="text-center col-sm-12"><hr><h3>Consultanos ahora! Puede ser tuya...</h3><hr></div>', '');
        filteredPageHtml = replace(filteredPageHtml, '<div class="mt-5 mb-5 col-sm-12"></div>', '');
        filteredPageHtml = `<h2 class="text-center mb-0">${this.props.userProfile.agency}</h2>${filteredPageHtml}`;

        if (this.state.selectedPrintOption === 'noImages') {
            filteredPageHtml = replace(filteredPageHtml, /<div class="head-img" (.*?)<\/div><\/div>/, '');
        } else {
            filteredPageHtml = replace(filteredPageHtml, /<div class="head-img" /, '<div class="head-img-print"');
        }

        if (this.state.selectedPrintOption === 'allImages' &&
            this.state.selectedPrintImages &&
            this.state.selectedPrintImages.length > 0) {
            const otherImages = this.state.selectedPrintImages.map(image => {
                if (!image.selectedForPrint) {
                    return null;
                }

                return `
                    <div class="col-${this.state.printGridSizeOption} text-center">
                        <img class="img-fluid p-1" src="${image.url}"/>
                    </div>
                `;
            });

            filteredPageHtml = `
                ${filteredPageHtml}
                <div class="container">
                    <div class="row mt-3">${otherImages.join('')}</div>
                </div>
            `;
        }

        return filteredPageHtml;
    }

    handlePrintPage() {
        if (!this.props.savingFile) {
            const pageEl = document.querySelector('.single-page');
            const finalParsedHtml = this.parseHtmlForPrinting(pageEl);

            // eslint-disable-next-line no-undef
            const encodedData = btoa(encodeURIComponent(finalParsedHtml));
            // eslint-disable-next-line no-undef
            localStorage.setItem('printDocument', encodedData);
            // eslint-disable-next-line no-undef
            this.openInNewTab(`${window.location.origin}/print-document`);
        }
    }

    openInNewTab(url) {
        const win = window.open(url, '_blank');
        win.focus();
    }

    handleTypeahead(client) {
        this.setState(
            state => ({
                visit: {
                    ...state.visit,
                    client: {value: client.value, label: client.label},
                    dwelling: this.props.dwelling._id,
                    agency: {received: this.props.dwelling.agency._id}
                }
            })
        );
    }

    handleVisit({target: {id, value}}) {
        this.setState(
            state => ({
                visit: {...state.visit, [id]: value}
            })
        );
    }

    async handleSubmit() {
        await this.props.saveVisit(this.state.visit);
        this.toggleModals('visitOrderModal');
        window.open(`https://wa.me/${this.props.dwelling.createdBy.whatsapp}?text=Hola ${this.props.dwelling.createdBy.name} ${this.props.dwelling.createdBy.surname}!%20Necesito hacerte un pedido de visita! Sería para la propiedad%20${this.props.dwelling.siocId}.%20Agradecería si podés confirmarme el pedido por sistema.%20Saludos, ${this.props.userProfile.name} ${this.props.userProfile.surname}.%20https://www.sioc.com.ar`);
    }

    handleChange(e, type) {
        if (type === 'occupationStatus') {
            const dwelling = Object.assign({}, this.props.dwelling);
            dwelling.occupationStatus = e.target.value;
            dwelling.updatedAt = new Date();
            dwelling.occupationStatusHistory.push({user: this.props.userProfile, status: e.target.value});
            this.props.requestSaveDwelling(dwelling);
            this.props.savePartialDwelling(dwelling);
        }
    }

    handlePrintOptionsChange(e) {
        const selectedPrintOption = e.target.value;
        const selectedPrintImages = [];

        if (selectedPrintOption === 'allImages') {
            forEach(this.props.dwelling.images, (image, index) => {
                if (index > 0) {
                    selectedPrintImages.push({...image, selectedForPrint: true});
                }
            });
        }

        this.setState({
            selectedPrintOption,
            selectedPrintImages
        });
    }

    handleGridSizeOptionChange(e) {
        const printGridSizeOption = e.target.value;

        this.setState({
            printGridSizeOption
        });
    }

    handleImageSelected(index) {
        const selectedPrintImages = [...this.state.selectedPrintImages];

        selectedPrintImages[index].selectedForPrint = !selectedPrintImages[index].selectedForPrint;

        this.setState({
            selectedPrintImages
        });
    }

    toggleDropdown() {
        this.setState({dropdownOpen: !this.state.dropdownOpen});
    }

    chooseItem(item, e) {
        e.preventDefault();
        this.props.requestReplaceCreator({id: this.props.dwelling._id, replaceByUser: item});
    }

    requestDwelling() {
        if (this.props.match.params === undefined) {
            const {siocId} = this.props;
            if (siocId) this.props.requestFindDwelling(siocId);
        } else {
            const {siocId} = this.props.match.params;
            if (siocId) this.props.requestFindDwelling(siocId);
        }
    }

    parseAllImageOptionElements() {
        const allImageOptionView = {
            allImageElements: null,
            allImagesHeaderElement: null,
            allImagesGridSizeElement: null
        };

        if (this.state.selectedPrintOption === 'allImages'
            && this.props.dwelling.images &&
            this.props.dwelling.images.length > 1) {
            allImageOptionView.allImageElements = this.state.selectedPrintImages.map((image, index) => {
                const imageItemStyle = {
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer',
                    backgroundImage: `url("${image.url}")`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                };

                const imageColumnStyle = {
                    height: '150px',
                    paddingBottom: '20px'
                };

                const checkboxStyle = {
                    marginLeft: '5px',
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer'
                };

                return (
                    <Col xs={this.state.printGridSizeOption} key={image.public_id} style={imageColumnStyle}>
                        <div
                            style={imageItemStyle}
                            onClick={() => this.handleImageSelected(index)}
                        >
                            <Input
                                type="checkbox"
                                style={checkboxStyle}
                                checked={image.selectedForPrint}
                            />
                        </div>
                    </Col>
                );
            });

            allImageOptionView.allImagesHeader = (
                <Col xs={12} className="mb-2">
                    <h4>Seleccionar imágenes para imprimir:</h4>
                </Col>
            );

            allImageOptionView.gridSizeElement = (
                <Row className="mt-2 mb-4 w-100">
                    <Col xs={12}>
                        <h4>Por favor seleccione el tamaño de la cuadrícula:</h4>
                    </Col>
                    <Col xs={12}>
                        <InputGroup size="lg">
                            <Input
                                className="footer-select"
                                type="select"
                                id="printGridSize"
                                value={this.state.printGridSizeOption}
                                onChange={e => this.handleGridSizeOptionChange(e)}
                                bsSize="lg"
                            >
                                <option value="4">Pequeño: 3 imágenes por fila</option>
                                <option value="6">Medio - 2 imágenes por fila</option>
                                <option value="12">Grande - 1 imagen por fila</option>
                            </Input>
                        </InputGroup>
                    </Col>
                </Row>
            );
        }

        return allImageOptionView;
    }

    renderVisitOrderModal() {
        const {visit} = this.state;
        const {clientsOptions} = this.props;
        if (this.props.dwelling.createdBy) {
            return (
                <Modal
                    isOpen={this.state.visitOrderModal}
                    toggle={() => this.toggleModals('visitOrderModal')}
                    className="modal-dialog-centered"
                >
                    <ModalHeader toggle={() => this.toggleModals('visitOrderModal')}>
                        Pedido de Visita a {this.props.dwelling.createdBy.name} {this.props.dwelling.createdBy.surname}
                    </ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col>
                                <h3>de: <b>{this.props.dwelling.agency.name}</b> </h3>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <FormGroup>
                                    <Typeahead
                                        label=""
                                        control="clientes"
                                        options={clientsOptions}
                                        minChar={0}
                                        onLoadOptions={term => this.props.requestSearchClients(term)}
                                        placeholder="Seleccione Cliente"
                                        value={visit.client.value ? visit.client : ''}
                                        onChange={params => this.handleTypeahead(params)}
                                        removeSelected
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={6}>
                                <FormGroup>
                                    <Input
                                        type="date"
                                        id="dateVisit"
                                        required
                                        onChange={e => this.handleVisit(e)}
                                    />
                                </FormGroup>
                            </Col>
                            <Col sm={6}>
                                <FormGroup>
                                    <Input
                                        type="time"
                                        id="timeVisit"
                                        required
                                        onChange={e => this.handleVisit(e)}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={12}>
                                <FormGroup>
                                    <Input
                                        type="textarea"
                                        name="comment"
                                        id="comment"
                                        rows="6"
                                        placeholder="Comentarios"
                                        onChange={e => this.handleVisit(e)}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            disabled={!(visit.client.value && visit.dateVisit && visit.timeVisit)}
                            onClick={() => this.handleSubmit()}
                        >CONFIRMAR
                        </Button>{' '}
                        <Button color="white" onClick={() => this.toggleModals('visitOrderModal')}>CANCELAR</Button>
                    </ModalFooter>
                </Modal>
            );
        }

        return null;
    }

    renderCreatedByModal() {
        return (
            <Modal
                isOpen={this.state.createdByModal}
                toggle={() => this.toggleModals('createdByModal')}
                className="modal-dialog-centered"
            >
                <ModalHeader toggle={() => this.toggleModals('createdByModal')}>
                    Creada por:
                    <b>
                        {this.props.dwelling.createdBy && `${this.props.dwelling.createdBy.name} ${this.props.dwelling.createdBy.surname}`}
                    </b>
                </ModalHeader>
                <ModalBody>
                    <h2>
                        <b>
                            {this.props.dwelling.agency ? this.props.dwelling.agency.name : 'Sin agencia asociada'}
                        </b>
                    </h2>
                    <h4>
                        {this.props.dwelling.createdBy && this.props.dwelling.createdBy.email} <br/>
                        {this.props.dwelling.createdBy && this.props.dwelling.createdBy.whatsapp} <br/>
                        {this.props.dwelling.createdBy && this.props.dwelling.createdBy.phone} <br/>
                    </h4>
                </ModalBody>
            </Modal>
        );
    }

    renderOwnerModal() {
        return (
            <Modal
                isOpen={this.state.ownerModal}
                toggle={() => this.toggleModals('ownerModal')}
                className="modal-dialog-centered"
            >
                <ModalHeader toggle={() => this.toggleModals('ownerModal')}>Cliente Propietario
                </ModalHeader>
                <ModalBody>
                    <h2>{this.props.dwelling.client && this.props.dwelling.client.value && `${this.props.dwelling.client.value.name} ${this.props.dwelling.client.value.surname}`}</h2>
                    <h4>
                        {this.props.dwelling.client && this.props.dwelling.client.value && this.props.dwelling.client.value.email} <br/>
                        {this.props.dwelling.createdBy && this.props.dwelling.client.value && this.props.dwelling.client.value.cellPhone}
                    </h4>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="light"
                        onClick={() => this.editClient(this.props.dwelling.client.value)}>
              Ir a Cliente
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }

    renderDescriptionModal() {
        return (
            <Modal
                isOpen={this.state.descriptionModal}
                toggle={() => this.toggleModals('descriptionModal')}
                className="modal-dialog-centered"
            >
                <ModalHeader toggle={() => this.toggleModals('descriptionModal')}>Descripción Privada</ModalHeader>
                <ModalBody>
                    <h4><em>{this.props.dwelling.intraDescription}</em></h4>
                </ModalBody>
            </Modal>
        );
    }

    renderPrintOptionsModal() {
        const {allImageElements, allImagesHeader, gridSizeElement} = this.parseAllImageOptionElements();

        return (
            <Modal
                isOpen={this.state.printOptionsModal}
                toggle={() => this.toggleModals('printOptionsModal')}
                className="modal-dialog-centered modal-lg"
            >
                <ModalHeader toggle={() => this.toggleModals('printOptionsModal')}>
                    <b>Opciones de impresión</b>
                </ModalHeader>
                <ModalBody>
                    <Row>
                        <Col xs={9}>
                            <h3 className="mb-3">Por favor, a continuación seleccione alguna de las siguientes opciones para la impresión:</h3>
                        </Col>
                        <Col xs={12}>
                            <InputGroup size="lg">
                                <Input
                                    className="footer-select"
                                    type="select"
                                    id="occupationStatus"
                                    value={this.state.selectedPrintOption}
                                    onChange={e => this.handlePrintOptionsChange(e)}
                                    bsSize="lg"
                                >
                                    <option value="noImages">Imprimir Sin Imágenes</option>
                                    <option value="onlyHeaderImage">Imprimir sólo incluyendo el Encabezado</option>
                                    <option value="allImages">Imprimir Encabezado + Listado de Imágenes</option>
                                </Input>
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        {gridSizeElement}
                        {allImagesHeader}
                        {allImageElements}
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button
                        size="lg"
                        color="light"
                        onClick={() => this.handlePrintPage()}
                    >
                        <FontAwesome name="print"/> {' '}
                        Imprimir
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }

    render() {
        const {usersOptions} = this.props;
        const {dropdownOpen} = this.state;
        let dropdownItems = [];
        if (usersOptions.length > 0) {
            const dwellingAgencyId = this.props.dwelling ? this.props.dwelling.agency['_id'] : '';
            dropdownItems = usersOptions.filter(user => user.agency === dwellingAgencyId).map(item =>
                <DropdownItem key={item.value} onClick={e => this.chooseItem(item.value, e)}>{item.label}</DropdownItem>
            );
        }

        let siocId;
        if (this.props.match.params) {
            siocId = this.props.match.params;
        }

        if (this.props.siocId) {
            siocId = this.props.siocId;
        }

        if (isEmpty(this.props.dwelling)) {
            return null;
        }

        let userBelongsToAgency = false;
        if (this.props.userProfile) {
            if (this.props.userProfile.role === 'admin') {
                userBelongsToAgency = true;
            }
            if (this.props.dwelling && this.props.dwelling.agency) {
                if (Object.keys(this.props.dwelling.agency).length > 0) {
                    if (this.props.dwelling.agency.auctioneers.length > 0 && !userBelongsToAgency) {
                        userBelongsToAgency = this.props.dwelling.agency.auctioneers.map(auctioneer => (auctioneer.value == this.props.userProfile._id)).includes(true);
                    }
                    if (this.props.dwelling.agency.sellers.length > 0 && !userBelongsToAgency) {
                        userBelongsToAgency = this.props.dwelling.agency.sellers.map(seller => (seller.value == this.props.userProfile._id)).includes(true);
                    }
                }
            }
        }

        let userIsAbleToAdmin = false;
        if (this.props.userProfile) {
            if (this.props.userProfile !== 'anonymous' && !['usuario', 'cliente'].includes(this.props.userProfile.role)) {
                userIsAbleToAdmin = true;
            }
        }

        return (
            <Fragment>
                <Propiedades siocId={siocId} headerImageUpdated={this.requestDwelling} userBelongsToAgency={userBelongsToAgency} />

                <Row>
                    {userIsAbleToAdmin &&
                    <Col sm={12} className="admin-prop-footer">
                        <div className="prop-footer-detail">
                            <p className="pre-head">
                                {this.props.dwelling && <span style={{color:'#003d6f'}}>{this.props.dwelling.dwellingStatus}</span>}
                                {userBelongsToAgency &&
                                <span>
                                    {' '}•{' '}
                                    <b style={{cursor: 'pointer'}}
                                        onClick={() => this.toggleModals('ownerModal')}>
                                        {(this.props.dwelling.client) ? 'Propietario' : "No existe el dato 'Propietario'"}
                                    </b>
                                </span>
                                }
                            </p>
                            <h2>
                                <span>Cargado por: </span>
                                {userBelongsToAgency ?
                                    <span>
                                        <b style={{cursor: 'pointer'}}
                                            onClick={() => this.toggleModals('createdByModal')}>{(this.props.dwelling && this.props.dwelling.createdBy.name) ? `${this.props.dwelling.createdBy.name}` : "No existe el dato"}</b>
                                        {' '}
                                        <ButtonDropdown isOpen={dropdownOpen} toggle={() => this.toggleDropdown()}>
                                            <DropdownToggle size="sm" color="default" style={{borderRadius: '0.2rem'}}>
                                                <FontAwesome name="exchange"/>
                                            </DropdownToggle>
                                            <DropdownMenu>
                                                {dropdownItems}
                                            </DropdownMenu>
                                        </ButtonDropdown>
                                    </span>
                                    :
                                    <b style={{cursor: 'pointer'}}
                                        onClick={() => this.toggleModals('createdByModal')}>
                                        {(this.props.dwelling && this.props.dwelling.createdBy && this.props.dwelling.createdBy.name) ? `${this.props.dwelling.createdBy.name}` : "No existe el dato"}
                                    </b>
                                }
                            </h2>

                            <p className="text-muted">
                                {this.props.dwelling ? moment(this.props.dwelling.createdAt).format('D MMMM YYYY, HH:mm') : "No existe el dato"}
                            </p>
                            <br/>
                            <p className="text-muted">
                                <em>Última modificación por: </em>
                                <b>{(this.props.dwelling && this.props.dwelling.occupationStatusHistory.length > 0 && this.props.dwelling.occupationStatusHistory.slice(-1)[0].user) ? this.props.dwelling.occupationStatusHistory.slice(-1)[0].user.name : "Aún no ha sido modificada."}</b> {(this.props.dwelling && this.props.dwelling.occupationStatusHistory.length > 0) ? moment(this.props.dwelling.occupationStatusHistory.slice(-1)[0].modified).format('D MMMM YYYY, HH:mm') : " "}
                            </p>

                        </div>

                        {this.props.dwelling && (this.props.dwelling.privateDescription || this.props.dwelling.intraDescription) &&
                        <div>
                            <hr/>
                            {this.props.dwelling.privateDescription &&
                            <h4><em>{this.props.dwelling.privateDescription}</em></h4>}
                            {userBelongsToAgency && this.props.dwelling.intraDescription &&
                            <div>
                                <Button
                                    size="sm"
                                    className="mt-3"
                                    onClick={() => this.toggleModals('descriptionModal')}>
                                Ver Descripción Privada
                                </Button>
                                <hr/>
                            </div>
                            }
                        </div>
                        }

                        <div className="prop-footer-btns d-sm-flex d-inline-flex flex-wrap mt-2 mt-sm-0">
                            {userBelongsToAgency &&
                            <Link className="p-1" to="/admin/dwellings/general?action=edit">
                                <Button>
                                    <FontAwesome name="pencil"/> {' '}
                                    Editar propiedad
                                </Button>
                            </Link>}

                            {userBelongsToAgency &&
                            <FormGroup className="p-1">
                                <Input
                                    className="footer-select"
                                    type="select"
                                    id="occupationStatus"
                                    value={this.props.dwelling ? this.props.dwelling.occupationStatus : []}
                                    onChange={e => this.handleChange(e, 'occupationStatus')}
                                >
                                    <option disabled value="">Estado Ocupacional</option>
                                    <option value="Disponible">Disponible</option>
                                    <option value="Alquilada">Alquilada</option>
                                    <option value="Vendida">Vendida</option>
                                    <option value="Reservada">Reservada</option>
                                    <option value="Suspendida">Suspendida</option>
                                    <option value="Tasaciones">Tasaciones</option>
                                    <option value="Eliminada">Eliminada</option>
                                </Input>
                            </FormGroup>}

                            <div className="ml-0 ml-sm-auto p-1">
                                <Button
                                    className="mr-2"
                                    onClick={() => this.toggleModals('printOptionsModal')}
                                    disabled={this.props.savingFile}
                                >
                                    {this.props.savingFile ? (
                                        <div className="print-loading">
                                            <BeatLoader
                                                color="#fbad1c"
                                                size={10}
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <FontAwesome name="print"/> {' '}
                                Imprimir
                                        </div>
                                    )}
                                </Button>
                                <Button
                                    className="mr-2"
                                    onClick={() => window.open(`https://wa.me/${this.props.dwelling.createdBy.whatsapp}?text=Hola ${this.props.dwelling.createdBy.name} ${this.props.dwelling.createdBy.surname}! Soy ${this.props.userProfile.name} ${this.props.userProfile.surname}. Necesito consultarte sobre la propiedad Cód. ${this.props.dwelling.siocId} - Link: https://www.sioc.com.ar/${this.props.dwelling.siocId}`)}
                                >
                                    <FontAwesome name="whatsapp"/>{' '}
                            Consulta al Vendedor
                                </Button>
                                <Button
                                    onClick={() => this.toggleModals('visitOrderModal')}
                                    disabled={!this.props.dwelling.createdBy}
                                >
                                    <FontAwesome name="home"/> {' '}
                            Pedido de visita
                                </Button>
                            </div>
                        </div>
                        {this.props.dwelling && this.renderVisitOrderModal()}
                        {this.props.dwelling && this.renderCreatedByModal()}
                        {this.props.dwelling && this.renderOwnerModal()}
                        {this.props.dwelling && this.renderDescriptionModal()}
                        {this.props.dwelling && this.renderPrintOptionsModal()}
                    </Col>
                    }
                </Row>

            </Fragment>
        );
    }
}

export default connect(
    state => ({
        clientsOptions: state.client.clientsOptions,
        dwelling: state.dwelling.dwelling,
        userProfile: state.user.userProfile,
        agencies: state.agency.agencies,
        usersOptions: state.user.usersOptions,
        savingFile: state.dwelling.savingFile
    }),
    dispatch => ({
        requestFindDwelling: siocId => dispatch(requestDwelling(siocId)),
        requestSearchClients: term => dispatch(requestSearchClients(term)),
        requestSaveDwelling: dwelling => dispatch(requestSaveDwelling(dwelling)),
        savePartialDwelling: dwelling => dispatch(savePartialDwelling(dwelling)),
        requestAgencies: () => dispatch(requestAgencies()),
        saveVisit: visit => dispatch(saveVisit(visit)),
        requestSearchUsers: (term, userType, agency) => dispatch(requestSearchUsers(term, userType, agency)),
        requestReplaceCreator: changeParams => dispatch(requestReplaceCreator(changeParams))
    })
)(DwellingDetailView);
