// Fiches "En savoir plus" : affichees en fenetre modale (DetailModal.astro)
// depuis les cartes de /services, et lues directement par trois pages
// (/methode, /amira, /maya) dans leur frontmatter.
//
// Les valeurs vivent desormais dans details.json, que l interface
// d administration sait editer (Sveltia CMS, voir public/admin/config.yml >
// collection "fiches"). Ce fichier ne fait plus que remettre la liste sous la
// forme d objet indexe par cle attendue par le reste du code : l export
// "detail" n a pas change de forme.
//
// ATTENTION, ce module part dans le bundle NAVIGATEUR : detail-modal.js
// l importe pour remplir la fenetre modale cote client. Il ne doit donc
// embarquer aucune dependance lourde. C est pour cette raison que la
// validation Zod des fiches vit dans src/content.config.ts, qui ne tourne
// qu au build - mesure faite, importer Zod ici faisait passer le JS livre sur
// chaque page de 17 Ko a 76 Ko.
//
// La cle d une fiche n est pas un identifiant technique libre : pour les cinq
// fiches ouvertes depuis une carte, detail-modal.js retrouve l entree en
// normalisant le titre affiche sur la carte (fonction norm()). Renommer une
// cle sans renommer le titre correspondant, ou l inverse, casse l ouverture de
// la fiche sans aucun message. Voir l avertissement porte par le champ "cle"
// dans public/admin/config.yml.
import donnees from './details.json';

export var detail = {};
donnees.fiches.forEach(function (fiche) {
  detail[fiche.cle] = {
    k: fiche.k,
    p: fiche.p,
    who: fiche.who,
    how: fiche.how,
    facts: fiche.facts,
    cta: fiche.cta,
  };
});
