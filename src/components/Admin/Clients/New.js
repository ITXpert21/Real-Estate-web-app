import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {
    Container,
    Row,
    Col,
    Form,
    FormGroup,
    Label,
    Input,
    Button,
    Alert
} from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import moment from 'moment';

import {requestSearchUsers, clearUsers, requestSaveClient, requestUser, clearClientSaved} from '../../../actions';
import Typeahead from '../../common/Typeahead';
import GoogleSearchBox from '../../Maps/ClientGoogleSearchBox';
import {Client} from '../../../model/index';

class New extends Component {
    static propTypes = {
        requestSearchUsers: PropTypes.func.isRequired,
        requestSaveClient: PropTypes.func.isRequired,
        requestUser: PropTypes.func.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired
        }).isRequired,
        clearUsers: PropTypes.func.isRequired,
        clientUsersOptions: PropTypes.arrayOf(PropTypes.shape({})),
        client: PropTypes.shape({}),
        saved: PropTypes.bool,
        unsaved: PropTypes.bool,
        clearClientSaved: PropTypes.func.isRequired
    };

    static defaultProps = {
        client: new Client(),
        clientUsersOptions: [],
        saved: false,
        unsaved: false
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.first) {
            return {first: false};
        }

        if (nextProps.user) {
            return Object.assign(prevState.client, {
                name: nextProps.user.name,
                surname: nextProps.user.surname,
                email: nextProps.user.email,
                birthdate: moment(nextProps.user.birthdate).format('YYYY-MM-DD'),
                cellPhone: nextProps.user.whatsapp,
                user: nextProps.user._id
            });
        }

        return null;
    }

    constructor(props) {
        super(props);
        this.state = {
            client: new Client(),
            user: {
                label: '',
                value: ''
            },
            first: true
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        this.props.clearUsers();
    }

    handleChange(user) {
        this.setState(
            state => ({
                user: {...state.user, value: user.value, label: user.label}
            })
        );
        this.props.requestUser(user.value);
    }

    handleInput(e, id) {
        this.setState(
            state => ({
                client: (Object.assign(state.client, {[id]: e}))
            })
        );
    }

    handleSubmit(event) {
        if (!event.target.checkValidity()) {
            return;
        }
        event.preventDefault();
        const {client} = this.state;
        client.deleted = false;
        this.props.requestSaveClient(client);
    }

    render() {
        const {clientUsersOptions, saved, unsaved} = this.props;
        const {client, user} = this.state;

        if (saved) {
            this.props.clearClientSaved();
            this.props.history.push('/admin/clients/search');
        }

        if (unsaved) {
            this.props.clearClientSaved();
            this.setState({unsaved});
        }

        return (
            <Container fluid className="animated fadeIn" style={{padding: '0'}}>
                <Row className="mt-2">
                    <Col>
                        <h3 className="title">
                            Ingrese un nuevo cliente!
                            <hr className="mb-4 mt-2"/>
                        </h3>
                    </Col>
                </Row>
                <Form
                    onSubmit={this.handleSubmit}
                >
                    <Row>
                        <Col sm={5}>
                            <FormGroup>
                                <Label>Nombre <span style={{color: 'red'}}>*</span></Label>
                                <Input
                                    type="text"
                                    required
                                    bsSize="lg"
                                    placeholder=""
                                    value={client.name}
                                    onChange={e => this.handleInput(e.target.value, 'name')}
                                />
                            </FormGroup>
                        </Col>
                        <Col sm={5}>
                            <FormGroup>
                                <Label>Apellido <span style={{color: 'red'}}>*</span></Label>
                                <Input
                                    type="text"
                                    required
                                    bsSize="lg"
                                    placeholder=""
                                    value={client.surname}
                                    onChange={e => this.handleInput(e.target.value, 'surname')}
                                />
                            </FormGroup>
                        </Col>
                        <Col sm={2} className="text-center d-flex align-items-center">
                            <Button
                                outline
                                size="lg"
                            >
                                Guardar <FontAwesome name="angle-right"/>
                            </Button>
                        </Col>
                    </Row>
                    {/* <Row className="mb-4">
                        <Col>
                            Puede ingresar un cliente completando solo el Nombre y Apellido del mismo, o en el caso que ya se encuentre registrado, realice la búsqueda en la barra por medio de su e-mail.
                            <h4 className="title"><small>No es necesario que siempre agregues un usuario, pero en caso de que el cliente ya esté registrado completa el siguiente select primero para agilizar el rellenado del formulario. Si el cliente no tiene usuario o no lo conocés, podés completarlo mas tarde. Adelante!</small></h4>
                        </Col>
                    </Row> */}
                    <hr className="mt-4 mb-4"/>
                    <Row className="mb-4">
                        <Col sm={3}>
                            <FormGroup>
                                <Label>Celular</Label>
                                <Input
                                    type="number"
                                    placeholder=""
                                    value={client.cellPhone || ''}
                                    onChange={e => this.handleInput(e.target.value, 'cellPhone')}
                                />
                            </FormGroup>
                        </Col>
                        <Col sm={3}>
                            <FormGroup>
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    placeholder=""
                                    value={client.email}
                                    onChange={e => this.handleInput(e.target.value, 'email')}
                                />
                            </FormGroup>
                        </Col>
                        <Col sm={3}>
                            <FormGroup>
                                <Label>Categoría</Label>
                                <Input
                                    type="select"
                                    placeholder=""
                                    value={client.category || 'propietario'}
                                    onChange={e => this.handleInput(e.target.value, 'category')}
                                >
                                    <option value="propietario">propietario</option>
                                    <option value="interesado">interesado</option>
                                    <option value="inquilino">inquilino</option>
                                    <option value="prospectos">prospectos</option>
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col sm={3}>
                            <FormGroup>
                                <Label>Horario de contacto</Label>
                                <Input
                                    type="text"
                                    value={client.contactSchedule || ''}
                                    placeholder=""
                                    maxLength={50}
                                    onChange={e => this.handleInput(e.target.value, 'contactSchedule')}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <hr className="mt-4 mb-4"/>
                    <Row>
                        <Col sm={12} className="mb-3">
                            <h4>Datos avanzados</h4>
                        </Col>
                        <Col sm={2}>
                            <FormGroup>
                                <Label>Dirección</Label>
                                <GoogleSearchBox
                                    address={client.address}
                                    onChange={e => this.handleInput(e, 'address')}
                                />
                            </FormGroup>
                        </Col>
                        <Col sm={2}>
                            <FormGroup>
                                <Label>Tel. Casa</Label>
                                <Input
                                    type="number"
                                    placeholder=""
                                    value={client.phone || ''}
                                    onChange={e => this.handleInput(e.target.value, 'phone')}
                                />
                            </FormGroup>
                        </Col>
                        <Col sm={2}>
                            <FormGroup>
                                <Label>Tel. Trabajo</Label>
                                <Input
                                    type="number"
                                    placeholder=""
                                    value={client.workPhone || ''}
                                    onChange={e => this.handleInput(e.target.value, 'workPhone')}
                                />
                            </FormGroup>
                        </Col>
                        <Col sm={2}>
                            <FormGroup>
                                <Label>Fecha de Nac.</Label>
                                <Input
                                    type="date"
                                    value={client.birthdate || ''}
                                    onChange={e => this.handleInput(e.target.value, 'birthdate')}
                                />
                            </FormGroup>
                        </Col>
                        <Col sm={2}>
                            <FormGroup>
                                <Label>DNI</Label>
                                <Input
                                    type="number"
                                    placeholder=""
                                    value={client.documentId || ''}
                                    onChange={e => this.handleInput(e.target.value, 'documentId')}
                                />
                            </FormGroup>
                        </Col>
                        <Col sm={2}>
                            <FormGroup>
                                <Label>CUIT</Label>
                                <Input
                                    type="number"
                                    placeholder=""
                                    value={client.cuit || ''}
                                    onChange={e => this.handleInput(e.target.value, 'cuit')}
                                />
                            </FormGroup>
                        </Col>
                        <Col sm={12}>
                            <FormGroup>
                                <Label>Observaciones</Label>
                                <Input
                                    type="textarea"
                                    value={client.observations || ''}
                                    onChange={e => this.handleInput(e.target.value, 'observations')}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <hr className="mt-5 mb-5"/>
                    <Row className="mt-5 mb-5">
                        <Col md={5}>
                            <FormGroup>
                                <Typeahead
                                    label="Desea crearlo desde un Usuario Registrado?"
                                    control="users"
                                    options={clientUsersOptions}
                                    onLoadOptions={term => this.props.requestSearchUsers(term, 'usuario')}
                                    placeholder="Seleccione usuario"
                                    value={user || ''}
                                    onChange={params => this.handleChange(params)}
                                    removeSelected
                                />
                            </FormGroup>
                        </Col>
                        <Col sm={12}>
                            <h5 className="title mb-4">
                                <small>* No es necesario que siempre agregues un usuario, pero en caso de que el cliente ya esté registrado completá primero el siguiente select para agilizar el rellenado del formulario. Si el cliente no tiene usuario o no lo conocés, podés completarlo mas tarde.</small>
                            </h5>
                        </Col>
                    </Row>

                    {this.state.unsaved &&
                    <Row>
                        <Alert color="danger">
                            El e-mail ingresado ya existe.
                        </Alert>
                    </Row>}

                </Form>
            </Container>
        );
    }
}

export default connect(
    state => ({
        clientUsersOptions: state.user.clientUsersOptions,
        user: state.user.user,
        saving: state.client.saving,
        saved: state.client.saved,
        unsaved: state.client.unsaved
    }),
    dispatch => ({
        requestSearchUsers: (term, userType) => dispatch(requestSearchUsers(term, userType)),
        requestSaveClient: client => dispatch(requestSaveClient(client)),
        requestUser: user => dispatch(requestUser(user)),
        clearUsers: () => dispatch(clearUsers()),
        clearClientSaved: () => dispatch(clearClientSaved())
    })
)(New);
