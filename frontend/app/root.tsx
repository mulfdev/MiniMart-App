import './app.css';

import { useEffect, useState } from 'react';
import type { Route } from './+types/root';
import { lazy } from 'react';
import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useNavigation,
} from 'react-router';

const FcConnect = lazy(() => import('~/components/FcConnect'));

import { Navigation } from './components/Navigation';
import { LoadingSpinner } from './components/LoadingSpinner';
import { blackIceStyle } from './backgroundStyles';

const Web3Provider = lazy(() =>
    import('./components/Web3Provider').then(({ Web3Provider }) => ({
        default: Web3Provider,
    }))
);

export const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;
export const API_URL = import.meta.env.VITE_API_URL;

const frameConfig = {
    version: 'next',
    imageUrl: 'https://minimart.mulf.wtf/og-image.png',
    button: {
        title: 'List Now',
        action: {
            type: 'launch_frame',
            url: 'https://minimart.mulf.wtf',
            name: 'MiniMart',
            splashImageUrl: 'https://minimart.mulf.wtf/splash-img.png',
            splashBackgroundColor: '#6960d7',
        },
    },
};

const stringifiedConfig = JSON.stringify(frameConfig);

if (typeof ALCHEMY_API_KEY !== 'string') {
    throw new Error('ALCHEMY_API_KEY must be set');
}

if (typeof API_URL !== 'string') {
    throw new Error('API_URL must be set');
}

export const links: Route.LinksFunction = () => [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
    },
    {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
    },
];

export function HydrateFallback() {
    return (
        <div className="flex flex-col justify-center items-center h-[100svh] w-[100svw]">
            <h1 className="text-4xl mb-12">MiniMart</h1>
            <LoadingSpinner className="w-32 h-32" />
        </div>
    );
}

export function Layout({ children }: { children: React.ReactNode }) {
    const navigation = useNavigation();
    const [showLoader, setShowLoader] = useState(false);

    const isNavigating = Boolean(navigation.location);

    useEffect(() => {
        if (showLoader) {
            document.body.classList.add('noscroll');
        } else {
            document.body.classList.remove('noscroll');
        }
    }, [showLoader]);

    useEffect(() => {
        if (isNavigating) {
            const timer = setTimeout(() => {
                setShowLoader(true);
            }, 250);
            return () => clearTimeout(timer);
        } else {
            setShowLoader(false);
        }
    }, [isNavigating]);

    return (
        <html lang="en" style={blackIceStyle}>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="fc:frame" content={stringifiedConfig} />
                <title>MiniMart</title>

                <Meta />
                <Links />
            </head>
            <body className="min-h-[100svh] mx-auto">
                {showLoader && (
                    <div
                        className="fixed inset-0 flex flex-col justify-center items-center
                            h-[100svh] w-[100svw] z-50"
                        style={blackIceStyle}
                    >
                        <h1 className="text-4xl mb-12">MiniMart</h1>
                        <LoadingSpinner className="w-32 h-32" />
                    </div>
                )}
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    return (
        <Web3Provider>
            <FcConnect />
            <Navigation />
            <main className="pt-16">
                <Outlet />
            </main>
        </Web3Provider>
    );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = 'Oops!';
    let details = 'An unexpected error occurred.';
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? '404' : 'Error';
        details =
            error.status === 404
                ? 'The requested page could not be found.'
                : error.statusText || details;
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
        <main className="pt-16 p-4 container mx-auto">
            <h1>{message}</h1>
            <p>{details}</p>
            {stack && (
                <pre className="w-full p-4 overflow-x-auto">
                    <code>{stack}</code>
                </pre>
            )}
        </main>
    );
}
