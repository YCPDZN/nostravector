"""Original, articulated Pontifex boss geometry; no image planes or external textures."""
from pathlib import Path
import json, math, struct

ROOT = Path(__file__).resolve().parents[1]
WORK, OUT = ROOT / 'work', ROOT / 'outputs'
PIVOTS = {'body': [0, 2.35, 0], 'head': [0, 3.38, 0],
          'leftArm': [-.72, 3.14, 0], 'rightArm': [.72, 3.14, 0],
          'leftLeg': [-.35, 1.83, 0], 'rightLeg': [.35, 1.83, 0],
          'weapon': [.14, 2.67, .66], 'cape': [0, 3.15, -.25]}
BLACK, VOID, STEEL, EDGE, RED, GLOW = '#17191f', '#090b10', '#2c3038', '#66676f', '#6f161e', '#ec3841'


def rgb(h):
    return [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]


def unit(v):
    length = math.hypot(*v)
    return [x / length for x in v] if length > 1e-12 else [0, 0, 1]


def cross(a, b):
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]


def signed(v, e):
    return math.copysign(abs(v) ** e, v)


def triangulate(poly):
    """Ear clipping allows the heart, crescent and torn cloth to be concave."""
    ids = list(range(len(poly)))
    if sum(poly[i][0] * poly[(i + 1) % len(poly)][1] - poly[(i + 1) % len(poly)][0] * poly[i][1] for i in ids) < 0:
        ids.reverse()
    triangles = []
    def turn(a, b, c):
        return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
    while len(ids) > 3:
        found = False
        for j, i in enumerate(ids):
            a, b, c = ids[j - 1], i, ids[(j + 1) % len(ids)]
            if turn(poly[a], poly[b], poly[c]) <= 1e-10:
                continue
            if any(k not in (a, b, c) and min(turn(poly[a], poly[b], poly[k]), turn(poly[b], poly[c], poly[k]), turn(poly[c], poly[a], poly[k])) >= -1e-10 for k in ids):
                continue
            triangles.extend([a, b, c]); ids.pop(j); found = True; break
        if not found:
            raise ValueError('Invalid polygon outline: ' + repr(poly))
    return triangles + ids


class Builder:
    def __init__(self):
        self.parts = []

    def add(self, name, p, n, indices, color, bone='body', emission=0):
        self.parts.append({'name': name, 'p': [round(v, 6) for vertex in p for v in vertex],
                           'n': [round(v, 7) for vertex in n for v in unit(vertex)], 'indices': indices,
                           'color': rgb(color), 'bone': bone, 'emission': emission})

    def oval(self, name, center, size, color, bone='body', e=1, rows=8, cols=16, emission=0):
        p, n, f = [], [], []
        for i in range(rows + 1):
            b = i / rows * math.pi
            for j in range(cols + 1):
                a = j / cols * math.tau
                q = [signed(math.sin(b), e) * signed(math.cos(a), e), signed(math.cos(b), e), signed(math.sin(b), e) * signed(math.sin(a), e)]
                p.append([center[k] + q[k] * size[k] for k in range(3)])
                n.append([signed(q[k], 2 / e - 1) / size[k] for k in range(3)])
        for i in range(rows):
            for j in range(cols):
                a = i * (cols + 1) + j; c = a + cols + 1
                f.extend([a, c, a + 1, a + 1, c, c + 1])
        self.add(name, p, n, f, color, bone, emission)

    def tube(self, name, points, radius, color, bone='body', sides=10, emission=0):
        p, n, f = [], [], []
        for j, c in enumerate(points):
            d = unit([points[min(j + 1, len(points) - 1)][k] - points[max(0, j - 1)][k] for k in range(3)])
            u = unit([0, -d[2], d[1]] if abs(d[0]) < .8 else [-d[2], 0, d[0]])
            v = cross(d, u); r = radius[j] if isinstance(radius, list) else radius
            for i in range(sides + 1):
                a = i / sides * math.tau
                q = [u[k] * math.cos(a) + v[k] * math.sin(a) for k in range(3)]
                p.append([c[k] + r * q[k] for k in range(3)]); n.append(q)
        for j in range(len(points) - 1):
            for i in range(sides):
                a = j * (sides + 1) + i; c = a + sides + 1
                f.extend([a, a + 1, c, a + 1, c + 1, c])
        # End caps are real geometry, so the exported asset has no open tube ends.
        for ring, reverse in [(0, True), (len(points) - 1, False)]:
            center = len(p); p.append(points[ring]); d = unit([points[1][k] - points[0][k] for k in range(3)] if reverse else [points[-1][k] - points[-2][k] for k in range(3)])
            n.append([-x for x in d] if reverse else d)
            for i in range(sides):
                a = ring * (sides + 1) + i
                f.extend([center, a + 1, a] if reverse else [center, a, a + 1])
        self.add(name, p, n, f, color, bone, emission)

    def poly(self, name, outline, z, thickness, color, bone='body', bevel=.025, emission=0):
        """Solid extruded polygon with an inset face and explicitly bevelled edges."""
        outline = [list(v) for v in outline]
        area = sum(outline[i][0] * outline[(i + 1) % len(outline)][1] - outline[(i + 1) % len(outline)][0] * outline[i][1] for i in range(len(outline)))
        if area < 0:
            outline.reverse()
        cx = sum(v[0] for v in outline) / len(outline); cy = sum(v[1] for v in outline) / len(outline)
        extent = max(math.hypot(v[0] - cx, v[1] - cy) for v in outline)
        factor = max(.8, 1 - bevel / extent)
        inset = [[cx + (v[0] - cx) * factor, cy + (v[1] - cy) * factor] for v in outline]
        p, n, f = [], [], []
        def face(vertices, normal):
            start = len(p); p.extend(vertices); n.extend([normal] * len(vertices)); f.extend([start, start + 1, start + 2])
            if len(vertices) == 4:
                f.extend([start, start + 2, start + 3])
        front = z + thickness / 2; back = z - thickness / 2
        tris = triangulate(inset)
        for j in range(0, len(tris), 3):
            ids = tris[j:j + 3]
            face([[*inset[i], front] for i in ids], [0, 0, 1])
            face([[*inset[i], back] for i in reversed(ids)], [0, 0, -1])
        for i, a in enumerate(outline):
            k = (i + 1) % len(outline); b = outline[k]
            outward = unit([b[1] - a[1], a[0] - b[0], 0])
            bevel_n = unit([outward[0], outward[1], 1])
            face([[*inset[i], front], [*a, front - min(bevel, thickness / 3)], [*b, front - min(bevel, thickness / 3)], [*inset[k], front]], bevel_n)
            face([[*a, front - min(bevel, thickness / 3)], [*a, back + min(bevel, thickness / 3)], [*b, back + min(bevel, thickness / 3)], [*b, front - min(bevel, thickness / 3)]], outward)
            face([[*inset[k], back], [*b, back + min(bevel, thickness / 3)], [*a, back + min(bevel, thickness / 3)], [*inset[i], back]], unit([outward[0], outward[1], -1]))
        self.add(name, p, n, f, color, bone, emission)

    def plate(self, name, outline, z, color=BLACK, bone='body', thickness=.075, bevel=.025):
        self.poly(name + ' steel bevel', outline, z, thickness, EDGE, bone, bevel)
        cx = sum(v[0] for v in outline) / len(outline); cy = sum(v[1] for v in outline) / len(outline)
        inset = [[cx + (v[0] - cx) * .92, cy + (v[1] - cy) * .93] for v in outline]
        self.poly(name + ' armour face', inset, z + thickness * .48, .018, color, bone, bevel * .35)

    def bolt(self, name, x, y, z, bone='body'):
        self.oval(name + ' ring', [x, y, z], [.017, .017, .009], '#515860', bone, rows=5, cols=10)
        self.oval(name + ' recessed head', [x, y, z + .007], [.009, .009, .006], VOID, bone, e=.55, rows=5, cols=8)


def mirror(poly, side):
    return [[side * x, y] for x, y in poly]


def heart(center, width, height, count=36):
    return [[center[0] + math.sin(i / count * math.tau) ** 3 * width,
             center[1] + (13 * math.cos(i / count * math.tau) - 5 * math.cos(2 * i / count * math.tau) - 2 * math.cos(3 * i / count * math.tau) - math.cos(4 * i / count * math.tau)) / 17 * height] for i in range(count)]


def build():
    b = Builder()
    # The fitted undersuit and articulated boots give the armour a human silhouette.
    b.oval('Pressure undersuit torso', [0, 2.66, 0], [.57, .70, .33], VOID, e=.68, rows=12, cols=24)
    b.oval('Pressure undersuit pelvis', [0, 1.87, 0], [.49, .30, .31], VOID, e=.62)
    b.oval('Armoured gorget', [0, 3.38, 0], [.27, .16, .26], STEEL, e=.45)
    for s in [-1, 1]:
        leg = 'leftLeg' if s < 0 else 'rightLeg'; arm = 'leftArm' if s < 0 else 'rightArm'; tag = 'L' if s < 0 else 'R'
        x = s * .35
        b.tube(tag + ' articulated leg', [[x, 1.83, 0], [x + s * .055, 1.22, .02], [x + s * .07, .59, .015], [x + s * .06, .22, .03]], [.24, .23, .19, .16], VOID, leg, sides=14)
        b.oval(tag + ' boot foundation', [x + s * .07, .20, .16], [.27, .21, .41], BLACK, leg, e=.42)
        b.oval(tag + ' deep boot sole', [x + s * .07, .061, .14], [.29, .055, .43], VOID, leg, e=.33)
        for i in range(6):
            b.oval(tag + ' boot tread ' + str(i), [x + s * .07, .046, -.17 + i * .115], [.296, .025, .018], '#464448', leg, e=.4, rows=5, cols=12)
        b.plate(tag + ' toe plate', mirror([[.16, .10], [.19, .35], [.42, .39], [.66, .26], [.68, .09]], s), .53, STEEL, leg, .08)
        b.plate(tag + ' ankle blade', mirror([[.16, .29], [.21, .60], [.55, .67], [.64, .39], [.55, .25]], s), .20, RED, leg)
        b.plate(tag + ' tibia shell', mirror([[.22, .39], [.16, .68], [.18, 1.09], [.43, 1.22], [.65, 1.01], [.61, .48], [.44, .34]], s), .235, BLACK, leg, .12)
        b.poly(tag + ' tibia crimson inset', mirror([[.23, .46], [.25, .98], [.42, 1.12], [.52, .90], [.49, .53], [.40, .43]], s), .312, .024, RED, leg)
        b.tube(tag + ' shin blade ridge', [[s * .40, .47, .343], [s * .40, .84, .345], [s * .42, 1.10, .327]], [.015, .022, .006], '#9e9da1', leg)
        b.plate(tag + ' angular knee crown', mirror([[.16, 1.03], [.12, 1.22], [.24, 1.41], [.43, 1.48], [.64, 1.30], [.60, 1.08], [.40, .99]], s), .32, STEEL, leg, .09)
        b.poly(tag + ' knee pointed shield', mirror([[.23, 1.28], [.40, 1.39], [.55, 1.26], [.40, 1.08]], s), .387, .035, RED, leg)
        b.plate(tag + ' thigh cuirass', mirror([[.15, 1.38], [.12, 1.75], [.23, 1.98], [.49, 1.92], [.63, 1.70], [.58, 1.44], [.40, 1.34]], s), .26, BLACK, leg, .10)
        b.poly(tag + ' thigh crimson strip', mirror([[.18, 1.77], [.30, 1.89], [.40, 1.79], [.29, 1.46], [.21, 1.43]], s), .333, .025, RED, leg)
        for i in range(3):
            y = .73 + i * .072
            b.tube(tag + ' shin joint hydraulic ' + str(i), [[s * .63, y, .06], [s * .60, y, .19]], .019, '#59636b', leg)
        b.tube(tag + ' outer knee piston', [[s * .66, 1.47, -.016], [s * .67, .92, .045]], [.031, .025], '#677078', leg)
        b.tube(tag + ' piston sleeve', [[s * .66, 1.25, -.016], [s * .665, 1.06, .019]], .047, VOID, leg)
        for x1, y1, z1 in [(.24, 1.82, .332), (.53, 1.61, .332), (.21, .84, .323), (.57, .53, .323), (.28, .23, .593), (.56, .21, .593)]:
            b.bolt(tag + ' leg lock ' + str(y1), s * x1, y1, z1, leg)
        for i in range(5):
            xx = s * (.27 + (i % 3) * .057); yy = .58 + i * .202
            b.tube(tag + ' leg abrasion ' + str(i), [[xx, yy, .345], [xx + s * .032, yy + .044, .345]], .004, '#7b7476', leg, sides=6)
        # Shoulder shells flare outward and support swept, asymmetric black spines.
        b.oval(tag + ' shoulder swivel', [s * .70, 3.09, 0], [.24, .24, .28], VOID, arm)
        b.plate(tag + ' pauldron crest', mirror([[.44, 3.23], [.61, 3.40], [.92, 3.38], [1.12, 3.16], [1.11, 2.96], [.91, 2.87], [.57, 3.02]], s), .06, BLACK, arm, .28, .045)
        for i in range(3):
            y = 3.15 - i * .14
            b.plate(tag + ' pauldron lamella ' + str(i), mirror([[.52, y + .04], [.78, y + .08], [1.08, y - .02], [1.13, y - .15], [.86, y - .20], [.55, y - .12]], s), .27 + i * .012, RED if i == 1 else STEEL, arm, .075)
        for i, (xx, yy, zz) in enumerate([(.74, 3.37, -.02), (1.02, 3.24, .01), (1.13, 3.08, .02)]):
            b.tube(tag + ' shoulder spike ' + str(i), [[s * xx, yy, zz], [s * (xx + .08), yy + .14, zz - .05], [s * (xx + .15), yy + .38, zz - .12]], [.09, .052, .002], STEEL, arm, sides=12)
            b.tube(tag + ' shoulder spike red edge ' + str(i), [[s * xx, yy, zz + .068], [s * (xx + .07), yy + .14, zz + .01], [s * (xx + .15), yy + .38, zz - .12]], [.011, .01, .001], RED, arm)
        elbow = [s * .95, 2.16 if s < 0 else 2.17, .10]
        wrist = [-.687, 1.55, .66] if s < 0 else [.14, 2.67, .66]
        b.tube(tag + ' arm flex undersuit', [[s * .73, 3.12, 0], [s * .90, 2.60, .06], elbow, wrist], [.22, .20, .18, .125], VOID, arm, sides=14)
        b.plate(tag + ' bicep shell', mirror([[.66, 2.79], [.65, 3.04], [.99, 3.01], [1.10, 2.70], [1.05, 2.38], [.84, 2.30], [.70, 2.50]], s), .21, BLACK, arm, .12)
        b.poly(tag + ' bicep crimson groove', mirror([[.74, 2.90], [.85, 2.94], [.99, 2.69], [.92, 2.49], [.85, 2.65]], s), .292, .025, RED, arm)
        b.oval(tag + ' elbow shield', [elbow[0], elbow[1], .17], [.235, .20, .20], STEEL, arm, e=.46)
        b.oval(tag + ' elbow hub', [elbow[0] + s * .21, elbow[1], .17], [.025, .11, .11], '#666c72', arm)
        for i in range(4):
            q = .25 + i * .15
            c = [elbow[k] + (wrist[k] - elbow[k]) * q for k in range(3)]
            b.oval(tag + ' forearm overlapping plate ' + str(i), [c[0], c[1], c[2] + .015], [.19, .14 if s < 0 else .12, .16], RED if i == 1 else STEEL, arm, e=.43)
            b.oval(tag + ' forearm bevel line ' + str(i), [c[0], c[1] + .075, c[2] + .167], [.13, .009, .009], EDGE, arm, e=.5, rows=5, cols=10)
            b.bolt(tag + ' bracer pin ' + str(i), c[0] + .11, c[1] + .035, c[2] + .161, arm)
        b.tube(tag + ' flexible arm cable', [[s * 1.00, 2.78, -.08], [s * 1.07, 2.45, -.12], [s * .97, 2.16, -.06]], [.025, .028, .022], RED, arm)
        b.oval(tag + ' gauntlet palm', wrist, [.17, .14, .12], BLACK, arm, e=.52)
        # Independently sculpted fingers wrap the diagonal weapon shaft.
        for i in range(4):
            u = (i - 1.5) * .049; d = [.594, .805, 0]; v = [-.805, .594, 0]
            c = [wrist[k] + d[k] * u for k in range(3)]
            pts = [[c[0] + v[0] * .10, c[1] + v[1] * .10, .67], [c[0] + v[0] * .078, c[1] + v[1] * .078, .79], [c[0] - v[0] * .025, c[1] - v[1] * .025, .805], [c[0] - v[0] * .075, c[1] - v[1] * .075, .72]]
            b.tube(tag + ' gripping finger ' + str(i), pts, [.024, .028, .023, .017], VOID, arm, sides=10)
            b.oval(tag + ' finger armour ' + str(i), [pts[1][0], pts[1][1], pts[1][2] + .011], [.029, .023, .024], STEEL, arm, e=.55, rows=6, cols=12)
        b.tube(tag + ' opposable thumb', [[wrist[0] -.10, wrist[1] +.08, .60], [wrist[0] -.09, wrist[1] +.12, .75], [wrist[0] +.04, wrist[1] +.10, .76]], [.042, .036, .023], VOID, arm)
        b.oval(tag + ' gauntlet crimson knuckle', [wrist[0], wrist[1], .60], [.165, .075, .026], RED, arm, e=.40)

    # Dense armour surrounds a raised, physically modelled crimson heart reactor.
    chest = [[-.25, 3.37], [-.48, 3.28], [-.66, 3.09], [-.58, 2.66], [-.35, 2.31], [0, 2.23], [.35, 2.31], [.58, 2.66], [.66, 3.09], [.48, 3.28], [.25, 3.37], [0, 3.24]]
    b.plate('Cathedral breastplate', chest, .31, BLACK, thickness=.19, bevel=.035)
    for s in [-1, 1]:
        b.plate('Chest wing ' + str(s), mirror([[.06, 3.15], [.25, 3.31], [.47, 3.17], [.52, 2.87], [.35, 2.72], [.17, 2.86]], s), .438, STEEL, thickness=.055)
        b.poly('Chest wing dark inlay ' + str(s), mirror([[.14, 3.10], [.25, 3.24], [.42, 3.12], [.44, 2.93], [.33, 2.84]], s), .48, .026, RED)
        b.tube('Chest outer crimson piping ' + str(s), [[s*.28, 3.30, .44], [s*.54, 3.08, .446], [s*.49, 2.69, .441], [s*.32, 2.38, .411]], .016, '#a92731')
        for i, (xx, yy) in enumerate([(.46, 3.16), (.55, 2.93), (.44, 2.52)]):
            b.bolt('Cuirass lock ' + str(s) + str(i), s*xx, yy, .494)
    b.poly('Heart reactor iron reliquary', heart([0, 2.86], .355, .35), .529, .094, EDGE, bevel=.025)
    b.poly('Heart reactor black border', heart([0, 2.86], .315, .311), .588, .024, VOID, bevel=.011)
    b.poly('Heart reactor red crystalline surface', heart([0, 2.86], .267, .267), .612, .04, '#6d1624', bevel=.017, emission=.22)
    b.poly('Heart reactor luminous inner facet', heart([-.022, 2.884], .175, .179), .64, .010, '#a72232', bevel=.006, emission=.38)
    b.poly('Heart reactor hot inner glint', heart([-.044, 2.933], .075, .068), .651, .008, '#d3454d', bevel=.003, emission=.44)
    for i, (xx, yy, tx, ty) in enumerate([(-.36, 3.05, -.44, 3.14), (.36, 3.05, .44, 3.14), (-.34, 2.73, -.42, 2.73), (.34, 2.73, .42, 2.73), (-.12, 2.56, -.15, 2.47), (.12, 2.56, .15, 2.47)]):
        b.tube('Heart housing thorn ' + str(i), [[xx, yy, .55], [tx, ty, .57]], [.045, .001], STEEL, sides=8)
    for i in range(3):
        y = 2.34 - i*.135; w = .43 - i*.045
        b.plate('Abdominal articulating lamella ' + str(i), [[-w,y+.072],[0,y+.045],[w,y+.072],[w-.025,y-.065],[0,y-.105],[-w+.025,y-.065]], .335, STEEL, thickness=.075)
        b.tube('Abdominal lamella crimson edge ' + str(i), [[-w+.045,y-.045,.392],[0,y-.085,.396],[w-.045,y-.045,.392]], .012, RED)
    b.oval('Wide combat utility belt', [0, 1.89, 0], [.57,.093,.37], VOID, e=.40)
    b.plate('Belt primary lock', [[-.14,1.99],[.14,1.99],[.16,1.84],[.08,1.79],[-.16,1.83]], .41, STEEL, thickness=.08)
    b.poly('Belt crimson command glyph', [[-.035,1.965],[.033,1.965],[.053,1.91],[0,1.835],[-.053,1.91]], .473, .014, GLOW, emission=.22)
    b.plate('Pelvic hanging shield', [[-.25,1.79],[.23,1.79],[.27,1.52],[.08,1.37],[-.19,1.45],[-.26,1.60]], .363, RED, thickness=.07)
    for s in [-1,1]:
        for i in range(2):
            x=s*(.31+i*.17)
            b.oval('Belt ammunition pouch '+str(s)+str(i), [x,1.90,.26], [.067,.12,.12], BLACK,e=.4)
            b.oval('Belt pouch clasp '+str(s)+str(i), [x,1.93,.384], [.04,.035,.014], '#6f7175',e=.4,rows=6,cols=12)
            b.oval('Belt pouch clasp notch '+str(s)+str(i), [x,1.93,.400], [.014,.02,.006],VOID,e=.35,rows=5,cols=8)
    b.poly('Terra Imperia black heraldic shield', [[-.52,2.24],[-.41,2.24],[-.40,2.13],[-.465,2.08],[-.53,2.13]], .41,.021, VOID)
    b.tube('Terra Imperia cyan chevron', [[-.510,2.211,.426],[-.465,2.153,.426],[-.422,2.211,.426]], .008, '#43cddd',emission=.13)
    b.oval('Terra Imperia cyan command light', [-.465,2.128,.429], [.012,.012,.007], '#43cddd',rows=6,cols=12,emission=.16)

    # Fully sealed helmet: no portrait texture and no unrigged face.
    b.oval('Helmet carbon skull', [0,3.865,0], [.34,.48,.29], VOID,'head',e=.72,rows=14,cols=24)
    b.plate('Helmet crown shell', [[-.27,4.12],[-.25,4.36],[0,4.46],[.25,4.36],[.27,4.12],[.17,3.92],[-.17,3.92]], .09, STEEL,'head',.29,.032)
    for s in [-1,1]:
        b.plate('Helmet temple shell '+str(s), mirror([[.08,4.16],[.29,4.24],[.37,3.99],[.31,3.62],[.18,3.51],[.04,3.70]],s), .243, BLACK,'head',.12)
        b.poly('Helmet crimson temple inlay '+str(s),mirror([[.13,4.095],[.27,4.18],[.30,4.015],[.23,3.815],[.18,3.64],[.105,3.72]],s),.32,.025,RED,'head')
        b.plate('Helmet cheek blade '+str(s),mirror([[.055,3.975],[.28,4.01],[.23,3.64],[.03,3.49]],s),.342,STEEL,'head',.073)
        b.poly('Helmet black cheek inset '+str(s),mirror([[.085,3.90],[.22,3.935],[.18,3.705],[.085,3.61]],s),.393,.021,VOID,'head')
        b.tube('Crimson visor slit '+str(s),[[s*.057,4.065,.422],[s*.15,4.095,.416],[s*.261,4.11,.380]],[.009,.010,.004],GLOW,'head',emission=.65)
        b.tube('Helmet lower red fissure '+str(s),[[s*.055,3.922,.422],[s*.061,3.756,.429],[s*.02,3.535,.401]],[.007,.008,.002], '#b82a32','head',emission=.13)
        b.bolt('Helmet temple lock '+str(s),s*.301,3.886,.330,'head')
        # Four layered, swept horns are modelled with solid capped tubes.
        main=[[s*.26,4.215,-.04],[s*.46,4.35,-.04],[s*.64,4.56,-.055],[s*.70,4.82,-.03],[s*.68,5.01,.012],[s*.61,5.10,.04]]
        b.tube('Grand swept helmet horn '+str(s),main,[.12,.14,.105,.075,.04,.002],BLACK,'head',sides=16)
        b.tube('Grand horn forged red ridge '+str(s),[[v[0],v[1],v[2]+r*.82] for v,r in zip(main,[.12,.14,.105,.075,.04,.002])],[.026,.025,.019,.014,.008,.001],RED,'head')
        for i in range(5):
            t=i/5; x=s*(.37+.28*t);y=4.30+.55*t
            b.tube('Helmet horn engraved band '+str(s)+str(i),[[x-s*.055,y+.024,-.013],[x,y,.067],[x+s*.045,y-.022,-.013]],.008,'#69696b','head',sides=8)
        minor=[[s*.30,4.06,-.12],[s*.48,4.12,-.13],[s*.66,4.25,-.16],[s*.77,4.40,-.18]]
        b.tube('Rear secondary helmet horn '+str(s),minor,[.078,.065,.042,.001],STEEL,'head',sides=12)
        b.tube('Rear horn crimson edge '+str(s),[[v[0],v[1],v[2]+.057] for v in minor],[.016,.013,.009,.001],RED,'head')
        b.tube('Helmet rear pressure hose '+str(s),[[s*.25,3.72,-.19],[s*.25,3.49,-.24],[s*.19,3.35,-.18]],.035,VOID,'head')
        for i in range(4):
            b.oval('Gorget rib '+str(s)+str(i),[s*.16,3.42-i*.027,.216],[.11,.009,.014],EDGE,e=.5,rows=5,cols=12)
    b.plate('Helmet central face blade', [[0,4.285],[.065,4.105],[.042,3.695],[0,3.48],[-.042,3.695],[-.065,4.105]], .407,BLACK,'head',.08,.014)
    b.tube('Helmet steel central crest', [[0,4.44,.175],[0,4.26,.34],[0,4.04,.474],[0,3.67,.453]], [.028,.033,.025,.01],EDGE,'head',sides=10)
    b.tube('Crown spear', [[0,4.34,-.05],[0,4.65,-.07]], [.075,.001],STEEL,'head',sides=12)

    # Split, ragged cloak; tears and the crimson lining are real polygons.
    cloak=[[-.68,3.16],[-1.05,2.75],[-1.07,1.85],[-1.24,.75],[-1.12,.55],[-1.23,.29],[-.92,.36],[-1.02,.06],[-.71,.20],[-.79,.55],[-.59,.42],[-.51,.14],[-.32,.28],[-.30,.59],[-.11,.29],[.03,.18],[.14,.51],[.27,.19],[.46,.39],[.39,.77],[.57,.55],[.65,.24],[.81,.11],[.85,.50],[1.09,.30],[.99,.87],[1.16,.69],[1.11,1.39],[1.00,2.27],[.70,3.17]]
    b.poly('Torn ceremonial cloak',cloak,-.47,.035,'#101117','cape',bevel=.010)
    for s in [-1,1]:
        b.poly('Torn crimson cloak lining '+str(s),mirror([[.38,3.08],[.68,3.11],[.93,2.61],[.94,1.79],[1.06,.94],[.92,.70],[.82,.88],[.75,.61],[.66,.73],[.59,1.32],[.49,2.25]],s),-.445,.012,'#421018','cape',bevel=.004)
        b.poly('Cloak heavy outer fold '+str(s),mirror([[.52,3.13],[.72,3.15],[1.02,2.74],[1.02,1.70],[1.15,.91],[1.02,.74],[.95,1.25],[.83,2.25]],s),-.418,.015,'#26242a','cape',bevel=.008)
        b.tube('Cloak silver hem '+str(s),[[s*.72,3.1,-.40],[s*.95,2.49,-.402],[s*.96,1.57,-.402],[s*1.06,.98,-.402]],.009,'#53535b','cape')
        b.oval('Cloak shoulder clasp '+str(s),[s*.49,3.235,-.23],[.067,.058,.062],STEEL,e=.46)
        for i in range(3):
            b.tube('Cloak fold seam '+str(s)+str(i),[[s*(.14+i*.16),2.9,-.438],[s*(.22+i*.17),1.55,-.438],[s*(.26+i*.18),.79,-.438]],.006,'#383138','cape',sides=8)
    # Rear power unit and cabling remain visible in the exported orbit view.
    b.oval('Spinal reactor housing',[0,2.83,-.355],[.31,.44,.15],BLACK,e=.42)
    for i in range(6):
        b.oval('Spinal cooling fin '+str(i),[0,3.16-i*.114,-.523],[.21,.029,.035],STEEL,e=.38)
        b.oval('Spinal reactor red slot '+str(i),[0,3.16-i*.114,-.56],[.105,.008,.009],GLOW,e=.45,rows=5,cols=10,emission=.22)
    # Massive original crescent polearm with a separate, animatable weapon root.
    start=[-1.35,.65,.66];end=[1.65,4.72,.66]
    b.tube('Polearm forged haft',[start,end],.049,'#64656b','weapon',sides=14)
    b.tube('Polearm crimson conduit',[[start[0],start[1],.705],[end[0],end[1],.705]],.012,RED,'weapon',sides=8)
    b.tube('Polearm bottom spike',[[-1.35,.65,.66],[-1.55,.38,.66]],[.059,.001],STEEL,'weapon',sides=12)
    for i in range(17):
        t=.12+i*.045;c=[start[k]+(end[k]-start[k])*t for k in range(3)];d=[.594,.805,0]
        a=[c[k]-d[k]*.013 for k in range(3)];bb=[c[k]+d[k]*.013 for k in range(3)]
        b.tube('Polearm ferrule '+str(i),[a,bb],.063,BLACK if i%3 else '#8a8383','weapon',sides=12)
    for i in range(2):
        t=.221 if i==0 else .496;c=[start[k]+(end[k]-start[k])*t for k in range(3)]
        b.tube('Polearm leather grip '+str(i),[[c[0]-.119,c[1]-.161,c[2]],[c[0]+.119,c[1]+.161,c[2]]],.063,VOID,'weapon',sides=14)
    blade=[[-.15,5.47],[.34,5.64],[.86,5.64],[1.43,5.43],[1.97,5.10],[2.34,4.67],[2.60,4.11],[2.70,3.59],[2.66,3.12],[2.49,2.70],[2.42,3.28],[2.24,3.84],[1.94,4.35],[1.52,4.80],[1.03,5.11],[.56,5.32],[.17,5.43]]
    b.poly('Crescent blade forged edge',blade,.66,.126,'#717278','weapon',bevel=.031)
    bladeface=[[.23,5.49],[.70,5.51],[1.25,5.33],[1.80,5.00],[2.16,4.59],[2.42,4.04],[2.54,3.55],[2.53,3.23],[2.39,3.77],[2.09,4.36],[1.62,4.89],[1.12,5.20],[.67,5.37]]
    b.poly('Crescent blade dark steel inset',bladeface,.742,.022,STEEL,'weapon',bevel=.015)
    b.tube('Crescent blade reactor channel',[[.38,5.44,.769],[.88,5.39,.769],[1.4,5.13,.769],[1.86,4.71,.769],[2.20,4.14,.769],[2.43,3.53,.769],[2.48,3.03,.733]],[.015,.020,.024,.025,.024,.019,.004],GLOW,'weapon',sides=10,emission=.45)
    for i,(x,y) in enumerate([(1.94,5.05),(2.22,4.79),(2.43,4.48),(2.57,4.14),(2.65,3.78)]):
        b.poly('Crescent serration '+str(i),[[x-.015,y+.04],[x+.18,y+.16],[x+.07,y-.08]],.66,.104,STEEL,'weapon',bevel=.013)
    b.tube('Scythe reinforced neck',[[1.34,4.29,.66],[1.64,4.70,.66],[1.87,4.61,.66]],[.088,.115,.09],BLACK,'weapon',sides=14)
    b.oval('Scythe circular bearing steel',[1.73,4.59,.745],[.18,.18,.07],EDGE,'weapon',rows=10,cols=24)
    b.oval('Scythe circular bearing dark',[1.73,4.59,.80],[.13,.13,.022],VOID,'weapon',rows=10,cols=24)
    b.oval('Scythe circular bearing red',[1.73,4.59,.824],[.055,.055,.009],GLOW,'weapon',rows=8,cols=16,emission=.32)
    for i in range(6):
        a=i/6*math.tau;b.bolt('Scythe bearing fastener '+str(i),1.73+math.cos(a)*.14,4.59+math.sin(a)*.14,.817,'weapon')
    b.tube('Scythe reactor feed pipe',[[1.49,4.4,.55],[1.67,4.72,.51],[1.99,4.74,.57]],.028,RED,'weapon')
    for i in range(6):
        x=.72+i*.235;y=5.43-i*.21
        b.tube('Crescent battle scar '+str(i),[[x,y,.76],[x+.07,y-.075,.76]],.005,'#c4b7b7','weapon',sides=6)
    # Small scratches are geometry; no resolution-dependent painted atlas is needed.
    for i in range(11):
        s=-1 if i%2 else 1;x=s*(.27+(i%3)*.064);y=2.66+(i%4)*.137
        b.tube('Breastplate abrasion '+str(i),[[x,y,.52],[x+s*.038,y+.021,.52]],.0037,'#8d7376',sides=6)
    silhouette = ['Pressure undersuit', 'articulated leg', 'boot foundation', 'toe plate armour face',
                  'tibia shell armour face', 'angular knee crown armour face', 'thigh cuirass armour face',
                  'shoulder swivel', 'pauldron crest armour face', 'arm flex undersuit', 'bicep shell armour face',
                  'forearm overlapping plate', 'gauntlet palm', 'Cathedral breastplate armour face',
                  'Heart reactor iron reliquary', 'Heart reactor red crystalline surface',
                  'Heart reactor luminous inner facet', 'Helmet carbon skull', 'Helmet crown shell armour face',
                  'Helmet temple shell', 'Helmet cheek blade', 'Crimson visor slit', 'Grand swept helmet horn',
                  'Rear secondary helmet horn', 'Helmet central face blade armour face', 'Helmet steel central crest',
                  'Crown spear', 'Torn ceremonial cloak', 'Torn crimson cloak lining', 'Polearm forged haft',
                  'Crescent blade forged edge', 'Crescent blade dark steel inset', 'Crescent blade reactor channel',
                  'Scythe reinforced neck']
    for part in b.parts:
        part['lod'] = any(term in part['name'] for term in silhouette)
        # Every indexed face must be CCW when seen from its outward normal. Tube
        # sweeps and bevel rings use different local frames; normal alignment is
        # checked on the rounded, exported coordinates rather than assumed from
        # an individual primitive's index pattern. The surface renderer culls
        # BACK faces, so a two-sided export alone would hide a game asset error.
        faces = []
        for j in range(0, len(part['indices']), 3):
            ids = part['indices'][j:j + 3]
            points = [part['p'][i * 3:i * 3 + 3] for i in ids]
            geometric = cross([points[1][k] - points[0][k] for k in range(3)],
                              [points[2][k] - points[0][k] for k in range(3)])
            if sum(v * v for v in geometric) < 1e-20:
                continue
            outward = [sum(part['n'][i * 3 + k] for i in ids) for k in range(3)]
            if sum(geometric[k] * outward[k] for k in range(3)) < 0:
                ids[1], ids[2] = ids[2], ids[1]
            faces.extend(ids)
        part['indices'] = faces
    return {'name':'Imperia Pontifex Maximus','meshes':b.parts,'pivots':PIVOTS,
            'height':4.46,'overallHeight':5.64,'animation':'Rigid articulated armour; rotate each bone around its global pivot.',
            'faction':'TERRA','design':'Original blackened steel, crimson reactor, four swept horns, split cloak and crescent polearm.'}


def export_glb(model, filename="NOSTRAVECTOR_Imperia_Pontifex_Maximus.glb"):
    blob=bytearray();views=[];accessors=[];meshes=[];materials=[]
    nodes=[{'name':model['name'],'children':[]}];groups={}
    for name,pivot in PIVOTS.items():
        groups[name]=len(nodes);nodes[0]['children'].append(len(nodes));nodes.append({'name':name,'translation':pivot,'children':[]})
    for name in PIVOTS:
        if name=='body':continue
        parent='rightArm' if name=='weapon' else 'body';nodes[0]['children'].remove(groups[name]);nodes[groups[parent]]['children'].append(groups[name]);nodes[groups[name]]['translation']=[PIVOTS[name][i]-PIVOTS[parent][i] for i in range(3)]
    def array(v,kind,component,typ,count,target,bounds=False):
        blob.extend(b'\0'*((-len(blob))%4));start=len(blob);blob.extend(struct.pack('<'+kind*len(v),*v));views.append({'buffer':0,'byteOffset':start,'byteLength':len(blob)-start,'target':target});a={'bufferView':len(views)-1,'componentType':component,'count':count,'type':typ}
        if bounds:a.update(min=[min(v[i::3]) for i in range(3)],max=[max(v[i::3]) for i in range(3)])
        accessors.append(a);return len(accessors)-1
    for q in model['meshes']:
        m=len(materials);material={'name':q['name'],'doubleSided':True,'pbrMetallicRoughness':{'baseColorFactor':q['color']+[1],'metallicFactor':.7 if any(v in q['name'].lower() for v in ['steel','plate','blade','shell','spike','bearing','forged']) else .15,'roughnessFactor':.43 if q['emission'] else .67}}
        if q['emission']:material['emissiveFactor']=[v*q['emission'] for v in q['color']]
        materials.append(material);pivot=PIVOTS[q['bone']];p=[v-pivot[i%3] for i,v in enumerate(q['p'])]
        pi=array(p,'f',5126,'VEC3',len(p)//3,34962,True);ni=array(q['n'],'f',5126,'VEC3',len(p)//3,34962);fi=array(q['indices'],'H',5123,'SCALAR',len(q['indices']),34963)
        meshes.append({'name':q['name'],'primitives':[{'attributes':{'POSITION':pi,'NORMAL':ni},'indices':fi,'material':m}]});nodes[groups[q['bone']]]['children'].append(len(nodes));nodes.append({'name':q['name'],'mesh':len(meshes)-1})
    data={'asset':{'version':'2.0','generator':model.get('generator','NOSTRAVECTOR original articulated boss')},'scene':0,'scenes':[{'nodes':[0]}],'nodes':nodes,'meshes':meshes,'materials':materials,'buffers':[{'byteLength':len(blob)}],'bufferViews':views,'accessors':accessors,'extras':{'faction':model.get('faction','UNCLAIMED'),'animationPivots':PIVOTS,'source':model.get('design','Native polygonal armour, cloth, reactor, horns and weapon geometry.')}}
    raw=json.dumps(data,separators=(',',':')).encode();raw+=b' '*((-len(raw))%4);blob+=b'\0'*((-len(blob))%4)
    (OUT/filename).write_bytes(struct.pack('<III',0x46546c67,2,28+len(raw)+len(blob))+struct.pack('<II',len(raw),0x4e4f534a)+raw+struct.pack('<II',len(blob),0x004e4942)+blob)


if __name__ == '__main__':
    model=build();WORK.mkdir(exist_ok=True);OUT.mkdir(exist_ok=True)
    (WORK/'pontifex_model.js').write_text('const PontifexModel='+json.dumps(model,separators=(',',':'))+';\n',encoding='utf-8')
    export_glb(model)
    print(model['name'],len(model['meshes']),'parts,',sum(len(q['p'])//3 for q in model['meshes']),'vertices,',sum(len(q['indices'])//3 for q in model['meshes']),'triangles.')
