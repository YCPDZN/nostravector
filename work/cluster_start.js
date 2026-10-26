function clusterStartProgress(){
 const s=NVAntarctica.restored(chapterRestartProgress({id:'cluster-expedition-2125',progress:{}},3),'cluster-expedition-2125'),b=NVCluster.first(NVCluster.START);
 s.friendQuest='declined';s.space.system=NVCluster.START;s.space.body=b.id;s.space.target=b.id;s.space.position=NVSpace.routeEnd(b);s.space.crew=false;s.space.autopilot=false;s.space.visited=[b.id];s.space.geo=null;s.space.galaxy={visited:[NVCluster.START],returns:{},metFigure:false,fuel:5,scanned:[],log:[],expedition:true};NVSpace.pointAt(s.space,b.position);
 const c=NVConstruction.ensure(s);c.started=true;c.tools=true;c.stage=9;
 NVCluster.record(s,NVCluster.describe(s));
 return{chapter:3,checkpoint:'cluster-expedition',playTimeSeconds:0,antarctica:NVAntarctica.snapshot(s)};
}
