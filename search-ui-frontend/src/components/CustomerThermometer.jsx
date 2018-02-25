// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';
// import Thermometer from 'react-thermometer-component';
// import Thermometer from 'react-ui-thermometer'

import {
  Configurable,
  SearchDocument,
  FieldNames,
  Searcher,
  SimpleQueryRequest,
  SearchResult,
  Subheader360,
} from '@attivio/suit';


type CustomerThermometerProps = {
	customerName: string | null;
	customerField: string;
	thresholds: Array<Object>;
	searcher: Searcher;
}

export default class CustomerThermometer extends React.Component {

	constructor(props){
		super(props);
		(this: any).handleQueryResponse = this.handleQueryResponse.bind(this);
	}

	componentWillMount(){
		const searcher = this.props.searcher;
		if(searcher && this.props.customerName){
			const qr = searcher.getQueryRequest();
			qr.query = "AND(date:[2017-01-01 TO NOW], " + this.props.customerField + ":" + this.props.customerName + ")";
			qr.queryLangauge = "advanced";
			qr.facets = ['jirastatus'];
			qr.facetFilters = [];
			searcher.doCustomSearch(qr, this.handleQueryResponse);
		}

	}

	handleQueryResponse(response: QueryResponse | null, error: string | null){

	}

	render() {

		if(this.props.customerName){
		return   <div style={{height: '100%', width:'100%'}}>
				<img src="../img/happy_green_face.png" style={{width: '50%', height: '50%', marginLeft: '25%'}}/>
				<p><span><b>93%</b> of tickets have been closed on time in the last year for this customer</span></p>
				 </div>;
		} else {
			return <span>No details available for this customer - customer is unknown</span>
		}
	}
}