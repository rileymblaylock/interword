import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Letter, LETTERS, LetterState, Row, alphabet, wordsDict, startDateConstant, gameStatsObject } from 'src/app/util/constants';
import JSConfetti from 'js-confetti';
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

    // Firebase
    app: FirebaseApp = initializeApp(environment.firebase);
    analytics: Analytics = getAnalytics(this.app);

    readonly LetterState = LetterState;
    readonly alphabet = alphabet;

    rows: Row[] = [];

    topWord!: string;
    targetWord!: string;
    bottomWord!: string;
    days!: number;
    topRowGuess!: string;
    bottomRowGuess!: string;

    // clipboard strings
    clipboardString = '';

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
    showShareButton = false; // show share button if win=true

    // lengths and indices
    wordLength = 5;
    middleIndex = 1;
    letterIndex = 0;
    newMinimumIndex = 0;

    // stats
    guesses = 0;
    streak!: number;
    daysPlayed!: number;
    maxStreak!: number;
    minGuesses!: number;
    maxGuesses!: number;
    avgGuesses!: number;

    // animations
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
        this.getCurrentDaysSince();
    }

    getCurrentDaysSince() {
        let date = new Date();
        let dateUTC =  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
            date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        // current date in UTC
        let currentDateUTC = new Date(dateUTC);
        // get predetermined start date in UTC
        //let startDate = startDateConstant;
        let startDateUTC = Date.UTC(startDateConstant.getUTCFullYear(), startDateConstant.getUTCMonth(), startDateConstant.getUTCDate(),
            startDateConstant.getUTCHours() + 6, startDateConstant.getUTCMinutes(), startDateConstant.getUTCSeconds());
        let startDate = new Date(startDateUTC);
        this.days = currentDateUTC.getTime() - startDate.getTime();
        this.days = Math.floor(this.days / (1000 * 3600 * 24));
        //set todays words
        this.getDailyWords(this.days);
    }

    getDailyWords(days: number) {
        let todaysWords;
        // handle case in which its been over 1000 days
        if (days > wordsDict.targetWords.length) {
            todaysWords = wordsDict.targetWords[days - wordsDict.targetWords.length];
        } else {
            todaysWords = wordsDict.targetWords[days];
        }
        this.targetWord = todaysWords[0];
        this.topWord = todaysWords[1];
        this.bottomWord = todaysWords[2];
        this.initRows();
        this.getLocalStorage(days);
    }

    async getLocalStorage(days: number) {
        // not new player
        if (localStorage.getItem('gameStatsObject')) {
            const gameStats: gameStatsObject = JSON.parse(localStorage.getItem('gameStatsObject')!);
            // new day
            if (gameStats.dayNumber < days) {
                if (gameStats.prevPlayedDay?.valueOf() !== days - 1) {
                    gameStats.streak = 0;
                }
                gameStats.dayNumber = days;
                gameStats.playedToday = false;
                gameStats.guesses = 0;
                gameStats.topRowGuess = undefined;
                gameStats.bottomRowGuess = undefined;
                localStorage.setItem('gameStatsObject', JSON.stringify(gameStats));
                this.setGlobalStats(gameStats);
            }
            // not new day, has played
            else if (gameStats.playedToday === true) {
                // don't do anything to local storage, just init board
                this.initWin(gameStats);
                this.setGlobalStats(gameStats);
                this.guesses = gameStats.guesses;
            } 
            // not new day, hasn't played
            else {
                this.setGlobalStats(gameStats);
            }
        // new player
        } else {
            await this.wait(500);
            this.toggleHelp();
        }
    }

    setLocalStorage() {
        // not new player
        if (localStorage.getItem('gameStatsObject')) {
            let gameStats: gameStatsObject = JSON.parse(localStorage.getItem('gameStatsObject')!);
            // set streak and max streak
            if (gameStats.prevPlayedDay?.valueOf()! === this.days - 1) {
                this.streak = gameStats.streak += 1;
            } else {
                this.streak = 1;
            }
            this.maxStreak = Math.max(this.streak, gameStats.maxStreak);
            this.daysPlayed = gameStats.daysPlayed + 1;
            this.minGuesses = Math.min(gameStats.minGuesses, this.guesses);
            this.maxGuesses = Math.max(gameStats.maxGuesses, this.guesses);
            this.avgGuesses = gameStats.avgGuesses + ((this.guesses - gameStats.avgGuesses) / this.daysPlayed);
            this.avgGuesses = Math.round(this.avgGuesses * 100)/100;
            gameStats.playedToday = true;
            gameStats.dayNumber = this.days;
            gameStats.guesses = this.guesses;
            gameStats.prevPlayedDay = this.days;
            gameStats.daysPlayed = this.daysPlayed;
            gameStats.streak = this.streak;
            gameStats.maxStreak = this.maxStreak;
            gameStats.minGuesses = this.minGuesses;
            gameStats.maxGuesses = this.maxGuesses;
            gameStats.avgGuesses = this.avgGuesses;
            gameStats.topRowGuess = this.topRowGuess;
            gameStats.bottomRowGuess = this.bottomRowGuess;
            localStorage.setItem('gameStatsObject', JSON.stringify(gameStats));
        }
        //new player
        else {
            this.streak = 1;
            this.daysPlayed = 1;
            this.maxStreak = 1;
            this.minGuesses = this.guesses;
            this.maxGuesses = this.guesses;
            this.avgGuesses = this.guesses;
            const gameStats: gameStatsObject = {
                playedToday: true,
                dayNumber: this.days,
                prevPlayedDay: this.days,
                guesses: this.guesses,
                streak: this.streak,
                daysPlayed: this.daysPlayed,
                maxStreak: this.maxStreak,
                minGuesses: this.minGuesses,
                maxGuesses: this.maxGuesses,
                avgGuesses: this.avgGuesses,
                topRowGuess: this.topRowGuess,
                bottomRowGuess: this.bottomRowGuess
            }
            localStorage.setItem('gameStatsObject', JSON.stringify(gameStats));
        }
    }

    setGlobalStats(gameStats: gameStatsObject) {
        this.streak = gameStats.streak;
        this.daysPlayed = gameStats.daysPlayed;
        this.maxStreak = gameStats.maxStreak;
        this.minGuesses = gameStats.minGuesses;
        this.maxGuesses = gameStats.maxGuesses;
        this.avgGuesses = Math.round(gameStats.avgGuesses * 100) / 100;
    }

    startTimer() {
        let div = document.getElementById("timer") as HTMLElement;
 
        setInterval(function(){ 
            var date = new Date(); 
            var now_utc =  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
                date.getUTCHours() - 6, date.getUTCMinutes(), date.getUTCSeconds());
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

    async initWin(gameStats: gameStatsObject) {
        //set top and bottom row
        if (gameStats.topRowGuess) {
            for (let j = 0; j < this.wordLength; j++) {
                this.rows[0].letters[j].text = gameStats.topRowGuess.charAt(j)!;
            }
            for (let i = 0; i < this.wordLength; i++) {
                const letter = this.rows[0].letters[i];
                if (letter.text.localeCompare(this.targetWord[i]) === 0) {
                    letter.state = LetterState.MATCH;
                } else {
                    letter.state = LetterState.PENDING;
                    break;
                }
            }
        }

        if (gameStats.bottomRowGuess) {
            for (let j = 0; j < this.wordLength; j++) {
                this.rows[2].letters[j].text = gameStats.bottomRowGuess.charAt(j)!;
            }
            for (let i = 0; i < this.wordLength; i++) {
                const letter = this.rows[2].letters[i];
                if (letter.text.localeCompare(this.targetWord[i]) === 0) {
                    letter.state = LetterState.MATCH;
                } else {
                    letter.state = LetterState.PENDING;
                    break;
                }
            }
        }

        //set middle row
        for (let j = 0; j < this.wordLength; j++) {
            this.rows[this.middleIndex].letters[j].text = this.targetWord[j];
            this.rows[this.middleIndex].letters[j].state = LetterState.MATCH;
        }
        this.win = true;
        this.showShareButton = true;
        await this.wait(500);
        this.showStatsContainer = true;
    }

    async determineOrder(attemptString: string) {
        // correct answer, make win
        if (attemptString.localeCompare(this.targetWord) === 0) {
            for (let j = this.newMinimumIndex; j < this.wordLength; j++) {
                this.rows[this.middleIndex].letters[j].state = LetterState.MATCH;
            }
            //show win message and add animations
            this.guesses++;
            this.showInfoMessage('You win!', 3000);
            logEvent(this.analytics, 'win');
            this.win = true;
            this.showShareButton = true;
            await this.wait(450);
            const middleRowElement = this.middleRow?.nativeElement as HTMLElement;
            middleRowElement.classList.add('letter-pop');
            const jsConfetti = new JSConfetti();
            jsConfetti.addConfetti();

            await this.wait(1500);
            this.setLocalStorage();
            //toggle stats container
            this.showStatsContainer = true;
            
            return;

        // check if in bookend bounds
        } else if (attemptString.localeCompare(this.bottomWord) === -1  && attemptString.localeCompare(this.topWord) === 1) {
            /** determine if valid word */
            const firstLetter = attemptString[0] as keyof typeof wordsDict.dictionary;
            const validWords = wordsDict.dictionary[firstLetter];
            if (validWords.includes(attemptString)) {
                // determine if new top or bottom bookend
                if (attemptString.localeCompare(this.targetWord) === -1) {
                    this.setBookend(attemptString, 0);
                    this.topWord = attemptString;
                } else {
                    this.setBookend(attemptString, 2);
                    this.bottomWord = attemptString;
                }
            } else {
                this.showInfoMessage('Not a word');
                this.shake();
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

        if (index == 0) {
            this.topRowGuess = attemptString;
        } else {
            this.bottomRowGuess = attemptString;
        }

        this.guesses++;

        // hacky mutex
        this.inputLock = true;

        // get all row elements
        const topRowElement = this.topRow?.nativeElement as HTMLElement;
        const middleRowElement = this.middleRow?.nativeElement as HTMLElement;
        const bottomRowElement = this.bottomRow?.nativeElement as HTMLElement;

        //animate middle row to move towards top or bottom bookend
        if (index === 0) {
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
                    } else {
                        letter.state = LetterState.PENDING;
                        skipBool = true;
                    }
                } else {
                    letter.state = LetterState.PENDING;
                }
            }
        }
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
        this.clipboardString = '';
        this.showStatsContainer = false;

        if (this.guesses > 1) {
            this.clipboardString += 'INTERWORD #' + this.days + '\n' + this.guesses + ' guesses\n';
        } else {
            this.clipboardString += 'INTERWORD #' + this.days + '\n' + this.guesses + ' guess\n';
        }

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < this.wordLength; j++) {
                if (this.rows[i].letters[j].state === LetterState.MATCH) {
                    this.clipboardString += '🟩';
                } else {
                    this.clipboardString += '⬛';
                }
            }
            if (i !== 2) {
                this.clipboardString += '\n . . .\n';
            }
        }
        navigator.clipboard.writeText(this.clipboardString);
        this.showInfoMessage('Results copied to clipboard');
        logEvent(this.analytics, 'share');
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
        if(this.showHeartContainer) {
            logEvent(this.analytics, 'heart_button');
        }
    }

    toggleStats() {
        this.showStatsContainer = !this.showStatsContainer;
    }

    toggleHelp() {
        this.showHelpContainer = !this.showHelpContainer;
    }
}
