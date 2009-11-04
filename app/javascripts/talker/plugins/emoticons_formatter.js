Talker.EmoticonsFormatter = function() {
  var self = this;
  
  // giving credits to  http://james.padolsey.com/javascript/find-and-replace-text-with-javascript/
  function findAndReplace(searchText, replacement, searchNode) {
      if (!searchText || typeof replacement === 'undefined') {
          return;
      }
      var regex = typeof searchText === 'string' ?
                  new RegExp(searchText, 'g') : searchText,
          childNodes = (searchNode || document.body).childNodes,
          cnLength = childNodes.length,
          excludes = 'html,head,style,title,link,meta,script,object,iframe,pre';
      while (cnLength--) {
          var currentNode = childNodes[cnLength];
          if (currentNode.nodeType === 1 &&
              (excludes + ',').indexOf(currentNode.nodeName.toLowerCase() + ',') === -1) {
              arguments.callee(searchText, replacement, currentNode);
          }
          if (currentNode.nodeType !== 3 || !regex.test(currentNode.data) ) {
              continue;
          }
          var parent = currentNode.parentNode,
              frag = (function(){
                  var html = currentNode.data.replace(regex, replacement),
                      wrap = document.createElement('div'),
                      frag = document.createDocumentFragment();
                  wrap.innerHTML = html;
                  while (wrap.firstChild) {
                      frag.appendChild(wrap.firstChild);
                  }
                  return frag;
              })();
          parent.insertBefore(frag, currentNode);
          parent.removeChild(currentNode);
      }
  }
  
  self.onPostFormatMessage = function(event){
    $('#log p:last').each(function(){
      findAndReplace(/:-*\)/, '<img src="/images/icons/smiley.png" class="emoticon" width="16" height="16" alt=":-)" title="smiling" />',  $(this).get(0));
      findAndReplace(/:-*D/, '<img src="/images/icons/smiley-grin.png" class="emoticon" width="16" height="16" alt=":-)" title="grin" />', $(this).get(0));
      findAndReplace(/:-*\(/, '<img src="/images/icons/smiley-sad.png" class="emoticon" width="16" height="16" alt=":-(" title="sad" />', $(this).get(0));
      findAndReplace(/;-*\(/, '<img src="/images/icons/smiley-cry.png" class="emoticon" width="16" height="16" alt=";-(" title="cry" />', $(this).get(0));
      findAndReplace(/B-*\)/, '<img src="/images/icons/smiley-cool.png" class="emoticon" width="16" height="16" alt="B-)" title="cool" />', $(this).get(0));
    });
  }
};