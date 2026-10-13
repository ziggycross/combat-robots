import {CogIcon} from '@sanity/icons/Cog'
import {ImagesIcon} from '@sanity/icons/Images'
import {UsersIcon} from '@sanity/icons/Users'

const SINGLETON_IDS = ['siteSettings', 'sponsors', 'gallery']

export const structure = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('Site Settings'),
        ),
      S.listItem()
        .title('Sponsors')
        .icon(UsersIcon)
        .child(
          S.document()
            .schemaType('sponsors')
            .documentId('sponsors')
            .title('Sponsors'),
        ),
      S.listItem()
        .title('Gallery')
        .icon(ImagesIcon)
        .child(
          S.document()
            .schemaType('gallery')
            .documentId('gallery')
            .title('Gallery'),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => !SINGLETON_IDS.includes(item.getId()),
      ),
    ])
