# Vehicle Scheduling Microservice

This microservice fetches depot and vehicle task data from protected APIs and solves the task scheduling problem for a depot.

## Run

1. Set the protected API token:

```powershell
$env:EVAL_API_TOKEN = "your_token_here"
node app.js
```

2. Call the scheduler endpoint:

```powershell
curl "http://localhost:3000/schedule?depotId=1"
```

## API

- `GET /schedule?depotId=<id>`: returns optimized task selection for the depot.

## Behavior

- Fetches depots from `http://4.224.186.213/evaluation-service/depots`
- Fetches tasks from `http://4.224.186.213/evaluation-service/vehicles`
- Solves a 0/1 knapsack problem to maximize total impact while respecting mechanic hours
- Returns selected tasks and totals
