import { _decorator, color, Color, Component, instantiate, Node, Sprite, tween, Vec2, Vec3 } from 'cc';
import { base } from '../node/base';
import { grid } from '../grid';
import { gridManager } from '../gridManager';
import { editorManager } from '../editorManager';
import { tree } from '../obstale/tree';
const { ccclass, property } = _decorator;

@ccclass('buildBase')
export class buildBase extends base {

    protected _data: any;


    //塔基占位
    protected towerObstale: boolean = false;

    protected towerOb


    //选中动画
    protected _tweenSelect: any;


    //是否已经被放置
    private _isPlace: boolean = false;
    public set isPlace(v: boolean) {
        if (v) {
            this.GenerateBElementSpawnPoint();
        }
        this._isPlace = v;
    }
    public get isPlace(): boolean {
        return this._isPlace
    }




    public get value(): string {
        return
    }

    //放置记录占位
    public _signGrids: grid[] = [];

    //清除动画
    public clearAnim() {
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
        if (this._tweenSelect) {
            this._tweenSelect.stop();
            this._tweenSelect.removeSelf();
            iconSprite.color = new Color(225, 225, 255, 255)
            iconSprite.node.scale = new Vec3(1, 1, 1)
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
            this.isPlace = true;
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

    //获取建筑信息
    public getOptionBuildData(): any { }




    //获取建筑周围空闲格子
    private getBuildNeighborFreeGrid() {
        var freeGrids: Vec2[] = [];
        var parentLayer = this.node.parent.parent.getChildByName("effectLayer")
        var maxtri = gridManager.Instance.getGridMatrix;
        //搜索边界设置为5
        var limit = 5;
        var lx = this.cellX - limit;
        var ly = this.cellY - limit;
        var len = limit * 2 + 1
        for (var i = lx; i < lx + len; i++) {
            for (var j = ly; j < ly + len; j++) {
                if ((i >= 0 && i < maxtri.row) && (j >= 0 && j < maxtri.colum)) {
                    if (gridManager.Instance.gridComponentArr[i][j].isStatic == false) {
                        //图形调试-------------------------------------------------------------
                        // var obj = instantiate(editorManager.Instance.edtorNode)
                        // parentLayer.addChild(obj)
                        // obj.position = gridManager.Instance.gridComponentArr[i][j].node.position;
                        //-----------------------------------------------------------------
                        freeGrids.push(new Vec2(i, j))
                    }
                }
            }
        }
        return freeGrids;
        //找出
    }


    //找到当前建筑离得最近的资源
    private getNearestResGrid(key: string): Vec2 {
        var parentLayer = this.node.parent.parent.getChildByName("effectLayer")

        var cls = editorManager.Instance.propertyConfig[key].class;
        var obstaleLayer: Node = this.node.parent.parent.getChildByName("obstaleLayer");
        var objs: any[] = obstaleLayer.getComponentsInChildren(cls);

        var MaxDis = 100;
        var selectNode: any = null;
        console.log("配置:", key, cls);
        console.log("树长度:", objs.length);

        objs.forEach(element => {
            var sum = Math.pow(Math.abs(element.cellX - this.cellX), 2) + Math.pow(Math.abs(element.cellY - this.cellY), 2)
            var dis = Math.sqrt(sum);
            if (dis < MaxDis) {
                selectNode = element;
                MaxDis = dis;
            }
        });

        //图形调试-------------------------------------------------------------
        var obj = instantiate(editorManager.Instance.edtorNode)
        parentLayer.addChild(obj)
        obj.position = gridManager.Instance.gridComponentArr[selectNode.cellX][selectNode.cellY].node.position;
        obj.getComponent(Sprite).color = new Color(200, 200, 0, 225)
        //---------------------------------------------------------------------

        return new Vec2(selectNode.cellX, selectNode.cellY);
    }


    //生成 两个位置  起点(建筑位置) - 终点(资源位置)
    protected GenerateBElementSpawnPoint():Vec2[] {
        var parentLayer = this.node.parent.parent.getChildByName("effectLayer")

        var res = this.getNearestResGrid("tree");
        if (res) {
            var points: Vec2[] = this.getBuildNeighborFreeGrid();
            var MaxDis = 100;
            var Max2 = 100;
            var selectNode: any = null;
            points.forEach(element => {
                console.log("树");

                //空闲格子到资源点的距离
                var sum1 = Math.pow(Math.abs(element.x - res.x), 2) + Math.pow(Math.abs(element.y - res.y), 2)
                //空闲格子到建筑的距离
                var sum2 = Math.pow(Math.abs(element.x - this.cellX), 2) + Math.pow(Math.abs(element.y - this.cellY), 2)
                var dis1 = Math.sqrt(sum1);
                var dis2 = Math.sqrt(sum2);

                var dis = dis1 + dis2 + dis2;
                if (dis < MaxDis) {
                    selectNode = element;
                    MaxDis = dis;
                }
            });
            //图形调试-------------------------------------------------------------
            var obj = instantiate(editorManager.Instance.edtorNode)
            parentLayer.addChild(obj)
            obj.position = gridManager.Instance.gridComponentArr[selectNode.x][selectNode.y].node.position;
            obj.getComponent(Sprite).color = new Color(200, 100, 0, 225)
            //---------------------------------------------------------------------
            //[起点(建筑位置) - 终点(资源位置)]
            return [selectNode,res];

        } else {
            //搜索资源失败
            console.error("搜索资源失败")
            return null;
        }

    }






}


