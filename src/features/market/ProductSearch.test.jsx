import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { LanguageProvider } from '../../context/LanguageContext';
import ProductSearch from './ProductSearch';

const Harness = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  return (
    <ProductSearch
      query={query}
      onQueryChange={setQuery}
      category={category}
      onCategoryChange={setCategory}
      resultCount={query === 'laptop' ? 0 : 3}
    />
  );
};

const renderSearch = () =>
  render(
    <LanguageProvider>
      <Harness />
    </LanguageProvider>
  );

describe('ProductSearch', () => {
  beforeEach(() => window.localStorage.clear());

  it('updates the query and shows a no-results message', () => {
    renderSearch();
    const input = screen.getByLabelText('Search products');
    fireEvent.change(input, { target: { value: 'laptop' } });
    expect(input).toHaveValue('laptop');
    expect(screen.getByText('No items match "laptop"')).toBeInTheDocument();
  });

  it('clears the query', () => {
    renderSearch();
    const input = screen.getByLabelText('Search products');
    fireEvent.change(input, { target: { value: 'aloo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(input).toHaveValue('');
  });

  it('selects a category chip', () => {
    renderSearch();
    const spices = screen.getByRole('button', { name: 'Spices' });
    fireEvent.click(spices);
    expect(spices).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('explains when voice search is not supported', () => {
    renderSearch();
    fireEvent.click(screen.getByRole('button', { name: 'Search by voice' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Voice search is not supported in this browser');
  });

  it('renders in Hindi when chosen', () => {
    window.localStorage.setItem('bazarBuddy.language', 'hi');
    renderSearch();
    expect(screen.getByLabelText('सामान खोजें')).toBeInTheDocument();
  });
});
