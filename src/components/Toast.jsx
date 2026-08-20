import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onRemoveToast }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map(toast => {
        let Icon = CheckCircle2;
        let color = '#10b981';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          color = '#ef4444';
        } else if (toast.type === 'info') {
          Icon = Info;
          color = '#06b6d4';
        }

        return (
          <div
            key={toast.id}
            className="toast"
            style={{
              borderLeft: `4px solid ${color}`,
            }}
            role="alert"
          >
            <Icon size={18} color={color} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, wordBreak: 'break-word' }}>{toast.message}</span>
            <button
              onClick={() => onRemoveToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                minWidth: '28px',
                minHeight: '28px',
                borderRadius: 'var(--radius-sm)',
              }}
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
