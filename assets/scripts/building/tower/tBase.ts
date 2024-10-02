import { _decorator, Component, math, Node, NodeEventType, Vec2 } from 'cc';
import { buildBase } from '../buildBase';
import { buildType } from '../../common/buildType';
import { UIManager } from '../../UIManager';
import { enumTeam } from '../../common/enumTeam';
const { ccclass, property } = _decorator;

@ccclass('tBase')
export class tBase extends buildBase {
    constructor() {
        super();
        //初始化config的key
        this._key = "tBase";
        //建筑类型
        this._buildType = buildType.build;

        this.team = enumTeam.teamBlue;
    }

    public init(pos: math.Vec2): void {
        super.init(pos);
    }

    start() {
        this.node.on(NodeEventType.TOUCH_START, (e) => {
            //不向上冒泡
            e.bubbles = false;

            if (this.towerObstale == true) {
                console.log("当前塔基上有对象站位");
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
                return;
            }
            //生成操作菜单
            UIManager.Instance.addBuildUI(new Vec2(this.cellX, this.cellY), UIManager.Instance.getMenuArr(["levelUp", "repair", "tArrow", "delect", "cancel"]), false)
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
            //动画
            this.selectAnim(true);
        })
    }

    update(deltaTime: number) {

    }

    public getOptionBuildData() {
        return { key: this._key, component: this, class: this.constructor }
    }
}


