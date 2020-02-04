import React, {Component, Fragment} from 'react';
// import {connect} from 'react-redux';
import {
    Container, Row, Col,
    TabContent, TabPane,
    Nav, NavItem, NavLink,    
    ListGroup,
    ListGroupItem,
    Card, CardText, CardBody, CardTitle, CardSubtitle,
    Table, Input, Label, Form, FormGroup
} from 'reactstrap';
import {MoonLoader} from 'react-spinners';
import classnames from 'classnames';
import DatePicker from 'react-datepicker'
import moment from 'moment'
import 'react-datepicker/dist/react-datepicker.css'
import {requestUserProfile} from './../../../actions'
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import InquiriesService from './../../../services/inquiries'
import UserService from './../../../services/user'

import StorageService from './../../../services/storage';
import {requestInquiries} from '../../../actions';

class Reports extends Component {
    constructor(props) {
        super(props);
        moment.locale("es");
        this.toggle = this.toggle.bind(this);
        this.handlePickDate = this.handlePickDate.bind(this);
        this.handleWeekDate = this.handleWeekDate.bind(this);
        this.handleMonthDate = this.handleMonthDate.bind(this);
        this.handleCustomDateBegin = this.handleCustomDateBegin.bind(this);
        this.handleCustomDateEnd = this.handleCustomDateEnd.bind(this);
        this.fetchInquiries = this.fetchInquiries.bind(this);

        this.state = {
            activeTab: '0',
            beginDate: moment().startOf("day").format(),
            p1: moment().format("YYYY-MM-DD"),
            p2: moment().format("YYYY-MM-DD"),
            seletedweek : moment(new Date()).year() + "-W" + moment(new Date()).week(),
            seletedmonth : moment().format("YYYY-MM"),
            endDate: moment().endOf("day").format(),
            dateParam : {},
            existdata : 0,
            total_mail : 0,
            total_whatsapp : 0,
            totalcount : 0,
           // inquiries: [],
            userrole: '',
            reports: {
                "properties": 0,
                "onsale": 0,
                "forrent": 0,
                "forsaleandrent": 0,
                "notpublished": 0,
                "sold": 0,
                "rented": 0,
                "unsubscribed": 0,
                "agencyData": [],
            }
        };

    }

    static defaultProps = {
        inquiries: [],

    };

    toggle(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            }, function () {
                switch (this.state.activeTab) {
                    case "0":
                        this.handlePickDate(moment());
                        break;
                    case "1":
                        this.handlePickDate(moment());
                        break;
                    case "2":
                        this.handleWeekDate(moment());
                        break;
                    case "3":
                        this.handleMonthDate(moment());
                        break;
                    case "4":
                        this.handleCustomDateBegin(moment());
                        break;
                }
            });
        }
    }

    static propTypes = {
        requestInquiries: PropTypes.func.isRequired,
        requestUserProfile: PropTypes.func.isRequired,
        inquiries: PropTypes.arrayOf(PropTypes.shape({})),

        location: PropTypes.shape({
            pathname: PropTypes.string
        }).isRequired
    };

    calcTime( offset, seletdate) {

        var utc = new Date(seletdate).getTime() + (new Date(seletdate).getTimezoneOffset() * 60000);
        var nd = new Date(utc + (3600000*offset));
        return  nd.toLocaleString();
    
    }
    componentDidMount() {
        this.props.requestUserProfile();
        this.fetchInquiries(this.state.beginDate, this.state.endDate);
        console.log("aaaaaaaaaaaaaa", this.props);

    }

    handlePickDate(date) {
        let b = moment(date);
        let e = moment(date);
        let sd = moment(b).startOf("day");
        let ed = moment(e).endOf("day");
        this.setState({
            beginDate: sd.format(),
            endDate: ed.format()
        });
        this.fetchInquiries(sd.format(), ed.format());
    }

    handleWeekDate(date) {
        let b = moment(date);
        let e = moment(date);

        let sd = moment(b).startOf("isoWeek");
        let ed = moment(e).endOf("isoWeek");
        this.setState({
            beginDate: sd.format(),
            endDate: ed.format(),
            seletedweek : moment(date).year() + "-W" + moment(date).week(),
        });
        this.fetchInquiries(sd.format(), ed.format());
    }

    handleMonthDate(date) {
        let b = moment(date);
        let e = moment(date);
        let sd = b.startOf("month");
        let ed = e.endOf("month");
        this.setState({
            beginDate: sd.format(),
            endDate: ed.format(),
            seletedmonth :  moment(date).format("YYYY-MM")
        });
        this.fetchInquiries(sd.format(), ed.format());
    }

    handleCustomDateBegin(date) {
        let b = moment(date);
        let sd = moment(b).startOf("day");
        this.setState({
            beginDate: sd.format(),
        });
        this.fetchInquiries(sd.format(), this.state.endDate);
    }

    handleCustomDateEnd(date) {
        let e = moment(date);
        let ed = moment(e).endOf("day");
        this.setState({
            endDate: ed.format()
        });
        this.fetchInquiries(this.state.beginDate, ed.format());
    }

    getTypeByText(txt) {
        return data.filter(
            function (data) {
                return data.txt == txt
            }
        );
    }

    async fetchInquiries(beginDate, endDate) {
        const userprofile = await UserService.getProfile();
        if(!userprofile._id){
            this.props.history.push('/home');
            return;
        }
        this.setState({
            loading: true,
            userrole: userprofile.role,
        });

        var param = {
            beginDate : this.calcTime('-3', beginDate),
            endDate : this.calcTime('-3', endDate),
            userrole: userprofile.role,
            agencyname: userprofile.agency,
            activeTab: this.state.activeTab
        };

        this.props.requestInquiries({
            beginDate : this.calcTime('-3', beginDate),
            endDate : this.calcTime('-3', endDate),
            userrole: userprofile.role,
            agencyname: userprofile.agency,
            activeTab: this.state.activeTab
        });  

        const data = this.props.inquiries;
        if (data.length > 0) {
            var total_whatsapp = 0;
            var total_mail = 0;
            var totalcount = 0;
            for(var i=0; i<data.length; i++){
                 
                total_whatsapp = total_whatsapp + data[i].whatsappcounter;
                total_mail = total_mail + data[i].mailcounter;
            }
            totalcount = total_whatsapp + total_mail;

            this.setState({
                inquiries: data,
                existdata : 1,
                totalcount : totalcount,
                total_mail : total_mail,
                total_whatsapp : total_whatsapp,
                p1 : moment(beginDate).format("YYYY-MM-DD") ,
                p2 : moment(endDate).format("YYYY-MM-DD") ,
                loading: false
            });

           
        }else{
            this.setState({
                existdata : 0,
                inquiries: data,
                totalcount : 0,
                total_mail : 0,
                total_whatsapp : 0,
                p1 : moment(beginDate).format("YYYY-MM-DD") ,
                p2 : moment(endDate).format("YYYY-MM-DD") ,

                loading: false
            });
        }


    }

    render() {
        return (
            (this.state.loading ?
                <div className="overlay-spinner">
                    <MoonLoader/>
                </div>
                :
                <div>
                    <Container fluid className="animated fadeIn reports">
                        <Nav pills justified>
                            <NavItem>
                                <NavLink
                                    className={classnames({active: this.state.activeTab === '0'})}
                                    onClick={() => {
                                        this.toggle('0');
                                    }}
                                >
                                    General
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    className={classnames({active: this.state.activeTab === '1'})}
                                    onClick={() => {
                                        this.toggle('1');
                                    }}
                                >
                                    Día
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    className={classnames({active: this.state.activeTab === '2'})}
                                    onClick={() => {
                                        this.toggle('2');
                                    }}
                                >
                                    Semana
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    className={classnames({active: this.state.activeTab === '3'})}
                                    onClick={() => {
                                        this.toggle('3');
                                    }}
                                >
                                    Mes
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    className={classnames({active: this.state.activeTab === '4'})}
                                    onClick={() => {
                                        this.toggle('4');
                                    }}
                                >
                                    Personalizado
                                </NavLink>
                            </NavItem>
                        </Nav>

                        <TabContent activeTab="1">
                            <TabPane tabId="1">
                                <Row className="mb-2">
  
                                    <div style={{width: '100%'}} className="mdate">
                                        {this.state.activeTab === "1" ?
                                            <Input type="date" name="date" id="exampleDate1" defaultValue={this.state.p1}
                                                   placeholder="date placeholder"
                                                   onChange={(e) => this.handlePickDate(e.target.value)}/> : null}
                                        {this.state.activeTab === "2" ?
                                            <Input type="week" name="date" id="exampleDate2" defaultValue={this.state.seletedweek}
                                                   placeholder="date placeholder"  
                                                   onChange={(e) => this.handleWeekDate(e.target.value)}/> : null}
                                        {this.state.activeTab === "3" ?
                                            <Input type="month" name="date" id="exampleDate3" defaultValue={this.state.seletedmonth}
                                                   placeholder="date placeholder"
                                                   onChange={(e) => this.handleMonthDate(e.target.value)}/> : null}
                                        {this.state.activeTab === "4" ?
                                            <Form>
                                                <Row>
                                                    <Col style={{padding: '0'}}>
                                                        <FormGroup>
                                                            <Label>Desde</Label>
                                                            <Input type="date" name="date" id="exampleDate41"
                                                                defaultValue={this.state.p1} placeholder="date placeholder"
                                                                onChange={(e) => this.handleCustomDateBegin(e.target.value)}/>
                                                        </FormGroup>
                                                    </Col>
                                                    <div style={{padding: '5px'}}></div>
                                                    <Col style={{padding: '0'}}>
                                                        <FormGroup>
                                                            <Label>Hasta</Label>
                                                                <Input type="date" name="date" id="exampleDate42"
                                                                    defaultValue={this.state.p2} placeholder="date placeholder"
                                                                    onChange={(e) => this.handleCustomDateEnd(e.target.value)}/>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            </Form>
                                            : null}
                                    </div>
                                </Row>
                                <Row className="text-center my-2 p-2">
                                    <Col>
                                        <div className="p-3">
                                            <span className="display-4"><b>{this.state.totalcount}</b></span>
                                            <p className="text-uppercase m-0">total</p>
                                        </div>
                                    </Col>
                                    <Col>
                                        <div className="bg-light p-3">
                                            <h1><b>{this.state.total_whatsapp}</b></h1>
                                            <p className="text-uppercase m-0">whatsapp</p>
                                        </div>
                                    </Col>
                                    <Col>
                                        <div className="bg-light p-3">
                                            <h1><b>{this.state.total_mail}</b></h1>
                                            <p className="text-uppercase m-0">mail</p>
                                        </div>
                                    </Col>
                                </Row>
                                
                                {this.state.userrole == "admin" ? this.state.inquiries.map((inquirie, index) => (
                                <ListGroup key={inquirie._id} className="mb-2">
                                    <ListGroupItem style={{border: 'none', backgroundColor: '#f1f1f1'}}>
                                        <Row className="mt-2">
                                            <Col>
                                                <h5 className="mb-0"><b>{inquirie.agencyname}</b></h5>
                                            </Col>
                                            <Col className="text-center">
                                                <h5 className="mb-0"><b>{inquirie.whatsappcounter}</b></h5>
                                                whatsapp
                                            </Col>
                                            <Col className="text-center">
                                                <h5 className="mb-0"><b>{inquirie.mailcounter}</b></h5>
                                                mail
                                            </Col>
                                        </Row>

                                        </ListGroupItem>
                                    </ListGroup>
                                    )): null}
                            </TabPane>
                        </TabContent>
                    </Container>
                </div>
            )
        );
    }
} 
export default connect(
    state => ({
        userProfile: state.user.userProfile,
        inquiries: state.inquiries.inquiries

    }),
    dispatch => ({
        requestInquiries: filterParams => dispatch(requestInquiries(filterParams)),

        requestUserProfile: () => dispatch(requestUserProfile())
    })
)(Reports);
