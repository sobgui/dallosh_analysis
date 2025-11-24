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
    <div class="flex items-center gap-2 text-white"><carbon-user-avatar-filled class="text-red-500"/> SOBGUI Ivan Joel</div>
    <div class="flex items-center gap-2 text-white"><carbon-user-avatar-filled class="text-red-500"/> BOTI Armel Cyrille</div>
    <div class="flex items-center gap-2 text-white"><carbon-user-avatar-filled class="text-red-500"/> ELOUMOU Pascal Aurèle</div>
    <div class="flex items-center gap-2 text-white"><carbon-user-avatar-filled class="text-red-500"/> OUMAR Ben Lol</div>
    <div class="flex items-center gap-2 text-white"><carbon-user-avatar-filled class="text-red-500"/> SGHIOURI Mohammed</div>
    <div class="flex items-center gap-2 text-white"><carbon-user-avatar-filled class="text-red-500"/> DIVENGI BUNKEMBO Nagui</div>
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

<div class="grid grid-cols-2 gap-4">
  <div class="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
    <div class="text-2xl">📊</div>
    <div>
      <div class="font-bold">1. Contexte & Données</div>
      <div class="text-sm opacity-75">Volume traité & méthodologie</div>
    </div>
  </div>
  
  <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/20">
    <div class="text-2xl">🏗️</div>
    <div>
      <div class="font-bold">2. Architecture Technique</div>
      <div class="text-sm opacity-75">Solution Dallosh Analysis</div>
    </div>
  </div>
</div>

<div class="grid grid-cols-2 gap-4">
  <div class="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
    <div class="text-2xl">📈</div>
    <div>
      <div class="font-bold">3. Principaux Constats</div>
      <div class="text-sm opacity-75">KPIs & analyse thématique</div>
    </div>
  </div>
  
  <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/20">
    <div class="text-2xl">🎯</div>
    <div>
      <div class="font-bold">4. Recommandations</div>
      <div class="text-sm opacity-75">Actions concrètes</div>
    </div>
  </div>
</div>

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
  <h3 class="text-2xl mb-4 flex items-center gap-3 text-red-600">
    <carbon-data-blob /> La Donnée Brute
  </h3>
  <ul class="space-y-4">
    <li class="flex items-center gap-2"><carbon-logo-twitter class="text-red-400"/> Dataset de <strong>3 790 tweets</strong> analysés</li>
    <li class="flex items-center gap-2"><carbon-warning-alt class="text-red-500"/> Engagement fort : ~19K réponses sur le négatif</li>
    <li class="flex items-center gap-2"><carbon-chat class="text-gray-500"/> Période : Août - Octobre 2024</li>
  </ul>
</div>

<div v-click>
  <h3 class="text-2xl mb-4 flex items-center gap-3 text-red-700">
    <carbon-chart-line-data /> Le Défi
  </h3>
  <div class="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border-l-4 border-red-600">
    Transformer ce "bruit" en <strong>outil décisionnel</strong> :
    <div class="mt-4 space-y-2">
      <div class="flex items-center gap-2"><carbon-filter /> 1. Identifier la vraie volumétrie (Pos vs Neg)</div>
      <div class="flex items-center gap-2"><carbon-flow /> 2. Segmenter par Topic (Matériel, Facture, etc.)</div>
      <div class="flex items-center gap-2"><carbon-warning-filled /> 3. Détecter les signaux faibles viraux</div>
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

<div v-click class="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-700">
  <div class="text-4xl font-bold text-red-600 mb-2">3 790</div>
  <div class="text-sm font-semibold mb-1">Tweets Uniques</div>
  <div class="text-xs opacity-75">Répartition : 51% Positif / 38% Négatif / 11% Neutre</div>
</div>

<div v-click class="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-xl border border-gray-200 dark:border-gray-700">
  <div class="text-4xl font-bold text-gray-600 mb-2">3 axes</div>
  <div class="text-sm font-semibold mb-1">Enrichissement IA</div>
  <div class="text-xs opacity-75">Analyse Sentiment / Topic / Priorité via LLM</div>
</div>

<div v-click class="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-700">
  <div class="text-4xl font-bold text-red-600 mb-2">100%</div>
  <div class="text-sm font-semibold mb-1">Automatisé</div>
  <div class="text-xs opacity-75">Pipeline ETL avec RabbitMQ + Celery</div>
</div>

</div>

<div class="mt-12 max-w-4xl mx-auto">
  <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border-l-4 border-red-500">
    <div class="font-bold mb-2 flex items-center gap-2">
      <carbon-tool-box class="text-red-500" /> Méthodologie de tri rapide
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
    <div class="p-2 bg-red-100 rounded-lg text-red-600"><carbon-application-web class="text-xl"/></div>
    <div>
      <h3 class="font-bold text-sm">Frontend</h3>
      <p class="text-xs opacity-75">Next.js 16, React 19.</p>
    </div>
  </div>

  <div v-click class="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 transition-all">
    <div class="p-2 bg-gray-100 rounded-lg text-gray-600"><carbon-api class="text-xl"/></div>
    <div>
      <h3 class="font-bold text-sm">Backend</h3>
      <p class="text-xs opacity-75">Node.js, Express.</p>
    </div>
  </div>

  <div v-click class="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 transition-all">
    <div class="p-2 bg-red-100 rounded-lg text-red-600"><carbon-machine-learning-model class="text-xl"/></div>
    <div>
      <h3 class="font-bold text-sm">Processing</h3>
      <p class="text-xs opacity-75">Python, Celery, Ollama.</p>
    </div>
  </div>

  <div v-click class="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 transition-all">
    <div class="p-2 bg-gray-100 rounded-lg text-gray-600"><carbon-data-base class="text-xl"/></div>
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

<div class="space-y-4">
  <h3 class="font-bold text-xl mb-4">Indicateurs Clés</h3>
  
  <div v-click class="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border-l-4 border-green-500">
    <div class="flex items-center gap-3 mb-2">
      <div class="text-3xl font-bold text-green-500">51%</div>
      <div class="text-xs opacity-75">Sentiment Positif</div>
    </div>
    <div class="text-sm">
      Surprise : majorité de retours positifs (Offres, Installation).
    </div>
  </div>
  
  <div v-click class="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border-l-4 border-red-500">
    <div class="flex items-center gap-3 mb-2">
      <div class="text-3xl font-bold text-red-500">38%</div>
      <div class="text-xs opacity-75">Sentiment Négatif</div>
    </div>
    <div class="text-sm">
      Concentré sur le matériel et le service client.
    </div>
  </div>
  
  <div v-click class="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-xl border-l-4 border-gray-500">
    <div class="flex items-center gap-3 mb-2">
      <carbon-share class="text-3xl text-gray-500" />
      <div class="text-xs opacity-75">Viralité Asymétrique</div>
    </div>
    <div class="text-sm">
      19.3K réponses sur le négatif vs 16.1K sur le positif (plus de bruit sur les pannes).
    </div>
  </div>
</div>

<div class="space-y-4">
  <h3 class="font-bold text-xl mb-4">Enseignements</h3>
  
  <div v-click class="p-3 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl">
    <h4 class="font-bold mb-1 flex items-center gap-2 text-sm">
      <carbon-warning-filled class="text-red-500" /> Top Viralité Négative
    </h4>
    <div class="text-xs">
      1. Déconnexions (707 RT)<br>
      2. Panne Totale (703 RT)<br>
      3. Déception 5G (701 RT)
    </div>
  </div>
  
  <div v-click class="p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-xl">
    <h4 class="font-bold mb-1 flex items-center gap-2 text-sm">
      <carbon-chart-pie class="text-gray-500" /> Répartition Réelle
    </h4>
    <div class="text-xs space-y-0.5">
      <div>🔴 <strong>30%</strong> Matériel (Box, Player)</div>
      <div>🟡 <strong>29%</strong> Service Client</div>
      <div>⚫ <strong>22%</strong> Facturation</div>
    </div>
  </div>
  
  <div v-click class="p-3 bg-gradient-to-r from-green-50 to-gray-50 dark:from-green-900/20 dark:to-gray-900/20 rounded-xl">
    <h4 class="font-bold mb-1 flex items-center gap-2 text-sm">
      <carbon-idea class="text-green-500" /> Levier Positif
    </h4>
    <div class="text-xs">Offres Flex & Installation fibre (Tweets très positifs).</div>
  </div>
</div>

</div>

---

# Analyse des Thématiques

De quoi parlent réellement les abonnés Free ?

<div class="grid grid-cols-2 gap-8 mt-6">

<div class="space-y-3">
  <div v-click class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
    <div class="text-red-500 text-xl mt-0.5"><carbon-devices /></div>
    <div>
      <h3 class="font-bold text-base">Matériel (29.6%)</h3>
      <p class="opacity-80 text-xs mt-1">Sujet #1. Problèmes Freebox, Player Devialet, mais aussi éloges sur le son.</p>
    </div>
  </div>
  
  <div v-click class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
    <div class="text-gray-500 text-xl mt-0.5"><carbon-headset /></div>
    <div>
      <h3 class="font-bold text-base">Service Client (28.8%)</h3>
      <p class="opacity-80 text-xs mt-1">Forte polarité. Plaintes sur l'attente vs satisfaction résolutions rapides.</p>
    </div>
  </div>
  
  <div v-click class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
    <div class="text-red-800 text-xl mt-0.5"><carbon-document /></div>
    <div>
      <h3 class="font-bold text-base">Facturation (22%)</h3>
      <p class="opacity-80 text-xs mt-1">Questions sur les prélèvements et régularisations.</p>
    </div>
  </div>
</div>

<div class="flex flex-col justify-center">
  <h3 class="text-center font-bold mb-4 text-sm opacity-75">Répartition des Topics (Volume)</h3>
  <div class="space-y-2">
    <div class="flex items-center gap-2">
      <div class="w-24 text-xs font-medium">Matériel</div>
      <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
        <div class="bg-red-500 h-full flex items-center justify-end pr-2 text-white text-xs font-bold" style="width: 30%">30%</div>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-24 text-xs font-medium">Svc Client</div>
      <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
        <div class="bg-gray-500 h-full flex items-center justify-end pr-2 text-white text-xs font-bold" style="width: 29%">29%</div>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-24 text-xs font-medium">Facturation</div>
      <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
        <div class="bg-red-800 h-full flex items-center justify-end pr-2 text-white text-xs font-bold" style="width: 22%">22%</div>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-24 text-xs font-medium">Réseau</div>
      <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
        <div class="bg-gray-400 h-full flex items-center justify-end pr-2 text-white text-xs font-bold" style="width: 18%">18%</div>
      </div>
    </div>
  </div>
</div>

</div>

---

# Recommandations Opérationnelles

Transformer l'analyse en action concrète.

<div class="grid grid-cols-3 gap-6 mt-12">

<div v-click class="relative p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-t-4 border-red-600">
  <div class="absolute -top-4 left-6 bg-red-600 text-white p-2 rounded-lg shadow-md"><carbon-filter /></div>
  <h3 class="font-bold text-xl mt-4 mb-2">Focus Matériel</h3>
  <p class="text-sm opacity-80">Le topic #1 (30%) n'est pas le réseau mais la Box. Former les agents sur le diagnostic matériel à distance.</p>
</div>

<div v-click class="relative p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-t-4 border-gray-500">
  <div class="absolute -top-4 left-6 bg-gray-500 text-white p-2 rounded-lg shadow-md"><carbon-direction-fork /></div>
  <h3 class="font-bold text-xl mt-4 mb-2">Amplification Positive</h3>
  <p class="text-sm opacity-80">51% de sentiments positifs. Capitaliser sur les retours "Installation Rapide" pour le marketing.</p>
</div>

<div v-click class="relative p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-t-4 border-red-500">
  <div class="absolute -top-4 left-6 bg-red-500 text-white p-2 rounded-lg shadow-md"><carbon-notification /></div>
  <h3 class="font-bold text-xl mt-4 mb-2">Gestion de Crise</h3>
  <p class="text-sm opacity-80">Malgré le volume positif, les tweets "Panne Totale" génèrent 700+ RT. Alerte immédiate requise.</p>
</div>

</div>

---
layout: default
---

# Recommandations & Justifications Stratégiques

<div class="grid grid-cols-2 gap-4 mt-4">

<div v-click class="p-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-red-600 shadow-sm">
  <div class="flex justify-between items-start mb-2">
    <h3 class="font-bold text-lg flex items-center gap-2 text-red-700 dark:text-red-400">
      <carbon-bot /> Assistant Box IA
    </h3>
    <div class="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 text-xs rounded-full font-bold">ROI: 6 mois</div>
  </div>
  <div class="text-sm mb-3">
    <div class="font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider mb-1">Justification (Data)</div>
    <p><strong>30%</strong> du volume concerne le matériel. Diagnostic automatisable.</p>
  </div>
  <div class="bg-gray-50 dark:bg-gray-700/30 p-2 rounded text-xs flex justify-between items-center">
    <span><strong>Action :</strong> Self-care Matériel</span>
    <span class="text-green-600 font-bold">-25% tickets</span>
  </div>
</div>

<div v-click class="p-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-gray-500 shadow-sm">
  <div class="flex justify-between items-start mb-2">
    <h3 class="font-bold text-lg flex items-center gap-2 text-gray-700 dark:text-gray-400">
      <carbon-task-star /> Programme Ambassadeur
    </h3>
    <div class="px-2 py-0.5 bg-gray-100 dark:bg-gray-900/30 text-gray-700 text-xs rounded-full font-bold">Opportunité</div>
  </div>
  <div class="text-sm mb-3">
    <div class="font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider mb-1">Justification (Data)</div>
    <p><strong>51%</strong> de tweets positifs. Une base silencieuse à activer.</p>
  </div>
  <div class="bg-gray-50 dark:bg-gray-700/30 p-2 rounded text-xs flex justify-between items-center">
    <span><strong>Action :</strong> Campagne UGC</span>
    <span class="text-green-600 font-bold">Image de marque</span>
  </div>
</div>

<div v-click class="p-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-green-500 shadow-sm">
  <div class="flex justify-between items-start mb-2">
    <h3 class="font-bold text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
      <carbon-wikis /> Refonte Espace Client
    </h3>
    <div class="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 text-xs rounded-full font-bold">ROI: 3 mois</div>
  </div>
  <div class="text-sm mb-3">
    <div class="font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider mb-1">Justification (Data)</div>
    <p>La Facturation (22%) et le Service Client (29%) restent des points de friction majeurs.</p>
  </div>
  <div class="bg-gray-50 dark:bg-gray-700/30 p-2 rounded text-xs flex justify-between items-center">
    <span><strong>Action :</strong> UX/UI Facturation</span>
    <span class="text-green-600 font-bold">Satisfaction</span>
  </div>
</div>

<div v-click class="p-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-red-500 shadow-sm">
  <div class="flex justify-between items-start mb-2">
    <h3 class="font-bold text-lg flex items-center gap-2 text-red-700 dark:text-red-400">
      <carbon-warning-alt /> Cellule Viralité
    </h3>
    <div class="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 text-xs rounded-full font-bold">Vital</div>
  </div>
  <div class="text-sm mb-3">
    <div class="font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider mb-1">Justification (Data)</div>
    <p>Engagement <strong>supérieur</strong> sur les tweets négatifs. Risque de bad buzz rapide.</p>
  </div>
  <div class="bg-gray-50 dark:bg-gray-700/30 p-2 rounded text-xs flex justify-between items-center">
    <span><strong>Action :</strong> Veille Active</span>
    <span class="text-green-600 font-bold">Prévention</span>
  </div>
</div>

</div>

---
layout: center
class: text-center
---

# Conclusion

Dallosh Analysis révèle une réalité nuancée : **Free performe mieux que perçu**, mais reste vulnérable sur le matériel.

<div class="mt-12 grid grid-cols-3 gap-12 text-left">
  <div v-click class="transform hover:scale-105 transition-transform duration-300">
    <div class="text-4xl mb-4 text-green-500"><carbon-thumbs-up /></div>
    <strong class="text-xl">Surprise</strong>
    <p class="text-sm mt-2 opacity-75">51% de sentiments positifs, contrairement à l'intuition "bashing".</p>
  </div>
  <div v-click class="transform hover:scale-105 transition-transform duration-300">
    <div class="text-4xl mb-4 text-red-500"><carbon-chart-radar /></div>
    <strong class="text-xl">Pivot Stratégique</strong>
    <p class="text-sm mt-2 opacity-75">Le problème n'est pas le réseau (18%) mais le matériel (30%).</p>
  </div>
  <div v-click class="transform hover:scale-105 transition-transform duration-300">
    <div class="text-4xl mb-4 text-red-600"><carbon-flash /></div>
    <strong class="text-xl">Réactivité</strong>
    <p class="text-sm mt-2 opacity-75">Nécessité de casser la viralité des pannes techniques.</p>
  </div>
</div>

<div class="mt-20 opacity-50">
  Merci de votre attention.<br>
  <span class="text-sm">Lien vers l'application : https://dallosh-analysis.agglomy.com/</span>
</div>
