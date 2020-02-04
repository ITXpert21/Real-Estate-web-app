import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Modal, ModalHeader, ModalBody, ModalFooter, Button, Row} from 'reactstrap';
import Cropper from 'react-easy-crop';
import 'rc-slider/assets/index.css';
import Slider from 'rc-slider/es/Slider';

import {requestSaveDwellingHeaderImage} from '../../../actions';

import getCroppedImg from './cropImage';
import ImagesService from '../../../services/images';

class ModalCropper extends React.Component {
    static propTypes = {
        requestSaveDwellingHeaderImage: PropTypes.func.isRequired,
        modalCropper: PropTypes.bool.isRequired,
        toggleCropper: PropTypes.func.isRequired,
        dwelling: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            imageUrl: 'http://via.placeholder.com/1000?text=Sin+Imagen',
            crop: {x: 0, y: 0},
            zoom: 1,
            aspect: 3,
            croppedAreaPixels: {}
        };
        this.clear = this.clear.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.onCropChange = this.onCropChange.bind(this);
        this.onZoomChange = this.onZoomChange.bind(this);
        this.onCropComplete = this.onCropComplete.bind(this);
    }

    componentWillReceiveProps(props) {
        if (props.dwelling) {
            if (props.dwelling.images.length > 0) this.setState({imageUrl: props.dwelling.images[0].secure_url});
        }
    }

    onCropChange(crop) {
        this.setState({crop});
    }

    onZoomChange(zoom) {
        this.setState({zoom});
    }

    onCropComplete(croppedArea, croppedAreaPixels) {
        this.setState({croppedAreaPixels});
    }

    async closeModal(isSave) {
        if (isSave) {
            try {
                if (this.props.dwelling.headerImage && this.props.dwelling.headerImage.hasOwnProperty('delete_token')) {
                    await ImagesService.deleteImg(this.props.dwelling.headerImage.delete_token);
                }
                const croppedImage = await getCroppedImg(this.state.imageUrl, this.state.croppedAreaPixels, 0);
                const uploadedFiles = await ImagesService.upload([croppedImage]);
                if (uploadedFiles && uploadedFiles.length > 0) {
                    await this.props.requestSaveDwellingHeaderImage({dwellingId: this.props.dwelling._id, headerImage: uploadedFiles[0]});
                    this.props.toggleCropper(null, true);
                } else {
                    this.props.toggleCropper(null, false);
                }
            } catch (e) {
                console.error(e);
                this.props.toggleCropper(null, false);
            }
        } else {
            this.props.toggleCropper(null, false);
        }
    }

    clear() {
        this.setState({crop: {x: 0, y: 0}, zoom: 1, aspect: 3});
    }

    render () {
        return (
            <Modal isOpen={this.props.modalCropper} toggle={e => this.closeModal(false)} size="lg">
                <ModalHeader toggle={e => this.closeModal(false)}>Editar imagen de encabezado de la ficha</ModalHeader>
                <ModalBody className="m-5 p-5 justify-content-around">
                    <Row style={{height: '50vh'}}>
                        <Cropper
                            image={this.state.imageUrl}
                            crop={this.state.crop}
                            zoom={this.state.zoom}
                            aspect={this.state.aspect}
                            onCropChange={this.onCropChange}
                            onCropComplete={this.onCropComplete}
                            onZoomChange={this.onZoomChange}
                        />
                    </Row>
                    <Row>
                        <Slider
                            defaultValue={1}
                            value={this.state.zoom}
                            min={1}
                            max={5}
                            step={0.1}
                            onChange={this.onZoomChange}
                            style={{top: '60px'}} />
                    </Row>
                </ModalBody>
                <ModalFooter className="d-flex flex-row">
                    <Button
                        size="lg"
                        color="light"
                        className="mr-auto mb-2"
                        onClick={this.clear}
                    >Reset
                    </Button>&nbsp;&nbsp;&nbsp;&nbsp;
                    <Button
                        size="lg"
                        className="mr-2 mb-2 primary"
                        onClick={e => this.closeModal(true)}
                    >CONFIRMAR
                    </Button>
                </ModalFooter>
            </Modal>
        )
    }
}

export default withRouter(connect(
    null,
    dispatch => ({
        requestSaveDwellingHeaderImage: data => dispatch(requestSaveDwellingHeaderImage(data))
    })
)(ModalCropper));
