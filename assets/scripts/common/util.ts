import { _decorator, Component, director, EventKeyboard, game, KeyCode, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('util')
export class util extends Component {
    start() {
        window.addEventListener("blur", this.onWindowBlur.bind(this));
        window.addEventListener("focus", this.onWindowFocus.bind(this));
    }

    update(deltaTime: number) {

    }

    public onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
           
            case KeyCode.NUM_1:
                game.pause();
                break

            case KeyCode.NUM_2:
                game.resume();
                break
        }
    }



    //失去焦点
    onWindowBlur() {
        director.pause();
    }
    //恢复焦点
    onWindowFocus() {
        director.resume();
    }

}



