// Extracts a plain-text snapshot of what's currently visible on screen, so the AI
// assistant can answer "what is this" / "how do I do X" questions grounded in the
// real page content instead of a hardcoded per-route description.

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'PATH', 'IFRAME']);
const MAX_CHARS = 4000;

function isVisible(el) {
  if (!(el instanceof Element)) return false;
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function isInViewport(el, buffer = 400) {
  const rect = el.getBoundingClientRect();
  return rect.bottom > -buffer && rect.top < window.innerHeight + buffer;
}

// Walks the DOM under `root`, collecting short text fragments from leaf-ish elements
// (things whose own direct text is non-empty), skipping hidden nodes and script/style tags.
function collectText(root, { viewportOnly } = {}) {
  const lines = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode(el) {
      if (SKIP_TAGS.has(el.tagName)) return NodeFilter.FILTER_REJECT;
      if (!isVisible(el)) return NodeFilter.FILTER_REJECT;
      if (viewportOnly && !isInViewport(el)) return NodeFilter.FILTER_SKIP;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  let node = walker.currentNode;
  while (node) {
    const direct = Array.from(node.childNodes)
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.textContent.trim())
      .filter(Boolean)
      .join(' ');

    if (direct) {
      const tag = node.tagName;
      if (/^H[1-6]$/.test(tag)) lines.push(`# ${direct}`);
      else if (tag === 'BUTTON' || node.getAttribute('role') === 'button') lines.push(`[button] ${direct}`);
      else if (tag === 'LABEL') lines.push(`${direct}:`);
      else if (tag === 'INPUT' || tag === 'TEXTAREA') { /* handled separately below */ }
      else lines.push(direct);
    }

    node = walker.nextNode();
  }

  return lines;
}

function collectFormValues(root) {
  const values = [];
  root.querySelectorAll('input, select, textarea').forEach(el => {
    if (!isVisible(el)) return;
    const label = el.getAttribute('aria-label') || el.placeholder || el.name || '';
    if (el.type === 'range') return; // paired number input already captures the value
    const val = el.value;
    if (val === '' || val == null) return;
    values.push(`${label ? label + ' = ' : ''}${val}`.trim());
  });
  return values;
}

/**
 * Returns a compact plain-text description of the current page: title, active
 * tab/route hint, and the visible text content of the main content area.
 */
export function getVisiblePageContext() {
  const main = document.querySelector('main') || document.body;
  const title = document.title || '';

  const textLines = collectText(main);
  const formValues = collectFormValues(main);

  const deduped = [];
  const seen = new Set();
  for (const line of textLines) {
    const key = line.slice(0, 120);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(line);
  }

  let body = deduped.join('\n');
  if (formValues.length) {
    body += `\n\nCurrent input values:\n${formValues.join('\n')}`;
  }

  if (body.length > MAX_CHARS) {
    body = body.slice(0, MAX_CHARS) + '\n…(truncated)';
  }

  return { title, url: window.location.pathname, body };
}
