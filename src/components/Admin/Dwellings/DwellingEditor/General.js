/* eslint-disable react/no-unused-prop-types */
import React, {Component} from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import FontAwesome from 'react-fontawesome';
import {
    Row,
    Col,
    Container,
    InputGroup,
    InputGroupButtonDropdown,
    FormGroup,
    DropdownMenu,
    ButtonGroup,
    DropdownItem,
    Button,
    DropdownToggle,
    Input,
    CustomInput,
    Label,
    Tooltip,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Modal
} from 'reactstrap';

import {requestSearchClients, savePartialDwelling, requestAgencies} from '../../../../actions/index';
// import GoogleSearchBox from '../../../Maps/DwellingGoogleSearchBox';
import MapAutocompleteDraggableMarker from '../../../Maps/MapAutocompleteDraggableMarker';
import {Dwelling} from '../../../../model/index';
import Typeahead from '../../../common/Typeahead';

class General extends Component {
    static propTypes = {
        savePartialDwelling: PropTypes.func.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired
        }).isRequired,
        dwelling: PropTypes.shape({}),
        agencies: PropTypes.arrayOf(PropTypes.shape({}))
    };

    static defaultProps = {
        dwelling: new Dwelling()
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.location.state && nextProps.location.state.dwelling) {
            return {...prevState, dwelling: nextProps.location.state.dwelling};
        }

        if (nextProps &&
              nextProps.match &&
              prevState &&
              prevState.match &&
              nextProps.match.path !== prevState.match.path) {
              return {
                  dwelling: new Dwelling()
              };
        }

        return null;
    }

    constructor(props) {
        super(props);

        if (this.props.dwelling && (window.location.prev === "general" || window.location.search === "?action=edit")) {
            this.state = {...this.props, modalConfirm: false, copyOptions: {client: false, location: false, images: false}, originalPrice: this.props.dwelling.price};
            window.location.prev = '';
        } else {
            this.state = {dwelling: new Dwelling(), tooltipOpen: false, modalConfirm: false};
        }
        this.toggleConfirm = this.toggleConfirm.bind(this);
        this.toggleCopyOption = this.toggleCopyOption.bind(this);
        this.handleCopy = this.handleCopy.bind(this);
    }

    componentDidMount() {
        this.props.requestAgencies();
    }

    componentWillUnmount() {
        if (this.state.tooltipOpen) {
            this.state.tooltipOpen = false;
        }
    }

    handleChange({target: {id, value}}) {
        this.setState(
            state => ({
                dwelling: (Object.assign(state.dwelling, {[id]: value}))
            })
        );
    }

    handleSubType({target: {id, value}}, type) {
        this.setState(
            state => ({
                dwelling: (Object.assign(state.dwelling,
                    {[id]: value},
                    {type}
                ))
            })
        );
    }

    handleToggle(e, id) {
        this.setState(
            state => ({
                dwelling: (Object.assign(state.dwelling, {[id]: e}))
            })
        );
    }

    selectCurrency(event) {
        const currency = event.target.innerText;
        this.setState(
            state => ({
                dwelling: (Object.assign(state.dwelling,
                    {dropDownOpen: state.dwelling.dropDownOpen},
                    {currency}))
            })
        );
    }

    selectPricing(event) {
        const pricingType = event.target.innerText;
        this.setState(
            state => ({
                dwelling: (Object.assign(state.dwelling,
                    {dropDownOpen2: state.dwelling.dropDownOpen2},
                    {pricingType}))
            })
        );
    }

    toggleDropDown(id) {
        this.setState(prevState => ({
            [id]: !prevState[id]
        }));
    }

    toggleConfirm() {
        this.setState({...this.state, modalConfirm: !this.state.modalConfirm});
    }

    toggleCopyOption(e, key) {
        const checked = e.target.checked;
        let {copyOptions} = this.state;
        copyOptions[key] = checked;
        this.setState({copyOptions: copyOptions});
    }

    handleType(id, e) {
        let currency;
        if (e === 'Venta') {
            currency = 'US$';
        } else {
            currency = '$';
        }
        this.setState(
            state => ({
                dwelling: (Object.assign(state.dwelling,
                    {[id]: e},
                    {currency}
                ))
            })
        );
    }

    handleSubmit() {
        const {dwelling} = this.state;

        if (!dwelling._id) {
            this.setState(
                state => ({
                    dwelling: {...state.dwelling, createdBy: this.props.userProfile}
                })
            );

            dwelling.createdBy = this.props.userProfile;
        } else { // for catch and save price change history
            if (this.state.originalPrice !== dwelling.price) {
                let priceHistory = dwelling.priceHistory;
                priceHistory.push({user: this.props.userProfile, price: dwelling.price});
                this.setState(
                    state => ({
                        dwelling: {...state.dwelling, priceHistory: priceHistory}
                    })
                )
            }
        }

        if (dwelling.agency) {
            this.props.savePartialDwelling(dwelling);
            this.props.history.push('/admin/dwellings/characteristics');
        }
    }

    handleCopy() {
        this.toggleConfirm();
        let {copyOptions, dwelling} = this.state;
        if (dwelling.hasOwnProperty('_id')) delete dwelling['_id'];
        if (dwelling.hasOwnProperty('siocId')) delete dwelling['siocId'];

        if (!copyOptions.client) dwelling.client = {};
        if (!copyOptions.location) dwelling.address = {};
        if (!copyOptions.images) dwelling.images = [];
        this.props.history.push({
            pathname: '/admin/dwellings/newGeneral',
            search: null,
            state: {dwelling: dwelling}
        });
    }

    handleTypeahead(client) {
        this.setState(
            state => ({
                dwelling: {...state.dwelling, client: {value: client.value, label: client.label}}
            })
        );
    }

    handleSelect(e) {
        let agency = this.props.agencies.filter(item => {
            if (item._id == e.value) return item;
            return null;
        });

        this.setState(
            state => ({
                dwelling: {...state.dwelling, agency: agency[0]}
            })
        );
    }

    handleAdressTypeChange(e) {
        this.setState(
            state => ({
                dwelling: (Object.assign(state.dwelling, {isCustomAddress: e}))
            })
        );
    }

    handleCustomAddressChange(customAddress) {
        this.setState(
            state => ({
                dwelling: (Object.assign(state.dwelling, {customAddress}))
            })
        );
    }

    render() {
        let {dwelling} = this.state;
        if (!dwelling.occupationStatus) {
            this.state.dwelling.occupationStatus = 'Disponible';
        }
        if (!dwelling.pricingType && dwelling.publicationType === 'Alquiler') {
            this.state.dwelling.pricingType = 'Por Mes';
        }
        if (!dwelling.price) {
            this.state.dwelling.price = undefined;
        }
        if (!dwelling.publicationType) {
            this.state.dwelling.publicationType = 'Venta';
            this.state.dwelling.currency = 'US$';
        }
        if (!dwelling.type) {
            this.state.dwelling.type = 'Residencial';
        }

        const {clientsOptions} = this.props;
        let isSubmitDisabled = false;

        let AgencyOptions = [];
        if (this.props.agencies) {
            for (let i = 0; i < this.props.agencies.length; i++) {

                let item = {
                    value: this.props.agencies[i]._id,
                    label: this.props.agencies[i].name
                };
                if (this.props.userProfile && (this.props.userProfile.role === 'admin'
                    || (!['usuario', 'cliente'].includes(this.props.userProfile.role) && this.props.agencies[i].auctioneers.length > 0
                        && this.props.agencies[i].auctioneers.map(auctioneer => (auctioneer.value.role === this.props.userProfile.role)).includes(true))
                    || (!['usuario', 'cliente'].includes(this.props.userProfile.role) && this.props.agencies[i].sellers.length > 0
                        && this.props.agencies[i].sellers.map(seller => (seller.value ? seller.value.role === this.props.userProfile.role : null)).includes(true)
                    ))) {
                    AgencyOptions.push(item);
                }
            }
        }

        if (dwelling.isCustomAddress) {
            isSubmitDisabled = !(
                dwelling.customAddress &&
                dwelling.address.state &&
                dwelling.price &&
                dwelling.subtype &&
                dwelling.client.value
            );
        } else {
            isSubmitDisabled = !(
                dwelling.address.streetName &&
                dwelling.address.city &&
                dwelling.price &&
                dwelling.subtype &&
                dwelling.client.value
            );
        }
        if (dwelling.occupationStatus === 'Tasaciones') {
            isSubmitDisabled = false;
        }

        return (
            <Container fluid className="animated fadeIn mt-3">
                <Row style={{position: 'relative'}}>
                    <Col md={12}>
                        <Typeahead
                            control="clientes"
                            options={clientsOptions}
                            onLoadOptions={term => this.props.requestSearchClients(term)}
                            placeholder="Indique Propietario"
                            value={dwelling.client.label ? dwelling.client : ''}
                            onChange={params => this.handleTypeahead(params)}
                            removeSelected
                        />
                    </Col>
                    <Col sm={12}>
                        <FormGroup style={{minHeight: '300px'}}>
                            <MapAutocompleteDraggableMarker
                                onChange={e => this.handleToggle(e, 'address')}
                                center={{lat: dwelling.address.latitude ? dwelling.address.latitude : -34.9208532, lng: dwelling.address.altitude ? dwelling.address.altitude : -57.9542241}}
                                height='300px'
                                zoom={15}
                                key={dwelling.address.latitude}
                                isCustomAddress={dwelling.isCustomAddress}
                                onAddressTypeChange={e => this.handleAdressTypeChange(e)}
                                address={dwelling.address}
                            />
                        </FormGroup>
                    </Col>
                    {this.props.userProfile && this.props.userProfile.role == 'admin' &&
                    <Col md={6}>
                        <FormGroup>
                            <Select
                                options={AgencyOptions}
                                placeholder="Seleccione Inmobiliaria"
                                value={this.props.dwelling.agency ? this.props.dwelling.agency.name : ''}
                                onChange={e => this.handleSelect(e)}
                            />
                        </FormGroup>
                    </Col>
                    }
                    {dwelling.isCustomAddress &&
                        <Col sm={10} style={{position: 'absolute', bottom: 0}}>
                            <FormGroup>
                                <Input
                                    type="text"
                                    placeholder="Dirección personalizada"
                                    className="mt-1"
                                    style={{padding: '0 8px', height: '30px'}}
                                    onChange={e => this.handleCustomAddressChange(e.target.value)}
                                    value={dwelling.customAddress}
                                />
                            </FormGroup>
                        </Col>
                    }
                </Row>
                <hr className="mb-4 mt-2"/>
                <Row>
                    <Col xs={6}>
                        <FormGroup>
                            <Input
                                type="select"
                                name="selectMulti"
                                id="subtype"
                                className="multiple"
                                value={dwelling.subtype}
                                onChange={e => this.handleSubType(e, 'Residencial')}
                            >
                                <option value="">RESIDENCIAL</option>
                                <option value="Casa">Casa</option>
                                <option value="Departamento">Departamento</option>
                                <option value="Duplex">Duplex</option>
                                <option value="PH">PH</option>
                                <option value="Casa Quinta">Casa Quinta</option>
                                <option value="Cabaña">Cabaña</option>
                                <option value="Piso">Piso</option>
                            </Input>
                        </FormGroup>
                    </Col>
                    <Col xs={6}>
                        <FormGroup>
                            <Input
                                type="select"
                                name="selectMulti"
                                id="subtype"
                                className="multiple"
                                value={dwelling.subtype}
                                onChange={e => this.handleSubType(e, 'Comercial')}
                            >
                                <option value="">COMERCIAL</option>
                                <option value="Local">Local</option>
                                <option value="Campo">Campo</option>
                                <option value="Cochera">Cochera</option>
                                <option value="Terreno">Terreno</option>
                                <option value="Oficina">Oficina</option>
                                <option value="Galpón">Galpón</option>
                                <option value="Edificio">Edificio</option>
                                <option value="Fondo de Comercio">Fondo de Comercio</option>
                                <option value="Depósito">Depósito</option>
                                <option value="Industriales">Industriales</option>
                                <option value="Countries y Barrios">Countries y Barrios</option>
                                <option value="Fracciones">Fracciones</option>
                                <option value="Otros">Otros</option>
                            </Input>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        <FormGroup>
                            <ButtonGroup className="btn-justified">
                                <Button
                                    outline
                                    onClick={() => this.handleType('publicationType', 'Venta')}
                                    active={this.state.dwelling.publicationType === 'Venta'}
                                >VENTA
                                </Button>
                                <Button
                                    outline
                                    onClick={() => this.handleType('publicationType', 'Alquiler')}
                                    active={this.state.dwelling.publicationType === 'Alquiler'}
                                >ALQUILER
                                </Button>
                            </ButtonGroup>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        <FormGroup>
                            <InputGroup>
                                <InputGroupButtonDropdown
                                    addonType="append"
                                    isOpen={this.state.dropDownOpen}
                                    toggle={() => this.toggleDropDown('dropDownOpen')}
                                >
                                    <DropdownToggle caret
                                                    style={{borderBottomLeftRadius: '3px', borderTopLeftRadius: '3px'}}>
                                        {dwelling.currency}
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem onClick={e => this.selectCurrency(e)}>US$</DropdownItem>
                                        <DropdownItem onClick={e => this.selectCurrency(e)}>$</DropdownItem>
                                    </DropdownMenu>
                                </InputGroupButtonDropdown>
                                <Input
                                    type="number"
                                    placeholder="Precio"
                                    value={[dwelling.price]}
                                    onChange={e => this.handleToggle(e.target.value, 'price')}
                                />
                                {dwelling.publicationType === 'Alquiler' &&
                                <InputGroupButtonDropdown
                                    addonType="append"
                                    isOpen={this.state.dropDownOpen2}
                                    toggle={() => this.toggleDropDown('dropDownOpen2')}
                                >
                                    <DropdownToggle caret>
                                        {dwelling.pricingType}
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem onClick={e => this.selectPricing(e)}>Por Día</DropdownItem>
                                        <DropdownItem onClick={e => this.selectPricing(e)}>Por Semana</DropdownItem>
                                        <DropdownItem onClick={e => this.selectPricing(e)}>Por Mes</DropdownItem>
                                    </DropdownMenu>
                                </InputGroupButtonDropdown>}
                            </InputGroup>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        <FormGroup>
                            <Input
                                type="select"
                                id="occupationStatus"
                                value={dwelling.occupationStatus}
                                onChange={e => this.handleChange(e)}
                            >
                                <option disabled value="">Estado Ocupacional</option>
                                <option value="Disponible">Disponible</option>
                                <option value="Alquilada">Alquilada</option>
                                <option value="Vendida">Vendida</option>
                                <option value="Reservada">Reservada</option>
                                <option value="Suspendida">Suspendida</option>
                                <option value="En Obra">En Obra</option>
                                <option value="Tasaciones">Tasaciones</option>
                                <option value="Eliminada">Eliminada</option>
                            </Input>
                        </FormGroup>
                    </Col>
                </Row>
                <div className="padding-sm"></div>

                {/*<Col sm={4}></Col>
                    <Col sm={4} className="multi-steps">
                        <ol className="in-multi-steps text-top">
                            <li className="current">
                                <span>
                                    <FontAwesome
                                        name="home"
                                        style={{color: 'rgba(0,0,0,.3)'}}
                                    />
                                </span>
                            </li>
                            <li className="">
                                <span>
                                    <FontAwesome
                                        name="cog"
                                        spin
                                        style={{color: 'rgba(0,0,0,.3)'}}
                                    />
                                </span>
                            </li>
                            <li><span><FontAwesome name="check-square" style={{color: 'rgba(0,0,0,.3)'}}/></span></li>
                        </ol>
                    </Col>*/}
                <Row className="proceed-btns">
                    <Modal isOpen={this.state.modalConfirm} toggle={this.toggleConfirm} className={this.props.className}>
                        <ModalHeader toggle={this.toggleConfirm}>Copiar propiedad</ModalHeader>
                        <ModalBody className="mt-5 mb-4 d-flex justify-content-around">
                            <FormGroup>
                                <CustomInput type="checkbox" id="checkboxCopyClient" label="Copiar cliente" onChange={e => this.toggleCopyOption(e, 'client')} />
                                <CustomInput type="checkbox" id="checkboxCopyLocation" label="Copiar dirección" onChange={e => this.toggleCopyOption(e, 'location')} />
                                <CustomInput type="checkbox" id="checkboxCopyImages" label="Copiar imágenes" onChange={e => this.toggleCopyOption(e, 'images')} />
                            </FormGroup>
                        </ModalBody>
                        <ModalFooter className="justify-content-right">
                            <Button variant="primary" onClick={this.handleCopy}>Siguiente</Button>
                        </ModalFooter>
                    </Modal>
                    <Col className="align-self-center">
                    {(this.props.dwelling && (window.location.prev === "general" || window.location.search === "?action=edit")) &&
                    <a
                        className="mr-4 copy"
                        onClick={this.toggleConfirm}
                    >
                        <FontAwesome name="copy"/> Crear una copia
                    </a>
                    }
                    </Col>
                    <Col className="text-right">
                    <Tooltip
                        placement="top"
                        isOpen={this.state.tooltipOpen}
                        target="Next"
                        toggle={() => this.toggleDropDown('tooltipOpen')}
                    >
                        Complete todos los campos para continuar
                    </Tooltip>
                    <span id="Next" className="add-dwelling-info"><FontAwesome name="info"/>&nbsp;&nbsp;</span>
                    <Button
                        className="next"
                        size="lg"
                        disabled={isSubmitDisabled}
                        onClick={() => this.handleSubmit()}
                    >
                        <FontAwesome name="angle-right"/>
                    </Button>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default connect(
    state => ({
        clientsOptions: state.client.clientsOptions,
        dwelling: state.dwelling.dwelling,
        agencies: state.agency.agencies,
        userProfile: state.user.userProfile
    }),
    dispatch => ({
        requestSearchClients: term => dispatch(requestSearchClients(term, false)),
        savePartialDwelling: dwelling => dispatch(savePartialDwelling(dwelling)),
        requestAgencies: () => dispatch(requestAgencies())
    })
)(General);
