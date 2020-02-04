/* eslint-disable react/no-danger */
/* eslint-disable no-undef */
import React, {Component} from 'react';
import {BeatLoader} from 'react-spinners';
import {includes} from 'lodash';

class PrintDocument extends Component {
    constructor(props) {
        super(props);

        const printDocumentEncodedContent = localStorage.getItem('printDocument');

        const printRawContent = decodeURIComponent(atob(printDocumentEncodedContent));

        this.state = {
            printFullContent: `
                <style>
                    .head-img {max-height: 400px !important;} 
                    * {
                        -webkit-print-color-adjust: exact !important;   /* Chrome, Safari */
                        color-adjust: exact !important;                 /*Firefox*/
                    }
                </style>
                <div className="container-fluid">
                    ${printRawContent}
                </div>
            `,
            loading: true
        };
    }

    componentDidMount() {
        const isDwellingsDetail = includes(this.state.printFullContent, 'content-map');

        window.addEventListener('DOMContentLoaded', () => {
            if (!isDwellingsDetail) {
                this.openPrintModal();
            } else {
                setTimeout(() => {
                    const mapWrapper = document.querySelector('.content-map');

                    if (mapWrapper) {
                        mapWrapper.scrollIntoView();
                    } else {
                        window.scrollTo(0, document.body.scrollHeight);
                    }

                    setTimeout(() => {
                        this.openPrintModal();
                    }, 1000);
                }, 2000);
            }
        });
    }

    openPrintModal() {
        setTimeout(() => {
            this.setState({
                loading: false
            });

            window.print();
        }, 1500);
    }

    render() {
        let loader = '';
        const spinnerStyles = {
            position: 'fixed',
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.6)',
            textAlign: 'center',
            zIndex: '100000'
        };

        if (this.state.loading) {
            loader = (
                <div style={spinnerStyles}>
                    <div style={{position: 'relative', top: '50%'}}>
                        <BeatLoader
                            color="#fbad1c"
                        />
                    </div>
                </div>
            );
        }

        return (
            <div>
                {loader}
                <div dangerouslySetInnerHTML={{__html: this.state.printFullContent}}/>
            </div>
        );
    }
}

export default PrintDocument;
