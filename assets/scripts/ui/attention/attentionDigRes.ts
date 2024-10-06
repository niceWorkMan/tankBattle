import { _decorator, Component, Label, Node, Sprite, SpriteFrame, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('attentionDigRes')
export class attentionDigRes extends Component {

    @property(SpriteFrame) wood: SpriteFrame;


    start() {

    }

    initAttention(key: string, num: number) {
        var icon = this.node.getChildByName("icon");
        var sum = this.node.getChildByName("sum")
        switch (key) {
            case "wood":
                icon.getComponent(Sprite).spriteFrame = this.wood;
                break;
        }

        sum.getComponent(Label).string = "+" + num

        var wp: Vec3 = this.node.position;
        var newPos = new Vec3(wp.x, wp.y + 100, wp.z);
        tween(this.node).to(2, { position: newPos }, {
            onComplete: () => {
                this.node.destroy();
            }
        }).start();
    }

    update(deltaTime: number) {

    }
}


