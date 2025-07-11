import { Menu, X } from 'lucide-react';

export function Hamburger({ isOpen, ...props }: any) {
    return (
        <button {...props}>
            {isOpen ? <X className="w-9 h-9 z-50" /> : <Menu className="w-9 h-9" />}
        </button>
    );
}
