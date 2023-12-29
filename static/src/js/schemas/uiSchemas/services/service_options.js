const serviceOptionsUiSchema = {
  'ui:submitButtonOptions': {
    norender: true
  },
  ServiceOptions: {
    'ui:heading-level': 'h3', // TODO: see why this title is not being effected.
    'ui:field': 'layout',
    'ui:layout_grid': {
      'ui:row': [
        {
          'ui:group': 'Service Options',
          'ui:group-description': true,
          'ui:col': {
            md: 12,
            children: [
              {
                'ui:row': [
                  {
                    'ui:col': {
                      md: 12,
                      children: ['Subset']
                    }
                  },
                  {
                    'ui:col': {
                      md: 12,
                      children: ['VariableAggregationSupportedMethods']
                    }
                  },
                  {
                    'ui:col': {
                      md: 12,
                      children: ['SupportedInputProjections']
                    }
                  },
                  {
                    'ui:col': {
                      md: 12,
                      children: ['SupportedOutputProjections']
                    }
                  },
                  {
                    'ui:col': {
                      md: 12,
                      children: ['InterpolationTypes']
                    }
                  },
                  {
                    'ui:col': {
                      md: 12,
                      children: ['SupportedReformattings']
                    }
                  },
                  {
                    'ui:col': {
                      md: 12,
                      children: ['MaxGranules']
                    }
                  }
                ]
              }
            ]
          }
        }
      ]
    },
    VariableAggregationSupportedMethods: {
      'ui:heading-level': 'h4'
    },
    SupportedInputProjections: {
      'ui:heading-level': 'h4'
    },
    SupportedOutputProjections: {
      'ui:heading-level': 'h4'
    },
    InterpolationTypes: {
      'ui:heading-level': 'h4'
    },
    SupportedReformattings: {
      'ui:heading-level': 'h4',
      items: {
        'ui:field': 'layout',
        'ui:layout_grid': {
          'ui:row': [
            {
              'ui:col': {
                md: 12,
                children: [
                  {
                    'ui:row': [
                      {
                        'ui:col': {
                          md: 12,
                          children: ['SupportedInputFormat']
                        }
                      },
                      {
                        'ui:col': {
                          md: 12,
                          children: ['SupportedOutputFormats']
                        }
                      }
                    ]
                  }
                ]
              }
            }
          ]
        }
      }
    },
    Subset: {
      'ui:heading-level': 'h4',
      'ui:field': 'layout',
      'ui:layout_grid': {

        'ui:row': [
          {
            'ui:group': 'Subset',
            'ui:group-description': true,
            'ui:col': {
              md: 12,
              children: [
                {
                  'ui:group-checkbox': 'Spatial',
                  'ui:row': [
                    {
                      'ui:col': {
                        md: 12,
                        children: ['SpatialSubset']
                      }
                    }
                  ]
                },
                {
                  'ui:group-checkbox': 'Temporal',
                  'ui:row': [
                    {
                      'ui:col': {
                        md: 12,
                        children: ['TemporalSubset']
                      }
                    }
                  ]
                },
                {
                  'ui:group-checkbox': 'Variable',
                  'ui:row': [
                    {
                      'ui:col': {
                        md: 12,
                        children: ['VariableSubset']
                      }
                    }
                  ]
                }

              ]
            }
          }
        ]
      },
      SpatialSubset: {
        'ui:field': 'layout',
        'ui:layout_grid': {
          'ui:row': [
            {
              'ui:col': {
                md: 12,
                children: [
                  {
                    'ui:group-checkbox': 'Point',
                    'ui:row': [
                      {
                        'ui:col': {
                          md: 12,
                          children: ['Point']
                        }
                      }
                    ]
                  },
                  {
                    'ui:group-checkbox': 'Circle',
                    'ui:row': [
                      {
                        'ui:col': {
                          md: 12,
                          children: ['Circle']
                        }
                      }
                    ]
                  },
                  {
                    'ui:group-checkbox': 'Line',
                    'ui:row': [
                      {
                        'ui:col': {
                          md: 12,
                          children: ['Line']
                        }
                      }
                    ]
                  },
                  {
                    'ui:group-checkbox': 'Bounding Box',
                    'ui:row': [
                      {
                        'ui:col': {
                          md: 12,
                          children: ['BoundingBox']
                        }
                      }
                    ]
                  },
                  {
                    'ui:group-checkbox': 'Polygon',
                    'ui:row': [
                      {
                        'ui:col': {
                          md: 12,
                          children: ['Polygon']
                        }
                      }
                    ]
                  },
                  {
                    'ui:group-checkbox': 'Shapefile',
                    'ui:row': [
                      {
                        'ui:col': {
                          md: 12,
                          children: ['Shapefile']
                        }
                      }
                    ]
                  }
                ]
              }
            }
          ]
        },
        Point: {
          'ui:hide-header': true
        },
        Circle: {
          'ui:hide-header': true
        },
        Line: {
          'ui:hide-header': true
        },
        BoundingBox: {
          'ui:hide-header': true
        },
        Polygon: {
          'ui:hide-header': true
        },
        Shapefile: {
          'ui:hide-header': true
        }
      },
      TemporalSubset: {
        'ui:hide-header': true
      },
      VariableSubset: {
        'ui:hide-header': true
      }
    },
    MaxGranules: {
      'ui:group-description': true,
      items: {
        'ui:field': 'layout',
        'ui:layout_grid': {
          'ui:row': [
            {
              'ui:col': {
                md: 12,
                children: [
                  {
                    'ui:row': [
                      {
                        'ui:col': {
                          md: 12,
                          children: ['MaxGranules']
                        }
                      }

                    ]
                  }
                ]
              }
            }
          ]
        }
      }
    }
  }

}
export default serviceOptionsUiSchema
