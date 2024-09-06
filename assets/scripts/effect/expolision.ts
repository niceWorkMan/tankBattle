import { _decorator, Animation, AnimationComponent, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('expolision')
export class expolision extends Component {
    start() {
        var anim: Animation = this.getComponent(Animation);
        anim.getState("expolision").on(AnimationComponent.EventType.FINISHED, () => {
            anim.stop();
            if (this.node)
                this.node.destroy();
        }, this);
        anim.play("expolision")
    }

    update(deltaTime: number) {

    }
}


