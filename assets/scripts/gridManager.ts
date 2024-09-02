
/*
*create date 2024-08-23 update date 2024-08-23
*auth by PengTao
*/


import { _decorator, Component, EventKeyboard, ImageAsset, Input, input, instantiate, JsonAsset, KeyCode, loader, math, Node, Prefab, random, resources, Sprite, SpriteFrame, SystemEvent, Vec2, Vec3 } from 'cc';
import { grid } from './grid';
import { tankManager } from './tankManager';
const { ccclass, property } = _decorator;

@ccclass('gridManager')
export class gridManager extends Component {
    @property(Prefab) gridPrefab: Prefab;
    @property(Prefab) tankBase: Prefab;
    //tank管理类
    private _tankManager: tankManager;
    //格子组件数组
    private _gridComponentArr: grid[][] = [];
    public get gridComponentArr(): grid[][] {
        return this._gridComponentArr;
    }
    //grid起始位置
    private _gridStartPos = { x: -350, y: -640 }

    //资源
    private _assetsLoad = {};


    //加载网格图片资源
    private _gridSpriteFrame: SpriteFrame;
    public set gridSpriteFrame(v: SpriteFrame) {
        this._gridSpriteFrame = v;
    }
    public get gridSpriteFrame(): SpriteFrame {
        return this._gridSpriteFrame;
    }


    get gridStartPos() {
        return this._gridStartPos;
    }

    private _gridMatrix = { row: 15, colum: 26 }

    //矩阵尺寸
    public get getGridMatrix(): any {
        return this._gridMatrix
    }





    start() {
        //按钮测试
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        //初始化挂载组件
        this.initAttatchComponent();
        //加载图片资源（生成grid）
        this.loadConfigAssets();
    }



    //初始化挂载组件
    initAttatchComponent() {
        this._tankManager = this.node.getComponent(tankManager);
    }

    //初始化网格
    spawnGrid(spriteFrame: SpriteFrame) {
        for (var i = 0; i < this._gridMatrix.row; i++) {
            var _compArr_ins: grid[] = [];
            for (var j = 0; j < this._gridMatrix.colum; j++) {
                var _grid: Node = instantiate(this.gridPrefab);
                this.node.getChildByName("mapLayer").addChild(_grid);
                var _gridSprite = _grid.getComponent(Sprite);
                _gridSprite.spriteFrame = spriteFrame;
                _grid.setPosition(new Vec3(this.gridStartPos.x + i * 50, this.gridStartPos.y + j * (1334/26)));
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
        var originPos = this._gridComponentArr[x][y].node.getPosition();
        return originPos;
    }
    //通过ID获取Grid对象
    getGridByCellIndex(x, y) {
        return this._gridComponentArr[x][y].getComponent(grid);
    }

    checkXY(x, y) {
        var isVaildIndex = (x >= 0 && x <= 23) && (y >= 0 && y <= 9);
        if (!isVaildIndex)
            console.error("输入索引越界");
        return isVaildIndex;
    }



    loadConfigAssets() {
        //加载json例子
        // resources.load("config/imageAssetsConf", JsonAsset, (err, res) => {
        //     var jsonObj = res.json;
        //     var data = jsonObj.data;
        // });
        resources.load("image/dotArea", ImageAsset, (err: any, imageAsset) => {
            //var content =  jsonAsset.toString();
            if (err) {
                console.log(err);
                return;
            }
            var spriteFrame = SpriteFrame.createWithImage(imageAsset);
            var obj = {};
            this._assetsLoad["dotArea"] = spriteFrame;
            this._gridSpriteFrame = spriteFrame;
            console.log("加载完成:", imageAsset);

            //生成网格
            this.spawnGrid(spriteFrame);

            this._tankManager.gameInit();
        })

    }


    //更新tank占位
    public upDataObstale() {
        var tManager: tankManager = this.getComponent(tankManager);
        var gManager: gridManager = this;
        for (var i = 0; i < gManager.getGridMatrix.row; i++) {
            for (var j = 0; j < gManager.getGridMatrix.colum; j++) {
                //非静态障碍物 才会动态设置障碍属性
                if (!gManager.gridComponentArr[i][j].isStatic) {
                    var isObstacle = false;
                    for (var k = 0; k < tManager.tankCollection.length; k++) {
                        if (tManager.tankCollection[k].tankInGridCellIndex != new Vec2(-1, -1)) {
                            var pos: Vec2 = tManager.tankCollection[k].tankInGridCellIndex;
                            if (i == pos.x && j == pos.y) {
                                isObstacle = true;
                                break;
                            }
                        }
                    }
                    gManager.gridComponentArr[i][j].isObstacle = isObstacle;
                }
            }
        }
    }
}


