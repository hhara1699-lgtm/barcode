'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  WizardSettings,
  CanvasObject,
  BarcodeObject,
  TextObject,
  LineObject,
  ShapeObject,
} from '@/types/bartender';
import styles from './Modals.module.css';

interface PrintModalProps {
  settings: WizardSettings;
  objects: CanvasObject[];
  onClose: () => void;
}

// ── helpers ─────────────────────────────────────────────────────────────────

/** Generate a JsBarcode SVG string synchronously (server-side safe). */
function generateBarcodeSvg(
  value: string,
  format: string,
  displayValue: boolean,
  fgColor: string,
  width: number,  // px
  height: number  // px
): string {
  try {
    // We render into a temporary <svg> element in a detached div so JsBarcode
    // can write to it. Works fine in browser; no SSR issue because this
    // component is 'use client'.
    const container = document.createElement('div');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    container.appendChild(svg);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const JsBarcode = require('jsbarcode');

    let bcFormat = format.toUpperCase();
    if (bcFormat === 'EAN13' || bcFormat === 'EAN-13') bcFormat = 'EAN13';
    else if (bcFormat === 'EAN8' || bcFormat === 'EAN-8') bcFormat = 'EAN8';
    else if (bcFormat === 'CODE128') bcFormat = 'CODE128';
    else if (bcFormat === 'CODE39') bcFormat = 'CODE39';
    else if (bcFormat === 'ITF' || bcFormat === 'ITF14') bcFormat = 'ITF14';
    else if (bcFormat === 'UPC' || bcFormat === 'UPCA') bcFormat = 'UPC';
    else bcFormat = 'CODE128';

    JsBarcode(svg, value, {
      format: bcFormat,
      lineColor: fgColor,
      background: 'transparent',
      width: Math.max(1, width / 100),
      height: Math.max(20, height - (displayValue ? 14 : 0)),
      displayValue,
      fontSize: 10,
      margin: 2,
      flat: false,
    });

    return new XMLSerializer().serializeToString(svg);
  } catch {
    // fallback – simple placeholder
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <text x="50%" y="50%" text-anchor="middle" font-size="9" fill="${fgColor}">${value}</text>
    </svg>`;
  }
}

/** Generate a QR code as a data-URL PNG */
async function generateQrDataUrl(value: string, size: number): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const QRCode = require('qrcode');
    return await QRCode.toDataURL(value, {
      width: Math.max(60, size),
      margin: 1,
      errorCorrectionLevel: 'M',
    });
  } catch {
    return '';
  }
}

// ── LabelCell: renders one label with real barcodes ─────────────────────────

interface LabelCellProps {
  objects: CanvasObject[];
  settings: WizardSettings;
  serialOffset: number;      // how many labels before this one (for serial increment)
  enableSerial: boolean;
  serialStart: number;
  widthPx: number;
  heightPx: number;
  scale: number;             // mm → px scale for this preview
}

const LabelCell: React.FC<LabelCellProps> = ({
  objects,
  settings,
  serialOffset,
  enableSerial,
  serialStart,
  widthPx,
  heightPx,
  scale,
}) => {
  const currentSerial = serialStart + serialOffset;

  const getBorderRadius = () => {
    switch (settings.shape) {
      case 'roundedRectangle': return `${settings.cornerRadiusMm * scale}px`;
      case 'circle':
      case 'ellipse': return '50%';
      default: return '0';
    }
  };

  return (
    <div
      style={{
        width: widthPx,
        height: heightPx,
        border: '1px solid #7a9ec2',
        borderRadius: getBorderRadius(),
        backgroundColor: settings.useBackgroundColor ? settings.backgroundColor : '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      {[...objects].sort((a, b) => a.zIndex - b.zIndex).map((obj) => {
        const left = obj.x * scale;
        const top = obj.y * scale;
        const w = obj.width * scale;
        const h = obj.height * scale;
        const transform = obj.rotation ? `rotate(${obj.rotation}deg)` : undefined;

        if (obj.type === 'barcode') {
          const bc = obj as BarcodeObject;
          const displayVal = enableSerial
            ? String(currentSerial)
            : bc.value;

          if (bc.format === 'QR') {
            return (
              <QrCell
                key={obj.id}
                value={displayVal}
                left={left}
                top={top}
                width={w}
                height={h}
                transform={transform}
              />
            );
          }

          // Linear barcode rendered synchronously via JsBarcode
          const svgStr = generateBarcodeSvg(displayVal, bc.format, bc.displayValue, bc.fgColor, w, h);
          return (
            <div
              key={obj.id}
              style={{
                position: 'absolute',
                left,
                top,
                width: w,
                height: h,
                transform,
                transformOrigin: 'center center',
              }}
              dangerouslySetInnerHTML={{ __html: svgStr }}
            />
          );
        }

        if (obj.type === 'text') {
          const tx = obj as TextObject;
          return (
            <div
              key={obj.id}
              style={{
                position: 'absolute',
                left,
                top,
                width: w,
                height: h,
                transform,
                transformOrigin: 'center center',
                fontSize: Math.max(6, tx.fontSize * (scale / 3.78)),
                fontFamily: tx.fontFamily,
                fontWeight: tx.bold ? 'bold' : 'normal',
                fontStyle: tx.italic ? 'italic' : 'normal',
                textDecoration: tx.underline ? 'underline' : tx.strike ? 'line-through' : 'none',
                textAlign: tx.align,
                color: tx.color,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                whiteSpace: 'pre-wrap',
              }}
            >
              {tx.text}
            </div>
          );
        }

        if (obj.type === 'line') {
          const ln = obj as LineObject;
          return (
            <div
              key={obj.id}
              style={{
                position: 'absolute',
                left,
                top,
                width: w,
                height: Math.max(1, ln.strokeWidth * scale),
                background: ln.strokeColor,
                transform,
                transformOrigin: 'center center',
              }}
            />
          );
        }

        if (obj.type === 'shape') {
          const sh = obj as ShapeObject;
          const rad = sh.shapeType === 'ellipse' ? '50%'
            : sh.shapeType === 'roundedRectangle' ? `${sh.cornerRadius * scale}px`
            : '0';
          return (
            <div
              key={obj.id}
              style={{
                position: 'absolute',
                left,
                top,
                width: w,
                height: h,
                borderRadius: rad,
                border: `${Math.max(1, sh.strokeWidth * scale)}px solid ${sh.strokeColor}`,
                backgroundColor: sh.fillColor === 'transparent' ? 'transparent' : sh.fillColor,
                transform,
                transformOrigin: 'center center',
                boxSizing: 'border-box',
              }}
            />
          );
        }

        if (obj.type === 'image') {
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={obj.id}
              src={(obj as any).src}
              alt=""
              style={{
                position: 'absolute',
                left,
                top,
                width: w,
                height: h,
                objectFit: (obj as any).objectFit || 'contain',
                transform,
                transformOrigin: 'center center',
              }}
            />
          );
        }

        return null;
      })}
    </div>
  );
};

// Async QR cell
const QrCell: React.FC<{
  value: string;
  left: number;
  top: number;
  width: number;
  height: number;
  transform?: string;
}> = ({ value, left, top, width, height, transform }) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    generateQrDataUrl(value, Math.max(width, height)).then(setDataUrl);
  }, [value, width, height]);

  if (!dataUrl) {
    return (
      <div
        style={{
          position: 'absolute',
          left, top, width, height, transform,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 7, color: '#555',
        }}
      >
        QR
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt="QR"
      style={{
        position: 'absolute',
        left, top, width, height,
        objectFit: 'contain',
        transform,
        transformOrigin: 'center center',
      }}
    />
  );
};

// ── Main PrintModal ──────────────────────────────────────────────────────────

export const PrintModal: React.FC<PrintModalProps> = ({ settings, objects, onClose }) => {
  const [printMode, setPrintMode] = useState<'sheet' | 'single'>('sheet');
  const [copies, setCopies] = useState<number>(1);
  const [enableSerial, setEnableSerial] = useState<boolean>(true);
  const [serialStart, setSerialStart] = useState<number>(1001);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  const rows = settings.itemsPerPageType === 'single' ? 1 : Math.max(1, settings.rows);
  const cols = settings.itemsPerPageType === 'single' ? 1 : Math.max(1, settings.cols);
  const totalItems = printMode === 'single' ? 1 : rows * cols;

  // Preview scale: fit the page sheet into the preview box
  // Preview area is ~480px wide at most; we shrink the page proportionally
  const PREVIEW_MAX_W = 460;
  const PREVIEW_MAX_H = 300;
  const pageW = settings.pageWidthMm;
  const pageH = settings.pageHeightMm;
  const scaleToFitW = PREVIEW_MAX_W / pageW;
  const scaleToFitH = PREVIEW_MAX_H / pageH;
  const previewScale = Math.min(scaleToFitW, scaleToFitH, 2.5); // px per mm, capped

  const previewPageW = pageW * previewScale;
  const previewPageH = pageH * previewScale;
  const previewLabelW = settings.templateWidthMm * previewScale;
  const previewLabelH = settings.templateHeightMm * previewScale;
  const previewGapH = (settings.horizGapMm || 0) * previewScale;
  const previewGapV = (settings.vertGapMm || 0) * previewScale;
  const previewPadL = (settings.hasUnusedMaterial ? settings.unusedLeftMm : 0) * previewScale;
  const previewPadR = (settings.hasUnusedMaterial ? settings.unusedRightMm : 0) * previewScale;

  // For "single" mode preview
  const singleScale = Math.min(
    PREVIEW_MAX_W / settings.templateWidthMm,
    PREVIEW_MAX_H / settings.templateHeightMm,
    6
  );

  // ── Print handler ──────────────────────────────────────────────────────────
  const handleSendToPrinter = useCallback(() => {
    setIsPrinting(true);

    // Create a fresh div appended DIRECTLY to <body> so @media print can reach it
    // as a direct child (body > #bartender-print-root), even though the React
    // component tree is nested inside body > div#__next.
    const existingRoot = document.getElementById('bartender-print-root');
    if (existingRoot) existingRoot.remove();
    const root = document.createElement('div');
    root.id = 'bartender-print-root';
    document.body.appendChild(root);

    // Inject / update the @page style
    const styleId = 'bartender-print-style';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    const printRows = printMode === 'single' ? 1 : rows;
    const printCols = printMode === 'single' ? 1 : cols;
    const printTotalItems = printMode === 'single' ? 1 : printRows * printCols;

    // Physical mm dimensions
    const pw = printMode === 'single' ? settings.templateWidthMm : settings.pageWidthMm;
    const ph = printMode === 'single' ? settings.templateHeightMm : settings.pageHeightMm;
    const lw = settings.templateWidthMm;
    const lh = settings.templateHeightMm;
    const gapH = settings.horizGapMm || 0;
    const gapV = settings.vertGapMm || 0;
    const padL = settings.hasUnusedMaterial ? settings.unusedLeftMm : 0;
    const padR = settings.hasUnusedMaterial ? settings.unusedRightMm : 0;

    // Border radius for printed label shape
    const borderRad = settings.shape === 'roundedRectangle'
      ? `${settings.cornerRadiusMm}mm`
      : settings.shape === 'circle' || settings.shape === 'ellipse'
        ? '50%'
        : '0';

    const bgColor = settings.useBackgroundColor ? settings.backgroundColor : '#ffffff';

    // Build SVGs / content for each object in each label
    // We generate the barcode SVG strings now; QR we embed as inline SVG or fallback text
    const buildObjectHtml = (obj: CanvasObject, labelIndex: number): string => {
      const currentSerial = serialStart + labelIndex;
      const left = `${obj.x}mm`;
      const top = `${obj.y}mm`;
      const w = `${obj.width}mm`;
      const h = `${obj.height}mm`;
      const rot = obj.rotation ? `rotate(${obj.rotation}deg)` : '';
      const posStyle = `position:absolute;left:${left};top:${top};width:${w};height:${h};transform:${rot};transform-origin:center center;overflow:hidden;box-sizing:border-box;`;

      if (obj.type === 'barcode') {
        const bc = obj as BarcodeObject;
        const displayVal = enableSerial ? String(currentSerial) : bc.value;
        const wPx = obj.width * 3.78 * 2; // approx px at 96dpi
        const hPx = obj.height * 3.78 * 2;

        if (bc.format === 'QR') {
          // For QR in print, we use a placeholder text (async data URL can't be injected synchronously here)
          // QR will appear as a bordered square with the value text
          return `<div style="${posStyle}border:1px solid ${bc.fgColor};display:flex;align-items:center;justify-content:center;font-size:6pt;font-family:monospace;color:${bc.fgColor};">${displayVal}</div>`;
        }

        const svgStr = generateBarcodeSvg(displayVal, bc.format, bc.displayValue, bc.fgColor, wPx, hPx);
        return `<div style="${posStyle}">${svgStr}</div>`;
      }

      if (obj.type === 'text') {
        const tx = obj as TextObject;
        const td = tx.underline ? 'underline' : tx.strike ? 'line-through' : 'none';
        return `<div style="${posStyle}font-size:${tx.fontSize}pt;font-family:${tx.fontFamily},sans-serif;font-weight:${tx.bold ? 'bold' : 'normal'};font-style:${tx.italic ? 'italic' : 'normal'};text-decoration:${td};text-align:${tx.align};color:${tx.color};display:flex;align-items:center;white-space:pre-wrap;">${tx.text}</div>`;
      }

      if (obj.type === 'line') {
        const ln = obj as LineObject;
        return `<div style="${posStyle}height:${Math.max(0.2, ln.strokeWidth / 3)}mm;background:${ln.strokeColor};"></div>`;
      }

      if (obj.type === 'shape') {
        const sh = obj as ShapeObject;
        const rad = sh.shapeType === 'ellipse' ? '50%'
          : sh.shapeType === 'roundedRectangle' ? `${sh.cornerRadius}mm`
          : '0';
        const fill = sh.fillColor === 'transparent' ? 'transparent' : sh.fillColor;
        return `<div style="${posStyle}border-radius:${rad};border:${sh.strokeWidth / 2}mm solid ${sh.strokeColor};background:${fill};"></div>`;
      }

      if (obj.type === 'image') {
        return `<img src="${(obj as any).src}" alt="" style="${posStyle}object-fit:${(obj as any).objectFit || 'contain'};" />`;
      }

      return '';
    };

    // Build labels HTML
    const sortedObjects = [...objects].sort((a, b) => a.zIndex - b.zIndex);

    let labelsHtml = '';
    for (let i = 0; i < printTotalItems; i++) {
      const objectsHtml = sortedObjects.map((obj) => buildObjectHtml(obj, i)).join('');
      labelsHtml += `<div style="width:${lw}mm;height:${lh}mm;border:0.3px solid #ccc;border-radius:${borderRad};background:${bgColor};position:relative;overflow:hidden;box-sizing:border-box;flex-shrink:0;">${objectsHtml}</div>`;
    }

    // Sheet or single
    let sheetHtml = '';
    if (printMode === 'single') {
      sheetHtml = `<div style="width:${lw}mm;height:${lh}mm;">${labelsHtml}</div>`;
    } else {
      sheetHtml = `
        <div style="width:${pw}mm;height:${ph}mm;padding-left:${padL}mm;padding-right:${padR}mm;box-sizing:border-box;">
          <div style="display:grid;grid-template-columns:repeat(${printCols},${lw}mm);grid-template-rows:repeat(${printRows},${lh}mm);column-gap:${gapH}mm;row-gap:${gapV}mm;padding:0;">
            ${labelsHtml}
          </div>
        </div>`;
    }

    // Repeat for copies
    let allCopiesHtml = '';
    for (let c = 0; c < copies; c++) {
      allCopiesHtml += `<div style="page-break-after:${c < copies - 1 ? 'always' : 'auto'};">${sheetHtml}</div>`;
    }

    styleEl.textContent = `
      @page { size: ${pw}mm ${ph}mm; margin: 0; }
      #bartender-print-root * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    `;

    root.innerHTML = allCopiesHtml;

    // Give browser time to render QR images / SVGs then print
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
        // Cleanup after print dialog closes
        setTimeout(() => {
          root.remove(); // remove the dynamically appended body child
          setIsPrinting(false);
        }, 1000);
      });
    });
  }, [printMode, copies, enableSerial, serialStart, rows, cols, objects, settings]);

  // Intercept Escape key to close modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.dialogWindow} style={{ width: '640px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

        {/* Title bar */}
        <div className={styles.dialogTitleBar}>
          <span>Print Document - [{settings.printer}]</span>
          <button className={styles.dialogCloseBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.dialogBody} style={{ flex: 1, overflowY: 'auto' }}>

          {/* PRINT CONFIGURATION section */}
          <div className={styles.propSection}>
            <div className={styles.sectionHeader}>PRINT CONFIGURATION</div>

            <div className={styles.propRow}>
              <label>Print Layout:</label>
              <select value={printMode} onChange={(e) => setPrintMode(e.target.value as 'sheet' | 'single')}>
                <option value="sheet">
                  Full Page Grid Sheet ({rows}×{cols} = {rows * cols} labels per page)
                </option>
                <option value="single">
                  Single Label Only ({settings.templateWidthMm} × {settings.templateHeightMm} mm)
                </option>
              </select>
            </div>

            <div className={styles.propRow}>
              <label>Target Printer:</label>
              <span style={{ fontWeight: 700, color: '#205088', fontSize: '12px' }}>
                {settings.printer}
              </span>
            </div>

            <div className={styles.propRow}>
              <label>Number of Copies:</label>
              <input
                type="number"
                min={1}
                max={500}
                value={copies}
                onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ width: '64px' }}
              />
            </div>

            <div className={styles.propRow} style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={enableSerial}
                  onChange={(e) => setEnableSerial(e.target.checked)}
                />
                Auto-Increment Serial / Barcode across labels
              </label>
              {enableSerial && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#555' }}>Start #</span>
                  <input
                    type="number"
                    value={serialStart}
                    onChange={(e) => setSerialStart(parseInt(e.target.value) || 1)}
                    style={{ width: '72px' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── Live Preview ── */}
          <div
            style={{
              background: '#6e8fac',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
              maxHeight: '340px',
              overflow: 'auto',
              border: '1px inset #5a7a9a',
            }}
          >
            {printMode === 'sheet' ? (
              /* Full page grid preview */
              <div
                style={{
                  width: previewPageW,
                  height: previewPageH,
                  background: '#fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
                  boxSizing: 'border-box',
                  paddingLeft: previewPadL,
                  paddingRight: previewPadR,
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${cols}, ${previewLabelW}px)`,
                    gridTemplateRows: `repeat(${rows}, ${previewLabelH}px)`,
                    columnGap: previewGapH,
                    rowGap: previewGapV,
                    padding: 2,
                  }}
                >
                  {Array.from({ length: totalItems }).map((_, idx) => (
                    <LabelCell
                      key={idx}
                      objects={objects}
                      settings={settings}
                      serialOffset={idx}
                      enableSerial={enableSerial}
                      serialStart={serialStart}
                      widthPx={previewLabelW}
                      heightPx={previewLabelH}
                      scale={previewScale}
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* Single label preview */
              <div style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.35)', flexShrink: 0 }}>
                <LabelCell
                  objects={objects}
                  settings={settings}
                  serialOffset={0}
                  enableSerial={enableSerial}
                  serialStart={serialStart}
                  widthPx={settings.templateWidthMm * singleScale}
                  heightPx={settings.templateHeightMm * singleScale}
                  scale={singleScale}
                />
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className={styles.dialogFooter}>
          <button
            className={styles.btnPrimary}
            onClick={handleSendToPrinter}
            disabled={isPrinting}
          >
            🖨️ {isPrinting ? 'Preparing…' : 'Send to Printer'}
          </button>
          <button className={styles.btn} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
