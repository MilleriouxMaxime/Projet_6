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

// Fonction pour afficher les détails du film dans une modal custom
function showMovieModal(movieId) {
  fetch(`http://127.0.0.1:8000/api/v1/titles/${movieId}`) // Récupère les détails du film en utilisant son id
    .then((response) => response.json()) // Convertit la réponse en JSON
    .then((movie) => {
      // Supprime toute modal existante avec le même ID
      const existingModal = document.getElementById("customMovieModal"); // Sélectionne la modal existante
      if (existingModal) {
        existingModal.remove(); // Supprime la modal existante
      }

      // Construire le HTML de la modal custom avec les détails du film
      const modalHtml = `
        <div class="custom-modal" id="customMovieModal">
          <div class="custom-modal-content">
            <div class="custom-modal-body">
              <div class="modal-metadata">
                <div class="modal-title-row">
                  <div class="movie-modal-title">${movie.title}</div>
                  <button class="custom-modal-close" onclick="closeCustomModal()">❌</button>
                </div>
                <div class="movie-modal-info">${movie.year} - ${
        movie.genres ? movie.genres.join(", ") : ""
      }</div>
                <div class="movie-modal-info">${movie.duration} 
                minutes${
                  movie.countries && movie.countries.length > 0
                    ? ` (${movie.countries.join(" / ")})`
                    : ""
                }</div>
                <div class="movie-modal-rating">IMDB score: ${
                  movie.imdb_score ? movie.imdb_score : ""
                }/10</div>
                <div class="movie-modal-directors">
                  Réalisé par: ${
                    movie.directors
                      ? Array.isArray(movie.directors)
                        ? movie.directors.join(", ")
                        : movie.directors
                      : ""
                  }
                </div>
              </div>
              <div class="modal-image">
                <img
                  src="${movie.image_url}"
                  alt="${movie.title} Poster"
                  onerror="this.src='image.png'"
                />
              </div>
              <div class="modal-description">
                <div class="movie-modal-description">
                  ${movie.long_description}
                </div>
              </div>
              <div class="modal-cast">
                <div class="movie-modal-cast">
                  <strong>Avec:</strong><br />
                  ${
                    movie.actors
                      ? Array.isArray(movie.actors)
                        ? movie.actors.join(", ")
                        : movie.actors
                      : ""
                  }
                </div>
              </div>
            </div>
            <div class="custom-modal-footer">
              <button type="button" class="btn" onclick="closeCustomModal()">
                Fermer
              </button>
            </div>
          </div>
        </div>
      `; // Définit le contenu HTML de la modal custom

      // Ajouter le HTML de la modal au corps du document
      document.body.insertAdjacentHTML("beforeend", modalHtml); // Ajoute la modal au corps du document

      // Afficher la modal custom et bloquer le scroll
      const customModal = document.getElementById("customMovieModal");
      customModal.classList.add("show");
      document.body.classList.add("modal-open");

      // Fermer la modal en cliquant sur l'arrière-plan
      customModal.addEventListener("click", function (e) {
        if (e.target === customModal) {
          closeCustomModal();
        }
      });
    })
    .catch((error) => {
      console.error("Error fetching movie details:", error); // Affiche une erreur en cas d'échec de la récupération des détails du film
    });
}

// Fonction pour fermer la modal custom
function closeCustomModal() {
  const customModal = document.getElementById("customMovieModal");
  if (customModal) {
    customModal.classList.remove("show");
    document.body.classList.remove("modal-open");
    // Supprimer la modal après l'animation
    setTimeout(() => {
      customModal.remove();
    }, 300);
  }
}
// Appeler la fonction principale
main(); // Appelle la fonction principale pour démarrer l'application

// Pour éviter l'erreur de la modal avec aria-hidden
document.addEventListener("hide.bs.modal", function () {
  if (document.activeElement) {
    document.activeElement.blur();
  }
});
