import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {
    Container,
    Button,
    FormGroup,
    Input,
    Table,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane
} from 'reactstrap';
import classnames from 'classnames';
import FontAwesome from 'react-fontawesome';
import {BeatLoader} from 'react-spinners';
import {debounce} from 'lodash';
import {requestClients} from '../../../actions';
import Pagination from '../../common/Pagination';
import {orderBy} from 'lodash';

class Search extends Component {
    static propTypes = {
        requestClients: PropTypes.func.isRequired,
        clients: PropTypes.arrayOf(PropTypes.shape({})),
        totalCount: PropTypes.number,
        isLoaded: PropTypes.bool
    };

    static defaultProps = {
        clients: [],
        isLoaded: false,
        totalCount: 0
    };

    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'propietario',
            keyword: '',
            currentPage: 1,
            limit: 20
        };

        this.handleSearchDebounced = debounce(() => {
            this.props.requestClients({
                page: 1,
                size: this.state.limit,
                category: this.state.activeTab,
                search: this.state.keyword || ''
            });
        }, 300);
    }

    componentDidMount() {
        this.props.requestClients({
            page: this.state.currentPage,
            size: this.state.limit,
            category: this.state.activeTab,
            search: this.state.keyword || ''
        });
    }

    onKeywordChange(value) {
        this.setState({
            keyword: value,
            currentPage: 1
        }, () => {
            this.handleSearchDebounced();
        });
    }

    editClient(client) {
        this.props.history.push({pathname: '/admin/clients/edit', state: {client}});
    }

    toggleTab(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab,
                currentPage: 1
            }, () => {
                this.props.requestClients({
                    page: 1,
                    size: this.state.limit,
                    category: this.state.activeTab,
                    search: this.state.keyword || ''
                });
            });
        }
    }

    handlePageChange = page => {
        this.setState({
            currentPage: page
        }, () => {
            this.props.requestClients({
                page: this.state.currentPage,
                size: this.state.limit,
                category: this.state.activeTab,
                search: this.state.keyword || ''
            });
        });
    }

    clientCategories = ['propietario', 'interesado', 'inquilino', 'prospectos'];

    render() {
        let clientsTable;
        let pagination;
        const spinnerStyles = {
            textAlign: 'center',
            marginTop: '20px'
        };
        const {clients} = this.props;
        const sortedClients = orderBy(clients, [client => client.surname.toLowerCase()], ['asc']);

        if (!this.props.isLoaded) {
            clientsTable = (
                <div style={spinnerStyles}>
                    <BeatLoader
                        color="#fbad1c"
                    />
                </div>
            );
        } else if (this.props.clients.length === 0) {
            clientsTable = (
                <div style={spinnerStyles}>
                    <h5>No hay clientes en esta categoría.</h5>
                </div>
            );
        } else {
            clientsTable = (
                <Table hover responsive size="sm">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Mail</th>
                            <th>Cel</th>
                            <th>Categoría</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedClients.map(client => (
                            <tr
                                key={client._id}
                                onClick={() => this.editClient(client)}
                                style={{cursor: 'pointer'}}
                            >
                                <th scope="row">{`${client.surname}, ${client.name}`}</th>
                                <td>
                                    {client.email ?
                                        <em>{client.email}</em>
                                        : <em>-</em>
                                    }
                                </td>
                                <td>
                                    {client.cellPhone ?
                                        <span>{client.cellPhone}</span>
                                        : <span>-</span>
                                    }
                                </td>
                                <td>{client.category}</td>
                                <td align="right"/>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            );

            if (this.props.totalCount / this.state.limit > 1) {
                pagination = (
                    <Pagination
                        totalItems={this.props.totalCount}
                        onChangePage={this.handlePageChange}
                        initialPage={this.state.currentPage}
                    />
                );
            } else {
                pagination = null;
            }
        }

        return (
            <Container fluid className="animated fadeIn">
                <h3 className="pull-left title">Clientes</h3>
                <Button
                    onClick={() => this.props.history.push('/admin/clients/new')}
                    className="pull-right"
                    color="light"
                >
                    <FontAwesome name="plus"/> Crear nuevo
                </Button>
                <FormGroup>
                    <Input
                        type=""
                        name=""
                        id=""
                        placeholder="Buscar cliente"
                        value={this.state.keyword}
                        onChange={e => this.onKeywordChange(e.target.value)}
                    />
                </FormGroup>
                <Nav pills justified>
                    {this.clientCategories.map(category => (
                        <NavItem key={category}>
                            <NavLink
                                className={classnames({active: this.state.activeTab === category})}
                                onClick={() => {
                                    this.toggleTab(category);
                                }}
                            >
                                {category}
                            </NavLink>
                        </NavItem>)
                    )}
                </Nav>
                <TabContent activeTab={this.state.activeTab}>
                    <TabPane tabId={this.state.activeTab}>
                        {clientsTable}
                    </TabPane>
                </TabContent>
                {pagination}
            </Container>
        );
    }
}

export default connect(
    state => ({
        clients: state.client.clients,
        totalCount: state.client.totalCount,
        isLoaded: state.client.isLoaded
    }),
    dispatch => ({
        requestClients: payload => dispatch(requestClients(payload))
    })
)(Search);
