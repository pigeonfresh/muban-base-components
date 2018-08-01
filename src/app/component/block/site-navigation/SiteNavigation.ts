import AbstractTransitionComponent from 'app/component/AbstractTransitionComponent';
import AbstractTransitionBlock from 'app/component/block/AbstractTransitionBlock';
import SiteNavigationTransitionController from './SiteNavigationTransitionController';
import MouseEvent from 'app/data/event/MouseEvent';
import { DisposableEventListener } from 'seng-disposable-event-listener';

declare function require(name: string): string;

export default class SiteNavigation extends AbstractTransitionBlock {
  static displayName:string = 'site-navigation';
  public static IS_OPEN:string = 'is-open';
  public transitionController:SiteNavigationTransitionController;
  public listeners = [];
  private static desktop = window.matchMedia('(min-width: 1024px)');

  public _siteNavigation:HTMLElement;
  public _navigation:HTMLElement = this.getElement('.js-site-navigation-menu');
  private _menuButton:HTMLElement = this.getElement('.js-menu-button');
  public menuOpen:boolean = false;

  constructor(el:HTMLElement) {
    super(el);

    this.setInlineSvg();
    this.transitionController = new SiteNavigationTransitionController(this);
    this._siteNavigation = el;

    this.mobileFunctionality(!SiteNavigation.desktop.matches);

    SiteNavigation.desktop.addListener((query) => {
      this.mobileFunctionality(!query.matches);
    });
  }

  /**
   * Return the svg inline based on component path.
   */
  private setInlineSvg(){
    this.getElements('[data-icon]').forEach(el => {
     el.innerHTML = require(`./svg/${el.dataset.icon}.svg`);
    });
  };

  private mobileFunctionality(enable: boolean) {
    this._menuButton.addEventListener('click', this.handleMenuButtonClick);
    this.transitionController.initMobile(this._navigation);

    if (enable) {
      const tierItemElements: Array<HTMLElement> = this.getElements('span.tier-item');

      if (tierItemElements.length > 0) {
        this.bindMobileClickListeners(tierItemElements);
      }
    } else {
      this.removeMobileFunctionality();
    }
  };

  private removeMobileFunctionality() {
    this.listeners.forEach(listener => listener.dispose());
    this.listeners = [];

    this.transitionController.resetTierAnimationStyles();
  };

  public handleMenuButtonClick = ():void => {
    if (!this.menuOpen) {
      this._siteNavigation.classList.add(SiteNavigation.IS_OPEN);
      this._menuButton.classList.add(SiteNavigation.IS_OPEN);
      this.transitionController.animateIn(this._navigation);
    } else {
      this.transitionController.animateOut(this._navigation);
      this._siteNavigation.classList.remove(SiteNavigation.IS_OPEN);
      this._menuButton.classList.remove(SiteNavigation.IS_OPEN);
    }
    this.menuOpen = !this.menuOpen;
  };

  private bindMobileClickListeners(tierItemElements: Array<HTMLElement>) {
    tierItemElements.forEach(tierItemElement => {
      this.listeners.push(
        new DisposableEventListener(tierItemElement, MouseEvent.CLICK, () => {
          if (tierItemElement.nextElementSibling.tagName === 'UL') {
            this.transitionController.animateToTier(
              <HTMLElement>tierItemElement.nextElementSibling,
            );
          }
        }),
      );
    });

    const backButtons: Array<HTMLElement> = this.getElements('[data-back]');

    if (backButtons.length > 0) {
      backButtons.forEach(backButton => {
        this.listeners.push(
          new DisposableEventListener(backButton, MouseEvent.CLICK, event => {
            this.transitionController.animateBack(<HTMLElement>event.target);
          }),
        );
      });
    }
  }

  public startLoopingAnimation(): void {
    super.startLoopingAnimation();
  }

  public stopLoopingAnimation(): void {
    super.stopLoopingAnimation();
  }

  public dispose() {
    super.dispose();
  }
}
