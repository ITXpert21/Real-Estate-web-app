/* global window */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import Splash from './Splash';
import Search from './Search';
import Intro from './Intro';
import Footer from './Footer';
import DwellingService from '../../services/dwelling';
import {requestFindDwellings} from '../../actions/index';

class Home extends Component {
    static propTypes = {
        requestFindDwellings: PropTypes.func.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired
        }).isRequired
    };

    async handleSubmit(siocId) {
        if (!siocId) return;
        this.props.history.push(`/${siocId}`);
    }

    async handleSearch(searchParams) {
        if (!searchParams) return;
        await this.props.requestFindDwellings(searchParams);
        this.props.history.push({pathname:'/resultados/'});
    }

    render() {
        return (
            <div>
                <Splash onChange={e => this.handleSubmit(e)} onSearch={e => this.handleSearch(e)}/>
                <Search/>
                <Intro/>
                <Footer/>
            </div>
        );
    }
}

export default connect(
    state => ({
        dwellings: state.dwelling.searchedDwellings,
        locations: state.locations,
        searchParams: state.dwelling.searchParams
    }),
    dispatch => ({
        requestFindDwellings: searchParams => dispatch(requestFindDwellings(searchParams))
    })
)(Home);
