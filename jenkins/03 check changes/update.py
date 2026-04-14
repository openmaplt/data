import requests
import psycopg2
from psycopg2 import extras
from lxml import etree
import datetime

# --- Configuration & Data Sets ---
DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 5432,
    "dbname": "osm",
    "user": "osm"
}

# Use sets for fast O(1) lookups instead of long if/else chains
APPROVED_AUTHORS = {
    "Tomas Straupis", "ieskok", "Witska", "richmondas", "wheelmap_visitor",
    "pauliusz", "irasesu", "Dirbam", "Vitalka", "gedzoox", "skystis", "kebil",
    "mindedie", "Kazbek", "pvx123", "Matas Ramoška", "Runis", "Aidas Kasparas",
    "sirexmantas", "Kaukas", "JuliusG", "Koolp", "importLT", "Mantaz",
    "klimakas", "Jurkis", "JustPats", "stasas", "sauls", "svinariezas",
    "Aurimas Fišeras", "cicka", "AndroidLT", "Algirdas Straupis", "Kontis",
    "Rolis666", "HuntersX", "Algiux", "TheEdvinazard", "Litawor", "EdvinasJ_LT",
    "Snaiperis", "Adm??n", "gviken", "empers", "SilvereX", "Bravo_two_zer0",
    "DaanLT", "rusjanis", "AMDmi3", "Zbigniew_Czernik", "malcolmh", "Manu1400",
    "beweta", "parukhin", "Sierz_Kr", "pawka007", "adjuva", "Sneikeris",
    "Amberis", "victorenator", "Kristaps Grundsteins", "editor88", "ygcgjp5",
    "Talkless", "rosomak", "Vaidotas", "DodoGTA"
}

APPROVED_COMMENTS = {
    "Add footway path surfaces",
    "Add material information to benches",
    "Add whether public transport stops are lit",
    "Determine information board names",
    "Determine on which level shops are in a building",
    "Determine the heights of kerbs",
    "Determine the heights of kerbs at crossings",
    "Determine roads lane count",
    "Determine road widths",
    "Determine whether ATM allows depositing cash",
    "Determine whether amenities are inside buildings",
    "Determine whether any glass or just glass bottles can be recycled here",
    "Determine whether building construction is now completed",
    "Specify access to playgrounds",
    "Specify bicycle parking capacities",
    "Specify bicycle parkings covers",
    "Specify bicycle parking types",
    "Specify board types",
    "Specify bollard types",
    "Specify bridge structures",
    "Specify building and roof levels",
    "Specify building colour",
    "Specify building types",
    "Specify charging station operators",
    "Specify charging stations capacities",
    "Specify clothing bin operators",
    "Specify cycleway path surfaces",
    "Specify cycleways width",
    "Specify drinking water types",
    "Specify fire hydrant positions",
    "Specify fire hydrant types",
    "Specify how roads and barriers intersect",
    "Specify leaf types",
    "Specify maximum allowed weights",
    "Specify maximum heights",
    "Specify memorial types",
    "Specify parcel locker brand",
    "Specify parking access",
    "Specify parking types",
    "Specify paths smoothness",
    "Specify path surfaces",
    "Specify pitch surfaces",
    "Specify railway crossing barriers type",
    "Specify religion for wayside shrines",
    "Specify road surfaces",
    "Specify road smoothness",
    "Specify roof shapes",
    "Specify sidewalk surfaces",
    "Specify step counts",
    "Specify surfaces",
    "Specify toilet fees",
    "Specify what can be recycled in recycling containers",
    "Specify wheelchair accessibility of toilets",
    "Specify whether bicycles can be charged at charging stations",
    "Specify whether crosswalks have tactile paving",
    "Specify whether kerbs have tactile paving",
    "Specify whether narrow roads are one-ways",
    "Specify whether parking requires a fee",
    "Specify whether pedestrian crossings have markings",
    "Specify whether pedestrian crossings have traffic signals",
    "Specify whether pedestrian crossings have islands",
    "Specify whether pitches are lit",
    "Specify whether place provides internet access",
    "Specify whether places take fees to visit",
    "Specify whether public transport stops have benches",
    "Specify whether public transport stops have bins",
    "Specify whether public transport stops have shelters",
    "Specify whether public transport stops have tactile paving",
    "Specify whether roads are prohibited for pedestrians",
    "Specify whether roads have sidewalks",
    "Specify whether roads have lane markings",
    "Specify whether steps have handrails",
    "Specify whether steps have a ramp",
    "Specify whether there are crossings at intersections of paths and roads",
    "Specify whether there are cycleways",
    "Specify whether there are showers available at camp site",
    "Specify whether there is drinking water at camp or caravan site",
    "Specify whether there is electricity available at camp or caravan site",
    "Specify whether traffic signals have a button for pedestrians",
    "Specify whether traffic signals have tactile indications that its safe to cross",
    "Specify whether traffic signals have tactile indications that it's safe to cross",
    "Specify whether traffic signals have sound signals",
    "Specify whether ways are lit",
    "Specify which way leads up for steps",
    "Specify width of opening",
    "Survey availability of air compressors",
    "Survey availability of air conditioning",
    "Survey buildings",
    "Survey hairdressers customers",
    "Survey if places still exist",
    "Survey if places (shops and other shop-like) still exist",
    "Survey opening hours",
    "Survey small map features",
    "Survey tactile paving on steps",
    "Survey toilet availabilities",
    "Survey wheelchair accessibility of places",
    "Survey wheelchair accessibility of public transport platforms",
    "Survey whether benches have armrests",
    "Survey whether benches have backrests",
    "Survey whether payment with cards is accepted",
    "Survey whether places have seating",
    "Survey whether places have vegetarian food"
}

FOREIGN_AUTHORS = {
    "Piotr99", "Zbigniew_Czernik", "sasha-3003", "Arhemed", "Arvis L?cis",
    "ok1", "iWowik", "arco", "konradb4", "Dotevo", "Kositrawa", "pAnda71",
    "koszatek", "arturp", "szamanek", "RoboD", "reg60_dedovichi", "trolleway",
    "Yury Yatsynovich", "mixdm", "Oklums", "Raitisx", "rusjanis", "victorenator",
    "malenki", "Polimerek", "ulil", "wheelmap_android", "walserberg", "i29",
    "Sierz", "beweta", "Sierz_Kr", "pawka007", "adjuva", "Kristaps Grundsteins",
    "AMDmi3", "rosomak"
}

def main():
    # 1. Fetch the RSS Feed
    url = "http://www.openstreetmap.org/history/feed/?bbox=20.9,53.95,26.83,56.45"
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
    except Exception as e:
        print(f"Error fetching RSS: {e}")
        return

    # 2. Parse XML
    # Note: Using lxml to handle namespaces easily
    root = etree.fromstring(response.content)
    ns = {
        'atom': 'http://www.w3.org/2005/Atom',
        'georss': 'http://www.georss.org/georss'
    }

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        for entry in root.xpath('//atom:entry', namespaces=ns):
            # Extract basic data
            full_id = entry.xpath('atom:id/text()', namespaces=ns)[0]
            changeset_id = int(full_id.split('/')[-1])
            author = entry.xpath('atom:author/atom:name/text()', namespaces=ns)[0]
            comment = entry.xpath('atom:title/text()', namespaces=ns)[0]
            box_text = entry.xpath('georss:box/text()', namespaces=ns)[0]
            coords = [float(x) for x in box_text.split()] # [y1, x1, y2, x2]

            # Logic Check: Exists?
            cur.execute("SELECT count(1) as c FROM patrulis.pt_changesets WHERE id = %s", (changeset_id,))
            row = cur.fetchone()
            if row and row['c'] > 0:
                continue

            # Approval Logic
            approved = 0
            approve_date = None

            comment_cut = comment[22:] if len(comment) > 22 else ""

            if author in APPROVED_AUTHORS or comment_cut in APPROVED_COMMENTS:
                approved = 1
                approve_date = datetime.datetime.now()

            # Foreigner Logic
            uzsienis = 1 if author in FOREIGN_AUTHORS else 0

            # Spatial Logic (Intersection with Lithuania)
            x1, y1, x2, y2 = coords[1], coords[0], coords[3], coords[2]
            if x1 == x2 and y1 == y2:
                x2 += 0.00001
                y2 += 0.00001

            poly_wkt = f'SRID=4326;POLYGON(({x2} {y1}, {x2} {y2}, {x1} {y2}, {x1} {y1}, {x2} {y1}))'

            cur.execute("""
                SELECT count(1) as c FROM planet_osm_polygon
                WHERE name = 'Lietuva'
                  AND admin_level IS NOT NULL
                  AND osm_id = -72596
                  AND ST_Intersects(ST_Transform(way, 4326), ST_MakeValid(ST_GeomFromEWKT(%s)))
            """, (poly_wkt,))
            spatial_row = cur.fetchone()
            ccc = spatial_row['c'] if spatial_row else 0

            if ccc == 0:
                uzsienis = 2
                approved = 1
                approve_date = datetime.datetime.now()

            # Size Logic
            plotis = abs(coords[2] - coords[0])
            aukstis = abs(coords[3] - coords[1])
            didelis = 1 if (plotis > 1 or aukstis > 1) else 0

            # 3. Insert Record
            print(changeset_id)
            cur.execute("""
                INSERT INTO patrulis.pt_changesets (
                    id, user_name, approved, autoaproved, approve_date, didelis, comment, uzsienis
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (changeset_id, author, approved, approved, approve_date, didelis, comment, uzsienis))

            # Trigger user update if applicable
            if didelis == 0 and uzsienis == 0:
                cur.execute("SELECT patrulis.pt_update_user(%s)", (author,))

        # 4. Global Status Update
        cur.execute("SELECT patrulis.pt_update_status()")

        # 5. Request Analysis for one pending changeset
        cur.execute("""
            SELECT id FROM patrulis.pt_changesets
            WHERE requested IS NULL AND approved = 0 AND autoaproved = 0 
            AND didelis = 0 AND uzsienis = 0 
            ORDER BY id LIMIT 1
        """)
        row = cur.fetchone()
        if row:
            print(f"Requesting analysis for {row['id']}")
            try:
                requests.get(f"https://osmhistory.openmap.lt/changeset/{row['id']}", timeout=10)
                cur.execute("UPDATE patrulis.pt_changesets SET requested = 1 WHERE id = %s", (row['id'],))
            except Exception as e:
                print(f"Cloud analysis request failed: {e}")

        conn.commit()
        cur.close()
        conn.close()

    except Exception as e:
        print(f"Database error: {e}")

if __name__ == "__main__":
    main()
