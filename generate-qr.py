"""Run with qrcode and Pillow installed; optional argument changes menu URL."""
from pathlib import Path
import sys,qrcode
from PIL import Image,ImageDraw,ImageFont
root=Path(__file__).resolve().parents[1]
url=sys.argv[1] if len(sys.argv)>1 else 'https://sateku-grill-rasa.diligentwillow4.chatgpt.site/#menu'
assets=root/'dist/assets';assets.mkdir(parents=True,exist_ok=True)
qr=qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M,box_size=22,border=4)
qr.add_data(url);qr.make(fit=True)
image=qr.make_image(fill_color='#171717',back_color='white').convert('RGB');image.save(assets/'QR-Menu-SATEKU.png')
W,H=1240,1754
poster=Image.new('RGB',(W,H),'#faf5eb');d=ImageDraw.Draw(poster)
fontroot=Path('/usr/share/fonts/truetype/dejavu')
def font(size,bold=False):return ImageFont.truetype(str(fontroot/('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf')),size)
def text_center(y,text,size,color='#171717',bold=False):
 f=font(size,bold);box=d.textbbox((0,0),text,font=f);d.text(((W-box[2])/2,y),text,font=f,fill=color)
d.rectangle((0,0,W,330),fill='#191a17');text_center(72,'SATEKU',110,'#faf5eb',True);text_center(215,'GRILL & STREET FOOD',23,'#f57527',True)
text_center(385,'LAPAR?',83,bold=True);text_center(490,'TINGGAL SCAN.',83,'#e76820',True)
text_center(625,'Menu makanan & minuman favoritmu,',27,'#7a684e');text_center(670,'langsung dari kamera HP.',27,'#7a684e')
# Nearest-neighbour resizing preserves sharp modules and the full quiet zone.
size=650
qrprint=image.resize((size,size),Image.Resampling.NEAREST);poster.paste(qrprint,((W-size)//2,745))
text_center(1430,'SCAN UNTUK PILIH MENU',25,bold=True)
text_center(1500,'1. Scan QR     2. Pilih menu     3. Susun pesanan',23,'#79674e')
text_center(1580,'QR MENU WEBSITE - BUKAN QRIS PEMBAYARAN',19,'#a35b29',True)
text_center(1620,'Pembayaran QRIS diperiksa dan dikonfirmasi oleh kasir.',18,'#8d7b62')
poster.save(assets/'Poster-QR-SATEKU.pdf','PDF',resolution=150)
print('QR points to:',url)
print('QR size:',image.size,'PDF:',(assets/'Poster-QR-SATEKU.pdf').stat().st_size)
