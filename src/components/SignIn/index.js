/* global window */
import React, {Component, Fragment} from 'react';
import {Form, FormControl, FormGroup, ControlLabel} from 'react-bootstrap';
import {Container, Row, Col, Button} from 'reactstrap';
import {Label, Input} from 'reactstrap';
import {delay} from 'lodash';
import {BeatLoader} from 'react-spinners';
import SignInService from '../../services/signIn';
import SignUpService from '../../services/signUp';
import StorageService from '../../services/storage';
import ResetPasswordService from '../../services/resetPassword';

import {User} from '../../model';

import LoadingButton from '../common/LoadingButton';

export default class SignIn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: new User(),
            email: '',
            password: '',
            clock: null,
            forgotPassword: false,
            forgotPassEmail: '',
            isEmailValid: false,
            resetPasswordErrorMessage: '',
            resetLinkSuccessMessage: '',
            register: false,
            validatePassword: '',
            isPasswordValid: false,
            saving: false
        };
    }

    async handleSubmit(e) {
        e.preventDefault();
        try {
            const result = await SignInService.login(this.state.email, this.state.password);
            if (result.token) {
                StorageService.setAuthToken(result.token);
                window.location = '/home';
            } else {
                this.setState({invalidLogin: true, message: result.message});
            }
        } catch (ex) {
            this.setState({invalidLogin: true});
            clearTimeout(this.state.clock);
            this.setState({clock: delay(() => this.setState({invalidLogin: false}), 3500)});
        }
    }

    handleChange(e) {
        this.setState({[e.target.id]: e.target.value});
    }

    handleUser({target: {id, value}}) {
        this.setState(
            state => ({
                user: new User(Object.assign(state.user, {[id]: value}))
            })
        );
    }

    handleForgotPassword() {
        this.setState({forgotPassword: true});
    }

    async handleForgotPasswordSubmit() {
        this.setState({sending: true});
        try {
            const result = await ResetPasswordService.forgot(this.state.forgotPassEmail);
            this.setState({resetLinkSuccessMessage: result.message, sending: false, forgotPassEmail: ''});
            clearTimeout(this.state.clock);
            this.setState({clock: delay(() => this.setState({resetLinkSuccessMessage: ''}), 3000)});
        } catch (error) {
            this.setState({sending: false, invalidResetLink: true, resetPasswordErrorMessage: error});
            clearTimeout(this.state.clock);
            this.setState({clock: delay(() => this.setState({invalidResetLink: false}), 3500)});
        }
    }

    handleForgotPasswordEmailChange({target}) {
        const isEmailValid = target.checkValidity();
        this.setState({forgotPassEmail: target.value, isEmailValid});
    }

    handleRegister() {
        this.setState({register: true});
    }

    handlePasswordValidation({target: {value}}) {
        if (this.state.user.password !== value) {
            this.setState({isPasswordValid: false});
        } else {
            this.setState({isPasswordValid: true});
        }
        this.setState({validatePassword: value});
    }

    handleBack() {
        this.setState({register: false, forgotPassword: false});
    }

    async handleRegisterSubmit() {
        const regex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        if (this.state.user.email === '' || !regex.test(this.state.user.email)) {
            this.setState({saving: false, invalidEmail: true});
            clearTimeout(this.state.clock);
            this.setState({clock: delay(() => this.setState({invalidEmail: false}), 3500)});
            return;
        }
        if (this.state.user.birthdate === '') {
          this.setState({saving: false, invalidBirthday: true});
          clearTimeout(this.state.clock);
          this.setState({clock: delay(() => this.setState({invalidBirthday: false}), 3500)});
          return;
        }
        if (this.state.user.name === '' || this.state.user.surname === '') {
          this.setState({saving: false, invalidName: true});
          clearTimeout(this.state.clock);
          this.setState({clock: delay(() => this.setState({invalidName: false}), 3500)});
          return;
        }
        this.setState({saving: true});
        try {
            const result = await SignUpService.register(this.state.user);
            if (result.token) {
                StorageService.setAuthToken(result.token);
                window.location = '/home';
            } else {
                this.setState({saving: false, invalidRegister: true});
            }
        } catch (ex) {
            this.setState({saving: false, invalidRegister: true});
            clearTimeout(this.state.clock);
            this.setState({clock: delay(() => this.setState({invalidRegister: false}), 3500)});
        }
    }

    render() {
        const spinerStyles = {
            height: '29px'
        };

        let formContent = (
            <Row className="login">
                <Col>
                    <h3 className="login-intro">Bienvenido :)</h3>
                    <Form onSubmit={e => this.handleSubmit(e)}>
                        <div className="login-form">
                            <FormGroup controlId="email">
                                <FormControl
                                    type="text"
                                    value={this.state.email}
                                    placeholder="Ingrese su e-mail"
                                    required
                                    onChange={e => this.handleChange(e)}
                                />
                            </FormGroup>
                            <FormGroup controlId="password">
                                <FormControl
                                    type="password"
                                    value={this.state.password}
                                    placeholder="Password"
                                    required
                                    onChange={e => this.handleChange(e)}
                                />
                            </FormGroup>
                            <div className="mt-4 text-center">
                                <a onClick={() => this.handleForgotPassword()} className="forgot-pass">Olvidó su contraseña?</a>
                            </div>
                        </div>
                        <div className="login-btns">
                            <FormGroup>
                                <Button className="login-signin" type="submit">
                                    INICIAR SESIÓN
                                </Button>
                            </FormGroup>
                            <FormGroup>
                                <Button className="login-signup" onClick={() => this.handleRegister()}>
                                    REGISTRARME
                                </Button>
                            </FormGroup>
                        </div>
                        {this.state.invalidLogin &&
                        <FormGroup className="text-center text-danger">
                            <span>{this.state.message}</span>
                        </FormGroup>}
                    </Form>
                </Col>
            </Row>
        );

        if (this.state.register) {
            formContent = (
                <Row className="login">
                    <Col>
                        <h3 className="login-intro">Complete por favor:</h3>
                        <div className="login-form">
                            <FormGroup controlId="email">
                                <ControlLabel>E-mail</ControlLabel>
                                <FormControl
                                    type="email"
                                    value={this.state.user.email}
                                    maxLength={50}
                                    onChange={e => this.handleUser(e)}
                                />
                            </FormGroup>
                            <FormGroup controlId="password">
                                <ControlLabel>Contraseña</ControlLabel>
                                <FormControl
                                    type="password"
                                    value={this.state.user.password}
                                    maxLength={16}
                                    onChange={e => this.handleUser(e)}
                                />
                            </FormGroup>
                            <FormGroup controlId="validatePassword">
                                <ControlLabel>Vuelva a ingresar Contraseña</ControlLabel>
                                <FormControl
                                    type="password"
                                    value={this.state.validatePassword}
                                    maxLength={16}
                                    onChange={e => this.handlePasswordValidation(e)}
                                />
                            </FormGroup>
                            <FormGroup controlId="name">
                                <ControlLabel>Nombre</ControlLabel>
                                <FormControl
                                    type="text"
                                    value={this.state.user.name}
                                    maxLength={50}
                                    onChange={e => this.handleUser(e)}
                                />
                            </FormGroup>
                            <FormGroup controlId="surname">
                                <ControlLabel>Apellido</ControlLabel>
                                <FormControl
                                    type="text"
                                    value={this.state.user.surname}
                                    maxLength={50}
                                    onChange={e => this.handleUser(e)}
                                />
                            </FormGroup>
                            <FormGroup controlId="whatsapp">
                                <ControlLabel>Whatsapp (anteponga 54 9)</ControlLabel>
                                <FormControl
                                    type="number"
                                    value={this.state.user.whatsapp}
                                    onChange={e => this.handleUser(e)}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Fecha de Nacimiento</Label>
                                <Input
                                    type="date"
                                    name="date"
                                    id="birthdate"
                                    placeholder=""
                                    onChange={e => this.handleUser(e)}
                                />

                            </FormGroup>
                        </div>
                        <div className="login-btns">
                            {this.state.saving && <LoadingButton/>}
                            <FormGroup>
                                {!this.state.saving &&
                                <Button
                                    disabled={!this.state.isPasswordValid}
                                    className="login-signin"
                                    onClick={() => this.handleRegisterSubmit()}
                                >
                                    INGRESAR
                                </Button>} {' '}
                            </FormGroup>
                            <FormGroup>
                                <Button className="login-signup" onClick={() => this.handleBack()}>
                                    VOLVER
                                </Button>
                            </FormGroup>
                        </div>
                        {this.state.invalidRegister &&
                        <FormGroup className="text-center text-danger">
                            <strong>E-mail ya existente</strong>
                        </FormGroup>}
                        {(!this.state.isPasswordValid && this.state.validatePassword.length > 3) &&
                        <FormGroup className="text-center text-danger">
                            <strong>Las Password no coinciden</strong>
                        </FormGroup>}
                        {this.state.invalidEmail &&
                        <FormGroup className="text-center text-danger">
                            <strong>Ingresá un email válido por favor</strong>
                        </FormGroup>}
                        {this.state.invalidName &&
                        <FormGroup className="text-center text-danger">
                            <strong>Falta completar tu nombre</strong>
                        </FormGroup>}
                        {this.state.invalidBirthday &&
                        <FormGroup className="text-center text-danger">
                            <strong>Debés completar la fecha de nacimiento para continuar</strong>
                        </FormGroup>}
                        {this.state.invalidEmail &&
                        <FormGroup className="text-center text-danger">
                            <span>You must enter the valid email address</span>
                        </FormGroup>}
                        {this.state.invalidBirthday &&
                        <FormGroup className="text-center text-danger">
                            <span>Debes completar este campo para continuar</span>
                        </FormGroup>}
                    </Col>
                </Row>
            );
        }

        if (this.state.forgotPassword) {
            formContent = (
                <Row className="login">
                    <Col>
                        <h3 className="login-intro">Olvidó su contraseña?</h3>
                        <div className="login-form">
                            <FormGroup controlId="email">
                                <FormControl
                                    type="email"
                                    value={this.state.forgotPassEmail}
                                    placeholder="Ingrese su e-mail"
                                    required
                                    onChange={e => this.handleForgotPasswordEmailChange(e)}
                                />
                            </FormGroup>
                        </div>
                        <div className="login-btns">
                            <FormGroup>
                                {!this.state.sending ? (
                                    <Button
                                        disabled={!this.state.isEmailValid}
                                        className="login-signin"
                                        onClick={() => this.handleForgotPasswordSubmit()}
                                    >
                                        ENVIAR
                                    </Button>
                                ) : (
                                    <div className="text-center" style={spinerStyles}>
                                        <BeatLoader
                                            color="#fbad1c"
                                        />
                                    </div>
                                )} {' '}
                            </FormGroup>
                            <FormGroup>
                                <Button className="login-signup" onClick={() => this.handleBack()}>
                                    VOLVER
                                </Button>
                            </FormGroup>
                        </div>
                        {this.state.resetLinkSuccessMessage &&
                        <FormGroup className="text-center text-success">
                            <span>{this.state.resetLinkSuccessMessage}</span>
                        </FormGroup>}
                        {this.state.invalidResetLink &&
                        <FormGroup className="text-center text-danger">
                            <span>Error al enviar el enlace de reinicio. {this.state.resetPasswordErrorMessage}</span>
                        </FormGroup>}
                    </Col>
                </Row>
            );
        }

        return (
            <Fragment>
                {formContent}
            </Fragment>
        );
    }
}
