# CoherynUI CSS — Language & Grammar Specification v1.0

**Status:** Approved Specification  
**Authority:** [CoherynUI CSS Engineering Master Plan v1.1](../../resources/Coheryn_CSS_Engineering_Master_Plan_v1.1.md) — Section 5.3 & Section 6  
**Reference ADR:** [ADR-002: Utility Grammar and Canonical Class Names](../../rfcs/0002-utility-grammar-and-class-names.md)

---

## 1. Scope & Objective

This specification formally defines the lexical and syntactic grammar of the CoherynUI CSS styling language. It defines how class tokens extracted from markup (HTML, JSX, TSX, templates) are tokenized, parsed, validated, and normalized into the typed intermediate representation ([UtilityNode](../../crates/coherynui-core/src/lib.rs#L77)).

---

## 2. Formal EBNF Grammar

```ebnf
ClassList           ::= ( Whitespace | ClassToken )* ;

ClassToken          ::= ImportantPrefix? VariantChain? UtilityBody ImportantSuffix? ;

ImportantPrefix     ::= "!" ;
ImportantSuffix     ::= "!" ;

VariantChain        ::= ( Variant ":" )+ ;
Variant             ::= ResponsiveVariant 
                      | StateVariant 
                      | ContainerVariant 
                      | CustomVariant ;

ResponsiveVariant   ::= "sm" | "md" | "lg" | "xl" | "2xl" ;
StateVariant        ::= "hover" | "focus" | "focus-visible" | "focus-within"
                      | "active" | "disabled" | "visited" | "first" | "last"
                      | "odd" | "even" | "group-hover" | "peer-checked" ;
ContainerVariant    ::= "cq" ( "@" ContainerName )? ;
CustomVariant       ::= Identifier ;

UtilityBody         ::= RecipeClass
                      | MaterialClass
                      | PropertyUtility ;

PropertyUtility     ::= BaseIdentifier ( "-" ValueSpecifier )? ;

ValueSpecifier      ::= NamedToken
                      | NumericLiteral
                      | NegativeValue
                      | ArbitraryValue ;

NamedToken          ::= Identifier ( "-" Identifier )* ;
NumericLiteral      ::= [0-9]+ ( "." [0-9]+ )? ;
NegativeValue       ::= "-" ( NamedToken | NumericLiteral | ArbitraryValue ) ;
ArbitraryValue      ::= "[" ArbitraryContent "]" ;

ArbitraryContent    ::= ( AnyCharExceptClosingBracket | EscapedBracket )+ ;
EscapedBracket      ::= "\\]" ;

RecipeClass         ::= "ui-" Identifier ;
MaterialClass       ::= "glass" ( "-" Identifier )? ;

BaseIdentifier      ::= [a-z] [a-z0-9]* ;
Identifier          ::= [a-z0-9]+ ( "-" [a-z0-9]+ )* ;
ContainerName       ::= [a-zA-Z0-9_-]+ ;
Whitespace          ::= ( " " | "\t" | "\r" | "\n" )+ ;
```

---

## 3. Lexical Rules & Tokenization

### 3.1 Variant Separation
- The colon `:` acts as the variant delimiter.
- Variant parsing is greedy from left to right, but must **not** match colons inside arbitrary brackets `[...]` (e.g. `bg-[url(https://example.com/img.png)]`).
- Multiple variants can be chained: `sm:hover:bg-brand`. Order of evaluation in the cascade follows [docs/spec/cascade.md](../../docs/spec/cascade.md).

### 3.2 Value Separation
- A single hyphen `-` separates the base utility from its value specifier (e.g. `p-4`, `radius-xl`, `fg-primary`).
- If an identifier contains multiple internal hyphens as a compound name without a registered value (e.g. `items-center`, `justify-between`, `min-h-screen`), it is parsed as a nullary base utility.

### 3.3 Arbitrary Values
- Delimited by square brackets `[` and `]`.
- Spaces within arbitrary values must be represented by an underscore `_` or escaped space (e.g. `calc(100%_-_2rem)`).
- Escaped brackets inside strings are supported via `\\[` and `\\]`.

### 3.4 Important Flag
- Either prefix `!` (e.g. `!items-center`) or suffix `!` (e.g. `items-center!`) marks the resulting declarations as `!important`.
- Duplicate important markers (e.g. `!!flex`) generate a warning (`CY1002`) and normalize to single `!important`.

---

## 4. Canonical Vocabulary & Categories

| Category | Canonical Prefix | Examples | Notes |
|---|---|---|---|
| **Display** | nullary | `flex`, `grid`, `block`, `hidden` | Direct display keyword mapping |
| **Flex/Grid** | `flex-`, `cols-`, `items-`, `justify-` | `flex-col`, `items-center`, `justify-between`, `cols-3` | Alignment & layout directives |
| **Spacing** | `p`, `px`, `py`, `pt`, `pr`, `pb`, `pl`, `m`, `mx`, `my`, `gap` | `p-4`, `px-6`, `mt-2`, `gap-4` | Maps to `--cyn-space-*` tokens or rems |
| **Sizing** | `w-`, `h-`, `min-w-`, `min-h-`, `max-w-` | `w-full`, `min-h-screen`, `max-w-lg` | Standard sizing scales |
| **Position** | nullary / `inset-`, `top-`, etc. | `relative`, `absolute`, `sticky`, `top-0` | Positioning models |
| **Typography** | `text-`, `weight-`, `leading-`, `tracking-` | `text-lg`, `weight-semibold`, `leading-tight` | Sized by scale, weighted by semantic token |
| **Color** | `fg-` (foreground), `bg-` (background), `border-` | `fg-primary`, `fg-muted`, `bg-surface`, `bg-brand` | Semantic color tokens |
| **Shape** | `radius-`, `border-` | `radius-lg`, `radius-full`, `border-subtle` | Border radius and perimeter |
| **Depth** | `shadow-`, `depth-` | `shadow-lg`, `depth-3` | Elevation tokens |
| **Materials** | `glass`, `glass-*`, `surface-*` | `glass`, `glass-strong`, `glass-edge` | Liquid Glass and surface recipes |
| **Recipes** | `ui-*` | `ui-card`, `ui-button` | Multi-declaration reusable component recipes |

---

## 5. Error Recovery & Diagnostics

The lexer and parser must never panic on malformed user input. Diagnostic codes emitted during syntax processing:

- `CY1000`: Syntax error in class string (unbalanced brackets or malformed token).
- `CY1001`: Unrecognized utility name (not in canonical registry).
- `CY1002`: Redundant important flag.
- `CY1003`: Invalid or contradictory variant combination.
