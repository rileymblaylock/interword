import { Component, EventEmitter, Output } from '@angular/core';
import { KeyboardRows } from 'src/app/util/constants';

@Component({
    selector: 'app-keyboard',
    templateUrl: './keyboard.component.html',
    styleUrls: ['./keyboard.component.scss']
})
export class KeyboardComponent {
    @Output() keyClickEvent = new EventEmitter<string>();

    readonly keyboardRows = KeyboardRows;

    constructor() { }

    handleClickKey(key: string) {
        this.keyClickEvent.emit(key);
    }

}
