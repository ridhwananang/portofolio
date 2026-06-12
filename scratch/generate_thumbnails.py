import os
import fitz  # PyMuPDF
from PIL import Image

cert_dir = r"c:\Users\An\Herd\portofolio\public\images\Sertifikat"
thumb_dir = os.path.join(cert_dir, "thumbnails")

if not os.path.exists(thumb_dir):
    os.makedirs(thumb_dir)
    print(f"Created thumbnails directory: {thumb_dir}")

converted_count = 0

for filename in os.listdir(cert_dir):
    filepath = os.path.join(cert_dir, filename)
    if os.path.isdir(filepath) or not filename.lower().endswith('.pdf'):
        continue
    
    name, _ = os.path.splitext(filename)
    output_filename = f"{name}.webp"
    output_filepath = os.path.join(thumb_dir, output_filename)
    
    # Skip if already exists
    if os.path.exists(output_filepath):
        print(f"Thumbnail already exists for {filename}, skipping.")
        converted_count += 1
        continue
        
    try:
        # Open PDF
        doc = fitz.open(filepath)
        page = doc.load_page(0)  # Load first page
        
        # Render page to a pixmap (image)
        # 150 DPI is plenty for a small thumbnail preview card
        zoom = 150 / 72
        mat = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=mat)
        
        # Convert pixmap to PIL Image
        # format is RGBA, convert to RGB
        img_data = pix.tobytes("png")
        img = Image.open(fitz.io.BytesIO(img_data)).convert("RGB")
        
        # Save as WebP
        img.save(output_filepath, 'WEBP', quality=85, optimize=True)
        
        pdf_size = os.path.getsize(filepath)
        webp_size = os.path.getsize(output_filepath)
        
        print(f"Rendered {filename} ({pdf_size/1024:.1f} KB) -> thumbnails/{output_filename} ({webp_size/1024:.1f} KB) - Saved {(pdf_size - webp_size)/1024:.1f} KB ({(pdf_size-webp_size)/pdf_size*100:.1f}%)")
        converted_count += 1
        doc.close()
    except Exception as e:
        print(f"Error rendering PDF thumbnail for {filename}: {e}")

print(f"Done! Processed {converted_count} certificate thumbnails.")
