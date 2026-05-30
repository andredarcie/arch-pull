# Game Franchise Sales Analysis

Static analysis project for the Wikipedia list of best-selling video game franchises.

## Files

- `build.py`: downloads the source table, normalizes it, writes the CSV, and calculates analysis aggregates.
- `data/franchises.csv`: cleaned dataset used as the auditable base.
- `data/analysis.json`: derived analysis used by the web page.
- `index.html`, `styles.css`, `app.js`: final static website with charts.

## Rebuild

```powershell
python build.py
```

Open `index.html` through a local static server so the browser can load `data/analysis.json`.

```powershell
python -m http.server 8000
```

Source: <https://en.wikipedia.org/wiki/List_of_best-selling_video_game_franchises>
