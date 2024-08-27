import { _decorator, Component, EventKeyboard, instantiate, KeyCode, Node, Prefab, Vec2 } from 'cc';
import { gridManager } from './gridManager';
import { aStar } from './core/aStar';
import { grid } from './grid';
import { tank } from './tank';
const { ccclass, property } = _decorator;

@ccclass('tankManager')
export class tankManager extends Component {
    @property(Prefab) tankBase: Prefab;
    private _gManager: gridManager;


    start() {
        this._gManager = this.node.getComponent(gridManager);
    }

    public onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                console.log("TankManagerKeyDownA");
                //生成tank
                this.spawnTankByCellPos(new Vec2(0, 9), new Vec2(23, 9))
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


    //生成坦克
    spawnTankByCellPos(startPos: Vec2, endPos: Vec2) {
        //***复制一个数组用于查询路径算法,原始路径保留不变
        var copyGridCompArr = this._gManager.gridComponentArr.slice();
        var newAStar = new aStar()
        //设置地图矩阵边界
        newAStar.gridMatri = this._gManager.gridMatrix;
        //传递copy数组到当前寻路地图
        console.log("copyGridCompArr", copyGridCompArr.length);

        newAStar.setGridNodeArr(copyGridCompArr);
        //寻路调用
        var start: grid = copyGridCompArr[startPos.x][startPos.y];
        var end: grid = copyGridCompArr[endPos.x][endPos.y];
        start.setSpriteColor({ r: 25, g: 88, b: 219, a: 255 })
        end.setSpriteColor({ r: 25, g: 88, b: 219, a: 255 })



        //生成实例
        var tankNode: Node = instantiate(this.tankBase);
        this.node.addChild(tankNode);
        var pos = this._gManager.getPositionByCellIndex(startPos.x, startPos.y);
        tankNode.setPosition(pos);
        //tank寻路数据赋值
        var tankCom: tank = tankNode.getComponent(tank);
        newAStar.tk = tankCom;
        //导航
        newAStar.getPriceMixNeighborGrid(start, end);



    }





    //生成障碍物
    private exampleSetObstacle() {
        for (var i = 1; i < 22; i++) {
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
    }






    update(deltaTime: number) {

    }
}


