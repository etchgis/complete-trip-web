import { describe, expect, test } from 'vitest';
import { prepareSearchRow, tidyPlaceText } from '../utils/placeText';

// Title and description pairs below are real answers from place search for
// Buffalo searches.
describe('tidyPlaceText', () => {
  test('drops a description that repeats the title and the trailing country', () => {
    expect(
      tidyPlaceText(
        'Elm and Carlton St & Elm St, Buffalo, NY 14203, United States',
        'Elm and Carlton St & Elm St, Buffalo, NY 14203'
      )
    ).toEqual({
      title: 'Elm and Carlton St & Elm St, Buffalo, NY 14203',
      description: '',
    });
  });

  test('keeps only the rest of a description that starts with the title', () => {
    expect(
      tidyPlaceText('1170 Main Street', '1170 Main Street, Buffalo, NY 14209')
    ).toEqual({ title: '1170 Main Street', description: 'Buffalo, NY 14209' });
  });

  test('drops the street an intersection title already names', () => {
    expect(
      tidyPlaceText('Elm Street & Carlton Street', 'Elm Street, Buffalo, NY')
    ).toEqual({ title: 'Elm Street & Carlton Street', description: 'Buffalo, NY' });
  });

  test('keeps a place name and its address', () => {
    expect(
      tidyPlaceText('Buffalo General Medical Center', '100 High Street, Buffalo, NY')
    ).toEqual({
      title: 'Buffalo General Medical Center',
      description: '100 High Street, Buffalo, NY',
    });
    expect(tidyPlaceText('Buffalo General', 'Buffalo, NY')).toEqual({
      title: 'Buffalo General',
      description: 'Buffalo, NY',
    });
  });
});

describe('prepareSearchRow', () => {
  const row = fields => {
    const item = { childKey: 'k', ...fields };
    const kept = prepareSearchRow(item);
    return kept ? item.name : null;
  };

  test('shows each demo search with the address once', () => {
    expect(
      row({
        title: 'Elm and Carlton St & Elm St, Buffalo, NY 14203, United States',
        description: 'Elm and Carlton St & Elm St, Buffalo, NY 14203',
      })
    ).toBe('Elm and Carlton St & Elm St, Buffalo, NY 14203');
    expect(
      row({
        title: 'Elm Street & Carlton Street',
        description: 'Elm Street, Buffalo, NY',
        locality: 'Buffalo',
      })
    ).toBe('Elm Street & Carlton Street, Buffalo, NY');
    expect(
      row({
        title: '1170 Main Street',
        description: '1170 Main Street, Buffalo, NY 14209',
        locality: 'Buffalo',
      })
    ).toBe('1170 Main Street, Buffalo, NY 14209');
    expect(
      row({
        title: 'Buffalo General Medical Center/Gates Vascular Institute',
        description: '100 High Street, Buffalo, NY 14203',
        locality: 'Buffalo',
      })
    ).toBe(
      'Buffalo General Medical Center/Gates Vascular Institute, 100 High Street, Buffalo, NY 14203'
    );
    expect(
      row({
        title: 'Tops',
        description: '1275 Jefferson Avenue, Buffalo, NY 14208',
        locality: 'Buffalo',
      })
    ).toBe('Tops, 1275 Jefferson Avenue, Buffalo, NY 14208');
  });

  test('adds the town only when the row does not name it', () => {
    expect(
      row({ title: 'Tops', description: '3500 Main Street', locality: 'Amherst' })
    ).toBe('Tops, 3500 Main Street, Amherst');
    expect(row({ title: 'Tops', locality: 'Amherst' })).toBe('Tops, Amherst');
  });

  test('leaves out a result with no address or town, as before', () => {
    expect(row({ title: 'Visually Impaired Advancement' })).toBeNull();
  });
});
