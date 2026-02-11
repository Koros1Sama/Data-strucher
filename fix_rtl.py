"""Fix dir=ltr to dir=rtl and lang=en to lang=ar in all topic and module HTML files."""
import os
import glob

base = r"D:\الجامعة\anti final\Data strucher\Data-strucher"
patterns = [
    os.path.join(base, "topics", "*.html"),
    os.path.join(base, "modules", "**", "*.html"),
]

count = 0
for pattern in patterns:
    for filepath in glob.glob(pattern, recursive=True):
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        if 'dir="ltr"' in content or "lang=\"en\"" in content:
            new_content = content.replace('<html lang="en" dir="ltr">', '<html lang="ar" dir="rtl">')
            if new_content != content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                count += 1
                print(f"  ✅ {os.path.basename(filepath)}")

print(f"\n🎯 Fixed {count} files total!")
