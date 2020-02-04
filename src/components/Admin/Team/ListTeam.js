import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {map, includes} from 'lodash';
import {
  Container,
  Row,
  Col,
  Input,
  ListGroup,
  ListGroupItem,
  Collapse,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter, Label
} from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import {requestAgencies, requestDeleteAgency, requestSuspendAgency} from '../../../actions';
import nav from "../../App/Sidebar/_nav";
import Switch from 'react-switch';

class ListTeam extends Component {
    static propTypes = {
        requestAgencies: PropTypes.func.isRequired,
        agencies: PropTypes.arrayOf(PropTypes.shape({})),
        requestDeleteAgency: PropTypes.func.isRequired
    };

    static defaultProps = {
        agencies: null
    };

    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            agencyId: null
        };
        this.toggle = this.toggle.bind(this);
    }

    componentDidMount() {
        this.props.requestAgencies();
        console.log("111111111", this.props);
    }

    editAgency(agency) {
        let auctioneers = [], sellers = [];
        if (agency.hasOwnProperty('auctioneers')) {
            auctioneers = agency.auctioneers.map(auctioneer => {
                return {label: auctioneer.label, value: auctioneer.value['_id']};
            });
        }
        if (agency.hasOwnProperty('sellers')) {
            sellers = agency.sellers.map(seller => {
                return {label: seller.label, value: seller.value['_id']};
            });
        }
        agency = {...agency, auctioneers, sellers};

        this.props.history.push({pathname: '/admin/team/edit', state: {agency}});
    }

    deleteAgencyConfirm(e, agencyId) {
        e.stopPropagation();
        this.setState({agencyId: agencyId});
        this.toggle();
    }

    deleteAgency() {
        this.props.requestDeleteAgency(this.state.agencyId);
        this.toggle();
    }

    handleSwitch(e, agencyId) {
        this.setState({agencyId: agencyId});
        this.toggle();
    }

    suspendAgency() {
        this.props.requestSuspendAgency(this.state.agencyId);
        this.toggle();
    }

    toggle() {
        this.setState({modal: !this.state.modal});
    }

    toggleCollapse(event, agencyId) {
        // If the click was not on the textarea
        if (!(event.target.className === 'form-control' && event.target.readOnly)) {
            this.setState({
                [agencyId]: !this.state[agencyId]
            });
        }
    }

    renderContent() {
        const {agencies} = this.props;
        return (
            <div>
                <div className="pb-5">
                    {agencies.filter(agency => {
                        return !agency.deleted;
                    }).map(agency => (
                        <ListGroup key={agency._id} className="inmobs">
                            <ListGroupItem
                                action
                                onClick={e => this.toggleCollapse(e, agency._id)}
                                className="p-4"
                                style={{cursor:'pointer'}}
                            >
                                <h4 className="title font-weight-bold">{agency.name ? agency.name : 'Inmobiliaria sin Nombre'}</h4>
                                <Collapse className="animated fadeIn" isOpen={this.state[agency._id]}>
                                    <div>
                                        <hr/>
                                        <Row>
                                            <Col sm="12">
                                                <p>Martillero</p>
                                                <h3>
                                                    {agency.auctioneers ?
                                                        agency.auctioneers.map(auctioneer => <span className="d-flex" key={auctioneer.value._id}> <i className="fa fa-user pr-2 pt-1"></i> {auctioneer.label} </span>)
                                                        :
                                                        'No posee'
                                                    }
                                                </h3>
                                            </Col>
                                            <Col sm="4">
                                                <p>Dirección</p>
                                                <h4>{agency.address ?
                                                    <Fragment>
                                                        {agency.address.streetName},{}
                                                        {agency.address.streetNumber},{}
                                                        {agency.address.city}
                                                    </Fragment> : 'Sin Direccion'}
                                                </h4>
                                            </Col>
                                            <Col sm="4">
                                                <p>Tel</p>
                                                <h4>{agency.phone ? agency.phone : 'Desconocido'}</h4>
                                            </Col>
                                            <Col sm="4">
                                                <p>Email</p>
                                                <h4>{agency.email ? agency.email : 'Desconocido'}</h4>
                                            </Col>
                                            <Col sm="12">
                                                <p>Capitán</p>
                                                <h4>{agency.captain ? agency.captain.label : 'No posee'}</h4>
                                            </Col>
                                            <Col sm="12">
                                                <p>Vendedores</p>
                                                <h4>
                                                    {agency.sellers ?
                                                        agency.sellers.filter(seller => seller.value !== null).map((seller, index) => <span className="d-flex" key={`${agency._id}_${index}_${seller.value._id}`}> <i className="fa fa-user pr-2 pt-1"></i> {seller.label} </span>)
                                                        :
                                                        'No posee'
                                                    }
                                                </h4>
                                            </Col>
                                            {this.props.userProfile.role === 'admin' &&
                                            <Col sm="12">
                                                <p>Token</p>
                                                <Input
                                                    readOnly
                                                    type="textarea"
                                                    value={agency.token || ''}
                                                />
                                            </Col>}
                                        </Row>
                                        <hr/>
                                        {this.props.userProfile.role === 'admin' &&
                                        <Row>
                                            <Col sm="12">
                                                <Button
                                                    className="list-action-btn"
                                                    color="light"
                                                    onClick={() => this.editAgency(agency)}
                                                >
                                                    <FontAwesome name="edit"/>
                                                </Button>{' '}
                                                {/*<Button*/}
                                                {/*    className="list-action-btn"*/}
                                                {/*    color="light"*/}
                                                {/*    onClick={e => this.deleteAgencyConfirm(e, index)}*/}
                                                {/*>*/}
                                                {/*    <FontAwesome name="trash"/>*/}
                                                {/*</Button>*/}
                                                {agency.deleted}
                                                <Switch
                                                    onChange={e => this.handleSwitch(e, agency._id)}
                                                    checked={!agency.deleted}
                                                    onColor="#003d6f"
                                                    onHandleColor="#fbad1c"
                                                    handleDiameter={20}
                                                    uncheckedIcon={false}
                                                    checkedIcon={false}
                                                    boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                                    activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                                    height={15}
                                                    width={38}
                                                    className="float-right"
                                                />
                                            </Col>
                                        </Row>}
                                        {this.props.userProfile.role === 'martillero' && agency.auctioneers.length > 0 && agency.auctioneers.map(auctioneer => (auctioneer.value._id === this.props.userProfile._id)).includes(true) &&
                                        <Row>
                                            <Col sm="12">
                                                <Button
                                                    className="list-action-btn"
                                                    color="light"
                                                    onClick={() => this.editAgency(agency)}
                                                >
                                                    <FontAwesome name="edit"/>
                                                </Button>{' '}
                                            </Col>
                                        </Row>}
                                        {this.props.userProfile.role === 'admin' || (this.props.userProfile.role === 'martillero' && agency.auctioneers.length > 0 && agency.auctioneers.map(auctioneer => (auctioneer.value._id === this.props.userProfile._id)).includes(true)) &&
                                        <hr/>}
                                    </div>
                                </Collapse>
                            </ListGroupItem>
                        </ListGroup>
                    ))}
                </div>
                {this.props.userProfile.role === 'admin' &&
                <div>
                    <hr/>
                    <h2>Inmobiliarias Eliminadas</h2>
                    <hr/>
                    {agencies.filter(agency => {
                        return agency.deleted;
                    }).map(agency => (
                        <ListGroup key={agency._id} className="inmobs">
                            <ListGroupItem
                                action
                                onClick={e => this.toggleCollapse(e, agency._id)}
                                className="p-4"
                            >
                            <h4 className="title">{agency.name ? agency.name : 'Inmobiliaria sin Nombre'}</h4>
                            <Collapse className="animated fadeIn" isOpen={this.state[agency._id]}>
                                <div>
                                    <hr/>
                                    <Row>
                                        <Col sm="12">
                                            <p>Martillero</p>
                                            <h3>
                                                {agency.auctioneers ?
                                                  agency.auctioneers.filter(auctioneer => auctioneer.value !== null).map((auctioneer, index) => <span key={`${agency._id}_${index}_${auctioneer.value._id}`}> {auctioneer.label} </span>)
                                                  :
                                                  'No posee'
                                                }
                                            </h3>
                                        </Col>
                                        <Col sm="4">
                                            <p>Dirección</p>
                                            <h4>{agency.address ?
                                                <Fragment>
                                                    {agency.address.streetName},{}
                                                    {agency.address.streetNumber},{}
                                                    {agency.address.city}
                                                </Fragment> : 'Sin Direccion'}
                                            </h4>
                                        </Col>
                                        <Col sm="4">
                                            <p>Tel</p>
                                            <h4>{agency.phone ? agency.phone : 'Desconocido'}</h4>
                                        </Col>
                                        <Col sm="4">
                                            <p>Email</p>
                                            <h4>{agency.email ? agency.email : 'Desconocido'}</h4>
                                        </Col>
                                        <Col sm="12">
                                            <p>Capitán</p>
                                            <h4>{agency.captain ? agency.captain.label : 'No posee'}</h4>
                                        </Col>
                                        <Col sm="12">
                                            <p>Vendedores</p>
                                            <h4>
                                                {agency.sellers ?
                                                  agency.sellers.filter(seller => seller.value !== null).map((seller, index) => <span key={`${agency._id}_${index}_${seller.value._id}`}> {seller.label} </span>)
                                                  :
                                                  'No posee'
                                                }
                                            </h4>
                                        </Col>
                                        {this.props.userProfile.role === 'admin' &&
                                        <Col sm="12">
                                            <p>Token</p>
                                            <Input
                                                readOnly
                                                type="textarea"
                                                value={agency.token || ''}
                                            />
                                        </Col>}
                                    </Row>
                                    <hr/>
                                    {this.props.userProfile.role === 'admin' &&
                                    <Row>
                                        <Col sm="12">
                                            <Button
                                                className="list-action-btn"
                                                color="light"
                                                onClick={() => this.editAgency(agency)}
                                            >
                                                <FontAwesome name="edit"/>
                                            </Button>{' '}
                                            {/*<Button*/}
                                            {/*    className="list-action-btn"*/}
                                            {/*    color="light"*/}
                                            {/*    onClick={e => this.deleteAgencyConfirm(e, index)}*/}
                                            {/*>*/}
                                            {/*    <FontAwesome name="trash"/>*/}
                                            {/*</Button>*/}
                                            {agency.deleted}
                                            <Switch
                                                onChange={e => this.handleSwitch(e, agency._id)}
                                                checked={!agency.deleted}
                                                onColor="#003d6f"
                                                onHandleColor="#fbad1c"
                                                handleDiameter={20}
                                                uncheckedIcon={false}
                                                checkedIcon={false}
                                                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                                height={15}
                                                width={38}
                                                className="float-right"
                                            />
                                        </Col>
                                    </Row>}
                                    {this.props.userProfile.role === 'martillero' && agency.auctioneers.length > 0 && agency.auctioneers.map(auctioneer => (auctioneer.value._id === this.props.userProfile._id)).includes(true) &&
                                    <Row>
                                      <Col sm="12">
                                        <Button
                                          className="list-action-btn"
                                          color="light"
                                          onClick={() => this.editAgency(agency)}
                                        >
                                          <FontAwesome name="edit"/>
                                        </Button>{' '}
                                      </Col>
                                    </Row>}
                                    {this.props.userProfile.role === 'admin' || (this.props.userProfile.role === 'martillero' && agency.auctioneers.length > 0 && agency.auctioneers.map(auctioneer => (auctioneer.value._id === this.props.userProfile._id)).includes(true)) &&
                                    <hr/>}
                                </div>
                            </Collapse>
                        </ListGroupItem>
                    </ListGroup>
                  ))}
                </div>
                }
            </div>
        );
    }

    render() {
        return (
            <Container fluid className="animated fadeIn" style={{padding: '0'}}>
                <Row className="mt-2">
                    <Col sm="12">
                        <h3 className="title">Inmobiliarias</h3>
                        <hr className="mb-3 mt-2"/>
                        {(this.props.agencies && this.props.userProfile) && this.renderContent()}
                    </Col>
                </Row>
                <Modal isOpen={this.state.modal} toggle={this.toggle}>
                    <ModalHeader toggle={this.toggle}>Confirmar activar/desactivar inmobiliaria</ModalHeader>
                    <ModalBody className="p-5">
                        <p className="display-4">Estás seguro?</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button size="lg" color="danger" onClick={this.suspendAgency.bind(this)}>Confirmar</Button>{' '}
                        <Button size="lg" color="light" onClick={this.toggle}>Cancelar</Button>
                    </ModalFooter>
                </Modal>
            </Container>
        );
    }
}

export default connect(
    state => ({
        agencies: state.agency.agencies,
        userProfile: state.user.userProfile
    }),
    dispatch => ({
        requestAgencies: () => dispatch(requestAgencies()),
        requestDeleteAgency: agency => dispatch(requestDeleteAgency(agency)),
        requestSuspendAgency: agencyId => dispatch(requestSuspendAgency(agencyId))
    })
)(ListTeam);
