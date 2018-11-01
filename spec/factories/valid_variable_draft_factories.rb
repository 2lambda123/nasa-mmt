FactoryGirl.define do
  factory :empty_variable_draft, class: VariableDraft do
    provider_id 'MMT_2'
    draft_type 'VariableDraft'

    draft { {} }

    short_name nil
    entry_title nil
  end

  factory :invalid_variable_draft, class: VariableDraft do
    provider_id 'MMT_2'
    draft_type 'VariableDraft'

    draft {{
      'Scale': 'string',
      'Offset': 'string',
      'ValidRanges': [
        {
          'Min': 'string',
          'Max': 'string'
        }
      ],
      'FillValues': [
        {
          'Value': 'string'
        }
      ],
      'Dimensions': [
        {
          'Size': 'string'
        }
      ],
      'Sets': [
        {
          'Size': 'string',
          'Index': 'string'
        }
      ],
      'Characteristics': {
        'IndexRanges':
          {
            'LatRange': [
              'abc',
              90.0
            ],
            'LonRange': [
              -180.0,
              180.0
            ]
          }
      },
      'SizeEstimation': {
        'AverageSizeOfGranulesSampled': 'string',
        'AvgCompressionRateASCII': 'string',
        'AvgCompressionRateNetCDF4': 15
      }
    }}

    short_name nil
    entry_title nil
  end

  factory :full_variable_draft, class: VariableDraft do
    transient do
      draft_short_name nil
      draft_entry_title nil
      draft_science_keywords nil
    end

    native_id 'full_variable_draft_native_id'
    provider_id 'MMT_2'
    draft_type 'VariableDraft'

    draft {{
      'Name': draft_short_name || "#{Faker::Space.galaxy}_#{Faker::Number.number(6)}",
      'Alias': "An Alias",
      'LongName': draft_entry_title || "#{Faker::Space.nebula} #{Faker::Space.star_cluster} #{Faker::Number.number(6)}",
      'Definition': 'Volume mixing ratio of sum of peroxynitrates in air measured in units of Npptv (parts per trillion by volume)',
      'Units': 'Npptv',
      'DataType': 'float',
      'Dimensions': [
        {
          'Name': 'LatDim',
          'Size': 36,
          'Type': 'LATITUDE_DIMENSION'
        },
        {
          'Name': 'Lizard Herp Doc Pop',
          'Size': 2020,
          'Type': 'LONGITUDE_DIMENSION'
        }
      ],
      'ValidRanges': [
        {
          'Min': -417,
          'Max': 8836,
          'CodeSystemIdentifierMeaning': ['Code System Identifier Meaning 1','Code System Identifier Meaning 2'],
          'CodeSystemIdentifierValue': ['Code System Identifier Value 1','Code System Identifier Value 2','Code System Identifier Value 3']
        },
        {
          'Min': 0.0,
          'Max': 1.0,
          'CodeSystemIdentifierMeaning': ['Code System Identifier Meaning 1','Code System Identifier Meaning 2', 'Code System Identifier Meaning 3'],
          'CodeSystemIdentifierValue': ['Code System Identifier Value 1','Code System Identifier Value 2']
        }
      ],
      'Scale': 1.0,
      'Offset': 0.0,
      'FillValues': [
        {
          'Type': 'SCIENCE_FILLVALUE',
          'Value': -9999.0,
          'Description': 'Pellentesque Bibendum Commodo Fringilla Nullam'
        },
        {
          'Type': 'ANCILLARY_FILLVALUE',
          'Value': 111.0,
          'Description': 'Pellentesque Nullam Ullamcorper Magna'
        }
      ],
      'VariableType': 'SCIENCE_VARIABLE',
      "VariableSubType": "SCIENCE_SCALAR",
      'Sets': [
        {
          'Name': 'Science',
          'Type': 'Land',
          'Size': 50,
          'Index': 1
        },
        {
          'Name': 'Fiction',
          'Type': 'Water',
          'Size': 100,
          'Index': 2
        }
      ],
      "Characteristics": {
        "GroupPath": "/Data_Fields/",
        "IndexRanges":
          {
            "LatRange": [
              -90.0,
              90.0
            ],
            "LonRange": [
              -180.0,
              180.0
            ]
          }
      },
      "SizeEstimation": {
        "AverageSizeOfGranulesSampled": 3009960,
        "AvgCompressionRateASCII": 4.0,
        "AvgCompressionRateNetCDF4": 0.132
      },
      "MeasurementIdentifiers": [
        {
          "MeasurementSource": "BODC",
          "MeasurementName": {
            "MeasurementObject": "Standard Pressure",
            "MeasurementQuantity": "At Top Of Atmosphere"
          }
        },
        {
          "MeasurementSource": "CF",
          "MeasurementName": {
            "MeasurementObject": "Entropy",
            "MeasurementQuantity": "At Top Of Atmosphere"
          }
        },
        {
          "MeasurementSource": "CSDMS",
          "MeasurementName": {
            "MeasurementObject": "Standard Temperature",
            "MeasurementQuantity": "At Top Of Atmosphere"
          }
        }
      ],
      "SamplingIdentifiers": [
        {
          "SamplingMethod": "Satellite overpass",
          "MeasurementConditions": "Measured at top of atmosphere (specifically at the top of the mesosphere, i.e. the mesopause).",
          "ReportingConditions": "At 50 km from the surface, pressure is 1MB and temperature is -130 degrees F."
        },
        {
          "SamplingMethod": "Satellite overpass 1",
          "MeasurementConditions": "Measured at bottom of atmosphere",
          "ReportingConditions": "At 1 km from the surface, pressure is 1MB and temperature is 32 degrees F."
        }
      ],
      'ScienceKeywords': draft_science_keywords || [
        {
          'Category': 'EARTH SCIENCE',
          'Topic': 'SOLID EARTH',
          'Term': 'ROCKS/MINERALS/CRYSTALS'
        },
        {
          'Category': 'EARTH SCIENCE',
          'Topic': 'ATMOSPHERE',
          'Term': 'ATMOSPHERIC TEMPERATURE'
        }
      ]
    }}
  end

  factory :full_variable_draft_prior_1_3, class: VariableDraft do
    transient do
      draft_short_name nil
      draft_entry_title nil
      draft_science_keywords nil
    end

    native_id 'full_variable_draft_native_id'
    provider_id 'MMT_2'
    draft_type 'VariableDraft'

    draft {{
      'Name': draft_short_name || "#{Faker::Space.galaxy}_#{Faker::Number.number(6)}",
      'LongName': draft_entry_title || "#{Faker::Space.nebula} #{Faker::Space.star_cluster} #{Faker::Number.number(6)}",
      'Definition': 'Volume mixing ratio of sum of peroxynitrates in air measured in units of Npptv (parts per trillion by volume)',
      'Units': 'Npptv',
      'DataType': 'float',
      'Dimensions': [
        {
          'Name': 'Sampling time and depth',
          'Size': 3000
        },
        {
          'Name': 'Lizard Herp Doc Pop',
          'Size': 2020
        }
      ],
      'ValidRanges': [
        {
          'Min': -417,
          'Max': 8836
        }
      ],
      'Scale': 1.0,
      'Offset': 0.0,
      'FillValues': [
        {
          'Type': 'Science',
          'Value': -9999.0,
          'Description': 'Pellentesque Bibendum Commodo Fringilla Nullam'
        },
        {
          'Type': 'Fiction',
          'Value': 111.0,
          'Description': 'Pellentesque Nullam Ullamcorper Magna'
        }
      ],
      'VariableType': 'SCIENCE_VARIABLE',
      'Sets': [
        {
          'Name': 'Science',
          'Type': 'Land',
          'Size': 50,
          'Index': 1
        },
        {
          'Name': 'Fiction',
          'Type': 'Water',
          'Size': 100,
          'Index': 2
        }
      ],
      'Characteristics': {
        'StandardName': 'Tortor Ultricies Nibh Adipiscing',
        'Reference': 'https://developer.earthdata.nasa.gov/',
        'Coordinates': '38.8059922,-77.0435327',
        'GridMapping': 'Mercator',
        'Size': 10.0,
        'SizeUnits': 'nm',
        'Bounds': 'UpperLeftPointMtrs = -180.0, 89.5; LowerRightMtrs = 177.5, -89.5',
        'ChunkSize': 100.0,
        'Structure': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'MeasurementConditions': 'Nulla vitae elit libero, a pharetra augue.',
        'ReportingConditions': 'Cras justo odio, dapibus ac facilisis in, egestas eget quam.'
      },
      'Measurements': [
        {
          'MeasurementName': 'Entropy',
          'MeasurementSource': 'Measurement source 1'
        },
        {
          'MeasurementName': 'Standard Temperature',
          'MeasurementSource': 'Measurement source 2'
        },
        {
          'MeasurementName': 'Standard Pressure',
          'MeasurementSource': 'Measurement source 3'
        }
      ],
      'ScienceKeywords': draft_science_keywords || [
        {
          'Category': 'EARTH SCIENCE',
          'Topic': 'SOLID EARTH',
          'Term': 'ROCKS/MINERALS/CRYSTALS'
        },
        {
          'Category': 'EARTH SCIENCE',
          'Topic': 'ATMOSPHERE',
          'Term': 'ATMOSPHERIC TEMPERATURE'
        }
      ]
    }}
  end

end
