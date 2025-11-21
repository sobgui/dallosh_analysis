---
theme: seriph
background: /images/bg_ai_brain.jpg
title: Dallosh Analysis - Bloc CC2
info: |
  ## Dallosh Analysis
  Présentation du Bloc CC2 pour le projet d'analyse des tweets Free Mobile.
class: text-center
drawings:
  persist: false
transition: slide-left
mdc: true
---

<div class="absolute top-8 left-8 flex items-center gap-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
  <img src="/images/hetic-log.png" class="h-10 w-auto" alt="HETIC Logo" />
  <div class="text-left text-white">
    <div class="text-sm font-bold">MD5 Data IA</div>
    <div class="text-xs opacity-90">2024-2025</div>
  </div>
</div>

<div class="h-full flex flex-col items-center justify-center">
  <h1 class="text-7xl font-bold mb-6 text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
    Dallosh Analysis
  </h1>
  
  <p class="text-3xl mb-3 text-white font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Analyse des Tweets SAV Free Mobile</p>
  <p class="text-xl text-gray-100 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">Architecture & Stratégie IA</p>
  
  <div class="mt-16 text-sm bg-black/50 backdrop-blur-sm px-4 py-2 rounded text-white">Bloc CC2 - Examen Final</div>
  
  <div class="mt-12 grid grid-cols-3 gap-x-8 gap-y-4 text-sm bg-black/50 backdrop-blur-sm px-8 py-4 rounded-lg">
    <div class="flex items-center gap-2 text-white"><carbon-user-avatar-filled class="text-blue-300"/> SOBGUI Ivan Joel</div>
    <div class="flex items-center gap-2 text-white"><carbon-user-avatar-filled class="text-blue-300"/> BOTI Armel Cyrille</div>
    <div class="flex items-center gap-2 text-white"><carbon-user-avatar-filled class="text-blue-300"/> ELOUMOU Pascal Aurèle</div>
    <div class="flex items-center gap-2 text-white"><carbon-user-avatar-filled class="text-blue-300"/> OUMAR Ben Lol</div>
    <div class="flex items-center gap-2 text-white"><carbon-user-avatar-filled class="text-blue-300"/> SGHIOURI Mohammed</div>
    <div class="flex items-center gap-2 text-white"><carbon-user-avatar-filled class="text-blue-300"/> DIVENGI BUNKEMBO Nagui</div>
  </div>
</div>

<div class="abs-br m-6 flex gap-2">
  <a href="https://github.com/sobgui/dallosh_analysis" target="_blank" alt="GitHub"
    class="text-xl slidev-icon-btn opacity-50 !border-none !hover:text-white">
    <carbon-logo-github />
  </a>
</div>

---
layout: center
class: text-center
---

# Plan de la Présentation

<div class="space-y-3 mt-12 text-left max-w-4xl mx-auto">

<!-- Ligne 1: [1,2] -->
<div class="grid grid-cols-2 gap-4">
  <div class="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
    <div class="text-2xl">📊</div>
    <div>
      <div class="font-bold">1. Contexte & Données</div>
      <div class="text-sm opacity-75">Volume traité & méthodologie</div>
    </div>
  </div>
  
  <div class="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
    <div class="text-2xl">🏗️</div>
    <div>
      <div class="font-bold">2. Architecture Technique</div>
      <div class="text-sm opacity-75">Solution Dallosh Analysis</div>
    </div>
  </div>
</div>

<!-- Ligne 2: [3,4] -->
<div class="grid grid-cols-2 gap-4">
  <div class="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
    <div class="text-2xl">📈</div>
    <div>
      <div class="font-bold">3. Principaux Constats</div>
      <div class="text-sm opacity-75">KPIs & analyse thématique</div>
    </div>
  </div>
  
  <div class="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
    <div class="text-2xl">🎯</div>
    <div>
      <div class="font-bold">4. Recommandations</div>
      <div class="text-sm opacity-75">Actions concrètes</div>
    </div>
  </div>
</div>

<!-- Ligne 3: [5] -->
<div class="grid grid-cols-2 gap-4">
  <div class="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
    <div class="text-2xl">📊</div>
    <div>
      <div class="font-bold">5. Analyse Thématique</div>
      <div class="text-sm opacity-75">Distribution des problèmes</div>
    </div>
  </div>
</div>

</div>

---
layout: default
---

# Contexte & Défi

<div class="grid grid-cols-2 gap-12 mt-12">

<div v-click>
  <h3 class="text-2xl mb-4 flex items-center gap-3 text-blue-600">
    <carbon-data-blob /> La Donnée Brute
  </h3>
  <ul class="space-y-4">
    <li class="flex items-center gap-2"><carbon-logo-twitter class="text-blue-400"/> Export de <strong>~5000 tweets</strong> @FreeMobile</li>
    <li class="flex items-center gap-2"><carbon-warning-alt class="text-yellow-500"/> Données brutes, hétérogènes, bruitées</li>
    <li class="flex items-center gap-2"><carbon-chat class="text-gray-500"/> Plaintes, questions, spam, humour</li>
  </ul>
</div>

<div v-click>
  <h3 class="text-2xl mb-4 flex items-center gap-3 text-green-600">
    <carbon-chart-line-data /> Le Défi
  </h3>
  <div class="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border-l-4 border-green-500">
    Transformer ce "bruit" en <strong>outil décisionnel</strong> :
    <div class="mt-4 space-y-2">
      <div class="flex items-center gap-2"><carbon-filter /> 1. Filtrer le non-pertinent</div>
      <div class="flex items-center gap-2"><carbon-flow /> 2. Structurer (Topics, Sentiments)</div>
      <div class="flex items-center gap-2"><carbon-warning-filled /> 3. Prioriser les actions</div>
    </div>
  </div>
</div>

</div>

---
layout: center
class: text-center
---

# Synthèse des Données Analysées

<div class="grid grid-cols-3 gap-8 mt-12 text-left max-w-5xl mx-auto">

<div v-click class="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700">
  <div class="text-4xl font-bold text-blue-600 mb-2">4,847</div>
  <div class="text-sm font-semibold mb-1">Tweets analysés</div>
  <div class="text-xs opacity-75">Après nettoyage et dédoublonnage (96.9% de rétention)</div>
</div>

<div v-click class="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-700">
  <div class="text-4xl font-bold text-purple-600 mb-2">3 axes</div>
  <div class="text-sm font-semibold mb-1">Enrichissement IA</div>
  <div class="text-xs opacity-75">Sentiment / Topic / Priorité via LLM (Gemini Flash + Mistral)</div>
</div>

<div v-click class="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700">
  <div class="text-4xl font-bold text-green-600 mb-2">100%</div>
  <div class="text-sm font-semibold mb-1">Automatisé</div>
  <div class="text-xs opacity-75">Pipeline ETL avec RabbitMQ + Celery pour traitement asynchrone</div>
</div>

</div>

<div class="mt-12 max-w-4xl mx-auto">
  <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border-l-4 border-orange-500">
    <div class="font-bold mb-2 flex items-center gap-2">
      <carbon-tool-box class="text-orange-500" /> Méthodologie de tri rapide
    </div>
    <div class="grid grid-cols-3 gap-4 text-sm mt-4">
      <div class="flex items-start gap-2">
        <div class="text-lg">1️⃣</div>
        <div><strong>Nettoyage :</strong> Regex emojis, masquage PII, dédoublonnage</div>
      </div>
      <div class="flex items-start gap-2">
        <div class="text-lg">2️⃣</div>
        <div><strong>Analyse :</strong> Appel LLM pour classification multi-label</div>
      </div>
      <div class="flex items-start gap-2">
        <div class="text-lg">3️⃣</div>
        <div><strong>Stockage :</strong> MongoDB avec indexation pour recherche rapide</div>
      </div>
    </div>
  </div>
</div>

---
layout: default
---

# Architecture Système

Une architecture microservices événementielle.

<div class="grid grid-cols-2 gap-8 mt-4 h-[400px]">

<div class="flex flex-col justify-center h-full">
  <img src="/images/system_architecture.png" class="rounded-lg shadow-lg border border-gray-200 max-h-full object-contain" />
</div>

<div class="grid grid-cols-2 gap-4">
  <div v-click class="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 transition-all">
    <div class="p-2 bg-blue-100 rounded-lg text-blue-600"><carbon-application-web class="text-xl"/></div>
    <div>
      <h3 class="font-bold text-sm">Frontend</h3>
      <p class="text-xs opacity-75">Next.js 16, React 19.</p>
    </div>
  </div>

  <div v-click class="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 transition-all">
    <div class="p-2 bg-green-100 rounded-lg text-green-600"><carbon-api class="text-xl"/></div>
    <div>
      <h3 class="font-bold text-sm">Backend</h3>
      <p class="text-xs opacity-75">Node.js, Express.</p>
    </div>
  </div>

  <div v-click class="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 transition-all">
    <div class="p-2 bg-purple-100 rounded-lg text-purple-600"><carbon-machine-learning-model class="text-xl"/></div>
    <div>
      <h3 class="font-bold text-sm">Processing</h3>
      <p class="text-xs opacity-75">Python, Celery, Ollama.</p>
    </div>
  </div>

  <div v-click class="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 transition-all">
    <div class="p-2 bg-orange-100 rounded-lg text-orange-600"><carbon-data-base class="text-xl"/></div>
    <div>
      <h3 class="font-bold text-sm">Data</h3>
      <p class="text-xs opacity-75">MongoDB, RabbitMQ.</p>
    </div>
  </div>
</div>

</div>

---
layout: default
---

# Principaux Constats & KPIs SAV

<div class="grid grid-cols-2 gap-8 mt-8">

<!-- Colonne gauche : KPIs chiffrés -->
<div class="space-y-4">
  <h3 class="font-bold text-xl mb-4">Indicateurs Clés</h3>
  
  <div v-click class="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border-l-4 border-red-500">
    <div class="flex items-center gap-3 mb-2">
      <div class="text-3xl font-bold text-red-500">NSS</div>
      <div class="text-xs opacity-75">Net Sentiment Score</div>
    </div>
    <div class="text-sm">
      <strong>65% négatif</strong> / 25% neutre / 10% positif
    </div>
  </div>
  
  <div v-click class="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border-l-4 border-orange-500">
    <div class="flex items-center gap-3 mb-2">
      <div class="text-3xl font-bold text-orange-500">18%</div>
      <div class="text-xs opacity-75">High Priority</div>
    </div>
    <div class="text-sm">
      Tweets urgents nécessitant intervention < 1h
    </div>
  </div>
  
  <div v-click class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-l-4 border-blue-500">
    <div class="flex items-center gap-3 mb-2">
      <carbon-share class="text-3xl text-blue-500" />
      <div class="text-xs opacity-75">Viralité Négative</div>
    </div>
    <div class="text-sm">
      ×3 retweets sur tweets urgents non traités
    </div>
  </div>
</div>

<!-- Colonne droite : Insights qualitatifs -->
<div class="space-y-4">
  <h3 class="font-bold text-xl mb-4">Enseignements</h3>
  
  <div v-click class="p-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl">
    <h4 class="font-bold mb-1 flex items-center gap-2 text-sm">
      <carbon-warning-filled class="text-red-500" /> Urgences critiques
    </h4>
    <div class="text-xs">Fenêtre de <strong>48h</strong> avant escalade virale</div>
  </div>
  
  <div v-click class="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
    <h4 class="font-bold mb-1 flex items-center gap-2 text-sm">
      <carbon-chart-pie class="text-purple-500" /> Types de demandes
    </h4>
    <div class="text-xs space-y-0.5">
      <div>🔴 <strong>60%</strong> Réseau/Fibre</div>
      <div>🟡 <strong>25%</strong> Facturation</div>
      <div>🟢 <strong>10%</strong> Commercial (positif)</div>
    </div>
  </div>
  
  <div v-click class="p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl">
    <h4 class="font-bold mb-1 flex items-center gap-2 text-sm">
      <carbon-idea class="text-green-500" /> Opportunité
    </h4>
    <div class="text-xs">Nouveaux abonnés = seul segment positif exploitable</div>
  </div>
</div>

</div>

---

# Analyse des Thématiques

De quoi parlent les abonnés Free ?

<div class="grid grid-cols-2 gap-8 mt-6">

<div class="space-y-3">
  <div v-click class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
    <div class="text-red-500 text-xl mt-0.5"><carbon-warning-filled /></div>
    <div>
      <h3 class="font-bold text-base">Réseau / Fibre</h3>
      <p class="opacity-80 text-xs mt-1">60% du volume négatif. Mots-clés : "Urgent", "Injoignable", "Coupure".</p>
    </div>
  </div>
  
  <div v-click class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
    <div class="text-yellow-500 text-xl mt-0.5"><carbon-document /></div>
    <div>
      <h3 class="font-bold text-base">Administratif / Facture</h3>
      <p class="opacity-80 text-xs mt-1">Sentiment mitigé. Problèmes de compréhension ou délais.</p>
    </div>
  </div>
  
  <div v-click class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
    <div class="text-green-500 text-xl mt-0.5"><carbon-user-follow /></div>
    <div>
      <h3 class="font-bold text-base">Nouveaux Abonnés</h3>
      <p class="opacity-80 text-xs mt-1">Seul vecteur positif (Livraison rapide, Activation).</p>
    </div>
  </div>
</div>

<div class="flex flex-col justify-center">
  <h3 class="text-center font-bold mb-4 text-sm opacity-75">Répartition des Topics</h3>
  <div class="space-y-2">
    <div class="flex items-center gap-2">
      <div class="w-24 text-xs font-medium">Réseau/Tech</div>
      <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
        <div class="bg-red-500 h-full flex items-center justify-end pr-2 text-white text-xs font-bold" style="width: 60%">60%</div>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-24 text-xs font-medium">Facturation</div>
      <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
        <div class="bg-yellow-500 h-full flex items-center justify-end pr-2 text-white text-xs font-bold" style="width: 25%">25%</div>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-24 text-xs font-medium">Commercial</div>
      <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
        <div class="bg-green-500 h-full flex items-center justify-end pr-2 text-white text-xs font-bold" style="width: 10%">10%</div>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-24 text-xs font-medium">Autre</div>
      <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
        <div class="bg-gray-500 h-full flex items-center justify-end pr-2 text-white text-xs font-bold" style="width: 5%">5%</div>
      </div>
    </div>
  </div>
</div>

</div>

---

# Recommandations Opérationnelles

Transformer l'analyse en action concrète.

<div class="grid grid-cols-3 gap-6 mt-12">

<div v-click class="relative p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-t-4 border-purple-500">
  <div class="absolute -top-4 left-6 bg-purple-500 text-white p-2 rounded-lg shadow-md"><carbon-filter /></div>
  <h3 class="font-bold text-xl mt-4 mb-2">Filtrage Prioritaire</h3>
  <p class="text-sm opacity-80">Les agents ne traitent que les tweets <strong>"High Priority"</strong>. Fin du traitement chronologique.</p>
</div>

<div v-click class="relative p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-t-4 border-blue-500">
  <div class="absolute -top-4 left-6 bg-blue-500 text-white p-2 rounded-lg shadow-md"><carbon-direction-fork /></div>
  <h3 class="font-bold text-xl mt-4 mb-2">Routage Intelligent</h3>
  <p class="text-sm opacity-80">Aiguillage auto via <code>main_topic</code> :<br>Réseau → Tech<br>Facture → Commerce.</p>
</div>

<div v-click class="relative p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-t-4 border-red-500">
  <div class="absolute -top-4 left-6 bg-red-500 text-white p-2 rounded-lg shadow-md"><carbon-notification /></div>
  <h3 class="font-bold text-xl mt-4 mb-2">Alerte Proactive</h3>
  <p class="text-sm opacity-80">Notification automatique si >30% de priorité haute en 1h (Détection d'incident).</p>
</div>

</div>

---
layout: default
---

# Recommandations & Justifications Stratégiques

<div class="grid grid-cols-2 gap-4 mt-4">

<div v-click class="p-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-purple-500 shadow-sm">
  <div class="flex justify-between items-start mb-2">
    <h3 class="font-bold text-lg flex items-center gap-2 text-purple-700 dark:text-purple-400">
      <carbon-bot /> Chatbot Twitter SAV
    </h3>
    <div class="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 text-xs rounded-full font-bold">ROI: 6 mois</div>
  </div>
  <div class="text-sm mb-3">
    <div class="font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider mb-1">Justification (Data)</div>
    <p><strong>60%</strong> du volume concerne des pannes réseau répétitives. Questions à faible valeur ajoutée.</p>
  </div>
  <div class="bg-gray-50 dark:bg-gray-700/30 p-2 rounded text-xs flex justify-between items-center">
    <span><strong>Action :</strong> Automatisation Niv.1</span>
    <span class="text-green-600 font-bold">-30% charge</span>
  </div>
</div>

<div v-click class="p-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-blue-500 shadow-sm">
  <div class="flex justify-between items-start mb-2">
    <h3 class="font-bold text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
      <carbon-task-star /> Priorisation IA
    </h3>
    <div class="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 text-xs rounded-full font-bold">Immédiat</div>
  </div>
  <div class="text-sm mb-3">
    <div class="font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider mb-1">Justification (Data)</div>
    <p><strong>18%</strong> de tweets urgents sont noyés dans le flux. Risque de churn élevé.</p>
  </div>
  <div class="bg-gray-50 dark:bg-gray-700/30 p-2 rounded text-xs flex justify-between items-center">
    <span><strong>Action :</strong> Filtrage "High Priority"</span>
    <span class="text-green-600 font-bold">-70% ratés</span>
  </div>
</div>

<div v-click class="p-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-green-500 shadow-sm">
  <div class="flex justify-between items-start mb-2">
    <h3 class="font-bold text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
      <carbon-wikis /> FAQ Dynamique
    </h3>
    <div class="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 text-xs rounded-full font-bold">ROI: 3 mois</div>
  </div>
  <div class="text-sm mb-3">
    <div class="font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider mb-1">Justification (Data)</div>
    <p>Thématiques Facturation (25%) et Tech (60%) très concentrées sur quelques motifs.</p>
  </div>
  <div class="bg-gray-50 dark:bg-gray-700/30 p-2 rounded text-xs flex justify-between items-center">
    <span><strong>Action :</strong> Pages d'aide ciblées</span>
    <span class="text-green-600 font-bold">-20% tickets</span>
  </div>
</div>

<div v-click class="p-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-red-500 shadow-sm">
  <div class="flex justify-between items-start mb-2">
    <h3 class="font-bold text-lg flex items-center gap-2 text-red-700 dark:text-red-400">
      <carbon-warning-alt /> Alerte Crise
    </h3>
    <div class="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 text-xs rounded-full font-bold">Vital</div>
  </div>
  <div class="text-sm mb-3">
    <div class="font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider mb-1">Justification (Data)</div>
    <p>Viralité négative <strong>×3</strong> lors d'incidents non traités rapidement.</p>
  </div>
  <div class="bg-gray-50 dark:bg-gray-700/30 p-2 rounded text-xs flex justify-between items-center">
    <span><strong>Action :</strong> Seuil alerte >30%</span>
    <span class="text-green-600 font-bold">Prévention</span>
  </div>
</div>

</div>

---
layout: center
class: text-center
---

# Conclusion

Dallosh Analysis transforme le bruit des réseaux sociaux en **stratégie claire**.

<div class="mt-12 grid grid-cols-3 gap-12 text-left">
  <div v-click class="transform hover:scale-105 transition-transform duration-300">
    <div class="text-4xl mb-4 text-green-500"><carbon-meter /></div>
    <strong class="text-xl">Efficacité</strong>
    <p class="text-sm mt-2 opacity-75">Réduction du temps de traitement grâce au filtrage IA.</p>
  </div>
  <div v-click class="transform hover:scale-105 transition-transform duration-300">
    <div class="text-4xl mb-4 text-blue-500"><carbon-chart-radar /></div>
    <strong class="text-xl">Visibilité</strong>
    <p class="text-sm mt-2 opacity-75">Détection temps réel des crises et incidents.</p>
  </div>
  <div v-click class="transform hover:scale-105 transition-transform duration-300">
    <div class="text-4xl mb-4 text-red-500"><carbon-locked /></div>
    <strong class="text-xl">Souveraineté</strong>
    <p class="text-sm mt-2 opacity-75">Maîtrise des coûts et des données.</p>
  </div>
</div>

<div class="mt-20 opacity-50">
  Merci de votre attention.<br>
  <span class="text-sm">Lien vers l'application : https://dallosh-analysis.agglomy.com/</span>
</div>
