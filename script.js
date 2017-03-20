var sendMessage, sendMessageBot;
var firstTime = true;
(function () {
	var config = { //Firebase config
    apiKey: "AIzaSyBgDkJt8I4pK9Fej0cfN_d3TskxMVsHCcE",
    authDomain: "brainy-7dac9.firebaseapp.com",
    databaseURL: "https://brainy-7dac9.firebaseio.com",
    storageBucket: "brainy-7dac9.appspot.com",
    messagingSenderId: "338804187531"
	};
	firebase.initializeApp(config);   //Firebase started
	//BRaiNY's
	var username = 'lokesh';
	const dbRef = firebase.database().ref().child('chat');
	const messagesRef = dbRef.child('messages');
	//const usersRef = dbRef.child('users');
	const allMessagesRef = messagesRef.child(username);
	//Firebase
	
    var Message;
    Message = function (arg) {
        this.text = arg.text, this.message_side = arg.message_side;
        this.draw = function (_this) {
            return function () {
                var $message;
                $message = $($('.message_template').clone().html());
                $message.addClass(_this.message_side).find('.text').html(_this.text);
                $('.messages').append($message);
                return setTimeout(function () {
                    return $message.addClass('appeared');
                }, 0);
            };
        }(this);
        return this;
    };
    $(function () {
        var getMessageText;
        getMessageText = function () {
            var $message_input;
            $message_input = $('.message_input');
            return $message_input.val();
        };
		
        sendMessageBot = function (text) {
            /*
			var $messages, message;
            $messages = $('.messages');
            message = new Message({
                text: text,
                message_side: 'left'
            });
            message.draw();
			*/
			var testBotMessage = {
				key_from_bot : true,
				message : text,
				timestamp : new Date().getTime()
			};
			allMessagesRef.push(testBotMessage);
            //return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
        };
		sendMessage = function (text) {
            var $messages, message;
            if (text.trim() === '') {
                return;
            }
            $('.message_input').val('');
            $messages = $('.messages');
			/*
			message = new Message({
					text: text,
					message_side: 'right'
					});
			message.draw();
			*/
			var testMessage = {
				key_from_bot : false,
				message : text,
				timestamp : new Date().getTime()
			};
			allMessagesRef.push(testMessage);
			
			//return 
			$messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
			$.ajax({
				url : 'php/query.php',
				type: 'POST',
				data : {text:text},	
				success : function(data){
					sendMessageBot(data);
				},
				error : function(err_data){
					alert('huh?');
				}
			});
            
        };
		
        $('.send_message').click(function (e) {
            return sendMessage(getMessageText());
        });
        $('.message_input').keyup(function (e) {
            if (e.which === 13) {
                return sendMessage(getMessageText());
            }
        });
    });
	
	
	
	
	$('.chatCircle').click(function(){
		$(this).fadeOut(300);
		$('.chat_window').fadeIn(300).animate({ height: 500, opacity: 1 }, 'slow');
		  document.title = 'Your New Title';
	});

	$('#closeButton').click(function(){
		$('.chat_window').animate({ height: 0 }, 'slow', function(){
			$('.chatCircle').fadeIn(300);
		});
	});
	$('.userDetailsForm').submit(function(event){
		event.preventDefault();
		var name,email, form_status;
		name = $('#details_name').val();
		email = $('#details_email').val();
		form_status = $('.form_status');
		$.ajax({
			url: 'php/save_user.php',
			type : 'POST',
			data : {name:name, email:email},
			beforeSend: function(){
				form_status.html('<img src="loading.gif">');
			},
			success : function(data){
				$('.bottom_wrapper').fadeIn();
				$('.userDetails').hide();
				//sendMessageBot("Hi there");
				messagesRef.child(username).once('value').then(function(snap){
					var allMessages = snap.val();
					var allMessagesArr = Object.keys(allMessages);
					allMessagesArr = allMessagesArr.slice(0, allMessagesArr.length-1);
					for(var i = 0; i< allMessagesArr.length; i++){
						
						var m = allMessages[allMessagesArr[i]];
						if(m.key_from_bot){
							//sendMessageBot(m.message);
							message = new Message({
								text: m.message,
								message_side: 'left'
								});
							message.draw();
						}else{
							//sendMessage(m.message);
							message = new Message({
								text: m.message,
								message_side: 'right'
								});
							message.draw();
						}
					}
					var msg = messagesRef.child(username).limitToLast(1);
					msg.on('value', function(data){
						//console.log(data.val());
						var allMessages = data.val();
						/*
						if(firstTime){
							var j;
							for(j in allMessages)
						}
						*/
						for(var i in allMessages){
							var m = allMessages[i];
							if(m.key_from_bot){
								//sendMessageBot(m.message);
								message = new Message({
									text: m.message,
									message_side: 'left'
									});
								message.draw();
							}else{
								//sendMessage(m.message);
								message = new Message({
									text: m.message,
									message_side: 'right'
									});
								message.draw();
							}
						}
					});
				});
				
			},
			error : function(err_data){
				form_status.html('<p style=\"font-size:15px;\">There\'s some error</p>');
			}
		});
	});
	
}.call(this));