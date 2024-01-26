import { createTileElement, matchTiles, addEventListenerToElement } from './helpers.js';
import { DATA_JSON_URL, MALE, FEMALE, BOTH, LIGHT_BLUE, LIGHT_PINK, DEFAULT_COLOR, DIAGONAL_SPLIT } from './const.js';

document.addEventListener('DOMContentLoaded', (event) => {
    fetch(DATA_JSON_URL)
        .then(response => response.json())
        .then(data => {
            data.sort((a, b) => a.Number - b.Number);
            const container = document.getElementById('tiles-container');

            let tiles = [];

            tiles = data.map((item, index) => {
                const tile = createTileElement('div', { className: 'tile' });

                const number = createTileElement('p', {}, `Number: ${item.Number}`);
                tile.appendChild(number);

                const name = createTileElement('p', {}, `Name: ${item.Name}`);
                tile.appendChild(name);

                const power = createTileElement('p', {}, `Power: ${item.Power}`);
                tile.appendChild(power);

                const owned = createTileElement('input', { type: 'checkbox', id: 'owned' + index });
                const ownedLabel = createTileElement('label', { htmlFor: 'owned' + index });
                ownedLabel.appendChild(document.createTextNode('Owned'));
                tile.appendChild(owned);
                tile.appendChild(ownedLabel);

                const gender = createTileElement('select', { disabled: true });
                ['', MALE, FEMALE, BOTH].forEach(value => {
                    const option = createTileElement('option', { value }, value.charAt(0).toUpperCase() + value.slice(1));
                    gender.add(option);
                });
                tile.appendChild(gender);

                const wanted = createTileElement('button', {}, 'Wanted');
                tile.appendChild(wanted);

                addEventListenerToElement(owned, 'change', () => {
                    gender.disabled = !owned.checked;
                    sessionStorage.setItem('owned' + index, owned.checked);
                    matchTiles(tiles);
                });

                addEventListenerToElement(wanted, 'click', () => {
                    if (tiles[index].combinations && tiles[index].combinations.length > 0) {
                        alert(tiles[index].combinations.join('\n'));
                    }
                });

                addEventListenerToElement(gender, 'change', () => {
                    tile.style.background = '';
                    tile.style.backgroundColor = '';

                    if (gender.value === MALE) {
                        tile.style.backgroundColor = LIGHT_BLUE;
                    } else if (gender.value === FEMALE) {
                        tile.style.backgroundColor = LIGHT_PINK;
                    } else if (gender.value === BOTH) {
                        tile.style.background = DIAGONAL_SPLIT;
                    } else {
                        tile.style.backgroundColor = DEFAULT_COLOR;
                    }
                    sessionStorage.setItem('gender' + index, gender.value);
                    matchTiles(tiles);
                });

                owned.checked = sessionStorage.getItem('owned' + index) === 'true';
                gender.disabled = !owned.checked;
                gender.value = sessionStorage.getItem('gender' + index) || '';

                matchTiles(tiles);

                container.appendChild(tile);

                return { tile, item, owned, gender };
            });

            const loadSession = (tiles) => {
                tiles.forEach((tileObj, index) => {
                    const { tile, owned, gender } = tileObj;

                    owned.checked = sessionStorage.getItem('owned' + index) === 'true';
                    gender.disabled = !owned.checked;
                    gender.value = sessionStorage.getItem('gender' + index) || '';

                    if (gender.value === MALE) {
                        tile.style.backgroundColor = LIGHT_BLUE;
                    } else if (gender.value === FEMALE) {
                        tile.style.backgroundColor = LIGHT_PINK;
                    } else if (gender.value === BOTH) {
                        tile.style.background = DIAGONAL_SPLIT;
                    } else {
                        tile.style.backgroundColor = DEFAULT_COLOR;
                    }

                    matchTiles(tiles);
                });
            }

            loadSession(tiles);

            
        });
});