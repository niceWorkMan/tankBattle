import { _decorator, Component, EventKeyboard, instantiate, KeyCode, Node, Prefab, tween, Vec2, Vec3 } from 'cc';
import { gridManager } from './gridManager';
import { aStar } from './core/aStar';
import { grid } from './grid';
import { tank } from './tank';
const { ccclass, property } = _decorator;
enum tankTeam {
    tRed,//左侧红方
    tBlue//右侧蓝方
}
@ccclass('tankManager')
export class tankManager extends Component {



    @property(Prefab) tankBase: Prefab;
    private _gManager: gridManager;
    public get gManager(): gridManager {
        return this._gManager
    }

    //导航集合
    private _aStartCollection: aStar[] = [];
    public get aStartCollection(): aStar[] {
        return this._aStartCollection;
    }



    //寻路tank队列
    tankQueue: tank[] = [];





    start() {
        this._gManager = this.node.getComponent(gridManager);
    }

    public onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                console.log("TankManagerKeyDownA");
                //生成tank
                // this.spawnActor(new Vec2(0,9),new Vec2(23,9));
                // this.spawnActor(new Vec2(0,0),new Vec2(23,0));
                // this.spawnActor(new Vec2(0,3),new Vec2(23,5));
                // this.spawnActor(new Vec2(0,5),new Vec2(23,3));
                // this.spawnActor(new Vec2(0,6),new Vec2(23,6));

                setInterval(() => {
                    var pos0 = new Vec2(0, Math.ceil(Math.random() * 9));
                    var pos1 = new Vec2(23, Math.ceil(Math.random() * 9));
                    var isFree = (this.gManager.gridComponentArr[pos0.x][pos0.y].isObstacle == false) && (this.gManager.gridComponentArr[pos1.x][pos1.y].isObstacle == false)
                    if (isFree)
                        this.spawnActor(pos0, pos1);
                }, 500);
                break;


            case KeyCode.KEY_B:
                break;
        }
    }


    //游戏入口
    public gameInit() {
        //生成障碍物
        this.exampleSetObstacle();
    }



    spawnRotate() {
        //生成实例
        var tankNode: Node = instantiate(this.tankBase);
        this.node.addChild(tankNode);
        var tk: tank = tankNode.getComponent(tank);
        tween(tankNode).to(10, { eulerAngles: new Vec3(0, 0, 180) }, {
            onUpdate: () => {
            },
            onComplete: () => {

                //-------------------------------------------------------
            }
        }).start();
    }

    //测试--------------------------------------------------------------------------
    spawnActor(start: Vec2, end: Vec2) {
        //设置起始位置结束位置
        var startGrid = this._gManager.getGridByCellIndex(start.x, start.y);
        var endGrid = this._gManager.getGridByCellIndex(end.x, end.y);

        //过滤当前位置是否被占用
        if (startGrid.isObstacle == false) {
            //生成实例
            var tankNode: Node = instantiate(this.tankBase);
            this.node.getChildByName("tankLayer").addChild(tankNode);
            var tk: tank = tankNode.getComponent(tank);
            //赋值
            tk.startGrid = startGrid;
            tk.endGrid = endGrid;
            tk.tankManager = this;
            tk.node.position = this._gManager.getPositionByCellIndex(start.x, start.y);
            //开始导航
            tk.startNav();
        }
    }



    //生成障碍物
    private exampleSetObstacle() {
        for (var i = 2; i < 22; i++) {
            for (var j = 0; j <= 9; j++) {
                if (Math.random() > 0.8) {
                    this._gManager.gridComponentArr[i][j].setObstacle(true);
                }
            }
        }
        //同步所有导航网格的障碍
        this.synGridCollectionState();
    }

    //同步所有导航网格状态
    synGridCollectionState() {
        for (var i = 0; i < this.aStartCollection.length; i++) {
            for (var x = 0; x < this._gManager.gridMatrix.row; x++) {
                for (var y = 0; y < this._gManager.gridMatrix.colum; y++) {
                    this.aStartCollection[i].gridNodeArr[x][y].isObstacle = this._gManager.gridComponentArr[x][y].isObstacle;
                }
            }
        }
    }


    //同步当前网格状态
    public synCurrentState(astar:aStar) {
            for (var x = 0; x < this._gManager.gridMatrix.row; x++) {
                for (var y = 0; y < this._gManager.gridMatrix.colum; y++) {
                    astar.gridNodeArr[x][y].isObstacle = this._gManager.gridComponentArr[x][y].isObstacle;
                }
            }
    }





    update(deltaTime: number) {

    }
}


