import React from 'react';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdaptiveBadge({ isRevised, className }) {
  if (!isRevised) return null;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-100/80 font-medium py-0 h-5",
        className
      )}
    >
      <RefreshCw className="w-3 h-3 mr-1" />
      Direvisi
    </Badge>
  );
}
