"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, ImageIcon } from "lucide-react";

export default function FileUpload({
  label = "Upload Files",
  multiple = true,
  accept = "*",
  onFiles,
}) {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const addFiles = (newFiles) => {
    const arr = Array.from(newFiles);
    const updated = multiple ? [...files, ...arr] : arr;
    setFiles(updated);
    if (onFiles) onFiles(updated);
  };

  const removeFile = (idx) => {
    const updated = files.filter((_, i) => i !== idx);
    setFiles(updated);
    if (onFiles) onFiles(updated);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragging
            ? "border-blue-400 bg-blue-50"
            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={24} className="mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-500 mt-1">
          Drag & drop or click to browse
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={accept}
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file, i) => (
            <li
              key={i}
              className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2"
            >
              {file.type.startsWith("image/") ? (
                <ImageIcon size={16} className="text-blue-500 shrink-0" />
              ) : (
                <FileText size={16} className="text-slate-400 shrink-0" />
              )}
              <span className="text-sm text-slate-700 truncate flex-1">
                {file.name}
              </span>
              <span className="text-xs text-slate-400">
                {(file.size / 1024).toFixed(0)} KB
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                className="p-1 hover:bg-slate-200 rounded transition-colors"
              >
                <X size={12} className="text-slate-500" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
