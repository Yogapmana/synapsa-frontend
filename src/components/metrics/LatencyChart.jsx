import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';

export function LatencyChart({ data }) {
  if (!data || data.length === 0) return <div>No latency data available.</div>;

  // Assuming data is an array of objects with latency in seconds (or ms)
  // Let's bucket the latencies (e.g., 0-1s, 1-2s, etc.)
  const buckets = {};
  const latencies = data.map(d => d.latency || 0).sort((a, b) => a - b);
  
  latencies.forEach(lat => {
    const bucketStr = `${Math.floor(lat)}-${Math.floor(lat) + 1}s`;
    buckets[bucketStr] = (buckets[bucketStr] || 0) + 1;
  });

  const chartData = Object.keys(buckets).sort((a, b) => {
    return parseInt(a) - parseInt(b);
  }).map(key => ({
    name: key,
    count: buckets[key],
  }));

  // Calculate P50 and P95
  const getPercentile = (p) => {
    if (latencies.length === 0) return 0;
    const index = Math.ceil((p / 100) * latencies.length) - 1;
    return latencies[index];
  };

  const p50 = getPercentile(50);
  const p95 = getPercentile(95);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="count" fill="#C4251C" radius={[4, 4, 0, 0]} />
          {/* Need to position reference lines appropriately. Since X is buckets, reference lines for P50/P95 might be tricky to plot on X axis unless we use a scatter/line or map P50 to bucket. 
          Alternatively, display P50 and P95 as text overlays or custom elements. Let's map P50/P95 to string keys for ReferenceLine, or just show them in a legend. */}
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2 text-xs text-muted-foreground justify-center">
        <span>P50: {p50.toFixed(2)}s</span>
        <span>P95: {p95.toFixed(2)}s</span>
      </div>
    </div>
  );
}
