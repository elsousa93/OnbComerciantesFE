import { trigger, state, style, transition, animate, animateChild, query } from '@angular/animations';

export const onSideNavChange = trigger('onSideNavChange', [
  state('close',
    style({
      'transform': 'translate3d(-100%, 0, 0)',
      'visibility': 'hidden',
    })
  ),
  state('open',
    style({
      'transform': 'none',
      'visibility': 'visible',
      'display': 'block'
      
    })
  ),
  transition('close => open', animate('1000ms ease-in-out')),
  transition('open => close', animate('1000ms ease-in-out')),
]);

export const AutoHideNavbarAdjust = trigger('AutoHideNavbarAdjust', [
  state('show',
    style({
      'top': '0'
    })
  ),
  state('hide',
    style({
      'top': '-58px'

    })
  ),
  transition('show => hide', animate('400ms ease-in-out')),
  transition('hide => show', animate('400ms ease-in-out')),
]);

export const AutoHideClientBarAdjust = trigger('AutoHideClientBarAdjust', [
  state('up',
    style({
      'top': '0'
    })
  ),
  state('down',
    style({
      'top': '58px'

    })
  ),
  transition('up => down', animate('400ms ease-in-out')),
  transition('down => up', animate('400ms ease-in-out')),
]);

export const AutoHideSidenavAdjust = trigger('AutoHideSidenavAdjust', [
  state('up',
    style({
      'top': '35px'
    })
  ),
  state('down',
    style({
      'top': '90px'
    })
  ),
  transition('up => down', animate('400ms ease-in-out')),
  transition('down => up', animate('400ms ease-in-out')),
]);

export const AutoHideLogo = trigger('AutoHideLogo', [
  state('show',
    style({
      'visibility': 'visible'
    })
  ),
  state('hide',
    style({
      'visibility': 'hidden'
    })
  ),
  transition('up => down', animate('400ms ease-in-out')),
  transition('down => up', animate('400ms ease-in-out')),
]);

