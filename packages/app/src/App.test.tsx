import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  render(<App />);
})

test('renders the home page', () => {
  const titleElement = screen.getByText(/ride or die/i);
  expect(titleElement).toBeInTheDocument();
});
