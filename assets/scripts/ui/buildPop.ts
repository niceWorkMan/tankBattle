import { _decorator, Button, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('buildPop')
export class buildPop extends Component {
    start() {
        this.node.getChildByName("Close").getComponent(Button).node.on(Node.EventType.MOUSE_DOWN, (event) => {
            this.close();
        });
        this.node.getChildByName("Close").getComponent(Button).node.on(Node.EventType.TOUCH_START, (event) => {
            this.close();
        });
    }

    close() {
        console.log("关闭调用");
        
        this.node.destroy();
    }

    update(deltaTime: number) {

    }
}


