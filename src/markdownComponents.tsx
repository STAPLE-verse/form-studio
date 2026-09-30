import type { Components } from "react-markdown"

/** react-markdown passes each element its AST `node`; drop it so it isn't spread onto the DOM. */
function domProps<P extends object>(props: P): Omit<P, "node"> {
  const rest: P & { node?: unknown } = { ...props }
  delete rest.node
  return rest
}

/**
 * Element styling for rendered Markdown, as plain Tailwind classes.
 *
 * Tailwind's reset strips the browser's heading, list and link styling, so
 * Markdown renders as flat text unless the host app happens to ship its own
 * `.markdown-display` CSS or the typography plugin's `prose` — STAPLE does,
 * MARKER doesn't. Styling each element here makes the preview look right in
 * any host without relying on either.
 */
export const markdownComponents: Components = {
  h1: (props) => <h3 className="text-2xl font-bold mt-4 mb-2" {...domProps(props)} />,
  h2: (props) => <h4 className="text-xl font-bold mt-4 mb-2" {...domProps(props)} />,
  h3: (props) => <h5 className="text-lg font-bold mt-3 mb-1" {...domProps(props)} />,
  h4: (props) => <h6 className="text-base font-bold mt-3 mb-1" {...domProps(props)} />,
  p: (props) => <p className="my-2 leading-relaxed" {...domProps(props)} />,
  ul: (props) => <ul className="list-disc list-outside pl-6 my-2" {...domProps(props)} />,
  ol: (props) => <ol className="list-decimal list-outside pl-6 my-2" {...domProps(props)} />,
  li: (props) => <li className="my-1" {...domProps(props)} />,
  a: (props) => (
    <a {...domProps(props)} target="_blank" rel="noopener noreferrer" className="text-primary underline" />
  ),
  blockquote: (props) => (
    <blockquote className="border-l-4 border-base-content/30 pl-4 my-2 italic" {...domProps(props)} />
  ),
  code: (props) => (
    <code className="bg-base-200 rounded px-1 py-0.5 font-mono text-[0.9em]" {...domProps(props)} />
  ),
  pre: (props) => (
    <pre
      className="bg-base-200 rounded-lg p-3 my-2 overflow-x-auto [&>code]:bg-transparent [&>code]:p-0"
      {...domProps(props)}
    />
  ),
  hr: (props) => <hr className="my-4 border-base-content/20" {...domProps(props)} />,
  table: (props) => (
    <div className="overflow-x-auto my-2">
      <table className="table text-base" {...domProps(props)} />
    </div>
  ),
}

/** Wrapper classes to pair with `markdownComponents`: trims the outer margins of the first and last block. */
export const MARKDOWN_WRAPPER_CLASS = "break-words [&>:first-child]:mt-0 [&>:last-child]:mb-0"
