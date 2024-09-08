import { _decorator, Component, director, EventKeyboard, game, KeyCode, Node } from 'cc';
import { tankManager } from '../tankManager';
import { aStar } from '../core/aStar';
const { ccclass, property } = _decorator;

@ccclass('util')
export class util extends Component {

    constructor() {
        super();
        util._instance = this;
    }

    start() {
        this.tManager = this.getComponent(tankManager);
        //失去焦点监听
        window.addEventListener("blur", this.onWindowBlur.bind(this));
        window.addEventListener("focus", this.onWindowFocus.bind(this));

        //最小化监听
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                //浏览器最小化或页面不可见
                this.gamepause(true);
                // 执行最小化时的逻辑，比如暂停游戏
            } else {
                //浏览器恢复或页面可见
                this.gamepause(false);
            }
        });
    }


    private static _instance: util = null;
    // 只能通过自身进行初始化
    public static get Instance() {
        if (this._instance == null) {
            //获取单例失败
            console.log("获取UIManager单例失败");

        }
        return this._instance;
    }

    update(deltaTime: number) {

    }
    private tManager: tankManager;

    public onKeyDown(event: EventKeyboard) {
        // switch (event.keyCode) {

        //     case KeyCode.NUM_1:
        //         director.pause();
        //         break

        //     case KeyCode.NUM_2:
        //         director.resume();
        //         break
        // }
    }

    //失去焦点
    onWindowBlur() {
        // game.pause();
        this.gamepause(true);
        director.pause();
    } e
    //恢复焦点
    onWindowFocus() {
        //game.resume();
        director.resume();
        this.gamepause(false);
    }

    public _isPause;


    public gamepause(isPause: boolean) {
        if (isPause == false) {
            this.tManager.battleStart();
        }
        else {
            this.tManager.battleStop();
        }
        this._isPause = isPause;

        var nodeCollection = this.getComponent(tankManager).nodeCollection;
        nodeCollection.forEach(element => {
            element.isPause = isPause;
            if (element.isPause == false) {
                if (element) {
                    //有数据再继续移动
                    if (!element.sleep)
                        element.tweenMoveOn();
                }
            }
        });
    }

}



