#!/usr/bin/env python3
"""One-off patcher: apply Idea.md color + typography tokens to config/settings_data.json."""
from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "config" / "settings_data.json"


def breezy_scheme_main() -> dict:
    """Ivory page + brand red CTAs (scheme-1)."""
    return {
        "background": "#FAF6EC",
        "foreground_heading": "#1A1A1A",
        "foreground": "#1A1A1AE6",
        "primary": "#B92C18",
        "primary_hover": "#8B1E0E",
        "border": "#E8DEC6",
        "shadow": "#8B1E0E33",
        "primary_button_background": "#B92C18",
        "primary_button_text": "#F1EA9C",
        "primary_button_border": "#B92C18",
        "primary_button_hover_background": "#8B1E0E",
        "primary_button_hover_text": "#F1EA9C",
        "primary_button_hover_border": "#8B1E0E",
        "secondary_button_background": "rgba(0,0,0,0)",
        "secondary_button_text": "#8B1E0E",
        "secondary_button_border": "#8B1E0E",
        "secondary_button_hover_background": "#B92C1814",
        "secondary_button_hover_text": "#8B1E0E",
        "secondary_button_hover_border": "#8B1E0E",
        "input_background": "#FFFFFF",
        "input_text_color": "#1A1A1A",
        "input_border_color": "#E8DEC6",
        "input_hover_background": "#FAF6EC",
        "variant_background_color": "#FFFFFF",
        "variant_text_color": "#1A1A1A",
        "variant_border_color": "#E8DEC6",
        "variant_hover_background_color": "#F5F0E4",
        "variant_hover_text_color": "#1A1A1A",
        "variant_hover_border_color": "#D9BD74",
        "selected_variant_background_color": "#B92C18",
        "selected_variant_text_color": "#F1EA9C",
        "selected_variant_border_color": "#B92C18",
        "selected_variant_hover_background_color": "#8B1E0E",
        "selected_variant_hover_text_color": "#F1EA9C",
        "selected_variant_hover_border_color": "#8B1E0E",
    }


def breezy_scheme_surface() -> dict:
    """White cards on ivory site (scheme-2)."""
    s = breezy_scheme_main()
    s["background"] = "#FFFFFF"
    s["input_background"] = "#FAF6EC"
    s["input_hover_background"] = "#F5F0E4"
    return s


def breezy_scheme_bar() -> dict:
    """Burgundy bar + gold text (announcement, footer) — scheme-5."""
    return {
        "background": "#8B1E0E",
        "foreground_heading": "#F1EA9C",
        "foreground": "#F1EA9CE6",
        "primary": "#D9BD74",
        "primary_hover": "#F1EA9C",
        "border": "#F1EA9C40",
        "shadow": "#00000040",
        "primary_button_background": "#1A1A1A",
        "primary_button_text": "#D9BD74",
        "primary_button_border": "#1A1A1A",
        "primary_button_hover_background": "#000000",
        "primary_button_hover_text": "#D9BD74",
        "primary_button_hover_border": "#000000",
        "secondary_button_background": "rgba(0,0,0,0)",
        "secondary_button_text": "#F1EA9C",
        "secondary_button_border": "#F1EA9C",
        "secondary_button_hover_background": "#FFFFFF14",
        "secondary_button_hover_text": "#FFFFFF",
        "secondary_button_hover_border": "#F1EA9C",
        "input_background": "#FFFFFF20",
        "input_text_color": "#F1EA9C",
        "input_border_color": "#F1EA9C66",
        "input_hover_background": "#FFFFFF24",
        "variant_background_color": "#FFFFFF",
        "variant_text_color": "#1A1A1A",
        "variant_border_color": "#E8DEC6",
        "variant_hover_background_color": "#F5F0E4",
        "variant_hover_text_color": "#1A1A1A",
        "variant_hover_border_color": "#D9BD74",
        "selected_variant_background_color": "#B92C18",
        "selected_variant_text_color": "#F1EA9C",
        "selected_variant_border_color": "#B92C18",
        "selected_variant_hover_background_color": "#8B1E0E",
        "selected_variant_hover_text_color": "#F1EA9C",
        "selected_variant_hover_border_color": "#8B1E0E",
    }


def patch_color_schemes(bucket: dict) -> None:
    cs = bucket.get("color_schemes") or {}
    if "scheme-1" in cs:
        cs["scheme-1"]["settings"] = breezy_scheme_main()
    if "scheme-2" in cs:
        cs["scheme-2"]["settings"] = breezy_scheme_surface()
    if "scheme-5" in cs:
        cs["scheme-5"]["settings"] = breezy_scheme_bar()


def main() -> None:
    data = json.loads(PATH.read_text())
    cur = data.setdefault("current", {})
    patch_color_schemes(cur)
    cur["type_heading_font"] = "playfair_display_n4"
    cur["type_body_font"] = "inter_n4"
    cur["type_subheading_font"] = "inter_n5"
    cur["type_accent_font"] = "inter_n7"

    presets = data.get("presets", {})
    horizon = presets.get("Horizon")
    if isinstance(horizon, dict) and "color_schemes" in horizon:
        patch_color_schemes(horizon)

    PATH.write_text(json.dumps(data, separators=(",", ":")))
    print("Updated", PATH)


if __name__ == "__main__":
    main()
