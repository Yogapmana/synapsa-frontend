import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useUIStore } from '../../stores/uiStore';
import { cn } from '../../utils/cn';

const AppLayout = ({ children }) => {
  const { sidebarCollapsed } = useUIStore();
  const location = useLocation();

  const getMaxWidthClass = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'lg:max-w-[1280px]';
    if (path.includes('/modules')) return 'lg:max-w-[720px]';
    if (path.includes('/chat')) return 'lg:max-w-[1200px]';
    return 'lg:max-w-[1024px]';
  };

  return (
    // ── App-shell pattern (Slack/Discord/ChatGPT-style) ─────────────
    // The OUTER container is `h-screen overflow-hidden` so the page
    // itself can NEVER scroll — even if a child is taller than the
    // viewport. This is the root cause of the "double scroll" bug:
    // the page used to grow past 100vh because <main> + padding
    // didn't constrain its height, so we got a page scrollbar *in
    // addition to* the inner messages-area scrollbar.
    //
    // The flex row here is for the fixed sidebar. Sidebar is `fixed`
    // (off-flow), so the row only contains the inner wrapper. The
    // inner wrapper uses `flex-1` to fill the row width and stacks
    // Topbar + Main vertically.
    //
    // Padding is moved off of <main> and onto the inner content div.
    // That way pages like Chat can use `h-full` to fill the entire
    // <main> box (no padding stealing height) while still getting
    // visual breathing room from the inner div.
    <div className="h-screen flex bg-neutral overflow-hidden">
      <Sidebar />

      <div
        className={cn(
          // `min-w-0` lets the wrapper actually shrink in the flex
          // row (otherwise the sidebar's 240px + flex content would
          // overflow horizontally).
          // `min-h-0` lets the wrapper's children (Topbar, Main) use
          // `flex-1` and actually constrain height — without it,
          // flex-1 sizes to content, not available space.
          "flex-1 flex flex-col min-w-0 min-h-0 transition-all duration-250 ease-in-out",
          // The fixed sidebar overlaps this wrapper, so push the
          // content right with padding-left. On mobile the sidebar
          // is a drawer (no pl needed) — `lg:` prefix.
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-[240px]"
        )}
      >
        <Topbar />

        {/*
          Main is `flex-1 min-h-0 overflow-y-auto flex flex-col`:
          - `flex-1` fills remaining height (viewport − topbar)
          - `min-h-0` lets flex-1 actually constrain (otherwise the
            child could push main past 100vh)
          - `overflow-y-auto` is the SCROLL CONTAINER for normal
            pages (Dashboard, Curriculum, Settings, Quiz History,
            etc.). Long content scrolls here — the scrollbar is
            anchored to main's right edge, just like a normal page.
            Without this, the dashboard's "stats grid + RAG widget +
            recent activity + quick actions" stack would be clipped
            at the bottom of the viewport and unreachable. The
            user explicitly asked: "halaman dashboard gk bisa di
            scroll".
          - `flex flex-col` so children stack header/content/etc.

          The inner content div below also has `overflow-y-auto`,
          BUT only as a safety net — for Chat/Module pages, the
          inner content is `h-full` (fills main exactly) so no
          overflow happens there. For normal pages, the inner div
          is shorter than its content; main's overflow handles the
          scroll; the inner div's overflow is dormant.

          Why BOTH main and the inner div have `overflow-y-auto`?
          Belt-and-suspenders: if a page uses `h-full` (Chat,
          Module), it fills the inner div exactly and main has
          nothing to scroll. If a page is long (Dashboard), main
          scrolls and the inner div's content is bounded by main
          (no overflow on the div). If a page is `h-full` and has
          a chat that overflows internally (Chat messages), the
          chat has its own `overflow-y-auto` and main stays put.
        */}
        <main className="flex-1 min-h-0 overflow-y-auto flex flex-col">
          <div
            className={cn(
              // The content div is `flex-1 min-h-0` so it fills main
              // and provides a definite height for children that
              // use `h-full` (like the Chat page). Padding is here
              // (not on <main>) so full-height pages don't lose
              // pixels to outer padding. The `overflow-y-auto` here
              // is a fallback — main is the primary scroll context.
              "mx-auto w-full flex-1 min-h-0 overflow-y-auto p-4 md:p-6 lg:p-8",
              getMaxWidthClass()
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
