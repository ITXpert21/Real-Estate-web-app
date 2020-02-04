import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {MoonLoader} from 'react-spinners';

import MapWithSearchBox from '../Maps/MapWithSearchBox';
import {requestFindDwellings, cleanSearchParams, dwellingsLoading, requestUserProfile, visitDwelling} from '../../actions/index';

class Resultados extends Component {
    static propTypes = {
        requestFindDwellings: PropTypes.func.isRequired,
        cleanSearchParams: PropTypes.func.isRequired,
        dwellingsLoading: PropTypes.func.isRequired,
        requestUserProfile: PropTypes.func.isRequired,
        locations: PropTypes.arrayOf(PropTypes.shape({})),
        searchParams: PropTypes.shape({}),
        currentPosition: PropTypes.shape({}),
        loading: PropTypes.bool,
        visitDwelling: PropTypes.func.isRequired,
        visitedDwellings: PropTypes.arrayOf(PropTypes.string)
    };

    static defaultProps = {
        locations: null,
        searchParams: null,
        currentPosition: undefined,
        loading: true,
        visitedDwellings: []
    };

    constructor(props) {
        super(props);
        this.state = {
            searchParams: {},
            height: 0,
            first: true
        };
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        if (!this.props.locations)
            this.props.dwellingsLoading();
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        this.props.requestUserProfile();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    componentWillReceiveProps(props) {
        if (props.userProfile && this.state.first) {
            this.setState({first: false});

            if (props.location.pathname === '/admin/dwellings/search') {

                var searchParams = localStorage.getItem('searchParams');
                if (searchParams === null) {
                    props.cleanSearchParams();
                    if (['martillero', 'vendedor'].includes(props.userProfile.role)) {
                        props.requestFindDwellings({publicationType: undefined, agencyDwellings: true});
                    } else {
                        props.requestFindDwellings({publicationType: undefined, agencyDwellings: false});
                    }
                } else {
                    if (JSON.stringify(props.searchParams) !== searchParams) {
                        props.requestFindDwellings(JSON.parse(searchParams));
                    }
                }
            }
        }
    }

    updateWindowDimensions() {
        this.setState({height: window.innerHeight});
    }

    handleSubmit(searchParams) {
        this.props.requestFindDwellings(searchParams);
    }

    renderMap() {
        return (
            <MapWithSearchBox user={this.props.userProfile} dwellings={this.props.locations} history={this.props.history} selectedRef={this.props.currentPosition} visitedDwellings={this.props.visitedDwellings} visitDwelling={this.props.visitDwelling} />
        );
    }

    render() {
        return (
            (this.props.loading ?
                    <div className="overlay-spinner">
                        <MoonLoader/>
                    </div>
                    :
                    (this.props.locations && this.props.locations.length > 0 ?
                        <div style={{height: '100%'}}>
                            {this.renderMap()}
                        </div>
                        :
                        <div className="mt-4 text-center">
                            <h3>Ups! Parece que no hay propiedades para esta búsqueda...</h3>
                            <hr/>
                        </div>
                    )
            )
        );
    }
}

export default connect(
    state => ({
        userProfile: state.user.userProfile,
        loading: state.dwelling.loading,
        locations: state.dwelling.locations,
        searchParams: state.dwelling.searchParams,
        currentPosition: state.map.currentPosition,
        visitedDwellings: state.dwelling.visitedDwellings
    }),
    dispatch => ({
        requestUserProfile: () => dispatch(requestUserProfile()),
        requestFindDwellings: searchParams => dispatch(requestFindDwellings(searchParams)),
        cleanSearchParams: () => dispatch(cleanSearchParams()),
        dwellingsLoading: () => dispatch(dwellingsLoading()),
        visitDwelling: dwellingId => dispatch(visitDwelling(dwellingId))
    })
)(Resultados);
