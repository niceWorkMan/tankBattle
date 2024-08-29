import { _decorator, Color, Component, EventKeyboard, EventTouch, Input, input, instantiate, KeyCode, Node, Prefab, Sprite, tween, Vec2, Vec3 } from 'cc';
import { gridManager } from './gridManager';
import { aStar } from './core/aStar';
import { tank } from './tank';
import { enumTeam } from './common/enumTeam';
const { ccclass, property } = _decorator;

@ccclass('tankManager')
export class tankManager extends Component {


    @property(Prefab) bulletBase:Prefab;
    @property(Prefab) tankBase: Prefab;
    private _gManager: gridManager;
    public get gManager(): gridManager {
        return this._gManager
    }


    private _isBattle = false;

    //导航集合
    private _aStartCollection: aStar[] = [];
    public get aStartCollection(): aStar[] {
        return this._aStartCollection;
    }



    //在线坦克集合
    private _tankCollection: tank[] = [];

    public set tankCollection(v: tank[]) {
        this._tankCollection = v;
    }
    public get tankCollection(): tank[] {
        return this._tankCollection;
    }




    start() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this._gManager = this.node.getComponent(gridManager);
    }


    onTouchStart(event: EventTouch) {
        // 处理触摸事件
        const touchPos = event.getLocation(); // 获取触摸位置
        console.log(`Touch started at: x=${touchPos.x}, y=${touchPos.y}`);
        //测试代码
        //this.battleStart();

    }

    protected onDestroy(): void {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }

    public onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                console.log("TankManagerKeyDownA");
                //生成tank
                // this.spawnActor(new Vec2(0,9),new Vec2(23,9));
                this.battleStart();
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



    //开始竞技
    private battleStart() {
        if (this._isBattle)
            return;

        this.spawnActor(new Vec2(0, 5), new Vec2(23, 5), enumTeam.teamRed);
        this.spawnActor(new Vec2(23, 5), new Vec2(0, 5), enumTeam.teamBlue);
        return;

        //只执行一次
        this._isBattle = true;
        //平均team生成测试
        var spawnTime = 0;
        setInterval(() => {
            var pos0 = new Vec2(0, Math.ceil(Math.random() * 9));
            var pos1 = new Vec2(23, Math.ceil(Math.random() * 9));
            var isFree = (this.gManager.gridComponentArr[pos0.x][pos0.y].isObstacle == false) && (this.gManager.gridComponentArr[pos1.x][pos1.y].isObstacle == false)
            var gteam: enumTeam = enumTeam.teamRed;
            if (spawnTime % 2 == 0) {
                var tempPos = pos0;
                pos0 = pos1;
                pos1 = tempPos;
                gteam = enumTeam.teamBlue;
            }
            if (isFree) {
                this.spawnActor(pos0, pos1, gteam);
                spawnTime++;
            }
        }, 1000);
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
    spawnActor(start: Vec2, end: Vec2, team: enumTeam) {
        //设置起始位置结束位置
        var startGrid = this._gManager.getGridByCellIndex(start.x, start.y);
        var endGrid = this._gManager.getGridByCellIndex(end.x, end.y);

        //过滤当前位置是否被占用
        if (startGrid.isObstacle == false) {
            //生成实例
            var tankNode: Node = instantiate(this.tankBase);
            this.node.getChildByName("tankLayer").addChild(tankNode);
            //先隐藏对象(因为寻路还需要时间运算，使用了settimeout,寻路完成后再显示对象,参考aStart.showPath)
            //tankNode.active = false;
            //赋值属性
            var tk: tank = tankNode.getComponent(tank);
            tk.team = team;
            tk.startGrid = startGrid;
            tk.endGrid = endGrid;
            tk.tankManager = this;
            tk.node.position = this._gManager.getPositionByCellIndex(start.x, start.y);
            //加入集合
            var tankIndex = this.tankCollection.indexOf(tk);
            if (tankIndex == -1) {
                this.tankCollection.push(tk);
            }
            switch (team) {
                case enumTeam.teamRed:
                    tankNode.getComponent(Sprite).color = new Color(225, 0, 0, 225);
                    break;
                case enumTeam.teamBlue:
                    tankNode.getComponent(Sprite).color = new Color(0, 184, 225, 225);
                    break;
            }
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
        if (this.aStartCollection.length > 0) {
            for (var i = 0; i < this.aStartCollection.length; i++) {
                for (var x = 0; x < this._gManager.gridMatrix.row; x++) {
                    for (var y = 0; y < this._gManager.gridMatrix.colum; y++) {
                        this.aStartCollection[i].gridNodeArr[x][y].isObstacle = this._gManager.gridComponentArr[x][y].isObstacle;
                    }
                }
            }
        }

    }


    //同步当前网格状态
    public synCurrentState(astar: aStar) {
        for (var x = 0; x < this._gManager.gridMatrix.row; x++) {
            for (var y = 0; y < this._gManager.gridMatrix.colum; y++) {
                astar.gridNodeArr[x][y].isObstacle = this._gManager.gridComponentArr[x][y].isObstacle;
            }
        }
    }



    //查询
    public searchAttakTarget(t: tank) {
        var targetTank: tank = null;
        var targetCollection: tank[] = [];
        //查询
        for (var i = 0; i < this.tankCollection.length; i++) {
            if (t.team != this.tankCollection[i].team) {
                var targtPos = this.tankCollection[i].tankInGridCellIndex;
                if (targtPos) {
                    var selfPos = t.tankInGridCellIndex;
                    var sum = Math.pow((targtPos.x - selfPos.x), 2) + Math.pow((targtPos.y - selfPos.y), 2)
                    var dis = Math.sqrt(sum);
                    if (dis <= t.attackDis) {
                        this.tankCollection[i].targetDis = dis;
                        targetCollection.push(this.tankCollection[i])
                    }
                }

            }
        }
        //排序
        for (var i = 0; i < targetCollection.length; i++) {
            for (var j = 0; j < targetCollection.length - i - 1; j++) {
                if (targetCollection[j].targetDis < targetCollection[i].targetDis) {
                    var temp = targetCollection[i];
                    targetCollection[i] = targetCollection[j];
                    targetCollection[j] = temp;
                }
            }
        }
        //返回最近的炮台
        if (targetCollection.length > 0) {
            t.targetTank = targetCollection[0];
            return targetCollection[0];
        }
        else {
            return null;
        }

    }





    update(deltaTime: number) {

    }
}


