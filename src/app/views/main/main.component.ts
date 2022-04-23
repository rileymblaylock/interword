import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Letter, LETTERS, LetterState, Row, alphabet } from 'src/app/util/constants';
import JSConfetti from 'js-confetti';
import targetWords from 'src/app/util/targetWords.json';
import dictionary from 'src/app/util/dictionary.json';

import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import { environment } from 'src/environments/environment';
import { FirebaseApp } from '@angular/fire/app';
import { Analytics } from '@angular/fire/analytics';


@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
    @ViewChild('topRow') topRow!: ElementRef;
    @ViewChild('middleRow') middleRow!: ElementRef;
    @ViewChild('bottomRow') bottomRow!: ElementRef;

    app: FirebaseApp = initializeApp(environment.firebase);
    analytics: Analytics = getAnalytics(this.app);

    readonly LetterState = LetterState;
    readonly numberAttempts = 12;
    readonly alphabet = alphabet;

    rows: Row[] = [];

    topWord: string = 'metal';
    targetWord: string = 'ovals';
    bottomWord: string = 'pants';

    // TODO get dynamically from backend
    showShareButton = false;

    // init with day, time to get, etc
    clipboardString = '';
    emojiString = '';

    // info msg
    infoMsg = '';
    fadeOutInfoMessage = false;

    win = false;

    inputLock = false;

    // UI Elements
    topRowElement!: HTMLElement;
    middleRowElement!: HTMLElement;
    bottomRowElement!: HTMLElement;
    
    // UI booleans
    showStatsContainer = false;
    showHeartContainer = false;
    showHelpContainer = false;

    // lengths and indices
    wordLength = 5;
    middleIndex = 1;
    letterIndex = 0;
    newMinimumIndex = 0;

    animationToggle = false;
    animationRowIndex!: number;
    animationIndices: Number[] = [];

    constructor() {}

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        this.handleClickKey(event.key)
    }

    ngOnInit(): void {
        this.startTimer();
        this.getDailyWords();
        this.initRows();
    }

    getDailyWords() {
        console.log(targetWords);
        console.log(dictionary);
    }

    startTimer() {
        let div = document.getElementById("timer") as HTMLElement;
 
        setInterval(function(){ 
            var date = new Date(); 
            var now_utc =  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
                date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
            var todayDate = new Date(now_utc);
            var tomorrow = new Date(now_utc);
            tomorrow.setUTCHours(24,0,0,0);
            var diffMS = tomorrow.getTime()/1000-todayDate.getTime()/1000;
            var diffHr = Math.floor(diffMS/3600);
            diffMS = diffMS-diffHr*3600;
            var diffMi = Math.floor(diffMS/60);
            diffMS = diffMS-diffMi*60;
            var diffS = Math.floor(diffMS);
            var result = ((diffHr<10)?"0"+diffHr:diffHr);
            result += ":"+((diffMi<10)?"0"+diffMi:diffMi);
            result += ":"+((diffS<10)?"0"+diffS:diffS);
            div.innerHTML = String(result);
        }, 1000);
    }

    handleClickKey($event: string) {
        if (this.win) {
            return;
        }

        if (!this.inputLock) {
            console.log($event);
            if (LETTERS[$event.toLowerCase()]) {
                if (this.letterIndex < this.wordLength && this.letterIndex >= 0) {
                    this.setLetter($event.toLowerCase());
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
    }

    setLetter(letter: string) {
        this.rows[this.middleIndex].letters[this.letterIndex].text = letter;
    }

    submit() {
        // check if enough letters
        const attemptRow = this.rows[this.middleIndex];
        if (attemptRow.letters.some(letter => letter.text === '')) {
            this.showInfoMessage('Not enough letters');
            this.shake();
            return;
        }

        // get string word from attempt
        const attemptString = attemptRow.letters.map(letter => letter.text).join('');

        this.determineOrder(attemptString);
    }

    async determineOrder(attemptString: string) {
        // correct answer, make win
        if (attemptString.localeCompare(this.targetWord) === 0) {
            for (let j = this.newMinimumIndex; j < this.wordLength; j++) {
                this.rows[this.middleIndex].letters[j].state = LetterState.MATCH;
            }
            //show win message and add animations
            this.showInfoMessage('You win!', 3000);
            this.win = true;
            this.showShareButton = true;
            await this.wait(450);
            const middleRowElement = this.middleRow?.nativeElement as HTMLElement;
            middleRowElement.classList.add('letter-pop');
            const jsConfetti = new JSConfetti();
            jsConfetti.addConfetti();

            await this.wait(1500);
            //toggle stats container
            this.showStatsContainer = true;
            
            return;
        // check if in bookend bounds
        } else if (attemptString.localeCompare(this.bottomWord) === -1  && attemptString.localeCompare(this.topWord) === 1) {
            if (true /** determine if valid word - TODO */) {
                // determine if new top or bottom bookend
                if (attemptString.localeCompare(this.targetWord) === -1) {
                    this.setBookend(attemptString, 0);
                    this.topWord = attemptString;
                } else {
                    this.setBookend(attemptString, 2);
                    this.bottomWord = attemptString;
                }
            }
        // make sure not equal to existing bookends    
        } else if (attemptString.localeCompare(this.bottomWord) === 0 || attemptString.localeCompare(this.topWord) === 0) {
            this.showInfoMessage('Guess already made');
            this.shake();
        // outside of word range
        } else {
            this.showInfoMessage('Out of bounds');
            this.shake();
        }
    }

    /**
     * @param attemptString 
     * @param index of top or bottom word to replace
     */
    async setBookend(attemptString: string, index: number) {

        // hacky mutex
        this.inputLock = true;

        // get all row elements
        const topRowElement = this.topRow?.nativeElement as HTMLElement;
        const middleRowElement = this.middleRow?.nativeElement as HTMLElement;
        const bottomRowElement = this.bottomRow?.nativeElement as HTMLElement;

        //animate middle row to move towards top or bottom bookend
        if (index == 0) {
            middleRowElement.classList.add('move-up');
        } else {
            middleRowElement.classList.add('move-down');
        }

        // wait a bit before move down animation should occur
        await this.wait(100);

        // set letters of bookend and keep existing states for now
        let letters: Letter[] = [];
        for (let i = 0; i < this.wordLength; i++) {
            letters.push({ text: attemptString[i], state: this.rows[index].letters[i].state });
        }
        this.rows[index] = {letters};

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

        // wait a bit between slam and tile animation
        await this.wait(700);
        this.animationRowIndex = index;
        this.animationToggle = true;
        this.animationIndices = [];

        //set colors and color tile animation
        let skipBool = false; // if skip bool true, acts as a break, but lets loop continue for animations
        for (let i = 0; i < this.wordLength; i++) {
            const letter = this.rows[index].letters[i];
            if (letter.state !== LetterState.MATCH) {
                // set animation class, change state while hidden, then continue animation
                // finally, remove used animation class(es)
                this.animationIndices.push(i);

                if(!skipBool) {
                    if (letter.text.localeCompare(this.targetWord[i]) === 0) {
                        letter.state = LetterState.MATCH;
                        this.emojiString += '🟩';
                    } else {
                        letter.state = LetterState.PENDING;
                        this.emojiString += '🟦';
                        skipBool = true;
                    }
                } else {
                    letter.state = LetterState.PENDING;
                    this.emojiString += '🟦';
                }
            }
        }
        this.emojiString += '\n';
        await this.wait(600);
        this.animationToggle = false;

        // update middle values
        for (let i = 0; i < this.wordLength; i++) {
            this.rows[this.middleIndex].letters[i].text = '';
            this.rows[this.middleIndex].letters[i].state = LetterState.PENDING;
        }
        this.letterIndex = 0;

        // add pop in animation to center
        middleRowElement.classList.add('pop-in');
        setTimeout(() => {
            middleRowElement.classList.remove('move-up');
            middleRowElement.classList.remove('move-down');
            middleRowElement.classList.remove('pop-in');
        }, 500);

        this.inputLock = false;

    }

    handleClickShare() {
        // TO DO
        this.showStatsContainer = false;

        this.clipboardString += 'INFO ABOUT DAYS GAME\n';

        this.clipboardString += this.emojiString;
        navigator.clipboard.writeText(this.clipboardString);

        this.showInfoMessage('Results copied to clipboard');
    }

    giveUp() {
        // TODO
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
		});
	}

    private showInfoMessage(msg: string, time = 2000) {
		this.infoMsg = msg;
        setTimeout(() => {
            this.fadeOutInfoMessage = true;
            setTimeout(() => {
                this.infoMsg = '';
                this.fadeOutInfoMessage = false;
            }, 500);
        }, time);
	}

    shake() {
        const middleRow = this.middleRow?.nativeElement as HTMLElement;
        middleRow.classList.add('shake');
        setTimeout(() => {
            middleRow.classList.remove('shake');
        }, 500);
    }

    toggleHeart() {
        this.showHeartContainer = !this.showHeartContainer;
    }

    toggleStats() {
        this.showStatsContainer = !this.showStatsContainer;
    }

    toggleHelp() {
        this.showHelpContainer = !this.showHelpContainer;
    }
}
