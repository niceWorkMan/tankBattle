import { _decorator, BoxCollider2D, Collider2D, Color, Component, Contact2DType, IPhysics2DContact, Node, Sprite, Tween, Vec2, Vec3 } from 'cc';
import { aStar } from '../core/aStar';
import { gridManager } from '../gridManager';
import { tankManager } from '../tankManager';
import { enumTeam } from '../common/enumTeam';
import { grid_c } from '../core/grid_c';
import { buildType } from '../common/buildType';
import { base } from './base';
const { ccclass, property } = _decorator;

@ccclass('element')
export class element extends base {
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


    //获取位置
    protected getPosition(g: grid_c) {
        return this.node.parent.parent.getComponent(gridManager).gridComponentArr[g.cellX][g.cellX].node.getPosition();
    }


    //最近一次动画
    protected lastTweenMove: Tween<Node> = null;






    //清除障碍的
    protected clearElement(): void {
        this._closeList.length = 0;
        var star = this.getComponent(aStar);
        if (star)
            star.closeList.length = 0;
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


    //重载函数
    public destroyTarget(): void {
        this.destorySelf();
    }


    //销毁 element元素的
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
        this.closeList.length = 0;
        star.resetGridArr();
        var tManager = this.node.parent.parent.getComponent(tankManager);
        var gManager = this.node.parent.parent.getComponent(gridManager);
        //销毁当前网格障碍
        if (star.nodeInGridCellIndex)
            gManager.gridComponentArr[this, star.nodeInGridCellIndex.x][this, star.nodeInGridCellIndex.y].isObstacle = false;

        // tManager.synGridCollectionState();
        //销毁自己
        var destoryFun = () => {

        }
        //隐藏
        this.node.active = false;
        //设置大小为0 避免tween出现飞跃现象
        this.node.scale = new Vec3(0, 0, 0);
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




    update(deltaTime: number) {

    }
}


