import { _decorator, color, Color, Component, Node, Sprite, tween, Vec2, Vec3 } from 'cc';
import { base } from '../node/base';
import { grid } from '../grid';
const { ccclass, property } = _decorator;

@ccclass('buildBase')
export class buildBase extends base {

    protected _data: any;
    //选中动画
    protected _tweenSelect: any;

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
            // if (iconSprite.color) {
            //     this._tweenSelect = tween(cor)
            //         .to(1, { optcity: 0 }, {
            //             onUpdate: () => {
            //                 if (this.node)
            //                     iconSprite.color = new Color(225, 225, 225, cor.optcity);
            //             }
            //         }).to(1, { optcity: 225 }, {
            //             onUpdate: () => {
            //                 if (this.node)
            //                     iconSprite.color = new Color(225, 225, 225, cor.optcity);
            //             }
            //         })
            //         // 逐渐透明
            //         .start(); // 启动动画
            //     iconSprite.color = new Color(225, 225, 255, 100)
            // }

            // else {
            //     console.log("当前选中设置UI名称或父子节点出错");
            // }


            this._tweenSelect = tween(iconSprite.node)
                .to(0.5, {scale:new Vec3(1.3,1.3,1.3)}).to(0.3, {scale:new Vec3(1,1,1)}).start();

        }
        else {
            iconSprite.color = new Color(225, 225, 225, 225)
        }
    }

    public get data(): any {
        return this._data;
    }

    start() {

    }
    //建筑 占用格子
    private _obGrids: grid[] = []
    public get obGrids(): grid[] {
        return this._obGrids;
    }




    //初始化
    public init(pos: Vec2) {
        this._cellX = pos.x;
        this._cellY = pos.y;
    }



    //标记格子
    public signObGrids(g: grid) {
        if (this._obGrids.indexOf(g) == -1) {
            this._obGrids.push(g)
            g.isObstacle = true;
            g.isStatic = true;
        } else {
            console.error("销毁建筑时没清除 clearObGrids");
        }
    }

    //消除格子
    public clearObGrids() {
        this._obGrids.forEach(element => {
            element.isStatic = false;
            element.isObstacle = false;
        });
        this._obGrids.length = 0;
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


