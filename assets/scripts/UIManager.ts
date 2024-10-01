import { _decorator, Button, Color, Component, instantiate, JsonAsset, Label, Node, Prefab, resources, Sprite, SpriteFrame, Vec2 } from 'cc';
import { tankManager } from './tankManager';
import { buildPop } from './ui/buildPop';
import { gridManager } from './gridManager';
import { addElementManager } from './ui/add/addElementManager';
import { buildBase } from './building/buildBase';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {
    @property(Node) gameNode: Node;
    @property(Prefab) buildPanel: Prefab;
    //添加BuildUI
    @property(Prefab) addbuildUIPrefab: Prefab;


    @property(SpriteFrame) rect_alpha0: SpriteFrame
    @property(SpriteFrame) rect_green: SpriteFrame


    public ps: Sprite[] = [];

    //弹窗节点
    private _popContain: Node;
    //建筑编辑最后一次操作的格子
    public aem_LastCenter = null;

    //画布中未绑定的建筑
    private _unPlaceBuild: buildBase = null;
    public get unPlaceBuild(): buildBase {
        return this._unPlaceBuild;
    }
    public set unPlaceBuild(v: buildBase) {
        this._unPlaceBuild = v;
    }



    //当前菜单
    private _addMenu: addElementManager;
    public get addMenu(): addElementManager {
        return this._addMenu
    }



    //设置操作对象     //key:名字标识   component:挂载类实例   class:挂载类
    private _optionBuildData: any = null;     // example :{ key: "", component: null, class: null }
    public get optionBuildData(): any {
        return this._optionBuildData
    }
    public set optionBuildData(v: any) {
        console.log("设置:",v);
        
        this._optionBuildData = v;
    }




    //配置文件
    private _buildMenuConfig: any;
    public get bMenuConfig(): any {
        return this._buildMenuConfig;
    }


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
        this.loadMenuConfig();
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


    //加载配置文件
    loadMenuConfig() {
        //加载json例子
        resources.load("config/iconConfig", JsonAsset, (err, res) => {
            var jsonObj = res.json;
            this._buildMenuConfig = jsonObj;
        });
    }

    public getMenuArr(param: string[]) {
        var cof = [];
        for (var i = 0; i < param.length; i++) {
            for (var j = 0; j < this._buildMenuConfig.data.length; j++) {
                var item = this._buildMenuConfig.data[j];
                if (item.name == param[i]) {
                    cof.push(item);
                }
                continue;
            }
        }
        return cof;
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




    //buildUi的存储集合 便于删除
    private _buildUIArr: Node[] = [];
    //清除
    public buildUIClear() {
        var buildUI = this.node.getChildByName("buildUI")
        buildUI.children.forEach(element => {
            element.destroy();
        });
        if (UIManager.Instance.optionBuildData.component) {
            if (UIManager.Instance.optionBuildData.component.node) {
                UIManager.Instance.optionBuildData.component.node.destroy();
            }
        }
        UIManager.Instance.optionBuildData=null;
    }

    //建造
    public addBuildUI(center: Vec2, conf, showSelectGrid = true) {
        //清除
        this.clearBuildUI();
        //添加
        var buildUI = this.node.getChildByName("buildUI")
        var bUI = instantiate(this.addbuildUIPrefab);
        buildUI.addChild(bUI);
        var gmamager = this.gameNode.getComponent(gridManager)
        bUI.position = gmamager.getPositionByCellIndex(center.x, center.y);
        this._buildUIArr.push(bUI);
        //初始化周边UI
        var aem = bUI.getComponent(addElementManager)
        this._addMenu = aem;
        aem.initAddUI(center, conf)

        //是否显示绿框
        if (showSelectGrid) {
            bUI.getComponent(Sprite).spriteFrame = UIManager.Instance.rect_green;

            bUI.getComponent(Button).normalSprite = UIManager.Instance.rect_green;
            bUI.getComponent(Button).hoverSprite = UIManager.Instance.rect_green;
            bUI.getComponent(Button).pressedSprite = UIManager.Instance.rect_green;
        }
        else {
            bUI.getComponent(Sprite).spriteFrame = UIManager.Instance.rect_alpha0;

            bUI.getComponent(Button).normalSprite = UIManager.Instance.rect_alpha0;
            bUI.getComponent(Button).hoverSprite = UIManager.Instance.rect_alpha0;
            bUI.getComponent(Button).pressedSprite = UIManager.Instance.rect_alpha0;
        }

    }
    //清除建造UI
    public clearBuildUI() {
        if (this._buildUIArr.length > 0) {
            this._buildUIArr.forEach(element => {
                element.destroy();
            });
        }
        this._addMenu = null;
        this._buildUIArr.length = 0;
    }

    update(deltaTime: number) {

    }
}


