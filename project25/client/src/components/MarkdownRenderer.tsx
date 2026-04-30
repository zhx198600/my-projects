import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import DOMPurify from 'dompurify';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'strong', 'em', 'del', 'u', 's',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'img',
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: ['href', 'title', 'target'],
    img: ['src', 'alt', 'title'],
    code: ['className'],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ['http', 'https', 'mailto', 'tel'],
    src: ['http', 'https'],
  },
};

const MarkdownRenderer = ({ content, className = '' }: MarkdownRendererProps) => {
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: sanitizeSchema.tagNames,
    ALLOWED_ATTR: ['href', 'title', 'target', 'src', 'alt', 'className'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
  });

  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
        components={{
          h1: ({ children }) => <h1 className="markdown-h1">{children}</h1>,
          h2: ({ children }) => <h2 className="markdown-h2">{children}</h2>,
          h3: ({ children }) => <h3 className="markdown-h3">{children}</h3>,
          h4: ({ children }) => <h4 className="markdown-h4">{children}</h4>,
          h5: ({ children }) => <h5 className="markdown-h5">{children}</h5>,
          h6: ({ children }) => <h6 className="markdown-h6">{children}</h6>,
          p: ({ children }) => <p className="markdown-p">{children}</p>,
          strong: ({ children }) => <strong className="markdown-strong">{children}</strong>,
          em: ({ children }) => <em className="markdown-em">{children}</em>,
          del: ({ children }) => <del className="markdown-del">{children}</del>,
          a: ({ href, children, title }) => (
            <a
              href={href}
              title={title}
              target="_blank"
              rel="noopener noreferrer"
              className="markdown-link"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="markdown-ul">{children}</ul>,
          ol: ({ children }) => <ol className="markdown-ol">{children}</ol>,
          li: ({ children }) => <li className="markdown-li">{children}</li>,
          blockquote: ({ children }) => <blockquote className="markdown-blockquote">{children}</blockquote>,
          code: ({ className, children }) => {
            const isInline = !className;
            return isInline ? (
              <code className="markdown-inline-code">{children}</code>
            ) : (
              <code className="markdown-code">{children}</code>
            );
          },
          pre: ({ children }) => <pre className="markdown-pre">{children}</pre>,
          table: ({ children }) => <table className="markdown-table">{children}</table>,
          thead: ({ children }) => <thead className="markdown-thead">{children}</thead>,
          tbody: ({ children }) => <tbody className="markdown-tbody">{children}</tbody>,
          tr: ({ children }) => <tr className="markdown-tr">{children}</tr>,
          th: ({ children }) => <th className="markdown-th">{children}</th>,
          td: ({ children }) => <td className="markdown-td">{children}</td>,
          hr: () => <hr className="markdown-hr" />,
          img: ({ src, alt, title }) => (
            <img src={src} alt={alt} title={title} className="markdown-img" loading="lazy" />
          ),
        }}
      >
        {sanitizedContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
