"""Holt das aktuelle Lawinenbulletin des SLF (Open Data, CC BY 4.0) und die EAWS-Warnregionen
und schreibt eine kompakte Datei data/lawinen.json für die Website."""
import json, sys, urllib.request, datetime

UA = {"User-Agent": "skitourensuche-schulprojekt (GitHub Actions)"}
BULLETIN_URLS = [
    "https://aws.slf.ch/api/bulletin/caaml/de/json",
    "https://aws.slf.ch/api/bulletin/caaml/de/geojson",
]
REGION_URLS = [
    "https://regions.avalanches.org/micro-regions/CH_micro-regions.geojson.json",
    "https://raw.githubusercontent.com/eaws/eaws-regions/master/public/micro-regions/CH_micro-regions.geojson.json",
    "https://raw.githubusercontent.com/eaws/eaws-regions/main/public/micro-regions/CH_micro-regions.geojson.json",
]
BBOX = (9.15, 46.25, 10.35, 47.45)  # lon/lat: Alpstein bis Engadin
LEVEL = {"low": 1, "moderate": 2, "considerable": 3, "high": 4, "very_high": 5}

def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))

def first_ok(urls, what):
    for u in urls:
        try:
            d = get(u)
            print(f"OK {what}: {u}")
            return u, d
        except Exception as e:
            print(f"FEHLER {what}: {u} -> {e}")
    return None, None

def text(x):
    if isinstance(x, str): return x.strip()
    if isinstance(x, dict): return (x.get("comment") or x.get("highlights") or "").strip()
    return ""

def bulletins_of(d):
    if isinstance(d, dict) and isinstance(d.get("bulletins"), list): return d["bulletins"]
    if isinstance(d, dict) and d.get("type") == "FeatureCollection":
        out = []
        for f in d.get("features", []):
            p = f.get("properties", {})
            out.append(p.get("bulletin", p))
        return out
    if isinstance(d, list): return d
    return []

def simplify(ring, tol=0.0015):
    if len(ring) < 8: return ring
    out = [ring[0]]
    for p in ring[1:-1]:
        q = out[-1]
        if abs(p[0] - q[0]) > tol or abs(p[1] - q[1]) > tol: out.append(p)
    out.append(ring[-1])
    return [[round(x, 4), round(y, 4)] for x, y in out]

def main():
    burl, bd = first_ok(BULLETIN_URLS, "Bulletin")
    if bd is None: sys.exit("Bulletin nicht erreichbar")
    bl = bulletins_of(bd)
    print("Top-Level:", list(bd.keys()) if isinstance(bd, dict) else type(bd).__name__, "| Bulletins:", len(bl))
    if bl: print("Schlüssel Bulletin[0]:", sorted(bl[0].keys())); print("Beispiel:", json.dumps(bl[0], ensure_ascii=False)[:1500])
    regions = {}
    for b in bl:
        ratings = []
        for r in b.get("dangerRatings", []) or []:
            el = r.get("elevation") or {}
            ratings.append({"level": LEVEL.get(r.get("mainValue"), 0), "value": r.get("mainValue"),
                            "lower": el.get("lowerBound"), "upper": el.get("upperBound"),
                            "time": r.get("validTimePeriod")})
        problems = []
        for p in b.get("avalancheProblems", []) or []:
            el = p.get("elevation") or {}
            problems.append({"type": p.get("problemType"), "aspects": p.get("aspects") or [],
                             "lower": el.get("lowerBound"), "upper": el.get("upperBound")})
        act = b.get("avalancheActivity") or {}
        info = {"id": b.get("bulletinID"), "max": max([x["level"] for x in ratings] or [0]),
                "ratings": ratings, "problems": problems,
                "highlights": text(act.get("highlights")) if isinstance(act, dict) else "",
                "comment": text(act.get("comment")) if isinstance(act, dict) else "",
                "snowpack": text(b.get("snowpackStructure")),
                "valid": b.get("validTime"), "published": b.get("publicationTime"), "next": b.get("nextUpdate")}
        for reg in b.get("regions", []) or []:
            rid = reg.get("regionID") or reg.get("id")
            if not rid: continue
            prev = regions.get(rid)
            if prev is None or info["max"] > prev["max"]:
                regions[rid] = dict(info, name=reg.get("name"))
    print("Regionen im Bulletin:", len(regions), "Beispiel-IDs:", sorted(regions)[:8])
    rurl, rd = first_ok(REGION_URLS, "Regionen")
    feats = []
    if rd:
        for f in rd.get("features", []):
            rid = (f.get("properties") or {}).get("id") or f.get("id")
            g = f.get("geometry") or {}
            polys = g.get("coordinates") or []
            if g.get("type") == "Polygon": polys = [polys]
            rings = []
            inside = False
            for poly in polys:
                outer = poly[0] if poly else []
                if any(BBOX[0] <= x <= BBOX[2] and BBOX[1] <= y <= BBOX[3] for x, y in outer[:: max(1, len(outer) // 50)]):
                    inside = True
                rings.append([simplify(outer)])
            if inside and rid: feats.append({"id": rid, "poly": rings})
        print("Regionen-Polygone im Kartengebiet:", len(feats), "| mit Bulletin:", sum(1 for f in feats if f["id"] in regions))
    out = {"source": "WSL-Institut für Schnee- und Lawinenforschung SLF", "license": "CC BY 4.0",
           "url": "https://www.slf.ch/de/lawinenbulletin-und-schneesituation/",
           "fetched": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="minutes"),
           "regions": regions, "polygons": feats}
    with open("data/lawinen.json", "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, separators=(",", ":"))
    print("geschrieben: data/lawinen.json")

main()
