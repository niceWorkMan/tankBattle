
/*
*create date 2024-08-23 update date 2024-08-23
*auth by PengTao
*/


import { _decorator, Component, EventKeyboard, ImageAsset, Input, input, instantiate, JsonAsset, KeyCode, loader, math, Node, Prefab, random, resources, Sprite, SpriteFrame, SystemEvent, Vec2, Vec3 } from 'cc';
import { grid } from './grid';
import { tank } from './tank';
import { aStar } from './core/aStar';
import { tankManager } from './tankManager';
const { ccclass, property } = _decorator;

@ccclass('gridManager')
export class gridManager extends Component {
    @property(Prefab) gridPrefab: Prefab;
    @property(Prefab) tankBase: Prefab;
    //tank管理类
    private _tankManager:tankManager;
    //格子组件数组
    private _gridComponentArr: grid[][] = [];
    public get gridComponentArr(): grid[][] {
        return this._gridComponentArr;
    }
    //grid起始位置
    private _gridStartPos = { x: -690, y: -270 }
    //坦克对象池
    private _tankPool: tank[] = [];
    //寻路脚本
    private _astar: aStar;

    //资源
    private _assetsLoad = {};


    get gridStartPos() {
        return this._gridStartPos;
    }

    private _gridMatrix = { row: 24, colum: 10 }
    get gridMatrix() {
        return this._gridMatrix;
    }

    start() {
        //按钮测试
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        //初始化挂载组件
        this.initAttatchComponent();
        //加载图片资源（生成grid）
        this.loadConfigAssets();
    }

    //矩阵尺寸
    public getGridMatrix() {
        return this._gridMatrix;
    }

    //初始化挂载组件
    initAttatchComponent() {
        this._astar = this.node.getComponent(aStar);
        this._tankManager=this.node.getComponent(tankManager);
    }

    //初始化网格
    spawnGrid(spriteFrame: SpriteFrame) {
        for (var i = 0; i < this._gridMatrix.row; i++) {
            var _compArr_ins: grid[] = [];
            for (var j = 0; j < this._gridMatrix.colum; j++) {
                var _grid: Node = instantiate(this.gridPrefab);
                this.node.addChild(_grid);
                var _gridSprite = _grid.getComponent(Sprite);
                _gridSprite.spriteFrame = spriteFrame;
                _grid.setPosition(new Vec3(this.gridStartPos.x + i * 60, this.gridStartPos.y + j * 60));
                var gScript = _grid.getComponent(grid)

                //加入一维数组
                _compArr_ins.push(gScript);
                if (gScript) {
                    gScript.setGridManager(this);
                    gScript.setIndexLabel(i, j);
                    //默认无障碍物
                    gScript.setObstacle(false);
                }
            }
            //加入二维数组
            this._gridComponentArr.push(_compArr_ins)
        }
    }
    //键盘监听
    onKeyDown(event: EventKeyboard) {
        this._tankManager.onKeyDown(event);
        switch (event.keyCode) {
            case KeyCode.KEY_A:

                //初始化障碍物
                //this.exampleSetObstacle();
                //测试寻路
                //this.exampleAStarPath(new Vec2(0, 9), new Vec2(23, 9));
                //this.exampleAStarPath(new Vec2(0, 0), new Vec2(23, 0));
                break;


            case KeyCode.KEY_B:
                break;
        }
    }

    //通过ID获取位置
    getPositionByCellIndex(x, y) {
        console.log(x, y);
        var originPos = this._gridComponentArr[x][y].node.getPosition();
        return originPos;
    }

    checkXY(x, y) {
        var isVaildIndex = (x >= 0 && x <= 23) && (y >= 0 && y <= 9);
        if (!isVaildIndex)
            console.error("输入索引越界");
        return isVaildIndex;
    }


    //生成坦克在格子上
    generateTankByCellIndex(x, y) {
        this.checkXY(x, y);
        var tank: Node = instantiate(this.tankBase);
        this.node.addChild(tank);
        var pos = this.getPositionByCellIndex(x, y);
        console.log("pos", pos);
        tank.setPosition(pos);
    }



    loadConfigAssets() {
        resources.load("config/imageAssetsConf", JsonAsset, (err, res) => {
            var jsonObj = res.json;
            var data = jsonObj.data;
        });
        resources.load("image/dotArea", ImageAsset, (err: any, imageAsset) => {
            //var content =  jsonAsset.toString();
            if (err) {
                console.log(err);
                return;
            }
            var spriteFrame = SpriteFrame.createWithImage(imageAsset);
            var obj = {};
            this._assetsLoad["dotArea"] = spriteFrame;
            console.log("加载完成:", imageAsset);

            //生成网格
            this.spawnGrid(spriteFrame);
            
            this._tankManager.gameInit();
        })

    }


    private exampleAStarPath(startPos: Vec2, endPos: Vec2) {
        //***复制一个数组用于查询路径算法,原始路径保留不变
        var copyGridCompArr = this._gridComponentArr.slice();
        var newAStar = new aStar()
        //设置地图矩阵边界
        newAStar.gridMatri = this._gridMatrix;
        //传递copy数组到当前寻路地图
        newAStar.setGridNodeArr(copyGridCompArr);

        //寻路调用
        var start: grid = copyGridCompArr[startPos.x][startPos.y];
        var end: grid = copyGridCompArr[endPos.x][endPos.y];
        start.setSpriteColor({ r: 25, g: 88, b: 219, a: 255 })
        end.setSpriteColor({ r: 25, g: 88, b: 219, a: 255 })
        newAStar.getPriceMixNeighborGrid(end, start);
    }

    private exampleSetObstacle() {
        for (var i = 1; i < 22; i++) {
            for (var j = 0; j <= 9; j++) {
                if (Math.random() > 0.7) {
                    this._gridComponentArr[i][j].setObstacle(true);
                }
            }
        }

        // this._gridNodeArr[12][9].getComponent(grid).setObstacle(true);
        // this._gridNodeArr[12][8].getComponent(grid).setObstacle(true);
        // this._gridNodeArr[13][8].getComponent(grid).setObstacle(true);
        // this._gridNodeArr[14][8].getComponent(grid).setObstacle(true);
        // this._gridNodeArr[15][8].getComponent(grid).setObstacle(true);
        // this._gridNodeArr[16][8].getComponent(grid).setObstacle(true); 
        // this._gridNodeArr[17][8].getComponent(grid).setObstacle(true);
        // this._gridNodeArr[18][8].getComponent(grid).setObstacle(true);
        // this._gridNodeArr[19][8].getComponent(grid).setObstacle(true);
    }



    //生成坦克
    spawnTankByCellPos(startPos: Vec2, endPos: Vec2) {
        //***复制一个数组用于查询路径算法,原始路径保留不变
        var copyGridCompArr = this._gridComponentArr.slice();
        var newAStar = new aStar()
        //设置地图矩阵边界
        newAStar.gridMatri = this._gridMatrix;
        //传递copy数组到当前寻路地图
        newAStar.setGridNodeArr(copyGridCompArr);


        //寻路调用
        var start: grid = copyGridCompArr[startPos.x][startPos.y].getComponent(grid);
        var end: grid = copyGridCompArr[endPos.x][endPos.y].getComponent(grid);
        // start.setSpriteColor({ r: 25, g: 88, b: 219, a: 255 })
        // end.setSpriteColor({ r: 25, g: 88, b: 219, a: 255 })
        newAStar.getPriceMixNeighborGrid(end, start);

        //生成实例
        var tankNode: Node = instantiate(this.tankBase);
        this.node.addChild(tankNode);
        var pos = this.getPositionByCellIndex(startPos.x, startPos.y);
        tankNode.setPosition(pos);

        //tank寻路数据赋值
        var tankCom: tank = tankNode.getComponent(tank);
        tankCom.aStar = newAStar;
    }



    update(deltaTime: number) {

    }
}


