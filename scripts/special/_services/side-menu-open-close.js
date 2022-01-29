function openHam() {
    if (document.body.clientWidth < 700) {
        document.getElementById("hamMenu").style.width = "100%";
        // document.getElementById("main").style.marginRight = "100%";
        // document.getElementById("header").style.width = "0%";
    }
    else {
        let menuW = Math.round(window.innerWidth * 0.15);
        if (menuW < 200)
            menuW = 200;
        document.getElementById("hamMenu").style.width = menuW + "px";
        // document.getElementById("main").style.marginRight = menuW + "px";
        document.getElementById("header").style.width = (100 - menuW) + "px";
    }
    document.getElementById("hamImage").style.opacity = "0";
}
function closeHam() {
    document.getElementById("hamMenu").style.width = "0%";
    // document.getElementById("main").style.marginRight = "0%";
    // document.getElementById("header").style.width = "100%";
    document.getElementById("hamImage").style.opacity = "1";
    document.getElementById("hamMenu").style.minWidth = "0";
    for (let i = 0; i < document.getElementsByClassName("lowerHam").length; i++)
        document.getElementsByClassName("lowerHam")[i].style.display = "none";
}
//# sourceMappingURL=side-menu-open-close.js.map