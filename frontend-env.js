;(function(){
  var d=typeof window!=='undefined'?window:{}
  var host=d.location&&d.location.hostname||''
  var proto=d.location&&d.location.protocol||'http:'
  var localHosts=['localhost','127.0.0.1','::1']
  var isLocal=localHosts.indexOf(host)>-1
  if(typeof d.RESCONATE_API_BASE_URL==='undefined'){
    d.RESCONATE_API_BASE_URL=isLocal?proto+'//'+host+':3001':''
  }
  d.apiUrl=function(path){
    var base=d.RESCONATE_API_BASE_URL||''
    if(!path) return base
    return path.charAt(0)==='/'?base+path:base+'/'+path
  }
})();
