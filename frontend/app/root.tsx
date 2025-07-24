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
} from 'react-router';

const FcConnect = lazy(() => import('~/components/FcConnect'));

import { Navigation } from './components/Navigation';
import { blackIceStyle } from './backgroundStyles';
import { Web3Provider } from './components/Web3Provider';

export const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;
export const API_URL = import.meta.env.VITE_API_URL;

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
    const [progress, setProgress] = useState(0);
    const [stage, setStage] = useState('Initializing');

    useEffect(() => {
        const stages = ['Initializing', 'Loading assets', 'Discovering your NFTs', 'Finalizing'];

        let currentStage = 0;
        let currentProgress = 0;

        const interval = setInterval(() => {
            currentProgress += Math.random() * 15 + 5;

            if (currentProgress >= 25 * (currentStage + 1) && currentStage < stages.length - 1) {
                currentStage++;
                setStage(stages[currentStage]);
            }

            if (currentProgress >= 100) {
                currentProgress = 100;
                clearInterval(interval);
            }

            setProgress(currentProgress);
        }, 300);

        return () => clearInterval(interval);
    }, []);

    return (
        <div
            className="flex flex-col items-center justify-center py-16 relative overflow-hidden
                min-h-[100svh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        >
            {/* Enhanced floating particles */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className={`absolute w-1 h-1 bg-gradient-to-r from-cyan-400 to-blue-400
                        rounded-full opacity-60 animate-float`}
                        style={{
                            left: `${10 + ((i * 7) % 80)}%`,
                            top: `${15 + ((i * 11) % 70)}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${3 + (i % 3)}s`,
                        }}
                    />
                ))}
            </div>

            {/* Orbital rings backdrop */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                    <div
                        className="absolute w-96 h-96 border border-cyan-500/10 rounded-full
                            animate-spin-slow"
                    />
                    <div
                        className="absolute w-80 h-80 border border-blue-500/10 rounded-full
                            animate-spin-slow-reverse top-8 left-8"
                    />
                    <div
                        className="absolute w-64 h-64 border border-cyan-400/5 rounded-full
                            animate-spin-slower top-16 left-16"
                    />
                </div>
            </div>

            {/* Main spinner */}
            <div className="relative mb-8 z-10">
                <div
                    className="animate-spin rounded-full h-16 w-16 border-2 border-transparent
                        border-t-cyan-400 border-r-cyan-400"
                ></div>
                <div
                    className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-2
                        border-transparent border-b-blue-400 border-l-blue-400"
                    style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
                ></div>

                {/* Center logo/icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div
                        className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg
                            flex items-center justify-center animate-pulse"
                    >
                        <div className="w-3 h-3 bg-white rounded opacity-90" />
                    </div>
                </div>
            </div>

            {/* Stage indicator */}
            <div className="text-slate-400 mb-4 text-center">
                <div className="text-lg font-medium mb-3">{stage}</div>
                <div className="flex items-center justify-center space-x-1">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                i <= Math.floor(progress / 25)
                                    ? 'bg-cyan-400 animate-pulse'
                                    : 'bg-slate-600'
                            }`}
                            style={{
                                animationDelay: `${i * 0.2}s`,
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" style={blackIceStyle}>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta
                    name="fc:frame"
                    content={`
                        {
                         "version": "next",
                         "imageUrl": "https://minimart.mulf.wtf/og-image.png",
                         "button": {
                           "title": "List Now",
                           "action": {
                             "type": "launch_frame",
                             "url": "https://minimart.mulf.wtf",
                             "name": "MiniMart",
                             "splashImageUrl": "https://minimart.mulf.wtf/splash-img.png",
                             "splashBackgroundColor": "#6960d7"
                           }
                         }
                        }
                    `}
                />
                <title>MiniMart</title>

                <Meta />
                <Links />
            </head>
            <body className="min-h-[100svh] mx-auto">
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
