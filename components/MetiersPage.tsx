
import React from 'react';
import { CatalogueData } from '../types';

interface Metier {
  name: string;
  discipline: string | null;
  description: string;
}

const METIERS: Metier[] = [
  {
    name: "Ganterie",
    discipline: "ganterie",
    description: "Fabrication de gants en cuir : savoir-faire de coupe, de piqûre et de montage, transmis notamment par le Lycée du Dauphiné.",
  },
  {
    name: "Soufflage de verre à la canne",
    discipline: null,
    description: "Technique de façonnage du verre en fusion à l'aide d'une canne de soufflage, étudiée au CERFAV.",
  },
  {
    name: "Soufflage de verre au chalumeau",
    discipline: null,
    description: "Façonnage du verre à la flamme du chalumeau, exploré au sein du CERFAV.",
  },
  {
    name: "Sellerie nautique",
    discipline: "sellerie nautique",
    description: "Confection et réparation des sellages et garnitures pour l'univers nautique, enseignées au CFA de la Seyne-sur-Mer.",
  },
  {
    name: "Recherche par le design",
    discipline: null,
    description: "Approche exploratoire mobilisant les méthodes du design pour interroger et renouveler les savoir-faire, portée par l'ENSAD.",
  },
  {
    name: "Polissage en orfèvrerie",
    discipline: "orfèvrerie",
    description: "Finition et mise en brillance des pièces d'orfèvrerie par polissage manuel.",
  },
  {
    name: "Joaillerie",
    discipline: "joaillerie",
    description: "Conception et fabrication de bijoux, de la mise au point à la sertissure des pierres.",
  },
];

interface MetiersPageProps {
  catalogue: CatalogueData | null;
  onViewDiscipline: (discipline: string) => void;
}

const MetiersPage: React.FC<MetiersPageProps> = ({ catalogue, onViewDiscipline }) => {
  const hasDataForDiscipline = (discipline: string | null) => {
    if (!discipline || !catalogue) return false;
    return catalogue.collections.some(col => {
      if (col.discipline === discipline) return true;
      return (col.data || []).some(d => d.discipline === discipline);
    });
  };

  return (
    <div className="animate-fade-in space-y-10">
      <section className="bg-amber-50/50 p-8 rounded-2xl border border-amber-100">
        <h1 className="text-3xl font-extrabold text-black mb-4 tracking-tight">Les métiers étudiés</h1>
        <p className="text-lg text-black/80 leading-relaxed max-w-3xl">
          Re•Source documente un ensemble de métiers d'art choisis pour leur diversité et leur représentativité, avec l'appui des établissements partenaires du Conservatoire.
        </p>
      </section>

      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {METIERS.map(metier => {
            const dataAvailable = hasDataForDiscipline(metier.discipline);
            return (
              <div key={metier.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:border-amber-200 transition-all group">
                <h4 className="font-bold text-lg text-gray-900 group-hover:text-amber-800 transition-colors mb-3">{metier.name}</h4>
                <p className="text-sm text-gray-600 leading-relaxed mb-6 grow">{metier.description}</p>
                <button
                  disabled={!dataAvailable}
                  onClick={() => metier.discipline && onViewDiscipline(metier.discipline)}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                    dataAvailable
                      ? "bg-gray-900 text-white hover:bg-amber-700 shadow-md"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {dataAvailable ? "Voir les ressources associées" : "Ressources à venir"}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default MetiersPage;
