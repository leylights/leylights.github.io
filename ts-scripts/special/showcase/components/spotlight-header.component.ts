import { cws } from "../../../cws.js";

type Season = 'fall' | 'winter' | 'spring' | 'summer';
interface SpotlightHeaderElements {
  spotlightContainer: HTMLElement,
  spotlightImage: HTMLElement,
}
export class SpotlightHeader {
  private elements: SpotlightHeaderElements;
  private readonly logoPaddingVh: number = 10;

  constructor(replacedTarget: HTMLElement) {
    this.rebuild(replacedTarget);
  }

  private getSpotlightImage(this: SpotlightHeader): HTMLElement {
    const season: Season = getSeason();
    const options: string[] = SpotlightHeader.SPOTLIGHT_IMAGES[season];
    const imageSource: string = cws.Array.get.randomElement(options);

    return cws.createElement({
      type: 'div',
      id: this.elements?.spotlightImage.id ?? 'showcase-main-spotlight-image',
      classList: this.elements?.spotlightImage.className,
      style: `background-image: url("${cws.getRelativeUrlPath(`siteimages/showcase/${season}/${imageSource}`)}");`,
    });

    function getSeason(): Season {
      const today = new Date();
      const changePoints: { month: number, precedingSeason: Season }[] = [
        { month: 2, precedingSeason: 'winter' },
        { month: 5, precedingSeason: 'spring' },
        { month: 8, precedingSeason: 'summer' },
        { month: 11, precedingSeason: 'fall' },
      ];

      for (let i = 0; i < changePoints.length; i++) {
        if (todayBefore(changePoints[i].month, 21)) return changePoints[i].precedingSeason;
      }

      return 'winter';

      // Exclusive of the given day
      function todayBefore(month: number, day: number): boolean {
        if (today.getMonth() < month) {
          return true;
        } else if (today.getMonth() === month) {
          if (today.getDate() < day) return true;
          else return false;
        }

        return false;
      }
    }
  }

  private rebuild(this: SpotlightHeader, replacedTarget: HTMLElement) {
    const me = this,
      image: HTMLElement = this.getSpotlightImage(),
      logoSource: string = (document.body.querySelector('#showcase-main-spotlight')
        ?.querySelector('#big-logo') as HTMLImageElement)
        .src.replace(window.location.origin + '/', '') || 'siteimages/logo-split-w.svg',
      logo: HTMLImageElement = cws.createElement({
        type: 'img',
        id: 'big-logo',
        otherNodes: [{
          type: 'src',
          value: cws.getRelativeUrlPath(logoSource)
        }, {
          type: 'alt',
          value: 'colestanley.ca'
        }],
      }),
      container: HTMLElement = cws.createElement({
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
    }

    replacedTarget.replaceWith(container);

    window.addEventListener('scroll', () => {
      image.style.top = Math.round(window.scrollY / 3) + 'px';
      logo.style.top = `calc(${Math.round(window.scrollY / 4)}px + ${me.logoPaddingVh}vh)`;
    });
  }

  private static SPOTLIGHT_IMAGES: Record<Season, string[]> = {
    fall: ['goose.jpg', 'october.jpg', 'rocks.jpg', 'trees.jpg'],
    spring: ['blueriver.jpg', 'cliff.jpg', 'goldriver.jpg', 'leafyhill.jpg', 'rocks.jpg'],
    summer: ['river_cliff.jpg', 'river_deep.jpg', 'river_sun.jpg', 'trees.jpg'],
    winter: ['crossroadsmini.jpg', 'field.jpg', 'branch.jpg', 'sunset.jpg']
  }
}