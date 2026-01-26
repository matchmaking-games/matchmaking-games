
## Plano: Reorganização Visual do Perfil Público (Estilo LinkedIn)

### Visão Geral

Reorganizar a página de perfil público `/p/{slug}` para agrupar seções em cards containers, seguindo o padrão visual do LinkedIn. As alterações são puramente visuais - sem mudanças em queries ou funcionalidades.

---

### Resumo das Alterações

| Componente | Alteração |
|------------|-----------|
| `ProfileHero.tsx` | Envolver conteúdo (exceto banner) em Card |
| `AboutSection.tsx` | Envolver em Card (já usa Card internamente - simplificar) |
| `ProjectsSection.tsx` | Envolver grid em Card container |
| `SkillsSection.tsx` | Envolver em Card container |
| `ExperienceSection.tsx` | Envolver em Card + remover timeline + usar dividers |
| `EducationSection.tsx` | Envolver em Card único + usar dividers entre itens |

---

### Arquivos a Modificar

| Arquivo | Tipo |
|---------|------|
| `src/components/public-profile/ProfileHero.tsx` | Modificar |
| `src/components/public-profile/AboutSection.tsx` | Modificar |
| `src/components/public-profile/ProjectsSection.tsx` | Modificar |
| `src/components/public-profile/SkillsSection.tsx` | Modificar |
| `src/components/public-profile/ExperienceSection.tsx` | Modificar |
| `src/components/public-profile/EducationSection.tsx` | Modificar |

---

### Detalhamento das Alterações

#### 1. ProfileHero.tsx

**Objetivo**: Manter banner fora do card, mas envolver avatar + info + botão compartilhar em um Card que "sobe" para sobrepor o banner.

**Estrutura atual**:
```text
┌─────────────────────────┐
│ BANNER (full width)     │
└─────────────────────────┘
  Avatar
  Nome / Título / Localização
```

**Nova estrutura**:
```text
┌─────────────────────────┐
│ BANNER (full width)     │
└─────────────────────────┘
┌─────────────────────────┐ ← Card com margin-top negativo
│ Avatar (sobrepõe banner)│
│ Nome / Título           │
│ Localização / Badge     │
│ [Compartilhar]          │
└─────────────────────────┘
```

**Alterações**:
- Adicionar import do Card
- Envolver o container de conteúdo (`max-w-4xl`) em um `<Card>`
- Aplicar `mt-[-60px] md:mt-[-70px] lg:mt-[-80px]` para sobrepor o banner
- Manter posicionamento do avatar (já está correto)

---

#### 2. AboutSection.tsx

**Objetivo**: Envolver toda a seção "Sobre" em um Card container.

**Estrutura atual**:
```text
Sobre (h2)
Bio...
Links sociais
Contato
```

**Nova estrutura**:
```text
┌─────────────────────────┐
│ Sobre (h2)              │
│ Bio...                  │
│ Links sociais           │
│ ───────────────────     │ ← Divider antes do contato
│ Contato                 │
└─────────────────────────┘
```

**Alterações**:
- Importar Card, CardHeader, CardContent
- Envolver em Card com h2 no CardHeader
- Conteúdo no CardContent
- Manter id="sobre" no `<section>` para scroll funcionar

---

#### 3. ProjectsSection.tsx

**Objetivo**: Envolver o grid de projetos em um Card container, com diferenciação visual entre card externo e cards internos.

**Estrutura atual**:
```text
Projetos em Destaque (h2)
┌───────┐ ┌───────┐ ┌───────┐
│Proj 1 │ │Proj 2 │ │Proj 3 │ ← Cards com shadow
└───────┘ └───────┘ └───────┘
```

**Nova estrutura**:
```text
┌──────────────────────────────────┐
│ Projetos em Destaque (h2)        │
│ ┌───────┐ ┌───────┐ ┌───────┐   │
│ │Proj 1 │ │Proj 2 │ │Proj 3 │   │ ← Cards internos mantidos
│ └───────┘ └───────┘ └───────┘   │
└──────────────────────────────────┘
```

**Alterações**:
- Importar Card, CardHeader, CardContent
- Envolver em Card container
- Cards internos dos projetos: manter estilo atual (já têm border-border/50)
- Card externo: usar estilo padrão do componente Card

---

#### 4. SkillsSection.tsx

**Objetivo**: Envolver as habilidades agrupadas em um Card container.

**Estrutura atual**:
```text
Habilidades (h2)
ENGINES
[Unity] [Unreal]
LINGUAGENS
[C#] [Python]
```

**Nova estrutura**:
```text
┌──────────────────────────────────┐
│ Habilidades (h2)                 │
│ ENGINES                          │
│ [Unity] [Unreal]                 │
│ LINGUAGENS                       │
│ [C#] [Python]                    │
└──────────────────────────────────┘
```

**Alterações**:
- Importar Card, CardHeader, CardContent
- Envolver em Card container
- Badges internos mantêm estilo atual

---

ExperienceSection.tsx - Instruções Corretas
Objetivo

Envolver em Card container
MANTER timeline vertical (para progressão de carreira futura)
Timeline só renderiza quando experiências forem da mesma empresa
Separar experiências de empresas diferentes com dividers horizontais


Estrutura Atual (INCORRETA)
textExperiência Profissional (h2)
│
├── ● Game Developer        ← Timeline conectando
│     Ubisoft               ← empresas DIFERENTES (ERRADO)
│
├── ● Game Designer
│     Indie Studio
│
Problema: Timeline está conectando empresas diferentes como se fosse progressão na mesma empresa.

Nova Estrutura (CORRETA)
Caso 1: Empresas Diferentes (comportamento atual)
text┌──────────────────────────────────┐
│ Experiência Profissional (h2)    │
│ ─────────────────────────────    │ ← Divider
│ Game Developer                   │
│ Ubisoft • CLT                    │
│ Jan 2022 - Atual (2 anos)        │
│ 📍 São Paulo • Remoto            │
│ ─────────────────────────────    │ ← Divider
│ Game Designer                    │
│ Indie Studio • PJ                │
│ Mar 2020 - Dez 2021 (1 ano)      │
└──────────────────────────────────┘
Sem timeline entre experiências (empresas diferentes).

Caso 2: Mesma Empresa com Progressão (comportamento futuro)
text┌──────────────────────────────────┐
│ Experiência Profissional (h2)    │
│ ─────────────────────────────    │
│ Ubisoft                          │
│ │                                │
│ ├─ ● Senior Developer            │ ← Timeline
│ │    Jan 2023 - Atual            │
│ │                                │
│ ├─ ● Mid Developer               │ ← Timeline
│ │    Jan 2022 - Dez 2022         │
│ │                                │
│ └─ ● Junior Developer            │
│      Jan 2020 - Dez 2021         │
│ ─────────────────────────────    │
│ Game Designer                    │
│ Indie Studio • PJ                │
└──────────────────────────────────┘
Com timeline conectando cargos da mesma empresa.

Alterações no ExperienceItem
❌ NÃO FAZER (instruções antigas):

REMOVER linha da timeline
REMOVER dot da timeline
REMOVER pl-8 do container
REMOVER pb-8 do container

✅ FAZER (instruções corretas):

MANTER toda estrutura de timeline:

Linha vertical: <div className="absolute left-[7px] top-3 bottom-0 w-0.5 bg-border ...
Dot: <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-primary...
Padding: pl-8 e pb-8


ADICIONAR lógica condicional:

Timeline só renderiza se experiência pertence à mesma empresa da anterior
Por enquanto (sem múltiplos cargos), timeline não aparece
Código permanece pronto para quando implementarmos progressão


Manter conteúdo interno intacto

Estrutura

Envolver em Card container:

typescript   <Card>
     <CardHeader>
       <h2>Experiência Profissional</h2>
     </CardHeader>
     <CardContent>
       {/* experiências */}
     </CardContent>
   </Card>

Entre cada experiência de empresas diferentes:

Adicionar <Separator /> (exceto após a última)


Lógica de agrupamento (preparação futura):

Agrupar experiências por empresa ou estudio_id
Se grupo tem 1 experiência: sem timeline
Se grupo tem 2+ experiências: renderizar timeline conectando

---

#### 6. EducationSection.tsx

**Objetivo**: 
1. Envolver em Card único
2. Remover Cards individuais de cada educação
3. Separar itens com dividers

**Estrutura atual**:
```text
Educação (h2)
┌─────────────────────────┐
│ [Badge Graduação]       │ ← Card individual
│ Ciência da Computação   │
│ USP • 2015-2019         │
└─────────────────────────┘
┌─────────────────────────┐
│ [Badge Certificação]    │ ← Card individual
│ Unity Developer         │
│ Unity Learn • 2020      │
└─────────────────────────┘
```

**Nova estrutura**:
```text
┌──────────────────────────────────┐
│ Educação (h2)                    │
│ ─────────────────────────────    │
│ [Badge Graduação]                │
│ Ciência da Computação            │
│ USP • 2015-2019 • Concluído      │
│ ─────────────────────────────    │
│ [Badge Certificação]             │
│ Unity Developer                  │
│ Unity Learn • 2020               │
└──────────────────────────────────┘
```

**Alterações**:
- Importar Card, CardHeader, CardContent e Separator
- REMOVER: Card individual de cada educação
- Envolver toda a seção em um único Card
- Adicionar `<Separator />` entre cada item de educação (exceto após o último)
- Manter badges de tipo e estrutura de informações

---

### Padrão Visual dos Cards (Consistente)

Todos os cards containers usarão o componente Card existente que já aplica:
- `rounded-lg`
- `border bg-card`
- `shadow-sm`

Estrutura típica:
```tsx
<Card>
  <CardHeader>
    <h2 className="text-xl font-display font-semibold">Título da Seção</h2>
  </CardHeader>
  <CardContent>
    {/* Conteúdo da seção */}
  </CardContent>
</Card>
```

---

### Ordem de Implementação

| Ordem | Arquivo | Complexidade |
|-------|---------|--------------|
| 1 | `ExperienceSection.tsx` | Alta (remover timeline + card) |
| 2 | `EducationSection.tsx` | Média (remover cards individuais + card único) |
| 3 | `ProfileHero.tsx` | Média (adicionar card sobrepondo banner) |
| 4 | `AboutSection.tsx` | Baixa (apenas envolver em card) |
| 5 | `ProjectsSection.tsx` | Baixa (apenas envolver em card) |
| 6 | `SkillsSection.tsx` | Baixa (apenas envolver em card) |

---

### Checklist de Validações

| Item | Validação |
|------|-----------|
| Scroll suave funciona | IDs das seções mantidos |
| IntersectionObserver | Seções mantêm structure para detecção |
| Queries não alteradas | Apenas mudanças visuais |
| Funcionalidade "Ler mais" | Mantida na experiência |
| Links externos | Mantidos nos projetos |
| Badges de tipo | Mantidos em educação e experiência |
| Estado vazio | Mantido em todas as seções |

---

### Resultado Visual Esperado

```text
┌─────────────────────────────────────┐
│ BANNER                              │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ CARD: Avatar + Nome + Info          │
└─────────────────────────────────────┘

[Navegação Sticky - sem card]

┌─────────────────────────────────────┐
│ CARD: Sobre                         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ CARD: Projetos em Destaque          │
│ ┌─────┐ ┌─────┐ ┌─────┐            │
│ │Proj1│ │Proj2│ │Proj3│            │
│ └─────┘ └─────┘ └─────┘            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ CARD: Habilidades                   │
│ [Unity] [C#] [Blender]...          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ CARD: Experiência                   │
│ ───────────────────                 │
│ Game Developer • Ubisoft            │
│ ───────────────────                 │
│ Game Designer • Indie Studio        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ CARD: Educação                      │
│ ───────────────────                 │
│ Ciência da Computação • USP         │
│ ───────────────────                 │
│ Certificação Unity                  │
└─────────────────────────────────────┘
```
