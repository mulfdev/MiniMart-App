import { Menu, X } from 'lucide-react';

export function Hamburger({ isOpen, ...props }: any) {
    return (
        <button {...props}>
            {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
    );
}
