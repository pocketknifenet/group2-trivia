// Initialize Firebase
var config = {
  apiKey: "AIzaSyDuKVcxXFGtR58diOHgwY4id81rvQ-Ibtc",
    authDomain: "classdemo-fdbbe.firebaseapp.com",
    databaseURL: "https://classdemo-fdbbe.firebaseio.com",
    projectId: "classdemo-fdbbe",
    storageBucket: "classdemo-fdbbe.appspot.com",
    messagingSenderId: "81003018946"
};

/*var config = {//used durin testing
    apiKey: "AIzaSyAmJFIua26JRjhhMjeuQmLz3quZTmEcVms",
    authDomain: "testingjunk-822e1.firebaseapp.com",
    databaseURL: "https://testingjunk-822e1.firebaseio.com",
    projectId: "testingjunk-822e1",
    storageBucket: "testingjunk-822e1.appspot.com",
    messagingSenderId: "279036547018"
  };*/

firebase.initializeApp(config);
// Assign the reference to the database to a variable named 'database'
//var database = ...
var database = firebase.database();
var game = 
{//create a game object
  time: 0,//countdown timer
  question: 0,//what question we are on
  timeID: 0,//id for the countdown timer
  player:0,//my player number
  categoryList: ["Science & Nature","Sports","Geography","History","Celebrities","Art"],
  categoryIcons: ["./assets/images/science.jpg","./assets/images/sports.jpg","./assets/images/geography.jpg","./assets/images/history.jpg","./assets/images/celebrities.jpg","./assets/images/art.jpg"],
  categoryNums: [17,21,22,23,26,25],//useful for the trivia api they correlate to the categories
  category:0,//the nubmer from the list above that we chose for this game
  categoryName: "None",//the name of the category chosen from categoryList
  playerScore:[0,0],//number of correct questions
  playerTime:[0,0],//time spent total per question per player so far
  playerAnswered:[0,0],//have you answered the current question?
  playerHere:["no","no"],//are you here and registered in the database?
  playerName:["None","Not Arrived"],//player names
  myDivGameArea: $("#content"),//the div i write the game into
  theQuestion:"None",//the current question text
  theAnswer:"None",//the current answer text
  answerArray:0,//an array for holding the answers available for the current question.  
  answerNum:0,//the array location of the correct answer in the list of answerArray
  playingComputer:0,//is the opponent real or a PC?
  started:0,//has someone started the game?
  startNewGame: function() 
  {//set up the first question and initialize the div and variables
    game.question = 0;
    game.time = 15;
    game.timeID = setInterval(function(){ game.count(); }, 1000);
    game.displayQuestions();
  },
  nextQuestion: function()
  {
    game.question++;
    game.time = 15;
    database.ref("Player" + game.player).child('Answered').set(0);//
    game.timeID = setInterval(function(){ game.count(); }, 1000);
    game.displayQuestions();
  },
  getQuestions: function()
  {
    $.ajax(
    {
      url: 'https://opentdb.com/api.php?amount=10&category=' + game.category + '&difficulty=medium&type=multiple',
      method: 'GET',
    }).done(function(response) 
    {
      // looping through results and log
      database.ref("Game").child("questions").remove();
      for (var i = 0; i < response.results.length; i++) 
      {
        game.loadQuestions(response.results[i],i);
      } 
      game.startNewGame();
    });
  },
  loadQuestions: function(object,index)//load the new questions into the database
  {
    var randomAnswer = Math.floor(Math.random() * 4);
    var answers = object.incorrect_answers;
    answers.splice(randomAnswer, 0, object.correct_answer);
    database.ref("Game").child("questions").push(
    {
      questionNumber:index,
      question: object.question,
      theAnswer: randomAnswer,
      theAnswers: object.incorrect_answers
    });
  },
  shallWePlay: function()//waiting for player 2 or just start the game
  {
    game.myDivGameArea.empty();//clear out my div and add the category buttons
    game.myDivGameArea.append("<div><h4 class='text-center' id = 'prompt'>Wait for an opponent or play against the Computer: </h4></div>");
    game.myDivGameArea.append("<div><h5 class='text-center' id = 'player1Name'>Player 1: " + game.playerName[0]  +" </h5></div>");
    game.myDivGameArea.append("<div><h5 class='text-center' id = 'player2Name'>Player 2: " + game.playerName[1] +" </h5></div>");
    var myButton = $("<button/>", {"id": "startTheGame"});
    myButton.text("Start")
    game.myDivGameArea.append(myButton);
  },
  tellGameFull: function()//prompt for the player name
  {           
    game.myDivGameArea.empty();//clear out my div and add the category buttons
    game.myDivGameArea.append("<div><h4 class='text-center' id = 'prompt'>The Game is already full.  Please come back later.</h4></div>");  
  },
  displayCategories: function()
  {
    game.myDivGameArea.empty();//clear out my div and add the category buttons
    //show the category buttons
    $('#content').html('Pick your topic:').css('font-weight', 'bold');
    var btnGroup = ('<div class="button-group center-block">');
    $('#content').append(btnGroup);
    for (var i = 0; i < game.categoryList.length; i++) 
    {
      var topicBtn = $('<div class="topic-button center-block categoryChoice">');
      topicBtn.attr('data-c', game.categoryNums[i]);
      topicBtn.attr("data-n",game.categoryList[i]);
      topicBtn.css('background-image', 'url(' + game.categoryIcons[i] + ')');
      topicBtn.text(game.categoryList[i]);
      $('.button-group').append(topicBtn);
    }
  },
  displayQuestions: function()
  {
    //alert(snapshot.child("Game").child("question0").child("wrong4").val()[2]);
    database.ref("Game").child('questions').orderByChild('questionNumber').equalTo(game.question).on("value", function(snapshot) 
    {
      console.log(snapshot.val());
      //console.log(snapshot.question.val());
      snapshot.forEach(function(data) 
      {
        game.theQuestion = data.val().question;
        game.answerArray = data.val().theAnswers;
        game.answerNum = data.val().theAnswer;
        game.theAnswer = data.val().theAnswers[game.answerNum];
      });
    });
    //console.log(game.questions[0]);
    game.myDivGameArea.empty();//clear out my div and add the questions
    game.myDivGameArea.append("<div><h4 class='text-center' id = 'timeRemaining'>Time:</h4></div>");
    game.myDivGameArea.append("<div><h4 class='text-center' id = 'prompt'>" + game.theQuestion +"</h4></div>");
    $(game.answerArray).each(function(index,item)
    {
      //display the questions
      var newDiv = $("<button/>", {"class": "answerChoice button-group col-12"});
      newDiv.attr("data-i",index);
      newDiv.attr("data-a",game.answerNum);
      game.myDivGameArea.append(newDiv.text(item));
    });
  },
  showAnswer: function(yourAnswer)
  {
    //clear out any previous info
    game.myDivGameArea.empty();//clear out my div and add the gif and answer and score etc
    var queryURL = "https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&limit=1&rating=PG-13&q=" + game.theAnswer;
    //dc6zaTOxFJmzC a public key
    //console.log(queryURL);
    $.ajax(
    {
      url: queryURL,
      method: "GET"
    }).done(function(gifSearch)
    {
      //for each gif in the data returned, add the rating and picture
      $(gifSearch.data).each(function(index,element)
      {
        var rating = element.rating;//save the rating
        var gifDiv = $("<div class='gifDiv'>");//create a div for the elements
        var gifImage = $("<img>");//create an image to hold our picture
        var p = $("<p>").text("The answer was: " + game.theAnswer);//create a p for our rating text
        $(gifImage).attr("src", element.images.fixed_width.url);//we start out still
        $(gifImage).addClass("aGif");//i'll detect a click with this later
        //build our gifDiv and append it to our content area
        gifDiv.append(p);
        gifDiv.append(gifImage);
        gifDiv.addClass("float-left bg-light border border-light")
        $("#content").append(gifDiv);
        game.myDivGameArea.append("<div><h4 class='text-center' id = 'totalTime1'>" + "Player1 Time: "+ game.playerTime[0]+ "</h4></div>");
        game.myDivGameArea.append("<div><h4 class='text-center' id = 'totalScore1'>" + "Player1 Score: "+ game.playerScore[0]+ "</h4></div>");
        game.myDivGameArea.append("<div><h4 class='text-center' id = 'totalTime2'>" + "Player2 Time: "+ game.playerTime[1]+ "</h4></div>");
        game.myDivGameArea.append("<div><h4 class='text-center' id = 'totalScore2'>" + "Player2 Score: "+ game.playerScore[1]+ "</h4></div>");          
        if(yourAnswer == 0)//wrong
        {
          game.myDivGameArea.append("<div><h4 class='text-center' id = 'totalTime'> wrong answer!!!!!</h4></div>");
        }
        else if(yourAnswer == 1)//right
        {
          game.myDivGameArea.append("<div><h4 class='text-center' id = 'totalTime'> right answer!!!!!</h4></div>");
        }
        else if(yourAnswer == 2)//no answer
        {
          game.myDivGameArea.append("<div><h4 class='text-center' id = 'totalTime'> no answer!!!!!</h4></div>");
        }
      });
    });
  },
  outtaTime: function() 
  {
    if(game.playerAnswered[game.player - 1] == 0)//if i haven't answered yet
    {
      var myTime = 15;
      myTime += game.playerTime[game.player -1];
      database.ref("Player" + game.player).child('Time').set(myTime);
      database.ref("Player" + game.player).child('Answered').set(1);
      game.showAnswer(2);//you didn't answer in time
    }
    clearInterval(game.timeID)//
    setTimeout(function(){ game.nextQuestion(); }, 8000);
  },
  count: function()
  {//count down from a given number of seconds
    if(game.time >= 0)
    {
      database.ref("Game").child("timer").set(game.time);//set the timer to 15 seconds
      game.time --
    }
    else
    {
      game.outtaTime();
    }
  },
};

$(document).ready(function() 
{//when the document loads the first time
  //hide chat log on page load
  $('#chat').hide();
});

$(document).on("click", "#name-btn" , function(event)//enter your name
{ // Prevent form from submitting
    event.preventDefault();
  // Get the input value and send it to the database
  var playerName = $("#player").val().trim();
  if(playerName.length > 0)
  {
    database.ref("Player" + game.player).child("Name").set(playerName);
    game.playerName[game.player - 1] = playerName;
    $('#userName').val('');
    $('#chat').show();
    game.shallWePlay();
  }
});

$(document).on("click", ".categoryChoice" , function(event)//enter your name
{
  // Get the category choice and get the questions
  // then we wait for player 2 or start the game
  game.category = $(this).data("c");
  game.categoryName = $(this).data("n");
  database.ref("Game").child("Category").set(game.categoryName);
  game.getQuestions();
});

$(document).on("click", "#startTheGame" , function(event)//start the game
{ //create the gameplay div, load question 1 and start the timer
    if(game.player == 1)//if i'm player 1
    {
      if(game.playerHere[1] == "yes")//is player 2 here?
      {
        game.playingComputer = 0;
      }
      else//otherwise i'm playing against the PC
      {
        game.playingComputer = 1;
      }
    } 
    else if(game.player == 1)//if i'm player 2
    {
      if(game.playerHere[0] == "yes")//is player 1 here?
      {
        game.playingComputer = 0;
      }
      else//otherwise i'm playing against the PC
      {
        game.playingComputer = 1;
      }
    }
    if(game.playingComputer == 1)//set up the computer opponent
    {
      game.computerPlayer();
    }
    database.ref("Game").child('Started').set(1);//the game is starting
    game.displayCategories();
});


$(document).on("click", ".answerChoice" , function(event)//choose an answer
{ //create the gameplay div, add time to my timescore and 
  //add to my score if correct.  
  var myTime = (15 - game.time);
  myTime += game.playerTime[game.player -1];
  database.ref("Player" + game.player).child('Time').set(myTime);
  database.ref("Player" + game.player).child('Answered').set(1);

  if($(this).data("i") == $(this).data("a"))//if you picked the right answer
  {
    var myScore = game.playerScore[game.player -1] ++
    game.playerScore[game.player -1] = myScore;
    database.ref("Player" + game.player).child('Score').set(myScore);
    game.showAnswer(1);
  }
  else
  {
    game.showAnswer(0);
  }
});

database.ref("Player1/Answered").on("value", function(snapshot) //the timer is counting down
{
  game.playerAnswered[0] = snapshot.val();
  if((game.playerAnswered[0] + game.playerAnswered[1]) == 2)//we both answered
  {
    //show the correct answer page
    //game.displayAnswer();
    //kill the timer
    clearInterval(game.timeID);
    setTimeout(function(){ game.nextQuestion(); }, 8000);
  }
  else
  {
    //notify that we are waiting for the other player
  }
});

database.ref("Player2/Answered").on("value", function(snapshot) //the timer is counting down
{
  game.playerAnswered[1] = snapshot.val();
  if((game.playerAnswered[0] + game.playerAnswered[1]) == 2)//we both answered
  {
    //show the correct answer page
    //game.displayAnswer();
    //kill the timer
    clearInterval(game.timeID);
    setTimeout(function(){ game.nextQuestion(); }, 8000);
  }
  else
  {
    //notify that we are waiting for the other player
  }
});


database.ref("Game/Started").on("value", function(snapshot) //has the game started?
{
  game.started = snapshot.val();
});

database.ref("Player1/Name").on("value", function(snapshot) //player 1 name is set
{
  game.playerName[0] = snapshot.val();
});

database.ref("Player2/Name").on("value", function(snapshot) //player 2 name is set
{
  game.playerName[1] = snapshot.val();
});


database.ref("Player1/Score").on("value", function(snapshot) //player 1 score updated
{
  game.playerScore[0] = snapshot.val();
});

database.ref("Player2/Score").on("value", function(snapshot) //player 2 score updated
{
  game.playerScore[1] = snapshot.val();
});

database.ref("Player1/Time").on("value", function(snapshot) //player 1 score updated
{
  game.playerTime[0] = snapshot.val();
});

database.ref("Player2/Time").on("value", function(snapshot) //player 2 score updated
{
  game.playerTime[1] = snapshot.val();
});

database.ref("Player1/Here").on("value", function(snapshot) //player 1 is here
{
  game.playerHere[0] = snapshot.val();
});

database.ref("Player2/Here").on("value", function(snapshot) //player 2 is here
{
  game.playerHere[1] = snapshot.val();
});


database.ref("Game/timer").on("value", function(snapshot) //the timer is counting down
{
  $("#timeRemaining").text("Time Remaining: " + game.time);
});


database.ref().on("value", function(snapshot) //any change on the database triggers this
{
  //listen for changes to the database
  //alert(snapshot.child("Game").child("question0").child("wrong4").val()[2]);
  //game.questions = snapshot.child("Game").child("questions").val();
  //console.log(game.questions);
  if(game.player == 0)//this is our first look at the database
  {
    if(snapshot.child("Game").child("Started").val() == 1)//the game is already in progress
    {
      game.tellGameFull();
    }
    //Can I be player 1?
    else if(snapshot.child("Player1").child("Here").val() == null)
    {
      //I can be player1
      game.player = 1;
      database.ref("Player1").child("Here").set("yes");
      if(snapshot.child("Player2").child("Here").val() == null)
      {
        //there is no player 2
        game.playerName[1] = "Not arrived";
      }
      else//thre is a player 2 - lets grab the name
      {
        game.playerName[1] = snapshot.child("Player2").child("Name").val();
      }
    }//i can't be player 1, can I be player 2?
    else if(snapshot.child("Player2").child("Here").val() == null)
    {
      //I can be player 2
      game.player = 2;
      database.ref("Player2").child("Here").set("yes");
      if(snapshot.child("Player1").child("Here").val() == null)
      {
        //there is no player 1 name yet
        game.playerName[0] = "Not arrived";
      }
      else//thre is a player 1 - lets grab the name
      {
        game.playerName[0] = snapshot.child("Player1").child("Name").val();
      }
    }
    else
    {
      game.tellGameFull();
    }
  }
}, function(errorObject) {
  console.log("The read failed: " + errorObject.code);
});

window.addEventListener("beforeunload", function (e) {
  var confirmationMessage = "\o/";

  (e || window.event).returnValue = confirmationMessage; //Gecko + IE
  if(game.player == 1)//remove player 1
  {
    database.ref("Player1").remove();
  }
  else if(game.player == 2)//remove player 2
  {
    database.ref("Player2").remove();
  }
  if((game.playerHere[0] == null) && (game.playerHere[1] == null))
  {
    database.ref("Game").child("Started").set(0);
  }
  return confirmationMessage;   //Webkit, Safari, Chrome
});
/*
//Here is John's Leaderboard Section

// This is what happens when the game starts and the user enters their name
$("#name-btn").on("click", function(event) {
  event.preventDefault();

// User Input
  var userName = $("#name-btn").val().trim();

// Creates local object to hold all info
  var newUser = {
    name: userName,
  };

// Uploads user data to the database
  database.ref().push(newUser);

// Logs everything to console
  console.log(newUser.name);
});

database.ref().on("child_added", function(childSnapshot, prevChildKey) {

// // Store everything into a variable.
  var userName = childSnapshot.val().name;

// // User Info
  console.log(userName);

// // Add to the leaderboard
  $("#achievements > tbody").append("<tr><td>" + userName + "</td></tr>");
});*/