// Cleans up the title and description that place search returns so the
// address is not shown twice. Some results repeat the full address in both
// fields, or start the description with the title, and the search box joins
// the two with ", " for the result row and the chosen address.

// Place search only covers the US, so a trailing country name adds nothing.
const COUNTRY_SUFFIX = /,\s*(united states( of america)?|usa|u\.s\.a\.|us)\s*$/i;

const stripCountry = text => text.replace(COUNTRY_SUFFIX, '').trim();

const normalize = text => text.toLowerCase().replace(/\s+/g, ' ').trim();

export function tidyPlaceText(title, description) {
  const cleanTitle = stripCountry(title || '');
  let cleanDescription = stripCountry(description || '');
  if (!cleanTitle) {
    return { title: (title || '').trim(), description: cleanDescription };
  }
  if (!cleanDescription) {
    return { title: cleanTitle, description: '' };
  }

  const normalTitle = normalize(cleanTitle);
  const normalDescription = normalize(cleanDescription);

  // The description says nothing the title does not already say.
  if (normalTitle.includes(normalDescription)) {
    return { title: cleanTitle, description: '' };
  }

  const parts = cleanDescription.split(',').map(part => part.trim());
  const first = normalize(parts[0] || '');
  // An intersection title like "Elm Street & Carlton Street" over a
  // description that starts with one of its streets.
  const streets = cleanTitle.includes('&')
    ? cleanTitle.split('&').map(normalize)
    : [];
  if (parts.length > 1 && (first === normalTitle || streets.includes(first))) {
    cleanDescription = parts.slice(1).join(', ');
  }

  return { title: cleanTitle, description: cleanDescription };
}

// Sets the title, description, name and text that a search result row shows.
// Returns false when the result has no address or town to show, which the
// search box leaves out.
export function prepareSearchRow(item) {
  const hadDescription = !!item.description;
  const tidy = tidyPlaceText(item.title, item.description);
  item.title = tidy.title;
  item.description = tidy.description;
  // Add the town unless the description names it. When the description was
  // only a repeat of the title, the title holds the full address, so check it.
  const where = (item.description || item.title).toLowerCase();
  if (item.locality && !where.includes(item.locality.toLowerCase())) {
    item.description = item.description
      ? item.description + ', ' + item.locality
      : item.locality;
  }
  if (!item.description && !hadDescription) return false;
  const line = item.description
    ? item.title + ', ' + item.description
    : item.title;
  item.name = line;
  item.text = line;
  return true;
}
