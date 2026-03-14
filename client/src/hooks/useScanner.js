import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

export default function useScanner(onResult) {
  const videoRef = useRef(null);
  const readerRef = useRef(new BrowserMultiFormatReader());
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);

  const startScan = async () => {
    setError(null);
    setScanning(true);
    try {
      await readerRef.current.decodeFromVideoDevice(null, videoRef.current, (result) => {
        if (result) {
          onResult(result.getText());
          stopScan();
        }
      });
    } catch (e) {
      setError('Camera access denied or not available');
      setScanning(false);
    }
  };

  const stopScan = () => {
    readerRef.current.reset();
    setScanning(false);
  };

  useEffect(() => {
    return () => readerRef.current.reset();
  }, []);

  return { videoRef, scanning, error, startScan, stopScan };
}
