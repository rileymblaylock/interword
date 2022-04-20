import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Letter, LETTERS, LetterState, Row, alphabet } from 'src/app/util/constants';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
    @ViewChild('topRow') topRow!: ElementRef;
    @ViewChild('middleRow') middleRow!: ElementRef;
    @ViewChild('bottomRow') bottomRow!: ElementRef;

    readonly LetterState = LetterState;
    readonly numberAttempts = 12;
    readonly alphabet = alphabet;

    rows: Row[] = [];

    topWord: string = 'flake';
    targetWord: string = 'gavel';
    bottomWord: string = 'holds';

    win = false;
    attempts = 0;

    // UI booleans
    showAlphabet = false;

    // UI Elements
    topRowElement!: HTMLElement;
    middleRowElement!: HTMLElement;
    bottomRowElement!: HTMLElement;
    topRowLetterElems!: NodeListOf<Element>;
    middleRowLetterElems!: NodeListOf<Element>;
    bottomRowLetterElems!: NodeListOf<Element>;

    // lengths and indices
    wordLength = 5;
    middleIndex = 1;
    letterIndex = 0;
    newMinimumIndex = 0;

    animationIndex!: number;
    animationRowIndex!: number;

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

        if (this.attempts >= this.numberAttempts) {
            console.log("Out of tries!");
        }

        if (LETTERS[$event.toLowerCase()]) {
            if (this.letterIndex < this.wordLength && this.letterIndex >= 0) {
                this.setLetter($event);
                this.letterIndex++;
            }
        } else if ($event === 'Backspace') {
            if (this.letterIndex > 0) {
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
            const middleRow = this.middleRow?.nativeElement as HTMLElement;
            middleRow.classList.add('shake');
            setTimeout(() => {
				middleRow.classList.remove('shake');
			}, 500);
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
    async setBookend(attemptString: string, index: number) {
        //set letters
        let letters: Letter[] = [];
        for (let i = 0; i < this.wordLength; i++) {
            letters.push({ text: attemptString[i], state: this.rows[index].letters[i].state });
        }
        this.rows[index] = {letters};

        const topRowElement = this.topRow?.nativeElement as HTMLElement;
        const bottomRowElement = this.bottomRow?.nativeElement as HTMLElement;

        // animate slam
        if (index === 0) {
            topRowElement.classList.add('slam-up');
            setTimeout(() => {
                topRowElement.classList.remove('slam-up');
            }, 500);
        } else {
            bottomRowElement.classList.add('slam-down');
            setTimeout(() => {
                bottomRowElement.classList.remove('slam-down');
            }, 500);
        }

        await this.wait(700);

        this.animationIndex = 0;
        this.animationRowIndex = index;

        //set colors and color tile animation
        let skipBool = false; // if skip bool true, acts as a break, but lets loop continue for animations
        for (let i = 0; i < this.wordLength; i++) {
            const letter = this.rows[index].letters[i];
            if (letter.state !== LetterState.MATCH) {
                // set animation class, change state while hidden, then continue animation
                // finally, remove used animation class(es)

                if(!skipBool) {
                    if (letter.text.localeCompare(this.targetWord[i]) === 0) {
                        letter.state = LetterState.MATCH;
                    } else {
                        letter.state = LetterState.PENDING;
                        skipBool = true;
                    }
                } else {
                    letter.state = LetterState.PENDING;
                }
            }

            await this.wait(400);

            this.animationIndex++;
        }
    }

    /**
     * @returns sets letters and classes of middle row after a guess
     */
    updateMiddle() {
        for (let i = 0; i < this.wordLength; i++) {
            this.rows[this.middleIndex].letters[i].text = '';
            this.rows[this.middleIndex].letters[i].state = LetterState.PENDING;
        }
        this.letterIndex = 0;
    }

    initRows() {
        let letters: Letter[] = [];
        for (let i = 0; i < this.wordLength; i++) {
            letters.push({ text: this.topWord[i], state: LetterState.PENDING })
        }
        this.rows.push({letters});

        letters = [];
        for (let i = 0; i < this.wordLength; i++) {
            letters.push({ text: '', state: LetterState.PENDING })
        }
        this.rows.push({letters});

        letters = [];
        for (let i = 0; i < this.wordLength; i++) {
            letters.push({ text: this.bottomWord[i], state: LetterState.PENDING })
        }
        this.rows.push({letters});
    }

    /**
     * @param ms 
     * @returns utility function for waiting for animation execution
     */
    private async wait(ms: number) {
		await new Promise<void>((resolve) => {
			setTimeout(() => {
				resolve();
			}, ms);
		})
	}

}
