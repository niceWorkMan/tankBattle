import { _decorator, Component, instantiate, log, Node, Prefab, Sprite, SpriteFrame, tween, Vec2, Vec3 } from 'cc';
import { obstaleBase } from './obstaleBase';
import { digresType } from '../common/digresType';
import { UIManager } from '../UIManager';
import { editorManager } from '../editorManager';
import { tankManager } from '../tankManager';
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
                //如果上个选中的是采矿场  则插旗子-------------------------------------------
                if (UIManager.Instance.optionBuildData.key == "oreBox") {
                    var obj = instantiate(tankManager.Instance.qizhi);
                    var effectLayer = editorManager.Instance.node.getChildByName("effectLayer");
                    effectLayer.addChild(obj);
                    obj.position = this.node.position;
                    //重新导航
                    this.reNavWorker();
                    //清除旗子UI 
                    setTimeout(() => {
                        obj.destroy();
                    }, 2000);
                }



                //清除动画------------------------------------------------------------------
                UIManager.Instance.optionBuildData.component.clearAnim();
                //清除菜单
                if (UIManager.Instance.optionBuildData.component._isPlace == false) {
                    UIManager.Instance.buildUIClear();
                }
                //清空记录
                UIManager.Instance.optionBuildData = null;

            }

        }, this);
    }

    update(deltaTime: number) {

    }

    //重新导航
    private reNavWorker() {
        var cls = UIManager.Instance.optionBuildData.component;
        if (cls) {
            var starPos= new Vec2(cls.cellX,cls.cellY);
            var endPos = cls.GetAroundOneGrid(starPos,new Vec2(this.cellX,this.cellY));

            console.log("endPos:",endPos);
            
            if (endPos) {
                if (cls.workers.length > 0) {
                    console.error("没有可导航的Workers");
                    for (var i = 0; i < cls.workers.length; i++) {
                        console.log("上个导航点:",  cls.workers[i].digBelongBuild._resPathPoints);
                        cls.workers[i].digBelongBuild._resPathPoints = [starPos,endPos];
                        //
                        console.log("重新道航点:", [starPos,endPos]);
                    }
                }
                else {
                    console.error("没有可导航的worker")
                }
            } else {
                console.error("生成导航点位失败")
            }
        }


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


