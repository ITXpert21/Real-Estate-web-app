import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import {requestSaveUser, clearUserSaved} from '../../../actions';
import Typeahead from '../../common/Typeahead';
import GoogleSearchBox from '../../Maps/GoogleSearchBox';
import {User} from '../../../model/index';

import FontAwesome from 'react-fontawesome';

class Edit extends Component {
    static propTypes = {
        requestSaveUser: PropTypes.func.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired
        }).isRequired,
        user: PropTypes.shape({})
    };

    static defaultProps = {
        user: new User()
    };

    constructor(props) {
        super(props);
        this.state = {
            user: new User()
        };
    }

    componentDidMount() {
        this.setState(
            state => ({
                user: (Object.assign({}, this.props.location.state.user))
            })
        );
    }

    handleInput(e, id) {
        this.setState(
            state => ({
                user: (Object.assign(state.user, {[id]: e}))
            })
        );
    }

    handleSubmit(event) {
        if (!event.target.checkValidity()) {
            return;
        }
        event.preventDefault();
        const {user} = this.state;
        this.props.requestSaveUser(user);
    }

    render() {
        const {saved, unsaved} = this.props;
        const {user} = this.state;

        if (saved) {
            this.props.clearUserSaved();
            this.props.history.goBack();
        }

        if (unsaved) {
            this.props.clearUserSaved();
            this.setState({'unsaved': unsaved});
        }

        return (
            <Container fluid className="animated fadeIn profile">
                <Form 
                    className="form" 
                    onSubmit={this.handleSubmit.bind(this)}>
                    <Row>
                        <Col sm={6}>
                            <FormGroup>
                                <Label>Nombre</Label>
                                <Input
                                    size="lg"
                                    type="text"
                                    required
                                    placeholder="Ingrese Nombre del Usuario"
                                    value={user.name}
                                    onChange={e => this.handleInput(e.target.value, 'name')}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Apellido</Label>
                                <Input
                                    size="lg"
                                    type="text"
                                    required
                                    placeholder="Ingrese Apellido del Usuario"
                                    value={user.surname}
                                    onChange={e => this.handleInput(e.target.value, 'surname')}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={6}>
                            <FormGroup>
                                <Label>Email</Label>
                                <Input
                                    size="lg"
                                    type="email"
                                    required
                                    disabled
                                    placeholder="Ingrese el E-mail del Usuario"
                                    value={user.email}
                                    onChange={e => this.handleInput(e.target.value, 'email')}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Celular (anteponga: 54 9 ...)</Label>
                                <Input
                                    size="lg"
                                    type="number"
                                    required
                                    placeholder="Ingrese el Celular anteponiendo 54 9"
                                    value={user.whatsapp}
                                    onChange={e => this.handleInput(e.target.value, 'whatsapp')}
                                />
                            </FormGroup>
                        </Col>
                        <Col sm={3}>
                            
                        </Col>
                        {/*<Col sm={12}>
                            <FormGroup>
                                <Label>Rol</Label>
                                <Input
                                    size="lg"
                                    type="select"
                                    required
                                    placeholder="Ingrese el Rol del Usuario"
                                    value={user.role}
                                    onChange={e => this.handleInput(e.target.value, 'role')}
                                >
                                    <option value="admin">admin</option>
                                    <option value="usuario">usuario</option>
                                    <option value="vendedor">vendedor</option>
                                    <option value="martillero">martillero</option>
                                </Input>
                            </FormGroup>
                        </Col>*/}
                    </Row>
                    {this.state.unsaved&&
                    <Row>
                        <Alert color="danger">
                            Email already exists
                        </Alert>
                    </Row>}
                    <hr className="mt-5 mb-5"/>
                    <Row>
                        <Col>
                            <Button 
                                size="lg"
                                color="second"
                                onClick={() => this.props.history.goBack()}
                            >
                                <FontAwesome name="angle-left" /> Volver
                            </Button>
                        </Col>
                        <Col>
                            <Button
                                size="lg"
                                color="secondary"
                                outline
                                className="pull-right"
                                type="submit"
                            >
                                Guardar
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Container>
        );
    }
}

export default connect(
    state => ({
        saving: state.user.saving,
        saved: state.user.saved,
        unsaved: state.user.unsaved
    }),
    dispatch => ({
        requestSaveUser: user => dispatch(requestSaveUser(user)),
        clearUserSaved: () => dispatch(clearUserSaved())
    })
)(Edit);
