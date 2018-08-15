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
//
function CC(){
    const TCC = Thing(); 
    const thing = new TCC();
    // 暂时处理不同得promise 实例 ， 该有自己的事件类实例 
    let sid = 0;
    // resolve 
    promise.prototype.resolve = function(data){
        // notify ---> 去通知.then()函数里 thing.on() 那注册的那个方法 , 你可以执行了。。
        this.state = "resolve";
        thing.emit('resolve'+this.sid,data);
    }
    // reject
    promise.prototype.reject = function(data){
        // notify ---> 去通知.then()函数里 thing.on() 那注册的那个方法 , 你可以执行了。。
        this.state = "reject";
        thing.emit('reject'+this.sid ,data);
    }
    // then 
    promise.prototype.then = function(){
        if(arguments.length > 1){
            thing.on('reject'+this.sid , arguments[1]);
        }
        if(arguments.length > 0){
            thing.on('resolve'+this.sid , arguments[0]);
        }
        return this;
    }
    promise.prototype.catch = function(){
        thing.on('reject'+this.sid , arguments[0]);
        return this;
    }
    function promise(callback){
        this.state = "pendding";
        this.sid = ++sid;
        if(callback){
            callback(this.resolve.bind(this) , this.reject.bind(this));  // 绑定this.... , 有时间可以手写个bind, 真心好用的方法
        }
        
    }
    promise.all = function(...argu){   // 静态方法 
        // 不同的事件类实例
        let pp = new promise(); // 作为返回结果的 
        // 这些promise 实例都是emit 'resolve' 或者 'reject'
        // 返回的也是一个promise 实例 , 但是什么时候emit呢 ?
        let len = argu[0].length;
        let data = []; // 一会要做参数返回的 
        for(let i=0; i<len; i++){
            // 异步代码啊 ..
            argu[0][i].then(function(result){
                data.push(result);
                if(data.length == len){   // 全都是 resolve 
                    // 触发 resolve 
                    pp.resolve(data);
                }
            }).catch(function(error){
                // 如果有一个reject , 直接break;  我这也就是遵从人家的规则 , 其实想咋写咋写 
                pp.reject(error);
                //break;
            });
        }
        return pp;
    }
    // 还有个 promise.rice 方法 , 和.all 差不多 , 懒得写了.
    return promise;
}
var Pro = CC();  // ----> equal to Promise ...