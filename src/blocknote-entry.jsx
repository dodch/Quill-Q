import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom/client";
import { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import "@mantine/core/styles.css";
import "@blocknote/core/style.css";
import "@blocknote/mantine/style.css";

/**
 * Helper to check if an editor instance can perform undo.
 */
function checkCanUndo(ed) {
  if (!ed) return false;
  try {
    if (ed._stateManager && typeof ed._stateManager.can === "function") {
      return Boolean(ed._stateManager.can(() => ed.undo()));
    }
  } catch (e) {}
  return false;
}

/**
 * Helper to check if an editor instance can perform redo.
 */
function checkCanRedo(ed) {
  if (!ed) return false;
  try {
    if (ed._stateManager && typeof ed._stateManager.can === "function") {
      return Boolean(ed._stateManager.can(() => ed.redo()));
    }
  } catch (e) {}
  return false;
}

/**
 * Draws a 5-pointed star onto a canvas context.
 */
function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, fill, stroke, strokeWidth) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();

  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth || 1.5;
    ctx.stroke();
  }
}

/**
 * Renders an individual vector stroke or stamp on the page canvas.
 */
function renderSingleStroke(ctx, stroke, width, height) {
  if (!stroke) return;
  const baseScale = width / 816; // 816 is standard universal A4 sheet width

  if (stroke.type === "stamp") {
    const x = stroke.pos.x * width;
    const y = stroke.pos.y * height;
    const s = Math.max(16, (stroke.size || 4) * 5 * baseScale);

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (stroke.stampType === "check") {
      ctx.strokeStyle = stroke.color || "#e03131";
      ctx.lineWidth = Math.max(2.5, 3.5 * baseScale);
      ctx.beginPath();
      ctx.moveTo(x - s * 0.5, y);
      ctx.lineTo(x - s * 0.1, y + s * 0.5);
      ctx.lineTo(x + s * 0.7, y - s * 0.6);
      ctx.stroke();
    } else if (stroke.stampType === "cross") {
      ctx.strokeStyle = stroke.color || "#e03131";
      ctx.lineWidth = Math.max(2.5, 3.5 * baseScale);
      ctx.beginPath();
      ctx.moveTo(x - s * 0.5, y - s * 0.5);
      ctx.lineTo(x + s * 0.5, y + s * 0.5);
      ctx.moveTo(x + s * 0.5, y - s * 0.5);
      ctx.lineTo(x - s * 0.5, y + s * 0.5);
      ctx.stroke();
    } else if (stroke.stampType === "star") {
      drawStar(ctx, x, y, 5, s * 0.7, s * 0.35, "#f59f00", "#e67700", 2 * baseScale);
    }
    ctx.restore();
    return;
  }

  // Freehand path
  const pts = stroke.points;
  if (!pts || pts.length === 0) return;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (stroke.isEraser) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)";
    ctx.lineWidth = Math.max(14, (stroke.size || 4) * 4 * baseScale);
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = stroke.color || "#e03131";
    ctx.lineWidth = Math.max(1.8, (stroke.size || 3.5) * baseScale);
  }

  const px = pts.map((p) => ({ x: p.x * width, y: p.y * height }));

  if (px.length === 1) {
    ctx.beginPath();
    ctx.arc(px[0].x, px[0].y, ctx.lineWidth / 2, 0, Math.PI * 2);
    if (stroke.isEraser) {
      ctx.fillStyle = "rgba(0,0,0,1)";
    } else {
      ctx.fillStyle = ctx.strokeStyle;
    }
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(px[0].x, px[0].y);

  for (let i = 1; i < px.length - 1; i++) {
    const mx = (px[i].x + px[i + 1].x) / 2;
    const my = (px[i].y + px[i + 1].y) / 2;
    ctx.quadraticCurveTo(px[i].x, px[i].y, mx, my);
  }

  const last = px[px.length - 1];
  const prev = px[px.length - 2];
  ctx.quadraticCurveTo(prev.x, prev.y, last.x, last.y);
  ctx.stroke();
  ctx.restore();
}

/**
 * Canvas layer mounted directly over an A4 sheet for freehand handwriting / teacher red marks.
 */
function PageAnnotationCanvas({
  pageId,
  strokes = [],
  penActive = false,
  penTool = "pen",
  penColor = "#e03131",
  penSize = 3.5,
  onAddStroke
}) {
  const canvasRef = useRef(null);
  const activeStrokeRef = useRef(null);
  const isDrawingRef = useRef(false);

  const redrawAllStrokes = useCallback((canvas, currentStrokes, inProgressStroke = null) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width === 0 || height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    const list = [...(currentStrokes || [])];
    if (inProgressStroke) {
      list.push(inProgressStroke);
    }

    for (const stroke of list) {
      renderSingleStroke(ctx, stroke, width, height);
    }
    ctx.restore();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ro = new ResizeObserver(() => {
      redrawAllStrokes(canvas, strokes);
    });

    ro.observe(canvas);
    redrawAllStrokes(canvas, strokes);

    return () => ro.disconnect();
  }, [strokes, redrawAllStrokes]);

  const handlePointerDown = (e) => {
    if (!penActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (err) {}
    isDrawingRef.current = true;

    const rect = canvas.getBoundingClientRect();
    const nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const ny = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    if (penTool === "check" || penTool === "cross" || penTool === "star") {
      const stampStroke = {
        id: "stamp-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
        type: "stamp",
        stampType: penTool,
        color: penTool === "star" ? "#f59f00" : penColor,
        size: penSize,
        pos: { x: nx, y: ny }
      };
      if (onAddStroke) onAddStroke(pageId, stampStroke);
      isDrawingRef.current = false;
      return;
    }

    // Freehand Pen or Eraser
    activeStrokeRef.current = {
      id: "stroke-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      type: "stroke",
      isEraser: penTool === "eraser",
      color: penColor,
      size: penSize,
      points: [{ x: nx, y: ny }]
    };

    redrawAllStrokes(canvas, strokes, activeStrokeRef.current);
  };

  const handlePointerMove = (e) => {
    if (!penActive || !isDrawingRef.current || !activeStrokeRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const ny = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const pts = activeStrokeRef.current.points;
    const lastPt = pts[pts.length - 1];
    const distSq = (nx - lastPt.x) ** 2 + (ny - lastPt.y) ** 2;
    if (distSq > 0.000004) {
      pts.push({ x: nx, y: ny });
      redrawAllStrokes(canvas, strokes, activeStrokeRef.current);
    }
  };

  const handlePointerUp = (e) => {
    if (!penActive || !isDrawingRef.current) return;
    isDrawingRef.current = false;

    const canvas = canvasRef.current;
    try {
      if (canvas && canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }
    } catch (err) {}

    const completed = activeStrokeRef.current;
    activeStrokeRef.current = null;

    if (completed && completed.points && completed.points.length > 0) {
      if (onAddStroke) onAddStroke(pageId, completed);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className={`a4-pen-canvas ${penActive ? "pen-active" : "pen-idle"} tool-${penTool}`}
      id={`a4-pen-canvas-${pageId}`}
      data-page-id={pageId}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  );
}

/**
 * Single A4 Page Sheet Component
 * Houses an isolated BlockNoteEditor instance inside a universal A4 styled paper container.
 */
function A4PageSheet({
  page,
  index,
  totalPages,
  docTitle,
  subjectName,
  onEditorCreated,
  onPageChange,
  onEditorActive,
  onDeletePage,
  onAddPageAfter,
  editable = true,
  uploadFile,
  strokes = [],
  penActive = false,
  penTool = "pen",
  penColor = "#e03131",
  penSize = 3.5,
  onAddStroke
}) {
  const [editor, setEditor] = useState(null);
  const editorRef = useRef(null);

  useEffect(() => {
    let initialBlocks = undefined;
    if (page.blocks && Array.isArray(page.blocks) && page.blocks.length > 0) {
      initialBlocks = page.blocks;
    }

    const editorOptions = {
      initialContent: initialBlocks
    };

    const activeUploadFile = typeof uploadFile === "function" 
      ? uploadFile 
      : (typeof window !== "undefined" && typeof window.handleBlockNoteUploadFile === "function" 
          ? window.handleBlockNoteUploadFile 
          : null);

    if (activeUploadFile) {
      editorOptions.uploadFile = activeUploadFile;
    }

    const ed = BlockNoteEditor.create(editorOptions);

    setEditor(ed);
    editorRef.current = ed;
    onEditorCreated(page.id, ed);

    const unsubs = [];
    if (editable) {
      unsubs.push(
        ed.onChange(() => {
          onPageChange(page.id, ed);
          if (onEditorActive) onEditorActive(page.id, ed);
        })
      );

      if (typeof ed.onSelectionChange === "function") {
        unsubs.push(
          ed.onSelectionChange(() => {
            if (onEditorActive) onEditorActive(page.id, ed);
          })
        );
      }

      if (typeof ed.onFocusChange === "function") {
        unsubs.push(
          ed.onFocusChange((_ed, { focused }) => {
            if (focused && onEditorActive) onEditorActive(page.id, _ed);
          })
        );
      }
    }

    return () => {
      unsubs.forEach((fn) => {
        if (typeof fn === "function") fn();
      });
    };
  }, [page.id, editable]);

  const handleContainerActivate = () => {
    if (editor && onEditorActive) {
      onEditorActive(page.id, editor);
    }
  };

  return (
    <div
      className="a4-page-container"
      id={`a4-page-wrapper-${page.id}`}
      onFocusCapture={handleContainerActivate}
      onPointerDownCapture={handleContainerActivate}
    >
      {/* Individual A4 Universal Sheet */}
      <article className="a4-page-sheet" id={`a4-page-${page.id}`} data-page-id={page.id}>
        {/* Running Header */}
        <header className="a4-running-header">
          <div className="a4-header-left">
            <span className="a4-header-title">{docTitle || "Untitled Document"}</span>
            {subjectName && <span className="a4-header-sep">•</span>}
            {subjectName && <span className="a4-header-subject">{subjectName}</span>}
          </div>
          <div className="a4-header-right">
            {totalPages > 1 && editable && (
              <button
                type="button"
                className="a4-btn-remove-page"
                title="Delete this page"
                onClick={() => onDeletePage(page.id, index)}
              >
                <i className="fi fi-rr-trash"></i>
              </button>
            )}
          </div>
        </header>

        {/* Editor Body */}
        <div className="a4-page-body">
          {editor ? (
            <BlockNoteView editor={editor} editable={editable} theme="light" />
          ) : (
            <div className="a4-loading-placeholder">
              <i className="fi fi-rr-spinner fi-spin"></i> Loading A4 page canvas...
            </div>
          )}
        </div>

        {/* Running Footer */}
        <footer className="a4-running-footer">
          <div className="a4-footer-left">
            <span className="a4-watermark">Quill-Q • English Business</span>
          </div>
          <div className="a4-footer-right">
            <span>Page {index + 1} of {totalPages}</span>
          </div>
        </footer>

        {/* Teacher Annotation Canvas Overlay */}
        <PageAnnotationCanvas
          pageId={page.id}
          strokes={strokes}
          penActive={penActive}
          penTool={penTool}
          penColor={penColor}
          penSize={penSize}
          onAddStroke={onAddStroke}
        />
      </article>

      {/* Visual Page Break / Add Page Divider (Screen only) */}
      {editable && (
        <div className="a4-page-break-divider">
          <div className="a4-divider-line"></div>
          <button
            type="button"
            className="a4-btn-insert-page"
            onClick={() => onAddPageAfter(index)}
            title="Insert a new A4 page below"
          >
            <i className="fi fi-rr-plus"></i>
            <span>Insert Page Below</span>
          </button>
          <div className="a4-divider-line"></div>
        </div>
      )}
    </div>
  );
}

/**
 * Floating Multi-Selection Action Toolbar
 * Allows coloring, highlighting, and formatting multiple disjoint text selections at once.
 */
function MultiSelectToolbar({ selections = [], onApply, onClear }) {
  if (!selections || selections.length === 0) return null;

  return (
    <div className="multi-select-toolbar" role="toolbar" aria-label="Multi-Selection Formatting Controls">
      <div className="multi-select-badge" title="Hold Ctrl and select text to add more items">
        <i className="fi fi-rr-checkbox"></i>
        <span>{selections.length} Selected</span>
      </div>

      <div className="multi-select-sep"></div>

      {/* Highlight Color Swatches */}
      <span className="multi-select-label">Highlight:</span>
      <div className="multi-select-colors">
        <button
          type="button"
          className="ms-color-btn"
          style={{ background: "#fff3bf", borderColor: "#fab005" }}
          onClick={() => onApply({ backgroundColor: "yellow" })}
          title="Highlight Yellow"
        />
        <button
          type="button"
          className="ms-color-btn"
          style={{ background: "#d3f9d8", borderColor: "#40c057" }}
          onClick={() => onApply({ backgroundColor: "green" })}
          title="Highlight Green"
        />
        <button
          type="button"
          className="ms-color-btn"
          style={{ background: "#d0ebff", borderColor: "#228be6" }}
          onClick={() => onApply({ backgroundColor: "blue" })}
          title="Highlight Blue"
        />
        <button
          type="button"
          className="ms-color-btn"
          style={{ background: "#ffdeeb", borderColor: "#f06595" }}
          onClick={() => onApply({ backgroundColor: "pink" })}
          title="Highlight Pink"
        />
        <button
          type="button"
          className="ms-color-btn"
          style={{ background: "#ffe8cc", borderColor: "#fd7e14" }}
          onClick={() => onApply({ backgroundColor: "orange" })}
          title="Highlight Orange"
        />
        <button
          type="button"
          className="ms-color-btn"
          style={{ background: "#eebefa", borderColor: "#be4bdb" }}
          onClick={() => onApply({ backgroundColor: "purple" })}
          title="Highlight Purple"
        />
        <button
          type="button"
          className="ms-color-btn ms-clear-color"
          onClick={() => onApply({ backgroundColor: "default" })}
          title="Remove Highlight"
        >
          <i className="fi fi-rr-cross-small"></i>
        </button>
      </div>

      <div className="multi-select-sep"></div>

      {/* Text Ink Color Swatches */}
      <span className="multi-select-label">Ink:</span>
      <div className="multi-select-colors">
        <button
          type="button"
          className="ms-color-btn"
          style={{ background: "#e03131", borderColor: "#c92a2a" }}
          onClick={() => onApply({ textColor: "red" })}
          title="Red Text"
        />
        <button
          type="button"
          className="ms-color-btn"
          style={{ background: "#1971c2", borderColor: "#1864ab" }}
          onClick={() => onApply({ textColor: "blue" })}
          title="Blue Text"
        />
        <button
          type="button"
          className="ms-color-btn"
          style={{ background: "#2f9e44", borderColor: "#2b8a3e" }}
          onClick={() => onApply({ textColor: "green" })}
          title="Green Text"
        />
        <button
          type="button"
          className="ms-color-btn ms-clear-color"
          onClick={() => onApply({ textColor: "default" })}
          title="Reset Text Color"
        >
          <i className="fi fi-rr-cross-small"></i>
        </button>
      </div>

      <div className="multi-select-sep"></div>

      {/* Quick Formatting */}
      <button
        type="button"
        className="ms-action-btn"
        onClick={() => onApply({ bold: true })}
        title="Make all selected bold"
      >
        <i className="fi fi-rr-bold"></i>
      </button>
      <button
        type="button"
        className="ms-action-btn"
        onClick={() => onApply({ italic: true })}
        title="Make all selected italic"
      >
        <i className="fi fi-rr-italic"></i>
      </button>

      <div className="multi-select-sep"></div>

      <button
        type="button"
        className="ms-action-btn ms-btn-cancel"
        onClick={onClear}
        title="Clear multi-selection (Esc)"
      >
        <i className="fi fi-rr-cross"></i>
        <span>Clear</span>
      </button>
    </div>
  );
}

/**
 * Floating Quick Highlighter Toolbar
 * When active, selecting any text automatically highlights it with the chosen color.
 */
function HighlighterToolbar({ activeColor = "yellow", onSelectColor, onDone }) {
  const colors = [
    { id: "yellow", bg: "#fff3bf", border: "#fab005", label: "Yellow" },
    { id: "green", bg: "#d3f9d8", border: "#40c057", label: "Green" },
    { id: "blue", bg: "#d0ebff", border: "#228be6", label: "Blue" },
    { id: "pink", bg: "#ffdeeb", border: "#f06595", label: "Pink" },
    { id: "orange", bg: "#ffe8cc", border: "#fd7e14", label: "Orange" },
    { id: "purple", bg: "#eebefa", border: "#be4bdb", label: "Purple" }
  ];

  return (
    <div className="multi-select-toolbar highlighter-active-toolbar" role="toolbar" aria-label="Quick Highlighter Active">
      <div className="multi-select-badge" style={{ background: "#fff9db" }}>
        <i className="fi fi-rr-marker" style={{ color: "#f59f00" }}></i>
        <span>Highlighter Active</span>
      </div>

      <div className="multi-select-sep"></div>

      <div className="multi-select-colors">
        {colors.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`ms-color-btn ${activeColor === c.id ? "active" : ""}`}
            style={{
              background: c.bg,
              borderColor: c.border,
              boxShadow: activeColor === c.id ? `0 0 0 2px #1a1816, 0 0 0 4px ${c.border}` : undefined,
              transform: activeColor === c.id ? "scale(1.18)" : undefined
            }}
            onClick={() => onSelectColor(c.id)}
            title={`Highlight in ${c.label}`}
          />
        ))}
      </div>

      <div className="multi-select-sep"></div>

      <button
        type="button"
        className="pen-btn-done"
        onClick={onDone}
        title="Finish Highlighting (Esc)"
      >
        <i className="fi fi-rr-check"></i>
        <span>Done</span>
      </button>
    </div>
  );
}

/**
 * Main Multi-Page BlockNote React Application
 * Features:
 * - Natural continuous stacked A4 pages
 * - Inline "+ Insert Page Below" button
 * - Clean right-side small page preview mini-map for instant navigation
 * - Unified JSON import/export across all pages
 * - Multi-selection support (Ctrl+select) and quick highlighter mode
 */
export function MultiPageBlockNoteApp({
  initialContent,
  initialAnnotations = null,
  docTitle: initialDocTitle = "",
  subjectName = "",
  onChange,
  onHistoryChange,
  onAnnotationsChange,
  onBridgeReady,
  editable = true,
  uploadFile
}) {
  const [docTitle, setDocTitle] = useState(initialDocTitle);

  useEffect(() => {
    if (initialDocTitle !== undefined) {
      setDocTitle(initialDocTitle);
    }
  }, [initialDocTitle]);

  // Extract initial annotations if present in initialContent or initialAnnotations prop
  const parseInitialAnnotations = () => {
    if (initialAnnotations && typeof initialAnnotations === "object") {
      return initialAnnotations;
    }
    if (initialContent) {
      try {
        const data = typeof initialContent === "string" ? JSON.parse(initialContent) : initialContent;
        if (data && typeof data === "object" && data.annotations) {
          return data.annotations;
        }
      } catch (e) {}
    }
    return {};
  };

  const [annotations, setAnnotations] = useState(parseInitialAnnotations);
  const annotationsRef = useRef(annotations);
  annotationsRef.current = annotations;

  // Teacher Pen Drawing Tool State
  const [penActive, setPenActive] = useState(false);
  const [penTool, setPenTool] = useState("pen"); // 'pen' | 'check' | 'cross' | 'star' | 'eraser'
  const [penColor, setPenColor] = useState("#e03131"); // Teacher Red by default
  const [penSize, setPenSize] = useState(3.5); // Medium stroke by default

  const penActiveRef = useRef(penActive);
  penActiveRef.current = penActive;
  const penToolRef = useRef(penTool);
  penToolRef.current = penTool;
  const penColorRef = useRef(penColor);
  penColorRef.current = penColor;
  const penSizeRef = useRef(penSize);
  penSizeRef.current = penSize;

  const penHistoryStackRef = useRef([]); // [{ pageId, stroke }]
  const penRedoStackRef = useRef([]); // [{ pageId, stroke }]

  // Multi-Selection State (Ctrl+Select to batch-color multiple selections)
  const [multiSelections, setMultiSelections] = useState([]);
  const multiSelectionsRef = useRef(multiSelections);
  multiSelectionsRef.current = multiSelections;

  // Quick Highlighter Mode (Instant one-swipe highlight)
  const [highlighterMode, setHighlighterMode] = useState(false);
  const highlighterModeRef = useRef(highlighterMode);
  highlighterModeRef.current = highlighterMode;
  const [highlighterColor, setHighlighterColor] = useState("yellow");
  const highlighterColorRef = useRef(highlighterColor);
  highlighterColorRef.current = highlighterColor;

  const updateCSSHighlights = (selections) => {
    if (typeof Highlight === "undefined" || !CSS.highlights) return;
    if (!selections || selections.length === 0) {
      CSS.highlights.delete("quill-multi-select");
      return;
    }
    try {
      const ranges = selections.map((s) => s.domRange).filter(Boolean);
      if (ranges.length > 0) {
        const h = new Highlight(...ranges);
        CSS.highlights.set("quill-multi-select", h);
      } else {
        CSS.highlights.delete("quill-multi-select");
      }
    } catch (e) {
      console.warn("Could not set CSS highlights:", e);
    }
  };

  const clearMultiSelections = useCallback(() => {
    setMultiSelections([]);
    multiSelectionsRef.current = [];
    if (typeof Highlight !== "undefined" && CSS.highlights) {
      CSS.highlights.delete("quill-multi-select");
    }
  }, []);

  const applyStyleToMultiSelections = useCallback((style) => {
    const current = multiSelectionsRef.current;
    if (!current || current.length === 0) return;

    const byEditor = new Map();
    for (const item of current) {
      if (!item.editor || !item.editor.prosemirrorView) continue;
      if (!byEditor.has(item.editor)) {
        byEditor.set(item.editor, []);
      }
      byEditor.get(item.editor).push(item);
    }

    let changedCount = 0;
    for (const [editor, items] of byEditor.entries()) {
      const view = editor.prosemirrorView;
      if (!view || !view.state) continue;
      const { schema } = view.state;
      let tr = view.state.tr;

      for (const item of items) {
        const from = Math.min(item.from, item.to);
        const to = Math.max(item.from, item.to);
        if (from >= to) continue;

        if (style.backgroundColor !== undefined) {
          if (style.backgroundColor === "default" || !style.backgroundColor) {
            if (schema.marks.backgroundColor) {
              tr = tr.removeMark(from, to, schema.marks.backgroundColor);
            }
          } else if (schema.marks.backgroundColor) {
            tr = tr.addMark(from, to, schema.marks.backgroundColor.create({ stringValue: style.backgroundColor }));
          }
        }

        if (style.textColor !== undefined) {
          if (style.textColor === "default" || !style.textColor) {
            if (schema.marks.textColor) {
              tr = tr.removeMark(from, to, schema.marks.textColor);
            }
          } else if (schema.marks.textColor) {
            tr = tr.addMark(from, to, schema.marks.textColor.create({ stringValue: style.textColor }));
          }
        }

        if (style.bold !== undefined && schema.marks.bold) {
          tr = style.bold ? tr.addMark(from, to, schema.marks.bold.create()) : tr.removeMark(from, to, schema.marks.bold);
        }

        if (style.italic !== undefined && schema.marks.italic) {
          tr = style.italic ? tr.addMark(from, to, schema.marks.italic.create()) : tr.removeMark(from, to, schema.marks.italic);
        }

        changedCount++;
      }

      if (tr.docChanged) {
        view.dispatch(tr);
      }
    }

    clearMultiSelections();
    if (typeof window.showToast === "function") {
      window.showToast(`Applied styling to ${changedCount} selections!`);
    }
  }, [clearMultiSelections]);

  const handleEditorRootMouseUp = useCallback((e) => {
    if (!editable) return;

    // 1. Quick Highlighter mode
    if (highlighterModeRef.current) {
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.rangeCount) return;

        const range = sel.getRangeAt(0);
        let targetEditor = null;
        for (const ed of editorsMapRef.current.values()) {
          if (ed?.prosemirrorView?.dom?.contains(range.commonAncestorContainer)) {
            targetEditor = ed;
            break;
          }
        }
        if (!targetEditor && lastActiveEditorRef.current) {
          targetEditor = lastActiveEditorRef.current;
        }

        if (targetEditor && targetEditor.prosemirrorView) {
          const { from, to } = targetEditor.prosemirrorView.state.selection;
          if (to > from) {
            const color = highlighterColorRef.current || "yellow";
            targetEditor.addStyles({ backgroundColor: color });
          }
        }
      }, 25);
      return;
    }

    // 2. Multi-Select with Ctrl or Cmd
    if (e.ctrlKey || e.metaKey) {
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.rangeCount) return;

        const range = sel.getRangeAt(0);
        let targetEditor = null;
        let targetPageId = null;

        for (const [pId, ed] of editorsMapRef.current.entries()) {
          if (ed?.prosemirrorView?.dom?.contains(range.commonAncestorContainer)) {
            targetEditor = ed;
            targetPageId = pId;
            break;
          }
        }
        if (!targetEditor && lastActiveEditorRef.current) {
          targetEditor = lastActiveEditorRef.current;
          targetPageId = lastActivePageIdRef.current;
        }

        if (!targetEditor || !targetEditor.prosemirrorView) return;

        const { from, to } = targetEditor.prosemirrorView.state.selection;
        if (to <= from) return;

        const selectedText = targetEditor.prosemirrorView.state.doc.textBetween(from, to);
        if (!selectedText.trim()) return;

        const newSelItem = {
          id: "sel-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
          pageId: targetPageId,
          editor: targetEditor,
          from,
          to,
          text: selectedText,
          domRange: range.cloneRange()
        };

        setMultiSelections((prev) => {
          const exists = prev.some(item => item.pageId === targetPageId && item.from === from && item.to === to);
          if (exists) return prev;
          const updated = [...prev, newSelItem];
          multiSelectionsRef.current = updated;
          updateCSSHighlights(updated);
          return updated;
        });

        if (typeof window.showToast === "function") {
          window.showToast("Selection added! Hold Ctrl to select more, or pick a color below.");
        }
      }, 25);
    }
  }, [editable]);

  // Escape key listener to dismiss multi-selection or highlighter
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        if (multiSelectionsRef.current.length > 0) {
          clearMultiSelections();
        } else if (highlighterModeRef.current) {
          setHighlighterMode(false);
          highlighterModeRef.current = false;
          const btn = document.getElementById("btn-highlighter-mode");
          if (btn) btn.classList.remove("active");
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [clearMultiSelections]);

  // Normalize initial pages from input (supports legacy single-page JSON or multi-page structure)
  const parseInitialPages = () => {
    if (!initialContent) {
      return [{ id: "page-1", name: "Page 1", blocks: undefined }];
    }

    try {
      const data = typeof initialContent === "string" ? JSON.parse(initialContent) : initialContent;

      // Format A: Object with pages array
      if (data && typeof data === "object" && Array.isArray(data.pages) && data.pages.length > 0) {
        return data.pages.map((p, idx) => ({
          id: p.id || `page-${idx + 1}`,
          name: p.name || `Page ${idx + 1}`,
          blocks: p.blocks || p.content || undefined
        }));
      }

      // Format B: Array of blocks (legacy single page)
      if (Array.isArray(data) && data.length > 0) {
        return [{ id: "page-1", name: "Page 1", blocks: data }];
      }
    } catch (e) {
      console.warn("Could not parse initialContent for pages, starting fresh:", e);
    }

    return [{ id: "page-1", name: "Page 1", blocks: undefined }];
  };

  const [pages, setPages] = useState(parseInitialPages);
  const [visiblePageIndex, setVisiblePageIndex] = useState(0);
  const editorsMapRef = useRef(new Map());
  const pagesRef = useRef(pages);
  pagesRef.current = pages;

  // Active / focused editor tracking for unified Undo/Redo
  const lastActivePageIdRef = useRef(null);
  const lastActiveEditorRef = useRef(null);
  const historyListenerRef = useRef(null);
  const historyDebounceRef = useRef(null);

  // Track active page via IntersectionObserver
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageId = entry.target.getAttribute("data-page-id");
            const idx = pages.findIndex((p) => p.id === pageId);
            if (idx !== -1) {
              setVisiblePageIndex(idx);
            }
          }
        });
      },
      { threshold: 0.25 }
    );

    pages.forEach((p) => {
      const el = document.getElementById(`a4-page-${p.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pages]);

  // Construct full payload combining all pages AND handwritten annotations
  const buildExportPayload = useCallback(() => {
    const currentPages = pagesRef.current;
    const pagesData = currentPages.map((p) => {
      const ed = editorsMapRef.current.get(p.id);
      return {
        id: p.id,
        name: p.name,
        blocks: ed ? ed.document : p.blocks || []
      };
    });

    const allBlocks = pagesData.flatMap((p) => p.blocks);
    const currentAnnotations = annotationsRef.current || {};

    return {
      version: 2,
      pageSize: "a4",
      pages: pagesData,
      allBlocks: allBlocks,
      annotations: currentAnnotations,
      jsonString: JSON.stringify({
        version: 2,
        pageSize: "a4",
        pages: pagesData,
        annotations: currentAnnotations
      })
    };
  }, []);

  // Determine currently active or best fallback editor
  const getTargetEditor = useCallback(() => {
    // 1. Check if any editor currently has DOM focus
    for (const [pageId, ed] of editorsMapRef.current.entries()) {
      try {
        if (ed?.prosemirrorView?.hasFocus && ed.prosemirrorView.hasFocus()) {
          lastActivePageIdRef.current = pageId;
          lastActiveEditorRef.current = ed;
          return { pageId, editor: ed };
        }
      } catch (e) {}
    }

    // 2. Check last active editor
    if (lastActivePageIdRef.current && editorsMapRef.current.has(lastActivePageIdRef.current)) {
      return {
        pageId: lastActivePageIdRef.current,
        editor: editorsMapRef.current.get(lastActivePageIdRef.current)
      };
    }

    // 3. Check visible page editor
    const currentPages = pagesRef.current;
    const visPage = currentPages[visiblePageIndex] || currentPages[0];
    if (visPage && editorsMapRef.current.has(visPage.id)) {
      return { pageId: visPage.id, editor: editorsMapRef.current.get(visPage.id) };
    }

    // 4. Fallback to first available editor
    const firstEntry = editorsMapRef.current.entries().next().value;
    if (firstEntry) {
      return { pageId: firstEntry[0], editor: firstEntry[1] };
    }

    return { pageId: null, editor: null };
  }, [visiblePageIndex]);

  // Query overall canUndo / canRedo capability across editors
  const queryHistoryStatus = useCallback(() => {
    if (!editable) {
      return { canUndo: false, canRedo: false };
    }

    const { editor: activeEd } = getTargetEditor();
    let canUndo = activeEd ? checkCanUndo(activeEd) : false;
    let canRedo = activeEd ? checkCanRedo(activeEd) : false;

    // If active editor cannot undo, check if ANY page has undoable history
    if (!canUndo) {
      for (const ed of editorsMapRef.current.values()) {
        if (checkCanUndo(ed)) {
          canUndo = true;
          break;
        }
      }
    }

    // If active editor cannot redo, check if ANY page has redoable history
    if (!canRedo) {
      for (const ed of editorsMapRef.current.values()) {
        if (checkCanRedo(ed)) {
          canRedo = true;
          break;
        }
      }
    }

    return { canUndo, canRedo };
  }, [editable, getTargetEditor]);

  // Notify listeners of history status changes (debounced)
  const notifyHistoryChange = useCallback(() => {
    if (historyDebounceRef.current) clearTimeout(historyDebounceRef.current);
    historyDebounceRef.current = setTimeout(() => {
      const status = queryHistoryStatus();
      if (typeof onHistoryChange === "function") {
        onHistoryChange(status);
      }
      if (typeof historyListenerRef.current === "function") {
        historyListenerRef.current(status);
      }
    }, 40);
  }, [queryHistoryStatus, onHistoryChange]);

  // Scroll to Page Helper
  const scrollToPage = useCallback((pageId) => {
    const el = document.getElementById(`a4-page-${pageId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Handle active editor selection / focus
  const handleEditorActive = useCallback((pageId, ed) => {
    if (pageId) lastActivePageIdRef.current = pageId;
    if (ed) lastActiveEditorRef.current = ed;
    notifyHistoryChange();
  }, [notifyHistoryChange]);

  // Register editor instance for a page
  const handleEditorCreated = useCallback((pageId, editor) => {
    editorsMapRef.current.set(pageId, editor);
    if (!lastActiveEditorRef.current) {
      lastActiveEditorRef.current = editor;
      lastActivePageIdRef.current = pageId;
    }
    notifyHistoryChange();
  }, [notifyHistoryChange]);

  // Handle page change (lightweight debounce)
  const debounceTimerRef = useRef(null);
  const handlePageChange = useCallback((pageId, ed) => {
    if (pageId) lastActivePageIdRef.current = pageId;
    if (ed) lastActiveEditorRef.current = ed;

    notifyHistoryChange();

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      if (onChange) {
        onChange(buildExportPayload());
      }
    }, 250);
  }, [onChange, buildExportPayload, notifyHistoryChange]);

  // Perform Undo across active page or multi-page stack
  const handleUndo = useCallback(() => {
    if (!editable) return false;
    const { pageId: activePageId, editor: activeEd } = getTargetEditor();

    // 1. Try currently active page editor if it can undo
    if (activeEd && checkCanUndo(activeEd)) {
      const ok = activeEd.undo();
      if (ok) {
        try { activeEd.focus(); } catch (e) {}
        notifyHistoryChange();
        if (onChange) onChange(buildExportPayload());
        return true;
      }
    }

    // 2. Otherwise scan other page editors that can undo
    for (const [pageId, ed] of editorsMapRef.current.entries()) {
      if (checkCanUndo(ed)) {
        const ok = ed.undo();
        if (ok) {
          lastActivePageIdRef.current = pageId;
          lastActiveEditorRef.current = ed;
          scrollToPage(pageId);
          try { ed.focus(); } catch (e) {}
          notifyHistoryChange();
          if (onChange) onChange(buildExportPayload());
          return true;
        }
      }
    }

    return false;
  }, [editable, getTargetEditor, notifyHistoryChange, onChange, buildExportPayload, scrollToPage]);

  // Perform Redo across active page or multi-page stack
  const handleRedo = useCallback(() => {
    if (!editable) return false;
    const { pageId: activePageId, editor: activeEd } = getTargetEditor();

    // 1. Try currently active page editor if it can redo
    if (activeEd && checkCanRedo(activeEd)) {
      const ok = activeEd.redo();
      if (ok) {
        try { activeEd.focus(); } catch (e) {}
        notifyHistoryChange();
        if (onChange) onChange(buildExportPayload());
        return true;
      }
    }

    // 2. Otherwise scan other page editors that can redo
    for (const [pageId, ed] of editorsMapRef.current.entries()) {
      if (checkCanRedo(ed)) {
        const ok = ed.redo();
        if (ok) {
          lastActivePageIdRef.current = pageId;
          lastActiveEditorRef.current = ed;
          scrollToPage(pageId);
          try { ed.focus(); } catch (e) {}
          notifyHistoryChange();
          if (onChange) onChange(buildExportPayload());
          return true;
        }
      }
    }

    return false;
  }, [editable, getTargetEditor, notifyHistoryChange, onChange, buildExportPayload, scrollToPage]);

  // Teacher Pen: Add new handwritten stroke
  const handleAddStroke = useCallback((pageId, stroke) => {
    setAnnotations((prev) => {
      const currentList = prev[pageId] ? [...prev[pageId], stroke] : [stroke];
      const updated = { ...prev, [pageId]: currentList };
      annotationsRef.current = updated;

      penHistoryStackRef.current.push({ pageId, stroke });
      penRedoStackRef.current = [];

      if (onChange) onChange(buildExportPayload());
      if (onAnnotationsChange) onAnnotationsChange(updated);
      return updated;
    });
  }, [onChange, onAnnotationsChange, buildExportPayload]);

  // Teacher Pen: Undo last stroke
  const handleUndoPen = useCallback(() => {
    if (penHistoryStackRef.current.length === 0) return false;
    const lastItem = penHistoryStackRef.current.pop();
    penRedoStackRef.current.push(lastItem);

    setAnnotations((prev) => {
      const currentList = prev[lastItem.pageId] || [];
      const updatedList = currentList.filter((s) => s.id !== lastItem.stroke.id);
      const updated = { ...prev, [lastItem.pageId]: updatedList };
      annotationsRef.current = updated;

      if (onChange) onChange(buildExportPayload());
      if (onAnnotationsChange) onAnnotationsChange(updated);
      return updated;
    });
    return true;
  }, [onChange, onAnnotationsChange, buildExportPayload]);

  // Teacher Pen: Redo last stroke
  const handleRedoPen = useCallback(() => {
    if (penRedoStackRef.current.length === 0) return false;
    const redoItem = penRedoStackRef.current.pop();
    penHistoryStackRef.current.push(redoItem);

    setAnnotations((prev) => {
      const currentList = prev[redoItem.pageId] || [];
      const updatedList = [...currentList, redoItem.stroke];
      const updated = { ...prev, [redoItem.pageId]: updatedList };
      annotationsRef.current = updated;

      if (onChange) onChange(buildExportPayload());
      if (onAnnotationsChange) onAnnotationsChange(updated);
      return updated;
    });
    return true;
  }, [onChange, onAnnotationsChange, buildExportPayload]);

  // Teacher Pen: Clear marks on a specific page
  const handleClearPagePen = useCallback((pageId) => {
    const targetId = pageId || lastActivePageIdRef.current || pagesRef.current[visiblePageIndex]?.id;
    if (!targetId) return;

    setAnnotations((prev) => {
      if (!prev[targetId] || prev[targetId].length === 0) return prev;
      const updated = { ...prev, [targetId]: [] };
      annotationsRef.current = updated;

      if (onChange) onChange(buildExportPayload());
      if (onAnnotationsChange) onAnnotationsChange(updated);
      return updated;
    });
  }, [visiblePageIndex, onChange, onAnnotationsChange, buildExportPayload]);

  // Add Page After Index
  const handleAddPageAfter = useCallback((index) => {
    const newId = `page-${Date.now()}`;
    setPages((prev) => {
      const copy = [...prev];
      copy.splice(index + 1, 0, {
        id: newId,
        name: `Page ${copy.length + 1}`,
        blocks: undefined
      });

      // Update names sequentially
      const renamed = copy.map((p, i) => ({ ...p, name: `Page ${i + 1}` }));
      pagesRef.current = renamed;

      setTimeout(() => {
        if (onChange) onChange(buildExportPayload());
        notifyHistoryChange();
        // Scroll to the newly added page
        const el = document.getElementById(`a4-page-${newId}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);

      return renamed;
    });
  }, [onChange, buildExportPayload, notifyHistoryChange]);

  // Delete Page
  const handleDeletePage = useCallback(async (pageId, index) => {
    if (pages.length <= 1) return;

    let confirmed = false;
    if (typeof window.showCustomConfirm === "function") {
      confirmed = await window.showCustomConfirm(
        `Are you sure you want to delete Page ${index + 1}? All content on this page will be permanently removed.`,
        `Delete Page ${index + 1}?`,
        '<i class="fi fi-rr-trash"></i>',
        "Delete Page",
        "Keep Page",
        true
      );
    } else {
      confirmed = window.confirm(`Are you sure you want to delete Page ${index + 1}? This cannot be undone.`);
    }

    if (!confirmed) return;

    editorsMapRef.current.delete(pageId);
    if (lastActivePageIdRef.current === pageId) {
      lastActivePageIdRef.current = null;
      lastActiveEditorRef.current = null;
    }

    setPages((prev) => {
      const filtered = prev.filter((p) => p.id !== pageId);
      const renamed = filtered.map((p, i) => ({ ...p, name: `Page ${i + 1}` }));
      pagesRef.current = renamed;

      setTimeout(() => {
        if (onChange) onChange(buildExportPayload());
        notifyHistoryChange();
      }, 80);

      return renamed;
    });
  }, [pages.length, onChange, buildExportPayload, notifyHistoryChange]);

  // Expose bridge methods to Vanilla JS
  useEffect(() => {
    if (onBridgeReady) {
      onBridgeReady({
        getPages: () => buildExportPayload().pages,
        getAllBlocks: () => buildExportPayload().allBlocks,
        getJSON: () => buildExportPayload().allBlocks,
        getJSONString: () => buildExportPayload().jsonString,
        setDocTitle: (newTitle) => setDocTitle(newTitle),
        getMarkdown: async () => {
          const parts = [];
          const currentPages = pagesRef.current;
          for (let i = 0; i < currentPages.length; i++) {
            const p = currentPages[i];
            const ed = editorsMapRef.current.get(p.id);
            if (ed) {
              const md = await ed.blocksToMarkdownLossy();
              parts.push(`<!-- Page ${i + 1} -->\n${md}`);
            }
          }
          return parts.join("\n\n---\n\n");
        },
        getHTML: async () => {
          const parts = [];
          const currentPages = pagesRef.current;
          for (let i = 0; i < currentPages.length; i++) {
            const p = currentPages[i];
            const ed = editorsMapRef.current.get(p.id);
            if (ed) {
              const html = await ed.blocksToHTMLLossy();
              parts.push(`<div class="a4-page-sheet" data-page="${i + 1}">\n${html}\n</div>`);
            }
          }
          return parts.join("\n\n");
        },
        addPage: () => handleAddPageAfter(pages.length - 1),
        scrollToPage: (index) => {
          if (pages[index]) {
            scrollToPage(pages[index].id);
          }
        },
        undo: handleUndo,
        redo: handleRedo,
        canUndo: () => queryHistoryStatus().canUndo,
        canRedo: () => queryHistoryStatus().canRedo,
        onHistoryChange: (cb) => {
          historyListenerRef.current = cb;
          if (typeof cb === "function") cb(queryHistoryStatus());
        },
        checkHistory: notifyHistoryChange,

        // Teacher Pen Bridge API
        getAnnotations: () => annotationsRef.current || {},
        setAnnotations: (newAnn) => {
          setAnnotations(newAnn || {});
          annotationsRef.current = newAnn || {};
        },
        setPenMode: (active) => {
          const val = Boolean(active);
          setPenActive(val);
          penActiveRef.current = val;
        },
        getPenMode: () => Boolean(penActiveRef.current),
        setPenTool: (tool) => {
          setPenTool(tool);
          penToolRef.current = tool;
        },
        getPenTool: () => penToolRef.current || "pen",
        setPenColor: (color) => {
          setPenColor(color);
          penColorRef.current = color;
        },
        getPenColor: () => penColorRef.current || "#e03131",
        setPenSize: (size) => {
          const num = Number(size) || 3.5;
          setPenSize(num);
          penSizeRef.current = num;
        },
        getPenSize: () => penSizeRef.current || 3.5,
        undoPen: handleUndoPen,
        redoPen: handleRedoPen,
        clearPagePen: handleClearPagePen,

        // Multi-Selection & Quick Highlighter Bridge API
        getMultiSelections: () => multiSelectionsRef.current,
        clearMultiSelections: clearMultiSelections,
        applyMultiStyle: applyStyleToMultiSelections,
        setHighlighterMode: (active, color = null) => {
          const next = Boolean(active);
          setHighlighterMode(next);
          highlighterModeRef.current = next;
          if (color) {
            setHighlighterColor(color);
            highlighterColorRef.current = color;
          }
          return next;
        },
        toggleHighlighterMode: (color = null) => {
          const next = !highlighterModeRef.current;
          setHighlighterMode(next);
          highlighterModeRef.current = next;
          if (color) {
            setHighlighterColor(color);
            highlighterColorRef.current = color;
          }
          return next;
        },
        getHighlighterMode: () => Boolean(highlighterModeRef.current),
        getHighlighterColor: () => highlighterColorRef.current || "yellow"
      });
    }
  }, [
    pages,
    onBridgeReady,
    handleAddPageAfter,
    buildExportPayload,
    scrollToPage,
    handleUndo,
    handleRedo,
    queryHistoryStatus,
    notifyHistoryChange,
    penActive,
    handleUndoPen,
    handleRedoPen,
    handleClearPagePen,
    clearMultiSelections,
    applyStyleToMultiSelections
  ]);

  return (
    <div
      className={`multipage-editor-root ${highlighterMode ? "highlighter-mode-active" : ""}`}
      onMouseUp={handleEditorRootMouseUp}
    >
      {/* Small Right-Side Page Preview Rail */}
      <aside className="a4-right-page-rail" aria-label="Page navigation preview">
        <div className="a4-rail-track">
          {pages.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              className={`a4-rail-thumb ${visiblePageIndex === idx ? "active" : ""}`}
              onClick={() => scrollToPage(p.id)}
              title={`Page ${idx + 1}`}
            >
              <div className="a4-rail-thumb-sheet">
                <span className="a4-rail-thumb-num">{idx + 1}</span>
                <div className="a4-rail-thumb-lines">
                  <div className="a4-rail-thumb-line line-1"></div>
                  <div className="a4-rail-thumb-line line-2"></div>
                </div>
              </div>
            </button>
          ))}

          {/* Miniature Add Page Button in Rail */}
          {editable && (
            <button
              type="button"
              className="a4-rail-add-btn"
              onClick={() => handleAddPageAfter(pages.length - 1)}
              title="Add Page"
            >
              <i className="fi fi-rr-plus"></i>
            </button>
          )}
        </div>
      </aside>

      {/* Pages Canvas Area: Natural continuous stacked pages */}
      <div className="a4-pages-canvas mode-stacked">
        {pages.map((page, index) => (
          <A4PageSheet
            key={page.id}
            page={page}
            index={index}
            totalPages={pages.length}
            docTitle={docTitle}
            subjectName={subjectName}
            onEditorCreated={handleEditorCreated}
            onPageChange={handlePageChange}
            onEditorActive={handleEditorActive}
            onDeletePage={handleDeletePage}
            onAddPageAfter={handleAddPageAfter}
            editable={editable}
            uploadFile={uploadFile}
            strokes={annotations[page.id] || []}
            penActive={penActive}
            penTool={penTool}
            penColor={penColor}
            penSize={penSize}
            onAddStroke={handleAddStroke}
          />
        ))}
      </div>

      {/* Floating Multi-Selection Action Toolbar (Ctrl+Select) */}
      {multiSelections.length > 0 && (
        <MultiSelectToolbar
          selections={multiSelections}
          onApply={applyStyleToMultiSelections}
          onClear={clearMultiSelections}
        />
      )}

      {/* Floating Quick Highlighter Toolbar */}
      {highlighterMode && multiSelections.length === 0 && (
        <HighlighterToolbar
          activeColor={highlighterColor}
          onSelectColor={(c) => {
            setHighlighterColor(c);
            highlighterColorRef.current = c;
          }}
          onDone={() => {
            setHighlighterMode(false);
            highlighterModeRef.current = false;
            const btn = document.getElementById("btn-highlighter-mode");
            if (btn) btn.classList.remove("active");
          }}
        />
      )}
    </div>
  );
}

// Global Mount Hook for Vanilla JS / DOM integration
if (typeof window !== "undefined") {
  window.MultiPageBlockNoteApp = MultiPageBlockNoteApp;
  window.renderMultiPageBlockNote = function (container, props = {}) {
    let bridgeRef = null;
    let currentProps = { ...props };

    const root = ReactDOM.createRoot(container);

    function renderApp() {
      root.render(
        React.createElement(MultiPageBlockNoteApp, {
          ...currentProps,
          onBridgeReady: (bridge) => {
            bridgeRef = bridge;
            if (currentProps.onBridgeReady) currentProps.onBridgeReady(bridge);
          }
        })
      );
    }

    renderApp();

    return {
      root,
      getBridge: () => bridgeRef,
      getPages: () => (bridgeRef ? bridgeRef.getPages() : []),
      getAllBlocks: () => (bridgeRef ? bridgeRef.getAllBlocks() : []),
      getJSON: () => (bridgeRef ? bridgeRef.getAllBlocks() : []),
      getJSONString: () => (bridgeRef ? bridgeRef.getJSONString() : "{}"),
      getMarkdown: async () => (bridgeRef ? await bridgeRef.getMarkdown() : ""),
      getHTML: async () => (bridgeRef ? await bridgeRef.getHTML() : ""),
      addPage: () => bridgeRef && bridgeRef.addPage(),
      scrollToPage: (idx) => bridgeRef && bridgeRef.scrollToPage(idx),
      undo: () => bridgeRef && bridgeRef.undo(),
      redo: () => bridgeRef && bridgeRef.redo(),
      canUndo: () => (bridgeRef ? bridgeRef.canUndo() : false),
      canRedo: () => (bridgeRef ? bridgeRef.canRedo() : false),
      onHistoryChange: (cb) => bridgeRef && bridgeRef.onHistoryChange(cb),
      setDocTitle: (title) => {
        if (bridgeRef && bridgeRef.setDocTitle) {
          bridgeRef.setDocTitle(title);
        } else {
          currentProps.docTitle = title;
          renderApp();
        }
      },
      updateProps: (newProps) => {
        currentProps = { ...currentProps, ...newProps };
        renderApp();
      },

      // Teacher Pen methods
      getAnnotations: () => (bridgeRef ? bridgeRef.getAnnotations() : {}),
      setAnnotations: (ann) => bridgeRef && bridgeRef.setAnnotations(ann),
      setPenMode: (active) => bridgeRef && bridgeRef.setPenMode(active),
      getPenMode: () => (bridgeRef ? bridgeRef.getPenMode() : false),
      setPenTool: (tool) => bridgeRef && bridgeRef.setPenTool(tool),
      setPenColor: (color) => bridgeRef && bridgeRef.setPenColor(color),
      setPenSize: (size) => bridgeRef && bridgeRef.setPenSize(size),
      undoPen: () => bridgeRef && bridgeRef.undoPen(),
      redoPen: () => bridgeRef && bridgeRef.redoPen(),
      clearPagePen: (pageId) => bridgeRef && bridgeRef.clearPagePen(pageId)
    };
  };
  window.renderBlockNoteReact = window.renderMultiPageBlockNote;
}
