import React, { useState, useEffect, useRef } from 'react';
import { trapFocus, dismissOnEscape, dismissOnOutsideClick, scrollLock, rovingFocus } from '@coheryn/coherynui-components';

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
  variant?: 'pills' | 'lifted' | 'bordered' | 'line';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab, variant = 'pills', className = '' }) => {
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

  const variantClass = variant === 'lifted' || variant === 'bordered' ? 'cyn-tabs-lifted' : variant === 'line' ? 'cyn-tabs-line' : 'cyn-tabs-pills';

  return (
    <div className={`cyn-tabs ${variantClass} w-full ${className}`}>
      <div ref={tabListRef} role="tablist" aria-orientation="horizontal" className="cyn-tablist">
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
              className={`cyn-tab-btn ${isSelected ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => {
        if (tab.id !== activeTab) return null;
        return (
          <div key={tab.id} role="tabpanel" id={`panel-${tab.id}`} aria-labelledby={`tab-${tab.id}`} className="cyn-tabpanel active">
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

/* -------------------------------------------------------------------------- */
/*                                    MODAL                                   */
/* -------------------------------------------------------------------------- */

export const Modal = Dialog;
export type ModalProps = DialogProps;

/* -------------------------------------------------------------------------- */
/*                                   DRAWER                                   */
/* -------------------------------------------------------------------------- */

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  placement?: 'left' | 'right';
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  placement = 'right',
  children,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const unlock = scrollLock();
    const unbindEsc = dismissOnEscape(onClose);
    const trap = drawerRef.current ? trapFocus(drawerRef.current) : null;

    return () => {
      unlock();
      unbindEsc();
      trap?.release();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLeft = placement === 'left';

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex bg-[rgba(0,0,0,0.6)] backdrop-blur-sm transition-opacity"
      style={{ justifyContent: isLeft ? 'flex-start' : 'flex-end' }}
      onClick={onClose}
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Drawer'}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md h-full bg-surface border shadow-2xl p-6 flex flex-col transition-transform"
        style={{
          borderLeftWidth: isLeft ? 0 : '1px',
          borderRightWidth: isLeft ? '1px' : 0,
        }}
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-subtle">
          {title ? (
            <h3 className="text-xl weight-bold fg-primary">{title}</h3>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1.5 radius-md fg-muted hover:fg-primary transition-colors touch-target"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                   POPOVER                                  */
/* -------------------------------------------------------------------------- */

export interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  content,
  isOpen: controlledOpen,
  onOpenChange,
  placement = 'bottom',
  className = '',
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const containerRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    const next = !isOpen;
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const close = () => {
    if (controlledOpen === undefined) setUncontrolledOpen(false);
    onOpenChange?.(false);
  };

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const unbindClick = dismissOnOutsideClick(containerRef.current, close);
    const unbindEsc = dismissOnEscape(close);
    return () => {
      unbindClick();
      unbindEsc();
    };
  }, [isOpen]);

  const placementClass =
    placement === 'top'
      ? 'bottom-full mb-2'
      : placement === 'left'
      ? 'right-full mr-2 top-0'
      : placement === 'right'
      ? 'left-full ml-2 top-0'
      : 'top-full mt-2';

  return (
    <div ref={containerRef} className="relative inline-block">
      <div onClick={toggle} className="cursor-pointer inline-block">
        {trigger}
      </div>
      {isOpen && (
        <div
          role="dialog"
          className={`absolute z-50 ${placementClass} w-64 p-4 radius-xl bg-surface border shadow-xl ${className}`.trim()}
        >
          {content}
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                DROPDOWN MENU                               */
/* -------------------------------------------------------------------------- */

export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  placement?: 'bottom-left' | 'bottom-right';
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  placement = 'bottom-left',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const unbindClick = dismissOnOutsideClick(containerRef.current, close);
    const unbindEsc = dismissOnEscape(close);
    return () => {
      unbindClick();
      unbindEsc();
    };
  }, [isOpen]);

  const alignClass = placement === 'bottom-right' ? 'right-0' : 'left-0';

  return (
    <div ref={containerRef} className="relative inline-block">
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        className="cursor-pointer inline-block"
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={`absolute top-full mt-2 z-50 ${alignClass} min-w-[180px] p-1.5 radius-xl bg-surface border shadow-xl cyn-transition-scale ${
            placement === 'bottom-right' ? 'cyn-origin-top-right' : 'cyn-origin-top-left'
          } ${className}`.trim()}
        >
          {items.map((item) => (
            <button
              key={item.id}
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                if (item.disabled) return;
                item.onClick?.();
                close();
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 radius-lg text-sm weight-medium transition-colors text-left touch-target tap-transparent ${
                item.disabled
                  ? 'opacity-40 cursor-not-allowed'
                  : item.danger
                  ? 'fg-[#ef4444] hover:bg-[#ef4444]/10'
                  : 'fg-primary hover:bg-surface'
              }`.trim()}
            >
              {item.icon && <span className="text-base">{item.icon}</span>}
              <span className="flex-1">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
export const Dropdown = DropdownMenu;

/* -------------------------------------------------------------------------- */
/*                                   NAVBAR                                   */
/* -------------------------------------------------------------------------- */

export interface NavbarProps {
  pattern?: 'drawer' | 'ribbon' | 'bottom' | 'stacked';
  brand?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  pattern = 'ribbon',
  brand,
  children,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const patternClass = `cyn-nav-${pattern}`;

  return (
    <header className={`cyn-navbar ${patternClass} ${isOpen ? 'is-open' : ''} ${className}`.trim()}>
      {brand && <div className="cyn-brand-lockup">{brand}</div>}
      <button
        className={`cyn-hamburger-btn ${isOpen ? 'is-open' : ''}`}
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="cyn-hamburger-line" />
        <span className="cyn-hamburger-line" />
        <span className="cyn-hamburger-line" />
      </button>
      <div
        className={`cyn-nav-backdrop ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen(false)}
      />
      <nav className="cyn-nav-container">
        {children}
      </nav>
    </header>
  );
};

/* -------------------------------------------------------------------------- */
/*                                    TOAST                                   */
/* -------------------------------------------------------------------------- */

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  duration?: number;
}

export interface ToastContextValue {
  show: (toast: Omit<ToastItem, 'id'>) => string;
  dismiss: (id: string) => void;
  success: (title: string, description?: string) => string;
  warning: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
  children: React.ReactNode;
  position?: 'top-right' | 'bottom-right' | 'bottom-center';
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const show = (toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newItem: ToastItem = { ...toast, id };
    setToasts((prev) => [...prev, newItem]);

    const duration = toast.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
    return id;
  };

  const success = (title: string, description?: string) => show({ title, description, variant: 'success' });
  const warning = (title: string, description?: string) => show({ title, description, variant: 'warning' });
  const error = (title: string, description?: string) => show({ title, description, variant: 'danger' });
  const info = (title: string, description?: string) => show({ title, description, variant: 'info' });

  const posClass =
    position === 'bottom-center'
      ? 'bottom-4 left-1/2 -translate-x-1/2'
      : position === 'bottom-right'
      ? 'bottom-4 right-4'
      : 'top-4 right-4';

  return (
    <ToastContext.Provider value={{ show, dismiss, success, warning, error, info }}>
      {children}
      <div
        role="region"
        aria-live="polite"
        aria-label="Notifications"
        className={`fixed z-50 pointer-events-none flex flex-col gap-2.5 max-w-sm w-full ${posClass}`}
      >
        {toasts.map((t) => {
          const borderVariant =
            t.variant === 'success'
              ? 'border-l-4 border-l-[#10b981]'
              : t.variant === 'warning'
              ? 'border-l-4 border-l-[#f59e0b]'
              : t.variant === 'danger'
              ? 'border-l-4 border-l-[#ef4444]'
              : 'border-l-4 border-l-brand';

          const icon =
            t.variant === 'success' ? '✓' : t.variant === 'warning' ? '⚠' : t.variant === 'danger' ? '✕' : 'ℹ';

          return (
            <div
              key={t.id}
              role="status"
              className={`pointer-events-auto p-4 radius-xl bg-surface border shadow-2xl flex items-start gap-3 transition-all ${borderVariant}`}
            >
              <span className="text-lg leading-none mt-0.5">{icon}</span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm weight-bold fg-primary leading-tight">{t.title}</h4>
                {t.description && <p className="text-xs fg-muted mt-1 leading-snug">{t.description}</p>}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="fg-muted hover:fg-primary p-1 text-xs radius-md transition-colors"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    return {
      show: () => '',
      dismiss: () => {},
      success: () => '',
      warning: () => '',
      error: () => '',
      info: () => '',
    };
  }
  return ctx;
}


