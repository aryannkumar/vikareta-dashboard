import * as React from "react";
import { cn } from "@/lib/utils";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XCircleIcon 
} from "@heroicons/react/24/solid";

interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  onClose: () => void;
}

const toastConfig = {
  success: {
    icon: CheckCircleIcon,
    className: 'border-success-200 bg-success-50 text-success-800',
    iconClassName: 'text-success-500',
  },
  error: {
    icon: XCircleIcon,
    className: 'border-error-200 bg-error-50 text-error-800',
    iconClassName: 'text-error-500',
  },
  warning: {
    icon: ExclamationTriangleIcon,
    className: 'border-warning-200 bg-warning-50 text-warning-800',
    iconClassName: 'text-warning-500',
  },
  info: {
    icon: InformationCircleIcon,
    className: 'border-primary-200 bg-primary-50 text-primary-800',
    iconClassName: 'text-primary-500',
  },
};

export function Toast({ type, title, description, onClose }: ToastProps) {
  const config = toastConfig[type];
  const Icon = config.icon;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={cn(
        "relative flex w-full max-w-sm items-start space-x-3 rounded-lg border p-4 shadow-lg animate-slide-in-right",
        config.className
      )}
      role="alert"
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", config.iconClassName)} />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="mt-1 text-sm opacity-90">{description}</p>
        )}
      </div>

      <button
        onClick={onClose}
        className="flex-shrink-0 rounded-md p-1 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current"
        aria-label="Close notification"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
}