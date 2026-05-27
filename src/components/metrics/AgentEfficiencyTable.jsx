import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function AgentEfficiencyTable({ data }) {
  // data should be aggregated agent data
  // Since the requirement says "Data derived from agent_logs (or placeholder if not available)"
  // Let's provide a fallback to placeholder data if data is empty

  const tableData = data && data.length > 0 ? data : [
    { name: 'Librarian Agent', calls: 142, avgLatency: '1.2s', errorRate: '2%' },
    { name: 'Quiz Agent', calls: 89, avgLatency: '2.4s', errorRate: '1%' },
    { name: 'Curriculum Agent', calls: 56, avgLatency: '3.1s', errorRate: '0%' },
    { name: 'Chat Agent', calls: 310, avgLatency: '0.8s', errorRate: '4%' },
  ];

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agent</TableHead>
            <TableHead className="text-right">Total Calls</TableHead>
            <TableHead className="text-right">Avg Latency</TableHead>
            <TableHead className="text-right">Error Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((row, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell className="text-right">{row.calls}</TableCell>
              <TableCell className="text-right">{row.avgLatency}</TableCell>
              <TableCell className="text-right">{row.errorRate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
