import { ObjectUtils } from '@attivio/suit';

export default {
  /**
   * These properties are not specific to any page/component but may apply to any/all of them.
   */
  ALL: {
    // This is the base URI that will be used for making REST API calls to the
    // Attivo server. In general, the UI is hosted on the same machine that
    // serves the REST API, so this should not include the protocol, hostname, or port.
    // (The case where you're using the development server to communicate with an
    // Attivio server on  different machine is the only time you should include this
    // information.)
    baseUri: 'http://linpsvdog03:17000',

    // This is the prefix to use for routes in the application. For example, if it will
    // running under '/search', you will want to set this value to '/search' (note the leading slash
    // and lack of a trailing slash). For running the application at the root of the baseUri,
    // simply set this to '/'. This may be the same as the baseUri.
    // The value here MUST match the server.contextPath in the application.properties file
    // used when running the servlet and/or the servlet name and mapping in the web.xml
    // file in the Attivio module. Finally, it must match the value of the prefix variable in
    // the webpack.config.js file.
    basename: '/searchui',

    // This specifies the type of authentication that the front-end application will use.
    // Set this to 'SAML' to enable SAML authentication when hosting the UI in a servlet
    // (SAML authentication must also be enabled on the back end, using the values in the
    // application.properties file).
    // Set this to 'XML' to use the contents of the users.xml file to define users. In this
    // case, the front-end application's login page will be used to log users in.
    // Set this to 'NONE' if you will be hosting the UI in an Attivio module; in this case
    // the Deploy Webapp feature in the module will define the type of authentication that
    // will secure the UI. Note that you can also use 'NONE' during the course of developing
    // an application.
    authType: 'XML',

    // This is the default principal realm to use when searching.
    defaultRealm: 'aie',

    // A map of document fields to display labels to use as entity mappings
    // Note this should be obsolete once the display names are in the schema
    // for FactBook and we start querying the schema to get this map.
    entityFields: ObjectUtils.toMap({
      author: 'Author/Reporter',
      people: 'People',
      company: 'Companies',
      languages: 'Languages',
      date: 'Date',
      keyphrases: 'Key Phrases',
      table: 'Table',
      // Factbook fields: uncomment the following lines if the Factbook module has been included in your project
      // spokenLanguage: 'Spoken Languages',
      // resource: 'Resources',
      // climate: 'Climate',
      // ethnicity: 'Ethnicities',
      // country: 'Country',
    }),

    // This map controls the colors used to show various entity types. The keys are the fields
    // used to contain entities and the values are the colors to use, in any valid CSS format (e.g.,
    // '#0074A3' or 'rgba(255, 42, 153, 0.5)').
    // This map is also used to control colors in various charts, such as pie chart facets. In this
    // case, the entity names are ignored and the colors are used in the order listed here, starting
    // with the first entry for the first data set in the chart.
    entityColors: ObjectUtils.toMap({
      location: '#007dbc',
      company: '#ed7a23',
      people: '#fedd0e',
      product: '#db2e75',
      religion: '#ef8baa',
      jobtitle: '#fcb62c',
      phonenum: '#c32026',
      email: '#a04ba0',
      url: '#767676',
      utm: '#e6e6e6',
      time: '#934900',
      extracteddate: '#d3cba9',
      keyphrase: '#037f70',
      hashtags: '#0caa93',
      mentions: '#38e5cc',
      creditcard: '#1b7735',
      money: '#6fbe44',
      nationality: '#77d5f3',
      distance: '#075484',
      coordinate: '#caeefa',
      jiracustomer: 'red',
      jiracomponent: 'green',
      author: '#007dbc',
      jiracc: 'purple',
      to: 'orange',
    }),

    // The default comprehensive list of fields to include in search results
    fields: [
      '*',
    ],

    // The field containing the document's title
    title: 'title',
    // The field containing the document's URI
    uri: 'uri',
    // The field containing the document's table
    table: 'table',
    // The field containing the document's latitude
    latitude: 'latitude',
    // The field containing the document's longitude
    longitude: 'longitude',
    // The field containing the document's MIME type (used by the browser when downloading files)
    mimetype: 'mimetype',
    // The field containing the document's sourcepath (used by the browser when downloading files)
    sourcePath: 'sourcepath',
    // The field containing the URI to the document's preview image
    previewImageUri: 'img.uri.preview',
    // The field containing the URI to the document's thumbnail image
    thumbnailImageUri: 'img.uri.thumbnail',
    // The field containing the 'more like this' query for a document
    moreLikeThisQuery: 'morelikethisquery',
    // The field containing the document's teaser text
    // (the default SCOPETEASER expression enables scope highlighting on results)
    teaser: 'SCOPETEASER(text, fragment=true, numFragments=4, fragmentScope=sentence)',
    // The field containing the document's full text
    // (the default SCOPETEASER expression enables scope highlighting on results)
    text: 'SCOPETEASER(text, fragment=true, numFragments=1, fragmentSize=2147483647)',
    // The public key with which to connect to the mapbox public apis
    mapboxKey: '',
  },

  /**
   * These properties configure only the default values for properties of any Masthead component(s).
   * The Masthead typically appears at the top of the page and contains a logo image, a page title, navigation breadcrumbs, and a
   * search input.
   */
  Masthead: {
    // The location of the logo image to render on the left side of the masthead
    logoUri: 'img/attivio-logo-reverse.png',
    // The alt text for the logo.
    logoAlt: 'Attivio Home',
    // The route to navigate to when the user clicks the logo.
    homeRoute: '/',
    // The name of the application.
    applicationName: 'Cognitive Search',
  },

  /**
   * These properties configure only the default values for properties of any SearchBar component(s).
   * The SearchBar is the input dom element through which the user can type and enter queries.
   */
  SearchBar: {
    // The placeholder text to display when the input field is empty.
    placeholder: 'Search…',
    // The placeholder text to display when the input field is empty and the language is advanced.
    placeholderAdvanced: 'Enter an advanced query…',
    // If true, the "microphone" button is displayed beside the search bar and the user can use speech recognition to input the
    // query
    allowVoice: true,
    // Whether to show a toggle for simple/advanced language in the search bar
    allowLanguageSelect: true,
    autoCompleteUri: '/rest/autocompleteApi/richCgi/dictionaryProvider',
  },

  /**
   * These properties configure only the default values for properties of any Searcher component(s).
   * The Searcher is a simple interface used by all its children for any querying logic.
   */
  Searcher: {
    // The workflow to use for executing searches
    searchWorkflow: 'search',
    // The number of results to show per page
    resultsPerPage: 10,
    // An ordered list of facet requests to use for each query; facet expressions are also supported
    facets: [
      'keyphrases(maxbuckets=15)',
      'table',
      'tags',
      'author',
      'jirastatus',
      'jiracustomer',
      'company',
      'people',
      'location',
      'date(sortby=VALUE,maxbuckets=60,dateIntervals=auto)',
    ],
    // The maximum number of facets the Facet Finder attempts to add to the query. Set this to 0 to turn off Facet Finder.
    facetFinderCount: 20,
    // Determines if primary results should be displayed as 'list', 'usercard', 'doccard', 'debug', or 'simple';
    format: 'list',
    // An optional filter to apply to all queries when using the advanced query language
    queryFilter: '',
    // The locale for queries; all linguistic processing is performed using this locale
    locale: '',
    // Highlight mode for the results of your query: 'on' enables highlighting
    // using your schema preferences and field expressions, 'off' disables
    // highlighting on the request, only highlighting field expressions specified, and
    // 'all' adds a teaser field expression to all your display fields when not in debug mode.
    highlightResults: 'all',
    // Determines how joined results are returned by the server, either as child
    // documents, or rolled up as a part of the parent/top level document. */
    joinRollupMode: 'tree',
    // The name of the Business Center profile to use for queries. If set, this will enable Profile level
    // campaigns and promotions.
    businessCenterProfile: 'Attivio',
  },

  /**
   * These properties configure only the default values for properties of any SearchUISearchPage component(s).
   * The SearchUISearchPage is the page that displays the results after executing a query.
   */
  SearchUISearchPage: {
    // The names of the relevancy models to be able to switch between. If this is an empty array,
    // the server will be queried for the list of available relevancy models and they will be used.
    // To force the UI to always use a single model when making queries, set this to an array with
    // that single name as its sole element.
    relevancyModels: [
      'default',
    ],
    pieChartFacets: [ // The facet field names that should be displayed as pie charts
    ],
    barChartFacets: [ // The facet field names that should be displayed as bar charts
    ],
    columnChartFacets: [ // The facet field names that should be displayed as column charts
    ],
    barListFacets: [ // The facet field names that should be displayed as lists with bars
      'sentiment.score',
    ],
    tagCloudFacets: [ // The facet field names that should be displayed as tag clouds
      'keyphrases',
    ],
    timeSeriesFacets: [ // The facet field names that should be displayed as time series
      'date',
    ],
    sentimentFacets: [// The facet field names that should be displayed with a sentiment bar
      'sentiment',
    ],
    // The maximum number of items to show in a facet. If there
    // are more than this many buckets for the facet, only this many, with
    // the highest counts, will be shown.
    maxFacetBuckets: 15,
    // An optional list of facet field names which will be used to determine
    // the order in which the facets are shown. Any facets not named here will
    // appear after the called-out ones, in the order they are in in the
    // response.facets array of the parent Searcher compoinent.
    orderHint: [
      'keyphrases',
      'date',
      'table',
    ],
    showScores: false,
    // Whether or not to display a toggle for switching the search results to debug format.
    debugViewToggle: true,
    sortableFields: [ // The names of the fields to include in the sort menu.
      'title',
      'table',
      'size',
      'creationdate',
      'date',
      'guid',
      'linkcount',
      'socialsecurity',
      'zipcode',
    ],
  },

  /**
   * These properties configure only the default values for properties of any SearchUIInsightsPage component(s).
   * The SearchUIInsightsPage is the page providing insight over a full scope of documents and allowing the user
   * to narrow that scope.
   */
  SearchUIInsightsPage: {
    pieChartFacets: [ // The facet field names that should be displayed as pie charts
      'table',
    ],
    barChartFacets: [ // The facet field names that should be displayed as bar charts
    ],
    columnChartFacets: [ // The facet field names that should be displayed as column charts
    ],
    barListFacets: [ // The facet field names that should be displayed as lists with bars
      'sentiment.score',
    ],
    tagCloudFacets: [ // The facet field names that should be displayed as tag clouds
      'keyphrases',
    ],
    timeSeriesFacets: [ // The facet field names that should be displayed as time series
      'date',
    ],
    sentimentFacets: [// The facet field names that should be displayed with a sentiment bar
      'sentiment',
    ],
    geoMapFacets: [ // The facet field names that should be displayed with a geographic map
      'position',
    ],
    // The maximum number of items to show in a facet. If there
    // are more than this many buckets for the facet, only this many, with
    // the highest counts, will be shown.
    maxFacetBuckets: 15,
  },

  /**
   * These properties configure only the default values for properties of any Document360Page component(s).
   * The Document360Page is the page providing contextual insight of a single document.
   */
  Document360Page: {
    // Show the list of documents which are similar to the focused document on the 360 page
    showMoreLikeThisResults: true,
    // Link across these fields to other documents in the document 360 insight graph
    insightGraphLinkingFields: [
      'people',
      'jiracustomer',
      'jiracomponent',
      'location',
      'author',
      'jiracc',
      'to',
      // Factbook fields - uncomment lines below if factbook module has been included in your project
      // 'country',
      // 'spokenlanguage',
      // 'resource',
      // 'climate',
      // 'ethnicity',
    ],
    // The maximum number of linked documents to show per entity in the document 360 insight graph
    maxLinkedDocs: 5,
    // If true, then the 360° page will show links to documents from any table. Set this to false to
    // only show links to documnents that come from tables other than the one the main document is in.
    includeAllTables: true,
  },
};
