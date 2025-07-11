import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
    plugins: [
        tailwindcss(),
        reactRouter(),
        tsconfigPaths(),
        visualizer({
            open: true,
            filename: 'bundle-stats.html',
        }),
    ],
    ssr: {
        external: [
            'wagmi',
            'connectkit',
            '@farcaster/frame-sdk',
            '@farcaster/frame-wagmi-connector',
        ],
    },
    server: {
        fs: {
            allow: [searchForWorkspaceRoot(process.cwd())],
        },
    },
    resolve: {
        alias: {
            buffer: 'buffer/',
        },
    },
});
