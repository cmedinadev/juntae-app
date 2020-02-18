import {Directive, ElementRef, Input, OnInit, OnDestroy} from '@angular/core';
import {Gesture} from 'ionic-angular';
declare var Hammer: any

@Directive({
  selector: '[long-press]'
})
export class LongPressDirective implements OnInit, OnDestroy {
  el: HTMLElement;
  pressGesture: Gesture;
  @Input('longPress') action: any;
  @Input('controller') controller: any;

  constructor(el: ElementRef) {
    this.el = el.nativeElement;
  }

  ngOnInit() {
    this.pressGesture = new Gesture(this.el, {
      recognizers: [
        [Hammer.Press, {time: 6000}] // Should be pressed for 6 seconds
      ]
    });
    this.pressGesture.listen();
    this.pressGesture.on('press', e => {
      // Here you could also emit a value and subscribe to it
      // in the component that hosts the element with the directive
      this.action(e, this.controller);
    });
  }

  ngOnDestroy() {
    this.pressGesture.destroy();
  }
}