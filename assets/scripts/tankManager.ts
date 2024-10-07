import { _decorator, Color, Component, EventKeyboard, EventTouch, Input, input, instantiate, KeyCode, Label, log, Node, Pool, Prefab, quat, Quat, Sprite, tween, Vec2, Vec3 } from 'cc';
import { gridManager } from './gridManager';
import { aStar } from './core/aStar';
import { tank } from './node/tank';
import { enumTeam } from './common/enumTeam';
import { element } from './node/element';
import { pool } from './core/pool';
import { tree } from './obstale/tree';
import { grid } from './grid';
import { woodBox } from './building/woodBox';
import { editorManager } from './editorManager';
import { base } from './node/base';
import { buildType } from './common/buildType';
import { ore } from './obstale/ore';
const { ccclass, property } = _decorator;

@ccclass('tankManager')
export class tankManager extends Component {

    //对象
    @property(Prefab) bulletPrefab: Prefab;
    @property(Prefab) tankPrefab: Prefab;
    @property(Prefab) boy01Prefab: Prefab;
    @property(Prefab) PigPrefab: Prefab;


    @property(Prefab) tl: Prefab;

    //特效
    @property(Prefab) expolisinPrefab: Prefab;







    constructor() {
        super();
        tankManager._instance = this;
    }

    private static _instance: tankManager = null;
    // 只能通过自身进行初始化
    public static get Instance() {
        if (this._instance == null) {
            //获取单例失败
            console.log("获取TankManager单例失败");
        }
        return this._instance;
    }

    public getProperotyConfig() {
        return editorManager.Instance.propertyConfig;
    }


    private _gManager: gridManager;
    private _isBattle = false;

    //导航集合
    private _aStartCollection: aStar[] = [];
    public get aStartCollection(): aStar[] {
        return this._aStartCollection;
    }
    public set aStartCollection(v: aStar[]) {
        this._aStartCollection = v;
    }




    //在线坦克集合
    private _nodeCollection: base[] = [];

    public set nodeCollection(v: base[]) {
        this._nodeCollection = v;
    }
    public get nodeCollection(): base[] {
        return this._nodeCollection;
    }

    //生成函数
    private _spawnInterval;


    //树木
    private _trees: Node[] = [];
    //矿石
    private _ores: Node[] = [];



    start() {

        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        //初始化gManager;
        this._gManager = this.node.getComponent(gridManager);

        this.initComponent();

    }


    initComponent() {
    }




    onTouchStart(event: EventTouch) {
        // 处理触摸事件
        // const touchPos = event.getLocation(); // 获取触摸位置
        // console.log(`Touch started at: x=${touchPos.x}, y=${touchPos.y}`);

    }

    protected onDestroy(): void {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }

    public onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                console.log("TankManagerKeyDownA");

                break;


            case KeyCode.KEY_B:
                var parentLayer = this.node.getChildByName("effectLayer")
                parentLayer.children.forEach(element => {
                    element.destroy();
                });

                for (var i = 0; i < gridManager.Instance.getGridMatrix.row; i++) {
                    for (var j = 0; j < gridManager.Instance.getGridMatrix.colum; j++) {
                        if (gridManager.Instance.gridComponentArr[i][j].isObstacle == true) {
                            var obj = instantiate(editorManager.Instance.edtorNode)
                            parentLayer.addChild(obj)
                            obj.position = gridManager.Instance.gridComponentArr[i][j].node.position;
                            obj.getComponent(Sprite).color = new Color(200, 0, 0, 225)
                        }
                    }
                }
                break;
        }
    }


    //游戏入口
    public gameInit() {
        //生成障碍物
        this.exampleSetObstacle();
    }



    //开始竞技
    public battleStart() {
        if (this._isBattle)
            return;

        // this.spawnActor(new Vec2(5, 25), new Vec2(7, 0), enumTeam.teamBlue);
        // this.spawnActor(new Vec2(6, 0), new Vec2(0, 25), enumTeam.teamRed);
        // return;

        //只执行一次
        this._isBattle = true;
        //平均team生成测试
        var spawnTime = 0;
        this._spawnInterval = setInterval(() => {
            var pos0 = new Vec2(Math.ceil(Math.random() * 14), 0);
            var pos1 = new Vec2(Math.ceil(Math.random() * 14), 25);
            var isFree = (this._gManager.gridComponentArr[pos0.x][pos0.y].isObstacle == false) && (this._gManager.gridComponentArr[pos1.x][pos1.y].isObstacle == false)
            var gteam: enumTeam = enumTeam.teamBlue;
            if (spawnTime % 2 == 0) {
                var tempPos = pos0;
                pos0 = pos1;
                pos1 = tempPos;
                gteam = enumTeam.teamRed;
            }
            if (isFree) {
                this.spawnActor(pos0, pos1, gteam);
                spawnTime++;
            }
        }, 100);
    }


    //停止竞技
    public battleStop() {
        this._isBattle = false;
        if (this._spawnInterval)
            clearInterval(this._spawnInterval)
    }



    spawnRotate() {
        //生成实例
        var tankNode: Node = instantiate(this.tankPrefab);
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
        var config = this.getComponent(editorManager);
        var po = this.getComponent(pool);
        //过滤当前位置是否被占用
        if (startGrid.isObstacle == false) {
            //随机模拟生成
            var key = "tank";
            var rand = Math.random()
            if (rand < 0.3) {
                key = "tank"
            }
            else if (rand >= 0.3 && rand <= 0.6) {
                key = "boy01"
            }
            else {
                key = "pig"
            }
            //获取对应的类和Prefab
            var cofResult = config.propertyConfig[key]
            var tankLayer = this.node.getChildByName("tankLayer")
            //是否从对象池抽取实例
            var tankNode: Node = po.spawnActor(key, tankLayer);
            //tankNode.active=false;
            //先隐藏对象(因为寻路还需要时间运算，使用了settimeout,寻路完成后再显示对象,参考aStart.showPath)
            //tankNode.active = false;
            //赋值属性
            var el: any = tankNode.getComponent(cofResult.class);
            el.team = team;
            var star = tankNode.getComponent(aStar);
            star.tk = el;
            star.startGrid = startGrid;
            star.endGrid = endGrid;
            star.finalGrid = endGrid;


            // tankNode.active = true;
            tankNode.getComponent(aStar).nodeInGridCellIndex = new Vec2(startGrid.cellX, startGrid.cellY)
            tankNode.position = this._gManager.getPositionByCellIndex(startGrid.cellX, startGrid.cellY);
            tankNode.scale = new Vec3(1, 1, 1);
            // el.getComponent(Sprite).color = new Color(100, 152, 0, 150)
            //加入集合
            if (this.nodeCollection.indexOf(el) == -1)
                this.nodeCollection.push(el);

            switch (team) {
                case enumTeam.teamRed:
                    tankNode.getComponent(Sprite).color = new Color(225, 0, 0, 200);
                    if (key == "tank") {
                        //tankNode.getChildByName("root").getChildByName("gun").getComponent(Sprite).color = new Color(180, 0, 0, 200);
                        tankNode.eulerAngles = new Vec3(0, 0, 90)
                    }
                    break;
                case enumTeam.teamBlue:
                    tankNode.getComponent(Sprite).color = new Color(0, 184, 225, 200);
                    if (key == "tank") {
                        tankNode.eulerAngles = new Vec3(0, 0, -90)
                        //tankNode.getChildByName("root").getChildByName("gun").getComponent(Sprite).color = new Color(0, 164, 225, 225);
                    }
                    break;
            }


            setTimeout(() => {
                star.startNav();
            }, 100);
        }


    }

    //生成障碍物
    private exampleSetObstacle() {
        var obstaleLayer: Node = this.node.getChildByName("obstaleLayer");
        for (var i = 0; i < 15; i++) {
            for (var j = 3; j < 22; j++) {
                if (Math.random() > 0.85) {
                    //树
                    if (Math.random() < 0.7) {
                        this._gManager.gridComponentArr[i][j].setObstacle(true);
                        this._gManager.gridComponentArr[i][j].isStatic = true;
                        var tr: Node = instantiate(editorManager.Instance.obs_tree);
                        obstaleLayer.addChild(tr);
                        //初始化树的数据
                        tr.getComponent(tree).init(new Vec2(i, j))
                        this._trees.push(tr);
                        tr.position = this._gManager.gridComponentArr[i][j].node.getPosition();
                    }
                    //矿
                    else{
                        this._gManager.gridComponentArr[i][j].setObstacle(true);
                        this._gManager.gridComponentArr[i][j].isStatic = true;
                        var stone: Node = instantiate(editorManager.Instance.obs_ore);
                        obstaleLayer.addChild(stone);
                        //初始化树的数据
                        stone.getComponent(ore).init(new Vec2(i, j))
                        this._ores.push(stone);
                        stone.position = this._gManager.gridComponentArr[i][j].node.getPosition();
                    }


                }
            }
        }
        //遮挡关系排序
        this.setSiblingIndex_Layer(obstaleLayer)
        //同步所有导航网格的障碍
        this.synGridCollectionState();
    }
    //设置层级
    setSiblingIndex_Layer(layer: Node) {
        var nodes: Node[] = layer.children;
        //调换位置
        for (var i = 0; i < nodes.length; i++) {
            for (var j = i; j < nodes.length; j++) {
                var jj = this.getOneIndex(nodes[j])
                var ii = this.getOneIndex(nodes[i])
                // console.log("交换前:", ii, jj);
                if (ii != -1 && jj != -1) {
                    if (jj > ii) {
                        //并且j层级比i大
                        //交换
                        var temp = nodes[i];
                        nodes[i] = nodes[j];
                        nodes[j] = temp;
                    }
                } else {
                    console.log("获取索引失败");
                    alert("获取索引失败")
                }
            }
        }
        // 2 排序
        for (var i = 0; i < nodes.length; i++) {
            //使用+1 就可排序 原因未知
            nodes[i].setSiblingIndex(i + 1);
        }
    }

    //获取在数组中的索引
    getOneIndex(n: Node): number {
        var config = editorManager.Instance.propertyConfig;
        var cls: any = n.getComponent(config[n.name].class)
        var Matrix = this._gManager.getGridMatrix;
        return Matrix.row * cls.cellY + cls.cellX;
    }




    //同步所有导航网格状态
    public synGridCollectionState() {
        if (this.aStartCollection.length > 0) {
            for (var i = 0; i < this.aStartCollection.length; i++) {
                for (var x = 0; x < this._gManager.getGridMatrix.row; x++) {
                    for (var y = 0; y < this._gManager.getGridMatrix.colum; y++) {
                        if (this.aStartCollection[i].node)
                            this.aStartCollection[i].gridNodeArr[x][y].isObstacle = this._gManager.gridComponentArr[x][y].isObstacle;
                        else {
                            //当前aStart已经不在
                        }
                    }
                }
            }
        }
    }
    //同步移除所有导航网格状态(destory tank时调用)
    synGridCollectionRemove(astar: aStar) {
        var dex = this.aStartCollection.indexOf(astar);
        if (dex != -1) {
            this.aStartCollection.splice(dex, -1)
        }
        this.aStartCollection = [];
    }

    //同步添加所有导航网格状态(spawn tank/astar时调用)
    synGridCollectionAdd(astar: aStar) {

        if (this.aStartCollection.indexOf(astar) == -1)
            this.aStartCollection.push(astar)

        //console.log("aCollection:", this.aStartCollection.length);

    }



    //同步当前网格状态
    public synCurrentState(astar: aStar) {
        for (var x = 0; x < this._gManager.getGridMatrix.row; x++) {
            for (var y = 0; y < this._gManager.getGridMatrix.colum; y++) {
                astar.gridNodeArr[x][y].isObstacle = this._gManager.gridComponentArr[x][y].isObstacle;
                astar.gridNodeArr[x][y].isSearch = this._gManager.gridComponentArr[x][y].isStatic;
            }
        }
    }



    //查询
    public searchAttakTarget(_self: base) {
        var targetCollection: base[] = [];
        var edt: editorManager = this.node.getComponent(editorManager);
        //查询


        if (_self.node.name == "tArrow") {
            //console.log("in Tarrow");
        }
        for (var i = 0; i < this.nodeCollection.length; i++) {
            if (_self.team != this.nodeCollection[i].team && this.nodeCollection[i].sleep == false) {
                var targtPos;

                var cls = edt.propertyConfig[this.nodeCollection[i].node.name].class;;
                var nodeObj: any = this.nodeCollection[i].node.getComponent(cls);

                //可移动的
                if (nodeObj.buildType == buildType.none) {
                    targtPos = this.nodeCollection[i].getComponent(aStar).nodeInGridCellIndex;
                }
                //不可移动的
                else {
                    targtPos = new Vec2(nodeObj.cellX, nodeObj.cellY);
                    //          console.log("targetPos:", this.nodeCollection[i].cellX, this.nodeCollection[i].cellY, this.nodeCollection[i].node.name, t.buildType == buildType.none);
                }

                if (targtPos) {
                    var selfPos
                    //可移动的
                    if (_self.buildType == buildType.none) {
                        selfPos = _self.getComponent(aStar).nodeInGridCellIndex;
                    }
                    //不可移动的
                    else {
                        var cls_self = edt.propertyConfig[_self.node.name].class;
                        var nodeObj_self: any = _self.node.getComponent(cls_self);
                        selfPos = new Vec2(nodeObj_self.cellX, nodeObj_self.cellY);
                    }
                    var sum = Math.pow((targtPos.x - selfPos.x), 2) + Math.pow((targtPos.y - selfPos.y), 2)
                    var dis = Math.sqrt(sum);


                    if (dis <= _self.attackDis && this.nodeCollection[i].sleep == false) {
                        this.nodeCollection[i].targetSortDis = dis;
                        targetCollection.push(this.nodeCollection[i])
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
            _self.targetNode = targetCollection[0];
            return targetCollection[0];
        }
        else {
            return null;
        }

    }


    //从两者之间获取距离   null就是获取失败
    getDisFromBoth(_self: base, _target: base) {
        var targtPos;
        //可移动的
        console.log("目标名称:", _target.node.name);

        if (_target.buildType == buildType.none) {
            targtPos = _target.getComponent(aStar).nodeInGridCellIndex;
        }
        //不可移动的
        else {
            targtPos = new Vec2(_target.cellX, _target.cellY);
        }

        if (targtPos) {
            var selfPos
            //可移动的
            if (_self.buildType == buildType.none) {
                selfPos = _self.getComponent(aStar).nodeInGridCellIndex;
            }
            //不可移动的
            else {
                selfPos = new Vec2(_self.cellX, _self.cellY);
            }
            var sum = Math.pow((targtPos.x - selfPos.x), 2) + Math.pow((targtPos.y - selfPos.y), 2)
            var dis = Math.sqrt(sum)
            return dis;
        }
        return null;
    }

    //转成父坐标的Eular角
    public convertEularForParent(childNode: Node): Vec3 {
        // 获取节点的局部旋转欧拉角
        let localEulerAngles = childNode.eulerAngles;
        // 创建一个四元数来表示旋转
        let localRotationQuat = quat();
        Quat.fromEuler(localRotationQuat, localEulerAngles.x, localEulerAngles.y, localEulerAngles.z);
        // 将局部旋转转换为世界旋转
        let worldRotationQuat = childNode.parent.getWorldRotation(localRotationQuat);
        // 将世界四元数转换为欧拉角
        let worldEulerAngles = new Vec3();
        Quat.toEuler(worldEulerAngles, worldRotationQuat);
        return worldEulerAngles;
    }

    //
    public expolision(pos: Vec2) {
        var ex: Node = instantiate(this.expolisinPrefab);
        this.node.getChildByName("effectLayer").addChild(ex);
        ex.position = this.getComponent(gridManager).gridComponentArr[pos.x][pos.y].node.position;
    }

    update(deltaTime: number) {

    }

}


