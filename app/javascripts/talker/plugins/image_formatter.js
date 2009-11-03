Talker.ImageFormatter = function() {
  var self = this;
  
  self.onFormatMessage = function(event){
    var image_expression = /(^https?:\/\/[^\s]+\.(?:gif|png|jpeg|jpg)$)/gi;
    var image_match = event.content.match(image_expression);
    
    if ($('#talker_image_preloading_div').length == 0){
      $("<div/>")
        .css({position:'absolute', top: '-100px', left: '-100px', height: '100px', width: '100px'})
        .appendTo(document.body);
    }
    
    if (image_match){
      event.complete('loading: ' + image_match[0]);
      Talker.trigger('Loaded', event);
      
      var img = $('<img/>').load(function(){
        $(this).remove();
      
        event.complete('<a href="' 
            + image_match[0]
            + '" target="_blank"><img src="' 
            + image_match[0]
            + '" style="max-height: 400px; max-width: ' + getMaximumContentWidth() + ';" onload=""/>'
            + '</a>'
        );
        
        Talker.trigger('Loaded', event);
      });
    
      $('#talker_image_preloading_div').append(
        img.attr('src', image_match[0])
      );

      return false;
    }
  }
};