var config = {
    apiKey: "AIzaSyC-gZgN0pVkZrikTj2t8-coL7l8HtwqxsU",
    authDomain: "classproject-d6e68.firebaseapp.com",
    databaseURL: "https://classproject-d6e68.firebaseio.com",
    projectId: "classproject-d6e68",
    storageBucket: "classproject-d6e68.appspot.com",
    messagingSenderId: "769292531793"
  };

firebase.initializeApp(config);

var database = firebase.database();

var currentUser = readCookie('smuusercookie') != null ? readCookie('smuusercookie') : "Spectator";

$("#user").html(currentUser);

$("#submit-btn").on("click", function(){
	event.preventDefault();

	var date = moment().format("hh:mm");
	var message = $("#chat-message").val();

	if(message != ""){
		database.ref("/messages").push({
			message: message,
			date: date,
			user: currentUser
		});
	}
	
	$("#chat-message").val("");
});

$("#sign-in-btn").on("click", function(){
	event.preventDefault();

	var user = $("#sign-in").val();

	if(user != "Spectator"){
		currentUser = user;
		$("#user").html(currentUser);
		createCookie('smuusercookie', currentUser, 7);

		$("#sign-in").val("");
	}
});

$("#playerselect").on("click", function(){
	var player1;
	var player2;

	database.ref("/players/player1").once('value', function(snapshot){
		player1 = snapshot.val();
	});

	database.ref("/players/player2").once('value', function(snapshot){
		player2 = snapshot.val();
	});

	if(player1.player == "None" && currentUser != 'Spectator'){
		database.ref("/players/player1").update({
			player: currentUser
		});
	} else if(player2.player == "None" && currentUser != 'Spectator'){
		database.ref("/players/player2").update({
			player: currentUser
		});
	} else {

	}
});

$("#playerleave").on("click", function(){
	var player1;
	var player2;

	database.ref("/players/player1").once('value', function(snapshot){
		player1 = snapshot.val();
	});

	database.ref("/players/player2").once('value', function(snapshot){
		player2 = snapshot.val();
	});

	if(player1.player == currentUser){
		database.ref("/players/player1").update({
			player: 'None',
			choice: 'None'
		});
	} 
	if(player2.player == currentUser){
		database.ref("/players/player2").update({
			player: 'None',
			choice: 'None'
		});
	} else {

	}
});

$(".throw").on("click", function(){
	var choice = event.target.value;
	
	database.ref("/players").once("value", function(snapshot){
		snapshot.forEach(function(childSnap){
			if(childSnap.val().player == currentUser){
				childSnap.ref.update({
					choice: choice
				});
				$("#choice").html("You have selected " + choice);
			}
		});
	})
});

database.ref("/messages").on("child_added", function(snapshot){
	var sv = snapshot.val();

	$("#chat").append("<div>"+sv.user+", "+sv.date+": "+sv.message+"</div>");
});

database.ref(".info/connected").on("value", function(snapshot){
	if(snapshot.val()){
		var con = database.ref("/connections").push(true);

		con.onDisconnect().remove();
	}
});

database.ref("/connections").on("value", function(snapshot){
	$("#user-list").text(snapshot.numChildren());
});

database.ref("/players/player1").on("value", function(snapshot){
	if(snapshot.val() == null){
		database.ref("/players/player1").update({
			player: "None",
			choice: "None",
			wins: 0
		});
	} else {
		$("#player1").html(snapshot.val().player);
		$("#wins1").html(snapshot.val().wins);
		checkThrows();
	}
});

database.ref("/players/player2").on("value", function(snapshot){
	if(snapshot.val() == null){
		database.ref("/players/player2").update({
			player: "None",
			choice: "None",
			wins: 0
		});
	} else {
		$("#player2").html(snapshot.val().player);
		$("#wins2").html(snapshot.val().wins);	
		checkThrows();
	}
});

function checkThrows(){
	var player1 = database.ref("/players/player1");
	var player2 = database.ref("/players/player2");

	player1.once('value', function(snap){
		if(snap.val().choice != 'None'){
			player2.once('value', function(snap){
				if(snap.val().choice != 'None'){
					finalizeResults();
				}
			});
		}
	});

}

function finalizeResults(){
	var player1;
	var player2;
	var choice1;
	var choice2;
	var wins1;
	var wins2;

	database.ref("/players/player1").once('value', function(snap){
		player1 = snap.val().player;
		choice1 = snap.val().choice;
		wins1 = snap.val().wins ? snap.val().wins : 0;
	});

	database.ref("/players/player2").once('value', function(snap){
		player2 = snap.val().player;
		choice2 = snap.val().choice;
		wins2 = snap.val().wins ? snap.val().wins : 0;
	});

	if(choice1 == choice2){
		$("#results").html(player1 + " chose " + choice1 + " and " + player2 + " also chose " + choice2 + "! Its a tie!");
	} else if(choice1 == 'Rock' && choice2 == 'Scissors') {
		$("#results").html(player1 + " chose " + choice1 + " and smashes " + player2 + "'s " + choice2 + "! " + player1 + " wins!");
		wins1++;
	} else if(choice1 == 'Paper' && choice2 == 'Rock') {
		$("#results").html(player1 + " chose " + choice1 + " and smothers " + player2 + "'s " + choice2 + "! " + player1 + " wins!");
		wins1++;
	} else if(choice1 == 'Scissors' && choice2 == 'Paper') {
		$("#results").html(player1 + " chose " + choice1 + " and cuts " + player2 + "'s " + choice2 + "! " + player1 + " wins!");
		wins1++;
	} else if(choice1 == 'Rock' && choice2 == 'Paper') {
		$("#results").html(player2 + " chose " + choice2 + " and smothers " + player1 + "'s " + choice1 + "! " + player2 + " wins!");
		wins2++;
	} else if(choice1 == 'Paper' && choice2 == 'Scissors') {
		$("#results").html(player2 + " chose " + choice2 + " and cuts " + player1 + "'s " + choice1 + "! " + player2 + " wins!");
		wins2++;
	} else if(choice1 == 'Scissors' && choice2 == 'Rock') {
		$("#results").html(player2 + " chose " + choice2 + " and smashes " + player1 + "'s " + choice1 + "! " + player2 + " wins!");
		wins2++;
	}

	database.ref("/players/player1").update({
		choice: 'None',
		wins: wins1
	}); 

	database.ref("/players/player2").update({
		choice: 'None',
		wins: wins2
	}); 
}


function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}




