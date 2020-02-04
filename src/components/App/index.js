/* global */
import React, {Component, Fragment} from 'react';
import {Route, Switch, Redirect} from 'react-router-dom';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Container} from 'reactstrap';

// import Breadcrumb from './Breadcrumb';
import Aside from '../Aside';

import Header from './Header';
import Sidebar from './Sidebar';

import Admin from '../Admin';
import Agency from '../Agency';
import Home from '../Home';
import Dwellings from '../Dwellings';
import Resultados from '../Resultados';
import {requestUserProfile} from '../../actions';
import {Helmet} from 'react-helmet';
import DwellingDetailView from '../common/DwellingDetailView';


class App extends Component {
    static propTypes = {
        requestUserProfile: PropTypes.func.isRequired,
        location: PropTypes.shape({
            pathname: PropTypes.string
        }).isRequired
    };

    componentDidMount() {
        this.props.requestUserProfile();
    }

    render() {
        return (
            <div className="app">
                <Helmet>
                    <title>SIOC - Más de 4500 propiedades para comprar, vender o alquilar.</title>
                </Helmet>
                <Header {...this.props}/>
                <div className="app-body">
                    <Sidebar {...this.props}/>
                    <main className="main">
                        {/* <Breadcrumb/> */}
                        <Switch>
                            <Route path="/admin" component={Admin}/>
                            <Route path="/dwellings" component={Dwellings}/>
                            {/*<Route path="/propiedades" component={Propiedades}/>*/}
                            <Route path="/resultados" component={Resultados}/>
                            <Route path="/home" component={Home}/>
                            <Route path="/agency" component={Agency}/>
                            <Route path="/:siocId" component={DwellingDetailView} exact />
                            <Redirect from="/" to="/home"/>
                        </Switch>
                    </main>
                    {(this.props.location.pathname === '/resultados/' ||
                        this.props.location.pathname === '/admin/dwellings/search') &&
                        <Aside {...this.props}/>}
                </div>
                {/* <Footer/> */}
            </div>
        );
    }
}

export default connect(
    state => ({
        userProfile: state.user.userProfile
    }),
    dispatch => ({
        requestUserProfile: () => dispatch(requestUserProfile())
    })
)(App);
