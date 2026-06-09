import { useMemo } from 'react';

function esc(t) { return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function inline(t) {
  return t
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em class="italic">$1</em>')
    .replace(/`([^`]+)`/g,     '<code class="px-1.5 py-0.5 rounded bg-accent/15 text-accent-400 font-mono text-[11px]">$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-accent-400 underline">$1</a>');
}

function parseMd(md) {
  if (!md) return '';
  const lines = md.split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim() || 'text';
      const code = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) { code.push(esc(lines[i])); i++; }
      out.push(`<div class="my-3 rounded-xl overflow-hidden border border-white/[0.07]"><div class="px-4 py-1.5 bg-accent/10 text-accent-400 font-mono text-[10px] font-bold uppercase tracking-wider border-b border-white/[0.07]">${lang}</div><pre class="p-4 overflow-x-auto bg-black/30 text-slate-300 font-mono text-xs leading-relaxed"><code>${code.join('\n')}</code></pre></div>`);
      i++; continue;
    }

    // Headings
    const h = line.match(/^(#{1,3})\s+(.+)/);
    if (h) {
      const sizes = { 1:'text-lg font-extrabold', 2:'text-base font-bold', 3:'text-sm font-bold' };
      out.push(`<p class="${sizes[h[1].length]} text-white mt-3 mb-1.5">${inline(h[2])}</p>`);
      i++; continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      out.push(`<div class="my-2 pl-3 border-l-2 border-accent/60 bg-accent/5 py-1 pr-2 rounded-r-lg text-slate-300 italic text-sm">${inline(line.slice(2))}</div>`);
      i++; continue;
    }

    // HR
    if (/^[-*_]{3,}$/.test(line.trim())) { out.push('<hr class="my-3 border-white/[0.07]" />'); i++; continue; }

    // Unordered list
    if (/^[-*+] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*+] /.test(lines[i])) { items.push(`<li>${inline(lines[i].slice(2))}</li>`); i++; }
      out.push(`<ul class="my-2 pl-4 space-y-1 list-disc text-slate-300 text-sm marker:text-accent">${items.join('')}</ul>`);
      continue;
    }

    // Ordered list
    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(`<li>${inline(lines[i].replace(/^\d+\. /,''))}</li>`); i++; }
      out.push(`<ol class="my-2 pl-4 space-y-1 list-decimal text-slate-300 text-sm">${items.join('')}</ol>`);
      continue;
    }

    // Table
    if (line.includes('|') && lines[i+1]?.match(/^[\s|:-]+$/)) {
      const headers = line.split('|').map((c)=>c.trim()).filter(Boolean);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes('|')) {
        const cells = lines[i].split('|').map((c)=>c.trim()).filter(Boolean);
        rows.push(`<tr class="border-b border-white/[0.04] hover:bg-white/[0.02]">${cells.map((c)=>`<td class="px-3 py-2 text-slate-300">${inline(c)}</td>`).join('')}</tr>`);
        i++;
      }
      out.push(`<div class="my-3 overflow-x-auto rounded-xl border border-white/[0.07]"><table class="w-full text-xs"><thead><tr class="bg-accent/10">${headers.map((h)=>`<th class="px-3 py-2 text-left text-accent-400 font-bold">${inline(h)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`);
      continue;
    }

    if (line.trim() === '') { i++; continue; }
    out.push(`<p class="text-sm text-slate-300 leading-relaxed mb-1">${inline(line)}</p>`);
    i++;
  }
  return out.join('\n');
}

export default function MarkdownRenderer({ content, className = '' }) {
  const html = useMemo(() => parseMd(content), [content]);
  return <div className={`md-body ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
