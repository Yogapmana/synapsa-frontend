/**
 * Empty stub for the `web-worker` module.
 *
 * ``elkjs`` (graph layout library used by ``buildConceptGraphLayout``) has
 * an optional ``require('web-worker')`` that Rollup/Vite tries to resolve
 * statically when bundling. We don't use the Web Worker ELK API — the
 * ``ConceptGraphService`` always calls ``elk.layout(...)`` on the main
 * thread — so this stub is never executed at runtime. The runtime check
 * inside elkjs (`typeof Worker !== 'undefined'`) gracefully falls back to
 * the synchronous main-thread layout when no real Worker is available.
 *
 * If we ever need the worker-backed ELK for very large graphs, install
 * the ``web-worker`` package and delete this stub.
 */
export default class Worker {}
export const Worker_threads = undefined
