function main() {
  // Définir l'URL de base
  const baseURL = "http://127.0.0.1:8000/api/v1/titles/"; // URL de base pour les requêtes API
  // Sélectionner les éléments de la carte du meilleur film
  const bestMovieCard = document.querySelector(".best-movie-card"); // Sélectionne l'élément de la carte du meilleur film

  // Conteneurs pour les films
  const bestRatedContainer = document.getElementById("best-movie-grid"); // Sélectionne le conteneur pour les films les mieux notés
  const actionMoviesContainer = document.getElementById("action-movie-grid"); // Sélectionne le conteneur pour les films d'action
  const adventureMoviesContainer = document.getElementById(
    "adventure-movie-grid"
  ); // Sélectionne le conteneur pour les films d'aventure
  const categoryMoviesContainer = document.getElementById(
    "category-movie-grid"
  ); // Sélectionne le conteneur pour les films par catégorie
  const categories = ["best", "action", "adventure", "category"]; // Catégories de films
  const showMoreButtons = document.querySelectorAll(".see-more"); // Sélectionne les boutons "Voir plus"

  // Récupérer et afficher le meilleur film
  const page_size = 7;
  fetchMovies(`${baseURL}?page_size=${page_size}&sort_by=-imdb_score`) // Récupère les films les mieux notés
    .then((movies) => {
      if (movies && movies.length > 0) {
        // Vérifie si des films ont été récupérés
        const bestMovie = movies[0]; // Sélectionne le meilleur film
        updateBestMovieSection(bestMovie, bestMovieCard); // Met à jour la section du meilleur film
        generateMovieCards(movies.slice(1), bestRatedContainer); // Génère les cartes des autres films
      }
    })
    .catch((error) => {
      console.error("Error fetching best movies:", error); // Affiche une erreur en cas d'échec de la récupération des films
    });

  [
    { dom: actionMoviesContainer, genre: "Action" },
    { dom: adventureMoviesContainer, genre: "Adventure" },
  ].forEach(({ dom, genre }) => {
    const page_size = 6;
    fetchMovies(
      `${baseURL}?page_size=${page_size}&sort_by=-imdb_score&genre_contains=${genre}`
    ) // Récupère les films d'action les mieux notés
      .then((movies) => {
        if (movies && movies.length > 0) {
          // Vérifie si des films ont été récupérés
          generateMovieCards(movies, dom); // Génère les cartes des films d'action
        }
      })
      .catch((error) => {
        console.error(`Error fetching ${genre} movies:`, error); // Affiche une erreur en cas d'échec de la récupération des films d'action
      });
  });

  // Peupler la sélection de genres
  const categorySelect = document.getElementById("categorySelect"); // Sélectionne l'élément de sélection de catégorie
  fetchGenres("http://localhost:8000/api/v1/genres/?page_size=50") // Récupère les genres disponibles
    .then((genres) => {
      // Commence avec une option par défaut
      categorySelect.innerHTML = `<option value="">Select Genre</option>`; // Ajoute une option par défaut
      genres.forEach((genre) => {
        const option = document.createElement("option"); // Crée un nouvel élément option
        option.value = genre.name; // Définit la valeur de l'option
        option.textContent = genre.name; // Définit le texte de l'option
        categorySelect.appendChild(option); // Ajoute l'option à la sélection
      });
    })
    .catch((error) => {
      console.error("Error fetching genres:", error); // Affiche une erreur en cas d'échec de la récupération des genres
    });

  // Ajouter un écouteur d'événements pour charger les films pour le genre sélectionné
  categorySelect.addEventListener("change", (event) => {
    const selectedGenre = event.target.value; // Récupère le genre sélectionné
    if (selectedGenre) {
      fetchMovies(
        `${baseURL}?page_size=6&sort_by=-imdb_score&genre_contains=${selectedGenre}`
      ) // Récupère les films pour le genre sélectionné
        .then((movies) => {
          if (movies && movies.length > 0) {
            // Vérifie si des films ont été récupérés
            generateMovieCards(movies, categoryMoviesContainer); // Génère les cartes des films pour le genre sélectionné
          } else {
            categoryMoviesContainer.innerHTML =
              "No movies found for this genre."; // Affiche un message si aucun film n'est trouvé
          }
        })
        .catch((error) => {
          console.error("Error fetching movies for selected genre:", error); // Affiche une erreur en cas d'échec de la récupération des films pour le genre sélectionné
        });
    } else {
      categoryMoviesContainer.innerHTML = ""; // Vide le conteneur si aucun genre n'est sélectionné
    }
  });
  categories.forEach((category, index) => {
    const button = showMoreButtons[index];
    button.addEventListener("click", () => {
      showMoreMovies(category, button);
    });
  });
}

// Fonction pour récupérer les films à partir d'une URL donnée
async function fetchMovies(url) {
  return fetch(url) // Effectue une requête fetch à l'URL donnée
    .then((response) => response.json()) // Convertit la réponse en JSON
    .then((data) => data.results) // Retourne les résultats des films
    .catch((error) => {
      console.error("Error fetching movies:", error); // Affiche une erreur en cas d'échec de la récupération des films
      return []; // Retourne un tableau vide en cas d'erreur
    });
}

// Fonction pour récupérer les genres à partir d'une URL donnée
async function fetchGenres(url) {
  return fetch(url) // Effectue une requête fetch à l'URL donnée
    .then((response) => response.json()) // Convertit la réponse en JSON
    .then((data) => data.results) // Retourne les résultats des genres
    .catch((error) => {
      console.error("Error fetching genres:", error); // Affiche une erreur en cas d'échec de la récupération des genres
      return []; // Retourne un tableau vide en cas d'erreur
    });
}

function isValidImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;

    img.onload = () => resolve(true); // Image loaded successfully
    img.onerror = () => resolve(false); // Image failed to load
  });
}

// Fonction pour mettre à jour la section du meilleur film
function updateBestMovieSection(movie, movieDetailsDom) {
  // Récupérer des détails supplémentaires (par exemple, description) pour le meilleur film en utilisant son id
  fetch(`http://127.0.0.1:8000/api/v1/titles/${movie.id}`) // Récupère les détails du meilleur film
    .then((response) => response.json()) // Convertit la réponse en JSON
    .then((detailData) => {
      movieDetailsDom.innerHTML = `<div class="row g-0">
        <div class="col-md-3">
          <img src="${movie.image_url}" class="img-fluid" alt="${movie.title}" />
        </div>
        <div class="col-md-9">
          <div class="movie-details">
            <h3>${movie.title}</h3>
            <p>${detailData.description}</p>
            <button
              class="btn-details-main"
            >
              Détails
            </button>
          </div>
        </div>
      </div>
`; // Met à jour le contenu HTML de la section du meilleur film
      movieDetailsDom
        .querySelector(".btn-details-main")
        .addEventListener("click", function () {
          showMovieModal(movie.id); // Affiche la modal avec les détails du meilleur film
        });
    })
    .catch((err) => {
      console.error("Error fetching best movie details:", err); // Affiche une erreur en cas d'échec de la récupération des détails du meilleur film
      descriptionElement.textContent = "Description non disponible."; // Affiche un message si la description n'est pas disponible
    });
}

// Fonction pour générer des cartes de films et les ajouter à un conteneur
function generateMovieCards(movies, container) {
  container.innerHTML = ""; // Vide tout contenu existant

  // Create an array of promises that resolve to the validated image URLs
  const imagePromises = movies.map((movie) =>
    isValidImage(movie.image_url).then((isValid) =>
      isValid ? movie.image_url : "image.png"
    )
  );

  // Attend la validation de toutes les images
  Promise.all(imagePromises).then((imageUrls) => {
    movies.forEach((movie, index) => {
      const card = document.createElement("div"); // Crée un nouvel élément div pour la carte du film
      card.classList.add("movie-card"); // Ajoute la classe CSS "movie-card" à l'élément div

      // Affirme une consistance de l'index
      if (index >= 4) {
        card.classList.add("five-more", "hidden");
      } else if (index >= 2) {
        card.classList.add("three-more", "hidden");
      }

      // Met la bonne image dans le innerHTML
      card.innerHTML = `
        <img src="${imageUrls[index]}" class="img-fluid" alt="${movie.title}" />
        <div class="overlay">
          <h6>${movie.title}</h6>
          <button class="btn-details btn btn-light btn-sm">Détails</button>
        </div>
      `;

      // Ajouter un écouteur d'événements pour le bouton de détails
      card.querySelector(".btn-details").addEventListener("click", function () {
        showMovieModal(movie.id);
      });

      container.appendChild(card); // Ajoute la carte du film au conteneur
    });
  });
}

function showMoreMovies(category, button) {
  const buttonText = button.textContent;
  if (buttonText === "Voir moins") {
    showLessMovies(category);
    button.textContent = "Voir plus";
    return;
  }

  const elementToShow = document.querySelectorAll(
    `#${category}-movie-grid > .five-more, #${category}-movie-grid > .three-more` // Sélectionne les five-more et three-more enfants du conteneur category-movie-grid
  );

  elementToShow.forEach((movie) => {
    movie.classList.remove("hidden");
  });

  button.textContent = "Voir moins";
}

function showLessMovies(category) {
  const elementToHide = document.querySelectorAll(
    `#${category}-movie-grid > .five-more, #${category}-movie-grid > .three-more` // Sélectionne les five-more enfants du conteneur category-movie-grid
  );
  elementToHide.forEach((movie) => {
    movie.classList.add("hidden");
  });
}

// Fonction pour afficher les détails du film dans une modal en utilisant JavaScript
function showMovieModal(movieId) {
  fetch(`http://127.0.0.1:8000/api/v1/titles/${movieId}`)
    .then((response) => response.json())
    .then((movie) => {
      let movieModalElement = document.getElementById("movieDetailsModal");

      if (!movieModalElement) {
        // Create the modal only once
        document.body.insertAdjacentHTML(
          "beforeend",
          `<div class="modal fade" id="movieDetailsModal" tabindex="-1" aria-labelledby="movieDetailsModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
              <div class="modal-content movie-modal-content p-3">
                <div class="modal-body">
                  <div class="row">
                    <div class="col-md-8">
                      <h2 class="movie-modal-title" id="movieDetailsModalLabel"></h2>
                      <div class="movie-modal-info" id="movieYearGenres"></div>
                      <div class="movie-modal-info" id="movieDuration"></div>
                      <div class="movie-modal-rating" id="movieRating"></div>
                      <div class="movie-modal-directors" id="movieDirectors"></div>
                      <div class="movie-modal-description" id="movieDescription"></div>
                      <div class="movie-modal-cast" id="movieCast"></div>
                    </div>
                    <div class="col-md-4 d-flex justify-content-center align-items-start">
                      <img id="moviePoster" class="img-fluid" style="max-height: 300px;" />
                    </div>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-danger" id="modalCloseBtn" data-bs-dismiss="modal">Fermer</button>
                </div>
              </div>
            </div>
          </div>`
        );
        movieModalElement = document.getElementById("movieDetailsModal");
      }

      // Remove focus from any element inside the modal before showing it
      document.activeElement.blur(); // Ensures nothing inside the modal retains focus

      // Update modal content dynamically
      document.getElementById("movieDetailsModalLabel").textContent =
        movie.title;
      document.getElementById("movieYearGenres").textContent = `${
        movie.year
      } - ${movie.genres ? movie.genres.join(", ") : ""}`;
      document.getElementById(
        "movieDuration"
      ).textContent = `${movie.duration} minutes`;
      document.getElementById("movieRating").textContent = `IMDB score: ${
        movie.imdb_score ? movie.imdb_score : ""
      }/10`;
      document.getElementById("movieDirectors").textContent = `Réalisé par: ${
        movie.directors ? movie.directors.join(", ") : ""
      }`;
      document.getElementById("movieDescription").textContent =
        movie.long_description;
      document.getElementById("movieCast").textContent = `Avec: ${
        movie.actors ? movie.actors.join(", ") : ""
      }`;
      document.getElementById("moviePoster").src = movie.image_url;
      document.getElementById("moviePoster").alt = `${movie.title} Poster`;

      // Show the modal
      const movieModal = new bootstrap.Modal(movieModalElement);
      movieModal.show();

      // Set focus to the close button to ensure accessibility
      setTimeout(() => {
        document.getElementById("modalCloseBtn").focus();
      }, 300);
    })
    .catch((error) => {
      console.error("Error fetching movie details:", error);
    });
}
// Appeler la fonction principale
main(); // Appelle la fonction principale pour démarrer l'application

// Pour éviter l'erreur de la modal avec aria-hidden
document.addEventListener("hide.bs.modal", function () {
  if (document.activeElement) {
    document.activeElement.blur();
  }
});
