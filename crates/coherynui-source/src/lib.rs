//! CoherynUI CSS — Source File Discovery and Class Candidate Extractor
//!
//! Scans source files (HTML, JSX, TSX, Vue, Svelte, etc.) and extracts
//! potential utility class tokens with exact source line/column spans.

use coherynui_core::SourceSpan;
use ignore::WalkBuilder;
use std::path::{Path, PathBuf};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum SourceError {
    #[error("Failed to read file {path:?}: {source}")]
    Io {
        path: PathBuf,
        source: std::io::Error,
    },
}

pub use coherynui_core::SourceCandidate;

/// Extract class name candidates from text (HTML, JSX, TSX, template markup).
pub fn extract_candidates_from_str(content: &str, file_name: &str) -> Vec<SourceCandidate> {
    let mut candidates = Vec::new();

    for (line_idx, line) in content.lines().enumerate() {
        let line_num = (line_idx + 1) as u32;

        // Fast scan for class="..." and className="..."
        let patterns = ["class=", "className="];
        for pattern in patterns {
            let mut search_from = 0;
            while let Some(pos) = line[search_from..].find(pattern) {
                let match_start = search_from + pos + pattern.len();
                let remaining = &line[match_start..];

                // Check quote delimiter
                if let Some(quote) = remaining.chars().next() {
                    if quote == '"' || quote == '\'' || quote == '`' {
                        let val_start = match_start + 1;
                        if let Some(quote_end) = line[val_start..].find(quote) {
                            let class_blob = &line[val_start..val_start + quote_end];

                            // Tokenize whitespace-separated class list
                            let mut token_start = 0;
                            for token in class_blob.split_whitespace() {
                                if let Some(offset) = class_blob[token_start..].find(token) {
                                    let col_start = (val_start + token_start + offset + 1) as u32;
                                    let col_end = col_start + token.len() as u32;
                                    candidates.push(SourceCandidate {
                                        value: token.to_string(),
                                        span: SourceSpan::new(file_name, line_num, col_start, line_num, col_end),
                                    });
                                    token_start += offset + token.len();
                                }
                            }
                            search_from = val_start + quote_end + 1;
                            continue;
                        }
                    }
                }
                search_from = match_start;
            }
        }
    }

    candidates
}

/// Discover source files in a root directory according to inclusion and ignore rules.
pub fn discover_source_files(root: &Path, extensions: &[&str]) -> Vec<PathBuf> {
    let mut files = Vec::new();
    let walker = WalkBuilder::new(root)
        .standard_filters(true)
        .hidden(true)
        .build();

    for entry in walker.flatten() {
        let path = entry.path();
        if path.is_file() {
            if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
                if extensions.contains(&ext) {
                    files.push(path.to_path_buf());
                }
            }
        }
    }

    files
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn extracts_html_classes() {
        let html = r#"<div class="flex items-center p-6"></div>"#;
        let candidates = extract_candidates_from_str(html, "index.html");
        let values: Vec<&str> = candidates.iter().map(|c| c.value.as_str()).collect();
        assert_eq!(values, vec!["flex", "items-center", "p-6"]);
    }

    #[test]
    fn extracts_jsx_classname() {
        let jsx = r#"<Section className="radius-xl bg-surface" />"#;
        let candidates = extract_candidates_from_str(jsx, "Card.tsx");
        let values: Vec<&str> = candidates.iter().map(|c| c.value.as_str()).collect();
        assert_eq!(values, vec!["radius-xl", "bg-surface"]);
    }
}
