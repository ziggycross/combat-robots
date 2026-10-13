import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

const SINGLETON_TYPES = ['siteSettings', 'sponsors', 'gallery']

export default defineConfig({
  name: 'default',
  title: 'Vancouver Combat Robots',
  projectId: 'ljvmc7dl',
  dataset: 'production',
  plugins: [structureTool({structure})],
  schema: {types: schemaTypes},
  document: {
    newDocumentOptions: (prev, {creationContext}) => {
      if (creationContext.type === 'global') {
        return prev.filter((item) => !SINGLETON_TYPES.includes(item.templateId))
      }
      return prev
    },
    actions: (prev, {schemaType}) =>
      SINGLETON_TYPES.includes(schemaType)
        ? prev.filter((action) => !['duplicate', 'delete'].includes(action.action))
        : prev,
  },
})
