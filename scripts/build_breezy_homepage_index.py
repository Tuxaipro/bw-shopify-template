#!/usr/bin/env python3
"""Rebuild templates/index.json per Idea.md §5.2 (Breezyweaves homepage)."""
from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "templates" / "index.json"

HEADER = """/*
 * ------------------------------------------------------------
 * IMPORTANT: The contents of this file are auto-generated.
 *
 * This file may be updated by the Shopify admin theme editor
 * or related systems. Please exercise caution as any changes
 * made to this file may be overwritten.
 * ------------------------------------------------------------
 */"""

TEXT_DEFAULTS = {
    "width": "100%",
    "max_width": "normal",
    "alignment": "left",
    "type_preset": "rte",
    "font": "var(--font-body--family)",
    "font_size": "1rem",
    "line_height": "normal",
    "letter_spacing": "normal",
    "case": "none",
    "wrap": "pretty",
    "color": "var(--color-foreground)",
    "background": False,
    "background_color": "#00000026",
    "corner_radius": 0,
    "padding-block-start": 0,
    "padding-block-end": 0,
    "padding-inline-start": 0,
    "padding-inline-end": 0,
}


def product_card_blocks() -> dict:
    return {
        "product_card_gallery_677WP3": {
            "type": "_product-card-gallery",
            "name": "t:names.product_card_media",
            "settings": {
                "image_ratio": "adapt",
                "border": "none",
                "border_width": 1,
                "border_opacity": 100,
                "border_radius": 0,
                "padding-block-start": 0,
                "padding-block-end": 0,
                "padding-inline-start": 0,
                "padding-inline-end": 0,
            },
            "blocks": {},
        },
        "product_title_YXxMTj": {
            "type": "product-title",
            "name": "t:names.product_title",
            "settings": {
                "width": "100%",
                "max_width": "normal",
                "alignment": "left",
                "type_preset": "rte",
                "font": "var(--font-heading--family)",
                "font_size": "1rem",
                "line_height": "normal",
                "letter_spacing": "normal",
                "case": "none",
                "wrap": "pretty",
                "color": "var(--color-foreground)",
                "background": False,
                "background_color": "#00000026",
                "corner_radius": 0,
                "padding-block-start": 4,
                "padding-block-end": 0,
                "padding-inline-start": 0,
                "padding-inline-end": 0,
            },
            "blocks": {},
        },
        "price_JQzVV4": {
            "type": "price",
            "name": "t:names.product_price",
            "settings": {
                "show_sale_price_first": True,
                "show_installments": False,
                "show_tax_info": False,
                "type_preset": "h6",
                "width": "100%",
                "alignment": "left",
                "font": "var(--font-body--family)",
                "font_size": "1rem",
                "line_height": "normal",
                "letter_spacing": "normal",
                "case": "none",
                "color": "var(--color-primary)",
                "padding-block-start": 0,
                "padding-block-end": 0,
                "padding-inline-start": 0,
                "padding-inline-end": 0,
            },
            "blocks": {},
        },
    }


def product_list_section(
    section_id: str,
    heading_html: str,
    max_products: int,
    columns: int,
    carousel_on_mobile: bool,
    padding_top: int = 48,
) -> dict:
    hdr = deepcopy(TEXT_DEFAULTS)
    hdr.update({"text": heading_html, "type_preset": "h3", "font": "var(--font-heading--family)", "font_size": ""})
    return {
        "type": "product-list",
        "blocks": {
            "static-header": {
                "type": "_product-list-content",
                "name": "t:names.header",
                "static": True,
                "settings": {
                    "content_direction": "row",
                    "vertical_on_mobile": False,
                    "horizontal_alignment": "space-between",
                    "vertical_alignment": "flex-end",
                    "align_baseline": True,
                    "horizontal_alignment_flex_direction_column": "flex-start",
                    "vertical_alignment_flex_direction_column": "center",
                    "gap": 12,
                    "width": "fill",
                    "custom_width": 100,
                    "width_mobile": "fill",
                    "custom_width_mobile": 100,
                    "height": "fit",
                    "custom_height": 100,
                    "inherit_color_scheme": True,
                    "color_scheme": "",
                    "background_media": "none",
                    "video_position": "cover",
                    "background_image_position": "cover",
                    "border": "none",
                    "border_width": 1,
                    "border_opacity": 100,
                    "border_radius": 0,
                    "padding-block-start": 0,
                    "padding-block-end": 0,
                    "padding-inline-start": 0,
                    "padding-inline-end": 0,
                },
                "blocks": {
                    "product_list_text_hdr": {
                        "type": "_product-list-text",
                        "name": "t:names.collection_title",
                        "settings": hdr,
                        "blocks": {},
                    },
                    "product_list_button_va": {
                        "type": "_product-list-button",
                        "name": "t:names.product_list_button",
                        "settings": {
                            "label": "View all",
                            "open_in_new_tab": False,
                            "style_class": "link",
                            "width": "fit-content",
                            "custom_width": 100,
                            "width_mobile": "fit-content",
                            "custom_width_mobile": 100,
                        },
                        "blocks": {},
                    },
                },
                "block_order": ["product_list_text_hdr", "product_list_button_va"],
            },
            "static-product-card": {
                "type": "_product-card",
                "name": "t:names.product_card",
                "static": True,
                "settings": {
                    "product_card_gap": 4,
                    "inherit_color_scheme": True,
                    "color_scheme": "",
                    "border": "solid",
                    "border_width": 1,
                    "border_opacity": 100,
                    "border_radius": 4,
                    "padding-block-start": 0,
                    "padding-block-end": 0,
                    "padding-inline-start": 0,
                    "padding-inline-end": 0,
                },
                "blocks": product_card_blocks(),
                "block_order": ["product_card_gallery_677WP3", "product_title_YXxMTj", "price_JQzVV4"],
            },
        },
        "name": heading_html.replace("<h3>", "").replace("</h3>", "").strip(),
        "settings": {
            "collection": "all",
            "layout_type": "grid",
            "carousel_on_mobile": carousel_on_mobile,
            "max_products": max_products,
            "columns": columns,
            "mobile_columns": "2",
            "mobile_card_size": "60cqw",
            "columns_gap": 12,
            "rows_gap": 24,
            "icons_style": "arrow",
            "icons_shape": "none",
            "section_width": "page-width",
            "horizontal_alignment": "flex-start",
            "gap": 28,
            "color_scheme": "scheme-2",
            "padding-block-start": padding_top,
            "padding-block-end": 48,
        },
    }


def collection_list_section() -> dict:
    group_settings = {
        "content_direction": "column",
        "vertical_on_mobile": True,
        "horizontal_alignment": "flex-start",
        "vertical_alignment": "center",
        "align_baseline": False,
        "horizontal_alignment_flex_direction_column": "flex-start",
        "vertical_alignment_flex_direction_column": "center",
        "gap": 12,
        "width": "fill",
        "custom_width": 100,
        "width_mobile": "fill",
        "custom_width_mobile": 100,
        "height": "fit",
        "custom_height": 100,
        "inherit_color_scheme": True,
        "color_scheme": "",
        "background_media": "none",
        "video_position": "cover",
        "background_image_position": "cover",
        "border": "none",
        "border_width": 1,
        "border_opacity": 100,
        "border_radius": 0,
        "toggle_overlay": False,
        "overlay_color": "#00000026",
        "overlay_style": "solid",
        "gradient_direction": "to top",
        "link": "",
        "open_in_new_tab": False,
        "placeholder": "",
        "padding-block-start": 0,
        "padding-block-end": 0,
        "padding-inline-start": 0,
        "padding-inline-end": 0,
    }
    hdr = deepcopy(TEXT_DEFAULTS)
    hdr.update(
        {
            "text": "<h2>Shop by category</h2><p>Sarees, dresses, lehengas, kurtis, and more—assign your collections in the theme editor.</p>",
            "type_preset": "h4",
            "font": "var(--font-heading--family)",
            "width": "fit-content",
        }
    )
    return {
        "type": "collection-list",
        "blocks": {
            "group_cat_header": {
                "type": "group",
                "name": "t:names.header",
                "settings": group_settings,
                "blocks": {"text_cat_hdr": {"type": "text", "name": "t:names.text", "settings": hdr, "blocks": {}}},
                "block_order": ["text_cat_hdr"],
            },
            "static-collection-card": {
                "type": "_collection-card",
                "name": "t:names.collection_card",
                "static": True,
                "settings": {
                    "horizontal_alignment": "flex-start",
                    "vertical_alignment": "flex-end",
                    "placement": "on_image",
                    "inherit_color_scheme": True,
                    "color_scheme": "",
                    "border": "none",
                    "border_width": 1,
                    "border_opacity": 100,
                    "border_radius": 4,
                },
                "blocks": {
                    "collection-card-image": {
                        "type": "_collection-card-image",
                        "name": "t:names.collection_card_image",
                        "static": True,
                        "settings": {"image_ratio": "portrait"},
                    },
                    "collection-title": {
                        "type": "collection-title",
                        "name": "t:names.collection_title",
                        "settings": {
                            "type_preset": "rte",
                            "font": "var(--font-heading--family)",
                            "font_size": "",
                            "line_height": "normal",
                            "letter_spacing": "normal",
                            "case": "none",
                            "wrap": "pretty",
                            "width": "fit-content",
                            "max_width": "normal",
                            "alignment": "left",
                            "background": True,
                            "background_color": "#FFFFFF",
                            "padding-block-start": 4,
                            "padding-block-end": 4,
                            "padding-inline-start": 8,
                            "padding-inline-end": 8,
                        },
                    },
                },
                "block_order": ["collection-title"],
            },
        },
        "block_order": ["group_cat_header"],
        "name": "Category tiles",
        "settings": {
            "collection_list": [],
            "layout_type": "grid",
            "carousel_on_mobile": True,
            "columns": 3,
            "mobile_columns": "2",
            "mobile_card_size": "44cqw",
            "columns_gap": 12,
            "rows_gap": 16,
            "icons_style": "arrow",
            "icons_shape": "none",
            "section_width": "page-width",
            "gap": 16,
            "color_scheme": "scheme-1",
            "padding-block-start": 56,
            "padding-block-end": 24,
        },
    }


def custom_liquid_section(name: str, liquid: str, scheme: str, pt: int, pb: int) -> dict:
    return {
        "type": "custom-liquid",
        "name": name,
        "settings": {
            "custom_liquid": liquid,
            "color_scheme": scheme,
            "section_width": "page-width",
            "padding-block-start": pt,
            "padding-block-end": pb,
        },
    }


FABRIC_LIQUID = r"""
<div class="breezy-fabric-story">
  <h2 class="breezy-fabric-story__title">Our fabrics</h2>
  <p class="breezy-fabric-story__lede">Breathable materials chosen for drape, comfort, and quiet luxury.</p>
  <div class="breezy-fabric-grid">
    <article class="breezy-fabric-card"><h3>Silk</h3><p>Natural sheen and fluid movement for celebrations and evenings out.</p></article>
    <article class="breezy-fabric-card"><h3>Cotton</h3><p>Soft, airy, and easy—ideal for everyday kurtis and relaxed silhouettes.</p></article>
    <article class="breezy-fabric-card"><h3>Crepe</h3><p>Lightweight texture that skims the body with a refined matte finish.</p></article>
    <article class="breezy-fabric-card"><h3>Viscose</h3><p>Fluid drape with a gentle hand—perfect for travel-friendly pieces.</p></article>
    <article class="breezy-fabric-card"><h3>Georgette</h3><p>Sheer structure with graceful flow for layered and Indo-western looks.</p></article>
  </div>
</div>
"""

INSTAGRAM_LIQUID = r"""
<div class="breezy-instagram-cta">
  <h2>On Instagram</h2>
  <p>Follow <a href="https://www.instagram.com/breezy_weaves" target="_blank" rel="noopener">@breezy_weaves</a> for new drops, styling ideas, and behind-the-scenes.</p>
  <a class="button" href="https://www.instagram.com/breezy_weaves" target="_blank" rel="noopener">View on Instagram</a>
  <p class="breezy-instagram-cta__note">Tip: add an Instagram sales channel app later for a live feed.</p>
</div>
"""


def main() -> None:
    raw = PATH.read_text()
    _, body = raw.split("*/", 1)
    data = json.loads(body.strip())

    hero = data["sections"]["hero_jVaWmY"]
    hero["blocks"]["text_YLPk4p"]["settings"].update(
        {
            "text": "<p>Woven in silk and stillness</p>",
            "type_preset": "h1",
            "font": "var(--font-heading--family)",
            "font_size": "",
            "alignment": "center",
            "width": "100%",
        }
    )
    hero["blocks"]["button_H9gpTf"]["settings"].update(
        {
            "label": "Shop the collection",
            "style_class": "button",
        }
    )
    hero["settings"].update(
        {
            "color_scheme": "scheme-6",
            "overlay_color": "#3D151099",
            "horizontal_alignment_flex_direction_column": "center",
            "section_height": "large",
        }
    )

    sections = {
        "hero_jVaWmY": hero,
        "collection_grid_breezy": collection_list_section(),
        "product_list_new_arrivals": product_list_section(
            "product_list_new_arrivals",
            "<h3>New arrivals</h3>",
            8,
            4,
            True,
            32,
        ),
        "product_list_bestsellers": product_list_section(
            "product_list_bestsellers",
            "<h3>Bestsellers</h3>",
            4,
            4,
            False,
            24,
        ),
        "custom_fabric_story": custom_liquid_section(
            "Our fabrics",
            FABRIC_LIQUID,
            "scheme-1",
            32,
            40,
        ),
        "custom_instagram_cta": custom_liquid_section(
            "Instagram",
            INSTAGRAM_LIQUID,
            "scheme-2",
            24,
            56,
        ),
    }

    out = {
        "sections": sections,
        "order": [
            "hero_jVaWmY",
            "collection_grid_breezy",
            "product_list_new_arrivals",
            "product_list_bestsellers",
            "custom_fabric_story",
            "custom_instagram_cta",
        ],
    }

    PATH.write_text(HEADER + json.dumps(out, indent=2) + "\n")
    print("Wrote", PATH)


if __name__ == "__main__":
    main()
