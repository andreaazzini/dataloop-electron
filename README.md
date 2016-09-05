# Dataloop

## Requirements

Make sure you've installed Node.js (4.x or higher) and npm.

Install `twitter-scraper-cli`.

```
npm install -g twitter-scraper-cli
```

## Run

Place the CSV files containing specific party terms into the folder `data/csv/parties`, and the CSV files containing specific topic terms into the folder `data/csv/topics`.

```
bin/scraper.py db_name collection_name
```
