import { Component, HostListener, OnInit } from '@angular/core';
import { Letter, LETTERS, LetterState, Row } from 'src/app/util/constants';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

    readonly LetterState = LetterState;

    topWord: string = 'APPLE';
    targetWord: string = 'BOXES';
    bottomWord: string = 'CANDY';

    win = false;

    wordLength = 5;
    middleIndex = 1;

    rows: Row[] = [];

    letterIndex = 0;
    newMinimumIndex = 0;

    constructor() { }

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        this.handleClickKey(event.key)
    }

    ngOnInit(): void {
        this.initRows();
    }

    handleClickKey($event: string) {
        if (this.win) {
            return;
        }

        if (LETTERS[$event.toLowerCase()]) {
            if (this.letterIndex < this.wordLength && this.letterIndex > this.newMinimumIndex) {
                this.setLetter($event);
                this.letterIndex++;
            }
        } else if ($event === 'BACKSPACE') {
            if (this.letterIndex > this.newMinimumIndex) {
                this.letterIndex--;
                this.setLetter('');
            }
        } else if ($event === 'ENTER') {
            this.submit();
        }

    }

    setLetter(letter: string) {
        this.rows[this.middleIndex].letters[this.letterIndex].text = letter;
    }

    submit() {
        // check if enough letters
        const attemptRow = this.rows[this.middleIndex];
        if (attemptRow.letters.some(letter => letter.text === '')) {
            console.log('Not enough letters');
            return;
        }

        // TODO - check if valid word here

        // get string word from attempt
        const attemptString = attemptRow.letters.map(letter => letter.text).join('').toUpperCase();
        if (attemptString === this.targetWord) {
            console.log('You win!');
            this.win = true;
            return;
        }

        this.determineOrder(attemptString);
    }

    determineOrder(attemptString: string) {
        // check if in bookend bounds
        if (attemptString.localeCompare(this.bottomWord) === -1  && attemptString.localeCompare(this.topWord) === 1) {
            // determine if new top or bottom bookend
            if (attemptString.localeCompare(this.targetWord) === -1) {
                this.setBookend(attemptString, 0);
            } else {
                this.setBookend(attemptString, 2);
            }
        // make sure not equal to existing bookends    
        } else if (attemptString.localeCompare(this.bottomWord) === 0 || attemptString.localeCompare(this.topWord) === 0) {
            console.log('Invalid guess');
        } else {
            console.log('Out of bounds.');
        }
    }

    setBookend(attemptString: string, index: number) {
        // set corresponding bookend
        this.rows[index].letters.forEach(letter => letter.text = '');
        this.rows[index].letters.forEach(letter => letter.state = LetterState.BOOKEND);
        let letters: Letter[] = [];
        for (let i = 0; i < this.wordLength; i++) {
            letters.push({ text: attemptString[i], state: LetterState.BOOKEND })
        }
        this.rows[index] = {letters};
        // clear middle row
        this.resetMiddle();

    }

    resetMiddle() {
        this.rows[this.middleIndex].letters.forEach(letter => letter.text = '');
        this.rows[this.middleIndex].letters.forEach(letter => letter.state = LetterState.PENDING);
        // set new minimum index, then set letterIndex
        this.letterIndex = this.newMinimumIndex;
    }

    initRows() {
        let letters: Letter[] = [];
        for (let i = 0; i < this.wordLength; i++) {
            letters.push({ text: this.topWord[i], state: LetterState.BOOKEND })
        }
        this.rows.push({letters});

        letters = [];
        for (let i = 0; i < this.wordLength; i++) {
            letters.push({ text: '', state: LetterState.PENDING })
        }
        this.rows.push({letters});

        letters = [];
        for (let i = 0; i < this.wordLength; i++) {
            letters.push({ text: this.bottomWord[i].toUpperCase(), state: LetterState.BOOKEND })
        }
        this.rows.push({letters});
    }

}
