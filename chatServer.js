/*
chatServer.js
Author: David Goedicke (da.goedicke@gmail.com)
Closley based on work from Nikolas Martelaro (nmartelaro@gmail.com) as well as Captain Anonymous (https://codepen.io/anon/pen/PEVYXz) who forked of an original work by Ian Tairea (https://codepen.io/mrtairea/pen/yJapwv)
*/

var express = require('express'); // web server application
var app = express(); // webapp
var http = require('http').Server(app); // connects http library to server
var io = require('socket.io')(http); // connect websocket library to server
var serverPort = 8000;


//---------------------- WEBAPP SERVER SETUP ---------------------------------//
// use express to create the simple webapp
app.use(express.static('public')); // find pages in public directory

// start the server and say what port it is on
http.listen(serverPort, function() {
  console.log('listening on *:%s', serverPort);
});
//----------------------------------------------------------------------------//


//---------------------- WEBSOCKET COMMUNICATION -----------------------------//
// this is the websocket event handler and say if someone connects
// as long as someone is connected, listen for messages
io.on('connect', function(socket) {
  console.log('a new user connected');
  var questionNum = 0; // keep count of question, used for IF condition.
  socket.on('loaded', function(){// we wait until the client has loaded and contacted us that it is ready to go.

  socket.emit('answer',"Hey, Someone told me that you may be sad."); //We start with the introduction;
  setTimeout(timedQuestion, 2500, socket,"What is your Name?"); // Wait a moment and respond with a question.

});
  socket.on('message', (data)=>{ // If we get a new message from the client we process it;
        console.log(data);
        questionNum= bot(data,socket,questionNum);	// run the bot function with the new message
      });
  socket.on('disconnect', function() { // This function  gets called when the browser window gets closed
    console.log('user disconnected');
  });
});
//--------------------------CHAT BOT FUNCTION-------------------------------//
function bot(data,socket,questionNum) {
  var input = data; // This is generally really terrible from a security point of view ToDo avoid code injection
  var answer;
  var question;
  var waitTime;

/// These are the main statments that make up the conversation.
  if (questionNum == 0) {
  answer= 'Hello ' + input + ' :-)';// output response
  waitTime =2000;
  question = 'Let\'s get to know each other! What is your favorite food.';			    	// load next question
  }
  else if (questionNum == 1) {
  answer= 'Really!? ' + input + ' is my favorite food too!';// output response
  waitTime =2000;
  question = 'What do you do for fun?';			    	// load next question
  }
  else if (questionNum == 2) {
  answer= ' That sounds awesome! I have never done that!';
  waitTime =2000;
  question = 'What color calms you the most?';			    	// load next question
  }
  else if (questionNum == 3) {
  answer= 'I agree, ' + input+' is a much calmer color.';
  socket.emit('changeBG',input.toLowerCase());
  waitTime = 2000;
  question = 'Can you still read the font?';			    	// load next question
  }
  else if (questionNum == 4) {
    if(input.toLowerCase()==='yes'|| input===1){
      answer = 'Good!';
      waitTime =2000;
      question = 'You look sad. Are you sad?';
    }
    else if(input.toLowerCase()==='no'|| input===0){
        socket.emit('changeFont','white'); /// we really should look up the inverse of what we said befor.
        answer='Lets Change That';
        question='Can you read this?';
        waitTime =2000;
        questionNum --; // Here we go back in the question number this can end up in a loop
    }
    else{
      answer=' I did not understand you. Can you please answer with simply with yes or no.';
      question='Lets try this again. Can you read the font? ';
      questionNum --;
      waitTime =10;
    }
  // load next question
  }
  else if (questionNum ==5) {
    if(input.toLowerCase()==='yes' || input===1){
      answer ='I am so sorry you feel that way.';
      waitTime=2000;
      question = 'Have you talked to anyone in your family about that?';
    }
    else if (input.toLowerCase()==='no' || input===0){
        answer='That is great! I am glad that you feel well!';
        question='Lets assume that you have felt sad before. Have you ever talked to your family about your feelings?';
        waitTime = 2000;
       // Here we go back in the question number this can end up in a loop
    }
    else{
      answer=' I did not understand you. Can you please answer with simply with yes or no.'
      question='Lets try this again. Are you sad?';
      questionNum--;
      waitTime = 0;
    }
  }
  else if (questionNum ==6) {
    if(input.toLowerCase()==='yes' || input===1){
      answer ='Good. Your family is your strongest resource';
      waitTime=3000;
      question = 'Write this with me... "I promise to always tell someone if I am feeling sad" ';
     }
    else if (input.toLowerCase()==='no' || input===0){
        answer='Really!? Your Family loves you and you should really talk to them about your feelings.';
        waitTime = 3000;
	question = 'Write this with me... "I promise to always tell someone if I am feeling sad" ';
    }
  }
 else if (questionNum == 7) {
   answer = 'Good! I hope you feel better soon!';
   waitTime = 10000;
}

/// We take the changed data and distribute it across the required objects.
  socket.emit('answer',answer);
  setTimeout(timedQuestion, waitTime,socket,question);
  return (questionNum+1);
}

function timedQuestion(socket,question) {
  if(question!=''){
  socket.emit('question',question);
}
  else{
    //console.log('No Question send!');
  }

}
//----------------------------------------------------------------------------//
