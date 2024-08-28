import { _decorator, Component, EventKeyboard, instantiate, KeyCode, Node, Prefab, tween, Vec2, Vec3 } from 'cc';
import { gridManager } from './gridManager';
import { aStar } from './core/aStar';
import { grid } from './grid';
import { tank } from './tank';
const { ccclass, property } = _decorator;
enum tankTeam{
    tRed,//左侧红方
    tBlue//右侧蓝方
}
@ccclass('tankManager')
export class tankManager extends Component {



    @property(Prefab) tankBase: Prefab;
    private _gManager: gridManager;
    public get gManager() : gridManager {
        return this._gManager
    }
    
    //导航集合
    private aStartCollection: aStar[] = [];


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
                //this.spawnTankByCellPos(new Vec2(0, 9), new Vec2(23, 9))

                //this.spawnRotate();

                this.spawnActor(new Vec2(0,9),new Vec2(23,9));
                this.spawnActor(new Vec2(0,0),new Vec2(23,0));
                this.spawnActor(new Vec2(0,3),new Vec2(23,5));
                this.spawnActor(new Vec2(0,5),new Vec2(23,5));
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
    spawnActor(start:Vec2,end:Vec2) {

        //生成实例
        var tankNode: Node = instantiate(this.tankBase);
        this.node.getChildByName("tankLayer").addChild(tankNode);
        var tk: tank = tankNode.getComponent(tank);
        tk.tankManager = this;
        //设置起始位置结束位置
        tk.startGrid = this._gManager.getGridByCellIndex(start.x, start.y);
        tk.endGrid = this._gManager.getGridByCellIndex(end.x, end.y);
        tk.node.position = this._gManager.getPositionByCellIndex(start.x, start.y);
        this.startNav(tk);
    }



    //开始导航
    startNav(t: tank) {
        if (!t.aaStar) {
            //生成导航网格
            t.aaStar = new aStar(this._gManager);
            //添加至导航集合
            var dex = this.aStartCollection.indexOf(t.aaStar);
            if (dex == -1) {
                this.aStartCollection.push(t.aaStar);
            }
            //tk赋值
            t.aaStar.tk=t;
        } else {
            //同步基础网格状态
            t.aaStar.synGridState(this._gManager);
        }
        //寻路
        t.aaStar.getPriceMixNeighborGrid(t.aaStar.gridNodeArr[t.startGrid.cellX][t.startGrid.cellY], t.aaStar.gridNodeArr[t.endGrid.cellX][t.endGrid.cellY]);
    }

    //生成障碍物
    private exampleSetObstacle() {
        for (var i = 2; i < 22; i++) {
            for (var j = 0; j <= 9; j++) {
                if (Math.random() > 0.7) {
                    this._gManager.gridComponentArr[i][j].setObstacle(true);
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






    update(deltaTime: number) {

    }
}


