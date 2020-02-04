
import React from 'react';
import PropTypes from 'prop-types';
import { MAP, MARKER } from 'react-google-maps/lib/constants';


class Spiderfy extends React.Component {
    static contextTypes = {
        [MAP]: PropTypes.object
    };

    constructor(props, context) {
        super(props, context);
        const oms = require('npm-overlapping-marker-spiderfier/lib/oms.min')
        this.oms = new oms.OverlappingMarkerSpiderfier(this.context[MAP], {});
        this.markerNodeMounted = this.markerNodeMounted.bind(this);
    }

    markerNodeMounted(ref) {
        if (ref) {
            const marker = ref.state[MARKER];
            this.oms.addMarker(marker);
            window.google.maps.event.addListener(marker, 'spider_click', (e) => {
                if (this.props.onSpiderClick) {
                    this.props.onSpiderClick(marker.getTitle());
                } else {
                    this.props.onSpiderClick(marker.getTitle());
                }
            });
        }
    }

    render() {
        return React.Children.map(this.props.children, child =>
            React.cloneElement(child, { ref: this.markerNodeMounted })
        );
    }
}

export default Spiderfy;
