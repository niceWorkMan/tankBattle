import { _decorator, Collider2D, Component, instantiate, IPhysics2DContact, math, Node, NodeEventType, Vec2, Vec3 } from 'cc';
import { buildType } from '../common/buildType';
import { buildBase } from './buildBase';
import { UIManager } from '../UIManager';
import { editorManager } from '../editorManager';
import { gridManager } from '../gridManager';
import { aStar } from '../core/aStar';
import { pool } from '../core/pool';
import { enumTeam } from '../common/enumTeam';
import { workWoodCuter } from '../node/workWoodCuter';
const { ccclass, property } = _decorator;

@ccclass('woodBox')
export class woodBox extends buildBase {

    constructor() {
        super();
        //初始化config的key
        this._key = "woodBox";
        //建筑类型
        this._buildType = buildType.build;
    }

    start() {
        this.node.getChildByName("Icon").on(NodeEventType.TOUCH_START, (e) => {
            //如果已经被放置 可以被选中
            if (this.isPlace) {
                //不向上冒泡
                e.bubbles = false;
                //生成操作菜单
                UIManager.Instance.addBuildUI(new Vec2(this.cellX, this.cellY), UIManager.Instance.getMenuArr(["levelUp", "repair", "delect", "cancel"]), false)
                //清除上一个选中动画
                if (UIManager.Instance.optionBuildData) {
                    UIManager.Instance.optionBuildData.component.clearAnim();
                    //清除菜单
                    if (UIManager.Instance.optionBuildData.component._isPlace == false) {
                        UIManager.Instance.buildUIClear();
                    }
                }
                //存储
                UIManager.Instance.optionBuildData = this.getOptionBuildData();
                //动画 必须在清除之后调用
                this.selectAnim(true);
            }
        })

    }

    public init(pos: math.Vec2): void {
        super.init(pos);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {

    }

    update(deltaTime: number) {

    }

    public getOptionBuildData() {
        return { key: this._key, component: this, class: this.constructor }
    }

    //建筑开始工作  伐木工开始
    protected buildStartWork(posArr: math.Vec2[]): void {
        var workNum = 0;
        //生成工人 寻路
        var inter = setInterval(() => {
            workNum++;
            this.spawnOne(posArr)
            if (workNum > this._workerNumer) {
                clearInterval(inter);
            }
        }, 1000);
    }


    //重新生成一个
    public reSpawnOne(){
        var posArr = this.GenerateBElementSpawnPoint();
        this.spawnOne(posArr);
    }


    //生成一个
    spawnOne(posArr: math.Vec2[]) {
        var config = editorManager.Instance.propertyConfig;
        var po: pool = pool.Instance;
        var gridComponentArr = gridManager.Instance.gridComponentArr;
        var workerLayer = editorManager.Instance.node.getChildByName("workerLayer");
        var startGrid = gridComponentArr[posArr[0].x][posArr[0].y]
        var endGrid = gridComponentArr[posArr[1].x][posArr[1].y]
        //设置起始点终点
        var woodCuter: Node = po.spawnActor("workWoodCuter", workerLayer);
        //tankNode.active=false;
        //先隐藏对象(因为寻路还需要时间运算，使用了settimeout,寻路完成后再显示对象,参考aStart.showPath)
        //tankNode.active = false;
        //赋值属性
        var el: any = woodCuter.getComponent(workWoodCuter);
        el.team = enumTeam.teamBlue;
        var star = woodCuter.getComponent(aStar);
        star.tk = el;
        star.startGrid = startGrid;
        star.endGrid = endGrid;
        star.finalGrid = endGrid;
        woodCuter.getComponent(aStar).nodeInGridCellIndex = new Vec2(startGrid.cellX, startGrid.cellY)
        woodCuter.position = gridManager.Instance.getPositionByCellIndex(startGrid.cellX, startGrid.cellY);
        woodCuter.scale = new Vec3(1, 1, 1);

        //添加到集合
        var woodCuterInstace: any = woodCuter.getComponent(config["workWoodCuter"].class);
        if (this._workers.indexOf(woodCuterInstace) == -1) {
            this._workers.push(woodCuterInstace);
        }
        //设置父建筑
        woodCuterInstace._digBelongBuild = this;

        //寻路
        setTimeout(() => {
            //
            if (!(posArr[0].x == posArr[1].x && posArr[0].y == posArr[1].y)) {
                star.startNav()
            }
            else {
                woodCuter.active = false
                woodCuterInstace.digOneGrid();
            }
        }, 100);
        //不生成测试

    }
}


