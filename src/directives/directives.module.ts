import { NgModule } from '@angular/core';
import { ScrollCatcherDirective } from './scroll-catcher/scroll-catcher';
import { TextAvatarDirective } from './text-avatar/text-avatar';
import { LongPressDirective } from './long-press/long-press';
@NgModule({
	declarations: [
        ScrollCatcherDirective,
        TextAvatarDirective,
    LongPressDirective
    ],
	imports: [],
	exports: [
        ScrollCatcherDirective,
        TextAvatarDirective,
    LongPressDirective
    ]
})
export class DirectivesModule {}
