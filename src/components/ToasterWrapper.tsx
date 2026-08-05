"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterWrapper() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        className: 'custom-toaster',
        style: {
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          color: '#1C2333',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
          borderRadius: '16px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '500',
          zIndex: 99999
        },
        success: {
          iconTheme: {
            primary: '#16A34A',
            secondary: 'white',
          },
        },
        error: {
          iconTheme: {
            primary: '#DC2626',
            secondary: 'white',
          },
        },
      }}
    />
  );
}
