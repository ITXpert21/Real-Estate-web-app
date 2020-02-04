import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {
    FormControl,
    FormGroup,
    Label
} from 'react-bootstrap';
import {map} from 'lodash';
import {Container, Row, Col, Input, InputGroup, InputGroupAddon, Button} from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import Select from 'react-select';
import Switch from 'react-switch';

import {Dwelling} from '../../../../model/index';
import {savePartialDwelling} from '../../../../actions/index';


class Characteristics extends Component {
    static propTypes = {
        savePartialDwelling: PropTypes.func.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired
        }).isRequired,
        dwelling: PropTypes.shape({})
    };

    static defaultProps = {
        dwelling: new Dwelling()
    };

    constructor(props) {
        super(props);
        if (this.props.dwelling.price == '') {
            this.props.history.push('/admin/dwellings/newGeneral');
        }
        this.state = {dwelling: new Dwelling()};
        if (this.props.dwelling) {
            this.state = this.props;
        }
    }

    handleChange({target: {id, value}}, type) {
        if (type === 'tax') {
            this.setState(
                state => ({
                    dwelling: {...state.dwelling, [type]: {...state.dwelling[type], [id]: value}}
                })
            );
        } else {
            this.setState(
                state => ({
                    dwelling: {...state.dwelling, [id]: {...state.dwelling[id], [type]: value}}
                })
            );
        }
    }

    handleSubmit(location) {
        const {dwelling} = this.state;
        const values = map(dwelling.features.heating, heating => heating.value);
        this.props.savePartialDwelling(dwelling);
        this.props.history.push(location);
        window.location.prev = "general";
    }

    handlePlusClick(type, subtype) {
        this.setState(
            state => ({
                dwelling: {
                    ...state.dwelling,
                    [type]: {...state.dwelling[type], [subtype]: (state.dwelling[type][subtype] + 1)}
                }
            })
        );
    }

    handleSwitch(e, type, subtype) {
        this.setState(
            state => ({
                dwelling: {
                    ...state.dwelling,
                    [type]: {...state.dwelling[type], [subtype]: e}
                }
            })
        );
    }

    handleSelect(e, type, subtype) {
        this.setState(
            state => ({
                dwelling: {
                    ...state.dwelling,
                    [type]: {...state.dwelling[type], [subtype]: e}
                }
            })
        );
    }

    handleMinusClick(type, subtype) {
        if (this.state.dwelling[type][subtype] === 0 && this.state.dwelling.subtype !== 'Cochera') return;
        this.setState(
            state => ({
                dwelling: {
                    ...state.dwelling,
                    [type]: {...state.dwelling[type], [subtype]: (state.dwelling[type][subtype] - 1)}
                }
            })
        );
    }

    dataModels() {
        switch (this.state.dwelling.subtype) {
            case 'Casa':
                return this.house();
            case 'Casa Quinta':
                return this.house();                
            case 'Departamento':
                return this.apartment();
            case 'Duplex':
                return this.house();
            case 'PH':
                return this.house();
            case 'Cabaña':
                return this.house();
            case 'Piso':
                return this.apartment();
            case 'Countries y Barrios':
                return this.countryHouse();
            case 'Local':
                return this.local();
            case 'Campo':
                return this.field();
            case 'Cochera':
                return this.parkingLot();
            case 'Terreno':
                return this.landPlot();
            case 'Fracciones':
                return this.landPlot();
            case 'Oficina':
                return this.office();
            case 'Galpón':
                return this.shed();
            case 'Edificio':
                return this.building();
            case 'Fondo de Comercio':
                return this.goodWill();
            case 'Depósito':
                return this.storageArea();
            case 'Industriales':
                return this.storageArea();
            default:
                return null;
        }
    }

    house() {
        return (
            <Fragment>
                <Row className="mt-4">
                    <Col sm={12}>
                        <h2>Ambientes</h2>
                        <hr/>
                    </Col>
                    <Row className="mb-4">
                        {this.bedrooms()}
                        {this.floors()}
                        {this.closets()}
                        {this.bathRoom()}
                        {this.toilette()}
                    </Row>
                    <Row className="mb-2">
                        {this.living()}
                        {this.livingDining()}
                        {this.diningRoom()}
                        {this.dailyDiningRoom()}
                        {this.kitchen()}
                        {this.kitchenDining()}
                        {this.terrace()}
                        {this.balcony()}
                        {this.garden()}
                        {this.backYard()}
                        {this.swimmingPool()}
                        {this.barbecue()}
                    </Row>
                    <Row>
                        {this.garage()}
                        {this.laundryRoom()}
                    </Row>
                </Row>
                <Row className="mt-4">
                    <Col sm={12}>
                        <h2>Características</h2>
                        <hr/>
                    </Col>
                    {this.lotMeassures()}
                    <Row className="mb-3">
                        {this.lotSurface()}
                        {this.coveredSurface()}
                        {this.totalSurface()}
                    </Row>
                    <Row className="mb-3">
                        {this.status()}
                        {this.orientation()}
                        {this.luminosity()}
                    </Row>
                    <Row>
                        {this.antiquity()}
                        {this.repair()}
                        {this.refurbished()}
                    </Row>
                    {this.heating()}
                </Row>
                <Row className="mb-3 mt-3">
                    <Col sm={12}>
                        <h2>Servicios</h2>
                        <hr/>
                    </Col>
                    {this.gas()}
                    {this.water()}
                    {this.sewer()}
                    {this.phone()}
                    {this.pavement()}
                    {this.electricity()}
                    {this.cableTv()}
                </Row>
            </Fragment>
        );
    }

    apartment() {
        return (
            <Fragment>
                <Row className="mt-4">
                    <Col sm={12}>
                        <h2>Ambientes</h2>
                        <hr/>
                    </Col>
                    <Row className="mb-3">
                        {this.bedrooms()}
                        {this.closets()}
                        {this.bathRoom()}
                        {this.toilette()}
                    </Row>
                    <Row className="mb-3">
                        {this.living()}
                        {this.livingDining()}
                        {this.diningRoom()}
                        {this.kitchen()}
                        {this.kitchenDining()}
                        {this.terrace()}
                        {this.balcony()}
                        {this.swimmingPool()}
                        {this.furnished()}
                        {this.storage()}
                        {this.backYard()}
                        {this.depser()}
                        {this.sum()}
                    </Row>
                    {this.garage()}
                    {this.laundryRoom()}
                </Row>
                <Row>
                    <Col sm={12}>
                        <h2>Características</h2>
                        <hr/>
                    </Col>
                    <Row className="mb-3">
                        {this.floor()}
                        {this.heating()}
                        {this.refurbished()}
                    </Row>
                    <Row className="mb-3">
                        {this.location()}
                        {this.orientation()}
                        {this.luminosity()}
                    </Row>
                    <Row className="mb-3">
                        {this.repair()}
                        {this.status()}
                        {this.antiquity()}
                    </Row>
                    <Row className="mb-3">
                        {this.lotSurface()}
                        {this.coveredSurface()}
                        {this.totalSurface()}
                    </Row>
                </Row>
                <Row>
                    <Col sm={12}>
                        <h2>Servicios</h2>
                        <hr/>
                    </Col>
                    <Row className="mb-3">
                        {this.gas()}
                        {this.water()}
                        {this.sewer()}
                        {this.phone()}
                        {this.pavement()}
                        {this.electricity()}
                        {this.cableTv()}
                        {this.security()}
                        {this.expenses()}
                    </Row>
                </Row>

            </Fragment>
        );
    }

    countryHouse() {
        return (
            <Fragment>
                <Row className="mt-4">
                    <Col sm={12}>
                        <h2>Ambientes</h2>
                        <hr/>
                    </Col>
                    <Col sm={12}>
                        <Row className="mb-3">
                            {this.bedrooms()}
                            {this.closets()}
                            {this.bathRoom()}
                            {this.toilette()}
                            {this.floors()}
                        </Row>
                        <Row className="mb-3">
                            {this.living()}
                            {this.diningRoom()}
                            {this.dailyDiningRoom()}
                            {this.kitchen()}
                            {this.terrace()}
                            {this.balcony()}
                            {this.backYard()}
                            {this.swimmingPool()}
                            {this.barbecue()}
                        </Row>
                        <Row className="mb-3">
                            {this.garage()}
                            {this.laundryRoom()}
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        <h2>Características</h2>
                        <hr/>
                    </Col>
                    <Col sm={12}>
                        <Row className="mb-3">
                            {this.repair()}
                            {this.refurbished()}
                            {this.security()}
                        </Row>
                        <Row className="mb-6">
                            {this.orientation()}
                            {this.luminosity()}
                            {this.antiquity()}
                            {this.heating()}
                            {this.status()}
                        </Row>
                        <Row className="mb-3">
                            {this.lotSurface()}
                            {this.coveredSurface()}
                            {this.totalSurface()}
                            {this.expenses()}
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        <h2>Servicios</h2>
                        <hr/>
                    </Col>
                    <Col sm={12}>
                        <Row className="mb-3">
                            {this.gas()}
                            {this.water()}
                            {this.sewer()}
                            {this.phone()}
                            {this.pavement()}
                            {this.electricity()}
                            {this.cableTv()}
                        </Row>
                    </Col>
                </Row>

            </Fragment>
        );
    }

    local() {
        return (
            <Fragment>
                <Col sm={12} className="mt-4">
                    <h2>Ambientes</h2>
                    <hr/>
                </Col>
                <Row className="mb-3">
                    {this.kitchen()}
                    {this.garden()}
                    {this.furnished()}
                </Row>
                <Row className="mb-3">
                    {this.bathRoom()}
                    {this.floors()}
                </Row>

                <Col sm={12} className="mt-4">
                    <h2>Características</h2>
                    <hr/>
                </Col>
                <Row className="mb-3">
                    {this.lotMeassures()}
                    {this.lotSurface()}
                    {this.totalSurface()}
                </Row>
                <Row className="mb-6">
                    {this.floor()}
                    {this.heating()}
                    {this.status()}
                    {this.refurbished()}
                    {this.repair()}
                    {this.antiquity()}
                </Row>

                <Col sm={12} className="mt-4">
                    <h2>Servicios</h2>
                    <hr/>
                </Col>
                <Row className="mb-3">
                    {this.gas()}
                    {this.water()}
                    {this.sewer()}
                    {this.phone()}
                    {this.pavement()}
                    {this.electricity()}
                    {this.cableTv()}
                </Row>
            </Fragment>
        );
    }

    field() {
        return (
            <Fragment>
                <Row>
                    <Col sm={12}>
                        <h2>Características</h2>
                        <hr/>
                    </Col>
                    <Col sm={12}>
                        <Row className="mb-3">
                            {this.coveredSurface()}
                        </Row>
                    </Col>
                </Row>
            </Fragment>
        );
    }

    parkingLot() {
        return (
            <Fragment>
                <Row>
                    <Col sm={12}>
                        <h2>Características</h2>
                        <hr/>
                    </Col>
                    <Row className="mb-3">
                        {this.floor()}
                        {this.coveredSurface()}
                        {this.totalSurface()}
                    </Row>
                </Row>
            </Fragment>
        );
    }

    landPlot() {
        return (
            <Fragment>
                <Row>
                    <Col sm={12}>
                        <h2>Características</h2>
                        <hr/>
                    </Col>
                    {this.lotMeassures()}
                    {this.lotSurface()}
                    <Col sm={12}>
                        <h2>Servicios</h2>
                        <hr/>
                    </Col>
                    <Row className="mb-3">
                        {this.gas()}
                        {this.water()}
                        {this.sewer()}
                        {this.phone()}
                        {this.pavement()}
                        {this.electricity()}
                        {this.cableTv()}
                        {this.security()}
                    </Row>
                </Row>
            </Fragment>
        );
    }

    office() {
        return (
            <Fragment>
                <Col sm={12}>
                    <h2>Ambientes</h2>
                    <hr/>
                </Col>
                <Row className="mb-3">
                    {this.bathRoom()}
                    {this.garage()}
                </Row>
                <Col sm={12}>
                    <h2>Características</h2>
                    <hr/>
                </Col>
                <Row>
                    {this.coveredSurface()}
                    {this.totalSurface()}
                    {this.lotSurface()}
                    {this.floor()}
                </Row>
                <Row>
                    {this.refurbished()}
                    {this.repair()}
                    {this.heating()}
                    {this.location()}
                    {this.orientation()}
                    {this.luminosity()}
                </Row>
                <Row className="mb-3">
                    {this.antiquity()}
                    {this.status()}
                </Row>
                <Col sm={12}>
                    <h2>Servicios</h2>
                    <hr/>
                </Col>
                <Row className="mb-3">
                    {this.gas()}
                    {this.water()}
                    {this.sewer()}
                    {this.phone()}
                    {this.pavement()}
                    {this.electricity()}
                    {this.cableTv()}
                </Row>
            </Fragment>
        );
    }

    shed() {
        return (
            <Fragment>
                <Row>
                    <Col sm={12}>
                        <h2>Características</h2>
                        <Row className="mb-3">
                            {this.coveredSurface()}
                            {this.totalSurface()}
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        <h2>Servicios</h2>
                        <Row className="mb-3">
                            {this.water()}
                            {this.pavement()}
                            {this.electricity()}
                        </Row>
                    </Col>
                </Row>
            </Fragment>
        );
    }

    building() {
        return (
            <Fragment>

                <Col sm={12} className="mt-4">
                    <h2>Ambientes</h2>
                    <hr/>
                </Col>
                <Row className="mb-3">
                    {this.terrace()}
                    {this.balcony()}
                    {this.swimmingPool()}
                    {this.barbecue()}
                    {this.furnished()}
                    {this.storage()}
                    {this.depser()}
                    {this.sum()}
                    {this.apartments()}
                </Row>
                <Row className="mb-3">
                    {this.floors()}
                    {this.offices()}
                </Row>

                <Col sm={12} className="mt-4">
                    <h2>Características</h2>
                    <hr/>
                </Col>
                <Row className="mb-6">
                    {this.refurbished()}
                    {this.repair()}
                    {this.heating()}
                </Row>
                <Row className="mb-3">
                    {this.location()}
                    {this.orientation()}
                    {this.status()}
                    {this.luminosity()}
                    {this.antiquity()}
                </Row>
                <Row className="mb-3">
                    {this.lotSurface()}
                    {this.totalSurface()}
                </Row>


                <Col sm={12}>
                    <h2>Servicios</h2>
                    <hr/>
                </Col>
                <Row className="mb-3">
                    {this.gas()}
                    {this.water()}
                    {this.sewer()}
                    {this.phone()}
                    {this.pavement()}
                    {this.electricity()}
                    {this.cableTv()}
                    {this.security()}
                </Row>
                <Row className="mb-3">
                    {this.expenses()}
                </Row>
            </Fragment>
        );
    }

    goodWill() {
        return (
            <Fragment>
                <Row className="mt-4">
                    <Col sm={12}>
                        <h2>Ambientes</h2>
                        <hr/>
                    </Col>
                    <Col sm={12}>
                        <Row className="mb-3">
                            {this.bathRoom()}
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        <h2>Características</h2>
                        <hr/>
                    </Col>
                    <Col sm={12}>
                        <Row className="mb-6">
                            {this.heating()}
                            {this.repair()}
                            {this.refurbished()}
                        </Row>
                        <Row className="mb-3">
                            {this.status()}
                            {this.totalSurface()}
                        </Row>
                        <Row className="mb-3">
                            {this.depser()}
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        <h2>Servicios</h2>
                        <hr/>
                    </Col>
                    <Col sm={12}>
                        <Row className="mb-3">
                            {this.phone()}
                            {this.electricity()}
                            {this.cableTv()}
                            {this.expenses()}
                        </Row>
                    </Col>
                </Row>

            </Fragment>
        );
    }

    storageArea() {
        return (
            <Fragment>
                <Row>
                    <Col sm={12}>
                        <h2>Servicios</h2>
                        <hr/>
                    </Col>
                    <Row className="mb-3">
                        {this.pavement()}

                    </Row>
                </Row>
            </Fragment>
        );
    }

    bedrooms() {
        if (this.state.dwelling.spaces.bedrooms === undefined) {
            this.state.dwelling.spaces.bedrooms = 0;
        }
        return (
            <Col sm={2} xs={6}>
                <Label>Dormitorios</Label>
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                        <Button
                            color="light"
                            onClick={() => this.handleMinusClick('spaces', 'bedrooms')}>
                            <FontAwesome name="minus"/>
                        </Button>
                    </InputGroupAddon>
                    <Input
                        disabled
                        value={this.state.dwelling.spaces.bedrooms}
                    />
                    <InputGroupAddon addonType="append">
                        <Button
                            color="light"
                            onClick={() => this.handlePlusClick('spaces', 'bedrooms')}>
                            <FontAwesome name="plus"/>
                        </Button>
                    </InputGroupAddon>
                </InputGroup>
            </Col>
        );
    }

    closets() {
        if (this.state.dwelling.spaces.closets === undefined) {
            this.state.dwelling.spaces.closets = 0;
        }
        return (
            <Col sm={2} xs={6}>
                <Label>Placard</Label>
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                        <Button
                            color="light"
                            onClick={() => this.handleMinusClick('spaces', 'closets')}>
                            <FontAwesome name="minus"/>
                        </Button>
                    </InputGroupAddon>
                    <Input
                        disabled
                        value={this.state.dwelling.spaces.closets}
                    />
                    <InputGroupAddon addonType="append">
                        <Button
                            color="light"
                            onClick={() => this.handlePlusClick('spaces', 'closets')}>
                            <FontAwesome name="plus"/>
                        </Button>
                    </InputGroupAddon>
                </InputGroup>
            </Col>
        );
    }

    rooms() {
        if (this.state.dwelling.spaces.rooms === undefined) {
            this.state.dwelling.spaces.rooms = 0;
        }
        return (
            <Col sm={2} xs={6}>
                <Label>Ambientes</Label>
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                        <Button
                            color="light"
                            onClick={() => this.handleMinusClick('spaces', 'rooms')}>
                            <FontAwesome name="minus"/>
                        </Button>
                    </InputGroupAddon>
                    <Input
                        disabled
                        value={this.state.dwelling.spaces.rooms}
                    />
                    <InputGroupAddon addonType="append">
                        <Button
                            color="light"
                            onClick={() => this.handlePlusClick('spaces', 'rooms')}>
                            <FontAwesome name="plus"/>
                        </Button>
                    </InputGroupAddon>
                </InputGroup>
            </Col>
        );
    }

    bathRoom() {
        if (this.state.dwelling.spaces.bathRoom === undefined) {
            this.state.dwelling.spaces.bathRoom = 0;
        }
        return (
            <Col sm={2} xs={6}>
                <Label>Baños</Label>
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                        <Button
                            color="light"
                            onClick={() => this.handleMinusClick('spaces', 'bathRoom')}>
                            <FontAwesome name="minus"/>
                        </Button>
                    </InputGroupAddon>
                    <Input
                        disabled
                        value={this.state.dwelling.spaces.bathRoom}
                    />
                    <InputGroupAddon addonType="append">
                        <Button
                            color="light"
                            onClick={() => this.handlePlusClick('spaces', 'bathRoom')}>
                            <FontAwesome name="plus"/>
                        </Button>
                    </InputGroupAddon>
                </InputGroup>
            </Col>
        );
    }

    toilette() {
        if (this.state.dwelling.spaces.toilette === undefined) {
            this.state.dwelling.spaces.toilette = 0;
        }
        return (
            <Col sm={2} xs={6}>
                <Label>Toilette</Label>
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                        <Button
                            color="light"
                            onClick={() => this.handleMinusClick('spaces', 'toilette')}>
                            <FontAwesome name="minus"/>
                        </Button>
                    </InputGroupAddon>
                    <Input
                        disabled
                        value={this.state.dwelling.spaces.toilette}
                    />
                    <InputGroupAddon addonType="append">
                        <Button
                            color="light"
                            onClick={() => this.handlePlusClick('spaces', 'toilette')}>
                            <FontAwesome name="plus"/>
                        </Button>
                    </InputGroupAddon>
                </InputGroup>
            </Col>
        );
    }

    floors() {
        if (this.state.dwelling.spaces.floors === undefined) {
            this.state.dwelling.spaces.floors = 0;
        }
        return (
            <Col sm={2} xs={6}>
                <Label>Plantas</Label>
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                        <Button
                            color="light"
                            onClick={() => this.handleMinusClick('spaces', 'floors')}>
                            <FontAwesome name="minus"/>
                        </Button>
                    </InputGroupAddon>
                    <Input
                        disabled
                        value={this.state.dwelling.spaces.floors}
                    />
                    <InputGroupAddon addonType="append">
                        <Button
                            color="light"
                            onClick={() => this.handlePlusClick('spaces', 'floors')}>
                            <FontAwesome name="plus"/>
                        </Button>
                    </InputGroupAddon>
                </InputGroup>
            </Col>
        );
    }


    living() {
        if (this.state.dwelling.spaces.living === undefined) {
            this.state.dwelling.spaces.living = false;
        }
        return (
            <Col sm={1} xs={3} className="mb-4">
                <Label>Living</Label>
                <Switch
                    onChange={e => this.handleSwitch(e, 'spaces', 'living')}
                    checked={this.state.dwelling.spaces.living}
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
        );
    }

    livingDining() {
        if (this.state.dwelling.spaces.livingDining === undefined) {
            this.state.dwelling.spaces.livingDining = false;
        }
        return (
            <Col sm={1} xs={3} className="mb-4">
                <Label>Liv/Com</Label>
                <Switch
                    onChange={e => this.handleSwitch(e, 'spaces', 'livingDining')}
                    checked={this.state.dwelling.spaces.livingDining}
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
        );
    }

    diningRoom() {
        if (this.state.dwelling.spaces.diningRoom === undefined) {
            this.state.dwelling.spaces.diningRoom = false;
        }
        return (
            <Col sm={1} xs={3} className="mb-4">
                <Label>Comedor</Label>
                <Switch
                    onChange={e => this.handleSwitch(e, 'spaces', 'diningRoom')}
                    checked={this.state.dwelling.spaces.diningRoom}
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
        );
    }

    dailyDiningRoom() {
        if (this.state.dwelling.spaces.dailyDiningRoom === undefined) {
            this.state.dwelling.spaces.dailyDiningRoom = false;
        }
        return (
            <Col sm={1} xs={3} className="mb-4">
                <Label>Com/Diario</Label>
                <Switch
                    onChange={e => this.handleSwitch(e, 'spaces', 'dailyDiningRoom')}
                    checked={this.state.dwelling.spaces.dailyDiningRoom}
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
        );
    }

    kitchen() {
        if (this.state.dwelling.spaces.kitchen === undefined) {
            this.state.dwelling.spaces.kitchen = false;
        }
        return (
            <Col sm={1} xs={3} className="mb-4">
                <Label>Cocina</Label>
                <Switch
                    onChange={e => this.handleSwitch(e, 'spaces', 'kitchen')}
                    checked={this.state.dwelling.spaces.kitchen}
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
        );
    }

    kitchenDining() {
        if (this.state.dwelling.spaces.kitchenDining === undefined) {
            this.state.dwelling.spaces.kitchenDining = false;
        }
        return (
            <Col sm={1} xs={3} className="mb-4">
                <Label>Coc/Com</Label>
                <Switch
                    onChange={e => this.handleSwitch(e, 'spaces', 'kitchenDining')}
                    checked={this.state.dwelling.spaces.kitchenDining}
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
        );
    }

    terrace() {
        if (this.state.dwelling.spaces.terrace === undefined) {
            this.state.dwelling.spaces.terrace = false;
        }
        return (
            <Col sm={1} xs={3} className="mb-4">
                <Label>Terraza</Label>
                <Switch
                    onChange={e => this.handleSwitch(e, 'spaces', 'terrace')}
                    checked={this.state.dwelling.spaces.terrace}
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
        );
    }

    balcony() {
        if (this.state.dwelling.spaces.balcony === undefined) {
            this.state.dwelling.spaces.balcony = false;
        }
        return (
            <Col sm={1} xs={3} className="mb-4">
                <Label>Balcón</Label>
                <Switch
                    onChange={e => this.handleSwitch(e, 'spaces', 'balcony')}
                    checked={this.state.dwelling.spaces.balcony}
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
        );
    }

    backYard() {
        if (this.state.dwelling.spaces.backYard === undefined) {
            this.state.dwelling.spaces.backYard = false;
        }
        return (
            <Col sm={1} xs={3} className="mb-4">
                <Label>Patio</Label>
                <Switch
                    onChange={e => this.handleSwitch(e, 'spaces', 'backYard')}
                    checked={this.state.dwelling.spaces.backYard}
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
        );
    }

    garden() {
        if (this.state.dwelling.spaces.garden === undefined) {
            this.state.dwelling.spaces.garden = false;
        }
        return (
            <Col sm={1} xs={3} className="mb-4">
                <Label>Jardín</Label>
                <Switch
                    onChange={e => this.handleSwitch(e, 'spaces', 'garden')}
                    checked={this.state.dwelling.spaces.garden}
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
        );
    }

    swimmingPool() {
        if (this.state.dwelling.spaces.swimmingPool === undefined) {
            this.state.dwelling.spaces.swimmingPool = false;
        }
        return (
            <Col sm={1} xs={3} className="mb-4">
                <Label>Piscinas</Label>
                <Switch
                    onChange={e => this.handleSwitch(e, 'spaces', 'swimmingPool')}
                    checked={this.state.dwelling.spaces.swimmingPool}
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
        );
    }

    barbecue() {
        if (this.state.dwelling.spaces.barbecue === undefined) {
            this.state.dwelling.spaces.barbecue = false;
        }
        return (
            <Col sm={1} xs={3} className="mb-4">
                <Label>Quincho</Label>
                <Switch
                    onChange={e => this.handleSwitch(e, 'spaces', 'barbecue')}
                    checked={this.state.dwelling.spaces.barbecue}
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
        );
    }

    garage() {
        if (this.state.dwelling.spaces.garage === undefined) {
            this.state.dwelling.spaces.garage = 'No';
        }
        return (
            <Col xs={6}>
                <FormGroup controlId="spaces">
                    <Label>Garage</Label>
                    <FormControl
                        componentClass="select"
                        value={this.state.dwelling.spaces.garage}
                        placeholder="Seleccione"
                        onChange={e => this.handleChange(e, 'garage')}
                    >
                        <option>Seleccione</option>
                        <option value="No">No</option>
                        <option value="Si, Cubierta">Si, Cubierta</option>
                        <option value="2 Autos">2 Autos</option>
                        <option value="3 Autos">3 Autos</option>
                        <option value="4 Autos">4 Autos</option>
                        <option value="5 Autos">5 Autos</option>
                        <option value="6 o más autos">6 o más Autos</option>
                        <option value="Semi Cubierta">Semi Cubierta</option>
                        <option value="Descubierta">Descubierta</option>
                        <option value="Optativa">Optativa</option>
                    </FormControl>
                </FormGroup>
            </Col>
        );
    }

    laundryRoom() {
        if (this.state.dwelling.spaces.laundryRoom === undefined) {
            this.state.dwelling.spaces.laundryRoom = 'No';
        }
        return (
            <Col xs={6}>
                <FormGroup controlId="spaces">
                    <Label>Lavadero</Label>
                    <FormControl
                        componentClass="select"
                        value={this.state.dwelling.spaces.laundryRoom}
                        placeholder="Seleccione"
                        onChange={e => this.handleChange(e, 'laundryRoom')}
                    >
                        <option>Seleccione</option>
                        <option value="No">No</option>
                        <option value="Cubierto">Cubierto</option>
                        <option value="Dos">Dos</option>
                        <option value="Incorporado">Incorporado</option>
                        <option value="Descubierto">Descubierto</option>
                        <option value="Semi Cubierto">Semi Cubierto</option>
                        <option value="Compartido">Compartido</option>
                    </FormControl>
                </FormGroup>
            </Col>
        );
    }

    storage() {
        if (this.state.dwelling.spaces.storage === undefined) {
            this.state.dwelling.spaces.storage = true;
        }
        return (
            <Col sm={1} xs={3} className="mb-4">
                <Label>Baulera</Label>
                <Switch
                    onChange={e => this.handleSwitch(e, 'spaces', 'storage')}
                    checked={this.state.dwelling.spaces.storage}
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
        );
    }

    furnished() {
        if (this.state.dwelling.features.furnished === undefined) {
            this.state.dwelling.features.furnished = true;
        }
        return (
            <Col sm={1} xs={3} className="mb-4">
                <Label>Amoblado</Label>
                <Switch
                    onChange={e => this.handleSwitch(e, 'features', 'furnished')}
                    checked={this.state.dwelling.features.furnished}
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
        );
    }

    depser() {
        if (this.state.dwelling.spaces.depser === undefined) {
            this.state.dwelling.spaces.depser = true;
        }
        return (
            <Col sm={2} xs={3} className="mb-4">
                <Label>D. Ser.</Label>
                <Switch
                    onChange={e => this.handleSwitch(e, 'spaces', 'depser')}
                    checked={this.state.dwelling.spaces.depser}
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
        );
    }

    sum() {
        if (this.state.dwelling.spaces.sum === undefined) {
            this.state.dwelling.spaces.sum = true;
        }
        return (
            <Col sm={1} xs={3} className="mb-4">
                <Label>SUM</Label>
                <Switch
                    onChange={e => this.handleSwitch(e, 'spaces', 'sum')}
                    checked={this.state.dwelling.spaces.sum}
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
        );
    }

    apartments() {
        if (this.state.dwelling.features.apartments === undefined) {
            this.state.dwelling.features.apartments = true;
        }
        return (
            <Col sm={1} xs={3} className="mb-4">
                <Label>Departamentos</Label>
                <Switch
                    onChange={e => this.handleSwitch(e, 'spaces', 'apartments')}
                    checked={this.state.dwelling.features.apartments}
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
        );
    }

    offices() {
        if (this.state.dwelling.features.offices === undefined) {
            this.state.dwelling.features.offices = 0;
        }
        return (
            <Col sm={2}>
                <Label>Oficinas</Label>
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                        <Button onClick={() => this.handleMinusClick('spaces', 'offices')}>
                            -
                        </Button>
                    </InputGroupAddon>
                    <Input
                        disabled
                        value={this.state.dwelling.features.offices}
                    />
                    <InputGroupAddon addonType="prepend">
                        <Button onClick={() => this.handlePlusClick('spaces', 'offices')}>
                            +
                        </Button>
                    </InputGroupAddon>
                </InputGroup>
            </Col>
        );
    }

    location() {
        if (this.state.dwelling.features.location === undefined) {
            this.state.dwelling.features.location = 'Desconocida';
        }
        return (
            <Col sm={4} xs={4}>
                <FormGroup
                    controlId="features"
                >
                    <Label>Ubicación</Label>
                    <FormControl
                        componentClass="select"
                        value={this.state.dwelling.features.location}
                        placeholder="Seleccione"
                        onChange={e => this.handleChange(e, 'location')}
                    >
                        <option>Seleccione</option>
                        <option value="Desconocida">Desconocida</option>
                        <option value="Frente">Frente</option>
                        <option value="Contrafrente">Contrafrente</option>
                        <option value="Lateral">Lateral</option>
                        <option value="Interno">Interno</option>
                    </FormControl>
                </FormGroup>
            </Col>
        );
    }

    orientation() {
        if (this.state.dwelling.features.orientation === undefined) {
            this.state.dwelling.features.orientation = 'Desconocida';
        }
        return (
            <Col sm={4} xs={4}>
                <FormGroup controlId="features">
                    <Label>Orientación</Label>
                    <FormControl
                        componentClass="select"
                        value={this.state.dwelling.features.orientation}
                        placeholder="Seleccione"
                        onChange={e => this.handleChange(e, 'orientation')}
                    >
                        <option disabled>Seleccione</option>
                        <option value="Desconocida">Desconocida</option>
                        <option value="Norte">Norte</option>
                        <option value="Sur">Sur</option>
                        <option value="Este">Este</option>
                        <option value="Oeste">Oeste</option>
                        <option value="Noreste">Noreste</option>
                        <option value="Noroeste">Noroeste</option>
                        <option value="Sudeste">Sudeste</option>
                        <option value="Sudoeste">Sudoeste</option>
                    </FormControl>
                </FormGroup>
            </Col>
        );
    }

    luminosity() {
        if (this.state.dwelling.features.luminosity === undefined) {
            this.state.dwelling.features.luminosity = 'Desconocida';
        }
        return (
            <Col sm={4} xs={4}>
                <FormGroup controlId="features">
                    <Label>Luminosidad</Label>
                    <FormControl
                        componentClass="select"
                        value={this.state.dwelling.features.luminosity}
                        placeholder="Seleccione"
                        onChange={e => this.handleChange(e, 'luminosity')}
                    >
                        <option disabled>Seleccione</option>
                        <option value="Desconocida">Desconocida</option>
                        <option value="Excelente">Excelente</option>
                        <option value="Muy Bueno">Muy bueno</option>
                        <option value="Bueno">Bueno</option>
                        <option value="Regular">Regular</option>
                    </FormControl>
                </FormGroup>
            </Col>
        );
    }

    heating() {
        if (this.state.dwelling.features.heating === undefined) {
            this.state.dwelling.features.heating = new Array();
        }
        const heatingOptions = [
            {value: 'No posee', label: 'No posee'},
            {value: 'Gas natural', label: 'Gas natural'},
            {value: 'Gas envasado', label: 'Gas envasado'},
            {value: 'Tiro balanceado', label: 'Tiro balanceado'},
            {value: 'Estufas eléctricas', label: 'Estufas eléctricas'},
            {value: 'Split frío/calor', label: 'Split frío/calor'},
            {value: 'Salamandra', label: 'Salamandra'},
            {value: 'Hogar a leña', label: 'Hogar a leña'},
            {value: 'Hogar a gas', label: 'Hogar a gas'},
            {value: 'Radiadores', label: 'Radiadores'},
            {value: 'Caldera', label: 'Caldera'},
            {value: 'Caldera individual', label: 'Caldera individual'},
            {value: 'Losa radiante', label: 'Losa radiante'},
            {value: 'Zócalo radiante', label: 'Zócalo radiante'},
            {value: 'Piso radiante', label: 'Piso radiante'},
            {value: 'Eskabes', label: 'Eskabes'},
            {value: 'Central', label: 'Central'},
            {value: 'Central por radiadores', label: 'Central por radiadores'},
            {value: 'Central por ducto', label: 'Central por ducto'}
        ];
        return (
            <Col sm={4} className="mb-3">
                Indique calefacción
                <Select
                    value={this.state.dwelling.features.heating}
                    placeholder=""
                    isMulti
                    options={heatingOptions}
                    onChange={e => this.handleSelect(e, 'features', 'heating')}
                />
            </Col>
        );
    }

    antiquity() {
        if (this.state.dwelling.features.antiquity === undefined) {
            this.state.dwelling.features.antiquity = 'Desconocida';
        }
        return (
            <Col sm={4} xs={4}>
                <FormGroup controlId="features">
                    <Label>Antigüedad</Label>
                    <FormControl
                        componentClass="select"
                        value={this.state.dwelling.features.antiquity}
                        placeholder="Seleccione"
                        onChange={e => this.handleChange(e, 'antiquity')}
                    >
                        <option>Seleccione</option>
                        <option value="Desconocida">Desconocida</option>
                        <option value="1 Año">1 Año</option>
                        <option value="2 Años">2 Años</option>
                        <option value="3 Años">3 Años</option>
                        <option value="4 Años">4 Años</option>
                        <option value="5 Años">5 Años</option>
                        <option value="6 Años">6 Años</option>
                        <option value="7 Años">7 Años</option>
                        <option value="8 Años">8 Años</option>
                        <option value="9 Años">9 Años</option>
                        <option value="10 Años">10 Años</option>
                        <option value="Más de 10 años">Más de 10 años</option>
                        <option value="Más de 20 años">Más de 20 años</option>
                        <option value="Más de 40 años">Más de 40 años</option>
                        <option value="Más de 60 años">Más de 60 años</option>
                    </FormControl>
                </FormGroup>
            </Col>
        );
    }

    allotment() {
        if (this.state.dwelling.features.allotment === undefined) {
            this.state.dwelling.features.allotment = 'Desconocido';
        }
        return (
            <Col sm={4} xs={4}>
                <FormGroup controlId="features">
                    <Label>Lote</Label>
                    <FormControl
                        componentClass="select"
                        value={this.state.dwelling.features.allotment}
                        placeholder="Seleccione"
                        onChange={e => this.handleChange(e, 'allotment')}
                    >
                        <option>Seleccione</option>
                        <option value="Desconocido">Desconocido</option>
                        <option value="Metros cubiertos">Metros cubiertos</option>
                        <option value="Metros descubiertos">Metros descubiertos</option>
                        <option value="Metros semicuertos">Metros semicuertos</option>
                    </FormControl>
                </FormGroup>
            </Col>
        );
    }

    repair() {
        if (this.state.dwelling.features.repair === undefined) {
            this.state.dwelling.features.repair = 'No';
        }
        return (
            <Col sm={4} xs={4}>
                <FormGroup controlId="features">
                    <Label>Fue refaccionado</Label>
                    <FormControl
                        componentClass="select"
                        value={this.state.dwelling.features.repair}
                        placeholder="Seleccione"
                        onChange={e => this.handleChange(e, 'repair')}
                    >
                        <option>Seleccione</option>
                        <option value="No">No</option>
                        <option value="Si">Si</option>
                        <option value="1 Año">1 Año</option>
                        <option value="2 Años">2 Año</option>
                        <option value="3 Años">3 Año</option>
                        <option value="4 Años">4 Año</option>
                        <option value="5 Años">5 Año</option>
                        <option value="6 Años">6 Año</option>
                        <option value="7 Años">7 Año</option>
                        <option value="10 Años">10 Años</option>
                        <option value="Más de 10 años">Más de 10 años</option>
                    </FormControl>
                </FormGroup>
            </Col>
        );
    }

    refurbished() {
        if (this.state.dwelling.features.refurbished === undefined) {
            this.state.dwelling.features.refurbished = false;
        }
        return (
            <Col sm={3} className="mb-4">
                <Label>Por refaccionar</Label>
                <Switch
                    onChange={e => this.handleSwitch(e, 'features', 'refurbished')}
                    checked={this.state.dwelling.features.refurbished}
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
        );
    }

    status() {
        if (this.state.dwelling.features.status === undefined) {
            this.state.dwelling.features.status = 'Desconocido';
        }
        return (
            <Col sm={4} xs={4}>
                <FormGroup controlId="features">
                    <Label>Estado</Label>
                    <FormControl
                        componentClass="select"
                        value={this.state.dwelling.features.status}
                        placeholder="Seleccione"
                        onChange={e => this.handleChange(e, 'status')}
                    >
                        <option>Seleccione</option>
                        <option value="Desconocido">Desconocido</option>
                        <option value="Nuevo">Nuevo</option>
                        <option value="A estrenar">A estrenar</option>
                        <option value="Excelente">Excelente</option>
                        <option value="Muy Bueno">Muy bueno</option>
                        <option value="Bueno">Bueno</option>
                        <option value="Usado">Usado</option>
                        <option value="Regular">Regular</option>
                        <option value="A reciclar">A reciclar</option>
                        <option value="A demoler">A demoler</option>
                        <option value="En construcción">En construcción</option>
                        <option value="Refaccionado">Refaccionado</option>
                    </FormControl>
                </FormGroup>
            </Col>
        );
    }

    constructionYear() {
        return (
            <Col sm={2}>
                <FormGroup controlId="features">
                    <Label>Año de construcción</Label>
                    <FormControl
                        type="number"
                        value={this.state.dwelling.features.constructionYear}
                        placeholder="----"
                        maxLength={4}
                        onChange={e => this.handleChange(e, 'constructionYear')}
                    />
                </FormGroup>
            </Col>
        );
    }

    totalSurface() {
        return (
            <Col sm={3} xs={4}>
                <FormGroup controlId="features">
                    <Label>Sup. Semic.</Label>
                    <FormControl
                        type="number"
                        value={this.state.dwelling.features.totalSurface}
                        placeholder="m2"
                        onChange={e => this.handleChange(e, 'totalSurface')}
                    />
                </FormGroup>
            </Col>
        );
    }

    coveredSurface() {
        return (
            <Col sm={3} xs={4}>
                <FormGroup controlId="features">
                    <Label>Sup. Cub.</Label>
                    <FormControl
                        type="number"
                        value={this.state.dwelling.features.coveredSurface}
                        placeholder="m2"
                        onChange={e => this.handleChange(e, 'coveredSurface')}
                    />
                </FormGroup>
            </Col>
        );
    }

    lotSurface() {
        return (
            <Col sm={3} xs={4}>
                <FormGroup controlId="features">
                    <Label>Sup. Lote</Label>
                    <FormControl
                        type="number"
                        value={this.state.dwelling.features.lotSurface}
                        placeholder="m2"
                        onChange={e => this.handleChange(e, 'lotSurface')}
                    />
                </FormGroup>
            </Col>
        );
    }
    lotMeassures() {
        return (
            <Row>
                <Col xs={6}>
                    <FormGroup controlId="features">
                        <Label>Ancho/Frente</Label>
                        <FormControl
                            type="number"
                            value={this.state.dwelling.features.lotWidth}
                            placeholder="mts"
                            onChange={e => this.handleChange(e, 'lotWidth')}
                        />
                    </FormGroup>
                </Col>
                <Col xs={6}>
                    <FormGroup controlId="features">
                        <Label>Largo/Fondo</Label>
                        <FormControl
                            type="number"
                            value={this.state.dwelling.features.lotLength}
                            placeholder="mts"
                            onChange={e => this.handleChange(e, 'lotLength')}
                        />
                    </FormGroup>
                </Col>
            </Row>
        );
    }

    floor() {
        if (this.state.dwelling.features.floor === undefined) {
            this.state.dwelling.features.floor = 0;
        }
        return (
            <Col sm={3} xs={6}>
                <Label>Piso</Label>
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                        <Button
                            color="light"
                            onClick={() => this.handleMinusClick('features', 'floor')}>
                            <FontAwesome name="minus"/>
                        </Button>
                    </InputGroupAddon>
                    <Input
                        disabled
                        value={this.state.dwelling.features.floor}
                    />
                    <InputGroupAddon addonType="prepend">
                        <Button
                            color="light"
                            onClick={() => this.handlePlusClick('features', 'floor')}>
                            <FontAwesome name="plus"/>
                        </Button>
                    </InputGroupAddon>
                </InputGroup>
            </Col>
        );
    }

    gas() {
        if (this.state.dwelling.services.gas === undefined) {
            this.state.dwelling.services.gas = true;
        }
        return (
            <Col sm={1} xs={3} className="mb-4">
                <Label>Gas</Label>
                <Switch
                    onChange={e => this.handleSwitch(e, 'services', 'gas')}
                    checked={this.state.dwelling.services.gas}
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
        );
    }

    water() {
        if (this.state.dwelling.services.water === undefined) {
            this.state.dwelling.services.water = true;
        }
        return (
            <Col sm={1} xs={3} className="mb-4">
                <Label>Agua</Label>
                <Switch
                    onChange={e => this.handleSwitch(e, 'services', 'water')}
                    checked={this.state.dwelling.services.water}
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
        );
    }

    sewer() {
        if (this.state.dwelling.services.sewer === undefined) {
            this.state.dwelling.services.sewer = true;
        }
        return (
            <Col sm={1} xs={3} className="mb-4">
                <Label>Cloacas</Label>
                <Switch
                    onChange={e => this.handleSwitch(e, 'services', 'sewer')}
                    checked={this.state.dwelling.services.sewer}
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
        );
    }

    phone() {
        if (this.state.dwelling.services.phone === undefined) {
            this.state.dwelling.services.phone = true;
        }
        return (
            <Col sm={1} xs={3} className="mb-4">
                <Label>Teléfono</Label>
                <Switch
                    onChange={e => this.handleSwitch(e, 'services', 'phone')}
                    checked={this.state.dwelling.services.phone}
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
        );
    }

    pavement() {
        if (this.state.dwelling.services.pavement === undefined) {
            this.state.dwelling.services.pavement = true;
        }
        return (
            <Col sm={1} xs={3} className="mb-4">
                <Label>Asfalto</Label>
                <Switch
                    onChange={e => this.handleSwitch(e, 'services', 'pavement')}
                    checked={this.state.dwelling.services.pavement}
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
        );
    }

    electricity() {
        if (this.state.dwelling.services.electricity === undefined) {
            this.state.dwelling.services.electricity = true;
        }
        return (
            <Col sm={1} xs={3} className="mb-4">
                <Label>Luz</Label>
                <Switch
                    onChange={e => this.handleSwitch(e, 'services', 'electricity')}
                    checked={this.state.dwelling.services.electricity}
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
        );
    }

    cableTv() {
        if (this.state.dwelling.services.cableTv === undefined) {
            this.state.dwelling.services.cableTv = true;
        }
        return (
            <Col sm={1} xs={3} className="mb-4">
                <Label>Cable</Label>
                <Switch
                    onChange={e => this.handleSwitch(e, 'services', 'cableTv')}
                    checked={this.state.dwelling.services.cableTv}
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
        );
    }

    security() {
        if (this.state.dwelling.services.security === undefined) {
            this.state.dwelling.services.security = false;
        }
        return (
            <Col sm={1} xs={3} className="mb-4">
                <Label>Seguridad</Label>
                <Switch
                    onChange={e => this.handleSwitch(e, 'services', 'security')}
                    checked={this.state.dwelling.services.security}
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
        );
    }

    expenses() {
        return (
            <Col sm={3} xs={6}>
                <FormGroup controlId="services">
                    <Label>Expensas</Label>
                    <FormControl
                        type="number"
                        value={this.state.dwelling.services.expenses}
                        placeholder="$"
                        onChange={e => this.handleChange(e, 'expenses')}
                    />
                </FormGroup>
            </Col>
        );
    }

    bank() {
        if (this.state.dwelling.legal.bank === undefined) {
            this.state.dwelling.legal.bank = false;
        }
        return (
            <Col sm={1} xs={3} className="mb-4">
                <Label>Apto Banco</Label>
                <Switch
                    onChange={e => this.handleSwitch(e, 'legal', 'bank')}
                    checked={this.state.dwelling.legal.bank}
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
        );
    }

    prof() {
        if (this.state.dwelling.legal.prof === undefined) {
            this.state.dwelling.legal.prof = false;
        }
        return (
            <Col sm={1} xs={3} className="mb-4">
                <Label>Apto Prof.</Label>
                <Switch
                    onChange={e => this.handleSwitch(e, 'legal', 'prof')}
                    checked={this.state.dwelling.legal.prof}
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
        );
    }

    tax() {
        return (
            <Row className="mt-4 mb-5">
                <Col sm={12}>
                    <h2>Impuestos</h2>
                    <hr/>
                </Col>
                <Col sm={4} xs={4}>
                    <FormGroup controlId="aprTax">
                        <Label>APR</Label>
                        <FormControl
                            type="number"
                            value={this.state.dwelling.tax.aprTax}
                            placeholder="$"
                            onChange={e => this.handleChange(e, 'tax')}
                        />
                    </FormGroup>
                </Col>
                <Col sm={4} xs={4}>
                    <FormGroup controlId="absaTax">
                        <Label>ABSA</Label>
                        <FormControl
                            type="number"
                            value={this.state.dwelling.tax.absaTax}
                            placeholder="$"
                            onChange={e => this.handleChange(e, 'tax')}
                        />
                    </FormGroup>
                </Col>
                <Col sm={4} xs={4}>
                    <FormGroup controlId="arbaTax">
                        <Label>ARBA</Label>
                        <FormControl
                            type="number"
                            value={this.state.dwelling.tax.arbaTax}
                            placeholder="$"
                            onChange={e => this.handleChange(e, 'tax')}
                        />
                    </FormGroup>
                </Col>
            </Row>
        )
    }

    render() {
        return (
            <Container fluid className="animated fadeIn input-add-delete-fix">
                {this.dataModels()}
                <Row className="mt-4 mb-5">
                    <Col sm={12}>
                        <h2>Legales</h2>
                        <hr/>
                    </Col>
                    {this.bank()}
                    {this.prof()}
                </Row>
                {this.tax()}

                <Row className="proceed-btns">
                    <Col className="text-right">
                        <Button
                            className="goback"
                            onClick={() => this.handleSubmit('/admin/dwellings/general')}
                        >
                            <FontAwesome name="angle-left"/>
                        </Button> {' '}
                        <Button
                            className="next"
                            onClick={() => this.handleSubmit('/admin/dwellings/description')}
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
        dwelling: state.dwelling.dwelling
    }),
    dispatch => ({
        savePartialDwelling: dwelling => dispatch(savePartialDwelling(dwelling))
    })
)(Characteristics);
