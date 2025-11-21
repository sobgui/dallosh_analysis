# **Structure de la Présentation (Format PowerPoint)**

## **Slide 1 : Titre et Introduction**

Titre Principal : Présentation des Résultats & Recommandations Stratégiques

Sous-titre : Analyse des Tweets SAV Free Mobile via la solution Dallosh

**Informations :**

* **Présenté par :** \[Ton Nom\]  
* **Date :** 20 Novembre 2025  
* **Contexte :** Bloc CC2.2 \- Restitution des travaux techniques (CC2.1) et perspectives stratégiques (CC2.3)

## **Slide 2 : Contexte et Architecture Technique**

**Le Défi Initial :**

* **Volume :** \~5000 tweets bruts hétérogènes (bruit, spam, urgences).  
* **Objectif :** Transformer la donnée brute en outil décisionnel temps réel.

**La Réponse Technique ("Dallosh Analysis") :**

* **Architecture :** Microservices Python/Node.js orchestrés par **RabbitMQ** (Événementiel).  
* **Traitement :** Pipeline ETL robuste (Nettoyage Regex $\\to$ Déduplication $\\to$ Enrichissement IA).  
* **Supervision :** Suivi temps réel des tâches et gestion des erreurs.

*(Suggestion d'image : Vue technique des logs système)*

## **Slide 3 : Santé du SAV \- Vue d'Ensemble (KPI)**

**Diagnostic Global (CC2.1) :**

1. **Net Sentiment Score (NSS) :**  
   * Négatif structurel, mais permet de détecter les *dérives*.  
2. **Volume de Crise :**  
   * Identification des tweets à **Priorité Haute** (Score 2\) nécessitant une intervention \< 1h.  
3. **Engagement :**  
   * Corrélation forte entre tonalité négative et viralité (Retweets).

*(Suggestion d'image : Tableau de Bord Global)*

## **Slide 4 : Analyse des Thématiques (Topics)**

**La "Carte de Chaleur" des incidents :**

* **Réseau / Fibre (Critique) :**  
  * 60% du volume négatif.  
  * Mots-clés : "Urgent", "Injoignable", "Coupure".  
* **Administratif / Facture :**  
  * Sentiment mitigé (Neutre/Négatif).  
  * Problèmes de compréhension ou de délais.  
* **Nouveaux Abonnés :**  
  * Seul vecteur de sentiment positif (Livraison, Activation).

*(Suggestion d'image : Graphique des Topics)*

## **Slide 5 : Détection Temporelle des Incidents**

**Anticipation des crises via la Timeline :**

* **Corrélation Volume/Sentiment :**  
  * Une hausse brutale du volume associée à un sentiment négatif signale une panne nationale.  
* **Signaux Faibles :**  
  * Une lente montée des plaintes "Latence" sur 3 jours permet de prévenir l'ingénierie avant la saturation du SAV.

*(Suggestion d'image : Timeline)*

## **Slide 6 : Recommandations Opérationnelles (CC2.3)**

**Nouveaux Usages Métier :**

1. **Filtrage par Priorité (Score IA) :**  
   * *Action :* Les agents traitent uniquement les tweets marqués **"High Priority"**.  
   * *Gain :* Productivité accrue, fin du traitement du "bruit".  
2. **Routage Intelligent :**  
   * *Action :* Aiguillage automatique via la colonne main\_topic (Réseau $\\to$ Tech, Facture $\\to$ Commerce).  
3. **Gestion de Crise Proactive :**  
   * *Action :* Alerte automatique si \>30% de priorité haute en 1h.

## **Slide 7 : Stratégie FinOps et Infrastructure**

**Modèle Économique et Technique (CC2.3) :**

1. **Infrastructure Hybride :**  
   * *Actuel :* Serveurs On-premise (Coût zéro, Souveraineté).  
   * *Cible :* Cloud (AWS/Azure) pour le Load Balancing lors des pics de charge.  
2. **Stratégie IA Multi-Modèles (Coût/Performance) :**  
   * **Niveau 1 :** Gemini Flash (Gratuit/Rapide) pour le tri de masse.  
   * **Niveau 2 :** Mistral (Souverain) pour l'analyse fine.  
   * **Niveau 3 :** Fallback sur **LLM Local (GPU)** en cas de coupure internet.  
3. **Optimisation "Smart Batching" :**  
   * Passage d'une logique de "lignes" à une logique de "tokens" pour maximiser l'utilisation des quotas API.

*(Suggestion d'image : Interface Admin / Config)*

## **Slide 8 : Conclusion et Souveraineté**

Synthèse :

L'outil Dallosh transforme le bruit en stratégie claire tout en garantissant la maîtrise des données.

**Sécurité et RGPD :**

* **Accords "Zero Data Retention"** avec les fournisseurs IA.  
* **Anonymisation** (PII Scrubbing) si recours à des API publiques.  
* **Gestion des Rôles (RBAC)** pour sécuriser l'accès aux données sensibles.

*(Suggestion d'image : Gestion Utilisateurs)*

## **Slide 9 : Fin de la présentation**

**Merci de votre attention.**

* **Questions / Réponses**  
* Lien vers l'application : https://dallosh-analysis.agglomy.com/  
* 

