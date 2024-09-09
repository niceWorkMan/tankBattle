import { _decorator, Color, Component, instantiate, Node, Prefab, Sprite } from 'cc';
import { tank } from '../node/tank';
import { boy01 } from '../node/boy01';
import { pig } from '../node/pig';
import { aStar } from './aStar';
import { tankManager } from '../tankManager';
import { element } from '../node/element';
const { ccclass, property } = _decorator;

@ccclass('pool')
export class pool extends Component {

    //对象
    @property(Prefab) bulletPrefab: Prefab;
    @property(Prefab) tankPrefab: Prefab;
    @property(Prefab) boy01Prefab: Prefab;
    @property(Prefab) PigPrefab: Prefab;

    constructor() {
        super();
        //pool._instance = this;
    }
    // private static _instance: pool = null;
    // // 只能通过自身进行初始化
    // public static get Instance() {
    //     if (this._instance == null) {
    //         //获取单例失败
    //         console.log("获取pool单例失败");
    //     }
    //     return this._instance;
    // }

    //配置表
    private _actorConfig = {};
    public get actorConfig(): any {
        return this._actorConfig;
    }



    start() {
        //初始化Config
        this._actorConfig = {
            tank: {
                prefab: this.tankPrefab,
                component: tank,
            },
            boy01: {
                prefab: this.boy01Prefab,
                component: boy01,
            }, pig: {
                prefab: this.PigPrefab,
                component: pig,
            }
        }
    }




    //人物对象池
    private _elPool = { tank: [], pig: [], boy01: [] };

    //生成对象
    public spawnActor(name: string, parent: Node): any {
        var ac = this.getSleepActor(name);
        if (ac) {
            //刷新寻路数据
            ac.stopIndex = 0
            if (ac.closeList)
                ac.closeList.length = 0;
            ac.getComponent(aStar).stopRecursion = false;
            ac.getComponent(aStar).resetGridArr();
            //移除Target
            this.removeTargetFormPool(ac);
            //显示
            ac.active = true;
            //console.log("使用对象池的:" + this._elPool.tank.length);
            ac.getComponent(this._actorConfig[name].component).sleep = false;
            ac.die = false;
            //重新赋值血量
            ac.hp = 200;

            //使用的时候添加到Collection
            var nodeCollection = this.getComponent(tankManager).nodeCollection;
            var index = nodeCollection.indexOf(ac);
            if (index == -1) {
                nodeCollection.push(ac);
            }
            //重置数据
            ac.getComponent(aStar).resetGridArr();
            ac.getComponent(Sprite).color = new Color(255, 255, 0, 255)
            return ac;
        }
        else {
            var obj = null;
            obj = instantiate(this._actorConfig[name].prefab)
            parent.addChild(obj);
            this._elPool[name].push(obj);
            //console.log("使用新对象:"+obj.name);
            return obj;
        }
    }


    private getSleepActor(name: string): any {
        var arr = this._elPool[name];
        for (var i = 0; i < arr.length; i++) {
            var sl = arr[i].getComponent(this._actorConfig[name].component).sleep;
            var sl2 = arr[i].getComponent(this._actorConfig[name].component).realSleep;
            if (sl == true && sl2 == true) {
                var k = arr[i].getComponent(this._actorConfig[name].component).key;
                return arr[i];
            }
        }
        return null;
    }


    //移除目标从
    removeTargetFormPool(target: element) {
        for (var key in this._blPool) {
            var arr = this._blPool[key];
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].targetNode == target) {
                    arr[i].targetNode = null;
                    console.log("移除了targetNode:",key,i);   
                }
            }
        }
    }







    //人物对象池
    private _blPool = { tankBullet: [] };
    //生成对象
    // public spawnBullet(name: string, parent: Node): any {
    //     var ac = this.getSleepBullet(name);
    //     if (ac) {
    //         ac.sleep = false;
    //         ac.stopIndex = 0;
    //         return ac;
    //     }

    //     var obj = null;
    //     switch (name) {
    //         case "tank":
    //             obj = instantiate(this.tankPrefab)
    //             break;

    //         case "pig":
    //             obj = instantiate(this.PigPrefab)
    //             break;


    //         case "boy01":
    //             obj = instantiate(this.boy01Prefab)
    //             break;
    //     }
    //     this._blPool[name].push(obj);
    //     parent.addChild(obj);
    //     return obj;
    // }


    // private getSleepBullet(name: string): any {
    //     var arr = this._blPool[name];
    //     for (var i = 0; i < arr.length; i++) {
    //         var isSleep = arr[i].sleep == true;
    //         if (isSleep) {
    //             return arr[i];
    //         }
    //     }
    //     return null;
    // }



    ;
}


