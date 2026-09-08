import re, math, sys
def fmt(v): return f"{v:.1f}".rstrip("0").rstrip(".")
def round_polyline(d, r=12):
    nums=[float(x) for x in re.findall(r'-?\d+\.?\d*', d)]
    pts=list(zip(nums[0::2], nums[1::2]))
    if len(pts)<3: return d
    def along(a,b,dist):
        dx,dy=b[0]-a[0],b[1]-a[1]; L=math.hypot(dx,dy) or 1
        return (a[0]+dx/L*dist, a[1]+dy/L*dist)
    out=[f"M{fmt(pts[0][0])} {fmt(pts[0][1])}"]
    for i in range(1,len(pts)-1):
        p0,p1,p2=pts[i-1],pts[i],pts[i+1]
        rr=min(r, math.hypot(p1[0]-p0[0],p1[1]-p0[1])/2, math.hypot(p2[0]-p1[0],p2[1]-p1[1])/2)
        b=along(p1,p0,rr); a=along(p1,p2,rr)
        out.append(f"L{fmt(b[0])} {fmt(b[1])}")
        out.append(f"Q{fmt(p1[0])} {fmt(p1[1])} {fmt(a[0])} {fmt(a[1])}")
    out.append(f"L{fmt(pts[-1][0])} {fmt(pts[-1][1])}")
    return " ".join(out)

n=0
def repl(m):
    global n
    tag=m.group(0); d=m.group(1)
    if 'marker-end="url(#arrow)"' not in tag: return tag
    if any(c in d for c in 'CcAaQqSsTt'): return tag  # skip curves/already-rounded
    nd=round_polyline(d)
    if nd!=d:
        n+=1
        tag=tag.replace(f'd="{d}"', f'd="{nd}"')
        if 'stroke-linejoin' not in tag:
            tag=tag.replace('fill="none"','fill="none" stroke-linejoin="round" stroke-linecap="round"',1)
    return tag

for fn in sys.argv[1:]:
    s=open(fn).read(); n=0
    s=re.sub(r'<path d="([^"]*)"[^>]*/>', repl, s)
    open(fn,"w").write(s)
    print(f"{fn}: rounded {n} elbow arrow(s)")
