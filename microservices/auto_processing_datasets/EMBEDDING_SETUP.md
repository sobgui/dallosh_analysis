# Configuration du Modèle d'Embedding Nomic-Embed-Text

Ce guide explique comment configurer et utiliser le modèle `nomic-embed-text:v1.5` d'Ollama pour enrichir l'analyse des textes avant le traitement par le LLM principal.

## 📋 Prérequis

1. **Ollama installé et démarré** sur votre machine
2. **Modèle nomic-embed-text téléchargé** :
   ```bash
   ollama pull nomic-embed-text:v1.5
   ```

## 🔧 Configuration

### 1. Ajouter le modèle d'embedding dans les paramètres

1. Accédez à la section **Settings > AI Settings** dans l'interface
2. Cliquez sur **"Add Local Model"** ou **"Add External Model"**
3. Configurez le modèle comme suit :

   - **Model Name**: `nomic-embed-text:v1.5`
   - **Base URL**: `http://localhost:11434` (ou l'URL de votre instance Ollama)
   - **API Key**: (laissez vide pour Ollama local)
   - **Retry Requests**: `3`
   - **Paginate Rows Limit**: `500` (ou selon vos besoins)

### 2. Vérifier que le modèle est détecté

Le système détecte automatiquement les modèles d'embedding en cherchant :
- Le mot "embed" dans le nom du modèle
- Le mot "nomic-embed" dans le nom du modèle

## 🔄 Fonctionnement

### Flux de traitement

1. **Génération d'embeddings** : Pour chaque batch de textes, le système :
   - Appelle l'API Ollama `/api/embeddings` avec le modèle `nomic-embed-text:v1.5`
   - Génère un vecteur d'embedding pour chaque texte
   - Stocke les embeddings en mémoire

2. **Enrichissement du contexte** : Les embeddings sont utilisés pour :
   - Informer le LLM principal que les textes ont été pré-traités sémantiquement
   - Améliorer la compréhension contextuelle du LLM

3. **Analyse LLM** : Le LLM principal analyse les textes avec le contexte enrichi

### Format de l'API Ollama

L'endpoint utilisé est : `http://localhost:11434/api/embeddings`

**Requête** :
```json
{
  "model": "nomic-embed-text:v1.5",
  "prompt": "Texte à analyser"
}
```

**Réponse** :
```json
{
  "embedding": [0.123, -0.456, 0.789, ...]
}
```

## 🚀 Utilisation

Une fois configuré, le système utilisera automatiquement le modèle d'embedding s'il est détecté dans la configuration. Aucune action supplémentaire n'est nécessaire.

### Logs de débogage

Vous verrez dans les logs :
```
Using embedding model: nomic-embed-text:v1.5
Generating embeddings for 50 texts...
Generated 50 embeddings
First embedding dimension: 768
Embeddings generated successfully, proceeding with LLM analysis...
```

## ⚠️ Notes importantes

1. **Performance** : La génération d'embeddings ajoute un temps de traitement supplémentaire. Pour de gros volumes, considérez d'augmenter le timeout.

2. **Fallback** : Si la génération d'embeddings échoue, le système continue sans embeddings et traite les textes normalement.

3. **Modèles multiples** : Si plusieurs modèles d'embedding sont configurés, le premier trouvé sera utilisé.

4. **Optimisation** : Pour améliorer les performances, vous pouvez :
   - Traiter les embeddings en parallèle (à implémenter)
   - Mettre en cache les embeddings pour les textes identiques
   - Utiliser des batches plus petits pour les embeddings

## 🔍 Dépannage

### Le modèle d'embedding n'est pas détecté

- Vérifiez que le nom du modèle contient "embed" ou "nomic-embed"
- Vérifiez que le modèle est bien configuré dans les settings

### Erreur de connexion à Ollama

- Vérifiez que Ollama est démarré : `ollama serve`
- Vérifiez l'URL dans la configuration (par défaut : `http://localhost:11434`)
- Vérifiez que le modèle est téléchargé : `ollama list`

### Timeout lors de la génération d'embeddings

- Augmentez le timeout dans le code (actuellement 60 secondes)
- Réduisez la taille des batches
- Vérifiez les performances de votre machine

## 📝 Exemple de configuration complète

```json
{
  "uid": "embedding-model-001",
  "data": {
    "model": "nomic-embed-text:v1.5",
    "baseUrl": "http://localhost:11434",
    "apiKey": "",
    "retryRequests": 3,
    "paginateRowsLimit": 500
  }
}
```

