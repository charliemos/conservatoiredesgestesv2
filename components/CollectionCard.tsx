
import React from 'react';
import { NakalaResource } from '../types';
import ResourceItem from './ResourceItem';

interface CollectionCardProps {
  collection: NakalaResource;
  searchText: string;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection, searchText }) => {
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
    const [d, m, y] = collection.issued.split('/');
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
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
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-xs text-gray-500 font-medium italic border-b border-gray-50 pb-4">
          <span><strong>Producteur(s) :</strong> {highlight(Array.isArray(collection.creator) ? collection.creator.join('; ') : collection.creator || "n.c.")}</span>
          <span><strong>Projet :</strong> {highlight(Array.isArray(collection.publisher) ? collection.publisher.join('; ') : collection.publisher || "n.c.")}</span>
          <span><strong>Dépôt :</strong> {collection.storage || "Nakala"}</span>
          <span><strong>Publiée :</strong> {formattedDate}</span>
          <span><strong>Identifiant :</strong> {collection.identifier}</span>
        </div>

        {collection.description && (
          <p className="text-gray-700 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
            {highlight(collection.description)}
          </p>
        )}

        {collection.data && collection.data.length > 0 ? (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="h-px bg-gray-200 flex-grow"></span>
              Ressources ({collection.data.length})
              <span className="h-px bg-gray-200 flex-grow"></span>
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
