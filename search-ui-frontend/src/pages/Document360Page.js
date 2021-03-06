// @flow

import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import QueryString from 'query-string';

import DocumentTitle from 'react-document-title';
import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

import {
  Configurable,
  SearchDocument,
  SimilarDocuments,
  Subheader360,
  FieldNames,
  SimpleQueryRequest,
  QueryResponse,
  SearchBar,
  MastheadNavTabs,
  SecondaryNavBar,
  Masthead,
  DocumentEntityList,
  Doc360Breadcrumbs,
  DocumentThumbnail,
  KnowledgeGraphPanel,
  SearchResultTitle,
} from '@attivio/suit';

import { mastheadTabInfo } from '../SearchUIApp';

import TicketDetails from '../components/TicketDetails';
import TicketRelatedContent from '../components/TicketRelatedContent'; 
import CustomerPanel from '../components/CustomerPanel';

type Document360PageProps = {
  location: PropTypes.object.isRequired;
  history: PropTypes.object.isRequired;
  /**
   * Optional. The location of the node through which to interact with Attivio.
   * Defaults to the value in the configuration.
   */
  baseUri: string;
  /** A map of the field names to the label to use for any entity fields */
  entityFields: Map<string, string>;
  /** A field expression to override what is used for the title, defaults to 'title' */
  title: string;
  /** A field expression to override what is used for the URI, defaults to 'uri' */
  uri: string;
  /** A field expression to override what is used for the table, defaults to 'table' */
  table: string;
  /**
   * A field expression to override what is used for the teaser, defaults to
   * 'SCOPETEASER(text, fragment=true, numFragments=4, fragmentScope=sentence)'
   */
  teaser: string;
  /**
   * A field expression to override what is used for the text, defaults to
   * 'SCOPETEASER(text, fragment=true, numFragments=1, fragmentSize=2147483647)'
   */
  text: string;
  /**
   * A field expression to override what is used for the URI to the preview image,
   * defaults to 'img.uri.preview'
   */
  previewImageUri: string;
  /** A field expression to override what is used for the UTI to the document’s
   * thumbnail, defaults to 'img.uri.thumbnail' */
  thumbnailImageUri: string;
  /**
   * A field expression to override what is used for the query to use when asking
   * for similar documents, defaults to 'morelikethisquery' */
  moreLikeThisQuery: string;
  /** The list of fields to use to do the join */
  insightGraphLinkingFields: Array<string>;
  /**
   * If true, then the 360° page will show links to documents from any table. Set this to false to
   * only show links to documnents that come from tables other than the one the main document is in.
   */
  includeAllTables: boolean;
};

type Document360PageDefaultProps = {
  baseUri: string;
  entityFields: Map<string, string>;
  title: string;
  uri: string;
  table: string;
  teaser: string;
  text: string;
  previewImageUri: string;
  thumbnailImageUri: string;
  moreLikeThisQuery: string;
  insightGraphLinkingFields: Array<string>;
  includeAllTables: boolean;
};

type Document360PageState = {
  docId: string | null;
  doc: SearchDocument | null;
  error: string | null;
  entityName: string | null;
  entityValue: string | null;
};

class Document360Page extends React.Component<Document360PageDefaultProps, Document360PageProps, Document360PageState> { // eslint-disable-line max-len
  static defaultProps = {
    baseUri: '',
    entityFields: new Map(),
    title: FieldNames.TITLE,
    uri: FieldNames.URI,
    table: FieldNames.TABLE,
    teaser: 'SCOPETEASER(text, fragment=true, numFragments=4, fragmentScope=sentence)',
    text: 'SCOPETEASER(text, fragment=true, numFragments=1, fragmentScope=2147483647)',
    previewImageUri: 'img.uri.preview',
    thumbnailImageUri: 'img.uri.thumbnail',
    moreLikeThisQuery: 'morelikethisquery',
    insightGraphLinkingFields: [
      'people',
      'company',
      'location',
      'author',
      'cc',
      'to',
    ],
    includeAllTables: false,
  };

  static contextTypes = {
    searcher: PropTypes.any,
  };

  static quoteValue(original: string): string {
    let escaped = original;
    // See if we need to escape any quotes...
    if (escaped.includes('"')) {
      escaped = escaped.replace(/"/g, '\\"');
    }
    const quoted = `"${escaped}"`;
    return quoted;
  }

  constructor(props: Document360PageProps) {
    super(props);
    this.state = {
      docId: null,
      doc: null,
      error: null,
      entityName: null,
      entityValue: null,
      stopwords: ['a', 'about','all','also','an','and','any','are','as','at','be','been','between','but','by','can','could','did','do','first','for','from','had','has','have','he','her','him','his','how','i','if','in','into','is','it','its','just','like','may','me','more','my','new','no','not','now','of','on','one','only','or','other','our','out','people','said','she','should','so','some','than','the','their','them','then','there','these','they','this','time','to','two','up','very','was','way','we','well','were','what','when','which','who','will','with','would','years','you','your'],
    };
    (this: any).navigateToDoc = this.navigateToDoc.bind(this);
    (this: any).navigateToEntity = this.navigateToEntity.bind(this);
  }

  state: Document360PageState;

  componentWillMount() {
    const search = QueryString.parse(this.props.location.search);
    const docId = search.docId;
    this.setDocId(docId);
  }

  componentWillReceiveProps(nextProps: Document360PageProps) {
    const oldDocId = this.state.docId;
    const search = QueryString.parse(nextProps.location.search);
    const docId = search.docId;
    if (oldDocId !== docId) {
      this.setDocId(docId);
    }
  }

  shouldComponentUpdate(nextProps: Document360PageProps, nextState: Document360PageState) {
    const oldDocId = this.state.docId;
    const search = QueryString.parse(nextProps.location.search);
    const docId = search.docId;

    // If the doc ID has changed or the document has changed, we need to update
    if (oldDocId !== docId) {
      return true;
    }
    if (this.state.doc !== nextState.doc) {
      return true;
    }
    if (this.state.entityName !== nextState.entityName) {
      return true;
    }
    if (this.state.entityValue !== nextState.entityValue) {
      return true;
    }
    if (this.state.error !== nextState.error) {
      return true;
    }

    // Otherwise, we're good as is
    return false;
  }

  getEntities(doc: SearchDocument): Map<string, Array<string>> {
    const result: Map<string, Array<string>> = new Map();
    this.props.entityFields.forEach((fieldLabel: string, fieldName: string) => {
      const values = doc.getAllValues(fieldName);
      if (values && values.length > 0) {
        result.set(fieldLabel, values);
      }
    });
    return result;
  }

  setDocId(docId: string) {
    if (docId) {
      this.setState({ docId }, () => {
        this.loadDoc(docId);
      });
    } else {
      this.setState({ docId: null });
    }
  }

  loadDoc(encodedDocId: string) {
    if (encodedDocId) {
      const docId = decodeURIComponent(encodedDocId);
      // Load the document from the parent searcher
      if (this.context.searcher) {
        const escapedDocId = docId.split('\\').join('\\\\');
        const req = new SimpleQueryRequest(`.id:"${escapedDocId}"`);
        const fields = [
          FieldNames.ID,
          `${this.props.thumbnailImageUri} as thumbnailImageUri`,
          `${this.props.title} as title`,
          `${this.props.uri} as uri`,
          `${this.props.table} as table`,
          `${this.props.teaser} as teaser`,
          `${this.props.text} as text`,
          `${this.props.previewImageUri} as previewImageUri`,
          `${this.props.thumbnailImageUri} as thumbnailImageUri`,
          `${this.props.moreLikeThisQuery} as morelikethisquery`,
          'jiratype as type',
          'jirapriority as priority',
          'jiraaffectsversion as versions',
          'author as author',
          'jiracustomer as jiracustomer',
        ];
        console.log("Fields: ", fields);
        const entityFields = Array.from(this.props.entityFields.keys());
        req.fields = fields.concat(entityFields);

        this.context.searcher.doCustomSearch(req, (response: ?QueryResponse, error: ?string) => {
          if (response && response.documents && response.documents.length >= 1) {
            const doc = response.documents[0];
            this.setState({ doc });
          } else if (response) {
            // Got a response but no documents? Bad ID?
            this.setState({ error: `No document with ID ${docId} was found.` });
          } else if (error) {
            this.setState({ error });
          }
        });
      }
    }
  }

  /**
   * Navigate to the 360° page for the document with the passed-in ID.
   */
  navigateToDoc(docId: string) {
    this.setState({
      // Clear these out so we don't use them on the new search
      entityName: null,
      entityValue: null,
    }, () => {
      const escapedDocId = encodeURIComponent(docId);
      const path = '/doc360';
      const search = QueryString.parse(this.props.location.search);
      search.docId = escapedDocId;
      this.props.history.push({ pathname: path, search: `?${QueryString.stringify(search)}` });
    });
  }

  /**
   * Navigate to the search results page showing documents with this
   * entity/value combination.
   */
  navigateToEntity(entityName: string, entityValue: string) {
    this.setState({
      entityName,
      entityValue,
    });
  }

  render() {
    let pageContents;

    if (this.state.doc) {
      const doc = this.state.doc;
      const text = doc.getFirstValue('teaser');
      const thumbnailUri = doc.getFirstValue('thumbnailImageUri');
      const table = doc.getFirstValue(FieldNames.TABLE);
      var title = doc.getFirstValue(FieldNames.TITLE);
      let ticket;
      if(table == "JIRA"){
        ticket = title.match("[A-Z]{3,7}.\\d*");
        title = title.replace(ticket, "");
      }

      var tabs = [{tableName:"*",displayName:"All"},{tableName:"JIRA",displayName:"Jira"},{tableName:"Confluence",displayName:"Wiki"},{tableName:"Source Code",displayName:"Source Code"}];

      pageContents = (
        <Grid fluid>
          <Row>
            <Col style={{borderRight: '2px solid #243E64'}} xs={8} sm={8}>
              <h1 className="attivio-360-hed" >
                <SearchResultTitle doc={doc} title={title}/>
              </h1>
              <TicketDetails doc={doc} ticket={ticket}/>
              <div style={{marginTop: '20px', marginBottom: '20px'}}>
              <Subheader360 label="Description" />
              <p
                className="attivio-search-result-desc"
                dangerouslySetInnerHTML={{ __html: text }} // eslint-disable-line react/no-danger
              />
              </div>
              <div style={{marginTop: '20px', marginBottom: '20px'}}>
              <Subheader360 label="Related Content" />
              <TicketRelatedContent doc={doc} searcher={this.context.searcher} tabs={tabs} stopwords={this.state.stopwords}/>
              </div>
              <Subheader360 label="Knowledge Graph" />
              <KnowledgeGraphPanel
                doc={doc}
                navigateToDoc={this.navigateToDoc}
                navigateToEntity={this.navigateToEntity}
                entityName={this.state.entityName}
                entityValue={this.state.entityValue}
                linkingFields={this.props.insightGraphLinkingFields}
                includeAllTables={this.props.includeAllTables}
              />
            </Col>
            <Col xs={4} sm={4}>
              <CustomerPanel doc={doc} searcher={this.context.searcher}/>
            </Col>
          </Row>
        </Grid>
      );
    } else if (!this.state.docId) {
      pageContents = <div>No document ID was set.</div>;
    } else if (this.state.error) {
      pageContents = <div>{this.state.error}</div>;
    } else {
      pageContents = <div>Loading…</div>;
    }

    return (
      <DocumentTitle title="Document 360°: Attivio Cognitive Search">
        <div>
          <Masthead multiline>
            <MastheadNavTabs tabInfo={mastheadTabInfo} />
            <SearchBar
              inMasthead
              route="/results"
            />
          </Masthead>
          <SecondaryNavBar>
            <Doc360Breadcrumbs currentDoc={this.state.doc} />
          </SecondaryNavBar>
          <div style={{ padding: '10px' }}>
            {pageContents}
          </div>
        </div>
      </DocumentTitle>
    );
  }
}

export default withRouter(Configurable(Document360Page));
