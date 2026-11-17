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
  var lay=L.layerGroup().addTo(map),COL=RCOL;
  return {
    clear:function(){lay.clearLayers();},
    show:function(g,o){
      o=o||{};lay.clearLayers();
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
      var p=o.pad||{tl:[50,50],br:[50,40]},opt={paddingTopLeft:p.tl,paddingBottomRight:p.br,maxZoom:14};
      if(o.instant)map.fitBounds(b,opt);else map.flyToBounds(b,Object.assign({duration:.9},opt));
      return b;
    }
  };
}
