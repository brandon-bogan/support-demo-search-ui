// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from 'react-bootstrap';

import {
  Configurable,
  SearchDocument,
  FieldNames,
  Searcher,
  SimpleQueryRequest,
  SearchResult
} from '@attivio/suit';

type TicketDetailsProps = {
	doc: SearchDocument;
	tabs: Array<Object>;
	ticket: string | null;
	searcher: Searcher | null;
	stopwords: Array<string> | null;
}

export default class TicketRelatedContent extends React.Component {

	constructor(props){
		super(props);
		this.state = {
		  isSearching: false,
		  response: undefined,
	      error: null,
	    };
		(this: any).updateSearchResults = this.updateSearchResults.bind(this);
		(this: any).buildRelatedContentQuery = this.buildRelatedContentQuery.bind(this);
		(this: any).getRelatedContent = this.getRelatedContent.bind(this);
	}

	componentWillMount(){
		this.getRelatedContent();
	}

	  /**
   * Callback used when the search is completed. Will update the Searcher's state
   * with the query response or the error string passed in.
   */
	  updateSearchResults(activeTable: string, response: QueryResponse | null, error: string | null) {
	    if (response) {
	      // Succeeded...
	      this.setState({

	      	//TODO left off here
	        ['response'+ activeTable.replace(" ", "")]: response,
	        error: undefined,
	        isSearching: false,
	      }, console.log("Current State: ", this.state));
	    } else if (error) {
	      // Failed!
	      this.setState({
	        response: undefined,
	        haveSearched: true,
	        error,
	      });
	    }
	  }

	  buildRelatedContentQuery(tableName: string){
	  	const searcher = this.props.searcher;
	  	if(searcher){
	  		var qr = searcher.getQueryRequest();
	  		var query = "OR(";
	  		var terms = this.props.doc.getFirstValue(FieldNames.TITLE).replace(/"/g, '').split(" ");
	  		var termsUsedCount = 0;
	  		terms.map((t) => {
	  			if(!this.props.stopwords || this.props.stopwords && this.props.stopwords.indexOf(t.toLowerCase()) == -1){
	  				query += '"' + t + '",';
	  				termsUsedCount++;
	  			}
	  		});
	  		var orQueryMin = Math.floor(termsUsedCount / 2);
	  		query = query.substring(0, query.length - 1) + ",minimum=" + orQueryMin + ")";
	 		query = "AND(NOT(.id:"+ this.props.doc.getFirstValue('.id') + "),table:\"" + tableName + "\"," + query + ")";
	  		console.log("Big OR Query: " + query);
	  		qr.query = query;
	  		qr.facets = ["table"];
	  		qr.queryLanguage = "advanced";
		    const fields = [
	          FieldNames.ID,
	          FieldNames.TITLE,
	          "uri as uri",
	          'table as table',
	          "SCOPETEASER(text, fragment=true, numFragments=4, fragmentScope=sentence) as teaser",
	          "SCOPETEASER(text, fragment=true, numFragments=1, fragmentSize=2147483647) as text",
	          "morelikethisquery as morelikethisquery",
	          'jiratype as type',
	          'jirapriority as priority',
	          'jiraaffectsversion as versions',
	          'author as author',
	        ];
	        qr.fields = fields;
	        const restParams = new Map();
	        restParams.set('highlight', ['true']);
      		restParams.set('highlight.mode', ['HTML']);
      		qr.restParams = restParams;
      		qr.facetFilters = [];
	  		return qr;
	  	}
	  }

	getRelatedContent(){
		if(!this.state.response){
			const searcher = this.props.searcher;
			if(searcher){
				this.props.tabs.map((tab) => {
					var query = this.buildRelatedContentQuery(tab.tableName);
					var callback = (response: QueryResponse | null, error: string | null) => {this.updateSearchResults(tab.tableName, response, error)};
					this.setState({currentSearchTable:tab.tableName, isSearching: true}, searcher.doCustomSearch(query, callback));
				});
			}
		}
	}

	renderResults(response){
		if (response.documents.length > 0) {
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
		// this.getRelatedContent();
		const doc = this.props.doc;
		const type = doc.getFirstValue('type');
        const priority = doc.getFirstValue('priority');
      	const versions = doc.getFirstValue('versions');
      	const ticket = this.props.ticket;

      	const style = {
      		listStyle: 'none',
      		paddingLeft: 0,
    	};


      	var tabIndx = 0;
      	const tabContent = this.props.tabs.map((tab) => {
      							tabIndx++;
      							var response = this.state['response' + tab.tableName.replace(" ", "")];
								return response? <Tab eventKey={tabIndx} title={tab.displayName + " (" + response.totalHits + ")"}>                  
													<div style={{maxHeight: '300px', overflowY:'scroll'}}>
														 <ul style={style}>
												    		{this.renderResults(response)}
												    	</ul>
												    </div>
                  								</Tab> 
                  								: 
                  								<Tab eventKey={tabIndx} title={tab.displayName} disabled></Tab>;
							})
		return <div style={{paddingBottom: '20px'}}><Tabs defaultActiveKey={1} animation={false} id="noanim-tab-example">
						{tabContent}
					</Tabs>
				</div>;
		;
	}
}