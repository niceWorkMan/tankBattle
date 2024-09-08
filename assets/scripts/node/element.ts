import { _decorator, BoxCollider2D, Collider2D, Color, Component, Contact2DType, IPhysics2DContact, Node, Sprite, Tween, Vec2, Vec3 } from 'cc';
import { aStar } from '../core/aStar';
import { grid } from '../grid';
import { gridManager } from '../gridManager';
import { tankManager } from '../tankManager';
import { enumTeam } from '../common/enumTeam';
import { grid_c } from '../core/grid_c';
const { ccclass, property } = _decorator;

@ccclass('element')
export class element extends Component {
    constructor() {
        super();
    }


    protected nodeCollider: Collider2D;

    start() {
        this.initComponent();
    }

    initComponent() {
        this.tManager = this.node.parent.parent.getComponent(tankManager);
        this.gManager = this.node.parent.parent.getComponent(gridManager);

        //获取导航网格
        var star = this.getComponent(aStar);
        star.tk = this;
        star.tManager = this.tManager;
    }

    //移动
    protected tweenMove(nextIndex: number, closeList: grid_c[]) { };


    //外部调用 继续移动
    public tweenMoveOn() {
        if (this._closeList) {
            if (this.stopIndex <= this._closeList.length - 1) {
                this.tweenMove(this.stopIndex, this._closeList);
            }
        }
    }


    protected navigationSpaceTime = 200;

    //坦克移动单元格时间
    protected moveSpeed = 0.5;
    //坦克转向时间
    protected rotateSpeed = 0.2;
    //等待障碍物时间 单位/秒
    private _waitObsTime = 0.5;
    public get waitObsTime(): number {
        return this._waitObsTime;
    }

    //配置键
    protected _key: string;
    public set key(v: string) {
        this._key = v;
    }
    public get key(): string {
        return this._key
    }





    //当前所属队伍
    protected _team: enumTeam;
    public get team(): enumTeam {
        return this._team
    }
    public set team(v: enumTeam) {
        this._team = v;
    }

    //坦克管理类
    protected _tankManager: tankManager
    public set tManager(v: tankManager) {
        this._tankManager = v;
    }
    public get tManager(): tankManager {
        return this._tankManager
    }

    //网格管理类
    protected _gManager: gridManager;
    public set gManager(v: gridManager) {
        this._gManager = v;
    }
    public get gManager(): gridManager {
        return this._gManager
    }





    //射程
    protected _attackDis = 6;
    public set attackDis(v: number) {
        this._attackDis = v;
    }
    public get attackDis(): number {
        return this._attackDis
    }


    //目标坦克距离(用来存储 做排序继续拿)
    protected _targetDis;
    public set targetDis(v: number) {
        this._targetDis = v;
    }
    public get targetDis(): number {
        return this._targetDis;
    }

    //目标tank
    protected _targetNode: element;
    public set targetNode(v: element) {
        this._targetNode = v;
    }
    public get targetNode(): element {
        return this._targetNode
    }

    //由于设计停止移动,在closelist中的位置
    protected _stopIndex: number;
    public set stopIndex(v: number) {
        this._stopIndex = v;
    }
    public get stopIndex(): number {
        return this._stopIndex;
    }


    //路径
    protected _closeList: grid_c[] = [];
    public set closeList(v: grid_c[]) {
        this._closeList = v;
    }
    public get closeList(): grid_c[] {
        return this._closeList
    }


    //当前站位的格子
    protected _inObstaleGrid: grid_c;
    public get inObstaleGrid(): grid_c {
        return this._inObstaleGrid
    }



    //Hp(血条)
    protected _hp: number = 100;
    public set hp(v: number) {
        var hpComp = this.node.getChildByName("hp");
        if (v < 100 && v > 0) {
            hpComp.active = true;
            hpComp.getChildByName("forward").getComponent(Sprite).fillStart = 1 - v / 100;
        } else {
            //清空状态
            hpComp.active = false;
            this.clearElement()
        }
        this._hp = v;
    }
    public get hp(): number {
        return this._hp;
    }



    //死亡状态
    protected _die: boolean = false;

    public set die(v: boolean) {
        this._die = v;
    }
    public get die(): boolean {
        return this._die
    }


    //开火间隔时间
    protected _fireSpace: number = 1;
    public set fireSpace(v: number) {
        this._fireSpace = v;
    }
    public get fireSpace(): number {
        return this._fireSpace;
    }


    //是否暂停
    protected _isPause: boolean;
    public get isPause(): boolean {
        return this._isPause;
    }
    public set isPause(v: boolean) {
        this.pause(v);
        this._isPause = v;
    }





    //用于对象池 是否休眠
    private _isSleep: boolean = false;
    public set sleep(v: boolean) {
        //this.node.active = !v;
        this.getComponent(BoxCollider2D).enabled = !v;

        if (v == true) {
            this.realSleep = v;
        }
        else {
            setTimeout(() => {
                this.realSleep = v;
            }, 2000);
        }

        this._isSleep = v;
    }
    public get sleep(): boolean {
        return this._isSleep;
    }

    public realSleep: boolean = false;


    //获取位置
    protected getPosition(g: grid_c) {
        return this.node.parent.parent.getComponent(gridManager).gridComponentArr[g.cellX][g.cellX].node.getPosition();
    }


    //最近一次动画
    protected lastTweenMove: Tween<Node> = null;




    //清除障碍的
    public clearElement() {
        this._closeList.length = 0;
        this.getComponent(aStar).closeList.length = 0;
        this.stopIndex = 0;
    }




    //开始导航


    //开始移动
    navigationMove(closeList: grid_c[]) {
        if (!this.node)
            return;
        //从第0个点开始移动
        var moveIndex = 0;
        setTimeout(() => {
            if (!this.sleep)
                this.tweenMove(moveIndex, closeList);
            //console.warn("导航结束:", moveIndex, closeList.length);
        }, 0);

    }

    public destroyTarget() {
        this.destorySelf();
    }


    //销毁
    protected destorySelf() {
        this.sleep = true;

        if (this.lastTweenMove) {
            this.lastTweenMove.removeSelf();
            this.lastTweenMove = null;
        }
        var star = this.getComponent(aStar);
        //设置到屏幕外的位置
        this.node.position = new Vec3(-200, 500, 0)

        //停止索引
        //star.resetGridArr();
        var tManager = this.node.parent.parent.getComponent(tankManager);
        var gManager = this.node.parent.parent.getComponent(gridManager);
        //销毁当前网格障碍
        if (star.nodeInGridCellIndex)
            gManager.gridComponentArr[this, star.nodeInGridCellIndex.x][this, star.nodeInGridCellIndex.y].isObstacle = false;

        // tManager.synGridCollectionState();
        //销毁自己
        var destoryFun = () => {
            if (this.node) {
               
                //移除---------------------------------------------
                var index = tManager.nodeCollection.indexOf(this);
                if (index != -1) {
                    tManager.nodeCollection.splice(index, 1);
                    console.log("销毁移除了:", index);
                }
                //-------------------------------------------------
                //清空对象
                for (var i = 0; i < tManager.nodeCollection.length; i++) {
                    var target = tManager.nodeCollection[i].targetNode;
                    if (target == this) {
                        target = null;
                        break;
                    }
                }
            }
        }
        //隐藏
        this.node.active = false;
        //设置大小为0 避免tween出现飞跃现象
        this.node.scale=new Vec3(0,0,0);
        //生成爆炸
        switch (this.key) {
            case "tank":
                tManager.expolision(new Vec2(star.nodeInGridCellIndex.x, star.nodeInGridCellIndex.y));
                this.getComponent(Sprite).color = new Color(0, 0, 0, 255);
                //this.node.getChildByName("root").active = false;
                this.isPause = false;
                setTimeout(() => {
                    destoryFun();
                }, 1500);
                break;
            // case "boy01":
            //     destoryFun();
            //     break;
            // case "pig":
            //     destoryFun();
            //     break;

            default:
                this.isPause = false;
                destoryFun();
        }




    }

    protected pause(p: boolean) {

    }



    update(deltaTime: number) {

    }
}


