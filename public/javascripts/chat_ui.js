(function () {
  if (typeof App === "undefined") {
    window.App = {};
  }

  var ChatUI = App.ChatUI = function (chat){
    this.chat = chat;
    this.$messages = $('#messages');
    this.$sendButton = $('#send-button');
    this.$chatForm = $('.chat-form');
    this.$messageInput = $('#message-input');
    this.$roomList = $('#room-list');

    this.bindHandlers();
  };

  ChatUI.prototype.bindHandlers = function() {
    this.chat.socket.on('message', function(message) {
      var formattedMessage = this.formatMessage(message);
      if (formattedMessage.html() !== "") {
        this.$messages.append(formattedMessage);
        this.scrollDown();
      }
    }.bind(this));

    this.chat.socket.on('adminMessage', function(message) {
      var formattedMessage = this.formatMessage(message);
      this.$messages.append(formattedMessage);
      this.scrollDown();
    }.bind(this));

    this.chat.socket.on('nicknameChangeResult', function(message) {
      var formattedMessage = this.formatMessage(message);
      this.$messages.append(formattedMessage);
      this.scrollDown();
    }.bind(this));

    this.$chatForm.on('submit', function(event){
      event.preventDefault();
      this.handleSubmit();
    }.bind(this));

    this.chat.socket.on('roomList', function(roomInfo) {
      this.populateRoomList(roomInfo);
    }.bind(this));
  };

  ChatUI.prototype.populateRoomList = function (roomInfo) {
    this.$roomList.empty();
    for(var room in roomInfo) {
      var roomList = $('<div>');
      var roomClients = $('<div>');
      var roomTitle = $('<div>').text(room);
      roomList.append(roomTitle);
      roomList.addClass('panel panel-default');
      roomTitle.addClass('panel-heading');
      roomClients.addClass('panel-body');
      roomInfo[room].forEach(function (userName) {
        var user = $('<div>').text(userName);
        roomClients.append(user);
      })
      roomList.append(roomClients);
      this.$roomList.append(roomList);
    }
  };

  ChatUI.prototype.formatMessage = function(message) {
    if (message.nickname) {
      var name = $('<h5>').text(message.nickname);
      var message = $('<div>').text(message.text);
      name.addClass('name');
      var formattedMessage = $('<div>');
      formattedMessage.append(name);
      formattedMessage.append(message);
    } else {
      var formattedMessage = $('<div>').text(message.text);
    }
    var template = $('<li>').append(formattedMessage);
    template.addClass('panel message');
    template.smilify();
    return template;
  };

  ChatUI.prototype.handleSubmit = function() {
    var message = this.$messageInput.val();

    if (message[0] === '/') {
      this.chat.handleCommand(message);
    } else {
      this.chat.sendMessage(message);
    }

    this.$messageInput.val('');
  };

  ChatUI.prototype.scrollDown = function () {
    var height = this.$messages[0].scrollHeight;
    this.$messages.animate({"scrollTop": height}, 'slow');
  };
})();
