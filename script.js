document.addEventListener("DOMContentLoaded", () => {
    // Select the best movie card elements
    const bestMovieCard = document.querySelector(".best-movie-card");
    const bestMovieImage = bestMovieCard.querySelector("img");
    const bestMovieTitle = bestMovieCard.querySelector(".movie-details h3");
    const bestMovieDescription = bestMovieCard.querySelector(".movie-details p");

    // Container for the best rated movies
    const bestRatedContainer = document.getElementById("best-movie-grid");
    const actionMoviesContainer = document.getElementById("action-movie-grid");
    const adventureMoviesContainer = document.getElementById("adventure-movie-grid");

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
        
    fetchMovies("http://127.0.0.1:8000/api/v1/titles/?page_size=6&sort_by=-imdb_score&genre_contains=Adventure")
        .then((movies) => {
            if (movies && movies.length > 0) {
                generateMovieCards(movies, adventureMoviesContainer);
            }
        })
        .catch((error) => {
            console.error("Error fetching action movies:", error);
        });
});

// Function to fetch movies from a given URL
function fetchMovies(url) {
    return fetch(url)
        .then((response) => response.json())
        .then((data) => data.results)
        .catch((error) => {
            console.error("Error fetching movies:", error);
            return [];
        });
}

// Function to update the best movie section
function updateBestMovieSection(movie, imageElement, titleElement, descriptionElement) {
    imageElement.src = movie.image_url;
    imageElement.alt = movie.title;
    titleElement.textContent = movie.title;

    // Fetch additional details (description) for the best movie using its id
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
                <button class="btn-details">Détails</button>
            </div>
        `;
        container.appendChild(card);
    });
}