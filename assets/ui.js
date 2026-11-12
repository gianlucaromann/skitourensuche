// Navigation: Hintergrund beim Scrollen, Schneefall im Header
(function(){
  var tb=document.querySelector(".topbar");
  function on(){tb&&tb.classList.toggle("scrolled",window.scrollY>24);}
  on();window.addEventListener("scroll",on,{passive:true});
  var hero=document.querySelector(".hero");
  if(hero&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    var box=document.createElement("div");box.className="snow";box.setAttribute("aria-hidden","true");
    for(var i=0;i<46;i++){var f=document.createElement("i"),z=1+Math.random()*3;
      f.style.cssText="left:"+(Math.random()*100)+"%;width:"+z+"px;height:"+z+"px;opacity:"+(.25+Math.random()*.6)+";animation-duration:"+(7+Math.random()*10)+"s;animation-delay:-"+(Math.random()*17)+"s";
      box.appendChild(f);}
    hero.insertBefore(box,hero.firstChild);
  }
  if("IntersectionObserver" in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}});},{rootMargin:"0px 0px -40px 0px"});
    document.querySelectorAll(".reveal").forEach(function(el){io.observe(el);});
  }
})();
