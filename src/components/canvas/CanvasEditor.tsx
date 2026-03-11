"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Canvas } from "@/types";

interface CanvasEditorProps {
  canvas: Canvas;
}

export function CanvasEditor({ canvas }: CanvasEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
    ],
    content: markdownToHtml(canvas.content),
    editable: canvas.status !== "approved",
    onUpdate: () => {
      // For prototype, we don't persist back
    },
    editorProps: {
      attributes: {
        class: "tiptap prose prose-sm max-w-none focus:outline-none p-6",
      },
    },
  });

  // Update editor content when canvas changes
  useEffect(() => {
    if (editor) {
      const newContent = markdownToHtml(canvas.content);
      editor.commands.setContent(newContent);
      editor.setEditable(canvas.status !== "approved");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas.id]);

  if (!editor) {
    return <div className="flex-1 p-6 text-gray-400">Loading editor...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <EditorContent editor={editor} />
    </div>
  );
}

function markdownToHtml(md: string): string {
  let html = md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");
  
  if (!html.startsWith("<")) html = `<p>${html}</p>`;
  return html;
}
