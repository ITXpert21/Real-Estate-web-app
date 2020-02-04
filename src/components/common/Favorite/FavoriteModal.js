import React from 'react';
import PropTypes from 'prop-types';
import {Button, ButtonGroup, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row} from 'reactstrap';
import FaHeart from 'react-icons/lib/fa/heart';
import FaUserPlus from 'react-icons/lib/fa/user-plus';
import FaTrash from 'react-icons/lib/fa/trash';
import Select from 'react-select';

export default class FavoriteModal extends React.Component {
  static propTypes = {
    modalFavorite: PropTypes.bool.isRequired,
    toggleFavorite: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {favoriteToClient: false, clientsOptions: [], clientOptionsChanged: false, originalOptions: []};
    this.closeModal = this.closeModal.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.clientsOptions) {
      const dwellingId = props.dwellingId;
      const clientsOptions = props.clientsOptions.filter(clientOption => {
        if (clientOption.hasOwnProperty('favorite')) {
          if (typeof clientOption.favorite !== 'undefined') {
            return clientOption.favorite.includes(dwellingId);
          } else {
            return false;
          }
        } else {
          return false;
        }
      });
      this.setState({clientsOptions: clientsOptions, clientOptionsChanged: false, originalOptions: [...clientsOptions]});
    }
  }

  closeModal(isSave) {
    if (isSave) {
      const clientsOptions = [];
      if (this.state.favoriteToClient) {
        const dwellingId = this.props.dwellingId;
        const clients = this.props.clientsOptions; // Original Options
        const options = this.state.clientsOptions;  // Changed Options
        for (let i=0; i<clients.length; i++) {
          const client = clients[i];
          const clientIndex = options.findIndex(x => x['value'] === client['value']);
          if (clientIndex > -1) { // in case of favorite to client
            const index = client.favorite.indexOf(dwellingId);
            if (index < 0) { // doesn't have dwelling in favorite
              const favorite = [...client.favorite, dwellingId];
              clientsOptions.push({client: client.value, favorite: favorite});
            }
          } else { // in case of unfavorite from client
            const index = client.favorite.indexOf(dwellingId);
            if (index > -1) { // already have dwelling in favorite
              const favorite = client.favorite;
              favorite.splice(index, 1);
              clientsOptions.push({client: client.value, favorite: favorite});
            }
          }
        }
      }
      this.props.handleFavorite(this.state.favoriteToClient, this.props.dwellingId, clientsOptions);
    }

    this.setState({favoriteToClient: false, clientsOptions: [], clientOptionsChanged: false, originalOptions: []});
    this.props.toggleFavorite(this.props.dwellingId);
  }

  handleChangeFavorite(favoriteToClient) {
    this.setState({favoriteToClient: favoriteToClient});
  }

  handleChangeClientOption(options) {
    let clientOptionsChanged = false;
    const originalOptions = this.state.originalOptions;
    if (options.length !== originalOptions.length) {
      clientOptionsChanged = true;
    } else {
      clientOptionsChanged = JSON.stringify(options) !== JSON.stringify(originalOptions);
    }
    this.setState({clientsOptions: options, clientOptionsChanged: clientOptionsChanged});
  }

  render () {
    return (
      <Modal isOpen={this.props.modalFavorite} toggle={e => this.closeModal(false)}>
        <ModalHeader toggle={e => this.closeModal(false)}>Guardar a favoritos</ModalHeader>
        <ModalBody className="m-5 p-5 justify-content-around">
          <ButtonGroup className="w-100">
            <Button
              size="lg"
              outline
              onClick={e => this.handleChangeFavorite(false)}
              active={!this.state.favoriteToClient}
            >
              {
                this.props.userProfile &&
                this.props.userProfile.favorite &&
                this.props.userProfile.favorite.includes(this.props.dwellingId) ?
                  <div className="py-3">
                    <FaTrash/> <br/>
                    Eliminar de tus favoritos
                  </div>
                  :
                  <div className="py-3">
                    <FaHeart/> <br/>
                    Agregar a tus favoritos
                  </div>
              }
            </Button>
            <Button
              size="lg"
              outline
              onClick={e => this.handleChangeFavorite(true)}
              active={this.state.favoriteToClient}>
              <FaUserPlus/> <br/>
              Guardar para un cliente
            </Button>
          </ButtonGroup>
          {this.state.favoriteToClient &&
          <div>
            <Select
              className="mt-3"
              isMulti
              placeholder="Seleccione Cliente"
              value={this.state.clientsOptions}
              options={this.props.clientsOptions}
              onChange={options => this.handleChangeClientOption(options)}
            />
            <p className="mb-0">* Por el momento esta función sólo está disponible para clientes que estén registrados en <span className="azul-sioc">www.sioc.com.ar</span> y emparejados con un cliente de tu inmobiliaria.</p>
            <p>Invitalos a registrarse, les tomará sólo 1 minuto! ;)</p>
          </div>
          }
        </ModalBody>
        <ModalFooter>
          <Button
            size="lg"
            className="mr-2 mb-2 primary"
            onClick={e => this.closeModal(true)}
            disabled={this.state.favoriteToClient && !this.state.clientOptionsChanged}
          >CONFIRMAR
          </Button>
        </ModalFooter>
      </Modal>
    )
  }
}
