import React, { useState } from 'react';
import styles from './Modals.module.css';

interface DocumentPropertiesModalProps {
  printerName: string;
  onClose: () => void;
}

export const DocumentPropertiesModal: React.FC<DocumentPropertiesModalProps> = ({
  printerName,
  onClose,
}) => {
  const [copies, setCopies] = useState('1');
  const [paperSource, setPaperSource] = useState('Default Roll Feeder');
  const [colorHandling, setColorHandling] = useState('Monochrome (Black & White)');

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.dialogWindow}>
        <div className={styles.dialogTitleBar}>
          <span>Document Properties - [{printerName}]</span>
          <button className={styles.dialogCloseBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.tabHeader}>
          <div className={`${styles.tabBtn} ${styles.tabBtnActive}`}>Layout</div>
          <div className={styles.tabBtn}>Paper / Quality</div>
          <div className={styles.tabBtn}>Advanced</div>
        </div>

        <div className={styles.dialogBody}>
          <div className={styles.propSection}>
            <div className={styles.sectionHeader}>Page & Copies</div>
            <div className={styles.propRow}>
              <label>Number of Copies:</label>
              <input
                type="number"
                min="1"
                max="9999"
                value={copies}
                onChange={(e) => setCopies(e.target.value)}
                style={{ width: '60px' }}
              />
            </div>
            <div className={styles.propRow}>
              <label>Paper Source:</label>
              <select value={paperSource} onChange={(e) => setPaperSource(e.target.value)}>
                <option value="Default Roll Feeder">Default Roll Feeder</option>
                <option value="Manual Feed">Manual Feed</option>
                <option value="Tractor Feed">Tractor Feed</option>
              </select>
            </div>
          </div>

          <div className={styles.propSection}>
            <div className={styles.sectionHeader}>Color & Dithering</div>
            <div className={styles.propRow}>
              <label>Color Mode:</label>
              <select value={colorHandling} onChange={(e) => setColorHandling(e.target.value)}>
                <option value="Monochrome (Black & White)">Monochrome (Black & White)</option>
                <option value="Grayscale (Dithered)">Grayscale (Dithered)</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.dialogFooter}>
          <button className={styles.btnPrimary} onClick={onClose}>OK</button>
          <button className={styles.btn} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

