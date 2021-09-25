import { Player } from './Player';

export interface GameState {
    mockPlayers: Player[];
    mockPlayerOracles: string[];
    name: string;
    selectedOracle: string;
}
