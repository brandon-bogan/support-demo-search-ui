// @flow
import React from 'react';
import PropTypes from 'prop-types';

import {
  Configurable,
  SearchDocument,
  FieldNames,
  Searcher,
  SimpleQueryRequest,
  SearchResult,
  Subheader360,
} from '@attivio/suit';

import CollapsibleSidePanel from './CollapsibleSidePanel';
import CustomerThermometer from '../components/CustomerThermometer';

type CustomerPanelProps = {
	doc: SearchDocument;
	searcher: Searcher | null;
}

export default class CustomerPanel extends React.Component {

	constructor(props){
		super(props);
		this.state = {
		  isSearching: false,
		  response: undefined,
	      error: null,
	    };
	    (this: any).callbackForReporter = this.callbackForReporter.bind(this);
	    (this: any).callbackForCustomer = this.callbackForCustomer.bind(this);
	}

	componentWillMount(){
		this.doSearchForReporterTickets();
		this.doSearchForCustomerTickets();
	}

	callbackForCustomer(response: QueryResponse | null, error: string | null){
		if (response) {
			console.log("Got response: " + response);
			this.setState({customerTickets: response}, console.log("State: ", this.state));
		} else {
			console.log("Got error: ", error)
		}
	};

	doSearchForCustomerTickets(){
		const searcher = this.props.searcher;
		const docId = this.props.doc.getFirstValue(".id");
		if(this.props.doc.getFirstValue("author") && searcher){
			var authorArgs = this.props.doc.getFirstValue("author").split("@");
			let customer;
			if(authorArgs.length > 0){
				customer = authorArgs[1];
				var qr = searcher.getQueryRequest();
				var query = "AND(NOT(.id:" + docId + "),table:JIRA,jirastatus:*,author:" + customer + ")";
				qr.query = query;
				qr.queryLanguage = "advanced"; 
				qr.facetFilters = [];
				searcher.doCustomSearch(qr, this.callbackForCustomer);
			}
		}
	}

	getCustomerTickets(response){
		console.log("Response docs in getCustomerTickets: ", response, this.state);
		if (response && response.documents.length > 0) {
	      const results = [];
	      response.documents.forEach((document: SearchDocument, index: number) => {
	        const key = document.getFirstValue(FieldNames.ID);
	        const position = index + 1;
	        results.push(
	          <SearchResult
	            document={document}
	            format="simple"
	            position={position}
	            key={key}
	            baseUri={this.props.baseUri}
	          />,
	        );
	      });
	      return results;
	    }
	    if (this.state.error) {
	      return this.state.error;
	    }
	    return <li className="none">No similar documents exist</li>;
	}

	callbackForReporter(response: QueryResponse | null, error: string | null){
		if (response) {
			this.setState({reporterTickets: response});
		} 
	};

	doSearchForReporterTickets(){
		const searcher = this.props.searcher;
		const docId = this.props.doc.getFirstValue('.id');
		var reporter = this.props.doc.getFirstValue("author");
		if(searcher && reporter){
			var qr = searcher.getQueryRequest();
			var query = "AND(NOT(.id:" + docId + "),table:JIRA,jirastatus:*,author:" + reporter + ")";
			qr.query = query;
			qr.queryLanguage = "advanced"; 
			qr.facetFilters = [];
			searcher.doCustomSearch(qr, this.callbackForReporter);
		}
	}

	getReporterTickets(response){
		if (response && response.documents.length > 0) {
	      const results = [];
	      response.documents.forEach((document: SearchDocument, index: number) => {
	        const key = document.getFirstValue(FieldNames.ID);
	        const position = index + 1;
	        results.push(
	          <SearchResult
	            document={document}
	            format="simple"
	            position={position}
	            key={key}
	            baseUri={this.props.baseUri}
	          />,
	        );
	      });
	      return results;
	    }
	    if (this.state.error) {
	      return this.state.error;
	    }
	    return <li className="none">No similar documents exist</li>;
	}

	render() {
		const style = {
      		listStyle: 'none',
      		paddingLeft: 0,
    	};

    	var customerName = this.props.doc.getFirstValue('jiracustomer') ? this.props.doc.getFirstValue('jiracustomer') : "";
		// const satisfactionContent = this.getSatisfactionContent();
		// const customerTickets = this.getOpenCustomerTickets();
		// const reporterTickets = this.getReporterTickets();
	  return   <div>
	  <img src="../img/bank_logo.PNG" class="img-responsive center-block" style={{marginLeft: '25px', width: '90%'}}/>
	  				<CollapsibleSidePanel title={<Subheader360 label="Customer Support Satisfaction" />} id={"myID"} collapsed={true} style={{width: '100%'}}>
	  					<CustomerThermometer searcher={this.props.searcher} customerName={customerName} customerField={"jiracustomer"}/>
        			</CollapsibleSidePanel>
        			<CollapsibleSidePanel title={<Subheader360 label="Open Tickets For This Customer" />} id={"myID"} collapsed={true}>
        				<div style={{maxHeight: '400px', overflowY:'scroll'}}>
							 <ul style={style}>
					    		{this.getCustomerTickets(this.state.customerTickets)}
					    	</ul>
					    </div>
        			</CollapsibleSidePanel>
        			<CollapsibleSidePanel title={<Subheader360 label="Open Tickets For This Reporter" />} id={"myID"} collapsed={true}>
        				<div style={{maxHeight: '400px', overflowY:'scroll'}}>
							 <ul style={style}>
					    		{this.getReporterTickets(this.state.reporterTickets)}
					    	</ul>
					    </div>
        			</CollapsibleSidePanel>
        		</div>
	}
}