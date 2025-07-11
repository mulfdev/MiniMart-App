import { useState, useRef } from 'react';
import { ChevronsUpDown, Check } from 'lucide-react';
import { useOnClickOutside } from '~/hooks/useOnClickOutside';

export type SortOption = {
    value: 'listedAt_desc' | 'price_asc' | 'price_desc';
    label: string;
};
export type SortValue = SortOption['value'];

type SortDropdownProps = {
    options: SortOption[];
    currentSort: string;
    onSortChange: (value: SortValue) => void;
};

export function SortDropdown({ options, currentSort, onSortChange }: SortDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useOnClickOutside(dropdownRef, () => setIsOpen(false));

    const selectedLabel = options.find((opt) => opt.value === currentSort)?.label || 'Sort by...';

    const handleSelect = (value: SortValue) => {
        onSortChange(value);
        setIsOpen(false);
    };

    return (
        <div ref={dropdownRef} className="relative inline-block text-left z-10">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex w-full justify-center items-center gap-x-2 rounded-lg bg-zinc-800/70 px-4 py-2.5 text-sm font-medium text-zinc-300 shadow-sm ring-1 ring-inset ring-zinc-700/80 hover:bg-zinc-700/90 transition-colors duration-150"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                {selectedLabel}
                <ChevronsUpDown className="-mr-1 h-5 w-5 text-zinc-400" aria-hidden="true" />
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-zinc-800/90 backdrop-blur-md shadow-lg ring-1 ring-zinc-700 focus:outline-none animate-in fade-in-0 zoom-in-95"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="menu-button"
                >
                    <div className="py-1" role="none">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className={`${
                                    currentSort === option.value
                                        ? 'bg-blue-600/30 text-white'
                                        : 'text-zinc-200'
                                } group flex w-full items-center px-4 py-2 text-sm hover:bg-zinc-700 transition-colors duration-100`}
                                role="menuitem"
                            >
                                <span className="flex-grow text-left">{option.label}</span>
                                {currentSort === option.value && (
                                    <Check className="h-4 w-4 text-blue-400" aria-hidden="true" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
