import React from 'react';
import { OperatingMode } from '@launchpad/shared';
import { ShieldCheck, Cpu, ArrowUpRight } from 'lucide-react';

export const themeColors = {
  primary: '#6F4E37',
  secondary: '#8B5E3C',
  accent: '#A67C52',
  background: '#F8F4EF',
  cardBg: '#FFFDF9',
  sidebar: '#4E342E',
  border: '#D9CBB8',
  textPrimary: '#2F241F',
  textSecondary: '#6C5A4E',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }[size];

  const variantStyles = {
    primary: 'bg-[#6F4E37] hover:bg-[#5a3f2c] text-white shadow-md hover:shadow-lg focus:ring-[#6F4E37]',
    secondary: 'bg-[#8B5E3C] hover:bg-[#734d31] text-white focus:ring-[#8B5E3C]',
    outline: 'border border-[#D9CBB8] bg-[#FFFDF9] text-[#2F241F] hover:bg-[#EFE6D8] hover:border-[#A67C52]',
    ghost: 'text-[#6C5A4E] hover:text-[#2F241F] hover:bg-[#EFE6D8]/50',
  }[variant];

  return (
    <button className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </button>
  );
};

export interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, children, className = '', headerAction }) => {
  return (
    <div className={`bg-[#FFFDF9] border border-[#D9CBB8] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between mb-4 border-b border-[#D9CBB8]/50 pb-3">
          <div>
            {title && <h3 className="text-lg font-semibold text-[#2F241F]">{title}</h3>}
            {subtitle && <p className="text-xs text-[#6C5A4E] mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive = true, icon }) => {
  return (
    <div className="bg-[#FFFDF9] border border-[#D9CBB8] rounded-2xl p-5 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#6C5A4E] uppercase tracking-wider">{title}</span>
        {icon && <div className="p-2 rounded-xl bg-[#EFE6D8] text-[#6F4E37]">{icon}</div>}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold text-[#2F241F]">{value}</span>
        {change && (
          <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
            {change}
            <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </span>
        )}
      </div>
    </div>
  );
};

export const ModeBadge: React.FC<{ mode: OperatingMode }> = ({ mode }) => {
  const isStandalone = mode === OperatingMode.STANDALONE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
      isStandalone
        ? 'bg-[#EFE6D8] text-[#6F4E37] border-[#A67C52]/40'
        : 'bg-[#4E342E] text-[#FFFDF9] border-[#4E342E]'
    }`}>
      {isStandalone ? <ShieldCheck className="w-3.5 h-3.5 text-[#6F4E37]" /> : <Cpu className="w-3.5 h-3.5 text-[#A67C52]" />}
      {isStandalone ? 'Standalone Mode' : 'Integration Hub Mode'}
    </span>
  );
};
