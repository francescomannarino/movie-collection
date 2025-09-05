import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { movieAPI, searchAPI } from '../services/api'

const useMovieStore = create(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // State
          movies: [],
          searchResults: [],
          stats: null,
          selectedMovie: null,
          
          // Loading states
          isLoading: false,
          isSearching: false,
          isLoadingMore: false,
          
          // Pagination
          currentPage: 1,
          hasMore: true,
          totalMovies: 0,
          
          // Filters
          filters: {
            format: null,
            genre: null,
            search: '',
            year: null,
            sortBy: 'dateAdded',
            sortOrder: 'desc'
          },
          
          // Error handling
          error: null,
          
          // Actions
          setLoading: (loading) => set((state) => {
            state.isLoading = loading
          }),
          
          setSearching: (searching) => set((state) => {
            state.isSearching = searching
          }),
          
          setError: (error) => set((state) => {
            state.error = error
          }),
          
          clearError: () => set((state) => {
            state.error = null
          }),
          
          // Movie selection
          selectMovie: (movie) => set((state) => {
            state.selectedMovie = movie
          }),
          
          clearSelectedMovie: () => set((state) => {
            state.selectedMovie = null
          }),
          
          // Filters
          setFilters: (newFilters) => set((state) => {
            state.filters = { ...state.filters, ...newFilters }
            state.currentPage = 1
            state.hasMore = true
          }),
          
          clearFilters: () => set((state) => {
            state.filters = {
              format: null,
              genre: null,
              search: '',
              year: null,
              sortBy: 'dateAdded',
              sortOrder: 'desc'
            }
            state.currentPage = 1
            state.hasMore = true
          }),
          
          // Fetch movies
          fetchMovies: async (reset = true) => {
            const state = get()
            
            if (reset) {
              set((draft) => {
                draft.isLoading = true
                draft.error = null
                draft.currentPage = 1
              })
            } else {
              set((draft) => {
                draft.isLoadingMore = true
              })
            }
            
            try {
              const response = await movieAPI.getMovies({
                page: reset ? 1 : state.currentPage,
                limit: 20,
                ...state.filters
              })
              
              if (response.success) {
                set((draft) => {
                  if (reset) {
                    draft.movies = response.data.movies
                  } else {
                    draft.movies.push(...response.data.movies)
                  }
                  
                  draft.totalMovies = response.data.pagination.totalCount
                  draft.hasMore = response.data.pagination.hasNext
                  draft.currentPage = response.data.pagination.currentPage
                })
              } else {
                throw new Error(response.error || 'Errore nel caricamento dei film')
              }
            } catch (error) {
              console.error('Error fetching movies:', error)
              set((draft) => {
                draft.error = error.message
              })
            } finally {
              set((draft) => {
                draft.isLoading = false
                draft.isLoadingMore = false
              })
            }
          },
          
          // Load more movies
          loadMoreMovies: async () => {
            const state = get()
            if (state.isLoadingMore || !state.hasMore) return
            
            set((draft) => {
              draft.currentPage += 1
            })
            
            await get().fetchMovies(false)
          },
          
          // Search movies
          searchMovies: async (query, page = 1) => {
            set((state) => {
              state.isSearching = true
              state.error = null
            })
            
            try {
              const response = await searchAPI.searchMovies(query, page)
              
              if (response.success) {
                set((draft) => {
                  if (page === 1) {
                    draft.searchResults = response.data.results
                  } else {
                    draft.searchResults.push(...response.data.results)
                  }
                })
                return response.data
              } else {
                throw new Error(response.error || 'Errore nella ricerca')
              }
            } catch (error) {
              console.error('Error searching movies:', error)
              set((draft) => {
                draft.error = error.message
              })
              return null
            } finally {
              set((draft) => {
                draft.isSearching = false
              })
            }
          },
          
          // Clear search results
          clearSearchResults: () => set((state) => {
            state.searchResults = []
          }),
          
          // Add movie to collection
          addMovieToCollection: async (tmdbId, formats) => {
            set((state) => {
              state.isLoading = true
              state.error = null
            })
            
            try {
              const response = await movieAPI.addMovie(tmdbId, formats)
              
              if (response.success) {
                // Add to local state
                set((draft) => {
                  const existingIndex = draft.movies.findIndex(m => m.tmdbId === tmdbId)
                  if (existingIndex >= 0) {
                    // Update existing movie
                    draft.movies[existingIndex] = response.data
                  } else {
                    // Add new movie at the beginning
                    draft.movies.unshift(response.data)
                    draft.totalMovies += 1
                  }
                  
                  // Update search results
                  const searchIndex = draft.searchResults.findIndex(m => m.tmdbId === tmdbId)
                  if (searchIndex >= 0) {
                    draft.searchResults[searchIndex].inCollection = true
                    draft.searchResults[searchIndex].ownedFormats = formats
                  }
                })
                
                return response.data
              } else {
                throw new Error(response.error || 'Errore nell\'aggiunta del film')
              }
            } catch (error) {
              console.error('Error adding movie:', error)
              set((draft) => {
                draft.error = error.message
              })
              throw error
            } finally {
              set((draft) => {
                draft.isLoading = false
              })
            }
          },
          
          // Update movie formats
          updateMovieFormats: async (movieId, formats) => {
            try {
              const response = await movieAPI.updateMovie(movieId, formats)
              
              if (response.success) {
                set((draft) => {
                  const index = draft.movies.findIndex(m => m._id === movieId)
                  if (index >= 0) {
                    draft.movies[index] = response.data
                  }
                })
                return response.data
              } else {
                throw new Error(response.error || 'Errore nell\'aggiornamento del film')
              }
            } catch (error) {
              console.error('Error updating movie:', error)
              set((draft) => {
                draft.error = error.message
              })
              throw error
            }
          },
          
          // Remove movie from collection
          removeMovieFromCollection: async (movieId) => {
            try {
              const response = await movieAPI.deleteMovie(movieId)
              
              if (response.success) {
                set((draft) => {
                  draft.movies = draft.movies.filter(m => m._id !== movieId)
                  draft.totalMovies = Math.max(0, draft.totalMovies - 1)
                })
                return true
              } else {
                throw new Error(response.error || 'Errore nella rimozione del film')
              }
            } catch (error) {
              console.error('Error removing movie:', error)
              set((draft) => {
                draft.error = error.message
              })
              throw error
            }
          },
          
          // Fetch stats
          fetchStats: async () => {
            try {
              const response = await movieAPI.getStats()
              
              if (response.success) {
                set((draft) => {
                  draft.stats = response.data
                })
                return response.data
              } else {
                throw new Error(response.error || 'Errore nel caricamento delle statistiche')
              }
            } catch (error) {
              console.error('Error fetching stats:', error)
              set((draft) => {
                draft.error = error.message
              })
              return null
            }
          },
          
          // Get movie by ID
          getMovieById: (movieId) => {
            return get().movies.find(movie => movie._id === movieId)
          },
          
          // Get recent movies
          getRecentMovies: (limit = 10) => {
            return [...get().movies]
              .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
              .slice(0, limit)
          },
          
          // Get movies by genre
          getMoviesByGenre: (genre) => {
            return get().movies.filter(movie => 
              movie.genres && movie.genres.includes(genre)
            )
          }
        }))
      ),
      {
        name: 'movie-store',
        partialize: (state) => ({
          movies: state.movies.slice(0, 50), // Persist only first 50 movies
          stats: state.stats,
          filters: state.filters
        })
      }
    ),
    {
      name: 'MovieStore'
    }
  )
)

export { useMovieStore }
