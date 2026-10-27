import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom/client";
import { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import "@mantine/core/styles.css";
import "@blocknote/core/style.css";
import "@blocknote/mantine/style.css";

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
  onDeletePage,
  onAddPageAfter,
  editable = true
}) {
  const [editor, setEditor] = useState(null);
  const editorRef = useRef(null);

  useEffect(() => {
    let initialBlocks = undefined;
    if (page.blocks && Array.isArray(page.blocks) && page.blocks.length > 0) {
      initialBlocks = page.blocks;
    }

    const ed = BlockNoteEditor.create({
      initialContent: initialBlocks
    });

    setEditor(ed);
    editorRef.current = ed;
    onEditorCreated(page.id, ed);

    let unsub = null;
    if (editable) {
      unsub = ed.onChange(() => {
        onPageChange(page.id, ed);
      });
    }

    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [page.id, editable]);

  return (
    <div className="a4-page-container" id={`a4-page-wrapper-${page.id}`}>
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
 * Main Multi-Page BlockNote React Application
 * Features:
 * - Natural continuous stacked A4 pages
 * - Inline "+ Insert Page Below" button
 * - Clean right-side small page preview mini-map for instant navigation
 * - Unified JSON import/export across all pages
 */
export function MultiPageBlockNoteApp({
  initialContent,
  docTitle: initialDocTitle = "",
  subjectName = "",
  onChange,
  onBridgeReady,
  editable = true
}) {
  const [docTitle, setDocTitle] = useState(initialDocTitle);

  useEffect(() => {
    if (initialDocTitle !== undefined) {
      setDocTitle(initialDocTitle);
    }
  }, [initialDocTitle]);

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

  // Construct full payload combining all pages
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

    return {
      version: 2,
      pageSize: "a4",
      pages: pagesData,
      allBlocks: allBlocks,
      jsonString: JSON.stringify({ version: 2, pageSize: "a4", pages: pagesData })
    };
  }, []);

  // Register editor instance for a page
  const handleEditorCreated = useCallback((pageId, editor) => {
    editorsMapRef.current.set(pageId, editor);
  }, []);

  // Handle page change (lightweight debounce)
  const debounceTimerRef = useRef(null);
  const handlePageChange = useCallback((pageId, ed) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      if (onChange) {
        onChange(buildExportPayload());
      }
    }, 250);
  }, [onChange, buildExportPayload]);

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
        // Scroll to the newly added page
        const el = document.getElementById(`a4-page-${newId}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);

      return renamed;
    });
  }, [onChange, buildExportPayload]);

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

    setPages((prev) => {
      const filtered = prev.filter((p) => p.id !== pageId);
      const renamed = filtered.map((p, i) => ({ ...p, name: `Page ${i + 1}` }));
      pagesRef.current = renamed;

      setTimeout(() => {
        if (onChange) onChange(buildExportPayload());
      }, 80);

      return renamed;
    });
  }, [pages.length, onChange, buildExportPayload]);

  // Scroll to Page Helper
  const scrollToPage = useCallback((pageId) => {
    const el = document.getElementById(`a4-page-${pageId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

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
        }
      });
    }
  }, [pages, onBridgeReady, handleAddPageAfter, buildExportPayload, scrollToPage]);

  return (
    <div className="multipage-editor-root">
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
            onDeletePage={handleDeletePage}
            onAddPageAfter={handleAddPageAfter}
            editable={editable}
          />
        ))}
      </div>
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
      }
    };
  };
  window.renderBlockNoteReact = window.renderMultiPageBlockNote;
}
