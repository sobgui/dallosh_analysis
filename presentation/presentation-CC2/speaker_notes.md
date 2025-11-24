# Script de Présentation - Soutenance Dallosh Analysis (Bloc CC2.2)

Ce document contient les notes de speaker pour accompagner les slides.

---

## Slide 1 : Titre & Introduction
**Temps estimé : 1 min**

*   **Accroche :** "Bonjour à tous. Aujourd'hui, je vais vous présenter comment nous avons transformé près de 4000 tweets en un outil de pilotage stratégique pour Free Mobile."
*   **Contexte :** "Nous sommes dans le cadre du Bloc CC2. Ce projet, 'Dallosh Analysis', part d'un constat simple : le SAV sur Twitter est souvent perçu comme un déversoir de haine. Nous avons voulu vérifier cette hypothèse par la data."
*   **Objectif :** "Mon objectif ce matin est de vous montrer que la réalité est contre-intuitive et de vous proposer un plan d'action basé sur des faits, pas des ressentis."

---

## Slide 2 : Plan de la Présentation
**Temps estimé : 30 sec**

*   "Notre présentation suivra une logique de l'analyse vers l'action :"
*   "D'abord, le **Contexte et la Technique** : comment nous avons traité la donnée."
*   "Ensuite, le **Diagnostic** : ce que les données révèlent réellement (et c'est surprenant)."
*   "Et enfin, le cœur du sujet : mes **Recommandations Stratégiques** pour capitaliser sur nos forces et corriger nos faiblesses."

---

## Slide 3 : Contexte & Défi
**Temps estimé : 2 min**

*   **La Donnée Brute :** "Nous avons analysé un dataset de **3 790 tweets**. Ce n'est pas juste du texte, c'est de l'engagement : près de 20 000 réponses sur les sujets négatifs."
*   **Le Défi :** "Le défi n'était pas technique, mais analytique : comment sortir du bruit ambiant pour identifier les vrais problèmes ? Est-ce que Free est vraiment 'bashé' sur Twitter ?"
*   **Approche :** "Nous avons construit un pipeline qui ne se contente pas de lire, mais qui *comprend* et *classe* chaque tweet pour séparer le signal du bruit."

---

## Slide 4 : Synthèse des Données Analysées
**Temps estimé : 2 min**

*   **Volume :** "Sur près de 3800 tweets, nous avons une première surprise majeure."
*   **Répartition :** "Contrairement aux idées reçues, **51% des tweets sont positifs**. Le 'bashing' n'est pas la norme. Les clients parlent quand ça marche (installation, offres)."
*   **Enrichissement IA :** "C'est ici que la valeur est créée. Chaque tweet a été analysé par une IA (LLM) selon 3 axes : Sentiment, Topic, Priorité. Tout est 100% automatisé."

---

## Slide 5 : Architecture Technique
**Temps estimé : 1 min 30**

*   **Vue d'ensemble :** "Rapidement sur la technique : nous avons une architecture moderne et résiliente."
*   **Points clés :**
    *   "C'est une architecture microservices."
    *   "Le cœur du réacteur, c'est le **Processing Python** couplé à des modèles de langage (LLM)."
    *   "Nous utilisons **RabbitMQ** pour gérer les pics de charge et suivre le flux de traitement."

---

## Slide 6 : Principaux Constats & KPIs SAV
**Temps estimé : 3 min**

*   **Le Constat Vert (Surprise) :** "Regardons les chiffres. **51% de positif**. C'est une victoire pour l'image de marque. Les nouvelles offres et la rapidité d'installation sont plébiscitées."
*   **Le Point de Vigilance (38% Négatif) :** "Cependant, le négatif reste fort (38%). Mais attention à la **Viralité Asymétrique**."
*   **Le Risque Viral :** "Un tweet négatif génère plus d'engagement (réponses/RT) qu'un tweet positif. Le bruit négatif porte plus loin que la satisfaction silencieuse."
*   **L'Enseignement :** "Nous avons une base de clients heureux qu'on n'utilise pas assez, et une minorité bruyante qu'on gère mal."

---

## Slide 7 : Analyse des Thématiques
**Temps estimé : 2 min**

*   **De quoi parle-t-on ?** "C'est le pivot stratégique de cette présentation."
*   **Le Mythe du Réseau :** "On pensait que le problème c'était le Réseau. Faux. Le Réseau ne représente que **18%** des plaintes."
*   **La Réalité Matérielle :** "Le vrai problème, c'est le **Matériel (30%)** et le **Service Client (29%)**. Les gens se plaignent de leur Box, pas de leur 4G."
*   **Conclusion :** "On se bat sur le mauvais front. Il faut arrêter de parler de couverture réseau et commencer à parler de fiabilité des Box."

---

## Slide 8 : Recommandations Opérationnelles
**Temps estimé : 1 min**

*   "Avant de passer à la stratégie, voici les changements immédiats pour les équipes :"
*   **Focus Matériel :** "On forme les agents au diagnostic Box à distance. C'est la priorité #1."
*   **Amplification :** "On ne laisse plus les 51% de positifs sans réponse. On les remercie, on les RT. On occupe le terrain."
*   **Gestion de Crise :** "Alerte immédiate sur les mots-clés 'Panne Totale'. Même s'ils sont peu nombreux, ils sont très viraux (700+ RT)."

---

## Slide 9 : Recommandations Stratégiques (ROI)
**Temps estimé : 4 min (Slide Clé)**

*   "Voici mon plan d'action stratégique pour les 6 prochains mois, avec les ROI associés."

*   **1. Assistant Box IA (Le Levier de Productivité) :**
    *   *Le Constat (Data) :* "**30%** du volume concerne le matériel (Box/Player). Ce sont des diagnostics techniques standardisables."
    *   *L'Action :* "On déploie un Assistant IA dédié au self-care matériel sur Twitter."
    *   *Le Gain (ROI) :* "On réduit de **25%** les tickets entrants en 6 mois."

*   **2. Programme Ambassadeur (L'Opportunité) :**
    *   *Le Constat (Data) :* "**51%** de clients sont positifs mais silencieux ou peu visibles."
    *   *L'Action :* "On lance une campagne UGC (User Generated Content) pour inciter ces clients à partager leur installation."
    *   *Le Gain (ROI) :* "Amélioration de l'image de marque et contre-feu naturel aux bad buzz."

*   **3. Refonte Espace Client (La Satisfaction) :**
    *   *Le Constat (Data) :* "Facturation (22%) et Service Client (29%) sont des points de friction majeurs."
    *   *L'Action :* "On refond l'UX de la rubrique Facture pour plus de clarté."
    *   *Le Gain (ROI) :* "Baisse des appels 'incompréhension' en 3 mois."

*   **4. Cellule Viralité (La Sécurité) :**
    *   *Le Constat (Data) :* "L'engagement est **supérieur** sur le négatif."
    *   *L'Action :* "Veille active dédiée aux signaux faibles viraux."
    *   *Le Gain (ROI) :* "Prévention des crises médiatiques. Vital."

---

## Slide 10 : Conclusion
**Temps estimé : 1 min**

*   **Synthèse :** "Dallosh Analysis a permis de déconstruire nos préjugés."
*   **Surprise :** Free performe mieux que prévu (Majorité positive).
*   **Pivot :** Le combat n'est plus le réseau, c'est le matériel.
*   **Réactivité :** Il faut casser la viralité des pannes techniques.
*   "Je suis prêt à répondre à vos questions sur la mise en œuvre."

---
