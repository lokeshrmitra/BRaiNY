var sendMessage, sendMessageBot;

var config = {
    apiKey: "AIzaSyC9tf5j2FThWEu5srLDCkt-uTWD6elg_OI",
    authDomain: "realtimedatabase-ca7fa.firebaseapp.com",
    databaseURL: "https://realtimedatabase-ca7fa.firebaseio.com",
    storageBucket: "realtimedatabase-ca7fa.appspot.com",
    messagingSenderId: "82449120507"
  };

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

$(document).ready(function(){
	firebase.initializeApp(config);   //Firebase started
	
	//var username = 'rudolph';
	const dbRef = firebase.database().ref().child('chat');
	const messagesRef = dbRef.child('messages');
	const usersRef = dbRef.child('users');
	var allMessagesRef;//	= messagesRef.child(username);
	//Firebase
	
	
	var loginUser = function(name, email){//("Lokesh Mitra","lokeshrmitra@gmail.com")
				var uname = email.split("@")[0];
				setCookie("name", name, 0.25);
				setCookie("email", email, 0.25);
			usersRef.child(uname).set({
				email : email,
				name : name
			},function(){
				console.log(uname);
				$('.bottom_wrapper').fadeIn();
				$('.userDetails').hide();
				allMessagesRef = messagesRef.child(uname);
				/*
				new Message({
					text: "Hi I'm BRaiNY, how may I help you?",
					message_side: 'left'
					}).draw();
				
				allMessagesRef.push({
					message : "Hi I'm BRaiNY, how may I help you?",
					key_from_bot : true,
					timestamp : new Date().getTime()
				});	*/
				
				allMessagesRef.once('value').then(function(snap){
				if(snap.val() != null){
					var allMessages = snap.val();
					var allMessagesArr = Object.keys(allMessages);
					allMessagesArr = allMessagesArr.slice(0, allMessagesArr.length-1);
					for(var i = 0; i< allMessagesArr.length; i++){
						
						var m = allMessages[allMessagesArr[i]];
						if(m.key_from_bot){
							new Message({
								text: m.message,
								message_side: 'left'
								}).draw();
							
						}else{					
							new Message({
								text: m.message,
								message_side: 'right'
								}).draw();
						}
					}
				}
			});
			
			allMessagesRef.limitToLast(1).on('value', function(data){
				var allMessages = data.val();
				for(var i in allMessages){
					var m = allMessages[i];
					if(m.key_from_bot){					
						new Message({
							text: m.message,
							message_side: 'left'
							}).draw();
						$('#ting')[0].play();
						if($('.chatCircle').css('display') == 'none' ){
							$('.chatCircle').find('i').removeClass('hide');
						}
					}else{					
						new Message({
							text: m.message,
							message_side: 'right'
							}).draw();
					}
				}
			});
		
			});
		}
	var cookieName = getCookie("name");
	var cookieEmail = getCookie("email");
    if (cookieName != "" && cookieEmail != "") {
        //alert("Welcome again " + user);
		loginUser(cookieName, cookieEmail);
    } 
    var Message;
    Message = function (arg) {
        this.text = arg.text, this.message_side = arg.message_side;
        this.draw = function (_this) {
            return function () {
                var $message;
                $message = $($('.message_template').clone().html());
                $message.addClass(_this.message_side).find('.text').html(_this.text);
                $('.messages').append($message);
                $('.messages').animate({ scrollTop: $('.messages').prop('scrollHeight') }, 30);
                return $message.addClass('appeared');
            };
        }(this);
        return this;
    };
    
	var getMessageText;
	getMessageText = function () {
		var $message_input;
		$message_input = $('.message_input');
		return $message_input.val();
	};
	/*
	sendMessageBot = function (text) {
		var testBotMessage = {
			key_from_bot : true,
			message : text,
			timestamp : new Date().getTime()
		};
		allMessagesRef.push(testBotMessage);
	};*/
	sendMessage = function (text) {
		var $messages, message;
		if (text.trim() === '') {
			return;
		}
		$('.message_input').val('');
		$messages = $('.messages');
		var testMessage = {
			key_from_bot : false,
			message : text,
			timestamp : new Date().getTime()
		};
		allMessagesRef.push(testMessage);
		form_status = $('.form_status');
		// AJAX here
		/*
		$.ajax({
			url: corenlp.jsp,
			type : 'POST',
			data : {query:query},
			beforeSend: function(){
				form.prepend( form_status.html('<p><i class="fa fa-spinner fa-spin"></i> Email is sending...</p>').fadeIn() );
			},
			success : function(data){
				var jj = JSON.parse(data);
				console.log(jj.type);
				if(parseInt(jj.type) == 1){
					form_status.html('<p class="text-success">' + jj.message + '</p>').delay(3000).fadeOut();
					form[0].reset();
				} else {
					form_status.html('<p class="text-success"> Some error inserting . Try again</p>').delay(3000).fadeOut();
				}
			},
			error : function(ts){
				console.log(ts);
				form_status.html('<p class="text-success">Page Error </p>').delay(3000).fadeOut();
			}
		});
		*/
		
		$messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
		
	};
	
	$('.send_message').click(function (e) {
		return sendMessage(getMessageText());
	});
	$('.message_input').keyup(function (e) {
		if (e.which === 13) {
			return sendMessage(getMessageText());
		}
	});

	$('.chatCircle').click(function(){
		$(this).find('i').addClass('hide');
		$(this).fadeOut(300);
		$('.chat_window').fadeIn(300).animate({ height: 500, opacity: 1 }, 'slow');
	});

	$('#closeButton').click(function(){
		$('.chat_window').animate({ height: 0 }, 'slow', function(){
			$('.chatCircle').fadeIn(300);
		});
	});
	$('.userDetailsForm').submit(function(event){
		event.preventDefault();
		var name,email, form_status, uname;
		name = $('#details_name').val();
		email = $('#details_email').val();
		//uname = email.split("@")[0];
		
		loginUser(name, email);
		/*
		var loginUser = function(uname, email, name){
			usersRef.child(uname).set({
				email : email,
				name : name
			},function(){
				console.log(uname);
				$('.bottom_wrapper').fadeIn();
				$('.userDetails').hide();
				allMessagesRef = messagesRef.child(uname);
				new Message({
					text: "Hi I'm BRaiNY, how may I help you?",
					message_side: 'left'
					}).draw();
				/*
				allMessagesRef.push({
					message : "Hi I'm BRaiNY, how may I help you?",
					key_from_bot : true,
					timestamp : new Date().getTime()
				});	
				
				allMessagesRef.once('value').then(function(snap){
				if(snap.val() != null){
					var allMessages = snap.val();
					var allMessagesArr = Object.keys(allMessages);
					allMessagesArr = allMessagesArr.slice(0, allMessagesArr.length-1);
					for(var i = 0; i< allMessagesArr.length; i++){
						
						var m = allMessages[allMessagesArr[i]];
						if(m.key_from_bot){
							message = new Message({
								text: m.message,
								message_side: 'left'
								});
							message.draw();
						}else{					
							message = new Message({
								text: m.message,
								message_side: 'right'
								});
							message.draw();
						}
					}
				}
			});
			
			allMessagesRef.limitToLast(1).on('value', function(data){
				var allMessages = data.val();
				for(var i in allMessages){
					var m = allMessages[i];
					if(m.key_from_bot){					
						message = new Message({
							text: m.message,
							message_side: 'left'
							});
						message.draw();
					}else{					
						message = new Message({
							text: m.message,
							message_side: 'right'
							});
						message.draw();
					}
				}
			});
		
			});
		}*/
	});
});