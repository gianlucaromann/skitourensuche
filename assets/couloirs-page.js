var cs={regions:[],grads:[]},cmarks={};
var GF={ZS:"ZS",S:"S"};
function gfam(g){return g.replace(/[+-]/g,"");}
// Kennzahlen
var hiC=COULOIRS.reduce(function(a,b){return b.hoehe>a.hoehe?b:a;}),stC=COULOIRS.filter(function(c){return c.steil;}).reduce(function(a,b){return b.steil>a.steil?b:a;});
var nReg=C_REGIONS.filter(function(r){return COULOIRS.some(function(c){return c.region===r;});}).length;
$("cstats").innerHTML=[[COULOIRS.length,"","Couloirs"],[nReg,"","Regionen"],[hiC.hoehe," m","höchster Einstieg: "+esc(hiC.berg)],[stC.steil,"°","steilste Stelle: "+esc(stC.berg)]]
  .map(function(x){return '<div class="statc reveal"><b>'+fmt(x[0])+x[1]+'</b><span>'+x[2]+'</span></div>';}).join("");
// Karte
var map=L.map("map",{scrollWheelZoom:false});swissLayer().addTo(map);slopeControl(map);bulletinControl(map);
var RT=routeTool(map),IP=infoPanel(map,function(){RT.restore();});
IP.el.addEventListener("click",function(e){var a=e.target.closest("[data-go]");if(a){e.preventDefault();goCard(a.dataset.go);}});
/* Antippen: auf das Couloir zoomen, Einstieg (Gipfel), Zwischenpunkt und Ende markieren – keine Routenlinie */
function focusC(g){
  var c=g[0],pts=[{ll:[c.lat,c.lon],label:"Einstieg: "+c.berg,kind:"start"}];
  g.forEach(function(x){if(x.via)pts.push({ll:x.via.ll,label:x.via.n,kind:"via"});if(x.ende&&!pts.some(function(p){return p.label==="Ende: "+x.ende.n;}))pts.push({ll:x.ende.ll,label:"Ende: "+x.ende.n,kind:"ende"});});
  IP.show(cmarks[c.id]._html+lawLine(c.lat,c.lon));RT.points(pts,{pad:IP.pad()});
}
map.on("click",function(){map.scrollWheelZoom.enable();});map.on("mouseout",function(){map.scrollWheelZoom.disable();});
var groups={};COULOIRS.forEach(function(c){var k=c.lat+","+c.lon;(groups[k]=groups[k]||[]).push(c);});
Object.keys(groups).forEach(function(k){
  var g=groups[k],c=g[0];
  var html='<div class="pop"><h3>'+esc(c.berg)+'</h3><p class="hh">'+fmt(c.hoehe)+' m ü. M. · '+esc(c.region)+'</p>'+g.map(function(x){
    return '<div class="row"><div><span><b>'+esc(x.name)+'</b></span><span class="g g-'+gfam(x.grad)+'">'+esc(x.grad)+'</span></div><div><span>'+esc(x.neig)+'</span><a href="#c-'+x.id+'" data-go="'+x.id+'">Details →</a></div></div>';}).join("")+'</div>';
  var m=L.marker([c.lat,c.lon],{title:c.berg,icon:L.divIcon({className:"",iconSize:[34,34],iconAnchor:[17,17],html:'<span class="pin pin-'+gfam(c.grad)+' pin-c"><i>'+esc(c.grad)+'</i></span>'})}).addTo(map);
  m._html=html;m._g=g;m.on("click",function(){focusC(g);});
  g.forEach(function(x){cmarks[x.id]=m;});
});
function visible(){return COULOIRS.filter(function(c){return (!cs.regions.length||cs.regions.indexOf(c.region)>=0)&&(!cs.grads.length||cs.grads.indexOf(gfam(c.grad))>=0);});}
function card(c){
  return '<article class="ccard reveal in" id="c-'+c.id+'" data-cid="'+c.id+'" style="view-transition-name:c-'+c.id+'">'+
    '<div class="ctop"><div><span class="creg">'+esc(c.region)+'</span><h3>'+esc(c.berg)+'</h3><p>'+esc(c.name)+'</p></div><span class="g g-'+gfam(c.grad)+'">'+esc(c.grad)+'</span></div>'+
    '<div class="cstat"><div><span>Steilheit</span><b>'+esc(c.neig)+'</b></div><div><span>Exposition</span><b>'+(c.expo?EXPO_LONG[c.expo]:"prüfen")+'</b></div><div><span>Höhendifferenz</span><b>'+(c.hm?"ca. "+fmt(c.hm)+" Hm":"–")+'</b></div><div><span>Gipfel</span><b>'+fmt(c.hoehe)+' m</b></div></div>'+
    '<p class="ctext">'+esc(c.text)+'</p>'+lawLine(c.lat,c.lon)+
    '<dl class="cdl"><dt>Zugang</dt><dd>'+esc(c.zugang)+'</dd><dt>Achtung</dt><dd class="warnt">'+esc(c.achtung)+'</dd></dl>'+
    '<div class="cfoot"><a href="'+c.quelle.u+'" target="_blank" rel="noopener">Quelle: '+esc(c.quelle.t)+' ↗</a><button type="button" class="btn" data-fly="'+c.id+'">Auf der Karte</button></div></article>';
}
function chips(el,items){$(el).innerHTML=items.map(function(x,i){return '<button type="button" class="chip'+(x.on?' on':'')+'" aria-pressed="'+x.on+'" data-i="'+i+'">'+esc(x.label)+' <small>'+x.n+'</small></button>';}).join("");
  $(el).onclick=function(e){var b=e.target.closest("button");if(b)items[b.dataset.i].fn();};}
function tog(k,v){var i=cs[k].indexOf(v);if(i<0)cs[k].push(v);else cs[k].splice(i,1);smooth();}
var calm=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function smooth(){if(document.startViewTransition&&!calm){try{document.startViewTransition(render);return;}catch(e){}}render();}
function render(){
  var list=visible(),ids=list.map(function(c){return c.id;});
  chips("cReg",C_REGIONS.filter(function(r){return COULOIRS.some(function(c){return c.region===r;});}).map(function(r){return {label:r,n:COULOIRS.filter(function(c){return c.region===r;}).length,on:cs.regions.indexOf(r)>=0,fn:function(){tog("regions",r);}};}));
  chips("cGrad",[{k:"ZS",l:"Ziemlich schwierig (ZS)"},{k:"S",l:"Schwierig (S)"},{k:"SS",l:"Sehr schwierig (SS)"}].filter(function(f){return COULOIRS.some(function(c){return gfam(c.grad)===f.k;});}).map(function(f){return {label:f.l,n:COULOIRS.filter(function(c){return gfam(c.grad)===f.k;}).length,on:cs.grads.indexOf(f.k)>=0,fn:function(){tog("grads",f.k);}};}));
  $("cCount").textContent=list.length;
  $("cards").innerHTML=list.map(card).join("")||'<p class="none">Kein Couloir passt zu diesen Filtern.</p>';
  Object.keys(cmarks).forEach(function(id){var el=cmarks[id].getElement();if(el)el.classList.toggle("off",!Object.keys(cmarks).some(function(j){return cmarks[j]===cmarks[id]&&ids.indexOf(j)>=0;}));});
}
function fly(id){var m=cmarks[id];if(!m)return;$("map").scrollIntoView({behavior:"smooth",block:"center"});focusC(m._g);}
function goCard(id){var el=$("c-"+id);if(!el)return;el.classList.remove("flash");void el.offsetWidth;el.classList.add("flash");el.scrollIntoView({behavior:"smooth",block:"center"});}
$("cards").addEventListener("click",function(e){var b=e.target.closest("[data-fly]");if(b)fly(b.dataset.fly);});
document.addEventListener("click",function(e){var a=e.target.closest("[data-go]");if(a){e.preventDefault();goCard(a.dataset.go);}});
function hl(id,on){var m=cmarks[id],el=m&&m.getElement();if(el){el.classList.toggle("hl",on);m.setZIndexOffset(on?1000:0);}}
$("cards").addEventListener("mouseover",function(e){var c=e.target.closest("[data-cid]");if(c&&!c.contains(e.relatedTarget))hl(c.dataset.cid,true);});
$("cards").addEventListener("mouseout",function(e){var c=e.target.closest("[data-cid]");if(c&&!c.contains(e.relatedTarget))hl(c.dataset.cid,false);});
render();
map.fitBounds(COULOIRS.map(function(c){return [c.lat,c.lon];}),{padding:[40,40]});

loadLawinen().then(function(d){if(d)render();});
