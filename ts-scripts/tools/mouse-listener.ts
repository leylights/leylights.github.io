export class MouseListener {
  private _isClicked: boolean;
  private _isHovering: boolean;

  private target: HTMLElement;

  constructor(target: HTMLElement) {
    const me = this;
    this.target = target;

    target.addEventListener('mousedown', () => {
      me._isClicked = true;
    });
    target.addEventListener('mouseup', () => {
      me._isClicked = false;
    });
    target.addEventListener('mouseenter', () => {
      me._isHovering = true;
    });
    target.addEventListener('mouseleave', () => {
      me._isHovering = false;
    });
  }

  get currentClick(): 'l' | 'r' {
    return 'l';
  }

  get isClicked(): boolean {
    return this._isClicked;
  }

  get isHovering(): boolean {
    return this._isHovering;
  }
}