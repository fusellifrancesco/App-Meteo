# App Meteo CLI

Applicazione Node.js da riga di comando per recuperare il meteo corrente di una o più città tramite le API di Open-Meteo.

## Panoramica

Questo progetto fornisce una semplice interfaccia CLI che permette di:

- cercare una città tramite geocoding  
- recuperare il meteo corrente  
- visualizzare temperatura e descrizione delle condizioni meteo  
- gestire più città in parallelo  
- mostrare warning e errori parziali in caso di dati incompleti  

Il progetto include anche una suite di test di base per verificare alcune funzioni pure.

---

## Stack tecnico

- **Node.js**
- **API Open-Meteo**
  - Geocoding API
  - Forecast API
- **node:test** per i test
- **CommonJS** (`require` / `module.exports`)

---

## Struttura del progetto

    .
    ├── src/
    │   └── index.js          # Logica applicativa e avvio CLI
    ├── test/
    │   └── index.test.js     # Test automatici
    ├── .qodo
    └── README.md

---

## Requisiti

Node.js 18 o superiore

Nota: il progetto usa `fetch` nativo. Su Node.js 18+ è disponibile senza dipendenze aggiuntive.

---

## Configurazione

Verifica la versione di Node.js:

    node -v

Assicurati di usare una versione >= 18.

---

## Avvio dell’applicazione

Puoi eseguire l’app in uno di questi modi:

    node src/index.js

oppure, se hai configurato gli script:

    npm start

---

## Esempi di utilizzo

### Avvio interattivo

Dopo l’avvio, il programma mostra un prompt come questo:

    === App Meteo ===
    Scrivi una o più città separate da virgola.
    Esempio: Milano, Roma, Napoli
    Scrivi 'exit' per uscire.

---

### Una sola città

Input:

    Milano

Output atteso:

    📍 Risultato meteo
    Città: Milano
    Temperatura: 22°C
    Condizioni: Parzialmente nuvoloso

---

### Più città

Input:

    Milano, Roma, Napoli

Output atteso:

    📊 Meteo attuale per le città inserite:
    ┌─────────┬─────────┬──────────────┬────────────────────────────┬─────────┐
    │ (index) │ Città   │ Temperatura  │ Condizioni                 │ Stato   │
    ├─────────┼─────────┼──────────────┼────────────────────────────┼─────────┤
    │ 0       │ Milano  │ 22°C         │ Parzialmente nuvoloso      │ ✅ OK   │
    │ 1       │ Roma    │ 25°C         │ Cielo sereno               │ ✅ OK   │
    │ 2       │ Napoli  │ 24°C         │ Pioggia debole             │ ⚠️ Parziale │
    └─────────┴─────────┴──────────────┴────────────────────────────┴─────────┘

---

### Uscita dal programma

Per chiudere l’app:

    exit

---

## Test

Per eseguire i test:

    node --test

oppure:

    npm test

I test si trovano nella cartella `test/`.

---

### I test attuali verificano:

- il parsing corretto dell’input città  
- la rimozione di valori vuoti e spazi superflui  
- la conversione del weather_code in descrizione leggibile  
- il fallback per codici meteo sconosciuti  

---

## API interne esportate

Il modulo (`src/index.js`) esporta le seguenti funzioni:

- getWeatherDescription(weatherCode)
- getCurrentWeatherByCity(cityName)
- getCurrentWeatherByCities(cityNames)
- parseCitiesInput(input)
- printWeatherResult(result)
- printWeatherResultsSideBySide(results)
- askQuestion(question)
- startCLI()

Queste esportazioni rendono più semplice testare e riutilizzare parti della logica.

---

## Flusso applicativo

1. L’utente inserisce una o più città  
2. L’input viene normalizzato tramite parseCitiesInput  
3. Per ogni città, l’app:
   - chiama la Geocoding API di Open-Meteo  
   - recupera latitudine e longitudine  
   - chiama la Weather API per il meteo corrente  
4. I risultati vengono stampati:
   - in formato singolo per una città  
   - in tabella per più città  
5. Eventuali warning o errori parziali vengono mostrati all’utente  

---

## Gestione errori

L’app gestisce diversi scenari:

- nome città vuoto o non valido  
- città non trovata  
- errori HTTP dalle API  
- coordinate mancanti o non valide  
- dati meteo incompleti  
- errori imprevisti catturati dal blocco try/catch  

Quando possibile, il sistema restituisce un risultato parziale invece di interrompersi completamente.

---

## Convenzioni di sviluppo

Per mantenere il codice leggibile e facile da estendere:

- preferire funzioni piccole e con una sola responsabilità  
- mantenere separate logica, I/O e stampa output  
- aggiungere test per ogni nuova funzione pura  
- documentare con JSDoc le funzioni pubbliche o complesse  
- evitare hardcoding non necessario  

---

## Possibili miglioramenti futuri

- supporto a previsioni giornaliere o orarie  
- supporto a unità di misura configurabili  
- internazionalizzazione delle descrizioni  
- cache locale delle richieste  
- mocking delle API nei test  
- ulteriore separazione in moduli (api/, cli/, utils/)  
- introduzione di linting e formatting automatico  

---

## Risoluzione problemi

### fetch is not defined

Usa Node.js 18 o superiore.

---

### I test non partono

Verifica di usare una versione recente di Node.js con supporto a node:test.

---

### Nessun risultato per una città valida

Controlla:

- connessione internet  
- disponibilità delle API Open-Meteo  
- correttezza del nome città inserito  