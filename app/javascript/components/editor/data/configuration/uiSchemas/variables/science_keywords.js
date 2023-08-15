const scienceKeywordsUiSchema = {
  'ui:field': 'layout',
  'ui:layout_grid': {
    'ui:row': [
      {
        'ui:group': 'Science Keywords',
        'ui:col': {
          md: 12,
          children: [
            {
              'ui:row': [
                { 'ui:col': { md: 12, children: ['ScienceKeywords'] } }
              ]
            }
          ]
        }
      }
    ]
  },
  ScienceKeywords: {
    'ui:field': 'keywordPicker'
  }
}
export default scienceKeywordsUiSchema
