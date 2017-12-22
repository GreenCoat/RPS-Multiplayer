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

var currentUser = readCookie('smuusercookie') != null ? readCookie('smuusercookie') : "Guest";

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

	if(user != "Guest"){
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

	if(player1.player == "None"){
		database.ref("/players/player1").update({
			player: currentUser
		});
	} else if(player2.player == "None"){
		database.ref("/players/player2").update({
			player: currentUser
		});
	} else {

	}
});

$(".throw").on("click", function(){
	var player;

	$("#results").html("You have selected " + event.target.value);
	
	database.ref("/players").once("value", function(snapshot){
		snapshot.forEach(function(childSnap){
			if(childSnap.val().player == currentUser){
				player = childSnap.val().key;
				console.log(childSnap.val());
				console.log(database.ref("/players").child('player1'));
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
			choice: "None"
		});
	} else {
		$("#player1").html(snapshot.val().player);	
	}
});

database.ref("/players/player2").on("value", function(snapshot){
	if(snapshot.val() == null){
		database.ref("/players/player2").update({
			player: "None",
			choice: "None"
		});
	} else {
		$("#player2").html(snapshot.val().player);	
	}
});


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




