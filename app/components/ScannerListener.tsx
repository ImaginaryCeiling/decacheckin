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
          console.log('Scanned barcode:', barcode);
          console.log('Barcode length:', barcode.length);
          console.log('Sending to API:', JSON.stringify({ barcode }));

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
              const errorData = await res.json();
              console.error('Scan failed:', res.status, errorData);
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

  // Development-only test UI
  if (process.env.NODE_ENV === 'development') {
    return (
      <div style={{ position: 'fixed', bottom: 10, right: 10, background: 'white', padding: 10, border: '1px solid #ccc', borderRadius: 5, zIndex: 9999 }}>
        <input
          type="text"
          placeholder="Test barcode..."
          style={{ padding: 5, marginRight: 5 }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const input = e.currentTarget;
              const barcode = input.value;
              if (barcode) {
                console.log('Test scan:', barcode);
                fetch('/api/scan', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ barcode }),
                })
                  .then(res => res.json())
                  .then(data => {
                    console.log('Test scan result:', data);
                    mutate('/api/users');
                  })
                  .catch(err => console.error('Test scan error:', err));
                input.value = '';
              }
            }
          }}
        />
        <small style={{ display: 'block', marginTop: 5, color: '#666' }}>Dev only: Test scanner</small>
      </div>
    );
  }

  return null; // Headless component
};

