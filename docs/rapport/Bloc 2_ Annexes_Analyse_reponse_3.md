# **Rapport Stratégique : Usages, Infrastructures et FinOps**

Auteur : Étudiant (Exam CC2.3)

Date : 20 Novembre 2025

Sujet : Déploiement industriel, Stratégie Cloud et Modèle Économique de la solution Dallosh

## **Sommaire**

1. [Cartographie des Usages Métier](#1.-cartographie-des-usages-métier)  
2. [Impacts Organisationnels](#2.-impacts-organisationnels)  
3. [Stratégie RGPD et Souveraineté des Données](#3.-stratégie-rgpd-et-souveraineté-des-données)  
4. [Scénarios d'Infrastructure et FinOps](#4.-scénarios-d'infrastructure-et-finops)

## **1\. Cartographie des Usages Métier** {#1.-cartographie-des-usages-métier}

### **1.1. Pour les Agents SAV (Opérationnel)**

* **Filtrage Intelligent :** L'outil permet aux agents de ne plus traiter les tweets par ordre chronologique, mais par ordre de **Priorité (Score 0 à 2\)**.  
* **Routage Thématique :** La colonne main\_topic sert d'aiguillage automatique. Les tweets "Facturation" vont directement au service comptable, désengorgeant le support technique.

### **1.2. Pour le Management (Tactique)**

* **Monitoring de Crise :** Les dashboards permettent de voir en temps réel si un pic de plaintes est localisé ou national, permettant d'activer les procédures d'urgence adéquates.  
* **Audit de Performance :** Analyse de l'activité des comptes officiels (réactivité, tonalité des réponses).

## **2\. Impacts Organisationnels** {#2.-impacts-organisationnels}

* **Gain de Productivité :** Automatisation des tâches à faible valeur ajoutée (lecture, tri, catégorisation).  
* **Transformation des Compétences :** Les agents évoluent vers un rôle de résolution complexe plutôt que de simple réponse, nécessitant une formation accrue sur les outils techniques.

## **3\. Stratégie RGPD et Souveraineté des Données** {#3.-stratégie-rgpd-et-souveraineté-des-données}

La protection des données est critique, mais ne doit pas obérer la capacité d'analyse (notamment la localisation des pannes). Nous avons défini trois niveaux de conformité.

### **3.1. Le Dilemme de l'Anonymisation**

L'anonymisation totale (suppression des identifiants et contenus géographiques) pose un problème métier majeur : **la perte du contexte géographique**. Pour Free, savoir qu'un utilisateur se plaint de "coupure réseau" est inutile si l'on ne sait pas qu'il se situe à "Bordeaux".

### **3.2. Solutions Retenues (Accords & Local Hosting)**

Plutôt que de détruire la donnée, nous privilégions des architectures sécurisées :

1. Option A : Accords "Entreprise" (Zero Data Retention)  
   Nous négocions avec les fournisseurs d'API (ex: OpenAI Enterprise via Microsoft Azure ou partenaires comme Docapost).  
   * *Garantie :* Le fournisseur s'engage contractuellement à ne pas utiliser nos données pour entraîner ses modèles et à ne rien stocker (Stateless).  
   * *Avantage :* Pas besoin d'anonymiser, nous conservons la précision géographique et l'historique client.  
2. Option B : Modèles Locaux (On-Premise)  
   En cas d'utilisation de nos propres serveurs GPU avec des modèles Open Source (Mistral, Llama), la donnée ne quitte jamais l'infrastructure de Free.  
   * *Avantage :* Souveraineté totale, conformité RGPD par défaut.  
3. Option C : API Publique (Cas dégradé)  
   Si et seulement si nous devons utiliser une API publique standard sans accord de confidentialité, nous appliquerons un script de "PII Scrubbing" (suppression noms/téléphones) avant envoi.

## **4\. Scénarios d'Infrastructure et FinOps** {#4.-scénarios-d'infrastructure-et-finops}

L'analyse des coûts (FinOps) et la résilience de l'infrastructure sont les piliers du passage en production.

### **4.1. Évolution de l'Infrastructure**

| Phase | Infrastructure | Coût Estimé | Avantages / Limites |
| :---- | :---- | :---- | :---- |
| **Actuelle** | **Serveurs On-Premise (Bare Metal)** Hébergés en interne chez Free. | **\~0 € / mois** *(Hors électricité et amortissement matériel déjà acquis)* | **\+** Coût marginal nul. **\-** Bande passante limitée (goulot d'étranglement). **\-** Pas de redondance (SPOF). |
| **Cible (Scale)** | **Cloud Public (AWS / Azure)** Instances EC2/VM avec Load Balancing. | **\~500 € / mois** *(Variable selon charge CPU/RAM)* | **\+** Scalabilité automatique (Auto-scaling). **\+** Load Balancing pour gérer les pics de trafic. **\-** Coût récurrent (OpEx). |

### 

### **4.2. Stratégie IA & Comparatif FinOps (Coût par Token)**

Nous adoptons une stratégie de **"Modèle le moins cher suffisant"**. Il est inutile d'utiliser un modèle coûteux pour une tâche simple.

**Tableau Comparatif des Coûts (Ordre de priorité) :**

| Priorité | Fournisseur | Modèle | Coût (Input/Output) | Cas d'usage |
| :---- | :---- | :---- | :---- | :---- |
| **1 (Défaut)** | **Google** | **Gemini 1.5 Flash** | Très faible / Gratuit (limité) | Classification rapide, Sentiment, Tri de masse. |
| **2** | **Mistral AI** | **Mistral Small** | Faible | Traitement souverain (Europe), tâches intermédiaires. |
| **3** | **OpenAI** | **GPT-4o-mini** | Moyen | Analyse complexe nécessitant du raisonnement. |
| **4** | **OpenAI** | **GPT-4o** | Élevé | Uniquement pour les cas très ambigus ou VIP. |

*Note : Les prix sont dynamiques et surveillés en temps réel par notre module d'administration.*

### **4.3. Plan de Continuité d'Activité (PCA) et Fallback**

Pour garantir une disponibilité de 99.9%, nous avons prévu une "cascade de repli" en cas de panne des API externes :

1. **Niveau 1 (Nominal) :** Appel aux API Externes (Gemini/Mistral/OpenAI) avec Load Balancing.  
2. **Niveau 2 (Panne API) :** Bascule automatique sur **Serveurs GPU Internes**.  
   * *Action :* Démarrage de conteneurs Docker avec **Mistral Open Source** (via Ollama/vLLM).  
   * *Impact :* Surcharge possible des serveurs internes, mais service maintenu.  
3. **Niveau 3 (Panne Puissance GPU) :** Mode dégradé "Low Compute".  
   * *Action :* Abandon des LLM génératifs. Utilisation de modèles NLP classiques légers (**BERT** ou **RoBERTa**).  
   * *Impact :* Perte de finesse dans l'analyse (moins de nuances), mais la classification "Positif/Négatif" reste fonctionnelle.

### **4.4. Optimisation par Tokens (Smart Batching)**

Pour optimiser la facturation API (souvent au million de tokens), nous abandonnons le traitement par "nombre de lignes fixes" (ex: 500 tweets).

* **Nouvelle logique :** Calcul préalable du nombre de tokens via un *tokenizer* léger.  
* **Constitution des lots :** Remplissage optimal de la fenêtre de contexte (ex: remplir jusqu'à 90% de la limite de contexte du modèle).  
* **Gain :** Réduction du nombre de requêtes HTTP et utilisation maximale de chaque centime dépensé.

Conclusion :

Notre approche hybride (Cloud pour la charge / On-premise pour le secours) couplée à une stratégie FinOps rigoureuse (choix dynamique du modèle) permet à Free de bénéficier d'une IA de pointe tout en maîtrisant souveraineté et coûts.

