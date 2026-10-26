from pathlib import Path
import json,shutil
work=Path(__file__).resolve().parent
target=work/'audio/james';target.mkdir(parents=True,exist_ok=True)
source=Path('C:/Users/HOME/Documents/NOSTRAVECTOR/antarctica')
def duration(data):
    offset=0
    if data[:3]==b'ID3':offset=10+sum((data[6+i]&127)<<(7*(3-i)) for i in range(4))
    seconds=0;frames=0
    while offset+4<len(data):
        h=int.from_bytes(data[offset:offset+4],'big')
        ver=(h>>19)&3;layer=(h>>17)&3;bi=(h>>12)&15;si=(h>>10)&3
        if h>>21!=2047 or ver==1 or layer!=1 or bi in (0,15) or si==3:offset+=1;continue
        rate=[44100,48000,32000][si]/(1 if ver==3 else 2 if ver==2 else 4)
        bitrates=[0,32,40,48,56,64,80,96,112,128,160,192,224,256,320] if ver==3 else [0,8,16,24,32,40,48,56,64,80,96,112,128,144,160]
        size=int((144000 if ver==3 else 72000)*bitrates[bi]/rate)+((h>>9)&1)
        if offset+size>len(data):break
        seconds+=(1152 if ver==3 else 576)/rate;frames+=1;offset+=size
    assert frames>0
    return round(seconds,3)
if __name__ == '__main__':
    records=[]
    names=[*(f'JB{i}.mp3' for i in range(1,6)),'JBIMPATIENT.mp3',*(f'JBPA{i}.mp3' for i in range(1,11)),'JBW.mp3',*(f'JBW{i}.mp3' for i in range(1,10)),*(f'JBAA{i}.mp3' for i in range(1,6))]
    for name in names:
        clip_source=source/'3'/name if name.startswith('JBAA') else source/'2'/name if name.startswith('JBW') else source/name
        shutil.copyfile(clip_source,target/name)
        records.append({'file':'audio/james/'+name,'duration':duration((target/name).read_bytes())})
    (work/'james_audio.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
    print(json.dumps(records,indent=2))
