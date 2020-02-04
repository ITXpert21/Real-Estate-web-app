/* eslint-disable max-len */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import moment from 'moment';
import {BeatLoader} from 'react-spinners';
import InfiniteScroll from 'react-infinite-scroll-component';
import queryString from 'query-string';
import ReportsService from '../../../../../services/reports'

import {
    Container,
    Row,
    Col,
    Button,
    UncontrolledTooltip
} from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import DwellingTitle from '../../../../../services/dwellingTitle';
import {previewImage} from '../../../../common/utils/custom_helpers';

const PLACE_OF_USAGE = 'latest';

moment.locale('es');

const filterByStrings = {
    onsale: "En Venta",
    forrent: "En Alquiler",
    available: "Disponible",
    sold: "Vendida",
    rented: "Alquilada",
    unsubscribed: "Suspendida",
    reserved: "Reservada",
    appraisals: "Tasaciones",
    deleted: "Eliminada"
};

class Detailed extends Component {
    static propTypes = {
        history: PropTypes.shape({
            push: PropTypes.func.isRequired
        }).isRequired,
        match: PropTypes.shape({
            params: PropTypes.shape({
                filterBy: PropTypes.string
            })
        })
    };

    constructor(props) {
        super(props);
        this.state = {
            items: [],
            page: {
                pageNumber: 0,
                perPage: 9
            },
            loading: true,
            hasMore: true
        };
    }

    componentDidMount() {
        const parameters = queryString.parse(this.props.location.search);
        const {filterBy} = this.props.match.params;
        this.fetchReportDetailed(this.state.page, filterBy, parameters.tab, new Date(parameters.from), new Date(parameters.to));
    }

    fetchMoreData = () => {
        setTimeout(() => {
            const {page} = this.state;
            page.pageNumber = this.state.page.pageNumber + 1;
            this.setState({page});
            const parameters = queryString.parse(this.props.location.search);
            const {filterBy} = this.props.match.params;
            this.fetchReportDetailed(page, filterBy, parameters.tab, new Date(parameters.from), new Date(parameters.to));
        }, 500);
    };

    async fetchReportDetailed(page, filterBy, activeTab, beginDate, endDate) {
        const data = await ReportsService.fetchReportDetailed(page, filterBy, activeTab, beginDate, endDate);
        if (data.success) {
            if (data.res[0] !== this.state.items[0]) {
                this.setState({
                    items: this.state.items.concat(data.res)
                });
                if (data.res.length === 0) {
                    this.setState({hasMore: false});
                }
                if (data.res.length < 6) {
                    this.setState({loading: false});
                }
            }
        }
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
                                    <div className="highlight-box"
                                         onClick={() => this.props.history.push(`/${dwelling.siocId}`)}>
                                        <div className="prop-detail-btns">
                                            <Button className="goto">
                                                <FontAwesome name="map-marker"/>
                                                <small style={{color: '#fff'}}> {dwelling.address?dwelling.address.city:''} </small>
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
                                                        `Subido ${moment(dwelling.createdAt).startOf('minutes').fromNow()}`}
                                                </span>
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
            <div>
                <Container fluid className="animated fadeIn">
                    <Row>
                        <Col>
                            <h3 className="title">Propiedas en estado: {filterByStrings[this.props.match.params.filterBy]}</h3>
                            <hr className="mb-3 mt-2"/>
                        </Col>
                    </Row>
                    {this.state.items.length > 0 && this.renderContent()}
                </Container>
                <div className="float-btns">
                    <Button id="GoBack" className="goback" onClick={() => this.props.history.goBack()}>
                        <FontAwesome name="angle-left"/>
                        <UncontrolledTooltip placement="top" target="GoBack"> Volver </UncontrolledTooltip>
                    </Button>
                </div>
            </div>
        );
    }
}

export default connect(
    state => ({userProfile: state.user.userProfile}),
    dispatch => ({})
)(Detailed);
