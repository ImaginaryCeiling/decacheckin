'use client';

import { useEffect, useRef } from 'react';
import { mutate } from 'swr';

export const ScannerListener = () => {
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Don't interfere with input fields or textareas
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const now = Date.now();

      // Basic debounce: if keys are too far apart, it's likely manual typing, not a scanner.
      // However, we want to capture everything if it ends in Enter.
      // Scanners usually type very fast (<50ms per char).
      if (now - lastKeyTimeRef.current > 200) {
        bufferRef.current = '';
      }
      lastKeyTimeRef.current = now;

      // ALWAYS prevent default and stop propagation for ANY key when buffer is active
      // This prevents browser shortcuts and navigation (like "/" for quick search)
      if (bufferRef.current.length > 0) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (e.key === 'Enter') {
        e.preventDefault(); // Prevent form submission or navigation
        e.stopPropagation();
        const barcode = bufferRef.current;
        if (barcode.length > 5) { // arbitrary min length to avoid accidental Enters
          console.log('=== SCAN START ===');
          console.log('Scanned barcode:', barcode);
          console.log('Barcode length:', barcode.length);
          console.log('Current URL:', window.location.href);
          console.log('Sending to API:', JSON.stringify({ barcode }));

          try {
            const fetchUrl = '/api/scan';
            console.log('Fetching:', fetchUrl);
            const res = await fetch(fetchUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ barcode }),
            });

            console.log('Response status:', res.status);
            console.log('Response statusText:', res.statusText);
            console.log('Response URL:', res.url);
            console.log('Response type:', res.type);

            if (res.ok) {
              const data = await res.json();
              console.log('Scan success:', data);
              console.log('=== SCAN SUCCESS ===');
              // Refresh SWR data
              mutate('/api/users');
            } else {
              const errorText = await res.text();
              console.error('Scan failed!');
              console.error('Status:', res.status);
              console.error('Status Text:', res.statusText);
              console.error('Response URL:', res.url);
              console.error('Error body:', errorText);
              console.error('=== SCAN FAILED ===');
            }
          } catch (err) {
            console.error('=== FETCH ERROR ===');
            console.error('Error object:', err);
            console.error('Error message:', (err as Error).message);
            console.error('Error stack:', (err as Error).stack);
          }
        } else {
          console.log('Barcode too short, ignoring:', barcode);
        }
        bufferRef.current = '';
      } else if (e.key.length === 1) {
        // Only printable characters
        bufferRef.current += e.key;
        // Log first character to see when scanning starts
        if (bufferRef.current.length === 1) {
          console.log('Scanner input started...');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
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

