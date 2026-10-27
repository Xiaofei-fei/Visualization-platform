# Consolidate road risk and transit visualization with preserved history

The three repositories repeat road geometry, styles and risk analysis, while Visualization-platform contains distinct transit and optimization flows. This change provides one static site with four modules, shared configuration and assets, and a single risk implementation that retains both versions of the original metrics.

The integration branch keeps all three original tips as ancestors through merge commits. Original defaults remain unchanged. Each source file has a SHA256 migration record or a recoverable original-history location; metric differences are listed explicitly. The runtime removes captured map SDKs and configures official SDK loading by page.

Validation includes original-history ancestry, source hashes, data references, local assets, search, HTTP handling, and browser integration for both risk datasets, animations, road lookup and transit/optimization controls. Vue/ECharts/data are real; external AMap is replaced at the test boundary. Live AMap authorization, map rendering and online transit results require an acceptance check with a valid deployment key.

Merge using a merge commit to retain the source histories. Build/publish dist/ only; no automatic production deployment is included.
