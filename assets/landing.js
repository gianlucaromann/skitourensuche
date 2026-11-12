/* Kennzahlen (zählen beim Einblenden hoch) */
var hi=TOURS.reduce(function(a,b){return b.hoehe>a.hoehe?b:a;}),nPow=TOURS.filter(function(t){return t.pow;}).length;
$("stats").innerHTML=[[TOURS.length,"","Skitouren"],[REGIONS.length,"","Regionen"],[hi.hoehe," m","höchster Gipfel: "+esc(hi.gipfel)],[HANGS.length,"","❄ Powder-Hänge um 40° analysiert"]]
  .map(function(x){return '<div class="statc reveal"><b data-n="'+x[0]+'" data-u="'+x[1]+'">'+fmt(x[0])+x[1]+'</b><span>'+x[2]+'</span></div>';}).join("");
$("powCount").textContent=nPow;$("hangCount").textContent=HANGS.length;
if("IntersectionObserver" in window&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
  var cio=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;cio.unobserve(e.target);
    var el=e.target,n=+el.dataset.n,u=el.dataset.u,t0=null;
    (function step(ts){if(!t0)t0=ts;var k=Math.min(1,(ts-t0)/900),v=Math.round(n*(1-Math.pow(1-k,3)));el.textContent=fmt(v)+u;if(k<1)requestAnimationFrame(step);})(performance.now());});});
  document.querySelectorAll("#stats b").forEach(function(b){cio.observe(b);});
}
/* Regionen mit Schwierigkeitsverteilung */
$("regs").innerHTML=REGIONS.map(function(r){var l=TOURS.filter(function(t){return t.region===r;}),hs=l.map(function(t){return t.hoehe;}),np=l.filter(function(t){return t.pow;}).length;
  var bar=FAMS.map(function(f){var n=l.filter(function(t){return fam(t.grad)===f.k;}).length;return n?'<i style="flex:'+n+';background:'+FAM_COL[f.k]+'" title="'+n+'× '+f.l+'"></i>':'';}).join("");
  return '<a class="reg reveal" href="suche.html?region='+encodeURIComponent(r)+'"><b>'+esc(r)+'</b><span>'+l.length+' Touren · '+fmt(Math.min.apply(null,hs))+'–'+fmt(Math.max.apply(null,hs))+' m'+(np?' · ❄ '+np:'')+'</span><span class="bar" aria-hidden="true">'+bar+'</span><em>Touren ansehen →</em></a>';}).join("");

/* Karte */
var map=L.map("map",{scrollWheelZoom:false});
var swiss=swissLayer().addTo(map);
var osm=L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'});
L.control.layers({"Landeskarte":swiss,"OpenStreetMap":osm},null,{position:"topright"}).addTo(map);
map.on("click",function(){map.scrollWheelZoom.enable();});
map.on("mouseout",function(){map.scrollWheelZoom.disable();});
var layer=L.layerGroup().addTo(map),mode="T",sel=[],onlyPow=false,marks={},lines=[];
var H0={nMin:34,nMax:45,hMin:200,expos:[]},hs=JSON.parse(JSON.stringify(H0));

function drawTours(fit){
  layer.clearLayers();marks={};
  var groups={},pts=[],n=0;
  TOURS.forEach(function(t){if(sel.length&&sel.indexOf(fam(t.grad))<0)return;if(onlyPow&&!t.pow)return;var k=t.lat+","+t.lon;(groups[k]=groups[k]||[]).push(t);n++;});
  Object.keys(groups).forEach(function(k){
    var g=groups[k].sort(function(a,b){return GRADES.indexOf(a.grad)-GRADES.indexOf(b.grad);}),t=g[0];
    var html='<div class="pop"><h3>'+esc(t.gipfel)+'</h3><p class="hh">'+fmt(t.hoehe)+' m ü. M. · '+esc(t.region)+'</p>'+g.map(function(x){
      return '<div class="row"><div><span>'+esc(x.route)+'</span><span class="g g-'+fam(x.grad)+'">'+esc(x.grad)+'</span></div><div><span>'+(x.auf==null?"Abfahrt "+fmt(x.ab)+" Hm":"Aufstieg "+(x.det?"":"≈ ")+fmt(x.auf)+" Hm")+'</span><a href="suche.html?tour='+x.id+'">Details →</a></div>'+(x.pow?'<div class="powline">❄ '+EXPO_LONG[x.pow.expo]+' · '+fmt(x.pow.hm)+' Hm · Ø '+x.pow.neig+'°</div>'+profSVG(x.pow):'')+'</div>';}).join("")+'</div>';
    g.forEach(function(x){if(!x.pow)return;L.polyline(x.pow.path,{color:"#fff",weight:7,opacity:.9,interactive:false}).addTo(layer);L.polyline(x.pow.path,{color:"#C9974A",weight:4,interactive:false}).addTo(layer);});
    var m=L.marker([t.lat,t.lon],{title:t.gipfel,alt:t.gipfel+" ("+t.grad+")",icon:pinIcon(t.grad,g.some(function(x){return x.pow;}))}).bindPopup(html,{minWidth:260,maxWidth:320}).addTo(layer);
    g.forEach(function(x){marks[x.id]=m;});pts.push([t.lat,t.lon]);
  });
  if(fit&&pts.length)map.fitBounds(pts,{padding:[40,40],maxZoom:13});
  $("mapCount").textContent=n;$("mapUnit").textContent=n===1?"Tour":"Touren";
  $("mapFams").innerHTML=FAMS.map(function(f){var on=sel.indexOf(f.k)>=0;return '<button type="button" class="chip'+(on?" on":"")+'" aria-pressed="'+on+'" data-k="'+f.k+'"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:'+FAM_COL[f.k]+';margin-right:8px"></span>'+esc(f.l)+'</button>';}).join("")+'<button type="button" class="chip chip-pow'+(onlyPow?" on":"")+'" aria-pressed="'+onlyPow+'" data-pow="1">❄ Nur Powder-Hänge</button>';
}
function hcol(n){return n<37?"#E0B771":(n<39.5?"#C77A14":"#B83232");}
function hangPop(h){var t=h.t&&TOURS.filter(function(x){return x.id===h.t;})[0];
  return '<div class="pop"><h3>'+EXPO_LONG[h.expo]+'hang '+(h.d<400?'am ':'bei ')+esc(h.n)+'</h3><p class="hh">'+fmt(h.von)+'–'+fmt(h.bis)+' m ü. M.</p>'+
    '<dl class="kv" style="font-size:13px"><dt>Höhendifferenz</dt><dd>'+fmt(h.hm)+' Hm</dd><dt>Hangneigung</dt><dd>Ø '+String(h.neig).replace(".",",")+'° (±'+String(h.std).replace(".",",")+'°)</dd><dt>Exposition</dt><dd>'+EXPO_LONG[h.expo]+'</dd><dt>Hanglänge</dt><dd>'+fmt(h.len)+' m</dd></dl>'+profSVG(h)+
    (t?'<a href="suche.html?tour='+t.id+'" style="font-weight:600;font-size:13px">Tour '+esc(t.gipfel)+' ansehen →</a>':'')+'</div>';}
function drawHangs(fit){
  layer.clearLayers();lines=[];
  var list=HANGS.filter(function(h){return h.neig>=hs.nMin&&h.neig<=hs.nMax&&h.hm>=hs.hMin&&(!hs.expos.length||hs.expos.indexOf(h.expo)>=0);}),pts=[];
  list.forEach(function(h){
    L.polyline(h.path,{color:"#fff",weight:9,opacity:.95,interactive:false}).addTo(layer);
    var l=L.polyline(h.path,{color:hcol(h.neig),weight:5.5,opacity:1}).bindPopup(function(){return hangPop(h);},{minWidth:260,maxWidth:320}).addTo(layer);
    L.circleMarker(h.path[0],{radius:5,color:"#fff",weight:2,fillColor:hcol(h.neig),fillOpacity:1}).bindPopup(function(){return hangPop(h);},{minWidth:260,maxWidth:320}).addTo(layer);
    l.on("mouseover",function(){l.setStyle({weight:9});});l.on("mouseout",function(){l.setStyle({weight:5.5});});
    lines.push({h:h,l:l});pts.push(h.path[0],h.path[3]);
  });
  if(fit&&pts.length)map.fitBounds(pts,{padding:[40,40],maxZoom:14});
  $("mapCount").textContent=list.length;$("mapUnit").textContent=list.length===1?"Hang":"Hänge";
  $("oN").textContent=String(hs.nMin).replace(".",",")+"° – "+String(hs.nMax).replace(".",",")+"°";$("oH").textContent="≥ "+hs.hMin+" Hm";
  $("nMin").value=hs.nMin;$("nMax").value=hs.nMax;$("hMin").value=hs.hMin;
  $("hRose").innerHTML=roseSVG(hs.expos);
  $("hTop").innerHTML=list.slice(0,5).map(function(h,i){return '<li><button type="button" data-i="'+i+'"><b>'+fmt(h.hm)+' Hm</b><span>'+esc(h.n)+' · '+EXPO_DE[h.expo]+' · '+Math.round(h.neig)+'°</span></button></li>';}).join("")||'<li class="none">Kein Hang erfüllt diese Kriterien.</li>';
  $("hTop").onclick=function(e){var b=e.target.closest("button");if(!b)return;var x=lines[+b.dataset.i];map.once("moveend",function(){x.l.openPopup();});map.flyToBounds([x.h.path[0],x.h.path[3]],{paddingTopLeft:[60,260],paddingBottomRight:[60,40],maxZoom:15,duration:.8});};
}
function draw(fit){mode==="T"?drawTours(fit):drawHangs(fit);}
function setMode(m){mode=m;$("tabT").setAttribute("aria-selected",m==="T");$("tabH").setAttribute("aria-selected",m==="H");$("ctlT").hidden=m!=="T";$("ctlH").hidden=m!=="H";draw(true);}
$("tabT").onclick=function(){setMode("T");};$("tabH").onclick=function(){setMode("H");};
$("mapFams").onclick=function(e){var b=e.target.closest("button");if(!b)return;if(b.dataset.pow)onlyPow=!onlyPow;else{var i=sel.indexOf(b.dataset.k);if(i<0)sel.push(b.dataset.k);else sel.splice(i,1);}drawTours(true);};
$("nMin").oninput=function(){hs.nMin=+this.value;if(hs.nMin>hs.nMax)hs.nMax=hs.nMin;drawHangs(false);};
$("nMax").oninput=function(){hs.nMax=+this.value;if(hs.nMax<hs.nMin)hs.nMin=hs.nMax;drawHangs(false);};
$("hMin").oninput=function(){hs.hMin=+this.value;drawHangs(false);};
$("hReset").onclick=function(){hs=JSON.parse(JSON.stringify(H0));drawHangs(true);};
bindRose($("hRose"),function(e){var i=hs.expos.indexOf(e);if(i<0)hs.expos.push(e);else hs.expos.splice(i,1);drawHangs(false);});
function showTour(id){
  sel=[];onlyPow=false;setMode("T");var m=marks[id];if(!m)return;
  $("karte").scrollIntoView({behavior:"smooth"});
  map.closePopup();map.once("moveend",function(){m.openPopup();});map.flyTo(m.getLatLng(),13,{duration:1});
}
$("rnd").onclick=function(){showTour(TOURS[Math.floor(Math.random()*TOURS.length)].id);};
$("toExplorer").onclick=function(){setMode("H");$("karte").scrollIntoView({behavior:"smooth"});};
draw(true);
var qt=new URLSearchParams(location.search).get("tour");
if(qt&&marks[qt]){map.setView(marks[qt].getLatLng(),13);marks[qt].openPopup();}
