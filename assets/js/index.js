$(document).ready(function () {
  // API Variables
  const API_KEY = "a9698deecb6189db6ba4a3b1562ab62d";
  const API_URL = `https://api.themoviedb.org/3/`;

  // Pagination
  let currentPage = 1;
  const moviesPerPage = 10;

  // All functions
  function fetchMovies(endpoint) {
    $("#loading-overlay").show();
    const url = `${API_URL}movie/${endpoint}?api_key=${API_KEY}`;

    return fetch(url)
      .then((response) => response.json())
      .then((data) => data.results)
      .catch((error) => {
        console.error("Gagal mengambil data film karena ", error);
        throw error;
      });
    $("#loading-overlay").hide();
  }

  function fetchAndDisplayMovies(endpoint, page) {
    const url = `${API_URL}movie/${endpoint}?api_key=${API_KEY}&page=${page}`;

    return fetch(url)
      .then((response) => response.json())
      .then((data) => {
        // Tampilkan hanya 5 film per halaman
        const movies = data.results.slice(0, moviesPerPage);
        const totalPages = data.total_pages;

        const movieList = $("#movie-list");
        movieList.empty();

        movies.forEach((movie) => {
          const card = displayMovieCard(movie);
          movieList.append(card);
        });

        displayPaginationButtons(totalPages);
      })
      .catch((error) => {
        console.error("Gagal mengambil data film karena ", error);
        throw error;
      })
      .finally(() => {
        $("#loading-overlay").hide();
      });
  }

  function displayMovieCard(movie) {
    const card = $("<div>").addClass("card");
    const img = $("<img>").attr({
      src: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
      alt: movie.title,
    });

    const h3 = $("<h3>").text(`${movie.title.substring(0, 20)}...`);
    const p = $("<p>").text(`${movie.overview.substring(0, 100)}...`);

    // Tambahkan Rating Star
    const ratingStar = $("<div>").addClass("rating-star");
    const rating = Math.round(movie.vote_average / 2);
    for (let i = 0; i < rating; i++) {
      const star = $("<i>").addClass("fas fa-star");
      ratingStar.append(star);
    }
    for (let i = 0; i < 5 - rating; i++) {
      const star = $("<i>").addClass("far fa-star");
      ratingStar.append(star);
    }

    // Tambahkan Rating Text
    const ratingText = $("<span>")
      .addClass("rating-text")
      .text(movie.vote_average);
    const ratingContainer = $("<div>").addClass("rating-container");
    ratingContainer.append(ratingStar, ratingText);

    const button = $("<button>")
      .text("Trailer")
      .click(function () {
        const url = `https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${API_KEY}`;
        fetch(url)
          .then((response) => response.json())
          .then((data) => {
            const videos = data.results;
            let youtubeKey = "";
            videos.forEach((video) => {
              if (video.site === "YouTube" && video.type === "Trailer") {
                youtubeKey = video.key;
              }
            });
            const trailerYoutube = `https://www.youtube.com/watch?v=${youtubeKey}`;
            window.open(trailerYoutube, "_blank");
          })
          .catch((error) => {
            console.error("Gagal mengambil data video karena ", error);
          });
      });

    const buttonDetail = $("<button>")
      .text("Detail")
      .click(function () {
        const url = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}`;
        fetch(url)
          .then((response) => response.json())
          .then((data) => {
            const movieDetail = data;
            const movieDetailString = JSON.stringify(movieDetail);
            localStorage.setItem("movieDetail", movieDetailString);

            // Tampilkan modal detail dengan JQuery
            $("#myModal").css("display", "block");

            // Tampilkan detail movie
            const detailMovies = $("#detailMovies");
            detailMovies.html(`
              <h2>${movieDetail.title}</h2>
              <hr>
              <p>${movieDetail.overview}</p>
              <table>
                  <tr>
                      <td>Release</td>
                      <td> : </td>
                      <td>${movieDetail.release_date}</td>
                  </tr>
                  <tr>
                      <td>Popularity</td>
                      <td> : </td>
                      <td>${movieDetail.popularity}</td>
                  </tr>
                  <tr>
                      <td>Vote Average</td>
                      <td> : </td>
                      <td>${movieDetail.vote_average}</td>
                  </tr>
                  <tr>
                      <td>Vote Count</td>
                      <td> : </td>
                      <td>${movieDetail.vote_count}</td>
                  </tr>
                  <tr>
                      <td>Language</td>
                      <td> : </td>
                      <td>${movieDetail.original_language}</td>
                  </tr>
                  <tr>
                      <td>Original Title</td>
                      <td> : </td>
                      <td>${movieDetail.original_title}</td>
                  </tr>
                  <tr>
                      <td>Rating</td>
                      <td> : </td>
                      <td>${movieDetail.vote_average}</td>
                  </tr>
              </table>
            `);

            // Tombol Close Modal
            $(".close").click(function () {
              $("#myModal").css("display", "none");
            });
          })
          .catch((error) => {
            console.error("Gagal mengambil data detail karena ", error);
          });
      });

    card.append(img, h3, p, ratingStar, ratingText, button, buttonDetail);
    return card;
  }

  function displayPaginationButtons(totalPages) {
    const paginationSection = $(".pagination"); // Select the pagination div
    paginationSection.empty(); // Clear previous pagination buttons

    const prevButton = $("<button>")
      .text("Previous Page")
      .click(function () {
        if (currentPage > 1) {
          currentPage--;
          fetchAndDisplayMovies("popular", currentPage);
        }
      });

    const nextButton = $("<button>")
      .text("Next Page")
      .click(function () {
        if (currentPage < totalPages) {
          currentPage++;
          fetchAndDisplayMovies("popular", currentPage);
        }
      });

    paginationSection.append(prevButton, nextButton);
  }

  function searchMovies(query) {
    $("#loading-overlay").show();
    const SEARCH_API_URL = `${API_URL}search/movie?api_key=${API_KEY}&query=${query}`;

    fetch(SEARCH_API_URL)
      .then((response) => response.json())
      .then((data) => {
        const movies = data.results;
        const movieList = $("#movie-list");
        movieList.empty(); // Clear previous results

        movies.forEach((movie) => {
          const card = displayMovieCard(movie);
          movieList.append(card);
        });
      })
      .catch((error) => {
        console.error("Error searching movies:", error);
      })
      .finally(() => {
        $("#loading-overlay").hide();
      });
  }

  // All jQuery event & effects
  $("#popular-movies").click(function () {
    currentPage = 1; // Reset currentPage to 1
    fetchAndDisplayMovies("popular", currentPage);
  });

  $("#top-rated-movies").click(function () {
    fetchAndDisplayMovies("top_rated");
  });

  $("#search-button").click(function () {
    const query = $("#search-input").val();
    if (query.trim() !== "") {
      searchMovies(query);
    }
  });

  $("#search-input").keypress(function (event) {
    if (event.which === 13) {
      // Enter key
      const query = $("#search-input").val();
      if (query.trim() !== "") {
        searchMovies(query);
      }
    }
  });

  $(".nav-link").click(function () {
    $(".nav-link").removeAttr("id");
    $(this).attr("id", "active");
  });

  // All jQuery DOM manipulation
  $(window).scroll(function () {
    if ($(window).scrollTop() > 0) {
      $("nav").css("border-bottom", "solid 2px #374151");
    } else {
      $("nav").css("border-bottom", "none");
    }
  });

  $(document).keydown(function (event) {
    if (event.ctrlKey && event.which === 75) {
      event.preventDefault();
      $("#search-input").focus();
    }
  });

  // Call the function to display popular movies
  fetchAndDisplayMovies("popular");
});

document.addEventListener("DOMContentLoaded", function() {
  var aboutLink = document.getElementById("aboutLink");
  var aboutModal = document.getElementById("aboutModal");
  
  var closeModal = document.getElementById("closeModal");

  aboutLink.addEventListener("click", function(event) {
    event.preventDefault();
    aboutModal.style.display = "block";
  });

  closeModal.addEventListener("click", function() {
    aboutModal.style.display = "none";
  });

  window.addEventListener("click", function(event) {
    if (event.target == aboutModal) {
      aboutModal.style.display = "none";
    }
  });
});

