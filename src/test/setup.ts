import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Fix scrollIntoView is not a function in jsdom
window.HTMLElement.prototype.scrollIntoView = vi.fn();
