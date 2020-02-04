import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import moment from 'moment';
import {
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  ButtonGroup,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  ListGroup,
  ListGroupItem
} from 'reactstrap';
import {BeatLoader} from 'react-spinners';
import InfiniteScroll from 'react-infinite-scroll-component';
import FontAwesome from 'react-fontawesome';
import SweetAlert from 'react-bootstrap-sweetalert';
import LinkIcon from 'react-icons/lib/fa/external-link';
import Clipboard from 'react-clipboard.js';
import {
    requestSearchUsers,
    requestSaveClient,
    requestUser,
    clearClientSaved,
    clearClientRemoved,
    clearDwellings,
    requestLoadMoreDwellings,
    requestLoadFavourites,
    requestDeleteClient,
    requestClientFavorite,
    requestRemoveFavoriteFromClient,
    setActionResult
} from '../../../actions';
import Typeahead from '../../common/Typeahead';
import GoogleSearchBox from '../../Maps/GoogleSearchBox';
import {Client} from '../../../model/index';
import DwellingTitle from '../../../services/dwellingTitle';
import {previewImage} from '../../common/utils/custom_helpers';

const PLACE_OF_USAGE = 'latest';

moment.locale('es');

class Edit extends Component {
    static propTypes = {
        requestSearchUsers: PropTypes.func.isRequired,
        requestSaveClient: PropTypes.func.isRequired,
        requestUser: PropTypes.func.isRequired,
        clearDwellings: PropTypes.func.isRequired,
        requestLoadMoreDwellings: PropTypes.func.isRequired,
        requestLoadFavourites: PropTypes.func.isRequired,
        requestClientFavorite: PropTypes.func.isRequired,
        requestRemoveFavoriteFromClient: PropTypes.func.isRequired,
        setActionResult: PropTypes.func.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired
        }).isRequired,
        clientUsersOptions: PropTypes.arrayOf(PropTypes.shape({})),
        client: PropTypes.shape({}),
        requestDeleteClient: PropTypes.func.isRequired,
        saved: PropTypes.bool,
        deleted: PropTypes.bool,
        unsaved: PropTypes.bool,
        clearClientSaved: PropTypes.func.isRequired,
        clearClientRemoved: PropTypes.func.isRequired,
        dwellings: PropTypes.arrayOf(PropTypes.shape({})),
        user: PropTypes.shape({}),
        totalCount: PropTypes.number
    };

    static defaultProps = {
        client: new Client(),
        clientUsersOptions: [],
        saved: false,
        unsaved: false,
        deleted: false,
        dwellings: [],
        totalCount: 0
    };

    constructor(props) {
        super(props);
        this.state = {
            client: new Client(),
            items: [],
            page: {
                pageNumber: 0,
                perPage: 9
            },
            loading: true,
            item_favourite: [],
            publicationType: 'propiedades',
            user: {
                label: '',
                value: ''
            },
            modal: false,
            delClientId: null,
            alert: null,
            copyModal: false
        };

        this.toggle = this.toggle.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.showAlert = this.showAlert.bind(this);
        this.hideAlert = this.hideAlert.bind(this);
        this.toggleCopyModal = this.toggleCopyModal.bind(this);
        this.copyList = this.copyList.bind(this);
    }

    componentDidMount() {
        this.props.clearDwellings();
        if (this.props.location.state.client) {
            if (this.props.location.state.client.user) {
                this.props.requestUser(this.props.location.state.client.user);
            }
            this.props.requestLoadFavourites({client: this.props.location.state.client._id, page: this.state.page});
        }
        if (this.props.location.state.client && this.props.location.state.client.hasOwnProperty('_id')) {
            this.props.requestClientFavorite(this.props.location.state.client['_id']);
        }
        this.props.requestLoadMoreDwellings({client: this.props.location.state.client._id, page: this.state.page});

        const birthdate = this.props.location.state.client.birthdate ? this.props.location.state.client.birthdate.slice(0, 10) : '';
        this.setState(
            state => ({
                client: (Object.assign({}, this.props.location.state.client, {birthdate}))
            })
        );
    }

    componentWillReceiveProps(props) {
        if (props.dwellings[0] !== this.state.items[0]) {
            this.setState({
                items: this.state.items.concat(props.dwellings)
            });
        }

        if (props.dwelling_favourite && props.dwelling_favourite[0] !== this.state.item_favourite[0]) {
            this.setState({
                item_favourite: props.dwelling_favourite
            });
        }

        if (props.user) {
            if (props.location.state.client.user && props.location.state.client.user === props.user._id) {
                this.setState(
                    state => ({
                        user: {
                            ...state.user,
                            value: props.user._id,
                            label: `${props.user.name} ${props.user.surname} - ${props.user.email}`
                        }
                    })
                );
            }
            this.setState(
                state => ({
                    client: (Object.assign(state.client, {user: props.user._id}))
                })
            );
        }

        if (props.saved) {
            this.props.clearClientSaved();
            this.props.history.push('/admin/clients/search');
        }

        if (props.unsaved) {
            this.props.clearClientSaved();
            this.setState({unsaved: props.unsaved});
        }

        if (props.deleted) {
            this.props.clearClientRemoved();
            this.props.history.push('/admin/clients/search');
        }

        if (props.client && props.client.hasOwnProperty('favorite')) {
            this.setState(state => { return {...state, client: {...state.client, favorite: props.client.favorite}}; });
        }

        if (props.actionResult) {
            this.props.setActionResult(false);
            this.props.requestLoadFavourites({client: this.props.location.state.client._id, page: this.state.page});
            this.props.requestClientFavorite(this.state.client._id);
        }
    }

    fetchMoreData = () => {
        setTimeout(() => {
            const {page} = this.state;
            page.pageNumber = this.state.page.pageNumber + 1;
            this.setState({page});
            this.props.requestLoadMoreDwellings({
                client: this.props.location.state.client._id,
                page: this.state.page
            });

            if (this.props.location.state.client.user) {
                this.props.requestLoadFavourites({
                    client: this.props.location.state.client._id,
                    page: this.state.page
                });
            }
        });
    };

    handleType = type => {
        this.setState({publicationType: type});
    }

    handleInput(e, id) {
        this.setState(
            state => ({
                client: (Object.assign(state.client, {[id]: e}))
            })
        );
    }

    handleChange(user) {
        this.setState(
            state => ({
                user: {...state.user, value: user.value, label: user.label}
            })
        );
        if (user.value) {
            this.props.requestUser(user.value);
        } else {
            this.setState(
                state => ({
                    client: (Object.assign(state.client, {user: undefined}))
                })
            );
        }
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

    deleteClientConfirm(client) {
        this.setState({delClientId: client._id});
        this.toggle();
    }

    deleteClient() {
        this.props.requestDeleteClient(this.state.delClientId);
        this.toggle();
    }

    confirmToRemoveFavoriteFromClient(dwellingId) {
        this.showAlert(dwellingId);
    }

    showAlert(dwellingId = null) {
        let getAlert;
        if (dwellingId) {
            getAlert = () => (
                <SweetAlert
                    warning
                    showCancel
                    cancelBtnText="Cancelar"
                    confirmBtnText="Si, eliminar."
                    confirmBtnBsStyle="danger"
                    cancelBtnBsStyle="default"
                    title="Estás seguro?"
                    onConfirm={() => this.removeFavoriteFromClient(dwellingId)}
                    onCancel={() => this.hideAlert()}
                />
            );
        } else {
            getAlert = () => (
                <SweetAlert
                    success
                    title="Copiado al portapapeles!"
                    onConfirm={() => this.hideAlert()}
                />
            );
        }
        this.setState({copyModal: false, alert: getAlert()});
    }

    hideAlert() {
        this.setState({alert: null});
    }

    async removeFavoriteFromClient(dwellingId) {
        this.setState({alert: null});
        await this.props.requestRemoveFavoriteFromClient({dwellingId, clientId: this.state.client._id});
    }

    toggle() {
        this.setState({
            modal: !this.state.modal
        });
    }

    toggleCopyModal() {
        this.setState({copyModal: !this.state.copyModal});
    }

    copyList() {
        this.showAlert();
    }

    renderContent() {
        return (
            <div className="highlights">
                <InfiniteScroll
                    dataLength={this.state.items.length}
                    next={this.fetchMoreData}
                    hasMore={this.state.items.length < this.props.totalCount}
                    loader={<BeatLoader
                        color="#fbad1c"
                        loading={this.state.loading}
                    />}
                >
                    <Row className="highlights-main" style={{padding: '0'}}>
                        {this.state.items.map(dwelling => {
                            const imageUrl = previewImage(dwelling, ['/upload/', '/upload/w_400,q_auto:eco,f_auto/'], 'http://via.placeholder.com/330x200?text=Sin+Imagen');
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
                                        <div
                                            className="preview-img"
                                            style={{
                                                width: '100%',
                                                height: '200px',
                                                backgroundImage: 'url("' + imageUrl + '")'
                                            }}
                                        />
                                        <Row className="highlight-body" style={{left: '0px', right: '0px'}}>
                                            <Col sm={12}>
                                                {dwelling.price ?
                                                    <h4>
                                                        <small>{dwelling.currency && `${dwelling.currency}` || `$`}</small>
                                                        {dwelling.price}
                                                    </h4>
                                                    : <h4>Consulte</h4>}
                                                <h3 className="primary">
                                                    {title}
                                                </h3>
                                            </Col>
                                            <Col sm={12}>
                                                <span className="pull-left">
                                                    Subido {moment(dwelling.createdAt).startOf('minutes').fromNow()}</span>
                                                <span className="pull-right"><b>#{dwelling.siocId}</b></span>
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                            );
                        })}
                    </Row>
                </InfiniteScroll>
            </div>
        );
    }

    renderfavourite() {
        const clientFavorites = this.state.client && this.state.client.hasOwnProperty('favorite') ? this.state.client.favorite : [];

        return (
            <div className="highlights">
                <InfiniteScroll
                    dataLength={this.state.item_favourite.length}
                    next={this.fetchMoreData}
                    hasMore={false} // NOTE: This endpoint for loading favorite dwellings has no pagination so can not work with infinite scroll. Add it if needed.
                    loader={
                        <BeatLoader
                            color="#fbad1c"
                            loading={this.state.loading}
                        />
                    }
                >
                    <Row className="highlights-main" style={{padding: '0'}}>
                        {this.state.item_favourite.map(dwelling => {
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
                                            {clientFavorites.includes(dwelling._id) &&
                                            <Button
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    this.confirmToRemoveFavoriteFromClient(dwelling._id);
                                                }}
                                                className="like">
                                                <FontAwesome name="times" size="lg" style={{color: '#fbad1c'}} />
                                            </Button>
                                            }
                                        </div>
                                        <div
                                            className="preview-img"
                                            style={{
                                                width: '100%',
                                                height: '200px',
                                                backgroundImage: 'url("' + imageUrl + '")'
                                            }}
                                        />
                                        <Row className="highlight-body" style={{left: '0px', right: '0px'}}>
                                            <Col sm={12}>
                                                {dwelling.price ?
                                                    <h4>
                                                        <small>{dwelling.currency && `${dwelling.currency}` || `$`}</small>
                                                        {dwelling.price}
                                                    </h4>
                                                    : <h4>Consulte</h4>}
                                                <h3 className="primary">
                                                    {title}
                                                </h3>
                                            </Col>
                                            <Col sm={12}>
                                                <span className="pull-left">
                                                    Subido {moment(dwelling.createdAt).startOf('minutes').fromNow()}</span>
                                                <span className="pull-right"><b>#{dwelling.siocId}</b></span>
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                            );
                        })}
                    </Row>
                </InfiniteScroll>
                <div className="float-btns" style={{right: '20px'}}>
                    <Button outline size="lg" onClick={this.toggleCopyModal}>Obtener listado</Button>
                </div>
            </div>
        );
    }

    render() {
        const {clientUsersOptions} = this.props;
        const {client, user} = this.state;
        let copyText = '';
        this.state.item_favourite.map(dwelling => {
            const title = DwellingTitle.get(dwelling, PLACE_OF_USAGE) +' - '+ window.location.origin +'/'+ dwelling.siocId;
            copyText += '\n'+ title;
        });

        return (
            <Container fluid className="animated fadeIn" style={{padding: '0'}}>
                <Form
                    className="form"
                    onSubmit={this.handleSubmit}
                >
                    <Row className="mt-4 mb-2">
                        <Col sm={3}>
                            <FormGroup>
                                <Label>Nombre</Label>
                                <Input
                                    type="text"
                                    bsSize="lg"
                                    required
                                    placeholder=""
                                    value={client.name}
                                    onChange={e => this.handleInput(e.target.value, 'name')}
                                />
                            </FormGroup>
                        </Col>
                        <Col sm={3}>
                            <FormGroup>
                                <Label>Apellido</Label>
                                <Input
                                    type="text"
                                    bsSize="lg"
                                    required
                                    placeholder=""
                                    value={client.surname}
                                    onChange={e => this.handleInput(e.target.value, 'surname')}
                                />
                            </FormGroup>
                        </Col>
                        <Col sm={6}>
                            <FormGroup>
                                <Typeahead
                                    label="Creado desde Usuario Existente"
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
                    </Row>
                    <Row>
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
                                    required
                                    placeholder=""
                                    value={client.category || 'propietario'}
                                    onChange={e => this.handleInput(e.target.value, 'category')}
                                >
                                    <option value="interesado">interesado</option>
                                    <option value="propietario">propietario</option>
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
                    <Row>
                        <Col sm={2}>
                            <FormGroup>
                                <Label>Dirección</Label>
                                <GoogleSearchBox
                                    required
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

                    {this.state.unsaved &&
                    <Row>
                        <Alert color="danger">
                            El E-mail ya existe.
                        </Alert>
                    </Row>}

                    <Row className="mt-3 mb-4">
                        <Col>
                            <Button
                                className="pull-right"
                                outline
                                size="lg"
                                type="submit"
                            >
                                Guardar <FontAwesome name="angle-right"/>
                            </Button>
                            <Button
                                className="pull-right mr-3 btn-danger btn-remove-client"
                                outline
                                color="danger"
                                size="lg"
                                onClick={() => this.deleteClientConfirm(client)}
                            >
                                <FontAwesome name="trash" className="text-danger"/> Eliminar
                            </Button>

                            <Button
                                className="pull-left"
                                outline
                                size="lg"
                                onClick={() => this.props.history.goBack()}
                            >
                                <FontAwesome name="angle-left"/> Volver
                            </Button>
                        </Col>
                    </Row>
                </Form>

                <hr/>

                <Row>
                    <Col sm={12}>
                        <FormGroup>
                            <ButtonGroup className="btn-justified">
                                <Button
                                    outline
                                    onClick={() => this.handleType('propiedades')}
                                    active={this.state.publicationType === 'propiedades'}
                                >
                                    Propiedades
                                </Button>
                                <Button
                                    outline
                                    onClick={() => this.handleType('favourite')}
                                    active={this.state.publicationType === 'favourite'}
                                >
                                    Favoritas
                                </Button>
                            </ButtonGroup>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        {
                            this.state.publicationType === 'propiedades' ?
                                this.state.items.length === 0 ? "El cliente aún no tiene propiedades" : this.renderContent()
                                :this.state.item_favourite.length === 0 ? "El cliente aún no agregó favoritas" : this.renderfavourite()
                        }
                    </Col>
                </Row>
                <Modal isOpen={this.state.modal} toggle={this.toggle}>
                    <ModalHeader toggle={this.toggle}>Eliminar Cliente</ModalHeader>
                    <ModalBody>
                        <h4>
                            Seguro desea eliminar a este cliente? <br/>
                            <small>Esta acción no puede deshacerse.</small>
                        </h4>
                    </ModalBody>
                    <ModalFooter>
                        <Button className="btn" size="lg" color="danger" onClick={this.deleteClient.bind(this)}>Eliminar</Button>{' '}
                        <Button className="btn" size="lg" color="light" onClick={this.toggle}>Cancelar</Button>
                    </ModalFooter>
                </Modal>
                <Modal isOpen={this.state.copyModal} toggle={this.toggleCopyModal}>
                    <ModalHeader toggle={this.toggleCopyModal}>Guardadas al cliente</ModalHeader>
                    <ModalBody>
                        <ListGroup style={{maxHeight: '400px', marginBottom: '10px', overflow: 'scroll'}}>
                            { this.state.item_favourite.map(dwelling => {
                                  const title = DwellingTitle.get(dwelling, PLACE_OF_USAGE);
                                  const href = `/${dwelling.siocId}`;
                                  return (
                                      <ListGroupItem tag="a" href={href} target="_blank" key={dwelling.siocId}>
                                          {title}
                                      </ListGroupItem>);
                            })}
                        </ListGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Clipboard
                            style={{color: '#003d6f', fontSize: '16px'}}
                            component="a"
                            data-clipboard-text={copyText}
                            onSuccess={this.copyList}>
                            <LinkIcon/>{' '}Copiar al portapapeles
                        </Clipboard>
                        {/*<Button className="btn" size="lg" color="light" onClick={this.toggleCopyModal}>Cancelar</Button>*/}
                    </ModalFooter>
                </Modal>
                {this.state.alert}
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
        unsaved: state.client.unsaved,
        deleted: state.client.deleted,
        dwellings: state.dwelling.dwellings,
        totalCount: state.dwelling.totalCount,
        dwelling_favourite: state.dwelling.dwellings_favourite,
        client: state.client,
        actionResult: state.client.actionResult,
    }),
    dispatch => ({
        requestSearchUsers: (term, userType) => dispatch(requestSearchUsers(term, userType)),
        requestUser: user => dispatch(requestUser(user)),
        requestSaveClient: client => dispatch(requestSaveClient(client)),
        clearClientSaved: () => dispatch(clearClientSaved()),
        clearClientRemoved: () => dispatch(clearClientRemoved()),
        clearDwellings: () => dispatch(clearDwellings()),
        requestLoadMoreDwellings: serachParams => dispatch(requestLoadMoreDwellings(serachParams)),
        requestLoadFavourites: serachParams => dispatch(requestLoadFavourites(serachParams)),
        requestDeleteClient: clientId => dispatch(requestDeleteClient(clientId)),
        requestClientFavorite: clientId => dispatch(requestClientFavorite(clientId)),
        requestRemoveFavoriteFromClient: data => dispatch(requestRemoveFavoriteFromClient(data)),
        setActionResult: data => dispatch(setActionResult(data))
    })
)(Edit);
