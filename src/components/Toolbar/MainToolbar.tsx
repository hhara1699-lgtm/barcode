import React from 'react';
import { BarcodeFormat } from '@/types/bartender';
import styles from './Toolbar.module.css';

interface MainToolbarProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onPrint: () => void;
  onPrintPreview: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onUndo: () => void;
  onRedo: () => void;
  activeTool: string;
  setActiveTool: (tool: string) => void;
  onAddBarcode: (format: BarcodeFormat) => void;
  onAddText: () => void;
  onAddShape: (shape: 'rectangle' | 'roundedRectangle' | 'ellipse') => void;
  onAddLine: () => void;
  onAddImage: () => void;
  onRotate?: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoom100: () => void;
  onZoomFit: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
}

export const MainToolbar: React.FC<MainToolbarProps> = ({
  onNew,
  onOpen,
  onSave,
  onPrint,
  onPrintPreview,
  onCut,
  onCopy,
  onPaste,
  onDelete,
  onUndo,
  onRedo,
  activeTool,
  setActiveTool,
  onAddBarcode,
  onAddText,
  onAddShape,
  onAddLine,
  onAddImage,
  onRotate,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoom100,
  onZoomFit,
  showGrid,
  onToggleGrid,
}) => {
  return (
    <div className={styles.toolbarRow}>
      {/* File group */}
      <button className={styles.toolBtn} onClick={onNew} title="New Document (Ctrl+N)">
        <svg width="16" height="16" viewBox="0 0 16 16">
          <rect x="2" y="1" width="9" height="14" rx="1" fill="#fff" stroke="#888" strokeWidth="1" />
          <path d="M9 1v4h4" fill="none" stroke="#888" strokeWidth="1" />
          <rect x="9" y="1" width="4" height="4" fill="none" stroke="#888" strokeWidth="1" />
        </svg>
      </button>

      <button className={styles.toolBtn} onClick={onOpen} title="Open Document (Ctrl+O)">
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M1 4h5l1.5 2H15v8H1V4z" fill="#f4c430" stroke="#c8a000" strokeWidth="1" />
        </svg>
      </button>

      <button className={styles.toolBtn} onClick={onSave} title="Save Document (Ctrl+S)">
        <svg width="16" height="16" viewBox="0 0 16 16">
          <rect x="1" y="1" width="14" height="14" rx="1" fill="#3a8ee6" stroke="#1d6fc2" strokeWidth="1" />
          <rect x="4" y="1" width="6" height="5" fill="#fff" stroke="#ccc" strokeWidth="0.5" />
          <rect x="3" y="9" width="10" height="5" rx="0.5" fill="#d4e8ff" />
        </svg>
      </button>

      <button className={styles.toolBtn} onClick={onPrint} title="Print Label (Ctrl+P)">
        <svg width="16" height="16" viewBox="0 0 16 16">
          <rect x="3" y="5" width="10" height="7" rx="1" fill="#777" stroke="#444" strokeWidth="1" />
          <rect x="5" y="1" width="6" height="5" fill="#fff" stroke="#555" strokeWidth="1" />
          <rect x="5" y="9" width="6" height="5" rx="0.5" fill="#fff" stroke="#aaa" strokeWidth="0.5" />
          <circle cx="12" cy="7.5" r="0.8" fill="#4a9eff" />
        </svg>
      </button>

      <button className={styles.toolBtn} onClick={onPrintPreview} title="Print Preview">
        <svg width="16" height="16" viewBox="0 0 16 16">
          <rect x="2" y="2" width="10" height="12" fill="#fff" stroke="#666" strokeWidth="1" />
          <circle cx="10" cy="10" r="3.5" fill="none" stroke="#205088" strokeWidth="1.5" />
          <line x1="12.5" y1="12.5" x2="15" y2="15" stroke="#205088" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <div className={styles.toolSep} />

      {/* Edit group */}
      <button className={styles.toolBtn} onClick={onCut} title="Cut (Ctrl+X)">
        <span style={{ fontSize: '13px' }}>✂️</span>
      </button>
      <button className={styles.toolBtn} onClick={onCopy} title="Copy (Ctrl+C)">
        <svg width="15" height="15" viewBox="0 0 16 16">
          <rect x="5" y="1" width="9" height="11" rx="1" fill="#fff" stroke="#888" strokeWidth="1" />
          <rect x="2" y="4" width="9" height="11" rx="1" fill="#fff" stroke="#888" strokeWidth="1" />
        </svg>
      </button>
      <button className={styles.toolBtn} onClick={onPaste} title="Paste (Ctrl+V)">
        <svg width="15" height="15" viewBox="0 0 16 16">
          <rect x="5" y="1" width="6" height="3" rx="1" fill="#bbb" stroke="#999" strokeWidth="1" />
          <rect x="2" y="3" width="12" height="12" rx="1" fill="#fff" stroke="#888" strokeWidth="1" />
        </svg>
      </button>
      <button className={styles.toolBtn} onClick={onDelete} title="Delete (Del)">
        <span style={{ fontSize: '13px', color: '#c0392b' }}>✕</span>
      </button>

      <div className={styles.toolSep} />

      {/* Undo / Redo */}
      <button className={styles.toolBtn} onClick={onUndo} title="Undo (Ctrl+Z)">
        <svg width="15" height="15" viewBox="0 0 16 16">
          <path d="M3 7a5 5 0 1 1 5 5" fill="none" stroke="#444" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M3 4v4h4" fill="none" stroke="#444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button className={styles.toolBtn} onClick={onRedo} title="Redo (Ctrl+Y)">
        <svg width="15" height="15" viewBox="0 0 16 16">
          <path d="M13 7a5 5 0 1 0-5 5" fill="none" stroke="#444" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M13 4v4h-4" fill="none" stroke="#444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className={styles.toolSep} />

      {/* Tool Selection Group matching Photo 13 */}
      {/* Pointer / Select tool */}
      <button
        className={`${styles.toolBtn} ${activeTool === 'select' ? styles.toolBtnActive : ''}`}
        onClick={() => setActiveTool('select')}
        title="Select Tool"
      >
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M2 1l10 5.5-5 2-2 6z" fill="#333" stroke="#fff" strokeWidth="0.8" />
        </svg>
      </button>

      {/* Barcode tool */}
      <button
        className={`${styles.toolBtn} ${activeTool === 'barcode' ? styles.toolBtnActive : ''}`}
        onClick={() => onAddBarcode('CODE128')}
        title="Insert Barcode (Code 128)"
      >
        <svg width="16" height="16" viewBox="0 0 16 16">
          <rect x="1" y="2" width="2" height="12" fill="#205088" />
          <rect x="4" y="2" width="1" height="12" fill="#205088" />
          <rect x="6" y="2" width="2.5" height="12" fill="#205088" />
          <rect x="10" y="2" width="1" height="12" fill="#205088" />
          <rect x="12" y="2" width="2" height="12" fill="#205088" />
        </svg>
      </button>

      {/* QR Code tool */}
      <button
        className={styles.toolBtn}
        onClick={() => onAddBarcode('QR')}
        title="Insert 2D QR Code"
      >
        <svg width="15" height="15" viewBox="0 0 16 16">
          <rect x="2" y="2" width="5" height="5" rx="0.5" fill="none" stroke="#205088" strokeWidth="1.5" />
          <rect x="9" y="2" width="5" height="5" rx="0.5" fill="none" stroke="#205088" strokeWidth="1.5" />
          <rect x="2" y="9" width="5" height="5" rx="0.5" fill="none" stroke="#205088" strokeWidth="1.5" />
          <rect x="4" y="4" width="1" height="1" fill="#205088" />
          <rect x="11" y="4" width="1" height="1" fill="#205088" />
          <rect x="4" y="11" width="1" height="1" fill="#205088" />
          <rect x="10" y="10" width="2" height="2" fill="#205088" />
        </svg>
      </button>

      {/* Text Tool */}
      <button
        className={`${styles.toolBtn} ${activeTool === 'text' ? styles.toolBtnActive : ''}`}
        onClick={onAddText}
        title="Insert Text"
      >
        <svg width="16" height="16" viewBox="0 0 16 16">
          <text x="3" y="13" fontSize="14" fill="#222" fontFamily="'Times New Roman', serif" fontWeight="bold">A</text>
        </svg>
      </button>

      {/* Line Tool */}
      <button
        className={`${styles.toolBtn} ${activeTool === 'line' ? styles.toolBtnActive : ''}`}
        onClick={onAddLine}
        title="Insert Line"
      >
        <svg width="16" height="16" viewBox="0 0 16 16">
          <line x1="2" y1="14" x2="14" y2="2" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Rectangle Tool */}
      <button
        className={styles.toolBtn}
        onClick={() => onAddShape('rectangle')}
        title="Insert Rectangle"
      >
        <svg width="16" height="16" viewBox="0 0 16 16">
          <rect x="2" y="3" width="12" height="10" fill="none" stroke="#333" strokeWidth="1.5" />
        </svg>
      </button>

      {/* Rounded Rectangle Tool */}
      <button
        className={styles.toolBtn}
        onClick={() => onAddShape('roundedRectangle')}
        title="Insert Rounded Rectangle"
      >
        <svg width="16" height="16" viewBox="0 0 16 16">
          <rect x="2" y="3" width="12" height="10" rx="3" fill="none" stroke="#333" strokeWidth="1.5" />
        </svg>
      </button>

      {/* Ellipse / Circle Tool */}
      <button
        className={styles.toolBtn}
        onClick={() => onAddShape('ellipse')}
        title="Insert Ellipse / Circle"
      >
        <svg width="16" height="16" viewBox="0 0 16 16">
          <ellipse cx="8" cy="8" rx="6" ry="5" fill="none" stroke="#333" strokeWidth="1.5" />
        </svg>
      </button>

      {/* Picture Tool */}
      <button
        className={styles.toolBtn}
        onClick={onAddImage}
        title="Insert Picture / Logo"
      >
        <svg width="16" height="16" viewBox="0 0 16 16">
          <rect x="1" y="2" width="14" height="12" rx="1" fill="none" stroke="#333" strokeWidth="1.5" />
          <circle cx="5" cy="6" r="1.5" fill="#333" />
          <path d="M2 12l4-4 3 3 3-2 3 3" fill="none" stroke="#333" strokeWidth="1.2" />
        </svg>
      </button>

      {/* Rotate Tool */}
      {onRotate && (
        <button
          className={styles.toolBtn}
          onClick={onRotate}
          title="Rotate Selected Object 90° Clockwise"
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M8 2a6 6 0 1 1-4.24 1.76" fill="none" stroke="#205088" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M3.5 1v3.5h3.5" fill="none" stroke="#205088" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      <div className={styles.toolSep} />

      {/* Zoom controls matching Photo 13 */}
      <button className={styles.toolBtn} onClick={onZoomIn} title="Zoom In">
        <svg width="15" height="15" viewBox="0 0 16 16">
          <circle cx="7" cy="7" r="5" fill="none" stroke="#444" strokeWidth="1.5" />
          <path d="M11 11l3.5 3.5" stroke="#444" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="7" y1="4" x2="7" y2="10" stroke="#444" strokeWidth="1.5" />
          <line x1="4" y1="7" x2="10" y2="7" stroke="#444" strokeWidth="1.5" />
        </svg>
      </button>

      <button className={styles.toolBtn} onClick={onZoomOut} title="Zoom Out">
        <svg width="15" height="15" viewBox="0 0 16 16">
          <circle cx="7" cy="7" r="5" fill="none" stroke="#444" strokeWidth="1.5" />
          <path d="M11 11l3.5 3.5" stroke="#444" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="4" y1="7" x2="10" y2="7" stroke="#444" strokeWidth="1.5" />
        </svg>
      </button>

      <button className={styles.toolBtn} onClick={onZoom100} title="Zoom 100%">
        <span style={{ fontSize: '10px', fontWeight: 700 }}>1:1</span>
      </button>

      <button className={styles.toolBtn} onClick={onZoomFit} title="Fit to Window">
        <svg width="15" height="15" viewBox="0 0 16 16">
          <rect x="2" y="2" width="12" height="12" fill="none" stroke="#444" strokeWidth="1.2" strokeDasharray="2 1" />
          <circle cx="8" cy="8" r="3" fill="#444" />
        </svg>
      </button>

      <button
        className={`${styles.toolBtn} ${showGrid ? styles.toolBtnActive : ''}`}
        onClick={onToggleGrid}
        title="Toggle Grid (Ctrl+G)"
      >
        <svg width="15" height="15" viewBox="0 0 16 16">
          <line x1="4" y1="1" x2="4" y2="15" stroke="#666" strokeWidth="1" strokeDasharray="1 1" />
          <line x1="8" y1="1" x2="8" y2="15" stroke="#666" strokeWidth="1" strokeDasharray="1 1" />
          <line x1="12" y1="1" x2="12" y2="15" stroke="#666" strokeWidth="1" strokeDasharray="1 1" />
          <line x1="1" y1="4" x2="15" y2="4" stroke="#666" strokeWidth="1" strokeDasharray="1 1" />
          <line x1="1" y1="8" x2="15" y2="8" stroke="#666" strokeWidth="1" strokeDasharray="1 1" />
          <line x1="1" y1="12" x2="15" y2="12" stroke="#666" strokeWidth="1" strokeDasharray="1 1" />
        </svg>
      </button>

      <span className={styles.zoomLabel}>{zoom}%</span>
    </div>
  );
};

