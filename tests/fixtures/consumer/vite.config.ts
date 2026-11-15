import { defineConfig } from 'vite';
import giggyDev from '../../../dist/vite.js';
export default defineConfig({ plugins: [giggyDev()] });
