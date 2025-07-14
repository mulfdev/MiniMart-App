export function LoadingSpinner({ className }: { className?: string }) {
    const defaultStyles =
        'w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin';
    return (
        <div className="relative">
            <div className={`${defaultStyles} ${className}`} />
            <div
                className={`${defaultStyles} ${className} absolute inset-0 border-purple-500/20
                    border-b-purple-500 animate-reverse`}
            />
        </div>
    );
}
