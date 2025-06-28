import { useLocation, useNavigate } from 'react-router';
import { ChevronLeft } from 'lucide-react';

export function MobileBackButton() {
    const navigate = useNavigate();
    const location = useLocation();
    const showBackButton = location.pathname !== '/';

    if (!showBackButton) {
        return null;
    }

    return (
        <div className="lg:hidden sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-sm -mx-2 -mt-4 mb-4 p-3 shadow-md">
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center text-zinc-300 hover:text-white transition-colors duration-200 group text-sm font-semibold"
            >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back
            </button>
        </div>
    );
}
