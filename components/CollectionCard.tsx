
import React, { useState } from 'react';
import { NakalaResource } from '../types';
import ResourceItem from './ResourceItem';
import { collectionToGovernanceRows, downloadCSV } from '../services/dataService';

interface CollectionCardProps {
  collection: NakalaResource;
  searchText: string;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection, searchText }) => {
  const [isGovOpen, setIsGovOpen] = useState(false);

  const highlight = (text: string) => {
    if (!searchText || !text) return text;
    const regex = new RegExp(`(${searchText})`, 'gi');
    return text.split(regex).map((part, i) => 
      part.toLowerCase() === searchText.toLowerCase() 
        ? <span key={i} className="search-highlight">{part}</span> 
        : part
    );
  };

  const formattedDate = collection.issued ? (() => {
    const date = new Date(collection.issued);
    if (isNaN(date.getTime())) return "n.c.";
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });
  })() : "n.c.";

  return (
    <section className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-8 transition-shadow hover:shadow-lg">
      <header className="bg-gray-50 p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-900 leading-tight">
          {highlight(collection.title || "Collection sans titre")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {collection.category && <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-semibold">{collection.category}</span>}
          {collection.discipline && <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-semibold">{collection.discipline}</span>}
        </div>
      </header>

      <div className="p-6">
        <div className="mb-4 border-b border-gray-50 pb-4">
          <button
            onClick={() => setIsGovOpen(v => !v)}
            className="w-full flex items-center justify-between text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="text-gray-400 font-bold w-3 text-center">{isGovOpen ? '−' : '+'}</span>
              Informations de gouvernance
            </span>
            <span className="text-gray-400 font-medium italic normal-case">Publiée : {formattedDate}</span>
          </button>

          {isGovOpen && (
            <div className="mt-3 pl-5 space-y-2">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 font-medium italic">
                <span><strong>Producteur(s) :</strong> {highlight(Array.isArray(collection.creator) ? collection.creator.join('; ') : collection.creator || "n.c.")}</span>
                <span><strong>Projet :</strong> {highlight(Array.isArray(collection.publisher) ? collection.publisher.join('; ') : collection.publisher || "n.c.")}</span>
                <span><strong>Détenteur des droits :</strong> {Array.isArray(collection.rightsHolder) ? collection.rightsHolder.join('; ') || "n.c." : collection.rightsHolder || "n.c."}</span>
                <span><strong>Licence :</strong> {collection.license || "n.c."}</span>
                <span><strong>Dépôt :</strong> {collection.storage || "Nakala"}</span>
                <span><strong>Identifiant :</strong> {collection.identifier || "n.c."}</span>
                <span><strong>DOI :</strong> {collection.doi || "n.c."}</span>
                <span><strong>Date de production :</strong> {collection.created || "n.c."}</span>
                <span><strong>Langue :</strong> {collection.language || "n.c."}</span>
              </div>
              <button
                onClick={() => downloadCSV(`gouvernance-${collection.identifier || collection.title || 'collection'}.csv`, collectionToGovernanceRows(collection))}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2-8H8a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"></path></svg>
                Exporter en CSV
              </button>
            </div>
          )}
        </div>

        {collection.description && (
          <p className="text-gray-700 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
            {highlight(collection.description)}
          </p>
        )}

        {collection.data && collection.data.length > 0 ? (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="h-px bg-gray-200 grow"></span>
              Ressources ({collection.data.length})
              <span className="h-px bg-gray-200 grow"></span>
            </h3>
            <div className="space-y-1">
              {collection.data.map((item, idx) => (
                <ResourceItem key={idx} resource={item} searchText={searchText} />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm italic text-gray-400 text-center py-4 bg-gray-50 rounded-lg">Aucune ressource listée dans cette collection.</p>
        )}
      </div>
    </section>
  );
};

export default CollectionCard;
