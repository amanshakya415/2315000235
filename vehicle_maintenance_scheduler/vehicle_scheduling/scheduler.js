const DEPOT_URL = 'http://4.224.186.213/evaluation-service/depots';
const VEHICLES_URL = 'http://4.224.186.213/evaluation-service/vehicles';

function validatePositiveInteger(value, name) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
}

export async function fetchJson(url, token) {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText} - ${payload}`);
  }
  return response.json();
}

export function normalizeVehicleTasks(vehicles) {
  if (!Array.isArray(vehicles)) {
    throw new Error('Expected vehicles to be an array.');
  }

  const tasks = vehicles.map((item, index) => {
    if (typeof item !== 'object' || item === null) {
      throw new Error(`Vehicle item at index ${index} is not an object.`);
    }

    const duration = Number(item.Duration ?? item.duration);
    const impact = Number(item.Impact ?? item.impact);
    const taskId = item.TaskID ?? item.taskId ?? item.id ?? null;

    if (!Number.isFinite(duration) || !Number.isFinite(impact)) {
      throw new Error(`Vehicle task at index ${index} must include numeric Duration and Impact.`);
    }

    validatePositiveInteger(duration, 'Duration');
    validatePositiveInteger(impact, 'Impact');

    return {
      TaskID: taskId || `task-${index + 1}`,
      Duration: duration,
      Impact: impact
    };
  });

  return tasks;
}

export function solveKnapsack(tasks, capacity) {
  const n = tasks.length;
  const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i += 1) {
    const task = tasks[i - 1];
    const weight = task.Duration;
    const value = task.Impact;

    for (let w = 0; w <= capacity; w += 1) {
      if (weight <= w) {
        dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - weight] + value);
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  let remaining = capacity;
  const selectedTasks = [];
  for (let i = n; i > 0; i -= 1) {
    if (dp[i][remaining] !== dp[i - 1][remaining]) {
      const task = tasks[i - 1];
      selectedTasks.push(task);
      remaining -= task.Duration;
    }
  }

  selectedTasks.reverse();
  const totalImpact = selectedTasks.reduce((sum, task) => sum + task.Impact, 0);
  const totalDuration = selectedTasks.reduce((sum, task) => sum + task.Duration, 0);

  return { selectedTasks, totalImpact, totalDuration };
}

export async function scheduleTasksForDepot(depotId, apiToken) {
  validatePositiveInteger(depotId, 'depotId');

  const depotData = await fetchJson(DEPOT_URL, apiToken);
  if (!Array.isArray(depotData.depots)) {
    throw new Error('Depot API returned invalid payload.');
  }

  const depot = depotData.depots.find((item) => Number(item.ID) === depotId);
  if (!depot) {
    throw new Error(`Depot ID ${depotId} not found.`);
  }

  const capacity = Number(depot.MechanicHours);
  validatePositiveInteger(capacity, 'MechanicHours');

  const vehicleData = await fetchJson(VEHICLES_URL, apiToken);
  const vehicles = Array.isArray(vehicleData.vehicles) ? vehicleData.vehicles : vehicleData;
  const tasks = normalizeVehicleTasks(vehicles);

  const { selectedTasks, totalImpact, totalDuration } = solveKnapsack(tasks, capacity);

  return {
    depot: {
      ID: depotId,
      MechanicHours: capacity
    },
    totals: {
      selectedTaskCount: selectedTasks.length,
      totalImpact,
      totalDuration,
      remainingHours: capacity - totalDuration
    },
    selectedTasks
  };
}
