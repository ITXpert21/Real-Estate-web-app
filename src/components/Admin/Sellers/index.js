import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {
    Container,
    Row,
    Col,
    Button,
    Collapse,
    Input,
    FormGroup,
    Table,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter
} from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import {filter, includes, lowerCase} from 'lodash';

import {requestSearchUsers, clearUsers, requestUsersByRole, clearUsersByRole, requestChangeUserRole, requestReplaceAllCreators} from '../../../actions';

import Typeahead from '../../common/Typeahead';

class Sellers extends Component {
    static propTypes = {
        requestChangeUserRole: PropTypes.func.isRequired,
        requestReplaceAllCreators: PropTypes.func.isRequired,
        requestSearchUsers: PropTypes.func.isRequired,
        requestUsersByRole: PropTypes.func.isRequired,
        clearUsers: PropTypes.func.isRequired,
        clearUsersByRole: PropTypes.func.isRequired,
        usersByRole: PropTypes.arrayOf(PropTypes.shape({})),
        usersOptions: PropTypes.arrayOf(PropTypes.shape({}))
    };

    static defaultProps = {
        usersByRole: [],
        usersOptions: []
    };

    constructor(props) {
        super(props);
        this.state = {
            searchParams: {},
            replaceByUser: {},
            filter: null,
            delSellerIndex: null,
            collapse: false,
            confirmDeletionModal: false,
            deniedDeletionModal: false,
            transferDwellingsBeforeDeleteModal: false
        };
        this.toggleCollapse = this.toggleCollapse.bind(this);
    }

    componentDidMount() {
        this.props.clearUsers();
        this.props.clearUsersByRole();
        const role = 'vendedor';
        this.props.requestUsersByRole(role);
    }

    toggleCollapse() {
        this.setState({collapse: !this.state.collapse});
    }

    toggleModals(modal) {
        this.setState({
            [modal]: !this.state[modal]
        });
    }

    handleChange(user, type) {
        if (type === 'user') {
            this.props.clearUsers();
            this.setState(state => ({searchParams: Object.assign(state.searchParams, user)}));
        }
        if (type === 'replaceByUser') {
            this.setState(state => ({replaceByUser: Object.assign(state.replaceByUser, user)}));
        }
    }

    handleChangeRole() {
        const {searchParams} = this.state;
        this.props.requestChangeUserRole({id: searchParams.value, label: searchParams.label, newRole: 'vendedor'});
    }

    handleSearch(e) {
        this.setState({
            filter: e.target.value
        });
    }

    deleteSellerConfirm(e, index) {
        e.stopPropagation();
        var user = this.props.usersByRole.find(user => user._id === index);
        if (user.visits.length > 0) {
            this.toggleModals('deniedDeletionModal');
        } else if (user.dwellings.length > 0) {
            this.setState({delSellerIndex: index});
            this.toggleModals('transferDwellingsBeforeDeleteModal');
        } else {
            this.setState({delSellerIndex: index});
            this.toggleModals('confirmDeletionModal');
        }
    }

    deleteSeller() {
        this.props.requestChangeUserRole({id: this.state.delSellerIndex, newRole: 'usuario', oldRole: 'vendedor'});
        this.toggleModals('confirmDeletionModal');
    }

    replaceCreatorAndDeleteSeller() {
        this.props.requestReplaceAllCreators({createdBy: this.state.delSellerIndex, replaceByUser: this.state.replaceByUser.value});
        this.props.requestChangeUserRole({id: this.state.delSellerIndex, newRole: 'usuario', oldRole: 'vendedor'});
        this.toggleModals('transferDwellingsBeforeDeleteModal');
    }

    Martillero(user){
        this.props.history.push('/admin/team/ask?username=' + user);
    }

    renderDeniedDeletionModal() {
        return (
            <Modal isOpen={this.state.deniedDeletionModal} toggle={() => this.toggleModals('deniedDeletionModal')}>
                <ModalHeader toggle={() => this.toggleModals('deniedDeletionModal')}>Confirm</ModalHeader>
                <ModalBody>
                    No es posible eliminar el vendedor ya que hay pedidos de visita pendientes o relacionados al vendedor
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => this.toggleModals('deniedDeletionModal')}>Cancel</Button>
                </ModalFooter>
            </Modal>
        );
    }

    renderConfirmDeletionModal() {
        return (
            <Modal isOpen={this.state.confirmDeletionModal} toggle={() => this.toggleModals('confirmDeletionModal')}>
                <ModalHeader toggle={() => this.toggleModals('confirmDeletionModal')}>Confirmar</ModalHeader>
                <ModalBody>
                    ¿Desea eliminar este vendedor?
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" pull-left onClick={this.deleteSeller.bind(this)}>Eliminar</Button>{' '}
                    <Button color="light" onClick={() => this.toggleModals('confirmDeletionModal')}>Cancel</Button>
                </ModalFooter>
            </Modal>
        );
    }

    renderTransferDwellingsBeforeDeleteModal() {
        const {usersOptions} = this.props;
        const {replaceByUser} = this.state;
        const agency_id = this.props.usersByRole.find(user => user._id === this.state.delSellerIndex).agency._id;
        return (
            <Modal isOpen={this.state.transferDwellingsBeforeDeleteModal} toggle={() => this.toggleModals('transferDwellingsBeforeDeleteModal')}>
                <ModalHeader toggle={() => this.toggleModals('transferDwellingsBeforeDeleteModal')}>Confirm</ModalHeader>
                <ModalBody>
                    <Row>
                        <Col sm={12}>
                            <p>Hay propiedades creadas por este usuario. Debes transferirlas a otro usuario antes de eliminar.</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={12}>
                            <FormGroup>
                                <Typeahead
                                    label="Usuario"
                                    control="replaceByUser"
                                    options={filter(usersOptions, user => user.value != this.state.delSellerIndex)}
                                    onLoadOptions={term => this.props.requestSearchUsers(term, undefined, agency_id)}
                                    placeholder="Seleccione usuario"
                                    value={replaceByUser ? replaceByUser : ''}
                                    onChange={params => this.handleChange(params, 'replaceByUser')}
                                    removeSelected
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={this.replaceCreatorAndDeleteSeller.bind(this)} disabled={!replaceByUser.value}>Confirm</Button>{' '}
                    <Button color="secondary" onClick={() => this.toggleModals('transferDwellingsBeforeDeleteModal')}>Cancel</Button>
                </ModalFooter>
            </Modal>
        );
    }

    renderContent() {
        const {usersByRole} = this.props;

        return (  
            <Row>
                {filter(usersByRole, users =>
                    includes(
                        lowerCase(users.name), lowerCase(this.state.filter)) ||
                    includes(
                        lowerCase(users.surname), lowerCase(this.state.filter)) ||
                    includes(
                        lowerCase(users.email), lowerCase(this.state.filter)) ||
                    !this.state.filter)
                    .map(user => (
                    <Col sm={4} key={user._id} className="no-padding">
                        <div className="list-box">
                            <Row>
                                <div className="mr-auto">
                                    <h4>{user.name} {user.surname}</h4>
                                    <em>{user.email}</em>
                                </div>
                                <Button className="" color="light" onClick={()=>this.props.history.push(`/dwellings/mine?seller=${user._id}`)}>
                                    <span className="counter">{user.dwellings.filter(dwelling => dwelling.occupationStatus == 'Disponible').length}</span>
                                    <FontAwesome  size="2x" name="home"/>
                                </Button>
                            </Row>
                            <p><FontAwesome name="whatsapp"/> <b>{user.whatsapp}</b></p>
                            {this.props.userProfile.role == 'admin'?
                                <span>{user.agency? user.agency.name: ''}</span>
                                : null
                            }
                            <hr/>
                            <Row>
                                <Button
                                    className="mr-auto"
                                    outline
                                    color=""
                                    onClick={()=>this.Martillero(user.name)}>
                                    <span className="text-muted">PEDIDOS DE VISITA</span>
                                </Button>
                                {' '}
                                <Button
                                    outline
                                    color=""
                                    onClick={(e) => this.deleteSellerConfirm(e, user._id)}>
                                <FontAwesome className="text-danger" name="trash"/>
                                </Button>
                            </Row>
                        </div>
                    </Col>
                ))}
            </Row>
        );
    }

    render() {
        const {usersOptions} = this.props;
        const {searchParams} = this.state;
        return (
            <Container fluid className="animated fadeIn">
                <h3>Mi Equipo
                    <Button
                        className="pull-right"
                        color="light"
                        onClick={this.toggleCollapse}
                        style={{marginBottom: '1rem'}}
                    >
                        <FontAwesome name="plus"/> Crear nuevo
                    </Button>
                </h3>
                <Collapse isOpen={this.state.collapse} style={{marginBottom: '1rem'}}>
                    <Row>
                        <Col sm="12">
                            <Typeahead
                                label="Usuario"
                                control="user"
                                options={filter(usersOptions, {disabled: false})}
                                onLoadOptions={term => this.props.requestSearchUsers(term)}
                                placeholder="Seleccione usuario"
                                value={searchParams.label ? searchParams : ''}
                                onChange={params => this.handleChange(params, 'user')}
                                removeSelected
                            />
                            <Button color="primary" onClick={() => this.handleChangeRole()}>Confirmar</Button>
                        </Col>
                    </Row>
                </Collapse>
                <FormGroup>
                    <Input onChange={e => this.handleSearch(e)} placeholder="Buscar"/>
                </FormGroup>
                {this.props.usersByRole && this.props.userProfile && this.renderContent()}
                {this.state.confirmDeletionModal && this.renderConfirmDeletionModal()}
                {this.state.deniedDeletionModal && this.renderDeniedDeletionModal()}
                {this.state.transferDwellingsBeforeDeleteModal && this.renderTransferDwellingsBeforeDeleteModal()}
            </Container>
        );
    }
}

export default connect(
    state => ({
        users: state.user.users,
        usersOptions: state.user.usersOptions,
        usersByRole: state.user.usersByRole,
        userProfile: state.user.userProfile
    }),
    dispatch => ({
        requestChangeUserRole: changeParams => dispatch(requestChangeUserRole(changeParams)),
        requestReplaceAllCreators: changeParams => dispatch(requestReplaceAllCreators(changeParams)),
        requestUsersByRole: role => dispatch(requestUsersByRole(role)),
        requestSearchUsers: (term, userType, agency) => dispatch(requestSearchUsers(term, userType, agency)),
        clearUsers: () => dispatch(clearUsers()),
        clearUsersByRole: () => dispatch(clearUsersByRole())
    })
)(Sellers);
