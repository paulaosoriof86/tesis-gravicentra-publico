(()=>{
  const params=new URLSearchParams(location.search);
  const supplied=(params.get("p")||"").trim().replace(/[^A-Za-z0-9_-]/g,"").slice(0,24);
  const scope=supplied||"ANON";
  const scopedKeys=new Set([
    "b98_field_v04rc",
    "b98_field_v05_client_submission_id",
    "b98_field_v05_centralized_sent"
  ]);

  const originalGet=Storage.prototype.getItem;
  const originalSet=Storage.prototype.setItem;
  const originalRemove=Storage.prototype.removeItem;

  const scopedKey=key=>scopedKeys.has(String(key))?`${key}::${scope}`:key;

  Storage.prototype.getItem=function(key){
    return originalGet.call(this,scopedKey(key));
  };
  Storage.prototype.setItem=function(key,value){
    return originalSet.call(this,scopedKey(key),value);
  };
  Storage.prototype.removeItem=function(key){
    return originalRemove.call(this,scopedKey(key));
  };

  window.B98_STORAGE_SCOPE=scope;
})();
