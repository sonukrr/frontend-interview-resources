import { useMemo } from 'react';
import { Marked } from 'marked';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';

function highlight(code, lang) {
  const grammar =
    Prism.languages[lang] ||
    Prism.languages[{ js: 'javascript', shell: 'bash' }[lang]] ||
    null;
  if (!grammar) return null;
  return Prism.highlight(code, grammar, lang);
}

const marked = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    code(token) {
      // marked v12 passes a token object; older versions pass (code, infostring)
      const code = typeof token === 'string' ? token : token.text;
      const lang = (typeof token === 'string' ? arguments[1] : token.lang) || '';
      const html = highlight(code, lang);
      if (html) {
        return `<pre class="code-block" data-lang="${lang}"><code class="language-${lang}">${html}</code></pre>`;
      }
      const escaped = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<pre class="code-block" data-lang="${lang || 'text'}"><code>${escaped}</code></pre>`;
    },
  },
});

export default function Markdown({ children, className = '' }) {
  const html = useMemo(() => marked.parse(children || ''), [children]);
  return (
    <div
      className={`markdown ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
