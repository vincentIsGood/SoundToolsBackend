let ALPHABET = "";
for(let i = 65; i < 65+26; i++) ALPHABET += String.fromCharCode(i);
ALPHABET += ALPHABET.toLowerCase();

let ALPHA_NUMERIC = ALPHABET;
for(let i = 0; i < 10; i++) ALPHA_NUMERIC += i;

export default class Randomizer{
    static randomString(length: number){
        return Randomizer.randomChoices(ALPHA_NUMERIC, length);
    }
    
    static randomChoices(choices: string, length: number){
        const choicesArr = Array.from(choices);
        const result = new Array<string>(length);
        for(let i = 0; i < length; i++){
            result[i] = choicesArr[Randomizer.randIntBetween(0, choices.length)];
        }
        return result.join("");
    }
    
    static randBetween(min: number, max: number){
        return Math.random() * (max - min) + min;
    }
    static randIntBetween(min: number, max: number){
        return Math.floor(Randomizer.randBetween(min, max));
    }
}