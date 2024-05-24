import React, {
  Suspense,
  useEffect,
  useRef
} from 'react'
import {
  render,
  screen,
  waitFor
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockedProvider } from '@apollo/client/testing'
import {
  MemoryRouter,
  Route,
  Routes
} from 'react-router-dom'
import Form from '@rjsf/core'
import * as router from 'react-router'

import conceptTypeDraftQueries from '@/js/constants/conceptTypeDraftQueries'

import errorLogger from '@/js/utils/errorLogger'

import relatedUrlsUiSchema from '@/js/schemas/uiSchemas/tools/relatedUrls'
import toolInformationUiSchema from '@/js/schemas/uiSchemas/tools/toolInformation'
import ummTSchema from '@/js/schemas/umm/ummTSchema'
import toolsConfiguration from '@/js/schemas/uiForms/toolsConfiguration'

import BoundingRectangleField from '@/js/components/BoundingRectangleField/BoundingRectangleField'
import CustomArrayFieldTemplate from '@/js/components/CustomArrayFieldTemplate/CustomArrayFieldTemplate'
import CustomCountrySelectWidget from '@/js/components/CustomCountrySelectWidget/CustomCountrySelectWidget'
import CustomDateTimeWidget from '@/js/components/CustomDateTimeWidget/CustomDateTimeWidget'
import CustomFieldTemplate from '@/js/components/CustomFieldTemplate/CustomFieldTemplate'
import CustomRadioWidget from '@/js/components/CustomRadioWidget/CustomRadioWidget'
import CustomSelectWidget from '@/js/components/CustomSelectWidget/CustomSelectWidget'
import CustomTextareaWidget from '@/js/components/CustomTextareaWidget/CustomTextareaWidget'
import CustomTextWidget from '@/js/components/CustomTextWidget/CustomTextWidget'
import CustomTitleField from '@/js/components/CustomTitleField/CustomTitleField'
import CustomTitleFieldTemplate from '@/js/components/CustomTitleFieldTemplate/CustomTitleFieldTemplate'
import FormNavigation from '@/js/components/FormNavigation/FormNavigation'
import GridLayout from '@/js/components/GridLayout/GridLayout'
import JsonPreview from '@/js/components/JsonPreview/JsonPreview'
import KeywordPicker from '@/js/components/KeywordPicker/KeywordPicker'
import OneOfField from '@/js/components/OneOfField/OneOfField'
import StreetAddressField from '@/js/components/StreetAddressField/StreetAddressField'

import Providers from '@/js/providers/Providers/Providers'

import { GET_AVAILABLE_PROVIDERS } from '@/js/operations/queries/getAvailableProviders'
import { INGEST_DRAFT } from '@/js/operations/mutations/ingestDraft'
import { PUBLISH_DRAFT } from '@/js/operations/mutations/publishDraft'

import MetadataForm from '../MetadataForm'

vi.mock('@rjsf/core', () => ({
  default: vi.fn(({
    onChange,
    onBlur,
    formData,
    formContext = {}
  }) => {
    const { focusField } = formContext
    const shouldFocus = focusField === 'Name'
    const focusRef = useRef()

    useEffect(() => {
      // This useEffect for shouldFocus lets the refs be in place before trying to use them
      if (shouldFocus) {
        focusRef.current?.focus()
      }
    }, [shouldFocus])

    return (
      // This mock component renders a single input field for a 'Name' field. This allows the
      // tests that need to call onChange/onBlur to actually modify the state/context in MetadataForm
      <mock-Component data-testid="MockForm">
        <input
          id="Name"
          name="Name"
          ref={focusRef}
          onChange={
            (event) => {
              const { value } = event.target

              onChange({
                formData: {
                  Name: value
                }
              })
            }
          }
          onBlur={() => onBlur('mock-name')}
          value={formData.Name || ''}
        />
      </mock-Component>
    )
  })
}))

vi.mock('@/js/components/ErrorBanner/ErrorBanner')
vi.mock('@/js/components/JsonPreview/JsonPreview')
vi.mock('@/js/components/FormNavigation/FormNavigation')
vi.mock('@/js/utils/errorLogger')

const mockedUsedNavigate = vi.fn()

vi.mock('react-router-dom', async () => ({
  ...await vi.importActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => 'mock-uuid'
  }
})

const mockDraft = {
  conceptId: 'TD1000000-MMT',
  conceptType: 'tool-draft',
  deleted: false,
  name: null,
  nativeId: 'MMT_2331e312-cbbc-4e56-9d6f-fe217464be2c',
  providerId: 'MMT_2',
  revisionDate: '2023-12-08T16:14:28.177Z',
  revisionId: '2',
  ummMetadata: {
    LongName: 'Long Name',
    MetadataSpecification: {
      URL: 'https://cdn.earthdata.nasa.gov/umm/tool/v1.1',
      Name: 'UMM-T',
      Version: '1.1'
    }
  },
  previewMetadata: {
    accessConstraints: null,
    ancillaryKeywords: null,
    associationDetails: null,
    conceptId: 'TD1000000-MMT',
    contactGroups: null,
    contactPersons: null,
    description: null,
    doi: null,
    nativeId: 'MMT_2331e312-cbbc-4e56-9d6f-fe217464be2c',
    lastUpdatedDate: null,
    longName: 'Long Name',
    metadataSpecification: {
      url: 'https://cdn.earthdata.nasa.gov/umm/tool/v1.1',
      name: 'UMM-T',
      version: '1.1'
    },
    name: null,
    organizations: null,
    pageTitle: null,
    potentialAction: null,
    quality: null,
    relatedUrls: null,
    revisionId: '2',
    searchAction: null,
    supportedBrowsers: null,
    supportedInputFormats: null,
    supportedOperatingSystems: null,
    supportedOutputFormats: null,
    supportedSoftwareLanguages: null,
    toolKeywords: null,
    type: null,
    url: null,
    useConstraints: null,
    version: null,
    versionDescription: null,
    __typename: 'Tool'
  },
  __typename: 'Draft'
}

const setup = ({
  additionalMocks = [],
  overrideMocks = false,
  pageUrl = '/drafts/tools/TD1000000-MMT/tool-information'
}) => {
  const mocks = [{
    request: {
      query: GET_AVAILABLE_PROVIDERS,
      variables: {
        params: {
          limit: 500,
          // Don't have an easy way to get a real uid into the context here
          permittedUser: undefined,
          target: 'PROVIDER_CONTEXT'
        }
      }
    },
    result: {
      data: {
        acls: {
          items: [{
            conceptId: 'mock-id-2',
            providerIdentity: {
              provider_id: 'MMT_2'
            }
          }]
        }
      }
    }
  }, {
    request: {
      query: conceptTypeDraftQueries.Tool,
      variables: {
        params: {
          conceptId: 'TD1000000-MMT',
          conceptType: 'Tool'
        }
      }
    },
    result: {
      data: {
        draft: mockDraft
      }
    }
  }, ...additionalMocks]

  const user = userEvent.setup()

  render(
    <Providers>
      <MockedProvider
        mocks={overrideMocks || mocks}
      >
        <MemoryRouter initialEntries={[pageUrl]}>
          <Routes>
            <Route
              path="/drafts/:draftType"
            >
              <Route
                element={
                  (
                    <Suspense>
                      <MetadataForm />
                    </Suspense>
                  )
                }
                path="new"
              />
              <Route
                path=":conceptId/:sectionName"
                element={
                  (
                    <Suspense>
                      <MetadataForm />
                    </Suspense>
                  )
                }
              />
              <Route
                path=":conceptId/:sectionName/:fieldName"
                element={
                  (
                    <Suspense>
                      <MetadataForm />
                    </Suspense>
                  )
                }
              />
            </Route>
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    </Providers>
  )

  return {
    user
  }
}

describe('MetadataForm', () => {
  describe('when the concept type is a Tool draft', () => {
    describe('when on the related-urls form', () => {
      test('renders a Form component', async () => {
        setup({
          pageUrl: '/drafts/tools/TD1000000-MMT/related-urls'
        })

        await waitForResponse()

        expect(Form).toHaveBeenCalledTimes(2)
        expect(Form).toHaveBeenCalledWith(expect.objectContaining({
          fields: {
            BoundingRectangle: BoundingRectangleField,
            AnyOfField: expect.any(Function),
            OneOfField,
            TitleField: CustomTitleField,
            keywordPicker: KeywordPicker,
            layout: GridLayout,
            streetAddresses: StreetAddressField
          },
          formData: {
            LongName: 'Long Name',
            MetadataSpecification: {
              Name: 'UMM-T',
              URL: 'https://cdn.earthdata.nasa.gov/umm/tool/v1.1',
              Version: '1.1'
            }
          },
          schema: expect.objectContaining({
            properties: expect.objectContaining({
              RelatedURLs: {
                description:
                  'A URL associated with the web user interface or downloadable tool, e.g., the home page for the tool provider which is responsible for the tool.',
                type: 'array',
                items: {
                  $ref: '#/definitions/RelatedURLType'
                },
                minItems: 0
              }
            })
          }),
          uiSchema: relatedUrlsUiSchema,
          templates: {
            ArrayFieldTemplate: CustomArrayFieldTemplate,
            FieldTemplate: CustomFieldTemplate,
            TitleFieldTemplate: CustomTitleFieldTemplate
          },
          widgets: {
            CheckboxWidget: CustomRadioWidget,
            CountrySelectWidget: CustomCountrySelectWidget,
            DateTimeWidget: CustomDateTimeWidget,
            RadioWidget: CustomRadioWidget,
            SelectWidget: CustomSelectWidget,
            TextWidget: CustomTextWidget,
            TextareaWidget: CustomTextareaWidget
          }
        }), {})
      })
    })

    describe('when rendering a new draft form', () => {
      test('renders the Form component for the tool-information page', async () => {
        setup({
          overrideMocks: [],
          pageUrl: '/drafts/tools/new'
        })

        expect(Form).toHaveBeenCalledTimes(2)
        expect(Form).toHaveBeenCalledWith(expect.objectContaining({
          fields: {
            BoundingRectangle: BoundingRectangleField,
            AnyOfField: expect.any(Function),
            OneOfField,
            TitleField: CustomTitleField,
            keywordPicker: KeywordPicker,
            layout: GridLayout,
            streetAddresses: StreetAddressField
          },
          formData: {},
          schema: expect.objectContaining({
            properties: expect.objectContaining({
              Name: {
                description: 'The name of the downloadable tool or web user interface.',
                type: 'string',
                minLength: 1,
                maxLength: 85
              }
            })
          }),
          uiSchema: toolInformationUiSchema,
          templates: {
            ArrayFieldTemplate: CustomArrayFieldTemplate,
            FieldTemplate: CustomFieldTemplate,
            TitleFieldTemplate: CustomTitleFieldTemplate
          },
          widgets: {
            CheckboxWidget: CustomRadioWidget,
            CountrySelectWidget: CustomCountrySelectWidget,
            DateTimeWidget: CustomDateTimeWidget,
            RadioWidget: CustomRadioWidget,
            SelectWidget: CustomSelectWidget,
            TextWidget: CustomTextWidget,
            TextareaWidget: CustomTextareaWidget
          }
        }), {})
      })
    })

    test('renders a FormNavigation component', async () => {
      setup({})

      await waitForResponse()

      expect(FormNavigation).toHaveBeenCalledTimes(2)
      expect(FormNavigation).toHaveBeenCalledWith(expect.objectContaining({
        draft: {
          LongName: 'Long Name',
          MetadataSpecification: {
            URL: 'https://cdn.earthdata.nasa.gov/umm/tool/v1.1',
            Name: 'UMM-T',
            Version: '1.1'
          }
        },
        formSections: toolsConfiguration,
        loading: false,
        schema: ummTSchema,
        visitedFields: []
      }), {})
    })

    test('renders a JsonPreview component', async () => {
      setup({})

      await waitForResponse()

      expect(JsonPreview).toHaveBeenCalledTimes(2)
    })
  })

  describe('when FormNavigation sends onCancel', () => {
    beforeEach(() => {
      FormNavigation.mockImplementation(
        vi.importActual('@/js/components/FormNavigation/FormNavigation').default
      )
    })

    test('resets the form to the original values', async () => {
      const { user } = setup({})

      await waitForResponse()

      // Fill out a form field
      const nameField = screen.getByRole('textbox', { id: 'Name' })
      await user.type(nameField, 'Test Name')
      await waitFor(async () => {
        await nameField.blur()
      })

      expect(nameField).toHaveValue('Test Name')
      expect(FormNavigation).toHaveBeenCalledTimes(13)
      expect(FormNavigation).toHaveBeenCalledWith(expect.objectContaining({
        visitedFields: ['mock-name']
      }), {})

      vi.clearAllMocks()

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      await user.click(cancelButton)

      expect(nameField).toHaveValue('')
      expect(FormNavigation).toHaveBeenCalledTimes(1)
      expect(FormNavigation).toHaveBeenCalledWith(expect.objectContaining({
        visitedFields: []
      }), {})
    })
  })

  describe('when FormNavigation sends onChange', () => {
    beforeEach(() => {
      FormNavigation.mockImplementation(
        vi.importActual('@/js/components/FormNavigation/FormNavigation').default
      )
    })

    test('updates the draft context value', async () => {
      const { user } = setup({})

      await waitForResponse()

      // Fill out a form field
      const nameField = screen.getByRole('textbox', { id: 'Name' })
      await user.type(nameField, 'Test Name')

      expect(Form).toHaveBeenCalledWith(expect.objectContaining({
        formData: {
          Name: 'Test Name'
        }
      }), {})
    })
  })

  describe('when FormNavigation sends onBlur', () => {
    beforeEach(() => {
      FormNavigation.mockImplementation(
        vi.importActual('@/js/components/FormNavigation/FormNavigation').default
      )
    })

    test('sets the field as a visistedField', async () => {
      const { user } = setup({})

      await waitForResponse()

      // Fill out a form field
      const nameField = screen.getByRole('textbox', { id: 'Name' })
      await user.click(nameField)
      await waitFor(async () => {
        await nameField.blur()
      })

      expect(FormNavigation).toHaveBeenCalledWith(expect.objectContaining({
        visitedFields: ['mock-name']
      }), {})
    })
  })

  describe('when FormNavigation sends onSave', () => {
    beforeEach(() => {
      FormNavigation.mockImplementation(
        vi.importActual('@/js/components/FormNavigation/FormNavigation').default
      )
    })

    describe('when the saveType is save', () => {
      test('navigates to the current form and calls scrolls to the top', async () => {
        const navigateSpy = vi.fn()
        vi.spyOn(router, 'useNavigate').mockImplementation(() => navigateSpy)

        const { user } = setup({
          additionalMocks: [{
            request: {
              query: INGEST_DRAFT,
              variables: {
                conceptType: 'Tool',
                metadata: {
                  LongName: 'Long Name',
                  MetadataSpecification: {
                    URL: 'https://cdn.earthdata.nasa.gov/umm/tool/v1.1',
                    Name: 'UMM-T',
                    Version: '1.1'
                  }
                },
                nativeId: 'MMT_2331e312-cbbc-4e56-9d6f-fe217464be2c',
                providerId: 'MMT_2',
                ummVersion: '1.0.0'
              }
            },
            result: {
              data: {
                ingestDraft: {
                  conceptId: 'TD1000000-MMT',
                  revisionId: '3'
                }
              }
            }
          }]
        })

        await waitForResponse()

        const dropdown = screen.getByRole('button', { name: 'Save Options' })
        await user.click(dropdown)

        const button = screen.getByRole('button', { name: 'Save' })
        await user.click(button)

        await waitForResponse()

        expect(navigateSpy).toHaveBeenCalledTimes(1)
        expect(navigateSpy).toHaveBeenCalledWith('/drafts/tools/TD1000000-MMT/tool-information', { replace: true })

        expect(window.scroll).toHaveBeenCalledTimes(1)
        expect(window.scroll).toHaveBeenCalledWith(0, 0)
      })
    })

    describe('when the saveType is save and continue', () => {
      test('navigates to the current form and calls scrolls to the top', async () => {
        const navigateSpy = vi.fn()
        vi.spyOn(router, 'useNavigate').mockImplementation(() => navigateSpy)

        const { user } = setup({
          additionalMocks: [{
            request: {
              query: INGEST_DRAFT,
              variables: {
                conceptType: 'Tool',
                metadata: {
                  LongName: 'Long Name',
                  MetadataSpecification: {
                    URL: 'https://cdn.earthdata.nasa.gov/umm/tool/v1.1',
                    Name: 'UMM-T',
                    Version: '1.1'
                  }
                },
                nativeId: 'MMT_2331e312-cbbc-4e56-9d6f-fe217464be2c',
                providerId: 'MMT_2',
                ummVersion: '1.0.0'
              }
            },
            result: {
              data: {
                ingestDraft: {
                  conceptId: 'TD1000000-MMT',
                  revisionId: '3'
                }
              }
            }
          }]
        })

        await waitForResponse()

        const button = screen.getByRole('button', { name: 'Save & Continue' })
        await user.click(button)

        await waitForResponse()

        expect(navigateSpy).toHaveBeenCalledTimes(1)
        expect(navigateSpy).toHaveBeenCalledWith('/drafts/tools/TD1000000-MMT/related-urls')

        expect(window.scroll).toHaveBeenCalledTimes(1)
        expect(window.scroll).toHaveBeenCalledWith(0, 0)
      })
    })

    describe('when the saveType is save and preview', () => {
      test('navigates to the current form and calls scrolls to the top', async () => {
        const navigateSpy = vi.fn()
        vi.spyOn(router, 'useNavigate').mockImplementation(() => navigateSpy)

        const { user } = setup({
          additionalMocks: [{
            request: {
              query: INGEST_DRAFT,
              variables: {
                conceptType: 'Tool',
                metadata: {
                  LongName: 'Long Name',
                  MetadataSpecification: {
                    URL: 'https://cdn.earthdata.nasa.gov/umm/tool/v1.1',
                    Name: 'UMM-T',
                    Version: '1.1'
                  }
                },
                nativeId: 'MMT_2331e312-cbbc-4e56-9d6f-fe217464be2c',
                providerId: 'MMT_2',
                ummVersion: '1.0.0'
              }
            },
            result: {
              data: {
                ingestDraft: {
                  conceptId: 'TD1000000-MMT',
                  revisionId: '3'
                }
              }
            }
          }]
        })

        await waitForResponse()

        const dropdown = screen.getByRole('button', { name: 'Save Options' })
        await user.click(dropdown)

        const button = screen.getByRole('button', { name: 'Save & Preview' })
        await user.click(button)

        await waitForResponse()

        expect(navigateSpy).toHaveBeenCalledTimes(1)
        expect(navigateSpy).toHaveBeenCalledWith('/drafts/tools/TD1000000-MMT')

        expect(window.scroll).toHaveBeenCalledTimes(1)
        expect(window.scroll).toHaveBeenCalledWith(0, 0)
      })
    })

    describe('when the saveType is save and publish', () => {
      test('it should save the draft and call publish', async () => {
        const navigateSpy = vi.fn()
        vi.spyOn(router, 'useNavigate').mockImplementation(() => navigateSpy)

        const { user } = setup({
          additionalMocks: [{
            request: {
              query: INGEST_DRAFT,
              variables: {
                conceptType: 'Tool',
                metadata: {
                  LongName: 'Long Name',
                  MetadataSpecification: {
                    URL: 'https://cdn.earthdata.nasa.gov/umm/tool/v1.1',
                    Name: 'UMM-T',
                    Version: '1.1'
                  }
                },
                nativeId: 'MMT_2331e312-cbbc-4e56-9d6f-fe217464be2c',
                providerId: 'MMT_2',
                ummVersion: '1.0.0'
              }
            },
            result: {
              data: {
                ingestDraft: {
                  conceptId: 'TD1000000-MMT',
                  revisionId: '1'
                }
              }
            }
          },
          {
            request: {
              query: PUBLISH_DRAFT,
              variables: {
                draftConceptId: 'TD1000000-MMT',
                nativeId: 'MMT_2331e312-cbbc-4e56-9d6f-fe217464be2c',
                ummVersion: '1.2.0'
              }
            },
            result: {
              data: {
                publishDraft: {
                  conceptId: 'T1000000-MMT',
                  revisionId: '1'
                }
              }
            }
          }
          ]
        })

        await waitForResponse()

        const dropdown = screen.getByRole('button', { name: 'Save Options' })

        await user.click(dropdown)

        const button = screen.getByRole('button', { name: 'Save & Publish' })
        await user.click(button)

        await waitForResponse()

        expect(navigateSpy).toHaveBeenCalledTimes(1)
        expect(navigateSpy).toHaveBeenCalledWith('/tools/T1000000-MMT/revisions/1')
      })
    })

    describe('when the ingest mutation returns an error', () => {
      test('calls errorLogger', async () => {
        const navigateSpy = vi.fn()
        vi.spyOn(router, 'useNavigate').mockImplementation(() => navigateSpy)

        const { user } = setup({
          additionalMocks: [{
            request: {
              query: INGEST_DRAFT,
              variables: {
                conceptType: 'Tool',
                metadata: {
                  LongName: 'Long Name',
                  MetadataSpecification: {
                    URL: 'https://cdn.earthdata.nasa.gov/umm/tool/v1.1',
                    Name: 'UMM-T',
                    Version: '1.1'
                  }
                },
                nativeId: 'MMT_2331e312-cbbc-4e56-9d6f-fe217464be2c',
                providerId: 'MMT_2',
                ummVersion: '1.0.0'
              }
            },
            error: new Error('An error occured')
          }]
        })

        await waitForResponse()

        const button = screen.getByRole('button', { name: 'Save & Continue' })
        await user.click(button)

        await waitForResponse()

        expect(navigateSpy).toHaveBeenCalledTimes(0)

        expect(errorLogger).toHaveBeenCalledTimes(1)
        expect(errorLogger).toHaveBeenCalledWith(new Error('An error occured'), 'MetadataForm: ingestDraftMutation')
      })
    })
  })

  describe('when the page is loaded with a fieldName in the URL', () => {
    test('sets the focus field and calls navigate to remove the fieldName from the URL', async () => {
      const navigateSpy = vi.fn()
      vi.spyOn(router, 'useNavigate').mockImplementation(() => navigateSpy)

      setup({
        pageUrl: '/drafts/tools/TD1000000-MMT/tool-information/Name'
      })

      expect(await screen.findByRole('textbox', { value: 'Name' })).toHaveFocus()

      expect(navigateSpy).toHaveBeenCalledTimes(1)
      expect(navigateSpy).toHaveBeenCalledWith('/drafts/tools/TD1000000-MMT/tool-information', { replace: true })
    })
  })
})
