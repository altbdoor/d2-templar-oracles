import { concat, defer, from, fromEvent, NEVER, of, race, throwError, timer } from 'rxjs';
import { concatMap, delay, map, mapTo, mergeAll, repeat, switchMap, take, tap, toArray } from 'rxjs/operators';
import { random } from 'underscore';
import './main.css';
import { GameState } from './models/GameState';
import { appendChat, appendDetails, playSound, qs, qsa, resetChat, resetDetails, showPlayerNames } from './utility/dom';
import { getMockPlayers, getOracles, getOraclesForMockPlayers } from './utility/rand';

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

    gameState.selectedOracle = qs<HTMLInputElement>('[name="oracles"]:checked').value;
    gameState.mockPlayerOracles = getOraclesForMockPlayers(gameState.selectedOracle);

    [...qsa('.map__radio')].forEach((radio) => {
        radio.classList.add('d-none');
    });

    [...qsa('.map__oracle')].forEach((radio) => {
        radio.classList.remove('d-none');
        radio.classList.add('map__oracle--vanish');
    });

    qs('.map__btn__start').classList.add('d-none');
    qs('.map__results').classList.add('d-none');

    const maxIter = 5;

    from(playSound('darkness'))
        .pipe(
            map(() => getOracles(maxIter)),
            tap((x) => console.log(x)),
            mergeAll(),
            concatMap((oracles, roundIndex) => {
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
                        delay(1000),
                        repeat(2)
                    ),
                    from(oracles).pipe(
                        tap(() => {
                            qs('.map__btn__shoot').classList.remove('d-none');
                            oracles
                                .map((oracle) => qs(`.map__oracle--${oracle}`))
                                .forEach((elem) => elem.classList.remove('map__oracle--vanish'));
                        }),
                        concatMap((oracle, index) => {
                            if (index === 0) {
                                playSound('ready');
                                appendDetails('', 'The Templar summons the Oracles');
                            }

                            const isSelectedOracle = oracle === gameState.selectedOracle;
                            const isPlayerInvolved = oracles.includes(gameState.selectedOracle);
                            const isPlayerPassed = oracles.indexOf(gameState.selectedOracle) < oracles.indexOf(oracle);

                            const nonPlayerEvent = defer(() => {
                                if (isSelectedOracle) {
                                    return timer(6000).pipe(switchMap(() => throwError('PLAYER_SHOT_LATE')));
                                }

                                return timer(random(10, 40) * 100).pipe(
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
                    delay(1000),
                    tap(() => {
                        qs('.map__btn__shoot').classList.add('d-none');
                        appendDetails('', 'The Oracles recognize their refrain');
                    }),
                    delay(roundIndex === maxIter - 1 ? 0 : 7000)
                );
            })
        )
        .subscribe(
            (data) => {
                console.log('you did it', data);
                if (data[0].length !== maxIter + 3 - 1) {
                    return;
                }

                qs('.map__results__message').innerHTML = `
                    <h3>You did it!</h3>
                    <p>You manage to overcome the Templar Oracle simulation!</p>
                `;
                qs('.map__results').classList.remove('d-none');
            },
            (err) => {
                if (err === 'PLAYER_SHOT_EARLY') {
                    qs('.map__results__message').innerHTML = `
                        <h3>That was too early!</h3>
                        <p>Be patient, keep track of the orders, and try again!</p>
                    `;
                } else if (err === 'PLAYER_SHOT_LATE') {
                    qs('.map__results__message').innerHTML = `
                        <h3>That was too late!</h3>
                        <p>Be more aware, keep track of the orders, and try again!</p>
                    `;
                }

                qs('.map__btn__shoot').classList.add('d-none');
                qs('.map__results').classList.remove('d-none');
            }
        );
};

qs('.map__results__retry').onclick = () => {
    qs('.map__results').classList.add('d-none');
    qs('.map__btn__start').classList.remove('d-none');

    [...qsa('.map__radio')].forEach((radio) => {
        radio.classList.remove('d-none');
    });

    [...qsa('.map__oracle')].forEach((radio) => {
        radio.classList.add('d-none');
    });

    qs<HTMLInputElement>('.player-list__name').disabled = false;

    resetDetails();
    resetChat();
};
