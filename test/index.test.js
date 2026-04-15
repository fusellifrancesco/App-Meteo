const test = require('node:test');
const assert = require('node:assert/strict');

const {
  parseCitiesInput,
  getWeatherDescription
} = require('../src/index');

test('parseCitiesInput divide correttamente più città', () => {
  const result = parseCitiesInput('Milano, Roma, Napoli');
  assert.deepEqual(result, ['Milano', 'Roma', 'Napoli']);
});

test('parseCitiesInput rimuove spazi e valori vuoti', () => {
  const result = parseCitiesInput(' Milano, , Roma ,   Napoli  , ');
  assert.deepEqual(result, ['Milano', 'Roma', 'Napoli']);
});

test('getWeatherDescription restituisce la descrizione corretta per codice 0', () => {
  const result = getWeatherDescription(0);
  assert.equal(result, 'Cielo sereno');
});

test('getWeatherDescription restituisce fallback per codice sconosciuto', () => {
  const result = getWeatherDescription(999);
  assert.equal(result, 'Descrizione non disponibile');
});