import { _decorator, Component, director, EventKeyboard, game, KeyCode, Node } from 'cc';
import { tankManager } from '../tankManager';
const { ccclass, property } = _decorator;

@ccclass('util')
export class util extends Component {
    start() {
        this.tManager = this.getComponent(tankManager);
        window.addEventListener("blur", this.onWindowBlur.bind(this));
        window.addEventListener("focus", this.onWindowFocus.bind(this));
    }

    update(deltaTime: number) {

    }
    private tManager: tankManager;

    public onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {

            case KeyCode.NUM_1:
                director.pause();
                break

            case KeyCode.NUM_2:
                director.resume();
                break
        }
    }

    //失去焦点
    onWindowBlur() {
        // game.pause();
        this.gamepause(true);
    } e
    //恢复焦点
    onWindowFocus() {
        //game.resume();
        this.gamepause(false);
    }


    private gamepause(isPause: boolean) {
        if (isPause == false) {
            this.tManager.battleStart();
        }
        else {
            this.tManager.battleStop();
        }
        var nodeCollection = this.getComponent(tankManager).nodeCollection;
        nodeCollection.forEach(element => {
            element.isPause = isPause;
            if (element.isPause == false) {
                if (element)
                    element.tweenMoveOn();
            }
        });
    }

}



