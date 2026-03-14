# SearchableSelect Component

Un composant Vue 3 select avec fonction de recherche intégrée, idéal pour les listes avec beaucoup d'options.

## Fonctionnalités

- ✅ Recherche en temps réel dans les options
- ✅ Support des objets et valeurs primitives
- ✅ Bouton de suppression de sélection (clearable)
- ✅ Désactivation (disabled)
- ✅ Gestion des erreurs
- ✅ Personnalisation de l'affichage (label) et de la valeur
- ✅ Click outside pour fermer le dropdown
- ✅ Traductions i18n

## Utilisation de base

### Avec des objets

```vue
<template>
  <SearchableSelect
    v-model="selectedBranchId"
    :options="branches"
    option-label="name"
    option-value="id"
    placeholder="Sélectionnez une agence"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SearchableSelect from '@/components/Shared/SearchableSelect.vue'

const selectedBranchId = ref<number | null>(null)
const branches = ref([
  { id: 1, name: 'Agence Yaoundé', code: 'YAO' },
  { id: 2, name: 'Agence Douala', code: 'DLA' },
  { id: 3, name: 'Agence Bafoussam', code: 'BAF' },
])
</script>
```

### Avec fonction personnalisée pour le label

```vue
<template>
  <SearchableSelect
    v-model="selectedBranchId"
    :options="branches"
    :option-label="(branch) => `${branch.name} (${branch.code})`"
    option-value="id"
    placeholder="Sélectionnez une agence"
  />
</template>
```

### Avec gestion d'erreur

```vue
<template>
  <SearchableSelect
    v-model="form.branch_id"
    :options="branches"
    option-label="name"
    option-value="id"
    :error="errors.branch_id"
    placeholder="Sélectionnez une agence"
  />
</template>

<script setup lang="ts">
const errors = ref({
  branch_id: 'Ce champ est requis'
})
</script>
```

### Mode désactivé

```vue
<SearchableSelect
  v-model="selectedBranchId"
  :options="branches"
  option-label="name"
  option-value="id"
  :disabled="true"
/>
```

### Sans bouton de suppression

```vue
<SearchableSelect
  v-model="selectedBranchId"
  :options="branches"
  option-label="name"
  option-value="id"
  :clearable="false"
/>
```

## Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `modelValue` | `any` | - | Valeur sélectionnée (v-model) |
| `options` | `any[]` | `[]` | Liste des options à afficher |
| `placeholder` | `string` | `'Sélectionnez une option'` | Texte du placeholder |
| `disabled` | `boolean` | `false` | Désactive le composant |
| `clearable` | `boolean` | `true` | Affiche le bouton de suppression |
| `error` | `string` | `''` | Message d'erreur à afficher |
| `optionLabel` | `string \| Function` | `'name'` | Propriété ou fonction pour le label |
| `optionValue` | `string \| Function` | `'id'` | Propriété ou fonction pour la valeur |
| `noResultsText` | `string` | `'Aucun résultat'` | Texte affiché si aucun résultat |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `any` | Émis quand la sélection change |
| `change` | `any` | Émis quand la sélection change |

## Exemples d'utilisation dans le projet

### Remplacement du select Transaction Type

**Avant:**
```vue
<select
  class="form-select"
  v-model.number="localForm.transaction_type_id"
  required
>
  <option :value="null" disabled>Sélectionnez un type</option>
  <option v-for="type in transactionTypes" :key="type.id" :value="type.id">
    {{ type.name }} ({{ type.code }})
  </option>
</select>
```

**Après:**
```vue
<SearchableSelect
  v-model="localForm.transaction_type_id"
  :options="transactionTypes"
  :option-label="(type) => `${type.name} (${type.code})`"
  option-value="id"
  placeholder="Sélectionnez un type"
/>
```

### Remplacement du select User dans UserList

**Avant:**
```vue
<select v-model="form.branch_id" class="form-select">
  <option :value="null">Sélectionner une Agence</option>
  <option v-for="branch in branchStore.branch_list" :key="branch.id" :value="branch.id">
    {{ branch.name }}
  </option>
</select>
```

**Après:**
```vue
<SearchableSelect
  v-model="form.branch_id"
  :options="branchStore.branch_list"
  option-label="name"
  option-value="id"
  placeholder="Sélectionner une Agence"
/>
```

## Styling

Le composant utilise les classes Bootstrap 5 par défaut. Le dropdown est stylé avec:
- Position absolue sous l'input
- z-index élevé (1050)
- Hauteur max de 300px avec scroll
- Box shadow pour la profondeur
- États hover et active

## Notes techniques

- Compatible Vue 3 Composition API
- Utilise TypeScript pour le type safety
- Click outside detection pour fermer le dropdown
- Debounce automatique via v-model
- Support de la recherche insensible à la casse
- Cleanup des event listeners dans onBeforeUnmount
