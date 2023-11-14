const toolsConfiguration = [
  {
    displayName: 'Tool Information',
    properties: [
      'Name',
      'LongName',
      'Version',
      'VersionDescription',
      'Type',
      'LastUpdatedDate',
      'Description',
      'DOI',
      'URL'
    ]
  },
  {
    displayName: 'Related URLs',
    properties: ['RelatedURLs']
  },
  {
    displayName: 'Compatibility And Usability',
    properties: [
      'SupportedInputFormats',
      'SupportedOutputFormats',
      'SupportedOperatingSystems',
      'SupportedBrowsers',
      'SupportedSoftwareLanguages',
      'Quality',
      'AccessConstraints',
      'UseConstraints'
    ]
  },
  {
    displayName: 'Descriptive Keywords',
    properties: ['ToolKeywords', 'AncillaryKeywords']
  },
  {
    displayName: 'Tool Organizations',
    properties: ['Organizations']
  },
  {
    displayName: 'Tool Contacts',
    properties: [
      'ContactGroups',
      'ContactPersons']
  },
  {
    displayName: 'Potential Action',
    properties: ['PotentialAction']
  }
]

export default toolsConfiguration
