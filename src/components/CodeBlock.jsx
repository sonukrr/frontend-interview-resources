import { useMemo, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx';

export default function CodeBlock({ code, lang = 'jsx' }) {
  const [copied, setCopied] = useState(false);

  const html = useMemo(() => {
    const grammar = Prism.languages[lang] || Prism.languages.javascript;
    return Prism.highlight(code, grammar, lang);
  }, [code, lang]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  return (
    <div className="codeblock-wrap">
      <button className="copy-btn" onClick={copy}>
        {copied ? 'Copied ✓' : 'Copy'}
      </button>
      <pre className="code-block" data-lang={lang}>
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}
