# Script de Présentation - Soutenance Dallosh Analysis (Bloc CC2.2)

Ce document contient les notes de speaker pour accompagner les slides.

---

## Slide 1 : Titre & Introduction
**Temps estimé : 1 min**

*   **Accroche :** "Bonjour à tous. Aujourd'hui, je vais vous présenter comment nous avons transformé 5000 tweets de plaintes en un levier stratégique pour Free Mobile."
*   **Contexte :** "Nous sommes dans le cadre du Bloc CC2. Ce projet, 'Dallosh Analysis', part d'un constat simple : le SAV sur Twitter est une mine d'or d'informations, mais c'est aussi une zone de risque inexploitée."
*   **Objectif :** "Mon objectif ce matin n'est pas seulement de vous montrer des graphiques, mais de vous proposer un plan d'action concret pour réduire les coûts du SAV et améliorer la satisfaction client."

---

## Slide 2 : Plan de la Présentation
**Temps estimé : 30 sec**

*   "Notre présentation suivra une logique de l'analyse vers l'action :"
*   "D'abord, le **Contexte et la Technique** : comment nous avons traité la donnée."
*   "Ensuite, le **Diagnostic** : ce que les données révèlent sur l'état actuel du SAV."
*   "Et enfin, le cœur du sujet : mes **Recommandations Stratégiques** chiffrées pour corriger le tir."

---

## Slide 3 : Contexte & Défi
**Temps estimé : 2 min**

*   **La Donnée Brute :** "Nous avons reçu un export de 5000 tweets. C'est du 'bruit'. Il y a du spam, de l'humour, des insultes, et au milieu de tout ça, de vraies urgences."
*   **Le Défi :** "Le défi technique était de nettoyer ce bruit. Mais le défi *métier* est plus grand : comment repérer l'urgence critique au milieu de 4000 messages triviaux ?"
*   **Approche :** "Nous avons construit un pipeline qui ne se contente pas de lire, mais qui *comprend* et *classe* chaque tweet avant même qu'un humain ne le voie."

---

## Slide 4 : Synthèse des Données Analysées
**Temps estimé : 2 min**

*   **Volume :** "Sur 5000 tweets, nous en avons conservé 4847 pertinents. Le taux de rétention est élevé, ce qui prouve que le bruit est gérable."
*   **Enrichissement IA :** "C'est ici que la valeur est créée. Chaque tweet a été analysé par une IA (LLM) selon 3 axes :
    1.  De quoi ça parle ? (Topic)
    2.  Est-ce que le client est en colère ? (Sentiment)
    3.  Est-ce urgent ? (Priorité)"
*   **Automatisé :** "Tout ceci est 100% automatisé. Aucun humain n'a eu à lire les tweets pour les classer."

---

## Slide 5 : Architecture Technique
**Temps estimé : 1 min 30**

*   **Vue d'ensemble :** "Rapidement sur la technique : nous avons une architecture moderne et résiliente."
*   **Points clés :**
    *   "C'est une architecture microservices."
    *   "Le cœur du réacteur, c'est le **Processing Python** couplé à des modèles de langage (LLM)."
    *   "Nous utilisons **RabbitMQ** pour gérer les pics de charge et suivre le flux de traitement : si 10 000 tweets arrivent d'un coup (panne nationale), le système ne plante pas, il les met en file d'attente."

---

## Slide 6 : Principaux Constats & KPIs SAV
**Temps estimé : 3 min**

*   **Le Constat Rouge :** "Regardons la réalité en face. Le **Net Sentiment Score est très négatif (65%)**. C'est normal pour un SAV, mais le chiffre inquiétant est à côté."
*   **Le Chiffre Clé : 18% de "High Priority".** "Cela signifie que près d'un tweet sur cinq nécessite une intervention immédiate (panne totale, client bloqué). Aujourd'hui, ces tweets sont traités au même rythme que les autres."
*   **Le Risque :** "La viralité négative. Un tweet urgent non traité génère 3 fois plus de retweets qu'une plainte standard. C'est une bombe à retardement pour l'image de marque."
*   **L'Opportunité :** "Notez le vert : les nouveaux abonnés. C'est le seul moment où les clients sont heureux. Il faut capitaliser là-dessus."

---

## Slide 7 : Analyse des Thématiques
**Temps estimé : 2 min**

*   **De quoi parle-t-on ?** "Sans surprise, 60% des demandes concernent le **Réseau/Fibre**. C'est le 'pain point' majeur."
*   **Facturation (25%) :** "C'est souvent de l'incompréhension. Ce sont des tickets évitables avec une meilleure communication."
*   **Conclusion de l'analyse :** "Nous avons deux combats différents :
    1.  Rassurer sur la technique (Réseau).
    2.  Expliquer l'administratif (Facture)."

---

## Slide 8 : Recommandations Opérationnelles
**Temps estimé : 1 min**

*   "Avant de passer à la stratégie, voici les changements immédiats pour les équipes :"
*   **Filtrage :** "On arrête le traitement chronologique (FIFO). On passe au traitement par Priorité. Les agents ne voient que le 'High Priority' en premier."
*   **Routage :** "Plus de transfert manuel. Si l'IA détecte 'Facture', ça part direct à la compta."
*   **Alerte :** "On ne subit plus les pannes. Si le volume d'urgence dépasse 30% en une heure, le management reçoit une alerte SMS. On sait qu'il y a une panne avant même que la supervision réseau ne le confirme."

---

## Slide 9 : Recommandations Stratégiques (ROI)
**Temps estimé : 4 min (Slide Clé)**

*   **Introduction :** "Sur la base de ces constats, je vous propose une feuille de route stratégique en 4 axes, classés par impact et retour sur investissement."

*   **1. Chatbot Twitter SAV (Le Levier de Productivité) :**
    *   *Le Constat (Data) :* "Nous avons vu que **60%** des tweets concernent des pannes réseau ou des questions techniques simples. Ce sont des tâches répétitives à faible valeur ajoutée pour un humain."
    *   *L'Action :* "Nous allons déployer un Chatbot de niveau 1 pour filtrer et répondre automatiquement à ces questions simples."
    *   *Le Gain (ROI) :* "Cela libérera **30% de la charge** de travail des agents, rentabilisant le développement en **6 mois**."

*   **2. Priorisation IA (Le "Quick Win") :**
    *   *Le Constat (Data) :* "Il y a **18%** de tweets urgents qui sont actuellement noyés dans la masse et traités trop tard."
    *   *L'Action :* "Nous activons dès demain l'algorithme de tri par priorité que nous avons développé. C'est une mise en production logicielle, sans coût d'infrastructure supplémentaire."
    *   *Le Gain (ROI) :* "L'impact est **immédiat**. Nous réduisons de **70%** le risque de rater une urgence critique."

*   **3. FAQ Dynamique (L'Approche Préventive) :**
    *   *Le Constat (Data) :* "Les tickets 'Facturation' et 'Tech' reviennent toujours sur les mêmes mots-clés."
    *   *L'Action :* "Au lieu d'attendre la plainte, nous allons refondre nos pages d'aide (FAQ) en utilisant ces mots-clés pour que les clients trouvent la réponse sur Google avant de tweeter."
    *   *Le Gain (ROI) :* "Nous visons une réduction de **20%** du volume de tickets entrants d'ici **3 mois**."

*   **4. Alerte Crise (La "Ceinture de Sécurité") :**
    *   *Le Constat (Data) :* "Un incident non traité a une viralité négative **3 fois supérieure** à la normale."
    *   *L'Action :* "Nous mettons en place un seuil d'alerte automatique : si le volume de plaintes dépasse 30% d'augmentation en 1h, une alerte est envoyée aux directeurs."
    *   *Le Gain (ROI) :* "C'est un investissement **vital** pour la protection de la marque. Éviter un seul 'Bad Buzz' national justifie l'ensemble du projet."

---

## Slide 10 : Conclusion
**Temps estimé : 1 min**

*   **Synthèse :** "Dallosh Analysis n'est pas juste un outil de monitoring. C'est un outil de **transformation**."
*   **Efficacité :** On traite mieux, plus vite.
*   **Visibilité :** On ne pilote plus à l'aveugle.
*   **Souveraineté :** On garde la maîtrise de nos données et de nos coûts.
*   "Je suis prêt à répondre à vos questions sur la mise en œuvre."

---
