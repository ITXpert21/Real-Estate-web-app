import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {FormControl, FormGroup} from 'react-bootstrap';
import {
  Row,
  Col,
  Input,
  InputGroup,
  InputGroupAddon,
  Label,
  ButtonGroup,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table, Container
} from 'reactstrap';
import SweetAlert from 'react-bootstrap-sweetalert';
import {MoonLoader, BeatLoader} from 'react-spinners';
import FontAwesome from 'react-fontawesome';
import SortIcon from 'react-icons/lib/io/arrow-swap';
import Select from 'react-select';
import Switch from 'react-switch';
import {map, isNull, filter, includes, lowerCase, replace, debounce} from 'lodash';
import InfiniteScroll from 'react-infinite-scroll-component';
import FaShare from 'react-icons/lib/md/share';
import MultipleSearchBox from '../Maps/MultipleSearchBox';
import {
  requestFindDwellings,
  requestSearchLoadMoreDwellings,
  setMapRefs,
  requestAddFavorite,
  requestUserProfile,
  requestFileConvert,
  requestSearchDwellingsByKeyword,
  visitDwelling,
  requestSearchClients,
  requestFavoriteToClients,
  requestRemoveFavoriteFromClient,
} from '../../actions/index';
import {groupedOptions, newestOptions} from '../../data/data';
import DwellingTitle from '../../services/dwellingTitle';
import ShareModal from '../common/Share/ShareModal';
import FavoriteModal from '../common/Favorite/FavoriteModal';
import {previewImage} from '../common/utils/custom_helpers';

const PLACE_OF_USAGE = 'aside';

const groupStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
};
const groupBadgeStyles = {
    backgroundColor: '#EBECF0',
    borderRadius: '2em',
    color: '#172B4D',
    display: 'inline-block',
    fontSize: 12,
    fontWeight: 'normal',
    lineHeight: '1',
    minWidth: 1,
    padding: '0.16666666666667em 0.5em',
    textAlign: 'center'
};
const visitedDwellingStyles = {
    opacity: '.5',
    borderLeft: '2px solid #fbad1c'
};
const statusOptions = [
  {value: 'Desconocido', label: 'Desconocido'},
  {value: 'Nuevo', label: 'Nuevo'},
  {value: 'A estrenar', label: 'A estrenar'},
  {value: 'Excelente', label: 'Excelente'},
  {value: 'Muy Bueno', label: 'Muy Bueno'},
  {value: 'Bueno', label: 'Bueno'},
  {value: 'Usado', label: 'Usado'},
  {value: 'Regular', label: 'Regular'},
  {value: 'A reciclar', label: 'A reciclar'},
  {value: 'A demoler', label: 'A demoler'},
  {value: 'En construcción', label: 'En construcción'},
  {value: 'Refaccionado', label: 'Refaccionado'}
];
const locationOptions = [
  {value: 'Desconocida', label: 'Desconocida'},
  {value: 'Frente', label: 'Frente'},
  {value: 'Contrafrente', label: 'Contrafrente'},
  {value: 'Lateral', label: 'Lateral'},
  {value: 'Interno', label: 'Interno'}
];
const heatingOptions = [
    {value: 'No posee', label: 'No posee'},
    {value: 'Gas natural', label: 'Gas natural'},
    {value: 'Gas envasado', label: 'Gas envasado'},
    {value: 'Tiro balanceado', label: 'Tiro balanceado'},
    {value: 'Estufas eléctricas', label: 'Estufas eléctricas'},
    {value: 'Split frío/calor', label: 'Split frío/calor'},
    {value: 'Salamandra', label: 'Salamandra'},
    {value: 'Hogar a leña', label: 'Hogar a leña'},
    {value: 'Hogar a gas', label: 'Hogar a gas'},
    {value: 'Radiadores', label: 'Radiadores'},
    {value: 'Caldera', label: 'Caldera'},
    {value: 'Caldera individual', label: 'Caldera individual'},
    {value: 'Losa radiante', label: 'Losa radiante'},
    {value: 'Zócalo radiante', label: 'Zócalo radiante'},
    {value: 'Piso radiante', label: 'Piso radiante'},
    {value: 'Eskabes', label: 'Eskabes'},
    {value: 'Central', label: 'Central'},
    {value: 'Central por radiadores', label: 'Central por radiadores'},
    {value: 'Central por ducto', label: 'Central por ducto'}
];

const formatGroupLabel = data => (
    <div style={groupStyles}>
        <span>{data.label}</span>
        <span style={groupBadgeStyles}>{data.options.length}</span>
    </div>
);

class Aside extends Component {
    static propTypes = {
        requestFindDwellings: PropTypes.func.isRequired,
        requestSearchLoadMoreDwellings: PropTypes.func.isRequired,
        requestUserProfile: PropTypes.func.isRequired,
        requestAddFavorite: PropTypes.func.isRequired,
        requestSearchClients: PropTypes.func.isRequired,
        requestFavoriteToClients: PropTypes.func.isRequired,
        requestRemoveFavoriteFromClient: PropTypes.func.isRequired,
        setMapRefs: PropTypes.func.isRequired,
        searchParams: PropTypes.shape({}),
        dwellings: PropTypes.arrayOf(PropTypes.shape({})),
        loading: PropTypes.bool,
        requestFileConvert: PropTypes.func.isRequired,
        savingFile: PropTypes.bool,
        totalCount: PropTypes.number,
        loadingFetchMoreDwellings: PropTypes.bool,
        loadingDwellingsByKeyword: PropTypes.bool,
        requestSearchDwellingsByKeyword: PropTypes.func.isRequired,
        visitDwelling: PropTypes.func.isRequired,
        visitedDwellings: PropTypes.arrayOf(PropTypes.string)
    };

    static defaultProps = {
        searchParams: null,
        dwellings: [],
        loading: true,
        savingFile: false,
        totalCount: 0,
        loadingFetchMoreDwellings: false,
        loadingDwellingsByKeyword: false,
        visitedDwellings: []
    };

    constructor(props) {
        super(props);
        this.state = {
            searchParams: {},
            searchModal: false,
            spacesModal: false,
            characteristicsModal: false,
            servlegModal: false,
            orderByModal: false,
            orderKeyByPrice: 'cheapest',
            orderKeyByDate: undefined,
            orderKeyByTitle: false,
            filter: null,
            compactView: true,
            alert: null,
            page: {
                perPage: 30,
                pageNumber: 1
            },
            modalShare: false,
            dwelling: null,
            modalFavorite: false,
            dwellingId: null
        };
        this.toggleShare = this.toggleShare.bind(this);
        this.toggleFavorite = this.toggleFavorite.bind(this);
        this.handleFavorite = this.handleFavorite.bind(this);
        this.showAlert = this.showAlert.bind(this);
    }

    componentDidMount() {
        if (this.props.location.pathname === '/admin/dwellings/search') {
            let searchParamsFromLocalStorage = JSON.parse(localStorage.getItem('searchParams'));

            if (searchParamsFromLocalStorage === null) {
                searchParamsFromLocalStorage = {
                    publicationType: undefined,
                    agencyDwellings: true,
                    orderKeyByPrice: 'cheapest',
                    orderKeyByDate: undefined,
                    orderKeyByTitle: false,
                };
            }
            const orderKeyByPrice = localStorage.getItem('orderKeyByPrice');
            if (orderKeyByPrice === null || orderKeyByPrice === '') {
                searchParamsFromLocalStorage = {...searchParamsFromLocalStorage, orderKeyByPrice: ''};
            } else {
                searchParamsFromLocalStorage = {...searchParamsFromLocalStorage, orderKeyByPrice};
            }
            const orderKeyByDate = localStorage.getItem('orderKeyByDate');
            if (orderKeyByDate === null || orderKeyByDate === '') {
                searchParamsFromLocalStorage = {...searchParamsFromLocalStorage, orderKeyByDate: ''};
            } else {
                searchParamsFromLocalStorage = {...searchParamsFromLocalStorage, orderKeyByDate};
            }
            const orderKeyByTitle = localStorage.getItem('orderKeyByTitle')
            if (orderKeyByTitle === null || orderKeyByTitle === false) {
                searchParamsFromLocalStorage = {...searchParamsFromLocalStorage, orderKeyByTitle: false};
            } else {
                searchParamsFromLocalStorage = {...searchParamsFromLocalStorage, orderKeyByTitle};
            }

            this.setState({
                searchParams: searchParamsFromLocalStorage,
                orderKeyByPrice: searchParamsFromLocalStorage.orderKeyByPrice,
                orderKeyByDate: searchParamsFromLocalStorage.orderKeyByDate,
                orderKeyByTitle: searchParamsFromLocalStorage.orderKeyByTitle,
            },
            () => {
                this.props.requestFindDwellings(this.state.searchParams);
                if (this.props.userProfile && ['martillero', 'vendedor'].includes(this.props.userProfile.role)) {
                    this.props.requestSearchClients();
                }
            });
        }

        if (this.props.location.pathname === '/resultados/') {
            if (this.props.searchParams) {
                this.setState({searchParams: this.props.searchParams});
            } else {
                const searchParamsFromLocal = JSON.parse(localStorage.getItem('searchParams'));
                this.setState({
                    searchParams: searchParamsFromLocal,
                    orderKeyByPrice: searchParamsFromLocal.orderKeyByPrice,
                    orderKeyByDate: searchParamsFromLocal.orderKeyByDate,
                    orderKeyByTitle: searchParamsFromLocal.orderKeyByTitle,
                },
                () => {
                    this.props.requestFindDwellings(this.state.searchParams);
                    if (this.props.userProfile && ['martillero', 'vendedor'].includes(this.props.userProfile.role)) {
                        this.props.requestSearchClients();
                    }
                });
            }
        }
    }

    componentWillReceiveProps(props) {
        if (!this.props.userProfile && props.userProfile && ['martillero', 'vendedor'].includes(props.userProfile.role)) {
            this.props.requestSearchClients();
        }

        if (!isNull(props.searchParams)) {
            if (props.location.pathname === '/admin/dwellings/search') {
                var searchParams = localStorage.getItem('searchParams');
                if (searchParams === null) {
                    if (['martillero', 'vendedor'].includes(props.userProfile.role)) {
                        this.setState({searchParams: {publicationType: undefined, agencyDwellings: true}});
                    } else {
                        this.setState({searchParams: {publicationType: undefined, agencyDwellings: false}});
                    }
                } else {
                    this.setState({searchParams: JSON.parse(searchParams)});
                }

                let orderKeyByPrice = localStorage.getItem('orderKeyByPrice');
                let orderKeyByDate = localStorage.getItem('orderKeyByDate');

                if ((orderKeyByPrice === null || orderKeyByPrice === '') && (orderKeyByDate === null || orderKeyByDate === '')) {
                    if (['martillero', 'vendedor'].includes(props.userProfile.role)) {
                        orderKeyByPrice = 'cheapest';
                        orderKeyByDate = '';
                    } else {
                        orderKeyByPrice = 'cheapest';
                        orderKeyByDate = '';
                    }
                    this.setState({orderKeyByPrice, orderKeyByDate});
                }

                if (orderKeyByPrice !== '') {
                    this.setState({orderKeyByPrice});
                    if (props.dwellings.length > 0) {
                        if (orderKeyByPrice === 'cheapest') {
                            props.dwellings.sort(this.comparator('price'));
                        }
                        if (orderKeyByPrice === 'expensive') {
                            props.dwellings.sort(this.comparator('price', 'desc'));
                        }
                        if (orderKeyByPrice === 'recentPriceModified') {
                            props.dwellings.sort(this.comparator('price', 'recentPriceModified'));
                        }
                    }
                }

                if (orderKeyByDate !== '') {
                    this.setState({orderKeyByDate});
                    if (props.dwellings.length > 0) {
                        if (orderKeyByDate === 'newest') {
                            props.dwellings.sort(this.comparator('createdAt', 'desc'));
                        }
                        if (orderKeyByDate === 'oldest') {
                            props.dwellings.sort(this.comparator('createdAt'));
                        }
                    }
                }
            }
            if (props.location.pathname === '/resultados/') {
                if (props.searchParams !== this.state.searchParams) {
                    if (this.state.searchParams) {
                        this.setState(Object.assign({}, this.state.searchParams, props.searchParams));
                    } else {
                        this.setState({searchParams: props.searchParams});
                    }
                }
            }
        }
    }

    componentDidUpdate() {
        if (this.props.location.pathname === '/admin/dwellings/search' ||
            this.props.location.pathname === '/resultados/') {
            if (!isNull(this.state.searchParams)) {
                localStorage.setItem('searchParams', JSON.stringify(this.state.searchParams));
            }
            localStorage.setItem('orderKeyByPrice', this.state.orderKeyByPrice);
            localStorage.setItem('orderKeyByDate', this.state.orderKeyByDate);
            localStorage.setItem('orderKeyByTitle', this.state.orderKeyByTitle);
        }
    }

    componentWillUnmount() {
        if (!this.props.history.location.pathname.includes('/admin/dwellings/card/')) {
            const searchParamsCopy = {...this.state.searchParams};
            searchParamsCopy.agencyDwellings = true;
            localStorage.setItem('searchParams', JSON.stringify(searchParamsCopy));
        }
    }

    handleAddress(e) {
        if (e.length === 0) {
            this.setState(
                state => ({
                    searchParams: {...state.searchParams, address: undefined, selectedLocations: undefined}
                })
            );
        } else {
            this.setState(
                state => ({
                    searchParams: {
                        ...state.searchParams,
                        address: e.map(addr => {
                            let res = {...addr};
                            delete res.altitude;
                            delete res.latitude;
                            delete res.formatted_address;
                            return res;
                        }), selectedLocations: e.map(addr => {
                            let res = {...addr};
                            return res;
                        })
                    }
                })
            );
        }
    }

    comparator(key, order = 'asc') {
        return function (a, b) {
            if (order !== 'recentPriceModified') {
                if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
                    return 0; // property doesn't exist on either object
                }
                const varA = (typeof a[key] === 'string') ?
                    a[key].toUpperCase() : a[key];
                const varB = (typeof b[key] === 'string') ?
                    b[key].toUpperCase() : b[key];

                let comparison = 0;
                if (varA > varB) {
                    comparison = 1;
                } else if (varA < varB) {
                    comparison = -1;
                }
                return (
                    (order === 'desc') ? (comparison * -1) : comparison
                );
            } else {
                const aModified = a.hasOwnProperty('priceHistory') && a['priceHistory'].length > 0 ?
                    a['priceHistory'][a['priceHistory'].length - 1]['modified'] : a['updatedAt'];
                const bModified = b.hasOwnProperty('priceHistory') && b['priceHistory'].length > 0 ?
                    b['priceHistory'][b['priceHistory'].length - 1]['modified'] : b['updatedAt'];

                let comparison = 0;
                if (a.hasOwnProperty('priceHistory')) {
                    if (b.hasOwnProperty('priceHistory')) {
                        if (aModified > bModified) comparison = -1;
                        else if (aModified < bModified) comparison = 1;
                    } else {
                        comparison = -1;
                    }
                } else {
                    if (b.hasOwnProperty('priceHistory')) {
                        comparison = 1;
                    } else {
                        if (aModified > bModified) comparison = -1;
                        else if (aModified < bModified) comparison = 1;
                    }
                }
                return comparison;
            }
        };
    }

    orderBy(type) {
        if (type === 'cheapest') {
            this.props.dwellings.sort(this.comparator('price'));
        }
        if (type === 'expensive') {
            this.props.dwellings.sort(this.comparator('price', 'desc'));
        }
        if (type === 'recentPriceModified') {
            this.props.dwellings.sort(this.comparator('price', 'recentPriceModified'));
        }
        if (type === 'newest') {
            this.props.dwellings.sort(this.comparator('createdAt', 'desc'));
        }
        if (type === 'oldest') {
            this.props.dwellings.sort(this.comparator('createdAt'));
        }

        if (type === 'cheapest' || type === 'expensive' || type === 'recentPriceModified') {
            if (this.state.orderKeyByPrice === type) {
                this.setState({orderKeyByPrice: '', searchParams: {...this.state.searchParams, orderKeyByPrice: ''}});
            } else {
                this.setState({
                    orderKeyByPrice: type,
                    searchParams: {...this.state.searchParams, orderKeyByPrice: type}
                });
            }
        } else if (type === 'oldest' || type === 'newest') {
            if (this.state.orderKeyByDate === type) {
                this.setState({orderKeyByDate: '', searchParams: {...this.state.searchParams, orderKeyByDate: '', orderKeyByDateOption: undefined}});
            } else {
                if (type === 'oldest') {
                    this.setState({orderKeyByDate: type, searchParams: {...this.state.searchParams, orderKeyByDate: type, orderKeyByDateOption: undefined}});
                } else {
                    this.setState({orderKeyByDate: type, searchParams: {...this.state.searchParams, orderKeyByDate: type, orderKeyByDateOption: '-1'}});
                }
            }
        } else if (type === 'asc' || type === 'desc') {
            this.setState({orderKeyByTitle: type, searchParams: {...this.state.searchParams, orderKeyByTitle: type}});
        }
    }

    removeTag(type, index, subIndex) {
        if (type === 'loc') {
            let tags = this.state.searchParams.address;
            // eslint-disable-next-line prefer-destructuring
            let selectedLocations = this.state.searchParams.selectedLocations;
            tags.splice(index, 1);
            selectedLocations.splice(index, 1);
            if (tags.length === 0) {
                tags = undefined;
                selectedLocations = undefined;
            }
            this.setState({searchParams: {...this.state.searchParams, address: tags, selectedLocations}},
                () => {
                    this.props.requestFindDwellings(this.state.searchParams);
                }
            );
        }
        if (type === 'subtype') {
            let tags = this.state.searchParams.subtype;
            tags.splice(index, 1);
            if (tags.length === 0) tags = undefined;
            this.setState({searchParams: {...this.state.searchParams, subtype: tags}},
                () => {
                    this.props.requestFindDwellings(this.state.searchParams);
                }
            );
        }
        if (type === 'currency') {
          this.setState({searchParams: {...this.state.searchParams, currency: ''}},
              () => {
                  this.props.requestFindDwellings(this.state.searchParams);
              }
          );
        }
        if (type === 'price') {
            let tags = this.state.searchParams.price;
            if (tags.hasOwnProperty(index)) delete tags[index];
            if (Object.keys(tags).length === 0) tags = undefined;
            this.setState({searchParams: {...this.state.searchParams, price: tags}},
                () => {
                    this.props.requestFindDwellings(this.state.searchParams);
                }
            );
        }
        if (type === 'agency_dwelling') {
            this.setState({searchParams: {...this.state.searchParams, agencyDwellings: false}},
                () => {
                    this.props.requestFindDwellings(this.state.searchParams);
                }
            );
        }
        if (type === 'legal') {
            let tags = this.state.searchParams.legal;
            if (tags.hasOwnProperty(index)) delete tags[index];
            if (Object.keys(tags).length === 0) tags = undefined;
            this.setState({searchParams: {...this.state.searchParams, legal: tags}},
                () => {
                    this.props.requestFindDwellings(this.state.searchParams);
                }
            );
        }
        if (type === 'service') {
            let tags = this.state.searchParams.services;
            if (tags.hasOwnProperty(index)) delete tags[index];
            if (Object.keys(tags).length === 0) tags = undefined;
            this.setState({searchParams: {...this.state.searchParams, services: tags}},
                () => {
                    this.props.requestFindDwellings(this.state.searchParams);
                }
            );
        }
        if (type === 'space') {
            let tags = this.state.searchParams.spaces;
            if (index === 'bedrooms') {
                let bedRooms = tags.bedrooms;
                const id = bedRooms.indexOf(subIndex);
                if (id > -1) bedRooms.splice(id, 1);
                if (bedRooms.length === 0) delete tags['bedrooms'];
                else tags.bedrooms = bedRooms;
            } else {
                if (tags.hasOwnProperty(index)) delete tags[index];
                if (Object.keys(tags).length === 0) tags = undefined;
            }
            this.setState({searchParams: {...this.state.searchParams, spaces: tags}},
                () => {
                    this.props.requestFindDwellings(this.state.searchParams);
                }
            );
        }
        if (type === 'feature') {
            let tags = this.state.searchParams.features;
            if (index === 'heating' || index === 'status' || index === 'location') {
                let subTags = tags[index];
                if (subTags.length === 0 || subIndex >= subTags.length) return;
                subTags.splice(subIndex, 1);
                if (subTags.length === 0) {
                    delete tags[index];
                    if (Object.keys(tags).length === 0) tags = undefined;
                    this.setState({searchParams: {...this.state.searchParams, features: tags}},
                        () => {
                            this.props.requestFindDwellings(this.state.searchParams);
                        }
                    );
                } else {
                    tags[index] = subTags;
                    this.setState({searchParams: {...this.state.searchParams, features: tags}},
                        () => {
                            this.props.requestFindDwellings(this.state.searchParams);
                        }
                    );
                }
            } else {
                if (tags.hasOwnProperty(index)) delete tags[index];
                if (Object.keys(tags).length === 0) tags = undefined;
                this.setState({searchParams: {...this.state.searchParams, features: tags}},
                    () => {
                        this.props.requestFindDwellings(this.state.searchParams);
                    }
                );
            }
        }
        if (type === 'order_price') {
            let tags = '';
            if (index === 'cheapest') tags = 'expensive';
            else if (index === 'expensive') tags = 'recentPriceModified';
            else tags = 'cheapest';
            this.setState({searchParams: {...this.state.searchParams, orderKeyByPrice: tags}},
                () => {
                    this.props.requestFindDwellings(this.state.searchParams);
                }
            );
        }
        if (type === 'order_date') {
            this.setState({searchParams: {...this.state.searchParams, orderKeyByDate: undefined, orderKeyByDateOption: undefined}},
                () => {
                    this.props.requestFindDwellings(this.state.searchParams);
                }
            );
        }
        if (type === 'order_title') {
            this.setState({searchParams: {...this.state.searchParams, orderKeyByTitle: undefined}},
                () => {
                    this.props.requestFindDwellings(this.state.searchParams);
                }
            );
        }

        if (type === 'reset') {
            let defaultSearchParams = {
                agencyDwellings: false,
                currency: "",
                features: {},
                legal: {},
                orderKeyByDate: undefined,
                orderKeyByDateOption: undefined,
                orderKeyByPrice: "cheapest",
                orderKeyByTitle: undefined,
                price: { min: undefined, max: undefined },
                publicationType: "Venta",
                selectedLocations: [],
                services: {},
                spaces: {}
            };
            if (this.props.userProfile) {
              if (['martillero', 'vendedor'].includes(this.props.userProfile.role)) {
                defaultSearchParams = {...defaultSearchParams, publicationType: undefined, agencyDwellings: true};
              } else {
                defaultSearchParams = {...defaultSearchParams, publicationType: undefined, agencyDwellings: false};
              }
            }
            if (this.props.location.pathname === '/admin/dwellings/search' ||
                this.props.location.pathname === '/resultados/') {
                localStorage.setItem('searchParams', JSON.stringify(defaultSearchParams));
                localStorage.setItem('orderKeyByPrice', 'cheapest');
                localStorage.removeItem('orderKeyByDate');
                localStorage.removeItem('orderKeyByTitle');
            }
            this.setState({searchParams: defaultSearchParams, orderKeyByPrice: 'cheapest', orderKeyByDate: undefined, orderKeyByTitle: false},
                () => {
                    this.props.requestFindDwellings(this.state.searchParams);
                });
        }
    }

    toggleModals(modal) {
        this.setState({[modal]: !this.state[modal]});
    }

    toggleSidebarView() {
        this.setState({compactView: !this.state.compactView});
    }

    handlePrintPage() {
        if (!this.props.savingFile) {
            // eslint-disable-next-line no-undef
            const locationOrigin = window.location.origin;
            // eslint-disable-next-line react/prop-types
            const allLocationsForPrint = this.props.locations.map(location => {
                const title = DwellingTitle.get(location, PLACE_OF_USAGE);

                return `
                    <tr>
                        <th scope="row"><span aria-hidden="true" class="fa fa-map-marker"></span></th>
                        <td><a href="${locationOrigin}/${location.siocId}"><b>${title}</b></a></td>
                        <td><em>${location.price > 0 ? location.currency + location.price : 'Consulte'}</em></td>
                        <td>#${location.siocId}</td>
                    </tr>
                `;
            });

            const dwellingsTable = `
                <div style="max-width: 70%; margin: 0 auto;">
                    <table class="print-table table table-sm" style="margin-top: 27px;">
                        <tbody>
                            <tr>
                                <th scope="row"><span aria-hidden="true" class="fa fa-map-marker"></span></th>
                                <td><b>LOCATION</b></td>
                                <td><em>PRICE</em></td>
                                <td>#SIOCID</td>
                            </tr>
                            ${allLocationsForPrint.join('')}
                        </tbody>
                    </table>
                </div>
            `;

            // eslint-disable-next-line no-undef
            const encodedData = btoa(encodeURIComponent(dwellingsTable));
            // eslint-disable-next-line no-undef
            localStorage.setItem('printDocument', encodedData);
            this.openInNewTab(`${locationOrigin}/print-document`);
        }
    }

    openInNewTab(url) {
        var win = window.open(url, '_blank');
        win.focus();
    }

    handleType(id, e) {
        this.setState(
            state => ({
                searchParams: (Object.assign(state.searchParams, {[id]: e}))
            })
        );
    }

    handleCurrency(id, currency) {
        const searchParams = this.state.searchParams;
        if (searchParams.currency === currency) {
            this.setState(state => ({searchParams: Object.assign(searchParams, {currency: ''})}));
        } else {
            this.setState(state => ({searchParams: Object.assign(searchParams, {currency: currency})}));
        }
    }

    handleSelect(e) {
        const values = map(e, subtype => subtype.value);
        if (values.length == 0) {
            this.setState(
                state => ({
                    searchParams: {...state.searchParams, subtype: undefined}
                })
            );
        } else {
            this.setState(
                state => ({
                    searchParams: {...state.searchParams, subtype: values}
                })
            );
        }
    }

    handlePlusClick(type, subtype) {
        const {searchParams} = this.state;
        switch(subtype) {
            case 'bedrooms':
                if (searchParams.spaces.bedrooms === undefined)
                    searchParams.spaces.bedrooms = 0;
                break;
            case 'closets':
                if (searchParams.spaces.closets === undefined)
                    searchParams.spaces.closets = 0;
                break;
            case 'rooms':
                if (searchParams.spaces.rooms === undefined)
                    searchParams.spaces.rooms = 0;
                break;
            case 'bathRoom':
                if (searchParams.spaces.bathRoom === undefined)
                    searchParams.spaces.bathRoom = 0;
                break;
            case 'toilette':
                if (searchParams.spaces.toilette === undefined)
                    searchParams.spaces.toilette = 0;
                break;
            case 'floors':
                if (searchParams.spaces.floors === undefined)
                    searchParams.spaces.floors = 0;
                break;
            case 'floor':
                if (searchParams.features.floor === undefined)
                    searchParams.features.floor = 0;
                break;
            case 'offices':
                if (searchParams.features.offices === undefined)
                    searchParams.features.offices = 0;
                break;
        }
        this.setState(
            state => ({
                searchParams: {
                    ...state.searchParams,
                    [type]: {...state.searchParams[type], [subtype]: (state.searchParams[type][subtype] + 1)}
                }
            })
        );
    }

    handleMinusClick(type, subtype) {
        if (this.state.searchParams[type][subtype] === 0) return;
        if (this.state.searchParams[type][subtype] > 1) {
            this.setState(
                state => ({
                    searchParams: {
                        ...state.searchParams,
                        [type]: {...state.searchParams[type], [subtype]: (state.searchParams[type][subtype] - 1)}
                    }
                })
            );
        } else {
            this.setState(
                state => ({
                    searchParams: {
                        ...state.searchParams,
                        [type]: {...state.searchParams[type], [subtype]: undefined}
                    }
                })
            );
        }
    }

    handleSwitch(e, type, subtype) {
        if (type === 'orderKeyByTitle') {
          if (e) {
            this.setState({[type]: 'asc', searchParams: {...this.state.searchParams, [type]: 'asc'}});
          } else {
            this.setState({[type]: false, searchParams: {...this.state.searchParams, [type]: undefined}});
          }
        } else {
          if (e) {
            this.setState(
              state => ({
                searchParams: {
                  ...state.searchParams,
                  [type]: {...state.searchParams[type], [subtype]: e}
                }
              })
            );
          } else {
            this.setState(
              state => ({
                searchParams: {
                  ...state.searchParams,
                  [type]: {...state.searchParams[type], [subtype]: undefined}
                }
              })
            );
          }
        }
    }

    handleChange({target: {id, value}}, type) {
        if (value === '') {
            const params = this.state.searchParams[id];
            delete params[type];
            this.setState(
                state => ({
                    searchParams: {...state.searchParams, [id]: params}
                })
            );
        } else {
            this.setState(
                state => ({
                    searchParams: {...state.searchParams, [id]: {...state.searchParams[id], [type]: value}}
                })
            );
        }
    }

    handleMultiFeatures(e, type, subtype) {
        this.setState(
            state => ({
                searchParams: {
                    ...state.searchParams,
                    [type]: {...state.searchParams[type], [subtype]: e}
                }
            })
        );
    }

    handleCheckboxBtnClick(value) {
        const spaces = this.state.searchParams.spaces ? this.state.searchParams.spaces : {};
        const bedRooms = spaces.bedrooms ? spaces.bedrooms : [];
        // eslint-disable-next-line lodash/prefer-lodash-method
        if (!bedRooms.includes(value)) {
            bedRooms.push(value);
        } else {
            const index = bedRooms.indexOf(value);
            if (index > -1) bedRooms.splice(index, 1);
        }
        if (bedRooms.length > 0) spaces.bedrooms = bedRooms;
        else delete spaces.bedrooms;

        this.setState(state => ({searchParams: {...state.searchParams, spaces}}));
    }

    isActiveBedroom(value) {
        const spaces = this.state.searchParams.spaces ? this.state.searchParams.spaces : {};
        const bedRooms = spaces.bedrooms ? spaces.bedrooms : [];
        return bedRooms.includes(value);
    }

    handleChangeOrderByDate({value}) {
      this.setState(
        state => ({
          searchParams: {...state.searchParams, orderKeyByDateOption: value}
        })
      );
    }

    newData() {
        this.setState({
            newData: true
        });
    }

    handleSearch(modal) {
        const page = {perPage: 30, pageNumber: 1};
        if (modal === 'orderByModal') {
            if (this.state.newData) {
                this.props.requestFindDwellings({...this.state.searchParams, page});
                this.setState({
                    newData: false
                });
            }
            this.setState({
                [modal]: !this.state[modal],
            });
        } else {
            this.props.requestFindDwellings({...this.state.searchParams, page});
            this.setState({
                [modal]: !this.state[modal]
            });
        }

        this.props.requestFindDwellings({...this.state.searchParams, page});
    }

    fetchMoreDwellings() {
        const {page} = this.state;
        page.pageNumber += 1;

        this.setState({
            page
        }, () => {
            this.props.requestSearchLoadMoreDwellings({...this.state.searchParams, page});
        });
    }

    handleSearchByKeyword(e) {
        if (e.keyCode === 13) {
            this.props.requestSearchDwellingsByKeyword({...this.state.searchParams});
        }
    }

    handleSearchBoxChange(e) {
        this.setState({
            searchParams: {
                ...this.state.searchParams,
                page: {pageNumber: 1, perPage: 30},
                searchKeyword: e.target.value
            }
        }, () => {
            if (!this.state.searchParams.searchKeyword)
                this.props.requestSearchDwellingsByKeyword({...this.state.searchParams});
        });
    }

    handleRefs(dwelling) {
        this.props.setMapRefs({
            lat: dwelling.address.latitude,
            lng: dwelling.address.altitude,
            dwellingId: dwelling._id
        });
    }

    myFavorite(dwellingId) {
        ['martillero', 'vendedor'].includes(this.props.userProfile.role) ?
            this.toggleFavorite(dwellingId) : this.handleFavorite(false, dwellingId, []);
    }

    async removeFavoriteFromClient(dwellingId) {
        await this.props.requestRemoveFavoriteFromClient({dwellingId: dwellingId, clientId: this.props.userProfile.client});
        this.props.requestUserProfile();
    }

    async handleFavorite(favoriteToClient, dwellingId, clientsOptions) {
        if (favoriteToClient) {
            if (clientsOptions.length > 0) {
                await this.props.requestFavoriteToClients(clientsOptions);
                this.showAlert('Favoritos del cliente editados!', 'success', {favoriteMode: 1}, false);
            }
        } else {
            const favorite = this.props.userProfile;
            favorite['dwelling_id'] = dwellingId;
            await this.props.requestAddFavorite(favorite);
            if (this.props.userProfile.favorite.includes(dwellingId))
                this.showAlert('Eliminado de tus favoritos', 'success', {favoriteMode: 0}, false);
            else
                this.showAlert('Agregado a tus favoritos', 'success', {favoriteMode: 0}, false);
        }
    }

    toggleFavorite(dwellingId) {
        this.state.modalFavorite ? this.setState({modalFavorite: !this.state.modalFavorite})
            : this.setState({dwellingId: dwellingId, modalFavorite: !this.state.modalFavorite});
    }

    showAlert(title, type, param, load = false) {
        let getAlert;
        if (load)
            getAlert = () => (
                <SweetAlert
                    type={type}
                    title={title}
                    onConfirm={() => this.loadWindow()} />
                );
        else
            getAlert = () => (
                <SweetAlert
                    type={type}
                    title={title}
                    onConfirm={() => this.hideAlert(param)} />
                );

        this.setState({alert: getAlert()});
    }

    hideAlert(param) {
        this.setState({alert: null});
        if (param && param.hasOwnProperty('favoriteMode')) {
            param.favoriteMode === 0 ? this.props.requestUserProfile() : this.props.requestSearchClients();
        }
    }

    loadWindow() {
        window.location.pathname = '/home';
    }

    openDetailViewInNewTab = (url, id) => {
        // eslint-disable-next-line no-undef
        // this.props.history.push(url) // NOTE: This was replaced with window.open to be able to open in new tab.
        if (!this.props.visitedDwellings.includes(id)) this.props.visitDwelling(id);
        window.open(url, '_blank');
        // this.props.userProfile !== 'anonymous' ? window.open(url, '_blank') : this.props.history.push(url);
    }

    toggleShare(e, dwelling) {
        e.stopPropagation();
        if (this.state.modalShare) this.setState({modalShare: !this.state.modalShare});
        else this.setState({dwelling, modalShare: !this.state.modalShare});
    }

    renderContent() {
        const {dwellings} = this.props;
        const favorites = this.props.userProfile && this.props.userProfile.hasOwnProperty('favorite') ? this.props.userProfile.favorite : [];
        const clientUser = this.props.userProfile && this.props.userProfile.role === 'cliente';
        const clientFavorites = this.props.userProfile && this.props.userProfile['client_favorite'] ? this.props.userProfile['client_favorite'] : [];

        const {searchParams} = this.state;
        let resetFlag = false;
        const addressTags = searchParams.address ? searchParams.address.map((tag, i) => (
            <Fragment key={"loc_tag" + i}>
                <span>
                    {tag.streetName} {tag.city}
                    <FontAwesome name="close"
                                 onClick={() => this.removeTag('loc', i)}/>
                </span>
            </Fragment>
        )) : '';
        if (addressTags !== '') resetFlag = true;
        const subtypeTags = searchParams.subtype ? searchParams.subtype.map((subtype, i) => (
            <Fragment key={"subtype_tag" + i}>
                <span>
                    {subtype}
                    <FontAwesome name="close"
                                 onClick={() => this.removeTag('subtype', i)}/>
                </span>
            </Fragment>
        )) : '';
        if (subtypeTags !== '') resetFlag = true;
        const currencyTag = searchParams.currency && searchParams.currency !== '' ?
            <Fragment key={"currency_tag"}>
                <span>
                    {`${searchParams.currency[0].toUpperCase()}${searchParams.currency.slice(1)}`}
                    <FontAwesome name="close" onClick={() => this.removeTag('currency', 0)} />
                </span>
            </Fragment>
            : '';

        let priceTags = [];
        if (searchParams.price.min !== undefined) {
            priceTags.push(
                <Fragment key={"price_tag_min"}>
                    <span>
                        {'Desde: '+ searchParams.price.min}
                        <FontAwesome name="close" onClick={() => this.removeTag('price', 'min')} />
                    </span>
                </Fragment>);
        }
        if (searchParams.price.max !== undefined) {
            priceTags.push(
                <Fragment key={"price_tag_max"}>
                    <span>
                        {'Hasta: '+ searchParams.price.max}
                        <FontAwesome name="close" onClick={() => this.removeTag('price', 'max')} />
                    </span>
                </Fragment>);
        }
        if (priceTags.length > 0) resetFlag = true;
        const agencyDwellingsTags = searchParams.agencyDwellings ?
            <Fragment key={"agency_dwellings_tag"}>
                <span>
                    De mi inmob.
                    <FontAwesome name="close" onClick={() => this.removeTag('agency_dwelling', 0)} />
                </span>
            </Fragment> : '';
        if (agencyDwellingsTags !== '') resetFlag = true;
        const orderKeyPriceLabels = {
            'cheapest': 'Menor Precio',
            'expensive': 'Mayor Precio',
            'recentPriceModified': 'Precio Editado'
        };
        const orderPriceTags = searchParams.orderKeyByPrice ?
            <Fragment key={"order_price_tag"}>
                <span>
                    {orderKeyPriceLabels[searchParams.orderKeyByPrice]}
                    <FontAwesome name="close" onClick={() => this.removeTag('order_price', searchParams.orderKeyByPrice)} />
                </span>
            </Fragment> : '';
        let dateOption = newestOptions[0].label
        if (searchParams.orderKeyByDateOption) {
            dateOption = newestOptions.find(option => option.value === searchParams.orderKeyByDateOption).label
        }
        const orderDateTags = searchParams.orderKeyByDate ?
            <Fragment key={"order_date_tag"}>
                <span>
                    {searchParams.orderKeyByDate === 'newest' ? `Más recientes: ${dateOption}` : 'Más antiguas'}
                    <FontAwesome name="close" onClick={() => this.removeTag('order_date', searchParams.orderKeyByDate)} />
                </span>
            </Fragment> : '';
        if (orderDateTags !== '') resetFlag = true;
        let orderTitleTag = searchParams.orderKeyByTitle ?
            <Fragment key="order_title_tag">
                <span>
                    {searchParams.orderKeyByTitle === 'asc' ? 'Ordenar Por Calle: ascendente' : 'Ordenar Por Calle: descendente'}
                    <FontAwesome name="close" onClick={() => this.removeTag('order_title', searchParams.orderKeyByTitle)} />
                </span>
            </Fragment> : '';
        if (orderTitleTag !== '') resetFlag = true;
        const legalTags = searchParams.legal ? Object.keys(searchParams.legal).map((legal, i) => (
            <Fragment key={"legal_tag" + i}>
                <span>
                    {legal === 'prof' ? 'Apto Profesional' : 'Apto Banco'}
                    <FontAwesome name="close" onClick={() => this.removeTag('legal', legal)} />
                </span>
            </Fragment>
        )) : '';
        if (legalTags.length > 0) resetFlag = true;
        const serviceTranslation = {
            'electricity': 'Electricidad',
            'pavement': 'Asfalto',
            'phone': 'Teléfono',
            'water': 'Agua',
            'gas': 'Gas',
            'sewer': 'Cloacas',
            'cableTv': 'Cable',
            'security': 'Seguridad'
        }
        const serviceTags = searchParams.services ? Object.keys(searchParams.services).map((service, i) => (
            <Fragment key={"service_tag" + i}>
                <span>
                    {serviceTranslation[service]}
                    <FontAwesome name="close" onClick={() => this.removeTag('service', service)} />
                </span>
            </Fragment>
        )) : '';
        if (serviceTags.length > 0) resetFlag = true;
        const spacesTranslation = {
            'bedrooms': 'dormitorios',
            'closets': 'placard',
            'bathRoom': 'baños',
            'toilette': 'toilettes',
            'floors': 'pisos',
            'living': 'living',
            'livingDining': 'liv/com',
            'diningRoom': 'comedor',
            'kitchen': 'cocina',
            'kitchenDining': 'coc/com',
            'terrace': 'terraza',
            'balcony': 'balcón',
            'backYard': 'patio',
            'garden': 'jardín',
            'swimmingPool': 'piscina',
            'barbecue': 'quincho',
            'storage': 'baulera',
            'garage': 'garage',
            'laundryRoom': 'lavadero'
        }
        const spaceTags = searchParams.spaces ? Object.keys(searchParams.spaces).map((space, i) => {
            if (space === 'bedrooms') {
                return searchParams.spaces[space].map(bedRoom => {
                    let label = '';
                    if (bedRoom === 0) label = `monoambiente ${spacesTranslation[space]}`;
                    else if (bedRoom === 4) label = `+4 ${spacesTranslation[space]}`;
                    else label = `${bedRoom.toString()} ${spacesTranslation[space]}`;
                    return (
                        <Fragment key={"bedrooms_tag_" + bedRoom.toString()}>
                            <span>
                                {label}
                                <FontAwesome name="close" onClick={() => this.removeTag('space', 'bedrooms', bedRoom)} />
                            </span>
                        </Fragment>
                    );
                });
            } else {
                return (
                    <Fragment key={"space_tag" + i}>
                        <span>
                            {typeof searchParams.spaces[space] === 'number' ? `${searchParams.spaces[space]} ${spacesTranslation[space]}` : spacesTranslation[space]}
                            <FontAwesome name="close" onClick={() => this.removeTag('space', space)} />
                        </span>
                    </Fragment>
                );
            }
        }) : '';
        if (spaceTags.length > 0) resetFlag = true;
        const featuresTranslation = {
            'lotSurface': 'Sup. Lot.',
            'coveredSurface': 'Sup. Cub.',
            'totalSurface': 'Sup. Semic.',
            'floor': 'Piso',
            'furnished': 'Amoblado',
            'depser': 'Dep. ser',
            'sum': 'SUM',
            'apartments': 'Deptos.',
            'refurbished': 'Fue refac.'
        }
        let featureTags = [];
        if (searchParams.features) {
            const features = searchParams.features;
            Object.keys(features).forEach((key, i) => {
                const type = typeof features[key];
                if (type === 'boolean' || type === 'number' || type === 'string') {
                    let text = '';
                    if (type === 'boolean') text = featuresTranslation[key];
                    else if (type === 'number') text = `${features[key]} ${featuresTranslation[key]}`;
                    else {
                        if (key === 'location' || key === 'status') text = features[key];
                        else text = `${features[key]} ${featuresTranslation[key]}`;
                    }
                    featureTags.push(
                        <Fragment key={"feature_tag" + i}>
                            <span>
                                {text}
                                <FontAwesome name="close" onClick={() => this.removeTag('feature', key)}/>
                            </span>
                        </Fragment>);
                } else {
                    features[key].forEach((feature, j) => {
                        featureTags.push(
                            <Fragment key={"feature_tag" + i + "_" + j}>
                                <span>
                                    {feature.label}
                                    <FontAwesome name="close" onClick={() => this.removeTag('feature', key, j)}/>
                                </span>
                            </Fragment>);
                    });
                }
            });
        }
        if (featureTags.length > 0) resetFlag = true;

        const resetTag = resetFlag ? (
            <Fragment key="reset_tag">
                <span onClick={() => this.removeTag('reset', 0)} style={{color: '#ff0000', cursor: 'pointer'}}>
                    Eliminar Filtros
                </span>
            </Fragment>) : '';

        return (
            (this.props.loading ?
                <div className="overlay-spinner">
                    <MoonLoader/>
                </div>
                :
                <aside className="aside-menu">
                    <div className="tab-content b-column">
                        {
                            this.props.userProfile !== 'anonymous' ?
                                <div className="inner-b-column">
                                    <div className="prop">
                                        <div className="inner-tab-content-fixed">
                                            <div className="prop-header">
                                                <div className="prop-search-btns">
                                                    <ButtonGroup className="btn-group-justified">
                                                        <Button style={{borderLeft: '0'}} onClick={() => this.toggleModals('searchModal')}>
                                                            Estoy Buscando
                                                        </Button>
                                                        <Button onClick={() => this.toggleModals('spacesModal')}>
                                                            Ambientes
                                                        </Button>
                                                        <Button
                                                            onClick={() => this.toggleModals('characteristicsModal')}
                                                        >Características
                                                        </Button>
                                                        <Button onClick={() => this.toggleModals('servlegModal')}>
                                                            Serv./Leg.
                                                        </Button>
                                                    </ButtonGroup>
                                                </div>
                                                <div className="head">
                                                    <Row>
                                                        <Col xs={8} className="head-title">
                                                            <h3>
                                                                <b>{this.props.totalCount}</b> {searchParams.publicationType ? `en ${searchParams.publicationType}` : 'Propiedades'}
                                                            </h3>
                                                        </Col>
                                                        <Col xs={4} className="head-icons justify-content-end">
                                                            {(['vendedor', 'martillero'].includes(this.props.userProfile.role)) &&
                                                            <span style={{paddingRight: '19px'}} onClick={() => this.toggleSidebarView()}>
                                                                <FontAwesome size="lg" name="bars"/>
                                                            </span>
                                                            }
                                                            {(['vendedor', 'martillero'].includes(this.props.userProfile.role)) &&
                                                            this.state.compactView && (this.props.savingFile ? (
                                                                <div className="print-loading">
                                                                    <BeatLoader
                                                                        color="#fbad1c"
                                                                        size={5}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <span style={{paddingRight: '15px'}} onClick={() => this.handlePrintPage()} disabled={this.props.savingFile}>
                                                                    <FontAwesome size="lg" name="print"/>
                                                                </span>
                                                            ))}
                                                            <span onClick={() => this.toggleModals('orderByModal')}>
                                                                <SortIcon className="fa" style={{transform: 'rotate(90deg)'}}/>
                                                            </span>
                                                        </Col>
                                                    </Row>
                                                    <div className="tags">
                                                        {addressTags}
                                                        {subtypeTags}
                                                        {currencyTag}
                                                        {priceTags}
                                                        {agencyDwellingsTags}
                                                        {orderPriceTags}
                                                        {orderDateTags}
                                                        {orderTitleTag}
                                                        {legalTags}
                                                        {serviceTags}
                                                        {spaceTags}
                                                        {featureTags}
                                                        {resetTag}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="inner-tab-content-scroll" id="scrollable-wrapper">
                                            <InfiniteScroll
                                                dataLength={dwellings.length}
                                                next={() => this.fetchMoreDwellings()}
                                                hasMore={dwellings.length < this.props.totalCount}
                                                scrollableTarget="scrollable-wrapper"
                                                loader={
                                                    <div style={{textAlign: 'center', padding: '10px'}}>
                                                        <BeatLoader
                                                            color="#fbad1c"
                                                            loading={this.props.loadingFetchMoreDwellings && !this.props.loadingDwellingsByKeyword}
                                                        />
                                                    </div>
                                                }
                                            >
                                                {this.state.compactView ?
                                                    [
                                                        <Input
                                                            key={'compact_search_input'}
                                                            style={{
                                                                position: 'fixed',
                                                                fontStyle: 'italic',
                                                                borderRadius: '0',
                                                                borderTop: '2px solid #fbad1c',
                                                                zIndex: '1',
                                                            }}
                                                            value={this.state.searchParams.searchKeyword}
                                                            className="search-box"
                                                            onChange={e => this.handleSearchBoxChange(e)}
                                                            onKeyDown={e => this.handleSearchByKeyword(e)}
                                                            placeholder="Buscar por Calle, Localidad, Precio o Código"
                                                        />,
                                                        <Table key={'compact_table'} className="print-table" size="sm" responsive style={{marginTop: '27px'}}>
                                                            {this.props.loadingDwellingsByKeyword ?
                                                                <tbody>
                                                                    <tr>
                                                                        <td className="text-center py-5">
                                                                            <BeatLoader
                                                                                color="#fbad1c"
                                                                                loading={this.props.loadingDwellingsByKeyword}
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                                :
                                                                <tbody>
                                                                    {filter(dwellings, dwelling =>
                                                                        includes(
                                                                            lowerCase(dwelling.subtype), lowerCase(this.state.filter)) ||
                                                                        includes(
                                                                            lowerCase(dwelling.address.streetName), lowerCase(this.state.filter)) ||
                                                                        includes(
                                                                            dwelling.address.price, this.state.filter) ||
                                                                        includes(
                                                                            dwelling.siocId, this.state.filter) ||
                                                                        !this.state.filter).map((dwelling, index) => {
                                                                        const title = DwellingTitle.get(dwelling, PLACE_OF_USAGE);

                                                                        return (
                                                                            <tr key={dwelling._id}
                                                                                onClick={() => this.openDetailViewInNewTab(`/${dwelling.siocId}`, dwelling._id)}
                                                                                style={this.props.visitedDwellings.includes(dwelling._id) ? visitedDwellingStyles : null}>
                                                                                <th scope="row">
                                                                                    <FontAwesome name="map-marker"
                                                                                    onClick={e => { e.stopPropagation(); this.handleRefs(dwelling);}}/>
                                                                                </th>
                                                                                <th>
                                                                                    <FontAwesome name="share-alt" onClick={e => this.toggleShare(e, dwelling)} />
                                                                                </th>
                                                                                <td><b>{title}</b></td>
                                                                                {dwelling.price ?
                                                                                    <td><em>{dwelling.currency && `${dwelling.currency}` || `$`} {dwelling.price}</em></td>
                                                                                    :
                                                                                    <td><em>Consulte</em></td>
                                                                                }
                                                                                <td>#{dwelling.siocId}</td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            }
                                                        </Table>,
                                                    ]
                                                    :
                                                    [
                                                        (dwellings.map((dwelling, index) => {
                                                            const imageUrl = previewImage(dwelling, ['/upload/', '/upload/w_400,q_auto:eco,f_auto/'], 'https://res.cloudinary.com/sioc/image/upload/w_335,q_auto:eco,f_auto/v1525712940/epnvioppkpvwye1qs66z.jpg');

                                                            const title = DwellingTitle.get(dwelling, PLACE_OF_USAGE);

                                                            let marginShare = {marginRight: '40px', color: 'white'}, marginHeart = {};
                                                            if (clientUser && clientFavorites.includes(dwelling['_id'])) {
                                                                marginShare = {marginRight: '82px', color: 'white'};
                                                                marginHeart = {marginRight: '40px'};
                                                            }

                                                            return (
                                                                <div
                                                                    className="prop-detail"
                                                                    style={this.props.visitedDwellings.includes(dwelling._id) ? visitedDwellingStyles : null}
                                                                    key={dwelling._id}
                                                                    onClick={() => this.openDetailViewInNewTab(`/${dwelling.siocId}`, dwelling._id)}
                                                                >
                                                                    <div className="prop-detail-overlay" />
                                                                    <div className="preview-img" style={{
                                                                        width: '100%',
                                                                        height: '200px',
                                                                        backgroundImage: 'url("' + imageUrl + '")'
                                                                    }} />
                                                                    <div className="prop-text">
                                                                        <span>
                                                                            {title}
                                                                        </span>
                                                                        <Row>
                                                                            <Col sm={12} className="p-0">
                                                                                <div className="pull-left price">
                                                                                    {dwelling.price
                                                                                        ?
                                                                                        <p>{dwelling.currency && `${dwelling.currency}` || `$`}<b>{dwelling.price}</b>
                                                                                        </p>
                                                                                        : <p>Consulte</p>}
                                                                                    {dwelling.legal.bank === true &&
                                                                                    <FontAwesome name="bank"/>}
                                                                                </div>
                                                                                <div className="pull-right">
                                                                                    <p>#{dwelling.siocId}</p>
                                                                                </div>
                                                                            </Col>
                                                                        </Row>
                                                                    </div>
                                                                    <div className="prop-detail-btns">
                                                                        <Button
                                                                            className="goto"
                                                                            onClick={e => {
                                                                                e.stopPropagation();
                                                                                this.handleRefs(dwelling);
                                                                            }}
                                                                        >
                                                                            <FontAwesome name="map-marker"/> {' '}
                                                                            <small style={{
                                                                                color: '#fff',
                                                                                textShadow: 'rgba(0, 0, 0, 0.7) 1px 1px',
                                                                                fontWeight: '600' }}>
                                                                                {dwelling.address.city}
                                                                            </small>
                                                                        </Button>
                                                                        <Button className="like" style={marginShare}
                                                                                onClick={e => this.toggleShare(e, dwelling)}>
                                                                            <FaShare />
                                                                        </Button>
                                                                        <Button
                                                                            onClick={e => {
                                                                                e.stopPropagation();
                                                                                this.myFavorite(dwelling['_id']);
                                                                            }}
                                                                            className="like"
                                                                            style={marginHeart}
                                                                        >
                                                                            {
                                                                                favorites.includes(dwelling['_id']) ?
                                                                                    <FontAwesome name="heart" size="lg" style={{color: '#fbad1c'}}/>
                                                                                    :
                                                                                    <FontAwesome name="heart" size="lg" style={{color: 'white'}}/>
                                                                            }
                                                                        </Button>
                                                                        { clientUser && clientFavorites.includes(dwelling['_id']) &&
                                                                        <Button
                                                                            onClick={e => {
                                                                                e.stopPropagation();
                                                                                this.removeFavoriteFromClient(dwelling['_id']);
                                                                              }}
                                                                            className="like"
                                                                        >
                                                                            <FontAwesome name="times" size="lg" style={{color: '#fbad1c'}} />
                                                                        </Button>
                                                                        }
                                                                    </div>
                                                                </div>
                                                            );
                                                        })),
                                                    ]
                                                }
                                            </InfiniteScroll>
                                        </div>
                                    </div>
                                </div>
                                :
                                <div className="inner-b-column">
                                    <div className="prop">
                                        <div className="inner-tab-content-fixed">
                                            <div className="prop-header">
                                                <div className="prop-search-btns">
                                                    <ButtonGroup className="btn-group-justified">
                                                        <Button style={{borderLeft: '0'}} onClick={() => this.toggleModals('searchModal')}>
                                                            Estoy Buscando
                                                        </Button>
                                                        <Button onClick={() => this.toggleModals('spacesModal')}>
                                                            Ambientes
                                                        </Button>
                                                        <Button
                                                            onClick={() => this.toggleModals('characteristicsModal')}
                                                        >Características
                                                        </Button>
                                                        <Button onClick={() => this.toggleModals('servlegModal')}>
                                                            Serv./Leg.
                                                        </Button>
                                                    </ButtonGroup>
                                                </div>
                                                <div className="head">
                                                    <Row>
                                                        <Col xs={8} className="head-title">
                                                            <h3>
                                                                <b>{this.props.totalCount}</b> {searchParams.publicationType ? `en ${searchParams.publicationType}` : 'Propiedades'}
                                                            </h3>
                                                        </Col>
                                                        <Col xs={4} className="head-icons justify-content-end">
                                                            <span onClick={() => this.toggleModals('orderByModal')}>
                                                                <SortIcon className="fa" style={{transform: 'rotate(90deg)'}}/>
                                                            </span>
                                                        </Col>
                                                    </Row>
                                                    <div className="tags">
                                                        {addressTags}
                                                        {subtypeTags}
                                                        {currencyTag}
                                                        {priceTags}
                                                        {agencyDwellingsTags}
                                                        {orderPriceTags}
                                                        {orderDateTags}
                                                        {orderTitleTag}
                                                        {legalTags}
                                                        {serviceTags}
                                                        {spaceTags}
                                                        {featureTags}
                                                        {resetTag}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="inner-tab-content-scroll" id="scrollable-wrapper">
                                            <InfiniteScroll
                                                dataLength={dwellings.length}
                                                next={() => this.fetchMoreDwellings()}
                                                hasMore={dwellings.length < this.props.totalCount}
                                                scrollableTarget="scrollable-wrapper"
                                                loader={
                                                    <div style={{textAlign: 'center', padding: '10px'}}>
                                                        <BeatLoader
                                                            color="#fbad1c"
                                                            loading={this.props.loadingFetchMoreDwellings}
                                                        />
                                                    </div>
                                                }
                                            >
                                                {map(this.props.dwellings, (dwelling, index) => {
                                                    const imageUrl = previewImage(dwelling, ['/upload/', '/upload/w_400,q_auto:eco,f_auto/'], 'https://res.cloudinary.com/sioc/image/upload/w_335,q_auto:eco,f_auto/v1525712940/epnvioppkpvwye1qs66z.jpg');
                                                    const title = DwellingTitle.get(dwelling, PLACE_OF_USAGE);

                                                    return (
                                                        <div
                                                            className="prop-detail"
                                                            style={this.props.visitedDwellings.includes(dwelling._id) ? visitedDwellingStyles : null}
                                                            key={dwelling._id}
                                                            onClick={() => this.openDetailViewInNewTab(`/${dwelling.siocId}`, dwelling._id)}
                                                        >
                                                            <div className="preview-img" style={{
                                                                width: '100%',
                                                                height: '200px',
                                                                backgroundImage: 'url("' + imageUrl + '")'
                                                            }} />
                                                            <div className="prop-text">
                                                                <span>
                                                                    {title}
                                                                </span>
                                                                <Row>
                                                                    <Col sm={12} style={{padding: '0'}}>
                                                                        <div className="pull-left price">
                                                                            {dwelling.price
                                                                                ?
                                                                                <p>{dwelling.currency && `${dwelling.currency}` || `$`}<b>{dwelling.price}</b>
                                                                                </p>
                                                                                : <p>Consulte</p>}
                                                                            {dwelling.legal.bank === true &&
                                                                            <FontAwesome name="bank"/>}
                                                                        </div>
                                                                        <div className="pull-right">
                                                                            <p>#{dwelling.siocId}</p>
                                                                        </div>
                                                                    </Col>
                                                                </Row>
                                                            </div>
                                                            <div className="prop-detail-btns">
                                                                <Button
                                                                    className="goto"
                                                                    onClick={e => {
                                                                        e.stopPropagation();
                                                                        this.handleRefs(dwelling);
                                                                    }}
                                                                >
                                                                    <FontAwesome name="map-marker"/>
                                                                    <small
                                                                        style={{color: '#fff'}}> {dwelling.address.city} </small>
                                                                </Button>
                                                                <Button className="like" style={{color: 'white'}}
                                                                        onClick={e => this.toggleShare(e, dwelling)}>
                                                                    <FaShare />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </InfiniteScroll>
                                        </div>
                                    </div>
                                </div>
                        }
                    </div>
                </aside>
            )
        );
    }

    render() {
        let selectSubtype;
        const {searchParams} = this.state;
        if (searchParams.spaces === undefined) {
            searchParams.spaces = {};
        }
        if (searchParams.features === undefined) {
            searchParams.features = {};
        }
        if (searchParams.services === undefined) {
            searchParams.services = {};
        }
        if (searchParams.legal === undefined) {
            searchParams.legal = {};
        }
        if (searchParams.price === undefined) {
            searchParams.price = {};
        }
        if (searchParams.subtype !== undefined) {
            selectSubtype = (searchParams.subtype).map(a => ({value: a, label: a}));
        }

        let dateOption = newestOptions[0]
        if (searchParams.orderKeyByDateOption) {
          dateOption = newestOptions.find(option => option.value === searchParams.orderKeyByDateOption);
        }
        const isOrderKeyByTitle = !!searchParams.orderKeyByTitle;
        const orderKeyByTitle = isOrderKeyByTitle ? searchParams.orderKeyByTitle : null;

        return (
            <Fragment>
                {this.props.dwellings && this.renderContent()}
                <Modal
                    isOpen={this.state.searchModal}
                    toggle={() => this.toggleModals('searchModal')}
                    className="overlay-filters"
                >
                    <ModalHeader toggle={() => this.toggleModals('searchModal')}>
                        <Col>Estoy Buscando</Col>
                    </ModalHeader>
                    <ModalBody>
                        <Row className="mt-4">
                            <Col sm={12}>
                                <FormGroup>
                                    <ButtonGroup className="btn-justified">
                                        <Button
                                            outline
                                            onClick={() => this.handleType('publicationType', 'Venta')}
                                            active={searchParams.publicationType === 'Venta'}
                                        >
                                            VENTA
                                        </Button>
                                        <Button
                                            outline
                                            onClick={() => this.handleType('publicationType', 'Alquiler')}
                                            active={searchParams.publicationType === 'Alquiler'}
                                        >ALQUILER
                                        </Button>
                                    </ButtonGroup>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={12}>
                                <FormGroup>
                                    <MultipleSearchBox
                                        onChange={e => this.handleAddress(e)}
                                        value={this.props.searchParams ? this.props.searchParams.selectedLocations : []}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm="12">
                                <Select
                                    isMulti
                                    value={selectSubtype ? selectSubtype : null}
                                    options={groupedOptions}
                                    placeholder="Seleccione Tipo de Propiedad"
                                    formatGroupLabel={formatGroupLabel}
                                    onChange={e => this.handleSelect(e)}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-5">
                            <Col sm="12" className="mb-2">
                                <h4>Que precio estás buscando?</h4>
                            </Col>
                            <Col sm="2">
                                <FormGroup>
                                    <ButtonGroup className="btn-justified">
                                        <Button
                                            outline
                                            onClick={() => this.handleCurrency('currency', 'pesos')}
                                            active={searchParams.currency === 'pesos'}
                                        >Pesos
                                        </Button>
                                        <Button
                                            outline
                                            onClick={() => this.handleCurrency('currency', 'dolares')}
                                            active={searchParams.currency === 'dolares'}
                                        >Dolares
                                        </Button>
                                    </ButtonGroup>
                                </FormGroup>
                            </Col>
                            <Col sm={5}>
                                <FormGroup>
                                    <Input
                                        style={{fontWeight: 'bold'}}
                                        type="number"
                                        placeholder="Desde"
                                        id="price"
                                        value={searchParams.price.min ? searchParams.price.min : ''}
                                        onChange={e => this.handleChange(e, 'min')}
                                    />
                                </FormGroup>
                            </Col>
                            <Col sm={5}>
                                <FormGroup>
                                    <Input
                                        style={{fontWeight: 'bold'}}
                                        type="number"
                                        placeholder="Hasta"
                                        id="price"
                                        value={searchParams.price.max ? searchParams.price.max : ''}
                                        onChange={e => this.handleChange(e, 'max')}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        {(this.props.userProfile) && (this.props.userProfile.role === 'vendedor' || this.props.userProfile.role === 'martillero') &&
                        <Row className="mb-5">
                            <Col sm={12}>
                                <h4>Filtro para inmobiliarias</h4>
                                <ButtonGroup className="d-flex">
                                    <Button
                                        size="lg"
                                        outline
                                        onClick={
                                            () => {
                                                this.handleType('agencyDwellings', true);
                                                this.newData();
                                            }
                                        }
                                        active={searchParams.agencyDwellings === true}
                                    >Mostrar sólo de mi inmobiliaria
                                    </Button>
                                    <Button
                                        size="lg"
                                        outline
                                        onClick={
                                            () => {
                                                this.handleType('agencyDwellings', false);
                                                this.newData();
                                            }
                                        }
                                        active={searchParams.agencyDwellings === false}
                                    >De todo el SIOC
                                    </Button>
                                </ButtonGroup>
                            </Col>
                        </Row>}
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            size="lg"
                            onClick={() => this.handleSearch('searchModal')}
                            className="btn-submit-search"
                        ><FontAwesome name="check-square-o" /> Aplicar Filtros
                        </Button>{' '}
                    </ModalFooter>
                </Modal>
                <Modal
                    isOpen={this.state.spacesModal}
                    toggle={() => this.toggleModals('spacesModal')}
                    className="overlay-filters"
                >
                    <ModalHeader toggle={() => this.toggleModals('spacesModal')}>
                        <Col>Ambientes</Col>
                    </ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col xs={12} className="mb-4">
                                <Label>Dormitorios</Label>
                                <ButtonGroup>
                                    <Button size="lg" outline onClick={() => this.handleCheckboxBtnClick(0)} active={this.isActiveBedroom(0)}>Monoamb.</Button>
                                    <Button size="lg" outline onClick={() => this.handleCheckboxBtnClick(1)} active={this.isActiveBedroom(1)}>1 hab.</Button>
                                    <Button size="lg" outline onClick={() => this.handleCheckboxBtnClick(2)} active={this.isActiveBedroom(2)}>2 hab.</Button>
                                    <Button size="lg" outline onClick={() => this.handleCheckboxBtnClick(3)} active={this.isActiveBedroom(3)}>3 hab.</Button>
                                    <Button size="lg" outline onClick={() => this.handleCheckboxBtnClick(4)} active={this.isActiveBedroom(4)}>+4 hab.</Button>
                                </ButtonGroup>
                            </Col>
                            <Col sm={2} xs={6}>
                                <Label>Placard</Label>
                                <InputGroup>
                                    <InputGroupAddon addonType="prepend">
                                        <Button
                                            color="light"
                                            onClick={() => this.handleMinusClick('spaces', 'closets')}
                                        >
                                            <FontAwesome name="minus"/>
                                        </Button>
                                    </InputGroupAddon>
                                    <Input
                                        disabled
                                        value={searchParams.spaces.closets ? searchParams.spaces.closets : 0}
                                    />
                                    <InputGroupAddon addonType="prepend">
                                        <Button
                                            color="light"
                                            onClick={() => this.handlePlusClick('spaces', 'closets')}
                                        >
                                            <FontAwesome name="plus"/>
                                        </Button>
                                    </InputGroupAddon>
                                </InputGroup>
                            </Col>
                            {/* <Col sm={2} xs={4}>
                                <Label>Ambientes</Label>
                                <InputGroup>
                                    <InputGroupAddon addonType="prepend">
                                        <Button
                                            color="light"
                                            onClick={() => this.handleMinusClick('spaces', 'rooms')}
                                        >
                                            <FontAwesome name="minus"/>
                                        </Button>
                                    </InputGroupAddon>
                                    <Input
                                        disabled
                                        value={searchParams.spaces.rooms ? searchParams.spaces.rooms : 0}
                                    />
                                    <InputGroupAddon addonType="prepend">
                                        <Button
                                            color="light"
                                            onClick={() => this.handlePlusClick('spaces', 'rooms')}
                                        >
                                            <FontAwesome name="plus"/>
                                        </Button>
                                    </InputGroupAddon>
                                </InputGroup>
                            </Col> */}
                            <Col sm={2} xs={6}>
                                <Label>Baños</Label>
                                <InputGroup>
                                    <InputGroupAddon addonType="prepend">
                                        <Button
                                            color="light"
                                            onClick={() => this.handleMinusClick('spaces', 'bathRoom')}
                                        >
                                            <FontAwesome name="minus"/>
                                        </Button>
                                    </InputGroupAddon>
                                    <Input
                                        disabled
                                        value={searchParams.spaces.bathRoom ? searchParams.spaces.bathRoom : 0}
                                    />
                                    <InputGroupAddon addonType="prepend">
                                        <Button
                                            color="light"
                                            onClick={() => this.handlePlusClick('spaces', 'bathRoom')}
                                        >
                                            <FontAwesome name="plus"/>
                                        </Button>
                                    </InputGroupAddon>
                                </InputGroup>
                            </Col>
                            <Col sm={2} xs={6}>
                                <Label>Toilette</Label>
                                <InputGroup>
                                    <InputGroupAddon addonType="prepend">
                                        <Button
                                            color="light"
                                            onClick={() => this.handleMinusClick('spaces', 'toilette')}
                                        >
                                            <FontAwesome name="minus"/>
                                        </Button>
                                    </InputGroupAddon>
                                    <Input
                                        disabled
                                        value={searchParams.spaces.toilette ? searchParams.spaces.toilette : 0}
                                    />
                                    <InputGroupAddon addonType="append">
                                        <Button
                                            color="light"
                                            onClick={() => this.handlePlusClick('spaces', 'toilette')}
                                        >
                                            <FontAwesome name="plus"/>
                                        </Button>
                                    </InputGroupAddon>
                                </InputGroup>
                            </Col>
                            <Col sm={2} xs={6}>
                                <Label>Plantas</Label>
                                <InputGroup>
                                    <InputGroupAddon addonType="prepend">
                                        <Button
                                            color="light"
                                            onClick={() => this.handleMinusClick('spaces', 'floors')}
                                        >
                                            <FontAwesome name="minus"/>
                                        </Button>
                                    </InputGroupAddon>
                                    <Input
                                        disabled
                                        value={searchParams.spaces.floors ? searchParams.spaces.floors : 0}
                                    />
                                    <InputGroupAddon addonType="append">
                                        <Button
                                            color="light"
                                            onClick={() => this.handlePlusClick('spaces', 'floors')}
                                        >
                                            <FontAwesome name="plus"/>
                                        </Button>
                                    </InputGroupAddon>
                                </InputGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={2} xs={4}>
                                <Label>Living </Label>
                                <Switch
                                    onChange={e => this.handleSwitch(e, 'spaces', 'living')}
                                    checked={searchParams.spaces.living ? searchParams.spaces.living : false}
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
                            <Col sm={2} xs={4}>
                                <Label>Liv/Com</Label>
                                <Switch
                                    onChange={e => this.handleSwitch(e, 'spaces', 'livingDining')}
                                    checked={searchParams.spaces.livingDining
                                        ? searchParams.spaces.livingDining
                                        : false}
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
                            <Col sm={2} xs={4}>
                                <Label>Comedor</Label>
                                <Switch
                                    onChange={e => this.handleSwitch(e, 'spaces', 'diningRoom')}
                                    checked={searchParams.spaces.diningRoom
                                        ? searchParams.spaces.diningRoom
                                        : false}
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
                            <Col sm={2} xs={4}>
                                <Label>Cocina</Label>
                                <Switch
                                    onChange={e => this.handleSwitch(e, 'spaces', 'kitchen')}
                                    checked={searchParams.spaces.kitchen ? searchParams.spaces.kitchen : false}
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
                            <Col sm={2} xs={4}>
                                <Label>Coc/Comedor</Label>
                                <Switch
                                    onChange={e => this.handleSwitch(e, 'spaces', 'kitchenDining')}
                                    checked={searchParams.spaces.kitchenDining
                                        ? searchParams.spaces.kitchenDining
                                        : false}
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
                            <Col sm={2} xs={4}>
                                <Label>Terraza</Label>
                                <Switch
                                    onChange={e => this.handleSwitch(e, 'spaces', 'terrace')}
                                    checked={searchParams.spaces.terrace ? searchParams.spaces.terrace : false}
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
                            <Col sm={2} xs={4}>
                                <Label>Balcón</Label>
                                <Switch
                                    onChange={e => this.handleSwitch(e, 'spaces', 'balcony')}
                                    checked={searchParams.spaces.balcony ? searchParams.spaces.balcony : false}
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
                            <Col sm={2} xs={4}>
                                <Label>Patio</Label>
                                <Switch
                                    onChange={e => this.handleSwitch(e, 'spaces', 'backYard')}
                                    checked={searchParams.spaces.backYard ? searchParams.spaces.backYard : false}
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
                            <Col sm={2} xs={4}>
                                <Label>Jardín</Label>
                                <Switch
                                    onChange={e => this.handleSwitch(e, 'spaces', 'garden')}
                                    checked={searchParams.spaces.garden ? searchParams.spaces.garden : false}
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
                            <Col sm={2} xs={4}>
                                <Label>Piscinas</Label>
                                <Switch
                                    onChange={e => this.handleSwitch(e, 'spaces', 'swimmingPool')}
                                    checked={searchParams.spaces.swimmingPool
                                        ? searchParams.spaces.swimmingPool
                                        : false}
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
                            <Col sm={2} xs={4}>
                                <Label>Quincho</Label>
                                <Switch
                                    onChange={e => this.handleSwitch(e, 'spaces', 'barbecue')}
                                    checked={searchParams.spaces.barbecue ? searchParams.spaces.barbecue : false}
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
                            <Col sm={2} xs={4}>
                                <Label>Baulera</Label>
                                <Switch
                                    onChange={e => this.handleSwitch(e, 'spaces', 'storage')}
                                    checked={searchParams.spaces.storage ? searchParams.spaces.storage : false}
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
                            <Col sm={2} xs={4}>
                                <FormGroup controlId="spaces">
                                    <Label>Garage</Label>
                                    <Switch
                                        onChange={e => this.handleSwitch(e, 'spaces', 'garage')}
                                        checked={searchParams.spaces.garage ? searchParams.spaces.garage : false}
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
                                </FormGroup>
                            </Col>
                            <Col sm={2} xs={4}>
                                <FormGroup controlId="spaces">
                                    <Label>Lavadero</Label>
                                    <Switch
                                        onChange={e => this.handleSwitch(e, 'spaces', 'laundryRoom')}
                                        checked={searchParams.spaces.laundryRoom ? searchParams.spaces.laundryRoom : false}
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
                                </FormGroup>
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter className="text-xs-center">
                        <Button
                            size="lg"
                            onClick={() => this.handleSearch('spacesModal')}
                            className="btn-submit-search"
                        ><FontAwesome name="check-square-o" /> Aplicar Filtros
                        </Button>{' '}
                    </ModalFooter>
                </Modal>
                <Modal
                    isOpen={this.state.characteristicsModal}
                    toggle={() => this.toggleModals('characteristicsModal')}
                    className="overlay-filters"
                >
                    <ModalHeader toggle={() => this.toggleModals('characteristicsModal')}>
                        <Col>Características</Col>
                    </ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col sm={2}>
                                <FormGroup controlId="features">
                                    <Label>Sup. Lote</Label>
                                    <FormControl
                                        type="number"
                                        placeholder="m2"
                                        onChange={e => this.handleChange(e, 'lotSurface')}
                                    />
                                </FormGroup>
                            </Col>
                            <Col sm={2}>
                                <FormGroup controlId="features">
                                    <Label>Sup. Cub.</Label>
                                    <FormControl
                                        type="number"
                                        placeholder="m2"
                                        onChange={e => this.handleChange(e, 'coveredSurface')}
                                    />
                                </FormGroup>
                            </Col>
                            <Col sm={2}>
                                <FormGroup controlId="features">
                                    <Label>Sup. Semic.</Label>
                                    <FormControl
                                        type="number"
                                        placeholder="m2"
                                        onChange={e => this.handleChange(e, 'totalSurface')}
                                    />
                                </FormGroup>
                            </Col>
                            <Col sm={2}>
                                <Label>Piso</Label>
                                <InputGroup>
                                    <InputGroupAddon addonType="prepend">
                                        <Button
                                            color="light"
                                            onClick={() => this.handleMinusClick('features', 'floor')}
                                        >
                                            <FontAwesome name="minus"/>
                                        </Button>
                                    </InputGroupAddon>
                                    <Input
                                        disabled
                                        value={searchParams.features.floor ? searchParams.features.floor : 0}
                                    />
                                    <InputGroupAddon addonType="append">
                                        <Button
                                            color="light"
                                            onClick={() => this.handlePlusClick('features', 'floor')}
                                        >
                                            <FontAwesome name="plus"/>
                                        </Button>
                                    </InputGroupAddon>
                                </InputGroup>
                            </Col>
                            {/* <Col sm={2} xs={6}>
                                <Label>Oficinas</Label>
                                <InputGroup>
                                    <InputGroupAddon addonType="prepend">
                                        <Button
                                            color="light"
                                            onClick={() => this.handleMinusClick('features', 'offices')}
                                        >
                                            <FontAwesome name="minus"/>
                                        </Button>
                                    </InputGroupAddon>
                                    <Input
                                        disabled
                                        value={searchParams.features.offices ? searchParams.features.offices : 0}
                                    />
                                    <InputGroupAddon addonType="append">
                                        <Button
                                            color="light"
                                            onClick={() => this.handlePlusClick('features', 'offices')}
                                        >
                                            <FontAwesome name="plus"/>
                                        </Button>
                                    </InputGroupAddon>
                                </InputGroup>
                            </Col> */}
                        </Row>
                        <Row className="mb-5">
                            <Col sm={4}>
                                <FormGroup controlId="features">
                                    <Label>Estado</Label>
                                    <Select
                                        value={searchParams.features.status}
                                        placeholder="Seleccione..."
                                        isMulti
                                        options={statusOptions}
                                        onChange={e => this.handleMultiFeatures(e, 'features', 'status')}
                                    />
                                </FormGroup>
                            </Col>
                            {/* <Col sm={2}>
                                <FormGroup controlId="features">
                                    <Label>Año Constr.</Label>
                                    <FormControl
                                        type="number"
                                        value={searchParams.features.constructionYear}
                                        placeholder="----"
                                        maxLength={4}
                                        onChange={e => this.handleChange(e, 'constructionYear')}
                                    />
                                </FormGroup>
                            </Col> */}
                            <Col sm={4}>
                                <FormGroup
                                    controlId="features"
                                >
                                    <Label>Ubicación</Label>
                                    <Select
                                        value={searchParams.features.location}
                                        placeholder="Seleccione..."
                                        isMulti
                                        options={locationOptions}
                                        onChange={e => this.handleMultiFeatures(e, 'features', 'location')}
                                    />
                                </FormGroup>
                            </Col>
                            {/* <Col sm={2}>
                                <FormGroup controlId="features">
                                    <Label>Orientación</Label>
                                    <FormControl
                                        componentClass="select"
                                        value={searchParams.features.orientation}
                                        placeholder="Seleccione"
                                        onChange={e => this.handleChange(e, 'orientation')}
                                    >
                                        <option disabled>Seleccione</option>
                                        <option value="Desconocida">Desconocida</option>
                                        <option value="Norte">Norte</option>
                                        <option value="Sur">Sur</option>
                                        <option value="Este">Este</option>
                                        <option value="Oeste">Oeste</option>
                                        <option value="Noreste">Noreste</option>
                                        <option value="Noroeste">Noroeste</option>
                                        <option value="Sudeste">Sudeste</option>
                                        <option value="Sudoeste">Sudoeste</option>
                                    </FormControl>
                                </FormGroup>
                            </Col> */}
                            {/* <Col sm={2}>
                                <FormGroup controlId="features">
                                    <Label>Luminosidad</Label>
                                    <FormControl
                                        componentClass="select"
                                        value={searchParams.features.luminosity}
                                        placeholder="Seleccione"
                                        onChange={e => this.handleChange(e, 'luminosity')}
                                    >
                                        <option disabled>Seleccione</option>
                                        <option value="Desconocida">Desconocida</option>
                                        <option value="Excelente">Excelente</option>
                                        <option value="Muy Bueno">Muy bueno</option>
                                        <option value="Bueno">Bueno</option>
                                        <option value="Regular">Regular</option>
                                    </FormControl>
                                </FormGroup>
                            </Col> */}
                        </Row>
                        <Row>
                            <Col sm={2} xs={4}>
                                <Label>Amoblado</Label>
                                <Switch
                                    onChange={e => this.handleSwitch(e, 'features', 'furnished')}
                                    checked={searchParams.features.furnished
                                        ? searchParams.features.furnished
                                        : false}
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
                            <Col sm={2} xs={4}>
                                <Label>Dep. Ser</Label>
                                <Switch
                                    onChange={e => this.handleSwitch(e, 'features', 'depser')}
                                    checked={searchParams.features.depser ? searchParams.features.depser : false}
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
                            <Col sm={2} xs={4}>
                                <Label>SUM</Label>
                                <Switch
                                    onChange={e => this.handleSwitch(e, 'features', 'sum')}
                                    checked={searchParams.features.sum ? searchParams.features.sum : false}
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
                            <Col sm={2} xs={4}>
                                <Label>Deptos.</Label>
                                <Switch
                                    onChange={e => this.handleSwitch(e, 'features', 'apartments')}
                                    checked={searchParams.features.apartments
                                        ? searchParams.features.apartments
                                        : false}
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
                            <Col sm={2} xs={4}>
                                <Label>Fue refac.</Label>
                                <Switch
                                    onChange={e => this.handleSwitch(e, 'features', 'refurbished')}
                                    checked={searchParams.features.refurbished
                                        ? searchParams.features.refurbished
                                        : false}
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
                            {/* <Col sm={2}>
                                <FormGroup controlId="features">
                                    <Label>Para refac.</Label>
                                    <FormControl
                                        componentClass="select"
                                        value={searchParams.features.repair ? searchParams.features.repair : false}
                                        placeholder="Seleccione"
                                        onChange={e => this.handleChange(e, 'repair')}
                                    >
                                        <option value="">Seleccione</option>
                                        <option value="No">No</option>
                                        <option value="Si">Si</option>
                                        <option value="1 Año">1 Año</option>
                                        <option value="2 Años">2 Año</option>
                                        <option value="3 Años">3 Año</option>
                                        <option value="4 Años">4 Año</option>
                                        <option value="5 Años">5 Año</option>
                                        <option value="6 Años">6 Año</option>
                                        <option value="7 Años">7 Año</option>
                                        <option value="10 Años">10 Año</option>
                                        <option value="Más de 10 años">Más de 10 años</option>
                                    </FormControl>
                                </FormGroup>
                            </Col> */}
                        </Row>
                        <Row>
                            <Col sm={6}>
                                <Label>Calefacción</Label>
                                <Select
                                    value={searchParams.features.heating}
                                    placeholder="Seleccione..."
                                    isMulti
                                    options={heatingOptions}
                                    onChange={e => this.handleMultiFeatures(e, 'features', 'heating')}
                                />
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            size="lg"
                            onClick={() => this.handleSearch('characteristicsModal')}
                            className="btn-submit-search"
                        ><FontAwesome name="check-square-o" /> Aplicar Filtros
                        </Button>{' '}
                    </ModalFooter>
                </Modal>
                <Modal
                    isOpen={this.state.servlegModal}
                    toggle={() => this.toggleModals('servlegModal')}
                    className="overlay-filters"
                >
                    <ModalHeader toggle={() => this.toggleModals('servlegModal')}>
                        <Col>Servicios y Legales</Col>
                    </ModalHeader>
                    <ModalBody>
                        {/* <Row>
                            <Col sm={2}>
                                <FormGroup controlId="services">
                                    <Label>Expensas</Label>
                                    <FormControl
                                        type="number"
                                        value={searchParams.features.expenses}
                                        placeholder="$"
                                        onChange={e => this.handleChange(e, 'expenses')}
                                    />
                                </FormGroup>
                            </Col>
                        </Row> */}
                        <Row>
                            <Col sm={2} xs={3}>
                                <Label>Gas</Label>
                                <Switch
                                    onChange={e => this.handleSwitch(e, 'services', 'gas')}
                                    checked={searchParams.services.gas ? searchParams.services.gas : false}
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
                            <Col sm={2} xs={3}>
                                <Label>Agua</Label>
                                <Switch
                                    onChange={e => this.handleSwitch(e, 'services', 'water')}
                                    checked={searchParams.services.water ? searchParams.services.water : false}
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
                            <Col sm={2} xs={3}>
                                <Label>Cloacas</Label>
                                <Switch
                                    onChange={e => this.handleSwitch(e, 'services', 'sewer')}
                                    checked={searchParams.services.sewer ? searchParams.services.sewer : false}
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
                            <Col sm={2} xs={3}>
                                <Label>Teléfono</Label>
                                <Switch
                                    onChange={e => this.handleSwitch(e, 'services', 'phone')}
                                    checked={searchParams.services.phone ? searchParams.services.phone : false}
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
                            <Col sm={2} xs={3}>
                                <Label>Asfalto</Label>
                                <Switch
                                    onChange={e => this.handleSwitch(e, 'services', 'pavement')}
                                    checked={searchParams.services.pavement
                                        ? searchParams.services.pavement
                                        : false}
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
                            <Col sm={2} xs={3}>
                                <Label>Luz</Label>
                                <Switch
                                    onChange={e => this.handleSwitch(e, 'services', 'electricity')}
                                    checked={searchParams.services.electricity
                                        ? searchParams.services.electricity
                                        : false}
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
                            <Col sm={2} xs={3}>
                                <Label>Cable</Label>
                                <Switch
                                    onChange={e => this.handleSwitch(e, 'services', 'cableTv')}
                                    checked={searchParams.services.cableTv
                                        ? searchParams.services.cableTv
                                        : false}
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
                            <Col sm={2} xs={3}>
                                <Label>Seguridad</Label>
                                <Switch
                                    onChange={e => this.handleSwitch(e, 'services', 'security')}
                                    checked={searchParams.services.security
                                        ? searchParams.services.security
                                        : false}
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
                        <Col className="mb-5">
                            <hr/>
                        </Col>
                        <Row>
                            <Col sm={2} xs={3}>
                                <Label>Apto Banco</Label>
                                <Switch
                                    onChange={e => this.handleSwitch(e, 'legal', 'bank')}
                                    checked={searchParams.legal.bank ? searchParams.legal.bank : false}
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
                            <Col sm={2} xs={3}>
                                <Label>Apto Prof.</Label>
                                <Switch
                                    onChange={e => this.handleSwitch(e, 'legal', 'prof')}
                                    checked={searchParams.legal.prof ? searchParams.legal.prof : false}
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
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            size="lg"
                            onClick={() => this.handleSearch('servlegModal')}
                            className="btn-submit-search"
                        ><FontAwesome name="check-square-o" /> Aplicar Filtros
                        </Button>{' '}
                    </ModalFooter>
                </Modal>
                <Modal
                    isOpen={this.state.orderByModal}
                    toggle={() => this.toggleModals('orderByModal')}
                    className="overlay-filters"
                >
                    <ModalHeader toggle={() => this.toggleModals('orderByModal')}>
                        <Col>Ordenar por</Col>
                    </ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col xs={12} className="mb-5">
                                <h4 className="mb-3">Ordenar los resultados por Precio</h4>
                                <Button
                                    size="lg"
                                    className="mr-2 mb-2"
                                    outline
                                    onClick={e => {
                                        this.orderBy('cheapest');
                                    }}
                                    active={this.state.searchParams.orderKeyByPrice === 'cheapest'}
                                >Menor Precio
                                </Button>
                                <Button
                                    size="lg"
                                    className="mr-2 mb-2"
                                    outline
                                    onClick={e => {
                                        this.orderBy('expensive');
                                    }}
                                    active={this.state.searchParams.orderKeyByPrice === 'expensive'}
                                >Mayor Precio
                                </Button>
                                <Button
                                  size="lg"
                                  className="mr-2 mb-2"
                                  outline
                                  onClick={e => {
                                    this.orderBy('recentPriceModified');
                                  }}
                                  active={this.state.searchParams.orderKeyByPrice === 'recentPriceModified'}
                                >Precio Editado Recientemente
                                </Button> {' '}
                            </Col>
                            <Col xs={12} className="mb-5">
                                <h4 className="mb-3">Ordenar los resultados por Antigüedad de la publicación</h4>
                                <Row>
                                    <Button
                                        size="lg"
                                        className="mr-2 mb-2"
                                        outline
                                        onClick={e => {
                                            this.orderBy('oldest');
                                        }}
                                        active={this.state.searchParams.orderKeyByDate === 'oldest'}
                                    >Subidas mas antiguas
                                    </Button> {' '}
                                    <Button
                                        size="lg"
                                        className="mr-2 mb-2"
                                        outline
                                        onClick={e => {
                                            this.orderBy('newest');
                                        }}
                                        active={this.state.searchParams.orderKeyByDate === 'newest'}
                                    >Subidas Recientes
                                    </Button>
                                    {this.state.searchParams.orderKeyByDate === 'newest' &&
                                    <Col xs sm={3} className="p-0">
                                        <Select
                                            value={dateOption}
                                            options={newestOptions}
                                            formatGroupLabel={formatGroupLabel}
                                            onChange={e => this.handleChangeOrderByDate(e)}
                                        />
                                    </Col>
                                    }
                                </Row>
                            </Col>
                            <Col xs={12}>
                                <h4 className="mb-3">Ordenar los resultados por Nombre de Calle</h4>
                                <Row>
                                    <Switch
                                        onChange={e => this.handleSwitch(e, 'orderKeyByTitle', null)}
                                        checked={isOrderKeyByTitle}
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
                                        className="react-switch mt-1"
                                    />
                                    {isOrderKeyByTitle &&
                                    <div className="ml-4">
                                        <Button
                                        className="mb-2"
                                        outline
                                        onClick={e => {this.orderBy('asc')}}
                                        active={orderKeyByTitle === 'asc' || orderKeyByTitle === true}
                                        >Ascendente
                                        </Button> {' '}
                                        <Button
                                        className="mb-2"
                                        outline
                                        onClick={e => {this.orderBy('desc')}}
                                        active={orderKeyByTitle === 'desc'}
                                        >Descendente
                                        </Button>
                                    </div>
                                    }
                                </Row>
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            onClick={() => this.handleSearch('orderByModal')}
                            className="btn-submit-search"
                            size="lg"
                        ><FontAwesome name="check-square-o" /> Aplicar Filtros
                        </Button>{' '}
                    </ModalFooter>
                </Modal>
                <ShareModal
                    modalShare={this.state.modalShare}
                    toggleShare={this.toggleShare}
                    dwelling={this.state.dwelling}
                    showAlert={this.showAlert} />
                <FavoriteModal
                    modalFavorite={this.state.modalFavorite}
                    toggleFavorite={this.toggleFavorite}
                    handleFavorite={this.handleFavorite}
                    userProfile={this.props.userProfile}
                    clientsOptions={this.props.clientsOptions}
                    dwellingId={this.state.dwellingId} />
                {this.state.alert}
            </Fragment>
        );
    }
}

export default connect(
    state => ({
        loading: state.dwelling.loading,
        loadingFetchMoreDwellings: state.dwelling.loadingFetchMoreDwellings,
        loadingDwellingsByKeyword: state.dwelling.loadingDwellingsByKeyword,
        dwellings: state.dwelling.searchedDwellings,
        locations: state.dwelling.locations,
        totalCount: state.dwelling.totalCount,
        searchParams: state.dwelling.searchParams,
        userProfile: state.user.userProfile,
        savingFile: state.dwelling.savingFile,
        visitedDwellings: state.dwelling.visitedDwellings,
        clientsOptions: state.client.clientsOptions
    }),
    dispatch => ({
        requestUserProfile: () => dispatch(requestUserProfile()),
        requestFindDwellings: searchParams => dispatch(requestFindDwellings(searchParams)),
        requestSearchLoadMoreDwellings: searchParams => dispatch(requestSearchLoadMoreDwellings(searchParams)),
        setMapRefs: currentPosition => dispatch(setMapRefs(currentPosition)),
        requestAddFavorite: favorite_data => dispatch(requestAddFavorite(favorite_data)),
        requestFileConvert: data => dispatch(requestFileConvert(data)),
        requestSearchDwellingsByKeyword: searchParams => dispatch(requestSearchDwellingsByKeyword(searchParams)),
        visitDwelling: dwellingId => dispatch(visitDwelling(dwellingId)),
        requestSearchClients: () => dispatch(requestSearchClients(null, true)),
        requestFavoriteToClients: (clientsOptions) => dispatch(requestFavoriteToClients(clientsOptions)),
        requestRemoveFavoriteFromClient: (data) => dispatch(requestRemoveFavoriteFromClient(data)),
    })
)(Aside);
