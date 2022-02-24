const comidas = document.getElementById('comidas');
const favContainer = document.getElementById('comidas-fav');
const mealPopup = document.getElementById('meal-popup');
const mealInfo = document.getElementById('meal-info');
const popupCloseBtn = document.getElementById('close-popup');

const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");

getRandomComida()
fetchComidasFavs()

async function getRandomComida() {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');

    const respData = await resp.json();
    const randomComida = respData.meals[0]; 


    agregarComida(randomComida, true);

}

async function getComidaById(id) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id);

    const  respData = await resp.json();
    const meal = respData.meals[0];

    return meal;

}

async function getMealsBySearch(term) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + term);

    const respData = await resp.json();
    const meals = respData.meals;

    return meals;

};

function agregarComida (dataComida, random = false) { 

    console.log(dataComida);


    const comida = document.createElement('div');
    comida.classList.add('comida');

    comida.innerHTML = `
    
        <div class="header-comida">
            ${random ? ` <span class="random">
               Recetas Random
            </span>` : ''}
            <img src="${dataComida.strMealThumb}" alt="${dataComida.strMeal}">
        </div>
        <div class="body-comida">
            <h4>${dataComida.strMeal}</h4>
            <button class="fav-btn">
            <i class="fas fa-heart"></i>
            </button>
        </div>
    
    `;



    const btn = comida.querySelector(".body-comida .fav-btn");

    btn.addEventListener("click", () => {
        if(btn.classList.contains("active")) {
            removeMealLS(dataComida.idMeal);
            btn.classList.remove("active");
        }else {
            addMealLS(dataComida.idMeal);
            btn.classList.add("active");
        }

        fetchComidasFavs();
    });

    comidas.addEventListener('click', () => {

       showMealInfo(dataComida)
    });
    
    comidas.appendChild(comida);
}  

function addMealLS(mealId) {
    const mealIds = getMealLS();

    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
}

function removeMealLS(mealId) {
    const mealIds = getMealLS();

    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter((id) => id !== mealId))
    );

}

function getMealLS() {
    const mealIds = JSON.parse(localStorage.getItem("mealIds"));
    
    
    return mealIds === null ? [] : mealIds;
}

async function fetchComidasFavs()  {
    favContainer.innerHTML = "";

    const mealIds = getMealLS();

    const meals = [];
    for (let i=0; i<mealIds.length; i++){
        const mealId = mealIds[i];

        meal = await getComidaById(mealId);

        agregarComidaFav(meal);
    }
}

function agregarComidaFav (dataComida) { 

    const comidaFav = document.createElement('li');

    comidaFav.innerHTML = `
    
    <img src="${dataComida.strMealThumb}" alt="${dataComida.strMeal}">
    <span>"${dataComida.strMeal}"</span>
    <buton class="clear"><i class="fa-solid fa-square-xmark"></i></button>
    
    `;

    const btn = comidaFav.querySelector(".clear");

    btn.addEventListener('click',() => {
        removeMealLS(dataComida.idMeal);

        fetchComidasFavs();
    });

    comidaFav.addEventListener('click', () => {

        showMealInfo(dataComida)
     });

    favContainer.appendChild(comidaFav);
}

function showMealInfo(dataComida) {
    //limpiamos la pag
    mealInfo.innerHTML = '';

    //actualiza la receta
    const comidas = document.createElement('div');

    const ingredientes = [];
    //ingredientes
    for(let i = 1; i <= 20; i++) {
        if(dataComida['strIngredient'+i]) {
            ingredientes.push(`${dataComida['strIngredient'+i]} - ${dataComida['strMeasure'+i]}`)
        }else {
            break;
        }
    }

    comidas.innerHTML = `
    
        <h1>${dataComida.strMeal}</h1>
        <img src="${dataComida.strMealThumb}" alt="${dataComida.strMeal}">
        <p>${dataComida.strInstructions}</p>
        <h3>Ingredients:</h3>
        <ul>
            ${ingredientes
                .map(
                    (ing) =>`
            <li>${ing}</li>
            `
                )
                .join("")}
        </ul>
      
    `;

    mealInfo.appendChild(comidas)

    mealPopup.classList.remove('hidden');
}


searchBtn.addEventListener('click', async () => {
    //limpio container
    comidas.innerHTML = '';

    const search = searchTerm.value;
    const meals = await getMealsBySearch(search);

    if (meals) {

    meals.forEach( (meal) => {
        agregarComida(meal);
    });

    }
});


popupCloseBtn.addEventListener('click', () => {
     mealPopup.classList.add('hidden');
});