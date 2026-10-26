"""Run the local, non-browser regression suites and retain an auditable result."""
from pathlib import Path
import subprocess, concurrent.futures, json, time
ROOT=Path(__file__).resolve().parents[1]
tests=[]
for p in sorted((ROOT/'work').glob('test*.js')):
    source=p.read_text(encoding='utf-8')
    if 'browser' in p.stem or 'playwright' in source or p.name=='test_desktop_exe.js':
        continue
    tests.append(p)
def run(p):
    started=time.monotonic()
    try:
        r=subprocess.run(['node',str(p.relative_to(ROOT))],cwd=ROOT,capture_output=True,text=True,encoding='utf-8',errors='replace',timeout=60)
        return dict(test=p.name,passed=r.returncode==0,seconds=round(time.monotonic()-started,2),output=(r.stdout+r.stderr)[-14000:])
    except subprocess.TimeoutExpired:
        return dict(test=p.name,passed=False,seconds=60,output='TIMEOUT')
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    rows=list(pool.map(run,tests))
report=dict(total=len(rows),passed=sum(r['passed'] for r in rows),failed=sum(not r['passed'] for r in rows),tests=rows)
(ROOT/'outputs/NOSTRAVECTOR_Release_Core_Audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(f"Core audit: {report['passed']}/{report['total']} passed",flush=True)
for r in rows:
    if not r['passed']:
        print('\n'+r['test']+'\n'+r['output'][-2200:],flush=True)
