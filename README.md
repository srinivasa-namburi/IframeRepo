# LuciadMap - URL Parameters

The `point-cloud-viewer` app allows you to dynamically display point-clouds in HSPC of 3D Tiles formats.

The app is configured via **URL query parameters**. This enables loading different 3D datasets, setting the reference system to Cartesian XYZ. 

Optionally labels can be added.

## URL Parameters

| Parameter       | Type   | Default        | Description |
|-----------------|--------|----------------|-------------|
| `hspc`          | string | `null`         | URL to an **HSPC point cloud** file. If provided, the map loads the point cloud and zooms to its bounds. |
| `3dtiles`       | string | `null`         | URL to an **OGC 3D Tiles** dataset. Used for 3D city models, terrain, or other tiled datasets. |
| `labels`        | string | `null`         | URL to a **labels dataset** (e.g., feature names or markers). Loaded after the main dataset (`hspc` or `3dtiles`). |

---

## Loading Behavior

1. **Reference System**
    - The map reference is set first to Cartesian (`LUCIAD:XYZ`).

2. **Data Loading Priority**
    - If `hspc` is provided → load HSPC point cloud.
    - Else if `3dtiles` is provided → load OGC 3D Tiles.
    - Else → no 3D data layer is loaded.

3. **Optional Labels**
    - If `labels` is provided, they are loaded after the main dataset.
    - Labels are displayed as a separate layer.

4. **Automatic Zoom**
    - The map automatically zooms to the bounds of the loaded layer.
    - If the layer’s reference does not match the map reference, a console warning is shown.

---

## Example URLs

### Load HSPC with Labels

```
https://mydomain.com/point-cloud-viewer?hspc=https://data.example.com/cloud.hspc&labels=https://data.example.com/labels.json
```

### Load 3D Tiles
```
https://mydomain.com/point-cloud-viewer?3dtiles=https://data.example.com/tileset.json
```
---

## Notes

- Only **one main dataset** (`hspc` or `3dtiles`) is loaded at a time.
- Labels are optional.
- Ensure that the dataset reference matches the map reference to avoid misalignment.
