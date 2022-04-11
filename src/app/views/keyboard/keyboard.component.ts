import { Component, OnInit } from '@angular/core';
import { keyboardRows } from 'src/app/util/constants';

@Component({
    selector: 'app-keyboard',
    templateUrl: './keyboard.component.html',
    styleUrls: ['./keyboard.component.scss']
})
export class KeyboardComponent implements OnInit {

    readonly keyboardRows = keyboardRows;

    constructor() { }

    ngOnInit(): void {
    }

    handleClickKey(key: string) {
        // do something, possibily emit to parent
        console.log(key);
    }

}
