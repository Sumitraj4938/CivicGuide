import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

// Mock GoogleGenAI
vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = { 
      generateContent: vi.fn() 
    }
    chats = {
      create: vi.fn(() => ({
        sendMessage: vi.fn()
      }))
    }
  },
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([{ id: '1', title: 'Test News', summary: 'Test', source: 'Test', publishedAt: new Date().toISOString(), category: 'Test' }]),
  })
) as any;

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders CivicGuide title', () => {
    render(<App />);
    const titles = screen.getAllByText(/CivicGuide/);
    expect(titles.length).toBeGreaterThan(0);
    expect(titles[0]).toBeInTheDocument();
  });

  it('renders Sumit Raj as author', () => {
    render(<App />);
    expect(screen.getByText(/Author: Sumit Raj/i)).toBeInTheDocument();
  });

  it('toggles theme when theme button is clicked', () => {
    render(<App />);
    const toggleButton = screen.getByLabelText(/Toggle theme/i);
    fireEvent.click(toggleButton);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('switches tabs between Voting Journey and Election News', async () => {
    render(<App />);
    const newsTab = screen.getByRole('button', { name: /Election News/i });
    fireEvent.click(newsTab);
    
    // Use findByText for async rendering
    const newsTitle = await screen.findByText(/Election Intelligence/i);
    expect(newsTitle).toBeInTheDocument();
    
    const journeyTab = screen.getByRole('button', { name: /Voting Journey/i });
    fireEvent.click(journeyTab);
    const jargonBuster = await screen.findByText(/Jargon Buster/i);
    expect(jargonBuster).toBeInTheDocument();
  });
});
