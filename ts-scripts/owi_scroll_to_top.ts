// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () { scrollFunction() };

function scrollFunction() {
  if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 200) {
    document.getElementById("gototop").style.display = "block";
    document.getElementById("myTopnav").style.top = "64";
    document.getElementById("myTopnav").style.position = "fixed";
    document.getElementById("myTopnav").style.width = "100%";
  } else {
    document.getElementById("gototop").style.display = "none";
    document.getElementById("myTopnav").style.top = null;
    document.getElementById("myTopnav").style.position = "relative";
  }
}