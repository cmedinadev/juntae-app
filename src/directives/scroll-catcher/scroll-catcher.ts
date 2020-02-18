import { Directive, ElementRef } from '@angular/core';

/**
 * Wee need this directive to prevent page refresh on grid view scrolling
 */
@Directive({
    selector: '[scrollCatcher]'
})
export class ScrollCatcherDirective {

    private scrollElement: HTMLElement;

    constructor(private el: ElementRef) {
    }

    ngAfterViewInit() {
        this.scrollElement = this.el.nativeElement.getElementsByClassName(
            'scroll-content',
        )[0];
        this.scrollElement.addEventListener(
            'touchstart',
            (event: TouchEvent) => {
              if (this.scrollElement.scrollTop != 0) {
                event.stopImmediatePropagation();
                event.cancelBubble = true;
              }
            },
        );

        this.scrollElement.addEventListener('touchend', (event: TouchEvent) => {
          if (this.scrollElement.scrollTop != 0) {
            event.stopImmediatePropagation();
            event.cancelBubble = true;
          }
        });
    }
}