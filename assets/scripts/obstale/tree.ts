import { _decorator, Component, instantiate, Node, Prefab, Sprite, SpriteFrame, tween, Vec2, Vec3 } from 'cc';
import { obstaleBase } from './obstaleBase';
import { UIManager } from '../UIManager';
import { digresType } from '../common/digresType';
import { editorManager } from '../editorManager';
const { ccclass, property } = _decorator;

@ccclass('tree')
export class tree extends obstaleBase {
    @property(SpriteFrame) treeSprite0: SpriteFrame;
    @property(SpriteFrame) treeSprite1: SpriteFrame;
    @property(SpriteFrame) treeSprite2: SpriteFrame;
    @property(SpriteFrame) treeSprite3: SpriteFrame;

    @property(Prefab) dianJuPrefa: Prefab
    constructor() {
        super();
        //资源类型(木头)
        this._digresType = digresType.wood;
    }

    start() {
        this.initTreeSprite();
    }

    private initTreeSprite() {
        var i = Math.floor(Math.random() * 4)
        var spr = this.node.getChildByName("icon").getComponent(Sprite);
        switch (i) {
            case 0:
                spr.spriteFrame = this.treeSprite0;
                break;
            case 1:
                spr.spriteFrame = this.treeSprite1;
                break;
            case 2:
                spr.spriteFrame = this.treeSprite2;
                break;
            case 3:
                spr.spriteFrame = this.treeSprite3;
                break;
        }
    }

    public init(pos: Vec2): void {
        //调用父类方法
        super.init(pos);
        //监听touch
        this.node.on(Node.EventType.TOUCH_START, (e) => {
            //不向上冒泡 阻挡
            e.bubbles = false;
            //不允许建造
            this.isAllow(pos, false);
            //清除建造UI
            UIManager.Instance.clearBuildUI();
            //清除上一个
            if (UIManager.Instance.optionBuildData) {
                //清除动画
                UIManager.Instance.optionBuildData.component.clearAnim();
                //清除菜单
                if (UIManager.Instance.optionBuildData.component._isPlace == false) {
                    UIManager.Instance.buildUIClear();
                }
            }

        }, this);
    }


    public playDigEffect(): void {
        if (!this._effect) {
            var obj = instantiate(this.dianJuPrefa)
            var effectLayer = editorManager.Instance.node.getChildByName("effectLayer")
            effectLayer.addChild(obj)
            obj.position = this.node.position;
            this._effect = obj;

            var cuPos = new Vec3(obj.position.x, obj.position.y, obj.position.z);

            var tw = tween(obj).to(0.5, { position: new Vec3(cuPos.x - 6, cuPos.y, cuPos.z) }).to(0.5, { position: new Vec3(cuPos.x + 6, cuPos.y, cuPos.z) }).union().repeatForever().start();

            setTimeout(() => {
                obj.destroy();
                this._effect = null;
                tw.removeSelf();
            }, 2000);
        }
    }

    update(deltaTime: number) {

    }
}


