import {useEffect, useRef} from 'react'
import {defineField, defineType, set, useFormValue} from 'sanity'

const TWO_HOURS_MS = 2 * 60 * 60 * 1000
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000

// Shifts the End Time whenever the Start Time changes, preserving the existing
// duration between Start Time and End Time (defaulting to 2 hours if either is
// unset), while still rendering the default datetime input.
function EndsAtInput(props) {
  const {value, onChange, renderDefault} = props
  const startsAt = useFormValue(['startsAt'])
  const previousStartsAt = useRef(startsAt)
  const isFirstRun = useRef(true)

  useEffect(() => {
    const prevStartsAt = previousStartsAt.current
    previousStartsAt.current = startsAt

    // Skip on initial mount so opening an existing event doesn't clobber its End Time.
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }

    if (!startsAt || startsAt === prevStartsAt) return

    const duration =
      value && prevStartsAt
        ? new Date(value).getTime() - new Date(prevStartsAt).getTime()
        : TWO_HOURS_MS

    const newEndsAt = new Date(
      new Date(startsAt).getTime() + Math.max(duration, 0),
    ).toISOString()
    onChange(set(newEndsAt))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startsAt])

  return renderDefault(props)
}

export default defineType({
  name: 'events',
  title: 'Events',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'poster',
      title: 'Poster',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'startsAt',
      title: 'Start Time',
      type: 'datetime',
      options: {timeStep: 15},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'endsAt',
      title: 'End Time',
      type: 'datetime',
      options: {timeStep: 15},
      components: {input: EndsAtInput},
      validation: (Rule) =>
        Rule.required().custom((endsAt, context) => {
          const startsAt = context.document?.startsAt

          if (!endsAt || !startsAt) return true

          const start = new Date(startsAt).getTime()
          const end = new Date(endsAt).getTime()

          if (end < start) {
            return 'End time cannot be before the start time.'
          }

          if (end - start > TWENTY_FOUR_HOURS_MS) {
            return 'End time cannot be more than 24 hours after the start time.'
          }

          return true
        }),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      initialValue: 'Vancouver Hack Space',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'mapsUrl',
      title: 'Google Maps URL (optional)',
      description: 'Leave blank to auto-generate from the location.',
      type: 'url',
      validation: (r) => r.uri({scheme: ['https']}),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
  ],
  orderings: [
    {title: 'Date, newest first', name: 'dateDesc', by: [{field: 'startsAt', direction: 'desc'}]},
  ],
  preview: {
    select: {title: 'title', media: 'poster'},
  },
})
