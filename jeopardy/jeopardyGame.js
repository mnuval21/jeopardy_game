//set up the game board where the questions will be displayed
let $gameBoard = $('<div>').addClass('gameBoard thead');
let $header = $('<h1>').text('JEOPARDY!');
//restart button
let $restartButton = $('<button>').addClass('restartButton').text('RESTART');
$('body').append($header, $restartButton , $gameBoard);



//$('body').append($restartButton);

//base url for the api
const URL = "https://jservice.io/api/";
//number of columns on game board
const category_row = 6;
//number of rows on game board
const clue_columns = 5;
//array to hold the categories
let categories = [];


//function to pull  6 category ids from the api
async function getCategoryIds() {
  let response = await axios.get(URL + "categories?count=100");
  let categoryIds = response.data.map(category => category.id);
  return _.sampleSize(categoryIds, category_row);
}

//use the category ids to get the category names and 5 random clues for each category
async function getCategories(categoryId) {
  let response = await axios.get(`${URL}category?id=${categoryId}`);
  let allClues = response.data.clues;
  let randomizedClues = _.sampleSize(allClues, clue_columns);
  let gameClues = randomizedClues.map(clue => ({
    question: clue.question,
    answer: clue.answer,
    showing: null,
  }));
  return{ title: response.data.title, gameClues};

}

//function to fill the game board with the categories and clues  
function fillTable(){
  //category titles on the top row
  $('.gameBoard').empty();
  let $categoryTitles = $('<tr>');
  for (let categoryIdx = 0; categoryIdx < category_row; categoryIdx++) {
    $categoryTitles.append($('<th>').text(categories[categoryIdx].title));
  }
  $('.gameBoard').append($categoryTitles);

  //clues
  for (let clueIdx = 0; clueIdx < clue_columns; clueIdx++) {  
    let $categoryClue = $('<tr>');
    for (let categoryIdx = 0; categoryIdx < category_row; categoryIdx++) {
      $categoryClue.append($('<td>').attr('id', `${categoryIdx}-${clueIdx}`).text('?'));
    }
    $('.gameBoard').append($categoryClue);
  }
    
}

//function to show the clue and answer
function handleClick(event) {
  let id = event.target.id;
  let [categoryId, clueId] = id.split('-');
  let clue = categories[categoryId].gameClues[clueId];

  let msg;

  if (!clue.showing) {
    msg = clue.question;
    clue.showing = "question";
  } else if (clue.showing === "question") {
    msg = clue.answer;
    clue.showing = "answer";
  } else {
    return
  }

  $(`#${categoryId}-${clueId}`).html(msg);
}


//start the show!
async function setupAndStart() {
  let categoryIds = await getCategoryIds();
  for (categoryId of categoryIds) {
    categories.push(await getCategories(categoryId));
  }
  fillTable();
}

$(async function(){
  setupAndStart();
  $('.gameBoard').on("click", "td", handleClick);
});

//restart the game
$(".restartButton").on("click", function() {
  location.reload();
});


