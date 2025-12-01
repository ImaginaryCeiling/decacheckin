'use client';

import { useEffect, useRef } from 'react';
import { mutate } from 'swr';

export const ScannerListener = () => {
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const now = Date.now();
      
      // Basic debounce: if keys are too far apart, it's likely manual typing, not a scanner.
      // However, we want to capture everything if it ends in Enter.
      // Scanners usually type very fast (<50ms per char).
      if (now - lastKeyTimeRef.current > 200) {
        bufferRef.current = '';
      }
      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        const barcode = bufferRef.current;
        if (barcode.length > 5) { // arbitrary min length to avoid accidental Enters
          console.log('Scanned:', barcode);
          
          try {
            const res = await fetch('/api/scan', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ barcode }),
            });
            
            if (res.ok) {
              // Refresh SWR data
              mutate('/api/users');
              const data = await res.json();
              // Optional: Show toast notification
              console.log('Scan success:', data);
            } else {
              console.error('Scan failed');
            }
          } catch (err) {
            console.error(err);
          }
        }
        bufferRef.current = '';
      } else if (e.key.length === 1) {
        // Only printable characters
        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return null; // Headless component
};

