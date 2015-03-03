var CBG_STATE_ALL_OFF=0,
    CBG_STATE_ALL_ON=2,
    CBG_STATE_MIXED=1;
    
var cbgCollection={};

var CheckBoxGroup=function (cbgId) {
  var cbg=cbgCollection[cbgId]=this;
  cbg.id=cbgId;
  cbg.list=$('#'+cbgId+' :checkbox');
  cbg.dom={};
  cbg.list.each(function () { cbg['dom'][(this.id || this.value)]=this });
  cbg.n=cbg.list.length;
  cbg.n_clear=$.grep(cbg.list,function (x) { return x.checked===false; }).length;
  cbg.all_clear=(cbg.n_clear==cbg.n);
  cbg.all_checked=(cbg.n_clear==0);
  cbg.state=(cbg.all_clear?CBG_STATE_ALL_OFF:(cbg.n_clear?CBG_STATE_MIXED:CBG_STATE_ALL_ON));
  cbg.handlers={};
};

CheckBoxGroup.prototype.checkState=function () {
  var cbg=this;
  cbg.state=(cbg.n==cbg.n_clear?CBG_STATE_ALL_OFF:(cbg.n_clear?CBG_STATE_MIXED:CBG_STATE_ALL_ON));
  return cbg.state;
};
CheckBoxGroup.prototype.setHandler=function (Type,Func,NeedObj) {
  if (Type === undefined || typeof(Type) !== 'string' || typeof(Func) !== 'function') return 0;
  var hndl=this['handlers'][Type]={};
  hndl['func']=Func;
  this['hndl'+Type]=Func;
  hndl['needThis']=typeof(NeedObj)=='boolean'?NeedObj:false;  
  return 1;
}
CheckBoxGroup.prototype.onChange=function (handler,flNeedThis=false) {
  return this.setHandler('EveryChange',handler,flNeedThis);
};
CheckBoxGroup.prototype.onAllChecked=function (handler,flNeedThis=false) {
  return this.setHandler('AllChecked',handler,flNeedThis);
};
CheckBoxGroup.prototype.onAllCleared=function (handler,flNeedThis=false) {
  return this.setHandler('AllCleared',handler,flNeedThis); 
};
CheckBoxGroup.prototype.activate=function () {
  var cbg=this;
  function callUserHandler (Type,Parameter) {
    var hndl;
    if ((hndl=cbg['handlers'][Type])===undefined) return 1;
    if (typeof(hndl['func'])!=='function') return 0;
    if (hndl['needThis']) {
      return hndl['func'](cbg,Parameter);
    } else {
      return hndl['func'](Parameter);
    }
  }
  cbg.list.each(function () {
    $(this).change(function () {
      cbg.n_clear+=((this.checked===false)<<1)-1;
      var oldState=cbg.state;
      cbg.checkState();
      switch (oldState) {
	case CBG_STATE_ALL_OFF: 	        
	  callUserHandler('AllCleared',false);
	  break;
	case CBG_STATE_ALL_ON:                
	  callUserHandler('AllChecked',false);
	  break;	      
      }
      switch (cbg.state) {
	case CBG_STATE_ALL_ON:
	  callUserHandler('AllChecked',true);
	  break;
	case CBG_STATE_ALL_OFF:
	  callUserHandler('AllCleared',true);
	  break;	      
      }
      callUserHandler('EveryChange',this);
    });
  });
}; // <- CheckBoxGroup.prototype.activate
