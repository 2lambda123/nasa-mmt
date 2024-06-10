import React from 'react'
import {
  render,
  screen,
  within
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockedProvider } from '@apollo/client/testing'
import {
  MemoryRouter,
  Route,
  Routes
} from 'react-router-dom'
import * as router from 'react-router'

import { DELETE_DRAFT } from '@/js/operations/mutations/deleteDraft'
import { PUBLISH_DRAFT } from '@/js/operations/mutations/publishDraft'

import conceptTypeDraftQueries from '@/js/constants/conceptTypeDraftQueries'

import errorLogger from '@/js/utils/errorLogger'
import createTemplate from '@/js/utils/createTemplate'

import Providers from '@/js/providers/Providers/Providers'

import DraftPage from '../DraftPage'

vi.mock('@/js/components/MetadataPreview/MetadataPreview')
vi.mock('@/js/utils/createTemplate')
vi.mock('@/js/utils/errorLogger')

const mockDraft = {
  conceptId: 'TD1000000-MMT',
  conceptType: 'topol-draft',
  deleted: false,
  name: null,
  nativeId: 'MMT_2331e312-cbbc-4e56-9d6f-fe217464be2c',
  providerId: 'MMT_2',
  revisionDate: '2023-12-08T16:14:28.177Z',
  revisionId: '2',
  ummMetadata: {
    MetadataSpecification: {
      URL: 'https://cdn.earthdata.nasa.gov/umm/tool/v1.1',
      Name: 'UMM-T',
      Version: '1.1'
    },
    LongName: 'Long Name'
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
  pageUrl = '/drafts/tools/TD1000000-MMT',
  path = '/drafts/tools'
}) => {
  const mocks = [{
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
              path={path}
            >
              <Route
                path=":conceptId"
                element={<DraftPage />}
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

describe('DraftPage', () => {
  test('renders the breadcrumbs', async () => {
    setup({})

    const breadcrumbs = await screen.findByRole('navigation', { name: 'breadcrumb' })
    const breadcrumbOne = within(breadcrumbs).getByText('Tool Drafts')
    const breadcrumbTwo = within(breadcrumbs).getByText('<Blank Name>')

    expect(breadcrumbOne.href).toEqual('http://localhost:3000/drafts/tools')
    expect(breadcrumbTwo).toHaveClass('active')
  })

  test('renders the provider id in a badge', async () => {
    setup({})

    expect(await screen.findByText('MMT_2')).toBeInTheDocument()
    expect(screen.getByText('MMT_2')).toHaveClass('badge')
  })

  describe('when clicking the Delete button', () => {
    test('shows the DeleteDraftModal', async () => {
      const { user } = setup({})

      const button = await screen.findByRole('button', { name: /Delete/ })
      await user.click(button)

      expect(screen.getByText('Are you sure you want to delete this draft?')).toBeInTheDocument()
    })

    describe('when clicking the Yes button in the modal', () => {
      test('calls the deleteDraft mutation and navigates to the manage/tools page', async () => {
        const navigateSpy = vi.fn()
        vi.spyOn(router, 'useNavigate').mockImplementation(() => navigateSpy)

        const { user } = setup({
          additionalMocks: [{
            request: {
              query: DELETE_DRAFT,
              variables: {
                conceptType: 'Tool',
                nativeId: 'MMT_2331e312-cbbc-4e56-9d6f-fe217464be2c',
                providerId: 'MMT_2'
              }
            },
            result: {
              data: {
                deleteDraft: {
                  conceptId: 'TD1000000-MMT',
                  revisionId: '2'
                }
              }
            }
          }]
        })

        const button = await screen.findByRole('button', { name: /Delete/ })
        await user.click(button)

        const yesButton = screen.getByRole('button', { name: 'Yes' })
        await user.click(yesButton)

        expect(navigateSpy).toHaveBeenCalledTimes(1)
        expect(navigateSpy).toHaveBeenCalledWith('/drafts/tools')
      })
    })

    describe('when clicking the Yes button in the modal results in an error', () => {
      test('calls addNotification and errorLogger', async () => {
        const navigateSpy = vi.fn()
        vi.spyOn(router, 'useNavigate').mockImplementation(() => navigateSpy)

        const { user } = setup({
          additionalMocks: [{
            request: {
              query: DELETE_DRAFT,
              variables: {
                conceptType: 'Tool',
                nativeId: 'MMT_2331e312-cbbc-4e56-9d6f-fe217464be2c',
                providerId: 'MMT_2'
              }
            },
            error: new Error('An error occurred')
          }]
        })

        const button = await screen.findByRole('button', { name: /Delete/ })
        await user.click(button)

        const yesButton = screen.getByRole('button', { name: 'Yes' })
        await user.click(yesButton)

        expect(errorLogger).toHaveBeenCalledTimes(1)
        expect(errorLogger).toHaveBeenCalledWith(new Error('An error occurred'), 'DraftPreview: deleteDraftMutation')
      })
    })

    describe('when clicking the No button in the modal', () => {
      test('does not navigate and hides the modal', async () => {
        const navigateSpy = vi.fn()
        vi.spyOn(router, 'useNavigate').mockImplementation(() => navigateSpy)

        const { user } = setup({
          additionalMocks: [{
            request: {
              query: DELETE_DRAFT,
              variables: {
                conceptType: 'Tool',
                nativeId: 'MMT_2331e312-cbbc-4e56-9d6f-fe217464be2c',
                providerId: 'MMT_2'
              }
            },
            result: {
              data: {
                deleteDraft: {
                  conceptId: 'TD1000000-MMT',
                  revisionId: '2'
                }
              }
            }
          }]
        })

        const button = await screen.findByRole('button', { name: /Delete/ })
        await user.click(button)

        const noButton = screen.getByRole('button', { name: 'No' })
        await user.click(noButton)

        expect(screen.queryByText('Are you sure you want to delete this draft?')).not.toBeInTheDocument()

        expect(navigateSpy).toHaveBeenCalledTimes(0)
      })
    })

    describe('when clicking on Publish Draft button with no errors', () => {
      test('calls the publish mutation and navigates to the concept page', async () => {
        const navigateSpy = vi.fn()
        vi.spyOn(router, 'useNavigate').mockImplementation(() => navigateSpy)

        const { user } = setup({
          additionalMocks: [{
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
                  revisionId: '2'
                }
              }
            }
          }]
        })

        const button = await screen.findByRole('button', { name: /Publish/ })
        await user.click(button)

        expect(navigateSpy).toHaveBeenCalledTimes(1)
        expect(navigateSpy).toHaveBeenCalledWith('/tools/T1000000-MMT')
      })
    })

    describe('Variable Draft Publish', () => {
      describe('when clicking the publish button', () => {
        test('publishes the draft', async () => {
          const navigateSpy = vi.fn()
          vi.spyOn(router, 'useNavigate').mockImplementation(() => navigateSpy)

          const { user } = setup({
            pageUrl: '/drafts/variables/VD1200000-MMT',
            path: 'drafts/variables',
            overrideMocks: [
              {
                request: {
                  query: conceptTypeDraftQueries.Variable,
                  variables: {
                    params: {
                      conceptId: 'VD1200000-MMT',
                      conceptType: 'Variable'
                    }
                  }
                },
                result: {
                  data: {
                    draft: {
                      conceptId: 'VD1200000-MMT',
                      conceptType: 'variable-draft',
                      deleted: false,
                      name: 'Mock Variable',
                      nativeId: 'MMT_46e9d61a-10ab-4f53-890e-06c09c2dfc80',
                      providerId: 'MMT_2',
                      revisionDate: '2024-02-15T16:57:09.667Z',
                      revisionId: '22',
                      ummMetadata: {
                        MetadataSpecification: {
                          URL: 'https://cdn.earthdata.nasa.gov/umm/variable/v1.9.0',
                          Name: 'UMM-Var',
                          Version: '1.9.0'
                        },
                        Definition: 'A sample variable record',
                        Name: 'Mock Variable',
                        LongName: 'A sample record',
                        VariableType: 'ANCILLARY_VARIABLE',
                        _private: {
                          CollectionAssociation: {
                            collectionConceptId: 'C1200000033-SEDAC',
                            shortName: 'CIESIN_SEDAC_ESI_2000',
                            version: '2000.00'
                          }
                        }
                      },
                      previewMetadata: {
                        additionalIdentifiers: null,
                        associationDetails: null,
                        conceptId: 'VD1200000-MMT',
                        dataType: null,
                        definition: 'A sample variable record',
                        dimensions: null,
                        fillValues: null,
                        indexRanges: null,
                        instanceInformation: null,
                        longName: 'A sample record',
                        measurementIdentifiers: null,
                        name: 'Demo Collection Association',
                        nativeId: 'MMT_46e9d61a-10ab-4f53-890e-06c09c2dfc80',
                        offset: null,
                        relatedUrls: null,
                        revisionId: '22',
                        samplingIdentifiers: null,
                        scale: null,
                        scienceKeywords: null,
                        sets: null,
                        standardName: null,
                        units: null,
                        validRanges: null,
                        variableSubType: null,
                        pageTitle: 'Mock Variable',
                        variableType: 'ANCILLARY_VARIABLE',
                        __typename: 'Variable'
                      },
                      __typename: 'Draft'
                    }
                  }
                }
              },
              {
                request: {
                  query: PUBLISH_DRAFT,
                  variables: {
                    draftConceptId: 'VD1200000-MMT',
                    nativeId: 'MMT_46e9d61a-10ab-4f53-890e-06c09c2dfc80',
                    ummVersion: '1.9.0'
                  }
                },
                result: {
                  data: {
                    publishDraft: {
                      conceptId: 'V1000000-MMT',
                      revisionId: '2'
                    }
                  }
                }
              }
            ]
          })

          const button = await screen.findByRole('button', { name: /Publish/ })
          await user.click(button)

          expect(navigateSpy).toHaveBeenCalledTimes(1)
          expect(navigateSpy).toHaveBeenCalledWith('/variables/V1000000-MMT')
        })
      })
    })
  })

  describe('when the draft type is collection', () => {
    const collectionDraft = {
      conceptId: 'CD1200000161-MMT_2',
      conceptType: 'collection-draft',
      deleted: false,
      name: null,
      nativeId: 'MMT_ec79d22d-b918-491a-b097-b56a71532baa',
      providerId: 'MMT_2',
      revisionDate: '2024-04-12T15:30:44.245Z',
      revisionId: '2',
      ummMetadata: {
        MetadataSpecification: {
          URL: 'https://cdn.earthdata.nasa.gov/umm/collection/v1.17.2',
          Name: 'UMM-C',
          Version: '1.17.2'
        },
        ShortName: 'Collection Draft Test',
        DataDates: null
      },
      previewMetadata: {
        abstract: null,
        accessConstraints: null,
        additionalAttributes: null,
        associationDetails: null,
        associatedDois: null,
        archiveCenter: null,
        ancillaryKeywords: null,
        archiveAndDistributionInformation: null,
        boxes: null,
        browseFlag: null,
        cloudHosted: null,
        conceptId: 'CD1200000-MMT_2',
        consortiums: null,
        collectionCitations: null,
        collectionDataType: null,
        collectionProgress: null,
        contactGroups: null,
        contactPersons: null,
        coordinateSystem: null,
        dataCenter: null,
        dataCenters: null,
        dataDates: [
          {
            type: 'CREATE'
          }
        ],
        dataLanguage: null,
        directDistributionInformation: null,
        directoryNames: null,
        doi: null,
        datasetId: null,
        nativeDataFormats: null,
        hasFormats: null,
        hasGranules: null,
        hasSpatialSubsetting: null,
        hasTemporalSubsetting: null,
        hasTransforms: null,
        hasVariables: null,
        isoTopicCategories: null,
        metadataAssociations: null,
        metadataDates: null,
        metadataLanguage: null,
        metadataFormat: null,
        onlineAccessFlag: null,
        organizations: null,
        originalFormat: null,
        lines: null,
        locationKeywords: null,
        pageTitle: null,
        paleoTemporalCoverages: null,
        platforms: null,
        points: null,
        polygons: null,
        projects: null,
        provider: null,
        publicationReferences: null,
        quality: null,
        nativeId: 'MMT_ec79d22d-b918-491a-b097-b56a71532baa',
        processingLevel: null,
        processingLevelId: null,
        purpose: null,
        revisionDate: '2024-04-12T15:30:44.245Z',
        revisionId: '2',
        relatedUrls: null,
        scienceKeywords: null,
        shortName: 'Collection Draft Test',
        spatialExtent: null,
        spatialInformation: null,
        standardProduct: null,
        summary: null,
        tags: null,
        temporalExtents: null,
        temporalKeywords: null,
        tilingIdentificationSystems: null,
        timeStart: null,
        timeEnd: null,
        title: null,
        useConstraints: null,
        versionDescription: null,
        versionId: null,
        version: null,
        __typename: 'Collection'
      },
      __typename: 'Draft'
    }

    describe('when click on save as template results in a success', () => {
      test('should navigate to /templates', async () => {
        const navigateSpy = vi.fn()
        vi.spyOn(router, 'useNavigate').mockImplementation(() => navigateSpy)
        createTemplate.mockReturnValue({ id: '1234-abcd-5678-efgh' })

        const { user } = setup({
          overrideMocks: [
            {
              request: {
                query: conceptTypeDraftQueries.Collection,
                variables: {
                  params: {
                    conceptId: 'CD1200000-MMT',
                    conceptType: 'Collection'
                  }
                }
              },
              result: {
                data: {
                  draft: collectionDraft
                }
              }
            }
          ],
          pageUrl: '/drafts/collections/CD1200000-MMT',
          path: 'drafts/collections'

        })

        const button = await screen.findByRole('button', { name: /Save as Template/ })
        await user.click(button)

        expect(navigateSpy).toHaveBeenCalledTimes(1)
        expect(navigateSpy).toHaveBeenCalledWith('/templates/collection/1234-abcd-5678-efgh')
      })
    })

    describe('when click on save as template results in a failure', () => {
      test('should navigate to /templates', async () => {
        const navigateSpy = vi.fn()
        vi.spyOn(router, 'useNavigate').mockImplementation(() => navigateSpy)
        createTemplate.mockReturnValue({})

        const { user } = setup({
          overrideMocks: [
            {
              request: {
                query: conceptTypeDraftQueries.Collection,
                variables: {
                  params: {
                    conceptId: 'CD1200000-MMT',
                    conceptType: 'Collection'
                  }
                }
              },
              result: {
                data: {
                  draft: collectionDraft
                }
              }
            }
          ],
          pageUrl: '/drafts/collections/CD1200000-MMT',
          path: 'drafts/collections'

        })

        const button = await screen.findByRole('button', { name: /Save as Template/ })
        await user.click(button)

        expect(navigateSpy).toHaveBeenCalledTimes(0)

        expect(errorLogger).toHaveBeenCalledTimes(1)
        expect(errorLogger).toHaveBeenCalledWith('Error creating template', 'DraftPreview: handleTemplate')
      })
    })
  })
})
