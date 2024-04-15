window.onload = function() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(function(registration) {
      registration.active.postMessage({
        action: 'getDiscover'
      });
    });
  }
};

console.log("Hello from text.js");
var tester = document.getElementById("console");

function print(text, otra) {
  if (otra) {
    text = text + "  " + otra;    
  }
    tester.innerHTML = tester.innerHTML + "<br>" + text + "<br>";
};

chrome.storage.local.get(['userPreferences', 'movies'], function(result) {
  const userPreferences = result.userPreferences;
  const movies = result.movies;
  console.log(result, "result", userPreferences, "userPreferences", movies, "movies");
// Function to calculate cosine similarity between two vectors
  function cosineSimilarity(vectorB) {
    var vectorA= [2,1,1,1,1];
    print(vectorB);
    const dotProduct = vectorA.reduce((sum, val, index) => {
      const multiplicationResult = val * vectorB[index];
      return sum + multiplicationResult;
    }, 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val * val, 0));

    if (magnitudeA === 0 || magnitudeB === 0) {
      print("error div/0");
      return 0; // Handle division by zero
    }
    var a = dotProduct / (magnitudeA * magnitudeB);
    print(a," score");
    print(dotProduct, " dp");
    return a;
  };

    // Function to create movie features vector
  function createMovieFeatures(movie, userPreferences) {
  const movieFeatures = {};

  userPreferences.genres.forEach((genre) => {
    movieFeatures[genre] = movie.genres.includes(genre) ? 1 : 0;
    console.log(movieFeatures[genre], "movieFeatures[genre]", movie.genres, "movie.genres", genre, "genre", userPreferences.genres, "userPreferences.genres");
  });

  userPreferences.directors.forEach((director) => {
    movieFeatures[director] = movie.director === director ? 1 : 0;
  });

  const movieDateYear = new Date(movie.release).getFullYear();
  const medDateYear = new Date(userPreferences.medDate).getFullYear();
  movieFeatures.withinTenYears = Math.abs(movieDateYear - medDateYear) <= 10 ? 1 : 0;

  return Object.values(movieFeatures);
  }

  // Function to recommend movies based on user preferences
  function recommendMovies(userPreferences, movies) {
    const similarityScores = movies.map((movie) => {
      const movieFeatures = createMovieFeatures(movie, userPreferences); 
      const similarity = cosineSimilarity(movieFeatures);
      print(movie.title, similarity);
      return {
        title: movie.title,
        similarity: similarity,
      };
    });

    similarityScores.sort((a, b) => b.similarity - a.similarity);

    // Return the top recommended movies
    const topRecommendations = similarityScores.slice(0, 5);
    return topRecommendations;
  }

  // Example User Data with weights
  const recommendedMovies = recommendMovies(userPreferences, movies);
  recommendedMovies.forEach((movie) => {
    print(movie.title);
  });
});
