import { CheckCircle, XCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type ToastProps = {
    message: string;
    variant: 'success' | 'error';
    onClose: () => void;
};

const toastVariants = {
    success: {
        icon: CheckCircle,
        iconColor: 'text-green-400',
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500/30',
        progressColor: 'bg-green-400',
        shadowColor: 'shadow-green-500/30',
    },
    error: {
        icon: XCircle,
        iconColor: 'text-red-400',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/30',
        progressColor: 'bg-red-400',
        shadowColor: 'shadow-red-500/30',
    },
};

export function Toast({ message, variant, onClose }: ToastProps) {
    const [show, setShow] = useState(false);
    const [exiting, setExiting] = useState(false);

    const {
        icon: Icon,
        iconColor,
        bgColor,
        borderColor,
        progressColor,
        shadowColor,
    } = toastVariants[variant];

    useEffect(() => {
        setShow(true);

        const timer = setTimeout(() => {
            setExiting(true);
            setTimeout(onClose, 300);
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const handleClose = () => {
        setExiting(true);
        setTimeout(onClose, 300);
    };

    return (
        <div
            className={`fixed bottom-5 right-5 w-full max-w-sm rounded-xl border ${borderColor} ${bgColor} p-4 shadow-2xl ${shadowColor} backdrop-blur-md transition-all duration-300 ease-out
      ${show && !exiting ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <Icon className={`h-6 w-6 ${iconColor}`} aria-hidden="true" />
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-white">{message}</p>
                </div>
                <div className="ml-4 flex flex-shrink-0">
                    <button
                        onClick={handleClose}
                        className="inline-flex rounded-md text-zinc-400 hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
                    >
                        <span className="sr-only">Close</span>
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
            </div>
            <div
                className={`absolute bottom-0 left-0 h-1 ${progressColor} rounded-bl-xl animate-progress`}
            />
        </div>
    );
}
