const storage = require('electron-json-storage')
const defaultDataPath = storage.getDefaultDataPath();

// BUTTON FUNCTIONS
document.getElementById('addRecipeBtn').onclick = function(){
    document.getElementById('recipeModal').classList.add('is-active');
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
    document.getElementById('dinnerList').innerHTML = '';
    document.getElementById('supperList').innerHTML = '';

    window.setTimeout(function() {
        names = [];
        Object.entries(recipes).map(recipeParent => {
            // Recipe object is stored on 2nd index, name is on the 1st
            recipe = recipeParent[1];
            name = recipeParent[0];
            var listId;
            if (recipe.timeOfDay == 'Breakfast') listId = 'breakfastList';
            if (recipe.timeOfDay == 'Dinner') listId = 'dinnerList';
            if (recipe.timeOfDay == 'Supper') listId = 'supperList';
            document.getElementById(listId).innerHTML += 
                '<li><a onclick="openRecipe(\'' + name + '\')"><h2 class="subtitle is-5">' + name + ': <strong>' + recipe.caloriesPerServing + ' kcal<strong></h2></a></li>';
            // Assign all names to an array to later add function to the recipes
            names.push(name);
        });
    }, 250);
}

// This function is called from html and is actually used
function openRecipe(name) {
    console.log('opening recipe');
    console.log(name);
    storage.setDataPath(defaultDataPath + '/recipes');
    storage.get(name, function(error, data) {
        if (error) throw error;
        console.log(data);
        document.getElementById("recipeTabName").innerHTML = name.toUpperCase();
        document.getElementById("recipeTabCalories").innerHTML = data.caloriesPerServing + ' calories per serving';
    });
}
