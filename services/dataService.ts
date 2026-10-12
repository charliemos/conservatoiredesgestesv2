
import { NakalaResource, CatalogueData } from '../types';
import { NAKALA_BASE_URL } from '../constants';

const isNonEmpty = (v: any) => v !== undefined && v !== null;

const toArray = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(v => String(v).trim());
  return String(value).split(';').map(v => v.trim()).filter(Boolean);
};

// Regroupe les catégories historiques du catalogue sous des libellés plus larges.
const CATEGORY_MERGE_MAP: Record<string, string> = {
  "Captation du geste": "Données instrumentales",
  "Données de captation": "Données instrumentales",
  "Artéfacts de médiation": "Ressources pédagogiques",
  "Pédagogie": "Ressources pédagogiques",
  "Recherche - Analyse narrative": "Recherche en SHS",
  "Entretiens": "Recherche en SHS",
  "Recherche - Attention / Eyetracking": "Recherche en SHS",
};

const mergeCategory = (category: string) => CATEGORY_MERGE_MAP[category] || category;

export const normalizeRecord = (raw: any): NakalaResource => {
  const record: any = { ...raw };

  const mappings: Record<string, string> = {
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
    "rs:subtype": "subtype"
  };

  Object.entries(mappings).forEach(([source, target]) => {
    if (isNonEmpty(raw[source]) && !isNonEmpty(record[target])) {
      record[target] = raw[source];
    }
  });

  if (isNonEmpty(raw["dct:Location"]) && !isNonEmpty(record.coverage)) {
    record.coverage = String(raw["dct:Location"]);
  }

  // Ensure arrays for specific fields
  record.rightsHolder = toArray(record.rightsHolder);
  record.expertise = toArray(record.expertise);
  record.audience = toArray(record.audience);
  record.subject = toArray(record.subject);

  if (record.category) record.category = mergeCategory(record.category);

  return record;
};

export const makeDownloadURL = (resource: NakalaResource) => {
  const storage = (resource.storage || "Nakala").toLowerCase();
  const identifier = resource.identifier || "";
  if (!identifier) return null;
  if (storage === "nakala") return `${NAKALA_BASE_URL}/${identifier}`;
  return null;
};

export const makeIIIFUrl = (downloadURL: string, size = "800,") => {
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

export const formatExtent = (extent: string) => {
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

// --- Export CSV des métadonnées de gouvernance ---

const GOVERNANCE_COLUMNS: { key: string; label: string }[] = [
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

const governanceRow = (resource: NakalaResource, kind: "Collection" | "Ressource", parentTitle = "") => ({
  kind,
  parentTitle,
  title: resource.title || "",
  license: resource.license || "",
  rightsHolder: Array.isArray(resource.rightsHolder) ? resource.rightsHolder.join("; ") : resource.rightsHolder || "",
  creator: Array.isArray(resource.creator) ? resource.creator.join("; ") : resource.creator || "",
  publisher: Array.isArray(resource.publisher) ? resource.publisher.join("; ") : resource.publisher || "",
  storage: resource.storage || "",
  identifier: resource.identifier || "",
  doi: resource.doi || "",
  created: resource.created || "",
  issued: resource.issued || "",
  language: resource.language || "",
});

export const collectionToGovernanceRows = (collection: NakalaResource) => [
  governanceRow(collection, "Collection"),
  ...(collection.data || []).map(d => governanceRow(d, "Ressource", collection.title || "")),
];

export const catalogueToGovernanceRows = (collections: NakalaResource[]) =>
  collections.flatMap(collectionToGovernanceRows);

const escapeCSVField = (value: string) => {
  const str = String(value ?? "");
  if (/[",\r\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
};

const CSV_BOM = String.fromCharCode(0xFEFF);

export const toCSV = (rows: Record<string, string>[]) => {
  const header = GOVERNANCE_COLUMNS.map(c => c.label).join(",");
  const lines = rows.map(row => GOVERNANCE_COLUMNS.map(c => escapeCSVField(row[c.key])).join(","));
  return CSV_BOM + [header, ...lines].join("\r\n");
};

export const downloadCSV = (filename: string, rows: Record<string, string>[]) => {
  const csv = toCSV(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
