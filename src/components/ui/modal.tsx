import React from "react";
import { X } from "lucide-react";
import { Button } from "./button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export function Modal({ isOpen, onClose, title, children, size = "sm" }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    xs: "max-w-xs",      // ~320px - Very small
    sm: "max-w-sm",      // ~384px - Small (new default)
    md: "max-w-md",      // ~448px - Medium
    lg: "max-w-lg",      // ~512px - Large
    xl: "max-w-xl"       // ~576px - Extra Large
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content - ENHANCED WHITE THEME STYLING */}
      <div className={`relative w-full ${sizeClasses[size]} max-h-[85vh] overflow-y-auto`}>
        <div 
          className="relative bg-white border-2 border-gray-300 rounded-xl shadow-2xl"
          style={{
            backgroundColor: '#ffffff',
            color: '#000000',
            border: '2px solid #d1d5db'
          }}
        >
          {/* Header - WHITE THEME */}
          <div 
            className="flex items-center justify-between p-4 border-b-2 border-gray-200"
            style={{
              backgroundColor: '#f9fafb',
              borderBottom: '2px solid #e5e7eb'
            }}
          >
            <h2 
              className="text-lg font-bold"
              style={{ color: '#000000' }}
            >
              {title}
            </h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-200 text-black"
              style={{
                color: '#000000',
                border: '1px solid #d1d5db'
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Content - WHITE THEME */}
          <div 
            className="p-4"
            style={{
              backgroundColor: '#ffffff',
              color: '#000000'
            }}
          >
            <div style={{ color: '#000000' }}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}