// Gemeinsame Bausteine: Kompassrose, Hangprofil, Merkliste, Marker
var $=function(id){return document.getElementById(id);};

/* Kompassrose: 8 anklickbare Sektoren */
function roseSVG(sel){
  var out='<svg class="rose" viewBox="-62 -62 124 124" role="group" aria-label="Exposition wählen">',r=50,r0=15;
  function p(rad,a){return (rad*Math.cos(a)).toFixed(1)+" "+(rad*Math.sin(a)).toFixed(1);}
  EXPOS.forEach(function(e,i){
    var a0=(i*45-22.5-90)*Math.PI/180,a1=(i*45+22.5-90)*Math.PI/180,am=(i*45-90)*Math.PI/180,on=sel.indexOf(e)>=0;
    out+='<g class="w'+(on?" on":"")+'" data-e="'+e+'" role="button" tabindex="0" aria-pressed="'+on+'" aria-label="'+EXPO_LONG[e]+'">'+
      '<path d="M'+p(r0,a0)+'L'+p(r,a0)+'A'+r+' '+r+' 0 0 1 '+p(r,a1)+'L'+p(r0,a1)+'A'+r0+' '+r0+' 0 0 0 '+p(r0,a0)+'Z"/>'+
      '<text x="'+(34*Math.cos(am)).toFixed(1)+'" y="'+(34*Math.sin(am)+3.4).toFixed(1)+'">'+EXPO_DE[e]+'</text></g>';
  });
  return out+'<circle r="12" class="hub"/><text class="hubt" y="3.2">'+(sel.length?sel.length:"alle")+'</text></svg>';
}
function bindRose(el,toggle){
  function hit(e){var g=e.target.closest&&e.target.closest("g.w");if(g)toggle(g.dataset.e);}
  el.addEventListener("click",hit);
  el.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();var g=e.target.closest("g.w");if(g){var k=g.dataset.e;toggle(k);var n=el.querySelector('g.w[data-e="'+k+'"]');n&&n.focus();}}});
}

/* Hangprofil: massstabsgetreu (Winkel entspricht der echten Hangneigung) */
function profSVG(o){
  var W=300,H=150,L=o.len,pr=o.prof,D=pr[0]-pr[pr.length-1],sc=Math.min((W-24)/L,(H-46)/D),n=pr.length;
  var x0=(W-L*sc)/2,y0=12,pts=pr.map(function(h,i){return [x0+L*i/(n-1)*sc,y0+(pr[0]-h)*sc];});
  var line=pts.map(function(q){return q[0].toFixed(1)+" "+q[1].toFixed(1);}).join("L"),yb=y0+D*sc+10;
  var def="Ø "+String(o.neig).replace(".",",")+"° · "+fmt(o.hm)+" Hm · "+fmt(L)+" m lang";
  return '<svg class="prof" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Hangprofil: '+def+'" data-prof="'+pr.join(",")+'" data-len="'+L+'" data-sc="'+sc+'" data-x0="'+x0+'" data-def="'+def+'">'+
    '<path class="pa" d="M'+line+'L'+pts[n-1][0].toFixed(1)+" "+yb+"L"+pts[0][0].toFixed(1)+" "+yb+'Z"/><path class="pl" d="M'+line+'"/>'+
    '<text class="ph" text-anchor="end" x="'+(pts[0][0]-7).toFixed(1)+'" y="'+(pts[0][1]+4)+'">'+fmt(pr[0])+' m</text><text class="ph" x="'+(pts[n-1][0]+7).toFixed(1)+'" y="'+(pts[n-1][1]+3).toFixed(1)+'">'+fmt(pr[n-1])+' m</text>'+
    '<g class="cur" style="display:none"><line y1="6" y2="'+yb+'"/><circle r="4.5"/></g>'+
    '<text class="pr" x="'+W/2+'" y="'+(H-6)+'" text-anchor="middle">'+def+'</text></svg>';
}
function profMove(e){
  var s=e.target.closest&&e.target.closest("svg.prof");if(!s)return;
  var r=s.getBoundingClientRect(),pr=s.dataset.prof.split(",").map(Number),L=+s.dataset.len,sc=+s.dataset.sc,x0=+s.dataset.x0,n=pr.length;
  var d=Math.max(0,Math.min(L,((e.clientX-r.left)/r.width*300-x0)/sc)),f=d/L*(n-1),i=Math.min(n-2,Math.floor(f)),t=f-i;
  var h=pr[i]+(pr[i+1]-pr[i])*t,ang=Math.atan((pr[i]-pr[i+1])/(L/(n-1)))*180/Math.PI;
  var c=s.querySelector(".cur");c.style.display="";c.querySelector("line").setAttribute("x1",x0+d*sc);c.querySelector("line").setAttribute("x2",x0+d*sc);
  c.querySelector("circle").setAttribute("cx",x0+d*sc);c.querySelector("circle").setAttribute("cy",12+(pr[0]-h)*sc);
  s.querySelector(".pr").textContent=fmt(Math.round(h))+" m ü. M. · Hangneigung "+Math.round(ang)+"°";
}
document.addEventListener("pointermove",profMove);
document.addEventListener("pointerdown",profMove);
document.addEventListener("pointerout",function(e){var s=e.target.closest&&e.target.closest("svg.prof");if(s&&!(e.relatedTarget&&s.contains(e.relatedTarget))){s.querySelector(".cur").style.display="none";s.querySelector(".pr").textContent=s.dataset.def;}});

/* Merkliste (nur lokal im Browser) */
var FAV=(function(){
  var mem=[];try{mem=JSON.parse(localStorage.getItem("skt-fav")||"[]")||[];}catch(e){}
  return {list:function(){return mem;},has:function(id){return mem.indexOf(id)>=0;},
    toggle:function(id){var i=mem.indexOf(id);if(i<0)mem.push(id);else mem.splice(i,1);try{localStorage.setItem("skt-fav",JSON.stringify(mem));}catch(e){}}};
})();
function pref(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){return null;}}

/* Karten-Marker */
function pinIcon(grad,pw){return L.divIcon({className:"",iconSize:[32,32],iconAnchor:[16,16],popupAnchor:[0,-16],html:'<span class="pin pin-'+fam(grad)+(pw?" pw":"")+'"><i>'+esc(grad)+'</i></span>'});}
function swissLayer(){return L.tileLayer("https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg",{maxZoom:18,attribution:'&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>'});}
function powText(p){return EXPO_LONG[p.expo]+"-Exposition · "+fmt(p.hm)+" Hm Höhendifferenz · Ø "+String(p.neig).replace(".",",")+"° Hangneigung (±"+String(p.std).replace(".",",")+"°) · "+fmt(p.von)+"–"+fmt(p.bis)+" m · ≥ 40 m breit · Untergrund "+p.rasen+" % Rasen"+(p.rasen<100?", "+(100-p.rasen)+" % Geröll":"")+", kein Fels";}

/* Route einer Tour auf der Karte zeigen und dorthin zoomen */
function routeLen(r){var p=(r.a||[]).concat(r.l).concat(r.b||[]),d=0;for(var i=1;i<p.length;i++)d+=L.latLng(p[i-1]).distanceTo(p[i]);return d;}
function routeInfo(g){
  if(typeof ROUTES==="undefined")return "";
  return '<div class="rinfo">'+g.map(function(x){var r=ROUTES[x.id];
    return r?'<span><i class="rdot" style="background:'+RCOL[g.indexOf(x)%RCOL.length]+'"></i>'+(g.length>1?esc(x.route)+': ':'')+'Route ca. '+(Math.round(routeLen(r)/100)/10).toString().replace(".",",")+' km</span>':'<span class="rnone">'+(g.length>1?esc(x.route)+': ':'')+'Keine Route im Skitourennetz der Landeskarte</span>';}).join("")+'</div>';
}
var RCOL=["#E0B771","#7FB0E8","#F28B82"];
/* Info-Leiste am Kartenrand: verdeckt die Route nicht */
function infoPanel(map,onClose){
  var el=document.createElement("div");el.className="rpanel";el.hidden=true;el.setAttribute("role","dialog");el.setAttribute("aria-label","Tour-Info");
  map.getContainer().appendChild(el);L.DomEvent.disableClickPropagation(el);L.DomEvent.disableScrollPropagation(el);
  el.addEventListener("click",function(e){if(e.target.closest(".rclose")){el.hidden=true;onClose&&onClose();}});
  return {el:el,show:function(html){el.innerHTML='<button type="button" class="rclose" aria-label="Schliessen">×</button>'+html;el.hidden=false;el.scrollTop=0;},hide:function(){el.hidden=true;},
    pad:function(){var w=map.getContainer().clientWidth;if(el.hidden)return {tl:[50,50],br:[50,40]};
      return w>=700?{tl:[el.offsetWidth+40,40],br:[40,40]}:{tl:[30,30],br:[30,el.offsetHeight+30]};}};
}
function routeTool(map){
  var lay=L.layerGroup().addTo(map),COL=RCOL,saved=null;
  function save(){if(!saved)saved={c:map.getCenter(),z:map.getZoom()};}
  function fit(b,o){var p=o.pad||{tl:[50,50],br:[50,40]},opt={paddingTopLeft:p.tl,paddingBottomRight:p.br,maxZoom:o.maxZoom||14};
    if(o.instant)map.fitBounds(b,opt);else map.flyToBounds(b,Object.assign({duration:.9},opt));}
  return {
    clear:function(){lay.clearLayers();},
    reset:function(){saved=null;},
    restore:function(){lay.clearLayers();if(saved){map.flyTo(saved.c,saved.z,{duration:.8});saved=null;}},
    points:function(pts,o){
      o=o||{};save();lay.clearLayers();var b=L.latLngBounds([pts[0].ll]);
      pts.forEach(function(p){
        var mk=L.circleMarker(p.ll,{radius:p.kind==="via"?6:8,color:p.kind==="ende"?"#7FB0E8":"#E0B771",weight:3,fillColor:p.kind==="via"?"#E0B771":"#0B2238",fillOpacity:1,className:"cpt"}).addTo(lay);
        mk.bindTooltip(esc(p.label),{permanent:true,direction:p.kind==="start"?"top":"bottom",offset:[0,p.kind==="start"?-10:8],className:"ctip"});
        b.extend(p.ll);
      });
      if(pts.length===1)map.flyTo(pts[0].ll,14,{duration:.9});else fit(b,Object.assign({maxZoom:15},o));
    },
    show:function(g,o){
      o=o||{};save();lay.clearLayers();
      var b=L.latLngBounds([[g[0].lat,g[0].lon]]);
      g.forEach(function(t,i){
        var r=typeof ROUTES!=="undefined"&&ROUTES[t.id];if(!r)return;
        var c=COL[i%COL.length],desc=t.auf==null||/Gipfel/.test(t.start);
        L.polyline(r.l,{color:"#0B2238",weight:9,opacity:.55,interactive:false}).addTo(lay);
        L.polyline(r.l,{color:"#fff",weight:7,opacity:.95,interactive:false}).addTo(lay);
        var line=L.polyline(r.l,{color:c,weight:4.5,opacity:1,interactive:false,className:"rline"}).addTo(lay);
        [r.a,r.b].forEach(function(x){if(x)L.polyline(x,{color:c,weight:3,dashArray:"2 8",lineCap:"round",interactive:false}).addTo(lay);});
        var st=desc?(r.b?r.b[1]:r.l[r.l.length-1]):(r.a?r.a[0]:r.l[0]);
        L.circleMarker(st,{radius:7,color:c,weight:3,fillColor:"#0B2238",fillOpacity:1}).bindTooltip((desc?"Ziel: ":"Start: ")+esc(desc?t.ziel:t.start),{direction:"top",offset:[0,-6]}).addTo(lay);
        b.extend(line.getBounds());if(r.a)b.extend(r.a);if(r.b)b.extend(r.b);
      });
      fit(b,o);
      return b;
    }
  };
}

/* Hangneigung ab 30° (swisstopo, Klassen gemäss SLF) als zuschaltbare Ebene mit Legende */
/* Legende separat auf-/zuklappbar; auf dem Handy standardmässig zu */
var EXPBTN='<button type="button" class="sexp" aria-expanded="false" title="Legende ein-/ausklappen" aria-label="Legende ein-/ausklappen" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
function legMax(map,box){try{var h=map.getContainer().clientHeight,t=box.getBoundingClientRect().top-map.getContainer().getBoundingClientRect().top;box.style.setProperty("--legmax",Math.max(120,h-t-30)+"px");}catch(e){}}
function legGroup(map,me){map._legs=map._legs||[];map._legs.push(me);return function(){map._legs.forEach(function(o){if(o!==me)o.close();});};}
function legOpen(k){var v=pref(k);return v===null||v===undefined?window.innerWidth>=700:v==="1";}
var SLOPE_CLS=[["30–35°","#F2E50A"],["35–40°","#F46F24"],["40–45°","#DE055B"],["45–50°","#C889BB"],["über 50°","#4B4B4B"]];
function slopeControl(map){
  var lay=L.tileLayer("https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.hangneigung-ueber_30/default/current/3857/{z}/{x}/{y}.png",{maxZoom:18,opacity:.6,zIndex:5,attribution:'Hangneigung &copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>'});
  var on=pref("skt-slope")==="1",box,btn,leg,rng,exp,others=null,open=legOpen("skt-slope-leg");
  function vis(){exp.hidden=!on;exp.setAttribute("aria-expanded",open);exp.classList.toggle("up",open);leg.hidden=!(on&&open);legMax(map,box);}
  function set(v){on=v;pref("skt-slope",v?"1":"0");if(v)lay.addTo(map);else map.removeLayer(lay);btn.setAttribute("aria-pressed",v);box.classList.toggle("on",v);if(v&&open&&others)others();vis();}
  var C=L.Control.extend({options:{position:"topright"},onAdd:function(){
    box=L.DomUtil.create("div","slopectl");
    box.innerHTML='<div class="srow"><button type="button" class="smain" aria-pressed="false" title="Hangneigung ab 30° ein-/ausblenden"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 20 10 6l4 6 2-3 6 11Z" fill="currentColor"/></svg><span>Hangneigung</span></button>'+EXPBTN+'</div>'+
      '<div class="sleg" hidden><b>Hangneigung</b>'+SLOPE_CLS.map(function(c){return '<span><i style="background:'+c[1]+'"></i>'+c[0]+'</span>';}).join("")+
      '<label>Deckkraft<input type="range" min="20" max="90" value="60"></label><small>Steilheit ist nicht gleich Lawinengefahr – immer das aktuelle Lawinenbulletin prüfen.</small></div>';
    btn=box.querySelector(".smain");exp=box.querySelector(".sexp");leg=box.querySelector(".sleg");rng=box.querySelector("input");
    others=legGroup(map,{close:function(){if(on&&open){open=false;vis();}}});
    exp.addEventListener("click",function(){open=!open;pref("skt-slope-leg",open?"1":"0");if(open)others();vis();});
    L.DomEvent.disableClickPropagation(box);L.DomEvent.disableScrollPropagation(box);
    btn.addEventListener("click",function(){set(!on);});
    rng.addEventListener("input",function(){lay.setOpacity(rng.value/100);});
    return box;}});
  new C().addTo(map);set(on);
  return {layer:lay,set:set};
}

/* ===== Lawinenbulletin (SLF, Open Data CC BY 4.0) – Daten holt ein GitHub-Workflow nach data/lawinen.json ===== */
var LAW=null,LAWP=null;
var DANGER={1:{n:"gering",c:"#CCFF66"},2:{n:"mässig",c:"#FFFF00"},3:{n:"erheblich",c:"#FF9900"},4:{n:"gross",c:"#FF0000"},5:{n:"sehr gross",c:"#A80000"}};
var PROBLEM={new_snow:"Neuschnee",wind_slab:"Triebschnee",persistent_weak_layers:"Altschnee",wet_snow:"Nassschnee",gliding_snow:"Gleitschnee",favourable_situation:"Günstige Situation",no_distinct_avalanche_problem:"Kein ausgeprägtes Lawinenproblem"};
function loadLawinen(){
  if(!LAWP)LAWP=fetch("data/lawinen.json?t="+Math.floor(Date.now()/600000)).then(function(r){return r.ok?r.json():null;})
    .then(function(d){LAW=d&&d.regions&&Object.keys(d.regions).length?d:null;return LAW;}).catch(function(){return null;});
  return LAWP;
}
function pip(x,y,ring){var c=false;for(var i=0,j=ring.length-1;i<ring.length;j=i++){var xi=ring[i][0],yi=ring[i][1],xj=ring[j][0],yj=ring[j][1];
  if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c;}return c;}
function lawRegion(lat,lon){
  if(!LAW)return null;
  for(var i=0;i<LAW.polygons.length;i++){var p=LAW.polygons[i];
    for(var k=0;k<p.poly.length;k++)if(pip(lon,lat,p.poly[k][0])&&LAW.regions[p.id])return {id:p.id,b:LAW.regions[p.id]};}
  return null;
}
function hText(v){if(v==null)return "";return v==="treeline"?"Waldgrenze":fmt(+v)+" m";}
function ratingText(r){var e=r.lower&&r.upper?" ("+hText(r.lower)+"–"+hText(r.upper)+")":r.lower?" (oberhalb "+hText(r.lower)+")":r.upper?" (unterhalb "+hText(r.upper)+")":"";
  return r.level+" – "+(DANGER[r.level]?DANGER[r.level].n:"?")+e+(r.time&&r.time!=="all_day"?(r.time==="earlier"?", vormittags":", nachmittags"):"");}
function lawBadge(l){var d=DANGER[l];return d?'<span class="lwb" style="background:'+d.c+'" title="Gefahrenstufe '+l+' – '+d.n+'">'+l+'</span>':'';}
function lawWhen(b){try{var e=new Date(b.valid&&b.valid.endTime),s=new Date(b.published);
  var f=function(d){return d.toLocaleString("de-CH",{weekday:"short",day:"numeric",month:"numeric",hour:"2-digit",minute:"2-digit"});};
  return {txt:"Ausgabe "+f(s)+", gültig bis "+f(e),old:Date.now()>e.getTime()};}catch(x){return {txt:"",old:false};}}
function probList(b){var seen={};return (b.problems||[]).filter(function(p){if(seen[p.type])return false;seen[p.type]=1;return true;}).map(function(p){
  return '<span class="lwp">'+esc(PROBLEM[p.type]||p.type)+(p.lower?' · ab '+hText(p.lower):'')+(p.upper?' · bis '+hText(p.upper):'')+(p.aspects&&p.aspects.length&&p.aspects.length<8?' · '+p.aspects.map(function(a){return EXPO_DE[a]||a;}).join(", "):'')+'</span>';}).join("");}
function lawDetail(rid,b,short){
  var w=lawWhen(b);
  return '<div class="lwd"><div class="lwh">'+lawBadge(b.max)+'<div><b>'+esc(b.name||rid)+'</b><span>'+(b.ratings||[]).map(ratingText).map(esc).join(" · ")+'</span></div></div>'+
    (b.problems&&b.problems.length?'<div class="lwps">'+probList(b)+'</div>':'')+
    (!short&&b.snowpack?'<p>'+esc(b.snowpack)+'</p>':'')+
    '<small class="'+(w.old?'lwold':'')+'">'+esc(w.txt)+(w.old?' – veraltet':'')+' · Quelle: <a href="'+(LAW&&LAW.url||"https://www.slf.ch")+'" target="_blank" rel="noopener">SLF</a></small></div>';
}
function lawLine(lat,lon){var r=lawRegion(lat,lon);if(!r)return LAW?'':'';return '<div class="lwline"><span class="lwtag">Lawinenbulletin heute</span>'+lawDetail(r.id,r.b,true)+'</div>';}
function bulletinControl(map){
  var lay=L.layerGroup(),on=pref("skt-law")==="1",box,btn,leg,exp,others=null,built=false,open=legOpen("skt-law-leg");
  function vis(){exp.hidden=!on;exp.setAttribute("aria-expanded",open);exp.classList.toggle("up",open);leg.hidden=!(on&&open);legMax(map,box);}
  function build(){if(built||!LAW)return;built=true;
    LAW.polygons.forEach(function(p){var b=LAW.regions[p.id];if(!b)return;var d=DANGER[b.max]||{c:"#999"};
      p.poly.forEach(function(poly){L.polygon(poly[0].map(function(c){return [c[1],c[0]];}),{color:"#3A3A3A",weight:1,opacity:.6,fillColor:d.c,fillOpacity:.38})
        .bindPopup('<div class="pop">'+lawDetail(p.id,b,false)+'</div>',{maxWidth:320}).addTo(lay);});});}
  function set(v){on=v;pref("skt-law",v?"1":"0");box.classList.toggle("on",v);btn.setAttribute("aria-pressed",v);if(v&&open&&others)others();vis();
    if(!v){map.removeLayer(lay);return;}
    loadLawinen().then(function(){if(!LAW){leg.innerHTML='<small>Zurzeit kein Lawinenbulletin verfügbar.</small>';return;}build();if(on)lay.addTo(map);
      var any=LAW.regions[Object.keys(LAW.regions)[0]],w=lawWhen(any);
      leg.innerHTML='<b>Lawinengefahr</b>'+[1,2,3,4,5].map(function(l){return '<span><i style="background:'+DANGER[l].c+'"></i>'+l+' – '+DANGER[l].n+'</span>';}).join("")+'<small>'+esc(w.txt)+(w.old?' – veraltet':'')+'. Region antippen für Details. Quelle: <a href="'+LAW.url+'" target="_blank" rel="noopener">SLF</a></small>';});}
  var C=L.Control.extend({options:{position:"topright"},onAdd:function(){
    box=L.DomUtil.create("div","slopectl lawctl");
    box.innerHTML='<div class="srow"><button type="button" class="smain" aria-pressed="false" title="Lawinenbulletin ein-/ausblenden"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 22 20H2Z" fill="currentColor"/><path d="M12 9v5M12 16.5v.5" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg><span>Lawinenbulletin</span></button>'+EXPBTN+'</div><div class="sleg" hidden></div>';
    btn=box.querySelector(".smain");exp=box.querySelector(".sexp");leg=box.querySelector(".sleg");
    others=legGroup(map,{close:function(){if(on&&open){open=false;vis();}}});
    exp.addEventListener("click",function(){open=!open;pref("skt-law-leg",open?"1":"0");if(open)others();vis();});
    L.DomEvent.disableClickPropagation(box);L.DomEvent.disableScrollPropagation(box);
    btn.addEventListener("click",function(){set(!on);});return box;}});
  new C().addTo(map);if(on)set(true);
  map.attributionControl.addAttribution('Lawinenbulletin &copy; <a href="https://www.slf.ch/" target="_blank" rel="noopener">SLF</a>');
  return {set:set};
}
