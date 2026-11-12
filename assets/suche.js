var $=function(id){return document.getElementById(id);};
var D={q:"",regions:[],fams:[],expos:[],maxHm:2000,sort:"name",pow:false};
var s=JSON.parse(JSON.stringify(D)),open={};
var P=new URLSearchParams(location.search),focusId=P.get("tour");
if(REGIONS.indexOf(P.get("region"))>=0)s.regions=[P.get("region")];
if(P.get("q"))s.q=P.get("q");
if(P.get("powder")){s.pow=true;s.sort="pow";}
if(focusId)open[focusId]=true;
function tog(k,v){var i=s[k].indexOf(v);if(i<0)s[k].push(v);else s[k].splice(i,1);render();}
function chips(el,items){$(el).innerHTML=items.map(function(x,i){return '<button type="button" class="chip'+(x.on?' on':'')+'" aria-pressed="'+x.on+'" data-i="'+i+'"'+(el==="expos"?' style="padding:0"':'')+'>'+esc(x.label)+'</button>';}).join("");
  $(el).onclick=function(e){var b=e.target.closest("button");if(b)items[b.dataset.i].fn();};}
function render(){
  var q=s.q.trim().toLowerCase();
  var list=TOURS.filter(function(t){
    if(q&&[t.gipfel,t.route,t.region,t.start,t.ziel,t.grad].join(" ").toLowerCase().indexOf(q)<0)return false;
    if(s.regions.length&&s.regions.indexOf(t.region)<0)return false;
    if(s.fams.length&&s.fams.indexOf(fam(t.grad))<0)return false;
    if(s.expos.length&&!t.expo.concat(t.pow?[t.pow.expo]:[]).some(function(e){return s.expos.indexOf(e)>=0;}))return false;
    if(s.pow&&!t.pow)return false;
    if(s.maxHm<2000&&t.auf!=null&&t.auf>s.maxHm)return false;
    return true;
  });
  var by={name:function(a,b){return a.gipfel.localeCompare(b.gipfel,"de");},grad:function(a,b){return GRADES.indexOf(a.grad)-GRADES.indexOf(b.grad);},auf:function(a,b){return (a.auf||0)-(b.auf||0);},hoehe:function(a,b){return b.hoehe-a.hoehe;},pow:function(a,b){return (b.pow?b.pow.hm:0)-(a.pow?a.pow.hm:0)||a.gipfel.localeCompare(b.gipfel,"de");}};
  list.sort(by[s.sort]);
  chips("regions",REGIONS.map(function(r){return {label:r,on:s.regions.indexOf(r)>=0,fn:function(){tog("regions",r);}};}));
  chips("fams",FAMS.map(function(f){return {label:f.l,on:s.fams.indexOf(f.k)>=0,fn:function(){tog("fams",f.k);}};}));
  chips("expos",EXPOS.map(function(e){return {label:EXPO_DE[e],on:s.expos.indexOf(e)>=0,fn:function(){tog("expos",e);}};}));
  chips("pow",[{label:"❄ Nur Powder-Hänge ("+TOURS.filter(function(t){return t.pow;}).length+")",on:s.pow,fn:function(){s.pow=!s.pow;if(s.pow)s.sort="pow";else if(s.sort==="pow")s.sort="name";render();}}]);
  $("q").value!==s.q&&($("q").value=s.q);$("sort").value=s.sort;$("hm").value=s.maxHm;
  $("hmLabel").textContent=s.maxHm>=2000?"egal":"≤ "+fmt(s.maxHm)+" Hm";
  $("count").textContent=list.length;$("total").textContent=TOURS.length;$("empty").hidden=list.length>0;
  $("tours").innerHTML=list.map(function(t){
    var o=!!open[t.id],ap=t.det?"":"≈ ";
    var zeit=t.zeit?t.zeit:(t.auf?"≈ "+(Math.round(t.auf/400*2)/2).toString().replace(".",",")+" h":"–");
    var expo=t.expo.length?(t.expo.length===8?"alle":t.expo.map(function(e){return EXPO_DE[e];}).join(", ")):"prüfen";
    var pw=t.pow?'<div class="powbox"><b>❄ Powder-Hang</b><span>'+EXPO_DE[t.pow.expo]+'-Hang · '+fmt(t.pow.hm)+' Hm am Stück · Ø '+t.pow.neig+'° (±'+String(t.pow.std).replace(".",",")+'°) · '+fmt(t.pow.von)+'–'+fmt(t.pow.bis)+' m</span></div>':'';
    return '<article class="card'+(t.pow?' haspow':'')+'" id="t-'+t.id+'"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start"><div style="display:flex;flex-direction:column;gap:4px;min-width:0">'+
      '<h3 style="margin:0;font:600 21px/1.15 \'Space Grotesk\',sans-serif">'+esc(t.gipfel)+'</h3><p style="margin:0;font:400 14px/1.35 Inter,sans-serif;color:#4A5A68">'+esc(t.route)+' · '+esc(t.region)+'</p></div><span style="display:flex;gap:6px;align-items:center;flex:none">'+(t.pow?'<span class="g g-P" title="Powder-Hang">❄</span>':'')+'<span class="g g-'+fam(t.grad)+'">'+esc(t.grad)+'</span></span></div>'+
      '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;border-top:1px solid #EDF0F3;border-bottom:1px solid #EDF0F3;padding:12px 0">'+
      '<div class="stat"><span>Aufstieg</span><span>'+(t.auf==null?"–":ap+fmt(t.auf)+" Hm")+'</span></div><div class="stat"><span>Abfahrt</span><span>'+ap+fmt(t.ab)+' Hm</span></div><div class="stat"><span>Zeit</span><span>'+zeit+'</span></div></div>'+
      '<dl class="kv"><dt>Gipfel</dt><dd>'+fmt(t.hoehe)+' m ü. M.</dd><dt>Start</dt><dd>'+esc(t.start)+'</dd><dt>Ziel</dt><dd>'+esc(t.ziel)+'</dd><dt>Exposition</dt><dd>'+expo+'</dd></dl>'+pw+
      (o?'<div style="display:flex;flex-direction:column;gap:10px;background:#F4F6F8;border-radius:10px;padding:14px"><p style="margin:0;font:400 14px/1.5 Inter,sans-serif">'+esc(t.text)+'</p><p style="margin:0;font:500 14px/1.5 Inter,sans-serif;color:#8A4A06">Achtung: '+esc(t.key)+'</p></div>':'')+
      '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;margin-top:auto"><span style="font:500 12px/1.3 Inter,sans-serif;color:#8A4A06">'+(t.det?"":"Richtwert – prüfen")+'</span>'+
      '<button type="button" class="btn" aria-expanded="'+o+'" data-id="'+t.id+'">'+(o?"Weniger":"Details")+'</button></div></article>';
  }).join("");
}
$("tours").onclick=function(e){var b=e.target.closest("button[data-id]");if(!b)return;open[b.dataset.id]=!open[b.dataset.id];render();var nb=document.querySelector('button[data-id="'+b.dataset.id+'"]');nb&&nb.focus();};
$("q").oninput=function(e){s.q=e.target.value;render();};
$("sort").onchange=function(e){s.sort=e.target.value;render();};
$("hm").oninput=function(e){s.maxHm=Number(e.target.value);render();};
$("reset").onclick=function(){s=JSON.parse(JSON.stringify(D));render();};
render();
if(focusId){var el=$("t-"+focusId);if(el){el.classList.add("flash");el.scrollIntoView({block:"center"});}}
