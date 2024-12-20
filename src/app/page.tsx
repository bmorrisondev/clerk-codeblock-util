"use client";

import { Editor, useMonaco } from "@monaco-editor/react";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [filename, setFilename] = useState("");
  const [markedInLines, setMarkedInLines] = useState<number[]>([]);
  const [markedOutLines, setMarkedOutLines] = useState<number[]>([]);
  const editorRef = useRef<any>(null);
  const monaco = useMonaco();

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // Add context menu items
    editor.addAction({
      id: 'markLineIn',
      label: 'Mark Line In',
      contextMenuGroupId: 'navigation',
      run: (editor: any) => {
        const selections = editor.getSelections();
        const newLines = selections.flatMap((selection: any) => {
          const startLine = selection.startLineNumber;
          const endLine = selection.endLineNumber;
          return Array.from(
            { length: endLine - startLine + 1 },
            (_, i) => startLine + i
          );
        });
        
        setMarkedInLines(prevLines => {
          const uniqueNewLines = newLines.filter((line: any) => !prevLines.includes(line));
          return uniqueNewLines.length > 0 
            ? [...prevLines, ...uniqueNewLines].sort((a, b) => a - b)
            : prevLines;
        });
      }
    });

    editor.addAction({
      id: 'markLineOut',
      label: 'Mark Line Out',
      contextMenuGroupId: 'navigation',
      run: (editor: any) => {
        const selections = editor.getSelections();
        const newLines = selections.flatMap((selection: any) => {
          const startLine = selection.startLineNumber;
          const endLine = selection.endLineNumber;
          return Array.from(
            { length: endLine - startLine + 1 },
            (_, i) => startLine + i
          );
        });
        
        setMarkedOutLines(prevLines => {
          const uniqueNewLines = newLines.filter((line: any) => !prevLines.includes(line));
          return uniqueNewLines.length > 0 
            ? [...prevLines, ...uniqueNewLines].sort((a, b) => a - b)
            : prevLines;
        });
      }
    });
  };

  // Update decorations whenever marked lines change
  useEffect(() => {
    if (editorRef.current && monaco) {
      const inDecorations = markedInLines.map(lineNumber => ({
        range: new monaco.Range(lineNumber, 1, lineNumber, 1),
        options: {
          isWholeLine: true,
          className: 'marked-line-in',
          linesDecorationsClassName: 'marked-line-in-gutter'
        }
      }));

      const outDecorations = markedOutLines.map(lineNumber => ({
        range: new monaco.Range(lineNumber, 1, lineNumber, 1),
        options: {
          isWholeLine: true,
          className: 'marked-line-out',
          linesDecorationsClassName: 'marked-line-out-gutter'
        }
      }));

      editorRef.current.deltaDecorations([], [...inDecorations, ...outDecorations]);
    }
  }, [markedInLines, markedOutLines, monaco]);

  const removeMarkedLine = (type: 'in' | 'out', lineNumber: number) => {
    if (type === 'in') {
      setMarkedInLines(prevLines => prevLines.filter(line => line !== lineNumber));
    } else {
      setMarkedOutLines(prevLines => prevLines.filter(line => line !== lineNumber));
    }
  };

  const getSequentialArrays = (numbers: number[]): (number | number[])[] => {
    if (numbers.length === 0) return [];
    
    const result: (number | number[])[] = [];
    let start = numbers[0];
    let prev = start;
    let sequenceLength = 1;

    for (let i = 1; i <= numbers.length; i++) {
      const current = numbers[i];
      if (current === prev + 1) {
        sequenceLength++;
      } else {
        if (sequenceLength > 2) {
          result.push([start, prev]);
        } else {
          for (let j = 0; j < sequenceLength; j++) {
            result.push(start + j);
          }
        }
        start = current;
        sequenceLength = 1;
      }
      prev = current;
    }
    return result;
  };

  const copyToClipboard = () => {
    const data = {
      filename,
      ins: getSequentialArrays(markedInLines),
      del: getSequentialArrays(markedOutLines)
    };
    navigator.clipboard.writeText(`{{ ${JSON.stringify(data).replace(/[:,]/g, '$& ')} }}`);
  };

  return (
    <>
      <style jsx global>{`
        .marked-line-in {
          background: rgba(0, 255, 0, 0.1);
        }
        .marked-line-out {
          background: rgba(255, 0, 0, 0.1);
        }
        .marked-line-in-gutter {
          background: rgba(0, 255, 0, 0.3);
          width: 5px !important;
          margin-left: 3px;
        }
        .marked-line-out-gutter {
          background: rgba(255, 0, 0, 0.3);
          width: 5px !important;
          margin-left: 3px;
        }
      `}</style>
      <div className="grid grid-cols-[1fr_300px] h-screen">
        <div className="h-full">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            defaultValue="// Start coding here"
            theme="vs-dark"
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: false,
              automaticLayout: true,
              contextmenu: true,
            }}
          />
        </div>
        <div className="border-l border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 overflow-y-auto">
          <div className="space-y-4">
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
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Marked Lines In</h3>
              <div className="space-y-1">
                {markedInLines.map(line => (
                  <div key={`in-${line}`} className="flex items-center justify-between text-sm">
                    <span className="text-green-600 dark:text-green-400">Line {line}</span>
                    <button
                      onClick={() => removeMarkedLine('in', line)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Marked Lines Out</h3>
              <div className="space-y-1">
                {markedOutLines.map(line => (
                  <div key={`out-${line}`} className="flex items-center justify-between text-sm">
                    <span className="text-red-600 dark:text-red-400">Line {line}</span>
                    <button
                      onClick={() => removeMarkedLine('out', line)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={copyToClipboard}
              className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Copy JSON to Clipboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
