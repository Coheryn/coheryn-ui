//! CoherynUI CSS — Core Types and Typed Intermediate Representation (IR)
//!
//! Provides fundamental data structures for source spans, AST/IR representation,
//! CSS cascade layers, rules, selectors, and declarations.

use serde::{Deserialize, Serialize};

/// Precise source location span for diagnostics and source-mapping.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct SourceSpan {
    pub file: String,
    pub start_line: u32,
    pub start_col: u32,
    pub end_line: u32,
    pub end_col: u32,
}

impl SourceSpan {
    pub fn new(file: impl Into<String>, start_line: u32, start_col: u32, end_line: u32, end_col: u32) -> Self {
        Self {
            file: file.into(),
            start_line,
            start_col,
            end_line,
            end_col,
        }
    }

    pub fn dummy() -> Self {
        Self {
            file: "dummy".to_string(),
            start_line: 1,
            start_col: 1,
            end_line: 1,
            end_col: 1,
        }
    }
}

/// Extracted candidate class token with its exact source span.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct SourceCandidate {
    pub value: String,
    pub span: SourceSpan,
}

impl SourceCandidate {
    pub fn new(value: impl Into<String>, span: SourceSpan) -> Self {
        Self {
            value: value.into(),
            span,
        }
    }

    pub fn from_value(value: impl Into<String>) -> Self {
        Self {
            value: value.into(),
            span: SourceSpan::dummy(),
        }
    }
}

/// Strongly typed property identifier.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct PropertyId(pub String);

impl<T: Into<String>> From<T> for PropertyId {
    fn from(s: T) -> Self {
        Self(s.into())
    }
}

/// Strongly typed CSS value representation.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum CssValue {
    Keyword(String),
    Length(String),
    Color(String),
    Var(String),
    Custom(String),
}

/// Strongly typed variant identifier (e.g. "hover", "focus-visible", "sm", "cq").
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct VariantId(pub String);

impl<T: Into<String>> From<T> for VariantId {
    fn from(s: T) -> Self {
        Self(s.into())
    }
}

/// Cascade layer identifier following CoherynUI layer hierarchy.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub enum LayerId {
    Reset = 0,
    Tokens = 1,
    Base = 2,
    Recipes = 3,
    Utilities = 4,
}

impl LayerId {
    pub fn as_layer_name(&self) -> &'static str {
        match self {
            LayerId::Reset => "coherynui.reset",
            LayerId::Tokens => "coherynui.tokens",
            LayerId::Base => "coherynui.base",
            LayerId::Recipes => "coherynui.recipes",
            LayerId::Utilities => "coherynui.utilities",
        }
    }
}

/// A parsed utility node in the semantic IR.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct UtilityNode {
    pub raw_class: String,
    pub property: PropertyId,
    pub value: CssValue,
    pub variants: Vec<VariantId>,
    pub important: bool,
    pub source: Option<SourceSpan>,
}

/// CSS selector node.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct Selector(pub String);

/// CSS declaration pair (property + value).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Declaration {
    pub property: String,
    pub value: String,
    pub important: bool,
}

/// Media query, container query, or feature query condition.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Condition {
    Media(String),
    Container(String),
    Supports(String),
}

/// Fully resolved CSS rule ready for cascade sorting, deduplication, and emission.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CssRule {
    pub selector: Selector,
    pub declarations: Vec<Declaration>,
    pub conditions: Vec<Condition>,
    pub layer: LayerId,
    pub source: Option<SourceSpan>,
}
