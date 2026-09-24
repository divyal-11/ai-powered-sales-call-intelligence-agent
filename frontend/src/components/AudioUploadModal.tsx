"use client";

import { useState, useRef, useCallback } from "react";
import { uploadAudioCall, submitTextTranscript } from "../lib/api";

interface AudioUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newTranscriptId: string) => void;
}

type InputMode = "audio" | "text";

export default function AudioUploadModal({ isOpen, onClose, onUploadSuccess }: AudioUploadModalProps) {
  const [mode, setMode] = useState<InputMode>("audio");
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState("");
  const [company, setCompany] = useState("");
  const [prospect, setProspect] = useState("");
  const [caller, setCaller] = useState("StoneForge Sales Rep");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textFileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = useCallback(() => {
    setFile(null);
    setTextContent("");
    setCompany("");
    setProspect("");
    setCaller("StoneForge Sales Rep");
    setError(null);
    setMode("audio");
  }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (mode === "audio") {
        setFile(droppedFile);
      } else {
        // Text mode: read .txt file contents
        readTextFile(droppedFile);
      }
    }
  };

  const readTextFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === "string") {
        setTextContent(content);
        setFile(f); // store reference for file name display
      }
    };
    reader.onerror = () => setError("Failed to read the text file");
    reader.readAsText(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "audio" && !file) {
      setError("Select an audio recording (.m4a, .mp3, .wav)");
      return;
    }
    if (mode === "text" && !textContent.trim()) {
      setError("Paste or drop a transcript to analyze");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const meta = {
        company: company.trim() || undefined,
        prospect: prospect.trim() || undefined,
        caller: caller.trim() || undefined,
      };

      let resultId: string;

      if (mode === "audio") {
        const result = await uploadAudioCall(file!, meta);
        resultId = result.transcriptId;
      } else {
        const result = await submitTextTranscript(textContent.trim(), meta);
        resultId = result.transcriptId;
      }

      onUploadSuccess(resultId);
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.message || "Upload and analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: "var(--bg-primary)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-sm)",
    padding: "0.5rem 0.75rem",
    color: "var(--text-primary)",
    fontSize: "0.82rem",
    fontFamily: "var(--font-sans)",
    outline: "none",
    transition: "border-color var(--transition-fast)",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "480px",
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          padding: "1.75rem",
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.4)",
        }}
      >
        {/* Modal Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>New Call</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "1.1rem",
              cursor: "pointer",
              padding: "0.25rem",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Mode Switcher */}
        <div style={{
          display: "flex",
          gap: "0",
          marginTop: "1.25rem",
          backgroundColor: "var(--bg-primary)",
          borderRadius: "var(--radius-sm)",
          padding: "3px",
        }}>
          {(["audio", "text"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setFile(null); setTextContent(""); setError(null); }}
              disabled={loading}
              style={{
                flex: 1,
                padding: "0.4rem 0",
                backgroundColor: mode === m ? "var(--bg-surface-elevated)" : "transparent",
                border: "none",
                borderRadius: "4px",
                color: mode === m ? "var(--text-primary)" : "var(--text-muted)",
                fontSize: "0.78rem",
                fontWeight: mode === m ? 500 : 400,
                fontFamily: "var(--font-sans)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
            >
              {m === "audio" ? "Audio File" : "Paste Text"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: "1.25rem" }}>
          {/* Audio Dropzone */}
          {mode === "audio" && (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              style={{
                border: `1px dashed ${dragActive ? "var(--accent-orange)" : "var(--border-subtle)"}`,
                backgroundColor: dragActive ? "var(--accent-orange-muted)" : "transparent",
                borderRadius: "var(--radius-md)",
                padding: "2rem 1rem",
                textAlign: "center",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all var(--transition-fast)",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.m4a,.mp3,.wav,.ogg"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files?.[0]) setFile(e.target.files[0]);
                }}
              />
              {file ? (
                <div>
                  <p style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--text-primary)" }}>{file.name}</p>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    {(file.size / (1024 * 1024)).toFixed(2)} MB · Click to change
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                    Drop audio file or click to browse
                  </p>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    .m4a, .mp3, .wav up to 25MB
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Text Input */}
          {mode === "text" && (
            <div>
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragActive(false);
                  if (e.dataTransfer.files?.[0]) {
                    readTextFile(e.dataTransfer.files[0]);
                  }
                }}
              >
                <textarea
                  placeholder="Paste call transcript or chat text here..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  disabled={loading}
                  rows={8}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    minHeight: "140px",
                    lineHeight: 1.6,
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--text-muted)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => textFileInputRef.current?.click()}
                  disabled={loading}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-secondary)",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    padding: 0,
                    textDecoration: "underline",
                    textDecorationColor: "var(--border-subtle)",
                    textUnderlineOffset: "2px",
                  }}
                >
                  or upload a .txt file
                </button>
                <input
                  ref={textFileInputRef}
                  type="file"
                  accept=".txt,text/plain"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    if (e.target.files?.[0]) readTextFile(e.target.files[0]);
                  }}
                />
                {textContent && (
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    {textContent.length.toLocaleString()} chars
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Metadata Inputs */}
          <div style={{ marginTop: "1rem", display: "grid", gap: "0.75rem" }}>
            <div>
              <label className="label-muted" style={{ display: "block", marginBottom: "0.3rem" }}>
                COMPANY
              </label>
              <input
                type="text"
                placeholder="e.g. DLF CyberCity, Sobha Developers"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={loading}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--text-muted)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label className="label-muted" style={{ display: "block", marginBottom: "0.3rem" }}>
                  PROSPECT
                </label>
                <input
                  type="text"
                  placeholder="e.g. VP Engineering"
                  value={prospect}
                  onChange={(e) => setProspect(e.target.value)}
                  disabled={loading}
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--text-muted)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
                />
              </div>
              <div>
                <label className="label-muted" style={{ display: "block", marginBottom: "0.3rem" }}>
                  SALES REP
                </label>
                <input
                  type="text"
                  placeholder="StoneForge Sales Rep"
                  value={caller}
                  onChange={(e) => setCaller(e.target.value)}
                  disabled={loading}
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--text-muted)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p style={{ marginTop: "0.75rem", color: "#EF4444", fontSize: "0.78rem" }}>
              {error}
            </p>
          )}

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.25rem" }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              style={{
                backgroundColor: "transparent",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
                padding: "0.45rem 1rem",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                fontSize: "0.82rem",
                fontFamily: "var(--font-sans)",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? "var(--bg-surface-elevated)" : "var(--accent-orange)",
                color: loading ? "var(--text-muted)" : "#FFFFFF",
                fontWeight: 600,
                border: "none",
                padding: "0.45rem 1.25rem",
                borderRadius: "var(--radius-sm)",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "0.82rem",
                fontFamily: "var(--font-sans)",
                transition: "all var(--transition-fast)",
              }}
            >
              {loading
                ? (mode === "audio" ? "Transcribing & analyzing..." : "Analyzing...")
                : "Upload & Analyze"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
