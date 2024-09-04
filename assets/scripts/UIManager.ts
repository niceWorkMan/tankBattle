import { _decorator, Button, Component, Node } from 'cc';
import { tankManager } from './tankManager';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {
    @property(Node) gameNode: Node;
    start() {
        this.addListener();
    }

    addListener() {
        var tManager: tankManager = this.gameNode.getComponent(tankManager);
        this.node.getChildByName("Btn_Start").getComponent(Button).node.on(Node.EventType.MOUSE_DOWN, (event) => {
            // 在这里写你的处理逻辑
            tManager.battleStart();
        });
        this.node.getChildByName("Btn_Start").getComponent(Button).node.on(Node.EventType.TOUCH_START, (event) => {
            // 在这里写你的处理逻辑
            tManager.battleStart();
        });
    }

    update(deltaTime: number) {

    }
}


