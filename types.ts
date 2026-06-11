
export interface NakalaResource {
  title: string;
  description?: string;
  subject?: string | string[];
  creator?: string | string[];
  publisher?: string | string[];
  language?: string;
  created?: string;
  issued?: string;
  rightsHolder?: string | string[];
  extent?: string;
  identifier?: string;
  license?: string;
  format?: string;
  storage?: string;
  mediatype?: string;
  doi?: string;
  collectionId?: string;
  category?: string;
  discipline?: string;
  expertise?: string | string[];
  audience?: string | string[];
  subtype?: string;
  class?: 'Collection' | 'Data';
  data?: NakalaResource[];
}

export interface Member {
  name: string;
  slug: string;
  logo: string;
  website: string;
  description: string;
  address: string;
  expertise: string | string[];
  rightsHolderKeys: string[];
}

export interface CatalogueData {
  collections: NakalaResource[];
}

export interface FilterState {
  search: string;
  category: string;
  discipline: string;
  expertise: string;
  audience: string;
  rightsHolder: string;
}
