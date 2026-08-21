// Detecte les valeurs "d'attente" (contenu qui a l'air renseigne mais ne
// l'est pas) : chaine vide, ou l'une des formules deja rencontrees sur ce
// site ("A definir", "A preciser", etc.). Utilise a deux endroits :
// - src/content.config.ts, pour empecher une entree pretPourPublication:true
//   d'avoir un champ obligatoire rempli d'un texte d'attente plutot que d'une
//   vraie valeur (une chaine non vide n'est pas forcement une vraie valeur) ;
// - les gabarits de page et detail-modal.js, pour ne jamais afficher un
//   libellé a cote d'une valeur d'attente (on masque le libelle entier).
const PLACEHOLDER_PATTERNS = [
  'a definir',
  'a preciser',
  'a confirmer',
  'a completer',
  'todo',
  'tbd',
  'n/a',
  'nous consulter',
  'a venir',
];

function normalize(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

export function isPlaceholder(value) {
  if (value === undefined || value === null) return true;
  const s = normalize(value);
  if (s === '') return true;
  return PLACEHOLDER_PATTERNS.includes(s);
}
