
import React, { useMemo } from 'react';
import { CatalogueData, FilterState, NakalaResource } from '../types';
import CollectionCard from './CollectionCard';
import { catalogueToGovernanceRows, downloadCSV } from '../services/dataService';

const NIVEAUX_MAITRISE = ["Apprenti", "Confirmé", "Maître d'art"];
const PUBLICS = ["Professeur", "Professionnel", "Apprenant"];

interface CataloguePageProps {
  catalogue: CatalogueData | null;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const CataloguePage: React.FC<CataloguePageProps> = ({ catalogue, filters, setFilters }) => {
  const normalizeText = (str: string) => (str || "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const uniqueValues = useMemo(() => {
    const disciplines = new Set<string>();
    const categories = new Set<string>();

    if (!catalogue) return { disciplines: [], categories: [] };

    catalogue.collections.forEach(col => {
      if (col.discipline) disciplines.add(col.discipline.trim());
      if (col.category) categories.add(col.category.trim());

      (col.data || []).forEach(d => {
        if (d.discipline) disciplines.add(d.discipline.trim());
        if (d.category) categories.add(d.category.trim());
      });
    });

    return {
      disciplines: Array.from(disciplines).sort(),
      categories: Array.from(categories).sort(),
    };
  }, [catalogue]);

  const filteredCatalogue = useMemo(() => {
    if (!catalogue) return [];

    return catalogue.collections.map(col => {
      const filteredData = (col.data || []).filter(d => {
        const matchesSearch = !filters.search || 
          normalizeText(d.title).includes(normalizeText(filters.search)) || 
          normalizeText(d.description || "").includes(normalizeText(filters.search));
        const matchesCategory = !filters.category || d.category === filters.category || col.category === filters.category;
        const matchesDiscipline = !filters.discipline || d.discipline === filters.discipline || col.discipline === filters.discipline;
        const matchesExpertise = !filters.expertise || (d.expertise as string[]).includes(filters.expertise) || (col.expertise as string[]).includes(filters.expertise);
        const matchesAudience = !filters.audience || (d.audience as string[]).includes(filters.audience) || (col.audience as string[]).includes(filters.audience);
        const matchesMember = !filters.rightsHolder || (d.rightsHolder as string[]).includes(filters.rightsHolder) || (col.rightsHolder as string[]).includes(filters.rightsHolder);

        return matchesSearch && matchesCategory && matchesDiscipline && matchesExpertise && matchesAudience && matchesMember;
      });

      const colMatchesItself = (() => {
        const matchesSearch = !filters.search || 
          normalizeText(col.title).includes(normalizeText(filters.search)) || 
          normalizeText(col.description || "").includes(normalizeText(filters.search));
        const matchesCategory = !filters.category || col.category === filters.category;
        const matchesDiscipline = !filters.discipline || col.discipline === filters.discipline;
        const matchesExpertise = !filters.expertise || (col.expertise as string[]).includes(filters.expertise);
        const matchesAudience = !filters.audience || (col.audience as string[]).includes(filters.audience);
        const matchesMember = !filters.rightsHolder || (col.rightsHolder as string[]).includes(filters.rightsHolder);
        return matchesSearch && matchesCategory && matchesDiscipline && matchesExpertise && matchesAudience && matchesMember;
      })();

      if (colMatchesItself || filteredData.length > 0) {
        return { ...col, data: filteredData.length > 0 ? filteredData : col.data };
      }
      return null;
    }).filter(Boolean) as NakalaResource[];
  }, [catalogue, filters]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Rechercher des ressources</h1>
      <p className="text-gray-500 mb-8">Filtrer les collections par texte, discipline, catégorie, niveau d’expertise et public cible.</p>

      {/* Filters Box */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-10 space-y-6">
        <div className="relative">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Recherche globale</label>
          <div className="relative">
             <input
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              type="text"
              placeholder="Rechercher dans les titres, descriptions…"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <svg className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Catégorie</label>
            <select 
              className="w-full bg-cyan-50/50 border border-cyan-100 rounded-xl py-2.5 px-3 text-sm text-cyan-900 focus:outline-none transition-all appearance-none cursor-pointer"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">Toutes les catégories</option>
              {uniqueValues.categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Discipline</label>
            <select 
              className="w-full bg-indigo-50/50 border border-indigo-100 rounded-xl py-2.5 px-3 text-sm text-indigo-900 focus:outline-none transition-all appearance-none cursor-pointer"
              value={filters.discipline}
              onChange={(e) => handleFilterChange('discipline', e.target.value)}
            >
              <option value="">Toutes les disciplines</option>
              {uniqueValues.disciplines.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Niveau de maîtrise</label>
            <select
              className="w-full bg-amber-50/50 border border-amber-100 rounded-xl py-2.5 px-3 text-sm text-amber-900 focus:outline-none transition-all appearance-none cursor-pointer"
              value={filters.expertise}
              onChange={(e) => handleFilterChange('expertise', e.target.value)}
            >
              <option value="">Tous les niveaux</option>
              {NIVEAUX_MAITRISE.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Public visé</label>
            <select
              className="w-full bg-sky-50/50 border border-sky-100 rounded-xl py-2.5 px-3 text-sm text-sky-900 focus:outline-none transition-all appearance-none cursor-pointer"
              value={filters.audience}
              onChange={(e) => handleFilterChange('audience', e.target.value)}
            >
              <option value="">Tous les publics</option>
              {PUBLICS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-gray-400 font-medium">{filteredCatalogue.length} collection(s) trouvée(s)</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => downloadCSV('gouvernance-catalogue.csv', catalogueToGovernanceRows(filteredCatalogue))}
              disabled={filteredCatalogue.length === 0}
              className="text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2-8H8a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"></path></svg>
              Exporter la gouvernance (CSV)
            </button>
            {(filters.search || filters.category || filters.discipline || filters.expertise || filters.audience || filters.rightsHolder) && (
              <button
                onClick={() => setFilters({ search: '', category: '', discipline: '', expertise: '', audience: '', rightsHolder: '' })}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 transition-colors"
              >
                Effacer les filtres
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Catalogue List */}
      <div className="space-y-4">
        {filteredCatalogue.length > 0 ? (
          filteredCatalogue.map((col, idx) => (
            <CollectionCard key={idx} collection={col} searchText={filters.search} />
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="text-gray-500 font-medium">Aucune collection ne correspond à vos critères.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CataloguePage;
