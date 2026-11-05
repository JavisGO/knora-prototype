(function(){
  'use strict';
  var params=new URLSearchParams(location.search);
  if(params.get('view')==='project-resources'){
    params.set('view','project-overview');
    location.replace('jinglun.html?'+params.toString());
    return;
  }
  function removeResourceEntrances(){
    document.querySelectorAll('a[href*="view=project-resources"]').forEach(function(link){link.remove()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',removeResourceEntrances);else removeResourceEntrances();
  new MutationObserver(removeResourceEntrances).observe(document.documentElement,{childList:true,subtree:true});
})();
