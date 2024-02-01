import { gql } from '@apollo/client'

export const SERVICE_DRAFT = gql`
  query ServiceDraft($params: DraftInput) {
    draft(params: $params) {
      conceptId
      conceptType
      deleted
      name
      nativeId
      providerId
      revisionDate
      revisionId
      ummMetadata
      previewMetadata {
        ... on Service {
          accessConstraints
          ancillaryKeywords
          associationDetails
          conceptId
          contactGroups
          contactPersons
          description
          lastUpdatedDate
          longName
          maxItemsPerOrder
          name
          nativeId
          operationMetadata
          providerId
          relatedUrls
          serviceKeywords
          serviceOptions
          serviceOrganizations
          supportedInputProjections
          supportedOutputProjections
          supportedReformattings
          serviceQuality
          type
          url
          useConstraints
          version
          versionDescription
        }
      }
    }
  }
`

// Example Services:
// {
//   "params": {
//     "conceptId": "SD1200000096-MMT_2",
//     "conceptType": "Service"
//   }
// }
