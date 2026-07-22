# inventory-admin

Angular admin UI for the public [inventory-api](https://github.com/ndeanka/inventory-api) showcase.

**Angular 19 · standalone · signals · OnPush · typed HttpClient**

## Ecosystem

Works with [inventory-api](https://github.com/ndeanka/inventory-api). See also [inventory-jobs](https://github.com/ndeanka/inventory-jobs) and [sku-service](https://github.com/ndeanka/sku-service).

## Run

```bash
# API first
cd ../inventory-api && docker compose up --build

# UI
npm start
```

Open `http://localhost:4200`.

Set API base in `src/environments/environment.ts` if needed.

## What it shows

- Feature folder (`items/`) next to thin app shell
- List + create against `/api/v1/items`
- Clear error states when the API is down

## Author

[William Mlula](https://github.com/ndeanka)
