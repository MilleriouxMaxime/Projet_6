document.addEventListener("DOMContentLoaded", () => {
    // Select the best movie card elements
    const bestMovieCard = document.querySelector(".best-movie-card");
    const bestMovieImage = bestMovieCard.querySelector("img");
    const bestMovieTitle = bestMovieCard.querySelector(".movie-details h3");
    const bestMovieDescription = bestMovieCard.querySelector(".movie-details p");
  
    // Container for the best rated movies
    const bestRatedContainer = document.querySelector(".movie-grid");
  
    // Fetch the best 7 movies
    fetch("http://127.0.0.1:8000/api/v1/titles/?page_size=7&sort_by=-imdb_score")
      .then((response) => response.json())
      .then((data) => {
        const movies = data.results;
        if (movies && movies.length > 0) {
          // The first movie is the best movie
          const bestMovie = movies[0];
  
          // Update best movie section with title and image
          bestMovieImage.src = bestMovie.image_url;
          bestMovieImage.alt = bestMovie.title;
          bestMovieTitle.textContent = bestMovie.title;
  
          // Fetch additional details (description) for the best movie using its id
          fetch(`http://127.0.0.1:8000/api/v1/titles/${bestMovie.id}`)
            .then((response) => response.json())
            .then((detailData) => {
              bestMovieDescription.textContent = detailData.description;
            })
            .catch((err) => {
              console.error("Error fetching best movie details:", err);
              bestMovieDescription.textContent = "Description non disponible.";
            });
  
          // Populate the "Films les mieux notés" section with the next 6 movies
          bestRatedContainer.innerHTML = ""; // Clear any existing content
          movies.slice(1).forEach((movie) => {
            const card = document.createElement("div");
            card.classList.add("movie-card");
            card.innerHTML = `
              <img src="${movie.image_url}" class="img-fluid" alt="${movie.title}" />
              <div class="overlay">
                <h6>${movie.title}</h6>
                <button class="btn-details">Détails</button>
              </div>
            `;
            bestRatedContainer.appendChild(card);
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching movies:", error);
      });
  });