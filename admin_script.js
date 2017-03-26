var config = {
    apiKey: "AIzaSyC9tf5j2FThWEu5srLDCkt-uTWD6elg_OI",
    authDomain: "realtimedatabase-ca7fa.firebaseapp.com",
    databaseURL: "https://realtimedatabase-ca7fa.firebaseio.com",
    storageBucket: "realtimedatabase-ca7fa.appspot.com",
    messagingSenderId: "82449120507"
  };
	
var getMessageText, sendMessage;
var userRef;

var myOnce = true;
		
var NewChat = function (arg) {
	this.name = arg.name; this.message = arg.message; this.from_bot = arg.from_bot;this.timestamp = arg.timestamp;
	this.n = arg.n;this.myNew = arg.myNew;
	this.draw = function (_this) {
		return function () {
			var $chat;
			$chat = $($('.chat_template').clone().html());
			$chat.find('.chat_name').html(_this.n);
			$chat.find('.chat_text').html(_this.message.length < 30 ? _this.message : _this.message.substr(0,30)+"...");
			$chat.attr("data-name",_this.name);
			$chat.data("data-timestamp",_this.timestamp);
			$chat.data("data-n",_this.n);
			if(!_this.myNew)
				$chat.find('.chat_new').addClass('hide');
			$('.chats-ul').append($chat);
		};
	}(this);
	return this;
};

var Message = function (arg) {
	this.text = arg.text, this.message_side = arg.message_side; this.timestamp = arg.timestamp;
	this.draw = function (_this) {
		return function () {
			var $message, $messages;
			$messages = $('.current-chat-ul');
			$message = $($('.message_template').clone().html());
			$message.find('p').html(_this.text);
			var newDate = new Date(_this.timestamp);
			$message.find('i').html(newDate.getHours()+":"+newDate.getMinutes());
			if(myOnce == true){
				myOnce = false;
				$message.prepend("<span style=\"color:white;border-top:1px solid white; border-bottom:1px solid white\">"+newDate.toDateString()+"</span>")
			}
			if(new Date($messages.children().last().data("data-timestamp")).getDate() < newDate.getDate())
				$message.prepend("<span style=\"color:white;border-top:1px solid white; border-bottom:1px solid white\">"+newDate.toDateString()+"</span>");
			
			$message.data("data-timestamp",_this.timestamp);
			if(!_this.message_side) {$message.addClass('left').addClass('bg-green');}
			else {$message.addClass('right').addClass('bg-blue');}
			$messages.append($message);
			$('.current-chat-area').animate({ scrollTop: $('.current-chat-area').prop('scrollHeight') }, 30);
		};
	}(this);
	return this;
};

getMessageText = function () {
	var $message_input;
	$message_input = $('#message_input');
	return $message_input.val();
}

$(document).ready(function(){
	firebase.initializeApp(config);   //Firebase started
	const dbRef = firebase.database().ref().child('chat');
	const messagesRef = dbRef.child('messages');
	const usersRef = dbRef.child('users');
	
	var theNames = {};
	
	usersRef.on('value', function(data){
		for(var mNames in data.val()){
			var obj = data.val()[mNames];
			theNames[mNames] = obj.name;
		}
	});
	messagesRef.once('value').then(function(data){
		$('#loading_div').show();
		var allChats = data.val();
		var allChatsArr = Object.keys(allChats);

		for(var i = 0; i< allChatsArr.length; i++){
			var c = allChats[allChatsArr[i]];
			var lastMessage;
			for(var cc in c)
				lastMessage = c[cc];
	
			new NewChat({
				name: allChatsArr[i],
				n:theNames[allChatsArr[i]],
				message: lastMessage.message,
				myNew : false,
				from_bot : lastMessage.key_from_bot,
				timestamp : lastMessage.timestamp
			}).draw();
			
		}
		
		$('#loading_div').hide();
		messagesRef.on('value', function(data){
			var chats = data.val();
			for(var chat in chats){
				var c = chats[chat];
				for(var mes in c){
					var myMes = c[mes];
					
					var oneChat = $('[data-name = '+chat+']');
					if(oneChat.length){
						if(oneChat.data("data-timestamp") < myMes.timestamp){
							oneChat.find('.chat_text').text(myMes.message);
							oneChat.find('.chat_new').removeClass('hide');
							$('.chats-ul').prepend($('[data-name = '+chat+']'));
						}
					}else{
						new NewChat({
							name: chat,
							n:theNames[chat],
							myNew : true,
							message: myMes.message,
							from_bot : myMes.key_from_bot,
							timestamp : myMes.timestamp
						}).draw();
					}
					if($('.current-chat-head').data("data-name") == chat &&
						$('.current-chat-ul').children('.current-chat-li').last().data("data-timestamp") < myMes.timestamp)
						new Message({
							text : myMes.message,
							message_side : myMes.key_from_bot,
							timestamp : myMes.timestamp
						}).draw();
				}
			}
		});
		
	});
		
	sendMessage = function (text) {
		if (text.trim() === '') {
			return;
		}
		$('#message_input').val('');
		
		var pushMessage = {
			key_from_bot : true,
			message : text,
			timestamp : new Date().getTime()
		};
		messagesRef.child($('.current-chat-head').data("data-name")).push(pushMessage);	
	}
	
	$('.chats-ul').on('click', '.chats-item', function(){
		$('.chats-item').removeClass('selected');
		$(this).addClass('selected');
		$(this).find('i').addClass('hide');
		var uname = $(this).attr("data-name");
		var mName = $(this).data("data-n");
		
		$('.current-chat-head').find('h2').text(mName);
		$('.current-chat-head').data("data-name", uname);
		$('.current-chat-ul').empty();
		
		if(myOnce == false) myOnce = true;
		
		userRef = messagesRef.child(uname);
		userRef.once('value').then(function(data){
			var m = data.val();
			for(var mm in m){
				var mmm = m[mm];
				var newMessage = new Message({
					text : mmm.message,
					message_side : mmm.key_from_bot,
					timestamp : mmm.timestamp
				});
				newMessage.draw();
			}
			
		});
	});
	
	$('#consultant_button').click(function () {
		return sendMessage($('#message_input').val());
	});
	$('#message_input').keyup(function (e) {
		if (e.which === 13) {
			return sendMessage($(this).val());
		}
	});
	
	$('#test').click(function(){
		new NewChat({
			name: "test",
			n:"TEST",
			message: "test 11",
			from_bot : false,
			timestamp : 114455
		}).draw();
	});
});
