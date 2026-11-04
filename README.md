# WORTFÜNFHUNDERT

**WORT500** – ein deutsches Wörter-Rätsel im Stil von Wordle.

Spielen: https://frittehd.github.io/WORTFUENFHUNDERT/

## Spielprinzip

Errate ein deutsches Wort mit 5 Buchstaben in maximal 8 Versuchen. Nach jedem Versuch gibt es nur drei Zahlen:

- **Grün** – Buchstaben an der richtigen Position
- **Gelb** – richtige Buchstaben an der falschen Position
- **Rot** – Buchstaben, die nicht im Wort vorkommen

Welcher Buchstabe welche Farbe hat, findest du selbst heraus: Kacheln und Tasten lassen sich per Klick bzw. Rechtsklick einfärben. Mit SPACE setzt du einen Platzhalter (–).

Modi: **Tägliches Rätsel** (für alle am selben Tag dasselbe Wort) und **Freies Spiel**.

## Entwicklung

```bash
npm install
npm run dev
```

Jeder Push auf `main` wird per GitHub Actions automatisch auf GitHub Pages veröffentlicht.
