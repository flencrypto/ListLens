'use strict';

(function exposeListLensGuardRegistry(global) {
  const VERSION = '0.3.0-category-wide-no-motors';
  const DEFAULT_LENS_ID = 'auto';
  const EXCLUDED_MOTOR_ID = 'motor-excluded';

  const commonEvidenceRules = [
    {
      id: 'photo_depth',
      label: 'Multiple clear photos',
      ask: 'Clear photos from multiple angles, including close-ups of important details',
      found: (listing) => Array.isArray(listing.photos) && listing.photos.length >= 4,
      positive: [/front/i, /back/i, /side/i, /close[ -]?up/i, /detail/i]
    },
    {
      id: 'condition_detail',
      label: 'Condition/flaw evidence',
      ask: 'Close-ups of wear, marks, damage, repairs, missing parts, or flaws',
      positive: [/condition/i, /wear/i, /scratch/i, /damage/i, /flaw/i, /repair/i, /marks?/i]
    },
    {
      id: 'seller_context',
      label: 'Seller context visible',
      ask: 'Visible seller feedback, rating, sales history, or extra seller context',
      found: (listing) => Boolean(listing.sellerName || listing.sellerRating),
      positive: [/seller/i, /feedback/i, /rating/i, /reviews?/i]
    }
  ];

  const lenses = [
    {
      id: 'auto',
      name: 'Auto Lens Router',
      shortName: 'Auto',
      category: 'Routing',
      badge: 'AUTO',
      description: 'Detects the correct non-motor List-LENS category from the visible listing evidence.',
      aliases: ['auto', 'automatic', 'router'],
      keywords: [],
      evidenceRules: [],
      riskTerms: []
    },
    {
      id: 'solelens',
      name: 'SoleLens',
      shortName: 'SoleLens',
      category: 'Trainers, sneakers and shoes',
      badge: 'SOLE',
      description: 'Checks trainer, sneaker and footwear listings for missing style, label, sole, box and condition evidence.',
      aliases: ['solelens', 'shoe lens', 'shoelens', 'trainers', 'sneakers', 'shoes'],
      keywords: [
        /\btrainer(s)?\b/i, /\bsneaker(s)?\b/i, /\bshoe(s)?\b/i, /\bboots?\b/i, /footwear/i,
        /nike/i, /adidas/i, /jordan/i, /yeezy/i, /air\s*max/i, /dunk/i, /new\s*balance/i, /asics/i,
        /size\s*(uk|us|eu)?\s*\d/i, /sports\s*shoes/i, /designer\s*footwear/i
      ],
      evidenceRules: [
        { id: 'size_label', label: 'Size label photo', ask: 'A clear photo of the internal size/style label', positive: [/size\s*label/i, /inside\s*label/i, /inner\s*label/i, /tongue\s*tag/i, /size\s*tag/i] },
        { id: 'sole_tread', label: 'Sole/tread photo', ask: 'A photo of the soles and tread from underneath', positive: [/sole/i, /outsole/i, /tread/i, /bottoms?\s+of\s+the\s+shoes/i] },
        { id: 'box_label', label: 'Box label/style-code photo', ask: 'A photo of the box label showing the style code, if a box is included', positive: [/box\s*label/i, /style\s*code/i, /sku/i, /product\s*code/i, /original\s*box/i], skipIf: /no\s+box|without\s+box|box\s+not\s+included/i },
        { id: 'logo_stitching', label: 'Logo/stitching close-ups', ask: 'Clear close-up photos of logos, stitching and material details', positive: [/logo/i, /stitching/i, /materials?/i, /close[ -]?up/i] },
        { id: 'condition_match', label: 'Visible condition match', ask: 'Photos showing wear areas so the claimed condition can be compared against the item', positive: [/worn/i, /creased/i, /heel\s*drag/i, /scuff/i, /condition/i] }
      ],
      sellerQuestion: 'Hi, could you please send clear photos of the size label, soles, inside tags, and box label/style code if there is a box? Thanks.',
      riskTerms: [/replica/i, /fake/i, /unauthori[sz]ed/i, /\bua\b/i, /factory\s*pair/i, /not\s*authentic/i]
    },
    {
      id: 'recordlens',
      name: 'RecordLens',
      shortName: 'RecordLens',
      category: 'Vinyl, CDs, cassettes and music media',
      badge: 'REC',
      description: 'Checks music media listings for pressing, catalogue, matrix/runout, grading, extras and bootleg-risk evidence.',
      aliases: ['recordlens', 'record lens', 'groovelens', 'vinyl', 'record', 'lp', 'cd', 'cassette'],
      keywords: [
        /vinyl/i, /\brecord(s)?\b/i, /\blp\b/i, /7[- ]?inch|7"/i, /12[- ]?inch|12"/i, /\bcd\b/i, /cassette/i,
        /box\s*set/i, /matrix/i, /runout/i, /dead\s*wax|deadwax/i, /catalogue|catalog/i, /cat\.?\s*no/i,
        /pressing/i, /first\s*press/i, /white\s*label/i, /promo/i, /test\s*pressing/i, /obi/i, /insert/i
      ],
      evidenceRules: [
        { id: 'front_sleeve', label: 'Front sleeve/photo', ask: 'A clear front sleeve or case photo', positive: [/front\s*sleeve/i, /front\s*cover/i, /cover/i] },
        { id: 'back_sleeve', label: 'Back sleeve/barcode photo', ask: 'A clear back sleeve photo showing barcode, label, country and track details', positive: [/back\s*sleeve/i, /back\s*cover/i, /barcode/i, /track\s*listing/i] },
        { id: 'label_both_sides', label: 'Both label sides', ask: 'Clear close-ups of both labels / disc faces / cassette sides', positive: [/label\s*a/i, /label\s*b/i, /side\s*a/i, /side\s*b/i, /both\s*labels/i, /disc\s*face/i] },
        { id: 'matrix_runout', label: 'Matrix/runout evidence', ask: 'Photos or text of matrix/runout markings in the deadwax', positive: [/matrix/i, /runout/i, /dead\s*wax|deadwax/i, /etching/i] },
        { id: 'catalogue_number', label: 'Catalogue number', ask: 'Catalogue number, barcode, label, country and year details', positive: [/catalogue|catalog/i, /cat\.?\s*no/i, /barcode/i, /label/i, /country/i, /year/i] },
        { id: 'condition_grade', label: 'Media and sleeve grading', ask: 'Separate media and sleeve grades plus notes on scratches, warps, ring wear or splits', positive: [/near\s*mint|\bnm\b|\bvg\+?\b|\bg\+?\b|media\s*grade|sleeve\s*grade|graded/i, /scratches|warp|ring\s*wear|split/i] },
        { id: 'extras_included', label: 'Inserts/extras shown', ask: 'Photos of poster, insert, obi, booklet, original inner sleeve or any missing extras', positive: [/insert/i, /poster/i, /obi/i, /booklet/i, /inner\s*sleeve/i] }
      ],
      sellerQuestion: 'Hi, could you please send clear photos of both record labels, the matrix/runout markings on each side, and the back sleeve catalogue number? Thanks.',
      riskTerms: [/bootleg/i, /unofficial/i, /counterfeit/i, /mispress/i, /wrong\s*pressing/i, /warped/i, /skips?/i, /overgraded/i]
    },
    {
      id: 'watchlens',
      name: 'WatchLens',
      shortName: 'WatchLens',
      category: 'Watches and timepieces',
      badge: 'WATCH',
      description: 'Checks watch listings for dial, case-back, reference, serial, movement, clasp, papers and condition evidence.',
      aliases: ['watchlens', 'watch lens', 'watch', 'timepiece'],
      keywords: [
        /\bwatch(es)?\b/i, /timepiece/i, /rolex/i, /omega/i, /seamaster/i, /datejust/i, /submariner/i, /seiko/i,
        /tag\s*heuer/i, /tissot/i, /longines/i, /cartier/i, /breitling/i, /case\s*back|caseback/i, /movement/i,
        /clasp/i, /crown/i, /serial/i, /reference\s*(number|no)/i, /box\s*and\s*papers/i, /smart\s*watch/i
      ],
      evidenceRules: [
        { id: 'dial_photo', label: 'Clear dial photo', ask: 'A sharp, straight-on dial photo', positive: [/dial/i, /face/i, /front/i] },
        { id: 'case_back', label: 'Case-back photo', ask: 'A clear case-back photo showing reference or markings where safe', positive: [/case\s*back|caseback/i, /back\s*case/i] },
        { id: 'crown_clasp', label: 'Crown/clasp details', ask: 'Photos of the crown, clasp, bracelet/end links or strap details', positive: [/crown/i, /clasp/i, /bracelet/i, /end\s*links?/i, /strap/i] },
        { id: 'serial_reference', label: 'Serial/reference evidence', ask: 'Visible reference/serial details or paperwork evidence where safe to share', positive: [/serial/i, /reference/i, /ref\.?\s*no/i, /model\s*number/i] },
        { id: 'movement_photo', label: 'Movement/service evidence', ask: 'Movement photo or service record if available and relevant', positive: [/movement/i, /calibre|caliber/i, /service/i, /serviced/i] },
        { id: 'box_papers', label: 'Box/papers shown', ask: 'Photos of box, papers, warranty card, receipt, spare links or included accessories', positive: [/box/i, /papers/i, /warranty/i, /receipt/i, /spare\s*links/i] },
        { id: 'condition_wear', label: 'Condition/wear close-ups', ask: 'Close-ups of scratches, polishing, bracelet stretch, glass condition and wear areas', positive: [/scratch/i, /polished/i, /bracelet\s*stretch/i, /crystal/i, /glass/i, /wear/i] }
      ],
      sellerQuestion: 'Hi, could you please send clear photos of the case back, clasp, serial/reference details, and any box or papers? Thanks.',
      riskTerms: [/replica/i, /fake/i, /aftermarket/i, /franken/i, /homage/i, /not\s*original/i, /unknown\s*movement/i]
    },
    {
      id: 'cardlens',
      name: 'CardLens',
      shortName: 'CardLens',
      category: 'Trading cards, sports cards and TCGs',
      badge: 'CARD',
      description: 'Checks card listings for identity, grade claims, slab/cert visibility, condition and fake-card risk signals.',
      aliases: ['cardlens', 'card lens', 'trading card', 'sports card', 'tcg'],
      keywords: [
        /trading\s*card/i, /sports\s*card/i, /\btcg\b/i, /pokemon|pokémon/i, /charizard/i, /magic\s*the\s*gathering|\bmtg\b/i,
        /yu[- ]?gi[- ]?oh/i, /topps/i, /panini/i, /rookie\s*card/i, /holo/i, /first\s*edition/i, /shadowless/i,
        /psa\s*\d|bgs\s*\d|beckett|cgc\s*\d/i, /graded\s*card/i, /slab/i, /cert/i
      ],
      evidenceRules: [
        { id: 'front_photo', label: 'Front card photo', ask: 'A clear front photo outside heavy glare', positive: [/front/i, /obverse/i] },
        { id: 'back_photo', label: 'Back card photo', ask: 'A clear back/reverse photo', positive: [/back/i, /reverse/i] },
        { id: 'corners_edges', label: 'Corners/edges close-ups', ask: 'Close-ups of corners and edges', positive: [/corner/i, /edge/i, /whitening/i, /centering/i] },
        { id: 'surface_detail', label: 'Surface/holo detail', ask: 'Surface and holo detail photos showing scratches, dents, print lines or texture', positive: [/surface/i, /holo/i, /foil/i, /scratch/i, /print\s*line/i, /dent/i] },
        { id: 'set_number', label: 'Set/card number visible', ask: 'Set name, card number, edition, language and rarity details', positive: [/set/i, /card\s*number/i, /edition/i, /rarity/i, /language/i, /promo/i] },
        { id: 'slab_cert', label: 'Slab/cert number clear', ask: 'Clear full slab-label and certificate number photo if graded', positive: [/psa/i, /bgs/i, /beckett/i, /cgc/i, /cert/i, /slab/i, /graded/i], skipIf: /raw\s*card|ungraded/i }
      ],
      sellerQuestion: 'Hi, could you please send front and back photos, corner close-ups, and a clear photo of the slab certificate number if graded? Thanks.',
      riskTerms: [/proxy/i, /reprint/i, /fake/i, /custom\s*card/i, /altered/i, /trimmed/i]
    },
    {
      id: 'toylens',
      name: 'ToyLens',
      shortName: 'ToyLens',
      category: 'Toys, figures, LEGO and collectibles',
      badge: 'TOY',
      description: 'Checks toy and collectible listings for completeness, accessories, packaging, condition and reproduction-risk evidence.',
      aliases: ['toylens', 'toy lens', 'toy', 'figure', 'lego', 'collectible'],
      keywords: [
        /\blego\b/i, /toy/i, /action\s*figure/i, /funko/i, /vintage\s*toy/i, /model\s*kit/i, /collectible\s*figure/i,
        /playset/i, /toy\s*bundle/i, /minifigure/i, /minifig/i, /star\s*wars\s*figure/i, /warhammer/i, /hot\s*wheels/i,
        /boxed/i, /sealed/i, /complete\s*set/i, /instructions/i, /accessories/i
      ],
      evidenceRules: [
        { id: 'main_item_photo', label: 'Main item photo', ask: 'Clear photos of the toy, figure, set or bundle', positive: [/photo/i, /figure/i, /set/i, /bundle/i, /front/i] },
        { id: 'box_photo', label: 'Box/packaging photo', ask: 'Photos showing original box, packaging, seals, barcode and damage if included', positive: [/box/i, /packaging/i, /sealed/i, /barcode/i, /carded/i] },
        { id: 'accessories', label: 'Accessories shown', ask: 'Photos showing all accessories, weapons, stands, minifigures, spare parts or missing items', positive: [/accessories/i, /weapon/i, /stand/i, /minifig/i, /parts/i, /complete/i] },
        { id: 'instructions_manuals', label: 'Instructions/manuals', ask: 'Photos of LEGO instructions, manuals, booklets or build guides if included', positive: [/instructions/i, /manual/i, /booklet/i, /guide/i] },
        { id: 'completeness_proof', label: 'Completeness evidence', ask: 'A full parts/accessories layout or checklist if the listing claims complete', positive: [/complete/i, /all\s*parts/i, /inventory/i, /checklist/i, /nothing\s*missing/i] },
        { id: 'condition_damage', label: 'Condition/damage close-ups', ask: 'Close-ups of paint wear, cracks, yellowing, loose joints, damaged boxes or missing pieces', positive: [/paint\s*wear/i, /crack/i, /yellowing/i, /loose/i, /damage/i, /missing/i] }
      ],
      sellerQuestion: 'Hi, could you please send photos showing all accessories, instructions, box condition, and any damaged or missing parts? Thanks.',
      riskTerms: [/repro/i, /reproduction/i, /bootleg/i, /knock[- ]?off/i, /custom/i, /missing/i, /incomplete/i]
    }
  ];

  const lensById = new Map(lenses.map((lens) => [lens.id, lens]));
  const supportedLensIds = new Set(lenses.filter((lens) => lens.id !== 'auto').map((lens) => lens.id));

  const motorPatterns = [
    /\bcar(s)?\b/i, /\bmotorbike(s)?\b/i, /\bmotorcycle(s)?\b/i, /\bscooter(s)?\b/i, /\bvan\b/i, /\bvehicle(s)?\b/i,
    /vehicle\s*part(s)?/i, /car\s*part(s)?/i, /motorbike\s*part(s)?/i, /number\s*plate/i, /registration\s*plate/i,
    /\bengine(s)?\b/i, /gearbox/i, /transmission/i, /turbocharger|\bturbo\b/i, /alternator/i, /starter\s*motor/i,
    /body\s*panel/i, /bumper/i, /bonnet/i, /wing\s*mirror/i, /headlight/i, /tail\s*light/i, /taillight/i,
    /alloy\s*wheel/i, /\btyre(s)?\b|\btire(s)?\b/i, /exhaust/i, /clutch/i, /brake\s*(disc|pad|caliper)/i,
    /ecu\b|car\s*electronics/i, /camper(van)?/i, /fitment/i, /part\s*number/i, /\bMOT\b/i, /service\s*history/i,
    /roadworthy/i, /mileage/i, /\bBMW\b|\bAudi\b|\bMercedes\b|\bFord\b|\bVauxhall\b|\bVolkswagen\b|\bToyota\b|\bHonda\b/i
  ];

  const platformPatterns = [
    { id: 'ebay', label: 'eBay', pattern: /ebay\.(co\.uk|com)\/itm\//i },
    { id: 'vinted', label: 'Vinted', pattern: /vinted\.(co\.uk|com)\/(items|catalog)\//i }
  ];

  function allLenses(options = {}) {
    return lenses.filter((lens) => options.includeAuto || lens.id !== 'auto');
  }

  function getLens(id) {
    if (!id) return lensById.get(DEFAULT_LENS_ID);
    const value = String(id).trim().toLowerCase();
    const exact = lensById.get(value);
    if (exact) return exact;
    return lenses.find((lens) => lens.aliases?.some((alias) => alias.toLowerCase() === value)) || lensById.get(DEFAULT_LENS_ID);
  }

  function isSupportedLensId(id) {
    return supportedLensIds.has(String(id || '').toLowerCase());
  }

  function inferMarketplace(url = '') {
    const text = String(url || '');
    const match = platformPatterns.find((item) => item.pattern.test(text));
    return match ? match.id : text ? 'unsupported' : 'manual';
  }

  function platformLabel(marketplace = '') {
    const match = platformPatterns.find((item) => item.id === marketplace);
    if (match) return match.label;
    if (marketplace === 'manual') return 'Manual check';
    if (marketplace === 'unsupported') return 'Unsupported marketplace';
    return marketplace ? String(marketplace).replace(/_/g, ' ') : 'Marketplace';
  }

  function isDirectListingUrl(url = '') {
    return platformPatterns.some((item) => item.pattern.test(String(url || '')));
  }

  function buildEvidenceText(listing = {}) {
    const photoText = Array.isArray(listing.photos)
      ? listing.photos.map((photo) => [photo.alt, photo.url, photo.caption].filter(Boolean).join(' ')).join(' ')
      : '';
    return [
      listing.title,
      listing.priceText || listing.price,
      listing.description,
      listing.condition,
      listing.size,
      listing.brand,
      listing.category,
      listing.marketplace,
      listing.url,
      listing.sellerName,
      listing.sellerRating,
      listing.shippingLocation,
      listing.rawVisibleText,
      photoText
    ].filter(Boolean).join(' ').replace(/\s+/g, ' ').slice(0, 40000);
  }

  function motorMatch(listing = {}) {
    const text = buildEvidenceText(listing);
    if (/hot\s*wheels/i.test(text) && !/(car\s*part|vehicle\s*part|fitment|headlight|engine|gearbox|tyre|alloy\s*wheel)/i.test(text)) {
      return null;
    }
    const match = motorPatterns.find((pattern) => pattern.test(text));
    return match ? match.source.replace(/^\\b|\\b$/g, '') : null;
  }

  function isMotorListing(listing = {}) {
    return Boolean(motorMatch(listing));
  }

  function scoreLens(lens, listing = {}) {
    if (!lens || lens.id === 'auto') return -1;
    const text = buildEvidenceText(listing);
    let score = 0;
    for (const pattern of lens.keywords || []) {
      if (pattern.test(text)) score += 2;
    }
    for (const alias of lens.aliases || []) {
      if (alias && text.toLowerCase().includes(alias.toLowerCase())) score += 1;
    }
    if (String(listing.detectedLens || '').toLowerCase() === lens.id) score += 6;
    if (String(listing.category || '').toLowerCase().includes(lens.category.split(',')[0].toLowerCase())) score += 1;
    return score;
  }

  function resolveLensForListing(listing = {}, preferredLensId = DEFAULT_LENS_ID) {
    const motorReason = motorMatch(listing);
    if (motorReason) {
      return {
        id: EXCLUDED_MOTOR_ID,
        name: 'Motor category detected',
        shortName: 'Motors not supported',
        category: 'Excluded motors',
        badge: 'NO',
        excluded: true,
        reason: `Matched motor-related signal: ${motorReason}`
      };
    }

    const preferred = getLens(preferredLensId);
    if (preferred && preferred.id !== 'auto') return preferred;

    let best = null;
    let bestScore = 0;
    for (const lens of allLenses()) {
      const score = scoreLens(lens, listing);
      if (score > bestScore) {
        best = lens;
        bestScore = score;
      }
    }

    if (!best || bestScore < 2) {
      return {
        id: 'uncertain',
        name: 'Choose a Lens',
        shortName: 'Uncertain',
        category: 'Needs manual Lens choice',
        badge: '?',
        uncertain: true,
        reason: 'No category had enough evidence to route confidently.'
      };
    }

    return best;
  }

  function evidenceRulesForLens(lensId) {
    const lens = getLens(lensId);
    if (!lens || lens.id === 'auto') return commonEvidenceRules;
    return [...commonEvidenceRules, ...(lens.evidenceRules || [])];
  }

  function checklistFor(listing = {}, lensId = DEFAULT_LENS_ID) {
    const lens = resolveLensForListing(listing, lensId);
    if (lens.excluded || lens.uncertain) return [];
    const text = buildEvidenceText(listing);
    return evidenceRulesForLens(lens.id).map((rule) => {
      let found = false;
      if (typeof rule.found === 'function') found = Boolean(rule.found(listing));
      if (!found && rule.skipIf?.test(text)) found = true;
      if (!found) found = (rule.positive || []).some((pattern) => pattern.test(text));
      return { id: rule.id, label: rule.label, ask: rule.ask, found };
    });
  }

  function estimateMissingEvidence(listing = {}, lensId = DEFAULT_LENS_ID) {
    return checklistFor(listing, lensId)
      .filter((item) => !item.found)
      .map((item) => item.label);
  }

  function sellerQuestionsFor(lensId, missingEvidence = []) {
    const lens = getLens(lensId);
    if (!lens || lens.id === 'auto') {
      return 'Hi, could you please send clearer photos of the item, including front, back, close-up details, condition flaws, and any proof or identifiers relevant to the listing? Thanks.';
    }
    const missingLine = Array.isArray(missingEvidence) && missingEvidence.length
      ? `\n\nThe main missing evidence appears to be: ${missingEvidence.slice(0, 6).join(', ')}.`
      : '';
    return `${lens.sellerQuestion || 'Hi, could you please send clearer photos and any relevant proof before I decide? Thanks.'}${missingLine}`;
  }

  function lensSelectOptions(selectedId = DEFAULT_LENS_ID, options = {}) {
    const selected = String(selectedId || DEFAULT_LENS_ID).toLowerCase();
    return allLenses({ includeAuto: Boolean(options.includeAuto) })
      .map((lens) => `<option value="${escapeHtml(lens.id)}" ${lens.id === selected ? 'selected' : ''}>${escapeHtml(lens.name)}</option>`)
      .join('');
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  global.ListLensGuardRegistry = {
    VERSION,
    DEFAULT_LENS_ID,
    EXCLUDED_MOTOR_ID,
    allLenses,
    getLens,
    isSupportedLensId,
    inferMarketplace,
    platformLabel,
    isDirectListingUrl,
    buildEvidenceText,
    isMotorListing,
    motorMatch,
    resolveLensForListing,
    evidenceRulesForLens,
    checklistFor,
    estimateMissingEvidence,
    sellerQuestionsFor,
    lensSelectOptions,
    escapeHtml
  };

  // Backwards-compatible alias for older extension files.
  global.ListLensPortfolio = global.ListLensGuardRegistry;
})(globalThis);
