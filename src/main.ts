import { concat, defer, from, fromEvent, NEVER, of, race, throwError, timer } from 'rxjs';
import { concatAll, concatMap, delay, last, map, mapTo, repeat, switchMap, take, tap, toArray } from 'rxjs/operators';
import { GameState } from './models/GameState';
import {
    appendChat,
    appendDetails,
    hideResults,
    playSound,
    qs,
    qsa,
    resetChat,
    resetDetails,
    showPlayerNames,
    showResults,
} from './utility/dom';
import { getMockPlayers, getOracles, getOraclesForMockPlayers, getRandomIntInclusive } from './utility/rand';

const gameState: GameState = {
    mockPlayers: getMockPlayers(),
    mockPlayerOracles: [],
    name: 'JohnDoe#1234',
    selectedOracle: '',
};

showPlayerNames(gameState.mockPlayers.slice(1));

qs('.map__btn__start').onclick = () => {
    const playerName = qs<HTMLInputElement>('.player-list__name');
    gameState.name = playerName.value;
    playerName.disabled = true;

    gameState.selectedOracle = qs<HTMLInputElement>('.map__radio > [name="oracles"]:checked').value;
    gameState.mockPlayerOracles = getOraclesForMockPlayers(gameState.selectedOracle);

    qs('.map__btn__start').classList.add('d-none');

    qsa('.map__radio').forEach((elem) => {
        elem.classList.add('d-none');
    });

    qsa('.map__oracle').forEach((elem) => {
        elem.classList.remove('d-none');
        elem.classList.add('map__oracle--vanish');
    });

    const maxIteration = 5;

    from(playSound('darkness'))
        .pipe(
            map(() => getOracles(maxIteration)),
            concatAll(),
            concatMap((oracles) => {
                appendDetails('', 'The Oracles prepare to sing their refrain');

                return concat(
                    from(oracles).pipe(
                        concatMap((oracle, index) => {
                            if (oracle !== gameState.selectedOracle) {
                                const mockPlayer = gameState.mockPlayers[gameState.mockPlayerOracles.indexOf(oracle)];
                                appendChat(mockPlayer.name, `i got ${index + 1}`);
                            }

                            qs(`.map__oracle--${oracle}`).classList.remove('map__oracle--vanish');
                            return from(playSound(oracle)).pipe(mapTo(oracle));
                        }),
                        toArray(),
                        tap(() => {
                            qsa('.map__oracle').forEach((elem) => elem.classList.add('map__oracle--vanish'));
                        }),
                        delay(1400),
                        repeat(2),
                        last(),
                        tap(() => {
                            qs('.map__btn__shoot').classList.remove('d-none');
                            oracles
                                .map((oracle) => qs(`.map__oracle--${oracle}`))
                                .forEach((elem) => elem.classList.remove('map__oracle--vanish'));

                            playSound('ready');
                            appendDetails('', 'The Templar summons the Oracles');
                        })
                    ),
                    from(oracles).pipe(
                        concatMap((oracle, index) => {
                            const isSelectedOracle = oracle === gameState.selectedOracle;
                            const isPlayerInvolved = oracles.includes(gameState.selectedOracle);
                            const isPlayerPassed = oracles.indexOf(gameState.selectedOracle) < oracles.indexOf(oracle);

                            const nonPlayerEvent = defer(() => {
                                if (isSelectedOracle) {
                                    return timer(6000).pipe(switchMap(() => throwError('PLAYER_SHOT_LATE')));
                                }

                                return timer(getRandomIntInclusive(1000, 4000)).pipe(
                                    tap(() => {
                                        playSound('break');
                                        const mockPlayer =
                                            gameState.mockPlayers[gameState.mockPlayerOracles.indexOf(oracle)];

                                        appendDetails(mockPlayer.name, 'has destroyed an Oracle');
                                        appendChat(mockPlayer.name, `${index + 1} down`);

                                        qs(`.map__oracle--${oracle}`).classList.add('map__oracle--vanish');
                                    }),
                                    mapTo('MOCK_SHOT_SUCCESS')
                                );
                            });

                            const playerShootEvent = fromEvent(qs('.map__btn__shoot'), 'click').pipe(
                                take(1),
                                switchMap(() => {
                                    if (isSelectedOracle) {
                                        playSound('break');
                                        appendDetails(gameState.name, 'has destroyed an Oracle');
                                        qs(`.map__oracle--${oracle}`).classList.add('map__oracle--vanish');
                                        return of('PLAYER_SHOT_SUCCESS');
                                    }

                                    if (isPlayerInvolved && !isPlayerPassed) {
                                        playSound('break');
                                        appendDetails(gameState.name, 'has destroyed an Oracle');
                                        qs(`.map__oracle--${oracle}`).classList.add('map__oracle--vanish');
                                        return throwError('PLAYER_SHOT_EARLY');
                                    }

                                    return NEVER;
                                })
                            );

                            return race(nonPlayerEvent, playerShootEvent);
                        }),
                        toArray()
                    )
                ).pipe(
                    toArray(),
                    delay(1400),
                    tap(() => {
                        qs('.map__btn__shoot').classList.add('d-none');
                        appendDetails('', 'The Oracles recognize their refrain');
                    }),
                    switchMap((data) => {
                        const isLastRound = data[0].length === maxIteration + 2;
                        return timer(isLastRound ? 0 : 6000).pipe(mapTo(data));
                    })
                );
            }),
            last()
        )
        .subscribe(
            () => {
                showResults('SUCCESS');
            },
            (err: string) => {
                showResults(err);
                qs('.map__btn__shoot').classList.add('d-none');
            }
        );
};

qs('.map__results__retry').onclick = () => {
    qs<HTMLInputElement>('.player-list__name').disabled = false;
    qs('.map__btn__start').classList.remove('d-none');

    qsa('.map__radio').forEach((elem) => {
        elem.classList.remove('d-none');
    });

    qsa('.map__oracle').forEach((elem) => {
        elem.classList.add('d-none');
    });

    hideResults();
    resetDetails();
    resetChat();
};
