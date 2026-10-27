import React, { useState } from 'react';
import { CanvasObject } from '@/types/bartender';
import styles from './LeftSidebar.module.css';

interface LeftSidebarProps {
  onInsertSample: (objects: CanvasObject[]) => void;
  onInsertDataSource: (type: string, name: string) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  onInsertSample,
  onInsertDataSource,
}) => {
  const [activeTab, setActiveTab] = useState<'components' | 'dataSources'>('components');
  const [componentsExpanded, setComponentsExpanded] = useState(true);
  const [samplesExpanded, setSamplesExpanded] = useState(true);
  const [dataSourcesExpanded, setDataSourcesExpanded] = useState(true);

  // Sample presets that can be added to the document
  const insertShippingLabel = () => {
    const objs: CanvasObject[] = [
      {
        id: `txt-carrier-${Date.now()}`,
        type: 'text',
        x: 2,
        y: 2,
        width: 21,
        height: 5,
        rotation: 0,
        zIndex: 1,
        text: 'EXPRESS POST',
        fontFamily: 'Printer Sans Serif',
        fontSize: 10,
        bold: true,
        italic: false,
        underline: false,
        strike: false,
        align: 'left',
        color: '#000',
      },
      {
        id: `bc-tracking-${Date.now()}`,
        type: 'barcode',
        x: 2,
        y: 8,
        width: 21,
        height: 16,
        rotation: 0,
        zIndex: 2,
        format: 'CODE128',
        value: 'TRK-9876543210',
        barWidth: 1.2,
        displayValue: true,
        fgColor: '#000',
        bgColor: '#fff',
        fontSize: 8,
      },
    ];
    onInsertSample(objs);
  };

  const insertRetailTag = () => {
    const objs: CanvasObject[] = [
      {
        id: `txt-store-${Date.now()}`,
        type: 'text',
        x: 2,
        y: 2,
        width: 21,
        height: 4,
        rotation: 0,
        zIndex: 1,
        text: 'DEPARTMENT STORE',
        fontFamily: 'Printer Sans Serif',
        fontSize: 8,
        bold: true,
        italic: false,
        underline: false,
        strike: false,
        align: 'center',
        color: '#000',
      },
      {
        id: `bc-upc-${Date.now()}`,
        type: 'barcode',
        x: 2,
        y: 7,
        width: 21,
        height: 18,
        rotation: 0,
        zIndex: 2,
        format: 'EAN13',
        value: '5901234123457',
        barWidth: 1.2,
        displayValue: true,
        fgColor: '#000',
        bgColor: '#fff',
        fontSize: 8,
      },
      {
        id: `txt-price-${Date.now()}`,
        type: 'text',
        x: 2,
        y: 27,
        width: 21,
        height: 6,
        rotation: 0,
        zIndex: 3,
        text: '$19.99',
        fontFamily: 'Printer Sans Serif',
        fontSize: 12,
        bold: true,
        italic: false,
        underline: false,
        strike: false,
        align: 'center',
        color: '#b00',
      },
    ];
    onInsertSample(objs);
  };

  const insertQRTag = () => {
    const objs: CanvasObject[] = [
      {
        id: `txt-scan-${Date.now()}`,
        type: 'text',
        x: 2,
        y: 2,
        width: 21,
        height: 4,
        rotation: 0,
        zIndex: 1,
        text: 'SCAN TO VERIFY',
        fontFamily: 'Printer Sans Serif',
        fontSize: 8,
        bold: true,
        italic: false,
        underline: false,
        strike: false,
        align: 'center',
        color: '#000',
      },
      {
        id: `bc-qr-${Date.now()}`,
        type: 'barcode',
        x: 4.5,
        y: 7,
        width: 16,
        height: 16,
        rotation: 0,
        zIndex: 2,
        format: 'QR',
        value: 'https://example.com/asset/A-8821',
        barWidth: 2,
        displayValue: false,
        fgColor: '#000',
        bgColor: '#fff',
        fontSize: 8,
      },
      {
        id: `txt-id-${Date.now()}`,
        type: 'text',
        x: 2,
        y: 25,
        width: 21,
        height: 4,
        rotation: 0,
        zIndex: 3,
        text: 'ID: A-8821',
        fontFamily: 'Printer Sans Serif',
        fontSize: 8,
        bold: false,
        italic: false,
        underline: false,
        strike: false,
        align: 'center',
        color: '#444',
      },
    ];
    onInsertSample(objs);
  };

  return (
    <div className={styles.leftSidebar}>
      <div className={styles.sidebarHeader}>
        <span>{activeTab === 'components' ? 'Components' : 'Data Sources'}</span>
        <button className={styles.sidebarCloseBtn} title="Minimize Sidebar">✕</button>
      </div>

      <div className={styles.treeContainer}>
        {activeTab === 'components' ? (
          <div>
            {/* Components Root */}
            <div
              className={styles.treeNode}
              onClick={() => setComponentsExpanded(!componentsExpanded)}
            >
              <span className={styles.treeToggleIcon}>{componentsExpanded ? '▼' : '►'}</span>
              <span className={styles.treeIcon}>📁</span>
              <span style={{ fontWeight: 600 }}>Components</span>
            </div>

            {componentsExpanded && (
              <div className={styles.treeChildren}>
                {/* Samples Subtree */}
                <div
                  className={styles.treeNode}
                  onClick={() => setSamplesExpanded(!samplesExpanded)}
                >
                  <span className={styles.treeToggleIcon}>{samplesExpanded ? '▼' : '►'}</span>
                  <span className={styles.treeIcon}>📂</span>
                  <span>Samples</span>
                </div>

                {samplesExpanded && (
                  <div className={styles.treeChildren}>
                    <div className={styles.sampleItem} onClick={insertRetailTag} title="Click to insert Retail Price Tag">
                      <span>🏷️</span>
                      <span>Retail Price Tag</span>
                    </div>
                    <div className={styles.sampleItem} onClick={insertShippingLabel} title="Click to insert Shipping Label">
                      <span>📦</span>
                      <span>Shipping Label</span>
                    </div>
                    <div className={styles.sampleItem} onClick={insertQRTag} title="Click to insert QR Code Tag">
                      <span>📱</span>
                      <span>QR Code Tag</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Data Sources Root */}
            <div
              className={styles.treeNode}
              onClick={() => setDataSourcesExpanded(!dataSourcesExpanded)}
            >
              <span className={styles.treeToggleIcon}>{dataSourcesExpanded ? '▼' : '►'}</span>
              <span className={styles.treeIcon}>🗄️</span>
              <span style={{ fontWeight: 600 }}>Data Sources</span>
            </div>

            {dataSourcesExpanded && (
              <div className={styles.treeChildren}>
                <div
                  className={styles.sampleItem}
                  onClick={() => onInsertDataSource('serial', 'Auto Serial Number')}
                >
                  <span>🔢</span>
                  <span>Serial Counter (#0001)</span>
                </div>
                <div
                  className={styles.sampleItem}
                  onClick={() => onInsertDataSource('date', 'Current Date')}
                >
                  <span>📅</span>
                  <span>Current Date / Time</span>
                </div>
                <div
                  className={styles.sampleItem}
                  onClick={() => onInsertDataSource('db', 'Database Field')}
                >
                  <span>📊</span>
                  <span>Database Item Field</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Tabs matching Photo 13 */}
      <div className={styles.tabFooter}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'dataSources' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('dataSources')}
        >
          <span>📊</span>
          <span>Data Sources</span>
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'components' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('components')}
        >
          <span>📦</span>
          <span>Components</span>
        </button>
      </div>
    </div>
  );
};

