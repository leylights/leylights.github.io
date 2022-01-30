import { cws } from "../../../cws.js";
export class SpotlightHeader {
    constructor(replacedTarget) {
        this.logoPaddingVh = 10;
        this.rebuild(replacedTarget);
    }
    getSpotlightImage() {
        var _a, _b, _c;
        const season = getSeason();
        const options = SpotlightHeader.SPOTLIGHT_IMAGES[season];
        const imageSource = cws.Array.get.randomElement(options);
        return cws.createElement({
            type: 'div',
            id: (_b = (_a = this.elements) === null || _a === void 0 ? void 0 : _a.spotlightImage.id) !== null && _b !== void 0 ? _b : 'showcase-main-spotlight-image',
            classList: (_c = this.elements) === null || _c === void 0 ? void 0 : _c.spotlightImage.className,
            style: `background-image: url("${cws.getRelativeUrlPath(`siteimages/showcase/${season}/${imageSource}`)}");`,
        });
        function getSeason() {
            const today = new Date();
            const changePoints = [
                { month: 2, precedingSeason: 'winter' },
                { month: 5, precedingSeason: 'spring' },
                { month: 8, precedingSeason: 'summer' },
                { month: 11, precedingSeason: 'fall' },
            ];
            for (let i = 0; i < changePoints.length; i++) {
                if (todayBefore(changePoints[i].month, 21))
                    return changePoints[i].precedingSeason;
            }
            return 'winter';
            // Exclusive of the given day
            function todayBefore(month, day) {
                if (today.getMonth() < month) {
                    return true;
                }
                else if (today.getMonth() === month) {
                    if (today.getDate() < day)
                        return true;
                    else
                        return false;
                }
                return false;
            }
        }
    }
    rebuild(replacedTarget) {
        var _a, _b;
        const me = this, image = this.getSpotlightImage(), logoSource = ((_b = (_a = document.body.querySelector('#showcase-main-spotlight')) === null || _a === void 0 ? void 0 : _a.querySelector('#big-logo')) === null || _b === void 0 ? void 0 : _b.src.replace(window.location.origin + '/', '')) || 'siteimages/logo-split-w.svg', logo = cws.createElement({
            type: 'img',
            id: 'big-logo',
            otherNodes: [{
                    type: 'src',
                    value: cws.getRelativeUrlPath(logoSource)
                }, {
                    type: 'alt',
                    value: 'colestanley.ca'
                }],
        }), container = cws.createElement({
            type: 'div',
            id: 'showcase-main-spotlight',
            children: [
                image,
                logo,
            ]
        });
        this.elements = {
            spotlightContainer: container,
            spotlightImage: image,
        };
        replacedTarget.replaceWith(container);
        window.addEventListener('scroll', () => {
            image.style.top = Math.round(window.scrollY / 3) + 'px';
            logo.style.top = `calc(${Math.round(window.scrollY / 4)}px + ${me.logoPaddingVh}vh)`;
        });
    }
}
SpotlightHeader.SPOTLIGHT_IMAGES = {
    fall: ['goose.jpg', 'october.jpg', 'rocks.jpg', 'trees.jpg'],
    spring: ['blueriver.jpg', 'cliff.jpg', 'goldriver.jpg', 'leafyhill.jpg', 'rocks.jpg'],
    summer: ['river_cliff.jpg', 'river_deep.jpg', 'river_sun.jpg', 'trees.jpg'],
    winter: ['crossroadsmini.jpg', 'field.jpg', 'branch.jpg', 'sunset.jpg']
};
//# sourceMappingURL=spotlight-header.component.js.map