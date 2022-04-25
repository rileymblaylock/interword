import dictionary from 'src/app/util/dictionaryClean.json';
import targetWords from 'src/app/util/targetWordsClean2.json';

export const KeyboardRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ''],
    ['Enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace']
];

// Letter map.
export const LETTERS = (() => {
    // letter -> true. Easier to check.
    const ret: {[key: string]: boolean} = {};
    for (let charCode = 97; charCode < 97 + 26; charCode++) {
      ret[String.fromCharCode(charCode)] = true;
    }
    return ret;
})();

export const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

export interface Row {
    letters: Letter[];
};

export interface Letter {
    text: string;
    state: LetterState;
};

export enum LetterState {
    PENDING,
    WRONG,
    MATCH
};

export const startDateConstant = new Date(Date.UTC(2022, 3, 25));

export const wordsDict = {
    dictionary: dictionary,
    targetWords: targetWords
};

export interface gameStatsObject {
    playedToday: boolean,
    topRowGuess: string | undefined,
    bottomRowGuess: string | undefined,
    dayNumber: number,
    prevPlayedDay: number | undefined;
    guesses: number,
    streak: number,
    daysPlayed: number,
    maxStreak: number,
    minGuesses: number,
    maxGuesses: number,
    avgGuesses: number
}