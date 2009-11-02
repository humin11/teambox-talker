$(function() {
  $('#msgbox')
    .keydown(function(e){
      if (e.which == 13){ // enter
        if (this.value == '') {
          return false;
        } else { // we actually have a message
          ChatRoom.push();
          return false;
        }
      } else if (e.which == 27 || e.which == 8 && this.value.length == 1){// esc or backspace on last character
        $('#msgbox').val('');
      }
    })
    .focus(function(e){
      e.stopPropagation();
    })
  

  ChatRoom.scroller = new Scroller({scrollLimit: function(){ return $('#log tr:last').height() }});
  ChatRoom.align();
  ChatRoom.scroller.scrollToBottom();

  ChatRoom.notifier = new Notifier();
  
  $(window).keydown(function(e){
    switch (e.which){
      case 224: // Cmd in FF
      case 91:  // Cmd in Safari
      case 67:  // Cmd+c Ctrl+c
      case 17:  // Ctrl
        break;
      case 13:  // enter
        ChatRoom.align();
        e.preventDefault();
        break;
      default:
        ChatRoom.align();
        break;
    }
  });
  $('input.search, #edit_room form input, #edit_room form textarea').keydown(function(e){
    e.stopPropagation()
  });
});


/**
* manages the logic behind sending messages and updating the various events occuring to and from the chat room
* Handles focus and blur events.
* the incoming events are all handled by Receiver.js which handles the sorting and compartmentalizing of events by authors and dates.
* the transmitter (client.js)  handles all sending to server.
*/
var ChatRoom = {
  messages: {},
  maxImageWidth: 400,
  current_user: null,
  
  // this is so fugly right now...
  push: function(){
    var presences = [];
    var users = {};
    
    $('#people li').each(function(){
      presences.push($(this).attr('user_name'));
      users[$(this).attr('user_name')] = $(this).attr('user_id');
    })

    var reg_user_list = new RegExp("\/msg (" + presences.join('|') + ") (.+)")
    var match = reg_user_list.exec($('#msgbox').val());
    
    if ($('#msgbox').val().indexOf('/msg') == 0 && match){
      ChatRoom.client.send({content: match[2], to: users[match[1]]});
      $("#msgbox").val('');
      ChatRoom.scroller.scrollToBottom();
    } else if ($('#msgbox').val().indexOf('/msg') == 0) {
      var msgbox = document.getElementById('msgbox');
      if (msgbox){
        setCaretTo(msgbox, 5);
        insertAtCaret(msgbox, "unrecognizable user name ");
        setCaretTo(msgbox, 5, 29);
      }
    } else if ($('#msgbox').val().indexOf('/') == 0){
      var msgbox = document.getElementById('msgbox');
      if (msgbox){
        setCaretTo(msgbox, 1);
        insertAtCaret(msgbox, "unrecognizable command ");
        setCaretTo(msgbox, 1, 23);
      }
    }else {
      ChatRoom.send();
    }
    
  },
  
  send: function() {
    ChatRoom.client.send({content: $('#msgbox').val(), type: 'message'});
    $("#msgbox").val('');
    ChatRoom.scroller.scrollToBottom();
  },
  
  align: function() {
    ChatRoom.scroller.scrollToBottom();
    var msgbox = document.getElementById('msgbox'); // old school
    if (msgbox){
      var position = msgbox.value.length;
      setCaretTo(msgbox, position);
      document.getElementById('msgbox').focus();      
    }
  },
  
  formatMessage: function(content) {
    return FormatHelper.text2html(content, false)
  },
  
  resizeImage: function(image, noScroll){
    $(image).css({width: 'auto'});
    if (image.width > ChatRoom.maxImageWidth){
      $(image).css({width: ChatRoom.maxImageWidth + 'px'});
    }
    $(image).css('visibility', 'visible');
    if (!noScroll) ChatRoom.scroller.scrollToBottom(true);
  }
};

function insertAtCaret(obj, text) {
  if(document.selection) {
    obj.focus();
    var orig = obj.value.replace(/\r\n/g, "\n");
    var range = document.selection.createRange();

    if(range.parentElement() != obj) {
      return false;
    }

    range.text = text;
    
    var actual = tmp = obj.value.replace(/\r\n/g, "\n");

    for(var diff = 0; diff < orig.length; diff++) {
      if(orig.charAt(diff) != actual.charAt(diff)) break;
    }

    for(var index = 0, start = 0; 
      tmp.match(text) 
        && (tmp = tmp.replace(text, "")) 
        && index <= diff; 
      index = start + text.length
    ) {
      start = actual.indexOf(text, index);
    }
  } else if(obj.selectionStart) {
    var start = obj.selectionStart;
    var end   = obj.selectionEnd;

    obj.value = obj.value.substr(0, start) 
      + text 
      + obj.value.substr(end, obj.value.length);
  }
  
  if(start != null) {
    setCaretTo(obj, start + text.length);
  } else {
    obj.value += text;
  }
}

function setCaretTo(obj, start, end) {
  if(obj.createTextRange) {
    var range = obj.createTextRange();
    range.moveStart('character', start);
    range.moveEnd('character',   (end || start));
    range.select();
  } else if(obj.selectionStart) {
    obj.focus();
    obj.setSelectionRange(start, (end || start));
  }
}