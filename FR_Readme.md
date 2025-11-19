# Dallosh Analysis – Version Française

> Une plateforme innovante d’analyse de données pour automatiser le traitement des réclamations/plaintes clients des opérateurs télécoms, grâce à l’analyse de sentiment et à la visualisation de données alimentées par l’IA.

[Version en anglais](./Readme.md)

## Table des matières

- [Description](#description)
- [Aperçu](#aperçu)
- [Architecture du système](#architecture-du-système)
- [Fonctionnalités](#fonctionnalités)
- [Démarrage rapide](#démarrage-rapide)
- [Documentation](#documentation)
- [Équipe](#équipe)
- [Licence](#licence)

## Description

Dallosh Analysis est une application complète d’analyse de données conçue pour automatiser le traitement des jeux de données de plaintes clients pour les opérateurs télécoms. La plateforme permet aux analystes de téléverser des fichiers CSV contenant des posts Twitter, de les traiter automatiquement via une analyse de sentiment alimentée par l’IA, puis d’afficher des visualisations intuitives incluant graphiques, diagrammes et indicateurs clés (KPIs).

Les jeux de données Twitter incluent des colonnes telles que `id`, `created_at`, `full_text`, `media`, `screen_name` et divers indicateurs d’engagement. Après traitement par le backend et les microservices, des colonnes supplémentaires sont ajoutées : `sentiment`, `priority` et `topic`.

## Aperçu

![Tableau de bord des tâches Admin](./frontend/docs/figma/admin_tasks_page.png)

*Tableau de bord de gestion des tâches Admin – suivi en temps réel et journal d’activité*

### Flux clé

1. **Upload** : l’analyste téléverse un CSV via l’interface web
2. **Queue** : le fichier est ajouté à une file de traitement
3. **Process** : traitement automatisé en arrière-plan incluant :
   - Nettoyage des données (suppression des emojis, caractères spéciaux)
   - Analyse de sentiment (négatif, neutre, positif)
   - Classification de priorité (0, 1, 2)
   - Extraction de sujets
   - Ajout de colonnes et sauvegarde du fichier
4. **Visualize** : les résultats sont affichés avec des graphiques interactifs et des KPIs

## Architecture du système

![Architecture du système](./docs/images/system_architecture.png)

Plus de détails sur le schéma ici : [Architecture](./docs/architecture.md "Détails de l’architecture").

### Aperçu de l’architecture

Le système est organisé en trois couches principales :

**Couche Frontend :**

- **Frontend** (Next.js) – Interface utilisateur
- **RabbitMQ Server** – Courtier de messages pour la communication temps réel

**Couche Backend :**

- **Backend** (Express.js) – Serveur API REST
- **MongoDB** (PARTAGÉ) – Base de données pour le stockage
- **Stockage partagé** (PARTAGÉ) – Stockage de fichiers (Local/AWS/Azure/etc.)

**Couche Microservices :**

- **Microservices** (Celery) – Traitement des tâches en arrière-plan
- **LLM** (Ollama ou externe) – Service d’IA/ML

### Connexions entre composants

**Frontend :**

- Se connecte au Backend (API REST)
- Se connecte au serveur RabbitMQ (abonnement)

**Backend :**

- Se connecte à MongoDB
- Se connecte au stockage partagé
- Se connecte à RabbitMQ (publication/abonnement)
- Se connecte aux microservices

**Microservices :**

- Se connectent à MongoDB (PARTAGÉ)
- Se connectent au stockage partagé (PARTAGÉ)
- Publient vers RabbitMQ
- Se connectent au LLM (Ollama ou externe)

**Ressources partagées :**

- **MongoDB** – Utilisé par Backend ET Microservices
- **Stockage partagé** – Utilisé par Backend ET Microservices

> 📚 Pour la documentation détaillée de l’architecture, voir [Architecture](./docs/architecture.md)

## Fonctionnalités

### Frontend

- **UI moderne** : construit avec Next.js 16, React 19, Tailwind CSS
- **Thème** : thème rouge, modes clair/sombre
- **RBAC** : tableaux de bord distincts pour admins et analystes
- **Temps réel** : suivi de progression via événements RabbitMQ
- **Visualisation** : graphiques interactifs avec Recharts
- **Responsive** : approche mobile-first et UX moderne

### Backend

- **API RESTful** : serveur Express.js modulaire
- **Authentification JWT** : sécurité basée sur tokens
- **Gestion de fichiers** : upload, aperçu et téléchargement CSV
- **Gestion des tâches** : file d’attente de traitement des datasets
- **Journalisation d’activité** : système de logs complet
- **Paramétrage** : modèles IA et options de stockage configurables

### Microservices

- **Traitement automatisé** : tâches basées sur Celery
- **Intégration IA** : Ollama pour analyse de sentiment et extraction de sujets
- **Nettoyage des données** : nettoyage intelligent tout en préservant l’important
- **Événementiel** : communication via RabbitMQ
- **Tâches reprenables** : pause, reprise, réessai
- **Gestion d’erreurs** : mécanismes robustes avec réessais

## 🚀 Démarrage rapide

### Prérequis

- **Node.js** 18+ (backend et frontend)
- **Python** 3.10+ (microservices)
- **MongoDB** 7.0+ (localhost:27017)
- **RabbitMQ** 3.x (localhost:5672)
- **Ollama** (pour le LLM)
- **Docker** & **Docker Compose** (optionnels, pour déploiement conteneurisé)

### Démarrage rapide avec Docker Compose (recommandé)

1. **Cloner le dépôt :**

   ```bash
   git clone <repository-url>
   cd dalloh_analysis
   ```
2. **Configurer les variables d’environnement :**

   - Copier `.env.example` vers `.env` dans chaque service :
     - `backend/.env.example` → `backend/.env`
     - `frontend/.env.local.example` → `frontend/.env.local`
     - `microservices/auto_processing_datasets/.env.example` → `microservices/auto_processing_datasets/.env`
3. **Démarrer tous les services :**

   ```bash
   docker-compose up -d
   ```
4. **Accéder à l’application :**

   - Frontend : http://localhost:3006
   - Backend API : http://localhost:5006
   - RabbitMQ Management : http://localhost:15672 (admin/admin123)
   - MongoDB : localhost:27019

### Identifiants par défaut

- **Utilisateur Admin :**
  - Email : `admin@free.com`
  - Mot de passe : `admin123`
- **Utilisateur Analyste :**
  - Email : `user@free.com`
  - Mot de passe : `user123`

**⚠️ Important :** changez les mots de passe par défaut en production !

> Pour des instructions détaillées, voir le [Guide de démarrage](./docs/README.md#quick-links)

## Documentation

La documentation technique complète est disponible dans le dossier [`docs`](./docs/).

### Documentation technique

- **[Architecture](./docs/architecture.md)** – Architecture détaillée et déploiement
- **[Diagrammes de séquence](./docs/sequence-diagrams.md)** – Flux de données et séquences
- **[Schéma de base de données](./docs/database-schema.md)** – Structure et relations
- **[Documentation API](./docs/api-documentation.md)** – Référence complète de l’API REST
- **[Interactions des composants](./docs/component-interactions.md)** – Communication entre composants
- **[Processus](./docs/processes.md)** – Documentation des processus
- **[Cas d’utilisation](./docs/use-cases.md)** – Cas d’usage
- **[Diagramme de classes](./docs/class-diagram.md)** – Structure de classes et relations

### Documentation spécifique par service

- **[Backend README](./backend/README.md)** – Documentation spécifique au Backend
- **[Frontend README](./frontend/README.md)** – Documentation spécifique au Frontend
- **[Microservice README](./microservices/auto_processing_datasets/README.md)** – Documentation du microservice

> 📖 Pour un index complet, voir [Index de documentation](./docs/README.md)

## Technologies

### Frontend

- **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS**, **Shadcn UI**
- **Zustand**, **Axios**, **Recharts**, **AMQP Lib**, **PapaParse**

### Backend

- **Express.js 5**, **TypeScript**, **MongoDB**, **JWT**, **Multer**
- **AMQP Lib**, **bcryptjs**, **PapaParse**

### Microservices

- **Python 3.10+**, **Celery**, **RabbitMQ**, **Pandas**, **Ollama**
- **Pika**, **PyMongo**, **Pytest**

### Infrastructure

- **Docker**, **Docker Compose**, **Traefik**, **MongoDB**, **RabbitMQ**, **Ollama**

## Équipe

- **Ivan Joel SOBGUI**
- **Cyrile**
- **Pascal**
- **Ben Lol**
- **Mohammed**

## Licence

Ce projet est sous licence MIT.

---

## Contribution

Les contributions sont les bienvenues ! N’hésitez pas à soumettre une Pull Request.

## Support

Pour les problèmes et questions, merci d’ouvrir un ticket sur le dépôt GitHub.