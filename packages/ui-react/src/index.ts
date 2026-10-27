import React, { useState, useEffect, useRef } from 'react';
import { trapFocus, dismissOnEscape, dismissOnOutsideClick, scrollLock, rovingFocus } from '@coherynui/components';

/* -------------------------------------------------------------------------- */
/*                                   ACTIONS                                  */
/* -------------------------------------------------------------------------- */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'subtle' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', isLoading = false, className = '', disabled, ...props }, ref) => {
    const variantClass =
      variant === 'glass'
        ? 'glass hover:lift'
        : variant === 'primary'
        ? 'bg-brand fg-primary'
        : variant === 'danger'
        ? 'bg-[#ef4444] fg-primary'
        : variant === 'subtle'
        ? 'border-subtle fg-muted hover:bg-surface'
        : 'bg-surface border fg-primary';

    const sizeClass =
      size === 'sm'
        ? 'px-3 py-1.5 text-sm radius-md'
        : size === 'lg'
        ? 'px-6 py-3 text-lg radius-xl'
        : 'px-4 py-2 text-base radius-lg';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center weight-medium transition-colors touch-target tap-transparent select-none ${sizeClass} ${variantClass} ${className}`.trim()}
        {...props}
      >
        {isLoading && <span className="mr-2 inline-block"><Spinner size="sm" /></span>}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  variant?: 'primary' | 'secondary' | 'glass' | 'subtle' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ children, variant = 'subtle', size = 'md', isLoading = false, className = '', disabled, 'aria-label': ariaLabel, ...props }, ref) => {
    const variantClass =
      variant === 'glass'
        ? 'glass hover:lift'
        : variant === 'primary'
        ? 'bg-brand fg-primary'
        : variant === 'danger'
        ? 'bg-[#ef4444] fg-primary'
        : variant === 'subtle'
        ? 'border-subtle fg-muted hover:bg-surface'
        : 'bg-surface border fg-primary';

    const sizeClass =
      size === 'sm'
        ? 'p-2 text-sm radius-md'
        : size === 'lg'
        ? 'p-3.5 text-lg radius-xl'
        : 'p-2.5 text-base radius-lg';

    return (
      <button
        ref={ref}
        aria-label={ariaLabel}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center weight-medium transition-colors touch-target tap-transparent select-none ${sizeClass} ${variantClass} ${className}`.trim()}
        {...props}
      >
        {isLoading ? <Spinner size="sm" /> : children}
      </button>
    );
  }
);
IconButton.displayName = 'IconButton';

export const ButtonGroup: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`cluster gap-1 p-1 radius-lg bg-surface border-subtle ${className}`.trim()}>
    {children}
  </div>
);

/* -------------------------------------------------------------------------- */
/*                                    FORMS                                   */
/* -------------------------------------------------------------------------- */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isInvalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ isInvalid = false, className = '', ...props }, ref) => {
    const errorBorder = isInvalid ? 'border-[#ef4444]' : 'border-subtle';
    return (
      <input
        ref={ref}
        aria-invalid={isInvalid}
        className={`w-full px-3.5 py-2 radius-lg bg-surface border ${errorBorder} text-base fg-primary transition-colors focus:border-brand ${className}`.trim()}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ className = '', children, ...props }) => (
  <label className={`block text-sm weight-semibold fg-muted mb-1.5 ${className}`.trim()} {...props}>
    {children}
  </label>
);

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, disabled = false }) => {
  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 radius-full transition-colors relative ${checked ? 'bg-brand' : 'bg-[#cbd5e1]'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 radius-full bg-surface transition-transform shadow-sm ${
            checked ? 'translate-x-5' : ''
          }`}
          style={{ transform: checked ? 'translateX(20px)' : 'translateX(0px)', transition: 'transform 150ms ease' }}
        />
      </button>
      {label && <span className="text-sm weight-medium fg-primary">{label}</span>}
    </label>
  );
};

/* -------------------------------------------------------------------------- */
/*                                  OVERLAYS                                  */
/* -------------------------------------------------------------------------- */

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, description, children }) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const unlockScroll = scrollLock();
    const unbindEsc = dismissOnEscape(onClose);
    const trap = dialogRef.current ? trapFocus(dialogRef.current) : null;

    return () => {
      unlockScroll();
      unbindEsc();
      trap?.release();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(0,0,0,0.5)] transition-opacity"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="w-full max-w-lg p-6 radius-2xl bg-surface border shadow-xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="dialog-title" className="text-xl weight-bold fg-primary">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 radius-md fg-muted hover:fg-primary transition-colors"
          >
            ✕
          </button>
        </div>
        {description && <p className="text-sm fg-muted mb-4">{description}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                 NAVIGATION                                 */
/* -------------------------------------------------------------------------- */

export interface TabsProps {
  tabs: { id: string; label: string; content: React.ReactNode }[];
  defaultTab?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const tabListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tabListRef.current) return;
    const tabButtons = Array.from(tabListRef.current.querySelectorAll<HTMLElement>('button[role="tab"]'));
    const controller = rovingFocus(tabListRef.current, tabButtons, 'horizontal', (idx) => {
      setActiveTab(tabs[idx].id);
    });
    return () => controller.unbind();
  }, [tabs]);

  return (
    <div className="w-full">
      <div ref={tabListRef} role="tablist" aria-orientation="horizontal" className="cluster gap-2 border-b pb-2 mb-4">
        {tabs.map((tab) => {
          const isSelected = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isSelected}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 radius-lg text-sm weight-semibold transition-colors ${
                isSelected ? 'bg-brand fg-primary' : 'fg-muted hover:bg-surface'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => {
        if (tab.id !== activeTab) return null;
        return (
          <div key={tab.id} role="tabpanel" id={`panel-${tab.id}`} aria-labelledby={`tab-${tab.id}`}>
            {tab.content}
          </div>
        );
      })}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                  FEEDBACK                                  */
/* -------------------------------------------------------------------------- */

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const dim = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${dim} border-2 border-brand border-t-transparent radius-full animate-spin`}
      style={{ animation: 'spin 1s linear infinite' }}
    />
  );
};

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'brand' | 'success' | 'warning' }> = ({
  children,
  variant = 'brand',
}) => {
  const bg = variant === 'success' ? 'bg-[#10b981]' : variant === 'warning' ? 'bg-[#f59e0b]' : 'bg-brand';
  return <span className={`inline-flex px-2.5 py-0.5 text-xs weight-bold radius-full fg-primary ${bg}`}>{children}</span>;
};

/* -------------------------------------------------------------------------- */
/*                                DATA DISPLAY                                */
/* -------------------------------------------------------------------------- */

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-6 radius-xl bg-surface border shadow-md transition-shadow hover:shadow-lg ${className}`.trim()}>
    {children}
  </div>
);

export const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`glass p-6 radius-xl shadow-lg transition-transform hover:lift ${className}`.trim()}>
    {children}
  </div>
);

/* -------------------------------------------------------------------------- */
/*                 TOUCH-FIRST MOBILE COMPONENTS (COH-AMD-1.4)                */
/* -------------------------------------------------------------------------- */

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  dismissThreshold?: number; // px downward drag before dismiss
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  dismissThreshold = 100,
}) => {
  const [dragY, setDragY] = useState(0);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const unlock = scrollLock();
      const unescape = dismissOnEscape(onClose);
      return () => {
        unlock();
        unescape();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function onPointerDown(e: React.PointerEvent) {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!isDraggingRef.current) return;
    const dy = Math.max(0, e.clientY - startYRef.current);
    setDragY(dy);
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);

    if (dragY > dismissThreshold) {
      onClose();
    }
    setDragY(0);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Bottom Sheet'}
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm transition-opacity overscroll-none"
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: `translateY(${dragY}px)`,
          transition: isDraggingRef.current ? 'none' : 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="w-full max-w-lg mx-auto bg-surface border-t radius-xl shadow-2xl p-6 overscroll-contain"
      >
        {/* Tactile Drag Affordance Handle */}
        <div
          className="flex justify-center py-2 cursor-grab touch-none select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="w-12 h-1.5 radius-full bg-white/20" />
        </div>

        {title && <h3 className="text-xl weight-bold fg-primary mb-3">{title}</h3>}
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                               LAYOUT RECIPES                               */
/* -------------------------------------------------------------------------- */

export interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: '1' | '2' | '3' | '4' | '6' | '8';
  children: React.ReactNode;
}

export const Stack: React.FC<LayoutProps> = ({ children, gap = '4', className = '', ...props }) => (
  <div className={`stack gap-${gap} ${className}`.trim()} {...props}>
    {children}
  </div>
);

export const Cluster: React.FC<LayoutProps> = ({ children, gap = '4', className = '', ...props }) => (
  <div className={`cluster gap-${gap} ${className}`.trim()} {...props}>
    {children}
  </div>
);

export const Center: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`center ${className}`.trim()} {...props}>
    {children}
  </div>
);

/* -------------------------------------------------------------------------- */
/*                              TOUCH & HAPTICS                               */
/* -------------------------------------------------------------------------- */

export function useHaptic() {
  const trigger = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const duration = type === 'light' ? 10 : type === 'medium' ? 25 : 50;
      try {
        navigator.vibrate(duration);
      } catch {
        // Safe no-op on unsupported environments
      }
    }
  };
  return { trigger };
}


