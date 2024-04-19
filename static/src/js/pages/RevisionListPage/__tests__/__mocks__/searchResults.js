import { GET_COLLECTION } from '../../../../operations/queries/getCollection'

export const singlePageCollectionSearch = {
  request: {
    query: GET_COLLECTION,
    variables: {
      params: {
        conceptId: 'C-00000001'
      }
    }
  },
  result: {
    data: {
      collection: {
        abstract: 'abstract',
        accessConstraints: null,
        additionalAttributes: null,
        ancillaryKeywords: null,
        archiveAndDistributionInformation: null,
        associatedDois: null,
        collectionCitations: null,
        collectionProgress: null,
        conceptId: 'C1000000000-TESTPROV',
        contactGroups: null,
        contactPersons: null,
        dataCenters: null,
        dataDates: null,
        directDistributionInformation: null,
        doi: null,
        granules: {
          count: 1,
        },
        isoTopicCategories: null,
        locationKeywords: null,
        nativeId: '1',
        metadataAssociations: null,
        metadataDates: null,
        paleoTemporalCoverages: null,
        platforms: null,
        processingLevel: null,
        projects: null,
        publicationReferences: null,
        purpose: null,
        quality: null,
        relatedCollections: null,
        relatedUrls: null,
        scienceKeywords: null,
        services: null,
        spatialExtent: null,
        spatialInformation: null,
        standardProduct: null,
        tags: null,
        tagDefinitions: null,
        temporalExtents: null,
        tilingIdentificationSystems: null,
        title: null,
        tools: null,
        useConstraints: null,
        variables: null,
        versionDescription: null,
        versionId: null,
        userId: null,
        ummMetadata: {},
        shortName: 'Collection Short Name 1',
        version: '1',
        revisionId: 2,
        title: 'Collection Title 1',
        pageTitle: 'Collection Title 1',
        provider: 'TESTPROV',
        granules: {
          count: 1000
        },
        revisions: {
          count: 2,
          items: [
            {
              abstract: 'abstract',
              accessConstraints: null,
              additionalAttributes: null,
              ancillaryKeywords: null,
              archiveAndDistributionInformation: null,
              associatiedDois: null,
              collectionCitations: null,
              collectionProgress: null,
              conceptId: 'C1000000000-TESTPROV',
              contactGroups: null,
              contactPersons: null,
              dataCenters: null,
              dataDates: null,
              directDistributionInformation: null,
              doi: null,
              granules: {
                count: 1,
              },
              isoTopicCategories: null,
              locationKeywords: null,
              nativeId: '1',
              metadataAssociations: null,
              metadataDates: null,
              paleoTemporalCoverages: null,
              platforms: null,
              processingLevel: null,
              projects: null,
              publicationReferences: null,
              purpose: null,
              quality: null,
              relatedCollections: null,
              relatedUrls: null,
              scienceKeywords: null,
              services: null,
              spatialExtent: null,
              spatialInformation: null,
              standardProduct: null,
              tags: null,
              tagDefinitions: null,
              temporalExtents: null,
              tilingIdentificationSystems: null,
              title: null,
              tools: null,
              useConstraints: null,
              variables: null,
              versionDescription: null,
              versionId: null,
              userId: null,
              ummMetadata: {},
              shortName: 'Collection Short Name 1',
              version: '1',
              revisionId: 2,
              title: 'Collection Title 1',
              pageTitle: 'Collection Title 1',
              provider: 'TESTPROV',
              granules: {
                count: 1000
              },
              tags: {
                'test.tag.one': {
                  data: 'Tag Data 1'
                }
              },
              tagDefinitions: {
                items: [{
                  conceptId: 'C100000',
                  description: 'Mock tag description',
                  originatorId: 'test.user',
                  revisionId: '1',
                  tagKey: 'Mock tag key'
                }]
              },
              temporalKeywords: null,
              userId: null,
              ummMetadata: {},
              entryTitle: null,
              revisionDate: '2023-11-30 00:00:00'
            },
            {
              abstract: 'abstract',
              accessConstraints: null,
              additionalAttributes: null,
              ancillaryKeywords: null,
              archiveAndDistributionInformation: null,
              associatiedDois: null,
              collectionCitations: null,
              collectionProgress: null,
              conceptId: 'C1000000000-TESTPROV',
              contactGroups: null,
              contactPersons: null,
              dataCenters: null,
              dataDates: null,
              directDistributionInformation: null,
              doi: null,
              granules: {
                count: 1,
              },
              isoTopicCategories: null,
              locationKeywords: null,
              nativeId: '1',
              metadataAssociations: null,
              metadataDates: null,
              paleoTemporalCoverages: null,
              platforms: null,
              processingLevel: null,
              projects: null,
              publicationReferences: null,
              purpose: null,
              quality: null,
              relatedCollections: null,
              relatedUrls: null,
              scienceKeywords: null,
              services: null,
              spatialExtent: null,
              spatialInformation: null,
              standardProduct: null,
              tags: null,
              tagDefinitions: null,
              temporalExtents: null,
              tilingIdentificationSystems: null,
              title: null,
              tools: null,
              useConstraints: null,
              variables: null,
              versionDescription: null,
              versionId: null,
              userId: null,
              ummMetadata: {},
              shortName: 'Collection Short Name 1',
              version: '1',
              revisionId: 2,
              title: 'Collection Title 1',
              pageTitle: 'Collection Title 1',
              provider: 'TESTPROV',
              granules: {
                count: 1000
              },
              tags: {
                'test.tag.one': {
                  data: 'Tag Data 1'
                }
              },
              tagDefinitions: {
                items: [{
                  conceptId: 'C100000',
                  description: 'Mock tag description',
                  originatorId: 'test.user',
                  revisionId: '1',
                  tagKey: 'Mock tag key'
                }]
              },
              temporalKeywords: null,
              userId: null,
              ummMetadata: {},
              entryTitle: null,
              revisionDate: '2023-11-30 00:00:00'
            }
          ]
        },
        tags: {
          'test.tag.one': {
            data: 'Tag Data 1'
          }
        },
        tagDefinitions: {
          items: [{
            conceptId: 'C100000',
            description: 'Mock tag description',
            originatorId: 'test.user',
            revisionId: '1',
            tagKey: 'Mock tag key'
          }]
        },
        temporalKeywords: null,
        userId: null,
        ummMetadata: {},
        entryTitle: null,
        revisionDate: '2023-11-30 00:00:00',
        previewMetadata: {}
      }
    }
  }
}
