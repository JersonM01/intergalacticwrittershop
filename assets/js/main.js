function paintStars(container, count){
  if(!container) return;
  var frag = document.createDocumentFragment();
  for(var i=0;i<count;i++){
    var s = document.createElement('div');
    var size = Math.random() < 0.85 ? 1 : 2;
    s.className = 'star twinkle';
    s.style.width = size+'px';
    s.style.height = size+'px';
    s.style.top = (Math.random()*100)+'%';
    s.style.left = (Math.random()*100)+'%';
    s.style.animationDelay = (Math.random()*4)+'s';
    s.style.opacity = (0.2+Math.random()*0.6).toFixed(2);
    frag.appendChild(s);
  }
  container.appendChild(frag);
}

document.addEventListener('DOMContentLoaded', function(){
  document.querySelectorAll('[data-stars]').forEach(function(el){
    paintStars(el, parseInt(el.getAttribute('data-stars'), 10) || 60);
  });

  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  var cta = document.querySelector('.nav-cta');
  if(toggle){
    toggle.addEventListener('click', function(){
      links.classList.toggle('open');
      cta.classList.toggle('open');
    });
  }

  document.querySelectorAll('form[data-stub]').forEach(function(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var success = form.querySelector('.form-success');
      if(success){
        success.style.display = 'block';
        form.querySelectorAll('input, textarea, select').forEach(function(f){ f.disabled = true; });
      }
    });
  });
});
