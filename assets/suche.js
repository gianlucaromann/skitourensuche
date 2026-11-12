var D={q:"",regions:[],fams:[],expos:[],maxHm:2000,sort:"name",pow:false,fav:false};
var s=JSON.parse(JSON.stringify(D)),open={};
var P=new URLSearchParams(location.search),focusId=P.get("tour");
function plist(k,ok){return (P.get(k)||"").split(",").filter(function(x){return ok.indexOf(x)>=0;});}
s.regions=plist("region",REGIONS);s.fams=plist("fam",FAMS.map(function(f){return f.k;}));s.expos=plist("expo",EXPOS);
if(P.get("q"))s.q=P.get("q");
if(P.get("hm"))s.maxHm=Math.max(400,Math.min(2000,Number(P.get("hm"))||2000));
if(P.get("powder")){s.pow=true;s.sort="pow";}
if(P.get("fav"))s.fav=true;
if(["name","grad","auf","hoehe","pow"].indexOf(P.get("sort"))>=0)s.sort=P.get("sort");
if(focusId)open[focusId]=true;

var calm=window.matchMedia("(prefers-reduced-motion: reduce)").matches,raf=0;
function smooth(){if(document.startViewTransition&&!calm){try{document.startViewTransition(render);return;}catch(e){}}render();}
function soon(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;render();});}
function tog(k,v){var i=s[k].indexOf(v);if(i<0)s[k].push(v);else s[k].splice(i,1);smooth();}
function chips(el,items){$(el).innerHTML=items.map(function(x,i){return '<button type="button" class="chip'+(x.on?' on':'')+'" aria-pressed="'+x.on+'" data-i="'+i+'">'+esc(x.label)+(x.n!=null?' <small>'+x.n+'</small>':'')+'</button>';}).join("");
  $(el).onclick=function(e){var b=e.target.closest("button");if(b)items[b.dataset.i].fn();};}
function syncUrl(){
  var u=new URLSearchParams();
  if(s.q)u.set("q",s.q);if(s.regions.length)u.set("region",s.regions.join(","));if(s.fams.length)u.set("fam",s.fams.join(","));if(s.expos.length)u.set("expo",s.expos.join(","));
  if(s.maxHm<2000)u.set("hm",s.maxHm);if(s.pow)u.set("powder","1");if(s.fav)u.set("fav","1");if(s.sort!=="name"&&!(s.pow&&s.sort==="pow"))u.set("sort",s.sort);
  var q=u.toString();try{history.replaceState(null,"",location.pathname+(q?"?"+q:""));}catch(e){}
}
function filtered(){
  var q=s.q.trim().toLowerCase();
  var list=TOURS.filter(function(t){
    if(q&&[t.gipfel,t.route,t.region,t.start,t.ziel,t.grad].join(" ").toLowerCase().indexOf(q)<0)return false;
    if(s.regions.length&&s.regions.indexOf(t.region)<0)return false;
    if(s.fams.length&&s.fams.indexOf(fam(t.grad))<0)return false;
    if(s.expos.length&&!t.expo.concat(t.pow?[t.pow.expo]:[]).some(function(e){return s.expos.indexOf(e)>=0;}))return false;
    if(s.maxHm<2000&&t.auf!=null&&t.auf>s.maxHm)return false;
    if(s.pow&&!t.pow)return false;
    if(s.fav&&!FAV.has(t.id))return false;
    return true;
  });
  var by={name:function(a,b){return a.gipfel.localeCompare(b.gipfel,"de");},grad:function(a,b){return GRADES.indexOf(a.grad)-GRADES.indexOf(b.grad);},auf:function(a,b){return (a.auf||0)-(b.auf||0);},hoehe:function(a,b){return b.hoehe-a.hoehe;},pow:function(a,b){return (b.pow?b.pow.hm:0)-(a.pow?a.pow.hm:0)||a.gipfel.localeCompare(b.gipfel,"de");}};
  return list.sort(by[s.sort]);
}
function card(t){
  var o=!!open[t.id],ap=t.det?"":"≈ ",fv=FAV.has(t.id);
  var zeit=t.zeit?t.zeit:(t.auf?"≈ "+(Math.round(t.auf/400*2)/2).toString().replace(".",",")+" h":"–");
  var ex=t.expo.length?t.expo:(t.pow?[t.pow.expo]:[]);
  var expo=ex.length?(ex.length===8?"alle":ex.map(function(e){return EXPO_DE[e];}).join(", ")):"prüfen";
  var pw=t.pow?'<div class="powbox"><b>❄ Powder-Hang</b><span>'+powText(t.pow)+'</span></div>':'';
  return '<article class="card'+(t.pow?' haspow':'')+'" id="t-'+t.id+'" data-tid="'+t.id+'" style="view-transition-name:c-'+t.id+'"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start"><div style="display:flex;flex-direction:column;gap:4px;min-width:0">'+
    '<h3 style="margin:0;font:600 21px/1.15 \'Space Grotesk\',sans-serif">'+esc(t.gipfel)+'</h3><p style="margin:0;font:400 14px/1.35 Inter,sans-serif;color:#4A5A68">'+esc(t.route)+' · '+esc(t.region)+'</p></div>'+
    '<span style="display:flex;gap:6px;align-items:center;flex:none"><button type="button" class="favb'+(fv?' on':'')+'" data-fav="'+t.id+'" aria-pressed="'+fv+'" aria-label="'+esc(t.gipfel)+(fv?' von der Merkliste entfernen':' merken')+'">'+(fv?'♥':'♡')+'</button>'+(t.pow?'<span class="g g-P" title="Powder-Hang">❄</span>':'')+'<span class="g g-'+fam(t.grad)+'">'+esc(t.grad)+'</span></span></div>'+
    '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;border-top:1px solid #EDF0F3;border-bottom:1px solid #EDF0F3;padding:12px 0">'+
    '<div class="stat"><span>Aufstieg</span><span>'+(t.auf==null?"–":ap+fmt(t.auf)+" Hm")+'</span></div><div class="stat"><span>Abfahrt</span><span>'+ap+fmt(t.ab)+' Hm</span></div><div class="stat"><span>Zeit</span><span>'+zeit+'</span></div></div>'+
    '<dl class="kv"><dt>Gipfel</dt><dd>'+fmt(t.hoehe)+' m ü. M.</dd><dt>Start</dt><dd>'+esc(t.start)+'</dd><dt>Ziel</dt><dd>'+esc(t.ziel)+'</dd><dt>Exposition</dt><dd>'+expo+'</dd></dl>'+pw+
    (o?'<div class="det"><p style="margin:0;font:400 14px/1.5 Inter,sans-serif">'+esc(t.text)+'</p><p style="margin:0;font:500 14px/1.5 Inter,sans-serif;color:#8A4A06">Achtung: '+esc(t.key)+'</p>'+
      (t.pow?'<div class="profbox"><b>Hangprofil</b>'+profSVG(t.pow)+'<small>Mit Maus oder Finger über das Profil fahren.</small></div>':'')+
      '<a class="maplink" href="index.html?tour='+t.id+'#karte">Auf der grossen Karte zeigen →</a></div>':'')+
    '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;margin-top:auto"><span style="font:500 12px/1.3 Inter,sans-serif;color:#8A4A06">'+(t.det?"":"Richtwert – prüfen")+'</span>'+
    '<button type="button" class="btn" aria-expanded="'+o+'" data-id="'+t.id+'">'+(o?"Weniger":"Details")+'</button></div></article>';
}
/* Karte */
var smap=null,slayer=null,marks={},lastSig="",firstFit=true,mapOn=pref("skt-map")!=="0";
function initMap(){
  smap=L.map("smap",{scrollWheelZoom:false});swissLayer().addTo(smap);slayer=L.layerGroup().addTo(smap);
  smap.on("click",function(){smap.scrollWheelZoom.enable();});smap.on("mouseout",function(){smap.scrollWheelZoom.disable();});
}
function drawMap(list){
  $("smap").hidden=!mapOn;$("mapBtn").setAttribute("aria-pressed",mapOn);$("mapBtn").classList.toggle("on",mapOn);
  if(!mapOn||typeof L==="undefined")return;
  if(!smap)initMap();
  var sig=list.map(function(t){return t.id;}).sort().join("|");
  if(sig===lastSig)return;lastSig=sig;
  slayer.clearLayers();marks={};
  var groups={},pts=[];
  list.forEach(function(t){var k=t.lat+","+t.lon;(groups[k]=groups[k]||[]).push(t);});
  Object.keys(groups).forEach(function(k){
    var g=groups[k],t=g[0],m=L.marker([t.lat,t.lon],{title:g.map(function(x){return x.gipfel+" ("+x.grad+")";}).join(", "),icon:pinIcon(t.grad,g.some(function(x){return x.pow;}))}).addTo(slayer);
    m.on("click",function(){goTo(t.id);});
    g.forEach(function(x){marks[x.id]=m;if(x.pow)L.polyline(x.pow.path,{color:"#C9974A",weight:4,interactive:false}).addTo(slayer);});
    pts.push([t.lat,t.lon]);
  });
  smap.invalidateSize();
  if(pts.length){if(firstFit){firstFit=false;smap.fitBounds(pts,{padding:[40,40],maxZoom:13});}else smap.flyToBounds(pts,{padding:[40,40],maxZoom:13,duration:.6});}
}
function goTo(id){
  open[id]=true;render();var el=$("t-"+id);
  if(el){el.classList.remove("flash");void el.offsetWidth;el.classList.add("flash");el.scrollIntoView({block:"center",behavior:"smooth"});}
}
function hl(id,on){var m=marks[id],el=m&&m.getElement();if(el){el.classList.toggle("hl",on);m.setZIndexOffset(on?1000:0);}}
function render(){
  var list=filtered(),cnt=function(f){return TOURS.filter(f).length;};
  chips("regions",REGIONS.map(function(r){return {label:r,n:cnt(function(t){return t.region===r;}),on:s.regions.indexOf(r)>=0,fn:function(){tog("regions",r);}};}));
  chips("fams",FAMS.map(function(f){return {label:f.l,n:cnt(function(t){return fam(t.grad)===f.k;}),on:s.fams.indexOf(f.k)>=0,fn:function(){tog("fams",f.k);}};}));
  chips("pow",[{label:"❄ Nur Powder-Hänge",n:cnt(function(t){return t.pow;}),on:s.pow,fn:function(){s.pow=!s.pow;if(s.pow)s.sort="pow";else if(s.sort==="pow")s.sort="name";smooth();}}]);
  chips("fav",[{label:"♥ Nur gemerkte Touren",n:FAV.list().length,on:s.fav,fn:function(){s.fav=!s.fav;smooth();}}]);
  $("expos").innerHTML=roseSVG(s.expos);
  $("q").value!==s.q&&($("q").value=s.q);$("sort").value=s.sort;$("hm").value=s.maxHm;
  $("hmLabel").textContent=s.maxHm>=2000?"egal":"≤ "+fmt(s.maxHm)+" Hm";
  $("count").textContent=list.length;$("total").textContent=TOURS.length;$("empty").hidden=list.length>0;
  $("empty").textContent=s.fav&&!FAV.list().length?"Deine Merkliste ist noch leer – tippe bei einer Tour auf ♡.":"Keine Tour passt zu diesen Filtern.";
  $("tours").innerHTML=list.map(card).join("");
  drawMap(list);syncUrl();
}
bindRose($("expos"),function(e){tog("expos",e);});
$("tours").onclick=function(e){
  var f=e.target.closest("button[data-fav]");
  if(f){FAV.toggle(f.dataset.fav);if(s.fav)smooth();else render();var nf=document.querySelector('button[data-fav="'+f.dataset.fav+'"]');nf&&nf.focus();return;}
  var b=e.target.closest("button[data-id]");if(!b)return;open[b.dataset.id]=!open[b.dataset.id];var bid=b.dataset.id;if(document.startViewTransition&&!calm){document.startViewTransition(function(){render();var x=document.querySelector('button[data-id="'+bid+'"]');x&&x.focus({preventScroll:true});});return;}render();var nb=document.querySelector('button[data-id="'+b.dataset.id+'"]');nb&&nb.focus();
};
$("tours").addEventListener("mouseover",function(e){var c=e.target.closest("article[data-tid]");if(c&&!c.contains(e.relatedTarget))hl(c.dataset.tid,true);});
$("tours").addEventListener("mouseout",function(e){var c=e.target.closest("article[data-tid]");if(c&&!c.contains(e.relatedTarget))hl(c.dataset.tid,false);});
$("tours").addEventListener("focusin",function(e){var c=e.target.closest("article[data-tid]");if(c)hl(c.dataset.tid,true);});
$("tours").addEventListener("focusout",function(e){var c=e.target.closest("article[data-tid]");if(c)hl(c.dataset.tid,false);});
$("q").oninput=function(e){s.q=e.target.value;soon();};
$("sort").onchange=function(e){s.sort=e.target.value;smooth();};
$("hm").oninput=function(e){s.maxHm=Number(e.target.value);soon();};
$("hm").onchange=function(){smooth();};
$("reset").onclick=function(){s=JSON.parse(JSON.stringify(D));smooth();};
$("mapBtn").onclick=function(){mapOn=!mapOn;pref("skt-map",mapOn?"1":"0");lastSig="";drawMap(filtered());};
$("share").onclick=function(){var b=this,done=function(t){b.textContent=t;setTimeout(function(){b.textContent="Link kopieren";},1800);};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(location.href).then(function(){done("Kopiert ✓");},function(){done("Nicht möglich");});else done("Nicht möglich");};
document.addEventListener("keydown",function(e){if(e.key==="/"&&!/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)){e.preventDefault();$("q").focus();}});
render();
if(focusId){var el=$("t-"+focusId);if(el){el.classList.add("flash");el.scrollIntoView({block:"center"});}}
