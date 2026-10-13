import {defineArrayMember, defineField, defineType} from 'sanity'

// Singleton document (see sanity/structure.js) holding the sponsor logos as
// an array, so editors can drag items to reorder them in the Studio instead
// of managing a manual "Display Order" number on separate documents.
export default defineType({
  name: 'sponsors',
  title: 'Sponsors',
  type: 'document',
  fields: [
    defineField({
      name: 'sponsors',
      title: 'Sponsors',
      description: 'Drag to reorder. This order is used on the site.',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'sponsor',
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'tier',
              title: 'Tier',
              description: 'Shown under the sponsor name, e.g. "Official Supplier".',
              type: 'string',
            }),
            defineField({
              name: 'url',
              title: 'Website URL',
              type: 'url',
              validation: (r) => r.uri({scheme: ['http', 'https']}),
            }),
            defineField({
              name: 'logo',
              title: 'Logo',
              type: 'image',
              options: {hotspot: true},
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: {title: 'name', subtitle: 'tier', media: 'logo'},
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Sponsors'}
    },
  },
})
