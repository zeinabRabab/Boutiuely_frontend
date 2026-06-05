import React, { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

// ── Button ────────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary', size = 'md', loading, children, disabled, className = '', ...props
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  const variants = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500 shadow-sm',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-purple-400 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-purple-600 hover:bg-purple-50 focus:ring-purple-400 dark:hover:bg-purple-900/20',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  };
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
};

// ── Card ──────────────────────────────────────────────────────────────────────
interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, subtitle, icon, action }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && <div className="text-purple-600">{icon}</div>}
          <div>
            {title && <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    )}
    {children}
  </div>
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, change, changeType }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 fade-in">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        {change && (
          <p className={`text-xs mt-1 font-medium ${
            changeType === 'up' ? 'text-green-600' : changeType === 'down' ? 'text-red-600' : 'text-gray-500'
          }`}>{change}</p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

// ── Input ─────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, leftIcon, className = '', ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
    <div className="relative">
      {leftIcon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{leftIcon}</div>}
      <input
        className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-all
          ${leftIcon ? 'pl-10' : ''}
          ${error
            ? 'border-red-400 focus:ring-2 focus:ring-red-300'
            : 'border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800'
          }
          bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
          ${className}`}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// ── Badge ─────────────────────────────────────────────────────────────────────
type BadgeVariant = 'purple' | 'green' | 'yellow' | 'red' | 'blue' | 'gray';
interface BadgeProps { label: string; variant?: BadgeVariant; }

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'purple' }) => {
  const variants: Record<BadgeVariant, string> = {
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {label}
    </span>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────
interface ModalProps { isOpen: boolean; onClose: () => void; title: string; children: ReactNode; size?: 'sm' | 'md' | 'lg'; }

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// ── Table ─────────────────────────────────────────────────────────────────────
interface TableProps { headers: string[]; children: ReactNode; }

export const Table: React.FC<TableProps> = ({ headers, children }) => (
  <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700">
    <table className="w-full text-sm">
      <thead className="bg-gray-50 dark:bg-gray-700/50">
        <tr>
          {headers.map((h, i) => (
            <th key={i} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
        {children}
      </tbody>
    </table>
  </div>
);

// ── Loading Spinner ────────────────────────────────────────────────────────────
export const LoadingSpinner: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3">
    <Loader2 size={32} className="animate-spin text-purple-600" />
    <p className="text-gray-500 text-sm">{text}</p>
  </div>
);

// ── Empty State ────────────────────────────────────────────────────────────────
export const EmptyState: React.FC<{ icon: ReactNode; title: string; description?: string; action?: ReactNode }> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
    <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-400">{icon}</div>
    <div>
      <p className="font-semibold text-gray-700 dark:text-gray-300">{title}</p>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
    </div>
    {action}
  </div>
);

// ── Alert ─────────────────────────────────────────────────────────────────────
interface AlertProps { type: 'error' | 'success' | 'warning' | 'info'; message: string; onClose?: () => void; }

export const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400',
    success: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400',
    info: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400',
  };
  return (
    <div className={`rounded-lg border p-4 flex items-start justify-between gap-3 ${styles[type]}`}>
      <p className="text-sm flex-1">{message}</p>
      {onClose && <button onClick={onClose} className="text-lg leading-none opacity-70 hover:opacity-100">&times;</button>}
    </div>
  );
};

// ── Select ────────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
    <select
      className={`w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm
        bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none
        focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 ${className}`}
      {...props}
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

// ── Textarea ──────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { label?: string; }

export const Textarea: React.FC<TextareaProps> = ({ label, className = '', ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
    <textarea
      className={`w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm
        bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400
        outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 resize-none ${className}`}
      {...props}
    />
  </div>
);
