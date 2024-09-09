import { _decorator, Button, Component, instantiate, Label, Node, Prefab } from 'cc';
import { tankManager } from './tankManager';
import { buildPop } from './ui/buildPop';
import { util } from './common/util';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {
    @property(Node) gameNode: Node;
    @property(Prefab) buildPanel: Prefab;
    private _buildPanel: Node;
    //弹窗节点
    private _popContain: Node;

    //窗口配置
    private _popConfig;

    constructor() {
        super();
        UIManager._instance = this;
    }


    private static _instance: UIManager = null;
    // 只能通过自身进行初始化
    public static get Instance() {
        if (this._instance == null) {
            //获取单例失败
            console.log("获取UIManager单例失败");

        }
        return this._instance;
    }

    start() {
        this.addListener();
        this.initComponent();
    }

    initComponent() {
        //初始化配置表
        this._popConfig = {
            buildPanel: {
                prefab: this.buildPanel,
                component: buildPop
            },
        }


        this._popContain = this.node.getChildByName("Pop");
    }





    addListener() {

        this.node.getChildByName("Btn_Start").getComponent(Button).node.on(Node.EventType.MOUSE_DOWN, (event) => {
            this.click();
        });
        this.node.getChildByName("Btn_Start").getComponent(Button).node.on(Node.EventType.TOUCH_START, (event) => {
            this.click()
        });
    }


    click() {
        var tManager: tankManager = this.gameNode.getComponent(tankManager);

        tManager.battleStart();
        // 在这里写你的处理逻辑
        // if (util.Instance._isPause) {
        //     util.Instance.gamepause(!util.Instance._isPause)
        //     util.Instance._isPause = !util.Instance._isPause;
        //      this.node.getChildByName("Btn_Start").getChildByName("Label").getComponent(Label).string="开始"
        // } else {
        //     util.Instance._isPause = !util.Instance._isPause;
        //     // 在这里写你的处理逻辑
        //     tManager.battleStart();
        //     this.node.getChildByName("Btn_Start").getChildByName("Label").getComponent(Label).string="暂停"
        // }
    }

    public showPop(popName: string) {
        if (!this.checkPopExist(this._popConfig[popName].component)) {
            var pop = instantiate(this._popConfig[popName].prefab);
            this._popContain.addChild(pop);
        }
        else {
            console.log("当前窗口已存在:" + popName)
        }
    }

    checkPopExist(tp: any) {
        return this.getComponentsInChildren(tp).length > 0 ? true : false;
    }

    update(deltaTime: number) {

    }
}


