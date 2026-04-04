import sys

file_path = r'c:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\frontend\src\pages\Admin.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    \"  instagram_url: 'https://instagram.com',\\n  tiktok_url: 'https://tiktok.com',\",
    \"  instagram_url: 'https://instagram.com',\\n  tiktok_url: 'https://tiktok.com',\\n  book_url: 'https://joseurbaneja.com',\"
)

content = content.replace(
    \"    footerShopLinksText: serializeLinks(content.footer_shop_links || [], true),\\n    footerBrandLinksText: serializeLinks(content.footer_brand_links || [], true),\",
    \"    footerShopLinksText: serializeLinks(content.footer_shop_links || [], true),\\n    footerBrandLinksText: serializeLinks(content.footer_brand_links || [], true),\\n    book_url: content.book_url || defaultGlobalForm.book_url,\"
)

content = content.replace(
    \"    instagram_url: form.instagram_url.trim(),\\n    tiktok_url: form.tiktok_url.trim(),\",
    \"    instagram_url: form.instagram_url.trim(),\\n    tiktok_url: form.tiktok_url.trim(),\\n    book_url: form.book_url.trim(),\"
)

content = content.replace(
    \"                ['instagram_url', 'Instagram URL'],\\n                ['tiktok_url', 'TikTok URL'],\\n                ['newsletter_title', 'Titulo newsletter'],\",
    \"                ['instagram_url', 'Instagram URL'],\\n                ['tiktok_url', 'TikTok URL'],\\n                ['book_url', 'Book URL (The Book)'],\\n                ['newsletter_title', 'Titulo newsletter'],\"
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Admin.js patched successfully.')
