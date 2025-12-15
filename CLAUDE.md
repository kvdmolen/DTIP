# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DTIP (Decentralized Trust Interop Profile) is a documentation website for a lightweight technical profile that acts as a trust base layer for digital data exchange. The site renders markdown documentation as a single-page Vue.js application.

## Development

**Run locally with Caddy:**
```bash
caddy run
```
The site will be available at http://localhost:4000

**Alternative - any static file server works** since this is a pure static site with no build step.

## Architecture

This is a build-free static site using CDN-loaded dependencies:

- **index.html** - Entry point, loads Vue 3, Marked.js, Highlight.js, and Mermaid from CDN
- **main.js** - Vue application handling routing, markdown rendering, and TOC generation
- **styles.css** - All styling including responsive breakpoints
- **pages/*.md** - Markdown content files (whitepaper, specifications, examples, guide)

### Routing

Hash-based routing (`#/pagename` or `#/pagename#section`). Pages defined in the `pages` array in main.js map to markdown files in the `pages/` directory.

### Rendering Pipeline

1. Markdown fetched from `pages/` directory
2. Parsed with marked.js to extract headings for TOC
3. Custom renderer generates slugified heading IDs
4. Mermaid diagrams rendered post-mount
5. Code blocks highlighted with highlight.js
