import React, { useState } from 'react';
import { BarcodeFormat } from '@/types/bartender';
import styles from './Modals.module.css';

interface BatchModalProps {
  onGenerateBatch: (barcodes: { format: BarcodeFormat; value: string }[]) => void;
  onClose: () => void;
}

export const BatchModal: React.FC<BatchModalProps> = ({
  onGenerateBatch,
  onClose,
}) => {
  const [prefix, setPrefix] = useState('SKU-');
  const [startNum, setStartNum] = useState(1001);
  const [count, setCount] = useState(16);
  const [step, setStep] = useState(1);
  const [format, setFormat] = useState<BarcodeFormat>('CODE128');

  const handleGenerate = () => {
    const list: { format: BarcodeFormat; value: string }[] = [];
    for (let i = 0; i < count; i++) {
      const num = startNum + i * step;
      list.push({
        format,
        value: `${prefix}${num}`,
      });
    }
    onGenerateBatch(list);
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.dialogWindow}>
        <div className={styles.dialogTitleBar}>
          <span>Batch Barcode Generation</span>
          <button className={styles.dialogCloseBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.dialogBody}>
          <div className={styles.propSection}>
            <div className={styles.sectionHeader}>Sequence Settings</div>
            <div className={styles.propRow}>
              <label>Barcode Format:</label>
              <select value={format} onChange={(e) => setFormat(e.target.value as BarcodeFormat)}>
                <option value="CODE128">Code 128</option>
                <option value="CODE39">Code 39</option>
                <option value="EAN13">EAN-13</option>
                <option value="QR">QR Code</option>
              </select>
            </div>
            <div className={styles.propRow}>
              <label>Prefix:</label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                style={{ width: '120px' }}
              />
            </div>
            <div className={styles.propRow}>
              <label>Starting Number:</label>
              <input
                type="number"
                value={startNum}
                onChange={(e) => setStartNum(parseInt(e.target.value) || 1)}
                style={{ width: '80px' }}
              />
            </div>
            <div className={styles.propRow}>
              <label>Quantity to Generate:</label>
              <input
                type="number"
                min="1"
                max="500"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                style={{ width: '80px' }}
              />
            </div>
          </div>
        </div>

        <div className={styles.dialogFooter}>
          <button className={styles.btnPrimary} onClick={handleGenerate}>Generate & Apply</button>
          <button className={styles.btn} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

