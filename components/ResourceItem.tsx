
import React, { useState } from 'react';
import { NakalaResource } from '../types';
import { makeDownloadURL, makeIIIFUrl, formatExtent } from '../services/dataService';

interface ResourceItemProps {
  resource: NakalaResource;
  searchText: string;
}

const ResourceItem: React.FC<ResourceItemProps> = ({ resource, searchText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const downloadUrl = makeDownloadURL(resource);
  const mediatype = (resource.mediatype || "").toLowerCase();
  const format = resource.format || "";

  const highlight = (text: string) => {
    if (!searchText || !text) return text;
    const regex = new RegExp(`(${searchText})`, 'gi');
    return text.split(regex).map((part, i) => 
      part.toLowerCase() === searchText.toLowerCase() 
        ? <span key={i} className="search-highlight">{part}</span> 
        : part
    );
  };

  const renderMedia = () => {
    if (!downloadUrl) return null;

    if (format.includes("pdf")) {
      const preview = makeIIIFUrl(downloadUrl, "1000,");
      return (
        <div className="mt-4">
          {preview && <img src={preview} alt="PDF Preview" className="rounded shadow-sm mb-2 max-h-96" />}
          <a href={downloadUrl} target="_blank" rel="noopener" className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm font-medium border border-blue-200 hover:bg-blue-100 transition-colors">
            Ouvrir / Télécharger PDF
          </a>
        </div>
      );
    }

    if (format.startsWith("video") || mediatype.includes("vidéo") || mediatype.includes("video")) {
      return (
        <video controls className="w-full rounded mt-4 bg-black">
          <source src={downloadUrl} type={format} />
        </video>
      );
    }

    if (format.startsWith("audio") || mediatype.includes("audio")) {
      return (
        <audio controls className="w-full mt-4">
          <source src={downloadUrl} type={format} />
        </audio>
      );
    }

    if (format.startsWith("image")) {
      const preview = makeIIIFUrl(downloadUrl) || downloadUrl;
      return <img src={preview} alt={resource.title} className="rounded mt-4 shadow-sm" />;
    }

    return (
      <div className="mt-4">
        <a href={downloadUrl} target="_blank" rel="noopener" className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-medium border border-gray-200 hover:bg-gray-200 transition-colors">
          Télécharger le fichier ({format || "inconnu"})
        </a>
      </div>
    );
  };

  return (
    <div className="border border-gray-100 rounded-lg mb-3 overflow-hidden bg-white shadow-sm">
      <div 
        className="flex items-start justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex gap-3 items-center">
          <span className="text-gray-400 font-bold w-4 text-center">{isOpen ? '−' : '+'}</span>
          <h4 className="text-sm font-semibold text-gray-800">{highlight(resource.title || "(Sans titre)")}</h4>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          {resource.mediatype && <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">{resource.mediatype}</span>}
          {resource.license && <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-medium">CC</span>}
          {resource.extent && <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded font-medium">{formatExtent(resource.extent)}</span>}
        </div>
      </div>
      
      {isOpen && (
        <div className="p-4 border-t border-gray-50 bg-gray-50/30">
          {resource.description && <p className="text-xs text-gray-600 leading-relaxed">{highlight(resource.description)}</p>}
          {renderMedia()}
        </div>
      )}
    </div>
  );
};

export default ResourceItem;
