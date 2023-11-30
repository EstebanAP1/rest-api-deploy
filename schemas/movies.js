const z = require('zod')

const movieSchema = z.object({
  title: z.string({ invalid_type_error: 'Title must be a string.', required_error: 'Title is required.' }),
  year: z.number({ required_error: 'Year is required.', invalid_type_error: 'Year must be a number' })
    .int({ message: 'Year must be an integer' })
    .min(1900, { message: 'Min year is 1900' })
    .max(2024, { message: 'Max year is 2024.' }),
  director: z.string({ required_error: 'Director is required.', invalid_type_error: 'Director must be a string' }),
  duration: z.number({ required_error: 'Duration is required.', invalid_type_error: 'Duration must be a number' })
    .int({ message: 'Duration must be an integer' })
    .positive({ message: 'Duration must be positive' }),
  poster: z.string({ required_error: 'Movie poster is required', invalid_type_error: 'Poster must be an url' })
    .url({ message: 'Poster must be a valid URL' }),
  genre: z.array(z.enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Sci-Fi',
    'Thriller', 'Crime']), {
    required_error: 'Movie genre is required.',
    invalid_type_error: 'Movie genre must be an array of enum Genre.'
  }),
  rate: z.number({ invalid_type_error: 'Rate must be a number' })
    .min(0, { message: 'Min rate is 0' })
    .max(10, { message: 'Max rate is 10' })
    .default(5)
})

function validateMovie (object) {
  return movieSchema.safeParse(object)
}

function validatePartialMovie (object) {
  return movieSchema.partial().safeParse(object)
}

module.exports = { validateMovie, validatePartialMovie }
