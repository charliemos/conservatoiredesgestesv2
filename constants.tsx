
import { Member } from './types';

function slugifyInstitution(name) {
  return name
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
export const MEMBERS: Member[] = [
  {
    name : "Campus Mode, Métiers d'Art et Design",
    slug : slugifyInstitution("Campus Mode, Métiers d'Art et Design"),
    logo : "/Logos/Campus MoMADe.png",
    website : "https://www.campusartdesign.com/",
    description : "Regroupement d’établissements et de partenaires institutionnels dédié aux domaines de la mode, du design et des métiers d’art, visant à valoriser les formations du niveau professionnel jusqu’à la recherche et promouvoir le savoir-faire artistique français à l’international depuis les Manufactures des Gobelins à Paris.",
    address : "42 Av. des Gobelins, 75013 Paris, France",
    expertise : "Mode, métiers d'art et design",
    rightsHolderKeys : ["Campus MoMADe"]
  },

  {
    name: "CERFAV",
    slug: slugifyInstitution("CERFAV"),
    logo: "/Logos/Cerfav.png",
    website : "https://www.cerfav.fr/",
    description : "Le Centre européen de recherches et de formation aux arts verriers est une référence française dans l’enseignement et l’innovation autour du verre. Il propose des formations professionnelles, stages, apprentissages et activités de recherche pour maîtriser les arts et techniques verrières du soufflage à la pâte de verre, ainsi que des initiatives culturelles et des ressources technologiques pour la filière.",
    address: "4 rue de la Liberté, 54112 Vannes-le-Châtel, France",
    expertise: "Métiers du verre",
    rightsHolderKeys: ["CERFAV"]
  },

  {
    name : "Chambre des Métiers et de l'Artisanat PACA - CFA de la Seyne-sur-Mer",
    slug : slugifyInstitution("CFA de la Seyne-sur-Mer"),
    logo : "/Logos/CMA PACA.png",
    website : "https://www.cmaformation-paca.fr/cfa/la-seyne-sur-mer",
    description : "Centre de formation d’apprentis dédié principalement à la scellerie nautique, faisant partie du réseau des Chambres de Métiers et de l’Artisanat de Provence-Alpes-Côte d’Azur. Il prépare aux métiers artisanaux techniques par l’apprentissage et la formation professionnelle.",
    address : "68 All. des Forges, 83500 La Seyne-sur-Mer, France",
    expertise : "Scellerie nautique",
    rightsHolderKeys : ["CFA de la Seyne-sur-Mer"]
  },

  {
    name : "Chambre de Métiers et de l'Artisanat Auvergne-Rhône-Alpes",
    slug : slugifyInstitution("Chambre de Métiers et de l'Artisanat de Région Auvergne-Rhône-Alpes"),
    logo : "/Logos/CMA AURA.png",
    website : "https://www.cma-auvergnerhonealpes.fr/",
    description : "Organisme régional de représentation des artisans et de soutien aux métiers d’art, qui offre des services de formation, d’accompagnement à la création d’entreprise, et des ressources pour la promotion et la pérennisation de l’artisanat sur le territoire Auvergne-Rhône-Alpes. (infos structurels issus du rôle des CMA régionales)",
    address : "14 Rue Pierre Joigneaux, 69009 Lyon, France",
    expertise : "Soutien aux artisans et métiers d'art",
    rightsHolderKeys : ["CMA AURA"]
  },

  {
    name: "Ecole Nationale Supérieure des Arts Décoratifs (ENSAD)",
    slug: slugifyInstitution("Ecole Nationale Supérieure des Arts Décoratifs"),
    logo: "/Logos/ENSAD.jpg",
    website : "https://www.ensad.fr/",
    description: "Grande école d’art et de design basée à Paris, offrant des formations supérieures en création artistique, design, conservation-restauration et histoire des arts appliqués. L’ENSAD est reconnue pour son approche créative forte, ses connexions avec les secteurs artistiques et ses démarches de recherche.",
    address: "31 Rue d'Ulm, 75005 Paris, France",
    expertise: ["recherche par le design", "artisanat d'art", "conservation-restauration"],
    rightsHolderKeys: ["ENSAD"]
  },

  {
    name : "École nationale des chartes - PSL",
    slug: slugifyInstitution("École nationale des chartes - PSL"),
    logo : "/Logos/École nationale des chartes - PSL.png",
    website : "https://www.chartes.psl.eu/",
    description : "Grande école spécialisée dans les sciences historiques, l’archivistique, la paléographie et la conservation-restauration du patrimoine écrit et graphique, formant des spécialistes de haut niveau dans les domaines des archives, bibliothèques et patrimoine culturel.",
    address : "65 Rue de Richelieu, 75002 Paris, France",
    expertise : "Conservation du patrimoine écrit et graphique",
    rightsHolderKeys : ["École nationale des chartes - PSL"]
  },

  {
    name : "France Travail",
    slug : slugifyInstitution("France Travail"),
    logo : "/Logos/France Travail.jpg",
    website : "https://www.francetravail.fr/",
    description : "Opérateur public de l’emploi en France, fournissant des services d’accompagnement pour les demandeurs d’emploi, les transitions professionnelles, la formation et l’insertion professionnelle via des services personnalisés et des partenariats institutionnels.",
    address : "18 Rue de l'Arcade, 75008 Paris, France",
    expertise : "Emploi et formation professionnelle",
    rightsHolderKeys : ["France Travail"]
  },

  {
    name : "GIP FCIP PARIS",
    slug : slugifyInstitution("GIP PARIS"),
    logo : "/Logos/GIP PARIS.png",
    website : "https://www.gip-paris.fr/",
    description : "Groupement d’intérêt public oeuvrant comme support institutionnel aux GRETA et à la formation professionnelle continue, en coordonnant des initiatives de formation, d’ingénierie pédagogique et de reconversion professionnelle pour adultes.",
    address : "12 Boulevard d'Indochine, 75019 Paris, France",
    expertise : "Promotion des métiers d'art",
    rightsHolderKeys : ["GIP PARIS"]
  },

  {
    name : "GIP FIPAN",
    slug: slugifyInstitution("GIP FIPAN"),
    logo: "/Logos/GIP FIPAN.png",
    website : "https://forpro-paca.com/GIP-FIPAN.html",
    description: "Composante du réseau FORPRO PACA, ce groupement d’intérêt public fédère des centres de formation professionnelle de la région Provence-Alpes-Côte d’Azur, offrant des formations, accompagnement à l’emploi et professionnalisation dans de nombreux secteurs, avec une forte implication auprès des métiers de l'artisanat.",
    address : "12 Bd René Cassin, 06200 Nice, France",
    expertise: "Formation professionnelle aux métiers d'art",
    rightsHolderKeys: ["GIP FIPAN"]
  },

  {
    name : "Lycée du Dauphiné",
    slug : slugifyInstitution("Lycée Professionnel Ouvrier du Dauphiné"),
    logo : "/Logos/LPO Dauphine.png",
    website : "https://lycee-dauphine.fr/",
    description : "Lycée professionnel en région Auvergne-Rhône-Alpes, à la fois général et spécialisé dans des formations aux métiers d’art, notamment ganterie de cuir.",
    address : "38 Bd Rémy Roure, 26100 Romans-sur-Isère, France",
    expertise : "Ganterie de cuir",
    rightsHolderKeys : ["Lycée Professionnel Ouvrier du Dauphiné"]
  },

  {
    name: "Mines Paris",
    slug: slugifyInstitution("Mines Paris"),
    logo: "/Logos/Mines Paris.png",
    website : "https://www.minesparis.psl.eu/",
    description: "Grande école d’ingénieurs française, membre de l’Université PSL, formant des ingénieurs de haut niveau pour répondre à des défis complexes en science, ingénierie, innovation, management et recherche, tout en intégrant des programmes d’enseignement diversifiés, des cycles masters et doctorats.",
    address: "60 Bd Saint-Michel, 75006 Paris, France",
    expertise: "Ingénierie instrumentale",
    rightsHolderKeys: ["Mines Paristech"]
  },

  {
    name : "Mines Saint-Étienne",
    slug: slugifyInstitution("Mines Saint-Étienne"),
    logo: "/Logos/Mines Saint-Étienne.png",
    website : "https://www.mines-stetienne.fr/",
    description: "Grande école d’ingénieurs reconnue pour ses formations en sciences de l’ingénieur, matériaux et procédés, promouvant la recherche, l’innovation et des approches pluridisciplinaires applicables à l’industrie et à la technologie.",
    address: "158 Cours Fauriel, 42023 Saint-Étienne, France",
    expertise: "Matériaux et procédés",
    rightsHolderKeys: ["Mines Saint-Étienne"]
  },

  {
    name: "Université Paris-Nanterre",
    slug: slugifyInstitution("Université Paris-Nanterre"),
    logo: "/Logos/Université Paris-Nanterre.png",
    website : "https://www.parisnanterre.fr/",
    description: "Université pluridisciplinaire, dont le laboratoire de recherche en psychologie cognitive, de l’apprentissage et sciences de l’éducation est impliqué activement dans le projet pour répondre aux enjeux pédagogiques liés aux métiers d’art.",
    address: "200 Avenue de la République, 92000 Nanterre, France",
    expertise: "Psychologie de l'apprentissage",
    rightsHolderKeys: ["Université Paris-Nanterre"]
  }
];

export const NAKALA_BASE_URL = "https://api.nakala.fr/data";
