import St from 'gi://St';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

export default class AppVolumeControlExtension extends Extension {
    enable() {
        this._indicator = new PanelMenu.Button(0.0, this.metadata.name, false);
        const icon = new St.Icon({
            icon_name: 'audio-volume-high-symbolic',
            style_class: 'system-status-icon'
        });
        
        this._indicator.add_child(icon);
        Main.panel.addToStatusArea(this.uuid, this._indicator);
        console.log('App Volume Control: enabled');
    }

    disable() {
        this._indicator?.destroy();
        this._indicator = null;
        console.log('App Volume Control: disabled');
    }
}