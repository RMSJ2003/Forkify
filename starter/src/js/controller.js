import * as model from './model';
import { MODAL_CLOSE_SEC } from './config';
import paginationView from './views/paginationView';
import recipeView from './views/recipeView';
import resultsView from './views/resultsView';
import bookmarksView from './views/bookmarksView';
import searchView from './views/searchView';
import addRecipeView from './views/addRecipeView';

import 'core-js/stable'; // for polyfilling everything else
import 'regenerator-runtime'; // for polyfilling async/await

const controlRecipes = async function () {
  try {
    // window.location.hash will get the id from the URL plus the hash that's why we used .slice
    const id = window.location.hash.slice(1);

    if (!id) return;

    // 0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // 1)
    bookmarksView.update(model.state.bookmarks);

    recipeView.renderSpinner();

    // 2) Loading Recipe
    await model.loadRecipe(id);

    // 3) Rendering Recipe
    recipeView.render(model.state.recipe);

    // Debug
    // debugger;
  } catch (err) {
    recipeView.renderError();

    // test
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    // 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render results
    console.log(model.state.search.results);
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    // 4) Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
};
controlSearchResults();

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlPagination = function (gotoPage) {
  // 1) Render NEW results
  resultsView.render(model.getSearchResultsPage(gotoPage));

  // 2) Render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlAddBookmark = function () {
  // 1) Add or remove a bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner - To show the user that someting is happening.
    addRecipeView.renderSpinner();

    // Upload the new recipe data.
    await model.uploadRecipe(newRecipe);

    // Render recipe.
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in the URL
    // This will allow us to change the URL without reloading the page.
    // 1st arg is the state - doesn't matter in this cas
    // 2nd arg is the title - not also relevant
    // 3rd arg is the actual URL
    // Note in window.history that we can load the page backwards or forwards.
    window.history.pushState(null, '', `#${model.state.recipe.id}`);


    // Close form window.
    setTimeout(() => {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};

// Instead of this,
// window.addEventListener('hashchange', controlRecipes);
// window.addEventListener('load', controlRecipes);
// ---
// Do this (not better still)
// ['hashchange', 'load'].forEach(ev => window.addEventListener(ev, controlRecipes));
// But that line of code don't follow MVC architecture so we removed it
// ---
// We do this instead:
const init = function () {
  // Publisher-subscriber method?
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  console.log('Welcome');
  
};
init();

// Notes:
// - We don't want any DOM manipulation in this file. Do it in the View