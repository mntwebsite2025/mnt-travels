"use client";

import dynamic from "next/dynamic";
import React, { useMemo } from "react";
import "react-quill/dist/quill.snow.css";

// Create a polyfill for findDOMNode without importing it
if (typeof window !== 'undefined') {
  const ReactDOM = require('react-dom');
  if (!ReactDOM.findDOMNode) {
    ReactDOM.findDOMNode = (instance: any) => {
      if (!instance) return null;
      try {
        if (typeof instance.getEditor === "function") {
          const editor = instance.getEditor();
          if (editor && editor.root) return editor.root as HTMLElement;
        }
        if (instance instanceof HTMLElement) return instance;
        if (instance.editor && instance.editor.root) return instance.editor.root;
      } catch (e) {
        return null;
      }
      return null;
    };
  }
}

// Dynamically import react-quill default export to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill").then((m) => (m as any).default), {
  ssr: false,
  loading: () => (
    <div className="border rounded-md p-3 min-h-[200px] bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-500 text-sm">Loading editor...</p>
      </div>
    </div>
  ),
});

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  modules?: any;
  formats?: string[];
  placeholder?: string;
};

export default function RichTextEditor({
  value,
  onChange,
  modules,
  formats,
  placeholder,
}: RichTextEditorProps) {
  // Default modules for the editor
  const defaultModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ],
  }), []);

  const defaultFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'color', 'background', 'link'
  ];

  const Q = ReactQuill as any;
  return (
    <div className="rich-text-editor-wrapper">
      <Q
        value={value || ''}
        onChange={onChange}
        modules={modules || defaultModules}
        formats={formats || defaultFormats}
        placeholder={placeholder || 'Enter description...'}
        theme="snow"
        style={{
          backgroundColor: 'white',
          borderRadius: '6px',
        }}
      />
    </div>
  );
}
