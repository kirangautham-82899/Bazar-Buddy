import { desktopColumns } from './useMediaQuery';

describe('desktopColumns', () => {
  it('fits as many products across the window as there is room for', () => {
    expect(desktopColumns(1024)).toBe(4);
    expect(desktopColumns(1440)).toBe(6);
    expect(desktopColumns(1600)).toBe(7);
    expect(desktopColumns(1920)).toBe(9);
  });

  it('never drops below 4 or goes above 10', () => {
    expect(desktopColumns(800)).toBe(4);
    expect(desktopColumns(4000)).toBe(10);
  });
});
