const storage = require('electron-json-storage')
const defaultDataPath = storage.getDefaultDataPath();
const { shell } = require('electron');

// BUTTON FUNCTIONS
document.getElementById('addRecipeBtn').onclick = function(){
    document.getElementById('recipeModal').classList.add('is-active');
}
document.getElementById('recipeTabDeleteBtn').onclick = function(){
    storage.setDataPath(defaultDataPath + '/recipes');
    var recipeTab = document.getElementById('recipeTabDeleteBtn').parentElement;
    var key = recipeTab.getAttribute('data-name');
    storage.remove(key, function(error) {
        if (error) throw error;
        showRecipes();
    });
}
document.getElementById('recipeModalCancelBtn').onclick = closeRecipeModal;
document.getElementById('recipeModalAddBtn').onclick = addRecipe;
// END BUTTON FUNCTIONS

let recipes = {};

showRecipes();

function closeRecipeModal() {
    document.getElementById('recipeModal').classList.remove('is-active');
}

function addRecipe() {
    storage.setDataPath(defaultDataPath + '/recipes');
    console.log(storage.getDataPath());

    var nameEl = document.getElementById('recipeModalName');
    var timeEl = document.getElementById('recipeModalTime');
    var kcalEl = document.getElementById('recipeModalCal');
    var ingEl = document.getElementById('recipeModalIng');

    var name = nameEl.value;
    var time = timeEl.options[timeEl.selectedIndex].value;
    var kcal = kcalEl.value;
    var ing = ingEl.value;

    if (name === '' || kcal === '') return;

    storage.set(name, { timeOfDay: time, caloriesPerServing: kcal, ingredients: ing }, function(error) {
        if (error) throw error;
    });

    window.setTimeout(function() {
        closeRecipeModal();
        showRecipes();
        nameEl.value = '';
        timeEl.selectedIndex = '0';
        kcalEl.value = '';
        ingEl.value = '';
    }, 250)
}

function showRecipes() {
    storage.setDataPath(defaultDataPath + '/recipes');
    console.log(storage.getDataPath());
    storage.getAll(function(error, data) {
        if (error) throw error;
        recipes = data;
    });
    
    document.getElementById('breakfastList').innerHTML = '';
    document.getElementById('dinnerSupperList').innerHTML = '';

    window.setTimeout(function() {
        names = [];
        Object.entries(recipes).map(recipeParent => {
            // Recipe object is stored on 2nd index, name is on the 1st
            recipe = recipeParent[1];
            name = recipeParent[0];

            var listId;
            if (recipe.timeOfDay == 'Breakfast') listId = 'breakfastList';
            if (recipe.timeOfDay == 'Dinner/Supper') listId = 'dinnerSupperList';

            document.getElementById(listId).innerHTML += 
                '<li><a onclick="openRecipe(\'' + name + '\')"><h2 class="subtitle is-5">' + name + ': <strong>' + recipe.caloriesPerServing + ' kcal<strong></h2></a></li>';

            // Assign all names to an array to later add functionality to the recipes
            names.push(name);
        });
    }, 250);
}

// This function is called from html and is actually used
function openRecipe(name) {
    storage.setDataPath(defaultDataPath + '/recipes');
    storage.get(name, function(error, data) {
        if (error) throw error;
        document.getElementById("recipeTabName").innerHTML = name.toUpperCase();
        document.getElementById("recipeTabCalories").innerHTML = data.caloriesPerServing + ' calories per serving';
        document.getElementById("recipeTabDesc").innerHTML = urlify(data.ingredients);

        document.getElementById("recipeTab").setAttribute('data-name', name);
    });
}

function urlify(text) {
    // Source: https://stackoverflow.com/questions/1500260/detect-urls-in-text-with-javascript
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, '<a onclick="shell.openExternal(\'$1\')">$1</a>');
}
