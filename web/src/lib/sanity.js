import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'ljvmc7dl',
  dataset: 'production',
  apiVersion: '2025-01-01',
  useCdn: true,
});

const safeUrl = (url) => {
  try {
    const u = new URL(url);
    return /^https?:$/.test(u.protocol) ? u.href : '';
  } catch {
    return '';
  }
};

async function fetchOr(query, fallback, label) {
  try {
    return (await client.fetch(query)) ?? fallback;
  } catch (err) {
    console.warn(`[sanity] Failed to fetch ${label}:`, err.message);
    return fallback;
  }
}

export async function getEvents() {
  const events = await fetchOr(
    `*[_type == "events"] | order(startsAt asc) {
      title, startsAt, location, mapsUrl, description,
      "poster": poster.asset->url
    }`,
    [],
    'events',
  );

  // Keep events until 6 hours after they start.
  const cutoff = Date.now() - 6 * 3600 * 1000;
  return events
    .filter((e) => new Date(e.startsAt) >= cutoff)
    .map((e) => ({
      title: e.title,
      description: e.description || '',
      poster: safeUrl(e.poster),
      location: e.location || '',
      startsAt: e.startsAt,
      mapsLink:
        safeUrl(e.mapsUrl) ||
        'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(e.location || ''),
    }));
}

export async function getSponsors() {
  const data = await fetchOr(
    `*[_type == "sponsors"][0] {
      "sponsors": sponsors[] { name, url, tier, "logo": logo.asset->url }
    }`,
    {},
    'sponsors',
  );

  return (data.sponsors ?? [])
    .filter((s) => s.name)
    .map((s) => ({
      name: s.name,
      url: safeUrl(s.url),
      tier: s.tier || '',
      logo: safeUrl(s.logo),
    }));
}

export async function getAbout() {
  const s = await fetchOr(
    `*[_type == "siteSettings"][0] { about, instagramUrl, youtubeUrl, kofiUrl, discordUrl, email }`,
    {},
    'site settings',
  );

  return {
    about: (s.about || '').split(/\n+/).map((p) => p.trim()).filter(Boolean),
    instagramUrl: safeUrl(s.instagramUrl),
    youtubeUrl: safeUrl(s.youtubeUrl),
    kofiUrl: safeUrl(s.kofiUrl),
    discordUrl: safeUrl(s.discordUrl),
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email || '') ? s.email : '',
  };
}

export async function getGallery() {
  const data = await fetchOr(
    `*[_type == "gallery"][0] { "images": images[] { "url": asset->url, alt } }`,
    {},
    'gallery',
  );

  return (data.images ?? [])
    .filter((g) => safeUrl(g.url))
    .map((g) => ({ url: safeUrl(g.url), alt: g.alt || 'Vancouver Combat Robots event photo' }));
}
