import darkness from '../assets/ambient/darkness.mp3';
import oracleBreak from '../assets/oracles/break.mp3';
import oracle1 from '../assets/oracles/oracle1.mp3';
import oracle2 from '../assets/oracles/oracle2.mp3';
import oracle3 from '../assets/oracles/oracle3.mp3';
import oracle4 from '../assets/oracles/oracle4.mp3';
import oracle5 from '../assets/oracles/oracle5.mp3';
import oracle6 from '../assets/oracles/oracle6.mp3';
import oracle7 from '../assets/oracles/oracle7.mp3';
import ready from '../assets/oracles/ready.mp3';
import { Player } from '../models/Player';

const soundMap: { [key: string]: any } = {
    m: oracle1,
    l1: oracle2,
    r1: oracle3,
    l2: oracle4,
    r2: oracle5,
    l3: oracle6,
    r3: oracle7,
    break: oracleBreak,
    darkness,
    ready,
};

export const qs = <T = HTMLElement>(query: string) => document.querySelector<any>(query)! as unknown as T;
export const qsa = <T = HTMLElement>(query: string) => {
    const res = document.querySelectorAll<any>(query);
    return [...res] as T[];
};

export const showPlayerNames = (players: Player[]): void => {
    const container = qs('#player-list');
    const fragment = document.createDocumentFragment();

    players.forEach((player) => {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item');
        listItem.innerText = `${player.name}`;
        fragment.appendChild(listItem);
    });

    container.prepend(fragment);
};

export const playSound = (name: string): Promise<void> => {
    return new Promise((resolve) => {
        const elem = document.createElement('audio');
        elem.volume = 0.8;
        elem.preload = 'auto';
        elem.src = soundMap[name];
        document.body.appendChild(elem);
        elem.currentTime = 0;
        elem.onended = () => {
            document.body.removeChild(elem);
            resolve();
        };
        elem.play();
    });
};

export const appendDetails = (playerName: string, action: string) => {
    const elem = qs('.map__details');
    const text = document.createElement('div');
    if (playerName) {
        text.innerHTML = `<span class="text-d2-fireteam">${playerName}</span> ${action}`;
    } else {
        text.innerHTML = action;
    }

    elem.appendChild(text);
};

export const resetDetails = () => {
    qs('.map__details').innerHTML = '';
};

export const appendChat = (playerName: string, action: string) => {
    const elem = qs('.player-chat');
    const text = document.createElement('div');
    text.innerHTML = `<span class="text-d2-fireteam">${playerName}:</span> ${action}`;
    elem.appendChild(text);
};

export const resetChat = () => {
    qs('.player-chat').innerHTML = '';
};

export const showResults = (status: string) => {
    if (status === 'PLAYER_SHOT_EARLY') {
        qs('.map__results__message').innerHTML = `
            <h3>That was too early!</h3>
            <p>Be patient, keep track of the orders, and try again!</p>
        `;
    } else if (status === 'PLAYER_SHOT_LATE') {
        qs('.map__results__message').innerHTML = `
            <h3>That was too late!</h3>
            <p>Be more aware, keep track of the orders, and try again!</p>
        `;
    } else {
        qs('.map__results__message').innerHTML = `
            <h3>You did it!</h3>
            <p>You manage to overcome the Templar Oracle simulation!</p>
        `;
    }

    qs('.map__results').classList.remove('d-none');
};

export const hideResults = () => {
    qs('.map__results').classList.add('d-none');
};
