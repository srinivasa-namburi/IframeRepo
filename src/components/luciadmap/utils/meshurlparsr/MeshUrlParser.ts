/**
 * Extracts and resolves the numeric value from a folder name ending with `_q<number>[K|M]?`.
 *
 * Supports decimals and suffix multipliers:
 *   K → ×1,000
 *   M → ×1,000,000
 *
 * Examples:
 *   parseQualitySuffix("ship_q2048") ➜ 2048
 *   parseQualitySuffix("terrain_q512K")➜ 512000
 *   parseQualitySuffix("city_q2M") ➜ 2000000
 *   parseQualitySuffix("model_q5.3K") ➜ 5300
 *   parseQualitySuffix("object_q4.1M") ➜ 4100000
 *   parseQualitySuffix("boat") ➜ null
 */
function parseQualitySuffix(name: string): number | null {
    const match = name.match(/_q(\d+(?:\.\d+)?)([KM])?$/i);
    if (!match) return null;

    let value = parseFloat(match[1]);
    const suffix = match[2]?.toUpperCase();

    if (suffix === "K") value *= 1_000;
    else if (suffix === "M") value *= 1_000_000;

    return value;
}

/**
 * Extracts the parent folder name of a `/tileset.json` file from a given URL.
 *
 * Example:
 *   getTilesetParentName("https://example.com/models/ship/tileset.json")
 *   ➜ "ship"
 */
function getTilesetParentName(url: string): string | null {
    try {
        // Normalize and parse
        const parsed = new URL(url, "http://dummy"); // fallback base for relative URLs
        const pathname = parsed.pathname.replace(/\/+$/, ""); // remove trailing slash
        const parts = pathname.split("/");

        // Check if it ends with "tileset.json"
        if (parts.length >= 2 && parts[parts.length - 1] === "tileset.json") {
            return parts[parts.length - 2]; // parent folder name
        }

        return null;
    } catch {
        return null;
    }
}

/**
 * Returns the numeric quality value from a tileset.json URL.
 *
 * Combines:
 *  - getTilesetParentName(url)
 *  - parseQualitySuffix(name)
 *
 * Example:
 *   getTilesetQualityFromUrl("https://example.com/models/ship_q5.3K/tileset.json")
 *   ➜ 5300
 */
export function getTilesetQualityFromUrl(url: string): number | null {
    const name = getTilesetParentName(url);
    if (!name) return null;
    return parseQualitySuffix(name);
}


