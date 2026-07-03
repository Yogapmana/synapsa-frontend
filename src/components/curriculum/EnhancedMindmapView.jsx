import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Sparkles,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useEnhancedMindmap } from '@/hooks/useLearning';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';
import { Toolbar } from 'markmap-toolbar';
import 'markmap-toolbar/dist/style.css';

const transformer = new Transformer();

function buildEnhancedMarkdown(payload) {
  if (!payload || !payload.themes) return '';
  let md = `# ${payload.course_title || 'Mindmap'}\n`;
  
  payload.themes.forEach(theme => {
    // Theme — no emoji
    md += `## ${theme.label || 'Tema'}\n`;
    
    (theme.concepts || []).forEach(concept => {
      // Concept — no emoji
      md += `### ${concept.label || 'Konsep'}\n`;
      
      (concept.key_points || []).forEach(kp => {
        // Key point — label only, description as hover/tooltip context
        let content = kp.label || 'Poin';
        if (kp.description) {
          content += `: ${kp.description}`;
        }
        md += `- ${content}\n`;
      });
    });
  });
  
  return md;
}

export default function EnhancedMindmapView({ sessionId }) {
  const { data, isLoading, isError, error, refetch } = useEnhancedMindmap(sessionId);
  const queryClient = useQueryClient();
  const { token, isAuthenticated } = useAuthStore();
  const wsRef = useRef(null);

  const svgRef = useRef(null);
  const mmRef = useRef(null);
  const toolbarRef = useRef(null);
  const [renderError, setRenderError] = useState(null);

  // Live-update via WebSocket
  useEffect(() => {
    if (!sessionId || !token || !isAuthenticated) return;

    const wsBase = import.meta.env.VITE_WS_BASE_URL
      || (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host;
    const wsUrl = `${wsBase}/ws/agent-log/${sessionId}?token=${token}`;

    let ws;
    let retryTimeout;
    let manualClose = false;
    const connect = () => {
      if (manualClose) return;
      try {
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;
      } catch {
        retryTimeout = setTimeout(connect, 3000);
        return;
      }
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (
            msg?.type === 'mindmap_enhanced' &&
            (msg.status === 'ready' || msg.status === 'failed')
          ) {
            queryClient.invalidateQueries({
              queryKey: ['enhanced-mindmap', sessionId],
            });
          }
        } catch {}
      };
      ws.onclose = () => {
        if (!manualClose) {
          retryTimeout = setTimeout(connect, 3000);
        }
      };
    };
    connect();

    return () => {
      manualClose = true;
      clearTimeout(retryTimeout);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [sessionId, token, isAuthenticated, queryClient]);

  // Render Markmap
  useEffect(() => {
    if (!svgRef.current || !data?.payload?.themes) return;
    setRenderError(null);
    
    try {
      const md = buildEnhancedMarkdown(data.payload);
      const { root } = transformer.transform(md);
      
      if (!mmRef.current) {
        mmRef.current = Markmap.create(svgRef.current, {
          autoFit: true,
          initialExpandLevel: 2,
          spacingVertical: 12,
          spacingHorizontal: 120,
          paddingX: 16,
          nodeMinHeight: 28,
        }, root);
        
        // Inject custom CSS for boxed nodes
        const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        styleEl.textContent = `
          .markmap-node > rect {
            rx: 8;
            ry: 8;
            stroke-width: 1.5;
            stroke-opacity: 0.5;
            fill-opacity: 0.08;
          }
          .markmap-node[data-depth="0"] > rect {
            fill: #b45309;
            stroke: #b45309;
            fill-opacity: 0.12;
          }
          .markmap-node[data-depth="1"] > rect {
            fill: #0369a1;
            stroke: #0369a1;
            fill-opacity: 0.08;
          }
          .markmap-node[data-depth="2"] > rect {
            fill: #15803d;
            stroke: #15803d;
            fill-opacity: 0.06;
          }
          .markmap-node[data-depth="3"] > rect,
          .markmap-node[data-depth="4"] > rect {
            fill: #6b7280;
            stroke: #d1d5db;
            fill-opacity: 0.04;
          }
          .markmap-node text {
            font-family: 'Inter', system-ui, sans-serif;
            font-weight: 500;
            font-size: 14px;
          }
          .markmap-node[data-depth="0"] text {
            font-weight: 700;
            font-size: 16px;
          }
          .markmap-node[data-depth="1"] text {
            font-weight: 600;
            font-size: 14px;
          }
          .markmap-node circle {
            stroke-width: 2;
          }
          .markmap-link {
            stroke-width: 1.8;
            stroke-opacity: 0.35;
          }
        `;
        svgRef.current.prepend(styleEl);
        
        // Add toolbar
        if (toolbarRef.current) {
          toolbarRef.current.innerHTML = '';
          const { el } = Toolbar.create(mmRef.current);
          el.className = cn(el.className, 'absolute bottom-4 right-4 !z-10 shadow-warm-md rounded-xl overflow-hidden');
          toolbarRef.current.appendChild(el);
        }
      } else {
        mmRef.current.setData(root);
        mmRef.current.fit();
      }
    } catch (err) {
      console.error('[MARKMAP] render failed:', err);
      setRenderError(err?.message || 'Gagal merender mindmap');
    }
  }, [data]);

  // Loading / Error states
  if (isLoading && !data) {
    return (
      <div className="card-base p-12 text-center" aria-busy="true">
        <div className="mx-auto w-10 h-10 mb-4 text-tertiary">
          <Brain className="w-full h-full animate-pulse" />
        </div>
        <p className="text-secondary font-medium">Memuat peta konsep...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card-base p-12 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-danger-light flex items-center justify-center mb-4 text-danger-fg">
          <AlertCircle size={28} />
        </div>
        <h3 className="font-display font-semibold text-xl text-primary">Gagal memuat Detail</h3>
        <p className="text-secondary mt-2 max-w-sm mx-auto">
          {error?.message || 'Terjadi kesalahan pada server.'}
        </p>
        <div className="mt-5">
          <Button variant="tertiary" onClick={() => refetch()} className="rounded-xl font-label">
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  // Still generating...
  if (data?.ready === false) {
    return (
      <div className="card-base p-10 text-center relative overflow-hidden bg-surface-0 border-tertiary/20">
        <div className="absolute inset-0 bg-gradient-to-br from-tertiary/[0.02] to-info/[0.02]" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-16 h-16 rounded-2xl bg-surface-1 shadow-warm-sm flex items-center justify-center mb-5 ring-1 ring-border-subtle">
            <Sparkles className="text-tertiary animate-pulse" size={28} />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-surface-0 rounded-full flex items-center justify-center shadow-warm-sm ring-1 ring-border-subtle">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
              </span>
            </div>
          </div>
          <h3 className="font-display font-semibold text-xl text-primary tracking-tight">
            Menyiapkan Peta Konsep Terstruktur
          </h3>
          <p className="text-secondary mt-2 max-w-md mx-auto leading-relaxed text-[15px]">
            AI sedang menyusun peta pikiran terstruktur untuk kurikulum ini. Proses ini berjalan di latar belakang dan memakan waktu sekitar 15–30 detik.
          </p>
        </div>
      </div>
    );
  }

  const payload = data?.payload;
  if (!payload || !payload.themes) return null;

  const stats = payload.stats || {};

  return (
    <div className="flex flex-col space-y-4">
      {/* ── Header ── */}
      <header className="card-base p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-tertiary/12 flex items-center justify-center text-tertiary shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display font-bold text-lg text-primary leading-snug">
              {payload.course_title}
            </h2>
            {payload.summary && (
              <p className="text-sm text-secondary leading-relaxed mt-1.5">
                {payload.summary}
              </p>
            )}
          </div>
        </div>

        {stats.total_nodes > 0 && (
          <div className="mt-4 pt-4 border-t border-border-subtle/60 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-secondary/80 font-label">
            <span className="font-semibold text-primary">{stats.theme_count} tema</span>
            <span className="font-semibold text-primary">{stats.concept_count} konsep</span>
            <span className="font-semibold text-primary">{stats.key_point_count} poin kunci</span>
            <span className="text-secondary/50">·</span>
            <span className="inline-flex items-center gap-1">
              <Sparkles size={10} className="text-tertiary" />
              {stats.total_nodes} total node
            </span>
          </div>
        )}
      </header>

      {/* ── Markmap canvas ── */}
      <div className="card-base p-0 relative overflow-hidden bg-surface-0/40">
        <div className="relative w-full h-[640px] overflow-hidden bg-surface-0/40 cursor-grab active:cursor-grabbing" style={{ touchAction: 'none' }}>
          {renderError && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="card-base p-5 max-w-md text-center bg-surface-1/90 border-warning/40 pointer-events-auto">
                <AlertTriangle className="mx-auto text-warning mb-2" size={24} />
                <p className="text-sm text-primary font-medium">Gagal merender mindmap</p>
                <p className="text-xs text-secondary mt-1">{renderError}</p>
              </div>
            </div>
          )}
          
          <svg ref={svgRef} className="w-full h-full" />
          <div ref={toolbarRef} className="absolute bottom-4 right-4" />
        </div>
        
        <div className="px-5 md:px-7 py-3 border-t border-border-subtle bg-surface-0/40/80 text-center">
          <p className="text-xs text-secondary font-label">
            Klik node lingkaran untuk memperluas / menyembunyikan • Scroll untuk zoom • Drag untuk menggeser
          </p>
        </div>
      </div>
    </div>
  );
}
