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

import {requestSearchUsers, clearUsers, requestUsersByRole, clearUsersByRole, requestChangeUserRole} from '../../../actions';

import Typeahead from '../../common/Typeahead';

class Auctioneers extends Component {
    static propTypes = {
        requestChangeUserRole: PropTypes.func.isRequired,
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
            filter: null,
            delSellerIndex: null,
            collapse: false,
            confirmDeletionModal: false,
            deniedDeletionModal: false
        };
        this.toggleCollapse = this.toggleCollapse.bind(this);
    }

    componentDidMount() {
        this.props.clearUsers();
        this.props.clearUsersByRole();
        const role = 'martillero';
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

    handleChange(searchParams) {
        this.props.clearUsers();
        this.setState(state => ({searchParams: Object.assign(state.searchParams, searchParams)}));
    }

    handleChangeRole() {
        const {searchParams} = this.state;
        this.props.requestChangeUserRole({id: searchParams.value, newRole: 'martillero'});
    }

    handleSearch(e) {
        this.setState({
            filter: e.target.value
        });
    }

    deleteAuctioneerConfirm(e, index) {
        e.stopPropagation();
        var user = this.props.usersByRole.find(user => user._id === index);
        if (user.agency && user.agency.auctioneers.filter(auctioneer => auctioneer.value != index).length == 0) {
            this.toggleModals('deniedDeletionModal');
        } else {
            this.setState({delSellerIndex: index});
            this.toggleModals('confirmDeletionModal');
        }
    }

    deleteAuctioneer() {
        this.props.requestChangeUserRole({id: this.state.delSellerIndex, newRole: 'usuario', oldRole: 'martillero'});
        this.toggleModals('confirmDeletionModal');
    }

    renderDeniedDeletionModal() {
        return (
            <Modal isOpen={this.state.deniedDeletionModal} toggle={() => this.toggleModals('deniedDeletionModal')}>
                <ModalHeader toggle={() => this.toggleModals('deniedDeletionModal')}>Confirm</ModalHeader>
                <ModalBody>
                    No es posible eliminar el martillero pues es el único martillero perteneciente a la inmobiliaria
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
                <ModalHeader toggle={() => this.toggleModals('confirmDeletionModal')}>Confirm</ModalHeader>
                <ModalBody>
                    ¿Desea eliminar este martillero?
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={this.deleteAuctioneer.bind(this)}>Delete</Button>{' '}
                    <Button color="secondary" onClick={() => this.toggleModals('confirmDeletionModal')}>Cancel</Button>
                </ModalFooter>
            </Modal>
        );
    }

    renderContent() {
        const {usersByRole} = this.props;
        return (
            <Table hover responsive size="sm">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Mail</th>
                        <th>Cel</th>
                        <th>Inmobiliaria</th>
                        <th/>
                    </tr>
                </thead>
                <tbody>
                    {filter(usersByRole, users =>
                        includes(
                            lowerCase(users.name), lowerCase(this.state.filter)) ||
                        includes(
                            lowerCase(users.surname), lowerCase(this.state.filter)) ||
                        includes(
                            lowerCase(users.email), lowerCase(this.state.filter)) ||
                        !this.state.filter)
                        .map(user => (
                            <tr key={user._id}>
                                <th scope="row">{user.name}, {user.surname}</th>
                                <td>{user.email}</td>
                                <td>{user.whatsapp}</td>
                                <td>{user.agency? user.agency.name: ''}</td>
                                <td>
                                    <Button
                                        outline
                                        className="list-action-btn"
                                        color="light"
                                        onClick={(e) => this.deleteAuctioneerConfirm(e, user._id)}
                                    ><FontAwesome className="text-danger" name="trash"/>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </Table>
        );
    }

    render() {
        const {usersOptions} = this.props;
        const {searchParams} = this.state;
        return (
            <Container fluid className="animated fadeIn">
                <h2>Martilleros
                    <Button
                        className="pull-right"
                        color="light"
                        onClick={this.toggleCollapse}
                    >
                        <FontAwesome name="plus"/> Crear nuevo
                    </Button>
                </h2>
                <Collapse isOpen={this.state.collapse} style={{marginBottom: '1rem'}}>
                    <Row>
                        <Col sm="12">
                            <Typeahead
                                label="Usuario"
                                control="users"
                                options={usersOptions}
                                onLoadOptions={term => this.props.requestSearchUsers(term)}
                                placeholder="Seleccione un/a empleado/a"
                                value={searchParams.label ? searchParams : ''}
                                onChange={params => this.handleChange(params)}
                                removeSelected
                            />
                            <Button color="primary" onClick={() => this.handleChangeRole()}>Confirmar</Button>
                        </Col>
                    </Row>
                </Collapse>
                <FormGroup>
                    <Input onChange={e => this.handleSearch(e)} placeholder="Buscar"/>
                </FormGroup>
                {this.props.usersByRole && this.renderContent()}
                {this.state.confirmDeletionModal && this.renderConfirmDeletionModal()}
                {this.state.deniedDeletionModal && this.renderDeniedDeletionModal()}
            </Container>
        );
    }
}

export default connect(
    state => ({
        users: state.user.users,
        usersOptions: state.user.usersOptions,
        usersByRole: state.user.usersByRole
    }),
    dispatch => ({
        requestChangeUserRole: changeParams => dispatch(requestChangeUserRole(changeParams)),
        requestUsersByRole: role => dispatch(requestUsersByRole(role)),
        requestSearchUsers: term => dispatch(requestSearchUsers(term)),
        clearUsers: () => dispatch(clearUsers()),
        clearUsersByRole: () => dispatch(clearUsersByRole())
    })
)(Auctioneers);
