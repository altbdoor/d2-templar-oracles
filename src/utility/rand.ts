import { players } from '../data/players';
import { Player } from '../models/Player';

export const oracles = ['m', 'l1', 'r1', 'l2', 'r2', 'l3', 'r3'];

// https://stackoverflow.com/a/12646864
function shuffleArray(inputArray: any[]) {
    const array = inputArray.slice(0);
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values_inclusive
export function getRandomIntInclusive(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

export const getMockPlayers = (): Player[] => {
    const playersData = shuffleArray(players).slice(0, 5);
    return [playersData[0], ...playersData];
};

export const getOraclesForMockPlayers = (playerOracle: string): string[] => {
    return shuffleArray(oracles.filter((oracle) => oracle !== playerOracle));
};

export const getOracles = (iteration: number): string[][] => {
    const base = 3;
    return Array(iteration)
        .fill(0)
        .map((_, index) => index + base)
        .map((oracleCount) => shuffleArray(oracles).slice(0, oracleCount));
};
