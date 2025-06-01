import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

const s3Name = 'gertrude';
const useCdnBase = process.env.VITE_USE_CDN === 'true';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    server: {
        host: '::',
        port: 8080,
    },
    base: useCdnBase ? `https://cdn.bighelp.ai/${s3Name}/` : '/',
    plugins: [react(), mode === 'development' && componentTagger()].filter(
        Boolean
    ),
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
}));
