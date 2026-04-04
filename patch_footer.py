import sys
import re

file_path = r'c:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\frontend\src\components\layout\Footer.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add useSiteContent import
content = content.replace(
    \"import axios from 'axios';\",
    \"import axios from 'axios';\\nimport { useSiteContent } from '../../context/SiteContentContext';\"
)

# Extract globalContent
content = content.replace(
    \"  const [email, setEmail] = useState('');\",
    \"  const { globalContent = {} } = useSiteContent() || {};\\n  const [email, setEmail] = useState('');\"
)

# Update footerLinks to use globalContent or fallback
content = content.replace(
    \"\"\"  const footerLinks = {
    shop: [
      { name: 'DROP 01', path: '/shop' },
      { name: 'TOPS', path: '/shop?category=TOPS' },
      { name: 'HEADWEAR', path: '/shop?category=HEADWEAR' },
      { name: 'OUTERWEAR', path: '/shop?category=OUTERWEAR' },
    ],
    brand: [
      { name: 'PHILOSOPHY', path: '/philosophy' },
      { name: 'THE BOOK', path: '/philosophy' },
    ],
  };\"\"\",
    \"\"\"  const footerLinks = {
    shop: globalContent.footer_shop_links?.length ? globalContent.footer_shop_links.map(l => ({ name: l.label, path: l.path, external: l.external })) : [
      { name: 'DROP 01', path: '/shop' },
      { name: 'TOPS', path: '/shop?category=TOPS' },
      { name: 'HEADWEAR', path: '/shop?category=HEADWEAR' },
      { name: 'OUTERWEAR', path: '/shop?category=OUTERWEAR' },
    ],
    brand: globalContent.footer_brand_links?.length ? globalContent.footer_brand_links.map(l => ({ name: l.label, path: l.path, external: l.external })) : [
      { name: 'PHILOSOPHY', path: '/philosophy' },
      { name: 'THE BOOK', path: globalContent.book_url || '/philosophy' },
    ],
  };\"\"\"
)

# Update descriptions
content = content.replace(
    \"Vestir la transformación de quienes eligieron enfrentar su arena.\",
    \"{globalContent.footer_description || 'Vestir la transformación de quienes eligieron enfrentar su arena.'}\"
)
content = content.replace(
    \"Sé el primero en conocer los nuevos drops y la filosofía LXI.\",
    \"{globalContent.newsletter_text || 'Sé el primero en conocer los nuevos drops y la filosofía LXI.'}\"
)
content = content.replace(
    \"ENTER THE ARENA\",
    \"{globalContent.newsletter_title || 'ENTER THE ARENA'}\"
)
content = content.replace(
    \"<p className=\\\"text-[#8a8a8a] text-xs tracking-[0.2em]\\\">\\n            FOUNDERS EDITION MMXXVI\\n          </p>\",
    \"<p className=\\\"text-[#8a8a8a] text-xs tracking-[0.2em]\\\">\\n            {globalContent.footer_badge_text || 'FOUNDERS EDITION MMXXVI'}\\n          </p>\"
)
content = content.replace(
    \"{new Date().getFullYear()} LXI. All rights reserved.\",
    \"{new Date().getFullYear()} {globalContent.logo_text || 'LXI'}. {globalContent.footer_bottom_text || 'All rights reserved.'}\"
)

# Update hrefs for social
content = content.replace(
    'href=\"https://instagram.com\"',
    'href={globalContent.instagram_url || \"https://instagram.com\"}'
)
content = content.replace(
    'href=\"https://tiktok.com\"',
    'href={globalContent.tiktok_url || \"https://tiktok.com\"}'
)

# Add conditional external handling to links map
content = content.replace(
    \"\"\"                {footerLinks.shop.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className=\"footer-link hover:text-[#d4af37] transition-colors duration-300\"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}\"\"\",
    \"\"\"                {footerLinks.shop.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a href={link.path} target=\"_blank\" rel=\"noopener noreferrer\" className=\"footer-link hover:text-[#d4af37] transition-colors duration-300\">
                        {link.name}
                      </a>
                    ) : (
                      <Link to={link.path} className=\"footer-link hover:text-[#d4af37] transition-colors duration-300\">
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}\"\"\"
)

content = content.replace(
    \"\"\"                {footerLinks.brand.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className=\"footer-link hover:text-[#d4af37] transition-colors duration-300\"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}\"\"\",
    \"\"\"                {footerLinks.brand.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a href={link.path} target=\"_blank\" rel=\"noopener noreferrer\" className=\"footer-link hover:text-[#d4af37] transition-colors duration-300\">
                        {link.name}
                      </a>
                    ) : (
                      <Link to={link.path} className=\"footer-link hover:text-[#d4af37] transition-colors duration-300\">
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}\"\"\"
)


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(\"Footer.js patched successfully\")
