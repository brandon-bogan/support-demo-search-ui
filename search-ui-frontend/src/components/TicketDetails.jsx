// @flow
import React from 'react';
import PropTypes from 'prop-types';

import {
  Configurable,
  SearchDocument,
  FieldNames,
} from '@attivio/suit';

type TicketDetailsProps = {
	doc: SearchDocument;
	ticket: string | null;
}

export default class TicketDetails extends React.Component {

	constructor(props){
		super(props);
	}

	render() {
		const doc = this.props.doc;
		const type = doc.getFirstValue('type');
        const priority = doc.getFirstValue('priority');
      	const versions = doc.getFirstValue('versions');
      	const reporter = doc.getFirstValue('author');
      	const customer = doc.getFirstValue('jiracustomer');
      	const ticket = this.props.ticket;
		return <table><tbody>
				{ticket ? (<tr><td><b>Ticket:</b></td><td style={{paddingLeft: '10px'}}>{ticket}</td></tr>) : ('')}
				{type ? (<tr><td><b>Ticket Type:</b></td><td style={{paddingLeft: '10px'}}>{type}</td></tr>) : ('')}
				{priority ? (<tr><td><b>Priority:</b></td><td style={{paddingLeft: '10px'}}>{priority}</td></tr>) : ('')}
				{versions ? (<tr><td><b>Affects Version(s):</b></td><td style={{paddingLeft: '10px'}}>{versions}</td></tr>) : ('')}
				{reporter ? (<tr><td><b>Reporter:</b></td><td style={{paddingLeft: '10px'}}>{reporter}</td></tr>) : ('')}
				{customer ? (<tr><td><b>Customer:</b></td><td style={{paddingLeft: '10px'}}>{customer}</td></tr>) : ('')}
              </tbody></table>;
		;
	}
}