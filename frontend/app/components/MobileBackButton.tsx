import { useNavigate } from 'react-router';
import { ChevronLeft } from 'lucide-react';

export function MobileBackButton(props: any) {
    const navigate = useNavigate();

    return (
        <button onClick={() => navigate(-1)} {...props}>
            <div className="flex items-center">
                <ChevronLeft className="w-9 h-9" /> Back
            </div>
        </button>
    );
}
