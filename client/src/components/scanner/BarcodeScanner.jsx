import useScanner from '../../hooks/useScanner';
import api from '../../services/api';
import Button from '../common/Button';
import { Camera, CameraOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BarcodeScanner({ onFound }) {
  const { videoRef, scanning, error, startScan, stopScan } = useScanner(async (code) => {
    try {
      toast.loading('Looking up barcode...', { id: 'scan' });
      const { data } = await api.get(`/products/scan/${code}`);
      toast.success(`Found: ${data.data.product.name}`, { id: 'scan' });
      onFound(data.data.product);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Product not found', { id: 'scan' });
    }
  });

  return (
    <div className="flex flex-col items-center gap-3">
      {scanning && (
        <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-gray-300">
          <video ref={videoRef} className="w-full" />
          <div className="absolute inset-0 border-2 border-blue-500/30 rounded-lg pointer-events-none" />
        </div>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button variant="outline" onClick={scanning ? stopScan : startScan}>
        {scanning ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
        {scanning ? 'Stop Scanner' : 'Scan Barcode / QR'}
      </Button>
    </div>
  );
}
