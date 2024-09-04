import { _decorator, AssetManager, assetManager, Component, director, Label, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('loadAssets')
export class loadAssets extends Component {
    private _process: Sprite;
    private _label: Label;
    start() {
        this._process = this.node.getChildByName("forward").getComponent(Sprite);
        this._label = this.node.getChildByName("Label").getComponent(Label);
        assetManager.loadBundle('netRes', (err, bundle) => {
            bundle.preloadScene('fight', this.onProgress, this.onLoaded);
        });
    }

    onProgress(finished: number, total: number, item: AssetManager.RequestItem) {
        console.log(finished + " / " + total);
        this._process.fillRange = finished / total;
        this._label.string=finished + " / " + total;
    }
    onLoaded(err?: Error | null) {
        director.loadScene('main');
    }
    protected onDestroy(): void {
        console.log("destroy fight.")
    }

    update(deltaTime: number) {

    }
}


