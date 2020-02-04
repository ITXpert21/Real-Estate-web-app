import React, {Component} from 'react';
import {Container} from 'reactstrap';
import {Button, Form, FormControl, FormGroup} from 'react-bootstrap';
import {BeatLoader} from 'react-spinners';
import PropTypes from 'prop-types';

import siocLogoInicio from '../../../public/images/sonrisa-sioc.png';
import ResetPasswordService from '../../services/resetPassword';

class ResetPassword extends Component {
    static propTypes = {
        history: PropTypes.shape({
            push: PropTypes.func.isRequired
        }).isRequired,
        match: PropTypes.shape({
            params: PropTypes.shape({
                token: PropTypes.string
            })
        }).isRequired
    }

    constructor(props) {
        super(props);
        this.state = {
            newPassword: '',
            newPasswordConfirm: '',
            resetLinkResponseMessage: '',
            sending: false,
            sent: false,
            passwordChangeError: false,
            passwordsDoNotMatch: false
        };
    }

    async handleSubmit(e) {
        e.preventDefault();
        this.setState({sending: true});
        try {
            const payload = {
                resetPasswordToken: this.props.match.params.token,
                newPassword: this.state.newPassword
            };

            const result = await ResetPasswordService.reset(payload);
            this.setState({
                resetLinkResponseMessage: result.message,
                sending: false,
                sent: true,
                newPasswordConfirm: '',
                newPassword: ''
            });
        } catch (error) {
            this.setState({passwordChangeError: true, sending: false, resetLinkResponseMessage: error});
        }
    }

    handleChange(e) {
        this.setState({[e.target.id]: e.target.value}, () => {
            if (this.state.newPassword !== this.state.newPasswordConfirm) {
                this.setState({passwordsDoNotMatch: true});
            } else {
                this.setState({passwordsDoNotMatch: false});
            }
        });
    }

    handleGoHome() {
        this.props.history.push('/home');
    }

    render() {
        const formStyles = {
            height: '144px'
        };

        let updatePassForm = (
            <Form onSubmit={e => this.handleSubmit(e)}>
                <FormGroup controlId="newPassword">
                    <FormControl
                        type="password"
                        value={this.state.newPassword}
                        placeholder="Nueva contraseña"
                        required
                        onChange={e => this.handleChange(e)}
                    />
                </FormGroup>
                <FormGroup controlId="newPasswordConfirm">
                    <FormControl
                        type="password"
                        value={this.state.newPasswordConfirm}
                        placeholder="Confirmar contraseña"
                        required
                        onChange={e => this.handleChange(e)}
                    />
                    {this.state.passwordsDoNotMatch &&
                        <p className="text-left text-danger mt-1">Las contraseñas no coinciden</p>
                    }
                </FormGroup>
                <FormGroup>
                    <Button size="lg" block className="btn-secondary" type="submit" disabled={this.state.sending}>
                        REINICIAR
                    </Button>
                </FormGroup>
            </Form>
        );

        if (this.state.sending) {
            updatePassForm = (
                <div className="text-center" style={formStyles}>
                    <BeatLoader
                        color="#fbad1c"
                    />
                </div>
            );
        }

        if (this.state.sent) {
            updatePassForm = (
                <div style={formStyles}>
                    <FormGroup className="text-center p-4">
                        <h4 className="text-success">{this.state.resetLinkResponseMessage}</h4>
                    </FormGroup>
                    <FormGroup>
                        <Button size="lg" block className="btn-secondary" onClick={() => this.handleGoHome()}>
                            INGRESAR
                        </Button>
                    </FormGroup>
                </div>
            );
        }

        if (this.state.passwordChangeError) {
            updatePassForm = (
                <div style={formStyles}>
                    <FormGroup className="text-center p-4">
                        <h4 className="text-danger">{this.state.resetLinkResponseMessage}</h4>
                    </FormGroup>
                    <FormGroup>
                        <Button size="lg" block className="btn-secondary" onClick={() => this.handleGoHome()}>
                            VOLVER
                        </Button>
                    </FormGroup>
                </div>
            );
        }

        return (
            <Container className="animated fadeIn landing">
                <div className="landing-overlay">
                    <div className="color-layer"/>
                </div>
                <div className="centered v-center reset-password-wrapper">
                    <div className="reset-password-form">
                        <img src={siocLogoInicio} alt="SIOC Logo" width="140px"/>
                        <h3>Restablecer la contraseña</h3>
                        {updatePassForm}
                    </div>
                </div>
            </Container>
        );
    }
}

export default ResetPassword;
