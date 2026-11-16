import base from './playwright.performance.config';
import {defineConfig} from '@playwright/test';
export default defineConfig({...base,testMatch:/refinement\.spec\.ts/});
