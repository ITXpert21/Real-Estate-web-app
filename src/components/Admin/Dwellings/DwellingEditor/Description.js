/* eslint-disable react/no-array-index-key */
/* eslint-disable react/prop-types */
import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import {BeatLoader} from 'react-spinners';
import Switch from 'react-switch';

import {
    FormControl,
    FormGroup
} from 'react-bootstrap';
import {isEmpty} from 'lodash';
import {
    Container,
    Row,
    Col,
    Button,
    Input,
    Label,
    Tooltip
} from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import arrayMove from 'array-move';
import {EditorState, convertToRaw, ContentState} from 'draft-js';
import {Editor} from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import '../../../../sass/_react-draft-wysiwyg.scss';

import {Dwelling} from '../../../../model/index';
import {requestSaveDwelling, requestCleanDwelling} from '../../../../actions/index';
import ImagesService from '../../../../services/images';

const SortableItem = SortableElement(({
    imgUrl,
    index,
    onHandleDeleteImg
}) => (
    <div
        className="col-xl-2 col-lg-3 col-md-4 col-sm-6 col-6 py-2"
        style={{
            height: '160px'
        }}
    >
        <div
            style={{
                width: '100%',
                height: '100%',
                backgroundSize: 'cover',
                backgroundImage: `url("${imgUrl}")`
            }}
        >
            <Button
                id={imgUrl}
                className="delete-img-dnd"
                onClick={() => onHandleDeleteImg(index)}
            >
                <FontAwesome name="times"/>
            </Button>
        </div>
    </div>
));

const SortableList = SortableContainer(({items, onHandleDeleteImg, numberOfFilesBeingUploaded}) => {
    return (
        <div className="row">
            {items && items.map((value, index) => (
                <SortableItem
                    key={value.public_id}
                    index={index}
                    imgUrl={value.url}
                    onHandleDeleteImg={removingItemIndex => onHandleDeleteImg(removingItemIndex)}
                />
            ))}
            {!!numberOfFilesBeingUploaded && [...Array(numberOfFilesBeingUploaded)].map((number, loadingIndex) => (
                <div
                    key={`item_${loadingIndex}`}
                    className="col-xl-2 col-lg-3 col-md-4 col-sm-6 col-6 py-2"
                    style={{
                        height: '160px'
                    }}
                >
                    <div
                        className="w-100 h-100 text-center"
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            background: 'rgb(250, 250, 250)'
                        }}
                    >
                        <BeatLoader
                            color="#fbad1c"
                            loading
                        />
                    </div>
                </div>
            ))}
        </div>
    );
});

class Description extends Component {
    static propTypes = {
        requestSaveDwelling: PropTypes.func.isRequired,
        requestCleanDwelling: PropTypes.func.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired
        }).isRequired,
        dwelling: PropTypes.shape({}),
        saving: PropTypes.bool,
        saved: PropTypes.bool
    };

    static defaultProps = {
        dwelling: new Dwelling(),
        saving: false,
        saved: false
    };

    constructor(props) {
        super(props);
        if (isEmpty(this.props.dwelling.features) &&
            isEmpty(this.props.dwelling.services) &&
            isEmpty(this.props.dwelling.spaces) &&
            this.props.dwelling.occupationStatus !== 'Tasaciones'
        ) {
            this.props.history.push('/admin/dwellings/characteristics');
        }

        if (this.props.dwelling) {
            const html = this.props.dwelling.generalDescription ? this.props.dwelling.generalDescription : '';
            const contentBlock = htmlToDraft(html);
            const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            const editorState = EditorState.createWithContent(contentState);
            if (this.props.dwelling.images[0] !== undefined) {
                this.state = {...this.props, firstImagePublicId: this.props.dwelling.images[0].public_id, editorState};
            } else {
                this.state = {...this.props, editorState};
            }
        } else {
            const contentBlock = htmlToDraft('');
            const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            const editorState = EditorState.createWithContent(contentState);
            this.state = {
                dwelling: new Dwelling(),
                uploadImgStart: false,
                tooltipOpen: false,
                numberOfFilesBeingUploaded: 0,
                firstImagePublicId: '',
                editorState
            };
        }
        this.handleEditorStateChange = this.handleEditorStateChange.bind(this);
    }

    componentWillReceiveProps(props) {
        if (props.saved) {
            this.props.requestCleanDwelling();
            this.props.history.push('/admin/dwellings/latest');
        }
    }

    componentWillUnmount() {
        if (this.state.tooltipOpen) {
            this.state.tooltipOpen = false;
        }
    }

    async onImageDrop(files) {
        if (this.state.uploadImgStart) {
            this.setState({
                uploadImgStart: true,
                numberOfFilesBeingUploaded: this.state.numberOfFilesBeingUploaded + files.length
            });
        } else {
            this.setState({uploadImgStart: true, numberOfFilesBeingUploaded: files.length});
        }

        let uploadedFiles = await ImagesService.upload(files);

        if (uploadedFiles) {
            if (uploadedFiles.length === this.state.numberOfFilesBeingUploaded) {
                this.setState({uploadImgStart: false, numberOfFilesBeingUploaded: 0});
            } else {
                this.setState({
                    numberOfFilesBeingUploaded: this.state.numberOfFilesBeingUploaded - uploadedFiles.length
                });
            }

            uploadedFiles = [...this.state.dwelling.images, ...uploadedFiles];
            this.setState(
                state => ({
                    dwelling: (Object.assign(state.dwelling, {images: uploadedFiles}))
                })
            );
        }
    }

    async onHandleDeleteImg(index) {
        const images = [...this.state.dwelling.images];
        images.splice(index, 1);

        this.setState(
            state => ({
                dwelling: (Object.assign(state.dwelling, {images}))
            })
        );
    }

    onSortEnd = ({oldIndex, newIndex}) => {
        this.setState(({dwelling}) => ({
            dwelling: (Object.assign(dwelling, {images: arrayMove(dwelling.images, oldIndex, newIndex)}))
        }));
    };

    handleChange({target: {id, value}}) {
        this.setState(
            state => ({
                dwelling: (Object.assign(state.dwelling, {[id]: value}))
            })
        );
        this.setState(
            state => (state)
        );
    }

    handleEditorStateChange(editorState) {
        this.setState({editorState});
    }

    handleSwitch(e, type) {
        this.setState(
            state => ({dwelling: {...state.dwelling, [type]: e}})
        );
    }

    handleSubmit() {
        const {dwelling} = this.state;

        if (dwelling._id) {
            dwelling.occupationStatusHistory.push({user: this.props.userProfile});
        }
        let headerImageDelete = false;
        if (dwelling.images[0] !== undefined && this.state.firstImagePublicId !== undefined) {
            if (dwelling.images[0].public_id !== this.state.firstImagePublicId) {
                headerImageDelete = true;
            }
        } else {
            headerImageDelete = true;
        }
        if (headerImageDelete && dwelling.headerImage && dwelling.headerImage.hasOwnProperty('delete_token')) {
            ImagesService.deleteImg(dwelling.headerImage.delete_token);
            dwelling.headerImage = {};
        }
        dwelling.generalDescription = draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()));

        dwelling.updatedAt = new Date();
        this.props.requestSaveDwelling(dwelling);
    }

    toggleDropDown(id) {
        this.setState(prevState => ({
            [id]: !prevState[id]
        }));
    }

    imgUploadLoader() {
        return (
            <div className="row">
                {[...Array(this.state.numberOfFilesBeingUploaded)].map((number, index) => (
                    <div
                        key={`item_${index}`}
                        className="col-xl-2 col-lg-3 col-md-4 col-sm-6 col-6 py-2"
                        style={{
                            height: '160px'
                        }}
                    >
                        <div
                            className="w-100 h-100 text-center"
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                background: 'rgb(250, 250, 250)'
                            }}
                        >
                            <BeatLoader
                                color="#fbad1c"
                                loading={this.state.uploadImgStart}
                            />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    render() {
        const {dwelling} = this.state;

        const isSubmitDisabled = this.state.uploadImgStart ? this.state.uploadImgStart : (
            !(dwelling.images.length > 0) ||
            this.props.saving ||
            dwelling.dwellingStatus === ''
        ) && dwelling.occupationStatus !== 'Tasaciones';

        return (
            <Container fluid className="animated fadeIn">
                <Row className="mb-3">
                    <Col sm={12}>
                        <h2>Descripción Pública</h2>
                        <FormGroup controlId="generalDescription">
                            <Editor
                                editorState={this.state.editorState}
                                toolbar={{
                                    options: ['inline', 'list', 'link', 'emoji', 'remove', 'history'],
                                    inline: {
                                        options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace']
                                    },
                                    
                                }}
                                wrapperClassName="editorMainWrapper"
                                toolbarClassName="editorToolbar"
                                editorClassName="editorTextWrapper"
                                onEditorStateChange={this.handleEditorStateChange}
                                localization={{locale: 'en'}}
                            />
                        </FormGroup>
                    </Col>
                    <Col sm={6}>
                        <h2>Descripción Privada</h2>
                        <FormGroup controlId="intraDescription">
                            <FormControl
                                componentClass="textarea"
                                rows="6"
                                value={dwelling.intraDescription}
                                onChange={e => this.handleChange(e)}
                                placeholder="*Será visible sólo por los miembros de tu Inmobiliaria."
                            />
                        </FormGroup>
                    </Col>
                    <Col sm={6}>
                        <h2>Descripción SIOC</h2>
                        <FormGroup controlId="privateDescription">
                            <FormControl
                                componentClass="textarea"
                                rows="6"
                                value={dwelling.privateDescription}
                                onChange={e => this.handleChange(e)}
                                placeholder="*Será visible sólo por los miembros del SIOC."
                            />
                        </FormGroup>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col sm={12}>
                        <h2>Información Adicional</h2>
                        <FormGroup>
                            <Input
                                type="select"
                                id="dwellingStatus"
                                value={dwelling.dwellingStatus}
                                onChange={e => this.handleChange(e)}
                            >
                                <option disabled value="">Estado</option>
                                <option value="Ocupada">Ocupada</option>
                                <option value="Tiene Llaves">Tiene Llaves</option>
                                <option value="Alquilado">Alquilado</option>
                            </Input>
                        </FormGroup>
                    </Col>
                    <Col sm={2} xs={6} className="mb-4">
                        <Label>Cartel de la Inmobiliaria</Label>
                        <Switch
                            onChange={e => this.handleSwitch(e, 'agencyBanner')}
                            checked={this.state.dwelling.agencyBanner}
                            id="normal-switch"
                            onColor="#003d6f"
                            onHandleColor="#fbad1c"
                            handleDiameter={20}
                            uncheckedIcon={false}
                            checkedIcon={false}
                            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                            activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                            height={15}
                            width={38}
                            className="react-switch"
                        />
                    </Col>
                    <Col sm={2} xs={6} className="mb-4">
                        <Label>Cartel del SIOC</Label>
                        <Switch
                            onChange={e => this.handleSwitch(e, 'siocBanner')}
                            checked={this.state.dwelling.siocBanner}
                            id="normal-switch"
                            onColor="#003d6f"
                            onHandleColor="#fbad1c"
                            handleDiameter={20}
                            uncheckedIcon={false}
                            checkedIcon={false}
                            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                            activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                            height={15}
                            width={38}
                            className="react-switch"
                        />
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        <h2>Carga de Imágenes </h2>

                        <Dropzone
                            onDrop={this.onImageDrop.bind(this)}
                            multiple
                            accept="image/*"
                            className="img-dropzone mb-5"
                        >
                            <FontAwesome name="plus"/> <br/>
                            Arrastrá una imagen hasta aquí o hacé click para seleccionar un archivo.
                        </Dropzone>
                    </Col>
                </Row>
                <SortableList
                    axis="xy"
                    items={this.state.dwelling.images}
                    onHandleDeleteImg={index => this.onHandleDeleteImg(index)}
                    numberOfFilesBeingUploaded={this.state.numberOfFilesBeingUploaded}
                    onSortEnd={this.onSortEnd}
                    distance={1}
                />
                <div className="padding-sm"/>
                <Row className="proceed-btns">
                    <Col className="text-right">
                        <Tooltip
                            placement="top"
                            isOpen={this.state.tooltipOpen}
                            target="Next"
                            toggle={() => this.toggleDropDown('tooltipOpen')}
                        >
                            Se requiere completar el Estado y cargar al menos una imagen.
                        </Tooltip>
                        <span id="Next" className="add-dwelling-info"><FontAwesome name="info"/>&nbsp;&nbsp;</span>
                        <Button
                            className="goback"
                            onClick={() => this.props.history.push('/admin/dwellings/characteristics')}
                        >
                            <FontAwesome name="angle-left"/>
                        </Button> {' '}
                        <Button
                            className="next"
                            disabled={isSubmitDisabled}
                            onClick={() => this.handleSubmit()}
                        >
                            <FontAwesome name="check"/>
                        </Button>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default connect(
    state => ({
        dwelling: state.dwelling.dwelling,
        saving: state.dwelling.saving,
        saved: state.dwelling.saved,
        userProfile: state.user.userProfile
    }),
    dispatch => ({
        requestSaveDwelling: dwelling => dispatch(requestSaveDwelling(dwelling)),
        requestCleanDwelling: () => dispatch(requestCleanDwelling())
    })
)(Description);
