import os
from fpdf import FPDF

class CodePDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_font("Courier", "B", 8)
            self.set_text_color(100, 116, 139)
            # Use XPos and YPos for FPDF2 compatibility to avoid deprecation warnings
            self.cell(0, 10, "StreamTest AI - Complete Source Code Package", 0, new_x="LMARGIN", new_y="NEXT", align="R")
            self.line(10, 15, 200, 15)
            self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font("Courier", "I", 8)
        self.set_text_color(148, 163, 184)
        # Use XPos and YPos for FPDF2 compatibility to avoid deprecation warnings
        self.cell(0, 10, f"Page {self.page_no()}", 0, new_x="RIGHT", new_y="TOP", align="C")

def sanitize_for_pdf(text):
    # Mapping table for common unicode symbols to ASCII equivalents
    replacements = {
        "→": "->",
        "✓": "[OK]",
        "✔": "[OK]",
        "⚠": "[WARN]",
        "⚡": "[LOAD]",
        "🛡": "[SEC]",
        "🤖": "[AI]",
        "📡": "[STREAM]",
        "🔑": "[AUTH]",
        "💳": "[BILL]",
        "📊": "[STATS]",
        "⚙": "[ADMIN]",
        "🔔": "[ALERT]",
        "☀️": "[LIGHT]",
        "🌙": "[DARK]",
        "•": "*",
        "●": "*",
        "✖": "[FAIL]",
        "✗": "[FAIL]",
        "™": "(TM)",
        "®": "(R)",
        "©": "(C)",
        "°": "deg",
        "³": "^3",
        "²": "^2",
        "¹": "^1",
    }
    for orig, rep in replacements.items():
        text = text.replace(orig, rep)
    
    # Filter out any remaining characters outside latin-1 standard
    cleaned = []
    for char in text:
        if ord(char) < 256:
            cleaned.append(char)
        else:
            cleaned.append("?") # fallback for unknown characters
    return "".join(cleaned)

def generate_code_pdf():
    pdf = CodePDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    
    # 1. Add Cover Page
    pdf.add_page()
    pdf.set_font("Courier", "B", 24)
    pdf.set_text_color(99, 102, 241) # Primary color: #6366F1
    pdf.ln(50)
    pdf.cell(0, 15, "StreamTest AI", 0, new_x="LMARGIN", new_y="NEXT", align="C")
    
    pdf.set_font("Courier", "B", 12)
    pdf.set_text_color(139, 92, 246) # Secondary color: #8B5CF6
    pdf.cell(0, 10, "AI-POWERED TESTING & QUALITY ASSURANCE FOR LIVE STREAMING SYSTEMS", 0, new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(25)
    
    pdf.set_font("Courier", "", 9)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(0, 6, "Production configurations, Relational database schemas,", 0, new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.cell(0, 6, "Next.js 15 pages, and Interactive Sandbox APIs", 0, new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(35)
    
    pdf.set_text_color(71, 85, 105)
    pdf.cell(0, 10, "Compiled by Antigravity AI Assistant", 0, new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.cell(0, 5, "Formatted for GitHub Documentation", 0, new_x="LMARGIN", new_y="NEXT", align="C")
    
    # 2. List of target files in structured order
    base_dir = r"C:\Users\prabh\Downloads\streamtest-ai"
    files_list = [
        # Production Infrastructure Configurations
        "db/schema.sql",
        "Dockerfile",
        "docker-compose.yml",
        "k8s/deployment.yaml",
        "docs/ci-cd-pipelines.md",
        
        # Next.js Configs
        "package.json",
        "next.config.ts",
        "tsconfig.json",
        
        # Stylesheets & Base Layouts
        "src/app/globals.css",
        "src/app/layout.tsx",
        "src/components/layout-shell.tsx",
        
        # Core Dashboard Home
        "src/app/page.tsx",
        
        # Interactive Testing Modules
        "src/app/auth-portal/page.tsx",
        "src/app/auth-testing/page.tsx",
        "src/app/subscriptions-testing/page.tsx",
        "src/app/channels-testing/page.tsx",
        "src/app/streaming-testing/page.tsx",
        "src/app/ai-generator/page.tsx",
        "src/app/security-scanner/page.tsx",
        "src/app/load-tester/page.tsx",
        "src/app/admin-panel/page.tsx",
        "src/app/reports/page.tsx",
        
        # Sandbox API Routes
        "src/app/api/health/route.ts",
        "src/app/api/stream-engine/route.ts",
        "src/app/api/security-scan/route.ts",
        "src/app/api/load-test/route.ts",
        "src/app/api/ai-generator/route.ts"
    ]
    
    for relative_path in files_list:
        file_path = os.path.join(base_dir, relative_path.replace("/", os.sep))
        if not os.path.exists(file_path):
            print(f"Skipping missing file: {relative_path}")
            continue
            
        print(f"Processing: {relative_path}")
        pdf.add_page()
        
        # File header title
        pdf.set_font("Courier", "B", 11)
        pdf.set_text_color(99, 102, 241) # #6366F1
        pdf.cell(0, 8, f"File: {relative_path}", 0, new_x="LMARGIN", new_y="NEXT", align="L")
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(5)
        
        # Read file code contents
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            
        # Clean indentation tabs & sanitize character set for Courier
        content = content.replace("\t", "    ")
        content = sanitize_for_pdf(content)
        
        # Print monospaced text block with automated wrapping
        pdf.set_font("Courier", "", 7.5)
        pdf.set_text_color(15, 23, 42)
        pdf.multi_cell(0, 4, content, border=0, align="L")
        
    output_pdf_path = os.path.join(base_dir, "StreamTest_AI_Source_Code.pdf")
    pdf.output(output_pdf_path)
    print(f"PDF compiled at: {output_pdf_path}")

if __name__ == "__main__":
    generate_code_pdf()
