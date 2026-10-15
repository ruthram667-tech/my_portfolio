import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Markdown } from './markdown';

describe('Markdown', () => {
  it('renders headings, lists and links', () => {
    const html = renderToStaticMarkup(<Markdown source={'## Title\n\n- one\n- two\n\nSee [site](https://example.com)'} />);
    expect(html).toContain('<h2>Title</h2>');
    expect(html).toContain('<li>one</li>');
    expect(html).toContain('rel="noopener noreferrer"');
  });
  it('never injects raw HTML', () => {
    const html = renderToStaticMarkup(<Markdown source={'<script>alert(1)</script> and [x](javascript:alert(1))'} />);
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('href="javascript:');
  });
});
