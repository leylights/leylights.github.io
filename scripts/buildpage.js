/**
 * Builds the header & menu
 *
 * Activates darkmode where and when applicable
 */
{ /*
<script src="../scripts/build-page.js" type="module"></script>
 */
}
{ /*
<script id="topBuildImport">
  buildTop();
</script>
 */
}
function buildTop(index) {
    // loading
    setTimeout(function () {
        let el = document.getElementById("loadingScreen").children[0];
        el.style.opacity = "1";
    }, 16);
    document.addEventListener('readystatechange', function (event) {
        console.log(document.readyState, event);
        if (document.readyState === "complete") {
            document.getElementById("loadingScreen").style.opacity = "0";
            setTimeout(function () {
                document.getElementById("loadingScreen").outerHTML = "";
            }, (parseFloat(window.getComputedStyle(document.getElementById("loadingScreen")).transitionDuration) * 1000));
        }
    });
    // darkmode
    doDarkmode(false);
    // building the page
    let addSrc = "";
    if (!index)
        addSrc = "../";
    // header
    let header = document.createElement("header");
    header.setAttributeNode(createAttrForPageBuilder("id", "header"));
    let headerContent = "  <div id='homeHead'>" +
        "    <div id='headerBounds'>" +
        "      <a href='../index.html'>" +
        "        <img id='headerlogo' src='../siteimages/logo.svg'/>" +
        "        <div id = 'headerName'>" +
        "          <h1>colestanley.ca</h1>" +
        "        </div>" +
        "      </a>" +
        "      <div class='headerMenu'>" +
        "        <a class='headerDropBox' href='../pages/archive.html' onclick = ''>" +
        "          <div class='headerDropButton'>Archive</div>" + // no dropBody
        "        </a>" +
        "        <a class='headerDropBox' href='../pages/resume.html' onclick = ''>" +
        "          <div class='headerDropButton'>Resume</div>" + // no dropBody
        "        </a>" +
        "        <a class='headerDropBox' href='javascript:void(0)' onclick = ''>" +
        "          <div class='headerDropButton'>Tools</div>" +
        "          <div class='headerDropBody' id='toolsMenu'></div>" +
        "        </a>" +
        "        <a class='headerDropBox' href='javascript:void(0)' onclick = ''>" +
        "          <div class='headerDropButton'>Games</div>" +
        "          <div class='headerDropBody' id='gamesMenu'></div>" +
        "        </a>" +
        "      </div>" +
        "    </div>" +
        "    <img id='hamImage'" +
        "       src='../siteimages/menuicon.png' onclick='openHam();'>" +
        "  </div>";
    if (index) // removing ../ from URLs
        headerContent = headerContent.replace(/\.\.\//g, "");
    header.innerHTML = headerContent;
    document.body.appendChild(header);
    // menu
    let hamMenu = document.createElement("div");
    hamMenu.id = "hamMenu";
    let menuContent = `<div id = 'side-menu-content'> 
      <div> 
        <h1 id='menuTitle' onclick='closeHam()'>menu</h1> 
      </div> 
      <div id='gamesMenuItem' class='secretDropdownContainer'>
        <button class='upperHam'>Games</button> 
      </div> 
      <div id='sitesMenuItem' class='secretDropdownContainer'>
        <button class='upperHam'>Gadgets &amp; Tools</button> 
      </div> 
      <div id='miscMenuItem' class='secretDropdownContainer'> 
        <button class='upperHam'>Miscellaneous</button> 
        <div class='lowerHam' style='display: none;'>
          <a href='../pages/resume.html'>Resume</a>
        </div> 
        <div class='lowerHam' style='display: none;'>
          <a href='../pages/archive.html'>Project Archive</a>
        </div> 
      </div>
      <img  
      class='side-menu-end-button' 
      src='../siteimages/closebutton.png' onclick='closeHam()'>
        <a href='../index.html'>
          <img  
          class='side-menu-end-button' 
          src='../siteimages/home.png'>
        </a>
    <\div>`;
    if (index)
        menuContent = menuContent.replace(/\.\.\//g, "");
    hamMenu.innerHTML = menuContent;
    document.body.appendChild(hamMenu);
    // links
    let gFontsLoad = document.createElement("link");
    gFontsLoad.setAttributeNode(createAttrForPageBuilder("rel", "preconnect"));
    gFontsLoad.setAttributeNode(createAttrForPageBuilder("href", "https://fonts.gstatic.com"));
    document.head.appendChild(gFontsLoad);
    let poppins = document.createElement("link");
    poppins.setAttributeNode(createAttrForPageBuilder("rel", "stylesheet"));
    poppins.setAttributeNode(createAttrForPageBuilder("href", "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600;1,700&display=swap"));
    document.head.appendChild(poppins);
    document.getElementById("topBuildImport").outerHTML = "";
}
/**
 * Imports scripts at bottom of HTML
 */
{ /*
<script id="bottomScriptImport">
  buildBottom();
</script>
 */
}
function buildBottom(index) {
    let addSrc = "";
    if (!index)
        addSrc = "../";
    function generateScript(name, isModule) {
        let out = document.createElement("script");
        if (isModule)
            out.setAttributeNode(createAttrForPageBuilder("type", "module"));
        out.setAttributeNode(createAttrForPageBuilder("src", addSrc + name));
        document.body.appendChild(out);
    }
    generateScript("scripts/top-menu.js", true);
    generateScript("scripts/side-menu-open-close.js", false);
    generateScript("scripts/side-menu.js", true);
    document.getElementById("bottomScriptImport").outerHTML = "";
}
/**
 * Activates main_dark.css at night
 *
 * @param force Forces darkmode to activate no matter the time of day
 */
function doDarkmode(force) {
    let mainCSSArr = Array.from(document.getElementsByTagName("link"))
        .filter(function (x) { return x.rel == "stylesheet"; })
        .filter(function (x) { return x.href.search("main.css") != -1; });
    if (mainCSSArr.length == 0) // MAIN.CSS IS NOT PRESENT ON PAGE
        return;
    let dd = getDuskDawn();
    let now = new Date();
    let hour = now.getHours() + (now.getMinutes() / 60);
    if (dd.dusk <= hour || hour <= dd.dawn || force) {
        let mainCSS = mainCSSArr[0];
        let darkCSS = document.createElement("link");
        if (window.location.href.search("index.html") !== -1 || window.location.href.split("colestanley.ca/")[1] === "") // if on index.html, navigate differently
            darkCSS.setAttributeNode(createAttrForPageBuilder("href", "stylesheets/main_dark.css"));
        else
            darkCSS.setAttributeNode(createAttrForPageBuilder("href", "../stylesheets/main_dark.css"));
        darkCSS.setAttributeNode(createAttrForPageBuilder("rel", "stylesheet"));
        mainCSS.parentNode.insertBefore(darkCSS, mainCSS.nextSibling); // insertion
    }
}
function getDuskDawn() {
    let now = new Date();
    let seasonOffset = Math.abs(now.getMonth() + 1 - 6) / 1.5;
    let dawn = 5 + seasonOffset; // 5:00 AM
    let dusk = 21 - seasonOffset; // 9:00 PM
    return { dusk: dusk, dawn: dawn };
}
function createAttrForPageBuilder(type, value) {
    var attr = document.createAttribute(type);
    attr.value = value;
    return attr;
}
//# sourceMappingURL=buildpage.js.map