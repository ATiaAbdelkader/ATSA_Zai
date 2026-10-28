# Experimental / Unwired Components

The components in this folder are **not currently rendered anywhere in the
application**. They were detected as dead code during the Batch E cleanup
of the ATSA code review (see `/home/z/my-project/worklog.md`, Task ID 4).

Each file appears to be a substantial, thoughtfully-built module that was
likely intended for use as a CASAEngine analysis tab but never wired up.
Rather than delete them, they have been moved here so they can be:

1. Re-wired into the main app later (recommended — see the brief notes
   below), or
2. Removed entirely if the team decides they're not needed.

## Components and likely intended use

| File | Lines | Likely intended role |
|------|-------|----------------------|
| `VeterinaryCryoCalculator.tsx` | 431 | Cryopreservation protocol calculator for veterinary species (bull/stallion/boar/ram) — straws, extender ratios, post-thaw survival estimates. |
| `SubpopulationClustering.tsx` | 579 | K-means / DBSCAN clustering of sperm kinematic vectors into progressive / hyperactivated / slow sub-populations. |
| `VisemBenchmarkValidator.tsx` | 468 | Validation against the public Visem microscopy benchmark dataset (motility / morphology comparison vs ground truth). |
| `FlagellarWaveformAnalyzer.tsx` | 573 | Frame-by-frame flagellar beat waveform reconstruction + dominant frequency analysis. |
| `FluorescenceGating.tsx` | 308 | Fluorescence-channel gating UI for viability / acrosome / SDF multi-channel flow data. |
| `TaxisAnalyzer.tsx` | 714 | Chemotaxis / thermotaxis gradient response analysis. |
| `KinematicScatterGating.tsx` | 563 | Recharts scatter plot with manual gating polygons for VCL vs LIN / VAP vs ALH. |
| `MorphologyGallery.tsx` | 448 | Visual gallery of normal + abnormal morphology with annotated thumbnails. |

## How to re-wire

The simplest path is to expose each as a tab inside the CASAEngine
component (look for the existing tab state in `src/components/CASAEngine.tsx`).
Each component currently expects a `theme: 'light' | 'dark'` prop and some
data via props or context — check the component's own `interface ...Props`
to see what's required.

If you decide to remove them instead, just delete this folder.
