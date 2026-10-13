import {defineField, defineType} from 'sanity'

// Singleton document (see sanity/structure.js) holding editable landing-page
// content that isn't tied to a repeating list, like the About section.
export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'about',
      title: 'About',
      type: 'text',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {name: 'email'}),
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram Link',
      type: 'url',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube Link',
      type: 'url',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'discordUrl',
      title: 'Discord Link',
      type: 'url',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'kofiUrl',
      title: 'Ko-fi Link',
      type: 'url',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Site Settings'}
    },
  },
})
