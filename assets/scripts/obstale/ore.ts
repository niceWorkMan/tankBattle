import { _decorator, Component, instantiate, Node, Prefab, Sprite, SpriteFrame, tween, Vec2, Vec3 } from 'cc';
import { obstaleBase } from './obstaleBase';
import { digresType } from '../common/digresType';
import { UIManager } from '../UIManager';
import { editorManager } from '../editorManager';
const { ccclass, property } = _decorator;

@ccclass('ore')
export class ore extends obstaleBase {
    @property(SpriteFrame) stone_res_big: SpriteFrame;
    @property(SpriteFrame) sn_res_big: SpriteFrame;
    @property(SpriteFrame) cu_res_big: SpriteFrame;
    @property(SpriteFrame) fe_res_big: SpriteFrame;
    @property(SpriteFrame) ag_res_big: SpriteFrame;
    @property(SpriteFrame) au_res_big: SpriteFrame;

    @property(SpriteFrame) stone_res_mid: SpriteFrame;
    @property(SpriteFrame) sn_res_mid: SpriteFrame;
    @property(SpriteFrame) cu_res_mid: SpriteFrame;
    @property(SpriteFrame) fe_res_mid: SpriteFrame;
    @property(SpriteFrame) ag_res_mid: SpriteFrame;
    @property(SpriteFrame) au_res_mid: SpriteFrame;

    @property(SpriteFrame) stone_res_small: SpriteFrame;
    @property(SpriteFrame) sn_res_small: SpriteFrame;
    @property(SpriteFrame) cu_res_small: SpriteFrame;
    @property(SpriteFrame) fe_res_small: SpriteFrame;
    @property(SpriteFrame) ag_res_small: SpriteFrame;
    @property(SpriteFrame) au_res_small: SpriteFrame;


    @property(Prefab) GaoTouPrefa: Prefab
    constructor() {
        super();
        //资源类型(木头)
        this._digresType = digresType.stone;
    }

    start() {
        this.initStoneSprite();
    }

    private initStoneSprite() {
        var i = Math.floor(Math.random() * 6)
        var spr = this.node.getChildByName("icon").getComponent(Sprite);
        switch (i) {
            case 0:
                spr.spriteFrame = this.stone_res_big;
                break;
            case 1:
                spr.spriteFrame = this.sn_res_big;
                break;
            case 2:
                spr.spriteFrame = this.cu_res_big;
                break;
            case 3:
                spr.spriteFrame = this.fe_res_big;
                break;
            case 4:
                spr.spriteFrame = this.ag_res_big;
                break;
            case 5:
                spr.spriteFrame = this.au_res_big;
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

    update(deltaTime: number) {

    }


    public playDigEffect(): void {
        if (!this._effect) {
            var obj = instantiate(this.GaoTouPrefa)
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

}


