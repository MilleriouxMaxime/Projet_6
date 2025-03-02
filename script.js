// Main function to fetch and display movies and genres
function main() {
    // Select the best movie card elements
    const bestMovieCard = document.querySelector(".best-movie-card");
    const bestMovieImage = bestMovieCard.querySelector("img");
    const bestMovieTitle = bestMovieCard.querySelector(".movie-details h3");
    const bestMovieDescription = bestMovieCard.querySelector(".movie-details p");

    // Containers for the movies
    const bestRatedContainer = document.getElementById("best-movie-grid");
    const actionMoviesContainer = document.getElementById("action-movie-grid");
    const adventureMoviesContainer = document.getElementById("adventure-movie-grid");
    const categoryMoviesContainer = document.getElementById("category-movie-grid");

    // Fetch and display the best movie
    fetchMovies("http://127.0.0.1:8000/api/v1/titles/?page_size=7&sort_by=-imdb_score")
    .then((movies) => {
        if (movies && movies.length > 0) {
        const bestMovie = movies[0];
        updateBestMovieSection(bestMovie, bestMovieImage, bestMovieTitle, bestMovieDescription);
        generateMovieCards(movies.slice(1), bestRatedContainer);
        }
    })
    .catch((error) => {
        console.error("Error fetching best movies:", error);
    });

    // Fetch and display action movies
    fetchMovies("http://127.0.0.1:8000/api/v1/titles/?page_size=6&sort_by=-imdb_score&genre_contains=Action")
    .then((movies) => {
        if (movies && movies.length > 0) {
        generateMovieCards(movies, actionMoviesContainer);
        }
    })
    .catch((error) => {
        console.error("Error fetching action movies:", error);
    });

    // Fetch and display adventure movies
    fetchMovies("http://127.0.0.1:8000/api/v1/titles/?page_size=6&sort_by=-imdb_score&genre_contains=Adventure")
    .then((movies) => {
        if (movies && movies.length > 0) {
        generateMovieCards(movies, adventureMoviesContainer);
        }
    })
    .catch((error) => {
        console.error("Error fetching adventure movies:", error);
    });

    // Populate the genre select
    const categorySelect = document.getElementById("categorySelect");
    fetchGenres("http://localhost:8000/api/v1/genres/?page_size=50")
    .then((genres) => {
        // Start with a default option
        categorySelect.innerHTML = `<option value="">Select Genre</option>`;
        genres.forEach((genre) => {
        const option = document.createElement("option");
        option.value = genre.name;
        option.textContent = genre.name;
        categorySelect.appendChild(option);
        });
    })
    .catch((error) => {
        console.error("Error fetching genres:", error);
    });

    // Add event listener to load movies for the selected genre
    categorySelect.addEventListener("change", (event) => {
    const selectedGenre = event.target.value;
    if (selectedGenre) {
        fetchMovies(`http://127.0.0.1:8000/api/v1/titles/?page_size=6&sort_by=-imdb_score&genre_contains=${selectedGenre}`)
        .then((movies) => {
            if (movies && movies.length > 0) {
            generateMovieCards(movies, categoryMoviesContainer);
            } else {
            categoryMoviesContainer.innerHTML = "No movies found for this genre.";
            }
        })
        .catch((error) => {
            console.error("Error fetching movies for selected genre:", error);
        });
    } else {
        categoryMoviesContainer.innerHTML = "";
    }
    });
}

// Function to fetch movies from a given URL
async function fetchMovies(url) {
    return fetch(url)
    .then((response) => response.json())
    .then((data) => data.results)
    .catch((error) => {
        console.error("Error fetching movies:", error);
        return [];
    });
}

// Function to fetch genres from a given URL
async function fetchGenres(url) {
    return fetch(url)
    .then((response) => response.json())
    .then((data) => data.results)
    .catch((error) => {
        console.error("Error fetching genres:", error);
        return [];
    });
}

// Function to update the best movie section
function updateBestMovieSection(movie, imageElement, titleElement, descriptionElement) {
    imageElement.src = movie.image_url;
    imageElement.alt = movie.title;
    titleElement.textContent = movie.title;
    // Fetch additional details (e.g., description) for the best movie using its id
    fetch(`http://127.0.0.1:8000/api/v1/titles/${movie.id}`)
    .then((response) => response.json())
    .then((detailData) => {
        descriptionElement.textContent = detailData.description;
    })
    .catch((err) => {
        console.error("Error fetching best movie details:", err);
        descriptionElement.textContent = "Description non disponible.";
    });
}

// Function to generate movie cards and append them to a container
function generateMovieCards(movies, container) {
    container.innerHTML = ""; // Clear any existing content
    movies.forEach((movie) => {
    const card = document.createElement("div");
    card.classList.add("movie-card");
    card.innerHTML = `
        <img src="${movie.image_url}" class="img-fluid" alt="${movie.title}" />
        <div class="overlay">
        <h6>${movie.title}</h6>
        <button class="btn-details btn btn-light btn-sm">Détails</button>
        </div>
    `;
    // Add event listener for the details button to show the modal
    card.querySelector('.btn-details').addEventListener('click', function() {
        showMovieModal(movie.id);
    });
    container.appendChild(card);
    });
}

// Function to show movie details in a modal using JavaScript
function showMovieModal(movieId) {
    fetch(`http://127.0.0.1:8000/api/v1/titles/${movieId}`)
    .then((response) => response.json())
    .then((movie) => {
        // Remove any existing modal with the same ID
        const existingModal = document.getElementById('movieDetailsModal');
        if (existingModal) {
        existingModal.remove();
        }
        // Build the modal HTML with the movie details
        const modalHtml = `
        <div class="modal fade" id="movieDetailsModal" tabindex="-1" aria-labelledby="movieDetailsModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
            <div class="modal-content movie-modal-content p-3">
                <div class="modal-body">
                <div class="row">
                    <!-- Left Column: Movie Details -->
                    <div class="col-md-8">
                    <h2 class="movie-modal-title" id="movieDetailsModalLabel">${movie.title}</h2>
                    <div class="movie-modal-info">${movie.year} - ${movie.genres ? movie.genres.join(', ') : ''}</div>
                    <div class="movie-modal-info">${movie.duration} minutes</div>
                    <div class="movie-modal-rating">IMDB score: ${movie.imdb_score ? movie.imdb_score : ''}/10</div>
                    <div class="movie-modal-directors">
                        Réalisé par: ${movie.directors ? (Array.isArray(movie.directors) ? movie.directors.join(', ') : movie.directors) : ''}
                    </div>
                    <div class="movie-modal-description">
                        ${movie.long_description}
                    </div>
                    <div class="movie-modal-cast">
                        <strong>Avec:</strong><br />
                        ${movie.actors ? (Array.isArray(movie.actors) ? movie.actors.join(', ') : movie.actors) : ''}
                    </div>
                    </div>
                    <!-- Right Column: Poster Image -->
                    <div class="col-md-4 d-flex justify-content-center align-items-start">
                    <img
                        src="${movie.image_url}"
                        alt="${movie.title} Poster"
                        class="img-fluid"
                        style="max-height: 300px;"
                    />
                    </div>
                </div>
                </div>
                <div class="modal-footer">
                <button type="button" class="btn btn-danger" data-bs-dismiss="modal">
                    Fermer
                </button>
                </div>
            </div>
            </div>
        </div>
        `;
        // Append the modal HTML to the body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        // Initialize and show the modal using Bootstrap's modal API
        const movieModal = new bootstrap.Modal(document.getElementById('movieDetailsModal'));
        movieModal.show();
    })
    .catch((error) => {
        console.error("Error fetching movie details:", error);
    });
}
// Call the main function
main();