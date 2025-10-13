import { computed, signal } from '@angular/core';

type Trend = 'up' | 'down' | 'flat';

interface MetricState {
  readonly key: string;
  readonly label: string;
  readonly unit: 'currency' | 'count' | 'percentage';
  readonly caption: string;
  readonly magnitude: number;
  readonly delta: number;
}

interface MetricViewModel {
  readonly key: string;
  readonly label: string;
  readonly formattedValue: string;
  readonly caption: string;
  readonly delta: number;
  readonly trend: Trend;
}

export interface HomeViewModel {
  readonly metrics: () => MetricViewModel[];
  readonly refresh: () => void;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

const countFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0
});

function formatValue(value: number, unit: MetricState['unit']): string {
  if (unit === 'currency') {
    return currencyFormatter.format(value);
  }

  if (unit === 'percentage') {
    return `${value.toFixed(1)}%`;
  }

  return countFormatter.format(value);
}

function classifyTrend(delta: number): Trend {
  if (delta > 0.4) {
    return 'up';
  }

  if (delta < -0.4) {
    return 'down';
  }

  return 'flat';
}

export function useHome(): HomeViewModel {
  const state = signal<MetricState[]>([
    {
      key: 'sales',
      label: 'Sales',
      unit: 'currency',
      magnitude: 248_000,
      delta: 3.2,
      caption: 'Gross revenue generated in the last 24 hours.'
    },
    {
      key: 'inventory',
      label: 'Inventory Turns',
      unit: 'count',
      magnitude: 820,
      delta: -1.4,
      caption: 'Units moved versus total on-hand inventory.'
    },
    {
      key: 'finance',
      label: 'Operating Margin',
      unit: 'percentage',
      magnitude: 18.6,
      delta: 0.6,
      caption: 'Margin after expenses across all business units.'
    },
    {
      key: 'hr',
      label: 'Open Positions',
      unit: 'count',
      magnitude: 42,
      delta: -0.8,
      caption: 'Roles awaiting recruitment across departments.'
    }
  ]);

  const metrics = computed<MetricViewModel[]>(() =>
    state().map((metric) => ({
      key: metric.key,
      label: metric.label,
      caption: metric.caption,
      delta: metric.delta,
      formattedValue: formatValue(metric.magnitude, metric.unit),
      trend: classifyTrend(metric.delta)
    }))
  );

  const refresh = () => {
    state.update((items) =>
      items.map((item) => {
        const jitter = (Math.random() - 0.5) * 4; // -2% .. +2%
        const nextDelta = Math.round(jitter * 10) / 10;
        const multiplier = 1 + nextDelta / 100;
        const nextMagnitude =
          item.unit === 'count'
            ? Math.max(0, Math.round(item.magnitude * multiplier))
            : Math.max(0, Number((item.magnitude * multiplier).toFixed(1)));

        return {
          ...item,
          magnitude: nextMagnitude,
          delta: nextDelta
        };
      })
    );
  };

  return {
    metrics,
    refresh
  };
}

