import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import moment from 'moment';
import queryString from 'query-string';
import {
    Container,
    Row,
    Col,
    Button
} from 'reactstrap';
import {BeatLoader} from 'react-spinners';
import InfiniteScroll from 'react-infinite-scroll-component';
import FontAwesome from 'react-fontawesome';
import FaShare from 'react-icons/lib/md/share';
import {requestLoadMoreDwellings} from '../../../actions';
import DwellingTitle from '../../../services/dwellingTitle';
import ShareModal from '../../common/Share/ShareModal';
import SweetAlert from 'react-bootstrap-sweetalert';
import {previewImage} from '../../common/utils/custom_helpers';

const PLACE_OF_USAGE = 'mine';

moment.locale('es');

class Mine extends Component {
    static propTypes = {
        requestLoadMoreDwellings: PropTypes.func.isRequired,
        dwellings: PropTypes.arrayOf(PropTypes.shape({})),
        history: PropTypes.shape({
            push: PropTypes.func.isRequired
        }).isRequired
    };

    static defaultProps = {
        dwellings: null
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.userProfile && prevState.firstTime) {
            const parameters = queryString.parse(nextProps.location.search);

            if (parameters.seller) {
                nextProps.requestLoadMoreDwellings({createdBy: parameters.seller, page: prevState.page});

                return {firstTime: false, seller: parameters.seller};
            }

            nextProps.requestLoadMoreDwellings({client: nextProps.userProfile.client, page: prevState.page, createdBy: nextProps.userProfile._id});

            return {firstTime: false};
        }
        if (nextProps.dwellings) {
            if (nextProps.dwellings[0] !== prevState.items[0]) {
                if (nextProps.dwellings.length === 0) {
                    return {items: prevState.items.concat(nextProps.dwellings), loading: false, hasMore: false};
                } else if (nextProps.dwellings.length < 9) {
                    return {items: prevState.items.concat(nextProps.dwellings), loading: false};
                }

                return {items: prevState.items.concat(nextProps.dwellings)};
            }
        }

        return null;
    }

    constructor(props) {
        super(props);
        this.state = {
            items: [],
            page: {
                pageNumber: 0,
                perPage: 9
            },
            loading: true,
            hasMore: true,
            firstTime: true,
            seller: null,
            alert: null,
            modalShare: false,
            dwelling: null
        };
        this.toggleShare = this.toggleShare.bind(this);
        this.showAlert = this.showAlert.bind(this);
    }

    fetchMoreData = () => {
        setTimeout(() => {
            const {page} = this.state;
            page.pageNumber = this.state.page.pageNumber + 1;
            this.setState({page});

            if (this.state.seller) {
                this.props.requestLoadMoreDwellings({createdBy: this.state.seller, page: this.state.page});
            } else {
                this.props.requestLoadMoreDwellings({client: this.props.userProfile.client, page: this.state.page, createdBy: this.props.userProfile._id});
            }
        }, 500);
    };

    toggleShare(e, dwelling) {
        e.stopPropagation();
        if (this.state.modalShare) this.setState({modalShare: !this.state.modalShare});
        else this.setState({dwelling, modalShare: !this.state.modalShare});
    }

    showAlert(title, type, param, load = false) {
        let getAlert = () => (
          <SweetAlert
            type={type}
            title={title}
            onConfirm={() => this.hideAlert(param)}
          />
        );

        this.setState({
          alert: getAlert()
        });
    }

    hideAlert(param) {
        this.setState({
            alert: null
        });
    }

    renderContent() {
        return (
            <div className="highlights">
                <InfiniteScroll
                    dataLength={this.state.items.length}
                    next={this.fetchMoreData}
                    hasMore={this.state.hasMore}
                    loader={<BeatLoader
                        color="#fbad1c"
                        loading={this.state.loading}
                    />}
                >
                    <Row className="highlights-main">
                        {this.state.items.map(dwelling => {
                            const imageUrl = previewImage(dwelling, ['/upload/', '/upload/w_400,q_auto:eco,f_auto/'], 'http://via.placeholder.com/330x220?text=Sin+Imagen');
                            const title = DwellingTitle.get(dwelling, PLACE_OF_USAGE);

                            return (
                                <Col className="prop-listing-margin-fix" sm={6} md={4} key={dwelling._id}>
                                    <div
                                        className="highlight-box"
                                        onClick={() => this.props.history.push(`/${dwelling.siocId}`)}
                                    >
                                        <div className="prop-detail-btns">
                                            <Button className="like" style={{color: 'white'}}
                                                    onClick={e => this.toggleShare(e, dwelling)}>
                                                <FaShare />
                                            </Button>
                                            <Button className="goto">
                                                <FontAwesome name="map-marker"/>
                                                <small style={{color: '#fff'}}> {dwelling.address.city} </small>
                                            </Button>
                                        </div>
                                        <div
                                            className="preview-img"
                                            style={{
                                                width: '100%',
                                                height: '200px',
                                                backgroundImage: 'url("' + imageUrl + '")'
                                            }}
                                        />
                                        <Row className="highlight-body">
                                            <Col sm={12}>
                                                {dwelling.price ?
                                                    <h4>
                                                        <small>{dwelling.currency && `${dwelling.currency}` || `$`}</small>
                                                        {dwelling.price}
                                                    </h4>
                                                    : <h4>Consulte</h4>}
                                                <h3 className="primary">
                                                    {title}
                                                </h3>
                                            </Col>
                                            <Col sm={12}>
                                                <span className="pull-left">
                                                    {dwelling.createdAt !== dwelling.updatedAt ?
                                                        `Actualizado hace ${moment(dwelling.updatedAt).startOf('minutes').fromNow()}` :
                                                        `Subido ${moment(dwelling.createdAt).startOf('minutes').fromNow()}`}</span>
                                                <span className="pull-right"><b>#{dwelling.siocId}</b></span>
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                            );
                        })}
                    </Row>
                </InfiniteScroll>
            </div>
        );
    }

    render() {
        return (
            <Container fluid className="animated fadeIn" style={{padding: '0 0 100px 0'}}>
                <Row className="mt-2">
                    <Col>
                        <h3 className="title">Mis Propiedades</h3>
                        <hr className="mb-3 mt-2"/>
                    </Col>
                </Row>
                {this.props.dwellings && this.props.dwellings.length == 0 && this.state.items.length == 0? (this.state.seller? <div style={{padding: '0 15px 0 15px'}}>El vendedor aún no tiene propiedades</div>: <div style={{padding: '0 15px 0 15px'}}>Aún no hay propiedades que mostrar aquí.</div>) : this.renderContent()}
              {this.state.alert}
                <ShareModal
                    modalShare={this.state.modalShare}
                    toggleShare={this.toggleShare}
                    dwelling={this.state.dwelling}
                    showAlert={this.showAlert} />
            </Container>
        );
    }
}

export default connect(
    state => ({
        dwellings: state.dwelling.dwellings,
        userProfile: state.user.userProfile
    }),
    dispatch => ({
        requestLoadMoreDwellings: serachParams => dispatch(requestLoadMoreDwellings(serachParams))
    })
)(Mine);
