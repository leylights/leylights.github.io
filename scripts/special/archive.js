import { cws } from "../cws.js";
import { Menu } from "../menu-items.js";
var itemNo = 0;
// showcase positioning
window.addEventListener("scroll", parallaxScrolls);
// menu item creation
document.getElementById("baseItem").style.boxShadow = "0 0";
document.getElementById("baseItem").style.backgroundColor = "#000";
document.getElementById("headerName").children[0].innerHTML = "The Archive";
function createItem(item) {
    let baseItem = Menu.BASE_ITEM_INNER_HTML.substring(0);
    baseItem = baseItem.replace("TITLE", item.name);
    baseItem = baseItem.replace("TYPE", item.type);
    baseItem = baseItem.replace("ITEM_NUMBER", itemNo + "");
    baseItem = baseItem.replace("DATE_OF_CREATION", item.date);
    baseItem = baseItem.replace("DESC", item.description);
    baseItem = baseItem.replace("LINK_TO_PAGE", item.links.href);
    baseItem = baseItem.replace("SIDE_IMAGE_SRC", item.links.thumbnail);
    // image style
    if (item.type == "Tool") {
        baseItem = baseItem.replace(/RIGHT_CLASS/g, "rightAlignClass");
        baseItem = baseItem.replace("IMAGE_STYLE", "style = 'float:left; margin-right: 3em'");
    }
    else {
        baseItem = baseItem.replace(/RIGHT_CLASS/g, "");
        baseItem = baseItem.replace("IMAGE_STYLE", "style = 'float:right; margin-left: 3em'");
    }
    // image class
    if (item.invertOnDark) {
        baseItem = baseItem.replace("IMAGE_CLASS", "class='itemImage dark-invert-filter'");
    }
    else {
        baseItem = baseItem.replace("IMAGE_CLASS", "class='itemImage'");
    }
    // appending
    let el = document.createElement("div");
    el.innerHTML = baseItem;
    el.setAttributeNode(cws.betterCreateAttr("class", "itemSurround"));
    el.setAttributeNode(cws.betterCreateAttr("id", "item" + itemNo));
    // showcase
    if (item.showcase) {
        let showcase = document.createElement("div");
        showcase.setAttributeNode(cws.betterCreateAttr("class", "lowerShowcaseContainer"));
        showcase.setAttributeNode(cws.betterCreateAttr("style", "height: " + Menu.SHOWCASE_HEIGHT + "px"));
        let showcaseInner = Menu.BASE_LOWER_SHOWCASE_INNER_HTML.substring(0);
        showcaseInner = showcaseInner.replace("SHOWCASE_SRC", item.links.showcase);
        showcase.innerHTML = showcaseInner;
        document.getElementById("main").insertBefore(showcase, document.getElementById("baseItem"));
    }
    document.getElementById("main").insertBefore(el, document.getElementById("baseItem"));
    itemNo++;
    return baseItem;
}
function generateArchiveMenu() {
    let menuItems = Menu.getArchiveMenu();
    menuItems.forEach((item) => {
        createItem(item);
    });
    let itemElements = document.getElementsByClassName("itemSurround");
    itemElements[itemElements.length - 1].style.boxShadow = "";
}
// Setting the showcase (not a function)
document.getElementById("showcaseImg").style.backgroundImage = "url(../siteimages/escape/thumb.png)";
/**
 * Handles the parallax scrolling of showcase elements in index.html
 */
var firstParallax = true;
const ARCHIVE_SHOWCASE_HEIGHT = 440;
const ARCHIVE_PARALLAX_SLOW = 0.5; // 0 < PARALLAX_SLOW <= 0.5
const ARCHIVE_PARALLAX_HEIGHT_SLOW_MULT = 0.8; // 0 <= PARALLAX_HEIGHT_SLOW_MULT
function parallaxScrolls() {
    let showcaseConts = document.getElementsByClassName("lowerShowcaseContainer");
    let images = document.getElementsByClassName("lowerShowcase");
    // Sets the showcase container heights on first run
    if (firstParallax) {
        for (let i = 0; i < showcaseConts.length; i++) {
            showcaseConts[i].style.height = ARCHIVE_SHOWCASE_HEIGHT + "px";
        }
        firstParallax = false;
    }
    // Sets the positions of each image 
    for (let i = 0; i < images.length; i++) {
        // Gets the scrolling progress of the image along the screen
        let baseProgress = getParallaxData(showcaseConts[i]).scrollProgress;
        let slowByHeight = showcaseConts[i].getBoundingClientRect().height / (images[i].getBoundingClientRect().height * ARCHIVE_PARALLAX_HEIGHT_SLOW_MULT); // an arbitrary measurement to slow big images
        let progress = (ARCHIVE_PARALLAX_SLOW / 2) + ARCHIVE_PARALLAX_SLOW * baseProgress * slowByHeight;
        let baseTop = (showcaseConts[i].getBoundingClientRect().height - images[i].getBoundingClientRect().height);
        // console.log(progress);
        images[i].style.top = (baseTop * progress) + "px";
    }
}
function getParallaxData(el) {
    let currentPageY = { top: el.getBoundingClientRect().y, bottom: el.getBoundingClientRect().y + el.getBoundingClientRect().height };
    let bottomAtScreenBottom = window.innerHeight + el.getBoundingClientRect().height;
    let scrollProgress = 1 - (currentPageY.bottom / bottomAtScreenBottom);
    return { scrollProgress: scrollProgress, currentPageY: currentPageY, bottomAtScreenBottom: bottomAtScreenBottom };
}
generateArchiveMenu();
//# sourceMappingURL=archive.js.map