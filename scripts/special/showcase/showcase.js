import { Menu } from "../../menu-items.js";
import { KeyboardListener } from "../../tools/keyboard-listener.js";
const PARALLAX_SLOW = 0.5; // 0 < PARALLAX_SLOW <= 0.5
const PARALLAX_HEIGHT_SLOW_MULT = 1; // 0 <= PARALLAX_HEIGHT_SLOW_MULT; faster < 1 < slower
const ON_INDEX = window.location.href.search("index.html") !== -1
    || window.location.href.split("colestanley.ca/")[1] === ""
    || window.location.href === window.location.origin + "/";
var itemNo = 0;
var firstParallax = true;
var secretsAdded = false;
// window event listener creation
// menu item creation
function init() {
    window.addEventListener('scroll', parallaxScrolls);
    if (ON_INDEX) {
        generateMenu();
    }
    setShowcaseImg();
    let keyListener = new KeyboardListener(window);
    if (ON_INDEX) {
        keyListener.addEventListener((k, e) => {
            if (k.isWordDown('river'))
                return true;
            else
                return false;
        }, (k, e) => {
            if (secretsAdded)
                return;
            let secrets = Menu.getSecretItems();
            secrets.forEach((item) => createItem(item, "secret-item"));
            document.getElementById("headerName").querySelector("h1").innerText = "riverstanley.ca";
            secretsAdded = true;
        });
    }
}
/**
 * A function to create items on the index.html menu
 * @param {String} title The title of the item
 * @param {"Game" | "Tool"} type The type of item
 * @param {String} date The date the item was created
 * @param {String} desc A description of the item
 * @param {String} img The small side-image for the item
 * @param {String} link The link to the item's page
 * @param {String | null} showcaseImg The source of the image to use as a showcase
 * @param {Boolean} useShowcase True if a showcase image should be displayed above this item.
 */
function createItem(item, specialClass) {
    itemNo++;
}
function generateMenu() {
    let menuItems = Menu.getMainMenu();
    menuItems.forEach((item) => {
        createItem(item);
    });
}
/**
 * Rotates the showcase gallery
 */
function setShowcaseImg() {
    // Setting the showcase
    let backgroundSrc;
    if (ON_INDEX) // if on index.html, navigate differently
        backgroundSrc = "siteimages/showcase/";
    else
        backgroundSrc = "../siteimages/showcase/";
    let today = new Date();
    if (withinDates(today, 10, 21, 11, 31) || withinDates(today, 0, 1, 2, 31)) { // winter: nov 21 - mar 31
        backgroundSrc += "winter/";
        if (Math.random() < 0.3) {
            backgroundSrc += "crossroadsmini.jpg";
            // document.getElementById("bigLogo").style.filter = "none";
        }
        else if (Math.random() < 0.3) {
            backgroundSrc += "sunset.jpg";
        }
        else if (Math.random() < 0.3) {
            backgroundSrc += "branch.jpg";
        }
        else {
            backgroundSrc += "field.jpg";
        }
    }
    else if (withinDates(today, 3, 1, 5, 20)) { // spring: apr 1 - jun 20
        backgroundSrc += "spring/";
        if (Math.random() < 0.25) {
            backgroundSrc += "blueriver.jpg";
        }
        else if (Math.random() < 0.25) {
            backgroundSrc += "cliff.jpg";
        }
        else if (Math.random() < 0.25) {
            backgroundSrc += "goldriver.jpg";
        }
        else if (Math.random() < 0.25) {
            backgroundSrc += "leafyhill.jpg";
        }
        else {
            backgroundSrc += "rocks.jpg";
        }
    }
    else if (withinDates(today, 5, 21, 8, 20)) { // (spring and) summer: jun 21 - sep 20
        backgroundSrc += "summer/";
        if (Math.random() < 0.3) {
            backgroundSrc += "river_deep.jpg";
        }
        else if (Math.random() < 0.4) {
            backgroundSrc += "river_cliff.jpg";
        }
        else if (Math.random() < 0.4) {
            backgroundSrc += "river_sun.jpg";
        }
        else {
            backgroundSrc += "trees.jpg";
        }
    }
    else { // fall: sep 21 - nov 20 
        backgroundSrc += "fall/";
        if (Math.random() < 0.4) {
            backgroundSrc += "trees.jpg";
        }
        else if (Math.random() < 0.4) {
            backgroundSrc += "rocks.jpg";
        }
        else if (Math.random() < 0.4) {
            backgroundSrc += "goose.jpg";
        }
        else {
            backgroundSrc += "october.jpg";
        }
    }
    document.getElementById("showcaseImg").style.backgroundImage = "url(" + backgroundSrc + ")";
}
/**
 * Handles the parallax scrolling of showcase elements in index.html
 */
function parallaxScrolls() {
    let showcaseConts = document.getElementsByClassName("lowerShowcaseContainer");
    let images = document.getElementsByClassName("lowerShowcase");
    // Sets the showcase container heights on first run
    if (firstParallax) {
        for (let i = 0; i < showcaseConts.length; i++) {
            showcaseConts[i].style.height = Menu.SHOWCASE_HEIGHT + "px";
        }
        firstParallax = false;
    }
    // Sets the positions of each image 
    for (let i = 0; i < images.length; i++) {
        // Gets the scrolling progress of the image along the screen
        let baseProgress = getParallaxData(showcaseConts[i]).scrollProgress;
        let slowByHeight = showcaseConts[i].getBoundingClientRect().height / (images[i].getBoundingClientRect().height * PARALLAX_HEIGHT_SLOW_MULT); // an arbitrary measurement to slow big images
        let progress = 1 - ((PARALLAX_SLOW / 2) + PARALLAX_SLOW * baseProgress * slowByHeight);
        let baseTop = (showcaseConts[i].getBoundingClientRect().height - images[i].getBoundingClientRect().height);
        images[i].style.top = (baseTop * progress) + "px";
    }
    // Moves the logo in step with the rest of the page's scrolling
    document.getElementById("bigLogo").style.marginTop = -(window.scrollY / 2 - 100) + "px";
}
function getParallaxData(el) {
    let currentPageY = { top: el.getBoundingClientRect().y, bottom: el.getBoundingClientRect().y + el.getBoundingClientRect().height };
    let bottomAtScreenBottom = window.innerHeight + el.getBoundingClientRect().height;
    let scrollProgress = 1 - (currentPageY.bottom / bottomAtScreenBottom);
    return { scrollProgress: scrollProgress, currentPageY: currentPageY, bottomAtScreenBottom: bottomAtScreenBottom };
}
/**
 * Determines if the given date is within the parameters (inclusive).
 */
function withinDates(date, minMonth, minDay, maxMonth, maxDay) {
    if (date.getMonth() < minMonth) {
        return false;
    }
    else if (date.getMonth() > maxMonth) {
        return false;
    }
    else {
        if (date.getMonth() == minMonth) {
            if (date.getDate() < minDay) {
                return false;
            }
            else {
                return true;
            }
        }
        else if (date.getMonth() == maxMonth) {
            if (date.getDate() > maxDay) {
                return false;
            }
            else {
                return true;
            }
        }
        else {
            return true;
        }
    }
}
init();
//# sourceMappingURL=showcase.js.map