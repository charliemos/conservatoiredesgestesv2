
import { NakalaResource, CatalogueData } from '../types';
import { NAKALA_BASE_URL } from '../constants';

const isNonEmpty = (v: any) => v !== undefined && v !== null;

const toArray = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(v => String(v).trim());
  return String(value).split(';').map(v => v.trim()).filter(Boolean);
};

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
