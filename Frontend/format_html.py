from bs4 import BeautifulSoup
from pathlib import Path
import glob

files = glob.glob('*.html') + glob.glob('pages/*.html')
print(f'Found {len(files)} html files')
for p in files:
    path = Path(p)
    text = path.read_text(encoding='utf-8')
    soup = BeautifulSoup(text, 'html.parser')
    path.write_text(soup.prettify(), encoding='utf-8')
    print('Formatted', p)
