/**
 * q1:同步代码,error在promise的resolve之后,不处理.
 * q2:异步代码,catch不到
 * catch捕获是以流的形式传递
 * resolve 后面throw代码不影响
 */
function PP(){ 
    let promises = new Map();
    let index = 123;
    //沿着链表装载
    function loadLineToList(obj){
        //这一串的状态是相同的了 
        let previous = null;
        let end = obj;
        let temp_end = obj;
        while(previous=temp_end.previous){ 
            previous.state = end.state;
            previous.value = end.value;        
            //把上一个promise下面的节点移到end下面
            if(promises.get(end._index)){
                if(promises.get(previous._index)){
                    // 合并后的节点数组
                    let newPromiseItem = promises.get(end._index).concat(promises.get(previous._index));
                    promises.set(end._index,newPromiseItem);
                }    
            }else{
                //不存在,自己下面没有节点 
                if(promises.get(previous._index)){
                    // 合并后的节点数组
                    promises.set(end._index,promises.get(previous._index));
                }

            }
            temp_end = temp_end.previous;
        }
    }
    app.prototype.resolve = function(data){
        //promise的状态一旦改变就无法变更,如果执行过resolve,再执行的resolve,reject都不作数
        if(this._statusChange){
            return;
        }
        if(!this._statusChange){
            this._statusChange = true;
        }
        let ans = null;
        let promise = null;
        let item;
        // 执行mic任务队列里面的任务 , 这里用setTimeout(fn,0)代替
        setTimeout(()=>{
            if(typeof data == 'object' && data!==null &&  data.__proto__.constructor == app){
                // 所以说你这里面还是属于配置层!!
                data.previous = this;
            }else{      
                // 真正执行
                setTimeout(()=>{
                    this.state = "resolve";
                    this.value = data;
                    loadLineToList(this);
                    if(item=promises.get(this._index)){
                        // 拿出当前promise调用的所有then方法的回调函数,并执行
                        for(let i=0;i<item.length;i++){
                            // then 
                            if(item[i].type == 'then'){
                                try{
                                    // run first resolve
                                    ans = item[i].callback[0].fn(data);
                                }catch(err){
                                    promise = promises.get(this._index)[i].instance;
                                    promise.reject(err);
                                    return;
                                }  
                            }else{
                                //有这个promise的catch方法,方法不执行
                                ans = data;
                            }
                            promise = promises.get(this._index)[i].instance;
                            // 如果返回了一个promise
                            if(typeof ans == 'object' && ans!==null &&  ans.__proto__.constructor == app){
                                promise.next = ans;
                                ans.previous = promise;
                            }else{
                                if(promise){
                                    promise.resolve(ans);
                                }
                            }
                        }
                        // 
                    }else{
                        return;
                    }
                },0)
                
            }

        },0)
    }
    app.prototype.reject = function(error){   
        ////promise的状态一旦改变就无法变更,如果执行过resolve,再执行的resolve,reject都不作数
        if(this._statusChange){
            return;
        }
        if(!this._statusChange){
            this._statusChange = true;
        }
        //向下找promise,直到找到一个catch,至于不是catch的,状态一律变成reject
        let promise,fn;
        setTimeout(()=>{
            this.state = "reject";
            this.value = error;
            loadLineToList(this);
            let list = promises.get(this._index); // 
            if(!list || list.length==0){
                throw new Error("(in promise) "+error);
                return;
            }
            for(let i=0;i<list.length;i++){
                promise = list[i].instance;
                type = list[i].type;
                if(type == 'then'){   // 这个promise 是通过p1.then() 出来的 ， 但是由于p1是reject , 所以当前promise转换成reject
                    if(list[i].callback.length == 1){
                        promise.value = error;
                        promise.reject(error);
                        continue;
                    }else{
                        fn = list[i].callback[1].fn;
                    }
                }
                // 拿到catch里面的fn
                if(!fn){
                    fn = list[i].callback[0].fn; 
                }
                let ans = null;
                try{
                    ans = fn(error);
                }catch(err){
                    promise.reject(err);
                    return;
                }
                promise.value = ans;
                if(typeof ans == 'object' && ans!==null &&  ans.__proto__.constructor == app){
                    ans.previous = promise;
                }else{
                    if(promise){
                        promise.resolve(ans);
                    }
                }
            }
        },5) 

    }
    // Promise 构造函数
    function app(fn,son){
        this.state = "pendding";
        this._index = ++index;
        this._statusChange = false;
        try{
            fn(this.resolve.bind(this),this.reject.bind(this));
        }catch(err){
            setTimeout(()=>{
                // 执行完resolve或者reject
                if(this._statusChange){
                    return;
                }
                this.reject(err);
            },0)
        }
        
    }
    //
    app.prototype.then = function(resolveFn , rejectFn){
        let length = arguments.length;
        if(length > 0 && length < 3){
            if(typeof resolveFn !== 'function'){
                throw new Error('arguments error');
            }
            if(rejectFn && typeof rejectFn !== 'function'){
                throw new Error('arguments error');
            }
        }else{
            throw new Error('arguments error');
            return;
        }
        // 把要发生的事件保存起来 , 并且返回一个新的promise 
        let instance = new app(()=>{});
        let item = {
            type : 'then',
            instance : instance,
            callback : length > 1 ? ([{
                status : 'resolve',
                fn : resolveFn
            },{
                status : 'reject',
                fn : rejectFn
            }]) : ([{
                status : 'resolve',
                fn : resolveFn
            }])
        }
        // 
        let p_item;
        if(p_item=promises.get(this._index)){
            p_item.push(item);
        }else{
            promises.set(this._index,[item])
        }
        return instance;
    }
    app.prototype.catch = function(rejectFn){
        if(typeof rejectFn !== 'function'){
            throw new Error('arguments error');
            return;
        }
        // 把要发生的事件,新的promise保存起来 , 并且返回新的promise 
        let instance = new app(()=>{});
        let item = {
            type : 'catch',
            instance : instance,
            callback : ([{
                status : 'reject',
                fn : rejectFn
            }])
        }
        let p_item;
        if(p_item=promises.get(this._index)){
            p_item.push(item);
        }else{
            promises.set(this._index,[item])
        }
        return instance;
    }
    return app;
}
let Promise = PP();




