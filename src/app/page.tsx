'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  WizardSettings,
  CanvasObject,
  DocumentState,
  BarcodeFormat,
  BarcodeObject,
  TextObject,
  ShapeObject,
  LineObject,
} from '@/types/bartender';
import { DEFAULT_WIZARD_SETTINGS, SAMPLE_AAF_OBJECTS } from '@/data/defaults';
import { NewDocumentWizard } from '@/components/Wizard/NewDocumentWizard';
import { MainToolbar } from '@/components/Toolbar/MainToolbar';
import { FormatToolbar } from '@/components/Toolbar/FormatToolbar';
import { LeftSidebar } from '@/components/Sidebar/LeftSidebar';
import { LabelCanvas } from '@/components/Canvas/LabelCanvas';
import { RightPropertiesPanel } from '@/components/Sidebar/RightPropertiesPanel';
import { Form1View } from '@/components/FormView/Form1View';
import { PrintModal } from '@/components/Modals/PrintModal';
import { BatchModal } from '@/components/Modals/BatchModal';
import { PrinterPropertiesModal } from '@/components/Modals/PrinterPropertiesModal';
import { DocumentPropertiesModal } from '@/components/Modals/DocumentPropertiesModal';
import styles from './page.module.css';

type ActiveMenu = 'File' | 'Edit' | 'View' | 'Create' | 'Arrange' | 'Administer' | 'Tools' | 'Window' | 'Help' | null;

export default function BarTenderApp() {
  // ─── Documents state matching Photo 13: AAF.btw and Document1.btw * ──────
  const [documents, setDocuments] = useState<DocumentState[]>([
    {
      id: 'doc-aaf',
      name: 'AAF.btw',
      isDirty: false,
      settings: { ...DEFAULT_WIZARD_SETTINGS },
      objects: [...SAMPLE_AAF_OBJECTS],
      selectedObjectId: null,
    },
    {
      id: 'doc-1',
      name: 'Document1.btw *',
      isDirty: true,
      settings: {
        ...DEFAULT_WIZARD_SETTINGS,
        templateWidthMm: 25.4,
        templateHeightMm: 38.1,
        shape: 'roundedRectangle',
        cornerRadiusMm: 3.0,
      },
      objects: [
        {
          id: 'doc1-bc-1',
          type: 'barcode',
          x: 2.2,
          y: 6.0,
          width: 21.0,
          height: 18.0,
          rotation: 0,
          zIndex: 1,
          format: 'CODE128',
          value: 'TT065-50-A',
          barWidth: 1.2,
          displayValue: true,
          fgColor: '#000000',
          bgColor: '#ffffff',
          fontSize: 8,
        },
      ],
      selectedObjectId: 'doc1-bc-1',
    },
  ]);

  const [activeDocId, setActiveDocId] = useState<string>('doc-1');
  const [activeSheetTab, setActiveSheetTab] = useState<'template' | 'form'>('template');
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(null);
  const [activeTool, setActiveTool] = useState<string>('select');
  const [zoom, setZoom] = useState<number>(439); // Default zoom level as shown in Photo 13!
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Formatting state
  const [fontFamily, setFontFamily] = useState<string>('Printer Sans Serif');
  const [fontSize, setFontSize] = useState<number>(12);
  const [bold, setBold] = useState<boolean>(false);
  const [italic, setItalic] = useState<boolean>(false);
  const [underline, setUnderline] = useState<boolean>(false);
  const [strike, setStrike] = useState<boolean>(false);
  const [color, setColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [align, setAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [lineWidth, setLineWidth] = useState<number>(1.0);

  // Modals state
  const [showWizard, setShowWizard] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);
  const [showPrinterProps, setShowPrinterProps] = useState<boolean>(false);
  const [showDocProps, setShowDocProps] = useState<boolean>(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Intercept Ctrl+P to open our custom Print dialog instead of browser print
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        e.stopPropagation();
        setShowPrintModal(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, { capture: true });
  }, []);

  // Active Document helper
  const currentDoc = documents.find((d) => d.id === activeDocId) || documents[0];

  const updateCurrentDoc = (updates: Partial<DocumentState>) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === activeDocId ? { ...doc, ...updates, isDirty: true } : doc))
    );
  };

  const selectedObject = currentDoc?.objects.find((o) => o.id === currentDoc.selectedObjectId) || null;

  // Sync format bar with selected object
  useEffect(() => {
    if (selectedObject && selectedObject.type === 'text') {
      const txt = selectedObject as TextObject;
      setFontFamily(txt.fontFamily);
      setFontSize(txt.fontSize);
      setBold(txt.bold);
      setItalic(txt.italic);
      setUnderline(txt.underline);
      setStrike(txt.strike);
      setColor(txt.color);
      setAlign(txt.align);
    }
  }, [selectedObject]);

  // Handle Wizard creation
  const handleWizardFinish = (newSettings: WizardSettings) => {
    const newDocId = `doc-${Date.now()}`;
    const newDocName = `Document${documents.length + 1}.btw *`;

    const initialObjects: CanvasObject[] = [
      {
        id: `bc-new-${Date.now()}`,
        type: 'barcode',
        x: Math.max(1, (newSettings.templateWidthMm - 21) / 2),
        y: Math.max(2, (newSettings.templateHeightMm - 16) / 2),
        width: Math.min(newSettings.templateWidthMm - 4, 21),
        height: Math.min(newSettings.templateHeightMm - 6, 16),
        rotation: 0,
        zIndex: 1,
        format: 'CODE128',
        value: '12345678',
        barWidth: 1.2,
        displayValue: true,
        fgColor: '#000000',
        bgColor: '#ffffff',
        fontSize: 8,
      },
    ];

    const newDoc: DocumentState = {
      id: newDocId,
      name: newDocName,
      isDirty: true,
      settings: newSettings,
      objects: initialObjects,
      selectedObjectId: initialObjects[0].id,
    };

    setDocuments((prev) => [...prev, newDoc]);
    setActiveDocId(newDocId);
    setShowWizard(false);
  };

  // Object addition handlers
  const handleAddBarcode = (format: BarcodeFormat) => {
    const newId = `bc-${Date.now()}`;
    const newBarcode: BarcodeObject = {
      id: newId,
      type: 'barcode',
      x: 2.0,
      y: 5.0,
      width: Math.min(currentDoc.settings.templateWidthMm - 4, 21),
      height: Math.min(currentDoc.settings.templateHeightMm - 8, 16),
      rotation: 0,
      zIndex: currentDoc.objects.length + 1,
      format,
      value: format === 'QR' ? 'https://example.com' : 'ABC-89421',
      barWidth: 1.2,
      displayValue: format !== 'QR',
      fgColor: '#000000',
      bgColor: '#ffffff',
      fontSize: 8,
    };

    updateCurrentDoc({
      objects: [...currentDoc.objects, newBarcode],
      selectedObjectId: newId,
    });
    setActiveTool('select');
  };

  const handleAddText = () => {
    const newId = `txt-${Date.now()}`;
    const newText: TextObject = {
      id: newId,
      type: 'text',
      x: 2.0,
      y: 2.0,
      width: Math.min(currentDoc.settings.templateWidthMm - 4, 21),
      height: 5.0,
      rotation: 0,
      zIndex: currentDoc.objects.length + 1,
      text: 'Sample Text',
      fontFamily,
      fontSize,
      bold,
      italic,
      underline,
      strike,
      align,
      color,
    };

    updateCurrentDoc({
      objects: [...currentDoc.objects, newText],
      selectedObjectId: newId,
    });
    setActiveTool('select');
  };

  const handleAddShape = (shapeType: 'rectangle' | 'roundedRectangle' | 'ellipse') => {
    const newId = `shp-${Date.now()}`;
    const newShape: ShapeObject = {
      id: newId,
      type: 'shape',
      shapeType,
      x: 2.0,
      y: 2.0,
      width: Math.min(currentDoc.settings.templateWidthMm - 4, 20),
      height: Math.min(currentDoc.settings.templateHeightMm - 4, 20),
      rotation: 0,
      zIndex: currentDoc.objects.length + 1,
      fillColor: 'transparent',
      strokeColor: '#000000',
      strokeWidth: lineWidth,
      cornerRadius: 3.0,
    };

    updateCurrentDoc({
      objects: [...currentDoc.objects, newShape],
      selectedObjectId: newId,
    });
    setActiveTool('select');
  };

  const handleAddLine = () => {
    const newId = `line-${Date.now()}`;
    const newLine: LineObject = {
      id: newId,
      type: 'line',
      x: 2.0,
      y: 10.0,
      width: Math.min(currentDoc.settings.templateWidthMm - 4, 21),
      height: 1.0,
      rotation: 0,
      zIndex: currentDoc.objects.length + 1,
      strokeColor: '#000000',
      strokeWidth: lineWidth,
      orientation: 'horizontal',
    };

    updateCurrentDoc({
      objects: [...currentDoc.objects, newLine],
      selectedObjectId: newId,
    });
    setActiveTool('select');
  };

  const handleAddImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newId = `img-${Date.now()}`;
          updateCurrentDoc({
            objects: [
              ...currentDoc.objects,
              {
                id: newId,
                type: 'image',
                x: 2.0,
                y: 2.0,
                width: 15.0,
                height: 15.0,
                rotation: 0,
                zIndex: currentDoc.objects.length + 1,
                src: event.target?.result as string,
                objectFit: 'contain',
              },
            ],
            selectedObjectId: newId,
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Object Update and Delete
  const handleUpdateObject = (updated: CanvasObject) => {
    updateCurrentDoc({
      objects: currentDoc.objects.map((o) => (o.id === updated.id ? updated : o)),
    });
  };

  const handleDeleteObject = (id: string) => {
    updateCurrentDoc({
      objects: currentDoc.objects.filter((o) => o.id !== id),
      selectedObjectId: null,
    });
  };

  // Apply format ribbon changes to selected text object
  const handleUpdateFormat = (field: keyof TextObject, val: any) => {
    if (selectedObject && selectedObject.type === 'text') {
      handleUpdateObject({ ...selectedObject, [field]: val });
    }
  };

  // Close tab
  const handleCloseTab = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (documents.length <= 1) return; // Keep at least one document
    const remaining = documents.filter((d) => d.id !== docId);
    setDocuments(remaining);
    if (activeDocId === docId) {
      setActiveDocId(remaining[0].id);
    }
  };

  // Download high-resolution PNG
  const handleExportPng = () => {
    const svgElem = document.querySelector('svg[class*="objectSvgBarcode"]');
    if (svgElem) {
      const blob = new Blob([new XMLSerializer().serializeToString(svgElem)], { type: 'image/svg+xml' });
      const img = new Image();
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width * 3;
        c.height = img.height * 3;
        const ctx = c.getContext('2d')!;
        ctx.scale(3, 3);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        const a = document.createElement('a');
        a.download = `${currentDoc.name.replace(/\.btw.*/, '')}-label.png`;
        a.href = c.toDataURL('image/png');
        a.click();
      };
      img.src = url;
    } else {
      window.print();
    }
  };

  // Download vector SVG
  const handleExportSvg = () => {
    const svgElem = document.querySelector('svg[class*="objectSvgBarcode"]');
    if (svgElem) {
      const blob = new Blob([new XMLSerializer().serializeToString(svgElem)], { type: 'image/svg+xml' });
      const a = document.createElement('a');
      a.download = `${currentDoc.name.replace(/\.btw.*/, '')}-label.svg`;
      a.href = URL.createObjectURL(blob);
      a.click();
    }
  };

  return (
    <div className={styles.appShell}>
      {/* ─── Window Title Bar matching Photo 13 ──────────────────────────────── */}
      <div className={styles.titleBar}>
        <div className={styles.titleBarLeft}>
          <div className={styles.appLogoMark}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect width="16" height="16" rx="2" fill="#205088" />
              <rect x="2" y="3" width="2" height="10" fill="#fff" />
              <rect x="5" y="4" width="1" height="9" fill="#fff" />
              <rect x="7" y="3" width="2.5" height="10" fill="#fff" />
              <rect x="11" y="5" width="1" height="8" fill="#fff" />
              <rect x="13" y="3" width="1.5" height="10" fill="#fff" />
            </svg>
          </div>
          <span>BarTender UltraLite - [{currentDoc.name}]</span>
        </div>
        <div className={styles.titleBarControls}>
          <button className={styles.wc} title="Minimize">─</button>
          <button className={styles.wc} title="Maximize">□</button>
          <button className={`${styles.wc} ${styles.wcClose}`} title="Close">✕</button>
        </div>
      </div>

      {/* ─── BarTender Menu Bar ────────────────────────────────────────────── */}
      <div className={styles.menuBar} ref={menuRef}>
        {(['File', 'Edit', 'View', 'Create', 'Arrange', 'Administer', 'Tools', 'Window', 'Help'] as ActiveMenu[]).map((menuName) => (
          <div key={menuName!} className={styles.menuItem}>
            <button
              className={`${styles.menuBtn} ${activeMenu === menuName ? styles.menuBtnActive : ''}`}
              onClick={() => setActiveMenu(activeMenu === menuName ? null : menuName)}
            >
              {menuName}
            </button>

            {activeMenu === menuName && (
              <div className={styles.dropdown}>
                {menuName === 'File' && (
                  <>
                    <button className={styles.ddItem} onClick={() => { setActiveMenu(null); setShowWizard(true); }}>
                      <span className={styles.ddIcon}>📄</span>
                      <span>New Document Wizard...</span>
                      <span className={styles.ddKey}>Ctrl+N</span>
                    </button>
                    <button className={styles.ddItem} onClick={() => setActiveMenu(null)}>
                      <span className={styles.ddIcon}>📂</span>
                      <span>Open...</span>
                      <span className={styles.ddKey}>Ctrl+O</span>
                    </button>
                    <button className={styles.ddItem} onClick={() => { updateCurrentDoc({ isDirty: false }); setActiveMenu(null); }}>
                      <span className={styles.ddIcon}>💾</span>
                      <span>Save</span>
                      <span className={styles.ddKey}>Ctrl+S</span>
                    </button>
                    <div className={styles.ddSep} />
                    <button className={styles.ddItem} onClick={() => { setActiveMenu(null); setShowDocProps(true); }}>
                      <span className={styles.ddIcon}>⚙️</span>
                      <span>Page Setup...</span>
                    </button>
                    <button className={styles.ddItem} onClick={() => { setActiveMenu(null); setShowPrintModal(true); }}>
                      <span className={styles.ddIcon}>🖨️</span>
                      <span>Print...</span>
                      <span className={styles.ddKey}>Ctrl+P</span>
                    </button>
                    <div className={styles.ddSep} />
                    <button className={styles.ddItem} onClick={() => setActiveMenu(null)}>
                      <span className={styles.ddIcon}>✕</span>
                      <span>Exit</span>
                    </button>
                  </>
                )}

                {menuName === 'Edit' && (
                  <>
                    <button className={styles.ddItem} onClick={() => setActiveMenu(null)}>
                      <span className={styles.ddIcon}>↩️</span>
                      <span>Undo</span>
                      <span className={styles.ddKey}>Ctrl+Z</span>
                    </button>
                    <button className={styles.ddItem} onClick={() => setActiveMenu(null)}>
                      <span className={styles.ddIcon}>↪️</span>
                      <span>Redo</span>
                      <span className={styles.ddKey}>Ctrl+Y</span>
                    </button>
                    <div className={styles.ddSep} />
                    <button className={styles.ddItem} onClick={() => { if (selectedObject) handleDeleteObject(selectedObject.id); setActiveMenu(null); }}>
                      <span className={styles.ddIcon}>🗑️</span>
                      <span>Delete</span>
                      <span className={styles.ddKey}>Del</span>
                    </button>
                  </>
                )}

                {menuName === 'View' && (
                  <>
                    <button className={styles.ddItem} onClick={() => { setShowGrid(!showGrid); setActiveMenu(null); }}>
                      <span className={styles.ddIcon}>{showGrid ? '✓' : ' '}</span>
                      <span>Gridlines</span>
                      <span className={styles.ddKey}>Ctrl+G</span>
                    </button>
                    <div className={styles.ddSep} />
                    <button className={styles.ddItem} onClick={() => { setZoom((z) => Math.min(z + 50, 800)); setActiveMenu(null); }}>
                      <span className={styles.ddIcon}>+</span>
                      <span>Zoom In</span>
                    </button>
                    <button className={styles.ddItem} onClick={() => { setZoom((z) => Math.max(z - 50, 50)); setActiveMenu(null); }}>
                      <span className={styles.ddIcon}>−</span>
                      <span>Zoom Out</span>
                    </button>
                    <button className={styles.ddItem} onClick={() => { setZoom(100); setActiveMenu(null); }}>
                      <span className={styles.ddIcon}>⊙</span>
                      <span>Zoom 100%</span>
                    </button>
                    <button className={styles.ddItem} onClick={() => { setZoom(439); setActiveMenu(null); }}>
                      <span className={styles.ddIcon}>🔍</span>
                      <span>BarTender Default (439%)</span>
                    </button>
                  </>
                )}

                {menuName === 'Create' && (
                  <>
                    <button className={styles.ddItem} onClick={() => { handleAddBarcode('CODE128'); setActiveMenu(null); }}>
                      <span className={styles.ddIcon}>📊</span>
                      <span>Barcode (Code 128)</span>
                    </button>
                    <button className={styles.ddItem} onClick={() => { handleAddBarcode('QR'); setActiveMenu(null); }}>
                      <span className={styles.ddIcon}>📱</span>
                      <span>2D QR Code</span>
                    </button>
                    <button className={styles.ddItem} onClick={() => { handleAddText(); setActiveMenu(null); }}>
                      <span className={styles.ddIcon}>🔤</span>
                      <span>Text Object</span>
                    </button>
                    <button className={styles.ddItem} onClick={() => { handleAddLine(); setActiveMenu(null); }}>
                      <span className={styles.ddIcon}>━</span>
                      <span>Line</span>
                    </button>
                    <button className={styles.ddItem} onClick={() => { handleAddShape('roundedRectangle'); setActiveMenu(null); }}>
                      <span className={styles.ddIcon}>▢</span>
                      <span>Rounded Rectangle</span>
                    </button>
                  </>
                )}

                {menuName === 'Arrange' && (
                  <>
                    <button className={styles.ddItem} onClick={() => { if (selectedObject) handleUpdateObject({ ...selectedObject, zIndex: 100 }); setActiveMenu(null); }}>
                      <span className={styles.ddIcon}>⬆️</span>
                      <span>Bring to Front</span>
                    </button>
                    <button className={styles.ddItem} onClick={() => { if (selectedObject) handleUpdateObject({ ...selectedObject, zIndex: 1 }); setActiveMenu(null); }}>
                      <span className={styles.ddIcon}>⬇️</span>
                      <span>Send to Back</span>
                    </button>
                  </>
                )}

                {menuName === 'Administer' && (
                  <>
                    <button className={styles.ddItem} onClick={() => { setShowPrinterProps(true); setActiveMenu(null); }}>
                      <span className={styles.ddIcon}>🖨️</span>
                      <span>Printer Configuration...</span>
                    </button>
                  </>
                )}

                {menuName === 'Tools' && (
                  <>
                    <button className={styles.ddItem} onClick={() => { setShowBatchModal(true); setActiveMenu(null); }}>
                      <span className={styles.ddIcon}>🔢</span>
                      <span>Batch Barcode Wizard...</span>
                    </button>
                    <button className={styles.ddItem} onClick={() => { setActiveSheetTab('form'); setActiveMenu(null); }}>
                      <span className={styles.ddIcon}>📝</span>
                      <span>Data Entry Form (Form 1)</span>
                    </button>
                  </>
                )}

                {menuName === 'Window' && (
                  <>
                    {documents.map((d) => (
                      <button
                        key={d.id}
                        className={styles.ddItem}
                        onClick={() => { setActiveDocId(d.id); setActiveMenu(null); }}
                      >
                        <span className={styles.ddIcon}>{activeDocId === d.id ? '✓' : ' '}</span>
                        <span>{d.name}</span>
                      </button>
                    ))}
                  </>
                )}

                {menuName === 'Help' && (
                  <>
                    <button className={styles.ddItem} onClick={() => { alert('BarTender UltraLite Label Designer\nIncludes full New Document Wizard and high-precision barcode layout.'); setActiveMenu(null); }}>
                      <span className={styles.ddIcon}>ℹ️</span>
                      <span>About BarTender UltraLite</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ─── Upper Toolbar Row 1 ─────────────────────────────────────────── */}
      <MainToolbar
        onNew={() => setShowWizard(true)}
        onOpen={() => alert('Open document: Please select a file from local templates.')}
        onSave={() => updateCurrentDoc({ isDirty: false })}
        onPrint={() => setShowPrintModal(true)}
        onPrintPreview={() => setShowPrintModal(true)}
        onCut={() => { if (selectedObject) handleDeleteObject(selectedObject.id); }}
        onCopy={() => {}}
        onPaste={() => {}}
        onDelete={() => { if (selectedObject) handleDeleteObject(selectedObject.id); }}
        onUndo={() => {}}
        onRedo={() => {}}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        onAddBarcode={handleAddBarcode}
        onAddText={handleAddText}
        onAddShape={handleAddShape}
        onAddLine={handleAddLine}
        onAddImage={handleAddImage}
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(z + 50, 800))}
        onZoomOut={() => setZoom((z) => Math.max(z - 50, 50))}
        onZoom100={() => setZoom(100)}
        onZoomFit={() => setZoom(439)}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
      />

      {/* ─── Lower Formatting Ribbon Toolbar Row 2 ───────────────────────── */}
      <FormatToolbar
        fontFamily={fontFamily}
        setFontFamily={(f) => { setFontFamily(f); handleUpdateFormat('fontFamily', f); }}
        fontSize={fontSize}
        setFontSize={(s) => { setFontSize(s); handleUpdateFormat('fontSize', s); }}
        bold={bold}
        setBold={(b) => { setBold(b); handleUpdateFormat('bold', b); }}
        italic={italic}
        setItalic={(i) => { setItalic(i); handleUpdateFormat('italic', i); }}
        underline={underline}
        setUnderline={(u) => { setUnderline(u); handleUpdateFormat('underline', u); }}
        strike={strike}
        setStrike={(s) => { setStrike(s); handleUpdateFormat('strike', s); }}
        color={color}
        setColor={(c) => { setColor(c); handleUpdateFormat('color', c); }}
        bgColor={bgColor}
        setBgColor={setBgColor}
        align={align}
        setAlign={(a) => { setAlign(a); handleUpdateFormat('align', a); }}
        lineWidth={lineWidth}
        setLineWidth={setLineWidth}
      />

      {/* ─── Document Tab Strip matching Photo 13: AAF.btw x, Document1.btw * x ── */}
      <div className={styles.docTabStrip}>
        {documents.map((d) => (
          <div
            key={d.id}
            className={`${styles.docTab} ${d.id === activeDocId ? styles.docTabActive : ''}`}
            onClick={() => setActiveDocId(d.id)}
          >
            <span>{d.name}</span>
            <span
              className={styles.docTabClose}
              onClick={(e) => handleCloseTab(d.id, e)}
              title="Close Document"
            >
              ✕
            </span>
          </div>
        ))}

        <button
          className={styles.docTabNew}
          onClick={() => setShowWizard(true)}
          title="Create New Label Document"
        >
          +
        </button>
      </div>

      {/* ─── Main Workspace: Left Sidebar + Canvas / Form View + Right Panel ── */}
      <div className={styles.workspace}>
        {/* Left Sidebar: Components & Data Sources */}
        <LeftSidebar
          onInsertSample={(objs) => {
            updateCurrentDoc({
              objects: [...currentDoc.objects, ...objs],
              selectedObjectId: objs[0]?.id || null,
            });
          }}
          onInsertDataSource={(type, name) => {
            handleAddText();
          }}
        />

        {/* Center: Template Designer or Form 1 Data Entry */}
        {activeSheetTab === 'template' ? (
          <LabelCanvas
            settings={currentDoc.settings}
            objects={currentDoc.objects}
            selectedObjectId={currentDoc.selectedObjectId}
            onSelectObject={(id) => updateCurrentDoc({ selectedObjectId: id })}
            onUpdateObject={handleUpdateObject}
            onDeleteObject={handleDeleteObject}
            zoom={zoom}
            showGrid={showGrid}
            onMouseMoveCoords={(x, y) => setMouseCoords({ x, y })}
          />
        ) : (
          <Form1View
            settings={currentDoc.settings}
            objects={currentDoc.objects}
            onUpdateFieldValue={(objId, val) => {
              const target = currentDoc.objects.find((o) => o.id === objId);
              if (target) {
                if (target.type === 'barcode') handleUpdateObject({ ...target, value: val });
                if (target.type === 'text') handleUpdateObject({ ...target, text: val });
              }
            }}
            onPrint={() => setShowPrintModal(true)}
            onReturnToTemplate={() => setActiveSheetTab('template')}
          />
        )}

        {/* Right Inspector / Properties Panel */}
        <RightPropertiesPanel
          settings={currentDoc.settings}
          selectedObject={selectedObject}
          onUpdateObject={handleUpdateObject}
          onOpenBatchModal={() => setShowBatchModal(true)}
          onPrint={() => setShowPrintModal(true)}
          onExportPng={handleExportPng}
          onExportSvg={handleExportSvg}
        />
      </div>

      {/* ─── Bottom Status Bar & Sheet Tabs matching Photo 13 ─────────────── */}
      <div className={styles.statusBar}>
        <div className={styles.sheetTabs}>
          <button
            className={`${styles.sheetTab} ${activeSheetTab === 'template' ? styles.sheetTabActive : ''}`}
            onClick={() => setActiveSheetTab('template')}
          >
            <span>📄</span>
            <span>Template 1</span>
          </button>
          <button
            className={`${styles.sheetTab} ${activeSheetTab === 'form' ? styles.sheetTabActive : ''}`}
            onClick={() => setActiveSheetTab('form')}
          >
            <span>📝</span>
            <span>Form 1</span>
          </button>
        </div>

        <div className={styles.statusIndicators}>
          <div className={styles.statusItem}>
            <span>🖨️</span>
            <span>Printer: {currentDoc.settings.printer}</span>
          </div>

          <div className={styles.statusItem}>
            <span>Item Width: {currentDoc.settings.templateWidthMm.toFixed(1)}mm</span>
            <span style={{ marginLeft: '6px' }}>Item Height: {currentDoc.settings.templateHeightMm.toFixed(1)}mm</span>
          </div>

          <div className={`${styles.statusItem} ${styles.statusCoords}`}>
            <span>X: {mouseCoords.x}mm</span>
            <span style={{ marginLeft: '6px' }}>Y: {mouseCoords.y}mm</span>
          </div>

          <div className={styles.statusItem}>
            <span>Zoom: {zoom}%</span>
          </div>
        </div>
      </div>

      {/* ─── Modals ───────────────────────────────────────────────────────── */}
      {showWizard && (
        <NewDocumentWizard
          onFinish={handleWizardFinish}
          onCancel={() => setShowWizard(false)}
        />
      )}

      {showPrintModal && (
        <PrintModal
          settings={currentDoc.settings}
          objects={currentDoc.objects}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {showBatchModal && (
        <BatchModal
          onGenerateBatch={(list) => {
            // Apply generated series into the document or print queue
            alert(`Generated ${list.length} sequential barcodes successfully!`);
          }}
          onClose={() => setShowBatchModal(false)}
        />
      )}

      {showPrinterProps && (
        <PrinterPropertiesModal
          printerName={currentDoc.settings.printer}
          onClose={() => setShowPrinterProps(false)}
        />
      )}

      {showDocProps && (
        <DocumentPropertiesModal
          printerName={currentDoc.settings.printer}
          onClose={() => setShowDocProps(false)}
        />
      )}
    </div>
  );
}
