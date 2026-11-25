"""Dessine les quatre compagnons originaux utilisés par les profils."""
from pathlib import Path
from PIL import Image, ImageDraw

out = Path(__file__).resolve().parents[1] / "public" / "images"
pals = [
    ("#fad8ad", "#c76b45", "#e99a56", "#f9deb6", "#673b39"),
    ("#dfd6f1", "#765e91", "#a387bc", "#f4e4c4", "#503b5b"),
    ("#d2eddf", "#65978a", "#9ac4aa", "#fff0d8", "#426458"),
    ("#e6ddf5", "#895c82", "#c893a4", "#f6dfc3", "#5b3e5d"),
]
for i, (bg, deep, light, cream, ink) in enumerate(pals):
    im = Image.new("RGB", (256, 256), bg)
    d = ImageDraw.Draw(im)
    d.ellipse((12, 12, 244, 244), fill=cream)
    d.ellipse((18, 18, 238, 238), fill=bg)
    d.ellipse((58, 191, 199, 224), fill=deep)
    if i == 0 or i == 3:
        d.polygon([(57,133),(45,45),(110,95),(148,95),(213,45),(199,134)],fill=deep)
        d.polygon([(62,111),(57,59),(98,99)],fill=light)
        d.polygon([(194,111),(201,59),(160,99)],fill=light)
        d.rounded_rectangle((47,87,209,204), radius=65, fill=light, outline=deep, width=5)
    elif i == 2:
        d.rounded_rectangle((68,31,111,131), radius=20, fill=deep)
        d.rounded_rectangle((145,19,188,132), radius=20, fill=deep)
        d.rounded_rectangle((79,43,102,109), radius=11, fill="#e5ab99")
        d.rounded_rectangle((155,32,178,109), radius=11, fill="#e5ab99")
        d.ellipse((47,88,209,205), fill=light, outline=deep, width=5)
    else:
        d.polygon([(57,129),(51,64),(101,87),(150,87),(206,64),(201,130)],fill=deep)
        d.ellipse((46,74,210,217), fill=light, outline=deep, width=5)
        d.ellipse((64,95,133,182), fill=cream)
        d.ellipse((125,95,194,182), fill=cream)
    if i != 1:
        d.ellipse((53,132,130,196),fill=cream)
        d.ellipse((126,132,203,196),fill=cream)
        for x in (87,165):
            d.ellipse((x-11,151,x+11,163),fill="#e9a99a")
    for x in (95,161):
        d.ellipse((x-8,119,x+8,139),fill=ink)
        d.ellipse((x-4,120,x+1,126),fill="#fff7e8")
    d.polygon([(117,146),(139,146),(128,162 if i==1 else 156)],fill="#d49343" if i==1 else ink)
    if i != 1:
        d.arc((113,151,143,178), start=15, end=165, fill=ink, width=4)
    if i == 3:
        for x,f in ((67,1),(188,-1)):
            for y in (149,162):
                d.line((x,y,x-25*f,y-6), fill=ink, width=3)
    for x,y in ((61,184),(190,180),(116,97),(141,98)):
        d.ellipse((x,y,x+3,y+3),fill=cream)
    im.resize((120,120),Image.Resampling.LANCZOS).save(out / f"avatar-{i}.webp", quality=90, method=6)
