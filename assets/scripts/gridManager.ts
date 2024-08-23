
/*
*create date 2024-08-23 update date 2024-08-23
*auth by PengTao
*/


import { _decorator, Component, EventKeyboard, ImageAsset, Input, input, instantiate, JsonAsset, KeyCode, loader, math, Node, Prefab, random, resources, Sprite, SpriteFrame, SystemEvent, Vec2, Vec3 } from 'cc';
import { grid } from './grid';
import { tank } from './tank';
import { aStar } from './core/aStar';
const { ccclass, property } = _decorator;

@ccclass('gridManager')
export class gridManager extends Component {
    @property(Prefab) gridPrefab: Prefab;
    @property(Prefab) tankBase: Prefab;
    //格子对象数组
    private _gridNodeArr: Node[][] = [];
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
    }

    //初始化网格
    spawnGrid(spriteFrame: SpriteFrame) {
        for (var i = 0; i < this._gridMatrix.row; i++) {
            var _gridArr_ins: Node[] = [];
            for (var j = 0; j < this._gridMatrix.colum; j++) {
                var _grid: Node = instantiate(this.gridPrefab);
                this.node.addChild(_grid);
                var _gridSprite = _grid.getComponent(Sprite);
                _gridSprite.spriteFrame = spriteFrame;
                _grid.setPosition(new Vec3(this.gridStartPos.x + i * 60, this.gridStartPos.y + j * 60));
                var gScript = _grid.getComponent(grid)

                //加入一维数组
                _gridArr_ins.push(_grid);
                if (gScript) {
                    gScript.setGridManager(this);
                    gScript.setIndexLabel(i, j);
                    //默认无障碍物
                    gScript.setObstacle(false);
                }
            }
            //加入二维数组
            this._gridNodeArr.push(_gridArr_ins);
        }
        this._astar.setGridNodeArr(this._gridNodeArr);
    }
    //键盘监听
    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                // for (var i = 0; i < 15; i++) {
                //     var x = Math.ceil(Math.random() * 23)
                //     var y = Math.ceil(Math.random() * 9)
                //     this.generateTankByCellIndex(x, y);
                // }
                //this._astar.caculate(this._gridNodeArr[3][4].getComponent(grid),this._gridNodeArr[10][8].getComponent(grid))



                this.testSetObstacle();
                this.testAstarPath(new Vec2(0, 0), new Vec2(23, 9));


                break;


            case KeyCode.KEY_B:
                console.log(this._astar.getPathList.length);
                break;
        }
    }

    //通过ID获取位置
    getPositionByCellIndex(x, y) {
        console.log(x, y);
        var originPos = this._gridNodeArr[x][y].getPosition();
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
        })

    }


    testAstarPath(startPos: Vec2, endPos: Vec2) {
        this._astar.clearList();
        var start: grid = this._gridNodeArr[startPos.x][startPos.y].getComponent(grid);
        var end: grid = this._gridNodeArr[endPos.x][endPos.y].getComponent(grid);
        start.setSpriteColor({ r: 25, g: 88, b: 219, a: 255 })
        end.setSpriteColor({ r: 25, g: 88, b: 219, a: 255 })
        this._astar.getPriceMixNeighborGrid(end, start);
    }

    testSetObstacle(){


        for(var i=1;i<22;i++){
            for(var j=0;j<=9;j++){
                if(Math.random()>0.8){
                  this._gridNodeArr[i][j].getComponent(grid).setObstacle(true);
                }
            }
        }
    }




    update(deltaTime: number) {

    }
}


