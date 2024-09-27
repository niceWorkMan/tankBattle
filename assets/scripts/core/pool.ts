import { _decorator, Color, Component, instantiate, log, Node, Prefab, Sprite } from 'cc';
import { tank } from '../node/tank';
import { boy01 } from '../node/boy01';
import { pig } from '../node/pig';
import { aStar } from './aStar';
import { tankManager } from '../tankManager';
import { element } from '../node/element';
import { bullet } from '../bullet/bullet';
import { bulletTank } from '../bullet/bulletTank';
import { tree } from '../obstale/tree';
import { bulletTArrow } from '../bullet/bulletTArrow';
import { editorManager } from '../editorManager';
const { ccclass, property } = _decorator;

@ccclass('pool')
export class pool extends Component {
    constructor() {
        super();
        pool._instance = this;
    }


    private static _instance: pool = null;
    // 只能通过自身进行初始化
    public static get Instance() {
        if (this._instance == null) {
            //获取单例失败
            console.log("获取pool单例失败");
        }
        return this._instance;
    }



    start() {
       
    }




    //人物对象池
    private _elPool = { tank: [], pig: [], boy01: [] };

    //生成对象
    public spawnActor(name: string, parent: Node): any {
        var edt:editorManager=this.getComponent(editorManager);
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
            //console.log("使用坦克对象池的:" + this._elPool.tank.length);
            ac.getComponent(edt.propertyConfig[name].class).sleep = false;
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
            obj = instantiate(edt.propertyConfig[name].prefab)
            parent.addChild(obj);
            this._elPool[name].push(obj);
            //console.log("使用tank新对象:"+obj.name);
            return obj;
        }
    }


    private getSleepActor(name: string): any {
        var edt:editorManager=this.getComponent(editorManager);
        var arr = this._elPool[name];
        for (var i = 0; i < arr.length; i++) {
            var sl = arr[i].getComponent(edt.propertyConfig[name].class).sleep;
            var sl2 = arr[i].getComponent(edt.propertyConfig[name].class).realSleep;
            if (sl == true && sl2 == true) {
                var k = arr[i].getComponent(edt.propertyConfig[name].class).key;
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
                    //console.log("移除了targetNode:", key, i);
                }
            }
        }
    }







    //子弹对象池
    private _blPool = { bulletTank: [], bulletTArrow: [] };
    //生成子弹对象
    public spawnBullet(name: string, parent: Node): any {
        var edt:editorManager=this.getComponent(editorManager);
        var ac = this.getSleepBullet(name);

        if (ac) {
            //显示
            ac.getComponent(edt.propertyConfig[name].class).sleep = false;
            //console.log("使用子弹对象池的:" + this._blPool[name].length);
            return ac;
        }
        else {
            var obj = null;
            obj = instantiate(edt.propertyConfig[name].prefab)
            parent.addChild(obj);
            this._blPool[name].push(obj);
            //console.log("使用子弹新对象:" + obj.name);
            return obj;
        }
    }


    private getSleepBullet(name: string): any {
        var edt:editorManager=this.getComponent(editorManager);
        var arr = this._blPool[name];
        for (var i = 0; i < arr.length; i++) {
            var sl = arr[i].getComponent(edt.propertyConfig[name].class).sleep;
            if (sl == true) {
                return arr[i];
            }
        }
        return null;
    }
}


