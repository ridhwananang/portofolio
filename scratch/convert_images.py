import os
from PIL import Image

image_dir = r"c:\Users\An\Herd\portofolio\public\images"
converted_count = 0

for filename in os.listdir(image_dir):
    filepath = os.path.join(image_dir, filename)
    if os.path.isdir(filepath):
        continue
    
    name, ext = os.path.splitext(filename)
    ext = ext.lower()
    
    if ext in ['.png', '.jpg', '.jpeg']:
        try:
            # Skip backup files
            if name.endswith('_backup'):
                continue
                
            img = Image.open(filepath)
            
            # Convert RGBA to RGB if saving as JPEG (WebP supports RGBA so this is fine, but good to know)
            output_filename = f"{name}.webp"
            output_filepath = os.path.join(image_dir, output_filename)
            
            # Save as webp with 80% quality
            img.save(output_filepath, 'WEBP', quality=80, optimize=True)
            
            # Get sizes
            old_size = os.path.getsize(filepath)
            new_size = os.path.getsize(output_filepath)
            
            print(f"Converted {filename} ({old_size/1024:.1f} KB) -> {output_filename} ({new_size/1024:.1f} KB) - Saved {(old_size - new_size)/1024:.1f} KB ({(old_size-new_size)/old_size*100:.1f}%)")
            converted_count += 1
            
            # Delete original if it's one of the main project/avatar assets to free up space
            # but keep me.jpeg as a fallback
            if filename != 'me.jpeg':
                os.remove(filepath)
                print(f"Removed original: {filename}")
                
        except Exception as e:
            print(f"Error converting {filename}: {e}")

print(f"Done! Converted {converted_count} images.")
