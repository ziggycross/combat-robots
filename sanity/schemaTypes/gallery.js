import {defineArrayMember, defineField, defineType} from 'sanity'

// Singleton document (see sanity/structure.js) holding the "Battle Photos"
// gallery as a reorderable array, so editors can drag images to reorder
// them in the Studio (the array order is the display order).
export default defineType({
  name: 'gallery',
  title: 'Gallery',
  type: 'document',
  fields: [
    defineField({
      name: 'images',
      title: 'Battle Photos',
      description: 'Drag to reorder. This order is used on the site.',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'image',
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
            }),
          ],
        }),
      ],
      options: {
        layout: 'grid',
      },
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Gallery'}
    },
  },
})
