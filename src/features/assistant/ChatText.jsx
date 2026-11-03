import React from 'react';
import { Link } from 'react-router-dom';

// Renders the assistant's small markdown subset as React elements (never as
// HTML): paragraphs, "- " bullet lists, **bold** and [links](url). App paths
// open in-app; only http(s) links leave the site.
const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g;

const Inline = ({ text, onNavigate }) =>
  text.split(INLINE).map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i}>{part.slice(2, -2)}</strong>;
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      const [, label, href] = link;
      if (href.startsWith('/') && !href.startsWith('//')) {
        return <Link key={i} to={href} onClick={onNavigate}>{label}</Link>;
      }
      if (/^https?:\/\//i.test(href)) {
        return <a key={i} href={href} target="_blank" rel="noopener noreferrer">{label}</a>;
      }
      return label;
    }
    return part;
  });

const ChatText = ({ text, onNavigate }) => {
  const blocks = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const item = /^[-*•]\s+(.*)$/.exec(line);
    const heading = /^#{1,6}\s+(.*)$/.exec(line);
    if (item) {
      const last = blocks.at(-1);
      if (last?.type === 'list') last.items.push(item[1]);
      else blocks.push({ type: 'list', items: [item[1]] });
    } else {
      blocks.push({ type: 'p', text: heading ? `**${heading[1]}**` : line });
    }
  }
  return blocks.map((b, i) =>
    b.type === 'list' ? (
      <ul key={i}>
        {b.items.map((it, j) => (
          <li key={j}><Inline text={it} onNavigate={onNavigate} /></li>
        ))}
      </ul>
    ) : (
      <p key={i}><Inline text={b.text} onNavigate={onNavigate} /></p>
    )
  );
};

export default ChatText;
