import { NAKALA_BASE_URL } from '@/data/members';

const isNonEmpty = (v) => v !== undefined && v !== null;

const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(v => String(v).trim());
  return String(value).split(';').map(v => v.trim()).filter(Boolean);
};

// Regroupe les catégories historiques du catalogue sous des libellés plus larges.
const CATEGORY_MERGE_MAP = {
  "Captation du geste": "Données instrumentales",
  "Données de captation": "Données instrumentales",
  "Artéfacts de médiation": "Ressources pédagogiques",
  "Pédagogie": "Ressources pédagogiques",
  "Recherche - Analyse narrative": "Recherche en SHS",
  "Entretiens": "Recherche en SHS",
  "Recherche - Attention / Eyetracking": "Recherche en SHS",
};

const mergeCategory = (category) => CATEGORY_MERGE_MAP[category] || category;

const FIELD_MAPPINGS = {
  "dct:title": "title",
  "dct:description": "description",
  "dct:subject": "subject",
  "dct:creator": "creator",
  "dct:publisher": "publisher",
  "dct:language": "language",
  "dct:created": "created",
  "dct:issued": "issued",
  "dct:rightsHolder": "rightsHolder",
  "dct:extent": "extent",
  "dct:identifier": "identifier",
  "dct:license": "license",
  "dct:format": "format",
  "rs:storage": "storage",
  "rs:category": "category",
  "rs:mediatype": "mediatype",
  "rs:identifier": "identifier",
  "rs:DOI": "doi",
  "rs:CollectionID": "collectionId",
  "rs:discipline": "discipline",
  "rs:expertise": "expertise",
  "rs:audience": "audience",
  "rs:subtype": "subtype",
};

export const normalizeRecord = (raw) => {
  const record = { ...raw };

  Object.entries(FIELD_MAPPINGS).forEach(([source, target]) => {
    if (isNonEmpty(raw[source]) && !isNonEmpty(record[target])) {
      record[target] = raw[source];
    }
  });

  if (isNonEmpty(raw["dct:Location"]) && !isNonEmpty(record.coverage)) {
    record.coverage = String(raw["dct:Location"]);
  }

  // Champs toujours manipulés sous forme de tableaux
  record.rightsHolder = toArray(record.rightsHolder);
  record.expertise = toArray(record.expertise);
  record.audience = toArray(record.audience);
  record.subject = toArray(record.subject);

  if (record.category) record.category = mergeCategory(record.category);

  return record;
};

export const normalizeCatalogue = (data) => ({
  collections: data.collections.map(colRaw => {
    const col = normalizeRecord(colRaw);
    if (Array.isArray(colRaw.data)) col.data = colRaw.data.map(normalizeRecord);
    return col;
  }),
});

export const makeDownloadURL = (resource) => {
  const storage = (resource.storage || "Nakala").toLowerCase();
  const identifier = resource.identifier || "";
  if (!identifier) return null;
  if (storage === "nakala") return `${NAKALA_BASE_URL}/${identifier}`;
  return null;
};

export const makeIIIFUrl = (downloadURL, size = "800,") => {
  try {
    const urlObj = new URL(downloadURL);
    const parts = urlObj.pathname.split("/");
    const datasetId = parts[2];
    const fileId = parts[3];
    return `${urlObj.origin}/iiif/${datasetId}/${fileId}/full/${size}/0/default.jpg`;
  } catch {
    return null;
  }
};

export const formatExtent = (extent) => {
  if (!extent || typeof extent !== "string") return "";
  if (!extent.startsWith("P")) return extent;

  const regex = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/;
  const match = extent.match(regex);
  if (!match) return extent;

  const [, years, months, days, hours, minutes, seconds] = match;
  const parts = [];
  if (years) parts.push(`${years} an${parseInt(years) > 1 ? "s" : ""}`);
  if (months) parts.push(`${months} mois`);
  if (days) parts.push(`${days} jour${parseInt(days) > 1 ? "s" : ""}`);
  if (hours) parts.push(`${hours} h`);
  if (minutes) parts.push(`${minutes} min`);
  if (seconds) parts.push(`${seconds} s`);

  return parts.join(" ");
};

export const joinList = (value) => (Array.isArray(value) ? value.join("; ") : value || "");

// --- Export CSV des métadonnées de gouvernance ---

const GOVERNANCE_COLUMNS = [
  { key: "kind", label: "Type" },
  { key: "parentTitle", label: "Collection parente" },
  { key: "title", label: "Titre" },
  { key: "license", label: "Licence" },
  { key: "rightsHolder", label: "Détenteur des droits" },
  { key: "creator", label: "Producteur" },
  { key: "publisher", label: "Éditeur" },
  { key: "storage", label: "Dépôt" },
  { key: "identifier", label: "Identifiant" },
  { key: "doi", label: "DOI" },
  { key: "created", label: "Date de production" },
  { key: "issued", label: "Date de publication" },
  { key: "language", label: "Langue" },
];

const governanceRow = (resource, kind, parentTitle = "") => ({
  kind,
  parentTitle,
  title: resource.title || "",
  license: resource.license || "",
  rightsHolder: joinList(resource.rightsHolder),
  creator: joinList(resource.creator),
  publisher: joinList(resource.publisher),
  storage: resource.storage || "",
  identifier: resource.identifier || "",
  doi: resource.doi || "",
  created: resource.created || "",
  issued: resource.issued || "",
  language: resource.language || "",
});

export const collectionToGovernanceRows = (collection) => [
  governanceRow(collection, "Collection"),
  ...(collection.data || []).map(d => governanceRow(d, "Ressource", collection.title || "")),
];

export const catalogueToGovernanceRows = (collections) =>
  collections.flatMap(collectionToGovernanceRows);

const escapeCSVField = (value) => {
  const str = String(value ?? "");
  if (/[",\r\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
};

const CSV_BOM = String.fromCharCode(0xFEFF);

export const toCSV = (rows) => {
  const header = GOVERNANCE_COLUMNS.map(c => c.label).join(",");
  const lines = rows.map(row => GOVERNANCE_COLUMNS.map(c => escapeCSVField(row[c.key])).join(","));
  return CSV_BOM + [header, ...lines].join("\r\n");
};

export const downloadCSV = (filename, rows) => {
  const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
