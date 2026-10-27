import React, { useRef, useEffect, useState, useCallback } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { WizardSettings, CanvasObject, BarcodeObject, TextObject, ShapeObject, LineObject, ImageObject } from '@/types/bartender';
import styles from './Canvas.module.css';

interface LabelCanvasProps {
  settings: WizardSettings;
  objects: CanvasObject[];
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  onUpdateObject: (updated: CanvasObject) => void;
  onDeleteObject: (id: string) => void;
  zoom: number;
  showGrid: boolean;
  onMouseMoveCoords: (xMm: number, yMm: number) => void;
}

// ─── Barcode Renderer Subcomponent ──────────────────────────────────────────

const BarcodeItem: React.FC<{ object: BarcodeObject }> = ({ object }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    if (!object.value) return;

    if (object.format === 'QR') {
      const c = canvasRef.current;
      if (!c) return;
      QRCode.toCanvas(c, object.value, {
        margin: 1,
        color: { dark: object.fgColor || '#000000', light: object.bgColor || '#ffffff' },
      }).catch(() => setError(true));
    } else {
      const s = svgRef.current;
      if (!s) return;
      try {
        JsBarcode(s, object.value, {
          format: object.format,
          lineColor: object.fgColor || '#000000',
          background: object.bgColor || 'transparent',
          width: object.barWidth || 1.5,
          displayValue: object.displayValue,
          fontSize: object.fontSize || 10,
          margin: 2,
        });
      } catch {
        setError(true);
      }
    }
  }, [object]);

  if (error) {
    return (
      <div style={{ fontSize: '10px', color: '#c0392b', padding: '4px', textAlign: 'center' }}>
        [Invalid {object.format}]
      </div>
    );
  }

  if (object.format === 'QR') {
    return <canvas ref={canvasRef} className={styles.objectCanvasBarcode} />;
  }

  return <svg ref={svgRef} className={styles.objectSvgBarcode} />;
};

// ─── Main Canvas Component ──────────────────────────────────────────────────

export const LabelCanvas: React.FC<LabelCanvasProps> = ({
  settings,
  objects,
  selectedObjectId,
  onSelectObject,
  onUpdateObject,
  onDeleteObject,
  zoom,
  showGrid,
  onMouseMoveCoords,
}) => {
  const artboardRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState<{ xMm: number; yMm: number }>({ xMm: 0, yMm: 0 });
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Dragging state
  const [dragging, setDragging] = useState<{
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  // Resizing state
  const [resizing, setResizing] = useState<{
    id: string;
    handle: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
  } | null>(null);

  // Rotating state
  const [rotating, setRotating] = useState<{
    id: string;
    centerX: number;
    centerY: number;
  } | null>(null);

  // Conversion: 1 mm in pixels at 100% zoom (e.g. 96 dpi / 25.4 mm ≈ 3.7795 px/mm)
  const basePxPerMm = 3.78;
  const pxPerMm = basePxPerMm * (zoom / 100);

  const labelWidthPx = settings.templateWidthMm * pxPerMm;
  const labelHeightPx = settings.templateHeightMm * pxPerMm;

  // Track mouse coordinates
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!artboardRef.current) return;
    const rect = artboardRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / pxPerMm;
    const relY = (e.clientY - rect.top) / pxPerMm;
    const clampedX = Number(relX.toFixed(1));
    const clampedY = Number(relY.toFixed(1));
    setCursorPos({ xMm: clampedX, yMm: clampedY });
    onMouseMoveCoords(clampedX, clampedY);

    // Handle Dragging
    if (dragging) {
      const dxMm = (e.clientX - dragging.startX) / pxPerMm;
      const dyMm = (e.clientY - dragging.startY) / pxPerMm;
      const targetObj = objects.find((o) => o.id === dragging.id);
      if (targetObj) {
        onUpdateObject({
          ...targetObj,
          x: Math.max(0, Number((dragging.origX + dxMm).toFixed(1))),
          y: Math.max(0, Number((dragging.origY + dyMm).toFixed(1))),
        });
      }
    }

    // Handle Resizing
    if (resizing) {
      const dxMm = (e.clientX - resizing.startX) / pxPerMm;
      const dyMm = (e.clientY - resizing.startY) / pxPerMm;
      const targetObj = objects.find((o) => o.id === resizing.id);
      if (targetObj) {
        let newX = resizing.origX;
        let newY = resizing.origY;
        let newW = resizing.origW;
        let newH = resizing.origH;

        if (resizing.handle.includes('e')) newW = Math.max(2, resizing.origW + dxMm);
        if (resizing.handle.includes('s')) newH = Math.max(2, resizing.origH + dyMm);
        if (resizing.handle.includes('w')) {
          const proposedW = resizing.origW - dxMm;
          if (proposedW >= 2) {
            newW = proposedW;
            newX = resizing.origX + dxMm;
          }
        }
        if (resizing.handle.includes('n')) {
          const proposedH = resizing.origH - dyMm;
          if (proposedH >= 2) {
            newH = proposedH;
            newY = resizing.origY + dyMm;
          }
        }

        onUpdateObject({
          ...targetObj,
          x: Number(newX.toFixed(1)),
          y: Number(newY.toFixed(1)),
          width: Number(newW.toFixed(1)),
          height: Number(newH.toFixed(1)),
        });
      }
    }

    // Handle Rotating
    if (rotating) {
      const dx = e.clientX - rotating.centerX;
      const dy = e.clientY - rotating.centerY;
      let angle = Math.round((Math.atan2(dy, dx) * (180 / Math.PI)) + 90);
      if (angle < 0) angle += 360;
      // Snap to 15 degrees if near
      const snapInterval = 15;
      const remainder = angle % snapInterval;
      if (remainder < 3 || remainder > snapInterval - 3) {
        angle = Math.round(angle / snapInterval) * snapInterval;
      }
      const targetObj = objects.find((o) => o.id === rotating.id);
      if (targetObj) {
        onUpdateObject({ ...targetObj, rotation: angle % 360 });
      }
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
    setResizing(null);
    setRotating(null);
  };

  // Keyboard navigation & delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept keyboard shortcuts if user is typing in an input or textarea!
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
         activeEl.tagName === 'TEXTAREA' ||
         (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      if (!selectedObjectId) return;
      const target = objects.find((o) => o.id === selectedObjectId);
      if (!target) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        onDeleteObject(selectedObjectId);
      } else if (e.key === 'ArrowUp') {
        onUpdateObject({ ...target, y: Math.max(0, target.y - 0.5) });
      } else if (e.key === 'ArrowDown') {
        onUpdateObject({ ...target, y: target.y + 0.5 });
      } else if (e.key === 'ArrowLeft') {
        onUpdateObject({ ...target, x: Math.max(0, target.x - 0.5) });
      } else if (e.key === 'ArrowRight') {
        onUpdateObject({ ...target, x: target.x + 0.5 });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectId, objects, onUpdateObject, onDeleteObject]);

  // Border radius for the label artboard
  const getArtboardBorderRadius = () => {
    switch (settings.shape) {
      case 'roundedRectangle':
        return `${settings.cornerRadiusMm * pxPerMm}px`;
      case 'circle':
      case 'ellipse':
        return '50%';
      case 'rectangle':
      default:
        return '0px';
    }
  };

  // Render rulers marks
  const renderHorizontalRulerMarks = () => {
    const marks = [];
    const maxMm = Math.max(100, settings.templateWidthMm + 20);
    for (let mm = 0; mm <= maxMm; mm += 2) {
      const isMajor = mm % 10 === 0;
      const isMedium = mm % 5 === 0 && !isMajor;
      const left = mm * pxPerMm;
      marks.push(
        <div
          key={`h-${mm}`}
          style={{
            position: 'absolute',
            left: `${left}px`,
            bottom: 0,
            width: '1px',
            height: isMajor ? '12px' : isMedium ? '8px' : '4px',
            background: isMajor ? '#333' : '#888',
          }}
        >
          {isMajor && (
            <span
              style={{
                position: 'absolute',
                top: '-14px',
                left: '2px',
                fontSize: '8.5px',
                color: '#444',
                fontFamily: 'sans-serif',
              }}
            >
              {mm}
            </span>
          )}
        </div>
      );
    }
    return marks;
  };

  const renderVerticalRulerMarks = () => {
    const marks = [];
    const maxMm = Math.max(100, settings.templateHeightMm + 20);
    for (let mm = 0; mm <= maxMm; mm += 2) {
      const isMajor = mm % 10 === 0;
      const isMedium = mm % 5 === 0 && !isMajor;
      const top = mm * pxPerMm;
      marks.push(
        <div
          key={`v-${mm}`}
          style={{
            position: 'absolute',
            top: `${top}px`,
            right: 0,
            height: '1px',
            width: isMajor ? '12px' : isMedium ? '8px' : '4px',
            background: isMajor ? '#333' : '#888',
          }}
        >
          {isMajor && (
            <span
              style={{
                position: 'absolute',
                top: '1px',
                right: '13px',
                fontSize: '8.5px',
                color: '#444',
                fontFamily: 'sans-serif',
              }}
            >
              {mm}
            </span>
          )}
        </div>
      );
    }
    return marks;
  };

  return (
    <div
      className={styles.canvasWrapper}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top Horizontal Ruler */}
      <div className={styles.rulerTopRow}>
        <div className={styles.rulerCorner}>mm</div>
        <div className={styles.rulerHorizontal}>
          {renderHorizontalRulerMarks()}
          <div
            className={styles.rulerIndicatorH}
            style={{ left: `${Math.max(0, cursorPos.xMm) * pxPerMm}px` }}
          />
        </div>
      </div>

      {/* Center Viewport */}
      <div className={styles.centerRow}>
        {/* Left Vertical Ruler */}
        <div className={styles.rulerVertical}>
          {renderVerticalRulerMarks()}
          <div
            className={styles.rulerIndicatorV}
            style={{ top: `${Math.max(0, cursorPos.yMm) * pxPerMm}px` }}
          />
        </div>

        {/* Scrollable Canvas Viewport */}
        <div
          className={styles.scrollArea}
          onClick={(e) => {
            if (e.target === e.currentTarget || e.target === artboardRef.current) {
              onSelectObject(null);
            }
          }}
        >
          {/* Label Artboard */}
          <div
            ref={artboardRef}
            className={styles.artboardContainer}
            style={{
              width: `${labelWidthPx}px`,
              height: `${labelHeightPx}px`,
              borderRadius: getArtboardBorderRadius(),
              backgroundColor: settings.useBackgroundColor ? settings.backgroundColor : '#ffffff',
              backgroundImage:
                settings.useBackgroundPicture && settings.backgroundPictureUrl
                  ? `url(${settings.backgroundPictureUrl})`
                  : undefined,
              backgroundSize: 'cover',
            }}
          >
            {/* Grid overlay */}
            {showGrid && <div className={styles.artboardGrid} />}

            {/* Template watermark image */}
            {settings.useTemplateImage && settings.templateImageUrl && (
              <img
                src={settings.templateImageUrl}
                alt="Template watermark"
                className={styles.artboardWatermark}
                style={{ opacity: (settings.templateImageOpacity || 40) / 100 }}
              />
            )}

            {/* Canvas Objects */}
            {objects.map((obj) => {
              const isSelected = selectedObjectId === obj.id;
              const objLeftPx = obj.x * pxPerMm;
              const objTopPx = obj.y * pxPerMm;
              const objWidthPx = obj.width * pxPerMm;
              const objHeightPx = obj.height * pxPerMm;

              return (
                <div
                  key={obj.id}
                  className={`${styles.canvasObject} ${isSelected ? styles.canvasObjectSelected : ''}`}
                  style={{
                    left: `${objLeftPx}px`,
                    top: `${objTopPx}px`,
                    width: `${objWidthPx}px`,
                    height: `${objHeightPx}px`,
                    transform: `rotate(${obj.rotation || 0}deg)`,
                    transformOrigin: 'center center',
                    zIndex: obj.zIndex,
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onSelectObject(obj.id);
                    setDragging({
                      id: obj.id,
                      startX: e.clientX,
                      startY: e.clientY,
                      origX: obj.x,
                      origY: obj.y,
                    });
                  }}
                >
                  {/* Object Render by Type */}
                  {obj.type === 'barcode' && <BarcodeItem object={obj} />}

                  {obj.type === 'text' && editingTextId === obj.id ? (
                    <input
                      type="text"
                      className={styles.inlineInput}
                      autoFocus
                      value={obj.text}
                      style={{
                        fontFamily: obj.fontFamily,
                        fontSize: `${obj.fontSize * (zoom / 100) * 1.33}px`,
                        fontWeight: obj.bold ? 'bold' : 'normal',
                        fontStyle: obj.italic ? 'italic' : 'normal',
                        textAlign: obj.align,
                        color: obj.color,
                        padding: '0 4px',
                      }}
                      onChange={(e) => onUpdateObject({ ...obj, text: e.target.value })}
                      onBlur={() => setEditingTextId(null)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter' || e.key === 'Escape') {
                          setEditingTextId(null);
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                  ) : obj.type === 'text' ? (
                    <div
                      className={styles.objectText}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditingTextId(obj.id);
                      }}
                      title="Double-click to edit text"
                      style={{
                        fontFamily: obj.fontFamily,
                        fontSize: `${obj.fontSize * (zoom / 100) * 1.33}px`,
                        fontWeight: obj.bold ? 'bold' : 'normal',
                        fontStyle: obj.italic ? 'italic' : 'normal',
                        textDecoration: `${obj.underline ? 'underline ' : ''}${obj.strike ? 'line-through' : ''}`.trim() || 'none',
                        textAlign: obj.align,
                        color: obj.color,
                        cursor: isSelected ? 'text' : 'move',
                      }}
                    >
                      {obj.text}
                    </div>
                  ) : null}

                  {obj.type === 'shape' && (
                    <svg width="100%" height="100%" style={{ display: 'block' }}>
                      {obj.shapeType === 'roundedRectangle' && (
                        <rect
                          x="1"
                          y="1"
                          width="calc(100% - 2px)"
                          height="calc(100% - 2px)"
                          rx={obj.cornerRadius * pxPerMm}
                          fill={obj.fillColor}
                          stroke={obj.strokeColor}
                          strokeWidth={obj.strokeWidth}
                        />
                      )}
                      {obj.shapeType === 'rectangle' && (
                        <rect
                          x="1"
                          y="1"
                          width="calc(100% - 2px)"
                          height="calc(100% - 2px)"
                          fill={obj.fillColor}
                          stroke={obj.strokeColor}
                          strokeWidth={obj.strokeWidth}
                        />
                      )}
                      {obj.shapeType === 'ellipse' && (
                        <ellipse
                          cx="50%"
                          cy="50%"
                          rx="calc(50% - 2px)"
                          ry="calc(50% - 2px)"
                          fill={obj.fillColor}
                          stroke={obj.strokeColor}
                          strokeWidth={obj.strokeWidth}
                        />
                      )}
                    </svg>
                  )}

                  {obj.type === 'line' && (
                    <svg width="100%" height="100%" style={{ display: 'block' }}>
                      <line
                        x1="0"
                        y1="50%"
                        x2="100%"
                        y2="50%"
                        stroke={obj.strokeColor}
                        strokeWidth={obj.strokeWidth}
                      />
                    </svg>
                  )}

                  {obj.type === 'image' && (
                    <img
                      src={obj.src}
                      alt="Label graphic"
                      style={{ width: '100%', height: '100%', objectFit: obj.objectFit, display: 'block' }}
                    />
                  )}

                  {/* 8 Resize Handles & Rotate Handle when selected */}
                  {isSelected && (
                    <>
                      {/* Rotate Handle */}
                      <div className={styles.rotateStem} />
                      <div
                        className={styles.rotateHandle}
                        title={`Drag to Rotate (Current: ${obj.rotation || 0}°)`}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          const el = e.currentTarget.parentElement;
                          if (el) {
                            const rect = el.getBoundingClientRect();
                            setRotating({
                              id: obj.id,
                              centerX: rect.left + rect.width / 2,
                              centerY: rect.top + rect.height / 2,
                            });
                          }
                        }}
                      />

                      {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((h) => (
                        <div
                          key={h}
                          className={`${styles.handle} ${
                            h === 'nw' ? styles.handleNw :
                            h === 'n'  ? styles.handleN  :
                            h === 'ne' ? styles.handleNe :
                            h === 'e'  ? styles.handleE  :
                            h === 'se' ? styles.handleSe :
                            h === 's'  ? styles.handleS  :
                            h === 'sw' ? styles.handleSw :
                            styles.handleW
                          }`}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setResizing({
                              id: obj.id,
                              handle: h,
                              startX: e.clientX,
                              startY: e.clientY,
                              origX: obj.x,
                              origY: obj.y,
                              origW: obj.width,
                              origH: obj.height,
                            });
                          }}
                        />
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

