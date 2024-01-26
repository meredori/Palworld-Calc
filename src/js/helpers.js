import { SPECIAL_JSON_URL, PARENT_1_NAME, PARENT_2_NAME, RESULT_NAME, HIGHLIGHT_COLOR, SPECIAL_BORDER_COLOR, MALE, FEMALE, BOTH } from './const.js';

export const createTileElement = (tag, properties = {}, textContent = '') => {
    const element = document.createElement(tag);
    Object.assign(element, properties);
    if (textContent) element.textContent = textContent;
    return element;
}

export const matchTiles = async (tiles) => {
    const response = await fetch(SPECIAL_JSON_URL);
    const specialCombinations = await response.json();

    clearBackgroundColor(tiles);
    tiles.forEach((tile1, index1) => {
        tiles.forEach((tile2, index2) => {
            if (index1 !== index2 && canMatch(tile1, tile2)) {
                const specialCombination = specialCombinations.find(combination => 
                    (combination[PARENT_1_NAME] === tile1.item.Name && combination[PARENT_2_NAME] === tile2.item.Name) ||
                    (combination[PARENT_1_NAME] === tile2.item.Name && combination[PARENT_2_NAME] === tile1.item.Name)
                );

                if (specialCombination) {
                    const specialTile = tiles.find(tile => tile.item.Name === specialCombination[RESULT_NAME] && !tile.owned.checked);
                    if (specialTile) highlightTile(specialTile, tile1, tile2, true);
                } else {
                    highlightMatchingTiles(tiles, tile1, tile2, specialCombinations);
                }
            }
        });
    });
}

export const clearBackgroundColor = (tiles) => {
    tiles.forEach(tile => {
        if (tile.tile.style.backgroundColor === HIGHLIGHT_COLOR) {
            tile.tile.style.backgroundColor = '';
        }
    });
}

export const canMatch = (tile1, tile2) => 
    tile1.owned.checked && tile2.owned.checked &&
    ((tile1.gender.value === MALE && (tile2.gender.value === FEMALE || tile2.gender.value === BOTH)) ||
    (tile1.gender.value === FEMALE && (tile2.gender.value === MALE || tile2.gender.value === BOTH)) ||
    (tile1.gender.value === BOTH && tile2.gender.value !== ''));

export const highlightMatchingTiles = (tiles, tile1, tile2, specialCombinations) => {
    const power1 = Number(tile1.item.Power);
    const power2 = Number(tile2.item.Power);
    const newPower = Math.floor((power1 + power2 + 1) / 2);
    let bestMatch = null;
    let bestDiff = Infinity;

    for (const tile of tiles) {
        // Normalize names before comparing
        const tileName = tile.item.Name.trim().toLowerCase();

        // Ignore tiles that match the result_name in any of the specialCombinations
        if (specialCombinations.some(combination => combination[RESULT_NAME].trim().toLowerCase() === tileName)) {
            continue;
        }

        const tilePower = Number(tile.item.Power);
        const diff = Math.abs(newPower - tilePower);
        if (diff < bestDiff) {
            bestDiff = diff;
            bestMatch = tile;
        } else if (diff === bestDiff) {
            bestMatch = Number(tile.item.Number) < Number(bestMatch.item.Number) ? tile : bestMatch;
        }
    }

    if (bestMatch) highlightTile(bestMatch, tile1, tile2);
}

export const addEventListenerToElement = (element, eventType, callback) => {
    element.addEventListener(eventType, callback);
}

const highlightTile = (tile, tile1, tile2, isSpecial = false) => {
    if (!tile.owned.checked) {
        tile.tile.style.backgroundColor = HIGHLIGHT_COLOR;
        if (isSpecial) {
            tile.tile.style.border = SPECIAL_BORDER_COLOR;
        }
    }
    
    const newCombination = `${tile1.item.Name} (Gender: ${tile1.gender.value}) and ${tile2.item.Name} (Gender: ${tile2.gender.value})`;
    const reverseCombination = `${tile2.item.Name} (Gender: ${tile2.gender.value}) and ${tile1.item.Name} (Gender: ${tile1.gender.value})`;

    if (!tile.combinations) {
        tile.combinations = [];
    }

    if (!tile.combinations.includes(newCombination) && !tile.combinations.includes(reverseCombination)) {
        tile.combinations.push(newCombination);
    }
}