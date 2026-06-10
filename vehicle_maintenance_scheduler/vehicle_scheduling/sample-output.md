# Sample Output

Run the service and request a schedule for a depot:

```powershell
$env:EVAL_API_TOKEN="your_token"
node app.js
curl "http://localhost:3000/schedule?depotId=1"
```

Expected JSON structure:

```json
{
  "depot": {
    "ID": 1,
    "MechanicHours": 60
  },
  "totals": {
    "selectedTaskCount": 5,
    "totalImpact": 42,
    "totalDuration": 60,
    "remainingHours": 0
  },
  "selectedTasks": [
    {
      "TaskID": "...",
      "Duration": 6,
      "Impact": 10
    }
  ]
}
```

> Capture the actual terminal output and add a screenshot to this folder if required by the assignment.
