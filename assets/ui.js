// Navigation: Hintergrund beim Scrollen, Schneefall im Header
(function(){
  var tb=document.querySelector(".topbar");
  function on(){tb&&tb.classList.toggle("scrolled",window.scrollY>24);}
  on();window.addEventListener("scroll",on,{passive:true});
  var sky=document.querySelector(".sky"),hero=sky||document.querySelector(".hero");
  if(hero&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    var box=document.createElement("div");box.className="snow";box.setAttribute("aria-hidden","true");
    for(var i=0;i<(window.innerWidth<700?26:46);i++){var f=document.createElement("i"),z=1+Math.random()*3;
      f.style.cssText="left:"+(Math.random()*100)+"%;width:"+z+"px;height:"+z+"px;opacity:"+(.25+Math.random()*.6)+";animation-duration:"+(7+Math.random()*10)+"s;animation-delay:-"+(Math.random()*17)+"s";
      box.appendChild(f);}
    hero.insertBefore(box,hero.firstChild);
  }
  if("IntersectionObserver" in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);(function(t){setTimeout(function(){t.style.transitionDelay="";},900);})(e.target);}});},{rootMargin:"0px 0px -40px 0px"});
    document.querySelectorAll(".reveal").forEach(function(el){io.observe(el);});
  }
})();
// Parallaxe: Bergketten bewegen sich leicht mit dem Mauszeiger
(function(){
  var hero=document.querySelector(".hero");
  if(!hero||window.matchMedia("(prefers-reduced-motion: reduce)").matches||!window.matchMedia("(pointer:fine)").matches)return;
  var raf=0,lx=0,ly=0;
  hero.addEventListener("pointermove",function(e){lx=e.clientX;ly=e.clientY;if(raf)return;raf=requestAnimationFrame(function(){raf=0;var r=hero.getBoundingClientRect();hero.style.setProperty("--px",((lx-r.left)/r.width-.5).toFixed(3));hero.style.setProperty("--py",((ly-r.top)/r.height-.5).toFixed(3));});},{passive:true});
  hero.addEventListener("pointerleave",function(){hero.style.setProperty("--px",0);hero.style.setProperty("--py",0);});
})();
// Gestaffeltes Einblenden und Kennzeichen für sanfte Übergänge
(function(){
  if(document.startViewTransition)document.documentElement.classList.add("vt");
  [".stats",".regs",".crit"].forEach(function(q){var p=document.querySelector(q);if(p)[].forEach.call(p.children,function(c,i){c.style.transitionDelay=(i*70)+"ms";});});
  document.documentElement.classList.add("ready");
})();
