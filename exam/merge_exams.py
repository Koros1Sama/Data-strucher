import re
import os

# Define paths
base_dir = r"d:\الجامعة\anti final\Data strucher\Data-strucher\exam"
files = [
    "Whatsapp_exam.html",
    "second_whatsapp_exam.html", 
    "third_whatsapp_exam.html"
]
output_filename = "combined_whatsapp_exam.html"

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

# 1. Read the first file to use as a template (Header + Structure)
template_content = read_file(os.path.join(base_dir, files[0]))

# 2. Extract Header (everything before `const examData = [`)
header_match = re.search(r'(.*?)const examData = \[', template_content, re.DOTALL)
if not header_match:
    print("Error: Could not find 'const examData = [' in the first file.")
    exit(1)
header = header_match.group(1)

# 3. Extract Footer (everything after `];` at the end of examData)
# We look for the closing `];` of the examData array.
footer_match = re.search(r'(\s*\];\s*</script>.*)', template_content, re.DOTALL)
if not footer_match:
    # Try finding just `];` if strict match fails
    footer_match = re.search(r'\];(\s*<script.*)', template_content, re.DOTALL)
    
if not footer_match:
        print("Error: Could not find footer (]; ... ) in the first file.")
        # Fallback: take everything after the last `];`
        footer = template_content.split('];')[-1]
        if not footer.strip():
             print("Warning: Footer seems empty.")
else:
    footer = footer_match.group(1) 
    # If using the group(1) from `(\s*\];\s*</script>.*)` it includes `];`. 
    # We want to construct `const examData = [ ... ];` manually, so we should exclude `];` from footer if we add it back ourselves.
    # The regex `(\s*\];\s*</script>.*)` captures `];` inside.
    # Let's cleanly separate.
    footer = footer.replace('];', '', 1) # Remove the first occurrence (which is the closing of examData)

# 4. Extract and Merge Questions
merged_fs_data = []
current_id = 1

print("Starting merge process...")

for filename in files:
    path = os.path.join(base_dir, filename)
    print(f"Processing {filename}...")
    content = read_file(path)
    
    # Extract the content INSIDE `const examData = [ ... ];`
    # We use disjoint regex to capture the array content.
    match = re.search(r'const examData = \[\s*([\s\S]*?)\s*\];', content)
    if not match:
        print(f"Warning: No examData found in {filename}")
        continue
        
    data_block = match.group(1)
    
    # Use Regex to iterate over each object keys "id: ..."
    # We assume standard formatting: `id: <number>,`
    # We will replace `id: <number>` with `id: <new_number>`
    
    # Simple substitution function
    def replace_id_match(m):
        global current_id
        # m.group(0) is the whole match "id: 123"
        new_str = f"id: {current_id}"
        current_id += 1
        return new_str

    # Only replace the ID property, being careful not to replace other things (unlikely with `id: \d+`)
    # We use re.sub with a function
    updated_block = re.sub(r'\bid:\s*\d+', replace_id_match, data_block)
    
    merged_fs_data.append(updated_block)

print(f"Total questions found: {current_id - 1}")

# 5. Construct New Content
# Join blocks with comma
combined_data_js = ",\n".join(merged_fs_data)
# Ensure clean commas if files didn't have trailing comma or had leading
# The merge might result in `... },\n { ...` which is good.

new_html_content = header + "const examData = [\n" + combined_data_js + "\n];" + footer

# 6. Update HTML Titles and Texts to reflect "Combined Exam"
new_html_content = new_html_content.replace("نموذج واتساب (1)", "شامل نماذج الواتساب (1+2+3)")
new_html_content = new_html_content.replace("<title>نموذج واتساب (1) | PL/SQL & Database Systems</title>", "<title>شامل نماذج الواتساب (120 سؤال) | PL/SQL & Database Systems</title>")

# Update the header texts
# Title
new_html_content = re.sub(r'<h1>📝.*?</h1>', '<h1>📝 شامل نماذج الواتساب (1+2+3)</h1>', new_html_content)
# Badge/Grade
new_html_content = re.sub(r'<span class="exam-grade">.*?</span>', '<span class="exam-grade">✨ الدرجة: 120</span>', new_html_content)
# Meta info if exists (e.g. university name etc, leave as is)

# 7. Write Output
output_path = os.path.join(base_dir, output_filename)
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(new_html_content)

print(f"Successfully created: {output_path}")
