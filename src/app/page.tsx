"use client";

import { Editor } from "@monaco-editor/react";
import { useState } from "react";

export default function Home() {
  const [filename, setFilename] = useState("");

  return (
    <div className="grid grid-cols-[1fr_300px] h-screen">
      <div className="h-full">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// Start coding here"
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true,
          }}
        />
      </div>
      <div className="border-l border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <div className="space-y-2">
          <label htmlFor="filename" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Filename
          </label>
          <input
            type="text"
            id="filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter filename"
          />
        </div>
      </div>
    </div>
  );
}
