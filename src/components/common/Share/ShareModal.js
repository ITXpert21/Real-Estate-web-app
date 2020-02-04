import React from 'react';
import PropTypes from 'prop-types';
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  WhatsappIcon,
  WhatsappShareButton
} from 'react-share';
import LinkIcon from 'react-icons/lib/fa/external-link';
import Clipboard from 'react-clipboard.js';
import DwellingTitle from '../../../services/dwellingTitle';
import {previewImage} from '../utils/custom_helpers';

export default class ShareModal extends React.Component {
  static propTypes = {
    dwelling: PropTypes.shape({}),
    modalShare: PropTypes.bool.isRequired,
    toggleShare: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.closeModal = this.closeModal.bind(this);
  }

  closeModal(e) {
    this.props.toggleShare(e, null);
  }

  copyLink() {
    this.props.showAlert('Link copiado al portapapeles!', 'success', '', false);
  }

  render () {
    if (!this.props.dwelling) return null;

    const dwelling = this.props.dwelling;
    const shareUrl = `https://www.sioc.com.ar/${dwelling.siocId}`;
    const title = DwellingTitle.get(dwelling);
    const imageUrl = previewImage(dwelling, ['/upload/', '/upload/w_400,q_auto:eco,f_auto/'], 'http://via.placeholder.com/1000?text=Sin+Imagen');

    return (
      <Modal isOpen={this.props.modalShare} toggle={e => this.props.toggleShare(e, null)}>
        <ModalHeader toggle={e => this.closeModal(e)}>Compartir Propiedad</ModalHeader>
        <ModalBody className="mt-4 mb-4 d-flex justify-content-around">
          <FacebookShareButton
            url={shareUrl}
            quote={`${title}.`}
            style={{cursor: 'pointer'}}>
            <FacebookIcon size={40} round/>
          </FacebookShareButton>
          <WhatsappShareButton
            url={shareUrl}
            title={`${title}.`}
            separator=" Más info en el SIOC >>> "
            picture={imageUrl}
            style={{cursor: 'pointer'}}
          >
            <WhatsappIcon size={40} round/>
          </WhatsappShareButton>
          <EmailShareButton
            url={shareUrl}
            subject={`${title}.`}
            body={dwelling.generalDescription +" Más info en el SIOC >>> "+ shareUrl}
            separator=" Más info en el SIOC >>> "
            style={{cursor: 'pointer'}}
          >
            <EmailIcon size={40} round/>
          </EmailShareButton>
        </ModalBody>
        <ModalFooter className="justify-content-around">
          <Clipboard
            style={{color: '#003d6f', fontSize: '14px'}}
            component="a"
            data-clipboard-text={shareUrl}
            onSuccess={this.copyLink.bind(this)}>
            <LinkIcon /> Copiar Link
          </Clipboard>
        </ModalFooter>
      </Modal>
    )
  }
}
