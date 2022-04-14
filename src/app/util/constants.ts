export const KeyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ''],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
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

export interface Row {
    letters: Letter[];
};

export interface Letter {
    text: string;
    state: LetterState;
};

export enum LetterState {
    PENDING,
    BOOKEND, // top or bottom comparison word
    WRONG,
    MATCH
};

