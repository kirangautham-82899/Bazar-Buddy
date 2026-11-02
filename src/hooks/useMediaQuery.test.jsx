import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { useIsDesktop } from './useMediaQuery';

const Probe = () => <p>{useIsDesktop() ? 'desktop' : 'phone'}</p>;

describe('useIsDesktop', () => {
  afterEach(() => {
    window.__desktop = false;
  });

  it('switches layout when the window is resized, even without a media-query event', () => {
    window.__desktop = true;
    render(<Probe />);
    expect(screen.getByText('desktop')).toBeInTheDocument();

    // The setup's matchMedia stub never fires 'change', like some emulators.
    window.__desktop = false;
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(screen.getByText('phone')).toBeInTheDocument();
  });
});
