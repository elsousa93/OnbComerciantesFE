import { trigger, state, style, transition, animate } from '@angular/animations';

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

export const AutoHideSidenavAdjustBarraTopo = trigger('AutoHideSidenavAdjustBarraTopo', [
  state('up',
    style({
      'top': '40px'
    })
  ),
  state('down',
    style({
      'top': '100px'
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