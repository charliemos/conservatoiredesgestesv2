
import React from 'react';
import { MEMBERS } from '../constants';
import { CatalogueData } from '../types';

interface AboutPageProps {
  catalogue: CatalogueData | null;
  onViewMemberData: (rightsHolder: string) => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ catalogue, onViewMemberData }) => {
  const hasDataForMember = (memberKeys: string[]) => {
    if (!catalogue) return false;
    return catalogue.collections.some(col => {
      const holders = Array.isArray(col.rightsHolder) ? col.rightsHolder : [];
      if (holders.some(h => memberKeys.includes(h))) return true;
      return (col.data || []).some(d => {
        const dHolders = Array.isArray(d.rightsHolder) ? d.rightsHolder : [];
        return dHolders.some(h => memberKeys.includes(h));
      });
    });
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <section className="bg-amber-50/50 p-8 rounded-2xl border border-amber-100">
        <h1 className="text-3xl font-extrabold text-black mb-6 tracking-tight">Le conservatoire en quelques mots</h1>
        <p className="text-lg text-black/80 leading-relaxed mb-8 max-w-3xl">
          Les métiers d'art, de la mode et du luxe occupent une place unique en France. Ils rassemblent des siècles d'histoire et une diversité unique de territoires et d'acteurs. Porté par le programme PIA France 2030, le Conservatoire des gestes et savoir-faire a pour ambition de réunir des acteurs interdisciplinaire afin de fournir des ressources humaines, techniques et pédagogiques pour la transmission des savoir-faire.
        </p>
        <button 
          onClick={() => window.location.hash = '#/'}
          className="bg-amber-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-800 transition-all shadow-lg hover:shadow-amber-200"
        >
          Rechercher des ressources
        </button>
      </section>

      <section className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">Métiers pilotes</h1>
        <p className="text-lg text-gray-700/80 leading-relaxed mb-8 max-w-3xl">
          Le conservatoire s'est constitué empiriquement à partir de métiers pilotes, choisis pour leur diversité et leur représentativité. Ces métiers sont représentés par des établissements partenaires, qui contribuent à la production de données de captation, la documentation et l'analyse des gestes.
        </p>
      </section> 
      

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Les membres du Conservatoire</h2>
        <p className="text-gray-500 mb-8 italic">Les établissements partenaires contribuent à la production, la documentation et l'analyse des gestes.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MEMBERS.map(member => {
            const memberHasData = hasDataForMember(member.rightsHolderKeys);
            return (
              <div key={member.slug} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:border-amber-200 transition-all group">
                <div className="flex items-center gap-8 mb-8">
                  <div className="w-32 h-20 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden p-2 group-hover:scale-105 transition-transform">
                    <img src={member.logo} alt={member.name} className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 group-hover:text-amber-800 transition-colors">{member.name}</h4>
                    <div className="flex gap-2 mt-2">
                      <a href={member.website} target="_blank" rel="noopener" className="text-[8px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase tracking-wider">Site Web</a>
                      <span className="text-[8px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded uppercase tracking-wider">{Array.isArray(member.expertise) ? member.expertise[0] : member.expertise}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-6 grow">{member.description}</p>
                <div className="text-[10px] text-gray-400 mb-6 flex items-center gap-2">
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                   {member.address}
                </div>
                <button 
                  disabled={!memberHasData}
                  onClick={() => onViewMemberData(member.rightsHolderKeys[0])}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                    memberHasData 
                    ? "bg-gray-900 text-white hover:bg-amber-700 shadow-md" 
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {memberHasData ? "Voir les données associées" : "Aucune donnée publiée"}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
