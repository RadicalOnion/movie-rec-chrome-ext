//authentication
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer [API KEY]'
  }
};
//pulls the director of a movie
function pullDirector(movid) {
  let directorId = "";
  var url = 'https://api.themoviedb.org/3/movie/' + movid +'/credits?language=en-US';

  let res = {
    "id": 940551,
    "cast": [
      {
        "adult": false,
        "gender": 2,
        "id": 466505,
        "known_for_department": "Directing",
        "name": "Kumail Nanjiani",
        "original_name": "Kumail Nanjiani",
        "popularity": 23.047,
        "profile_path": "/9EyrK1Cv7ey1h1GgmsVAOn45w6G.jpg",
        "cast_id": 4,
        "character": "Mack Mallard (voice)",
        "credit_id": "6449b94da76ac5049db3617a",
        "order": 0
      },
      {
        "adult": false,
        "gender": 1,
        "id": 9281,
        "known_for_department": "Acting",
        "name": "Elizabeth Banks",
        "original_name": "Elizabeth Banks",
        "popularity": 56.697,
        "profile_path": "/zrkI1dYucpTM8Qydtrtro9MgQPb.jpg",
        "cast_id": 57,
        "character": "Pam Mallard (voice)",
        "credit_id": "65fedd8b459ad60187f852bd",
        "order": 1
      },
      {
        "adult": false,
        "gender": 2,
        "id": 1736671,
        "known_for_department": "Acting",
        "name": "Caspar Jennings",
        "original_name": "Caspar Jennings",
        "popularity": 25.944,
        "profile_path": "/hDp0awwLRghXYtXZ4FRrubjrMRa.jpg",
        "cast_id": 58,
        "character": "Dax Mallard (voice)",
        "credit_id": "65fedd9c0c1255017e0ea902",
        "order": 2
      },
    ]
    };
  for (let i = 0; i < res.cast.length; i++) {
    if (res.cast[i].known_for_department === 'Directing') {
      directorId = res.cast[i].id;
      return directorId;
    }
  }
};

//movie class to clean movie data 
class movie {
  constructor(movie) {
    this.title = movie.title;
    this.release = movie.release_date;
    this.genres = movie.genre_ids;
    this.director = pullDirector(movie.id);
    this.image = movie.poster_path;
  }
};
chrome.storage.local.set({tabTitle: []});
//listens for result of title puller
 chrome.storage.onChanged.addListener(function(changes, namespace) {
    call();
    console.log("sucess");
    for (let key in changes) {
      if (key === 'tabTitle') {
        let storageChange = changes[key];
        console.log('Storage key "%s" in namespace "%s" changed. ' +
                    'Old value was "%s", new value is "%s".',
                    key,
                    namespace,
                    storageChange.oldValue,
                    storageChange.newValue);
  
        // Call your function here
        filterTraits(storageChange.newValue);
      }
    }
  });


//pulls the name of the current movie/tv show- add api "query"
let tabTitle = "";
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url.startsWith('https://www.disneyplus.com/browse/entity')) {
      userHistory.watchProviders.push("337");
      setTimeout(() => {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          function: () => {
              const movName = document.title;
              var regex = /^(.*?)\|/;
              var regMat = movName.match(regex);
              //repace with an api query call into the filter traits function
              let words = regMat[1].split(" ");
              let search = "";
              for (let i = 0; i < words.length; i++) {
                search += words[i] + "%20";
              }
              search = search.slice(0, -6);
              chrome.storage.local.set({tabTitle: search});
          }
        });
      }, 6000); 
    } 
  });

function call(){
  chrome.storage.local.get('tabTitle').then(result => {
  console.log(result.tabTitle, "call");
    });
  };

 

//cleans data then pushes it into user history
function filterTraits(name) {
  console.log(name, "name");
  if (name === undefined || name == "" || name.length == 0 || name == null || name[0] == undefined || name[0] == "" || name[0] == null) {
    console.log("error- no name found");
    return;
  };
  let movie;
  fetch('https://api.themoviedb.org/3/search/multi?query='+name +'&include_adult=false&language=en-US&page=1', options)
    .then(response => {
       if (!response.ok) {
          throw new Error('Network response was not ok');
      }
     return response.json();
   }) 
    .then(response => {
      console.log(response, "response1");
      if (response.results[0].original_language == "en") {
        movie = response.results[0];
    } else {
        movie = response.results[1];
      }
      userHistory.releaseDates.push(movie.release_date);
      userHistory.ratings.push(movie.vote_average);
      userHistory.popularity.push(movie.popularity);
      userHistory.directors.push(pullDirector(movie.id));
      for (let i = 0; i < movie.genre_ids.length; i++) {
        let genre = genreArray.find(genre => genre.id === movie.genre_ids[i]);
        genre.frequency++;
      }
      userHistory.moviesWatched.push(movie.id);
      chrome.storage.local.set({userHistory: userHistory});
      console.log(userHistory, "userHistory");
      console.log(movie, "movie");
    })
    .catch(err => console.error(err));
};

//to be replaced woth api "query" call inside addListener tag
const sampleMovie ={  
  "poster_path": "/IfB9hy4JH1eH6HEfIgIGORXi5h.jpg",  
  "adult": false,  
  "overview": "Jack Reacher must uncover the truth behind a major government conspiracy in order to clear his name. On the run as a fugitive from the law, Reacher uncovers a potential secret from his past that could change his life forever.",  
  "release_date": "2016-10-19",  
  "genre_ids": [  
    53,  
    28,  
    80,  
    18,  
    9648,  
  ],  
  "id": 343611,  
  "original_title": "Jack Reacher: Never Go Back",  
  "original_language": "en",  
  "title": "Jack Reacher: Never Go Back",  
  "backdrop_path": "/4ynQYtSEuU5hyipcGkfD6ncwtwz.jpg",  
  "popularity": 26.818468,  
  "vote_count": 201,  
  "video": false,  
  "vote_average": 4.19  
};

//genre class to store that info
class genre {
  constructor(id, name, set) {
    this.id = id;
    this.name = name;
    this.frequency = 0;
    this.set = set;
  }
}
const genreArray = [
new genre(28,"Action",1),
new genre(12,"Adventure",1),
new genre(16,"Animation",3),
new genre(35,"Comedy",3),
new genre(80,"Crime",3),
new genre(99,"Documentary",3),
new genre(18,"Drama",3),
new genre(10751,"Family",3),
new genre(14,"Fantasy",1),
new genre(36,"History",1),
new genre(27,"Horror",1),
new genre(10402,"Music",1),
new genre(9648,"Mystery",3),
new genre(10749,"Romance",1),
new genre(878,"Science Fiction",1),
new genre(10770,"TV Movie",1),
new genre(53,"Thriller",1),
new genre(10752,"War",1),
new genre(37,"Western",3),
new genre(10759,"Action & Adventure",2),
new genre(10762,"Kids",2),
new genre(10763,"News",2),
new genre(10764,"Reality",2),
new genre(10765,"Sci-Fi & Fantasy",2),
new genre(10766,"Soap",2),
new genre(10767,"Talk",2),
new genre(10768,"War & Politics",2),
];

//a locally stored list of user history--add local storage
var userHistory = {};
function update(){
  chrome.storage.local.get('userHistory', function(result) {
    userHistory = result.userHistory;
  });
}
if (userHistory.hasOwnProperty("releaseDates") === false){
  userHistory = {
    releaseDates: ["1999-03-27", "2024-03-27"],
    ratings: [5, 10],
    watchProviders: ["337"],
    genres: ["35", "12"],
    moviesWatched: ["12901","44651"],
    directors: ["9281", "466505"],
    popularity: [25, 30],
  };
} else {
  update();
};

chrome.storage.local.set({userHistory: userHistory});
update();
//object thta stores the mehtods for quantifying user history
var userPrefFunc = {
  genres: function() {
    let genSort = genreArray.sort(function(a, b) {
      return b.frequency - a.frequency;
    });
    let ids = [];
    for (let i = 0; i < 5; i++) {
      ids.push(genSort[i].id);
    }
    return ids.slice(0,5);
  },
  directors: function() {
    return userHistory.directors;
  },
  medDate: function() {
    let sortDates = userHistory.releaseDates.sort(function(a, b) {
      return new Date(a) - new Date(b);
    }); 
    let medDate = Math.floor(sortDates.length * 0.55);
    return sortDates[medDate];
  },
};

//stores user preferences
var userPreferences = {
  genres: userPrefFunc.genres(),
  directors: userPrefFunc.directors(),
  medDate: userPrefFunc.medDate(),
};

var resultsAtr = [];
//creates movie objects from api results
function resultsAtrFunc(res) {
  for (let i = 0; i < res.results.length; i++) {
    resultsAtr.push(new movie(res.results[i]));
  };
  chrome.storage.local.set({movies: resultsAtr, userPreferences: userPreferences});
};
//parameters for calling api
var userParam = {
    watchProvider: function() {
      let res = "";
      for (let i = 0; i < userHistory.watchProviders; i++) {
        if (userHistory.watchProviders[i] !== undefined) {
          res += userHistory.watchProviders[i] + "%7C";
        }
      }
      return res;
    },
    minDate: function() {
      let sortDates = userHistory.releaseDates.sort(function(a, b) {
        return new Date(a) - new Date(b);
      }); 
      let minDate = Math.floor(sortDates.length * 0.25);
      return sortDates[minDate];
    },
    minRating: function() {
      let sortRatings = userHistory.ratings.sort(function(a, b) {
        return a - b;
      });
      let minRating = Math.floor(sortRatings.length * 0.25);
      return sortRatings[minRating];
    },
    minPopularity: function() {
      let sortPopularity = userHistory.popularity.sort(function(a, b) {
        return a - b;
      });
      let minPopularity = Math.floor(sortPopularity.length * 0.25);
      return sortPopularity[minPopularity];
    
    }, genres: function() {
       let res ="";
        for (let i = 0; i < userPreferences.genres.length; i++) {
          res += userPreferences.genres[i] + "%7C";
        }
        return res;
    },
    buildParam: function() {
      let res = "https://api.themoviedb.org/3/discover/movie?include_adult=true&include_video=false&language=en-US&page=1&vote_average.gte="+this.minRating()+"&release_date.gte=" + this.minDate()+"&release_date.lte=2024-12-27&sort_by=popularity.desc&watch_region=US&with_genres="+this.genres()+"&with_watch_monetization_types=flatrate%7C%free&with_watch_providers="+this.watchProvider();
      return res;
    }
};

self.addEventListener('message', function(event) {
  if (event.data.action === 'getDiscover') {
    getDiscover();
  }
});

function getDiscover() {
  fetch(userParam.buildParam(), options)
    .then(response => response.json())
    .then(response => resultsAtrFunc(response))
    .catch(err => console.error(err));
};
