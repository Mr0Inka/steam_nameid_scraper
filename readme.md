# CS2 NameID Updater

A simple Node.js script to fetch and update the latest CS2 item name IDs, used for retrieving data from the Steam Market.

## Features
- Downloads the most recent list of all CS2 items.
- Reads the current `nameids.json`.
- Adds missing item names to `nameids.json` with `null` as their nameid.
- Loops through `nameids.json` and fetches missing name IDs from Steam, replacing `null` values.
- The provided `nameids.json` is up to date but does not include items without a market page.

## Installation

1. **Clone this repository**
   ```sh
   git clone https://github.com/Mr0Inka/steam_nameid_scraper
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Manually create a `.env` file** in the root directory and add your self-rotating proxy address:
   ```sh
   PROXY_URL=your_proxy_address
   ```

## Usage

Run the update script:
```sh
node update_name_ids.js
```

## Requirements
- Node.js (Latest LTS recommended)
- A self-rotating proxy

