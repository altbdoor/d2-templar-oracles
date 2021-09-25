import { range, shuffle } from 'underscore';
import { players } from '../data/players';
import { Player } from '../models/Player';

export const oracles = ['m', 'l1', 'r1', 'l2', 'r2', 'l3', 'r3'];

export const getMockPlayers = (): Player[] => {
    const playersData = shuffle([...players]).slice(0, 5);
    return [playersData[0], ...playersData];
};

export const getOraclesForMockPlayers = (playerOracle: string): string[] => {
    return shuffle(oracles.filter((oracle) => oracle !== playerOracle));
};

export const getOracles = (iteration: number) => {
    const base = 3;
    return range(base, base + iteration).map((oracleCount) => shuffle([...oracles]).slice(0, oracleCount));
};

export const sleep = (seconds: number) => {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};
