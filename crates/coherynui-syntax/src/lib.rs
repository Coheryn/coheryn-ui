//! CoherynUI CSS — Syntax Lexer and Grammar Parser
//!
//! Parses utility classes, variants, arbitrary values, and directives
//! into structured AST tokens and IR nodes.

use coherynui_core::{SourceSpan, VariantId};
use thiserror::Error;

#[derive(Debug, Error, PartialEq, Eq)]
pub enum SyntaxError {
    #[error("Empty class name at {0:?}")]
    EmptyClass(Option<SourceSpan>),
    #[error("Unclosed arbitrary value bracket at {0:?}")]
    UnclosedArbitraryBracket(Option<SourceSpan>),
    #[error("Invalid variant prefix '{variant}' at {source:?}")]
    InvalidVariant {
        variant: String,
        source: Option<SourceSpan>,
    },
}

/// Parsed raw utility token before semantic resolution.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ParsedClassToken {
    pub raw: String,
    pub variants: Vec<VariantId>,
    pub base_utility: String,
    pub value_part: Option<String>,
    pub arbitrary: bool,
    pub important: bool,
    pub source: Option<SourceSpan>,
}

/// Parse a class string (which may contain multiple variants like "hover:focus:bg-primary")
pub fn parse_class(raw: &str, source: Option<SourceSpan>) -> Result<ParsedClassToken, SyntaxError> {
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        return Err(SyntaxError::EmptyClass(source));
    }

    let (clean_raw, important_prefix) = if let Some(stripped) = trimmed.strip_prefix('!') {
        (stripped, true)
    } else {
        (trimmed, false)
    };

    let (clean_raw, important_suffix) = if let Some(stripped) = clean_raw.strip_suffix('!') {
        (stripped, true)
    } else {
        (clean_raw, false)
    };
    let important = important_prefix || important_suffix;

    // Split on ':' while respecting arbitrary values like '[calc(100%_-_2rem)]'
    let mut variants = Vec::new();
    let mut current_segment = String::new();
    let mut in_bracket = false;

    for ch in clean_raw.chars() {
        match ch {
            '[' => {
                in_bracket = true;
                current_segment.push(ch);
            }
            ']' => {
                in_bracket = false;
                current_segment.push(ch);
            }
            ':' if !in_bracket => {
                if !current_segment.is_empty() {
                    variants.push(VariantId(current_segment.clone()));
                    current_segment.clear();
                }
            }
            _ => {
                current_segment.push(ch);
            }
        }
    }

    if in_bracket {
        return Err(SyntaxError::UnclosedArbitraryBracket(source));
    }

    let utility_body = current_segment;
    if utility_body.is_empty() {
        return Err(SyntaxError::EmptyClass(source));
    }

    // Split utility into identifier and optional value
    let (base_utility, value_part, arbitrary) = if let Some(bracket_start) = utility_body.find('[') {
        if utility_body.ends_with(']') {
            let base = utility_body[..bracket_start].trim_end_matches('-');
            let val = &utility_body[bracket_start + 1..utility_body.len() - 1];
            (base.to_string(), Some(val.to_string()), true)
        } else {
            return Err(SyntaxError::UnclosedArbitraryBracket(source));
        }
    } else if let Some(dash_idx) = utility_body.rfind('-') {
        // e.g. "p-4", "radius-xl", "flex-col"
        let base = &utility_body[..dash_idx];
        let val = &utility_body[dash_idx + 1..];
        (base.to_string(), Some(val.to_string()), false)
    } else {
        // e.g. "flex", "hidden", "glass"
        (utility_body.clone(), None, false)
    };

    Ok(ParsedClassToken {
        raw: trimmed.to_string(),
        variants,
        base_utility,
        value_part,
        arbitrary,
        important,
        source,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_simple_utility() {
        let parsed = parse_class("flex", None).unwrap();
        assert_eq!(parsed.base_utility, "flex");
        assert_eq!(parsed.value_part, None);
        assert!(!parsed.important);
        assert!(parsed.variants.is_empty());
    }

    #[test]
    fn parses_variant_and_value() {
        let parsed = parse_class("hover:p-6", None).unwrap();
        assert_eq!(parsed.variants, vec![VariantId("hover".to_string())]);
        assert_eq!(parsed.base_utility, "p");
        assert_eq!(parsed.value_part, Some("6".to_string()));
    }

    #[test]
    fn parses_arbitrary_value() {
        let parsed = parse_class("bg-[#172033]", None).unwrap();
        assert_eq!(parsed.base_utility, "bg");
        assert_eq!(parsed.value_part, Some("#172033".to_string()));
        assert!(parsed.arbitrary);
    }

    #[test]
    fn parses_important() {
        let parsed = parse_class("!items-center", None).unwrap();
        assert_eq!(parsed.base_utility, "items-center");
        assert!(parsed.important);
    }
}
