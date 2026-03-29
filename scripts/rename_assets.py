#!/usr/bin/env python3
"""
Rename asset files and directories to match the internal naming convention.
Directories are renamed to match config IDs (lowercase, hyphens).
Run `git add -A` after execution to stage all changes.
"""

import os
import sys
from pathlib import Path

ASSETS = Path(__file__).parent.parent / "public" / "assets"


def mv(src: Path, dst: Path) -> None:
    if not src.exists():
        print(f"  SKIP (not found): {src.relative_to(ASSETS)}", file=sys.stderr)
        return
    if src == dst:
        return
    os.rename(src, dst)
    print(f"  {src.relative_to(ASSETS)}  ->  {dst.relative_to(ASSETS)}")


# ─── Heroes ───────────────────────────────────────────────────────────────────

def rename_hero_assets() -> None:
    heroes_dir = ASSETS / "heroes"
    states = ['idle', 'run', 'jump', 'dash', 'death', 'select']

    for n in range(1, 7):
        hero_dir = heroes_dir / f"Hero {n}"
        if not hero_dir.exists():
            print(f"WARNING: {hero_dir} not found, skipping", file=sys.stderr)
            continue

        print(f"\n--- Hero {n} ---")

        # Rename frame files inside each state subdirectory
        for state in states:
            folder = state.capitalize()
            state_dir = hero_dir / folder
            if not state_dir.exists():
                continue
            for f in sorted(state_dir.glob(f"Hero-{n}-{folder}_*.png")):
                num = f.stem.split('_')[-1]   # e.g. "01"
                mv(f, state_dir / f"hero_{n}_{state}_{num}.png")

        # Rename dust files (they live in Dash/Dust/)
        dust_dir = hero_dir / "Dash" / "Dust"
        if dust_dir.exists():
            for f in sorted(dust_dir.glob("Dash-Dust_*.png")):
                num = f.stem.split('_')[-1]
                mv(f, dust_dir / f"hero_{n}_dash_dust_{num}.png")

        # Rename Dust/ -> dust/  (before renaming Dash/)
        if dust_dir.exists():
            mv(dust_dir, hero_dir / "Dash" / "dust")

        # Rename each state dir to lowercase
        for state in states:
            folder = state.capitalize()
            state_dir = hero_dir / folder
            if state_dir.exists():
                mv(state_dir, hero_dir / state)

        # Rename Hero N/ -> hero-N/
        mv(hero_dir, heroes_dir / f"hero-{n}")


# ─── Weapons ──────────────────────────────────────────────────────────────────

def rename_weapon_assets() -> None:
    weapons_dir = ASSETS / "Weapons"

    # (id, disk_folder, file_stem, frame_count, lightsaber_zero_padded)
    WEAPONS = [
        ('laser-beam',  'Laser Beam',  'Laser-Beam',    3, False),
        ('laser-gun',   'Laser Gun',   'Laser-Gun',     2, False),
        ('lightsaber',  'Lightsaber',  'New lightsaber', 6, True),
        ('machine-gun', 'Machine Gun', 'Machine-Gun',   2, False),
        ('shotgun',     'Shotgun',     'Shotgun',        3, False),
    ]

    print("\n--- Weapons ---")
    for weapon_id, folder, stem, frame_count, zero_padded in WEAPONS:
        weapon_dir = weapons_dir / folder
        if not weapon_dir.exists():
            print(f"WARNING: {weapon_dir} not found", file=sys.stderr)
            continue
        for i in range(1, frame_count + 1):
            old_name = f"{stem}{str(i).zfill(2)}.png" if zero_padded else f"{stem}_{i}.png"
            mv(weapon_dir / old_name, weapon_dir / f"weapon_{weapon_id}_{i}.png")
        mv(weapon_dir, weapons_dir / weapon_id)

    print("\n--- Bullets ---")
    bullets_dir = weapons_dir / "Bullets"
    BULLET_RENAMES = [
        ('Bullet_Laser Beam.png', 'bullet_laser-beam.png'),
        ('Bullet_Laser Gun.png',  'bullet_laser-gun.png'),
        ('Bullet_MachineGun.png', 'bullet_machinegun.png'),
        ('Bullet_Shotgun.png',    'bullet_shotgun.png'),
    ]
    for old, new in BULLET_RENAMES:
        mv(bullets_dir / old, bullets_dir / new)
    mv(bullets_dir, weapons_dir / "bullets")


# ─── Effects (Buffs) ──────────────────────────────────────────────────────────

def rename_effect_assets() -> None:
    buffs_dir = ASSETS / "Buffs"

    # (id, disk_folder, file_stem, frame_count, frame_num_overrides)
    # Overrides: {frame_index -> file_number_string} for anomalous naming on disk
    EFFECTS = [
        ('buff-1',  'Buff 1',  'Buff-1',  8, {7: '07'}),
        ('buff-2',  'Buff 2',  'Buff-2',  8, {}),
        ('buff-3',  'Buff 3',  'Buff-3',  9, {}),
        ('healing', 'Healing', 'Healing', 9, {}),
    ]

    print("\n--- Effects ---")
    for effect_id, folder, stem, frame_count, overrides in EFFECTS:
        effect_dir = buffs_dir / folder
        if not effect_dir.exists():
            print(f"WARNING: {effect_dir} not found", file=sys.stderr)
            continue
        for i in range(1, frame_count + 1):
            file_num = overrides.get(i, str(i))
            mv(effect_dir / f"{stem}_{file_num}.png", effect_dir / f"effect_{effect_id}_{i}.png")
        mv(effect_dir, buffs_dir / effect_id)


# ─── Entry point ──────────────────────────────────────────────────────────────

if __name__ == '__main__':
    rename_hero_assets()
    rename_weapon_assets()
    rename_effect_assets()
    print("\nDone. Run `git add -A` to stage all changes.")
