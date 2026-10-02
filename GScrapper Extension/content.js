(() => {
  const MESSAGE_TYPE = "COLLECT_BUSINESSES";

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== MESSAGE_TYPE) {
      return;
    }

    try {
      const result = collectVisibleBusinesses();
      sendResponse({ ok: true, ...result });
    } catch (error) {
      sendResponse({ ok: false, error: error.message });
    }
  });

  function collectVisibleBusinesses() {
    const links = Array.from(document.querySelectorAll('a[href*="/maps/place/"]'));
    const records = [];
    const seen = new Set();
    let failed = 0;

    for (const link of links) {
      const card = findBusinessCard(link);
      const record = extractBusiness(link, card);

      if (!record || seen.has(record.businessId)) {
        if (!record) failed += 1;
        continue;
      }

      seen.add(record.businessId);
      records.push(record);
    }

    return { businesses: records, stats: { processed: links.length, failed } };
  }

  function findBusinessCard(link) {
    return link.closest('[role="article"]') || link.closest('div[role="feed"] > div') || link.parentElement?.parentElement || link;
  }

  function extractBusiness(link, card) {
    const mapsUrl = normalizeUrl(link.href);
    const lines = getTextLines(card);
    const name = cleanText(link.getAttribute("aria-label") || lines[0] || link.textContent);

    if (!name || !mapsUrl) {
      return null;
    }

    const websiteAnchor = Array.from(card.querySelectorAll('a[href]')).find((anchor) => {
      const url = normalizeUrl(anchor.href);
      return url && !isGoogleUrl(url) && !url.startsWith("tel:") && !url.startsWith("mailto:");
    });
    const website = websiteAnchor ? normalizeUrl(websiteAnchor.href) : null;
    const socialMedia = extractSocialMedia(card);
    const text = lines.join(" ");
    const phone = extractPhone(text);
    const rating = extractRating(card, text);
    const reviewCount = extractReviewCount(text);
    const category = extractCategory(lines, name, rating, reviewCount);
    const address = extractAddress(lines, name, category, phone, rating, reviewCount);

    return {
      businessId: createBusinessId(mapsUrl, name, address, phone),
      name,
      category,
      address,
      phone,
      socialMedia,
      website,
      websiteStatus: website ? "present" : "unknown",
      mapsUrl,
      rating,
      reviewCount,
      openingHours: null,
      businessStatus: null,
      latitude: null,
      longitude: null,
      placeId: extractPlaceId(mapsUrl),
      area: null,
      collectedAt: new Date().toISOString()
    };
  }

  function getTextLines(card) {
    return Array.from(card.querySelectorAll("span, div"))
      .map((element) => cleanText(element.textContent))
      .filter((value, index, values) => value && values.indexOf(value) === index && value.length < 300)
      .slice(0, 30);
  }

  function extractCategory(lines, name, rating, reviewCount) {
    const excluded = new Set([name, rating === null ? "" : String(rating), reviewCount === null ? "" : String(reviewCount)]);
    return lines.find((line) => {
      const lower = line.toLowerCase();
      return !excluded.has(line) && line.length > 1 && line.length < 80 && !/\d{3,}/.test(line) && !/reviews?|ulasan|stars?|bintang| buka| tutup/.test(lower);
    }) || null;
  }

  function extractAddress(lines, name, category, phone, rating, reviewCount) {
    return lines.find((line) => {
      const lower = line.toLowerCase();
      return line !== name && line !== category && line !== phone && line.length > 8 && !/reviews?|ulasan|stars?|bintang| buka| tutup|\d[.,]?\d/.test(lower) && !/https?:\/\//.test(lower);
    }) || null;
  }

  function extractPhone(text) {
    const match = text.match(/(?:\+?\d[\d\s().-]{7,}\d)/);
    return match ? cleanText(match[0]) : null;
  }

  function extractSocialMedia(card) {
    const supportedHosts = ["instagram.com", "facebook.com", "tiktok.com", "linkedin.com", "youtube.com"];
    return Array.from(card.querySelectorAll('a[href]'))
      .map((anchor) => normalizeUrl(anchor.href))
      .filter((url) => url && supportedHosts.some((host) => new URL(url).hostname.endsWith(host)))
      .filter((url, index, urls) => urls.indexOf(url) === index);
  }

  function extractRating(card, text) {
    const ariaText = Array.from(card.querySelectorAll("[aria-label]"))
      .map((element) => element.getAttribute("aria-label"))
      .find((value) => /[0-5][.,]\d/.test(value || ""));
    const match = `${ariaText || ""} ${text}`.match(/([0-5](?:[.,]\d)?)(?:\s*)(?:stars?|bintang)/i) || `${ariaText || ""} ${text}`.match(/\b([0-5][.,]\d)\b/);
    return match ? Number(match[1].replace(",", ".")) : null;
  }

  function extractReviewCount(text) {
    const match = text.match(/([\d.,]+\s*[Kk]?)\s*(?:reviews?|ulasan)/i);

    if (!match) {
      return null;
    }

    const raw = match[1].replace(/\s/g, "");
    const multiplier = /k$/i.test(raw) ? 1000 : 1;
    const numeric = Number(raw.replace(/[.,](?=\d{3}(?:\D|$))/g, "").replace(",", ".").replace(/k$/i, ""));
    return Number.isFinite(numeric) ? Math.round(numeric * multiplier) : null;
  }

  function extractPlaceId(url) {
    const match = url.match(/!1s([^!]+)/);
    return match ? match[1] : null;
  }

  function normalizeUrl(value) {
    if (!value) {
      return null;
    }

    try {
      const url = new URL(value, window.location.href);
      url.hash = "";
      ["utm_source", "utm_medium", "utm_campaign", "entry", "g_ep"].forEach((key) => url.searchParams.delete(key));
      return url.toString();
    } catch {
      return null;
    }
  }

  function isGoogleUrl(value) {
    try {
      return new URL(value).hostname.endsWith("google.com") || new URL(value).hostname.endsWith("googleusercontent.com");
    } catch {
      return true;
    }
  }

  function cleanText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function createBusinessId(mapsUrl, name, address, phone) {
    const source = mapsUrl || `${name}|${address || ""}|${phone || ""}`;
    let hash = 2166136261;

    for (let index = 0; index < source.length; index += 1) {
      hash ^= source.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }

    return `mapsurl_${(hash >>> 0).toString(16)}`;
  }
})();
