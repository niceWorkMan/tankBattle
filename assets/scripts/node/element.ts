import { _decorator, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, Sprite, Vec2 } from 'cc';
import { aStar } from '../core/aStar';
import { grid } from '../grid';
import { gridManager } from '../gridManager';
import { tankManager } from '../tankManager';
import { enumTeam } from '../common/enumTeam';
const { ccclass, property } = _decorator;

@ccclass('element')
export class element extends Component {


    protected hpComp: Node;
    protected nodeCollider: Collider2D;
    protected nodeLayer: Node;

    start() {
        this.initComponent();
    }

    initComponent() {
        this.tManager = this.node.parent.parent.getComponent(tankManager);
        this.gManager = this.node.parent.parent.getComponent(gridManager);
        this.hpComp = this.node.getChildByName("hp");
        if (this.tManager.node) {
            this.nodeLayer = this.tManager.node.getChildByName("tankLayer");
        }
        else {
            alert("设置Layer失败")
        }


        //监听碰撞
        this.nodeCollider = this.getComponent(Collider2D);
        this.nodeCollider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);

        //获取导航网格
        this.star = this.getComponent(aStar);
        this.star.tk = this;
        this.star.tManager = this.tManager;
        //添加至导航集合
        var dex = this.tManager.aStartCollection.indexOf(this.star);
        if (dex == -1) {
            this.tManager.aStartCollection.push(this.star);
        }

        //等待一帧 开始导航******
        setTimeout(() => {
            this.startNav();
        }, 0);

    }

    //碰撞  
    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) { };
    //移动
    protected tweenMove(nextIndex: number, closeList: grid[]) { };


    //外部调用 继续移动
    public tweenMoveOn(){
        this.tweenMove(this.stopIndex,this._closeList);
    }

    //坦克移动单元格时间
    protected moveSpeed = 0.1;
    //坦克转向时间
    protected rotateSpeed = 0.2;
    //等待障碍物时间 单位/秒
    private _waitObsTime = 0.5;
    public get waitObsTime(): number {
        return this._waitObsTime;
    }

    //当前Tank所在格子
    private _nodeInGridCellIndex: Vec2;
    public set nodeInGridCellIndex(v: Vec2) {
        this._nodeInGridCellIndex = v;
    }
    public get nodeInGridCellIndex(): Vec2 {
        return this._nodeInGridCellIndex;
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


    //aStart;
    protected _aStar: aStar;
    public set star(v: aStar) {
        this._aStar = v;
    }
    public get star(): aStar {
        return this._aStar
    }

    //起始点
    protected _startGrid;
    public get startGrid(): grid {
        return this._startGrid
    }
    public set startGrid(v: grid) {
        this._startGrid = v;
    }

    //结束点
    protected _endGrid;
    public get endGrid(): grid {
        return this._endGrid
    }
    public set endGrid(v: grid) {
        this._endGrid = v;
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
    protected _closeList: grid[];
    public set closeList(v: grid[]) {
        this._closeList = v;
    }
    public get closeList(): grid[] {
        return this._closeList
    }


    //当前站位的格子
    protected _inObstaleGrid: grid;
    public get inObstaleGrid(): grid {
        return this._inObstaleGrid
    }



    //Hp(血条)
    protected _hp: number = 100;
    public set hp(v: number) {
        if (v < 100 && v > 0) {
            this.hpComp.active = true;
            this.hpComp.getChildByName("forward").getComponent(Sprite).fillStart = 1 - v / 100;
        } else {
            this.hpComp.active = false;
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
    protected _isPause:boolean;
    public get isPause() : boolean {
        return this._isPause;
    }
    public set isPause(v : boolean) {
        this._isPause = v;
    }
    


    //开始导航
     startNav() {
        if (!this.star) {
            this.star = this.getComponent(aStar);
        }
        //重置数据
        this.star.resetGridArr();
        this.tManager.synCurrentState(this._aStar);
        //----------------------------------------------------
        //同步基础网格状态
        //寻路
        this.startGrid.cellX = this.nodeInGridCellIndex.x;
        this.startGrid.cellY = this.nodeInGridCellIndex.y;

        this.star.getPriceMixNeighborGrid(this.star.gridNodeArr[this.startGrid.cellX][this.startGrid.cellY], this.star.gridNodeArr[this.endGrid.cellX][this.endGrid.cellY]);
        this.star.tk = this;

    }

    //开始移动
     navigationMove(closeList: grid[]) {
        if (!this.node)
            return;
        //从第0个点开始移动
        var moveIndex = 0;
        setTimeout(() => {
            this.tweenMove(moveIndex, closeList);
            console.warn("导航结束:", moveIndex, closeList.length);
        }, 0);

    }


    //销毁
    protected destorySelf() {
        //销毁当前网格障碍
        if (this.nodeInGridCellIndex)
            this.gManager.gridComponentArr[this, this.nodeInGridCellIndex.x][this, this.nodeInGridCellIndex.y].isObstacle = false;

        this.tManager.synGridCollectionState();
        //从数组中移除
        var dex = this.tManager.nodeCollection.indexOf(this);
        if (dex != -1) {
            this.tManager.nodeCollection.splice(dex, 1);
        }

        //销毁自己
        if (this.node) {
            this.tManager.synGridCollectionRemove(this.star);
            this.node.destroy();
        }

    }



    update(deltaTime: number) {

    }
}


