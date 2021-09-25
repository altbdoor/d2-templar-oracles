import { Player } from '../models/Player';

const soundMap: { [key: string]: string } = {
    m: './assets/oracles/oracle1.mp3',
    l1: './assets/oracles/oracle2.mp3',
    r1: './assets/oracles/oracle3.mp3',
    l2: './assets/oracles/oracle4.mp3',
    r2: './assets/oracles/oracle5.mp3',
    l3: './assets/oracles/oracle6.mp3',
    r3: './assets/oracles/oracle7.mp3',
    break: './assets/oracles/break.mp3',
    darkness: './assets/ambient/darkness.mp3',
    ready: './assets/oracles/ready.mp3',
};

export const qs = <T = HTMLElement>(query: string) => document.querySelector<any>(query)! as unknown as T;
export const qsa = <T = HTMLElement>(query: string) => document.querySelectorAll<any>(query)! as unknown as T[];

export const showPlayerNames = (players: Player[]): void => {
    const container = document.querySelector('#player-list')!;
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
        text.innerHTML = `<span class="map__details__name">${playerName}</span> ${action}`;
    } else {
        text.innerHTML = action;
    }

    elem.appendChild(text);
    elem.scrollTop = elem.scrollHeight;
};

export const resetDetails = () => {
    qs('.map__details').innerHTML = '';
};

export const appendChat = (playerName: string, action: string) => {
    const elem = qs('.player-chat');
    const text = document.createElement('div');
    text.innerHTML = `<span class="player-chat__name">${playerName}:</span> ${action}`;
    elem.appendChild(text);
    elem.scrollTop = elem.scrollHeight;
};

export const resetChat = () => {
    qs('.player-chat').innerHTML = '';
};
