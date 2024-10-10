import { _decorator, CacheMode, color, Color, Component, instantiate, Node, Sprite, tween, Vec2, Vec3 } from 'cc';
import { base } from '../node/base';
import { grid } from '../grid';
import { gridManager } from '../gridManager';
import { editorManager } from '../editorManager';
import { obstaleBase } from '../obstale/obstaleBase';
const { ccclass, property } = _decorator;

@ccclass('buildBase')
export class buildBase extends base {
    //初始化数据
    protected _data: any;

    //采集目标Key
    protected _targetKey:string;
    public get targetKey() : string {
        return this._targetKey;
    }
    

    //塔基占位
    protected towerObstale: boolean = false;


    //工人
    protected _workers: base[] = [];
    public get workers(): base[] {
        return this._workers;
    }


    protected onDestroy(): void {
        for (var i = 0; i < this._workers.length; i++) {
            if (this._workers[i]) {
                this._workers[i].destroyTarget();
            }
        }
    }

    /**
     * 默认最大数量3个工人
     */
    protected _workerNumer: number = 3;

    //当前建筑对应采集资源对象
    protected _digResTarget: obstaleBase = null;
    public get digResTarget(): obstaleBase {
        return this._digResTarget;
    }



    //选中动画
    protected _tweenSelect: any;

    /**
     * 掘取资源首位点
     */
    protected _resPathPoints: Vec2[] = [];
    public get resPathPoints(): Vec2[] {
        return this._resPathPoints;
    }
    public set resPathPoints(v: Vec2[]) {
        this._resPathPoints = v;
    }

    //是否已经被放置
    private _isPlace: boolean = false;
    public set isPlace(v: boolean) {
        if (v) {
            var posArr = this.GenerateBElementSpawnPoint(this._targetKey);
            this.buildStartWork(posArr)
            this._resPathPoints = posArr;
        }
        this._isPlace = v;
    }
    public get isPlace(): boolean {
        return this._isPlace
    }



    //开始还是结束
    public isStartOrEndPos(cuPos: Vec2): number {
        if (this._resPathPoints.length == 2) {
            for (var i = 0; i < this._resPathPoints.length; i++) {
                if (this._resPathPoints[i].x == cuPos.x && this._resPathPoints[i].y == cuPos.y) {
                    return i;
                }
            }
        } else {
            return null;
        }
    }




    //放置记录占位
    public _signGrids: grid[] = [];

    //清除动画
    public clearAnim() {
        if (!this.node)
            return;
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
        if (!this.node)
            return;
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
        if (!this.node)
            return;

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
        //特殊处理
        if (this.node.parent.name == "tBase") {
            var cls = editorManager.Instance.propertyConfig["tBase"].class;
            var com: any = this.node.parent.getComponent(cls);
            com.towerObstale = false;
        } else {
            //一般站位处理
            this._signGrids.forEach(element => {
                element.isStatic = false;
                element.isObstacle = false;
            });
            this._signGrids.length = 0
        }

        //占位数组为空
        //this._signGrids.length=0;
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
        var obstaleLayer: Node = editorManager.Instance.node.getChildByName("obstaleLayer");
        var objs: any[] = obstaleLayer.getComponentsInChildren(cls);

        var MaxDis = 100;
        var selectNode: any = null;
        //查到的对象资源
        var resTarget: obstaleBase = null;

        objs.forEach(element => {
            var sum = Math.pow(Math.abs(element.cellX - this.cellX), 2) + Math.pow(Math.abs(element.cellY - this.cellY), 2)
            var dis = Math.sqrt(sum);
            if (dis < MaxDis) {
                selectNode = element;
                MaxDis = dis;
                //资源对象
                resTarget = element;
            }
        });
        //设置资源对象
        this._digResTarget = resTarget;

        console.log("设置资源对象:", this._digResTarget.node.name);


        //图形调试-------------------------------------------------------------
        // var obj = instantiate(editorManager.Instance.edtorNode)
        // parentLayer.addChild(obj)
        // obj.position = gridManager.Instance.gridComponentArr[selectNode.cellX][selectNode.cellY].node.position;
        // obj.getComponent(Sprite).color = new Color(200, 200, 0, 225)
        //---------------------------------------------------------------------


        return new Vec2(selectNode.cellX, selectNode.cellY);
    }


    //生成 两个位置  起点(建筑位置) - 终点(资源位置)
    public GenerateBElementSpawnPoint(classkey: string): Vec2[] {

        var resBuildNameArr: string[] = ["woodBox", "oreBox"]
        //不属于采集类建筑
        if (resBuildNameArr.indexOf(this.key) == -1) {
            return;
        }



        var maxtri = gridManager.Instance.getGridMatrix;

        var parentLayer = this.node.parent.parent.getChildByName("effectLayer")

        var res = this.getNearestResGrid(classkey);
        if (res) {
            var points: Vec2[] = this.getBuildNeighborFreeGrid();
            var MaxDis = 100;
            var selectNode: any = null;
            points.forEach(element => {
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


            //找目标格子四周空闲
            var resAroundGrids: Vec2[] = [];
            for (var i = res.x - 1; i <= res.x + 1; i++) {
                for (var j = res.y - 1; j <= res.y + 1; j++) {
                    if ((i >= 0 && i < maxtri.row) && (j >= 0 && j < maxtri.colum) && !(i == res.x && j == res.y) && !(i != res.x && j != res.y)) {
                        if (gridManager.Instance.gridComponentArr[i][j].isStatic == false) {
                            resAroundGrids.push(new Vec2(gridManager.Instance.gridComponentArr[i][j].cellX, gridManager.Instance.gridComponentArr[i][j].cellY));

                            //图形调试-------------------------------------------------------------
                            // var obj2 = instantiate(editorManager.Instance.edtorNode)
                            // parentLayer.addChild(obj2)
                            // obj2.position = gridManager.Instance.gridComponentArr[i][j].node.position;
                            // obj2.getComponent(Sprite).color = new Color(200, 100, 0, 225)
                            //--------------------------------------------------------------------
                        }
                    }
                }
            }
            var MaxAroundGridDis = 100;
            //查询周围格子到建筑最短距离
            var aroundNode: any = null;
            resAroundGrids.forEach(element => {
                //空闲格子到资源点的距离
                var sum = Math.pow(Math.abs(element.x - selectNode.x), 2) + Math.pow(Math.abs(element.y - selectNode.y), 2)
                var dis = Math.sqrt(sum);
                if (dis < MaxAroundGridDis) {
                    aroundNode = element;
                    MaxAroundGridDis = dis;
                }
            });


            //图形调试-------------------------------------------------------------
            // var obj = instantiate(editorManager.Instance.edtorNode)
            // parentLayer.addChild(obj)
            // obj.position = gridManager.Instance.gridComponentArr[selectNode.x][selectNode.y].node.position;
            // obj.getComponent(Sprite).color = new Color(200, 100, 0, 225)
            //---------------------------------------------------------------------
            //图形调试-------------------------------------------------------------
            // var obj2 = instantiate(editorManager.Instance.edtorNode)
            // parentLayer.addChild(obj2)
            // obj2.position = gridManager.Instance.gridComponentArr[aroundNode.x][aroundNode.y].node.position;
            // obj2.getComponent(Sprite).color = new Color(200, 100, 0, 225)
            //---------------------------------------------------------------------
            //[起点(建筑位置) - 终点(资源位置)]
            return [selectNode, aroundNode];

        } else {
            //搜索资源失败
            console.error("搜索资源失败")
            return null;
        }

    }


    //建筑开始工作
    protected buildStartWork(posArr: Vec2[]) { }






}


