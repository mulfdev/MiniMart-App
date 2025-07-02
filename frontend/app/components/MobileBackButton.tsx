import { useNavigate } from 'react-router';
import { ChevronLeft } from 'lucide-react';

export function MobileBackButton(props: any) {
    const navigate = useNavigate();

    return (
        <button onClick={() => navigate(-1)} className="-ml-2" {...props}>
            <div className="flex items-center gap-1">
                <ChevronLeft className="w-9 h-9" />
            </div>
        </button>
    );
}
