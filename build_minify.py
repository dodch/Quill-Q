import re
import os

def minify_css(css_text):
    # Remove comments
    css_text = re.sub(r'/\*[\s\S]*?\*/', '', css_text)
    # Remove whitespace around symbols
    css_text = re.sub(r'\s*([\{\}:;,>~+])\s*', r'\1', css_text)
    # Collapse multiple whitespaces
    css_text = re.sub(r'\s+', ' ', css_text)
    # Remove trailing semicolons in blocks
    css_text = re.sub(r';\}', '}', css_text)
    return css_text.strip()

def minify_js(js_text):
    # Safe comment stripping: remove block comments
    js_text = re.sub(r'/\*[\s\S]*?\*/', '', js_text)
    # Remove standalone full-line comments
    lines = []
    for line in js_text.splitlines():
        stripped = line.strip()
        if stripped.startswith('//'):
            continue
        lines.append(line)
    text = '\n'.join(lines)
    # Collapse multiple blank lines
    text = re.sub(r'\n\s*\n', '\n', text)
    return text.strip()

def run():
    print("--- Minifying assets ---")
    if os.path.exists("styles.css"):
        with open("styles.css", "r", encoding="utf-8") as f:
            raw_css = f.read()
        min_css = minify_css(raw_css)
        with open("styles.min.css", "w", encoding="utf-8") as f:
            f.write(min_css)
        print(f"styles.css ({len(raw_css)/1024:.1f} KB) -> styles.min.css ({len(min_css)/1024:.1f} KB) [Saved {((len(raw_css)-len(min_css))/len(raw_css))*100:.1f}%]")

    if os.path.exists("app.js"):
        with open("app.js", "r", encoding="utf-8") as f:
            raw_js = f.read()
        min_js = minify_js(raw_js)
        with open("app.min.js", "w", encoding="utf-8") as f:
            f.write(min_js)
        print(f"app.js ({len(raw_js)/1024:.1f} KB) -> app.min.js ({len(min_js)/1024:.1f} KB) [Saved {((len(raw_js)-len(min_js))/len(raw_js))*100:.1f}%]")

if __name__ == "__main__":
    run()
