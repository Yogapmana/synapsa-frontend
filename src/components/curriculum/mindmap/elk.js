/**
 * ELK.js singleton.
 *
 * Imported lazily by ``buildConceptGraphLayout`` to keep the chunk cost out
 * of the radial "Overview" view. The full ELK bundle is ~120 KB gzipped —
 * acceptable given that the entire ``MindMapView`` is already lazy-loaded
 * via ``React.lazy`` in ``Curriculum.jsx``.
 */
import ELK from 'elkjs'

export const elk = new ELK()
