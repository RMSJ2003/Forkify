import { API_URL, RES_PER_PAGE, KEY } from './config';
// import { getJSON, sendJSON } from './helpers';
import { AJAX } from './helpers';

export const state = {
    recipe: {},
    search: {
        query: '',
        results: [],
        page: 1,
        resultsPerPage: RES_PER_PAGE,
    },
    bookmarks: [],
};

const createRecipeObject = function (data) {
    const { recipe } = data.data;
    return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        sourceURL: recipe.source_url,
        image: recipe.image_url,
        servings: recipe.servings,
        cookingTime: recipe.cooking_time,
        ingredients: recipe.ingredients,
        // Not all recipes have key so we only add the key if it actually exists.
        // Explanation - if recipe.key dont exist:
        // 1) if recipe.key is false, then nothing happens.
        // 2) Then the destructuring (...) does nothing.
        // Explanation - if recipe.key exists:
        // 1) if recipe.key is true, then the second part of the operator will execute and return.
        // 2) Then the destructuring (...) will put the property and its value in this object.
        ...(recipe.key && {key: recipe.key})
    }
};

export const loadRecipe = async function (id) {
    try {
        const data = await AJAX(`${API_URL}${id}?key=${KEY}`);

        state.recipe = createRecipeObject(data);

        // This
        // let recipe = data.data.recipe;
        // is same as 
        // const { recipe } = data.data;
        // state.recipe = {
        //     id: recipe.id,
        //     title: recipe.title,
        //     publisher: recipe.publisher,
        //     sourceURL: recipe.source_url,
        //     image: recipe.image_url,
        //     servings: recipe.servings,
        //     cookingTime: recipe.cooking_time,
        //     ingredients: recipe.ingredients
        // }

        if (state.bookmarks.some(bookmark => bookmark.id === id))
            state.recipe.bookmarked = true;
        else state.recipe.bookmarked = false;

        // console.log(state.recipe);
    } catch (err) {
        // Temporary error handling - We should display the error in the View, not in the Model
        // So that user can see it.
        // But only the controller can call the view, never the model.
        // console.error(`${err} 💥💥💥`);

        // With this, the err will be passed to the controller's catch block.
        throw err;
    }
};

export const loadSearchResults = async function (query) {
    try {
        state.search.query = query;

        const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
        // console.log(data);

        state.search.results = data.data.recipes.map(rec => {
            return {
                id: rec.id,
                title: rec.title,
                publisher: rec.publisher,
                image: rec.image_url,
                ...(rec.key && {key: rec.key}),
            }
        });
        // console.log(state.search.results);

        state.search.page = 1;
    } catch (err) {
        throw err;
    }
};

// Param is the page requested by the user.
export const getSearchResultsPage = function (page = state.search.page) {
    state.search.page = page;

    // Image that the page = 1;
    const start = (page - 1) * state.search.resultsPerPage; // 0
    const end = page * state.search.resultsPerPage; // 9 (it's 9 cuz .slice will subtract 1?)

    // This returns the 10 elements of the results array. The 10 elements depends on the page
    // 10 results per page.
    return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
    state.recipe.ingredients.forEach(ing => {
        ing.quantity = ing.quantity * newServings / state.recipe.servings;
        // newQt = oldQt * newServings / oldServings  // e.g. 2 * 8 / 4 = 4
    });

    // Update the servings in the state.
    state.recipe.servings = newServings;
};

const persistBookmark = function () {
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
    // Add bookmark
    state.bookmarks.push(recipe);

    // Mark current recipe as bookmarked.
    if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

    persistBookmark();
};

export const deleteBookmark = function (id) {
    // Delete bookmark
    const index = state.bookmarks.findIndex(el => el.id === id);
    state.bookmarks.splice(index, 1);

    // Mark current recipe as NOT bookmarked.
    if (id === state.recipe.id) state.recipe.bookmarked = false;

    persistBookmark();
};

const init = function () {
    const storage = localStorage.getItem('bookmarks');
    if (storage) state.bookmarks = JSON.parse(storage);
};
init();

const clearBookmarks = function () {
    localStorage.clear('bookmarks');
};
// clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
    try {
        // Convert object into an array.
        const ingredients = Object.entries(newRecipe).filter(
            entry => entry[0].startsWith('ingredient') && entry[1] !== ''
        ).map(ing => {
            const ingArr = ing[1].split(',').map(el => el.trim());
            // const ingArr = ing[1].replaceAll(' ', '').split(',');

            if (ingArr.length !== 3) throw new Error('Wrong ingredient format! Please use the correct format :)');

            const [quantity, unit, description] = ingArr;
            return { quantity: quantity ? +quantity : null, unit, description };
        });

        const recipe = {
            title: newRecipe.title,
            source_url: newRecipe.sourceUrl,
            image_url: newRecipe.image,
            publisher: newRecipe.publisher,
            cooking_time: +newRecipe.cookingTime,
            servings: +newRecipe.servings,
            ingredients,
        };

        // After sending the new recipe, it will send it back to us so we store it in a variable.
        const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
        state.recipe = createRecipeObject(data);
        
        addBookmark(state.recipe);
    } catch (err) {
        throw err;
    }
};