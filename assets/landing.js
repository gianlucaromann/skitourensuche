var $=function(id){return document.getElementById(id);};
// Kennzahlen
var hi=TOURS.reduce(function(a,b){return b.hoehe>a.hoehe?b:a;});
$("stats").innerHTML=[[TOURS.length,"Skitouren"],[REGIONS.length,"Regionen"],[fmt(hi.hoehe)+" m","höchster Gipfel: "+esc(hi.gipfel)],[TOURS.filter(function(t){return fam(t.grad)==="L";}).length,"leichte Einsteigertouren"]]
  .map(function(x){return '<div class="statc"><b>'+x[0]+'</b><span>'+x[1]+'</span></div>';}).join("");
// Regionen
$("regs").innerHTML=REGIONS.map(function(r){var l=TOURS.filter(function(t){return t.region===r;});
  var hs=l.map(function(t){return t.hoehe;});
  return '<a class="reg" href="suche.html?region='+encodeURIComponent(r)+'"><b>'+esc(r)+'</b><span>'+l.length+' Touren · '+fmt(Math.min.apply(null,hs))+'–'+fmt(Math.max.apply(null,hs))+' m</span><em>Touren ansehen →</em></a>';}).join("");
// Karte
var map=L.map("map",{scrollWheelZoom:false});
var swiss=L.tileLayer("https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg",{maxZoom:18,attribution:'&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>'}).addTo(map);
var osm=L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'});
L.control.layers({"Landeskarte":swiss,"OpenStreetMap":osm},null,{position:"topright"}).addTo(map);
map.on("click",function(){map.scrollWheelZoom.enable();});
map.on("mouseout",function(){map.scrollWheelZoom.disable();});
var layer=L.layerGroup().addTo(map),sel=[];
function draw(){
  layer.clearLayers();
  var groups={},pts=[];
  TOURS.forEach(function(t){if(sel.length&&sel.indexOf(fam(t.grad))<0)return;var k=t.lat+","+t.lon;(groups[k]=groups[k]||[]).push(t);});
  Object.keys(groups).forEach(function(k){
    var g=groups[k].sort(function(a,b){return GRADES.indexOf(a.grad)-GRADES.indexOf(b.grad);}),t=g[0];
    var html='<div class="pop"><h3>'+esc(t.gipfel)+'</h3><p class="hh">'+fmt(t.hoehe)+' m ü. M. · '+esc(t.region)+'</p>'+g.map(function(x){
      return '<div class="row"><div><span>'+esc(x.route)+'</span><span class="g g-'+fam(x.grad)+'">'+esc(x.grad)+'</span></div><div><span>'+(x.auf==null?"Abfahrt "+fmt(x.ab)+" Hm":"Aufstieg "+(x.det?"":"≈ ")+fmt(x.auf)+" Hm")+'</span><a href="suche.html?tour='+x.id+'">Details →</a></div></div>';}).join("")+'</div>';
    L.marker([t.lat,t.lon],{title:t.gipfel,alt:t.gipfel+" ("+t.grad+")",icon:L.divIcon({className:"",iconSize:[34,34],iconAnchor:[17,34],popupAnchor:[0,-32],html:'<span class="pin pin-'+fam(t.grad)+'"><i>'+esc(t.grad)+'</i></span>'})}).bindPopup(html).addTo(layer);
    pts.push([t.lat,t.lon]);
  });
  if(pts.length)map.fitBounds(pts,{padding:[40,40],maxZoom:13});
  $("mapCount").textContent=Object.keys(groups).reduce(function(n,k){return n+groups[k].length;},0);
}
function chips(){
  $("mapFams").innerHTML=FAMS.map(function(f){var on=sel.indexOf(f.k)>=0;return '<button type="button" class="chip'+(on?" on":"")+'" aria-pressed="'+on+'" data-k="'+f.k+'"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:'+FAM_COL[f.k]+';margin-right:8px"></span>'+esc(f.l)+'</button>';}).join("");
}
$("mapFams").onclick=function(e){var b=e.target.closest("button");if(!b)return;var i=sel.indexOf(b.dataset.k);if(i<0)sel.push(b.dataset.k);else sel.splice(i,1);chips();draw();};
chips();draw();
