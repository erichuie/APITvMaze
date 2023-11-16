"use strict";

const $showsList = $("#showsList");
const $episodesList = $("#episodesList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const TV_MAZE_URL = "http://api.tvmaze.com";
const MISSING_IMAGE_LINK = "https://tinyurl.com/tv-missing";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const searchParams = new URLSearchParams({
    q: term
  });
  const response = await fetch(`${TV_MAZE_URL}/search/shows?${searchParams}`);
  const showsArr = await response.json();

  return showsArr.map((showObj) => {
    const show = showObj.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image === null ? MISSING_IMAGE_LINK : show.image.medium
    };
  });
}


/** Given list of shows, create markup for each and append to DOM.
 * A show is {id, name, summary, image}
 * */

function displayShows(shows) {
  $showsList.empty();

  for (const show of shows) {
    const $show = $(`
        <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt=${show.name} Series Poster
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);
    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchShowsAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  displayShows(shows);
}

$searchForm.on("submit", async function handleSearchForm(evt) {
  evt.preventDefault();
  await searchShowsAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(showId) {
  const response = await fetch(`${TV_MAZE_URL}/shows/${showId}/episodes`);
  const episodeArr = await response.json();

  return episodeArr.map((episodeObj) => ({
    id: episodeObj.id,
    name: episodeObj.name,
    season: episodeObj.season,
    number: episodeObj.number

  }));
}

/** Given an array of episodes, create the HTML need to add it to the DOM
 * An episode is {id, name, season, number}
 */

function displayEpisodes(episodes) {
  $episodesList.empty();
  for (const episode of episodes) {
    const $episode = $(`<li>${episode.name} (Season: ${episode.season}, Episode: ${episode.number})</li>`);
    $episodesList.append($episode);
  }
  $episodesArea.show();
}

// add other functions that will be useful / match our structure & design

// TODO: Add a new function that ties together getEpisodesOfShow and displayEpisodes.
// It should take the showId. Choose a good name for it.

/**
 * Get episodes for a show and display them on the DOM
 * Called in a click handler for the episodes button
 *
 */

async function getEpisodesAndDisplay(showId) {
  console.log("Does this log from getEpisodesAndDisplay?");
  const episodes = await getEpisodesOfShow(showId);
  displayEpisodes(episodes);
}

// TODO: Make sure event handler is attached to something when the DOM initially loads
// When is the event loaded, and make sure it is on something that exists when searching

$showsList.on(
  "click",
  ".Show-getEpisodes",
  async function handleEpisodeClick(evt) {
    // here's one way to get the ID of the show: search "closest" ancestor
    // with the class of .Show (which is put onto the enclosing div, which
    // has the .data-show-id attribute).
    const showId = Number(
      $(evt.target).closest(".Show").data("show-id")
    );

    // here's another way to get the ID of the show: search "closest" ancestor
    // that has an attribute of 'data-show-id'. This is called an "attribute
    // selector", and it's part of CSS selectors worth learning.
    // const showId = $(evt.target).closest("[data-show-id]").data("show-id");

    await getEpisodesAndDisplay(showId);
  });