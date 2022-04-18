import { Component, HostListener, OnInit } from '@angular/core';
import { Letter, LETTERS, LetterState, Row, alphabet } from 'src/app/util/constants';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

    readonly LetterState = LetterState;
    readonly numberAttempts = 12;
    readonly alphabet = alphabet;

    topWord: string = 'apple';
    targetWord: string = 'build';
    bottomWord: string = 'candy';

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
            if (this.letterIndex < this.wordLength && this.letterIndex >= this.newMinimumIndex) {
                this.setLetter($event);
                this.letterIndex++;
            }
        } else if ($event === 'Backspace') {
            if (this.letterIndex > this.newMinimumIndex) {
                this.letterIndex--;
                this.setLetter('');
            }
        } else if ($event === 'Enter') {
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
        const attemptString = attemptRow.letters.map(letter => letter.text).join('');

        this.determineOrder(attemptString);
    }

    determineOrder(attemptString: string) {
        // correct answer, make win
        if (attemptString.localeCompare(this.targetWord) === 0) {
            for (let j = this.newMinimumIndex; j < this.wordLength; j++) {
                this.rows[this.middleIndex].letters[j].state = LetterState.MATCH;
            }
            console.log('You win!');
            this.win = true;
            return;
        // check if in bookend bounds
        } else if (attemptString.localeCompare(this.bottomWord) === -1  && attemptString.localeCompare(this.topWord) === 1) {
            // determine if new top or bottom bookend
            if (attemptString.localeCompare(this.targetWord) === -1) {
                this.setBookend(attemptString, 0);
                // set and clear middle row
                this.updateMiddle();
                this.topWord = attemptString;
            } else {
                this.setBookend(attemptString, 2);
                // set and clear middle row
                this.updateMiddle();
                this.bottomWord = attemptString;
            }
        // make sure not equal to existing bookends    
        } else if (attemptString.localeCompare(this.bottomWord) === 0 || attemptString.localeCompare(this.topWord) === 0) {
            console.log('Guess already made.');
        // outside of word range
        } else {
            console.log('Out of bounds.');
        }
    }

    /**
     * @param attemptString 
     * @param index of top or bottom word to replace
     */
    setBookend(attemptString: string, index: number) {
        let letters: Letter[] = [];
        for (let i = 0; i < this.wordLength; i++) {
            letters.push({ text: attemptString[i], state: LetterState.BOOKEND });
        }
        this.rows[index] = {letters};

        for (let i = 0; i < this.wordLength; i++) {
            const letter = this.rows[index].letters[i];
            if (letter.state !== LetterState.MATCH) {
                if (letter.text.localeCompare(this.targetWord[i]) === 0) {
                    letter.state = LetterState.MATCH;
                } else {
                    letter.state = LetterState.PENDING;
                    break;
                }
            }
        }
    }

    /**
     * @returns sets letters and classes of middle row after a guess
     */
    updateMiddle() {
        for (let i = 0; i < this.wordLength; i++) {
            const letter = this.rows[this.middleIndex].letters[i];
            if (letter.state !== LetterState.MATCH) {
                if (letter.text.localeCompare(this.targetWord[i]) === 0) {
                    letter.state = LetterState.MATCH;
                } else {
                    letter.state = LetterState.PENDING;
                    // set rest to wrong as well
                    this.newMinimumIndex = i;
                    for (let j = i; j < this.wordLength; j++) {
                        this.rows[this.middleIndex].letters[j].text = '';
                        this.rows[this.middleIndex].letters[j].state = LetterState.PENDING;
                    }
                    break;
                }
            }
        }
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
            letters.push({ text: this.bottomWord[i], state: LetterState.BOOKEND })
        }
        this.rows.push({letters});
    }

}
