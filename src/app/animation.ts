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

export const autohideadjust = trigger('autohideadjust', [
  state('on',
    style({
      'top': '0'
    })
  ),
  state('off',
    style({
      'top': '57px'

    })
  ),
  transition('on => off', animate('400ms ease-in-out')),
  transition('off => on', animate('400ms ease-in-out')),
]);

