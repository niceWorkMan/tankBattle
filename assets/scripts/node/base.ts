import { _decorator, BoxCollider2D, Component, Node, Sprite, Vec2 } from 'cc';
import { buildType } from '../common/buildType';
import { enumTeam } from '../common/enumTeam';
import { tankManager } from '../tankManager';
import { gridManager } from '../gridManager';
const { ccclass, property } = _decorator;

@ccclass('base')
export class base extends Component {

    //配置键
    protected _key: string;
    public set key(v: string) {
        this._key = v;
    }
    public get key(): string {
        return this._key
    }



    //建筑类型
    protected _buildType: buildType = buildType.none;
    public get buildType(): buildType {
        return this._buildType;
    }
    public set buildType(v: buildType) {
        this._buildType = v;
    }


    //所在索引(非移动的Build使用)
    protected _cellX: number;
    protected _cellY: number
    public get cellX(): number {
        return this._cellX;
    }
    public get cellY(): number {
        return this._cellY
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
    protected _targetNode: base;
    public set targetNode(v: base) {
        this._targetNode = v;
    }
    public get targetNode(): base {
        return this._targetNode
    }



    //连续发射函数(具有发射条件的对象)
    protected _fireInterval = null;
    public set fireInterva(v: any) {
        this._fireInterval = v;
    }
    public get value(): any {
        return this._fireInterval;
    }

    //开火间隔时间
    protected _fireSpace: number = 1;
    public set fireSpace(v: number) {
        this._fireSpace = v;
    }
    public get fireSpace(): number {
        return this._fireSpace;
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


    //用于对象池 是否休眠
    private _isSleep: boolean = false;
    public set sleep(v: boolean) {
        //this.node.active = !v;
        this.getComponent(BoxCollider2D).enabled = !v;
        if (v == true) {
            //延迟1s设置realSleep=true,让sleep打断的递归都跳出
            setTimeout(() => {
                this.realSleep = true;
            }, 2000);
        }
        else {
            this.realSleep = v;
        }
        this._isSleep = v;
    }
    public get sleep(): boolean {
        return this._isSleep;
    }

    public realSleep: boolean = false;


    //销毁
    public destroyTarget() {

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


    protected clearElement() {

    }

    protected pause(p: boolean) {

    }





    start() {

    }

    update(deltaTime: number) {

    }
}


