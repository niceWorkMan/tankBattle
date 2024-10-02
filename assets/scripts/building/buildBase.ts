import { _decorator, color, Color, Component, Node, Sprite, tween, Vec2, Vec3 } from 'cc';
import { base } from '../node/base';
import { grid } from '../grid';
const { ccclass, property } = _decorator;

@ccclass('buildBase')
export class buildBase extends base {

    protected _data: any;


    //塔基占位
    protected towerObstale:boolean=false;
    //选中动画
    protected _tweenSelect: any;


    //是否已经被放置
    protected _isPlace: boolean = false;
    //放置记录占位
    public _signGrids: grid[] = [];

    //清除动画
    public clearAnim(){
        var icon = this.node.getChildByName("Icon")
        var iconSprite: Sprite;
        //带着子层级
        if (icon) {
            iconSprite = icon.getComponent(Sprite)
        }
        //没有子层级
        else {
            iconSprite = this.node.getComponent(Sprite)
        }
        if(this._tweenSelect){
            this._tweenSelect.stop();
            this._tweenSelect.removeSelf();
            iconSprite.color = new Color(225, 225, 255, 255)
            iconSprite.node.scale=new Vec3(1,1,1)
        }
    }
    //选中动画
    public selectAnim(isSelect: boolean) {
        var icon = this.node.getChildByName("Icon")
        var iconSprite: Sprite;
        //带着子层级
        if (icon) {
            iconSprite = icon.getComponent(Sprite)
        }
        //没有子层级
        else {
            iconSprite = this.node.getComponent(Sprite)
        }

        iconSprite.color = new Color(225, 225, 255, 255)
        const cor = { optcity: 225 }
        if (isSelect) {
            this._tweenSelect = tween(iconSprite.node)
                .to(0.5, { scale: new Vec3(1.3, 1.3, 1.3) }).to(0.3, { scale: new Vec3(1, 1, 1) }).union().repeatForever().start();

        }
        else {
            iconSprite.color = new Color(225, 225, 225, 225)
            if (this._tweenSelect) {
                this._tweenSelect.stop();
                this._tweenSelect.removeSelf();
            }
        }
    }
    //放置动画
    public unPlaceAnim(isSelect: boolean) {


        var icon = this.node.getChildByName("Icon")
        var iconSprite: Sprite;
        //带着子层级
        if (icon) {
            iconSprite = icon.getComponent(Sprite)
        }
        //没有子层级
        else {
            iconSprite = this.node.getComponent(Sprite)
        }
        const cor = { optcity: 225 }

        if (isSelect) {
            this._tweenSelect = tween(cor)
                .to(1, { optcity: 0 }, {
                    onUpdate: () => {
                        if (this.node)
                            iconSprite.color = new Color(225, 225, 225, cor.optcity);
                    }
                }).to(1, { optcity: 225 }, {
                    onUpdate: () => {
                        if (this.node)
                            iconSprite.color = new Color(225, 225, 225, cor.optcity);
                    }
                }).union().repeatForever().start(); // 启动动画
        } else {
            //调用动画结束 是放置完成
            this._isPlace = true;
            if (this._tweenSelect) {
                this._tweenSelect.stop();
                this._tweenSelect.removeSelf();
            }

            iconSprite.color = new Color(225, 225, 225, 225);
        }


    }


    public get data(): any {
        return this._data;
    }

    start() {

    }




    //初始化
    public init(pos: Vec2) {
        this._cellX = pos.x;
        this._cellY = pos.y;
    }



    //标记格子
    public signObGrids(g: grid) {
        this._signGrids.forEach(element => {
            element.isStatic = true;
            element.isObstacle = true;
        });
    }

    //消除格子
    public clearObGrids() {
        this._signGrids.forEach(element => {
            element.isStatic = false;
            element.isObstacle = false;
        });
        //移除动画
        if (this._tweenSelect) {
            this._tweenSelect.stop();
            this._tweenSelect = null;
        }
        if (this.node)
            this.node.destroy();
    }

    /**
     * 默认是半径为1格子的范围=50
     */
    protected _attackRadius = 50;





    //初始化数据
    public initBuild(data) {
        this._data = data;
    }

    update(deltaTime: number) {

    }


    public getOptionBuildData(): any { }
}


