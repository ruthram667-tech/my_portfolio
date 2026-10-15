import { Fragment, type ReactNode } from 'react';

/** Small, safe Markdown renderer (no raw HTML is ever injected). Supports headings, lists, code, quotes, links, bold, italic. */
const inline = (text: string): ReactNode[] => {
  const out: ReactNode[] = [];
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    if (m[1]) out.push(<code key={i++}>{t.slice(1, -1)}</code>);
    else if (m[2]) out.push(<strong key={i++}>{t.slice(2, -2)}</strong>);
    else if (m[3]) out.push(<em key={i++}>{t.slice(1, -1)}</em>);
    else {
      const label = t.slice(1, t.indexOf(']'));
      const href = m[5]!;
      out.push(
        <a key={i++} href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {label}
        </a>,
      );
    }
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
};

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let k = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    if (!line.trim()) { i++; continue; }
    if (line.startsWith('```')) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.startsWith('```')) buf.push(lines[i++]!);
      i++;
      blocks.push(<pre key={k++}><code>{buf.join('\n')}</code></pre>);
      continue;
    }
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1]!.length;
      blocks.push(level === 1 ? <h2 key={k++}>{inline(h[2]!)}</h2> : level === 2 ? <h2 key={k++}>{inline(h[2]!)}</h2> : <h3 key={k++}>{inline(h[2]!)}</h3>);
      i++;
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i]!)) items.push(lines[i++]!.replace(/^\s*[-*]\s+/, ''));
      blocks.push(<ul key={k++}>{items.map((t, j) => <li key={j}>{inline(t)}</li>)}</ul>);
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i]!)) items.push(lines[i++]!.replace(/^\s*\d+\.\s+/, ''));
      blocks.push(<ol key={k++}>{items.map((t, j) => <li key={j}>{inline(t)}</li>)}</ol>);
      continue;
    }
    if (line.startsWith('>')) {
      const buf: string[] = [];
      while (i < lines.length && lines[i]!.startsWith('>')) buf.push(lines[i++]!.replace(/^>\s?/, ''));
      blocks.push(<blockquote key={k++}>{inline(buf.join(' '))}</blockquote>);
      continue;
    }
    const buf: string[] = [];
    while (i < lines.length && lines[i]!.trim() && !/^(#{1,3}\s|```|>|\s*[-*]\s+|\s*\d+\.\s+)/.test(lines[i]!)) buf.push(lines[i++]!);
    blocks.push(<p key={k++}>{inline(buf.join(' '))}</p>);
  }
  return <div className="prose-md">{blocks.map((b, idx) => <Fragment key={idx}>{b}</Fragment>)}</div>;
}
