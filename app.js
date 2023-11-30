const express = require('express') // require -> commonJS
const movies = require('./movies.json')
const crypto = require('node:crypto')
const cors = require('cors')
const { validateMovie, validatePartialMovie } = require('./schemas/movies')

const app = express()
app.use(express.json())
// PARA PERMITIR TODO
// app.use(cors())

// Más seguro
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:1234',
      'https://movies.com',
      'https://esteban.com'
    ]

    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
}))
app.disable('x-powered-by') // deshabilitar el header X-Powered-By: Express (watermark)

app.get('/', (req, res) => {
  res.json({ message: 'Home page' })
})

// Los recursos que sean movies se identifican con /movies
app.get('/movies', (req, res) => {
  const { genre } = req.query
  if (genre) {
    const filteredMovies = movies.filter(movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase()))
    return res.json(filteredMovies)
  }

  res.json(movies)
})

app.get('/movies/:id', (req, res) => { // path-to-regexp
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id)
  if (movie) return res.json(movie)

  res.status(404).json({ message: 'Movie not found' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  // En base de datos
  const newMovie = {
    id: crypto.randomUUID(), // uuid v4 (Identificador único universal)
    ...result.data
  }

  // Esto no sería REST, porque estamos guardando el estado en memoria
  movies.push(newMovie)

  res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
  const { id } = req.params

  const result = validatePartialMovie(req.body)
  if (result.error) return res.status(400).json({ error: JSON.parse(result.error.message) })

  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex < 0) return res.status(404).json({ message: 'Movie not found' })

  const updatedMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updatedMovie

  res.json(updatedMovie)
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params

  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex < 0) return res.status(404).json({ message: 'Movie not found' })

  movies.splice(movieIndex, 1)

  res.json({ message: 'Movie deleted' })
})

app.use((req, res) => {
  res.status(404).json({ message: 'Page not found' })
})

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`)
})
