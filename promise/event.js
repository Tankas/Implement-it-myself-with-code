// 事件类 
function Thing(){
    let callbacks = {}; // 
    thing.prototype.on = function(name , callback){
        if(callbacks[name]){
            callbacks[name].push(callback);
            return;
        }
        callbacks[name] = [];
        callbacks[name].push(callback);
    }
    thing.prototype.emit = function(name , data){
        // 
        setTimeout(function(){
            if(!callbacks[name]){
                console.log("没有绑定事件～～");
                return;
            }
            for(var i=0; i<callbacks[name].length;i++){
                callbacks[name][i](data);
            }
        },0)
        
    }
    function thing(){
        
    }
    return thing; // 返回一个事件类
} 